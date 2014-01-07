// file: feed.js
// Description: Feed Object subclass(Node)

function Feed(_node) {
    this._node = _node;
}

module.exports = Feed;

var Node = require('./Node')
  , Subscription = require('./Subscription')
  , User = require('./User')
  , Post = require('./Post')
  , Comment = require('./Comment')
  , config = require('../config.js')
  , functions = require('../routes/functions')
  , neo4j = require('neo4j')
  , db = new neo4j.GraphDatabase(process.env.NEO4J_URL || config.dev.NEO4J_URL || 'http://localhost:7474');

Feed.prototype = new Node();

Feed.prototype.constructor = Feed;

Object.defineProperties(Feed.prototype, {
    feedName: {
        get: function () {
            return this._node.data['feedName'];
        },
        set: function (feedName) {
            this._node.data['feedName'] = feedName;
        },
        enumerable: true,
        configurable: true
    },
    description: {
        get: function () {
            return this._node.data['description'];
        },
        set: function (description) {
            this._node.data['description'] = description;
        },
        enumerable: true,
        configurable: true
    },
    public: {
        get: function () {
            return this._node.data['public'];
        },
        set: function (public) {
            this._node.data['public'] = public;
        },
        enumerable: true,
        configurable: true
    }
});

Feed.prototype.getSubscriptions = function(callback) {
    var thisFeed = this;
    thisFeed.getOutgoingRelationships('has_subscription', function (err, subscriptions) {
        if (err) return callback(err);
        if (subscriptions.length === 0 || subscriptions === null) {
            var data = {subscriptionName: 'main'},
                subscription = db.createNode(data);

            subscription.save(function (err) {
                if (err) return callback(err);
                subscription.index('subscriptions', 'subscriptionName', data.subscriptionName, function (err) {
                    if (err) res.send(500, {err: 'Server Error'});
                    subscription = new Subscription(subscription);
                    thisFeed.addRelationship(subscription, 'has_subscription', {}, function(err) {
                        if (err) return callback(err);
                        callback(null, [{name: subscription.subscriptionName}])
                    });
                });
            });
        } else {
            subscriptions = subscriptions.map(function (subscription) {
                var subscription = new Subscription(subscription['nodes'])
                return {name: subscription.subscriptionName};
            });   
            callback(null, subscriptions)
        }
    });
}

Feed.prototype.addSubscription = function(subscriptionId, callback) {
    var query = [
        'START feed = node({id}), subscription({subscriptionId})',
        'CREATE feed -[:has_subscription]-> subscription'
    ].join('\n');

    var params = {
        id: this.id,
        subscriptionId : subscriptionId
    };

    db.query(query, params, function (err) {
        if (err) return callback(err);
        callback(null)
    });    
}

Feed.prototype.hasSubscription = function(subscriptionId) {
    var query = [
        'START feed = node({id}), subscription({subscriptionId})',
        'MATCH feed -[:has_subscription]-> subscription',
        'RETURN count(*)'
    ].join('\n');

    var params = {
        id: this.id,
        subscriptionId : subscriptionId
    };

    db.query(query, params, function (err, count) {
        if (count == 0) return false;
        return true;
    });
}

Feed.prototype.getSubscription = function(subscriptionName, callback) {
    var query = [
        'START node=node({id})',
        'MATCH (node) -[rel:RELATIONSHIP]-> (nodes)',
        'WHERE (nodes.subscriptionName = "SUBSCRIPTION_NAME")',
        'RETURN nodes'
    ].join('\n')
        .replace('RELATIONSHIP', 'has_subscription')
        .replace('SUBSCRIPTION_NAME', subscriptionName);

    var params = {
        id: this.id,
    };

    db.query(query, params, function (err, results) {
        if (err) return callback(err, null);
        callback(null, results)
    });
}

