define(['angular'], function(angular) {
    describe('ng:repeat', function() {
        it('should fire elemensAdded and elementsRemoved when new elements are created / deleted', function() {
            var element = angular.element('<div><div ng:repeat="l in list"></div></div>');
            var scope = angular.compile(element)();
            var added = 0;
            var removed = 0;
            element.bind('elementsAdded', function() {
                added++;
            });
            element.bind('elementsRemoved', function() {
                removed++;
            });
            scope.list = [0,1];
            scope.$eval();
            expect(added).toEqual(1);
            expect(removed).toEqual(0);
            scope.list = [];
            scope.$eval();
            expect(added).toEqual(1);
            expect(removed).toEqual(1);
        });

        it('should append new elements at the same level even when they wrap themselves in new parents', function() {
            var element = angular.element('<div><button ng:repeat="l in list"></button></div>');
            var scope = angular.scope();
            scope.list = [1];
            angular.compile(element)(scope);
            element.trigger('create');
            // Button should add a parent
            expect(element.children('div').length).toBe(1);
            scope.list = [1,2];
            scope.$eval();
            expect(element.children('div').length).toBe(2);
        });
    });
});

