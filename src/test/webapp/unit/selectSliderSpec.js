define(["unit/testUtils"], function(utils) {

    describe("selectSlider", function() {
        it('should save the ui value into the model', function() {
            // Note: Be sure to use ng:repeat, as this is the most problematic case!
            var d = utils.compileInPage(
                '<select ng:repeat="item in [1]" name="mysel" id="mysel" data-role="slider"><option value="v1" default="true">v1</option><option value="v2">v2</option></select>'
            );
            var select = d.element;
            var scope = select.scope();
            expect(scope.$get('mysel')).toEqual("v1");
            // jquery mobile uses an anchor to simulate the select
            var anchor = d.page.find("a");
            expect(anchor.length).toEqual(1);
            anchor.trigger('vmousedown');
            anchor.trigger('vmouseup');
            expect(scope.$get('mysel')).toEqual("v2");
        });

        it('should save the model value into the ui', function() {
            // Note: Be sure to use ng:repeat, as this is the most problematic case!
            var d = utils.compileInPage('<select ng:repeat="item in [1]" name="mysel" id="mysel" data-role="slider"><option value="v1" default="true">v1</option><option value="v2">v2</option></select>');
            var select = d.element;
            var scope = select.scope();
            expect(select[0].value).toEqual("v1");
            // jquery mobile creates a new span
            // that displays the actual value of the select box.
            var anchor = d.page.find("a");
            expect(anchor.attr('aria-valuetext')).toEqual("v1");
            scope.$set("mysel", "v2");
            scope.$eval();
            expect(select[0].value).toEqual("v2");
            anchor = d.page.find("a");
            expect(anchor.attr('aria-valuetext')).toEqual("v2");
        });

        it('should use the disabled attribute', function() {
            // Note: Be sure to use ng:repeat, as this is the most problematic case!
            var d = utils.compileInPage(
                '<select ng:repeat="item in [1]" name="mysel" id="mysel" data-role="slider" ng:bind-attr="{disabled: \'{{disabled}}\'}"><option value="v1" default="true">v1</option><option value="v2">v2</option></select>');
            var select = d.element;
            var scope = select.scope();
            scope.$set('disabled', false);
            scope.$eval();
            var disabled = select.slider('option', 'disabled');
            expect(disabled).toEqual(false);
            scope.$set('disabled', true);
            scope.$eval();
            var disabled = select.slider('option', 'disabled');
            expect(disabled).toEqual(true);
        });

        it('should be removable when ng:repeat shrinks', function() {
            var d = utils.compileInPage('<div ng:init="mylist = [1,2]">' +
                '<select ng:repeat="item in mylist" name="mysel" id="mysel" data-role="slider"><option value="v1" default="true">v1</option><option value="v2">v2</option></select>' +
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
