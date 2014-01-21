var assert = require('assert')
  , soco = require('../index')
  , should = require('should');

describe('GraphDB', function(){
  describe('Graph static methods - soco.Graph', function(){
    it('Should get server version - soco.Graph.getVersion()', function(done) {
      soco.Graph.getVersion(function(err, version) {
        should.not.exist(err);
        version.should.equal('1.9.2');
        done();
      });
    });
  });
});