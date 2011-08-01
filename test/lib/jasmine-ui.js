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

jasmine.ui = {};


/**
 * The central logging function.
 */
jasmine.ui.log = function(msg) {
    // console.log(msg);
};


/**
 * Jasmine UI Plugin that cares for creating a testframe.
 */
(function(window) {
    function splitAtHash(url) {
        var hashPos = url.indexOf('#');
        if (hashPos!=-1) {
            return [url.substring(0, hashPos), url.substring(hashPos+1)];
        } else {
            return [url,''];
        }
    }

    var testwindow;
    window.testframe = function(url) {
        if (arguments.length > 0) {
            if (!url.charAt(0)=='/') {
                throw new Error("the url for the testframe needs to be absolute!");
            }
            if (!testwindow) {
                testwindow = window.open(url, 'jasmineui');
            }
            var oldPath = testwindow.location.pathname;
            // if only the hash changes, the
            // page will not reload by assigning the href but only
            // change the hashpath.
            // So detect this and do a manual reload.
            var urlSplitAtHash = splitAtHash(url);
            if (oldPath===urlSplitAtHash[0]) {
                testwindow.location.hash = urlSplitAtHash[1];
                testwindow.location.reload();
            } else {
                testwindow.location.href = url;
            }
        }
        return testwindow;
    };

})(window);


/**
 * Jasmine UI Plugin for waiting for the end of asynchronous actions.
 * Uses handlers that can be installed into a testframe to determine
 * the end of the wait cycle.
 */
(function(jasmine, window) {
    var allFramesWaitHandlers = {};
    /**
     * Adds a handler to the async wait functionality for the given testframe.
     * A handler is a function that returns whether asynchronous work is going on.
     *
     * @param frame If null, the handler is responsible for all testframes.
     * @param name
     * @param handler Function that returns true/false.
     */
    jasmine.ui.addAsyncWaitHandler = function(frame, name, handler) {
        if (!frame) {
            allFramesWaitHandlers[name] = handler;
        } else {
            frame.asyncWaitHandlers = frame.asyncWaitHandlers || {};
            frame.asyncWaitHandlers[name] = handler;
        }
    }

    window.waitsForAsync = function(timeout) {
        jasmine.getEnv().currentSpec.waitsForAsync.apply(jasmine.getEnv().currentSpec,
            arguments);
    };

    jasmine.ui.isWaitForAsync = function() {
        var handlers = allFramesWaitHandlers;
        for (var name in handlers) {
            if (handlers[name]()) {
                jasmine.ui.log("async waiting for " + name);
                return true;
            }
        }
        var fr = testframe();
        var handlers = fr.asyncWaitHandlers || {};
        for (var name in handlers) {
            if (handlers[name]()) {
                jasmine.ui.log("async waiting for " + name);
                return true;
            }
        }
        if (fr.jQuery) {
            if (!fr.jQuery.isReady) {
                jasmine.ui.log("async waiting for jquery ready");
                return true;
            }
        }
        jasmine.ui.log("end waiting for async");
        return false;
    };

    jasmine.Spec.prototype.waitsForAsync = function(timeout) {
        var spec = this;
        if (!timeout) {
            timeout = 5000;
        }
        // Wait at least 50 ms. Needed e.g.
        // for animations, as the animation start event is
        // not fired directly after the animation css is added.
        // There may also be a gap between changing the location hash
        // and the hashchange event (almost none however...).
        spec.waits(100);
        spec.runs(function() {
            jasmine.ui.log("begin async waiting");
        });
        spec.waitsFor(
            function() {
                return !jasmine.ui.isWaitForAsync()
            }, "end of async work", timeout);
        spec.runs(function() {
            jasmine.ui.log("end async waiting");
        });
    };
})(jasmine, window);


/**
 * Jasmine UI Plugin for loading and instrumenting a page into a testframe().
 */
