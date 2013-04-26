describe("selectSlider", function () {
    function flushTimeout() {
        inject(function($timeout, $browser) {
            if ($browser.deferredFns.length) {
                $timeout.flush();
            }
        });
    }

    function compileInPage(html) {
        var c = testutils.compileInPage(html);
        flushTimeout();
        return c;
    }
    it("should stamp the widget using the jqm widget", function() {
        var createCount = 0;
        var spy = testutils.spyOnJq('slider').andCallFake(function() {
            if (arguments.length===0) {
                createCount++;
            }
        });
        var c = compileInPage('<select data-role="slider" ng-repeat="l in list"><option value="v1" default="true">v1</option><option value="v2">v2</option></select>');
        expect(spy.callCount).toBe(0);
        var scope = c.page.scope();
        scope.list = [1,2];
        scope.$root.$digest();
        flushTimeout();

        expect(createCount).toBe(2);
    });

    it('should save the ui value into the model', function () {
        var d = compileInPage(
            '<select ng-model="mysel" data-role="slider"><option value="v1" default="true">v1</option><option value="v2">v2</option></select>'
        );
        var select = d.page.find('select');
        var scope = select.scope();
        scope.mysel = "v1";
        scope.$root.$digest();
        // jquery mobile uses an anchor to simulate the select
        var anchor = d.page.find("a");
        expect(anchor.length).toEqual(1);
        anchor.trigger($.Event('vmousedown',{which: 0}));
        anchor.trigger('vmouseup');
        expect(scope.mysel).toEqual("v2");
    });

    it('should save the model value into the ui', function () {
        var d = compileInPage('<select ng-model="mysel" data-role="slider"><option value="v1" default="true">v1</option><option value="v2">v2</option></select>');
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
        var d = compileInPage(
            '<select ng-model="mysel" data-role="slider" ng-disabled="disabled"><option value="v1" default="true">v1</option><option value="v2">v2</option></select>');
        var select = d.page.find('select');
        var scope = select.scope();
        scope.disabled = false;
        scope.$root.$digest();
        var disabled = select.slider('option', 'disabled');
        expect(disabled).toEqual(false);
        scope.disabled = true;
        scope.$root.$digest();
        disabled = select.slider('option', 'disabled');
        expect(disabled).toEqual(true);
    });

    describe('with ng-options', function() {
        function execTest(init, selectedIndex, selectedValue) {
            var d = compileInPage(
                '<form name="myform"><select name="mysel" ng-init="options=[1,2];'+init+'" ng-model="mysel" data-role="slider" ng-options="o for o in options"></select></form>');
            var select = d.page.find('select'),
                scope = select.scope(),
                options = select.children("option"),
                spans = d.page.find('.ui-slider-label'),
                form = scope.myform;
            expect(options.length).toBe(2);
            expect(options.eq(selectedIndex).prop("selected")).toBe(true);
            expect(scope.mysel).toBe(selectedValue);
            expect(spans.length).toBe(2);
            expect(spans.eq(1).text()).toBe("1");
            expect(spans.eq(0).text()).toBe("2");
            expect(form.$pristine).toBe(true);
            expect(form.mysel.$pristine).toBe(true);
        }
        it('should select the first option if none is selected and fill the slider correctly', function() {
            execTest('', 0, 1);
        });
        it('should fill the slider correctly if an option is already selected', function() {
            execTest('mysel=2', 1, 2);
        });
    });

    describe('with normal options', function() {
        function execTest(init, selectedIndex, selectedValue) {
            var d = compileInPage(
                '<form name="myform"><select name="mysel" ng-init="'+init+'" ng-model="mysel" data-role="slider"><option value="1">true</option><option value="2">false</option></select></form>');
            var select = d.page.find('select'),
                scope = select.scope(),
                options = select.children("option"),
                spans = d.page.find('.ui-slider-label'),
                form = scope.myform;
            expect(options.length).toBe(2);
            expect(options.eq(selectedIndex).prop("selected")).toBe(true);
            expect(scope.mysel).toBe(selectedValue);
            expect(spans.length).toBe(2);
            expect(spans.eq(0).text()).toBe("false");
            expect(spans.eq(1).text()).toBe("true");
            expect(form.$pristine).toBe(true);
            expect(form.mysel.$pristine).toBe(true);
        }
        it('should select the first option if none is selected and fill the slider correctly', function() {
            execTest('', 0, '1');
        });
        it('should fill the slider correctly if an option is already selected', function() {
            execTest("mysel='2'", 1, '2');
        });
    });

    /** TODO: Wait for jqm to add a wrapper for select sliders **/
    xit('should be removable', function () {
        var d = compileInPage('<div ng-init="list=[1,2]">' +
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
