define(['angular'], function(angular) {
    describe('ngm:shared-controller', function() {
        it('should create an instance of the defined controllers and store them in the current scope', function() {
            var instances = [];
            function SharedController1() {
                instances.push(this);
            }
            var instances = [];
            function SharedController2() {
                instances.push(this);
            }
            window.SharedController1 = SharedController1;
            window.SharedController2 = SharedController2;
            var element = angular.element('<div><div ngm:shared-controller="shared1:SharedController1,shared2:SharedController2"></div></div>');
            var rootScope = angular.scope();
            angular.compile(element)(rootScope);
            var scope = element.children('div').scope();
            expect(instances.length).toBe(2);
            expect(scope.shared1).toBe(instances[0]);
            expect(scope.shared2).toBe(instances[1]);
        });

        it('should share instance between usages', function() {
            var instances = [];
            function SharedController1() {
                instances.push(this);
            }
            window.SharedController1 = SharedController1;
            var element = angular.element(
                '<div><div id="id1" ngm:shared-controller="shared1:SharedController1"></div>' +
                    '<div id="id2" ngm:shared-controller="shared1:SharedController1"></div></div>');
            var rootScope = angular.scope();
            angular.compile(element)(rootScope);
            var scope1 = element.children('#id1').scope();
            var scope2 = element.children('#id2').scope();
            expect(instances.length).toBe(1);
            expect(scope1).not.toBe(scope2);
            expect(scope1.shared1).toBe(instances[0]);
            expect(scope2.shared1).toBe(instances[0]);
        });
    });
});