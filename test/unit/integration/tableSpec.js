describe("table", function () {
    it("should stamp the widget using the jqm widget", function() {
        var spy = testutils.spyOnJq('table');
        var c = testutils.compileInPage('<div data-role="table" ng-repeat="l in list"></div>');
        expect(spy.callCount).toBe(0);
        var scope = c.page.scope();
        scope.list = [1,2];
        scope.$root.$digest();
        expect(spy.callCount).toBe(2);
    });
});
