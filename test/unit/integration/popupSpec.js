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
        expect(popup.data($.mobile.popup.prototype.widgetFullName)._isOpen).toBe(false);
    }));

    it('should open popups when a link with data-rel="popup" is clicked, but not change the location href', inject(function($browser) {
        var oldUrl = $browser.url();
        var c = testutils.compileInPage('<div><a href="#popup1" data-rel="popup" data-transition="pop" data-position-to="top" id="link">Open</a><div data-role="popup" id="popup1">test</div></div>');
        var popup = c.page.find("#popup1");
        var popupWidget = popup.data("mobile-popup");
        spyOn(popupWidget, 'open').andCallThrough();
        var link = c.page.find("#link");
        link.click();
        var offset = link.offset();
        expect(popupWidget.open).toHaveBeenCalledWith({
            x: offset.left + link.outerWidth() / 2,
            y: offset.top + link.outerHeight() / 2,
            transition: "pop",
            positionTo: "top"
        });
        expect($browser.url()).toBe(oldUrl);
        expect($.mobile.popup.active).toBe(popup.data($.mobile.popup.prototype.widgetFullName));
    }));

    describe('data-opened', function() {
        var popup, scope, popupSpy, widget;
        beforeEach(function() {
            popupSpy = testutils.spyOnJq('popup').andCallThrough();
        });
        function init(openedAttribute) {
            var c = testutils.compileInPage('<div data-role="popup" id="popup1" data-opened="'+openedAttribute+'">test</div>');
            popupSpy.reset();
            popup = c.page.find("#popup1");
            widget = popup.data($.mobile.popup.prototype.widgetFullName);
            scope = c.page.scope();
        }

        it('should update the data-opened variable', function () {
            init('openVar');
            expect(scope.openVar).toBeUndefined();
            expect(widget._isOpen).toBe(false);
            popup.popup("open");
            expect(scope.openVar).toBe(true);
            expect(widget._isOpen).toBe(true);
        });

        it('should work with fixed data-opened value', function () {
            init('true');
            expect(widget._isOpen).toBe(true);
            popup.popup("close");
            // expect no exception here.
            expect(widget._isOpen).toBe(false);
        });

        it("should update the ui when data-opened changes", function() {
            init('openVar');
            expect(widget._isOpen).toBe(false);
            scope.openVar = true;
            scope.$root.$digest();
            expect(widget._isOpen).toBe(true);
        });
    });
});