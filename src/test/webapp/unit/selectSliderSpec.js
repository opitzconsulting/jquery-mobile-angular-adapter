jqmng.require(["unit/testUtils"], function(utils) {

    describe("selectSlider", function() {
        it('should save the ui value into the model', function() {
            var d = utils.compileInPage(
                '<select ng:model="mysel" data-role="slider"><option value="v1" default="true">v1</option><option value="v2">v2</option></select>'
            );
            var select = d.element;
            var scope = select.scope();
            // jquery mobile uses an anchor to simulate the select
            var anchor = d.page.find("a");
            expect(anchor.length).toEqual(1);
            anchor.trigger('vmousedown');
            anchor.trigger('vmouseup');
            expect(scope.mysel).toEqual("v2");
        });

        it('should save the model value into the ui', function() {
            var d = utils.compileInPage('<select ng:model="mysel" data-role="slider"><option value="v1" default="true">v1</option><option value="v2">v2</option></select>');
            var select = d.element;
            var scope = d.page.scope();
            expect(select[0].value).toEqual("v1");
            // jquery mobile creates a new span
            // that displays the actual value of the select box.
            var anchor = d.page.find("a");
            expect(anchor.attr('aria-valuetext')).toEqual("v1");
            scope.mysel="v2";
            scope.$digest();
            expect(select[0].value).toEqual("v2");
            anchor = d.page.find("a");
            expect(anchor.attr('aria-valuetext')).toEqual("v2");
        });

        it('should use the disabled attribute', function() {
            var d = utils.compileInPage(
                '<select ng:model="mysel" data-role="slider" ng:bind-attr="{disabled: \'{{disabled}}\'}"><option value="v1" default="true">v1</option><option value="v2">v2</option></select>');
            var select = d.element;
            var scope = select.scope();
            scope.disabled = false;
            scope.$digest();
            var disabled = select.slider('option', 'disabled');
            expect(disabled).toEqual(false);
            scope.disabled = true;
            scope.$digest();
            var disabled = select.slider('option', 'disabled');
            expect(disabled).toEqual(true);
        });

        it('should be removable', function() {
            var d = utils.compileInPage('<div>' +
                '<select ng:model="mysel" data-role="slider"><option value="v1" default="true">v1</option></select>' +
                '<select name="mysel2" data-role="slider"><option value="v1" default="true">v1</option></select>' +
                '</div>');
            var container = d.element;
            var scope = container.scope();
            expect(container.children('div').length).toEqual(2);
            // removal of the slider should also remove the parent div
            container.find("select").eq(0).remove();
            expect(container.children('div').length).toEqual(1);
        });
    });

});
