define(["unit/testUtils"], function(utils) {

    describe("listview", function() {
        it('should be usable without ng:repeat', function() {
            var d = utils.compileInPage(
                '<ul data-role="listview" ng:repeat="item in [1]">' +
                    '<li id="entry">Test</li>' +
                    '</ul>');
            var list = d.element;
            var li = list.find("li");
            expect(li.hasClass('ui-li')).toBeTruthy();
        });

        it('should be usable with ng:repeat', function() {
            var d = utils.compileInPage(
                '<ul data-role="listview" ng:repeat="i in [1]">' +
                    '<li ng:repeat="item in [1]">{{item}} Test</li>' +
                    '</ul');
            var page = d.page;
            var li = page.find("li");
            expect(li.hasClass('ui-li')).toBeTruthy();
        });

        it('should refresh entries if used with ng:repeat', function() {
            var d = utils.compileInPage(
                '<ul data-role="listview" ng:repeat="item in [1]">' +
                    '<li ng:repeat="item in list">Test</li>' +
                    '</ul>');
            var list = d.element;
            var li = list.find("li");
            var scope = list.scope();
            expect(li.length).toEqual(0);
            scope.$set('list', [1,2]);
            scope.$eval();
            li = list.find("li");
            expect(li.length).toEqual(2);
            for (var i = 0; i < li.length; i++) {
                expect($(li[i]).hasClass('ui-li')).toBeTruthy();
            }
        });

        it('should be removable when ng:repeat shrinks', function() {
            var d = utils.compileInPage('<div ng:init="mylist = [1,2]">' +
                '<ul data-role="listview" ng:repeat="item in mylist">' +
                '<li>Test</li>' +
                '</ul>' +
                '</div>');
            var container = d.element;
            var scope = container.scope();
            expect(container.children('ul').length).toEqual(2);
            scope.mylist = [1];
            scope.$eval();
            expect(container.children('ul').length).toEqual(1);
        });

        it('should be removable when ng:repeat shrinks and subpages are used', function() {
            var d = utils.compileInPage('<div ng:init="mylist = [1,2]">' +
                '<ul data-role="listview" ng:repeat="item in mylist" id="list{{$index}}">' +
                '<li>Test' +
                '<ul><li>Item 2.1</li><li>Item 2.2</li></ul>' +
                '</li></ul>' +
                '</div>');
            var container = d.element;
            var scope = container.scope();
            expect(container.children('ul').length).toEqual(2);
            // ui select creates sub pages.
            expect($(":jqmData(role='page')").length).toEqual(3);
            scope.mylist = [1];
            scope.$eval();
            expect($(":jqmData(role='page')").length).toEqual(3);
        });
    });

});