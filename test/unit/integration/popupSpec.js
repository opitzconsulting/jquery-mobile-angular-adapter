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

    it('should close the popup on a click on the popup close button', inject(function ($location, $rootScope, $history) {
        var c = testutils.compileInPage('<div data-role="popup" id="popup1"><a href="#" data-rel="back" id="close">Close</a></div>');
        var popup = c.page.find("#popup1");
        popup.popup("open");
        var closeBtn = popup.find("#close");
        closeBtn.click();
        expect(popup.data("popup")._isOpen).toBe(false);
    }));

    it('should open popups when a link with data-rel="popup" is clicked, but not change the location', inject(function($browser) {
        var oldUrl = $browser.url();
        var c = testutils.compileInPage('<div><a href="#popup1" data-rel="popup" id="link">Open</a><div data-role="popup" id="popup1">test</div></div>');
        var popup = c.page.find("#popup1");
        var link = c.page.find("#link");
        link.click();
        expect($browser.url()).toBe(oldUrl);
        expect($.mobile.popup.active).toBe(popup.data("popup"));

    }));

});