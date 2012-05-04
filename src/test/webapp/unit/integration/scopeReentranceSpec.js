describe('scope reentrance', function () {
    it("should allow $apply within $apply", function () {
        var scope = angular.injector(["ng"]).get("$rootScope");
        var res;
        scope.$watch(function () {
            res = scope.$apply('1+2');
        });
        scope.$apply();
        expect(res).toBe(3);
    });

    it("should allow $digest within $digest", function () {
        var scope = angular.injector(["ng"]).get("$rootScope");
        scope.$watch(function () {
            scope.$digest();
        });
        scope.$digest();
    });

});
