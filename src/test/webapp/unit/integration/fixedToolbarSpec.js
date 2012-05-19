describe("fixedtoolbar", function () {
    it("should stamp the widget using the jqm widget", function() {
        var spy = testutils.spyOnJq('fixedtoolbar');
        var c = testutils.compileInPage('<div data-role="header" data-position="fixed" ng-repeat="l in list"><h1>Fixed Header!</h1></div>');
        expect(spy.callCount).toBe(0);
        var scope = c.page.scope();
        scope.list = [1,2];
        scope.$root.$digest();
        expect(spy.callCount).toBe(2);
    });
});
