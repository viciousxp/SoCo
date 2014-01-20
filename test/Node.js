var assert = require('assert')
  , soco = require('../../soco')
  , db = new soco.Neo4j()
  , should = require('should');



describe('Node', function(){
    describe('Node graph setup', function() {
      var nodes = [],
          nodeObjects = [];
      before(function (done) {
          soco.Node.create(function(err, results) {
              if (err) throw err;
              nodes.push(results.id);
              nodeObjects.push(results);
              soco.Node.create({name: 'Trinity', gender: 'female'}, function(err, results) {
                  if (err) throw err;
                  nodes.push(results.id);
                  nodeObjects.push(results);
                  soco.Node.create({name: 'Morpheus', role: 'El capitain'}, function(err, results) {
                      if (err) throw err;
                      nodes.push(results.id);
                      nodeObjects.push(results);
                      soco.Node.create({name: 'Smith'}, function(err, results) {
                          if (err) throw err;
                          nodes.push(results.id);
                          nodeObjects.push(results);
                          done();
                      });
                  });
              });
          });
      })
      describe('Node tests on graph', function(done) {
          it('should create exact node index Matrix');
          it('should index all nodes by name');
          it('Should get Neo node and add properties', function(done) {
              soco.Node.getById(nodes[0], function (err, node) {
                  should.not.exist(err);
                  node.setProperty('name', 'Neo', function (err) {
                      should.not.exist(err);
                      node.setProperty('age', 29, true, function (err) {
                          should.not.exist(err);
                          done();
                      });
                  });
              });
          });
          it('Should add "KNOWS" relationship from Neo to Morpheus, and Trinity', function(done) {
              soco.Node.getById(nodes[0], function (err, neo) {
                  should.not.exist(err);
                  soco.Node.getById(nodes[2], function (err, morpheus) {
                      should.not.exist(err);
                      neo.createRelationshipTo(nodeObjects[1], 'KNOWS', {}, function (err) {
                          should.not.exist(err);
                          neo.createRelationshipTo(morpheus, 'KNOWS', {}, function (err) {
                            should.not.exist(err);
                            done();
                          });
                      });
                  });
              });
          });
          it('Should add "LOVES" relationship from Trinity to Neo', function(done) {
              soco.Node.getById(nodes[0], function (err, neo) {
                  should.not.exist(err);
                  soco.Node.getById(nodes[1], function (err, trinity) {
                      should.not.exist(err);
                      neo.createRelationshipFrom(trinity, 'LOVES', {since: '1998'}, function (err) {
                        should.not.exist(err);
                        done();
                      });
                  });
              });
          });
          it('Should get all of Neo\'s relationships', function(done) {
              soco.Node.getById(nodes[0], function (err, neo) {
                  should.not.exist(err);
                  neo.getRelationships(function (err, relationships) {
                      should.not.exist(err);
                      relationships.length.should.eql(3)
                      for (var i = 0; i < relationships.length; i++) {
                        relationships[i].id.should.be.a.Number
                        relationships[i].startNode.should.be.a.Number
                        relationships[i].endNode.should.be.a.Number
                      }
                      done();
                  })
              });
          });
          it('Should get all of Neo\'s incoming relationships', function(done) {
              soco.Node.getById(nodes[0], function (err, neo) {
                  should.not.exist(err);
                  neo.getIncomingRelationships(function (err, relationships) {
                      should.not.exist(err);
                      relationships.length.should.eql(1)
                      for (var i = 0; i < relationships.length; i++) {
                        relationships[i].id.should.be.a.Number
                        relationships[i].startNode.should.be.a.Number
                        relationships[i].endNode.should.be.a.Number
                      }
                      done();
                  })
              });
          });
          it('Should get all of Neo\'s outgoing relationships', function(done) {
              soco.Node.getById(nodes[0], function (err, neo) {
                  should.not.exist(err);
                  neo.getOutgoingRelationships(function (err, relationships) {
                      should.not.exist(err);
                      relationships.length.should.eql(2)
                      for (var i = 0; i < relationships.length; i++) {
                        relationships[i].id.should.be.a.Number
                        relationships[i].startNode.should.be.a.Number
                        relationships[i].endNode.should.be.a.Number
                      }
                      done();
                  })
              });
          });
          it('Should get all of Neo\'s incoming "LOVES" relationships', function(done) {
              soco.Node.getById(nodes[0], function (err, neo) {
                  should.not.exist(err);
                  neo.getIncomingRelationships('LOVES', function (err, relationships) {
                      should.not.exist(err);
                      relationships.length.should.eql(1)
                      for (var i = 0; i < relationships.length; i++) {
                        relationships[i].id.should.be.a.Number
                        relationships[i].startNode.should.be.a.Number
                        relationships[i].endNode.should.be.a.Number
                      }
                      done();
                  })
              });
          });
          it('Should get all of Neo\'s outgoing "KNOWS" relationships', function(done) {
              soco.Node.getById(nodes[0], function (err, neo) {
                  should.not.exist(err);
                  neo.getOutgoingRelationships('KNOWS', function (err, relationships) {
                      should.not.exist(err);
                      relationships.length.should.eql(2)
                      for (var i = 0; i < relationships.length; i++) {
                        relationships[i].id.should.be.a.Number
                        relationships[i].startNode.should.be.a.Number
                        relationships[i].endNode.should.be.a.Number
                      }
                      done();
                  })
              });
          });
          it('Should get all of Smith\'s relationship, and return none', function(done) {
              nodeObjects[3].getRelationships(function (err, relationships) {
                  should.not.exist(err);
                  relationships.length.should.eql(0)
                  done();
              })
          });
          it('Should get all of Neo\'s adjacent Nodes', function(done) {
              nodeObjects[0].getAdjacentNodes(function (err, nodes) {
                  should.not.exist(err);
                  nodes.length.should.eql(3)
                  done();
              })
          });
          it('Should get all of Neo\'s adjacent Nodes with a relationship type "LOVES"', function(done) {
              nodeObjects[0].getAdjacentNodes('LOVES', function (err, nodes) {
                  should.not.exist(err);
                  nodes.length.should.eql(1)
                  done();
              })
          });
          it('Should get all of Neo\'s incoming adjacent Nodes', function(done) {
              nodeObjects[0].getIncomingNodes(function (err, nodes) {
                  should.not.exist(err);
                  nodes.length.should.eql(1)
                  done();
              })
          });
          it('Should get all of Neo\'s outgoing adjacent Nodes', function(done) {
              nodeObjects[0].getOutgoingNodes(function (err, nodes) {
                  should.not.exist(err);
                  nodes.length.should.eql(2)
                  done();
              })
          });
          it('Should get all of Neo\'s outgoing adjacent Nodes by "LOVES" and find that Neo loves no one', function(done) {
              nodeObjects[0].getOutgoingNodes('LOVES', function (err, nodes) {
                  should.not.exist(err);
                  nodes.length.should.eql(0)
                  done();
              })
          });
      });
      after(function (done) {
          nodeObjects[0].delete(true, function (err) {
              should.not.exist(err);
              nodeObjects[1].delete(true, function (err) {
                  should.not.exist(err);
                  nodeObjects[2].delete(true, function (err) {
                      should.not.exist(err);
                      nodeObjects[3].delete(true, function (err) {
                          should.not.exist(err);
                          done();
                      })                      
                  })
              })              
          })
      })
    });
});