define(['angular'], function(angular) {
    describe("ngmClick", function() {
        it('should eval the expression when vclick is fired', function() {
            var element = angular.element('<span ngm:click="clicked = true"</span>');
            var scope = angular.compile(element)();
            element.trigger('vclick');
            expect(scope.clicked).toEqual(true);
        });

    });

    describe("ngm:event", function() {

        it('should eval the expression when the event is fired', function() {
            var element = angular.element('<span ngm:event="{click:\'clicked=true\'}"></span>');
            var scope = angular.compile(element)();
            element.click();
            expect(scope.clicked).toEqual(true);
        });

        it('should work with multiple event/function pairs', function() {
            var element = angular.element('<span ngm:event="{mousedown:\'m = true\', click:\'c = true\'}"></span>');
            var scope = angular.compile(element)();
            expect(scope.c).toEqual(undefined);
            element.click();
            expect(scope.c).toEqual(true);
            expect(scope.m).toEqual(undefined);
            delete scope.c;
            element.mousedown();
            expect(scope.c).toEqual(undefined);
            expect(scope.m).toEqual(true);
        });
    });

});