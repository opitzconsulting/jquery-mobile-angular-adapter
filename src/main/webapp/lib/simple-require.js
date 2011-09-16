/**
 * The MIT License
 *
 * Copyright (c) 2011 Tobias Bosch (OPITZ CONSULTING GmbH, www.opitz-consulting.com)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
var require, define;
(function (window) {
    var defined = [];
    define = function(name, deps, value) {
        var dotJs = name.indexOf('.js');
        if (dotJs!==-1) {
            name = name.substring(0, dotJs);
        }
        if (arguments.length==2) {
            // No deps...
            value = deps;
            deps = [];
        }
        if (typeof value === 'function') {
            var args = [];
            for (var i=0; i<deps.length; i++) {
                var dep = deps[i];
                args.push(defined[dep]);
            }
            value = value.apply(this, args);
        }
        defined[name] = value;
    }

    require = function(deps, callback) {
        if (typeof callback === 'function') {
            var args = [];
            for (var i=0; i<deps.length; i++) {
                var dep = deps[i];
                args.push(defined[dep]);
            }
            callback.apply(this, args);
        }

    }
    // This assignments marks an implementation of require.js
    define.amd = {};

    require.ready = $;

    /**
     * If the flag simplerequire is set in the window,
     * make the require and define functions global.
     */
    if (window.simplerequire) {
        window.require = require;
        window.define = define;
    }
})(window);
