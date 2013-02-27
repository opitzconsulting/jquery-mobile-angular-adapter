(function (angular, $) {
    var widgetConfig = {
        checkboxradio:{
            precompile:checkboxRadioPrecompile,
            link:[checkboxRadioCreate, disabledHandler, refreshAfterNgModelRender, checkedHandler]
        },
        button:{
            precompile:buttonPrecompile,
            link:[buttonCreate, disabledHandler]
        },
        collapsible:{
            link:[defaultCreate, disabledHandler, collapsedHandler]
        },
        textinput:{
            link:[defaultCreate, disabledHandler],
        },
        slider:{
            link:[defaultCreate, disabledHandler, refreshAfterNgModelRender],
        },
        listview:{
            link:[defaultCreate, refreshOnChildrenChange]
        },
        collapsibleset:{
            link:[defaultCreate, refreshOnChildrenChange]
        },
        selectmenu:{
            link:[defaultCreate, disabledHandler, refreshAfterNgModelRender, refreshOnChildrenChange],
        },
        controlgroup:{
            link:[defaultCreate, refreshControlgroupOnChildrenChange]
        },
        navbar:{
            link:[defaultCreate, refreshOnChildrenChange]
        },
        dialog:{
            link:[dialogCreate],
            precompile:dialogPrecompile
        },
        fixedtoolbar:{
            link:[defaultCreate]
        },
        popup:{
            link:[defaultCreate]
        }
    };

    function mergeArrayFn(fnList) {
        return function () {
            for (var i = 0; i < fnList.length; i++) {
                fnList[i].apply(this, arguments);
            }
        }
    }

    var config;
    for (var widgetName in widgetConfig) {
        config = widgetConfig[widgetName];
        config.link = mergeArrayFn(config.link);
        $.mobile.registerJqmNgWidget(widgetName, config);
    }

    // -------------------
    // precompile and create functions
    function defaultCreate(widgetName, origCreate, scope, element) {
        delegateDomManipToWrapper(origCreate, element);
    }

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
    }

    function checkboxRadioCreate(widgetName, origCreate, scope, input) {
        var label = input.parent("label");
        if (label.length===0) {
            throw new Error("Don't use ng-repeat or other conditional directives on checkboxes/radiobuttons directly. Instead, wrap the input into a label and put the directive on that input!");
        }
        delegateDomManipToWrapper(origCreate, label);
    }

    function buttonPrecompile(origElement, initArgs) {
        // Add a text node with the value content,
        // as we need a text node later in the jqm button markup!
        if (origElement[0].nodeName === 'INPUT') {
            var value = origElement.val();
            origElement.append(document.createTextNode(value));
        }
    }

    function buttonCreate(widgetName, origCreate, scope, element) {
        // Button destroys the text node and recreates a new one. This does not work
        // if the text node contains angular expressions, so we move the
        // text node to the right place.
        var textNode = element.contents();
        delegateDomManipToWrapper(origCreate, element);
        var textSpan = element.parent().find(".ui-btn-text");
        textSpan.empty();
        textSpan.append(textNode);
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
    }

    function dialogCreate(widgetName, origCreate, scope, element) {
        origCreate();
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
    function disabledHandler(widgetName, origCreate, scope, iElement, iAttrs, ctrls) {
        iAttrs.$observe("disabled", function (value) {
            if (value) {
                iElement[widgetName]("disable");
            } else {
                iElement[widgetName]("enable");
            }
        });
    }

    function collapsedHandler(widgetName, origCreate, scope, iElement, iAttrs, ctrls, $inject) {
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

    function checkedHandler(widgetName, origCreate, scope, iElement, iAttrs, ctrls) {
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

    function refreshAfterNgModelRender(widgetName, origCreate, scope, iElement, iAttrs, ctrls) {
        var ngModelCtrl = ctrls[0];
        if (ngModelCtrl) {
            addCtrlFunctionListener(ngModelCtrl, "$render", function () {
                triggerAsyncRefresh(widgetName, scope, iElement, "refresh");
            });
        }
    }

    function refreshControlgroupOnChildrenChange(widgetName, origCreate, scope, iElement, iAttrs, ctrls) {
        iElement.bind("$childrenChanged", function () {
            triggerAsyncRefresh(widgetName, scope, iElement, {});
        });
    }


    function refreshOnChildrenChange(widgetName, origCreate, scope, iElement, iAttrs, ctrls) {
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
    function delegateDomManipToWrapper(origCreate, element) {
        var oldParent = element.parent(),
            upperElement = element;

        origCreate();
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
            var delegate,
                arg0 = arguments[0],
                argDelegate;
            if (replaceThis) {
                delegate = this.data("wrapperDelegate");
            }
            if (arg0 && typeof arg0.data === "function") {
                argDelegate = arg0.data("wrapperDelegate");
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