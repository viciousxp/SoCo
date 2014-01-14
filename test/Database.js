var assert = require('assert')
  , soco = require('soco')
  , Index = require('../lib/GraphDB/Index')
  , should = require('should');

//required vars for tests
createIndexArgs = [
  {
    name: 'testExactIndex',
    type: 'exact',
    provider: 'lucene'
  },{
    name: 'testFulltextIndex',
    type: 'fulltext',
    provider: 'lucene'
  },{
    name: 'testIndex',
    type: 'something'
  },{
    type: 'exact'
  },{
    name: 'testIndex'
  },{

  }
]


//tests for GraphDB static functions
describe('GraphDB', function(){
  //get neo4j server version
  describe('Graph', function(){

    it('Should get server version - soco.Graph.getVersion()', function(done) {
      soco.Graph.getVersion(function(err, version) {
        should.not.exist(err);
        version.should.equal('1.9.2');
        done();
      });
    });

    it('Should add exact index "testExactIndex" - soco.Graph.createNodeIndex()', function(done) {
      soco.Graph.createNodeIndex(createIndexArgs[0], function(err, index) {
        should.not.exist(err);
        index.should.be.an.instanceOf(Object)
        index.should.have.property('name', 'testExactIndex')
        index.should.have.property('type', 'exact');
        done();
      });
    });

    it('Should add fulltext index "testFulltextIndex" - soco.Graph.createNodeIndex()', function(done) {
      soco.Graph.createNodeIndex(createIndexArgs[1], function(err, index) {
        should.not.exist(err);
        index.should.be.an.instanceOf(Object)
        index.should.have.property('name', 'testFulltextIndex')
        index.should.have.property('type', 'fulltext');
        done();
      });
    });

    for (var i = 2; i < createIndexArgs.length; i++) {
      it('Should add index and fail - soco.Graph.createNodeIndex()', function(done) {
        soco.Graph.createNodeIndex(createIndexArgs[i], function(err, index) {
          err.should.not.be.eql(null);
          done();
        })
      });
    }

    it('Should get array of node indexes and find "testExactIndex" and "testFulltextIndex" - soco.Graph.listNodeIndexes()', function(done) {
      soco.Graph.listNodeIndexes(function(err, indexes) {
        should.not.exist(err);
        indexes.should.be.instanceof(Array);

        //check for created indexes
        var testExactIndex = false,
            testFulltextIndex = false;
        for (var i = 0; i < indexes.length; i++) {
          if (indexes[i].name === 'testExactIndex') testExactIndex = true;
          if (indexes[i].name === 'testFulltextIndex') testFulltextIndex = true;
        }
        testExactIndex.should.be.true;
        testFulltextIndex.should.be.true;
        done();
      });
    });

    it('Should return error on invalid index delete - Index.prototype.delete()', function(done) {
      var index1 = new Index(),
          index2 = new Index({
            indexType: 'node'
          });
          index3 = new Index({
            name: 'testIndex'
          });
      (function() {
        index1.delete();
      }).should.throwError();
      (function() {
        index2.delete(function(err) {
          if (err)
            throw new Error();
        });
      }).should.throwError();
      (function() {
        index3.delete(function(err) {
          if (err)
            throw new Error();
        });
      }).should.throwError();
      done();
    });

    it('Should try to delete non-existing index and return error - Index.prototype.delete()', function(done) {
      var randomIndex = new Index({
            name: 'some random index which doesnt exist',
            indexType: 'node'
          });
      randomIndex.delete(function(err) {
        should.exist(err);
        done();
      });
    });

    it('Should delete exact node index "testExactIndex" - Index.delete()', function(done) {
      var index = new Index({
            name: 'testExactIndex',
            indexType: 'node'
          });
      index.delete(function(err) {
        should.not.exist(err);
        done();
      });
    });

    it('Should delete fulltext index "testFulltextIndex" - Index.delete()', function(done) {
      var index = new Index({
            name: 'testFulltextIndex',
            indexType: 'node'
          });
      index.delete(function(err) {
        should.not.exist(err);
        done();
      });
    });

    it('Should list array of node indexes and not find "testExactIndex" and "testFulltextIndex" - soco.Graph.listNodeIndexes()', function(done) {
      (function() {
        soco.Graph.listNodeIndexes(function(err, indexes) {
          should.not.exist(err);
          indexes.should.be.instanceof(Array);

          //check for created indexes
          var testExactIndex = false,
              testFulltextIndex = false;
          for (var i = 0; i < indexes.length; i++) {
            if (indexes[i].name === 'testExactIndex') testExactIndex = true;
            if (indexes[i].name === 'testFulltextIndex') testFulltextIndex = true;
          }
          testExactIndex.should.not.be.true;
          testFulltextIndex.should.not.be.true;
        });
      })
      done();
    });



    it('Should add exact relationship index "testExactIndex" - soco.Graph.createRelationshipIndex()', function(done) {
      soco.Graph.createRelationshipIndex(createIndexArgs[0], function(err, index) {
        should.not.exist(err);
        index.should.be.an.instanceOf(Object)
        index.should.have.property('name', 'testExactIndex')
        index.should.have.property('type', 'exact');
        done();
      });
    });

    it('Should add relationship fulltext index "testFulltextIndex" - soco.Graph.createRelationshipIndex()', function(done) {
      soco.Graph.createRelationshipIndex(createIndexArgs[1], function(err, index) {
        should.not.exist(err);
        index.should.be.an.instanceOf(Object)
        index.should.have.property('name', 'testFulltextIndex')
        index.should.have.property('type', 'fulltext');
        done();
      });
    });

    for (var i = 2; i < createIndexArgs.length; i++) {
      it('Should add index and fail - soco.Graph.createRelationshipIndex()', function(done) {
        soco.Graph.createRelationshipIndex(createIndexArgs[i], function(err, index) {
          err.should.not.be.eql(null);
          done();
        })
      });
    }

    it('Should get array of relationship indexes and find "testExactIndex" and "testFulltextIndex" - soco.Graph.listRelationshipIndexes()', function(done) {
      soco.Graph.listRelationshipIndexes(function(err, indexes) {
        should.not.exist(err);
        indexes.should.be.instanceof(Array);

        //check for created indexes
        var testExactIndex = false,
            testFulltextIndex = false;
        for (var i = 0; i < indexes.length; i++) {
          if (indexes[i].name === 'testExactIndex') testExactIndex = true;
          if (indexes[i].name === 'testFulltextIndex') testFulltextIndex = true;
        }
        testExactIndex.should.be.true;
        testFulltextIndex.should.be.true;
        done();
      });
    });

    it('Should delete non-existing relationship index and return index does not exist error - soco.Graph.deleteRelationshipIndex()', function(done) {
      var randomIndex = new Index({
            name: 'some random index which doesnt exist',
            indexType: 'relationship'
          });
      randomIndex.delete(function(err) {
        should.exist(err);
        done();
      });
    });

    it('Should delete exact relationship index "testExactIndex" - soco.Graph.deleteRelationshipIndex()', function(done) {
      var index = new Index({
            name: 'testExactIndex',
            indexType: 'relationship'
          });
      index.delete(function(err) {
        should.not.exist(err);
        done();
      });
    });

    it('Should delete fulltext relationship index "testFulltextIndex" - soco.Graph.deleteRelationshipIndex()', function(done) {
      var index = new Index({
            name: 'testFulltextIndex',
            indexType: 'relationship'
          });
      index.delete(function(err) {
        should.not.exist(err);
        done();
      });
    });

    it('Should list array of relationship indexes and not find "testExactIndex" and "testFulltextIndex" - soco.Graph.listRelationshipIndexes()', function(done) {
      soco.Graph.listRelationshipIndexes(function(err, indexes) {
        should.not.exist(err);
        indexes.should.be.instanceof(Array);

        //check for created indexes
        var testExactIndex = false,
            testFulltextIndex = false;
        for (var i = 0; i < indexes.length; i++) {
          if (indexes[i].name === 'testExactIndex') testExactIndex = true;
          if (indexes[i].name === 'testFulltextIndex') testFulltextIndex = true;
        }
        testExactIndex.should.not.be.true;
        testFulltextIndex.should.not.be.true;
        done();
      });
    });



  });
});