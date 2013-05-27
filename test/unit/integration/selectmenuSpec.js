describe("selectmenu", function () {
    it("should stamp the widget using the jqm widget", function () {
        var createCount = 0;
        var spy = testutils.spyOnJq('selectmenu').andCallFake(function () {
            if (arguments.length === 0) {
                createCount++;
            }
        });
        var c = testutils.compileInPage('<select ng-repeat="l in list"><option value="v1">v1</option></select>');
        expect(createCount).toBe(0);
        var scope = c.page.scope();
        scope.list = [1, 2];
        scope.$root.$digest();
        expect(createCount).toBe(2);
    });

    describe('non native menus', function () {

        it('should save the ui value into the model', function () {
            var c = testutils.compileInPage(
                '<select ng-init="mysel=\'v1\'" ng-model="mysel" data-native-menu="false"><option value="v1" default="true">v1</option><option value="v2">v2</option></select>');
            var page = c.page;
            var select = c.element.find('select');
            expect(select[0].value).toEqual("v1");
            var scope = select.scope();
            expect(scope.mysel).toEqual("v1");

            // find the menu and click on the second entry
            select.selectmenu('open');
            var popup = page.find(".ui-selectmenu");
            var options = popup.find("li");
            var option = $(options[1]);
            option.trigger('click');
            expect(scope.mysel).toEqual("v2");
            expect(select.data($.mobile.selectmenu.prototype.widgetFullName).isOpen).toBe(false);
        });

        it('should save the model value into the ui', function () {
            var c = testutils.compileInPage('<select ng-init="mysel=\'v1\'" ng-model="mysel" data-native-menu="false"><option value="v1" default="true">v1</option><option value="v2">v2</option></select>');
            var page = c.page;
            var select = c.element.find('select');
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
            var select = c.element.find('select');
            var scope = select.scope();
            scope.disabled = false;
            scope.$root.$digest();
            var disabled = select.selectmenu('option', 'disabled');
            expect(disabled).toEqual(false);
            scope.disabled = true;
            scope.$root.$digest();
            disabled = select.selectmenu('option', 'disabled');
            expect(disabled).toEqual(true);
        });

        it('should be removable', function () {
            var c = testutils.compileInPage(
                '<div><select ng-repeat="l in list" ng-model="mysel" data-native-menu="false"><option value="v1" default="true">v1</option><option value="v2">v2</option></select></div>');
            var page = c.page;
            var scope = page.scope();
            scope.list = [1,2];
            scope.$root.$digest();
            // ui select creates a new parent for itself
            var content = c.element;
            expect(content.children('div').length).toEqual(2);
            scope.list = [1];
            scope.$root.$digest();
            expect(content.children('div').length).toEqual(1);
        });


    });

    describe('native menus', function() {
        it('should save the ui value into the model', function () {
            var c = testutils.compileInPage(
                '<select ng-init="mysel=\'v1\'" ng-model="mysel" data-native-menu="true"><option value="v1" default="true">v1</option><option value="v2">v2</option></select>');
            var page = c.page;
            var select = c.element.find('select');
            expect(select[0].value).toEqual("v1");
            var scope = select.scope();
            expect(scope.mysel).toEqual("v1");
            select[0].value = "v2";
            select.trigger("change");
            expect(scope.mysel).toEqual("v2");
        });

        it('should save the model value into the ui', function () {
            var c = testutils.compileInPage('<select ng-init="mysel=\'v1\'" ng-model="mysel" data-native-menu="true"><option value="v1" default="true">v1</option><option value="v2">v2</option></select>');
            var page = c.page;
            var select = c.element.find('select');
            var scope = select.scope();
            expect(select[0].value).toEqual("v1");
            scope.mysel = "v2";
            scope.$root.$apply();
            expect(select[0].value).toEqual("v2");
        });

        it('should use the disabled attribute', function () {
            var c = testutils.compileInPage(
                '<select ng-init="mysel=\'v1\'" ng-model="mysel" data-native-menu="true" ng-disabled="disabled"><option value="v1" default="true">v1</option><option value="v2">v2</option></select>');
            var page = c.page;
            var select = c.element.find('select');
            var scope = select.scope();
            scope.disabled = false;
            scope.$root.$digest();
            var disabled = select.selectmenu('option', 'disabled');
            expect(disabled).toEqual(false);
            scope.disabled = true;
            scope.$root.$digest();
            disabled = select.selectmenu('option', 'disabled');
            expect(disabled).toEqual(true);
        });

        it('should be removable', function () {
            var c = testutils.compileInPage(
                '<div><select ng-repeat="l in list" ng-model="mysel" data-native-menu="true"><option value="v1" default="true">v1</option><option value="v2">v2</option></select></div>');
            var page = c.page;
            var scope = page.scope();
            scope.list = [1,2];
            scope.$root.$digest();
            // ui select creates a new parent for itself
            var content = c.element;
            expect(content.children('div').length).toEqual(2);
            scope.list = [1];
            scope.$root.$digest();
            expect(content.children('div').length).toEqual(1);
        });


    });

    describe('options with ng-repeat', function () {
        var c, select, selectmenu, scope;
        beforeEach(function () {
            c = testutils.compileInPage(
                '<select data-native-menu="false"><option ng-repeat="l in list" value="{{l}}">{{l}}</option></select>');
            select = c.element.find('select');
            selectmenu = select.data($.mobile.selectmenu.prototype.widgetFullName);
            spyOn(selectmenu, 'refresh').andCallThrough();
            scope = c.element.scope();
        });
        it("should refresh only once when child entries are changed by angular", function () {
            var options = select.children("option");
            expect(options.length).toBe(0);
            scope.list = [1, 2];
            scope.$root.$digest();
            expect(selectmenu.refresh.callCount).toBe(1);
            options = select.children("option");
            expect(options.length).toBe(2);
        });

        it("should not refresh if nothing changes", function () {
            scope.$root.$digest();
            expect(selectmenu.refresh.callCount).toBe(0);
        });
    });

    describe('options without ng-repeat and interpolation', function () {
        var c, select, selectmenu, scope;
        beforeEach(function () {
            c = testutils.compileInPage(
                '<select data-native-menu="false"><option value="{{v}}">{{l}}</option></select>');
            select = c.element.find('select');
            selectmenu = select.data($.mobile.selectmenu.prototype.widgetFullName);
            spyOn(selectmenu, 'refresh').andCallThrough();
            scope = c.element.scope();
        });

        it("should refresh when the value changes", function () {
            var option = select.children("option");
            scope.v = 'v1';
            scope.$root.$digest();
            expect(selectmenu.refresh.callCount).toBe(1);
            expect(option.val()).toBe('v1');
        });

        it("should refresh when the text changes", function () {
            var option = select.children("option");
            scope.l = 'l1';
            scope.$root.$digest();
            expect(selectmenu.refresh.callCount).toBe(1);
            expect(option.text()).toBe('l1');
        });

        it("should not refresh if nothing changes", function () {
            scope.$root.$digest();
            expect(selectmenu.refresh.callCount).toBe(0);
        });
    });

    describe('options without ng-repeat and static value', function () {
        var c, select, selectmenu, scope;
        beforeEach(function () {
            c = testutils.compileInPage(
                '<select data-native-menu="false"><option value="v">{{l}}</option></select>');
            select = c.element.find('select');
            selectmenu = select.data($.mobile.selectmenu.prototype.widgetFullName);
            spyOn(selectmenu, 'refresh').andCallThrough();
            scope = c.element.scope();
        });

        it("should refresh when the text changes", function () {
            var option = select.children("option");
            scope.l = 'l1';
            scope.$root.$digest();
            expect(selectmenu.refresh.callCount).toBe(1);
            expect(option.text()).toBe('l1');
            expect(option.val()).toBe('v');
        });
    });

    describe('options without ng-repeat and no value', function () {
        var c, select, selectmenu, scope;
        beforeEach(function () {
            c = testutils.compileInPage(
                '<select data-native-menu="false"><option>{{l}}</option></select>');
            select = c.element.find('select');
            selectmenu = select.data($.mobile.selectmenu.prototype.widgetFullName);
            spyOn(selectmenu, 'refresh').andCallThrough();
            scope = c.element.scope();
        });

        it("should refresh when the text changes", function () {
            var option = select.children("option");
            scope.l = 'l1';
            scope.$root.$digest();
            expect(selectmenu.refresh.callCount).toBe(1);
            expect(option.text()).toBe('l1');
            expect(option.val()).toBe('l1');
        });
    });

    describe('options with ng-options for list datasource', function () {
        var c, select, selectmenu, scope;
        beforeEach(function () {
            c = testutils.compileInPage(
                '<select ng-init="data=1" list="1" ng-model="data" data-native-menu="false" ng-options="value.v as value.l group by value.g for value in list"></select>');
            select = c.element.find('select');
            selectmenu = select.data($.mobile.selectmenu.prototype.widgetFullName);
            scope = c.element.scope();
            spyOn(selectmenu, 'refresh').andCallThrough();
        });
        it("should refresh only once when child entries are added", function () {
            var options = select.children("option");
            scope.list = [{l:1, v:1, g:1}, {l:2, v:2, g:2}, {l:3, v:3, g:3}];
            scope.$root.$digest();
            expect(selectmenu.refresh.callCount).toBe(1);
            options = select.find("option");
            expect(options.length).toBe(3);
        });
        it("should refresh only once when child entries are removed", function () {
            var options = select.children("option");
            scope.list = [{l:1, v:1, g:1}, {l:2, v:2, g:2}, {l:3, v:3, g:3}];
            scope.$root.$digest();
            selectmenu.refresh.reset();
            scope.list.pop();
            scope.list.pop();
            scope.$root.$digest();
            expect(selectmenu.refresh.callCount).toBe(1);
            options = select.find("option");
            expect(options.length).toBe(1);
        });
        it("should refresh only once if child entries are reordered", function () {
            var options = select.children("option");
            scope.list = [{l:1, v:1, g:1}, {l:2, v:2, g:2}, {l:3, v:3, g:3}];
            scope.$root.$digest();
            selectmenu.refresh.reset();
            var e1 = scope.list[0];
            scope.list[0] = scope.list[1];
            scope.list[1] = e1;
            scope.$root.$digest();
            expect(selectmenu.refresh.callCount).toBe(1);
            options = select.find("option");
            expect(options.length).toBe(3);
        });
        it("should refresh if the option label changes", function() {
            scope.list = [{l:1, v:1, g:1}];
            scope.$root.$digest();
            selectmenu.refresh.reset();
            scope.list[0].l = 2;
            scope.$root.$digest();
            expect(selectmenu.refresh.callCount).toBe(1);
        });
        it("should refresh if the option group changes", function() {
            scope.list = [{l:1, v:1, g:1}];
            scope.$root.$digest();
            selectmenu.refresh.reset();
            scope.list[0].g = 2;
            scope.$root.$digest();
            expect(selectmenu.refresh.callCount).toBe(1);
        });
        it("should not refresh if the option value changes", function() {
            scope.list = [{l:1, v:1, g:1}];
            scope.$root.$digest();
            selectmenu.refresh.reset();
            scope.list[0].v = 2;
            scope.$root.$digest();
            expect(selectmenu.refresh.callCount).toBe(0);
        });
        it("should not refresh if nothing changes", function () {
            scope.list = [{l:1, v:1, g:1}, {l:2, v:2, g:2}, {l:3, v:3, g:3}];
            scope.$root.$digest();
            selectmenu.refresh.reset();
            scope.$root.$digest();
            expect(selectmenu.refresh.callCount).toBe(0);
        });

    });

    describe('options with ng-options for object datasource', function () {
        var c, select, selectmenu, scope;
        beforeEach(function () {
            c = testutils.compileInPage(
                '<select ng-init="data=1" list="1" ng-model="data" data-native-menu="false" ng-options="value.v as value.l group by value.g for (key,value) in list"></select>');
            select = c.element.find('select');
            selectmenu = select.data($.mobile.selectmenu.prototype.widgetFullName);
            scope = c.element.scope();
            spyOn(selectmenu, 'refresh').andCallThrough();
        });
        it("should refresh only once when child entries are added", function () {
            var options = select.children("option");
            scope.list = {a:{l:1, v:1, g:1}, b:{l:2, v:2, g:2}, c:{l:3, v:3, g:3}};
            scope.$root.$digest();
            expect(selectmenu.refresh.callCount).toBe(1);
            options = select.find("option");
            expect(options.length).toBe(3);
        });
        it("should refresh only once when child entries are removed", function () {
            var options = select.children("option");
            scope.list = {a:{l:1, v:1, g:1}, b:{l:2, v:2, g:2}, c:{l:3, v:3, g:3}};
            scope.$root.$digest();
            selectmenu.refresh.reset();
            delete scope.list.b;
            delete scope.list.c;
            scope.$root.$digest();
            expect(selectmenu.refresh.callCount).toBe(1);
            options = select.find("option");
            expect(options.length).toBe(1);
        });
        it("should refresh if the option label changes", function() {
            scope.list = {a: {l:1, v:1, g:1}};
            scope.$root.$digest();
            selectmenu.refresh.reset();
            scope.list.a.l = 2;
            scope.$root.$digest();
            expect(selectmenu.refresh.callCount).toBe(1);
        });
        it("should refresh if the option group changes", function() {
            scope.list = {a: {l:1, v:1, g:1}};
            scope.$root.$digest();
            selectmenu.refresh.reset();
            scope.list.a.g = 2;
            scope.$root.$digest();
            expect(selectmenu.refresh.callCount).toBe(1);
        });
        it("should not refresh if the option value changes", function() {
            scope.list = {a: {l:1, v:1, g:1}};
            scope.$root.$digest();
            selectmenu.refresh.reset();
            scope.list.a.v = 2;
            scope.$root.$digest();
            expect(selectmenu.refresh.callCount).toBe(0);
        });
        it("should not refresh if nothing changes", function () {
            scope.list = {a: {l:1, v:1, g:1}};
            scope.$root.$digest();
            selectmenu.refresh.reset();
            scope.$root.$digest();
            expect(selectmenu.refresh.callCount).toBe(0);
        });

    });


});
