describe("collapsible", function () {

    it("should stamp the widget using the jqm widget", function() {
        spyOn($.fn, 'collapsible');
        var c = testutils.compileInPage('<div data-role="collapsible" ng-repeat="l in list"></div>');
        expect($.fn.collapsible.callCount).toBe(0);
        var scope = c.page.scope();
        scope.list = [1,2];
        scope.$root.$digest();
        expect($.fn.collapsible.callCount).toBe(2);
    });

    it('should collapse the content by a click', function () {
        var d = testutils.compileInPage('<div id="el" data-role="collapsible">' +
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

    it("should use the disabled attribute", function() {
        var d = testutils.compileInPage('<div id="el" data-role="collapsible" ng-disabled="disabled">' +
            '<h3>header</h3>' +
            '<p>content</p>' +
            '</div>');
        var input = d.element;
        var scope = input.scope();
        expect(input.hasClass('ui-state-disabled')).toBe(false);
        scope.disabled = true;
        scope.$root.$digest();
        expect(input.hasClass('ui-state-disabled')).toBe(true);
    });
});
