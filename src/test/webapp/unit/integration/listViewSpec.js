describe("listview", function () {
    it("should stamp the widget using the jqm widget", function () {
        var spy = testutils.spyOnJq('listview');
        var c = testutils.compileInPage('<ul data-role="listview" ng-repeat="l in list"></ul>');
        expect(spy.callCount).toBe(0);
        var scope = c.page.scope();
        scope.list = [1, 2];
        scope.$root.$digest();
        expect(spy.callCount).toBe(2);
    });

    it("should refresh only once when child entries are added by angular", function () {
        var d = testutils.compileInPage(
            '<ul data-role="listview" data-inset="true">' +
                '<li ng-repeat="l in list">{{l}}</li></ul>');
        var list = d.element;
        var lis = list.children("li");
        expect(lis.length).toBe(0);
        var scope = d.element.scope();
        var listview = list.data("listview");
        spyOn(listview, 'refresh').andCallThrough();
        scope.list = [1, 2];
        scope.$digest();
        expect(listview.refresh.callCount).toBe(1);
        var lis = list.children("li");
        expect(lis.length).toBe(2);
        expect(lis.eq(0).hasClass("ui-corner-top")).toBe(true);
        expect(lis.eq(0).hasClass("ui-corner-bottom")).toBe(false);
        expect(lis.eq(1).hasClass("ui-corner-top")).toBe(false);
        expect(lis.eq(1).hasClass("ui-corner-bottom")).toBe(true);
    });

    it("should refresh only once when child entries are removed by angular", function () {
        var d = testutils.compileInPage(
            '<ul data-role="listview" data-inset="true" ng-init="list = [1,2,3]">' +
                '<li ng-repeat="l in list">{{l}}</li></ul>');
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

    it("should remove all ui-* css classes form <li>s when they get a $childrenChanged event", function () {
        var d = testutils.compileInPage('<ul data-role="listview"><li></li></ul>');
        var lis = d.element.children("li");
        expect(lis.hasClass("ui-li")).toBe(true);
        lis.addClass("ui-someClass");
        lis.addClass("someClass");
        lis.trigger("$childrenChanged");
        expect(lis.hasClass("ui-li")).toBe(false);
        expect(lis.hasClass("ui-someClass")).toBe(false);
        expect(lis.hasClass("someClass")).toBe(true);

    });

    it("should remove the button markup form <li>s that contain anchors when they get a $childrenChanged event", function () {
        var d = testutils.compileInPage('<ul data-role="listview"><li><a href=""></a></li></ul>');
        var li = d.element.children("li");
        expect(li.hasClass("ui-btn")).toBe(true);
        expect(li.children("div").children("div").children("a").length).toBe(1);
        expect(li.children("a").length).toBe(0);
        li.trigger("$childrenChanged");
        expect(li.children("div").length).toBe(0);
        expect(li.children("a").length).toBe(1);
    });

    it("should refresh lis whose children change", function() {
        var d = testutils.compileInPage('<ul data-role="listview"><li><a ng-repeat="l in list" href="">{{l}}</a></li></ul>');
        var li = d.element.children("li");
        expect(li.hasClass("ui-btn")).toBe(false);
        var scope = d.element.scope();
        scope.list = [1];
        scope.$root.$digest();
        expect(li.hasClass("ui-btn")).toBe(true);
        expect(li.children("div").children("div").children("a").text()).toBe('1');

        scope.list = [2,3];
        scope.$root.$digest();
        expect(li.hasClass("ui-btn")).toBe(true);
        expect(li.children("div").children("div").children("a").text()).toBe('2');
        expect(li.children("a").attr("title")).toBe('3');

        scope.list = [4,5];
        scope.$root.$digest();
        expect(li.hasClass("ui-btn")).toBe(true);
        expect(li.children("div").children("div").children("a").text()).toBe('4');
        expect(li.children("a").attr("title")).toBe('5');
    });

});
