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
    var frameObject = null;
    var lastFrameId = 0;

    function newFrameId() {
        return "jasmineui"+(lastFrameId++);
    }

    function hideElement(id) {
        var element = document.getElementById(id);
        if (element) {
            element.style.display = 'none';
        }
    }

    function createFrameElementInBody(id) {
        var frameElement = document.createElement('iframe');
        frameElement.id = id;
        frameElement.name = id;
        frameElement.style.width = '100%';
        frameElement.style.height = '100%';
        var body = document.getElementsByTagName('body')[0];
        body.appendChild(frameElement);
    }

    window.testframe = function(reset) {
        if (reset) {
            // Note: Do NOT delete the old iframe,
            // as this leads to debugging problems the scripts
            // that are included by the iframe with firebug etc
            if (frameObject) {
                hideElement(frameObject.name);
            }
            var frameId = newFrameId();
            createFrameElementInBody(frameId);
            frameObject = window[frameId];
        }
        return frameObject;
    };

})(window);


/**
 * Container for functions that
 * return a function that returns false as long as
 * the waitsForAsync-function should wait.
 * <p>
 * Signature of those functions: fn(window, callTime) where callTime is either
 * "beforeContent" or "afterContent".
 */
jasmine.ui.wait = {};

(function(jasmine, window) {
    var finishedFunctions = {};

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

    jasmine.Spec.prototype.loadHtml = function(url, instrumentCallback, username, password) {
        finishedFunctions = {};
        var spec = this;
        var error = null;
        var ready = false;

        function initAsyncWait(callTime) {
            for (var fnname in jasmine.ui.wait) {
                var fn = jasmine.ui.wait[fnname];
                var callback = fn(testframe(), callTime);
                if (callback) {
                    finishedFunctions[fnname] = callback;
                }
            }
        }


        window.beforeFramecontent = function() {
            try {
                jasmine.ui.log('instrument before content');
                jasmine.ui.fixHashLinksForBaseTag(testframe());
                initAsyncWait("beforeContent");
            } catch (ex) {
                error = ex;
            }
        };

        window.afterFramecontent = function() {
            try {
                jasmine.ui.log('instrument after content');
                initAsyncWait("afterContent");
                // if we have an instrument function, use it...
                if (instrumentCallback) {
                    instrumentCallback(testframe());
                }
            } catch (ex) {
                error = ex;
            }
        };

        window.frameReady = function() {
            jasmine.ui.log("ready");
            ready = true;
        };


        jasmine.ui.log(url);

        var pageText, pageHead, pageBody;

        function loadPage(pageUrl) {
            var xmlhttp = new XMLHttpRequest();
            // TODO use an async XHR here!
            if (username) {
                jasmine.ui.log("Authentication: " + username + " " + password);
                xmlhttp.open("GET", pageUrl, false, username, password);
            } else {
                xmlhttp.open("GET", pageUrl, false);
            }
            xmlhttp.send();
            var status = xmlhttp.status;
            if (status != 200) {
                error = "Error during loading page " + pageUrl + ": " + xmlhttp.statusText;
            } else {
                pageText = xmlhttp.responseText;
            }
        }

        function parsePage() {
            var regex = /<head>((?:.|\n|\r)*)<\/head>[^<>]*(?:<body[^>]*>((?:.|\n|\r)*)<\/body>)?/i;
            var match = regex.exec(pageText);
            pageHead = match[1];
            pageBody = match[2];
        }

        function getBaseUrl(url) {
            // add the host and protocol if needed
            var protocolIndex = url.indexOf("://");
            if (protocolIndex == -1) {
                url = document.location.protocol + "//" + document.location.host + url;
            }
            return url;
        }

        function writeFrame() {
            var doc = testframe(true).document;
            doc.open();
            doc.write('<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">');
            doc.write('<html>');
            doc.write('<head>');
            doc.write('<base href="');
            doc.write(getBaseUrl(url));
            doc.write('">');
            doc.write('<script type="text/javascript">parent.beforeFramecontent();</script>');
            doc.write(pageHead);
            doc.write('</head><body>');
            doc.write(pageBody);
            doc.write('<script type="text/javascript">');
            doc.write('parent.afterFramecontent();');
            doc.write('if ( document.addEventListener ) {');
            doc.write('  window.addEventListener( "load", parent.frameReady, false );');
            doc.write('} else {');
            doc.write('  window.attachEvent( "onload", parent.frameReady );');
            doc.write('}');
            doc.write('</script>');
            doc.write('</body></html>');
            doc.close();
        }

        loadPage(url);
        if (!error) {
            parsePage();
            writeFrame();
        }
        this.waitsFor(function() {
            return ready || error;
        }, "Loading url " + url, 20000);
        this.runs(function() {
            if (error) {
                jasmine.ui.log("Error during loading url "+url+" "+error);
                throw error;
            } else {
                jasmine.ui.log("Successfully loaded url "+url);
            }
        });
        this.waitsForAsync();
    };


    jasmine.Spec.prototype.waitsForAsync = function(timeout) {
        if (!timeout) {
            timeout = 5000;
        }
        jasmine.ui.log("begin waiting for async");
        // Wait at least 50 ms. Needed e.g.
        // for animations, as the animation start event is
        // not fired directly after the animation css is added.
        // There may also be a gap between changing the location hash
        // and the hashchange event (almost none however...)
        this.waits(50);
        this.waitsFor(function() {
            var finished = true;
            for (var name in finishedFunctions) {
                if (!finishedFunctions[name]()) {
                    jasmine.ui.log("async waiting for "+name);
                    return false;
                }
            }
            jasmine.ui.log("end waiting for async");
            return true;
        }, "Waiting for end of async work", timeout);
    };
})(jasmine, window);

