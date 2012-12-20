describe('popup', function () {
    it("should stamp the widget using the jqm widget", function () {
        var spy = testutils.spyOnJq('popup');
        var c = testutils.compile('<div><div data-role="popup" ng-repeat="l in list"></div></div>');
        expect(spy.callCount).toBe(0);
        var scope = c.scope();
        scope.list = [1, 2];
        scope.$root.$digest();
        expect(spy.callCount).toBe(2);
    });

    describe('routing for popups', function () {
        it('should replace the $location with a special dialog url when a popup is opened using routing', inject(function ($location, $rootScope) {
            var c = testutils.compileInPage('<div data-role="popup"></div>');
            $location.hash('somePopup');
            $.mobile.changePage.andCallFake(function (url) {
                if (url === '/#somePopup') {
                    $.mobile.popup.active = true;
                }
            });
            $rootScope.$apply();
            expect($location.url()).toEqual("/&ui-state=dialog");
        }));
        it('should go back in history when a popup is closed and the url is the special dialog url', inject(function ($location) {
            spyOn($location, 'goBack');
            var c = testutils.compile('<div data-role="popup"></div>');
            $location.url("/&ui-state=dialog");
            c.popup("open");
            c.popup("close");
            expect($location.goBack).toHaveBeenCalled();
        }));
        it('should not replace the $location with a special dialog url when a popup is opened without routing', inject(function ($location, $rootScope) {
            var c = testutils.compileInPage('<div data-role="popup" id="popup1"></div>');
            var popup = c.page.find("#popup1");
            popup.popup("open");
            expect($location.url()).toEqual("/");
        }));
        it('should not replace the $location with a special dialog url when a popup is closed without routing', inject(function ($location, $rootScope) {
            var c = testutils.compileInPage('<div data-role="popup" id="popup1"></div>');
            var popup = c.page.find("#popup1");
            popup.popup("open");
            popup.popup("close");
            expect($location.url()).toEqual("/");
        }));
        it('should go back on a click on the popup close button', inject(function ($location) {
            var c = testutils.compileInPage('<div data-role="popup" id="popup1"><a href="#" data-rel="back" id="close">Close</a></div>');
            var popup = c.page.find("#popup1");
            popup.popup("open");
            var closeBtn = popup.find("#close");
            closeBtn.click();
            expect($location.url()).toEqual("/");

        }));
    });
});