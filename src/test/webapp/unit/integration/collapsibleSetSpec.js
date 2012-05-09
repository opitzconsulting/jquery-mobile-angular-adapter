describe("collapsibleset", function () {
    it("should stamp the widget using the jqm widget", function() {
        spyOn($.fn, 'collapsibleset');
        var c = testutils.compileInPage('<ul data-role="collapsible-set" ng-repeat="l in list"></ul>');
        expect($.fn.collapsibleset.callCount).toBe(0);
        var scope = c.page.scope();
        scope.list = [1,2];
        scope.$root.$digest();
        expect($.fn.collapsibleset.callCount).toBe(2);
    });

    it("should refresh only once when child entries are added by angular", function() {
        var d = testutils.compileInPage(
            '<div data-role="collapsible-set">' +
                '<div data-role="collapsible" ng-repeat="l in list"><h3>{{l}}</h3></div></div>');
        var list = d.element;
        var entries = list.children("div");
        expect(entries.length).toBe(0);
        var scope = d.element.scope();
        var collapsibleset = list.data("collapsibleset");
        spyOn(collapsibleset, 'refresh').andCallThrough();
        scope.list = [1,2];
        scope.$digest();
        expect(collapsibleset.refresh.callCount).toBe(1);
        var entries = list.children("div");
        expect(entries.length).toBe(2);
        expect(entries.eq(0).find("a").hasClass("ui-corner-top")).toBe(true);
        expect(entries.eq(0).find("a").hasClass("ui-corner-bottom")).toBe(false);
        expect(entries.eq(1).find("a").hasClass("ui-corner-top")).toBe(false);
        expect(entries.eq(1).find("a").hasClass("ui-corner-bottom")).toBe(true);
    });

    it("should refresh only once when child entries are removed by angular", function() {
        var d = testutils.compileInPage(
            '<div data-role="collapsible-set" ng-init="list = [1,2,3]">' +
                '<div data-role="collapsible" ng-repeat="l in list"><h3>{{l}}</h3></div></div>');
        var list = d.element;
        var lis = list.children("div");
        expect(lis.length).toBe(3);
        var scope = d.element.scope();
        scope.list = [1];
        var collapsibleset = list.data("collapsibleset");
        spyOn(collapsibleset, 'refresh').andCallThrough();
        scope.$digest();
        expect(collapsibleset.refresh.callCount).toBe(1);
        var lis = list.children("div");
        expect(lis.length).toBe(1);
        expect(lis.eq(0).find("a").hasClass("ui-corner-top")).toBe(true);
        expect(lis.eq(0).find("a").hasClass("ui-corner-bottom")).toBe(true);
    });

});
