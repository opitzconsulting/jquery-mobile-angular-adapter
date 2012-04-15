jqmng.require([], function() {

    describe("selectmenu", function() {
        it('should save the ui value into the model when using non native menus and popups', function() {
            var scope, dialogOpen;
            loadHtml('/jqmng/ui/test-fixture.html', function(frame) {
                var page = frame.$('#start');
                page.append(
                    '<div data-role="content" ng-init="mysel=\'v1\'">' +
                        '<select ng-model="mysel" id="mysel" data-native-menu="false"><option value="v1" default="true">v1</option><option value="v2">v2</option></select>' +
                        '</div>');
            });
            runs(function() {
                var $ = testframe().$;
                var page = $("#start");
                var select = page.find("#mysel");
                expect(select[0].value).toEqual("v1");
                scope = select.scope();
                expect(scope.mysel).toEqual("v1");
                dialogOpen = function() {
                    return select.data('selectmenu').isOpen;
                };
                expect(dialogOpen()).toBeFalsy();
                // find the menu and click on the second entry
                var oldHeight = testframe().$.fn.height;
                testframe().$.fn.height = function() {
                    if (this[0].window == testframe()) {
                        return 10;
                    }
                    return oldHeight.apply(this, arguments);
                };
                select.selectmenu('open');
            });
            waitsFor(function() {
                return dialogOpen();
            });
            runs(function() {
                var $ = testframe().$;
                var dialog = $(".ui-dialog");
                $(dialog.find('li a')[1]).trigger('click')
                expect(scope.mysel).toEqual("v2");
            });
            waitsFor(function() {
                return !dialogOpen();
            });
        });
        /*
        it('should save the ui value into the model when using non native menus', function() {
            loadHtml('/jqmng/ui/test-fixture.html', function(frame) {
                var page = frame.$('#start');
                page.append(
                    '<div data-role="content" ng-init="mysel=\'v1\'">' +
                        '<select ng-model="mysel" id="mysel" data-native-menu="false"><option value="v1" default="true">v1</option><option value="v2">v2</option></select>' +
                        '</div>');
            });
            runs(function() {
                var page = testframe().$("#start");
                var select = page.find("#mysel");
                expect(select[0].value).toEqual("v1");
                var scope = select.scope();
                expect(scope.mysel).toEqual("v1");

                // find the menu and click on the second entry
                select.selectmenu('open');
                var popup = page.find(".ui-selectmenu");
                var options = popup.find("li");
                var option = testframe().$(options[1]);
                option.trigger('click');
                select.selectmenu('close');
                expect(scope.mysel).toEqual("v2");
            });
        });

        it('should save the model value into the ui when using non native menus', function() {
            loadHtml('/jqmng/ui/test-fixture.html', function(frame) {
                var page = frame.$('#start');
                page.append(
                    '<div data-role="content" ng-init="mysel=\'v1\'">' +
                        '<select ng-model="mysel" id="mysel" data-native-menu="false"><option value="v1" default="true">v1</option><option value="v2">v2</option></select>' +
                        '</div>');
            });
            runs(function() {
                var page = testframe().$("#start");
                var select = page.find("#mysel");
                var scope = select.scope();
                expect(select[0].value).toEqual("v1");
                // jquery mobile creates a new span
                // that displays the actual value of the select box.
                var valueSpan = select.parent().find(".ui-btn-text");
                expect(valueSpan.text()).toEqual("v1");
                scope.mysel= "v2";
                scope.$apply();
                expect(select[0].value).toEqual("v2");
                expect(valueSpan.text()).toEqual("v2");
            });
        });

        it('should use the disabled attribute', function() {
            loadHtml('/jqmng/ui/test-fixture.html', function(frame) {
                var page = frame.$('#start');
                page.append(
                    '<div data-role="content" ng-init="mysel=\'v1\'">' +
                        '<select ng-model="mysel" id="mysel" data-native-menu="false" ng-bind-attr="{disabled: \'{{disabled}}\'}"><option value="v1" default="true">v1</option><option value="v2">v2</option></select>' +
                        '</div>');
            });
            runs(function() {
                var page = testframe().$("#start");
                var select = page.find("#mysel");
                var scope = select.scope();
                scope.disabled=false;
                scope.$apply();
                var disabled = select.selectmenu('option', 'disabled');
                expect(disabled).toEqual(false);
                scope.disabled=true;
                scope.$apply();
                var disabled = select.selectmenu('option', 'disabled');
                expect(disabled).toEqual(true);
            });
        });

        it('should be removable', function() {
            loadHtml('/jqmng/ui/test-fixture.html', function(frame) {
                var page = frame.$('#start');
                page.append(
                    '<div data-role="content" ng-init="mysel=\'v1\'">' +
                        '<select ng-model="mysel" id="mysel" data-native-menu="false" ng-bind-attr="{disabled: \'{{disabled}}\'}"><option value="v1" default="true">v1</option><option value="v2">v2</option></select>' +
                        '</div>');
            });
            runs(function() {
                var page = testframe().$("#start");
                var scope = page.scope();
                // ui select creates a new parent for itself
                var content = page.find(":jqmData(role='content')");
                expect(content.children('div').length).toEqual(1);
                // select creates a parent div. This should be removed when the select is removed.
                content.find('select').eq(0).remove();
                expect(content.children('div').length).toEqual(0);
            });
        });

        it('should refresh when the dialog opens', function() {
            loadHtml('/jqmng/ui/test-fixture.html', function(frame) {
                var page = frame.$('#start');
                // Note: Be sure to use ng-repeat, as this is the most problematic case!
                page.append(
                    '<div data-role="content">' +
                        '<select ng-repeat="item in [1]" ng-model="mysel" id="mysel" data-native-menu="false" ng-options="o for o in options"></select>' +
                        '</div>');
            });
            runs(function() {
                var page = testframe().$("#start");
                var select = page.find("#mysel");
                var scope = select.scope();
                scope.options = [1,2];
                scope.mysel = 1;
                scope.$apply();
                select.selectmenu('open');
                expect(page.find(".ui-selectmenu li").length).toEqual(2);
            });
        });

        it('should be able to display the label of a new entry when the options grow in a native menu', function() {
            loadHtml('/jqmng/ui/test-fixture.html', function(frame) {
                var page = frame.$('#start');
                // Note: Be sure to use ng-repeat, as this is the most problematic case!
                page.append(
                    '<div data-role="content">' +
                        '<select data-native-menu="true" ng-model="myval" id="mysel" ng-options="e.value for e in list"></select>' +
                        '</div>');
            });
            runs(function() {
                var page = testframe().$("#start");
                var select = page.find("#mysel");
                var scope = select.scope();
                expect(scope.myval).toBeFalsy();
                scope.list = [{value:'value1'}];
                scope.myval=scope.list[0];
                scope.$root.$apply();
            });
            waitsForAsync();
            runs(function() {
                var page = testframe().$("#start");
                expect(page.find(".ui-select .ui-btn-text").text()).toEqual("value1");
            });
        });
        */
    });

});