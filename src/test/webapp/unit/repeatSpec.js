define(["unit/testUtils"], function(utils) {
    describe('ng:repeat', function() {
        it("should fire the create event only once for the current page at the end of the eval cycle when the list grows", function() {
            var c = utils.compileInPage('<div><a ng:repeat="l in list" data-role="button"></a></div>');
            var element = c.element;
            var scope = element.scope();
            var createCount = 0;
            c.page.bind('create', function() {
                createCount++;
            });
            scope.list = [0,1,3];
            var createdBeforeOnEval = false;
            scope.$onEval(function() {
                createdBeforeOnEval = element.children().eq(0).hasClass("ui-btn");
            });
            scope.$eval();
            expect(createdBeforeOnEval).toBe(false);
            expect(createCount).toEqual(1);
        });

        it("should fire the remove event for every entry when the list shrinks", function() {
            var c = utils.compileInPage('<div><div ng:repeat="l in list"></div></div>');
            var scope = c.element.scope();
            scope.list = [0,1];
            scope.$eval();
            var removeCount = 0;
            c.element.children('div').bind('remove', function() {
                removeCount++;
            });
            scope.list = [];
            scope.$eval();
            expect(removeCount).toEqual(2);
        });

        it('should append new elements at the same level even when they wrap themselves in new parents', function() {
            var c = utils.compileInPage('<div><button ng:repeat="l in list"></button></div>');
            var scope = c.element.scope();
            scope.list = [1];
            scope.$eval();
            // Button should add a parent
            expect(c.element.children('div').length).toBe(1);
            scope.list = [1,2];
            scope.$eval();
            expect(c.element.children('div').length).toBe(2);
        });
    });
});

