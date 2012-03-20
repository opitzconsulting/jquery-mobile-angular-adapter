jqmng.require(["unit/testUtils"], function(utils) {

    describe("listview", function() {
        it('should refresh when first the requestrefresh event on a list item ' +
            'and then the page create event is fired', function() {
            var d = utils.compileInPage(
                '<ul data-role="listview" data-inset="true"><li>1</li></ul>');
            var list = d.element;
            var lis = list.find("li");
            expect(lis.eq(0).hasClass('ui-corner-top')).toBe(true);
            expect(lis.eq(0).text()).toBe('1');
            expect(lis.eq(0).hasClass('ui-corner-bottom')).toBe(true);
            list.append('<li>2</li>');
            lis.eq(0).trigger('requestrefresh');
            d.page.trigger('create');
            lis = list.find("li");
            expect(lis.eq(0).hasClass('ui-corner-top')).toBe(true);
            expect(lis.eq(1).hasClass('ui-corner-bottom')).toBe(true);
        });

        it('should not refresh when the requestrefresh event on a list item is not fired ' +
            'and then the page create event is fired', function() {
            var d = utils.compileInPage(
                '<ul data-role="listview" data-inset="true"><li>1</li></ul>');
            var list = d.element;
            var lis = list.find("li");
            expect(lis.eq(0).hasClass('ui-corner-top')).toBe(true);
            expect(lis.eq(0).text()).toBe('1');
            expect(lis.eq(0).hasClass('ui-corner-bottom')).toBe(true);
            list.append('<li>2</li>');
            d.page.trigger('create');
            lis = list.find("li");
            expect(lis.eq(1).hasClass('ui-corner-bottom')).toBe(false);
        });

        it('should be removable when subpages are used', function() {
            var d = utils.compileInPage('<div>' +
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

});