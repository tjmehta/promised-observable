var describe = global.describe
var it = global.it

var expect = require('chai').expect
var Observable = require('rxjs/Observable').Observable
var sinon = require('sinon')
var Subscription = require('rxjs/Subscription').Subscription

var PromisedObservable = require('../index.js')

var noop = function () {}

describe('promised-observable', function () {
  var expectNotCalled = function (name, done) {
    return function () {
      done(new Error('expect not called: ' + name))
    }
  }

  afterEach(function () {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  })

  it('should work just like wrapped observable (error)', function (done) {
    var err = new Error('boom')
    var innerObservable = new Observable(function (observer) {
      setTimeout(function () {
        observer.next(1)
        observer.next(2)
        observer.next(3)
        observer.error(err)
      }, 0)
      return new Subscription(noop)
    })
    var promise = Promise.resolve(innerObservable)
    var observable = new PromisedObservable(promise)
    this.subscription = observable.subscribe(
      record('onNext'),
      record('onError', done),
      record('onCompleted', done)
    )
    var log = []
    function record (event, done) {
      return function (arg) {
        log.push([event, arg])
        if (done) {
          try {
            expect(log).to.deep.equal([
              ['onNext', 1],
              ['onNext', 2],
              ['onNext', 3],
              ['onError', err]
            ])
          } catch(err) {
            return done(err)
          }
          done()
        }
      }
    }
  })

  it('should work just like wrapped observable (completed)', function (done) {
    var innerObservable = new Observable(function (observer) {
      observer.next(1)
      observer.next(2)
      observer.next(3)
      observer.complete()
      return new Subscription(noop)
    })
    var promise = Promise.resolve(innerObservable)
    var observable = new PromisedObservable(promise)
    this.subscription = observable.subscribe(
      record('onNext'),
      record('onError', done),
      record('onCompleted', done)
    )
    var log = []
    function record (event, done) {
      return function (arg) {
        log.push([event, arg])
        if (done) {
          try {
            expect(log).to.deep.equal([
              ['onNext', 1],
              ['onNext', 2],
              ['onNext', 3],
              ['onCompleted', undefined]
            ])
          } catch(err) {
            return done(err)
          }
          done()
        }
      }
    }
  })

  it('should error if promise errors', function (done) {
    var err = new Error('boom')
    var promise = Promise.reject(err)
    var observable = new PromisedObservable(promise)
    this.subscription = observable.subscribe(
      expectNotCalled('onNext', done),
      finish,
      expectNotCalled('onCompleted', done)
    )
    function finish (_err) {
      expect(_err).to.equal(err)
      done()
    }
  })

  it('should error if promise resolve non-observable', function (done) {
    var notObservable = {}
    var promise = Promise.resolve(notObservable)
    var observable = new PromisedObservable(promise)
    this.subscription = observable.subscribe(
      expectNotCalled('onNext', done),
      finish,
      expectNotCalled('onCompleted', done)
    )
    function finish (err) {
      try {
        expect(err).to.exist
        expect(err.message).to.match(/promise.*resolve.*observable/)
      } catch(err) {
        return done(err)
      }
      done()
    }
  })

  describe('unsubscribe', function () {
    it('should unsubscribe source if it exists', function (done) {
      var innerUnsubscribe = sinon.stub()
      var innerObservable = new Observable(function (observer) {
        return new Subscription(innerUnsubscribe)
      })
      var mockPromise = {
        then: function (cb) {
          cb(innerObservable)
          return this
        },
        catch: noop
      }
      var observable = new PromisedObservable(mockPromise)
      this.subscription = observable.subscribe(
        expectNotCalled('onNext', done),
        expectNotCalled('onError', done),
        expectNotCalled('onCompleted', done)
      )
      this.subscription.unsubscribe()
      delete this.subscription
      sinon.assert.calledOnce(innerUnsubscribe)
      done()
    })

    it('should unsubscribe source AFTER it exists', function (done) {
      var innerUnsubscribe = sinon.stub()
      var innerObservable = new Observable(function (observer) {
        return new Subscription(innerUnsubscribe)
      })
      var mockPromise = {
        then: function (cb) {
          setTimeout(function () {
            cb(innerObservable)
            sinon.assert.calledOnce(innerUnsubscribe)
            done()
          }, 5)
          return this
        },
        catch: noop
      }
      var observable = new PromisedObservable(mockPromise)
      this.subscription = observable.subscribe(
        expectNotCalled('onNext', done),
        expectNotCalled('onError', done),
        expectNotCalled('onCompleted', done)
      )
      this.subscription.unsubscribe()
      delete this.subscription
      sinon.assert.notCalled(innerUnsubscribe)
    })
  })
})