Feed.prototype.getPosts = function(callback) {
    var query = [
        'START node=node({id})',
        'MATCH node -[:RELATIONSHIP]-> subscriptions',
        'WITH subscriptions',
        'MATCH subscriptions -[:FIRST_POST]-latestPost-[:NEXT_POST*0..50]-> nextPosts',
        'WITH nextPosts, subscriptions',
        'MATCH nextPosts -[?:FIRST_COMMENT]-latestComment-[?:NEXT_COMMENT*0..10]-> nextComments',
        'RETURN nextPosts AS posts, subscriptions AS subscriptions, COLLECT (nextComments) AS comments, nextPosts.date AS date',
        'ORDER BY nextPosts.date DESC LIMIT 50'
    ].join('\n')
        .replace('RELATIONSHIP', 'has_subscription')
        .replace('FIRST_POST', 'has_post')
        .replace('NEXT_POST', 'next_post')
        .replace('FIRST_COMMENT', 'has_comment')
        .replace('NEXT_COMMENT', 'next_comment');

    var params = {
        id: this.id,
    };

    db.query(query, params, function (err, results) {
        if (err) return callback(err, null);
        callback(null, results)
    });
}

Feed.prototype.deleteNode = function (callback) {
    //delete node, delete all subscriptions which are private and do not belong to other feeds
    //delete all deleted subscriptions posts and their comments

    var query = [
        'START feed = node({id})',
        'MATCH () -[rels?]- feed',
        'DELETE rels, feed'
    ].join('\n');

    var params = {
        id: this.id,
    };

    db.query(query, params, function (err, results) {
        console.log('err: ' + err);
        console.log(results);
        if (err) return callback(err, null);
        callback(null, results)
    });
}

Feed.prototype.deleteSubscription = function (id, callback) {
    var query = [
        'START  feed = node({feedId}), subscription({subscriptionId})',
        'MATCH  feed -[rel?:has_subscription]-> subscription,',
        'DELETE rel',
        'RETURN subscription'
    ].join('\n');

    var params = {
        feedId: this.id,
        subscriptionId: Number(id)
    };

    db.query(query, params, function (err, results) {
        if (err) return callback(err);
        if (results.length[0] === 0) return callback('Not Found');
        callback(null, results);
    });
}

