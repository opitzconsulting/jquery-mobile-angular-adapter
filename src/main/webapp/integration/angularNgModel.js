(function ($, angular) {
    var mod = angular.module('ng');
    /*
     * Angular does not use $.prop or $.attr for setting the attributes "selected" (radio/check boxes) and "checked"
     * (select boxes). By this, we need to trigger the requestrefresh event ourselves.
     */
    mod.directive("ngModel", function () {
        return {
            restrict:'A',
            require:'ngModel',
            compile:function () {
                return {
                    post:function (scope, iElement, iAttrs, ctrl) {
                        var _$render = ctrl.$render;
                        ctrl.$render = function () {
                            var res = _$render.apply(this, arguments);
                            iElement.jqmChanged(true);
                            return res;
                        };
                    }
                }
            }
        }
    });
})(window.jQuery, window.angular);