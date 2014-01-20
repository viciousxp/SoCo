//var SoCo = require('./GraphDB/test.js');
var Graph = require('./GraphDB/Graph');
var Neo4j = require('./GraphDB/Neo4j');

//expose app
exports = module.exports = app;

//expose classes
exports.Graph = require('./GraphDB/Graph');
exports.Neo4j = require('./GraphDB/Neo4j');
exports.Node = require('./GraphDB/Node')
exports.Index = require('./GraphDB/Index')

function app() {}

app.testApp = function(blah) {
    console.log(blah);
}