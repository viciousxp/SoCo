// file: node.js
// Description: Node Object Superclass

function Node(_node) {
    this._node = _node;
}

module.exports = Node;

var neo4j = require('neo4j')
  , request = require('request')
  , config = require('../config.js')
  , database = require('../routes/database');

var db = new neo4j.GraphDatabase(process.env.NEO4J_URL || config.dev.NEO4J_URL || 'http://localhost:7474');
var neoURL = process.env.NEO4J_URL || config.dev.NEO4J_URL || 'http://localhost:7474';

// properties

Object.defineProperties(Node.prototype, {
    id: {
        get: function () { 
            return this._node.id;
        },
        enumerable: true,
        configurable: true
    },
    exists: {
        get: function () { 
            return this._node.exists;
        },
        enumerable: true,
        configurable: true
    }
});

// functions

Node.prototype.set = function(_node) {
    this._node = _node;
}

Node.prototype.save = function(callback) {
    this._node.save(function (err) {
        callback(err);
    });
}

Node.prototype.unindex = function(index, property, value, callback) {
    request({
        uri: neoURL + '/db/data/index/node/' + index + '/' + property + '/' + value + '/' + this.id,
        method: "DELETE",
        timeout: 10000,
        followRedirect: false
    }, function(err) {
        if (err) return callback(err);
        callback(null);
    });
}

Node.prototype.deleteNode = function(callback) {
    var query = [
        'START n = node({id})',
        'MATCH n-[rel?]-()',
        'DELETE rel, n',
    ].join('\n');

    var params = {
        id: this.id,
    };

    var user = this;

    db.query(query, params, function (err, results) {
        if (err) return callback(err);
        console.info('results: ' + JSON.stringify(results))
        callback(null, results);
    });
}

Node.prototype.getRelationships = function(relType, callback) {
    var incomingUsers = [],
        outgoingUsers = [];

    var incomingQuery = [
        'START node=node({id})',
        'MATCH (node) <-[rel:RELATIONSHIP]- (nodes)',
        'RETURN distinct nodes'
    ].join('\n')
        .replace('RELATIONSHIP', relType);

    var outgoingQuery = [
        'START node=node({id})',
        'MATCH (node) -[rel:RELATIONSHIP]-> (nodes)',
        'RETURN distinct nodes'
    ].join('\n')
        .replace('RELATIONSHIP', relType);

    var params = {
        id: this.id
    };

    db.query(incomingQuery, params, function (err, incoming) {
        if (err) return callback(err, null, null);
        db.query(outgoingQuery, params, function (err, outgoing) {
            if (err) return callback(err, null, null);
            callback(null, incoming, outgoing);
        });
    });
}

Node.prototype.getIncomingRelationships = function(relType, callback) {
    var query = [
        'START node=node({id})',
        'MATCH (node) <-[rel:RELATIONSHIP]- (nodes)',
        'RETURN nodes'
    ].join('\n')
        .replace('RELATIONSHIP', relType);

    var params = {
        id: this.id,
    };

    db.query(query, params, function (err, results) {
        if (err) return callback(err, null);
        callback(null, results)
    });
}

Node.prototype.getOutgoingRelationships = function(relType, callback) {
    var query = [
        'START node=node({id})',
        'MATCH (node) -[rel:RELATIONSHIP]-> (nodes)',
        'RETURN nodes'
    ].join('\n')
        .replace('RELATIONSHIP', relType);

    var params = {
        id: this.id,
    };

    db.query(query, params, function (err, results) {
        if (err) return callback(err, null);
        callback(null, results)
    });
}

Node.prototype.addRelationship = function (other, relType, properties, callback) {
    if (!properties) properties = {};
    this._node.createRelationshipTo(other._node, relType, properties, function (err, rel) {
        callback(err);
    });    
}

Node.prototype.deleteIncomingRelationship = function(user, relType, callback) {
    var query = [
        'START user=node({thisId}), other=node({userId})',
        'MATCH (user) <-[rel?:FOLLOWS_REL]- (other)',
        'DELETE rel'
    ].join('\n')
        .replace('FOLLOWS_REL', relType);

    var params = {
        thisId: this.id,
        userId: user.id
    };

    db.query(query, params, function (err, results) {
        if (err) return callback(err);
        callback(null);
    });
}

Node.prototype.deleteOutgoingRelationship = function(user, relType, callback) {
    var query = [
        'START user=node({thisId}), other=node({userId})',
        'MATCH (user) -[rel?:FOLLOWS_REL]-> (other)',
        'DELETE rel'
    ].join('\n')
        .replace('FOLLOWS_REL', relType);

    var params = {
        thisId: this.id,
        userId: user.id
    };

    db.query(query, params, function (err, results) {
        if (err) return callback(err);
        callback(null);
    });
}

Node.prototype.getOutgoingNode = function(id) {
    //will look for any node by given id connected by outgoing relationship
    //Returns <Node>
    var query = [
        'START  node = node({thisId}), otherNode({otherId})',
        'MATCH  (node) -[?]-> (other)',
        'WHERE  ID(other) = ID(otherNode)',
        'RETURN other'
    ].join('\n');

    var params = {
        thisId: this.id,
        otherId: Number(id)
    };

    db.query(query, params, function (err, result) {
        if (err) return callback(err);
        if (results.length === 0) return callback('Nothing Found');
        callback(null, new Node(result[0]['other']));
    });
}

Node.prototype.getData = function(callback) {
    callback(null, this._node.data);
}