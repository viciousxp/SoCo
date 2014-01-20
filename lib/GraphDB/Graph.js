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

var Neo4j = require('./Neo4j')
  , db = new Neo4j();

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