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
        var closeButton = dialog.find("a");
        expect(closeButton.length).toBe(1);
        expect(closeButton.hasClass("ui-btn")).toBe(true);
        expect(closeButton.hasClass("ui-btn-up-a")).toBe(true);
    });

    describe('routing for dialogs', function () {
        it('should replace the $location with a special dialog url when a dialog is opened', inject(function ($location, $rootScope) {
            var c = testutils.compileInPage('<div></div>');
            var page = $.mobile.activePage = c.page;
            page.jqmData("role", "dialog");
            $rootScope.$broadcast('jqmPagebeforeshow');
            expect($location.url()).toEqual("/&ui-state=dialog");
            expect($location.$$replace).toBe(true);
        }));
        it('should go back in history when a dialog is closed and the url is the special dialog url', inject(function ($location) {
            spyOn($location, 'goBack');
            var c = testutils.compile('<div data-role="dialog"></div>');
            $location.url("/&ui-state=dialog");
            c.trigger("pagebeforeshow");
            c.dialog("close");
            expect($location.goBack).toHaveBeenCalled();
        }));
        it('should be able to go to a next page with a hash location from within a dialog with empty initial path', inject(function($rootScope, $location) {
            var c = testutils.compileInPage('<div></div>');
            var page = $.mobile.activePage = c.page;
            page.jqmData("role", "dialog");
            // this happens e.g. with history support disabled when navigating to a dialog from the initial page.
            $location.$$path = '';
            $location.url('#page1');
            $rootScope.$broadcast('jqmPagebeforeshow');
            $rootScope.$apply();

            expect($location.url()).toEqual("/&ui-state=dialog");
            $location.hash("page2");
            $rootScope.$apply();
            expect($location.url()).toBe('/#page2');
        }));
        it('should be able to go to a next page with a hash location from within a dialog with non empty initial path', inject(function($rootScope, $location) {
            var c = testutils.compileInPage('<div></div>');
            var page = $.mobile.activePage = c.page;
            page.jqmData("role", "dialog");
            $location.url('/someUrl#page1');
            $rootScope.$broadcast('jqmPagebeforeshow');
            $rootScope.$apply();

            expect($location.url()).toEqual("/&ui-state=dialog");
            $location.hash("page2");
            $rootScope.$apply();
            expect($location.url()).toBe('/someUrl#page2');
        }));
        it('should be able to go the a next page with a hash location if the first $locationChangeStart event was prevented', inject(function($rootScope, $location) {
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
            expect($location.url()).toEqual("/&ui-state=dialog");
            prevent = false;

            $location.hash("page2");
            $rootScope.$apply();
            expect($location.url()).toBe('/someUrl#page2');
        }));

        it('should keep dialog urls even when a default routing rule is used', function() {
            module(function($routeProvider) {
                $routeProvider.otherwise({
                    redirectTo:"/test"
                });
            });
            inject(function ($location, $rootScope) {
                $location.url('/&ui-state=dialog');
                $rootScope.$apply();
                expect($location.url()).toEqual("/&ui-state=dialog");
            })
        });

    });
});
