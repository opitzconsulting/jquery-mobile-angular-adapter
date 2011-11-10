define(["unit/testUtils"], function(utils) {

    describe("collapsible", function() {

        it('should collapse the content by a click', function() {
            // Note: Be sure to use ng:repeat, as this is the most problematic case!
            var d = utils.compileInPage('<div id="el" data-role="collapsible" ng:repeat="item in [1]">' +
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

        it('should be removable when ng:repeat shrinks', function() {
            // Note: Be sure to use ng:repeat, as this is the most problematic case!
            var d = utils.compileInPage('<div ng:init="mylist = [1,2]">' +
                '<div id="el" data-role="collapsible" ng:repeat="item in mylist">' +
                '<h3>header</h3>' +
                '<p>content</p>' +
                '</div>' +
                '</div>');
            var container = d.element;
            var scope = container.scope();
            expect(container.children('div').length).toEqual(2);
            scope.mylist = [1];
            scope.$eval();
            expect(container.children('div').length).toEqual(1);
        });

    });

});