(function(jasmine, window) {
    var instrumentListeners = {};

    /**
     * Adds a listener to the instrumentation done by #loadHtml. All listeners
     * will be called when a frame is loaded.
     * @param name
     * @param listener A function with the signature fn(window, callTime) where callTime is either
     * "beforeContent" or "afterContent".
     */
    jasmine.ui.addLoadHtmlListener = function(name, listener) {
        instrumentListeners[name] = listener;
    }

    var customListenerId = 0;
    /**
     * Same as #addLoadHtmlListener, but removes the listener
     * after the first execution.
     * @param name
     * @param listener
     */
    jasmine.ui.addLoadHtmlListenerForNextLoad = function(name, callTime, listener) {
        name = name + (customListenerId++);
        jasmine.ui.addLoadHtmlListener(name, function(window, pcallTime) {
            if (callTime == pcallTime) {
                window.setTimeout(function() {
                    delete instrumentListeners[name];
                }, 0);
                listener(window);
            }
        });
    }

    window.loadHtml = function(url, instrumentCallback) {
        jasmine.getEnv().currentSpec.loadHtml.apply(jasmine.getEnv().currentSpec,
            arguments);
    };


    /**
     * Loads the given url into the testframe and waits
     * until the page is fully loaded.
     * @param url
     * @param instrumentCallback
     */
    jasmine.Spec.prototype.loadHtml = function(url, instrumentCallback) {
        var spec = this;
        spec.runs(function() {
            if (instrumentCallback) {
                jasmine.ui.addLoadHtmlListenerForNextLoad('loadHtmlCallback', 'afterContent', instrumentCallback);
            }
            testframe(url);
        });
        // Be sure to wait until the new page is loaded.
        // waitsForAsync would not be enough here,
        // as it would proceed directly if there already was
        // a frame loaded.
        waitsForReload();
        spec.runs(function() {
            jasmine.ui.log("Successfully loaded url " + url);
        });
    }

    function callInstrumentListeners(fr, callTime) {
        jasmine.ui.log('instrumenting ' + fr.name + " " + callTime);
        for (var name in instrumentListeners) {
            var fn = instrumentListeners[name];
            fn(testframe(), callTime);
        }
    }

    function proxyAddEventFunction(baseObject, fnname, eventProxyMap) {
        var oldFnname = 'old' + fnname;
        baseObject[oldFnname] = baseObject[fnname];
        baseObject[fnname] = function() {
            var event = arguments[0];
            var callback = arguments[1];
            var newCallback = callback;
            var proxyCallback = eventProxyMap[event];
            if (proxyCallback) {
                newCallback = function() {
                    proxyCallback.apply(this, arguments);
                    // Somehow apply does not work in IE. Don't know why :-(
                    return callback.call(this, arguments[0]);
                }
            }
            arguments[1] = newCallback;
            // Note: We cannot use apply here as this is not possible for the attachEvent
            // function in IE!
            if (arguments.length == 2) {
                return baseObject[oldFnname](arguments[0], arguments[1]);
            } else if (arguments.length == 3) {
                return baseObject[oldFnname](arguments[0], arguments[1], arguments[2]);
            } else {
                throw "proxyAddEventFunction does not support argument calls with " + arguments.length + " arguments";
            }
        }
    }

    function addLoadEventListener(fr) {
        var win = fr;
        var doc = fr.document;

        function callListeners() {
            // Only use the load events when require-js is not used.
            // Otherwise we use the ready-callback from require-js.
            if (!fr.define) {
                callInstrumentListeners(fr, 'afterContent');
            }
        }

        function loadCallback() {
            if (!win.loadHtmlReady) {
                win.loadHtmlReady = true;
                callListeners();
            }
        }

        // Mozilla, Opera and webkit nightlies currently support this event
        if (doc.addEventListener) {
            // Be sure that our handler gets called before any
            // other handler of the instrumented page!
            proxyAddEventFunction(doc, 'addEventListener', {'DOMContentLoaded': loadCallback});
            proxyAddEventFunction(win, 'addEventListener', {'load': loadCallback});

            // A fallback to window.onload, that will always work
            win.addEventListener("load", loadCallback, false);

            // If IE event model is used
        } else if (doc.attachEvent) {
            // Be sure that our handler gets called before any
            // other handler of the instrumented page!
            proxyAddEventFunction(doc, 'attachEvent', {'onreadystatechange': loadCallback});
            proxyAddEventFunction(win, 'attachEvent', {'load': loadCallback});

            // A fallback to window.onload, that will always work
            win.attachEvent("onload", loadCallback);
        }
    }
    /*
     * When using require.js, and all libs are in one file,
     * we might not be able to intercept the point in time
     * when everything is loaded, but the ready signal was not yet sent.
     */
    function addRequireJsSupport(fr) {
        fr.require = {
          ready: function() {
              callInstrumentListeners(fr, 'afterContent');
          }
        };
    }

    window.instrument = function(fr) {
        try {
            jasmine.ui.log("Beginn instrumenting frame " + fr.name + " with url " + fr.location.href);
            fr.loadHtmlError = null;
            fr.loadHtmlReady = false;
            jasmine.ui.addAsyncWaitHandler(fr, 'loading', function() {
                if (fr.loadHtmlError) {
                    jasmine.ui.log("Error during loading page: " + fr.loadHtmlError);
                    throw fr.loadHtmlError;
                }
                return !fr.loadHtmlReady;
            });
            callInstrumentListeners(fr, 'beforeContent');
            addLoadEventListener(fr);
            addRequireJsSupport(fr);

        } catch (ex) {
            fr.loadHtmlError = ex;
        }
    };
})(jasmine, window);


