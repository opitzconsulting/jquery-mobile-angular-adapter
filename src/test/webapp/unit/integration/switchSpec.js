describe('ng-switch', function () {
    it("should enhance new children", function () {
        var c = testutils.compileInPage('<ng-switch on="value">' +
            '<div ng-switch-when="case1"><a href="" data-role="button">b1</a></div>' +
            '<div ng-switch-when="case2"><a href="" data-role="button">b2</a></div>' +
            '</ng-switch>');
        var scope = c.element.scope();
        scope.value = 'case1';
        scope.$root.$digest();
        expect(c.element.children("div").eq(0).children("a").eq(0).hasClass("ui-btn")).toBe(true);
    });

    it("should fire the remove event for every entry that is removed", function () {
        var c = testutils.compileInPage('<ng-switch on="value">' +
            '<div ng-switch-when="case1"><a href="" data-role="button">b1</a></div>' +
            '<div ng-switch-when="case2"><a href="" data-role="button">b2</a></div>' +
            '</ng-switch>');
        var scope = c.element.scope();
        scope.value = 'case1';
        scope.$root.$digest();
        var removeCount = 0;
        c.element.find('a').bind('remove', function () {
            removeCount++;
        });
        scope.$root.$digest();
        expect(removeCount).toEqual(0);
        scope.value = '';
        scope.$root.$digest();
        expect(removeCount).toEqual(1);
    });
});

