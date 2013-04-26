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

    it('should be refreshable', function() {
        var navbar = $('<div><ul><li><a href="#">One</a></li></ul></div>');
        navbar.navbar();
        expect(navbar.find("ul")[0].className).toBe('ui-grid-solo');
        expect(navbar.find("li")[0].className).toBe('ui-block-a');
        expect(navbar.find("a").eq(0).hasClass("ui-btn")).toBe(true);

        navbar.find("ul").append('<li><a href="#">Two</a></li>');
        navbar.navbar("refresh");
        expect(navbar.find("ul")[0].className).toBe('ui-grid-a');
        expect(navbar.find("li")[0].className).toBe('ui-block-a');
        expect(navbar.find("li")[1].className).toBe('ui-block-b');
        expect(navbar.find("a").eq(0).hasClass("ui-btn")).toBe(true);
        expect(navbar.find("a").eq(1).hasClass("ui-btn")).toBe(true);
    });

    it('should unregister the old click listener on refresh', function() {
        var navbar = $('<div><ul><li><a href="#">One</a></li></ul></div>');
        navbar.navbar();
        var addClassSpy = spyOn($.fn, "addClass").andCallThrough();
        navbar.find("a").trigger("vclick");
        expect(addClassSpy.callCount).toBe(1);
        navbar.find("a").removeClass("ui-btn-active");
        navbar.navbar("refresh");
        addClassSpy.reset();
        navbar.find("a").trigger("vclick");
        expect(addClassSpy.callCount).toBe(1);
    });

    it('should refresh if children lis change', function() {
        var d = testutils.compileInPage('<div data-role="navbar"><ul><li ng-repeat="l in list"><a href="#">{{l}}</a></li></ul></div>');
        var scope = d.element.scope();
        var navbar = d.element;
        scope.list = [1];
        scope.$apply();
        expect(navbar.find("ul")[0].className).toBe('ui-grid-solo');
        expect(navbar.find("li")[0].className).toBe('ng-scope ui-block-a');
        expect(navbar.find("a").eq(0).hasClass("ui-btn")).toBe(true);

        scope.list = [1,2];
        scope.$apply();
        expect(navbar.find("ul")[0].className).toBe('ui-grid-a');
        expect(navbar.find("li")[0].className).toBe('ng-scope ui-block-a');
        expect(navbar.find("li")[1].className).toBe('ng-scope ui-block-b');
        expect(navbar.find("a").eq(0).hasClass("ui-btn")).toBe(true);
        expect(navbar.find("a").eq(1).hasClass("ui-btn")).toBe(true);
    });
});
