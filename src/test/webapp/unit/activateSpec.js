define(function() {
    describe("activate", function() {

        it('should be able to change to page', function() {
            var changePageSpy = spyOn($.mobile, 'changePage');
            var scope = angular.scope();
            var activate = scope.$service("$activate");
            activate('somePage', 'someTransition');
            expect(changePageSpy).toHaveBeenCalledWith('#somePage', 'someTransition');
        });

        it('should be able to change to page using the $activate expression', function() {
            var changePageSpy = spyOn($.mobile, 'changePage');
            var scope = angular.scope();
            scope.$eval("$activate(true, 'firstPage', 'secondPage')");
            expect(changePageSpy).toHaveBeenCalledWith('#firstPage', undefined);
            changePageSpy.reset();
            scope.$eval("$activate(undefined, 'firstPage', 'secondPage')");
            expect(changePageSpy).toHaveBeenCalledWith('#firstPage', undefined);
            changePageSpy.reset();
            scope.$eval("$activate(false, 'firstPage', 'secondPage')");
            expect(changePageSpy).toHaveBeenCalledWith('#secondPage', undefined);
        });

        it('should be able to change to page using the $activate expression and promises', function() {
            var changePageSpy = spyOn($.mobile, 'changePage');
            var scope = angular.scope();
            scope.promise = $.Deferred();
            scope.$eval("$activate(promise, 'firstPage', 'secondPage')");
            expect(changePageSpy).not.toHaveBeenCalled();
            scope.promise.resolve();
            expect(changePageSpy).toHaveBeenCalledWith('#firstPage', undefined);
            changePageSpy.reset();
            scope.promise = $.Deferred();
            scope.$eval("$activate(promise, 'firstPage', 'secondPage')");
            expect(changePageSpy).not.toHaveBeenCalled();
            scope.promise.reject();
            expect(changePageSpy).toHaveBeenCalledWith('#secondPage', undefined);
        });

    });

});
