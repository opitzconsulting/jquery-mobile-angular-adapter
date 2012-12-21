'use strict';

describe('ngmRouting', function () {
    describe('$location.routeOverride', function () {
        beforeEach(function () {
            module(function ($routeProvider) {
                $routeProvider.when('/someRoute', {
                    templateUrl:'someTemplateUrl',
                    jqmOptions: {
                        a: 1,
                        b: 2
                    }
                });
            });
        });

        it('should save the override on the $location object', inject(function ($location) {
            var someOverride = {};
            $location.routeOverride(someOverride);
            expect($location.routeOverride()).toBe(someOverride);
            expect($location.$$routeOverride).toBe(someOverride);
        }));

        it('should merge the jqmOptions', function () {
            inject(function ($location, $route, $rootScope) {
                $location.path('/someRoute');
                $location.routeOverride({
                    jqmOptions:{
                        b: 3
                    }
                });
                $rootScope.$digest();
                expect($route.current.jqmOptions).toEqual({
                    a:1, b:3
                });
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

    describe('navigation links', function () {
        describe('options for $.mobile.changePage from links', function () {
            it('data-rel, data-transition, data-reverse, link', function () {
                var c = testutils.compileInPage('<a href="http://server/someLink" data-rel="popup" data-transition="someTrans" data-direction="reverse"/>');
                c.element.click();
                var args = $.mobile.changePage.mostRecentCall.args[1];
                expect(args.role).toBe('popup');
                expect(args.link[0]).toBe(c.element[0]);
                expect(args.transition).toBe('someTrans');
                expect(args.reverse).toBe(true);
            });
            it('should use the transition from the route if no transition is specified in the link', function() {
                module(function($routeProvider) {
                    $routeProvider.when('/page1', {
                        templateUrl: 'somePage',
                        jqmOptions: {
                            transition: 'slide'
                        }
                    });
                });
                inject(function($location, $rootScope) {
                    var c = testutils.compileInPage('<a href="http://server/page1"/>');
                    c.element.click();
                    $rootScope.$apply();
                    var args = $.mobile.changePage.mostRecentCall.args[1];
                    expect(args.transition).toBe('slide');
                });
            });
            it('data-rel=back should go back in history and ignore the href', inject(function ($location, $rootScope) {
                var c = testutils.compileInPage('<a href="http://server/someLink" data-rel="back"/>');
                $location.path('/someLink');
                $rootScope.$apply();
                $location.path('/someLink2');
                $rootScope.$apply();

                var event = $.Event("click");
                c.element.trigger(event);
                jasmine.Clock.tick(11);

                expect(history.go).toHaveBeenCalledWith(-1);
                expect(event.isDefaultPrevented()).toBe(true);
                expect($location.url()).toBe('/someLink2');
            }));
            it('data-rel=back should go back in history with an empty href', inject(function ($location, $rootScope) {
                var c = testutils.compileInPage('<a href="" data-rel="back"/>');
                $location.path('/someLink');
                $rootScope.$apply();
                $location.path('/someLink2');
                $rootScope.$apply();

                var event = $.Event("click");
                c.element.trigger(event);
                jasmine.Clock.tick(1);
                expect(history.go).toHaveBeenCalledWith(-1);
                expect(event.isDefaultPrevented()).toBe(true);
                expect($location.url()).toBe('/someLink2');
            }));

            it('data-rel=external should execute the default url action', inject(function ($browser, $location) {
                var c = testutils.compileInPage('<a href="http://someOtherServer" data-rel="external"/>');
                var event = $.Event("click");
                c.element.trigger(event);
                expect(event.isDefaultPrevented()).toBe(false);
                expect(event.isPropagationStopped()).toBe(false);
            }));
        });
    });

    describe('misc', function () {
        it('should deactivate jqm hash listening and changing', function () {
            expect($.mobile.pushStateEnabled).toBe(false);
            expect($.mobile.hashListeningEnabled).toBe(false);
            expect($.mobile.linkBindingEnabled).toBe(false);
            expect($.mobile.origChangePage.defaults.changeHash).toBe(false);
        });

        // The reason for this spec is that the "navigate" event
        // closes popups immediately when we use normal hash navigation
        // (i.e. without html5 history replaceState)
        it('should not fire a "navigate" event on hash change', function () {
            var hashChanged = false,
                spy;
            runs(function () {
                spy = jasmine.createSpy();
                $(window).bind("hashchange", function () {
                    hashChanged = true;
                });
            });
            waits(100);
            runs(function () {
                $.mobile.pageContainer.one('navigate', spy);
                var oldHash = location.hash;
                location.hash = 'someNewHash';
                location.hash = oldHash;
            });
            waitsFor(function () {
                return hashChanged;
            });
            runs(function () {
                expect(spy).not.toHaveBeenCalled();
            });
        });

        it('should return the url without protocol for file urls when calling $browser.baseHref()', function () {
            inject(function ($browser) {
                $browser.initialBaseHref = 'file:///someUrl/somePage?a=b';
                expect($browser.baseHref()).toBe('/someUrl/somePage?a=b');
            });
        });

        it('should not change $browser.baseHref when the base tag changes', inject(function($browser) {
            var oldBaseHref = $browser.baseHref();
            $browser.$$baseHref = 'someOtherUrl';
            expect($browser.baseHref()).toBe(oldBaseHref);
        }));
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

                $routeProvider.when('/', {templateUrl:'someTemplate'});
                $routeProvider.when('/', {redirectTo:'someRedirect'});
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
        it('should eval the onActivate expresion on the current route on pagebeforeshow event using $route.current.locals as extra variables', inject(function ($route) {
            var c = testutils.compileInPage('<div></div>');
            var page = c.page;
            var currentRoute = $route.current;
            currentRoute.onActivate = 'someFn(a)';
            currentRoute.locals = {a:'b'};
            var scope = page.scope();
            scope.someFn = jasmine.createSpy('someFn');
            page.trigger('pagebeforeshow');
            expect(scope.someFn).toHaveBeenCalledWith(currentRoute.locals.a);
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