describe("selectSlider", function () {
    it("should stamp the widget using the jqm widget", function() {
        var createCount = 0;
        var spy = testutils.spyOnJq('slider').andCallFake(function() {
            if (arguments.length===0) {
                createCount++;
            }
        });
        var c = testutils.compileInPage('<select data-role="slider" ng-repeat="l in list"><option value="v1" default="true">v1</option><option value="v2">v2</option></select>');
        expect(spy.callCount).toBe(0);
        var scope = c.page.scope();
        scope.list = [1,2];
        scope.$root.$digest();
        expect(createCount).toBe(2);
    });

    it('should save the ui value into the model', function () {
        var d = testutils.compileInPage(
            '<select ng-model="mysel" data-role="slider"><option value="v1" default="true">v1</option><option value="v2">v2</option></select>'
        );
        var select = d.page.find('select');
        var scope = select.scope();
        scope.mysel = "v1";
        scope.$root.$digest();
        // jquery mobile uses an anchor to simulate the select
        var anchor = d.page.find("a");
        expect(anchor.length).toEqual(1);
        anchor.trigger('vmousedown');
        anchor.trigger('vmouseup');
        expect(scope.mysel).toEqual("v2");
    });

    it('should save the model value into the ui', function () {
        var d = testutils.compileInPage('<select ng-model="mysel" data-role="slider"><option value="v1" default="true">v1</option><option value="v2">v2</option></select>');
        var select = d.page.find('select');
        var scope = d.page.scope();
        scope.mysel = "v1";
        scope.$root.$digest();
        // jquery mobile creates a new span
        // that displays the actual value of the select box.
        var anchor = d.page.find("a");
        expect(anchor.attr('aria-valuetext')).toEqual("v1");
        scope.mysel = "v2";
        scope.$root.$digest();
        expect(select[0].value).toEqual("v2");
        anchor = d.page.find("a");
        expect(anchor.attr('aria-valuetext')).toEqual("v2");
    });

    it('should use the disabled attribute', function () {
        var d = testutils.compileInPage(
            '<select ng-model="mysel" data-role="slider" ng-disabled="disabled"><option value="v1" default="true">v1</option><option value="v2">v2</option></select>');
        var select = d.page.find('select');
        var scope = select.scope();
        scope.disabled = false;
        scope.$root.$digest();
        var disabled = select.slider('option', 'disabled');
        expect(disabled).toEqual(false);
        scope.disabled = true;
        scope.$root.$digest();
        var disabled = select.slider('option', 'disabled');
        expect(disabled).toEqual(true);
    });

    // TODO uncomment this in jqm 1.3!
    xit('should be removable', function () {
        var d = testutils.compileInPage('<div ng-init="list=[1,2]">' +
            '<select data-role="slider" ng-repeat="l in list"><option value="v1" default="true">v1</option></select>' +
            '</div>');
        var container = d.element;
        var scope = container.scope();
        expect(container.children('div').length).toEqual(2);
        scope.list = [1];
        scope.$root.$digest();
        expect(container.children('div').length).toEqual(1);
    });
});
