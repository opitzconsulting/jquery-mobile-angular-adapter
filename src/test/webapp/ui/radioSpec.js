define(function() {

    describe("radio", function() {

        it('should save the ui value into the model', function() {
            loadHtml('/jqmng/ui/test-fixture.html', function(frame) {
                var page = frame.$('#start');
                // Note: Be sure to use ng:repeat, as this is the most problematic case!
                page.append('<div data-role="content">' +
                    '<div ng:repeat="item in [1]">' +
                    '<input name="mysel" id="mysel" type="radio" value="v1"><label for="mysel" id="mylab">Entry</label>' +
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
                label.trigger('click');
                expect(scope.$get('mysel')).toEqual("v1");
            });

        });
        it('should save the model value into the ui', function() {
            loadHtml('/jqmng/ui/test-fixture.html', function(frame) {
                var page = frame.$('#start');
                // Note: Be sure to use ng:repeat, as this is the most problematic case!
                page.append('<div data-role="content">' +
                    '<div ng:repeat="item in [1]">' +
                    '<input name="mysel" id="mysel" type="radio" value="v1"><label for="mysel" id="mylab">Entry</label>' +
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
                expect(iconSpan.hasClass('ui-icon-radio-on')).toBeFalsy();
                scope.$set("mysel", "v1");
                scope.$eval();
                expect(input[0].checked).toBeTruthy();
                expect(iconSpan.hasClass('ui-icon-radio-on')).toBeTruthy();
            });
        });

        it('should use the disabled attribute', function() {
            loadHtml('/jqmng/ui/test-fixture.html', function(frame) {
                var page = frame.$('#start');
                // Note: Be sure to use ng:repeat, as this is the most problematic case!
                page.append('<div data-role="content">' +
                    '<div ng:repeat="item in [1]">' +
                    '<input name="mysel" id="mysel" type="radio" value="v1" ng:bind-attr="{disabled: \'{{disabled}}\'}"><label for="mysel" id="mylab">Entry</label>' +
                    '</div>' +
                    '</div>');
            });
            runs(function() {
                var page = testframe().$('#start');
                var input = page.find("#mysel");
                var parentDiv = input.parent();
                var scope = parentDiv.scope();
                scope.$set('disabled', false);
                scope.$eval();
                expect(parentDiv.hasClass('ui-disabled')).toBeFalsy();
                scope.$set('disabled', true);
                scope.$eval();
                expect(parentDiv.hasClass('ui-disabled')).toBeTruthy();
            });
        });
    });

});