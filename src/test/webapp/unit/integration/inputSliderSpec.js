describe("inputSlider", function () {
    it("should stamp the widget using the jqm widget", function() {
        var spy = testutils.spyOnJq('slider').andCallThrough();
        var c = testutils.compileInPage('<input type="number" data-type="range" ng-repeat="l in list">');
        expect(spy.callCount).toBe(0);
        var scope = c.page.scope();
        scope.list = [1,2];
        scope.$root.$digest();
        expect(spy.callCount).toBe(2);
    });

    it('should save the ui text value into the model', function () {
        var d = testutils.compileInPage('<input type="number" data-type="range"  ng-model="mysel" min="0" max="300">');
        var input = d.element;
        var scope = input.scope();
        input.val(100);
        testutils.triggerInputEvent(input);
        expect(scope.mysel).toEqual("100");
    });

    it("should save the ui slider value into the model", function() {
        var d = testutils.compileInPage('<input type="number" data-type="range"  ng-model="mysel" min="0" max="100">');
        var input = d.element;
        var slider = input.data("slider").slider;
        var event = jQuery.Event("mousedown");
        var expectedValue = 50;
        event.pageX = (expectedValue * slider.width() / 100) + slider.offset().left;
        slider.trigger(event);
        expect(input.val()).toBe('50');

        var scope = input.scope();
        expect(scope.mysel).toEqual("50");
    });

    it('should save the model value into the ui and refresh', function () {
        var d = testutils.compileInPage('<input type="number" data-type="range"  ng-model="mysel" min="0" max="300">');
        var input = d.element;
        var container = input.parent();
        var scope = input.scope();
        scope.mysel = "100";
        scope.$root.$digest();
        expect(input[0].value).toEqual("100");
        expect(container.find("a").eq(0).attr("aria-valuenow")).toBe("100");
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

    it('should wrap the element and the slider into a new parent div so that it does not confuse the angular compiler', function() {
        // If we have two sliders after each other, and allow the slider to append
        // elements after the input elements, the angular compiler gets confused...
        var c = testutils.compileInPage('<div>' +
            '<input type="number" data-type="range" value="150" min="0" max="300">' +
            '<input type="number" data-type="range" value="150" min="0" max="300">' +
            '</div>');
        var div = c.element;
        expect(div.children("div").eq(0).children("input").length).toBe(1);
        expect(div.children("div").eq(0).children("div[role='application']").length).toBe(1);
        expect(div.children("div").eq(1).children("input").length).toBe(1);
        expect(div.children("div").eq(1).children("div[role='application']").length).toBe(1);
    });

    it('should be removable', function () {
        var d = testutils.compileInPage('<div ng-init="list=[1,2]">' +
            '<input type="number" data-type="range" value="150" min="0" max="300" ng-repeat="l in list">' +
            '</div>');
        var container = d.element;
        var scope = container.scope();
        expect(container.children('div').length).toEqual(2);
        scope.list = [1];
        scope.$root.$digest();
        expect(container.children('div').length).toEqual(1);
    });
});
