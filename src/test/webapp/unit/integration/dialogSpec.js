describe("dialog", function () {
    it("should stamp the widget using the jqm widget", function() {
        var spy = testutils.spyOnJq('dialog');
        var c = testutils.compile('<div><div data-role="dialog" ng-repeat="l in list"></div></div>');
        expect(spy.callCount).toBe(0);
        var scope = c.scope();
        scope.list = [1,2];
        scope.$root.$digest();
        expect(spy.callCount).toBe(2);
    });

    it("should enhance the close button", function() {
        var dialog = testutils.compile('<div data-role="dialog"><div data-role="header"></div></div>');
        var closeButton = dialog.find("a");
        expect(closeButton.length).toBe(1);
        expect(closeButton.hasClass("ui-btn")).toBe(true);
    });
});
