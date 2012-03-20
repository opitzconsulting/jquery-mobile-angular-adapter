jqmng.require(["unit/testUtils"], function(utils) {
    describe('ng:repeat', function() {
        it("should fire the requestrefresh event for every entry when the list grows", function() {
            var c = utils.compileInPage('<div><div ng:repeat="l in list"></div></div>');
            var element = c.element;
            var scope = element.scope();
            var eventCount = 0;
            c.page.bind('requestrefresh', function() {
                eventCount++;
            });
            scope.list = [0,1,3];
            scope.$digest();
            expect(eventCount).toEqual(3);
        });

        it('should append new elements at the same level even when they wrap themselves in new parents', function() {
            var c = utils.compileInPage('<div><button ng:repeat="l in list"></button></div>');
            var scope = c.element.scope();
            scope.list = [1];
            scope.$digest();
            // Button should add a parent
            expect(c.element.children('div').length).toBe(1);
            scope.list = [1,2];
            scope.$digest();
            expect(c.element.children('div').length).toBe(2);
        });
    });
});

