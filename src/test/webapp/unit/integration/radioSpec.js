describe("radio", function () {

    it('should save the ui value into the model', function () {
        var d = testutils.compileInPage('<div>' +
            '<input ng-model="mysel" id="mysel" type="radio" value="v1"><label for="mysel" id="mylab">Entry</label>' +
            '</div>');
        var input = d.element.find("input");
        var scope = input.scope();
        expect(scope.mysel).toBeFalsy();
        // jquery mobile reacts to clicks on the label
        var label = d.element.find('label');
        expect(label.length).toEqual(1);
        label.trigger('click');
        expect(scope.mysel).toEqual("v1");

    });
    it('should save the model value into the ui', function () {
        var d = testutils.compileInPage('<div>' +
            '<input ng-model="mysel" id="mysel" type="radio" value="v1"><label for="mysel" id="mylab">Entry</label>' +
            '</div>');
        var input = d.element.find("input");
        var scope = input.scope();
        expect(input[0].checked).toBeFalsy();
        // jquery mobile creates a new span
        // that displays the actual value of the selection.
        var iconSpan = d.element.find(".ui-icon");
        expect(iconSpan.hasClass('ui-icon-radio-on')).toBeFalsy();
        scope.mysel = "v1";
        scope.$root.$digest();
        expect(input[0].checked).toBeTruthy();
        expect(iconSpan.hasClass('ui-icon-radio-on')).toBeTruthy();
    });

    it('should use the disabled attribute', function () {
        var d = testutils.compileInPage(
            '<div>' +
                '<input ng-model="mysel" id="mysel" type="radio" value="v1" ng-disabled="disabled"><label for="mysel" id="mylab">Entry</label>' +
                '</div>');
        var input = d.element.find("input");
        var parentDiv = input.parent();
        var scope = parentDiv.scope();
        scope.disabled = false;
        scope.$root.$digest();
        expect(parentDiv.hasClass('ui-disabled')).toBeFalsy();
        scope.disabled = true;
        scope.$root.$digest();
        expect(parentDiv.hasClass('ui-disabled')).toBeTruthy();
    });
});
