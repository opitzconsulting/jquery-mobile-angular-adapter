describe("ngm-if", function () {
    var element, scope;

    function compile(html) {
        var d = testutils.compileInPage(html);
        element = d.element;
        scope = element.scope();
    }

    beforeEach(function () {
        scope = null;
        element = null;
    });

    it('should add the element if the expression is true', function () {
        compile('<div><span ngm-if="true">A</span></div>');
        expect(element.children('span').length).toEqual(1);
    });

    it('should readd the element if the expression is true, then false, then true again', function () {
        var c = compile('<div ng-init="flag=true"><span ngm-if="flag">A</span></div>');
        scope.flag = false;
        scope.$apply();
        scope.flag = true;
        scope.$apply();
        expect(element.children('span').length).toEqual(1);


    });

    it('should delete the old element and add a new element if the expression changes', function () {
        compile('<div><span ngm-if="a">A</span></div>');
        expect(element.children('span').length).toEqual(0);
        scope.a = 'a';
        scope.$digest();
        expect(element.children('span').length).toEqual(1);
        scope.a = 'aa';
        scope.$digest();
        expect(element.children('span').length).toEqual(1);

    });

    it('should remove the element if the expression is false', function () {
        compile('<div><span ngm-if="false">A</span></div>');
        expect(element.children('span').length).toEqual(0);
    });

    it('should use an own scope', function () {
        compile('<div><span ngm-if="true"><span ng-init="test = true"></span></span></div>');
        expect(scope.test).toBeFalsy();
        expect(element.children('span').scope().test).toBeTruthy();
    });

    describe('with elements that wrap themselves into new elements', function () {
        it("should remove the wrapper elements with the elements", function() {
            var c = testutils.compileInPage('<div><button ngm-if="value" wrapper="true"></button></div>');
            var scope = c.element.scope();
            scope.value = true;
            scope.$root.$digest();
            expect(c.element.children('div').length).toBe(1);

            scope.value = false;
            scope.$root.$digest();
            expect(c.element.children('div').length).toBe(0);
        });
    });

    describe("fire $childrenChanged", function() {
        var eventSpy;
        beforeEach(function() {
            compile('<div><span ngm-if="show"></span></div>');
            eventSpy = jasmine.createSpy("$childrenChanged");
            element.bind("$childrenChanged", eventSpy);
        });

        it("should fire the event when the content is added", function() {
            scope.show = true;
            scope.$root.$digest();
            expect(eventSpy.callCount).toBe(1);
        });

        it("should fire the event when the content is hidden", function() {
            scope.show = true;
            scope.$root.$digest();
            eventSpy.reset();

            scope.show = false;
            scope.$root.$digest();
            expect(eventSpy.callCount).toBe(1);
        });

        it("should not fire if nothing changes", function() {
            scope.$root.$digest();
            expect(eventSpy.callCount).toBe(0);
        });
    });
});
