
var test = require('tap').test;

var browser = require('../start-browser.js');
var evaluate = require('../../steer-evaluate.js');

function makeScript(fn) {
  return '(' + fn.toString() + ')();';
}

var chrome = browser(function() {

  test('evaluate simple string script', function(t) {
    evaluate(chrome, makeScript(function() {
      return 'evaluate complete';
    }), function(err, result) {
      t.equal(result, 'evaluate complete');
      t.end();
    });
  });

  test('evaluate simple object script', function(t) {
    evaluate(chrome, makeScript(function() {
      return {status: 'good'};
    }), function(err, result) {
      t.deepEqual(result, {status: 'good'});
      t.end();
    });
  });

  test('script can output to console', function(t) {
    chrome.inspector.Console.enable(function() {
      evaluate(chrome, makeScript(function() {
        console.log('standard console logging');
      }), function(err, result) {
        t.equal(result, undefined);
      });
    });

    chrome.inspector.Console.once('messageAdded', function(data) {

      t.deepEqual(data, {
        'message': {
          source: 'console-api',
          level: 'log',
          text: 'standard console logging',
          timestamp : data.message.timestamp,
          type: 'log',
          line: 3,
          column : 17,
          url: '',
          repeatCount: 1,
          parameters: [{
            type: 'string',
            value: 'standard console logging'
          }],

          // The internals of chromium may change, affecing also
          // the produced stack trace. We don't want that kind
          // of detail in these tests.
          stackTrace: data.message.stackTrace
        }
      });

      t.end();
    });
  });

  test('evalulate a failing script', function(t) {
    evaluate(chrome, makeScript(function() {
        undefined.pleaseFail();
      }),
      function(err, result) {
        t.equal(
          err.message,
          'TypeError: Cannot call method \'pleaseFail\' of undefined'
        );
        t.equal(result, null);
        t.end();
      }
    );
  });

  test('close chromium', function(t) {
    chrome.close(function() {
      t.end();
    });
  });
});
