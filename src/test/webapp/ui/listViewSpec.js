define(function() {

    describe("listview", function() {
        it('should be usable without ng:repeat', function() {
            loadHtml('/jqmng/ui/test-fixture.html', function(frame) {
                var page = frame.$('#start');
                page.append('<div data-role="content">' +
                    '<ul data-role="listview" ng:repeat="item in [1]">' +
                    '<li id="entry">Test</li>' +
                    '</ul>' +
                    '</data-role>');
            });
            runs(function() {
                var page = testframe().$('#start');
                var li = page.find("li");
                expect(li.hasClass('ui-li')).toBeTruthy();
            });
        });

        it('should be usable with ng:repeat', function() {
            loadHtml('/jqmng/ui/test-fixture.html', function(frame) {
                var page = frame.$('#start');
                page.append('<div data-role="content">' +
                    '<ul data-role="listview" ng:repeat="i in [1]">' +
                    '<li ng:repeat="item in [1]">{{item}} Test</li>' +
                    '</div>');
            });
            runs(function() {
                var page = testframe().$('#start');
                var li = page.find("li");
                expect(li.hasClass('ui-li')).toBeTruthy();
            });
        });

        it('should refresh entries if used with ng:repeat', function() {
            loadHtml('/jqmng/ui/test-fixture.html', function(frame) {
                var page = frame.$('#start');
                page.append('<div data-role="content">' +
                    '<ul data-role="listview" ng:repeat="item in [1]">' +
                    '<li ng:repeat="item in list">Test</li>' +
                    '</ul>' +
                    '</div>');
            });
            runs(function() {
                var $ = testframe().$;
                var page = $('#start');
                var li = page.find("li");
                var scope = page.scope();
                expect(li.length).toEqual(0);
                scope.$set('list', [1,2]);
                scope.$eval();
                li = page.find("li");
                expect(li.length).toEqual(2);
                for (var i = 0; i < li.length; i++) {
                    expect($(li[i]).hasClass('ui-li')).toBeTruthy();
                }
            });
        });

        it('should refresh entries if used with ng:if', function() {
            loadHtml('/jqmng/ui/test-fixture.html', function(frame) {
                var page = frame.$('#start');
                page.append('<div data-role="content">' +
                    '<ul data-role="listview" ng:repeat="item in [1]">' +
                    '<li ng:if="test">Test</li>' +
                    '</ul>' +
                    '</div>');
            });
            runs(function() {
                var $ = testframe().$;
                var page = $('#start');
                var li = page.find("li");
                var scope = page.scope();
                expect(li.length).toEqual(0);
                scope.$set('test', true);
                scope.$eval();
                li = page.find("li");
                expect(li.length).toEqual(1);
                expect(li.hasClass('ui-li')).toBeTruthy();
            });
        });

        it('should be removable when ng:repeat shrinks', function() {
            loadHtml('/jqmng/ui/test-fixture.html', function(frame) {
                var page = frame.$('#start');
                page.append('<div data-role="content" ng:init="mylist = [1,2]">' +
                    '<ul data-role="listview" ng:repeat="item in mylist">' +
                    '<li>Test</li>' +
                    '</ul>' +
                    '</div>');
            });
            runs(function() {
                var page = testframe().$("#start");
                var scope = page.scope();
                // ui select creates a new parent for itself
                var content = page.find(":jqmData(role='content')");
                expect(content.children('ul').length).toEqual(2);
                scope.mylist = [1];
                scope.$eval();
                expect(content.children('ul').length).toEqual(1);
            });
        });

        it('should be removable when ng:repeat shrinks and subpages are used', function() {
            loadHtml('/jqmng/ui/test-fixture.html', function(frame) {
                var page = frame.$('#start');
                page.append('<div data-role="content" ng:init="mylist = [1,2]">' +
                    '<ul data-role="listview" ng:repeat="item in mylist">' +
                    '<li>Test' +
                    '<ul><li>Item 2.1</li><li>Item 2.2</li></ul>' +
                    '</li></ul>' +
                    '</div>');
            });
            runs(function() {
                var $ = testframe().$;
                var page = $("#start");
                var scope = page.scope();
                // ui select creates a new parent for itself
                var content = page.find(":jqmData(role='content')");
                expect(content.children('ul').length).toEqual(2);
                // ui select creates sub pages.
                expect($(":jqmData(role='page')").length).toEqual(4);
                scope.mylist = [1];
                scope.$root.$eval();
                expect($(":jqmData(role='page')").length).toEqual(3);
            });
        });
    });

});