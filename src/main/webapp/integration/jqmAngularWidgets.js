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
            precompile:buttonPrecompile,
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
        },
        popup:{
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

    // Checkboxradio requires a label for every checkbox input and wraps itself as well as the label
    // into that div. Angular does not like those changes in the DOM, so we do it in advance.
    function checkboxRadioPrecompile(origElement, initArgs) {
        // See the checkboxradio-Plugin in jqm for the selectors used to locate the label.
        var parentLabel = $(origElement).closest("label");
        var container = $(origElement).closest("form,fieldset,:jqmData(role='page'),:jqmData(role='dialog')");
        if (container.length === 0) {
            container = origElement.parent();
        }
        var label = parentLabel.length ? parentLabel : container.find("label").filter("[for='" + origElement[0].id + "']");
        if (label.length===0) {
            origElement.attr("ng-non-bindable", "true");
        } else {
            var wrapper = wrapIntoDivPrecompile(label);
            moveCloningDirectives(origElement, wrapper);
            wrapper.append(origElement);
            return wrapper;
        }
    }

    function checkboxRadioCreate(origCreate, element, initArgs) {
        // wrap the input into it's label. By this, the jqm widget will always
        // use this label, even if there are other labels with the same id on the same page.
        // This is important if we use ng-repeat on checkboxes, as this could
        // create multiple checkboxes with the same id!
        var label = element.children("label");
        var input = element.children("input");
        label.append(input);
        return unwrapFromDivCreate(function() {
            return origCreate.apply(input, arguments);
        }, element, initArgs);
    }

    function buttonPrecompile(origElement, initArgs) {
        var wrapper = wrapIntoDivPrecompile(origElement);
        // Add a text node with the value content,
        // so that angular bindings work for the value too

        if (origElement[0].nodeName === 'INPUT') {
            var value = origElement.val();
            origElement.append(document.createTextNode(value));
        }
        return wrapper;
    }

    function buttonCreate(origCreate, element, initArgs) {
        // Button destroys the text node and recreates a new one. This does not work
        // if the text node contains angular expressions, so we move the
        // text node to the right place.
        var button = element.children().eq(0);
        var textNode = button.contents();
        var res = unwrapFromDivCreate(origCreate, element, initArgs);
        var textSpan = element.find(".ui-btn-text");
        textSpan.empty();
        textSpan.append(textNode);
        return res;
    }

    // textinput for input-type "search" wraps itself into a new element
    function textinputPrecompile(origElement, initArgs) {
        if (!origElement.is("[type='search'],:jqmData(type='search')")) {
            return origElement;
        }
        return wrapIntoDivPrecompile(origElement);
    }

    function wrapIntoDivPrecompile(origElement) {
        origElement.wrapAll("<div></div>");
        var wrapper = origElement.parent();
        moveCloningDirectives(origElement, wrapper);
        return wrapper;
    }

    function unwrapFromDivCreate(origCreate, element, initArgs) {
        if (element[0].nodeName.toUpperCase() !== "DIV") {
            // no wrapper existing.
            return origCreate.apply(element, initArgs);
        }

        if (isMock(origCreate)) {
            // spy that does not call through
            return origCreate.apply(element, initArgs);
        }

        var child = element.children().eq(0);
        child.insertBefore(element);
        element.empty();
        return useExistingElementsForNewElements(element, function () {
            return origCreate.apply(child, initArgs);
        });
    }

    // Dialog: separate event binding and dom enhancement.
    // Note: We do need to add the close button during precompile,
    // as the enhancement for the dialog header depends on it (calculation which button is left, right, ...)
    // We cannot adjust the timing of the header enhancement as it is no jqm widget.
    function dialogPrecompile(origElement, initAttrs) {
        var options = $.mobile.dialog.prototype.options;
        var headerCloseButton = $("<a href='#' data-" + $.mobile.ns + "icon='delete' data-" + $.mobile.ns + "iconpos='notext'>" + options.closeBtnText + "</a>");
        origElement.find(":jqmData(role='header')").prepend(headerCloseButton);
        origElement.data('headerCloseButton', headerCloseButton);
        return origElement;
    }

    function dialogCreate(origCreate, element, initArgs) {
        if (isMock(origCreate)) {
            // During unit tests...
            return origCreate.apply(element, initArgs);
        }
        var headerCloseButton = element.data('headerCloseButton');
        return useExistingElementsForNewElements(headerCloseButton, function () {
            return origCreate.apply(element, initArgs);
        });
    }

    function isMock(origCreate) {
        return origCreate.isSpy && origCreate.originalValue !== origCreate.plan;
    }

    function useExistingElementsForNewElements(existingElements, callback) {
        var i, el, tagName;
        var existingElementsHashByElementName = {};
        for (i = 0; i < existingElements.length; i++) {
            el = existingElements.eq(i);
            // Do not use jQuery.fn.remove as this will fire a destroy event,
            // which leads to unwanted side effects by it's listeners.
            el[0].parentNode.removeChild(el[0]);
            tagName = el[0].nodeName.toUpperCase();
            existingElementsHashByElementName[tagName] = el;
        }

        function useExistingElementIfPossible(selector) {
            if (selector) {
                var template = $(selector);
                var tagName = template[0].nodeName.toUpperCase();
                var existingElement = existingElementsHashByElementName[tagName];
                if (existingElement) {
                    delete existingElementsHashByElementName[tagName];
                    existingElement[0].className += ' ' + template[0].className;
                    return existingElement;
                }
            }
            return false;
        }

        var res = withPatches($.fn, {
            init:function (_init, self, args) {
                var selector = args[0];
                if (typeof selector === "string" && selector.charAt(0) === '<') {
                    var existingElement = useExistingElementIfPossible(selector);
                    if (existingElement) {
                        return existingElement;
                    }
                }
                return _init.apply(self, args);
            },
            wrap:function (_wrap, self, args) {
                var selector = args[0];
                var wrapper = useExistingElementIfPossible(selector);
                if (wrapper) {
                    wrapper.insertBefore(self);
                    wrapper.append(self);
                    return self;
                }
                return _wrap.apply(self, args);
            },
            wrapAll:function (_wrapAll, self, args) {
                var selector = args[0];
                var wrapper = useExistingElementIfPossible(selector);
                if (wrapper) {
                    wrapper.insertBefore(self);
                    wrapper.append(self);
                    return self;
                }
                return _wrapAll.apply(self, args);
            }
        }, callback);
        for (tagName in existingElementsHashByElementName) {
            throw new Error("existing element with tagName " + tagName + " was not used!");
        }
        return res;
    }

    function withPatches(obj, patches, callback) {
        var _old = {};
        var executingCount = 0;

        function patchProp(prop) {
            var oldFn = _old[prop] = obj[prop];
            oldFn.restore = function () {
                obj[prop] = oldFn;
                delete oldFn.restore;
            };
            obj[prop] = function () {
                if (executingCount) {
                    return oldFn.apply(this, arguments);
                }
                executingCount++;
                try {
                    return patches[prop](oldFn, this, arguments);
                } finally {
                    executingCount--;
                }
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
            if (collapsedSetter) {
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


})
    (angular, $);