/*
 * Instrumentation of pages, so that the default action on
 * anchors with hashes work if a base tag is used on the page.
 * See here for details about the problem: http://www.ilikespam.com/jsf/using-base-href-with-anchors
 */
(function(jasmine) {
    jasmine.ui.fixHashLinksForBaseTag = function(window, baseUrl) {
        if (window.addEventListener) {
            // Add a capturing event listener
            window.document.addEventListener('click', function(event) {
                correctAnchorHref(event);
            }, true);
        }

        if (window.Element.prototype.attachEvent) {
            // IE does not support capturing event listeners...
            var oldAttachEvent = window.Element.prototype.attachEvent;
            window.Element.prototype.attachEvent = function(eventName, fn) {
                var wrappedFn = function(event) {
                    correctAnchorHref(event);
                    return fn.apply(this, arguments);
                };
                return oldAttachEvent.call(this, eventName, wrappedFn);
            }
            // Add at least one event listener at the document level
            window.document.attachEvent('onclick', function(event) {
                correctAnchorHref(event);
            });
        }

        function correctAnchorHref(event) {
            var element = event.target;
            if (!element) {
                // IE
                element = event.srcElement;
            }
            var anchor = findAnchorInParents(element);
            if (anchor) {
                mapHrefToDocumentLocation(anchor);
            }
        }

        function findAnchorInParents(element) {
            if (element == null) {
                return null;
            } else if (element.nodeName.toUpperCase() == 'A') {
                return element;
            } else {
                return findAnchorInParents(element.parentNode);
            }
        }

        function mapHrefToDocumentLocation(anchor) {
            var href = anchor.href;
            var hashPos = href.indexOf('#');
            if (hashPos != -1) {
                var path = href.substring(0, hashPos);
                if (path == baseUrl) {
                    var hash = href.substring(hashPos);
                    var loc = document.location;
                    var docPath = loc.protocol + "//" + loc.host + loc.pathname;
                    anchor.href = docPath + hash;
                }
            }
        }
    };
})(jasmine);


// -----------
// async wait plugins...

/**
 * Instruments the given window, and returns a function
 * that returns whether there are currently pending timeouts waiting.
 */
(function() {
    jasmine.ui.wait.instrumentTimeout = function(window, callTime) {
        if (callTime != 'beforeContent') {
            return null;
        }
        var timeouts = {};
        // Note: Do NOT use function.apply here,
        // as sometimes the timeout method
        // is also used with native objects!
        window.oldTimeout = window.setTimeout;
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
    jasmine.ui.wait.instrumentInterval = function(window, callTime) {
        if (callTime != 'beforeContent') {
            return null;
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
        return function() {
            var count = 0;
            for (var x in intervals) {
                count++;
            }
            return count == 0;
        };
    };
})();

/**
 * Instruments the XMLHttpRequest prototype, and returns a
 * function that returns whether there are currently pending ajax requests
 * waiting.
 */
(function(jasmine) {
    jasmine.ui.wait.instrumentXhr = function(window, callTime) {
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
                    if (name=='send') {
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
                if (self.origin.readyState==DONE) {
                    openCallCount--;
                }
                copyState();
                if (self.onreadystatechange) {
                    self.onreadystatechange.apply(self, arguments);
                }
            };
            copyState();
        };
        return function() {
            return openCallCount==0;
        }

    }


})(jasmine);

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

    /**
     * Listens for animation start and stop events.
     * Returns a function that returns whether there are currently pending
     * animations going on. If the function is not available, this returns null.
     * <p>
     * Note: The animationStart event is usually fired some time
     * after the animation was added to the css of an element (approx 50ms).
     * So be sure to always wait at least that time!
     */
    jasmine.ui.wait.instrumentAnimation = function(window, callTime) {
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
            jasmine.ui.log("Started animation "+animName);
        }, true);
        window.document.addEventListener('webkitAnimationEnd', function(event) {
            var animName = event.animationName;
            if (!ignoredAnimations[animName]) {
                animationCount--;
            }
            jasmine.ui.log("Stopped animation "+animName);
        }, true);
        return function() {
            var elements = [];
            for (var el in animationElements) {
                elements.push(el);
            }
            // remove hidden animation elements,


            return animationCount == 0;
        };
    };
})();

