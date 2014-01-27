#steer-reset

> Evaluate a script in google chrome

## Installation

```sheel
npm install steer-evaluate
```

## Dependencies

Be sure to check out the requirements for `steer`.

## Documentation

This module evalutes a script in the chrome context. It does much more than
just calling `chrome.inspector.Page.evaluate` as it also catches errors and
replicates them in chrome. It also supports objects so you don't have to
`JSON.stringify` your output.

```javascript
var path = require('path');
var steer = require('steer');
var evaluate = require('steer-evaluate');

var chrome = steer({
  cache: path.resolve(__dirname, 'cache'),
  inspectorPort: 7510
});

chrome.once('open', function () {
  evaluate(chrome, '(function () { return docuement.title; })();', function (err, result) {
    if (err) throw err;

  });
});
```

##License

**The software is license under "MIT"**

> Copyright (c) 2014 Peter V. T. Schlegel
>
> Permission is hereby granted, free of charge, to any person obtaining a copy
> of this software and associated documentation files (the "Software"), to deal
> in the Software without restriction, including without limitation the rights
> to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
> copies of the Software, and to permit persons to whom the Software is
> furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in
> all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
> FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
> AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
> LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
> OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
> THE SOFTWARE.
