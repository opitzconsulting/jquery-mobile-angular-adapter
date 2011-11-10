define(["unit/testUtils"], function(utils) {

    describe("textInput", function() {

        it('should save the ui value into the model', function() {
            // Note: Be sure to use ng:repeat, as this is the most problematic case!
            var d = utils.compileInPage('<input ng:repeat="item in [1]" name="mysel" id="mysel" type="text">');
            var input = d.element;
            var scope = input.scope();
            expect(scope.$get('mysel')).toBeFalsy();
            input[0].value = 'test';
            input.trigger('change');
            expect(scope.$get('mysel')).toEqual('test');
        });

        it('should save the model value into the ui', function() {
            // Note: Be sure to use ng:repeat, as this is the most problematic case!
            var d = utils.compileInPage('<input ng:repeat="item in [1]" name="mysel" id="mysel" type="text">');
            var input = d.element;
            var scope = input.scope();
            expect(input[0].value).toEqual('');
            scope.$set("mysel", 'test');
            scope.$eval();
            expect(input[0].value).toEqual('test');
        });

        it('should use the disabled attribute', function() {
            // Note: Be sure to use ng:repeat, as this is the most problematic case!
            var d = utils.compileInPage('<input ng:repeat="item in [1]" name="mysel" id="mysel" type="text" ng:bind-attr="{disabled: \'{{disabled}}\'}">');
            var input = d.element;
            var scope = input.scope();
            scope.$set('disabled', false);
            scope.$eval();
            expect(input.hasClass('ui-disabled')).toBeFalsy();
            scope.$set('disabled', true);
            scope.$eval();
            expect(input.hasClass('ui-disabled')).toBeTruthy();
        });

        it('should be removable when ng:repeat shrinks', function() {
            var d = utils.compileInPage('<div ng:init="mylist = [1,2]">' +
                '<input ng:repeat="item in mylist" name="mysel" id="mysel" type="text">' +
                '</div>');
            var container = d.element;
            var scope = container.scope();
            expect(container.children('input').length).toEqual(2);
            scope.mylist = [1];
            scope.$eval();
            expect(container.children('input').length).toEqual(1);
        });

        it('should work with type="tel"', function() {
            var d = utils.compileInPage('<input ng:repeat="item in [1]" name="mysel" id="mysel" type="tel">');
            var input = d.element;
            expect(input.prop('type')).toEqual('tel');
            var scope = input.scope();
            expect(scope.$get('mysel')).toBeFalsy();
            input[0].value = '123';
            input.trigger('change');
            expect(scope.$get('mysel')).toEqual('123');
        });

        it('should work with type="number"', function() {
            var d = utils.compileInPage('<input ng:repeat="item in [1]" name="mysel" id="mysel" type="number">');
            var input = d.element;
            expect(input.prop('type')).toEqual('number');
            var scope = input.scope();
            expect(scope.$get('mysel')).toBeFalsy();
            input[0].value = '123';
            input.trigger('change');
            expect(scope.$get('mysel')).toEqual('123');
        });
    });

});