Feed.prototype.get = function(user, fields, limit, skip, callback) {
    //build query variables
    var queryReturn, queryMatch, queryLimit, querySkip, queryMeta, queryPosts, data,
        queryMatchOptions = {
            subscriptions: 'feed -[?:has_subscription]-> subscriptions',
            followers: 'feed <-[?:following_feed]- followers',
            tags: 'feed -[?:tagged]-> tags'
        }

    //build match for query
    queryMatch = 'MATCH ';
    queryMatch += (fields.length === 1 && fields[0] === 'all') ? queryMatchOptions.tags + ', ' + queryMatchOptions.followers + ', ' + queryMatchOptions.subscriptions : '';
    queryMatch += (fields.length === 1 && fields [0] !== 'all' && fields [0] !== 'feedPosts') ? queryMatchOptions[fields[0]] : '';
    if (fields.length > 1) {
        for (var i = 0; i < fields.length; i++) {
            if (typeof fields[i] !== 'undefined' && fields[i] !== 'all' && fields[i] !== 'feedPosts') queryMatch += queryMatchOptions[fields[i]] + ', ';
        }
    }
    if (queryMatch.slice(-2) === ', ') queryMatch = queryMatch.substring(0, queryMatch.length - 2);

    //build return for query
    queryReturn = 'RETURN ';
    queryReturn += (fields.length === 1 && fields[0] === 'all') ? 'COLLECT (tags) AS tags, COLLECT (followers) AS followers, COLLECT (subscriptions) AS subscriptions' : '';
    queryReturn += (fields.length === 1 && fields [0] !== 'all' && fields [0] !== 'feedPosts') ? 'COLLECT (' + fields[0] + ') as ' + fields[0]: '';
    if (fields.length > 1) {
        for (var i = 0; i < fields.length; i++) {
            console.log(fields[i])
            if (typeof fields[i] !== 'undefined' && fields[i] !== 'all' && fields[i] !== 'feedPosts') queryReturn += 'COLLECT (' + fields[i] + ') as ' + fields[i] + ', ';
        }
    }
    if (queryReturn.slice(-2) === ', ') queryReturn = queryReturn.substring(0, queryReturn.length - 2);

    queryLimit = 'LIMIT ' + (limit+1);
    querySkip = 'SKIP ' + skip;
    queryMeta = [
        'START   feed = node({id})',
        'MATCH',
        'RETURN',
        'SKIP',
        'LIMIT'
    ].join('\n')
        .replace('MATCH', queryMatch)
        .replace('RETURN', queryReturn)
        .replace('LIMIT', queryLimit)
        .replace('SKIP', querySkip);

        console.log(queryMeta);

    //temp hack until db ops migrated to neo4j as unmanaged server extension
    //if only the feed is requested, queryMeta will give us an error, so we will overwrite 
    //to avoid this error
    if (queryReturn === 'RETURN ') queryMeta = 'START feed = node({id}) RETURN feed';
        
    queryPosts = [
        'START  feed = node({id})',
        'MATCH  feed -[:has_subscription]-> subscriptions,',
        '       subscriptions -[:has_post|next_post*1..50]-> posts',
        'WITH   subscriptions, posts',
        'MATCH  posts -[?:has_comment|next_comment*1..11]-> postComments <-[?:posted_comment]- user',
        'WITH   subscriptions, posts, [postComments, user] as tuple',
        'WHERE  HAS (posts.date)',
        'RETURN posts, subscriptions, COLLECT (tuple) AS comments',
        'ORDER BY posts.date DESC',
        'LIMIT'
    ].join('\n')
        .replace('LIMIT', queryLimit);

    var params = {
        id: this.id
    };

    db.query(queryMeta, params, function (err, meta) {
        if (err) return callback(err, null);
        //loop through tags if tags and find out if there is next
        //loop through subscription if subscription and find out if there is next
        //loop through followers if followers and find out if there is next
        data = {};
        // if (fields.indexOf('tags') > -1 || fields.indexOf('all') > -1){
        //     data.tags = meta[0].tags.map(function (tag) {
        //         var newTag = new Tag(tag);
        //         return {
        //             tagId: newTag.id,
        //             tagName: newTag.name,
        //         }
        //     });
        // }
        if (fields.indexOf('subscriptions') > -1 || fields.indexOf('all') > -1) {
            data.subscriptions = meta[0].subscriptions.map(function (subscription) {
                var newSubscription = new Subscription(subscription);
                return {
                    subscriptionId: newSubscription.id,
                    subscriptionName: newSubscription.subscriptionName,
                    subscriptionStatus: (typeof newSubscription.public !== 'undefined' && newSubscription.public === "true") ? "public" : "private"
                }
            });
        }
        if (fields.indexOf('followers') > -1 || fields.indexOf('all') > -1) {
            data.followers = meta[0].followers.map(function (user) {
                var newUser = new User(user);
                return {
                    userId: newUser.id,
                    username: newUser.username
                }
            });
        }
        if (fields.indexOf('feedPosts') > -1 || fields.indexOf('all') > -1) {
            db.query(queryPosts, params, function (err, posts) {
                if (err) return callback(err, null);
                var feedPosts = posts.map(function (post) {
                    var thisPost = {},
                        newPost = new Post(post['posts']),
                        newSubscription = new Subscription(post['subscriptions']);
                    thisPost.post = {
                        parentSubscriptionName: newSubscription.subscriptionName,
                        parentSubscriptionId: newSubscription.id,
                        id: newPost.id,
                        author: newPost.author,
                        body: newPost.body,
                        date: newPost.date
                    }    
                    //ensure not looping over null values. As a result of the type of query we are making,
                    //if not post exist, neo4j will return [null, null] which will results in inconsistent results
                    //and errors.
                    if (post['comments'][0][0] !== null) {
                        thisPost.comments = post['comments'].map(function (comment) {
                            var newComment = new Comment(comment[0]);
                            var newUser = new User(comment[1]);
                            return {
                                id: newComment.id,
                                body: newComment.body,
                                postUserId: newUser.id,
                                postUserName: newUser.username,
                                date: newComment.date
                            }
                        });
                    }
                    return thisPost;
                });
                data.feedPosts = feedPosts;
                callback(null, data);
            });
        } else {
            callback(null, data);
        }
    });
}

