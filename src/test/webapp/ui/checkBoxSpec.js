define(function() {

    describe("checkbox", function() {
        it('should save the ui value into the model', function() {
            loadHtml('/jqmng/ui/test-fixture.html', function(frame) {
                var page = frame.$('#start');
                // Note: Be sure to use ng:repeat, as this is the most problematic case!
                page.append('<div data-role="content">' +
                    '<div ng:repeat="item in [1]">' +
                    '<input name="mysel" id="mysel" type="checkbox">{{mysel}}<label for="mysel" id="mylab">Entry</label>' +
                    '</div>' +
                    '</div>');
            });
            runs(function() {
                var page = testframe().$('#start');
                var input = page.find("#mysel");
                var scope = input.scope();
                expect(scope.$get('mysel')).toBeFalsy();
                // jquery mobile reacts to clicks on the label
                var label = page.find('label');
                expect(label.length).toEqual(1);
                label.trigger('vclick');
                expect(scope.$get('mysel')).toBeTruthy();
            });

        });

        it('should save the model value into the ui', function() {
            loadHtml('/jqmng/ui/test-fixture.html', function(frame) {
                var page = frame.$('#start');
                // Note: Be sure to use ng:repeat, as this is the most problematic case!
                page.append('<div data-role="content">' +
                    '<div ng:repeat="item in [1]">' +
                    '<input name="mysel" id="mysel" type="checkbox"><label for="mysel" id="mylab">Entry</label>' +
                    '</div>' +
                    '</div>');
            });
            runs(function() {
                var page = testframe().$('#start');
                var input = page.find("#mysel");
                var scope = input.scope();
                expect(input[0].checked).toBeFalsy();
                // jquery mobile creates a new span
                // that displays the actual value of the selection.
                var iconSpan = page.find(".ui-icon");
                expect(iconSpan.hasClass('ui-icon-checkbox-on')).toBeFalsy();
                scope.$set("mysel", true);
                scope.$eval();
                expect(input[0].checked).toBeTruthy();
                expect(iconSpan.hasClass('ui-icon-checkbox-on')).toBeTruthy();
            });
        });

        it('should use the diabled attribute', function() {
            loadHtml('/jqmng/ui/test-fixture.html', function(frame) {
                var page = frame.$('#start');
                // Note: Be sure to use ng:repeat, as this is the most problematic case!
                page.append('<div data-role="content">' +
                    '<div ng:repeat="item in [1]">' +
                    '<input name="mysel" id="mysel" type="checkbox" value="false" ng:bind-attr="{disabled: \'{{disabled}}\'}"><label for="mysel" id="mylab">Entry</label>' +
                    '</div>' +
                    '</div>');
            });
            runs(function() {
                var page = testframe().$('#start');
                var input = page.find("#mysel");
                var parentDiv = input.parent();
                var scope = input.scope();
                scope.$set('disabled', false);
                scope.$eval();
                expect(parentDiv.hasClass('ui-disabled')).toBeFalsy();
                scope.$set('disabled', true);
                scope.$eval();
                expect(parentDiv.hasClass('ui-disabled')).toBeTruthy();
            });
        });

        it('should enhance checkboxes when ng:repeat is used (not only during page compile)', function() {
            loadHtml('/jqmng/ui/test-fixture.html', function(frame) {
                var page = frame.$('#start');
                page.append('<div data-role="content">' +
                    '<div ng:repeat="item in items" id="mydiv">' +
                    '<input name="mysel" id="mysel{{$index}}" type="checkbox" value="false"><label for="mysel{{$index}}" id="mylab{{$index}}">Entry</label>' +
                    '</div>' +
                    '</div>');
            });
            runs(function() {
                var page = testframe().$('#start');
                var parentDiv = page.find("#mydiv");
                expect(parentDiv.find('.ui-checkbox').length).toBe(0);
                page.scope().$set('items', [1,2]);
                page.scope().$eval();
            });
            waitsForAsync();
            runs(function() {
                var page = testframe().$('#start');
                var parentDiv = page.find("#mydiv");
                expect(parentDiv.find('.ui-checkbox').length).toBe(2);
            });
        });
    });

});