define(["unit/testUtils"], function(utils) {

    describe("listview", function() {
        it('should be working without ng:repeat', function() {
            var d = utils.compileInPage(
                '<ul data-role="listview">' +
                    '<li id="entry">Test</li>' +
                    '</ul>');
            var list = d.element;
            var li = list.find("li");
            expect(li.hasClass('ui-li')).toBeTruthy();
        });

        it('should be usable with ng:repeat', function() {
            var d = utils.compileInPage(
                '<ul data-role="listview">' +
                    '<li ng:repeat="item in [1]">{{item}} Test</li>' +
                    '</ul');
            var page = d.page;
            var li = page.find("li");
            expect(li.hasClass('ui-li')).toBeTruthy();
        });

        it('should refresh entries when they are added and enhanced by the create event', function() {
            var d = utils.compileInPage(
                '<ul data-role="listview" data-inset="true"><li>1</li></ul>');
            var list = d.element;
            var lis = list.find("li");
            expect(lis.eq(0).hasClass('ui-corner-top'));
            expect(lis.eq(0).text()).toBe('1');
            expect(lis.eq(0).hasClass('ui-corner-bottom'));
            list.append('<li>2</li>');
            list.trigger('create');
            lis = list.find("li");
            expect(lis.length).toEqual(2);
            expect(lis.eq(0).hasClass('ui-corner-top'));
            expect(lis.eq(0).text()).toBe('1');
            expect(lis.eq(1).hasClass('ui-corner-bottom'));
            expect(lis.eq(1).text()).toBe('2');
        });

        it('should refresh when entries are removed', function() {
            var d = utils.compileInPage(
                '<ul data-role="listview" data-inset="true"><li>1</li><li>2</li></ul>');
            var container = d.element;
            var lis = container.children('li');
            expect(lis.length).toEqual(2);
            expect(lis.eq(0).hasClass('ui-corner-top'));
            expect(lis.eq(0).text()).toBe('1');
            expect(lis.eq(1).hasClass('ui-corner-bottom'));
            expect(lis.eq(1).text()).toBe('2');
            container.children('li').eq(0).remove();
            var lis = container.children('li');
            expect(lis.eq(0).hasClass('ui-corner-top'));
            expect(lis.eq(0).text()).toBe('2');
            expect(lis.eq(0).hasClass('ui-corner-bottom'));
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