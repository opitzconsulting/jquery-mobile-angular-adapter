(function (angular) {
    var ng = angular.module("ng");
    ng.directive('option', ['$interpolate', function ($interpolate) {
        return {
            restrict:'E',
            compile:function (tElement, tAttrs) {
                var textInterpolateFn = $interpolate(tElement.text(), true);
                var valueInterpolateFn = tElement.attr('value');
                if (valueInterpolateFn !== false && typeof valueInterpolateFn !== 'undefined') {
                    valueInterpolateFn = $interpolate(tElement.attr('value'), true);
                }
                return function (scope, iElement, iAttrs) {
                    if (textInterpolateFn != null) {
                        scope.$watch(textInterpolateFn, function () {
                            iElement.trigger("$childrenChanged");
                        });
                    }

                    if (valueInterpolateFn != null) {
                        scope.$watch(valueInterpolateFn, function () {
                            iElement.trigger("$childrenChanged");
                        });
                    }
                };
            }
        };
    }]);
})(angular);
