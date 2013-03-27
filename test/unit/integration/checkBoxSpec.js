describe("checkbox", function () {
    it("should stamp the widget using the jqm widget", function() {
        var createCount = 0;
        var spy = testutils.spyOnJq('checkboxradio').andCallFake(function() {
            if (arguments.length===0) {
                createCount++;
            }
        });
        var c = testutils.compileInPage('<label ng-repeat="l in list"><input type="checkbox"></label>');
        expect(spy.callCount).toBe(0);
        var scope = c.page.scope();
        scope.list = [1,2];
        scope.$root.$digest();
        expect(createCount).toBe(2);
    });

    it('should work in templates', function() {
        module("ngMock", function ($compileProvider) {
            $compileProvider.directive('sample', function () {
                return {
                    restrict:'A',
                    replace: false,
                    template: '<input ng-model="mysel" id="a" type="checkbox"><label for="a" id="mylab">Entry</label>'
                };
            });
        });
        var c = testutils.compileInPage('<div sample="true"></div>');
        // checkbox wraps itself into a fieldset...
        expect(c.element.find("input").length).toBe(1);
        expect(c.element.find("label").length).toBe(1);

    });

    it('should save the ui value into the model', function () {
        var d = testutils.compileInPage('<div>' +
            '<input ng-model="mysel" id="mysel" type="checkbox"><label for="mysel" id="mylab">Entry</label>' +
            '</div>');
        var page = d.page;
        var input = page.find("#mysel");
        var scope = input.scope();
        expect(scope.mysel).toBeFalsy();
        // jquery mobile reacts to clicks on the label
        var label = page.find('label');
        expect(label.length).toEqual(1);
        label.trigger('vclick');
        expect(scope.mysel).toBeTruthy();

    });

    it("should allow to bind the label to an expression", function() {
        var d = testutils.compileInPage('<div>' +
            '<input ng-model="mysel" id="mysel" type="checkbox"><label for="mysel" id="mylab">{{label}}</label>' +
            '</div>');
        var page = d.page;
        var input = page.find("#mysel");
        var scope = input.scope();
        expect($.trim(d.element.text())).toBe('');
        scope.label = 'someLabel';
        scope.$root.$digest();
        expect($.trim(d.element.text())).toEqual('someLabel');
    });

    it('should save the model value into the ui and refresh', function () {
        var d = testutils.compileInPage(
            '<div>' +
                '<input ng-model="mysel" id="mysel" type="checkbox"><label for="mysel" id="mylab">Entry</label>' +
                '</div>');
        var page = d.page;
        var input = page.find("#mysel");
        var label = page.find("label");
        var scope = input.scope();
        expect(input[0].checked).toBeFalsy();
        // jquery mobile creates a new span
        // that displays the actual value of the selection.
        var iconSpan = page.find(".ui-icon");
        expect(iconSpan.hasClass('ui-icon-checkbox-on')).toBeFalsy();
        expect(label.hasClass('ui-checkbox-on')).toBeFalsy();
        scope.mysel = true;
        scope.$root.$digest();
        iconSpan = page.find(".ui-icon");
        expect(input[0].checked).toBeTruthy();
        expect(iconSpan.hasClass('ui-icon-checkbox-on')).toBeTruthy();
        expect(label.hasClass('ui-checkbox-on')).toBeTruthy();
    });

    it('should save the ng-checked value into the ui and refresh', function() {
        var d = testutils.compileInPage(
            '<div>' +
                '<input ng-checked="mysel" id="mysel" type="checkbox"><label for="mysel" id="mylab">Entry</label>' +
                '</div>');
        var page = d.page;
        var input = page.find("#mysel");
        var scope = input.scope();
        expect(input[0].checked).toBeFalsy();
        // jquery mobile creates a new span
        // that displays the actual value of the selection.
        var iconSpan = page.find(".ui-icon");
        expect(iconSpan.hasClass('ui-icon-checkbox-on')).toBeFalsy();
        scope.mysel = true;
        scope.$root.$digest();
        iconSpan = page.find(".ui-icon");
        expect(input[0].checked).toBeTruthy();
        expect(iconSpan.hasClass('ui-icon-checkbox-on')).toBeTruthy();
    });

    it('should use the disabled attribute', function () {
        var d = testutils.compileInPage(
            '<div>' +
                '<input ng-model="mysel" id="mysel" type="checkbox" value="false" ng-disabled="disabled"><label for="mysel" id="mylab">Entry</label>' +
                '</div>');
        var page = d.page;
        var input = page.find("#mysel");
        var parentDiv = input.parent();
        var scope = input.scope();
        scope.disabled = false;
        scope.$root.$digest();
        expect(parentDiv.hasClass('ui-disabled')).toBeFalsy();
        scope.disabled = true;
        scope.$root.$digest();
        expect(parentDiv.hasClass('ui-disabled')).toBeTruthy();
    });

    it('should be removable', function () {
        var c = testutils.compileInPage(
            '<fieldset ng-repeat="l in list"><input type="checkbox" id="check1"><label for="check1">{{l}}</label></fieldset>');
        var page = c.page;
        var scope = page.scope();
        scope.list = [1,2];
        scope.$root.$digest();
        // checkbox creates a new parent for itself
        var content = page.find("fieldset");
        expect(content.children('div.ui-checkbox').length).toEqual(2);
        expect(content.children('label').length).toEqual(0);
        expect(content.children('input').length).toEqual(0);
        scope.list = [1];
        scope.$root.$digest();
        content = page.find("fieldset");
        expect(content.children('div.ui-checkbox').length).toEqual(1);
    });

    it('should not allow ng-repeat on the checkbox if it is linked to a label', function() {
        expect(function() {
            testutils.compileInPage(
                '<div id="container"><input type="checkbox" id="check1" ng-repeat="l in [1,2]"><label for="check1">{{l}}</label></div>');
        }).toThrow(new Error("Don't use ng-repeat or other conditional directives on checkboxes/radiobuttons directly. Instead, wrap the input into a label and put the directive on that input!"));
    });

    it('should allow ng-repeat on the label', function() {
        var c = testutils.compileInPage(
            '<div id="container"><input type="checkbox" id="check1" ><label ng-repeat="l in [1,2]" for="check1">{{l}}</label></div>');
        var page = c.page;
        var container = page.find("#container");
        var wrapperDivs = container.children("div.ui-checkbox");
        expect(wrapperDivs.length).toBe(2);
        var i, input, label;
        for (i=0; i<2; i++) {
            input = wrapperDivs.eq(i).children("input");
            label = wrapperDivs.eq(i).children("label");
            expect(input.length).toBe(1);
            expect(label.length).toBe(1);
            expect(label.find(".ui-btn-text").text()).toEqual(''+(i+1));
        }
    });

    it('should allow ng-repeat on a label that contains an input', function() {
        var c = testutils.compileInPage(
            '<div id="container"><label ng-repeat="l in [1,2]"><input type="checkbox">{{l}}</label></div>');
        var page = c.page;
        var container = page.find("#container");
        var wrapperDivs = container.children("div.ui-checkbox");
        expect(wrapperDivs.length).toBe(2);
        var i, input, label;
        for (i=0; i<2; i++) {
            input = wrapperDivs.eq(i).children("input");
            label = wrapperDivs.eq(i).children("label");
            expect(input.length).toBe(1);
            expect(label.length).toBe(1);
            expect(label.find(".ui-btn-text").text()).toEqual(''+(i+1));
        }
    });

    describe('without label', function() {
        it('should allow ng-repeat on the checkbox', function() {
            var c = testutils.compileInPage(
                    '<input type="checkbox" id="check1" ng-repeat="l in [1,2]">');
            expect(c.page.find("input").length).toBe(2);
        });
        it('should allow angular-binding', function() {
            var c = testutils.compileInPage(
                    '<input type="checkbox" ng-model="value">');
            var el = c.element.find("input"),
                scope = el.scope();
            el.click();
            expect(scope.value).toBe(true);
        });
    });
});
