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

var loadHtml = function(url, username, password) {
    jasmine.getEnv().currentSpec.loadHtml.apply(jasmine.getEnv().currentSpec,
            arguments);
};


var waitsForAsync = function(timeout) {
    jasmine.getEnv().currentSpec.waitsForAsync.apply(jasmine.getEnv().currentSpec,
            arguments);
};

var frame = function() {
    return jasmine.getEnv().currentSpec.frame.apply(jasmine.getEnv().currentSpec,
            arguments);
};

var instrumentHtml = function() {
    return jasmine.getEnv().currentSpec.instrumentHtml.apply(jasmine.getEnv().currentSpec,
            arguments);
};

/**
 * The central logging function.
 * Uncomment this for debugging purposes.
 */
jasmine.asynclog = function(msg) {
};

/**
 * Container for functions that
 * return a function that returns false as long as
 * the waitsForAsync-function should wait.
 * <p>
 * Signature of those functions: fn(window, callTime) where callTime is either
 * "beforeContent" or "afterContent".
 */
jasmine.asyncwait = {};

(function(jasmine, window) {
    var frameObject = null;
    var finishedFunctions = [];
    var frameContainer = null;

    function frame() {
        return frameObject;
    }

    jasmine.Spec.prototype.frame = frame;

    jasmine.Spec.prototype.instrumentHtml = function(callback) {
        this.instrumentHtmlCallback = callback;
    };

    function getLoadUrl(pageUrl, username, password) {
        var lastSlash = pageUrl.lastIndexOf('/');
        var startPath = '';
        var page = '';
        if (lastSlash != -1) {
            startPath = pageUrl.substring(0, lastSlash + 1);
            page = pageUrl.substring(lastSlash + 1);
        } else {
            startPath = '';
            page = pageUrl;
        }
        if (!username) {
            username = '';
        }
        if (!password) {
            password = '';
        }
        return startPath + "jasmine-ui-loader.html?url=" + page + "&username=" + username + "&password=" + password;
    }

    function deleteElement(id) {
        var element = document.getElementById(id);
        if (element) {
            var parent = element.parentNode;
            parent.removeChild(element);
        }
    }

    function createFrameElementInBody(id, url) {
        var frameElement = document.createElement('iframe');
        frameElement.id = id;
        frameElement.name = id;
        frameElement.src = url;
        frameElement.style.width = '100%';
        frameElement.style.height = '100%';
        var body = document.getElementsByTagName('body')[0];
        body.appendChild(frameElement);
    }

    jasmine.Spec.prototype.loadHtml = function(url, username, password) {
        finishedFunctions = [];
        var spec = this;
        var error = null;
        var ready = false;

        function initAsyncWait(callTime) {
            for (var fnname in jasmine.asyncwait) {
                var fn = jasmine.asyncwait[fnname];
                var callback = fn(frameObject.window, callTime);
                if (callback) {
                    finishedFunctions.push(callback);
                }
            }
            ;
        }

        // initialize the callbacks for the loader page
        window.beforeFramecontent = function() {
            try {
                jasmine.asynclog('instrument before content');
                initAsyncWait("beforeContent");
            } catch (ex) {
                error = ex;
            }
        };

        window.afterFramecontent = function() {
            try {
                jasmine.asynclog('instrument after content');
                initAsyncWait("afterContent");
                // if the test defines an instrument function, use it...
                var userCallback = spec.instrumentHtmlCallback;
                if (userCallback) {
                    userCallback(frameObject.window);
                }
            } catch (ex) {
                error = ex;
            }
        };

        window.frameReady = function() {
            jasmine.asynclog("ready");
            ready = true;

        };

        // create the path to the load page
        // needs to be the same path as the url, so that relative urls still work!
        var newUrl = getLoadUrl(url);
        jasmine.asynclog(newUrl);

        deleteElement('jasmineui');
        delete window.jasmineui;
        createFrameElementInBody('jasmineui', newUrl);
        frameObject = jasmineui;
        this.waitsFor(function() {
            return ready || error;
        }, "Could not load url " + url, 20000);
        this.runs(function() {
            if (error) {
                throw error;
            }
        });
        this.waitsForAsync();
    };


    jasmine.Spec.prototype.waitsForAsync = function(timeout) {
        if (!timeout) {
            timeout = 5000;
        }
        jasmine.asynclog("begin waiting for async");
        this.waitsFor(function() {
            var finished = true;
            for (var i = 0; i < finishedFunctions.length; i++) {
                if (!finishedFunctions[i]()) {
                    return false;
                }
            }
            ;
            jasmine.asynclog("end waiting for async");
            return true;
        }, "Waiting for end of async work", timeout);
    };
})(jasmine, window);

