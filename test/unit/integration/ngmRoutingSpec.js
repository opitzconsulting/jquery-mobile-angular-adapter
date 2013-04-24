describe('ngmRouting', function () {
    beforeEach(function() {
        jasmine.Clock.useMock();
    });
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
                    a:1, b:3, navByNg: true
                });
            });
        });

        it('should never modify the original jqmOptions of the route', function() {
            var options = {};
            module(function($routeProvider) {
                $routeProvider.when('/path1', {
                    jqmOptions: options,
                    templateUrl: '/path1'
                });
            });
            inject(function($location, $rootScope) {
                $location.routeOverride({
                    jqmOptions: {
                        transition: 'slide'
                    }
                });
                $location.path('/path1');
                $rootScope.$apply();
                expect(options.transition).toBeUndefined();
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
            it('data-transition, data-reverse, link', function () {
                var c = testutils.compileInPage('<a href="http://server/someLink" data-transition="someTrans" data-direction="reverse"/>');
                c.element.click();
                var args = $.mobile.changePage.mostRecentCall.args[1];
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
                jasmine.Clock.tick(50);

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
                jasmine.Clock.tick(50);
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
            it('data-ajax=false should execute the default url action', inject(function ($browser, $location) {
                var c = testutils.compileInPage('<a href="http://server/someLink" data-ajax="false"/>');
                var event = $.Event("click");
                c.element.trigger(event);
                expect(event.isDefaultPrevented()).toBe(false);
                expect(event.isPropagationStopped()).toBe(false);
            }));
            it('should remove the base folder of absolute links and add it back in calls to $.mobile.changePage', function() {
                module(function($provide) {
                    $provide.decorator('$browser', function($delegate) {
                        $delegate.$$baseHref = '/someBaseFolder/someBaseFile.html';
                        $delegate.$$url = 'http://server'+$delegate.$$baseHref;
                        return $delegate;
                    });
                });
                inject(function($browser) {
                    var c = testutils.compileInPage('<a href="http://server/someBaseFolder/someFolder/page.html"/>');
                    c.element.click();
                    var mostRecentCall = $.mobile.changePage.mostRecentCall;
                    expect(mostRecentCall.args[0]).toBe('/someBaseFolder/someFolder/page.html');
                });
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

        it('should upper bound $.mobile.urlHistory to 3 entries', function() {
            var hist = $.mobile.urlHistory;
            hist.add("url1");
            hist.add("url2");
            hist.add("url3");
            hist.add("url4");
            expect(hist.stack.length).toBe(3);
            expect(hist.stack[2].url).toBe('url4');
            expect(hist.activeIndex).toBe(2);
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
        it('should eval the onActivate expresion on the current route on pagebeforeshow event using $route.current.locals and $routeParams as extra variables', inject(function ($route, $routeParams) {
            var c = testutils.compileInPage('<div></div>');
            var page = c.page;
            var currentRoute = $route.current;
            currentRoute.onActivate = 'someFn(a, c)';
            currentRoute.locals = {a:'b'};
            $routeParams.c = 'd';
            var scope = page.scope();
            scope.someFn = jasmine.createSpy('someFn');
            page.trigger("pagebeforechange", {toPage: page, options: {navByNg: true}});
            page.trigger('pagebeforeshow');
            expect(scope.someFn).toHaveBeenCalledWith('b', 'd');
        }));
        it('should not eval the onActivate expression on the current route on pagebeforeshow if the navigation was not done by angular', inject(function ($route, $routeParams) {
            var c = testutils.compileInPage('<div></div>');
            var page = c.page;
            var currentRoute = $route.current;
            currentRoute.onActivate = 'someFn(a, c)';
            var scope = page.scope();
            scope.someFn = jasmine.createSpy('someFn');
            page.trigger("pagebeforechange", {toPage: page, options: {}});
            page.trigger('pagebeforeshow');
            expect(scope.someFn).not.toHaveBeenCalled();
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

        it('should ignore route redirects', function() {
            module(function ($routeProvider) {
                $routeProvider.when('/test', {redirectTo:'/page1', templateUrl:'/someNonExistentPage'});
            });
            inject(function ($route, $location, $rootScope, $http) {
                $location.path("/test");
                $rootScope.$apply();
                expect($.mobile.changePage.callCount).toBe(1);
                expect($.mobile.changePage).toHaveBeenCalledWith('/page1', {navByNg : true});
            });

        });

        it('should allow absolute template urls', function() {
            module(function ($routeProvider) {
                $routeProvider.when('/test', {templateUrl:'/somePage'});
            });
            inject(function ($route, $location, $rootScope, $http, $browser) {
                $browser.$$baseHref = '/someBaseFolder/someBasePage.html';
                $location.path("/test");
                $rootScope.$apply();
                expect($.mobile.changePage.callCount).toBe(1);
                expect($.mobile.changePage).toHaveBeenCalledWith('/somePage', {navByNg : true});
            });
        });

        describe('resolve urls using the base tag', function() {
            function execTest(navUrl, expectedChangePageUrl) {
                inject(function($browser, $location, $rootScope) {
                    $browser.$$baseHref = '/someBaseFolder/someBasePage.html';
                    $location.url(navUrl);
                    $rootScope.$apply();
                    expect($.mobile.changePage).toHaveBeenCalledWith(expectedChangePageUrl, { navByNg : true });
                });
            }

            it('should add the folder of the base path to absolute urls', function() {
                execTest('/somePath#someHash', '/someBaseFolder/somePath#someHash');
            });
            it('should add the folder of the base path for relative urls', function() {
                execTest('somePath', '/someBaseFolder/somePath');
            });
            it('should use the base page for hash only urls', function() {
                execTest('#someHash', '/someBaseFolder/someBasePage.html#someHash');
            });
            it('should use the base page for empty urls', function() {
                execTest('/', '/someBaseFolder/someBasePage.html');
            });
        });

        it('should forward the jqmOptions to $.mobile.changePage', inject(function ($location, $rootScope, $browser) {
            var someOptions = {a:1};
            $location.path('/somePath');
            $location.routeOverride({
                jqmOptions:someOptions
            });
            $rootScope.$apply();
            $.extend(someOptions, {navByNg: true});
            expect($.mobile.changePage).toHaveBeenCalledWith(getBasePath($browser.baseHref()) + '/somePath', someOptions);
        }));

        it('should save the jqmOptions into the history if the url change was not a browser navigation', inject(function($location, $history, $rootScope) {
            var someOptions = {transition: 'slide'};
            $location.routeOverride({jqmOptions: someOptions});
            $rootScope.$apply();
            $.extend(someOptions, {navByNg: true});
            expect($history.urlStack[0].jqmOptions).toEqual(someOptions);
        }));

        it('should take the transition from the last history and set the reverse flag if navigating back', inject(function($rootScope, $location, $browser, $history) {
            var someOptions = {transition: 'slide'};
            $location.path('/path1');
            $rootScope.$apply();
            $location.path('/path2');
            $location.routeOverride({jqmOptions: someOptions});
            $rootScope.$apply();
            $.mobile.changePage.reset();
            $browser.$$url = testutils.browserUrl('http://server','/path1');
            $browser.poll();
            expect($.mobile.changePage).toHaveBeenCalledWith('/path1', { transition : 'slide', reverse: true, navByNg : true });
        }));

        it('should take the transition from the current history and not the reverse flag if navigating forward', inject(function($rootScope, $location, $browser, $history) {
            var someOptions = {transition: 'slide'};
            $location.path('/path1');
            $rootScope.$apply();
            $location.path('/path2');
            $location.routeOverride({jqmOptions: someOptions});
            $rootScope.$apply();
            $browser.$$url = testutils.browserUrl('http://server','/path1');
            $browser.poll();
            $.mobile.changePage.reset();
            $browser.$$url = testutils.browserUrl('http://server','/path2');
            $browser.poll();
            expect($.mobile.changePage).toHaveBeenCalledWith('/path2', { transition : 'slide', navByNg : true });
        }));

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
                expect($.mobile.changePage).toHaveBeenCalledWith('/someUrl', {navByNg : true});
            });
        });
    });
});