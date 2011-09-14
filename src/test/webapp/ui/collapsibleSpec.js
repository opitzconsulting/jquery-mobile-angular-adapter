define(function() {

    describe("collapsible", function() {

        it('should collapse the content by a click', function() {
            loadHtml('/jqmng/ui/test-fixture.html', function(frame) {
                var page = frame.$('#start');
                // Note: Be sure to use ng:repeat, as this is the most problematic case!
                page.append('<div data-role="content">' +
                    '<div id="el" data-role="collapsible" ng:repeat="item in [1]">' +
                    '<h3>header</h3>' +
                    '<p>content</p>' +
                    '</div>' +
                    '</div>');
            });
            runs(function() {
                var page = testframe().$('#start');
                var input = page.find("#el");
                var header = input.find('h3');
                var content = input.find(".ui-collapsible-content");
                expect(content.hasClass('ui-collapsible-content-collapsed')).toBeFalsy();
                header.trigger('vclick'); // for jqm 1 beta
                header.trigger('vmouseup'); // for jqm 1 alpha
                expect(content.hasClass('ui-collapsible-content-collapsed')).toBeTruthy();
            });

        });

        it('should be removable when ng:repeat shrinks', function() {
            loadHtml('/jqmng/ui/test-fixture.html', function(frame) {
                var page = frame.$('#start');
                // Note: Be sure to use ng:repeat, as this is the most problematic case!
                page.append('<div data-role="content" ng:init="mylist = [1,2]">' +
                    '<div id="el" data-role="collapsible" ng:repeat="item in mylist">' +
                    '<h3>header</h3>' +
                    '<p>content</p>' +
                    '</div>' +
                    '</div>');
            });
            runs(function() {
                var page = testframe().$("#start");
                var scope = page.scope();
                // ui select creates a new parent for itself
                var content = page.find(":jqmData(role='content')");
                expect(content.children('div').length).toEqual(2);
                scope.mylist = [1];
                scope.$eval();
                expect(content.children('div').length).toEqual(1);
            });
        });

    });

});