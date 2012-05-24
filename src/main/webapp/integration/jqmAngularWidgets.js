(function (angular, $) {
    var widgetConfig = {
        button:{
            handlers:[disabledHandler],
            precompile:buttonPrecompile
        },
        collapsible:{
            handlers:[disabledHandler]
        },
        textinput:{
            handlers:[disabledHandler]
        },
        checkboxradio:{
            handlers:[disabledHandler, refreshAfterNgModelRender],
            precompile:checkboxRadioPrecompile
        },
        slider:{
            handlers:[disabledHandler, refreshAfterNgModelRender],
            precompile:sliderPrecompile
        },
        listview:{
            handlers:[refreshOnChildrenChange]
        },
        collapsibleset:{
            handlers:[refreshOnChildrenChange]
        },
        selectmenu:{
            handlers:[disabledHandler, refreshAfterNgModelRender, refreshOnChildrenChange],
            precompile:selectmenuPrecompile
        },
        controlgroup:{
            handlers:[refreshControlgroupOnChildrenChange]
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
        return function () {
            var args = Array.prototype.slice.call(arguments);
            args.unshift(widgetName);
            for (var i = 0; i < list.length; i++) {
                list[i].apply(this, args);
            }
        }
    }

    var config;
    for (var widgetName in widgetConfig) {
        config = widgetConfig[widgetName];
        $.mobile.registerJqmNgWidget(widgetName, config.precompile, mergeHandlers(widgetName, config.handlers));
    }

    // -------------------
    // precompile functions

    // Checkboxradio wraps the input and label into a new element.
    // The angular compiler does not like this, as it changes elements that are not
    // in the subtree of the input element that is currently linked.
    function checkboxRadioPrecompile(createData) {
        var origElement = createData.widgetElement;
        // Selectors: See the checkboxradio-Plugin in jqm.
        var parentLabel = $(origElement).closest("label");
        var label = parentLabel.length ? parentLabel : $(origElement).closest("form,fieldset,:jqmData(role='page'),:jqmData(role='dialog')").find("label").filter("[for='" + origElement[0].id + "']");
        var wrapper = $("<div></div>").insertBefore(origElement).append(origElement).append(label);
        createData.widgetElement = origElement.parent();
        moveCloningDirectives(origElement, createData.widgetElement);

        createData.create = function () {
            var _wrapAll = $.fn.wrapAll;
            $.fn.wrapAll = function(container) {
                if (this[0] === origElement[0]) {
                    $.fn.wrapAll = _wrapAll;
                    var tempContainer = $(container);
                    wrapper[0].className = tempContainer[0].className;
                    return origElement;
                }
                return _wrapAll.apply(this, arguments);
            };

            var res = $.fn.orig.checkboxradio.apply(this.children("input"), arguments);
            $.fn.wrapAll = _wrapAll;
            return res;
        }
    }


    // Slider appends a new element after the input/select element for which it was created.
    // The angular compiler does not like this, so we wrap the two elements into a new parent node.
    function sliderPrecompile(createData) {
        var origElement = createData.widgetElement;
        origElement.wrapAll("<div></div>");
        var wrapper = createData.widgetElement = createData.widgetElement.parent();
        moveCloningDirectives(origElement, wrapper);

        createData.create = function () {
            return $.fn.orig.slider.apply(this.children().eq(0), arguments);
        };
    }

    // Button wraps itself into a new element.
    // Angular does not like this, so we do it in advance.
    function buttonPrecompile(createData) {
        var origElement = createData.widgetElement;
        var wrapper = $("<div></div>").insertBefore(origElement).append(origElement);
        moveCloningDirectives(origElement, wrapper);
        createData.widgetElement = wrapper;
        createData.create = function () {
            var wrapper = this;
            var button = this.children().eq(0);

            var _init = $.fn.init;
            $.fn.init = function (selector) {
                if (selector === "<div></div>") {
                    // Only catch the first call
                    $.fn.init = _init;
                    arguments[0] = wrapper;
                    return $.fn.init.apply(this, arguments);
                }
                return _init.apply(this, arguments);
            };
            $.fn.init.prototype = _init.prototype;

            var _insertBefore = $.fn.insertBefore;
            $.fn.insertBefore = function (element) {
                if (this[0] === wrapper[0] && element[0] === button[0]) {
                    return this;
                }
                return _insertBefore.apply(this, arguments);
            };

            var _empty = $.fn.empty;
            $.fn.empty = function() {
                if (this[0]===wrapper[0]) {
                    return this;
                }
                return _empty.apply(this, arguments);
            };

            var res = $.fn.orig.button.apply(button, arguments);

            $.fn.init = _init;
            $.fn.insertBefore = _insertBefore;
            $.fn.empty = _empty;
            return res;
        };

    }

    // selectmenu wraps itself into a new element.
    // Angular does not like this, so we do it in advance.
    function selectmenuPrecompile(createData) {
        var origElement = createData.widgetElement;
        var wrapper = $("<div></div>").insertBefore(origElement).append(origElement);
        moveCloningDirectives(origElement, wrapper);
        createData.widgetElement = wrapper;
        createData.create = function () {
            var wrapper = this;
            var select = this.children().eq(0);

            var _wrap = $.fn.wrap;
            $.fn.wrap = function(container) {
                if (this[0] === select[0]) {
                    $.fn.wrap = _wrap;
                    var tempContainer = $(container);
                    wrapper[0].className = tempContainer[0].className;

                    return select;
                }
                return _wrap.apply(this, arguments);
            };

            var res = $.fn.orig.selectmenu.apply(select, arguments);

            $.fn.wrap = _wrap;
            return res;
        };

    }

    var CLONING_DIRECTIVE_REGEXP = /(^|[\W])(repeat|switch-when|if)($|[\W])/;

    function moveCloningDirectives(source, target) {
        // iterate over the attributes
        var cloningAttrNames = [];
        var node = source[0];
        var targetNode = target[0];
        var nAttrs = node.attributes;
        var attrCount = nAttrs && nAttrs.length;
        if (attrCount) {
            for (var attr, name,
                     j = attrCount - 1; j >= 0; j--) {
                attr = nAttrs[j];
                name = attr.name;
                if (CLONING_DIRECTIVE_REGEXP.test(name)) {
                    node.removeAttributeNode(attr);
                    targetNode.setAttributeNode(attr);
                }
            }
        }

        // iterate over the class names.
        var targetClassName = '';
        var className = node.className;
        var match;
        if (className) {
            className = className.replace(/[^;]+;?/, function (match) {
                if (CLONING_DIRECTIVE_REGEXP.test(match)) {
                    targetClassName += match;
                    return '';
                }
                return match;
            });
        }
        if (targetClassName) {
            targetNode.className = targetClassName;
            node.className = className;
        }
    }

    // Expose for tests.
    $.mobile.moveCloningDirectives = moveCloningDirectives;


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
                triggerAsyncRefresh(widgetName, scope, iElement, "refresh");
            });
        }
    }

    function refreshControlgroupOnChildrenChange(widgetName, scope, iElement, iAttrs, ctrls) {
        iElement.bind("$childrenChanged", function () {
            triggerAsyncRefresh(widgetName, scope, iElement, {});
        });
    }


    function refreshOnChildrenChange(widgetName, scope, iElement, iAttrs, ctrls) {
        iElement.bind("$childrenChanged", function () {
            triggerAsyncRefresh(widgetName, scope, iElement, "refresh");
        });
    }

    function triggerAsyncRefresh(widgetName, scope, iElement, options) {
        var prop = "_refresh" + widgetName;
        scope[prop] = scope[prop] + 1 || 1;
        scope.$evalAsync(function () {
            scope[prop]--;
            if (scope[prop] === 0) {
                iElement[widgetName](options);
            }
        });
    }


})(window.angular, window.jQuery);