/**
 * This combines the routing of angular and jquery mobile. In detail, it deactivates the routing in jqm
 * and reuses that of angular.
 */
(function (angular, $) {
    var mod = angular.module("ng");

    function registerBrowserDecorator($provide) {
        $provide.decorator('$browser', ['$delegate', '$history', function ($browser, $history) {
            $browser.origBaseHref = $browser.baseHref;
            $browser.baseHref = function () {
                var result = $browser.origBaseHref.apply(this, arguments);
                return result.replace(/\?[^#]*/, "");
            };
            var _url = $browser.url;
            $browser.url = function (url, replace) {
                var back = replace === 'back';
                if (back) {
                    replace = false;
                }
                var res = _url.call(this, replace);
                if (url) {
                    // setter
                    $history.onUrlChangeProgrammatically(url, replace, back);
                }
                return _url.apply(this, arguments);
            };
            $browser.onUrlChange(function (newUrl) {
                $history.onUrlChangeBrowser(newUrl);
            });
            return $browser;
        }]);


        $provide.decorator('$location', ['$delegate', function ($location) {
            $location.routeOverride = function (routeOverride) {
                $location.$$routeOverride = routeOverride;
                return this;
            };
            return $location;
        }]);
    }

    $.mobile._registerBrowserDecorator = registerBrowserDecorator;
    mod.config(['$provide', function ($provide) {
        registerBrowserDecorator($provide);
    }]);


    // This needs to be outside of a angular config callback, as jqm reads this during initialization.
    function disableJqmHashChange() {
        $.mobile.pushStateEnabled = false;
        $.mobile.hashListeningEnabled = false;
        $.mobile.linkBindingEnabled = false;
        $.mobile.changePage.defaults.changeHash = false;
        if ($.support.dynamicBaseTag) {
            $.support.dynamicBaseTag = false;
            $.mobile.base.set = function () {
            };
        }
    }

    disableJqmHashChange();

    // html5 mode is always required, so we are able to allow links like
    // <a href="somePage.html"> to load external pages.
    mod.config(['$locationProvider', function ($locationProvider) {
        $locationProvider.html5Mode(true);
    }]);

    mod.directive('ngView', function () {
        throw new Error("ngView is not allowed and not needed with the jqm adapter.");
    });

    var DEFAULT_JQM_PAGE = 'DEFAULT_JQM_PAGE';

    mod.config(['$routeProvider', function ($routeProvider) {
        var _when = $routeProvider.when;
        $routeProvider.when = function (path, params) {
            if (!params.templateUrl && !params.redirectTo) {
                throw new Error("Only routes with templateUrl or redirectTo are allowed with the jqm adapter!");
            }
            if (params.controller) {
                throw new Error("Controllers are not allowed on routes with the jqm adapter. However, you may use the onActivate parameter");
            }
            return _when.apply(this, arguments);
        };

        $routeProvider.otherwise({
            templateUrl:DEFAULT_JQM_PAGE
        });
    }]);

    function getBasePath(path) {
        return path.substr(0, path.lastIndexOf('/'));
    }

    mod.run(['$route', '$rootScope', '$location', '$browser', '$history', function ($route, $rootScope, $location, $browser, $history) {
        var routeOverrideCopyProps = ['templateUrl', 'jqmOptions', 'onActivate'];
        $rootScope.$on('$routeChangeStart', function (event, newRoute) {
            var routeOverride = $location.$$routeOverride;
            delete $location.$$routeOverride;
            if (routeOverride) {
                angular.forEach(routeOverrideCopyProps, function (propName) {
                    if (routeOverride[propName]) {
                        newRoute[propName] = routeOverride[propName];
                    }
                });

                newRoute.resolve = newRoute.resolve || {};
                angular.forEach(routeOverride.locals, function (value, key) {
                    newRoute.resolve[key] = function () {
                        return value;
                    };
                });
            }

            // Prevent angular from loading the template, as jquery mobile already does this!
            newRoute.ngmTemplateUrl = newRoute.templateUrl;
            newRoute.templateUrl = undefined;
        });

        $rootScope.$on('jqmPagebeforeshow', function (event) {
            var current = $route.current;
            if (current && current.onActivate) {
                event.targetScope[current.onActivate].call(event.targetScope, current.locals);
            }
        });

        $rootScope.$on('$routeChangeSuccess', function () {
            var newRoute = $route.current;
            var $document = $(document);

            var url = newRoute.ngmTemplateUrl;
            if (url === DEFAULT_JQM_PAGE) {
                var url = $location.url();
                if (url.indexOf('/') === -1) {
                    url = $browser.origBaseHref() + url;
                } else {
                    url = getBasePath($browser.baseHref()) + url;
                }
            }
            if (!url) {
                return;
            }
            var navConfig = {};
            if ($history.fromUrlChange) {
                navConfig.fromHashChange = true;
            }

            if (newRoute.jqmOptions) {
                angular.extend(navConfig, newRoute.jqmOptions);
            }

            if (!$.mobile.pageContainer) {
                $rootScope.$on("jqmInit", startNavigation);
            } else {
                startNavigation();
            }

            function startNavigation() {
                $.mobile.changePage(url, navConfig);
            }
        });
    }]);

    mod.directive('a', function() {
        return {
            restrict: 'E',
            compile: function(element, attr) {
                if (element.attr('href')==='#') {
                    attr.$set('href', '');
                }
            }
        };
    });

})(angular, $);