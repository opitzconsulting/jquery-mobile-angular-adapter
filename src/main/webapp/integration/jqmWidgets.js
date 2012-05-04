(function(angular) {
    var ng = angular.module("ng");
    ng.config(["$compileProvider", function($compileProvider) {


        var widgets = ['button'];
        for (var i = 0; i < widgets.length; i++) {
            $compileProvider.parseSelectorAndRegisterJqmWidget(widgets[i], function (scope, iElement, iAttrs) {
                iAttrs.$observe("disabled", function (value) {
                    if (value) {
                        iElement.button("disable");
                    } else {
                        iElement.button("enable");
                    }
                });

            });
        }
    }]);

})(window.angular);