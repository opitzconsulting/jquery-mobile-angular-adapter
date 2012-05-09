describe("selectmenu", function () {
    it("should stamp the widget using the jqm widget", function () {
        spyOn($.fn, 'selectmenu');
        var c = testutils.compileInPage('<select ng-repeat="l in list"><option value="v1">v1</option></select>');
        expect($.fn.selectmenu.callCount).toBe(0);
        var scope = c.page.scope();
        scope.list = [1, 2];
        scope.$root.$digest();
        expect($.fn.selectmenu.callCount).toBe(2);
    });

    describe('non native menus', function () {

        it('should save the ui value into the model', function () {
            var c = testutils.compileInPage(
                '<select ng-init="mysel=\'v1\'" ng-model="mysel" data-native-menu="false"><option value="v1" default="true">v1</option><option value="v2">v2</option></select>');
            var page = c.page;
            var select = c.element;
            expect(select[0].value).toEqual("v1");
            var scope = select.scope();
            expect(scope.mysel).toEqual("v1");

            // find the menu and click on the second entry
            select.selectmenu('open');
            var popup = page.find(".ui-selectmenu");
            var options = popup.find("li");
            var option = $(options[1]);
            option.trigger('click');
            select.selectmenu('close');
            expect(scope.mysel).toEqual("v2");
        });

        it('should save the model value into the ui', function () {
            var c = testutils.compileInPage('<select ng-init="mysel=\'v1\'" ng-model="mysel" data-native-menu="false"><option value="v1" default="true">v1</option><option value="v2">v2</option></select>');
            var page = c.page;
            var select = c.element;
            var scope = select.scope();
            expect(select[0].value).toEqual("v1");
            // jquery mobile creates a new span
            // that displays the actual value of the select box.
            var valueSpan = select.parent().find(".ui-btn-text");
            expect(valueSpan.text()).toEqual("v1");
            scope.mysel = "v2";
            scope.$apply();
            expect(select[0].value).toEqual("v2");
            expect(valueSpan.text()).toEqual("v2");
        });

        it('should use the disabled attribute', function () {
            var c = testutils.compileInPage(
                '<select ng-init="mysel=\'v1\'" ng-model="mysel" data-native-menu="false" ng-disabled="disabled"><option value="v1" default="true">v1</option><option value="v2">v2</option></select>');
            var page = c.page;
            var select = c.element;
            var scope = select.scope();
            scope.disabled = false;
            scope.$root.$digest();
            var disabled = select.selectmenu('option', 'disabled');
            expect(disabled).toEqual(false);
            scope.disabled = true;
            scope.$root.$digest();
            var disabled = select.selectmenu('option', 'disabled');
            expect(disabled).toEqual(true);
        });

    });

    it('should be removable', function () {
        var c = testutils.compileInPage(
            '<select ng-init="mysel=\'v1\'" ng-model="mysel" data-native-menu="false"><option value="v1" default="true">v1</option><option value="v2">v2</option></select>');
        var page = c.page;
        var scope = page.scope();
        // ui select creates a new parent for itself
        var content = page.find(":jqmData(role='content')");
        expect(content.children('div').length).toEqual(1);
        // select creates a parent div. This should be removed when the select is removed.
        content.find('select').eq(0).remove();
        expect(content.children('div').length).toEqual(0);
    });

    it("should refresh only once when child entries are changed by angular using <option> elements", function () {
        var c = testutils.compileInPage(
            '<select data-native-menu="false"><option ng-repeat="l in list" value="{{l}}">{{l}}</option></select>');
        var select = c.element;
        var options = select.children("option");
        expect(options.length).toBe(0);
        var scope = c.element.scope();
        var selectmenu = select.data("selectmenu");
        spyOn(selectmenu, 'refresh').andCallThrough();
        scope.list = [1, 2];
        scope.$digest();
        expect(selectmenu.refresh.callCount).toBe(1);
        var options = select.children("option");
        expect(options.length).toBe(2);
    });

    it("should refresh only once when child entries are changed by angular using ng-options directive", function () {
        var c = testutils.compileInPage(
            '<select ng-init="data=1" list="1" ng-model="data" data-native-menu="false" ng-options="l for l in list"></select>');
        var select = c.element;
        var options = select.children("option");
        expect(options.length).toBe(1);
        var scope = c.element.scope();
        var selectmenu = select.data("selectmenu");
        spyOn(selectmenu, 'refresh').andCallThrough();
        scope.list = [1, 2, 3];
        scope.$digest();
        expect(selectmenu.refresh.callCount).toBe(1);
        var options = select.children("option");
        expect(options.length).toBe(3);
    });

});
