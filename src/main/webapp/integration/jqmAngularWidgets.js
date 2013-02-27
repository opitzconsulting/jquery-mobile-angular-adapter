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
            create:delegateDomManipToWrapper
        },
        slider:{
            handlers:[disabledHandler, refreshAfterNgModelRender],
            create:delegateDomManipToWrapper
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
            create:delegateDomManipToWrapper
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
    function checkboxRadioPrecompile(origElement, initArgs) {
        // wrap the input temporarily into it's label (will be undone by the widget).
        // By this, the jqm widget will always
        // use this label, even if there are other labels with the same id on the same page.
        // This is important if we use ng-repeat on checkboxes, as this could
        // create multiple checkboxes with the same id!
        // This needs to be done in the precompile, as otherwise angular compiler could get into trouble
        // when input and label are siblings!
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
            label.append(origElement);
        }
        return origElement;
    }

    function checkboxRadioCreate(origCreate, input, initArgs) {
        var label = input.parent("label");
        if (label.length===0) {
            throw new Error("Don't use ng-repeat or other conditional directives on checkboxes/radiobuttons directly. Instead, wrap the input into a label and put the directive on that input!");
        }
        return delegateDomManipToWrapper(function() {
            return origCreate.apply(input, arguments);
        }, label, initArgs);
    }

    function buttonPrecompile(origElement, initArgs) {
        // Add a text node with the value content,
        // as we need a text node later in the jqm button markup!
        if (origElement[0].nodeName === 'INPUT') {
            var value = origElement.val();
            origElement.append(document.createTextNode(value));
        }
        return origElement;
    }

    function buttonCreate(origCreate, element, initArgs) {
        // Button destroys the text node and recreates a new one. This does not work
        // if the text node contains angular expressions, so we move the
        // text node to the right place.
        var textNode = element.contents();
        var res = delegateDomManipToWrapper(origCreate, element, initArgs);
        var textSpan = res.find(".ui-btn-text");
        textSpan.empty();
        textSpan.append(textNode);
        return res;
    }

    // Dialog: separate event binding and dom enhancement.
    // Note: We do need to add the close button during precompile,
    // as the enhancement for the dialog header depends on it (calculation which button is left, right, ...),
    // and that is executed when we create the page widget, which is before the dialog widget is created :-(
    // We cannot adjust the timing of the header enhancement as it is no jqm widget.
    function dialogPrecompile(origElement, initAttrs) {
        var options = $.mobile.dialog.prototype.options;
        var headerCloseButton = $("<a href='#' data-" + $.mobile.ns + "icon='delete' data-" + $.mobile.ns + "iconpos='notext'>" + options.closeBtnText + "</a>");
        origElement.find(":jqmData(role='header')").prepend(headerCloseButton);
        origElement.data('headerCloseButton', headerCloseButton);
        return origElement;
    }

    function dialogCreate(origCreate, element, initArgs) {
        origCreate.apply(element, initArgs);
        // add handler to enhanced close button manually (the one we added in precompile),
        // and remove the other close button (the one the widget created).
        var closeButtons = element.find(':jqmData(role="header") :jqmData(icon="delete")');
        closeButtons.eq(1).bind("click", function() {
            element.dialog("close");
        });
        closeButtons.eq(0).remove();
    }

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

    // ----------------
    // helper
    function delegateDomManipToWrapper(origCreate, element, initArgs) {
        var oldParent = element.parent();
        origCreate.apply(element, initArgs);
        var upperElement = element;
        while (upperElement.length && upperElement.parent()[0]!==oldParent[0]) {
            upperElement = upperElement.parent();
        }
        if (upperElement!==element) {
            element.data("wrapperDelegate", upperElement);
        }
        return upperElement;
    }

    function enableDomManipDelegate(fnName, replaceThis) {
        var old = $.fn[fnName];
        $.fn[fnName] = function() {
            var delegate;
            if (replaceThis) {
                delegate = this.data("wrapperDelegate");
            }
            var arg0 = arguments[0];
            if (arg0 && typeof arg0.data === "function") {
                var argDelegate = arg0.data("wrapperDelegate");
                arguments[0] = argDelegate || arguments[0];
            }
            return old.apply(delegate||this, arguments);
        };
    }
    enableDomManipDelegate("after", true);
    enableDomManipDelegate("before", true);
    enableDomManipDelegate("remove", true);
    enableDomManipDelegate("append", false);
    enableDomManipDelegate("prepend", false);

})(angular, $);