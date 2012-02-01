define(['angular'], function(angular) {
    describe('ng:switch', function() {
        it("should fire the create event for every entry that is created", function() {
            var element = angular.element('<ng:switch on="value">' +
                '<div ng:switch-when="case1"><a href="" data-role="button">b1</a></div>'+
                '<div ng:switch-when="case2"><a href="" data-role="button">b2</a></div>'+
                '</ng:switch>');
            var scope = angular.compile(element)();
            var createCount = 0;
            element.bind('create', function() {
                createCount++;
            });
            scope.$eval();
            expect(createCount).toEqual(0);
            scope.value = 'case1';
            scope.$eval();
            expect(createCount).toEqual(1);
        });

        it("should fire the remove event for every entry that is removed", function() {
            var element = angular.element('<ng:switch on="value">' +
                '<div ng:switch-when="case1"><a href="" data-role="button">b1</a></div>'+
                '<div ng:switch-when="case2"><a href="" data-role="button">b2</a></div>'+
                '</ng:switch>');
            var scope = angular.compile(element)();
            scope.value = 'case1';
            scope.$eval();
            var removeCount = 0;
            element.find('a').bind('remove', function() {
                removeCount++;
            });
            scope.$eval();
            expect(removeCount).toEqual(0);
            scope.value = '';
            scope.$eval();
            expect(removeCount).toEqual(1);
        });
    });
});

