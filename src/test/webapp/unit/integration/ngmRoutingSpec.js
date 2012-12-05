'use strict';

describe('ngmRouting', function () {
    describe('$location.routeOverride', function () {
        beforeEach(function () {
            module(function ($routeProvider) {
                $routeProvider.when('/someRoute', {
                    templateUrl:'someTemplateUrl'
                });
            });
        });

        it('should save the override on the $location object', inject(function ($location) {
            var someOverride = {};
            $location.routeOverride(someOverride);
            expect($location.$$routeOverride).toBe(someOverride);
        }));

        it('should override the urlTemplate and save it into the ngmTemplateUrl route property', function () {
            inject(function ($location, $route, $rootScope) {
                var overriddenValue = 'someTemplate2';
                $location.path('/someRoute');
                $location.routeOverride({
                    templateUrl:overriddenValue
                });
                $rootScope.$digest();
                expect($route.current.ngmTemplateUrl).toBe(overriddenValue);
            });
        });

        it('should override the jqmOptions', function () {
            inject(function ($location, $route, $rootScope) {
                var overriddenValue = {};
                $location.path('/someRoute');
                $location.routeOverride({
                    jqmOptions:overriddenValue
                });
                $rootScope.$digest();
                expect($route.current.jqmOptions).toBe(overriddenValue);
            });
        });

        it('should override the onActivate property', function () {
            inject(function ($location, $route, $rootScope) {
                var overriddenValue = 'someActivateFn';
                $location.path('/someRoute');
                $location.routeOverride({
                    onActivate:overriddenValue
                });
                $rootScope.$digest();
                expect($route.current.onActivate).toBe(overriddenValue);
            });
        });

        it('should override the locals', function () {
            inject(function ($location, $route, $rootScope) {
                var overriddenValue = {
                    key1:'value1'
                };
                $location.path('/someRoute');
                $location.routeOverride({
                    locals:overriddenValue
                });
                $rootScope.$digest();
                expect($route.current.locals).toEqual(overriddenValue);
            });
        });
    });

    describe('misc', function () {
        it('should deactivate jqm hash listening and changing', function () {
            expect($.mobile.pushStateEnabled).toBe(false);
            expect($.mobile.hashListeningEnabled).toBe(false);
            expect($.mobile.linkBindingEnabled).toBe(false);
            expect($.mobile.origChangePage.defaults.changeHash).toBe(false);
        });

        it('should not change the base tag during jqm navigation, as angular does not like this (see following bug test)', inject(function ($browser, $location) {
            expect($.support.dynamicBaseTag).toBe(false);
            var oldHref = $.mobile.base.element.attr("href");
            $.mobile.base.set("somePage");
            expect($.mobile.base.element.attr("href")).toBe(oldHref);
        }));

        it('should still contain the angular bug: changing the $location.path in a click function of an anchor when the base tag is different to the document location results in a wrong location', inject(function ($browser, $location) {
            var initUrl = $browser.$$url;

            var c = testutils.compileInPage('<a href="someRef" ng-click="click()">Link</a>');

            var base = $("base");
            var oldBase = base.attr("href");
            base.attr('href', initUrl + 'test.html');

            var link = c.element;
            var scope = link.scope();
            scope.click = function () {
                $location.path("/someLink");
            };
            link.click();
            // This is the bug: This should really be equal if everything would work as it should be!
            expect($location.path()).not.toEqual("/someLink");

            base.attr('href', oldBase);
        }));

        it('should return the url without the search when calling $browser.baseHref()', function () {
            inject(function ($browser) {
                $browser.$$baseHref = 'http://someUrl/somePage?a=b';
                expect($browser.baseHref()).toBe('http://someUrl/somePage');
                expect($browser.origBaseHref()).toBe($browser.$$baseHref);

                $browser.$$baseHref = 'http://someUrl/somePage';
                expect($browser.baseHref()).toBe('http://someUrl/somePage');
                expect($browser.origBaseHref()).toBe($browser.$$baseHref);
            });
        });

    });

    describe('not supported angular routing features', function () {
        it('should not allow ngView', function () {
            try {
                testutils.compileInPage('<div ng-view></div>');
                throw new Error("expected an error");
            } catch (e) {
                expect(e.message).toBe('ngView is not allowed and not needed with the jqm adapter.');
            }
        });
        it('should not support routes without a templateUrl or redirectTo', function () {
            var errMsg = 'Only routes with templateUrl or redirectTo are allowed with the jqm adapter!';
            module(function ($routeProvider) {
                try {
                    $routeProvider.when('/', {});
                    throw new Error("expected an error");
                } catch (e) {
                    expect(e.message).toBe(errMsg);
                }
                try {
                    $routeProvider.otherwise({});
                    throw new Error("expected an error");
                } catch (e) {
                    expect(e.message).toBe(errMsg);
                }
                // OK cases:

                $routeProvider.when('/', {templateUrl: 'someTemplate'});
                $routeProvider.when('/', {redirectTo: 'someRedirect'});
            });
            // Kick off routing.
            inject(function ($route) {

            });
        });
        it('should not support routes with a controller', function () {
            var errMsg = 'Controllers are not allowed on routes with the jqm adapter. However, you may use the onActivate parameter';
            module(function ($routeProvider) {
                try {
                    $routeProvider.when('/', {
                        templateUrl:'a',
                        controller:true
                    });
                    throw new Error("expected an error");
                } catch (e) {
                    expect(e.message).toBe(errMsg);
                }
                try {
                    $routeProvider.otherwise({
                        templateUrl:'a',
                        controller:true
                    });
                    throw new Error("expected an error");
                } catch (e) {
                    expect(e.message).toBe(errMsg);
                }
            });
            // Kick off routing.
            inject(function ($route) {

            });
        });

    });

    describe('onActivate', function () {
        it('should call the onActivate function on the current route on pagebeforeshow event', inject(function ($route) {
            var c = testutils.compileInPage('<div></div>');
            var page = c.page;
            var currentRoute = $route.current;
            currentRoute.onActivate = 'someFn';
            currentRoute.locals = {a:'b'};
            var scope = page.scope();
            scope.someFn = jasmine.createSpy('someFn');
            page.trigger('pagebeforeshow');
            expect(scope.someFn).toHaveBeenCalledWith(currentRoute.locals);
        }));
    });

    describe('route listening', function () {
        function getBasePath(path) {
            return path.substr(0, path.lastIndexOf('/'));
        }

        it('should mark the default route', inject(function ($location, $route, $rootScope) {
            $location.path('/somePath');
            $rootScope.$apply();
            expect($route.current.ngmTemplateUrl).toBe('DEFAULT_JQM_PAGE');
        }));

        it('should calculate the default page url using $browser.baseHref and $location.url', inject(function ($location, $rootScope, $browser) {
            $browser.$$baseHref = 'http://server/somePage.html';

            $location.path('/somePath');
            $location.hash('someHash');
            $rootScope.$apply();
            expect($.mobile.changePage).toHaveBeenCalledWith(getBasePath($browser.baseHref()) + '/somePath#someHash', { });

            $.mobile.changePage.reset();
            // Note: In hashbang-mode, we initially have an empty path. However,
            // this cannot be set my the application, as the $location.path()-setter always
            // adds a leading slash. This is why we are using $$path here directly.
            $location.$$path = '';
            expect($location.path()).toBe('');
            $location.hash('someHash');
            $rootScope.$apply();
            expect($.mobile.changePage).toHaveBeenCalledWith($browser.baseHref() + '#someHash', { });
        }));

        it('should forward the jqmOptions to $.mobile.changePage', inject(function ($location, $rootScope, $browser) {
            var someOptions = {a:1};
            $location.path('/somePath');
            $location.routeOverride({
                jqmOptions:someOptions
            });
            $rootScope.$apply();
            expect($.mobile.changePage).toHaveBeenCalledWith(getBasePath($browser.baseHref()) + '/somePath', someOptions);
        }));

        it('should set the fromHashChange flag in $.mobile.changePage if the change was due to a hash change', function () {
            inject(function ($browser, $rootScope, $location) {
                $browser.url("http://someServer/someUrl");
                $browser.poll();
                expect($.mobile.changePage).toHaveBeenCalledWith('/someUrl', {fromHashChange:true});
            });
        });

        it('should not set the fromHashChange flag in $.mobile.changePage if the change was not due to a hash change', function () {
            inject(function ($browser, $rootScope, $location) {
                $location.path("/someUrl");
                $rootScope.$apply();
                expect($.mobile.changePage).toHaveBeenCalledWith('/someUrl', {});
            });
        });

        it('should not call $http when using a route with templateUrl', function () {
            module(function ($routeProvider, $provide) {
                $routeProvider.when('/test', {templateUrl:'someUrl'});
                $provide.decorator('$http', ['$delegate', function ($http) {
                    return jasmine.createSpy("$http");
                }]);
            });
            inject(function ($route, $location, $rootScope, $http) {
                $location.path("/test");
                $rootScope.$apply();
                expect($http).not.toHaveBeenCalled();
                expect($.mobile.changePage).toHaveBeenCalledWith('someUrl', {});
            });
        });
    });
});