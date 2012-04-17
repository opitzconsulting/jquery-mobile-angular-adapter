describe("inputSlider", function () {
    it('should save the ui value into the model', function () {
        var d = testutils.compileInPage('<input type="number" data-type="range"  ng-model="mysel" min="0" max="300">');
        var input = d.element;
        var scope = input.scope();
        input.val(100);
        testutils.triggerInputEvent(input);
        expect(scope.mysel).toEqual("100");
    });

    it('should save the model value into the ui', function () {
        var d = testutils.compileInPage('<input type="number" data-type="range"  ng-model="mysel" min="0" max="300">');
        var input = d.element;
        var scope = input.scope();
        scope.mysel = "100";
        scope.$root.$digest();
        expect(input[0].value).toEqual("100");
    });

    it('should use the disabled attribute', function () {
        var d = testutils.compileInPage('<input type="number" data-type="range"  ng-model="mysel" value="150" min="0" max="300" ng-disabled="disabled">');
        var input = d.element;
        var scope = input.scope();
        scope.disabled = false;
        scope.$root.$digest();
        var disabled = input.slider('option', 'disabled');
        expect(disabled).toEqual(false);
        scope.disabled = true;
        scope.$root.$digest();
        var disabled = input.slider('option', 'disabled');
        expect(disabled).toEqual(true);

    });
    it('should be removable', function () {
        var d = testutils.compileInPage('<div>' +
            '<input type="number" data-type="range" value="150" min="0" max="300">' +
            '<input type="number" data-type="range" value="150" min="0" max="300">' +
            '</div>');
        var container = d.element;
        var scope = container.scope();
        expect(container.children('div').length).toEqual(2);
        // removal of the slider should also remove the parent div
        container.find('input').eq(0).remove();
        expect(container.children('div').length).toEqual(1);
    });
});
