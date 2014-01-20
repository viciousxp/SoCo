/**
@module SoCo
@submodule graphDB
**/

/**
* Graph operations 
* 
* @class Graph
* @static
*/


function Graph() {};

exports = module.exports = Graph;

/******************************************************************************/
/*                                                                            */
/* Get dependencies                                                           */
/*                                                                            */
/******************************************************************************/

var Logger = require('../Logger')
  , request = require('request')
  , Index = require('./Index')
  , Neo4j = require('./Neo4j')
  , db = new Neo4j();

/******************************************************************************/
/*                                                                            */
/* Public Methods                                                             */
/*                                                                            */
/******************************************************************************/

Graph.getVersion = function(callback) {

    /**
    * Returns Neo4J graph db version
    *
    * @method getVersion
    * @param {Function} callback callback(err, version)
    */

    if (typeof callback !== 'function') return 'Callback required but missing';
    db.REST('GET', '/', function(err, status, body) {
        if (err) return callback(err);
        callback(null, body.neo4j_version);
    });
}

//node index methods

Graph.listNodeIndexes = function(callback) {

    /**
    * Returns array of <Index>
    *
    * @method listNodeIndexes
    * @param {Function} callback callback(err, indexes)
    */

    var indexes = [];

    db.REST('GET', '/index/node/', function(err, status, results) {
        if (err) return callback(err);
        for (index in results) {
            if (typeof results[index] !== 'undefined') {
                var index = new Index({
                    name: index,
                    index: results[index]
                });
                indexes.push(index);
            }
        }
        callback(null, indexes);
    });
}

Graph.createNodeIndex = function(object, callback) {

    /**
    * Returns <Index>
    *
    * @method createNodeIndex
    * @param {object} object Index informations
    * @param {String} object.name New Index name
    * @param {String} object.type Index type ('exact' || 'fulltext')
    * @param {Function} callback callback(err, index)
    * @return object Index
    */

    if (typeof callback === 'undefined' || typeof callback !== 'function') throw 'A callback is required but missing'

    if (typeof object === 'undefined' ||
        typeof object.name === 'undefined' ||
        typeof object.type === 'undefined') return callback('Missing params');

    if (['fulltext', 'exact'].indexOf(object.type) === -1) return callback('invalid index type');

    var data = {
        name: object.name,
        config: {
            type: object.type,
            provider: object.provider || 'lucene'
        }
    }

    db.REST('POST', '/index/node/', data, function(err, status, index) {
        var index = new Index({
            name: object.name,
            index: index,
            indexType: 'node'
        });
        if (err) return callback(err);
        callback(null, index);
    });
}

//relationship index methods

Graph.listRelationshipIndexes = function(callback) {

    /**
    * Returns array of <Index>
    *
    * @method listRelationshipIndexes
    * @param {Function} callback callback(err, indexes)
    */

    var indexes = [];

    db.REST('GET', '/index/relationship/', function(err, status, results) {
        if (err) return callback(err);
        for (index in results) {
            if (typeof results[index] !== 'undefined') {
                var index = new Index({
                    name: index,
                    index: results[index]
                });
                indexes.push(index);
            }
        }
        callback(null, indexes);
    });
}

Graph.createRelationshipIndex = function(object, callback) {
    
    /**
    * Returns <Index>
    *
    * @method createRelationshipIndex
    * @param {object} object Index informations
    * @param {String} object.name New Index name
    * @param {String} object.type Index type ('exact' || 'fulltext')
    * @param {Function} callback callback(err, index)
    * @return object Index
    */

    if (typeof callback === 'undefined' || typeof callback !== 'function') throw 'A callback is required but missing'

    if (typeof object === 'undefined' ||
        typeof object === 'undefined' ||
        typeof object.name === 'undefined' ||
        typeof object.type === 'undefined') return callback('Missing params');

    if (['fulltext', 'exact'].indexOf(object.type) === -1) return callback('invalid index type');

    var data = {
        name: object.name,
        config: {
            type: object.type,
            provider: object.provider || 'lucene'
        }
    }

    db.REST('POST', '/index/relationship/', data, function(err, status, index) {
        var index = new Index({
            name: object.name,
            index: index,
            indexType: 'relationship'
        });
        if (err) return callback(err);
        callback(null, index);
    });
}

/******************************************************************************/
/*                                                                            */
/* Private Methods                                                            */
/*                                                                            */
/******************************************************************************/