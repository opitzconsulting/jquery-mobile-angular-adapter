describe("inputSlider", function () {
    it("should stamp the widget using the jqm widget", function() {
        var createCount = 0;
        var spy = testutils.spyOnJq('slider').andCallFake(function() {
            if (arguments.length===0) {
                createCount++;
            }
        });
        var c = testutils.compileInPage('<input type="number" data-type="range" ng-repeat="l in list">');
        expect(spy.callCount).toBe(0);
        var scope = c.page.scope();
        scope.list = [1,2];
        scope.$root.$digest();
        expect(createCount).toBe(2);
    });

    it("should create a textinput and slider widget for the element", function() {
        var sliderSpy = testutils.spyOnJq('slider').andCallThrough();
        var textinputSpy = testutils.spyOnJq('textinput').andCallThrough();
        testutils.compileInPage('<input type="number" data-type="range">');
        expect(sliderSpy).toHaveBeenCalled();
        expect(textinputSpy).toHaveBeenCalled();
    });

    it('should have pristine state after init and use the min value as initial value in the scope', function() {
        var d = testutils.compileInPage('<form name="form"><input type="number" data-type="range" name="s1" ng-model="s1" min="0" max="300">'+
            '<input type="number" data-type="range" name="s2" ng-model="s2" max="300"></form>');
        var scope = d.page.scope();
        expect(scope.form.$pristine).toBe(true);
        expect(scope.form.s1.$pristine).toBe(true);
        expect(scope.form.s2.$pristine).toBe(true);

        expect(scope.s1).toBe(0);
        var slider1 = d.page.find("input[name='s1']");
        expect(slider1.val()).toBe('0');
    });

    it('should save the ui text value into the model', function () {
        var d = testutils.compileInPage('<input type="number" data-type="range"  ng-model="mysel" min="0" max="300">');
        var input = d.page.find("input");
        var scope = input.scope();
        input.val(100);
        testutils.triggerInputEvent(input);
        expect(scope.mysel).toBe(100);
    });

    it("should save the ui slider value into the model", function() {
        var d = testutils.compileInPage('<input type="number" data-type="range"  ng-model="mysel" min="0" max="100">');
        var input = d.page.find("input");
        var slider = input.data($.mobile.slider.prototype.widgetFullName).slider;
        var event = $.Event("mousedown");
        var expectedValue = 50;
        event.pageX = (expectedValue * slider.width() / 100) + slider.offset().left;
        slider.trigger(event);
        expect(input.val()).toBe('50');

        var scope = input.scope();
        expect(scope.mysel).toBe(50);
    });

    it('should save the model value into the ui and refresh', function () {
        var d = testutils.compileInPage('<input type="number" data-type="range"  ng-model="mysel" min="0" max="300">');
        var input = d.page.find("input");
        var container = input.parent();
        var scope = input.scope();
        scope.mysel = 100;
        scope.$root.$digest();
        expect(input[0].value).toEqual("100");
        expect(container.find("a").eq(0).attr("aria-valuenow")).toBe("100");
    });

    it('should save an initial model value into the ui and refresh', inject(function ($rootScope) {
        var d = testutils.compileInPage('<div ng-init="mysel=15"><input type="number" data-type="range" ng-model="mysel" min="0" max="300"></div>');
        $rootScope.$digest();
        var input = d.page.find("input");
        var container = input.parent();
        var scope = input.scope();
        expect(input[0].value).toEqual("15");
        expect(container.find("a").eq(0).attr("aria-valuenow")).toBe("15");
    }));

    it('should use the disabled attribute', function () {
        var d = testutils.compileInPage('<input type="number" data-type="range"  ng-model="mysel" value="150" min="0" max="300" ng-disabled="disabled">');
        var input = d.page.find("input");
        var scope = input.scope();
        scope.disabled = false;
        scope.$root.$digest();
        var disabled = input.slider('option', 'disabled');
        expect(disabled).toEqual(false);
        scope.disabled = true;
        scope.$root.$digest();
        disabled = input.slider('option', 'disabled');
        expect(disabled).toEqual(true);
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
