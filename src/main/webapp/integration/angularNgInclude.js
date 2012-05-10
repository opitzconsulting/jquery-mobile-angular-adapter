(function (angular) {
    var ng = angular.module("ng");
    ng.directive("ngInclude",
        function () {
            return {
                restrict:'ECA',
                compile:function (element, attr) {
                    var srcExp = attr.ngInclude || attr.src;
                    return function (scope, element) {
                        scope.$watch(srcExp, function (src) {
                            scope.$emit("$childrenChanged");
                        });
                        scope.$on("$includeContentLoaded", function() {
                            scope.$emit("$childrenChanged");
                        });
                    }
                }
            }
        });
})(window.angular);