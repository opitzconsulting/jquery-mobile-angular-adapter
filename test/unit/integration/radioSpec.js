describe("radio", function () {

    it("should stamp the widget using the jqm widget", function() {
        var createCount = 0;
        var spy = testutils.spyOnJq('checkboxradio').andCallFake(function() {
            if (arguments.length===0) {
                createCount++;
            }
        });
        var c = testutils.compileInPage('<label ng-repeat="l in list"><input type="radio" ></label>');
        expect(spy.callCount).toBe(0);
        var scope = c.page.scope();
        scope.list = [1,2];
        scope.$root.$digest();
        expect(createCount).toBe(2);
    });

    it('should save the ui value into the model', function () {
        var d = testutils.compileInPage('<div>' +
            '<input ng-model="mysel" id="mysel" type="radio" value="v1">{{mysel}}<label for="mysel" id="mylab">Entry</label>' +
            '</div>');
        var page = d.page;
        var input = page.find("#mysel");
        var scope = input.scope();
        expect(scope.mysel).toBeFalsy();
        // jquery mobile reacts to clicks on the label
        var label = page.find('label');
        expect(label.length).toEqual(1);
        label.trigger('vclick');
        expect(scope.mysel).toBe('v1');

    });

    it('should save the model value into the ui and refresh', function () {
        var d = testutils.compileInPage(
            '<div>' +
                '<input ng-model="mysel" id="mysel" type="radio" value="v1"><label for="mysel" id="mylab">Entry</label>' +
                '</div>');
        var page = d.page;
        var input = page.find("#mysel");
        var scope = input.scope();
        expect(input[0].checked).toBeFalsy();
        // jquery mobile creates a new span
        // that displays the actual value of the selection.
        var iconSpan = page.find(".ui-icon");
        expect(iconSpan.hasClass('ui-icon-checkbox-on')).toBeFalsy();
        scope.mysel = 'v1';
        scope.$root.$digest();
        expect(input[0].checked).toBeTruthy();
        iconSpan = page.find(".ui-icon");
        expect(iconSpan.hasClass('ui-icon-radio-on')).toBeTruthy();
    });

    it('should save the ng-checked value into the ui and refresh', function () {
        var d = testutils.compileInPage(
            '<div>' +
                '<input ng-checked="mysel" id="mysel" type="radio" value="v1"><label for="mysel" id="mylab">Entry</label>' +
                '</div>');
        var page = d.page;
        var input = page.find("#mysel");
        var scope = input.scope();
        expect(input[0].checked).toBeFalsy();
        // jquery mobile creates a new span
        // that displays the actual value of the selection.
        var iconSpan = page.find(".ui-icon");
        expect(iconSpan.hasClass('ui-icon-checkbox-on')).toBeFalsy();
        scope.mysel = 'v1';
        scope.$root.$digest();
        expect(input[0].checked).toBeTruthy();
        iconSpan = page.find(".ui-icon");
        expect(iconSpan.hasClass('ui-icon-radio-on')).toBeTruthy();
    });

    it('should use the disabled attribute', function () {
        var d = testutils.compileInPage(
            '<div>' +
                '<input ng-model="mysel" id="mysel" type="radio" value="false" ng-disabled="disabled"><label for="mysel" id="mylab">Entry</label>' +
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
            '<fieldset ng-repeat="l in list"><input type="radio" id="check1"><label for="check1">{{l}}</label></fieldset>');
        var page = c.page;
        var scope = page.scope();
        scope.list = [1,2];
        scope.$root.$digest();
        // checkbox creates a new parent for itself
        var content = page.find("fieldset");
        expect(content.children('div.ui-radio').length).toEqual(2);
        expect(content.children('label').length).toEqual(0);
        expect(content.children('input').length).toEqual(0);
        scope.list = [1];
        scope.$root.$digest();
        content = page.find("fieldset");
        expect(content.children('div.ui-radio').length).toEqual(1);
    });
});
