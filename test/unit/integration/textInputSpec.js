describe("textInput", function () {

    it("should stamp the widget using the jqm widget", function() {
        var createCount = 0;
        var spy = testutils.spyOnJq('textinput').andCallFake(function() {
            if (arguments.length===0) {
                createCount++;
            }
        });
        var c = testutils.compileInPage('<input ng-repeat="l in list" type="text">');
        expect(spy.callCount).toBe(0);
        var scope = c.page.scope();
        scope.list = [1,2];
        scope.$root.$digest();
        expect(createCount).toBe(2);
    });

    it('should save the ui value into the model', function () {
        var d = testutils.compileInPage('<input ng-model="mysel" type="text">');
        var input = d.element.find("input");
        var scope = input.scope();
        expect(scope.mysel).toBeFalsy();
        input[0].value = 'test';
        testutils.triggerInputEvent(input);
        expect(scope.mysel).toEqual('test');
    });

    it('should save the model value into the ui', function () {
        var d = testutils.compileInPage('<input ng-model="mysel" type="text">');
        var input = d.element.find("input");
        var scope = input.scope();
        expect(input[0].value).toEqual('');
        scope.mysel = 'test';
        scope.$root.$digest();
        expect(input[0].value).toEqual('test');
    });

    it('should use the disabled attribute', function () {
        var d = testutils.compileInPage('<input ng-model="mysel" type="text" ng-disabled="disabled">');
        var input = d.element.find("input");
        var scope = input.scope();
        scope.disabled = false;
        scope.$root.$digest();
        expect(input.parent().hasClass('ui-disabled')).toBeFalsy();
        scope.disabled = true;
        scope.$root.$digest();
        expect(input.parent().hasClass('ui-disabled')).toBeTruthy();
    });

    it('should work with type="tel"', function () {
        var d = testutils.compileInPage('<input ng-model="mysel" type="tel">');
        var input = d.element.find("input");
        expect(input.attr('type')).toEqual('tel');
        var scope = input.scope();
        expect(scope.mysel).toBeFalsy();
        input[0].value = '123';
        testutils.triggerInputEvent(input);
        expect(scope.mysel).toEqual('123');
    });

    it('should work with type="number"', function () {
        var d = testutils.compileInPage('<input ng-model="mysel" type="number">');
        var input = d.element.find("input");
        expect(input.attr('type')).toEqual('number');
        var scope = input.scope();
        expect(scope.mysel).toBeFalsy();
        input[0].value = '123';
        testutils.triggerInputEvent(input);
        expect(scope.mysel).toEqual(123);
    });

    it('should work with type="date"', function () {
        var d = testutils.compileInPage('<input ng-model="mysel" type="date">');
        var input = d.element.find("input");
        expect(input.attr('type')).toEqual('date');
        var scope = input.scope();
        expect(scope.mysel).toBeFalsy();
        input[0].value = '1999-10-09';
        // Note: On iOS5 date is supported, but it does not fire a change event!
        // Hence we react to the blur event...
        input.trigger('blur');
        expect(scope.mysel).toEqual('1999-10-09');
    });

    it('should enhance textareas', function() {
        var d = testutils.compileInPage('<textarea ng-model="data"></textarea>');
        var input = d.element;
        expect(input.hasClass("ui-input-text")).toBe(true);
        var scope = input.scope();
        input[0].value = 'test';
        testutils.triggerInputEvent(input);
        expect(scope.data).toEqual('test');
        scope.data = 'test2';
        scope.$root.$digest();
        expect(input[0].value).toEqual('test2');
    });

    it('should be removable', function () {
        // normal input wraps itself into a parent div
        var d = testutils.compileInPage('<div ng-init="list=[1,2]"><input type="text" ng-repeat="l in list"></div>');
        var page = d.page;
        var container = d.element;
        var scope = container.scope();
        expect(container.children('div').length).toEqual(2);
        scope.list = [1];
        scope.$root.$digest();
        expect(container.children('div').length).toEqual(1);
    });

    it('should clear the text with the clear button', function() {
        var d = testutils.compileInPage('<input ng-model="mysel" type="text" data-clear-btn="true">');
        var input = d.element.find("input");
        var scope = input.scope();
        scope.mysel = "someText";
        scope.$apply();
        var clearBtn = input.parent().find("a");
        clearBtn.click();
        expect(scope.mySel).toBeFalsy();
    });

    describe("search input", function() {
        it('should be removable', function () {
            // search input wraps itself into a parent div
            var d = testutils.compileInPage('<div ng-init="list=[1,2]"><input type="search" ng-repeat="l in list"></div>');
            var page = d.page;
            var container = d.element;
            var scope = container.scope();
            expect(container.children('div').length).toEqual(2);
            scope.list = [1];
            scope.$root.$digest();
            expect(container.children('div').length).toEqual(1);
        });

    });

});
