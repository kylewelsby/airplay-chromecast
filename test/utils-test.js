var utils = require('./../lib/utils')
describe('promiseWhen', function () {
  it('resolves imidately when condition is true', function (done) {
    utils.promiseWhen(function () {
      return true
    }).then(function () {
      done()
    })
  })

  it('resolves when condition changes to true', function (done) {
    var value = false
    setTimeout(function () {
      value = true
    }, 10)
    utils.promiseWhen(function () {
      return value
    }).then(function () {
      done()
    })
  })

  it('resolves multiple times', function (done) {
    var value = false
    setTimeout(function () {
      value = true
    }, 10)
    utils.promiseWhen(function () {
      return value
    }).then(function () {
      utils.promiseWhen(function () {
        return true
      }).then(function () {
        done()
      })
    })
  })
})
