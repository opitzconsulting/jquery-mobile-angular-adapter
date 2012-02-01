define(["unit/testUtils"], function(utils) {
    /**
     * Different usecases to reproduce errors from github issues.
     */
    describe('links', function() {
        it("should not style a link with the ui-link class when it is used in a listview but use ui-link-inherited", function() {
            var c = utils.compileInPage('<ul data-role="listview"><li ng:repeat="l in [1]"><a href="" ></a></li></ul>');
            expect(c.element.find('a').hasClass('ui-link')).toBe(false);
            expect(c.element.find('a').hasClass('ui-link-inherit')).toBe(true);
        });
    });
});

