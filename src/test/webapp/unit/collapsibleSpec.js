define(["unit/testUtils"], function(utils) {

    describe("collapsible", function() {

        it('should collapse the content by a click', function() {
            var d = utils.compileInPage('<div id="el" data-role="collapsible">' +
                '<h3>header</h3>' +
                '<p>content</p>' +
                '</div>');
            var input = d.element;
            var header = input.find('h3');
            var content = input.find(".ui-collapsible-content");
            expect(content.hasClass('ui-collapsible-content-collapsed')).toBeTruthy();
            header.trigger('click');
            expect(content.hasClass('ui-collapsible-content-collapsed')).toBeFalsy();
        });
    });

});