# promised-observable [![Build Status](https://travis-ci.org/tjmehta/promised-observable.svg?branch=master)](https://travis-ci.org/tjmehta/promised-observable) [![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](http://standardjs.com/)
Create an observable from a promise that will resolve to an observable.

# Installation
```bash
npm i --save promised-observable
npm i --save rxjs # peer dependency
```

# Usage
Full Example
```js
var Observable = require('rxjs/Observable').Observable
var Subscription = require('rxjs/Subscription').Subscription
var PromisedObservable = require('promised-observable')

// simple promise, just to show usage
var promise = new Promise(function (resolve, reject) {
  setTimeout(function () {
    // simple observable, just to show usage
    var observable = new Observable(function (observer) {
      observer.next('hello')
      observer.next('world')
      observer.completed()
      return new Subscription()
    })
    resolve(observable)
  }, 100)
})

var observable = new PromisedObservable(promise)
observable.subscribe(
  log('onNext:')
  log('onError:')
  log('onCompleted:')
)
// onNext: 'hello'
// onNext: 'world'
// onCompleted:
```

Promise Error
```js
var PromisedObservable = require('promised-observable')

var promise = Promise.reject(new Error('boom'))

var observable = new PromisedObservable(promise)
observable.subscribe(
  log('onNext:')
  log('onError:')
  log('onCompleted:')
)
// onError: [Error: 'boom']
```

Promise does not resolve observable error
```js
var PromisedObservable = require('promised-observable')

var nonObservable = {}
var promise = Promise.resolve(nonObservable)

var observable = new PromisedObservable(promise)
observable.subscribe(
  log('onNext:')
  log('onError:')
  log('onCompleted:')
)
// onError: [Error: 'promise did not resolve to an observable']
```

# License
MIT
