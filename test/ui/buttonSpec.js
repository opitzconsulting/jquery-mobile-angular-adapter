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
                    '<button id="mysel" ng:click="flag = true">' +
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


    it('should use the diabled attribute', function() {
        loadHtml('/jqmng/test/ui/test-fixture.html', function(frame) {
            var page = frame.$('#start');
            // Note: Be sure to use ng:repeat, as this is the most problematic case!
            page.append('<div data-role="content">' +
                    '<div ng:repeat="item in [1]">' +
                    '<input name="mysel" id="mysel" type="checkbox" value="false" disabled="{{disabled}}"><label for="mysel" id="mylab">Entry</label>' +
                    '</div>' +
                    '</div>');
        });
        runs(function() {
            var page = testframe().$('#start');
            var input = page.find("#mysel");
            var parentDiv = input.parent();
            var scope = input.scope();
            scope.$set('disabled', false);
            scope.$eval();
            expect(parentDiv.hasClass('ui-disabled')).toBeFalsy();
            scope.$set('disabled', true);
            scope.$eval();
            expect(parentDiv.hasClass('ui-disabled')).toBeTruthy();
        });
    });
});

