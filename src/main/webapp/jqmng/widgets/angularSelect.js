jqmng.define('jqmng/widgets/angularSelect', ['jquery', 'angular'], function ($, angular) {
    var mod = angular.module('ng');
    mod.directive("select", function () {
        return {
            restrict:'E',
            require:'?ngModel',
            compile:function (tElement, tAttrs) {
                return {
                    post:function (scope, iElement, iAttrs, ctrl) {
                        if (!ctrl) {
                            return;
                        }
                        var _$render = ctrl.$render;
                        ctrl.$render = function () {
                            var res = _$render.apply(this, arguments);
                            var data = iElement.data();
                            for (var key in data) {
                                var widget = data[key];
                                if (widget.refresh) {
                                    iElement[key]("refresh");
                                }
                            }

                            return res;
                        };
                    }
                }

            }
        }
    });
});