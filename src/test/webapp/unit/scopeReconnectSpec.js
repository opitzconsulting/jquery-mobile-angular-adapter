jqmng.require(["unit/testUtils"], function (utils) {
    describe('scope reconnect', function () {
        var rootScope, childScope, counter;
        beforeEach(function () {
            rootScope = angular.injector(["ng"]).get("$rootScope");
            childScope = rootScope.$new();
            childScope.$watch(function () {
                counter++;
            });
            counter = 0;
        });
        describe("$destroy", function() {
            it("should not call watches if the child scope is destroyed", function () {
                childScope.$destroy();
                rootScope.$digest();
                expect(counter).toBe(0);
            });
            it("should remove the child form the $childHead/$childTail of the parent if it is the only child", function() {
                childScope.$destroy();
                expect(rootScope.$$childHead).toBe(null);
                expect(rootScope.$$childTail).toBe(null);
            });
            it("should remove the child form the $childHead/$childTail of the parent if it is the first child", function() {
                var child2 = rootScope.$new();
                childScope.$destroy();
                expect(rootScope.$$childHead).toBe(child2);
                expect(rootScope.$$childTail).toBe(child2);
            });
            it("should remove the child form the $childHead/$childTail of the parent if it is the last child", function() {
                var child2 = rootScope.$new();
                child2.$destroy();
                expect(rootScope.$$childHead).toBe(childScope);
                expect(rootScope.$$childTail).toBe(childScope);
            });

        });

        it("should call watches of child scopes if not destroyed", function () {
            rootScope.$digest();
            expect(counter).toBe(2);
        });
        it("should work for the root scope", function() {
            rootScope.$destroy();
            rootScope.$reconnect();
            rootScope.$digest();
            expect(counter).toBe(2);
        });
        it("should do nothing if the scope is still connected", function() {
            childScope.$reconnect();
            rootScope.$digest();
            expect(counter).toBe(2);
        });
        it("should call watches of reconnected child scopes", function () {
            childScope.$destroy();
            childScope.$reconnect();
            rootScope.$digest();
            expect(counter).toBe(2);
        });
        it("should be added into the $childHead/$childTail list of the parent", function() {
            childScope.$destroy();
            childScope.$reconnect();
            expect(rootScope.$$childHead).toBe(childScope);
            expect(rootScope.$$childTail).toBe(childScope);
        });
    });
});
