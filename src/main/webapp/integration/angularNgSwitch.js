(function (angular) {
    var ng = angular.module("ng");
    ng.directive("ngSwitch",
        function () {
            return {
                restrict:'EA',
                compile:function (element, attr) {
                    var watchExpr = attr.ngSwitch || attr.on;
                    return function (scope, element) {
                        scope.$watch(watchExpr, function (value) {
                            scope.$emit("$childrenChanged");
                        });
                    }
                }
            }
        });
})(window.angular);