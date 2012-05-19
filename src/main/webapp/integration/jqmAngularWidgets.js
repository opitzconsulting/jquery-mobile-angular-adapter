(function (angular) {
    var widgetConfig = {
        button:{
            handlers:[disabledHandler]
        },
        collapsible:{
            handlers:[disabledHandler]
        },
        textinput:{
            handlers:[disabledHandler]
        },
        checkboxradio:{
            handlers:[disabledHandler, refreshOnNgModelRender]
        },
        slider:{
            handlers:[disabledHandler, refreshOnNgModelRender]
        },
        listview:{
            handlers:[refreshOnChildrenChange]
        },
        collapsibleset:{
            handlers:[refreshOnChildrenChange]
        },
        selectmenu:{
            handlers:[disabledHandler, refreshOnNgModelRender, refreshOnChildrenChange]
        },
        controlgroup:{
            handlers:[refreshOnChildrenChange]
        },
        navbar: {
            handlers:[]
        },
        dialog: {
            handlers:[]
        },
        fixedtoolbar: {
            handlers:[]
        }
    };

    var config;
    for (var widgetName in widgetConfig) {
        config = widgetConfig[widgetName];
        $.mobile.registerJqmNgWidget(widgetName, mergeHandlers(widgetName, config.handlers));
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