/**
 * Jasmine UI Multi-Page Plugin to wait for the load of a new page.
 * Reacts to the unload event and waits until the new page is loaded.
 * Also provides the waitsForReload function if the user knows that
 * the page will be reloaded.
 */
(function() {
    var inReload = false;

    /**
     * Waits for the new page to be loaded.

     * @param timeout
     */
    window.waitsForReload = function(timeout) {
        window.runs(function() {
            inReload = true;
        });
        return window.waitsForAsync(10000);
    };

    jasmine.ui.addAsyncWaitHandler(null, 'unload', function() {
        return inReload;
    });

    jasmine.ui.addLoadHtmlListener('instrumentBeforeUnload', function(window, callTime) {
        if (callTime != 'beforeContent') {
            return;
        }
        inReload = false;
        if (window.addEventListener) {
            window.addEventListener('unload', function() {
                inReload = true;
            }, true);
        } else {
            window.attachEvent("onunload", function() {
                inReload = true;
            });
        }
    });
})();

/**
 * Adds some helper functions into the created frame and the current window.
 */
(function() {
    var addHelperFunctions = function(window) {
        /**
         * Instantiates the given function with the given arguments.
         * Needed because IE throws an error if an object is instantiated
         * from another iframe or window.
         * @param fn
         * @param args
         */
        function instantiateHelper(fn, args) {
            if (!args || args.length == 0) {
                return new fn();
            } else if (args.length == 1) {
                return new fn(args[0]);
            } else if (args.length == 2) {
                return new fn(args[0], args[1]);
            } else if (args.length == 3) {
                return new fn(args[0], args[1], args[2]);
            } else {
                throw "instantiateHelper does only support 3 arguments";
            }
        }

        window.instantiateHelper = instantiateHelper;

        /**
         * Creates a wrapper function for the given function from the given window.
         * Needed for IE to install proxy functions into other windows
         * than the current one, so that they an be called with the new operator.
         * @param fn
         * @param dispatchWindow
         */
        function proxyConstructor(fn, dispatchWindow) {
            return function() {
                var newargs = dispatchWindow.instantiateHelper(dispatchWindow.Array);
                for (var i=0; i<arguments.length; i++) {
                    newargs.push(arguments[i]);
                }
                return fn.apply(this, newargs);
            };
        }

        window.proxyConstructor = proxyConstructor;
    }

    jasmine.ui.addLoadHtmlListener('addHelperFunctions', function(window, callTime) {
        if (callTime != 'beforeContent') {
            return;
        }
        window.document.write("<script>(" + addHelperFunctions.toString() + ")(window);</script>");
    });

    addHelperFunctions(window);

    /**
     * Clones the given array with the right prototype of the given window.
     * @param arr
     * @param win
     */
    function normalizeExternalArray(arr,win) {
        var res = win.instantiateHelper(win.Array);
        for (var i = 0; i < arr.length; i++) {
            res.push(arr[i]);
        }
        return res;
    }

    function isNumber(obj) {
        return obj.toFixed !== undefined;
    }

    function isString(obj) {
        return obj.charAt !== undefined;
    }

    function isArray(obj) {
        return !isString(obj) && obj.slice !== undefined;
    }

    /**
     * Normalizes the given object if it originates from another window
     * or iframe. Traverses through the object graph
     * and calls normalizeExternalArray where needed.
     * <p>
     * Note that this changes the object itself if it is no array.
     * If it is an array, a new instance will be created.
     * <p>
     * Attention: This does not work on cyclic graphs!
     * @param obj
     */
    function normalizeExternalObject(obj,win) {
        if (!win) {
            win = window;
        }
        if (obj === null || obj === undefined) {
            return obj;
        }
        if (isArray(obj)) {
            obj = normalizeExternalArray(obj,win);
        }
        if (!isNumber(obj) && !isString(obj)) {
            for (var prop in obj) {
                if (obj.hasOwnProperty(prop)) {
                    var value = obj[prop];

                    var newValue = normalizeExternalObject(value, win);
                    if (value!==newValue) {
                        obj[prop] = newValue;
                    }
                }
            }
        }
        return obj;
    }

    jasmine.ui.normalizeExternalArray = normalizeExternalArray;
    jasmine.ui.normalizeExternalObject = normalizeExternalObject;

})();

