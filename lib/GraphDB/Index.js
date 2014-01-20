/**
@module SoCo
@submodule graphDB
**/

/**
* Represents a node or relationship index in Neo4j graph database
* 
* @class Index
* @constructor
*/

function Index(object) {
    object = (typeof object !== 'undefined') ? object : {};
    if (typeof object.index === 'undefined') object.index = {};
    this.index = {
      name: (typeof object.name !== 'undefined') ? object.name : null,
      template: (typeof object.index.template !== 'undefined') ? object.index.template : null,
      provider: (typeof object.index.provider !== 'undefined') ? object.index.provider : null,
      type: (typeof object.index.type !== 'undefined') ? object.index.type : null,
      indexType: (typeof object.indexType !== 'undefined') ? object.indexType : null
    }
    if (this.index.name !== null && this.index.indexType !== null) {
        //initialization successfull
        this.index.initialized = true;
    }
};


/******************************************************************************/
/*                                                                            */
/* Get dependencies                                                           */
/*                                                                            */
/******************************************************************************/

var Logger = require('../Logger')
  , request = require('request')
  , Neo4j = require('./Neo4j')
  , db = new Neo4j();

/******************************************************************************/
/*                                                                            */
/* property getters and setter                                                */
/*                                                                            */
/******************************************************************************/

Object.defineProperties(Index.prototype, {

    /**
    * Index name, required to be provided when instantiating Class
    * 
    * @attribute name
    * @type String
    * @default null
    * @readOnly
    * @required
    **/

    name: {
        get: function () { 
            return this.index.name;
        },
        enumerable: true,
        configurable: true
    },

    /**
    * Index template to query index
    * 
    * @attribute template
    * @type String
    * @default null
    * @readOnly
    **/

    template: {
        get: function () { 
            return this.index.template;
        },
        enumerable: true,
        configurable: true
    },

    /**
    * Index provider, typicaly lucene
    * 
    * @attribute provider
    * @type String
    * @default null
    * @readOnly
    **/

    provider: {
        get: function () { 
            return this.index.provider;
        },
        enumerable: true,
        configurable: true
    },

    /**
    * Index type, exact or fulltext
    * 
    * @attribute type
    * @type String
    * @default null
    * @readOnly
    **/

    type: {
        get: function () { 
            return this.index.type;
        },
        enumerable: true,
        configurable: true
    },

    /**
    * Indicates node or relationship index
    * 
    * @attribute indexType
    * @type String
    * @default null
    * @readOnly
    * @required
    **/

    indexType: {
        get: function() {
            return this.index.indexType;
        },
        enumerable: true,
        configurable: true
    },

    /**
    * Indicates if this object has gone through the initialization lifecycle successfully
    * 
    * @attribute initialized
    * @type String
    * @default false
    * @readOnly
    **/

    initialized: {
        get: function() {
            return this.index.initialized;
        },
        enumerable: true,
        configurable: true
    }
});

Index.listNodeIndexes = function(callback) {

    /**
    * Returns array of <Index>
    *
    * @method listNodeIndexes
    * @param {Function} callback callback(err, indexes)
    */

    var indexes = [];

    db.REST('GET', '/index/node/', function(err, status, results) {
        if (err)
            return callback(err);
        
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

Index.createNodeIndex = function(object, callback) {

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

Index.listRelationshipIndexes = function(callback) {

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

Index.createRelationshipIndex = function(object, callback) {
    
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

Index.prototype.delete = function(callback) {

    /**
    * Delete index from Neo4j graph db
    *
    * @method delete
    * @param {Function} callback callback(err)
    * @return err Returns err on fail and null on success
    */

    if (typeof callback !== 'function') throw new Error('missing callback');
    if (!this.index.initialized || this.index.name === null || this.index.indexType === null) return callback('Index incorrectly instantiated');
    db.REST('DELETE', '/index/' + this.index.indexType + '/' + this.index.name, function(err, status, body) {
        if (err) return callback(err);
        if (status === 400) return callback('Index not found');
        if (status === 404) return callback('Index not found');
        if (status === 204) return callback(null);
        callback('Unknown response');
    });
}

module.exports = Index;
