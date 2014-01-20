/**
@module SoCo
@submodule graphDB
**/

/**
* Represents a relationship in Neo4j graph database
* 
* @class Relationship
* @constructor
*/

var Neo4j = require('./Neo4j')
  , db = new Neo4j();

function Relationship(_relationship) {
    this._relationship = _relationship;
}

module.exports = Relationship;

// properties

Object.defineProperties(Relationship.prototype, {

    /**
    * Relationship ID, extracted from node data.
    * 
    * @attribute id
    * @type Int
    * @default 'undefined'
    * @readOnly
    * @required
    **/

    id: {
        get: function () { 
            id = /(?:node|relationship)\/(\d+)$/.exec(this._relationship.self);
            return parseInt(id[1]);
        },
        enumerable: true,
        configurable: true
    },

    /**
    * Start node Id.
    * 
    * @attribute startNode
    * @type Int
    * @default 'undefined'
    * @readOnly
    * @required
    **/

    startNode: {
        get: function () { 
            id = /(?:node|relationship)\/(\d+)$/.exec(this._relationship.start);
            return parseInt(id[1]);
        },
        enumerable: true,
        configurable: true
    },

    /**
    * End node Id.
    * 
    * @attribute endNode
    * @type Int
    * @default 'undefined'
    * @readOnly
    * @required
    **/

    endNode: {
        get: function () { 
            id = /(?:node|relationship)\/(\d+)$/.exec(this._relationship.end);
            return parseInt(id[1]);
        },
        enumerable: true,
        configurable: true
    },

    /**
    * Relationship type.
    * 
    * @attribute type
    * @type String
    * @default 'undefined'
    * @readOnly
    * @required
    **/

    type: {
        get: function () { 
            return this._relationship.type;
        },
        enumerable: true,
        configurable: true
    },

    /**
    * Relationship properties.
    * 
    * @attribute data
    * @type String
    * @default 'undefined'
    * @readOnly
    * @required
    **/

    data: {
        get: function () { 
            return JSON.stringify(this._relationship.data);
        },
        enumerable: true,
        configurable: true
    }
});

Relationship.create = function(fromNode, toNode, properties, callback) {
    
}

Relationship.prototype.setProperty = function (callback) {

}

Relationship.prototype.getProperty = function (callback) {

}

Relationship.prototype.delete = function (callback) {

}