/**
 * Adds a loadHtmlListener that adds an async wait handler for the window.setTimeout function.
 */
(function() {
    jasmine.ui.addLoadHtmlListener('instrumentTimeout', function(window, callTime) {
        if (callTime != 'beforeContent') {
            return;
        }
        var timeouts = {};
        // Note: Do NOT use function.apply here,
        // as sometimes the timeout method
        // is also used with native objects!
        if (!window.oldTimeout) {
            window.oldTimeout = window.setTimeout;
        }
        window.setTimeout = function(fn, time) {
            jasmine.ui.log("setTimeout called");
            var handle;
            var callback = function() {
                delete timeouts[handle];
                jasmine.ui.log("timed out");
                if (typeof fn == 'string') {
                    eval(fn);
                } else {
                    fn();
                }
            };
            handle = window.oldTimeout(callback, time);
            timeouts[handle] = true;
            return handle;
        };

        // Note: Do NOT use function.apply here,
        // as sometimes the timeout method
        // is also used with native objects!
        window.oldClearTimeout = window.clearTimeout;
        window.clearTimeout = function(code) {
            jasmine.ui.log("clearTimeout called");
            window.oldClearTimeout(code);
            delete timeouts[code];
        };
        jasmine.ui.addAsyncWaitHandler(window, 'timeout', function() {
            var count = 0;
            for (var x in timeouts) {
                count++;
            }
            return count != 0;
        });
    });
})();

/**
 * Adds a loadHtmlListener that adds an async wait handler for the window.setInterval function.
 */
(function() {
    jasmine.ui.addLoadHtmlListener('instrumentInterval', function(window, callTime) {
        if (callTime != 'beforeContent') {
            return;
        }
        var intervals = {};
        // Note: Do NOT use function.apply here,
        // as sometimes the interval method
        // is also used with native objects!
        window.oldSetInterval = window.setInterval;
        window.setInterval = function(fn, time) {
            jasmine.ui.log("setInterval called");
            var callback = function() {
                if (typeof fn == 'string') {
                    eval(fn);
                } else {
                    fn();
                }
            };
            var res = window.oldSetInterval(callback, time);
            intervals[res] = 'true';
            return res;
        };

        // Note: Do NOT use function.apply here,
        // as sometimes the interval method
        // is also used with native objects!
        window.oldClearInterval = window.clearInterval;
        window.clearInterval = function(code) {
            jasmine.ui.log("clearInterval called");
            window.oldClearInterval(code);
            delete intervals[code];
        };
        // return a function that allows to check
        // if an interval is running...
        jasmine.ui.addAsyncWaitHandler(window, 'interval', function() {
            var count = 0;
            for (var x in intervals) {
                count++;
            }
            return count != 0;
        });
    });
})();

/**
 * Adds a loadHtmlListener that adds an async wait handler for the window.XMLHttpRequest.
 */
