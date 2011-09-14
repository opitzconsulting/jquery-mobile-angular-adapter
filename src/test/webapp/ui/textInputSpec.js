define(function() {

    describe("textInput", function() {

        it('should save the ui value into the model', function() {
            loadHtml('/jqmng/ui/test-fixture.html', function(frame) {
                var page = frame.$('#start');
                // Note: Be sure to use ng:repeat, as this is the most problematic case!
                page.append('<div data-role="content">' +
                    '<input ng:repeat="item in [1]" name="mysel" id="mysel" type="text">' +
                    '</div>');
            });
            runs(function() {
                var page = testframe().$('#start');
                var input = page.find("#mysel");
                var scope = input.scope();
                expect(scope.$get('mysel')).toBeFalsy();
                input[0].value = 'test';
                input.trigger('change');
                expect(scope.$get('mysel')).toEqual('test');
            });

        });

        it('should save the model value into the ui', function() {
            loadHtml('/jqmng/ui/test-fixture.html', function(frame) {
                var page = frame.$('#start');
                // Note: Be sure to use ng:repeat, as this is the most problematic case!
                page.append('<div data-role="content">' +
                    '<input ng:repeat="item in [1]" name="mysel" id="mysel" type="text">' +
                    '</div>');
            });
            runs(function() {
                var page = testframe().$('#start');
                var input = page.find("#mysel");
                var scope = input.scope();
                expect(input[0].value).toEqual('');
                scope.$set("mysel", 'test');
                scope.$eval();
                expect(input[0].value).toEqual('test');
            });
        });

        it('should use the diabled attribute', function() {
            loadHtml('/jqmng/ui/test-fixture.html', function(frame) {
                var page = frame.$('#start');
                // Note: Be sure to use ng:repeat, as this is the most problematic case!
                page.append('<div data-role="content">' +
                    '<input ng:repeat="item in [1]" name="mysel" id="mysel" type="text" ng:bind-attr="{disabled: \'{{disabled}}\'}">' +
                    '</div>');
            });
            runs(function() {
                var page = testframe().$('#start');
                var input = page.find("#mysel");
                var scope = input.scope();
                scope.$set('disabled', false);
                scope.$eval();
                expect(input.hasClass('ui-disabled')).toBeFalsy();
                scope.$set('disabled', true);
                scope.$eval();
                expect(input.hasClass('ui-disabled')).toBeTruthy();
            });
        });

        it('should be removable when ng:repeat shrinks', function() {
            loadHtml('/jqmng/ui/test-fixture.html', function(frame) {
                var page = frame.$('#start');
                // Note: Be sure to use ng:repeat, as this is the most problematic case!
                page.append('<div data-role="content" ng:init="mylist = [1,2]">' +
                    '<input ng:repeat="item in mylist" name="mysel" id="mysel" type="text">' +
                    '</div>');
            });
            runs(function() {
                var page = testframe().$("#start");
                var scope = page.scope();
                // ui select creates a new parent for itself
                var content = page.find(":jqmData(role='content')");
                expect(content.children('input').length).toEqual(2);
                scope.mylist = [1];
                scope.$eval();
                expect(content.children('input').length).toEqual(1);
            });
        });

        it('should work with type="tel"', function() {
            loadHtml('/jqmng/ui/test-fixture.html', function(frame) {
                var page = frame.$('#start');
                // Note: Be sure to use ng:repeat, as this is the most problematic case!
                page.append('<div data-role="content">' +
                    '<input ng:repeat="item in [1]" name="mysel" id="mysel" type="tel">' +
                    '</div>');
            });
            runs(function() {
                var page = testframe().$('#start');
                var input = page.find("#mysel");
                expect(input.prop('type')).toEqual('tel');
                var scope = input.scope();
                expect(scope.$get('mysel')).toBeFalsy();
                input[0].value = '123';
                input.trigger('change');
                expect(scope.$get('mysel')).toEqual('123');
            });

        });

        it('should work with type="number"', function() {
            loadHtml('/jqmng/ui/test-fixture.html', function(frame) {
                var page = frame.$('#start');
                // Note: Be sure to use ng:repeat, as this is the most problematic case!
                page.append('<div data-role="content">' +
                    '<input ng:repeat="item in [1]" name="mysel" id="mysel" type="number">' +
                    '</div>');
            });
            runs(function() {
                var page = testframe().$('#start');
                var input = page.find("#mysel");
                expect(input.prop('type')).toEqual('number');
                var scope = input.scope();
                expect(scope.$get('mysel')).toBeFalsy();
                input[0].value = '123';
                input.trigger('change');
                expect(scope.$get('mysel')).toEqual('123');
            });

        });
    });

});
