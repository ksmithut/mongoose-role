/* eslint-env mocha */
'use strict'

var chai = require('chai')
var mongoose = require('mongoose')
var role = require('../index')

mongoose.Promise = Promise

var Schema = mongoose.Schema
var expect = chai.expect
var testSchema = {
  name: String
}

describe('mongoose-role', function () {
  // Connect to the database
  before(function (done) {
    mongoose.connect('mongodb://127.0.0.1/mongoose-role-test', done)
  })

  // Delete the database after testing
  after(function (done) {
    mongoose.connection.db.dropDatabase(done)
  })

  it('should give accurate user account lockage', function () {
    var TestSchema = new Schema(testSchema)
    TestSchema.plugin(role, {
      roles: ['user', 'admin'],
      accessLevels: {
        user: ['user', 'admin'],
        admin: ['admin']
      }
    })
    var Test = mongoose.model('Test1', TestSchema)
    var model1 = new Test({ name: 'test1', role: 'user' })
    var model2 = new Test({ name: 'test2', role: 'admin' })
    expect(model1.hasAccess('user')).to.be.equal(true)
    expect(model1.hasAccess('admin')).to.be.equal(false)
    expect(model2.hasAccess('user')).to.be.equal(true)
    expect(model2.hasAccess('admin')).to.be.equal(true)
    expect(model1.hasAccess()).to.be.equal(false)
    expect(model1.hasAccess('public')).to.be.equal(false)
  })

  it("should not break completely if options aren't passed", function (done) {
    var TestSchema = new Schema(testSchema)
    TestSchema.plugin(role)
    var Test = mongoose.model('Test2', TestSchema)
    var model1 = new Test({ name: 'test1', role: 'user' })
    var model2 = new Test({ name: 'test2', role: 'admin' })
    expect(model1.hasAccess('user')).to.be.equal(false)
    expect(model1.hasAccess('admin')).to.be.equal(false)
    expect(model2.hasAccess('user')).to.be.equal(false)
    expect(model2.hasAccess('admin')).to.be.equal(false)
    expect(model1.hasAccess()).to.be.equal(false)
    expect(model1.hasAccess('public')).to.be.equal(false)
    model1.save(function (err, model) {
      expect(err.errors.role.kind).to.be.equal('enum')
      done()
    })
  })

  it('should work with an array of access levels', function () {
    var TestSchema = new Schema(testSchema)
    TestSchema.plugin(role, {
      roles: ['anon', 'user', 'admin'],
      accessLevels: {
        public: ['anon', 'user', 'admin'],
        private: ['user', 'admin'],
        protected: ['admin']
      }
    })
    var Test = mongoose.model('Test3', TestSchema)
    var model1 = new Test({ name: 'test1', role: 'anon' })
    var model2 = new Test({ name: 'test2', role: 'user' })
    var model3 = new Test({ name: 'test3', role: 'admin' })
    expect(model1.hasAccess()).to.be.equal(false)
    expect(model1.hasAccess('public')).to.be.equal(true)
    expect(model1.hasAccess(['public', 'private'])).to.be.equal(false)
    expect(model2.hasAccess(['public', 'private'])).to.be.equal(true)
    expect(model2.hasAccess(['private', 'protected'])).to.be.equal(false)
    expect(model3.hasAccess(['public', 'private', 'protected'])).to.be.equal(
      true
    )
  })
})
