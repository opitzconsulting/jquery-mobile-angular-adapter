/*
 * Tests for the slider widget integration.
 */
describe("selectmenu", function() {
    it('should save the ui value into the model when using non native menus', function() {
        loadHtml('/jqmng/test/ui/test-fixture.html', function(frame) {
            var page = frame.$('#start');
            // Note: Be sure to use ng:repeat, as this is the most problematic case!
            page.append(
                    '<div data-role="content">' +
                            '<select ng:repeat="item in [1]" name="mysel" id="mysel" data-native-menu="false"><option value="v1" default="true">v1</option><option value="v2">v2</option></select>' +
                            '</div>');
        });
        runs(function() {
            var page = testframe().$("#start");
            var select = page.find("#mysel");
            expect(select[0].value).toEqual("v1");
            var scope = select.scope();
            expect(scope.$get('mysel')).toEqual("v1");
            // find the menu and click on the second entry
            var popup = page.find(".ui-selectmenu");
            var options = popup.find("li");
            var option = testframe().$(options[1]);
            option.trigger('vclick');
            expect(scope.$get('mysel')).toEqual("v2");
        });
    });

    it('should save the model value into the ui', function() {
        loadHtml('/jqmng/test/ui/test-fixture.html', function(frame) {
            var page = frame.$('#start');
            // Note: Be sure to use ng:repeat, as this is the most problematic case!
            page.append(
                    '<div data-role="content">' +
                            '<select ng:repeat="item in [1]" name="mysel" id="mysel" data-native-menu="false"><option value="v1" default="true">v1</option><option value="v2">v2</option></select>' +
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
            scope.$set("mysel", "v2");
            scope.$eval();
            expect(select[0].value).toEqual("v2");
            expect(valueSpan.text()).toEqual("v2");
        });
    });

    it('should use the diabled attribute', function() {
        loadHtml('/jqmng/test/ui/test-fixture.html', function(frame) {
            var page = frame.$('#start');
            // Note: Be sure to use ng:repeat, as this is the most problematic case!
            page.append(
                    '<div data-role="content">' +
                            '<select ng:repeat="item in [1]" name="mysel" id="mysel" data-native-menu="false" disabled="{{disabled}}"><option value="v1" default="true">v1</option><option value="v2">v2</option></select>' +
                            '</div>');
        });
        runs(function() {
            var page = testframe().$("#start");
            var select = page.find("#mysel");
            var scope = select.scope();
            scope.$set('disabled', false);
            scope.$eval();
            var disabled = select.selectmenu('option', 'disabled');
            expect(disabled).toEqual(false);
            scope.$set('disabled', true);
            scope.$eval();
            var disabled = select.selectmenu('option', 'disabled');
            expect(disabled).toEqual(true);
        });
    });


});
