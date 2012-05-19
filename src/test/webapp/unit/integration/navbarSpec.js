describe("navbar", function () {
    it("should stamp the widget using the jqm widget", function() {
        var spy = testutils.spyOnJq('navbar');
        var c = testutils.compileInPage('<div data-role="navbar" ng-repeat="l in list"></div>');
        expect(spy.callCount).toBe(0);
        var scope = c.page.scope();
        scope.list = [1,2];
        scope.$root.$digest();
        expect(spy.callCount).toBe(2);
    });

    it('should change the selection on click', function () {
        var d = testutils.compileInPage('<div data-role="navbar"><ul><li><a href="#">One</a></li></ul></div>');
        var link = d.element.find('a');
        expect(link.hasClass($.mobile.activeBtnClass)).toBe(false);
        link.trigger('vclick');
        expect(link.hasClass($.mobile.activeBtnClass)).toBe(true);
    });
});
