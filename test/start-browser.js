
var path = require('path');
var fs = require('fs');

var browser = require('steer');

module.exports = function(options, callback) {
    if (!callback) {
        callback = options;
        options = {};
    }

    var settings = {
        cache: path.resolve(__dirname, 'cache'),
        inspectorPort: 6020
    };

    // Simple one level merge of settings
    Object.keys(options).forEach(function(propName) {
        settings[propName] = options[propName];
    });

    var chrome = browser(settings);

    chrome.once('open', callback);

    var output = fs.createWriteStream(
        path.resolve(__dirname, 'chrome.out'),
        { flags: 'a' }
    );
    chrome.once('open', function() {
        chrome.process.stdout.pipe(output);
        chrome.process.stderr.pipe(output);
    });

    var minUncaught = process.listeners('uncaughtException').length + 1;
    process.once('uncaughtException', function(err) {
        if (process.listeners('uncaughtException').length <= minUncaught) {
            chrome.close(function() {
                throw err;
            });
        }
    });

    var minExit = process.listeners('uncaughtException').length + 1;
    process.once('exit', function(err) {
        if (process.listeners('exit').length <= minExit) {
            chrome.close(function() {
                throw err;
            });
        }
    });

    return chrome;
};
