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
    this.url = 'localhost';
    this.port = 7474;
};

module.exports = Neo4j;

/******************************************************************************/
/*                                                                            */
/* Get dependencies                                                           */
/*                                                                            */
/******************************************************************************/

var Logger = require('../Logger'),
    http = require('http');

/******************************************************************************/
/*                                                                            */
/* property getters and setter                                                */
/*                                                                            */
/******************************************************************************/


/******************************************************************************/
/*                                                                            */
/* Methods                                                                    */
/*                                                                            */
/******************************************************************************/

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

    //need to verify method is acceptable

    // console.log('REST client start')

    var options = {
        hostname: this.url,
        port: this.port,
        path: '/db/data' + endPoint,
        method: method,
        headers: {
            accept: 'application/json'
        }
    };

    // console.log('REST options: ' + JSON.stringify(options))

    var request = http.request(options, function(res) {
        // console.log('REST response: ' + JSON.statusCode)
        var status = res.statusCode,
            body;
         // console.log('HEADERS: ' + JSON.stringify(res.headers));
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            body = JSON.parse(chunk);
        });
        res.on('end', function(){
            // console.log('REST callback on end')
            callback(null, status, body);
        })
    });

    request.on('error', function(e) {
      // console.log('problem with request: ' + e.message);
      // console.log( JSON.stringify(e) );
      callback(e.message)
    });

    // console.log('REST DATA: ' + JSON.stringify(data))
    // write data to request body
    if (data !== null) request.write(JSON.stringify(data));

    request.end();

}

Neo4j.prototype.query = function(query, params, callback) {

/**
* This method is responsible for making calls to the Neo4j's ReST API. 
* It is used internally by other classes for communicating with Neo4J.
*
* @method query
* @param {String} query Cypher query.
* @param {object} params Accepts params (optional).
* @param {Function} Returns callback(err, response)
*/

}