describe('ng-repeat', function () {
    it("should refresh children when the list grows", function () {
        var c = testutils.compileInPage('<div><a href="" data-role="button" ng-repeat="l in list"></a></div>');
        var element = c.element;
        var scope = element.scope();
        scope.list = [0, 1, 3];
        scope.$root.$digest();
        expect(c.element.children().hasClass("ui-btn")).toBe(true);
    });

    it('should append new elements at the same level even when they wrap themselves in new parents', function () {
        var c = testutils.compileInPage('<div><button ng-repeat="l in list"></button></div>');
        var scope = c.element.scope();
        scope.list = [1];
        scope.$root.$digest();
        // Button should add a parent
        expect(c.element.children('div').length).toBe(1);
        scope.list = [1, 2];
        scope.$root.$digest();
        expect(c.element.children('div').length).toBe(2);
    });
});

