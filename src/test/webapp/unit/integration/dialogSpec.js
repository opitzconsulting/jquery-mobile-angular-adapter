describe("dialog", function () {
    it("should stamp the widget using the jqm widget", function () {
        var spy = testutils.spyOnJq('dialog');
        var c = testutils.compile('<div><div data-role="dialog" ng-repeat="l in list"></div></div>');
        expect(spy.callCount).toBe(0);
        var scope = c.scope();
        scope.list = [1, 2];
        scope.$root.$digest();
        expect(spy.callCount).toBe(2);
    });

    it("should enhance the close button", function () {
        var dialog = testutils.compile('<div data-role="dialog"><div data-role="header"></div></div>');
        var closeSpy = spyOn(dialog.data("dialog"), "close");
        var closeButton = dialog.find("a");
        expect(closeButton.length).toBe(1);
        expect(closeButton.hasClass("ui-btn")).toBe(true);
        expect(closeButton.hasClass("ui-btn-up-a")).toBe(true);
        closeButton.click();
        expect(closeSpy).toHaveBeenCalled();
    });

    describe('routing for dialogs', function () {
        it('should replace the $location with a special dialog url when a dialog is opened', inject(function ($location, $rootScope, $browser) {
            var c = testutils.compileInPage('<div></div>');
            var page = $.mobile.activePage = c.page;
            page.jqmData("role", "dialog");
            $rootScope.$broadcast('jqmPagebeforeshow');
            $rootScope.$apply();

            expect(angular.mock.$Browser.prototype.url).toHaveBeenCalledWith('http://server/&ui-state=dialog', true);
            expect($browser.url()).toBe('http://server/&ui-state=dialog');
        }));
        it('should go back in history when a dialog is closed and the url is the special dialog url', inject(function ($location) {
            spyOn($location, 'goBack');
            var c = testutils.compile('<div data-role="dialog"></div>');
            $location.url("/&ui-state=dialog");
            c.trigger("pagebeforeshow");
            c.dialog("close");
            expect($location.goBack).toHaveBeenCalled();
        }));
        it('should be able to go to a next page with a hash location from within a dialog with empty initial path', inject(function($rootScope, $location, $browser) {
            var c = testutils.compileInPage('<div></div>');
            var page = $.mobile.activePage = c.page;
            page.jqmData("role", "dialog");
            // this happens e.g. with history support disabled when navigating to a dialog from the initial page.
            $location.$$path = '';
            $location.url('#page1');
            $rootScope.$broadcast('jqmPagebeforeshow');
            $rootScope.$apply();

            expect($browser.url()).toBe('http://server/&ui-state=dialog');

            $location.hash("page2");
            $rootScope.$apply();
            expect($browser.url()).toBe('http://server/#page2');
        }));
        it('should be able to go to a next page with a hash location from within a dialog with non empty initial path', inject(function($rootScope, $location, $browser) {
            var c = testutils.compileInPage('<div></div>');
            var page = $.mobile.activePage = c.page;
            page.jqmData("role", "dialog");
            $location.url('/someUrl#page1');
            $rootScope.$broadcast('jqmPagebeforeshow');
            $rootScope.$apply();

            expect($browser.url()).toBe('http://server/&ui-state=dialog');
            $location.hash("page2");
            $rootScope.$apply();
            expect($browser.url()).toBe('http://server/someUrl#page2');
        }));
        it('should be able to go the a next page with a hash location if the first $locationChangeStart event was prevented', inject(function($rootScope, $location, $browser) {
            var prevent = true;
            var c = testutils.compileInPage('<div></div>');
            var page = $.mobile.activePage = c.page;
            page.jqmData("role", "dialog");
            $location.url('/someUrl#page1');
            $rootScope.$broadcast('jqmPagebeforeshow');
            $rootScope.$apply();
            $rootScope.$on("$locationChangeStart", function(event) {
                if (prevent) event.preventDefault();
            });
            $location.hash("page2");
            $rootScope.$apply();
            expect($browser.url()).toBe('http://server/&ui-state=dialog');
            prevent = false;

            $location.hash("page3");
            $rootScope.$apply();
            expect($browser.url()).toBe('http://server/someUrl#page3');
        }));

        it('should keep dialog urls even when a default routing rule is used', function() {
            module(function($routeProvider) {
                $routeProvider.otherwise({
                    redirectTo:"/test"
                });
            });
            inject(function ($location, $rootScope, $browser) {
                $location.url('/&ui-state=dialog');
                $rootScope.$apply();
                expect($browser.url()).toBe('http://server/&ui-state=dialog');
            })
        });

        it('should remove the dialog from browser history when leaving a dialog', inject(function($location, $browser, $rootScope, $history) {
            var c = testutils.compileInPage('<div></div>');
            var page = $.mobile.activePage = c.page;
            page.jqmData("role", "dialog");
            $location.url('/someUrl#page1');
            $rootScope.$broadcast('jqmPagebeforeshow');
            $rootScope.$apply();

            expect(angular.mock.$Browser.prototype.url).toHaveBeenCalledWith('http://server/&ui-state=dialog', true);
            expect($browser.url()).toBe('http://server/&ui-state=dialog');
            expect($history.urlStack).toEqual(["http://server/&ui-state=dialog"]);

            $location.hash("page2");
            $rootScope.$apply();
            expect(angular.mock.$Browser.prototype.url).toHaveBeenCalledWith('http://server/someUrl#page2', true);
            expect($browser.url()).toBe('http://server/someUrl#page2');
            expect($history.urlStack).toEqual(["http://server/someUrl#page2"]);

        }));

    });
});
