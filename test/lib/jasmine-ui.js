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
    var lastFrameId = 0;
    var lastFrameName;

    function newFrameName() {
        lastFrameName = "jasmineui" + (lastFrameId++);
    }

    function hideElement(id) {
        var element = document.getElementById(id);
        if (element) {
            // Do NOT set the hide the frame (e.g. by setting display to none), as this causes a reload in FF
            element.style.width = "0px";
            element.style.height = "0px";
        }
    }

    function createFrameElementInBody(id, url) {
        var frameElement = document.createElement('iframe');
        frameElement.id = id;
        frameElement.name = id;
        frameElement.style.width = '100%';
        frameElement.style.height = '100%';
        frameElement.src = url;
        var body = document.getElementsByTagName('body')[0];
        body.appendChild(frameElement);
    }

    window.testframe = function(reset, url) {
        if (reset || !lastFrameName) {
            // Note: Do NOT delete the old iframe,
            // as this leads to debugging problems the scripts
            // that are included by the iframe with firebug etc
            if (window[lastFrameName]) {
                hideElement(lastFrameName);
            }
            newFrameName();
            createFrameElementInBody(lastFrameName, url);
        }
        return window[lastFrameName];
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
        var handlers = testframe().asyncWaitHandlers || {};
        for (var name in handlers) {
            if (handlers[name]()) {
                jasmine.ui.log("async waiting for " + name);
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
            if (callTime==pcallTime) {
                window.setTimeout(function() {
                    delete instrumentListeners[name];
                },0);
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
            testframe(true, url);
        });
        spec.waitsForAsync();
    }

    function callInstrumentListeners(fr, callTime) {
        jasmine.ui.log('instrumenting ' + fr.name + " " + callTime);
        for (var name in instrumentListeners) {
            var fn = instrumentListeners[name];
            fn(testframe(), callTime);
        }
    }

    function addLoadEventListener(fr) {
        var win = fr;
        var doc = fr.document;

        function callback() {
            if (!win.ready) {
                win.ready = true;
                callInstrumentListeners(fr, "afterContent");
                jasmine.ui.log("Successfully loaded frame " + fr.name + " with url " + fr.location.href);
            }

        }

        // Mozilla, Opera and webkit nightlies currently support this event
        if (doc.addEventListener) {
            // Use the handy event callback
            doc.addEventListener("DOMContentLoaded", callback, false);

            // A fallback to window.onload, that will always work
            win.addEventListener("load", callback, false);

            // If IE event model is used
        } else if (doc.attachEvent) {
            // ensure firing before onload,
            // maybe late but safe also for iframes
            doc.attachEvent("onreadystatechange", callback);

            // A fallback to window.onload, that will always work
            win.attachEvent("onload", callback);
        }
    }

    window.instrument = function(fr) {
        try {
            if (fr != testframe()) {
                // Prevent double instrumentation.
                // This is needed due to a strange behaviour of firefox:
                // When a frame is hidden, the scripts in the frame get
                // reexecuted, but with the same window object...
                return;
            }
            jasmine.ui.log("Beginn instrumenting frame " + fr.name + " with url " + fr.location.href);
            fr.instrumented = true;
            addLoadEventListener(fr);
            fr.error = null;
            fr.ready = false;
            jasmine.ui.addAsyncWaitHandler(fr, 'loading', function() {
                if (fr.error) {
                    jasmine.ui.log("Error during instrumenting frame " + fr.name + ": " + fr.error);
                    throw fr.error;
                }
                return !fr.ready;
            });

            callInstrumentListeners(fr, "beforeContent");
        } catch (ex) {
            error = ex;
        }
    };
})(jasmine, window);


/**
 * Jasmine UI Multi-Page Plugin.
 * Provides a function waitsForReload to wait until a new page was loaded.
 * <p>
 * Note: This could be implemented using the beforeunload and unload event.
 * However, these events are not fired correctly in all browsers (e.g. safari),
 * and they are fired some time after the unload was triggered.
 * By these reasons the simpler solution was preferred.
 */
