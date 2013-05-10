describe("controlgroup", function () {
    it("should wrap it's children only once into a div when called multiple times", function() {
        var el = $('<div>some content</div>');
        el.controlgroup();
        el.controlgroup();
        expect(el.find(".ui-controlgroup-controls").length).toBe(1);
    });

    it("should stamp the widget using the jqm widget", function () {
        var spy = testutils.spyOnJq('controlgroup');
        var c = testutils.compileInPage('<div data-role="controlgroup" ng-repeat="l in list"></div>');
        expect(spy.callCount).toBe(0);
        var scope = c.page.scope();
        scope.list = [1, 2];
        scope.$root.$digest();
        expect(spy.callCount).toBe(2);
    });

    it("should refresh only once when child entries are added by angular", function () {
        var d = testutils.compileInPage(
            '<div data-role="controlgroup">' +
                '<a href="" data-role="button" ng-repeat="l in list">{{l}}</a></div>');
        var list = d.element;
        var buttons = list.children("a");
        expect(buttons.length).toBe(0);
        var scope = d.element.scope();
        var spy = testutils.spyOnJq('controlgroup').andCallThrough();
        scope.list = [1, 2];
        scope.$root.$digest();
        expect(spy.callCount).toBe(1);
        buttons = list.children("div").children("a");
        expect(buttons.length).toBe(2);
        expect(buttons.eq(0).hasClass("ui-first-child")).toBe(true);
        expect(buttons.eq(0).hasClass("ui-last-child")).toBe(false);
        expect(buttons.eq(1).hasClass("ui-first-child")).toBe(false);
        expect(buttons.eq(1).hasClass("ui-last-child")).toBe(true);
    });

    it("should refresh only once when child entries are removed by angular", function () {
        var d = testutils.compileInPage(
            '<div data-role="controlgroup" ng-init="list=[1,2,3]">' +
                '<a href="" data-role="button" ng-repeat="l in list">{{l}}</a></div>');
        var list = d.element;
        var buttons = list.children("div").children("a");
        expect(buttons.length).toBe(3);
        var scope = d.element.scope();
        var spy = testutils.spyOnJq('controlgroup').andCallThrough();
        scope.list = [1];
        scope.$root.$digest();
        expect(spy.callCount).toBe(1);
        buttons = list.children("div").children("a");
        expect(buttons.length).toBe(1);
        expect(buttons.eq(0).hasClass("ui-first-child")).toBe(true);
        expect(buttons.eq(0).hasClass("ui-last-child")).toBe(true);
    });
});
