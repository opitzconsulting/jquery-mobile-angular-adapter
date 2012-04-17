(function ($, angular) {
    var mod = angular.module('ng');
    mod.directive("input", function () {
        return {
            restrict:'E',
            require:'?ngModel',
            compile:function (tElement, tAttrs) {
                var type = tElement.attr('type');
                return {
                    pre:function (scope, iElement, iAttrs, ctrl) {
                        if (!ctrl) {
                            return;
                        }
                        var _bind = iElement.bind;
                        if (type === 'date') {
                            // Angular binds to the input or keydown+change event.
                            // However, date inputs on IOS5 do not fire any of those (only the blur event).
                            // See ios5 bug TODO
                            iElement.bind = function (events, callback) {
                                if (events.indexOf('input') != -1 || events.indexOf('change') != -1) {
                                    events = "change blur";
                                }
                                return _bind.call(this, events, callback);
                            };
                        }
                    }
                }
            }
        };

    });
})(window.jQuery, window.angular);
