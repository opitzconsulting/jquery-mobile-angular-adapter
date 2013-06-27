describe('ng-repeat', function () {
    it("should refresh children when the list grows", function () {
        var c = testutils.compileInPage('<div><a href="" data-role="button" ng-repeat="l in list"></a></div>');
        var element = c.element;
        var scope = element.scope();
        scope.list = [0, 1, 3];
        scope.$root.$digest();
        expect(c.element.children().hasClass("ui-btn")).toBe(true);
    });

    describe('with elements that wrap themselves into new elements', function () {
        it('should append new elements at the same level', function () {
            var c = testutils.compileInPage('<div><button ng-repeat="l in list" wrapper="true"></button></div>');
            var scope = c.element.scope();
            scope.list = [1];
            scope.$root.$digest();
            expect(c.element.children('div').length).toBe(1);

            scope.list = [1, 2];
            scope.$root.$digest();
            expect(c.element.children('div').length).toBe(2);
        });

        it("should remove the wrapper elements with the elements", function() {
            var c = testutils.compileInPage('<div><button ng-repeat="l in list" wrapper="true"></button></div>');
            var scope = c.element.scope();
            scope.list = [1,2];
            scope.$root.$digest();
            expect(c.element.children('div').length).toBe(2);

            scope.list = [];
            scope.$root.$digest();
            expect(c.element.children('div').length).toBe(0);
        });
    });

    describe("fire $childrenChanged for array datasource", function () {
        var c, scope, eventSpy;
        beforeEach(function () {
            c = testutils.compileInPage('<div><span ng-repeat="l in list"></span></div>');
            scope = c.element.scope();
            eventSpy = jasmine.createSpy("$childrenChanged");
            c.element.bind("$childrenChanged", eventSpy);
        });

        it("should fire the event when children are added", function () {
            scope.list = [1, 2];
            scope.$root.$digest();
            expect(eventSpy.callCount).toBe(1);
        });

        it("should fire the event when and undefined child is added", function () {
            scope.list = [];
            scope.$root.$digest();
            eventSpy.reset();
            scope.list.push(undefined);
            scope.$root.$digest();
            expect(eventSpy.callCount).toBe(1);
        });

        it("should fire the event when children are removed", function () {
            scope.list = [1, 2, 3];
            scope.$root.$digest();
            eventSpy.reset();

            scope.list.pop();
            scope.list.pop();
            scope.$root.$digest();
            expect(eventSpy.callCount).toBe(1);
        });

        it("should fire the event when the order of children change", function () {
            scope.list = [1, 2, 3];
            scope.$root.$digest();
            eventSpy.reset();
            var e1 = scope.list[0];
            scope.list[1] = scope.list[0];
            scope.list[0] = e1;
            scope.$root.$digest();
            expect(eventSpy.callCount).toBe(1);
        });

        it("should not fire the event when nothing changes", function () {
            scope.list = [1, 2, 3];
            scope.$root.$digest();
            eventSpy.reset();
            scope.$root.$digest();
            expect(eventSpy.callCount).toBe(0);
        });

        it("should not fire the event when the object values change", function () {
            scope.list = [
                {a:1}
            ];
            scope.$root.$digest();
            eventSpy.reset();
            scope.list[0].a = 2;
            scope.$root.$digest();
            expect(eventSpy.callCount).toBe(0);
        });
    });

    describe("fire $childrenChanged for object datasource", function () {
        var c, scope, eventSpy;
        beforeEach(function () {
            c = testutils.compileInPage('<div><span ng-repeat="(k,v) in list"></span></div>');
            scope = c.element.scope();
            eventSpy = jasmine.createSpy("$childrenChanged");
            c.element.bind("$childrenChanged", eventSpy);
        });

        it("should fire the event when children are added", function () {
            scope.list = {a:1, b:2};
            scope.$root.$digest();
            expect(eventSpy.callCount).toBe(1);
        });

        it("should fire the event when children are removed", function () {
            scope.list = {a:1, b:2};
            scope.$root.$digest();
            eventSpy.reset();

            delete scope.list.a;
            scope.$root.$digest();
            expect(eventSpy.callCount).toBe(1);
        });

        it("should not fire the event when nothing changes", function () {
            scope.list = {a:1, b:2};
            scope.$root.$digest();
            eventSpy.reset();
            scope.$root.$digest();
            expect(eventSpy.callCount).toBe(0);
        });

        it("should not fire the event when the object values change", function () {
            scope.list = {a:{c:1}, b:{c:2}};
            scope.$root.$digest();
            eventSpy.reset();
            scope.list.a.c = 3;
            scope.$root.$digest();
            expect(eventSpy.callCount).toBe(0);
        });
    });
})
;

