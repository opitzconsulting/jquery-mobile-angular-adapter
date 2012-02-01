define(["unit/testUtils"], function(utils) {

    describe("textInput", function() {

        it('should save the ui value into the model', function() {
            var d = utils.compileInPage('<input name="mysel" type="text">');
            var input = d.element;
            var scope = input.scope();
            expect(scope.$get('mysel')).toBeFalsy();
            input[0].value = 'test';
            input.trigger('change');
            expect(scope.$get('mysel')).toEqual('test');
        });

        it('should save the model value into the ui', function() {
            var d = utils.compileInPage('<input name="mysel" type="text">');
            var input = d.element;
            var scope = input.scope();
            expect(input[0].value).toEqual('');
            scope.$set("mysel", 'test');
            scope.$eval();
            expect(input[0].value).toEqual('test');
        });

        it('should use the disabled attribute', function() {
            var d = utils.compileInPage('<input name="mysel" type="text" ng:bind-attr="{disabled: \'{{disabled}}\'}">');
            var input = d.element;
            var scope = input.scope();
            scope.$set('disabled', false);
            scope.$eval();
            expect(input.hasClass('ui-disabled')).toBeFalsy();
            scope.$set('disabled', true);
            scope.$eval();
            expect(input.hasClass('ui-disabled')).toBeTruthy();
        });

        it('should work with type="tel"', function() {
            var d = utils.compileInPage('<input name="mysel" type="tel">');
            var input = d.element;
            expect(input.prop('type')).toEqual('tel');
            var scope = input.scope();
            expect(scope.$get('mysel')).toBeFalsy();
            input[0].value = '123';
            input.trigger('change');
            expect(scope.$get('mysel')).toEqual('123');
        });

        it('should work with type="number"', function() {
            var d = utils.compileInPage('<input name="mysel" type="number">');
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
