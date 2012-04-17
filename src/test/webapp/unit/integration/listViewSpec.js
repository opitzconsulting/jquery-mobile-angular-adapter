describe("listview", function () {
    it('should be removable when subpages are used', function () {
        var d = testutils.compileInPage('<div>' +
            '<ul data-role="listview" id="list1">' +
            '<li>Test' +
            '<ul><li>Item 2.1</li><li>Item 2.2</li></ul>' +
            '</li></ul>' +
            '</div>');
        var container = d.element;
        var list = container.children('ul');
        // ui select creates sub pages for nested uls.
        expect($(":jqmData(role='page')").length).toEqual(2);
        list.remove();
        expect($(":jqmData(role='page')").length).toEqual(1);
    });
});
