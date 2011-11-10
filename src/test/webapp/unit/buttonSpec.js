define(["unit/testUtils"], function(utils) {

    describe("button", function() {
        it('should allow clicks via ng:click', function() {
            // Note: Be sure to use ng:repeat, as this is the most problematic case!
            var d = utils.compileInPage('<button ng:repeat="item in [1]" id="mysel" ng:click="flag = true">Test</button>');
            var page = d.page;
            var input = d.element;
            var scope = input.scope();
            expect(scope.$get('flag')).toBeFalsy();
            input.trigger('click');
            expect(scope.$get('flag')).toBeTruthy();
        });

        it('should use the disabled attribute', function() {
            var d = utils.compileInPage('<button ng:repeat="item in [1]" id="mysel" ng:click="flag = true" ng:bind-attr="{disabled: \'{{disabled}}\'}">Test</button>');
            var page = d.page;
            var input = d.element;
            var scope = input.scope();
            var parentDiv = input.parent();
            scope.$set('disabled', false);
            scope.$eval();
            expect(parentDiv.hasClass('ui-disabled')).toBeFalsy();
            scope.$set('disabled', true);
            scope.$eval();
            expect(parentDiv.hasClass('ui-disabled')).toBeTruthy();
        });

        it('should be removable when ng:repeat shrinks', function() {
            var d = utils.compileInPage('<div ng:init="mylist=[1,2]"><button ng:repeat="item in mylist" id="mysel" ng:click="flag = true">Test</button></div>');
            var page = d.page;
            // ui select creates a new parent for itself
            var container = d.element;
            var scope = container.scope();
            expect(container.children('div').length).toEqual(2);
            scope.mylist = [1];
            scope.$eval();
            expect(container.children('div').length).toEqual(1);
        });
    });

});