(function(jasmine) {
    var inReload = false;

    window.waitsForReload = function(timeout) {
        jasmine.getEnv().currentSpec.waitsForReload.apply(jasmine.getEnv().currentSpec,
                arguments);
    };


    jasmine.Spec.prototype.waitsForReload = function(timeout) {
        var spec = this;
        if (!timeout) {
            timeout = 5000;
        }
        spec.runs(
                function() {
                    jasmine.ui.log("begin wait for reload");
                    inReload = true;
                }
                );
        spec.waitsFor(
                function() {
                    return !inReload;
                }, "reload of page", timeout);
        spec.waitsForAsync();
        spec.runs(
                function() {
                    jasmine.ui.log("end wait for reload");
                }
                );
    };

    jasmine.ui.addLoadHtmlListener('instrumentReload', function(window, callTime) {
        if (callTime != 'beforeContent') {
            return;
        }
        // When a new document gets loaded, stop the realod waiting
        inReload = false;
    });

})(jasmine);

/**
 * Fake history. Needed to prevent iframe to change the main frame
 * through the history object. Also the history in iframes does not always
 * work correctly. See the corresponding bugs in the browsers,
 * e.g. http://code.google.com/p/chromium/issues/detail?id=8011
 */
(function(jasmine) {

    var historyNavigation = false;
    var virtualHistoryByFrame = {};
    jasmine.ui.addLoadHtmlListener('instrumentHistory', function(frame, callTime) {
        if (callTime != 'beforeContent') {
            return;
        }
        var name = frame.name;
        var history = virtualHistoryByFrame[name] = virtualHistoryByFrame[name] || {list: [], index:-1};
        if (!historyNavigation) {
            history.list.push(frame.location.href);
            history.index++;
        }
        historyNavigation = false;
        var hashListener = function() {
            if (!historyNavigation) {
                history.list.push(frame.location.href);
                history.index++;
            }
            historyNavigation = false;
        };
        if (frame.addEventListener) {
            frame.addEventListener('hashchange', hashListener, false);
        } else {
            // IE
            frame.attachEvent('onhashchange', hashListener);
        }

        frame.history.back = function() {
            this.go(-1);
        };
        frame.history.forward = function() {
            this.go(1);
        };
        function splitAtHash(href) {
            var pos = href.indexOf('#');
            if (pos!=-1) {
                return [href.substring(0, pos), href.substring(pos+1)];
            } else {
                return [href, ''];
            }
        }
        frame.history.go = function(relPos) {
            if (relPos == 0) {
                return;
            }
            if (history.index + relPos < 0) {
                return;
            }
            if (history.index + relPos >= history.list.length) {
                return;
            }
            history.index += relPos;
            historyNavigation = true;
            // only change the hash if that is the only different part.
            // Important if we go back from a hash to an url with no hash,
            // as this would reload the document if that url with no hash
            // is assigned to the href.
            var currHref = frame.location.href;
            var currHrefHashSplit = splitAtHash(currHref);
            var targetHref = history.list[history.index];
            var targetHrefHashSplit = splitAtHash(targetHref);
            if (currHrefHashSplit[0] == targetHrefHashSplit[0]) {
                frame.location.hash = targetHrefHashSplit[1];
            } else {
                frame.location.assign(targetHref);

            }
        }
    });


})(jasmine);


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
    jasmine.ui.addLoadHtmlListener('instrumentXhr', function(window, callTime) {
        if (callTime != 'beforeContent') {
            return null;
        }
        var copyStateFields = ['readyState', 'responseText', 'responseXML', 'status', 'statusText'];
        var proxyMethods = ['abort','getAllResponseHeaders', 'getResponseHader', 'open', 'send', 'setRequestHeader'];
        var oldXHR = window.XMLHttpRequest;
        var openCallCount = 0;
        var DONE = 4;
        window.XMLHttpRequest = function() {
            this.origin = new oldXHR();
            var self = this;

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
                        openCallCount++;
                    }
                    var res = self.origin[name].apply(self.origin, arguments);
                    copyState();
                    return res;
                }
            }

            for (var i = 0; i < proxyMethods.length; i++) {
                proxyMethod(proxyMethods[i]);
            }
            this.origin.onreadystatechange = function() {
                if (self.origin.readyState == DONE) {
                    openCallCount--;
                }
                copyState();
                if (self.onreadystatechange) {
                    self.onreadystatechange.apply(self, arguments);
                }
            };
            copyState();
        };
        jasmine.ui.addAsyncWaitHandler(window, 'xhr',
                function() {
                    return openCallCount != 0;
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

