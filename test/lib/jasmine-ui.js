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

var loadHtml = function(url, instrumentCallback) {
    jasmine.getEnv().currentSpec.loadHtml.apply(jasmine.getEnv().currentSpec,
            arguments);
};


var waitsForAsync = function(timeout) {
    jasmine.getEnv().currentSpec.waitsForAsync.apply(jasmine.getEnv().currentSpec,
            arguments);
};


jasmine.ui = {};


/**
 * The central logging function.
 */
jasmine.ui.log = function(msg) {
    //console.log(msg);
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
        jasmine.ui.log("begin waiting for async");
        // Wait at least 50 ms. Needed e.g.
        // for animations, as the animation start event is
        // not fired directly after the animation css is added.
        // There may also be a gap between changing the location hash
        // and the hashchange event (almost none however...).
        // Also needed to wait for the beforeunload event when
        // the page is changed.
        spec.waits(100);
        spec.waitsFor(
                function() {
                    return !jasmine.ui.isWaitForAsync()
                }, "end of async work", timeout);
    };
})(jasmine, window);


/**
 * Jasmine UI Plugin for loading and instrumenting a page into a testframe().
 */
(function(jasmine, window) {
    var instrumentListeners = {};

    /**
     * Adds a listener to the instrumentation done by #loadHtml. All listeners
     * will be called when the frame is loaded by loadHtml.
     * @param name
     * @param listener A function with the signature fn(window, callTime) where callTime is either
     * "beforeContent" or "afterContent".
     */
    jasmine.ui.addLoadHtmlListener = function(name, listener) {
        instrumentListeners[name] = listener;
    }

    /**
     * Loads the given url into the testframe and waits
     * until the page is fully loaded.
     * @param url
     * @param instrumentCallback
     */
    jasmine.Spec.prototype.loadHtml = function(url, instrumentCallback) {
        var spec = this;
        spec.runs(function() {
            jasmine.ui.internalLoadHtml(url, instrumentCallback);
        });
        spec.waitsForAsync();
    }

    jasmine.ui.internalLoadHtml = function(url, instrumentCallback) {
        var error = null;
        var ready = false;

        function callInstrumentListeners(callTime) {
            jasmine.ui.log('instrumenting ' + callTime);
            for (var name in instrumentListeners) {
                var fn = instrumentListeners[name];
                fn(testframe(), callTime);
            }
        }

        function addLoadEventListener(fr) {
            var win = fr;
            var doc = fr.document;

            function callback() {
                if (!ready) {
                    ready = true;
                    callInstrumentListeners("afterContent");
                    // if we have an instrument function, use it...
                    if (instrumentCallback) {
                        instrumentCallback(testframe());
                    }
                    jasmine.ui.log("Successfully loaded url " + url);
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
                if (fr!=testframe()) {
                    // Prevent double instrumentation.
                    // This is needed due to a strange behaviour of firefox:
                    // When a frame is hidden, the scripts in the frame get
                    // reexecuted, but with the same window object...
                    return;
                }
                fr.instrumented = true;
                addLoadEventListener(fr);
                jasmine.ui.addAsyncWaitHandler(fr, 'loading', function() {
                    if (error) {
                        jasmine.ui.log("Error during loading url " + url + " " + error);
                        throw error;
                    }
                    return !ready;
                });

                callInstrumentListeners("beforeContent");
            } catch (ex) {
                error = ex;
            }
        };

        testframe(true, url);
    };
})(jasmine, window);


/**
 * Jasmine UI Multi-Page Plugin.
 * Listens for unload events and waits until the new page is loaded.
 *
 */
(function(jasmine) {
    var inUnload = false;

    /**
     * Use the asyncWait function to wait while in an unload cycle.
     */
    jasmine.ui.addAsyncWaitHandler(null, 'unload', function() {
        return inUnload;
    });

    // instrument the unload function of all testframes
    jasmine.ui.addLoadHtmlListener('instrumentUnload', function(window, callTime) {
        if (callTime != 'beforeContent') {
            return;
        }
        // When a new document gets loaded, stop the unload waiting
        inUnload = false;

        function unloadCallback() {
            inUnload = true;
        }
        if (window.addEventListener) {
            window.addEventListener("unload", unloadCallback, false);
        } else {
            // IE support
            window.attachEvent('onunload', unloadCallback);
        }
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
            var targetHref = history.list[history.index];
            frame.location.assign(targetHref);
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
    var ignoredAnimations = {};
    var animationCount = 0;

    /*
     * Defines that the animation with the given name should be ignored.
     * Needed e.g. for infinite animations whose elements are
     * only shown or hidden.
     */
    jasmine.ui.ignoreAnimation = function(animName) {
        ignoredAnimations[animName] = true;
    }

    jasmine.ui.addLoadHtmlListener('instrumentWebkitAnimation', function(window, callTime) {
        if (callTime != 'beforeContent') {
            return null;
        }
        // Only support webkit animations for now...
        if (!window.WebKitAnimationEvent) {
            return;
        }
        var animationElements = {};
        // Note: the last argument needs to be set to true to always
        // get informed about the event, even if the event stops bubbeling up
        // the dom tree!
        window.document.addEventListener('webkitAnimationStart', function(event) {
            var animName = event.animationName;
            if (!ignoredAnimations[animName]) {
                animationCount++;
            }
            jasmine.ui.log("Started animation " + animName);
        }, true);
        window.document.addEventListener('webkitAnimationEnd', function(event) {
            var animName = event.animationName;
            if (!ignoredAnimations[animName]) {
                animationCount--;
            }
            jasmine.ui.log("Stopped animation " + animName);
        }, true);
        jasmine.ui.addAsyncWaitHandler(window, 'WebkitAnimation',
                function() {
                    var elements = [];
                    for (var el in animationElements) {
                        elements.push(el);
                    }
                    return animationCount != 0;
                });
    });
})();


/**
 * Functions to simulate events.
 * Also cares for the correct handling of hash links together with the base tag.
 * See here for details about the problem: http://www.ilikespam.com/jsf/using-base-href-with-anchors
 */
(function(jasmine) {
    function findAnchorInParents(element) {
        if (element == null) {
            return null;
        } else if (element.nodeName.toUpperCase() == 'A') {
            return element;
        } else {
            return findAnchorInParents(element.parentNode);
        }
    }

    function stripHashPath(href) {
        var hashPos = href.indexOf('#');
        if (hashPos != -1) {
            return href.substring(0, hashPos);
        } else {
            return href;
        }
    }

    function baseHref(document) {
        var baseTags = document.getElementsByTagName('base');
        if (baseTags.length > 0) {
            return baseTags[0].href;
        } else {
            return null;
        }
    }

    function simulateAnchorClick(anchor) {
        var doc = anchor.ownerDocument;
        var href = anchor.href;
        var hrefWithoutHash = stripHashPath(href);
        var base = baseHref(doc);
        if (base && base == hrefWithoutHash) {
            doc.location.hash = anchor.hash;
        } else {
            doc.location.href = href;
        }
    }

    window.trigger = function(element, eventType, options) {
        var frame = testframe();
        if (!frame.$) {
            throw "jQuery is not included as library in the testframe!";
        }
        var event = frame.$.Event(eventType);
        frame.$.extend(event, options);
        try {
            return frame.$(element).trigger(event);
        } finally {
            var anchor = findAnchorInParents(element);
            if (anchor && !event.isDefaultPrevented()) {
                simulateAnchorClick(anchor);
            }
        }
    }
})(jasmine);

