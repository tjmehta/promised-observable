'use strict'

var util = require('util')

var Observable = require('rxjs/Observable').Observable
var Subscription = require('rxjs/Subscription').Subscription

module.exports = PromisedObservable

function PromisedObservable (promise) {
  this._promise = promise
  Observable.call(this, this._subscribe.bind(this))
}

util.inherits(PromisedObservable, Observable)

PromisedObservable.prototype._subscribe = function (observer) {
  var self = this
  var onCompleted = observer.complete.bind(observer)
  var onError = observer.error.bind(observer)
  var onNext = observer.next.bind(observer)
  var innerObservable = this.innerObservable
  var innerSubscription
  var isUnsubscribed = false
  var subscription = new Subscription(function () {
    isUnsubscribed = true
    if (innerSubscription) {
      innerSubscription.unsubscribe()
    }
  })
  if (innerObservable) {
    innerObservableSubscribe()
  } else {
    this._promise.then(function (observable) {
      if (typeof observable.subscribe !== 'function') {
        throw new TypeError('promise did not resolve to an observable')
      }
      innerObservable = self.innerObservable = observable
      innerObservableSubscribe()
    }).catch(onError)
  }
  function innerObservableSubscribe () {
    innerSubscription = innerObservable.subscribe(
      onNext,
      onError,
      onCompleted
    )
    if (subscription && isUnsubscribed) {
      innerSubscription.unsubscribe()
    }
  }
  return subscription
}
