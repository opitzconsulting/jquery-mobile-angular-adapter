jqmng.require(["unit/testUtils"], function(utils) {

    describe("checkbox", function() {
        it('should save the ui value into the model', function() {
            var d = utils.compileInPage('<div>' +
                '<input ng:model="mysel" id="mysel" type="checkbox">{{mysel}}<label for="mysel" id="mylab">Entry</label>' +
                '</div>');
            var page = d.page;
            var input = page.find("#mysel");
            var scope = input.scope();
            expect(scope.mysel).toBeFalsy();
            // jquery mobile reacts to clicks on the label
            var label = page.find('label');
            expect(label.length).toEqual(1);
            label.trigger('vclick');
            expect(scope.mysel).toBeTruthy();

        });

        it('should save the model value into the ui', function() {
            var d = utils.compileInPage(
                '<div>' +
                    '<input ng:model="mysel" id="mysel" type="checkbox"><label for="mysel" id="mylab">Entry</label>' +
                    '</div>');
            var page = d.page;
            var input = page.find("#mysel");
            var scope = input.scope();
            expect(input[0].checked).toBeFalsy();
            // jquery mobile creates a new span
            // that displays the actual value of the selection.
            var iconSpan = page.find(".ui-icon");
            expect(iconSpan.hasClass('ui-icon-checkbox-on')).toBeFalsy();
            scope.mysel = true;
            scope.$digest();
            expect(input[0].checked).toBeTruthy();
            expect(iconSpan.hasClass('ui-icon-checkbox-on')).toBeTruthy();
        });

        it('should use the disabled attribute', function() {
            var d = utils.compileInPage(
                '<div>' +
                    '<input ng:model="mysel" id="mysel" type="checkbox" value="false" disabled="{{disabled}}"><label for="mysel" id="mylab">Entry</label>' +
                    '</div>');
            var page = d.page;
            var input = page.find("#mysel");
            var parentDiv = input.parent();
            var scope = input.scope();
            scope.disabled = false;
            scope.$digest();
            expect(parentDiv.hasClass('ui-disabled')).toBeFalsy();
            scope.disabled = true;
            scope.$digest();
            expect(parentDiv.hasClass('ui-disabled')).toBeTruthy();
        });
    });

});