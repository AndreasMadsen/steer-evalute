
var util = require('util');

var EVALUATE_ID = 0;

// This plugin will evaluate a javascript string in the browser
module.exports = function evaluate(browser, expression, callback) {
  var group = 'injected' + (EVALUATE_ID++);

  browser.inspector.Runtime.evaluate(
    // Expression to evaluate.
    expression,

    // Symbolic group name that can be used to release multiple objects.
    group,

    // Determines whether Command Line API should be available during
    // the evaluation. This is not used in production but in some tests and
    // its useful when debugging.
    true,

    // Specifies whether evaluation should stop on exceptions and mute
    // console.
    false,

    // Specifies in which isolated context to perform evaluation.
    undefined,

    // Whether the result is expected to be a JSON object that should
    // be sent by value.
    true,

    function(err, response) {
      if (err) return callback(err, null);

      // Throws if the evaluation is not registered as an error argument
      // but a throw returned object. To get the stack trace we can
      // evaluate err.stack.
      if (response.wasThrown) {
        createError(browser, response.result, function(err1, remoteError) {

          // No check for error now, just release the object imidiatly
          // and allow chromium-v8 to gc the returned object
          browser.inspector.Runtime.releaseObjectGroup(group, function(err2) {
            if (err1) return callback(err1, null);
            if (err2) return callback(err2, null);

            // Besides from the evalute error everything is good
            callback(remoteError, null);
          });
        });

      } else {
        // allow chromium-v8 to gc the returned object
        browser.inspector.Runtime.releaseObjectGroup(group, function(err) {
          if (err) return callback(err);

          // Everything is good, return the result
          callback(null, response.result.value);
        });
      }
    }
  );
};

function createError(browser, result, callback) {
  // Throws in the evaluation is not registered as an error argument
  // but a throw returned object. To get the stack trace we can
  // evaluate err.stack.
  browser.inspector.Runtime.callFunctionOn(
    // The this keyword in the function
    // In this case an id there points to the error object
    result.objectId,

    // thus function will return the stack trace
    'function () { return this.stack; }',

    function(err, stackResponse) {
      if (err) return callback(err);

      // The stackResponse is a string, so there is no need
      // or way too release it.
      var remoteError = new RemoteError(
          result.description,
          stackResponse.result.value
      );
      callback(null, remoteError);
    }
  );
}

function RemoteError(msg, stack) {
  Error.call(this);

  this.message = msg;
  this.stack = stack;
  this.name = 'RemoteError';
}

util.inherits(RemoteError, Error);

RemoteError.prototype.inspect = function() {
  return '[' + this.toString() + ']';
};
