(function (angular) {
    var ng = angular.module("ng");
    ng.directive('option', ['$interpolate', function ($interpolate) {
        return {
            restrict:'E',
            compile:function (tElement, tAttrs) {
                var textInterpolateFn = $interpolate(tElement.text(), true);
                var valueInterpolateFn = $interpolate(tElement.attr('value'), true);
                return function (scope, iElement, iAttrs) {
                    scope.$watch(textInterpolateFn, function () {
                        scope.$emit("$childrenChanged");
                    });
                    scope.$watch(valueInterpolateFn, function () {
                        scope.$emit("$childrenChanged");
                    });
                }
            }
        };
    }]);
})(window.angular);