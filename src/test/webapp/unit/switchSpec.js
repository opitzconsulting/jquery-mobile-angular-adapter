jqmng.require(["unit/testUtils"], function(utils) {
    describe('ng-switch', function() {
        it("should fire the requestrefresh event for every entry that is created", function() {
            var c = utils.compileInPage('<ng-switch on="value">' +
                '<div ng-switch-when="case1"><a href="" data-role="button">b1</a></div>'+
                '<div ng-switch-when="case2"><a href="" data-role="button">b2</a></div>'+
                '</ng-switch>');
            var scope = c.element.scope();
            var eventCount = 0;
            c.page.bind('requestrefresh', function() {
                eventCount++;
            });
            scope.$digest();
            expect(eventCount).toEqual(0);
            scope.value = 'case1';
            scope.$digest();
            expect(eventCount).toEqual(1);
        });

        it("should fire the remove event for every entry that is removed", function() {
            var c = utils.compileInPage('<ng-switch on="value">' +
                '<div ng-switch-when="case1"><a href="" data-role="button">b1</a></div>'+
                '<div ng-switch-when="case2"><a href="" data-role="button">b2</a></div>'+
                '</ng-switch>');
            var scope = c.element.scope();
            scope.value = 'case1';
            scope.$digest();
            var removeCount = 0;
            c.element.find('a').bind('remove', function() {
                removeCount++;
            });
            scope.$digest();
            expect(removeCount).toEqual(0);
            scope.value = '';
            scope.$digest();
            expect(removeCount).toEqual(1);
        });
    });
});

