var assert = require('assert')
  , soco = require('../../soco')
  , db = new soco.Neo4j()
  , should = require('should')
  , Node = require('./Node')

var Queries = [];

//create node
Queries.push({
    query: 'CREATE (n) RETURN n'
})
// get node 18
Queries.push({
    query: 'START n = node({id}) MATCH n-[rel?]-() RETURN rel, n',
    params: {
        id: 16
    }
})

//build a series of cypher queries with params to test cypher queries

describe('Neo4J', function(){
    describe('Neo4J constructor method REST - require(\'soco\').Neo4j', function(){
        it('Should get server version - db.REST()', function(done) {
            db.REST('GET', '/', function(err, status, body) {
                should.not.exist(err);
                body.neo4j_version.should.equal('1.9.2');
                done();
            });
        });
    });
    describe('Node constructor method cypher - new soco.Node()', function(){
        it('Create a node', function(done) {
            db.cypher(Queries[0].query, null, function(err, status, body) {
                status.should.equal(200);
                var node = new soco.Node(body.n[0]);
                node.delete(function (err) {
                    should.not.exist(err);
                    done();
                })
            });
        });
    }); 
});