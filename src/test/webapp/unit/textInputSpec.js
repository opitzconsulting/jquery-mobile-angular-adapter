jqmng.require(["unit/testUtils"], function(utils) {

    describe("textInput", function() {

        it('should save the ui value into the model', function() {
            var d = utils.compileInPage('<input ng-model="mysel" type="text">');
            var input = d.element;
            var scope = input.scope();
            expect(scope.mysel).toBeFalsy();
            input[0].value = 'test';
            utils.triggerInputEvent(input);
            expect(scope.mysel).toEqual('test');
        });

        it('should save the model value into the ui', function() {
            var d = utils.compileInPage('<input ng-model="mysel" type="text">');
            var input = d.element;
            var scope = input.scope();
            expect(input[0].value).toEqual('');
            scope.mysel='test';
            scope.$digest();
            expect(input[0].value).toEqual('test');
        });

        it('should use the disabled attribute', function() {
            var d = utils.compileInPage('<input ng-model="mysel" type="text" disabled="{{disabled}}">');
            var input = d.element;
            var scope = input.scope();
            scope.disabled = false;
            scope.$digest();
            expect(input.hasClass('ui-disabled')).toBeFalsy();
            scope.disabled = true;
            scope.$digest();
            expect(input.hasClass('ui-disabled')).toBeTruthy();
        });

        it('should work with type="tel"', function() {
            var d = utils.compileInPage('<input ng-model="mysel" type="tel">');
            var input = d.element;
            expect(input.attr('type')).toEqual('tel');
            var scope = input.scope();
            expect(scope.mysel).toBeFalsy();
            input[0].value = '123';
            utils.triggerInputEvent(input);
            expect(scope.mysel).toEqual('123');
        });

        it('should work with type="number"', function() {
            var d = utils.compileInPage('<input ng-model="mysel" type="number">');
            var input = d.element;
            expect(input.attr('type')).toEqual('number');
            var scope = input.scope();
            expect(scope.mysel).toBeFalsy();
            input[0].value = '123';
            utils.triggerInputEvent(input);
            expect(scope.mysel).toEqual(123);
        });

        it('should work with type="date"', function() {
            var d = utils.compileInPage('<input ng-model="mysel" type="date">');
            var input = d.element;
            expect(input.attr('type')).toEqual('date');
            var scope = input.scope();
            expect(scope.mysel).toBeFalsy();
            input[0].value = '1999-10-09';
            // Note: On iOS5 date is supported, but it does not fire a change event!
            // Hence we react to the blur event...
            input.trigger('blur');
            expect(scope.mysel).toEqual('1999-10-09');
        });
    });

});
