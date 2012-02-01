define(["unit/testUtils"], function(utils) {

    describe("button", function() {
        it('should allow clicks via ng:click', function() {
            var d = utils.compileInPage('<button id="mysel" ng:click="flag = true">Test</button>');
            var page = d.page;
            var input = d.element;
            var scope = input.scope();
            expect(scope.$get('flag')).toBeFalsy();
            input.trigger('click');
            expect(scope.$get('flag')).toBeTruthy();
        });

        it('should use the disabled attribute', function() {
            var d = utils.compileInPage('<button id="mysel" ng:click="flag = true" ng:bind-attr="{disabled: \'{{disabled}}\'}">Test</button>');
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

        it('should be removable', function() {
            var d = utils.compileInPage('<div><button>1</button><button>2</button></div>');
            var page = d.page;
            var container = d.element;
            var scope = container.scope();
            expect(container.children('div').length).toEqual(2);
            // removal of the button should also remove the parent div
            container.find('button').eq(0).remove();
            expect(container.children('div').length).toEqual(1);
        });
    });

});