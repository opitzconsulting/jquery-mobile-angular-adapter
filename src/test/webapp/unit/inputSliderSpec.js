define(["unit/testUtils"], function(utils) {

    describe("inputSlider", function() {
        it('should save the ui value into the model', function() {
            // Note: Be sure to use ng:repeat, as this is the most problematic case!
            var d = utils.compileInPage('<input ng:repeat="l in [0] " type="number" data-type="range"  name="mysel" id="mysel" value="150" min="0" max="300">');
            var input = d.element;
            var scope = input.scope();
            expect(scope.$get('mysel')).toEqual("150");
            input.val(100);
            input.trigger('change');
            expect(scope.$get('mysel')).toEqual("100");
        });

        it('should save the model value into the ui', function() {
            // Note: Be sure to use ng:repeat, as this is the most problematic case!
            var d = utils.compileInPage('<input ng:repeat="l in [0] " type="number" data-type="range"  name="mysel" id="mysel" value="150" min="0" max="300">');
            var input = d.element;
            var scope = input.scope();
            expect(input[0].value).toEqual("150");
            scope.$set("mysel", "100");
            scope.$eval();
            expect(input[0].value).toEqual("100");
        });

        it('should use the disabled attribute', function() {
            // Note: Be sure to use ng:repeat, as this is the most problematic case!
            var d = utils.compileInPage('<input ng:repeat="l in [0] " type="number" data-type="range"  name="mysel" id="mysel" value="150" min="0" max="300" ng:bind-attr="{disabled: \'{{disabled}}\'}">');
            var input = d.element;
            var scope = input.scope();
            scope.$set('disabled', false);
            scope.$eval();
            var disabled = input.slider('option', 'disabled');
            expect(disabled).toEqual(false);
            scope.$set('disabled', true);
            scope.$eval();
            var disabled = input.slider('option', 'disabled');
            expect(disabled).toEqual(true);

        });
        it('should be removable when ng:repeat shrinks', function() {
            var d = utils.compileInPage('<div ng:init="mylist = [1,2]">' +
                '<input ng:repeat="l in mylist " type="number" data-type="range" name="mysel" id="mysel" value="150" min="0" max="300">' +
                '</div>');
            var container = d.element;
            var scope = container.scope();
            expect(container.children('.ui-slider').length).toEqual(2);
            scope.mylist = [1];
            scope.$eval();
            expect(container.children('.ui-slider').length).toEqual(1);
        });
    });

});