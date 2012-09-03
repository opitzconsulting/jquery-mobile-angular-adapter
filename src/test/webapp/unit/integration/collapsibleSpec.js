describe("collapsible", function () {

    var collapsedClass = "ui-collapsible-collapsed";

    it("should stamp the widget using the jqm widget", function() {
        var createCount = 0;
        var spy = testutils.spyOnJq('collapsible').andCallFake(function() {
            if (arguments.length===0) {
                createCount++;
            }
        });
        var c = testutils.compileInPage('<div data-role="collapsible" ng-repeat="l in list"></div>');
        expect(spy.callCount).toBe(0);
        var scope = c.page.scope();
        scope.list = [1,2];
        scope.$root.$digest();
        expect(createCount).toBe(2);
    });

    it('should be collapsed by default', function () {
        var d = testutils.compileInPage('<div id="el" data-role="collapsible">' +
            '<h3>header</h3>' +
            '<p>content</p>' +
            '</div>');
        var input = d.element;
        expect(input.hasClass(collapsedClass)).toBe(true);
    });

    it('should collapse the content by a click', function () {
        var d = testutils.compileInPage('<div id="el" data-role="collapsible">' +
            '<h3>header</h3>' +
            '<p>content</p>' +
            '</div>');
        var input = d.element;
        var header = input.find('h3');
        expect(input.hasClass(collapsedClass)).toBeTruthy();
        header.trigger('click');
        expect(input.hasClass(collapsedClass)).toBeFalsy();
    });

    it('should update the data-collapsed variable', function () {
        var d = testutils.compileInPage('<div id="el" data-role="collapsible" data-collapsed="collapsed">' +
            '<h3>header</h3>' +
            '<p>content</p>' +
            '</div>');
        var input = d.element;
        var scope = input.scope();
        var header = input.find('h3');
        expect(scope.collapsed).toBe(false);
        header.trigger('click');
        expect(scope.collapsed).toBe(true);
    });

    it("should update the ui when data-collapsed changes", function() {
        var d = testutils.compileInPage('<div id="el" data-role="collapsible" data-collapsed="collapsed">' +
            '<h3>header</h3>' +
            '<p>content</p>' +
            '</div>');
        var input = d.element;
        var scope = input.scope();
        expect(input.hasClass(collapsedClass)).toBe(false);
        scope.collapsed = true;
        scope.$root.$digest();
        expect(input.hasClass(collapsedClass)).toBe(true);
    });



    it("should use the disabled attribute", function() {
        var d = testutils.compileInPage('<div id="el" data-role="collapsible" ng-disabled="disabled">' +
            '<h3>header</h3>' +
            '<p>content</p>' +
            '</div>');
        var input = d.element;
        var scope = input.scope();
        expect(input.hasClass('ui-state-disabled')).toBe(false);
        scope.disabled = true;
        scope.$root.$digest();
        expect(input.hasClass('ui-state-disabled')).toBe(true);
    });

    it("should allow nested collapsibles", function() {
        var d = testutils.compileInPage('<div data-role="collapsible">' +
            '<h3 class="test">header1</h3>' +
            '<div data-role="collapsible">' +
            '<h3>header2</h3>' +
            '<p>content</p>' +
            '</div>' +
            '</div>');
        var input = d.element;
        expect(input.find(".test").length).toBe(1);
    });
});