(function(jasmine) {
    var jasmineWindow = window;
    var copyStateFields = ['readyState', 'responseText', 'responseXML', 'status', 'statusText'];
    var proxyMethods = ['abort','getAllResponseHeaders', 'getResponseHader', 'open', 'send', 'setRequestHeader'];

    jasmine.ui.addLoadHtmlListener('instrumentXhr', function(window, callTime) {
        if (callTime != 'beforeContent') {
            return null;
        }

        var oldXHR = window.XMLHttpRequest;
        window.openCallCount = 0;
        var DONE = 4;
        var newXhr = function() {
            var self = this;
            this.origin = window.instantiateHelper(oldXHR, []);

            function copyState() {
                for (var i = 0; i < copyStateFields.length; i++) {
                    var field = copyStateFields[i];
                    try {
                        self[field] = self.origin[field];
                    } catch (_) {
                    }
                }
            }

            function proxyMethod(name) {
                self[name] = function() {
                    if (name == 'send') {
                        window.openCallCount++;
                    }
                    var res = self.origin[name].apply(self.origin, jasmine.ui.normalizeExternalArray(arguments,window));
                    copyState();
                    return res;
                }
            }

            for (var i = 0; i < proxyMethods.length; i++) {
                proxyMethod(proxyMethods[i]);
            }
            this.origin.onreadystatechange = function() {
                if (self.origin.readyState == DONE) {
                    window.openCallCount--;
                }
                copyState();
                if (self.onreadystatechange) {
                    self.onreadystatechange.apply(self.origin, jasmine.ui.normalizeExternalArray(arguments,window));
                }
            };
            copyState();
        };
        window.XMLHttpRequest = window.proxyConstructor(newXhr, jasmineWindow);

        jasmine.ui.addAsyncWaitHandler(window, 'xhr',
            function() {
                return window.openCallCount != 0;
            });

    });


})(jasmine);

/**
 * Adds a loadHtmlListener that adds an async wait handler for the webkitAnimationStart and webkitAnimationEnd events.
 * Note: The animationStart event is usually fired some time
 * after the animation was added to the css of an element (approx 50ms).
 * So be sure to always wait at least that time!
 */
(function() {

    jasmine.ui.addLoadHtmlListener('instrumentAnimationEnd', function(window, callTime) {
        if (callTime != 'afterContent') {
            return null;
        }
        if (!(window.$ && window.$.fn.animationComplete)) {
            return;
        }
        var oldFn = window.$.fn.animationComplete;
        window.animationCount = 0;
        window.$.fn.animationComplete = function(callback) {
            window.animationCount++;
            return oldFn.call(this, function() {
                window.animationCount--;
                return callback.apply(this, arguments);
            });
        };
        jasmine.ui.addAsyncWaitHandler(window, 'WebkitAnimation',
            function() {
                return window.animationCount != 0;
            });
    });
})();

/**
 * Adds a loadHtmlListener that adds an async wait handler for the webkitTransitionStart and webkitTransitionEnd events.
 * Note: The transitionStart event is usually fired some time
 * after the animation was added to the css of an element (approx 50ms).
 * So be sure to always wait at least that time!
 */
(function() {
    jasmine.ui.addLoadHtmlListener('instrumentWebkitTransition', function(window, callTime) {
        if (callTime != 'afterContent') {
            return null;
        }
        if (!(window.$ && window.$.fn.animationComplete)) {
            return;
        }
        window.transitionCount = 0;

        var oldFn = window.$.fn.transitionComplete;
        window.$.fn.transitionComplete = function(callback) {
            window.transitionCount++;
            return oldFn.call(this, function() {
                window.transitionCount--;
                return callback.apply(this, arguments);
            });
        };
        jasmine.ui.addAsyncWaitHandler(window, 'WebkitTransition',
            function() {
                return window.transitionCount != 0;
            });

    });
})();


/**
 * Functions to simulate events.
 * Based upon https://github.com/jquery/jquery-ui/blob/master/tests/jquery.simulate.js
 * Can also handle elements from different frames.
 * <p>
 * Provides:
 * jasmine.ui.simulate(el, type, options)
 */
