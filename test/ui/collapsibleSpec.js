/*
 * Tests for the collapsible widget integration.
 */
describe("collapsible", function() {
    it('should collapse the content by a click', function() {
        loadHtml('/jqmng/test/ui/test-fixture.html', function(frame) {
            var page = frame.$('#start');
            // Note: Be sure to use ng:repeat, as this is the most problematic case!
            page.append('<div id="el" data-role="collapsible" ng:repeat="item in [1]">' +
                    '<h3>header</h3>' +
                    '<p>content</p>' +
                    '</div>');
        });
        runs(function() {
            var page = testframe().$('#start');
            var input = page.find("#el");
            var header = input.find('h3');
            var content = input.find(".ui-collapsible-content");
            expect(content.hasClass('ui-collapsible-content-collapsed')).toBeFalsy();
            header.trigger('vmouseup');
            expect(content.hasClass('ui-collapsible-content-collapsed')).toBeTruthy();
        });

    });
});

