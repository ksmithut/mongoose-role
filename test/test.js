'use strict';
/* global describe, before, beforeEach, after, afterEach, it */
/* jshint maxlen: false */

var expect   = require('expect.js');
var mongoose = require('mongoose');
var Schema   = mongoose.Schema;
var role     = require('../index');
var testSchema = {
  name: String
};

describe('mongoose-role', function () {
  // Connect to the database
  before(function (done) {
    mongoose.connect('mongodb://127.0.0.1/mongoose-role-test', done);
  });

  // Delete the database after testing
  after(function (done) {
    mongoose.connection.db.dropDatabase(done);
  });

  // Level 1 tests
  describe('Level 1', function () {

    it('should give accurate user account lockage', function () {
      var TestSchema = new Schema(testSchema);
      TestSchema.plugin(role, {
        roles: ['user', 'admin'],
        accessLevels: {
          'user': ['user', 'admin'],
          'admin': ['admin']
        }
      });
      var Test = mongoose.model('Test1', TestSchema);
      var model1 = new Test({name: 'test1', role: 'user'});
      var model2 = new Test({name: 'test2', role: 'admin'});
      expect(model1.hasAccess('user')).to.be(true);
      expect(model1.hasAccess('admin')).to.be(false);
      expect(model2.hasAccess('user')).to.be(true);
      expect(model2.hasAccess('admin')).to.be(true);
      expect(model1.hasAccess()).to.be(true);
      expect(model1.hasAccess('public')).to.be(false);
    });

  });

  describe('Level 2', function () {

    it('should not break completely if options aren\'t passed', function (done) {
      var TestSchema = new Schema(testSchema);
      TestSchema.plugin(role);
      var Test = mongoose.model('Test2', TestSchema);
      var model1 = new Test({name: 'test1', role: 'user'});
      var model2 = new Test({name: 'test2', role: 'admin'});
      expect(model1.hasAccess('user')).to.be(false);
      expect(model1.hasAccess('admin')).to.be(false);
      expect(model2.hasAccess('user')).to.be(false);
      expect(model2.hasAccess('admin')).to.be(false);
      expect(model1.hasAccess()).to.be(true);
      expect(model1.hasAccess('public')).to.be(false);
      model1.save(function (err, model) {
        expect(err).to.be.ok();
        expect(err.errors.role.kind).to.be('enum');
        done();
      });
    });

  });

  describe('Level 3', function () {

    it('should work with an array of access levels', function (done) {
      var TestSchema = new Schema(testSchema);
      TestSchema.plugin(role, {
        roles: ['anon', 'user', 'admin'],
        accessLevels: {
          'public': ['anon', 'user', 'admin'],
          'private': ['user', 'admin'],
          'protected': ['admin']
        }
      });
      var Test = mongoose.model('Test3', TestSchema);
      var model1 = new Test({name: 'test1', role: 'anon'});
      var model2 = new Test({name: 'test2', role: 'user'});
      var model3 = new Test({name: 'test3', role: 'admin'});
      expect(model1.hasAccess()).to.be(true);
      expect(model1.hasAccess('public')).to.be(true);
      expect(model1.hasAccess(['public', 'private'])).to.be(false);
      expect(model2.hasAccess(['public', 'private'])).to.be(true);
      expect(model2.hasAccess(['private', 'protected'])).to.be(false);
      expect(model3.hasAccess(['public', 'private', 'protected'])).to.be(true);
      done();
    });

  });

});
