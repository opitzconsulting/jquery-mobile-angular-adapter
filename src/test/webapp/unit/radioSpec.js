define(["unit/testUtils"], function(utils) {

    describe("radio", function() {

        it('should save the ui value into the model', function() {
            var d = utils.compileInPage('<div>' +
                '<input name="mysel" id="mysel" type="radio" value="v1"><label for="mysel" id="mylab">Entry</label>' +
                '</div>');
            var input = d.element.find("input");
            var scope = input.scope();
            expect(scope.$get('mysel')).toBeFalsy();
            // jquery mobile reacts to clicks on the label
            var label = d.element.find('label');
            expect(label.length).toEqual(1);
            label.trigger('click');
            expect(scope.$get('mysel')).toEqual("v1");

        });
        it('should save the model value into the ui', function() {
            var d = utils.compileInPage('<div>' +
                '<input name="mysel" id="mysel" type="radio" value="v1"><label for="mysel" id="mylab">Entry</label>' +
                '</div>');
            var input = d.element.find("input");
            var scope = input.scope();
            expect(input[0].checked).toBeFalsy();
            // jquery mobile creates a new span
            // that displays the actual value of the selection.
            var iconSpan = d.element.find(".ui-icon");
            expect(iconSpan.hasClass('ui-icon-radio-on')).toBeFalsy();
            scope.$set("mysel", "v1");
            scope.$eval();
            expect(input[0].checked).toBeTruthy();
            expect(iconSpan.hasClass('ui-icon-radio-on')).toBeTruthy();
        });

        it('should use the disabled attribute', function() {
            var d = utils.compileInPage(
                '<div>' +
                    '<input name="mysel" id="mysel" type="radio" value="v1" ng:bind-attr="{disabled: \'{{disabled}}\'}"><label for="mysel" id="mylab">Entry</label>' +
                    '</div>');
            var input = d.element.find("input");
            var parentDiv = input.parent();
            var scope = parentDiv.scope();
            scope.$set('disabled', false);
            scope.$eval();
            expect(parentDiv.hasClass('ui-disabled')).toBeFalsy();
            scope.$set('disabled', true);
            scope.$eval();
            expect(parentDiv.hasClass('ui-disabled')).toBeTruthy();
        });
    });

});