// -----------
// async wait plugins...

/**
 * Instruments the given window, and returns a function
 * that returns whether there are currently pending timeouts waiting.
 */
(function() {
    jasmine.asyncwait.instrumentTimeout = function(window, callTime) {
        if (callTime != 'beforeContent') {
            return null;
        }
        var timeouts = {};
        // Note: Do NOT use function.apply here,
        // as sometimes the timeout method
        // is also used with native objects!
        window.oldTimeout = window.setTimeout;
        window.setTimeout = function(fn, time) {
            jasmine.asynclog("setTimeout called");
            var handle;
            var callback = function() {
                delete timeouts[handle];
                jasmine.asynclog("timed out");
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
            jasmine.asynclog("clearTimeout called");
            window.oldClearTimeout(code);
            delete timeouts[code];
        };

        // return a function that allows to check
        // if a timeout is running...
        return function() {
            var count = 0;
            for (var x in timeouts) {
                count++;
            }
            return count == 0;
        };
    };
})();

(function() {
    /**
     * Instruments the given window, and returns a function
     * that returns whether there are currently pending intervals waiting.
     */
    jasmine.asyncwait.instrumentInterval = function(window, callTime) {
        if (callTime != 'beforeContent') {
            return null;
        }
        var intervals = {};
        // Note: Do NOT use function.apply here,
        // as sometimes the interval method
        // is also used with native objects!
        window.oldSetInterval = window.setInterval;
        window.setInterval = function(fn, time) {
            jasmine.asynclog("setInterval called");
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
            jasmine.asynclog("clearInterval called");
            window.oldClearInterval(code);
            delete intervals[code];
        };
        // return a function that allows to check
        // if an interval is running...
        return function() {
            var count = 0;
            for (var x in intervals) {
                count++;
            }
            return count == 0;
        };
    };
})();

(function() {
    /**
     * Instruments the jquery ajax function, and returns a
     * function that returns whether there are currently pending ajax requests
     * waiting. If jquery is not available, this returns null.
     */
    jasmine.asyncwait.instrumentJQueryAjax = function(window, callTime) {
        if (callTime != 'afterContent') {
            return null;
        }
        // check for jQuery
        var jQuery = window.jQuery;
        if (!jQuery) {
            return null;
        }
        var jQueryAjaxCalls = 0;
        var origAjax = jQuery.ajax;
        jQuery.ajax = function(url, options) {
            jasmine.asynclog("start jquery ajax ");
            jQueryAjaxCalls++;
            options = options || {};
            var oldComplete = options.complete;
            options.complete = function() {
                jasmine.asynclog("End jquery ajax ");
                jQueryAjaxCalls--;
                if (oldComplete) {
                    oldComplete.apply(this, arguments);
                }
            };
            origAjax.apply(this, [ url, options ]);
        };
        return function() {
            return jQueryAjaxCalls == 0;
        };
    };

})();

(function() {
    /**
     * Instruments the jquery animationComplete function,
     * and returns a function that returns whether there are currently pending
     * ajax requests waiting. If the function is not available, this returns null.
     * <p>
     * Note: For non webkit browsers, the jquery mobile implementation uses
     * an interval. For webkit browsers, the leads to a native webkitAnimationEnd event!
     */
    jasmine.asyncwait.instrumentAnimationComplete = function(window, callTime) {
        if (callTime != 'afterContent') {
            return null;
        }
        var jQuery = window.jQuery;
        if (!jQuery || !jQuery.fn.animationComplete) {
            return null;
        }
        var animationCount = 0;
        var oldAnimationComplete = jQuery.fn.animationComplete;
        jQuery.fn.animationComplete = function(oldcallback) {
            jasmine.asynclog("start wait for animation complete");
            animationCount++;
            oldAnimationComplete.apply(this, [ function() {
                jasmine.asynclog("end wait for animation complete");
                animationCount--;
                oldcallback.apply(this, arguments);
            } ]);
        };
        return function() {
            return animationCount == 0;
        };
    };
})();

