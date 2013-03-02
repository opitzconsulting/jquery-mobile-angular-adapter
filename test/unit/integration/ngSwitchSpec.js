describe('ng-switch', function () {
    it("should enhance new children", function () {
        var c = testutils.compileInPage('<ng-switch on="value">' +
            '<div ng-switch-when="case1"><a href="" data-role="button">b1</a></div>' +
            '<div ng-switch-when="case2"><a href="" data-role="button">b2</a></div>' +
            '</ng-switch>');
        var scope = c.element.scope();
        scope.value = 'case1';
        scope.$root.$digest();
        expect(c.element.children("div").eq(0).children("a").eq(0).hasClass("ui-btn")).toBe(true);
    });

    describe('element usage', function () {
        it("should fire the $childrenChanged event when the value changes", function () {
            var c = testutils.compileInPage('<ng-switch on="value">' +
                '<div ng-switch-when="case1"><a href="" data-role="button">b1</a></div>' +
                '</ng-switch>');
            var scope = c.element.scope();
            scope.value = 'case1';
            var eventSpy = jasmine.createSpy("$childrenChanged");
            c.element.bind("$childrenChanged", eventSpy);
            scope.$root.$digest();
            expect(eventSpy.callCount).toBe(1);

            eventSpy.reset();
            scope.value = 'nocase';
            scope.$root.$digest();
            expect(eventSpy.callCount).toBe(1);
        });
    });

    describe("attribute usage", function () {
        it("should fire the $childrenChanged event when the value changes", function () {
            var c = testutils.compileInPage('<div ng-switch="value"><div ng-switch-when="case1"><a href="" data-role="button">b1</a></div></div>');
            var scope = c.element.scope();
            scope.value = 'case1';
            var eventSpy = jasmine.createSpy("$childrenChanged");
            c.element.bind("$childrenChanged", eventSpy);
            scope.$root.$digest();
            expect(eventSpy.callCount).toBe(1);

            eventSpy.reset();
            scope.value = 'nocase';
            scope.$root.$digest();
            expect(eventSpy.callCount).toBe(1);
        });

    });

    describe('with elements that wrap themselves into new elements', function () {
        it("should remove the wrapper elements with the elements", function() {
            var c = testutils.compileInPage('<ng-switch on="value">' +
                '<button ng-switch-when="case1" wrapper="true"></button>' +
                '</ng-switch>');
            var scope = c.element.scope();
            scope.value = "case1";
            scope.$root.$digest();
            expect(c.element.children('div').length).toBe(1);

            scope.value = "";
            scope.$root.$digest();
            expect(c.element.children('div').length).toBe(0);
        });
    });

});

