describe('scopeEvents', function () {
    it("should emit a $childrenChanged event when a new scope is created on the root scope", function () {
        var injector = angular.injector(["ng"]);
        var $rootScope = injector.get("$rootScope");
        var createSpy = jasmine.createSpy('$childrenChanged');
        $rootScope.$on('$childrenChanged', createSpy);
        expect(createSpy).not.toHaveBeenCalled();
        var childScope = $rootScope.$new();
        expect(createSpy.argsForCall[0][0].targetScope).toBe(childScope);
    });

    it("should emit a $childrenChanged event when a new scope is created on a child scope", function () {
        var injector = angular.injector(["ng"]);
        var $rootScope = injector.get("$rootScope");
        var childScope = $rootScope.$new();

        var createSpy = jasmine.createSpy('$childrenChanged');
        $rootScope.$on('$childrenChanged', createSpy);
        expect(createSpy).not.toHaveBeenCalled();
        var childScope2 = childScope.$new();
        expect(createSpy.argsForCall[0][0].targetScope).toBe(childScope2);
    });

    it("should emit a $destroyChild event when a scope is destroyed", function () {
        var injector = angular.injector(["ng"]);
        var $rootScope = injector.get("$rootScope");
        var childScope = $rootScope.$new();

        var destroySpy = jasmine.createSpy('$childrenChanged');
        $rootScope.$on('$childrenChanged', destroySpy);
        expect(destroySpy).not.toHaveBeenCalled();
        childScope.$destroy();
        expect(destroySpy.argsForCall[0][0].targetScope).toBe(childScope);
    });
});