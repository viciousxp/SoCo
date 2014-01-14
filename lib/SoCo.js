//var SoCo = require('./GraphDB/test.js');
var Graph = require('./GraphDB/Graph');

//expose app
exports = module.exports = app;

//expose singletons
exports.Graph = Graph;

//expose classes
exports.Node = require('./GraphDB/Node')

function app() {}

app.testApp = function(blah) {
    console.log(blah);
}