(function (angular, $) {
    var widgetConfig = {
        checkboxradio:{
            handlers:[disabledHandler, refreshAfterNgModelRender, checkedHandler],
            precompile:checkboxRadioPrecompile,
            create:checkboxRadioCreate
        },
        // Button wraps itself into a new element.
        // Angular does not like this, so we do it in advance.
        button:{
            handlers:[disabledHandler],
            precompile:wrapIntoDivPrecompile,
            create:buttonCreate
        },
        collapsible:{
            handlers:[disabledHandler, collapsedHandler]
        },
        textinput:{
            handlers:[disabledHandler],
            precompile:textinputPrecompile,
            create:unwrapFromDivCreate
        },
        slider:{
            handlers:[disabledHandler, refreshAfterNgModelRender],
            precompile:wrapIntoDivPrecompile,
            create:sliderCreate
        },
        listview:{
            handlers:[refreshOnChildrenChange]
        },
        collapsibleset:{
            handlers:[refreshOnChildrenChange]
        },
        // selectmenu wraps itself into a button and an outer div.
        // Angular does not like this, so we do it in advance.
        selectmenu:{
            handlers:[disabledHandler, refreshAfterNgModelRender, refreshOnChildrenChange],
            precompile:wrapIntoDivPrecompile,
            create:unwrapFromDivCreate
        },
        controlgroup:{
            handlers:[refreshControlgroupOnChildrenChange]
        },
        navbar:{
            handlers:[refreshOnChildrenChange]
        },
        dialog:{
            handlers:[],
            precompile:dialogPrecompile,
            create:dialogCreate
        },
        fixedtoolbar:{
            handlers:[]
        }
    };

    function mergeHandlers(widgetName, list) {
        return function ($injector) {
            var args = Array.prototype.slice.call(arguments);
            args.unshift(widgetName);
            args.push($injector);
            for (var i = 0; i < list.length; i++) {
                list[i].apply(this, args);
            }
        }
    }

    var config;
    for (var widgetName in widgetConfig) {
        config = widgetConfig[widgetName];
        config.link = mergeHandlers(widgetName, config.handlers);
        $.mobile.registerJqmNgWidget(widgetName, config);
    }

    // -------------------
    // precompile and create functions

    // Slider appends a new element after the input/select element for which it was created.
    // The angular compiler does not like this, so we wrap the two elements into a new parent node.
    function sliderCreate(origCreate, element, initArgs) {
        var slider = element.children().eq(0);
        origCreate.apply(slider, initArgs);
    }

    // Checkboxradio requires a label for every checkbox input. From the jqm perspective, the label
    // can be at different locations in the DOM tree. However, if the
    // label is not under the same parent as the checkbox, this could change the DOM structure
    // too much for angular's compiler.
    // So we dynamically create a parent <fieldset> and move the label into that tag if needed.
    // Also, the checkboxradio widget changes dom elements in the neighbouring label element,
    // which is also a no-go for the angular compiler. For this, we create the checkboxradio widget
    // when we are linking the <fieldset> element, as changing children is fine for the compiler.
    function checkboxRadioPrecompile(origElement, initArgs) {
        // See the checkboxradio-Plugin in jqm for the selectors used to locate the label.
        var parentLabel = $(origElement).closest("label");
        var container = $(origElement).closest("form,fieldset,:jqmData(role='page'),:jqmData(role='dialog')");
        if (container.length===0) {
            container = origElement.parent();
        }
        var label = parentLabel.length ? parentLabel : container.find("label").filter("[for='" + origElement[0].id + "']");
        var parent = origElement.parent();
        if (parent[0].tagName.toUpperCase()!=='FIELDSET') {
            origElement.wrap("<fieldset></fieldset>");
        }
        // ensure that the label is after the input element in each case.
        var wrapper = origElement.parent();
        wrapper.append(label);
        moveCloningDirectives(origElement, wrapper);
        return wrapper;
    }

    function checkboxRadioCreate(origCreate, element, initArgs) {
        // we ensured in precompile that the label is after the checkbox and both are within a <fieldset>
        var checkbox = element.children().eq(0);
        origCreate.apply(checkbox, initArgs);
    }

    function buttonCreate(origCreate, element, initArgs) {
        // TODO preserve the text node!
        return unwrapFromDivCreate(origCreate, element, initArgs);
    }

    // textinput for input-type "search" wraps itself into a new element
    function textinputPrecompile(origElement, initArgs) {
        if (!origElement.is("[type='search'],:jqmData(type='search')")) {
            return origElement;
        }
        return wrapIntoDivPrecompile(origElement, initArgs);
    }

    function wrapIntoDivPrecompile(origElement, initArgs) {
        origElement.wrapAll("<div></div>");
        var wrapper = origElement.parent();
        moveCloningDirectives(origElement, wrapper);
        return wrapper;
    }

    function unwrapFromDivCreate(origCreate, element, initArgs) {
        if (element[0].nodeName.toUpperCase() !== "DIV") {
            // no wrapper
            return origCreate.apply(element, initArgs);
        }
        if (origCreate.isSpy && origCreate.originalValue!==origCreate.plan) {
            // spy that does not call through
            return origCreate.apply(element, initArgs);
        }

        var wrapper = element;
        var button = element.children().eq(0);
        button.insertBefore(wrapper);
        // TODO refactor this!
        // Do not use remove as this will fire a destroy event.
        wrapper[0].parentNode.removeChild(wrapper[0]);
        wrapper.html('');
        var wrapperUsed = false;
        function useWrapperIfPossible(oldFn, selector) {
            oldFn.restore();
            if (wrapperUsed) {
                return false;
            }
            wrapperUsed = true;
            if (selector) {
                var template = $(selector);
                wrapper[0].className = template[0].className;
            }
            return true;
        }

        var res = withPatches($.fn, {
            init:function (_init, self, args) {
                var selector = args[0];
                if (typeof selector === "string" && selector.charAt(0) === '<') {
                    if (useWrapperIfPossible(_init, selector)) {
                        return wrapper;
                    }
                }
                return _init.apply(self, args);
            },
            wrap: function(_wrap, self, args) {
                var selector = args[0];
                if (useWrapperIfPossible(_wrap, selector)) {
                    wrapper.insertBefore(self);
                    wrapper.append(self);
                    return self;
                }
                return _wrap.apply(self, args);
            },
            wrapAll: function(_wrapAll, self, args) {
                var selector = args[0];
                if (useWrapperIfPossible(_wrapAll, selector)) {
                    wrapper.insertBefore(self);
                    wrapper.append(self);
                    return self;
                }
                return _wrapAll.apply(self, args);
            }
        }, function() {
            return origCreate.apply(button, initArgs);
        });
        if (!wrapperUsed) {
            throw new Error("wrapper was not used!");
        }
        return res;
    }


    // TODO from here! Use new strategy!


    // Dialog: separate event binding and dom enhancement.
    // Note: We do need to add the close button during precompile,
    // as the enhancement for the dialog header and footer depends on it.
    // We cannot adjust the timing of the header enhancement as it is no jqm widget.
    function dialogPrecompile(origElement, initAttrs) {
        var options = $.mobile.dialog.prototype.options;
        var $el = origElement,
            headerCloseButton = $("<a href='#' data-" + $.mobile.ns + "icon='delete' data-" + $.mobile.ns + "iconpos='notext'>" + options.closeBtnText + "</a>"),
            dialogWrap = $("<div/>", {
                "role":"dialog",
                "class":"ui-dialog-contain ui-corner-all ui-overlay-shadow"
            });

        // TODO we only need the close button here, not more!
        // TODO the dialog wrap element only needs a simple div, not more!
        $el
            .wrapInner(dialogWrap)
            .children()
            .find(":jqmData(role='header')")
            .prepend(headerCloseButton)
            .end()
            .children(':first-child')
            .addClass("ui-corner-top")
            .end()
            .children(":last-child")
            .addClass("ui-corner-bottom");

        $el.data("headerCloseButton", headerCloseButton);

        return $el;
    }

    function dialogCreate(origCreate, element, initArgs) {
        // TODO use new kind of patches!

        return withPatches($.fn, {
            init:function (_init, self, args) {
                // return the already created header close button
                var selector = args[0];
                if (selector && selector.indexOf && selector.indexOf("<a href='#' data-") === 0) {
                    return element.data("headerCloseButton");
                }
                return _init.apply(self, args);
            },
            wrapInner:function (_wrapInner, self, args) {
                if (self[0] === element[0]) {
                    return $();
                }
                return _wrapInner.apply(self, args);
            }
        }, function () {
            return origCreate.apply(element, initArgs);
        });
    }

    function withPatches(obj, patches, callback) {
        var _old = {};

        function patchProp(prop) {
            var oldFn = _old[prop] = obj[prop];
            oldFn.restore = function() {
                obj[prop] = oldFn;
                delete oldFn.restore;
            };
            obj[prop] = function () {
                return patches[prop](oldFn, this, arguments);
            };
            obj[prop].prototype = oldFn.prototype;
        }

        var prop;
        for (prop in patches) {
            patchProp(prop);
        }
        try {
            return callback();
        } finally {
            for (prop in _old) {
                _old[prop].restore && _old[prop].restore();
            }
        }
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

    function collapsedHandler(widgetName, scope, iElement, iAttrs, ctrls, $inject) {
        var $parse = $inject.get("$parse");
        if (iAttrs.collapsed) {
            var collapsedGetter = $parse(iAttrs.collapsed);
            var collapsedSetter = collapsedGetter.assign;
            scope.$watch(collapsedGetter, function (value) {
                if (value) {
                    iElement.trigger("collapse");
                } else {
                    iElement.trigger("expand");
                }
            });

            iElement.bind("collapse", function () {
                scope.$apply(function () {
                    collapsedSetter(scope, true);
                });
            });
            iElement.bind("expand", function () {
                scope.$apply(function () {
                    collapsedSetter(scope, false);
                });
            });
        }
    }

    function checkedHandler(widgetName, scope, iElement, iAttrs, ctrls) {
        iAttrs.$observe("checked", function (value) {
            triggerAsyncRefresh(widgetName, scope, iElement, "refresh");
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
        var refreshId = (iElement.data(prop) || 0) + 1;
        iElement.data(prop, refreshId);
        scope.$evalAsync(function () {
            if (iElement.data(prop) === refreshId) {
                iElement[widgetName](options);
            }
        });
    }


})(angular, $);