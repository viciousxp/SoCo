// file: subscriptions.js
// Description: Subscriptions Object subclass(Node)

function Subscription(_node) {
    this._node = _node;
}

module.exports = Subscription;

var Node = require('./Node')
  , User = require('./User')
  , Feed = require('./Feed')
  , Post = require('./Post')
  , config = require('../config.js')
  , functions = require('../routes/functions')
  , neo4j = require('neo4j')
  , db = new neo4j.GraphDatabase(process.env.NEO4J_URL || config.dev.NEO4J_URL || 'http://localhost:7474');

Subscription.prototype = new Node();

Subscription.prototype.constructor = Subscription;

Object.defineProperties(Subscription.prototype, {
    subscriptionName: {
        get: function () {
            return this._node.data['subscriptionName'];
        },
        set: function (subscriptionName) {
            this._node.data['subscriptionName'] = subscriptionName;
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

Subscription.prototype.addPost = function(user, post, callback) {
  //first see if there are already existing posts
  var that = this;
  that.getOutgoingRelationships('has_post', function(err, nodes) {
    if (err) return callback(err);
    if (nodes.length === 0) {
      var query = [
        'START subscription = node({id}), post = node({postId}), user = node({userId})',
        'CREATE subscription -[:has_post]-> post,',
        '       user -[:posted_post]-> post'
      ].join('\n');

      var params = {
          id: that.id,
          userId: user.id,
          postId: post.id
      };
    } else {
      var query = [
        'START subscription = node({id}), post = node({postId}), user = node({userId})',
        'MATCH subscription -[:has_post|next_post*1..]-> postPath',
        'WITH post, user, collect(postPath) AS postPath',
        'WITH post, user, LAST(postPath) AS lastPost',
        'CREATE lastPost -[:next_post]-> post,',
        '       user -[:posted_post]-> post'
      ].join('\n');

      var params = {
          id: that.id,
          userId: user.id,
          postId: post.id
      };
    }
    db.query(query, params, function (err, results) {
        if (err) return callback(err);
        callback(null)
    });
  });
}

Subscription.prototype.getById = function(subscriptionId, callback) {
    //returns subscription, its owner, and feeds subscribed to this feed
    var query = [
      'START subscription = node({id})',
      'MATCH subscription <-[:owns_subscription]- user,',
      '      subscription <-[?:has_subscription]- feeds',
      'RETURN subscription, user, COLLECT (feeds) AS feeds'
    ].join('\n');

    var params = {
        id: that.id
    };

    db.query(query, params, function (err, results) {
        if (err) return callback(err);
        if (results.length === 0) return callback('Subscription not found');
        var subscription = {};

        subscription.subscription = new Subscription(results[0]['subscription']);
        subscription.user = new User(results[0]['user']);
        subscription.feeds = results[0]['feeds'].map(function(feed) {
          return new Feed(feed);
        });
        callback(null, subscription);
    });
}

Subscription.prototype.findById = function(subscriptionId, callback) {
    //returns subscription
    var query = [
      'START subscription = node({id})',
      'RETURN subscription'
    ].join('\n');

    var params = {
        id: Number(subscriptionId)
    };

    db.query(query, params, function (err, results) {
        if (err) return callback(err);
        if (results.length === 0) return callback('Subscription not found');
        var subscription = new Subscription(results[0]['subscription']);
        callback(null, subscription);
    });
}

Subscription.prototype.get = function(user, fields, limit, offset, callback) {
    //build query variables
    var queryReturn, queryMatch, queryLimit, querySkip, queryMeta, queryPosts, data,
        queryMatchOptions = {
            feeds: 'subscription <-[?:has_subscription]- feeds',
            owner: 'subscription <-[?:owns_subscription]- owner',
            tags: 'subscription -[?:tagged]-> tags'
        }

    //build match for query
    queryMatch = 'MATCH ';
    queryMatch += (fields.length === 1 && fields[0] === 'all') ? queryMatchOptions.feeds + ', ' + queryMatchOptions.owner + ', ' + queryMatchOptions.tags : '';
    queryMatch += (fields.length === 1 && fields [0] !== 'all' && fields [0] !== 'posts') ? queryMatchOptions[fields[0]] : '';
    if (fields.length > 1) {
        for (var i = 0; i < fields.length; i++) {
            if (typeof fields[i] !== 'undefined' && fields[i] !== 'all' && fields[i] !== 'posts') queryMatch += queryMatchOptions[fields[i]] + ', ';
        }
    }
    if (queryMatch.slice(-2) === ', ') queryMatch = queryMatch.substring(0, queryMatch.length - 2);

    //build return for query
    queryReturn = 'RETURN ';
    queryReturn += (fields.length === 1 && fields[0] === 'all') ? 'COLLECT (feeds) AS feeds, COLLECT (owner) AS owner, COLLECT (tags) AS tags' : '';
    queryReturn += (fields.length === 1 && fields [0] !== 'all' && fields [0] !== 'posts') ? 'COLLECT (' + fields[0] + ') as ' + fields[0]: '';
    if (fields.length > 1) {
        for (var i = 0; i < fields.length; i++) {
            console.log(fields[i])
            if (typeof fields[i] !== 'undefined' && fields[i] !== 'all' && fields[i] !== 'posts') queryReturn += 'COLLECT (' + fields[i] + ') as ' + fields[i] + ', ';
        }
    }
    if (queryReturn.slice(-2) === ', ') queryReturn = queryReturn.substring(0, queryReturn.length - 2);

    queryLimit = 'LIMIT ' + (limit+1);
    querySkip = 'SKIP ' + skip;
    queryMeta = [
        'START   subscription = node({id})',
        'MATCH',
        'RETURN',
        'SKIP',
        'LIMIT'
    ].join('\n')
        .replace('MATCH', queryMatch)
        .replace('RETURN', queryReturn)
        .replace('LIMIT', queryLimit)
        .replace('SKIP', querySkip);


    //temp hack until db ops migrated to neo4j as unmanaged server extension
    //if only the subscription is requested, queryMeta will give us an error, so we will overwrite 
    //to avoid this error
    if (queryReturn === 'RETURN ') queryMeta = 'START subscription = node({id}) RETURN subscription';
        
    queryPosts = [
        'START  subscription = node({id})',
        'MATCH  subscriptions -[:has_post|next_post*1..51]-> posts',
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
        if (fields.indexOf('owner') > -1 || fields.indexOf('all') > -1) {
            var newOwner = new User(meta[0].owner[0]);
              data.owner = {                    
                  userId: newUser.id,
                  username: newUser.username
              }
        }
        if (fields.indexOf('feeds') > -1 || fields.indexOf('all') > -1) {
            data.feeds = meta[0].feeds.map(function (feed) {
                var newFeed = new Feed(feed);
                return {
                    feedId: newFeed.id,
                    feedName: newFeed.feedName
                }
            });
        }
        if (fields.indexOf('posts') > -1 || fields.indexOf('all') > -1) {
            db.query(queryPosts, params, function (err, posts) {
                if (err) return callback(err, null);
                var feedPosts = posts.map(function (post) {
                    var thisPost = {},
                        newPost = new Post(post['posts']);
                    thisPost.post = {
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
                data.posts = posts;
                callback(null, data);
            });
        } else {
            callback(null, data);
        }
    });
}

Subscription.prototype.list = function(searchUser, searchTag, search, fields, limit, offset, orderBy, callback) {
    var query = '', subscriptionQuery;

    //build query
    //NOTE: Part of optimizing for Neo4J and cypher is to provide all variables in the form of parameters
    //to allow neo4j to cache queries and reuse them (significant performance increase with caching)
    //the nature of this query doesnt quite allow us to do this, we will either have to generate several 
    //queries which will reduce performance here, or take the route we took which will decrease performance
    //neo4j side. We choose this route because we are planning on writing unmanaged server extensions which 
    //will allow us to skip cypher all together and recover any performance penalties we are incurring below.

    //Queries
    if (searchUser !== null) {
        query += 'START user = node({userId}) MATCH subscriptions <-[:owns_subscription]- owner';
        query += ', subscriptions -[?:has_tag]-> tags, feeds -[?:has_subscription]- subscriptions';
        query += ' WHERE has (subscriptions.subscriptionName) and subscriptions.subscriptionName <> "default" ';
        query += ' RETURN subscriptions, COLLECT (tags) AS tags, COLLECT (feeds) AS feeds, owner ';
    } else {
        subscriptionQuery = (search !== null) ? search + '~' : '*';
        query += 'START subscriptions = node:subscriptions("subscriptionName:' + subscriptionQuery + '")';
        query += ' WHERE has (subscriptions.subscriptionName) and subscriptions.subscriptionName <> "default" ';
        query += ' WITH subscriptions ';
        query += ' MATCH subscriptions <-[:owns_subscription]- owner, subscriptions -[?:has_tag]-> tags, feeds -[?:has_subscription]- subscriptions';
        query += ' RETURN subscriptions, COLLECT (tags) AS tags, COLLECT (feeds) AS feeds, owner ';
    }

    //return
    query += 'SKIP ' + offset + ' ';
    query += 'LIMIT ' + limit;

    var params = {
        userId: (searchUser !== null) ? searchUser.id : ''
    }

    console.log('query = ' + query);

    db.query(query, params, function (err, results) {
        console.log(results)
        if (err) return callback(err, null);
        data = {};
        data.subscriptions = results.map(function(subscription) {
            var newSubscription = new Subscription(subscription['subscriptions']);
            var subscriptionMeta = {}
            if (fields.indexOf('name') > -1 || fields.indexOf('all') > -1) {
                subscriptionMeta.name = (typeof newSubscription.subscriptionName !== 'undefined') ? newSubscription.subscriptionName : 'undefined';
            }
            if (fields.indexOf('id') > -1 || fields.indexOf('all') > -1) {
                subscriptionMeta.id = (typeof newSubscription.id !== 'undefined') ? newSubscription.id : 'undefined';
            }
            if (fields.indexOf('description') > -1 || fields.indexOf('all') > -1) {
                subscriptionMeta.description = (typeof newSubscription.description !== 'undefined') ? newSubscription.description : 'undefined';
            }
            if (fields.indexOf('public') > -1 || fields.indexOf('all') > -1) {
                subscriptionMeta.public = (typeof newSubscription.public !== 'undefined') ? newSubscription.public : 'undefined';
            }
            if (fields.indexOf('owner') > -1 || fields.indexOf('all') > -1) {
                var newUser = new User(subscription['owner']);
                subscriptionMeta.owner = {
                    username: newUser.username,
                    userId: newUser.id
                }
            }
            // if (fields.indexOf('tags') > -1 || fields.indexOf('all') > -1) {
            //     subscriptionMeta.tags = subscription['tags'].map(function(tag) {
            //         var newTag = new Tag(tag);
            //         return {
            //             tagId: newTag.id,
            //             tagName: newTag.name,
            //         }
            //     });
            // }
            if (fields.indexOf('feeds') > -1 || fields.indexOf('all') > -1) {
                subscriptionMeta.feeds = subscription['feeds'].map(function(feed) {
                    var newFeed = new Feed(feed);
                    return {
                        name: newFeed.feedName,
                        feedId: newFeed.id
                    }
                });
            }
            return subscriptionMeta;
        });
        callback(null, data)
    });
}