/*
 * Tests for the textinput widget integration.
 */
describe("textInput", function() {
    it('should save the ui value into the model', function() {
        loadHtml('/jqmng/test/ui/test-fixture.html', function(frame) {
            var page = frame.$('#start');
            // Note: Be sure to use ng:repeat, as this is the most problematic case!
            page.append('<div data-role="content">' +
                    '<div ng:repeat="item in [1]">' +
                    '<input name="mysel" id="mysel" type="text"></div>' +
                    '</div>');
        });
        runs(function() {
            var page = testframe().$('#start');
            var input = page.find("#mysel");
            var scope = input.scope();
            expect(scope.$get('mysel')).toBeFalsy();
            input[0].value = 'test';
            input.trigger('change');
            expect(scope.$get('mysel')).toEqual('test');
        });

    });

    it('should save the model value into the ui', function() {
        loadHtml('/jqmng/test/ui/test-fixture.html', function(frame) {
            var page = frame.$('#start');
            // Note: Be sure to use ng:repeat, as this is the most problematic case!
            page.append('<div data-role="content">' +
                    '<div ng:repeat="item in [1]">' +
                    '<input name="mysel" id="mysel" type="text"></div>' +
                    '</div>');
        });
        runs(function() {
            var page = testframe().$('#start');
            var input = page.find("#mysel");
            var scope = input.scope();
            expect(input[0].value).toEqual('');
            scope.$set("mysel", 'test');
            scope.$eval();
            expect(input[0].value).toEqual('test');
        });
    });

    it('should use the diabled attribute', function() {
        loadHtml('/jqmng/test/ui/test-fixture.html', function(frame) {
            var page = frame.$('#start');
            // Note: Be sure to use ng:repeat, as this is the most problematic case!
            page.append('<div data-role="content">' +
                    '<div ng:repeat="item in [1]">' +
                    '<input name="mysel" id="mysel" type="text" disabled="{{disabled}}"></div>' +
                    '</div>');
        });
        runs(function() {
            var page = testframe().$('#start');
            var input = page.find("#mysel");
            var scope = input.scope();
            scope.$set('disabled', false);
            scope.$eval();
            expect(input.hasClass('ui-disabled')).toBeFalsy();
            scope.$set('disabled', true);
            scope.$eval();
            expect(input.hasClass('ui-disabled')).toBeTruthy();
        });
    });
});

