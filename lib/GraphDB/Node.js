/**
@module SoCo
@submodule graphDB
**/

/**
* Represents a node in Neo4j graph database
* 
* @class Node
* @constructor
*/

var Neo4j = require('./Neo4j')
  , db = new Neo4j()
  , Relationship = require('./Relationship');

function Node(_node) {
    this._node = _node;
}

module.exports = Node;

// properties

Object.defineProperties(Node.prototype, {

    /**
    * Node ID, extracted from node data.
    * 
    * @attribute id
    * @type Int
    * @default 'undefined'
    * @readOnly
    * @required
    **/

    id: {
        get: function () { 
            id = /(?:node|relationship)\/(\d+)$/.exec(this._node.self);
            return parseInt(id[1]);
        },
        enumerable: true,
        configurable: true
    }
});

Node.create = function(properties, callback) {

    /**
    * Create a new node in Neo4j graph db
    *
    * @method create
    * @param {object} properties JSON representation of node properties (optional)
    * @param {Function} callback callback(err, node)
    */

    if (typeof properties === 'function') {
        callback = properties;
        properties = {};        
    }

    if (typeof callback !== 'function')
        throw new Error('Callback required')

    var props = _parseProperties(properties);

    function _parseProperties(properties) {
        var parsedProperties = {};
        if (properties !== null) {
            for (property in properties) {
                if (properties.hasOwnProperty(property)) {
                    parsedProperties[property] = properties[property];
                }
            }
        }
        return parsedProperties
    }

    var query = [
        'CREATE (node {props})',
        'RETURN node',
    ].join('\n');

    var params = {
        props: props
    };

    db.cypher(query, params, function (err, status, results) {
        if (err) return callback(err)
        if (status !== 200) return callback('Unknown error, receive status ' + status)
        callback(err, new Node(results.node[0]));
    })
}

Node.getById = function(id, callback) {
    if (typeof callback !== 'function')
        throw new Error('Callback required')

    if (Array.isArray(id))
        id = id.toString();

    var query = [
        'START node = node({id})',
        'RETURN node',
    ].join('\n');

    var params = {
        id: Number(id),
    };

    db.cypher(query, params, function (err, status, results) {
        if (err) callback(err)
        if (status !== 200) return callback('Unknown error, receive status ' + status)
        callback(err, new Node(results.node[0]));
    })
}

//TODO
Node.prototype.delete = function(force, callback) {
    if (typeof force === 'function') {
        callback = force;
        force = false;
    }

    if (typeof callback !== 'function')
        throw new Error('Callback required')

    var query;
    if (!force) {
        query = [
            'START node = node({id})',
            'DELETE node',
        ].join('\n');
    } else {
        query = [
            'START node = node({id})',
            'MATCH node -[r?]- ()',
            'DELETE r, node',
        ].join('\n');
    }

    var params = {
        id: this.id,
    };

    db.cypher(query, params, function (err, status, results) {
        if (err) callback(err)
        if (status !== 200) return callback('Unknown error, receive status ' + status)
        return callback(null)
    })
}

Node.prototype.setProperty = function(property, value, autoSave, callback) {
    if (typeof autoSave == 'function') {
        callback = autoSave;
        autoSave = false;
    }

    if (typeof callback !== 'function')
        throw new Error('Callback required')

    if (typeof property !== 'string') return callback('Property must be string');

    this._node.data[property] = value;

    if (autoSave) {
        this.save(function(err) {
            if (err) return callback('Save error: ' + err);
            callback(null)
        })
    } else {
        callback(null)
    }
}

Node.prototype.getProperty = function(property) {
    if (typeof this._node.data[property] === 'undefined')
        return undefined;
    return this._node.data[property];
}

Node.prototype.save = function(callback) {
    if (typeof callback !== 'function')
        throw new Error('Callback required')

    var query = [
        'START node = node({id})',
        'SET node = {props}'
    ].join('\n');

    var params = {
        id: this.id,
        props:this._node.data
    };

    db.cypher(query, params, function (err, status, results) {
        if (err) callback(err)
        if (status !== 200) return callback('Unknown error, receive status ' + status)
        return callback(null)
    })
}

Node.prototype.createRelationshipTo = function(toNode, type, props, callback) {
    if (typeof props === 'function') {
        callback = props;
        props = {};
    }

    if (typeof callback !== 'function')
        throw new Error('Callback required')

    if (typeof type !== 'string')
        return callback('Type is required')

    if (!toNode instanceof Node)
        callback('toNode must be an instance of Node.class')

    var query = [
        'START node = node({id}), toNode = node({toNode})',
        'CREATE (node)-[relationship:RELTYPE {props}]->(toNode)',
        'SET node = {props}',
        'RETURN relationship'
    ].join('\n')
        .replace('RELTYPE', type);

    var params = {
        id: this.id,
        toNode: toNode.id,
        props: props
    };

    db.cypher(query, params, function (err, status, results) {
        if (err) callback(err)
        if (status !== 200) return callback('Unknown error, receive status ' + status)
        return callback(null, results.relationship[0]);
    })
}

Node.prototype.createRelationshipFrom = function(fromNode, type, props, callback) {
    if (typeof props === 'function') {
        callback = props;
        props = null;
    }

    if (typeof callback !== 'function')
        throw new Error('Callback required')

    if (typeof type !== 'string')
        return callback('Type is required')

    if (!fromNode instanceof Node)
        callback('toNode must be an instance of Node.class')

    var query = [
        'START node = node({id}), toNode = node({toNode})',
        'CREATE (node)-[relationship:RELTYPE {props}]->(toNode)',
        'SET node = {props}',
        'RETURN relationship'
    ].join('\n')
        .replace('RELTYPE', type);

    var params = {
        id: fromNode.id,
        toNode: this.id,
        props: props
    };

    db.cypher(query, params, function (err, status, results) {
        if (err) callback(err)
        if (status !== 200) return callback('Unknown error, receive status ' + status)
        return callback(null, results.relationship[0]);
    })
}

