/*
 * Tests for the slider widget integration.
 * Needs to be a ui test, as there is deferring going on in the widget...
 */
describe("selectmenu", function() {
    var element, scope;

    function compile(html) {
        // create a jquery mobile page widget and init it.
        // Note: It is important to add it to the page,
        // as some widget rely on that (e.g. selectmenu).
        frame().$("body").append(html);
        element = frame().$("#testpage");
        element.page();
        // get the angularJs scope from the jquery element.
        scope = element.scope();
    }

    beforeEach(function() {
        element = null;
        scope = null;

    });

    it('should save the ui value into the model when using non native menus', function() {
        loadHtml('/jqmng/test/ui/test-fixture.html');
        runs(function() {
            compile('<div id="testpage" data-role="page">' +
                    '<div data-role="content">' +
                    '<select name="mysel" id="mysel" data-native-menu="false"><option value="v1" default="true">v1</option><option value="v2">v2</option></select>' +
                    '</div>' +
                    '</div>');
        });
        waitsForAsync();
        runs(function() {
            var select = element.find("#mysel");
            expect(select[0].value).toEqual("v1");
            var scope = select.scope();
            expect(scope.$get('mysel')).toEqual("v1");
            // find the menu and click on the second entry
            var popup = element.find(".ui-selectmenu");
            var options = popup.find("li");
            var option = frame().$(options[1]);
            option.trigger('vclick');
            expect(scope.$get('mysel')).toEqual("v2");
        });
    });

    it('should save the ui value into the model when using ng:repeat and non native menus', function() {
        loadHtml('/jqmng/test/ui/test-fixture.html');
        runs(function() {
            compile('<div id="testpage" data-role="page">' +
                    '<div data-role="content">' +
                    '<select ng:repeat="item in [1]" name="mysel" id="mysel" data-native-menu="false"><option value="v1" default="true">v1</option><option value="v2">v2</option></select>' +
                    '</div>' +
                    '</div>');
        });
        waitsForAsync();
        runs(function() {
            var select = element.find("#mysel");
            expect(select[0].value).toEqual("v1");
            var scope = select.scope();
            expect(scope.$get('mysel')).toEqual("v1");
            // find the menu and click on the second entry
            var popup = element.find(".ui-selectmenu");
            var options = popup.find("li");
            var option = frame().$(options[1]);
            option.trigger('vclick');
            expect(scope.$get('mysel')).toEqual("v2");
        });
    });

    it('should save the model value into the ui', function() {
        loadHtml('/jqmng/test/ui/test-fixture.html');
        runs(function() {
            compile('<div id="testpage" data-role="page">' +
                    '<div data-role="content">' +
                    '<select name="mysel2" id="mysel2"><option value="v1" default="true">v1</option><option value="v2">v2</option></select>' +
                    '</div>' +
                    '</div>');
        });
        waitsForAsync();
        runs(function() {
            var select = element.find("#mysel2");
            var scope = select.scope();
            expect(select[0].value).toEqual("v1");
            // jquery mobile creates a new span
            // that displays the actual value of the select box.
            var valueSpan = element.find(".ui-btn-text");
            expect(valueSpan.text()).toEqual("v1");
            scope.$set("mysel2", "v2");
            scope.$eval();
            expect(select[0].value).toEqual("v2");
            valueSpan = element.find(".ui-btn-text");
            expect(valueSpan.text()).toEqual("v2");
        });
    });

    it('should save the model value into the ui when using ng:repeat', function() {
        loadHtml('/jqmng/test/ui/test-fixture.html');
        runs(function() {
            compile('<div id="testpage" data-role="page">' +
                    '<div data-role="content">' +
                    '<select ng:repeat="item in [1]" name="mysel2" id="mysel2"><option value="v1" default="true">v1</option><option value="v2">v2</option></select>' +
                    '</div>' +
                    '</div>');
        });
        waitsForAsync();
        runs(function() {
            var select = element.find("#mysel2");
            var scope = select.scope();
            expect(select[0].value).toEqual("v1");
            // jquery mobile creates a new span
            // that displays the actual value of the select box.
            var valueSpan = element.find(".ui-btn-text");
            expect(valueSpan.text()).toEqual("v1");
            scope.$set("mysel2", "v2");
            scope.$eval();
            expect(select[0].value).toEqual("v2");
            valueSpan = element.find(".ui-btn-text");
            expect(valueSpan.text()).toEqual("v2");
        });
    });

});
