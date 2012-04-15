jqmng.require(["unit/testUtils"], function(utils) {

    describe("disabledHandling", function() {
        function execTest(attribute) {
            var d = utils.compileInPage('<button id="mysel" ng-click="flag = true" '+attribute+'">Test</button>');
            var page = d.page;
            var input = d.element;
            var scope = input.scope();
            var parentDiv = input.parent();
            scope.disabled=false;
            scope.$digest();
            expect(parentDiv.hasClass('ui-disabled')).toBeFalsy();
            scope.disabled=true;
            scope.$digest();
            expect(parentDiv.hasClass('ui-disabled')).toBeTruthy();
        }

        it('should work with {{ }}', function() {
            execTest('disabled="{{disabled}}"');
        });
    });
});