define(["unit/testUtils"], function(utils) {

    describe("checkbox", function() {
        it('should save the ui value into the model', function() {
            var d = utils.compileInPage('<div>' +
                '<input name="mysel" id="mysel" type="checkbox">{{mysel}}<label for="mysel" id="mylab">Entry</label>' +
                '</div>');
            var page = d.page;
            var input = page.find("#mysel");
            var scope = input.scope();
            expect(scope.$get('mysel')).toBeFalsy();
            // jquery mobile reacts to clicks on the label
            var label = page.find('label');
            expect(label.length).toEqual(1);
            label.trigger('vclick');
            expect(scope.$get('mysel')).toBeTruthy();

        });

        it('should save the model value into the ui', function() {
            var d = utils.compileInPage(
                '<div>' +
                    '<input name="mysel" id="mysel" type="checkbox"><label for="mysel" id="mylab">Entry</label>' +
                    '</div>');
            var page = d.page;
            var input = page.find("#mysel");
            var scope = input.scope();
            expect(input[0].checked).toBeFalsy();
            // jquery mobile creates a new span
            // that displays the actual value of the selection.
            var iconSpan = page.find(".ui-icon");
            expect(iconSpan.hasClass('ui-icon-checkbox-on')).toBeFalsy();
            scope.$set("mysel", true);
            scope.$eval();
            expect(input[0].checked).toBeTruthy();
            expect(iconSpan.hasClass('ui-icon-checkbox-on')).toBeTruthy();
        });

        it('should use the disabled attribute', function() {
            var d = utils.compileInPage(
                '<div>' +
                    '<input name="mysel" id="mysel" type="checkbox" value="false" ng:bind-attr="{disabled: \'{{disabled}}\'}"><label for="mysel" id="mylab">Entry</label>' +
                    '</div>');
            var page = d.page;
            var input = page.find("#mysel");
            var parentDiv = input.parent();
            var scope = input.scope();
            scope.$set('disabled', false);
            scope.$eval();
            expect(parentDiv.hasClass('ui-disabled')).toBeFalsy();
            scope.$set('disabled', true);
            scope.$eval();
            expect(parentDiv.hasClass('ui-disabled')).toBeTruthy();
        });
    });

});