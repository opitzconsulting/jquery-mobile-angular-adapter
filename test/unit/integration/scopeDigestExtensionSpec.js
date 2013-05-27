describe('scopeDigestExtension', function() {
    describe('scope reconnect', function() {
        var rootScope, childScope, counter;
        beforeEach(function() {
            inject(['$rootScope', function(_$rootScope) {
                rootScope = _$rootScope;
            }]);
            childScope = rootScope.$new();
            childScope.$watch(function() {
                counter++;
            });
            counter = 0;
        });
        describe("$disconnect", function() {
            it("should not call watches if the child scope is disconnected", function() {
                childScope.$disconnect();
                rootScope.$digest();
                expect(counter).toBe(0);
            });
            it("should remove the child form the $childHead/$childTail of the parent if it is the only child", function() {
                childScope.$disconnect();
                expect(rootScope.$$childHead).toBe(null);
                expect(rootScope.$$childTail).toBe(null);
            });
            it("should clear $$nextSibling and $$prevSibling", function() {
                var child2 = rootScope.$new();
                rootScope.$new();
                child2.$disconnect();
                expect(child2.$$nextSibling).toBe(null);
                expect(child2.$$prevSibling).toBe(null);
            });
            it("should remove the child form the $childHead/$childTail of the parent if it is the first child", function() {
                var child2 = rootScope.$new();
                childScope.$disconnect();
                expect(rootScope.$$childHead).toBe(child2);
                expect(rootScope.$$childTail).toBe(child2);
            });
            it("should remove the child form the $childHead/$childTail of the parent if it is the last child", function() {
                var child2 = rootScope.$new();
                child2.$disconnect();
                expect(rootScope.$$childHead).toBe(childScope);
                expect(rootScope.$$childTail).toBe(childScope);
            });

        });

        it("should call watches of child scopes if not disconnected", function() {
            rootScope.$digest();
            expect(counter).toBe(2);
        });
        it("should work for the root scope", function() {
            rootScope.$disconnect();
            rootScope.$reconnect();
            rootScope.$digest();
            expect(counter).toBe(2);
        });
        it("should do nothing if the scope is still connected", function() {
            childScope.$reconnect();
            rootScope.$digest();
            expect(counter).toBe(2);
        });
        it("should call watches of reconnected child scopes", function() {
            childScope.$disconnect();
            childScope.$reconnect();
            rootScope.$digest();
            expect(counter).toBe(2);
        });
        it("should be added into the $childHead/$childTail list of the parent", function() {
            childScope.$disconnect();
            childScope.$reconnect();
            expect(rootScope.$$childHead).toBe(childScope);
            expect(rootScope.$$childTail).toBe(childScope);
        });
        it("should work for child of childs", function() {
            var childOfChild = childScope.$new();
            childOfChild.$disconnect();
            var counter2 = 0;
            childOfChild.$watch(function() {
                counter2++;
            });
            childOfChild.$disconnect();
            rootScope.$digest();
            expect(counter2).toBe(0);
            childOfChild.$reconnect();
            rootScope.$digest();
            expect(counter2).toBe(2);
        });
    });
    describe('scope reentrance', function() {
        var scope;
        beforeEach(function() {
            inject(['$rootScope', function(_$rootScope) {
                scope = _$rootScope;
            }]);
        });

        it("should allow $apply within $apply", function() {
            var res;
            scope.$watch(function() {
                res = scope.$apply('1+2');
            });
            scope.$apply();
            expect(res).toBe(3);
        });

        it("should allow $digest within $digest", function() {
            scope.$watch(function() {
                scope.$digest();
            });
            scope.$digest();
        });

    });
    describe('$post/$preDigest', function() {
        var scope, childScope, otherChildScope, callback;
        beforeEach(function() {
            inject(['$rootScope', function(_$rootScope) {
                scope = _$rootScope;
                childScope = scope.$new();
                otherChildScope = scope.$new();
            }]);
            callback = jasmine.createSpy('callback');
        });
        describe('$postDigestOne', function() {
            it('should execute the callback after $digest only once', function() {
                scope.$postDigestOne(callback);
                scope.$watch(function() {
                    expect(callback).not.toHaveBeenCalled();
                });
                scope.$digest();
                expect(callback).toHaveBeenCalled();
                callback.reset();
                scope.$digest();
                expect(callback).not.toHaveBeenCalled();
            });
            it('should not call parent listeners', function() {
                scope.$postDigestOne(callback);
                childScope.$digest();
                expect(callback).not.toHaveBeenCalled();
            });
            it('should not call child listeners', function() {
                childScope.$postDigestOne(callback);
                scope.$digest();
                expect(callback).not.toHaveBeenCalled();
            });
            it('should not call sibling listeners', function() {
                childScope.$postDigestOne(callback);
                otherChildScope.$digest();
                expect(callback).not.toHaveBeenCalled();
            });
            it('should redigest if required', function() {
                var watch = jasmine.createSpy('watch');
                scope.$postDigestOne(function(requireRedigest) {
                    requireRedigest();
                });
                scope.$watch(watch);
                scope.$digest();
                expect(watch.callCount).toBe(3);
            });
            it('should redigest if required', function() {
                var watch = jasmine.createSpy('watch');
                scope.$postDigestOne(function(requireRedigest) {
                    requireRedigest();
                });
                scope.$watch(watch);
                scope.$digest();
                expect(watch.callCount).toBe(3);
            });
        });
        describe('$postDigestAlways', function() {
            it('should execute the callback after $digest always', function() {
                scope.$postDigestAlways(callback);
                scope.$watch(function() {
                    expect(callback).not.toHaveBeenCalled();
                });
                scope.$digest();
                expect(callback).toHaveBeenCalled();
                callback.reset();
                scope.$digest();
                expect(callback).toHaveBeenCalled();
            });
        });
        describe('$preDigest', function() {
            it('should execute the callback before $digest always', function() {
                scope.$preDigest(callback);
                scope.$watch(function() {
                    expect(callback).toHaveBeenCalled();
                });
                scope.$digest();
                expect(callback).toHaveBeenCalled();
                callback.reset();
                scope.$digest();
                expect(callback).toHaveBeenCalled();
            });
        });
    });
});