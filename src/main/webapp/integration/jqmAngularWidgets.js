(function (angular, $) {
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
            handlers:[disabledHandler, refreshAfterNgModelRender]
        },
        slider:{
            handlers:[disabledHandler, refreshAfterNgModelRender]
        },
        listview:{
            handlers:[refreshOnChildrenChange]
        },
        collapsibleset:{
            handlers:[refreshOnChildrenChange]
        },
        selectmenu:{
            handlers:[disabledHandler, refreshAfterNgModelRender, refreshOnChildrenChange]
        },
        controlgroup:{
            handlers:[refreshOnChildrenChange]
        },
        navbar:{
            handlers:[]
        },
        dialog:{
            handlers:[]
        },
        fixedtoolbar:{
            handlers:[]
        }
    };

    function mergeHandlers(widgetName, list) {
        return function() {
            var args = Array.prototype.slice.call(arguments);
            args.unshift(widgetName);
            for (var i=0; i<list.length; i++) {
                list[i].apply(this, args);
            }
        }
    }

    var config;
    for (var widgetName in widgetConfig) {
        config = widgetConfig[widgetName];
        $.mobile.registerJqmNgWidget(widgetName, mergeHandlers(widgetName, config.handlers));
    }

    var noop = function() { };

    $.fn.orig.checkboxradio.precompile = function (createData) {
        var iElement = createData.widgetElement;
        // Selectors: See the checkboxradio-Plugin in jqm.
        var parentLabel = $(iElement).closest("label");
        var label = parentLabel.length ? parentLabel : $(iElement).closest("form,fieldset,:jqmData(role='page'),:jqmData(role='dialog')").find("label").filter("[for='" + iElement[0].id + "']");
        var wrapper = document.createElement('div');
        var inputtype = iElement[0].type;
        wrapper.className = 'ui-' + inputtype;
        var $wrapper = $(wrapper);
        iElement.add(label).wrapAll(wrapper);
        createData.widgetElement = iElement.parent();

        createData.create = function() {
            var _oldWrapAll = $.fn.wrapAll;
            $.fn.wrapAll = noop;
            var res = $.fn.orig.checkboxradio.apply(this.children("input"), arguments);
            $.fn.wrapAll = _oldWrapAll;
            return res;
        }
    };

    // -------------------
    // link handlers
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

    function refreshAfterNgModelRender(widgetName, scope, iElement, iAttrs, ctrls) {
        var ngModelCtrl = ctrls[0];
        if (ngModelCtrl) {
            addCtrlFunctionListener(ngModelCtrl, "$render", function () {
                triggerAsyncRefresh(widgetName, scope, iElement);
            });
        }
    }

    function refreshOnChildrenChange(widgetName, scope, iElement, iAttrs, ctrls) {
        iElement.bind("$childrenChanged", function () {
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


})(window.angular, window.jQuery);