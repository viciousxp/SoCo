/**
@module SoCo
@submodule graphDB
**/

/**
* Responsible for making calls to neo4j's ReST API. Used internally by other classes.
* 
* @class Neo4J
* @constructor
*/

function Neo4j(url, port) {
    this.url = url || process.env.NEO4J_URL || 'localhost';
    this.port = port || process.env.NEO4J_PORT || 7474;
};

exports = module.exports = Neo4j;

var Logger = require('../Logger'),
    http = require('http');

Neo4j.prototype.REST = function (method, endPoint, data, callback) {

    /**
    * This method is responsible for making calls to the Neo4j's ReST API. 
    * It is used internally by other classes for communicating with Neo4J.
    *
    * @method REST
    * @param {String} method HTTP method, accepts 'GET', 'POST', 'PUT', 'DELETE'.
    * @param {String} endPoint The Neo4J ReST API endpoint.
    * @param {object} data JSON data to send.
    * @param {Function} callback callback(err, status, body)
    */

    if (typeof data === 'function') {
        callback = data;
        data = null;
    }

    var options = {
        hostname: this.url,
        port: this.port,
        path: '/db/data' + endPoint,
        method: method,
        headers: {
            accept: 'application/json'
        }
    };

    var request = http.request(options, function(res) {
        var status = res.statusCode,
            body;
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            body = JSON.parse(chunk);
        });
        res.on('end', function(){
            callback(null, status, body);
        })
    });

    request.on('error', function(e) {
      callback(e.message)
    });

    if (data !== null)
        request.write(JSON.stringify(data));

    request.end();
}

Neo4j.prototype.cypher = function(query, params, callback) {

/**
* This method is responsible for making calls to the Neo4j's ReST API. 
* It is used internally by other classes for communicating with Neo4J.
*
* @method cypher
* @param {String} query Cypher query.
* @param {object} params Accepts params (optional).
* @param {Function} Returns callback(err, response)
*/

    if (typeof params === 'function') {
        callback = params;
        params = null;
    }

    if (typeof callback !== 'function')
        throw new Error('callback is required');
    
    if (typeof query === 'undefined')
        callback('Query required but missing');

    var options = {
        hostname: this.url,
        port: this.port,
        path: '/db/data/cypher',
        method: 'POST',
        headers: {
            accept: 'application/json'
        }
    };

    var request = http.request(options, function(res) {
        var status = res.statusCode,
            body;
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            body = JSON.parse(chunk);
        });
        res.on('end', function(){
            callback(null, status, _parseCypherResults(body));
        })
    });

    request.on('error', function(e) {
      callback(e.message)
    });

    var data = {};
        data.query = query;

    if (params !== null)
        data.params = params

    request.write(JSON.stringify(data));
    request.end();
}

function _parseCypherResults(results) {
    var parsedResults = {};
    if (typeof results.columns === 'undefined')
        return results

    for (var i = 0; i < results.columns.length; i++) {
        parsedResults[results.columns[i]] = [];
        for (var j = 0; j < results.data.length; j++) {
            if (results.data[j][i] !== null)
                parsedResults[results.columns[i]].push(results.data[j][i]);
        }
    }

    return parsedResults
}