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
        var select = d.element.find('select');
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
        var select = d.element.find('select');
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
        var select = d.element.find('select');
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

    it('should wrap the element and the slider into a new parent div so that it does not confuse the angular compiler', function() {
        // If we have two sliders after each other, and allow the slider to append
        // elements after the input elements, the angular compiler gets confused...
        var c = testutils.compileInPage('<div>' +
            '<select data-role="slider"><option value="v1" default="true">v1</option></select>' +
            '<select data-role="slider"><option value="v1" default="true">v1</option></select>' +
            '</div>');
        var div = c.element;
        expect(div.children("div").eq(0).children("select").length).toBe(1);
        expect(div.children("div").eq(0).children("div[role='application']").length).toBe(1);
        expect(div.children("div").eq(1).children("select").length).toBe(1);
        expect(div.children("div").eq(1).children("div[role='application']").length).toBe(1);
    });

    it('should be removable', function () {
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

    it('should have labels if ng-options is used', function () {
        var d = testutils.compileInPage('<div ng-init="list=[{s:\'1\',l:\'on\'},{s:\'0\',l:\'off\'}]">' +
            '<select data-role="slider" ng-model="slider_test" ng-options="e.s as e.l for e in list"></select>' +
            '</div>');
        var div = d.element;
        var spans =div.children("div").eq(0).children("div[role='application']").eq(0).children("span");
        expect(spans.length).toBe(2);
        expect(spans.eq(0).text()).toEqual("off");
        expect(spans.eq(1).text()).toEqual("on");
    });
});
