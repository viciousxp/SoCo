/******************************************************************************/
/*                                                                            */
/* file: Database.js                                                          */
/* Description: Database Class to retreive basic infos on current             */
/*              neo4j database                                                */
/*                                                                            */
/******************************************************************************/

function Database() {};

module.exports = Database;

/******************************************************************************/
/*                                                                            */
/* Get dependencies                                                           */
/*                                                                            */
/******************************************************************************/

var Logger = require('./Logger')
  , request = require('request')
  , Index = require('./Index')
  , Neo4j = require('./Neo4j')
  , db = new Neo4j();

/******************************************************************************/
/*                                                                            */
/* property getters and setter                                                */
/*                                                                            */
/******************************************************************************/

Object.defineProperties(Database.prototype, {
    test: {
        get: function () { 
            _requestVersion(function(err, version) {
               if (err) return 'undefined';
               return version;
            });
        },
        enumerable: true,
        configurable: true
    }
});

/******************************************************************************/
/*                                                                            */
/* Public Methods                                                             */
/*                                                                            */
/******************************************************************************/

Database.prototype.getVersion = function(callback) {
    db.REST('GET', '/', function(err, body) {
        if (err) return callback(err);
        callback(null, body.neo4j_version);
    });
}

//node index methods

Database.prototype.listNodeIndexes = function(callback) {
    var results = [];

    db.REST('GET', '/index/node/', function(err, indexes) {
        if (err) return callback(err);
        for (index in indexes) {
            if (typeof indexes[index] !== 'undefined') {
                var index = new Index({
                    name: index,
                    index: indexes[index]
                });
                results.push(index);
            }
        }
        callback(null, results);
    });
}

Database.prototype.createNodeIndex = function(object, callback) {
    if (typeof object === 'undefined' ||
        typeof object === 'undefined' ||
        typeof object.name === 'undefined' ||
        typeof object.type === 'undefined') return (callback('missing params'));

    if (['fulltext', 'exact'].indexOf(object.type) === -1) return callback('invalid index type');

    var data = {
        name: object.name,
        config: {
            type: object.type,
            provider: object.provider || 'lucene'
        }
    }

    db.REST('POST', '/index/node/', data, function(err, index) {
        var index = new Index({
            name: object.name,
            index: index
        });
        if (err) return callback(err);
        callback(null, index);
    });
}

Database.prototype.deleteNodeIndex = function(callback) {
    db.REST('DELETE', '/index/node/' + index, function(err) {
        if (err) return callback(err);
        callback(null);
    });
}

//relationship index methods

Database.prototype.listRelationshipIndexes = function(callback) {
    var results = [];

    db.REST('GET', '/index/relationship/', function(err, indexes) {
        if (err) return callback(err);
        for (index in indexes) {
            if (typeof indexes[index] !== 'undefined') {
                var index = new Index({
                    name: index,
                    index: indexes[index]
                });
                results.push(index);
            }
        }
        callback(null, results);
    });
}

Database.prototype.createRelationshipIndex = function(callback) {
    if (typeof object === 'undefined' ||
        typeof object === 'undefined' ||
        typeof object.name === 'undefined' ||
        typeof object.type === 'undefined') return (callback('missing params'));

    if (['fulltext', 'exact'].indexOf(object.type) === -1) return callback('invalid index type');

    var data = {
        name: object.name,
        config: {
            type: object.type,
            provider: object.provider || 'lucene'
        }
    }

    db.REST('POST', '/index/relationship/', data, function(err, index) {
        var index = new Index({
            name: object.name,
            index: index
        });
        if (err) return callback(err);
        callback(null, index);
    });
}

Database.prototype.deleteRelationshipIndex = function(index, callback) {
    db.REST('DELETE', '/index/relationship/' + index, function(err) {
        if (err) return callback(err);
        callback(null);
    });
}

/******************************************************************************/
/*                                                                            */
/* Private Methods                                                            */
/*                                                                            */
/******************************************************************************/
