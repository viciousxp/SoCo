var assert = require('assert')
  , soco = require('../index')
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

describe('Index', function(){
  describe('Index class constructor methods - new soco.Index()', function(){
    it('Should add exact index "testExactIndex" - soco.Index.createNodeIndex()', function(done) {
      soco.Index.createNodeIndex(createIndexArgs[0], function(err, index) {
        should.not.exist(err);
        index.should.be.an.instanceOf(Object)
        index.should.have.property('name', 'testExactIndex')
        index.should.have.property('type', 'exact');
        done();
      });
    });
    it('Should add fulltext index "testFulltextIndex" - soco.Index.createNodeIndex()', function(done) {
      soco.Index.createNodeIndex(createIndexArgs[1], function(err, index) {
        should.not.exist(err);
        index.should.be.an.instanceOf(Object)
        index.should.have.property('name', 'testFulltextIndex')
        index.should.have.property('type', 'fulltext');
        done();
      });
    });
    for (var i = 2; i < createIndexArgs.length; i++) {
      it('Should add index and fail - soco.Index.createNodeIndex()', function(done) {
        soco.Index.createNodeIndex(createIndexArgs[i], function(err, index) {
          err.should.not.be.eql(null);
          done();
        })
      });
    }
    it('Should get array of node indexes and find "testExactIndex" and "testFulltextIndex" - soco.Index.listNodeIndexes()', function(done) {
      soco.Index.listNodeIndexes(function(err, indexes) {
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
    it('Delete "testExactIndex" and "testFulltextIndex" and ensure dont exist - Index.delete(), soco.Index.listNodeIndexes()', function(done) {
      var index1 = new soco.Index({
            name: 'testExactIndex',
            indexType: 'node'
          }),
          index2 = new soco.Index({
            name: 'testFulltextIndex',
            indexType: 'node'
          });
      index1.delete(function(err) {
        should.not.exist(err);
        index2.delete(function(err) {
          should.not.exist(err);
          soco.Index.listNodeIndexes(function(err, indexes) {
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
    it('Should add exact relationship index "testExactIndex" - soco.Index.createRelationshipIndex()', function(done) {
      soco.Index.createRelationshipIndex(createIndexArgs[0], function(err, index) {
        should.not.exist(err);
        index.should.be.an.instanceOf(Object)
        index.should.have.property('name', 'testExactIndex')
        index.should.have.property('type', 'exact');
        done();
      });
    });
    it('Should add relationship fulltext index "testFulltextIndex" - soco.Index.createRelationshipIndex()', function(done) {
      soco.Index.createRelationshipIndex(createIndexArgs[1], function(err, index) {
        should.not.exist(err);
        index.should.be.an.instanceOf(Object)
        index.should.have.property('name', 'testFulltextIndex')
        index.should.have.property('type', 'fulltext');
        done();
      });
    });
    for (var i = 2; i < createIndexArgs.length; i++) {
      it('Should add index and fail - soco.Index.createRelationshipIndex()', function(done) {
        soco.Index.createRelationshipIndex(createIndexArgs[i], function(err, index) {
          err.should.not.be.eql(null);
          done();
        })
      });
    }
    it('Should get array of relationship indexes and find "testExactIndex" and "testFulltextIndex" - soco.Index.listRelationshipIndexes()', function(done) {
      soco.Index.listRelationshipIndexes(function(err, indexes) {
        should.not.exist(err);
        indexes.should.be.instanceof(Array);
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
    it('Should list array of relationship indexes and not find "testExactIndex" and "testFulltextIndex" - soco.Index.listRelationshipIndexes()', function(done) {
      var index1 = new soco.Index({
            name: 'testExactIndex',
            indexType: 'relationship'
          }),
          index2 = new soco.Index({
            name: 'testFulltextIndex',
            indexType: 'relationship'
          });
      index1.delete(function(err) {
        should.not.exist(err);
        index2.delete(function(err) {
          should.not.exist(err);
          soco.Index.listRelationshipIndexes(function(err, indexes) {
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
    it('Should return error on invalid index delete - Index.prototype.delete()', function(done) {
      var index1 = new soco.Index(),
          index2 = new soco.Index({
            indexType: 'node'
          });
          index3 = new soco.Index({
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
      var randomIndex = new soco.Index({
            name: 'some random index which doesnt exist',
            indexType: 'node'
          });
      randomIndex.delete(function(err) {
        should.exist(err);
        done();
      });
    });
    it('Should delete index - Index.prototype.delete()', function(done) {
      var index = {
        name: 'testIndex',
        type: 'exact',
        provider: 'lucene'
      }
      soco.Index.createNodeIndex(index, function(err, index) {
        should.not.exist(err);
        index.should.be.an.instanceOf(Object)
        index.should.have.property('name', 'testIndex')
        index.should.have.property('type', 'exact');

        var deleteIndex = new soco.Index({
          name: 'testIndex',
          indexType: 'node'
        });
        deleteIndex.delete(function(err) {
          should.not.exist(err);
          done();
        });
      });
    });
  });
});