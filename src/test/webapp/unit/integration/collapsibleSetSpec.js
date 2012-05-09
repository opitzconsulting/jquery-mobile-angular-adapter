describe("listview", function () {
    it("should stamp the widget using the jqm widget", function() {
        spyOn($.fn, 'listview');
        var c = testutils.compileInPage('<ul data-role="listview" ng-repeat="l in list"></ul>');
        expect($.fn.listview.callCount).toBe(0);
        var scope = c.page.scope();
        scope.list = [1,2];
        scope.$root.$digest();
        expect($.fn.listview.callCount).toBe(2);
    });

    it("should refresh only once when child entries are added by angular", function() {
        var d = testutils.compileInPage(
            '<ul data-role="listview" data-inset="true">' +
                '<li ng-repeat="l in list">{{l}}</li></ul>');
        var list = d.element;
        var lis = list.children("li");
        expect(lis.length).toBe(0);
        var scope = d.element.scope();
        var listview = list.data("listview");
        spyOn(listview, 'refresh').andCallThrough();
        scope.list = [1,2];
        scope.$digest();
        expect(listview.refresh.callCount).toBe(1);
        var lis = list.children("li");
        expect(lis.length).toBe(2);
        expect(lis.eq(0).hasClass("ui-corner-top")).toBe(true);
        expect(lis.eq(0).hasClass("ui-corner-bottom")).toBe(false);
        expect(lis.eq(1).hasClass("ui-corner-top")).toBe(false);
        expect(lis.eq(1).hasClass("ui-corner-bottom")).toBe(true);
    });

    it("should refresh only once when child entries are removed by angular", function() {
        var d = testutils.compileInPage(
            '<ul data-role="listview" data-inset="true" ng-init="list = [1,2,3]">' +
            '<li ng-repeat="l in list">{{l}}</li></ul>');
        // d.element.scope().$digest();
        var list = d.element;
        var lis = list.children("li");
        expect(lis.length).toBe(3);
        var scope = d.element.scope();
        scope.list = [1];
        var listview = list.data("listview");
        spyOn(listview, 'refresh').andCallThrough();
        scope.$digest();
        expect(listview.refresh.callCount).toBe(1);
        var lis = list.children("li");
        expect(lis.length).toBe(1);
        expect(lis.eq(0).hasClass("ui-corner-top")).toBe(true);
        expect(lis.eq(0).hasClass("ui-corner-bottom")).toBe(true);
    });

    it('should be removable when subpages are used', function () {
        var d = testutils.compileInPage('<div>' +
            '<ul data-role="listview" id="list1">' +
            '<li>Test' +
            '<ul><li>Item 2.1</li><li>Item 2.2</li></ul>' +
            '</li></ul>' +
            '</div>');
        var container = d.element;
        var list = container.children('ul');
        // ui select creates sub pages for nested uls.
        expect($(":jqmData(role='page')").length).toEqual(2);
        list.remove();
        expect($(":jqmData(role='page')").length).toEqual(1);
    });
});
