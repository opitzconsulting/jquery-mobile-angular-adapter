(function(angular) {
    // TODO refactor this: Create a config for every jqm widget...

    var ng = angular.module("ng");
    ng.config(["$compileProvider", function($compileProvider) {
        $compileProvider.parseSelectorAndRegisterJqmWidget('button', function (scope, iElement, iAttrs) {
            disabledHandling('button', scope, iElement, iAttrs);

        });
        $compileProvider.parseSelectorAndRegisterJqmWidget('collapsible', function (scope, iElement, iAttrs) {
            disabledHandling('collapsible', scope, iElement, iAttrs);

        });

        $compileProvider.parseSelectorAndRegisterJqmWidget('textinput', function (scope, iElement, iAttrs) {
            disabledHandling('textinput', scope, iElement, iAttrs);

        });

        $compileProvider.parseSelectorAndRegisterJqmWidget('checkboxradio', function (scope, iElement, iAttrs, ctrls) {
            disabledHandling('checkboxradio', scope, iElement, iAttrs);
            refreshOnNgModelRender('checkboxradio', scope, iElement, ctrls);

        });
        $compileProvider.parseSelectorAndRegisterJqmWidget('slider', function (scope, iElement, iAttrs, ctrls) {
            disabledHandling('slider', scope, iElement, iAttrs);
            refreshOnNgModelRender('slider', scope, iElement, ctrls);

        });

        $compileProvider.parseSelectorAndRegisterJqmWidget('listview', function (scope, iElement, iAttrs, ctrls) {
            refreshOnChildrenChange('listview', scope, iElement);
        });

        $compileProvider.parseSelectorAndRegisterJqmWidget('collapsibleset', function (scope, iElement, iAttrs, ctrls) {
            refreshOnChildrenChange('collapsibleset', scope, iElement);
        });

        $compileProvider.parseSelectorAndRegisterJqmWidget('selectmenu', function (scope, iElement, iAttrs, ctrls) {
            disabledHandling('selectmenu', scope, iElement, iAttrs);
            refreshOnNgModelRender('selectmenu', scope, iElement, ctrls);
            refreshOnChildrenChange('selectmenu', scope, iElement);
        });
    }]);

    function disabledHandling(widget, scope, iElement, iAttrs) {
        iAttrs.$observe("disabled", function (value) {
            if (value) {
                iElement[widget]("disable");
            } else {
                iElement[widget]("enable");
            }
        });
    }

    function addCtrlFunctionListener(ctrl, ctrlFnName, fn) {
        var listenersName = "_listeners"+ctrlFnName;
        if (!ctrl[listenersName]) {
            ctrl[listenersName] = [];
            var oldFn = ctrl[ctrlFnName];
            ctrl[ctrlFnName] = function() {
                var res = oldFn.apply(this, arguments);
                for (var i=0; i<ctrl[listenersName].length; i++) {
                    ctrl[listenersName][i]();
                }
                return res;
            };
        }
        ctrl[listenersName].push(fn);
    }

    function refreshOnNgModelRender(widget, scope, iElement, ctrls) {
        var ngModelCtrl = ctrls[0];
        if (ngModelCtrl) {
            addCtrlFunctionListener(ngModelCtrl, "$render", function() {
                triggerAsyncRefresh(widget, scope, iElement);
            });
        }
    }

    function refreshOnChildrenChange(widget, scope, iElement) {
        scope.$on("$childrenChanged", function() {
            triggerAsyncRefresh(widget, scope, iElement);
        });
        scope.$on("$includeContentLoaded", function() {
            triggerAsyncRefresh(widget, scope, iElement);
        });
    }

    function triggerAsyncRefresh(widget, scope, iElement) {
        var prop = "_refresh"+widget;
        scope[prop] = scope[prop]+1 || 1;
        scope.$evalAsync(function() {
            scope[prop]--;
            if (scope[prop]===0) {
                iElement[widget]("refresh");
            }
        });
    }


})(window.angular);