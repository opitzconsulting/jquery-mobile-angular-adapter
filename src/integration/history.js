(function ($, angular) {

    var mod = angular.module("ng");

    $.mobile._registerBrowserDecorators = $.mobile._registerBrowserDecorators || [];
    $.mobile._registerBrowserDecorators.push(registerBrowserDecorator);

    mod.config(['$provide', function ($provide) {
        registerBrowserDecorator($provide);
    }]);
    mod.factory('$history', $historyFactory);

    return;

    // ---------------
    // implementation functions

    function registerBrowserDecorator($provide) {
        $provide.decorator('$browser', ['$delegate', browserHashReplaceDecorator]);
        $provide.decorator('$browser', ['$delegate', allowFileUrlsInBaseHref]);
        $provide.decorator('$browser', ['$delegate', '$history', '$rootScope', '$injector', browserHistoryDecorator]);
        $provide.decorator('$location', ['$delegate', '$history', locationBackDecorator]);

        function locationBackDecorator($location, $history) {
            $location.back = function () {
                $location.$$replace = "back";
                return this;
            };
            return $location;
        }

        function allowFileUrlsInBaseHref($browser) {
            var _baseHref = $browser.baseHref;
            $browser.baseHref = function () {
                // Patch for baseHref to return the correct path also for file-urls.
                // See bug https://github.com/angular/angular.js/issues/1690
                var href = _baseHref.call(this);
                return href ? href.replace(/^file?\:\/\/[^\/]*/, '') : href;
            };
            return $browser;
        }

        function browserHashReplaceDecorator($browser) {
            var _url = $browser.url;
            $browser.url = function() {
                var res = _url.apply(this, arguments);
                if (arguments.length===0) {
                    res = res.replace(/%23/g,'#');
                    res = res.replace(/ /g,'%20');
                }
                return res;
            };
            return $browser;
        }

        function browserHistoryDecorator($browser, $history, $rootScope, $injector) {
            var _url = $browser.url,
                _onUrlChange = $browser.onUrlChange,
                _stopOnUrlChangeListeners;
            var cachedRouteOverride = null;

            _onUrlChange.call($browser, function(newUrl) {
                if (cachedRouteOverride) {
                    var $location = $injector.get('$location');
                    $location.routeOverride(cachedRouteOverride);
                }
                $history.onUrlChangeBrowser(newUrl);
                if (_stopOnUrlChangeListeners) {
                    _stopOnUrlChangeListeners.apply(this, arguments);
                }
            });
            $browser.onUrlChange = function(cb) {
                _onUrlChange.call(this, function() {
                    if (!_stopOnUrlChangeListeners) {
                        cb.apply(this, arguments);
                    }
                });
            };

            $browser.stopOnUrlChangeListeners = function(replaceCallack) {
                _stopOnUrlChangeListeners = replaceCallack;
            };

            $history.removePastEntries = function(number) {
                var current = $history.urlStack[$history.activeIndex],
                    replacedIndex = $history.activeIndex-number,
                    replaced = $history.urlStack[replacedIndex];
                if (current.url !== replaced.url) {
                    $browser.stopOnUrlChangeListeners(function() {
                        if (current) {
                            $browser.url(current.url, true);
                            $history.urlStack[replacedIndex] = current;
                            current = null;
                        } else {
                            $browser.stopOnUrlChangeListeners(null);
                        }
                    });
                } else {
                    // Attention: angular does not call
                    // onUrlChanged listeners if we are going back 
                    // in history to the same url where we already are.
                    // Therefore we cannot use $browser.stopOnUrlChangeListeners
                    // in this case!
                    // Note: angular-mocks does not simulate this correctly :-(
                    $history.urlStack[replacedIndex] = current;
                }
                $history.go(-number);
            };


            $browser.url = function (url, replace) {
                if (url) {
                    // setter
                    var res = _url.call(this, url, replace === true);
                    $history.onUrlChangeProgrammatically(url, replace === true, replace==='back');
                    return res;
                } else {
                    // getter
                    return _url.apply(this, arguments);
                }
            };
            return $browser;
        }
    }

    function $historyFactory() {
        var $history;
        return $history = {
            go:go,
            goBack:goBack,
            urlStack:[],
            indexOf: indexOf,
            activeIndex:-1,
            fromUrlChange:false,
            onUrlChangeProgrammatically:onUrlChangeProgrammatically,
            onUrlChangeBrowser:onUrlChangeBrowser
        };

        function go(relativeIndex) {
            // Always execute history.go asynchronously.
            // This is required as firefox and IE10 trigger the popstate event
            // in sync. By using a setTimeout we have the same behaviour everywhere.
            // Don't use $defer here as we don't want to trigger another digest cycle.
            // Note that we need at least 20ms to ensure that
            // the hashchange/popstate event for the current page
            // as been delivered (in IE this can take some time...).
            window.setTimeout(function() {
                window.history.go(relativeIndex);
            },20);
        }

        function goBack() {
            $history.go(-1);
        }

        function indexOf(url) {
            var i,
                urlStack = $history.urlStack;
            for (i=0; i<urlStack.length; i++) {
                if (urlStack[i].url===url) {
                    return i;
                }
            }
            return -1;
        }

        function findInPast(url) {
            var index = $history.activeIndex-1;
            while (index >= 0 && $history.urlStack[index].url !== url) {
                index--;
            }
            return index;
        }

        function onUrlChangeBrowser(url) {
            var oldIndex = $history.activeIndex;
            $history.activeIndex = indexOf(url);
            if ($history.activeIndex === -1) {
                onUrlChangeProgrammatically(url, false);
            } else {
                $history.lastIndexFromUrlChange = oldIndex;
            }
        }

        function onUrlChangeProgrammatically(url, replace, back) {
            var currentEntry = $history.urlStack[$history.activeIndex];
            if (!currentEntry || currentEntry.url !== url) {
                $history.lastIndexFromUrlChange = -1;
                if (!replace) {
                    $history.activeIndex++;
                }
                $history.urlStack.splice($history.activeIndex, $history.urlStack.length - $history.activeIndex);
                $history.urlStack.push({url: url});
            }
            if (back) {
                var currIndex = $history.activeIndex;
                var newIndex = findInPast(url);
                if (newIndex !== -1 && currIndex !== -1) {
                    $history.removePastEntries(currIndex - newIndex);
                }
            }
        }
    }
})(window.jQuery, window.angular);