(function(jasmine) {
    jasmine.ui.simulate = function(el, type, options) {
        options = extend({}, jasmine.ui.simulate.defaults, options || {});
        var document = el.ownerDocument;
        simulateEvent(document, el, type, options);
    }

    function extend(target) {
        for (var i = 1; i < arguments.length; i++) {
            var obj = arguments[i];
            for (var key in obj) {
                target[key] = obj[key];
            }
        }
        return target;
    }

    function simulateEvent(document, el, type, options) {
        var evt = createEvent(document, type, options);
        dispatchEvent(el, type, evt);
        return evt;
    }

    function createEvent(document, type, options) {
        if (/^mouse(over|out|down|up|move)|(dbl)?click$/.test(type)) {
            return mouseEvent(document, type, options);
        } else if (/^key(up|down|press)$/.test(type)) {
            return keyboardEvent(document, type, options);
        } else {
            return otherEvent(document, type, options);
        }
    }

    function mouseEvent(document, type, options) {
        var evt;
        var e = extend({
            bubbles: true, cancelable: (type != "mousemove"), detail: 0,
            screenX: 0, screenY: 0, clientX: 0, clientY: 0,
            ctrlKey: false, altKey: false, shiftKey: false, metaKey: false,
            button: 0, relatedTarget: undefined
        }, options);

        var relatedTarget = e.relatedTarget;

        if (typeof document.createEvent == 'function') {
            evt = document.createEvent("MouseEvents");
            evt.initMouseEvent(type, e.bubbles, e.cancelable, e.view, e.detail,
                e.screenX, e.screenY, e.clientX, e.clientY,
                e.ctrlKey, e.altKey, e.shiftKey, e.metaKey,
                e.button, e.relatedTarget || document.body.parentNode);
        } else if (document.createEventObject) {
            evt = document.createEventObject();
            extend(evt, e);
            evt.button = { 0:1, 1:4, 2:2 }[evt.button] || evt.button;
        }
        return evt;
    }

    function keyboardEvent(document, type, options) {
        var evt;

        var e = extend({ bubbles: true, cancelable: true,
            ctrlKey: false, altKey: false, shiftKey: false, metaKey: false,
            keyCode: 0, charCode: 0
        }, options);

        if (typeof document.createEvent == 'function') {
            try {
                evt = document.createEvent("KeyEvents");
                evt.initKeyEvent(type, e.bubbles, e.cancelable, e.view,
                    e.ctrlKey, e.altKey, e.shiftKey, e.metaKey,
                    e.keyCode, e.charCode);
            } catch(err) {
                evt = document.createEvent("Events");
                evt.initEvent(type, e.bubbles, e.cancelable);
                extend(evt, { view: e.view,
                    ctrlKey: e.ctrlKey, altKey: e.altKey, shiftKey: e.shiftKey, metaKey: e.metaKey,
                    keyCode: e.keyCode, charCode: e.charCode
                });
            }
        } else if (document.createEventObject) {
            evt = document.createEventObject();
            extend(evt, e);
        }
        return evt;
    }

    function otherEvent(document, type, options) {
        var evt;

        var e = extend({ bubbles: true, cancelable: true
        }, options);

        if (typeof document.createEvent == 'function') {
            evt = document.createEvent("Events");
            evt.initEvent(type, e.bubbles, e.cancelable);
        } else if (document.createEventObject) {
            evt = document.createEventObject();
            extend(evt, e);
        }
        return evt;
    }

    function dispatchEvent(el, type, evt) {
        if (el.dispatchEvent) {
            el.dispatchEvent(evt);
        } else if (el.fireEvent) {
            el.fireEvent('on' + type, evt);
        }
        return evt;
    }

    extend(jasmine.ui.simulate, {
        defaults: {
            speed: 'sync'
        },
        VK_TAB: 9,
        VK_ENTER: 13,
        VK_ESC: 27,
        VK_PGUP: 33,
        VK_PGDN: 34,
        VK_END: 35,
        VK_HOME: 36,
        VK_LEFT: 37,
        VK_UP: 38,
        VK_RIGHT: 39,
        VK_DOWN: 40
    });

})(jasmine);

