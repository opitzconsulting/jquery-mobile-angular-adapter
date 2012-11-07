describe("button", function () {
    it("should stamp the widget using the jqm widget", function() {
        var createCount = 0;
        var spy = testutils.spyOnJq('button').andCallFake(function() {
            if (arguments.length===0) {
                createCount++;
            }
        });
        var c = testutils.compileInPage('<button ng-repeat="l in list"></button>');
        expect(spy.callCount).toBe(0);
        var scope = c.page.scope();
        scope.list = [1,2];
        scope.$root.$digest();
        expect(createCount).toBe(2);
    });

    it("should allow markup in the button content", function() {
        var d = testutils.compileInPage('<button>{{name}}</button>');
        var input = d.element.find("button");
        var scope = input.scope();
        scope.name = 'someName';
        scope.$apply();
        expect($("span span", input.parent()).text()).toBe(scope.name);


    });

    it('should allow clicks via ng-click', function () {
        var d = testutils.compileInPage('<button id="mysel" ng-click="flag = true">Test</button>');
        var page = d.page;
        var input = d.element.find("button");
        var scope = input.scope();
        expect(scope.flag).toBeFalsy();
        input.trigger('click');
        expect(scope.flag).toBeTruthy();
    });

    it('should use the disabled attribute', function () {
        var d = testutils.compileInPage('<button id="mysel" ng-click="flag = true" ng-disabled="disabled">Test</button>');
        var page = d.page;
        var input = d.element.find("button");
        var scope = input.scope();
        var parentDiv = input.parent();
        scope.disabled = false;
        scope.$root.$digest();
        expect(parentDiv.hasClass('ui-disabled')).toBeFalsy();
        scope.disabled = true;
        scope.$root.$digest();
        expect(parentDiv.hasClass('ui-disabled')).toBeTruthy();
    });

    it('should be removable', function () {
        // button wraps itself into a parent div
        var d = testutils.compileInPage('<div ng-init="list=[1,2]"><button ng-repeat="l in list">{{l}}</button></div>');
        var page = d.page;
        var container = d.element;
        var scope = container.scope();
        expect(container.children('div').length).toEqual(2);
        scope.list = [1];
        scope.$root.$digest();
        expect(container.children('div').length).toEqual(1);
    });
});
