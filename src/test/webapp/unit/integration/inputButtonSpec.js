describe("input button", function () {

    it('should allow clicks via ng-click', function () {
        var d = testutils.compileInPage(
            '<input type="submit" ng-click="flag = true">'
        );
        var input = d.element;
        var scope = input.scope();
        expect(scope.flag).toBeFalsy();
        input.trigger('click');
        expect(scope.flag).toBeTruthy();
    });

    it('should use the disabled attribute', function () {
        var d = testutils.compileInPage(
            '<input type="submit" ng-click="flag = true" ng-disabled="disabled">');
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
        var d = testutils.compileInPage('<div>' +
            '<input type="submit" value="1"><input type="submit" value="2"></input>' +
            '</div>');
        var container = d.element;
        var scope = container.scope();
        expect(container.children('div').length).toEqual(2);
        // removal of the button should also remove the parent div
        container.find('input').eq(0).remove();
        expect(container.children('div').length).toEqual(1);
    });
});
