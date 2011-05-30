/*
 * Tests for the button widget integration.
 */
describe("button", function() {
    it('should allow clicks via ng:click', function() {
        loadHtml('/jqmng/test/ui/test-fixture.html', function(frame) {
            var page = frame.$('#start');
            // Note: Be sure to use ng:repeat, as this is the most problematic case!
            page.append('<div data-role="content">' +
                    '<div ng:repeat="item in [1]">' +
                    '<button id="mysel" ng:click="flag = true">Test</button>' +
                    '</div>' +
                    '</div>');
        });
        runs(function() {
            var page = testframe().$('#start');
            var input = page.find("#mysel");
            var scope = input.scope();
            expect(scope.$get('flag')).toBeFalsy();
            input.trigger('click');
            expect(scope.$get('flag')).toBeTruthy();
        });

    });


    it('should use the disabled attribute', function() {
        loadHtml('/jqmng/test/ui/test-fixture.html', function(frame) {
            var page = frame.$('#start');
            // Note: Be sure to use ng:repeat, as this is the most problematic case!
            page.append('<div data-role="content">' +
                    '<div ng:repeat="item in [1]">' +
                    '<button id="mysel" ng:click="flag = true" disabled="{{disabled}}">Test</button>' +
                    '</div>' +
                    '</div>');
        });
        runs(function() {
            var page = testframe().$('#start');
            var input = page.find("#mysel");
            var scope = input.scope();
            var parentDiv = input.parent();
            scope.$set('disabled', false);
            scope.$eval();
            expect(parentDiv.hasClass('ui-disabled')).toBeFalsy();
            scope.$set('disabled', true);
            scope.$eval();
            expect(parentDiv.hasClass('ui-disabled')).toBeTruthy();
        });
    });
});

