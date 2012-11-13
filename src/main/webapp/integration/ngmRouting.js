/**
 * This combines the routing of angular and jquery mobile. In detail, it deactivates the routing in jqm
 * and reuses that of angular.
 */
(function (angular, $) {
    var mod = angular.module("ng");

    function registerBrowserDecorator($provide) {
        $provide.decorator('$browser', ['$delegate', function ($browser) {
            $browser.inHashChange = 0;
            var _onUrlChange = $browser.onUrlChange;
            $browser.onUrlChange = function (callback) {
                var proxy = function () {
                    $browser.inHashChange++;
                    try {
                        return callback.apply(this, arguments);
                    } finally {
                        $browser.inHashChange--;
                    }
                };
                _onUrlChange.call(this, proxy);
            };
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
            $.mobile.base.set = function () {};
        }
    }

    disableJqmHashChange();

    var originalPath = location.pathname;
    var originalBasePath = getBasePath(originalPath);

    function getBasePath(path) {
        return path.substr(0, path.lastIndexOf('/'));
    }

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
            createNgmRouting(params);
            return _when.apply(this, arguments);
        };

        $routeProvider.otherwise({
            templateUrl:DEFAULT_JQM_PAGE
        });
    }]);

    function createNgmRouting(routeParams) {
        if (!routeParams.templateUrl) {
            throw new Error("Only routes with templateUrl are allowed!");
        }
        if (routeParams.controller) {
            throw new Error("Controllers are not allowed on routes. However, you may use the onActivate parameter");
        }
    }

    mod.run(['$route', '$rootScope', '$location', '$browser', function ($route, $rootScope, $location, $browser) {
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

            function getDefaultJqmPageUrl() {
                var hash = $location.hash();
                if (hash) {
                    return "#" + hash;
                } else {
                    var path = $location.path();
                    if (path) {
                        path = originalBasePath + path;
                        return path;
                    }
                }
                return originalPath;
            }

            var url = newRoute.ngmTemplateUrl;
            if (url === DEFAULT_JQM_PAGE) {
                url = getDefaultJqmPageUrl();
            }
            var navConfig = {};
            if ($browser.inHashChange) {
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

})(angular, $);