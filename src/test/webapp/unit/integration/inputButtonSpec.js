describe("input button", function () {

    it("should stamp the widget using the jqm widget", function() {
        var spy = testutils.spyOnJq('button');
        var c = testutils.compileInPage('<input type="button" ng-repeat="l in list">');
        expect(spy.callCount).toBe(0);
        var scope = c.page.scope();
        scope.list = [1,2];
        scope.$root.$digest();
        expect(spy.callCount).toBe(2);
    });

    it('should allow clicks via ng-click', function () {
        var d = testutils.compileInPage('<input type="button" id="mysel" ng-click="flag = true">Test');
        var page = d.page;
        var input = d.element;
        var scope = input.scope();
        expect(scope.flag).toBeFalsy();
        input.trigger('click');
        expect(scope.flag).toBeTruthy();
    });

    it('should use the disabled attribute', function () {
        var d = testutils.compileInPage('<input type="button" id="mysel" ng-click="flag = true" ng-disabled="disabled">Test');
        var page = d.page;
        var input = d.element;
        var scope = input.scope();
        var parentDiv = input.parent();
        scope.disabled = false;
        scope.$root.$digest();
        expect(parentDiv.hasClass('ui-disabled')).toBeFalsy();
        scope.disabled = true;
        scope.$root.$digest();
        expect(parentDiv.hasClass('ui-disabled')).toBeTruthy();
    });

    it('should be removable', function () {
        var d = testutils.compileInPage('<div><input type="button">1<input type="button">2</div>');
        var page = d.page;
        var container = d.element;
        var scope = container.scope();
        expect(container.children('div').length).toEqual(2);
        // removal of the button should also remove the parent div
        container.find('input').eq(0).remove();
        expect(container.children('div').length).toEqual(1);
    });
});
