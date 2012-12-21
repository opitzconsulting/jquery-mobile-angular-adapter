describe('history', function () {
    describe('go', function () {
        it('should call window.history.go asynchronously', inject(function ($history) {
            // Why asynchronously?
            // Because some browsers (Firefox and IE10) trigger the popstate event in sync,
            // which gets us into trouble for $location.backMode().
            $history.go(10);
            expect(window.history.go).not.toHaveBeenCalled();
            jasmine.Clock.tick(1);
            expect(window.history.go).toHaveBeenCalledWith(10);
        }));
    });

    describe('changing the url programmatically', function () {
        it('should record successful url changes', inject(function ($history, $location, $rootScope) {
            expect($history.activeIndex).toBe(-1);
            $location.path("path1");
            $rootScope.$apply();
            expect($history.activeIndex).toBe(0);
            $location.path("path2");
            $rootScope.$apply();
            expect($history.activeIndex).toBe(1);
            expect($history.urlStack).toEqual(['http://server/path1', 'http://server/path2']);
        }));

        it('should remove trailing entries from the urlStack when adding new entries', inject(function ($history, $location, $rootScope) {
            $location.path("path1");
            $rootScope.$apply();

            $history.activeIndex = -1;

            $location.path("path2");
            $rootScope.$apply();
            expect($history.activeIndex).toBe(0);

            expect($history.urlStack).toEqual(['http://server/path2']);
        }));

        it('should record multiple url changes to the same url only once', inject(function ($history, $browser) {
            $browser.url("http://server/url1");
            $browser.url("http://server/url1");
            expect($history.urlStack).toEqual(['http://server/url1']);
        }));

        it('should not record url changes of aborted location changes', inject(function ($history, $location, $rootScope) {
            $rootScope.$on('$locationChangeStart', function (event) {
                event.preventDefault();
            });
            $location.path("path1");
            $rootScope.$apply();
            expect($history.urlStack).toEqual([]);
        }));

        it('should not record url changes due to hash changes', inject(function ($history, $location, $rootScope, $browser) {
            $location.path("path1");
            $rootScope.$apply();
            $location.path("path2");
            $rootScope.$apply();

            $browser.$$url = 'http://server/path1';
            $browser.poll();
            $rootScope.$apply();
            expect($history.activeIndex).toBe(0);
            expect($history.urlStack).toEqual(['http://server/path1', 'http://server/path2']);
        }));

        it('should replace the last entry if $location.replace is used', inject(function ($history, $location, $rootScope) {
            $location.path("path1");
            $rootScope.$apply();
            expect($history.activeIndex).toBe(0);
            $location.path("path2");
            $location.replace();
            $rootScope.$apply();
            expect($history.activeIndex).toBe(0);
            expect($history.urlStack).toEqual(['http://server/path2']);
        }));

        it('should remove trailing entries from the urlStack when replacing the current entry', inject(function ($history, $location, $rootScope) {
            $location.path("path1");
            $rootScope.$apply();
            $location.path("path2");
            $rootScope.$apply();

            $history.activeIndex = 0;

            $location.path("path3");
            $location.replace();
            $rootScope.$apply();
            expect($history.activeIndex).toBe(0);
            expect($history.urlStack).toEqual(['http://server/path3']);
        }));

        it('should set fromUrlChange to false', inject(function ($history, $location, $rootScope) {
            $history.fromUrlChange = true;
            $location.path("path1");
            $rootScope.$apply();
            expect($history.fromUrlChange).toBe(false);
        }));

    });

    describe('hash listening', function () {
        it('should update the activeIndex based on the url', inject(function ($location, $rootScope, $browser, $history) {
            $location.path("path1");
            $rootScope.$apply();
            $location.path("path2");
            $rootScope.$apply();

            $browser.$$url = 'http://server/path1';
            $browser.poll();

            expect($history.activeIndex).toBe(0);
        }));

        it('should append the url to the stack if the url is not know', inject(function ($browser, $history) {
            $browser.$$url = 'http://server/path1';
            $browser.poll();

            expect($history.activeIndex).toBe(0);
            expect($history.urlStack).toEqual(['http://server/path1']);
        }));

        it('should set fromUrlChange to true', inject(function ($location, $rootScope, $browser, $history) {
            $location.path("path1");
            $rootScope.$apply();
            $location.path("path2");
            $rootScope.$apply();

            $browser.$$url = 'http://server/path1';
            $browser.poll();

            expect($history.fromUrlChange).toBe(true);
        }));
    });

    describe('$location.backMode', function () {
        describe('if the location is in the history', function () {
            it('should cancel the current navigation without firing any locationChangeSuccess or locationChangeStart events before the hashchange event', inject(function ($location, $rootScope, $history) {
                $location.path("path1");
                $rootScope.$apply();
                $location.path("path2");
                $rootScope.$apply();

                var locationChangeStartSpy = jasmine.createSpy('locationChangeStartSpy');
                var locationChangeSuccessSpy = jasmine.createSpy('locationChangeSuccessSpy');
                $rootScope.$on("$locationChangeStart", locationChangeStartSpy);
                $rootScope.$on("$locationChangeSuccess", locationChangeSuccessSpy);

                $location.path("path1");
                $location.backMode();
                $rootScope.$apply();

                expect(locationChangeStartSpy.callCount).toBe(1);
                var args = locationChangeStartSpy.mostRecentCall.args;
                expect(args[1]).toBe('http://server/path1'); // new url
                expect(args[2]).toBe('http://server/path2'); // old url
                expect(args[0].defaultPrevented).toBe(false);

                expect(locationChangeSuccessSpy.callCount).toBe(0);
                expect($history.urlStack).toEqual(['http://server/path1', 'http://server/path2']);
                expect($history.activeIndex).toBe(1);
            }));

            it('should go back to the nearest entry in history but no change $location immediately', inject(function ($location, $rootScope, $browser) {
                $location.path("path1");
                $rootScope.$apply();
                $location.path("path2");
                $rootScope.$apply();
                $location.path("path1");
                $rootScope.$apply();
                $location.path("path2");
                $rootScope.$apply();

                angular.mock.$Browser.prototype.url.reset();
                $location.path("path1");
                $location.backMode();
                $rootScope.$apply();
                jasmine.Clock.tick(1);

                expect(window.history.go).toHaveBeenCalledWith(-1);
                expect($location.path()).toBe("/path2");
                angular.forEach(angular.mock.$Browser.prototype.url.argsForCall, function(args) {
                    expect(args).toEqual([]);
                });
            }));

            it('should not go back if the $locationChangeStart event was canceled', inject(function ($location, $rootScope, $history) {
                $location.path("path1");
                $rootScope.$apply();
                $location.path("path2");
                $rootScope.$apply();

                $rootScope.$on("$locationChangeStart", function(event) {
                    event.preventDefault();
                });

                $location.path("path1");
                $location.backMode();
                $rootScope.$apply();
                jasmine.Clock.tick(1);

                expect(window.history.go).not.toHaveBeenCalled();
            }));
        });

        describe('if the location is not in the history', function() {
            it('should add the url to the urlStack', inject(function ($location, $rootScope, $history) {
                $location.path("path1");
                $rootScope.$apply();

                var locationChangeSuccessCounter = 0;
                $rootScope.$on("$locationChangeSuccess", function () {
                    locationChangeSuccessCounter++;
                });

                $location.path("path2");
                $location.backMode();
                $rootScope.$apply();
                jasmine.Clock.tick(1);

                expect(locationChangeSuccessCounter).toBe(1);
                expect($history.urlStack).toEqual(['http://server/path1', 'http://server/path2']);
                expect(window.history.go).not.toHaveBeenCalled();
                expect($history.activeIndex).toBe(1);
                expect($history.fromUrlChange).toBe(false);
            }));

            it('should update the $browser.url() immediately and keep it in sync with the browser', inject(function ($location, $rootScope, $browser, $history) {
                $location.path("path1");
                $rootScope.$apply();

                $location.path("path2");
                $location.backMode();
                $rootScope.$apply();
                expect($browser.url()).toBe('http://server/path2');

                $browser.$$url = 'http://server/somePath';
                expect($browser.url()).toBe('http://server/somePath');
            }));


        });

    });

    describe('$location.goBack', function () {
        it('should go back in history if the location is known', inject(function ($location, $rootScope, $history) {
            $location.path("path1");
            $rootScope.$apply();
            $location.path("path2");
            $rootScope.$apply();

            $location.goBack();
            expect($location.absUrl()).toBe('http://server/path1');
            $rootScope.$apply();
            jasmine.Clock.tick(1);

            expect($history.urlStack).toEqual(['http://server/path1', 'http://server/path2']);
            expect(window.history.go).toHaveBeenCalledWith(-1);
            expect($history.activeIndex).toBe(1);
        }));

        it('should throw an Error if there is no previous entry in the urlStack', inject(function ($location, $rootScope, $history) {
            try {
                $location.goBack();
                throw new Error("Error expected");
            } catch (e) {
                expect(e.message).toBe('There is no page in the history to go back to!');
            }
        }));
    });

    describe('special cases', function () {
        it('should not set the fromUrlChange flag if $route does a redirect', function () {
            module(function ($routeProvider) {
                $routeProvider.when('/someUrl', {
                    redirectTo:'/someRedirectUrl'
                });
            });
            inject(function ($location, $rootScope, $browser, $history) {
                $history.urlStack = ['http://server/someUrl'];
                $history.activeIndex = 0;

                $browser.$$url = 'http://server/someUrl';
                $browser.poll();
                expect($location.path()).toBe('/someRedirectUrl');
                expect($history.fromUrlChange).toBe(false);
            });
        });

        it('should set the fromUrlChange flag for a normal $route', function () {
            module(function ($routeProvider) {
                $routeProvider.when('/someUrl', {
                    templateUrl:'someTemplate.html'
                });
            });
            inject(function ($location, $rootScope, $browser, $history) {
                $history.urlStack = ['http://server/someUrl'];
                $history.activeIndex = 0;

                $browser.$$url = 'http://server/someUrl';
                $browser.poll();
                expect($location.path()).toBe('/someUrl');
                expect($history.fromUrlChange).toBe(true);
            });
        });
    });
});