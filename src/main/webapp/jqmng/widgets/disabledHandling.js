jqmng.define('jqmng/widgets/disabledHandling', ['jquery', 'angular'], function ($, angular) {
        var mod = angular.module('ng');

        function instrumentAttrSetter(element, attr) {
            // Note: We cannot use attr.$observe here, as we also want to
            // be able to listen to ng-bind-attr!
            var _$set = attr.$set;
            if (_$set.instrumented) {
                return;
            }
            attr.$set = function (key, value) {
                var res = _$set.apply(this, arguments);
                if (key === 'disabled') {
                    var jqmOperation = 'enable';
                    if (value === 'disabled' || value == 'true') {
                        jqmOperation = 'disable';
                    }
                    var data = element.data();
                    for (var key in data) {
                        var widget = data[key];
                        if (widget[jqmOperation]) {
                            element[key](jqmOperation);
                        }
                    }
                }
                return res;
            };
            attr.$set.instrumented = true;
        }

        mod.directive('ngBindAttr', function () {
            return {
                compile:function () {
                    return {
                        post:function (scope, element, attr) {
                            instrumentAttrSetter(element, attr);
                        }
                    }
                }
            }
        });

        mod.directive('disabled', function () {
            return {
                compile:function () {
                    return {
                        post:function (scope, element, attr) {
                            instrumentAttrSetter(element, attr);
                        }
                    }
                }
            }
        });

        mod.directive('ngDisabled', function () {
            return {
                compile:function () {
                    return {
                        post:function (scope, element, attr) {
                            instrumentAttrSetter(element, attr);
                        }
                    }
                }
            }
        });
    }
);