describe('scope reentrance', function () {
    var scope;
    beforeEach(function() {
        scope = angular.injector(["ng", "ngMock"]).get("$rootScope");
    });

    it("should allow $apply within $apply", function () {
        var res;
        scope.$watch(function () {
            res = scope.$apply('1+2');
        });
        scope.$apply();
        expect(res).toBe(3);
    });

    it("should allow $digest within $digest", function () {
        scope.$watch(function () {
            scope.$digest();
        });
        scope.$digest();
    });

});