Node.prototype.getRelationships = function(type, callback) {
    if (typeof type === 'function') {
        callback = type;
        type = null;
    }

    if (typeof callback !== 'function')
        throw new Error('Callback required')

    var query;
    if (!type) {
        query = [
            'START node = node({id})',
            'MATCH (node) -[relationships?]- ()',
            'RETURN relationships'
        ].join('\n');
    } else {
        query = [
            'START node = node({id})',
            'MATCH (node) -[relationships?:RELTYPE]- ()',
            'RETURN relationships'
        ].join('\n')
            .replace('RELTYPE', type);
    }

    var params = {
        id: this.id
    };

    db.cypher(query, params, function (err, status, results) {
        if (err) callback(err)
        if (status !== 200) return callback('Unknown error, receive status ' + status)
        results = results.relationships.map(function (relationship) {
            return new Relationship(relationship);
        })
        return callback(null, results);
    })
}

Node.prototype.getIncomingRelationships = function(type, callback) {
    if (typeof type === 'function') {
        callback = type;
        type = null;
    }

    if (typeof callback !== 'function')
        throw new Error('Callback required')

    var query;
    if (!type) {
        query = [
            'START node = node({id})',
            'MATCH (node) <-[relationships?]- ()',
            'RETURN relationships'
        ].join('\n');
    } else {
        query = [
            'START node = node({id})',
            'MATCH (node) <-[relationships?:RELTYPE]- ()',
            'RETURN relationships'
        ].join('\n')
            .replace('RELTYPE', type);
    }

    var params = {
        id: this.id
    };

    db.cypher(query, params, function (err, status, results) {
        if (err) callback(err)
        if (status !== 200) return callback('Unknown error, receive status ' + status)
        results = results.relationships.map(function (relationship) {
            return new Relationship(relationship);
        })
        return callback(null, results);
    })
}

Node.prototype.getOutgoingRelationships = function(type, callback) {
    if (typeof type === 'function') {
        callback = type;
        type = null;
    }

    if (typeof callback !== 'function')
        throw new Error('Callback required')

    var query;
    if (!type) {
        query = [
            'START node = node({id})',
            'MATCH (node) -[relationships?]-> ()',
            'RETURN relationships'
        ].join('\n');
    } else {
        query = [
            'START node = node({id})',
            'MATCH (node) -[relationships?:RELTYPE]-> ()',
            'RETURN relationships'
        ].join('\n')
            .replace('RELTYPE', type);
    }

    var params = {
        id: this.id
    };

    db.cypher(query, params, function (err, status, results) {
        if (err) callback(err)
        if (status !== 200) return callback('Unknown error, receive status ' + status)
        results = results.relationships.map(function (relationship) {
            return new Relationship(relationship);
        })
        return callback(null, results);
    })
}

Node.prototype.getAdjacentNodes = function(type, callback) {
    if (typeof type === 'function') {
        callback = type;
        type = null;
    }

    if (typeof callback !== 'function')
        throw new Error('Callback required')

    var query;
    if (!type) {
        query = [
            'START node = node({id})',
            'MATCH (node) -[?]- (nodes)',
            'RETURN nodes'
        ].join('\n');
    } else {
        query = [
            'START node = node({id})',
            'MATCH (node) -[?:RELTYPE]- (nodes)',
            'RETURN nodes'
        ].join('\n')
            .replace('RELTYPE', type);
    }

    var params = {
        id: this.id
    };

    db.cypher(query, params, function (err, status, results) {
        if (err) callback(err)
        if (status !== 200) return callback('Unknown error, receive status ' + status)
        results = results.nodes.map(function(node) {
            return new Node(node);
        })
        return callback(null, results);
    })
}

Node.prototype.getIncomingNodes = function(type, callback) {
    if (typeof type === 'function') {
        callback = type;
        type = null;
    }

    if (typeof callback !== 'function')
        throw new Error('Callback required')

    var query;
    if (!type) {
        query = [
            'START node = node({id})',
            'MATCH (node) <-[?]- (nodes)',
            'RETURN nodes'
        ].join('\n');
    } else {
        query = [
            'START node = node({id})',
            'MATCH (node) <-[?:RELTYPE]- (nodes)',
            'RETURN nodes'
        ].join('\n')
            .replace('RELTYPE', type);
    }

    var params = {
        id: this.id
    };

    db.cypher(query, params, function (err, status, results) {
        if (err) callback(err)
        if (status !== 200) return callback('Unknown error, receive status ' + status)
        results = results.nodes.map(function(node) {
            return new Node(node);
        })
        return callback(null, results);
    })
}

Node.prototype.getOutgoingNodes = function(type, callback) {
    if (typeof type === 'function') {
        callback = type;
        type = null;
    }

    if (typeof callback !== 'function')
        throw new Error('Callback required')

    var query;
    if (!type) {
        query = [
            'START node = node({id})',
            'MATCH (node) -[?]-> (nodes)',
            'RETURN nodes'
        ].join('\n');
    } else {
        query = [
            'START node = node({id})',
            'MATCH (node) -[?:RELTYPE]-> (nodes)',
            'RETURN nodes'
        ].join('\n')
            .replace('RELTYPE', type);
    }

    var params = {
        id: this.id
    };

    db.cypher(query, params, function (err, status, results) {
        if (err) callback(err)
        if (status !== 200) return callback('Unknown error, receive status ' + status)
        results = results.nodes.map(function(node) {
            return new Node(node);
        })
        return callback(null, results);
    })
}
