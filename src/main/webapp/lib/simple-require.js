/**
 * Simple implementation of require/define assuming all
 * modules are named, in one file and in the correct order.
 * This is just what r.js produces.
 * This implementation is used for creating standalone bundles
 * that do no more require require.js
 */
var require, define;
(function (window) {

    if (typeof define !== "undefined") {
        //If a define is already in play via another AMD loader,
        //do not overwrite.
        return;
    }


    var defined = [];
    var def;
    define = def = function(name, deps, value) {
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
    // This assignments marks an implementation of require.js.
    // Needed for r.js to put this first in the optimization process.
    // We put it into a "with" statement, so that
    // it does not get renamed by uglify, and can stil be recognized
    // after the optimization process.
    // This is important for using the generated file in the unit tests.
    with(define) {
        define.amd = {};
    }

    require.ready = $;

    /**
     * If the flag simplerequire is set in the window,
     * make the require and define functions global.
     * This is needed for the unit-tests, so that the unit-tests
     * can directly interact with the modules of the adapter.
     */
    if (window.simplerequire) {
        window.require = require;
        window.define = def;
    }
})(window);
