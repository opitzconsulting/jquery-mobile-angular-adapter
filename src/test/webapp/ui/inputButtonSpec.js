define(function() {

    describe("input button", function() {

        it('should allow clicks via ng:click', function() {
            loadHtml('/jqmng/ui/test-fixture.html', function(frame) {
                var page = frame.$('#start');
                // Note: Be sure to use ng:repeat, as this is the most problematic case!
                page.append('<div data-role="content">' +
                    '<input type="submit" ng:repeat="item in [1]" id="mysel" ng:click="flag = true">Test</button>' +
                    '</div>');
            });
            runs(function() {
                var page = testframe().$('#start');
                var input = page.find("#mysel");
                var scope = input.scope();
                expect(scope.$get('flag')).toBeFalsy();
                input.trigger('click');
                expect(scope.$get('flag')).toBeTruthy();
            });

        });


        it('should use the disabled attribute', function() {
            loadHtml('/jqmng/ui/test-fixture.html', function(frame) {
                var page = frame.$('#start');
                // Note: Be sure to use ng:repeat, as this is the most problematic case!
                page.append('<div data-role="content">' +
                    '<input type="submit" ng:repeat="item in [1]" id="mysel" ng:click="flag = true" ng:bind-attr="{disabled: \'{{disabled}}\'}">Test</button>' +
                    '</div>');
            });
            runs(function() {
                var page = testframe().$('#start');
                var input = page.find("#mysel");
                var scope = input.scope();
                var parentDiv = input.parent();
                scope.$set('disabled', false);
                scope.$eval();
                expect(parentDiv.hasClass('ui-disabled')).toBeFalsy();
                scope.$set('disabled', true);
                scope.$eval();
                expect(parentDiv.hasClass('ui-disabled')).toBeTruthy();
            });
        });

        it('should be removable when ng:repeat shrinks', function() {
            loadHtml('/jqmng/ui/test-fixture.html', function(frame) {
                var page = frame.$('#start');
                // Note: Be sure to use ng:repeat, as this is the most problematic case!
                page.append('<div data-role="content" ng:init="mylist=[1,2]">' +
                    '<input type="submit" ng:repeat="item in mylist" id="mysel" ng:click="flag = true">Test</button>' +
                    '</div>');
            });
            runs(function() {
                var page = testframe().$("#start");
                var scope = page.scope();
                // ui select creates a new parent for itself
                var content = page.find(":jqmData(role='content')");
                expect(content.children('div').length).toEqual(2);
                scope.mylist = [1];
                scope.$root.$eval();
                expect(content.children('div').length).toEqual(1);
            });
        });

    });

});