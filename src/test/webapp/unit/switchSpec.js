define(["unit/testUtils"], function(utils) {
    describe('ng:switch', function() {
        it("should fire the create event for every entry that is created", function() {
            var c = utils.compileInPage('<ng:switch on="value">' +
                '<div ng:switch-when="case1"><a href="" data-role="button">b1</a></div>'+
                '<div ng:switch-when="case2"><a href="" data-role="button">b2</a></div>'+
                '</ng:switch>');
            var scope = c.element.scope()
            var createCount = 0;
            c.page.bind('create', function() {
                createCount++;
            });
            scope.$eval();
            expect(createCount).toEqual(0);
            scope.value = 'case1';
            scope.$eval();
            expect(createCount).toEqual(1);
        });

        it("should fire the remove event for every entry that is removed", function() {
            var c = utils.compileInPage('<ng:switch on="value">' +
                '<div ng:switch-when="case1"><a href="" data-role="button">b1</a></div>'+
                '<div ng:switch-when="case2"><a href="" data-role="button">b2</a></div>'+
                '</ng:switch>');
            var scope = c.element.scope();
            scope.value = 'case1';
            scope.$eval();
            var removeCount = 0;
            c.element.find('a').bind('remove', function() {
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