Feed.prototype.list = function(searchUser, searchTag, search, fields, limit, offset, orderBy, callback) {
    // TODO: We need to implement pagination, detect when we are not at first page and give instructions to reach
    // previous pages and detect when there are more results than can be shown and give instructions to next pages

    var query = '', feednameQuery;

    //build query
    //NOTE: Part of optimizing for Neo4J and cypher is to provide all variables in the form of parameters
    //to allow neo4j to cache queries and reuse them (significant performance increase with caching)
    //the nature of this query doesnt quite allow us to do this, we will either have to generate several 
    //queries which will reduce performance here, or take the route we took which will decrease performance
    //neo4j side. We choose this route because we are planning on writing unmanaged server extensions which 
    //will allow us to skip cypher all together and recover any performance penalties we are incurring below.

    //Find starting nodes
    if (searchUser !== null) {
        query += 'START user = node({userId}) MATCH feeds <-[:has_feed]- user';
        query += ', feeds -[?:has_tag]-> tags, feeds <-[:has_feed]- user, feeds <-[?:follows]- followers ';
        query += ' WITH feeds, COLLECT (tags) AS tags, COLLECT (followers) AS followers, user ';
    } else {
        feednameQuery = (search !== null) ? search + '~' : '*';
        query += 'START feeds = node:feeds("feedName:' + feednameQuery + '")';
        query += ' MATCH feeds -[?:has_tag]-> tags, feeds <-[:has_feed]- user, feeds <-[?:follows]- followers ';
        query += ' WITH feeds, COLLECT (tags) AS tags, COLLECT (followers) AS followers, user ';
    }

    //match
    query += 'MATCH feeds -[?:has_subscription]-> subscriptions ';

    //return
    query += 'RETURN feeds, tags, COLLECT (subscriptions) AS subscriptions, user, followers ';
    query += 'SKIP ' + offset + ' ';
    query += 'LIMIT ' + limit;

    var params = {
        userId: (searchUser !== null) ? searchUser.id : ''
    }

    db.query(query, params, function (err, results) {
        if (err) return callback(err, null);
        data = {};
        data.feeds = results.map(function(feeds) {
            var newFeed = new Feed(feeds['feeds']);
            var feedMeta = {};
            if (fields.indexOf('owner') > -1 || fields.indexOf('all') > -1) {
                var newUser = new User(feeds['user']);
                feedMeta.owner = {
                    username: newUser.username,
                    userId: newUser.id
                }
            }
            if (fields.indexOf('id') > -1 || fields.indexOf('all') > -1) {
                feedMeta.id = newFeed.id;
            }
            if (fields.indexOf('name') > -1 || fields.indexOf('all') > -1) {
                feedMeta.name = newFeed.feedName;
            }
            if (fields.indexOf('description') > -1 || fields.indexOf('all') > -1) {
                feedMeta.description = newFeed.description;
            }
            if (fields.indexOf('subscriptions') > -1 || fields.indexOf('all') > -1) {
                feedMeta.subscriptions = feeds['subscriptions'].map(function(subscription) {
                    var newSubscription = new Subscription(subscription);
                    return {
                        subscriptionId: newSubscription.id,
                        subscriptionName: newSubscription.subscriptionName,
                        subscriptionStatus: (typeof newSubscription.public !== 'undefined' && newSubscription.public === "true") ? "public" : "private"
                    }
                });
            }
            // if (fields.indexOf('tags') > -1 || fields.indexOf('all') > -1) {
            //     feedMeta.tags = feeds['tags'].map(function(tag) {
            //         var newTag = new Tag(tag);
            //         return {
            //             tagId: newTag.id,
            //             tagName: newTag.name,
            //         }
            //     });
            // }
            if (fields.indexOf('followers') > -1 || fields.indexOf('all') > -1) {
                feedMeta.followers = feeds['followers'].map(function(follower) {
                    var newUser = new User(follower);
                    return {
                        username: newUser.username,
                        userId: newUser.id
                    }
                });
            }
            console.log(feedMeta)
            return feedMeta;
        });
        callback(null, data)
    });
}