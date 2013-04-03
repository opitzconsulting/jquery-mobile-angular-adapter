describe('history', function () {
    beforeEach(function() {
        jasmine.Clock.useMock();
    });

    describe('$browser decorator', function() {
        it('should decode urls with %23 instead of hash for android', inject(function($browser) {
            expect($browser.url('a%23b').url()).toBe('a#b');
        }));

        it('should decode urls with blank instead of %20 for ios 5', inject(function($browser, $location) {
            expect($browser.url('a b').url()).toBe('a%20b');
        }));

        it('should return the url without protocol for file urls when calling $browser.baseHref()', function () {
            inject(function ($browser) {
                $browser.$$baseHref = 'file:///someUrl/somePage?a=b';
                expect($browser.baseHref()).toBe('/someUrl/somePage?a=b');
            });
        });
    });


    describe('go', function () {
        it('should call window.history.go asynchronously', inject(function ($history) {
            // Why asynchronously?
            // Because some browsers (Firefox and IE10) trigger the popstate event in sync,
            // which gets us into trouble for $location.backMode().
            $history.go(10);
            expect(window.history.go).not.toHaveBeenCalled();
            jasmine.Clock.tick(50);
            expect(window.history.go).toHaveBeenCalledWith(10);
        }));
    });

    describe('goBack', function () {
        it('should call $history.go(-1)', inject(function ($history) {
            spyOn($history, 'go');
            $history.goBack();
            expect($history.go).toHaveBeenCalledWith(-1);
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
            expect($history.urlStack[0].url).toEqual(testutils.browserUrl('http://server','/path1'));
            expect($history.urlStack[1].url).toEqual(testutils.browserUrl('http://server','/path2'));
            expect($history.urlStack.length).toBe(2);
        }));

        it('should remove trailing entries from the urlStack when adding new entries', inject(function ($history, $location, $rootScope) {
            $location.path("path1");
            $rootScope.$apply();

            $history.activeIndex = -1;

            $location.path("path2");
            $rootScope.$apply();
            expect($history.activeIndex).toBe(0);

            expect($history.urlStack[0].url).toEqual(testutils.browserUrl('http://server','/path2'));
            expect($history.urlStack.length).toBe(1);
        }));

        it('should record multiple url changes to the same url only once', inject(function ($history, $browser) {
            $browser.url(testutils.browserUrl("http://server","/url1"));
            $browser.url(testutils.browserUrl("http://server", "/url1"));
            expect($history.urlStack).toEqual([{url: testutils.browserUrl('http://server','/url1')}]);
        }));

        it('should not record url changes of aborted location changes', inject(function ($history, $location, $rootScope) {
            $rootScope.$on('$locationChangeStart', function (event) {
                event.preventDefault();
            });
            $location.path("path1");
            $rootScope.$apply();
            expect($history.urlStack).toEqual([]);
        }));

        it('should replace the last entry if $location.replace is used', inject(function ($history, $location, $rootScope) {
            $location.path("path1");
            $rootScope.$apply();
            expect($history.activeIndex).toBe(0);
            $location.path("path2");
            $location.replace();
            $rootScope.$apply();
            expect($history.activeIndex).toBe(0);
            expect($history.urlStack[0].url).toEqual(testutils.browserUrl('http://server','/path2'));
            expect($history.urlStack.length).toBe(1);
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
            expect($history.urlStack[0].url).toEqual(testutils.browserUrl('http://server','/path3'));
            expect($history.urlStack.length).toBe(1);
        }));

        it('should set lastIndexFromUrlChange to -1', inject(function ($history, $location, $rootScope) {
            $history.lastIndexFromUrlChange = true;
            $location.path("path1");
            $rootScope.$apply();
            expect($history.lastIndexFromUrlChange).toBe(-1);
        }));

    });

    describe('hash listening', function () {
        it('should update the activeIndex based on the url', inject(function ($location, $rootScope, $browser, $history) {
            $location.path("path1");
            $rootScope.$apply();
            $location.path("path2");
            $rootScope.$apply();

            $browser.$$url = testutils.browserUrl('http://server','/path1');
            $browser.poll();

            expect($history.activeIndex).toBe(0);
        }));

        it('should append the url to the stack if the url is not know', inject(function ($browser, $history) {
            $browser.$$url = testutils.browserUrl('http://server','/path1');
            $browser.poll();

            expect($history.activeIndex).toBe(0);
            expect($history.urlStack[0].url).toBe(testutils.browserUrl('http://server','/path1'));
        }));

        it('should set lastIndexFromUrlChange to the last index before navigation', inject(function ($location, $rootScope, $browser, $history) {
            $location.path("path1");
            $rootScope.$apply();
            $location.path("path2");
            $rootScope.$apply();

            $browser.$$url = testutils.browserUrl('http://server', '/path1');
            $browser.poll();

            expect($history.lastIndexFromUrlChange).toBe(1);
        }));
    });

    describe('removePastEntries', function() {
        function createHistory(number) {
            inject(function($location, $rootScope) {
                var i;
                for (i=0; i<number; i++) {
                    $location.path("path"+i);
                    $rootScope.$apply();
                }
            });
        }
        it('should remove the given number of entries from $history.urlStack', inject(function($browser, $history) {
            var initialUrlStack;
            createHistory(3);
            initialUrlStack = $history.urlStack.slice();
            expect($history.activeIndex).toBe(2);
            expect(initialUrlStack.length).toBe(3);

            $history.removePastEntries(2);
            jasmine.Clock.tick(50);
            $browser.$$url = $history.urlStack[0].url;
            $browser.poll();

            expect($history.activeIndex).toBe(0);
            expect($history.urlStack).toEqual([initialUrlStack[2]]);
        }));

        it('should remove future entries', inject(function($history, $browser) {
            var initialUrlStack;
            createHistory(3);
            initialUrlStack = $history.urlStack.slice();
            $history.activeIndex = 1;
            $history.removePastEntries(1);
            jasmine.Clock.tick(50);
            $browser.$$url = $history.urlStack[0].url;
            $browser.poll();

            expect($history.activeIndex).toBe(0);
            expect($history.urlStack).toEqual([initialUrlStack[1]]);
        }));
        it('should go back the given number of steps in history', inject(function($history) {
            createHistory(3);
            $history.removePastEntries(2);
            jasmine.Clock.tick(50);
            expect(window.history.go).toHaveBeenCalledWith(-2);
        }));
        it('should replace the location with the old location, keeping the history entry when going back to a different location', inject(function($browser, $history) {
            var initialUrlStack;
            createHistory(3);
            initialUrlStack = $history.urlStack.slice();
            initialUrlStack[2].test = true;

            $history.removePastEntries(2);
            jasmine.Clock.tick(50);
            $browser.$$url = initialUrlStack[0].url;
            $browser.poll();

            expect($browser.url()).toBe(initialUrlStack[2].url);
            expect(angular.mock.$Browser.prototype.url).toHaveBeenCalledWith(initialUrlStack[2].url, true);
            expect($history.urlStack[$history.activeIndex]).toBe(initialUrlStack[2]);
        }));
        it('should not replace the location, keeping the history entry when going back to the same location', inject(function($browser, $history, $location, $rootScope) {
            var initialUrlStack;
            createHistory(2);
            $location.path("path0");
            $rootScope.$apply();

            initialUrlStack = $history.urlStack.slice();
            initialUrlStack[2].test = true;

            $history.removePastEntries(2);
            jasmine.Clock.tick(50);
            $browser.$$url = initialUrlStack[0].url;
            $browser.poll();

            expect($browser.url()).toBe(initialUrlStack[2].url);
            expect(angular.mock.$Browser.prototype.url).not.toHaveBeenCalledWith(initialUrlStack[2].url, true);
            expect($history.urlStack[$history.activeIndex]).toBe(initialUrlStack[2]);
        }));
        it('should not call other onUrlChange listeners while going back, but call them again afterwards', inject(function($browser, $history) {
            var spy = jasmine.createSpy();
            $browser.onUrlChange(spy);
            createHistory(3);

            $history.removePastEntries(2);
            jasmine.Clock.tick(50);
            $browser.poll();

            expect(spy).not.toHaveBeenCalled();
            $browser.$$url = testutils.browserUrl('http://server', '/someOtherUrl');
            $browser.poll();
            expect(spy).toHaveBeenCalled();
        }));
    });

    describe('$location.back', function () {
        beforeEach(inject(function($history) {
            spyOn($history, 'removePastEntries');
        }));
        describe('if the location is in the history', function () {
            it('should update the browser url', inject(function ($location, $rootScope, $history, $browser) {
                $location.path("path1");
                $rootScope.$apply();
                $location.path("path2");
                $rootScope.$apply();

                $location.path("path1");
                $location.back();
                $rootScope.$apply();

                expect($browser.url()).toBe(testutils.browserUrl("http://server", "/path1"));
            }));

            it('should call $history.removePastEntries', inject(function ($location, $rootScope, $history) {
                $location.path("path1");
                $rootScope.$apply();
                $location.path("path2");
                $rootScope.$apply();

                $location.path("path1");
                $location.back();
                $rootScope.$apply();

                expect($history.removePastEntries).toHaveBeenCalledWith(2);
            }));

            it('should go back to the nearest entry in history', inject(function ($location, $rootScope, $browser, $history) {
                $location.path("path1");
                $rootScope.$apply();
                $location.path("path2");
                $rootScope.$apply();
                $location.path("path1");
                $rootScope.$apply();
                $location.path("path2");
                $rootScope.$apply();

                $location.path("path1");
                $location.back();
                $rootScope.$apply();

                expect($history.removePastEntries).toHaveBeenCalledWith(2);
            }));
        });

        describe('if the location is not in the history', function() {
            it('should update the browser url and not call $history.removePastEntries', inject(function ($location, $rootScope, $history, $browser) {
                $location.path("path1");
                $rootScope.$apply();

                $location.path("path2");
                $location.back();
                $rootScope.$apply();

                expect($browser.url()).toBe(testutils.browserUrl('http://server','/path2'));
                expect($history.removePastEntries).not.toHaveBeenCalled();
            }));
        });

    });

    describe('special cases', function () {
        it('should not set the lastIndexFromUrlChange flag if $route does a redirect', function () {
            module(function ($routeProvider) {
                $routeProvider.when('/someUrl', {
                    redirectTo:'/someRedirectUrl'
                });
            });
            inject(function ($location, $rootScope, $browser, $history) {
                $history.urlStack = [{url: testutils.browserUrl('http://server','/someUrl')}];
                $history.activeIndex = 0;

                $browser.$$url = testutils.browserUrl('http://server','/someUrl');
                $browser.poll();
                expect($location.path()).toBe('/someRedirectUrl');
                expect($history.lastIndexFromUrlChange).toBe(-1);
            });
        });

        it('should set the lastIndexFromUrlChange flag for a normal $route', function () {
            module(function ($routeProvider) {
                $routeProvider.when('/someUrl', {
                    templateUrl:'someTemplate.html'
                });
            });
            inject(function ($location, $rootScope, $browser, $history) {
                $history.urlStack = [{url: testutils.browserUrl('http://server','/someUrl2')}, {url: testutils.browserUrl('http://server', '/someUrl')}];
                $history.activeIndex = 0;

                $browser.$$url = testutils.browserUrl('http://server', '/someUrl');
                $browser.poll();
                expect($location.path()).toBe('/someUrl');
                expect($history.lastIndexFromUrlChange).toBe(0);
            });
        });
    });
});