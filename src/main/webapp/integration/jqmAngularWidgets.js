(function (angular) {
    var widgetConfig = {
        button:{
            selector:true,
            handlers:[disabledHandler]
        },
        collapsible:{
            selector:true,
            handlers:[disabledHandler]
        },
        textinput:{
            selector:true,
            handlers:[disabledHandler]
        },
        checkboxradio:{
            selector:true,
            handlers:[disabledHandler, refreshOnNgModelRender]
        },
        slider:{
            selector:true,
            handlers:[disabledHandler, refreshOnNgModelRender]
        },
        listview:{
            selector:true,
            handlers:[refreshOnChildrenChange]
        },
        collapsibleset:{
            selector:true,
            handlers:[refreshOnChildrenChange]
        },
        selectmenu:{
            selector:true,
            handlers:[disabledHandler, refreshOnNgModelRender, refreshOnChildrenChange]
        },
        controlgroup:{
            selector:":jqmData(role='controlgroup')",
            handlers:[refreshOnChildrenChange]
        }
    };

    var ng = angular.module("ng");
    ng.config(["$compileProvider", function ($compileProvider) {
        var config, selector;
        for (var widgetName in widgetConfig) {
            config = widgetConfig[widgetName];
            if (config.selector === true) {
                selector = getJqmWidgetSelector(widgetName);
            } else {
                selector = config.selector;
            }
            $compileProvider.registerJqmWidget(widgetName, selector, mergeHandlers(widgetName, config.handlers));
        }
    }]);

    function getJqmWidgetSelector(widgetName) {
        return $.mobile[widgetName].prototype.options.initSelector;
    }

    function mergeHandlers(widgetName, handlers) {
        return function (scope, iElement, iAttrs, ctrls) {
            for (var i = 0; i < handlers.length; i++) {
                handlers[i](widgetName, scope, iElement, iAttrs, ctrls);
            }
        }
    }

    function disabledHandler(widgetName, scope, iElement, iAttrs, ctrls) {
        iAttrs.$observe("disabled", function (value) {
            if (value) {
                iElement[widgetName]("disable");
            } else {
                iElement[widgetName]("enable");
            }
        });
    }

    function addCtrlFunctionListener(ctrl, ctrlFnName, fn) {
        var listenersName = "_listeners" + ctrlFnName;
        if (!ctrl[listenersName]) {
            ctrl[listenersName] = [];
            var oldFn = ctrl[ctrlFnName];
            ctrl[ctrlFnName] = function () {
                var res = oldFn.apply(this, arguments);
                for (var i = 0; i < ctrl[listenersName].length; i++) {
                    ctrl[listenersName][i]();
                }
                return res;
            };
        }
        ctrl[listenersName].push(fn);
    }

    function refreshOnNgModelRender(widgetName, scope, iElement, iAttrs, ctrls) {
        var ngModelCtrl = ctrls[0];
        if (ngModelCtrl) {
            addCtrlFunctionListener(ngModelCtrl, "$render", function () {
                triggerAsyncRefresh(widgetName, scope, iElement);
            });
        }
    }

    function refreshOnChildrenChange(widgetName, scope, iElement, iAttrs, ctrls) {
        scope.$on("$childrenChanged", function () {
            triggerAsyncRefresh(widgetName, scope, iElement);
        });
    }

    function triggerAsyncRefresh(widgetName, scope, iElement, iAttrs, ctrls) {
        var prop = "_refresh" + widgetName;
        scope[prop] = scope[prop] + 1 || 1;
        scope.$evalAsync(function () {
            scope[prop]--;
            if (scope[prop] === 0) {
                iElement[widgetName]("refresh");
            }
        });
    }


})(window.angular);