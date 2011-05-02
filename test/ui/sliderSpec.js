/*
 * Tests for the slider widget integration.
 * Needs to be a ui test, as there is deferring going on in the widget...
 */
describe("slider", function() {
    var element, scope;

    function compile(html) {
        // create a jquery mobile page widget. This should
        // initialize jquery mobile and also angular js!
        element = frame().$(html);
        element.page();
        // get the angularJs scope from the jquery element.
        scope = element.scope();
    }

    beforeEach(function() {
        element = null;
        scope = null;

    });

    it('should save the ui value into the model', function() {
        loadHtml('/jqmng/test/ui/test-fixture.html');
        runs(function() {
            compile('<div id="page1" data-role="page">' +
                    '<div data-role="content">' +
                    '<select name="mysel" id="mysel" data-role="slider"><option value="v1" default="true">v1</option><option value="v2">v2</option></select>' +
                    '</div>' +
                    '</div>');
        });
        waitsForAsync();
        runs(function() {
            var select = element.find("#mysel");
            var scope = select.scope();
            expect(scope.$get('mysel')).toEqual("v1");
            // jquery mobile uses an anchor to simulate the select
            var anchor = element.find("a");
            expect(anchor.length).toEqual(1);
            anchor.trigger('vmousedown');
            anchor.trigger('vmouseup');
            expect(scope.$get('mysel')).toEqual("v2");
        });

    });

    it('should save the ui value into the model with ng:repeat', function() {
        loadHtml('/jqmng/test/ui/test-fixture.html');
        runs(function() {
            compile('<div id="page1" data-role="page">' +
                    '<div data-role="content">' +
                    '<select ng:repeat="item in [1]" name="mysel" id="mysel" data-role="slider"><option value="v1" default="true">v1</option><option value="v2">v2</option></select>' +
                    '</div>' +
                    '</div>');
            waitsForAsync();
            runs(function() {
                var select = element.find("#mysel");
                var scope = select.scope();
                expect(scope.$get('mysel')).toEqual("v1");
                // jquery mobile uses an anchor to simulate the select
                var anchor = element.find("a");
                expect(anchor.length).toEqual(1);
                anchor.trigger('vmousedown');
                anchor.trigger('vmouseup');
                expect(scope.$get('mysel')).toEqual("v2");
            });
        });
    });

    it('should save the model value into the ui', function() {
        loadHtml('/jqmng/test/ui/test-fixture.html');
        runs(function() {
            compile('<div id="page1" data-role="page">' +
                    '<div data-role="content">' +
                    '<select name="mysel2" id="mysel2" data-role="slider"><option value="v1" default="true">v1</option><option value="v2">v2</option></select>' +
                    '</div>' +
                    '</div>');
            waitsForAsync();
            runs(function() {
                var select = element.find("#mysel2");
                var scope = select.scope();
                expect(select[0].value).toEqual("v1");
                // jquery mobile creates a new span
                // that displays the actual value of the select box.
                var anchor = element.find("a");
                expect(anchor.attr('aria-valuetext')).toEqual("v1");
                scope.$set("mysel2", "v2");
                scope.$eval();
                expect(select[0].value).toEqual("v2");
                anchor = element.find("a");
                expect(anchor.attr('aria-valuetext')).toEqual("v2");
            });
        });
    });

    it('should save the model value into the ui with ng:repeat', function() {
        loadHtml('/jqmng/test/ui/test-fixture.html');
        runs(function() {
            compile('<div id="page1" data-role="page">' +
                    '<div data-role="content">' +
                    '<select ng:repeat="item in [1]" name="mysel2" id="mysel2" data-role="slider"><option value="v1" default="true">v1</option><option value="v2">v2</option></select>' +
                    '</div>' +
                    '</div>');
            waitsForAsync();
            runs(function() {
                var select = element.find("#mysel2");
                var scope = select.scope();
                expect(select[0].value).toEqual("v1");
                // jquery mobile creates a new span
                // that displays the actual value of the select box.
                var anchor = element.find("a");
                expect(anchor.attr('aria-valuetext')).toEqual("v1");
                scope.$set("mysel2", "v2");
                scope.$eval();
                expect(select[0].value).toEqual("v2");
                anchor = element.find("a");
                expect(anchor.attr('aria-valuetext')).toEqual("v2");
            });
        });

    });

    it('should use the diabled attribute', function() {
        loadHtml('/jqmng/test/ui/test-fixture.html');
        runs(function() {
            compile('<div id="page1" data-role="page">' +
                    '<div data-role="content">' +
                    '<select ng:repeat="item in [1]" name="mysel2" id="mysel2" data-role="slider" disabled="{{disabled}}"><option value="v1" default="true">v1</option><option value="v2">v2</option></select>' +
                    '</div>' +
                    '</div>');
            waitsForAsync();
            runs(function() {
                var select = element.find("#mysel2");
                var scope = select.scope();
                scope.$set('disabled', false);
                scope.$eval();
                var disabled = select.slider('option', 'disabled');
                expect(disabled).toEqual(false);
                scope.$set('disabled', true);
                scope.$eval();
                var disabled = select.slider('option', 'disabled');
                expect(disabled).toEqual(true);
            });
        });

    })
});

