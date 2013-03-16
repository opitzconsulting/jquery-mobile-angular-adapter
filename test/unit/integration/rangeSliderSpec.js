describe("rangeSlider", function () {
    function init(attrs, wrapperAttrs) {
        var template = '<div data-role="rangeslider" '+attrs+'>'+
        '<input type="range" id="r1" min="0" max="100" ng-model="r1">'+
        '<input type="range" id="r2" min="0" max="100" ng-model="r2">'+
        '</div>';
        if (wrapperAttrs) {
            template = '<div '+wrapperAttrs+'>'+template+'</div>';
        }
        return testutils.compileInPage(template);
    }


    it("should stamp the widget using the jqm widget", function() {
        var createCount = 0;
        var spy = testutils.spyOnJq('rangeslider').andCallFake(function() {
            if (arguments.length===0) {
                createCount++;
            }
        });
        var c = init('ng-repeat="l in list"');
        expect(spy.callCount).toBe(0);
        var scope = c.page.scope();
        scope.list = [1,2];
        scope.$root.$digest();
        expect(createCount).toBe(2);
    });

    it('should save the ui text value into the model', function () {
        var d = init('');
        var input1 = d.page.find("input#r1");
        var scope = input1.scope();
        input1.val(100);
        testutils.triggerInputEvent(input1);
        expect(scope.r1).toBe(100);
    });

    it("should save the ui slider value into the model", function() {
        var d = init('');
        var input = d.page.find("input#r2");
        var slider = input.data($.mobile.slider.prototype.widgetFullName).slider;
        var event = $.Event("mousedown");
        var expectedValue = 50;
        event.pageX = (expectedValue * slider.width() / 100) + slider.offset().left;
        slider.trigger(event);
        expect(input.val()).toBe('50');

        var scope = input.scope();
        expect(scope.r2).toBe(50);
    });

    it('should save the model value into the ui and refresh', function () {
        var d = init('');
        var input = d.page.find("input#r2");
        var container = input.parent();
        var scope = input.scope();
        scope.r2 = 100;
        scope.$root.$digest();
        expect(input[0].value).toEqual("100");
        expect(container.find("a").eq(1).attr("aria-valuenow")).toBe("100");
    });

    it('should use the disabled attribute', function () {
        var d = init('ng-disabled="disabled"');
        var rangeslider = d.element;
        var scope = rangeslider.scope();
        scope.disabled = false;
        scope.$root.$digest();
        var disabled = rangeslider.rangeslider('option', 'disabled');
        expect(disabled).toEqual(false);
        scope.disabled = true;
        scope.$root.$digest();
        disabled = rangeslider.rangeslider('option', 'disabled');
        expect(disabled).toEqual(true);

    });

    it('should be removable', function () {
        var d = init('ng-repeat="l in list"', 'ng-init="list=[1,2]">');
        var container = d.element;
        var scope = container.scope();
        expect(container.children().length).toEqual(2);
        scope.list = [1];
        scope.$root.$digest();
        expect(container.children().length).toEqual(1);
    });

});
