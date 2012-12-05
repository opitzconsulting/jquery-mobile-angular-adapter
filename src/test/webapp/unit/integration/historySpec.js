describe('history', function () {
    describe('go', function () {
        it('should call window.history.go', inject(function ($history) {
            $history.go(10);
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


    describe('special cases', function() {
        it('should not set the fromUrlChange flag if $route does a redirect', function() {
            module(function($routeProvider) {
                $routeProvider.when('/someUrl', {
                    redirectTo: '/someRedirectUrl'
                });
            });
            inject(function($location, $rootScope, $browser, $history) {
                $history.urlStack = ['http://server/someUrl'];
                $history.activeIndex = 0;

                $browser.$$url = 'http://server/someUrl';
                $browser.poll();
                expect($location.path()).toBe('/someRedirectUrl');
                expect($history.fromUrlChange).toBe(false);
            });
        });

        it('should set the fromUrlChange flag for a normal $route', function() {
            module(function($routeProvider) {
                $routeProvider.when('/someUrl', {
                    templateUrl: 'someTemplate.html'
                });
            });
            inject(function($location, $rootScope, $browser, $history) {
                $history.urlStack = ['http://server/someUrl'];
                $history.activeIndex = 0;

                $browser.$$url = 'http://server/someUrl';
                $browser.poll();
                expect($location.path()).toBe('/someUrl');
                expect($history.fromUrlChange).toBe(true);
            });
        });
    });

    describe('$location.backMode', function () {
        it('should go back in history if the location is known', inject(function ($location, $rootScope, $history) {
            $location.path("path1");
            $rootScope.$apply();
            $location.path("path2");
            $rootScope.$apply();
            $location.path("path1");
            $rootScope.$apply();
            $location.path("path2");
            $rootScope.$apply();

            var locationChangeSuccessCounter = 0;
            $rootScope.$on("$locationChangeSuccess", function () {
                locationChangeSuccessCounter++;
            });

            $location.path("path1");
            $location.backMode();
            $rootScope.$apply();

            expect(locationChangeSuccessCounter).toBe(1);
            expect($history.urlStack).toEqual(['http://server/path1', 'http://server/path2', 'http://server/path1', 'http://server/path2']);
            expect(window.history.go).toHaveBeenCalledWith(-2);
            expect($history.activeIndex).toBe(2);
            expect($history.fromUrlChange).toBe(true);
        }));

        it('should add the url to the urlStack if it is not contained', inject(function ($location, $rootScope, $history) {
            $location.path("path1");
            $rootScope.$apply();

            var locationChangeSuccessCounter = 0;
            $rootScope.$on("$locationChangeSuccess", function () {
                locationChangeSuccessCounter++;
            });

            $location.path("path2");
            $location.backMode();
            $rootScope.$apply();

            expect(locationChangeSuccessCounter).toBe(1);
            expect($history.urlStack).toEqual(['http://server/path1', 'http://server/path2']);
            expect(window.history.go).not.toHaveBeenCalled();
            expect($history.activeIndex).toBe(1);
            expect($history.fromUrlChange).toBe(false);
        }));
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

            expect($history.urlStack).toEqual(['http://server/path1', 'http://server/path2']);
            expect(window.history.go).toHaveBeenCalledWith(-2);
            expect($history.activeIndex).toBe(0);
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
});