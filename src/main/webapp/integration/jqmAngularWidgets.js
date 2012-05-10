(function(angular) {
    // TODO refactor this: Create a config for every jqm widget...

    function getJqmWidgetSelector(widgetName) {
        return $.mobile[widgetName].prototype.options.initSelector;
    }

    var ng = angular.module("ng");
    ng.config(["$compileProvider", function($compileProvider) {
        $compileProvider.registerJqmWidget('button', getJqmWidgetSelector('button'), function (scope, iElement, iAttrs) {
            disabledHandling('button', scope, iElement, iAttrs);

        });
        $compileProvider.registerJqmWidget('collapsible', getJqmWidgetSelector('collapsible'), function (scope, iElement, iAttrs) {
            disabledHandling('collapsible', scope, iElement, iAttrs);

        });

        $compileProvider.registerJqmWidget('textinput', getJqmWidgetSelector('textinput'), function (scope, iElement, iAttrs) {
            disabledHandling('textinput', scope, iElement, iAttrs);

        });

        $compileProvider.registerJqmWidget('checkboxradio', getJqmWidgetSelector('checkboxradio'), function (scope, iElement, iAttrs, ctrls) {
            disabledHandling('checkboxradio', scope, iElement, iAttrs);
            refreshOnNgModelRender('checkboxradio', scope, iElement, ctrls);

        });
        $compileProvider.registerJqmWidget('slider', getJqmWidgetSelector('slider'), function (scope, iElement, iAttrs, ctrls) {
            disabledHandling('slider', scope, iElement, iAttrs);
            refreshOnNgModelRender('slider', scope, iElement, ctrls);

        });

        $compileProvider.registerJqmWidget('listview', getJqmWidgetSelector('listview'), function (scope, iElement, iAttrs, ctrls) {
            refreshOnChildrenChange('listview', scope, iElement);
        });

        $compileProvider.registerJqmWidget('collapsibleset', getJqmWidgetSelector('collapsibleset'), function (scope, iElement, iAttrs, ctrls) {
            refreshOnChildrenChange('collapsibleset', scope, iElement);
        });

        $compileProvider.registerJqmWidget('selectmenu', getJqmWidgetSelector('selectmenu'), function (scope, iElement, iAttrs, ctrls) {
            disabledHandling('selectmenu', scope, iElement, iAttrs);
            refreshOnNgModelRender('selectmenu', scope, iElement, ctrls);
            refreshOnChildrenChange('selectmenu', scope, iElement);
        });

        $compileProvider.registerJqmWidget('controlgroup', ":jqmData(role='controlgroup')", function (scope, iElement, iAttrs, ctrls) {
            refreshOnChildrenChange('controlgroup', scope, iElement);
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