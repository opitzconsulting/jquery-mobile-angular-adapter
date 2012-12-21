(function ($, angular) {

    var mod = angular.module("ng");

    function registerBrowserDecorator($provide) {
        $provide.decorator('$rootScope', ['$delegate', rootScopeSuppressEventInDigestCycleDecorator]);
        $provide.decorator('$location', ['$delegate', '$history', locationBackDecorator]);
        $provide.decorator('$browser', ['$delegate', '$history', '$rootScope', '$injector', browserHistoryDecorator]);


        function rootScopeSuppressEventInDigestCycleDecorator($rootScope) {
            var suppressedEvents = {};
            $rootScope.suppressEventInDigestCycle = function (eventName) {
                suppressedEvents[eventName] = true;
            };
            var _$broadcast = $rootScope.$broadcast;
            $rootScope.$broadcast = function (eventName) {
                if (suppressedEvents[eventName]) {
                    return {};
                }
                return _$broadcast.apply(this, arguments);
            };
            var _$digest = $rootScope.$digest;
            $rootScope.$digest = function () {
                var res = _$digest.apply(this, arguments);
                suppressedEvents = {};
                return res;
            };
            return $rootScope;
        }

        function locationBackDecorator($location, $history) {
            $location.backMode = function () {
                $location.$$replace = "back";
                return this;
            };
            $location.goBack = function () {
                if ($history.activeIndex <= 0) {
                    throw new Error("There is no page in the history to go back to!");
                }
                this.$$parse($history.urlStack[$history.activeIndex - 1]);
                this.backMode();
                return this;
            };
            return $location;
        }

        function browserHistoryDecorator($browser, $history, $rootScope, $injector) {
            var _url = $browser.url;
            var cachedRouteOverride = null;
            $browser.url = function (url, replace) {
                if (url) {
                    // setter
                    var res = $history.onUrlChangeProgrammatically(url, replace === true, replace === 'back');
                    if (res === false) {
                        // cancel navigation and rely on the callback
                        // from browser history.
                        var $location = $injector.get('$location');
                        cachedRouteOverride = $location.routeOverride();
                        $location.$$parse(_url.call(this));
                        // suppress $locationChangeSuccess and $locationChangeStart event in this eval loop,
                        // so the routes don't get updated!
                        $rootScope.suppressEventInDigestCycle('$locationChangeStart');
                        $rootScope.suppressEventInDigestCycle('$locationChangeSuccess');
                        return;
                    }
                }
                return _url.apply(this, arguments);
            };
            var _onUrlChange = $browser.onUrlChange;
            $browser.onUrlChange(function (newUrl) {
                if (cachedRouteOverride) {
                    var $location = $injector.get('$location');
                    $location.routeOverride(cachedRouteOverride);
                }
                $history.onUrlChangeBrowser(newUrl);
            });
            return $browser;
        }
    }

    $.mobile._registerBrowserDecorators = $.mobile._registerBrowserDecorators || [];
    $.mobile._registerBrowserDecorators.push(registerBrowserDecorator);

    mod.config(['$provide', function ($provide) {
        registerBrowserDecorator($provide);
    }]);

    mod.factory('$history', [function ($timeout) {
        var $history;

        function go(relativeIndex) {
            // Always execute history.go asynchronously.
            // This is required as firefox and IE10 trigger the popstate event
            // in sync, which would result in problems, as
            // in backMode we stop the normal navigation by stopping the $locationChangeSuccess event.
            // However, if we would trigger a popstate event here in sync,
            // the $locationChangeSuccess event from the poped state event would also be swallowed!
            // We have a ui test for this (see ngmRoutingUiSpec#$location.back).
            window.setTimeout(function() {
                window.history.go(relativeIndex);
            },0);
        }

        function onUrlChangeBrowser(url) {
            $history.activeIndex = $history.urlStack.indexOf(url);
            if ($history.activeIndex === -1) {
                onUrlChangeProgrammatically(url, false);
            } else {
                $history.fromUrlChange = true;
            }
        }

        function onUrlChangeProgrammatically(url, replace, back) {
            if (back) {
                var currIndex = $history.activeIndex;
                var newIndex;
                for (newIndex = currIndex - 1; newIndex >= 0 && $history.urlStack[newIndex] !== url; newIndex--);
                if (newIndex !== -1 && currIndex !== -1) {
                    $history.go(newIndex - currIndex);
                    // stop the normal navigation!
                    return false;
                }
            }
            if ($history.urlStack[$history.activeIndex] === url) {
                return;
            }
            $history.fromUrlChange = false;
            if (!replace) {
                $history.activeIndex++;
            }
            $history.urlStack.splice($history.activeIndex, $history.urlStack.length - $history.activeIndex);
            $history.urlStack.push(url);
        }

        return $history = {
            go:go,
            urlStack:[],
            activeIndex:-1,
            fromUrlChange:false,
            onUrlChangeProgrammatically:onUrlChangeProgrammatically,
            onUrlChangeBrowser:onUrlChangeBrowser
        };
    }]);
})(window.jQuery, window.angular);