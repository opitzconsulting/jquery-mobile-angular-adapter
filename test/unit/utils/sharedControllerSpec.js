describe('ngm-shared-controller', function () {
    it('should create an instance of the defined controllers and store them in the current scope', function () {
        var instances = [];

        function SharedController1($scope) {
            instances.push($scope);
        }

        function SharedController2($scope) {
            instances.push($scope);
        }

        window.SharedController1 = SharedController1;
        window.SharedController2 = SharedController2;
        var d = testutils.compileInPage('<div><div ngm-shared-controller="shared1:SharedController1,shared2:SharedController2"></div></div>');
        var element = d.element;
        var rootScope = element.scope().$root;
        var scope = element.children('div').scope();
        expect(instances.length).toBe(2);
        expect(scope.shared1).toBe(instances[0]);
        expect(scope.shared2).toBe(instances[1]);
    });
    it('should work with space between the controllers', function () {
        var instances = [];

        function SharedController1($scope) {
            instances.push($scope);
        }

        function SharedController2($scope) {
            instances.push($scope);
        }

        window.SharedController1 = SharedController1;
        window.SharedController2 = SharedController2;
        var d = testutils.compileInPage('<div><div ngm-shared-controller="shared1:SharedController1, shared2:SharedController2"></div></div>');
        var element = d.element;
        var rootScope = element.scope().$root;
        var scope = element.children('div').scope();
        expect(instances.length).toBe(2);
        expect(scope.shared1).toBe(instances[0]);
        expect(scope.shared2).toBe(instances[1]);
    });
    it('should share instance between usages', function () {
        var instances = [];

        function SharedController1($scope) {
            instances.push($scope);
        }

        window.SharedController1 = SharedController1;
        var d = testutils.compileInPage(
            '<div><div id="id1" ngm-shared-controller="shared1:SharedController1"></div>' +
                '<div id="id2" ngm-shared-controller="shared1:SharedController1"></div></div>');
        var element = d.element;
        var rootScope = d.element.scope().$root;
        var scope1 = element.children('#id1').scope();
        var scope2 = element.children('#id2').scope();
        expect(instances.length).toBe(1);
        expect(scope1).not.toBe(scope2);
        expect(scope1.shared1).toBe(instances[0]);
        expect(scope2.shared1).toBe(instances[0]);
    });
    it('should destroy instances when all pages that use it are destroyed', function () {
        var sharedScope;

        function SharedController1($scope) {
            sharedScope = $scope;
        }

        window.SharedController1 = SharedController1;
        var d = testutils.compileInPage(
            '<div><div id="id1" ngm-shared-controller="shared1:SharedController1"></div>' +
                '<div id="id2" ngm-shared-controller="shared1:SharedController1"></div></div>');
        var element = d.element;
        var rootScope = d.element.scope().$root;
        var page1 = element.children('#id1');
        var page2 = element.children('#id2');
        expect(sharedScope.$root.$$sharedControllers.SharedController1).toBe(sharedScope);
        spyOn(sharedScope, '$destroy').andCallThrough();
        page2.remove();
        expect(sharedScope.$destroy).not.toHaveBeenCalled();
        expect(sharedScope.$root.$$sharedControllers.SharedController1).toBe(sharedScope);
        page1.remove();
        expect(sharedScope.$destroy).toHaveBeenCalled();
        expect(sharedScope.$root.$$sharedControllers.SharedController1).toBeUndefined();
    });

});
