'use strict'

var util = require('util')

var Observable = require('rxjs/Observable').Observable
var Subscription = require('rxjs/Subscription').Subscription

module.exports = PromisedObservable

function PromisedObservable (promise) {
  this._promise = promise
  Observable.call(this, this._subscribe)
}

util.inherits(PromisedObservable, Observable)

PromisedObservable.prototype._subscribe = function (observer) {
  var srcSubscription
  var subscription
  var onCompleted = observer.complete.bind(observer)
  var onError = observer.error.bind(observer)
  var onNext = observer.next.bind(observer)
  this._promise.then(function (observable) {
    if (typeof observable.subscribe !== 'function') {
      throw new TypeError('promise did not resolve to an observable')
    }
    srcSubscription = observable.subscribe(
      onNext,
      onError,
      onCompleted
    )
    if (subscription && subscription.isUnsubscribed) {
      srcSubscription.unsubscribe()
    }
  }).catch(onError)
  subscription = new Subscription(function () {
    if (srcSubscription) {
      srcSubscription.unsubscribe()
    }
  })
  return subscription
}
