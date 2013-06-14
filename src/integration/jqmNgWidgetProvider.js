(function($, angular) {
    var ng = angular.module('ng'),
        execFlags = {};

    $.fn.orig = {};

    ng.provider("jqmNgWidget", ["$compileProvider", jqmNgWidgetProvider]);
    ng.run(["jqmNgWidget", function(jqmNgWidget) {
        jqmNgWidget._init();
    }]);

    enableDomManipDelegate("after");
    enableDomManipDelegate("before");
    enableDomManipDelegate("css", function(attrName, value) {
        // if the element is shown/hidden, delegate this to the wrapper
        // (see ng-show). Only catch the setter!
        return attrName === 'display' && arguments.length >= 2;
    });
    enableDomManipDelegate("remove");

    return;

    // --------------

    /**
     * @ngdoc object
     * @name ng.jqmNgWidgetProvider
     *
     * @description
     * Helper service for creating a custom directive for a jqm widget.
     * The provider contains a method for registering widgets,
     * and the service provides methods for refreshing the widget.
     */
    function jqmNgWidgetProvider($compileProvider) {
        var widgetDefs = {},
        widgetInstances = {};

        var provider = {
            /**
             * @name ng.jgmNgWidgetProvider#widget
             * @methodOf ng.jgmNgWidgetProvider
             *
             * @description
             * Registers a directive for a jqm widget.
             *
             * @param {string} widgetName jqm widget name, e.g. 'dialog'.
             * @param {function()} directive injectable function, that returns an object with the following properties:
             * <ul>
             * <li>{function(element)} precompile Optional will be called before angular compiles a html snippet.</li>
             * <li>{function(element)} preLink Optional will be called just like normal directives `preLink` function.
             * <li>{function(element)} link will be called just like normal directives `link`/`postLink` function.
             */
            widget: function(name, spec) {
                if (arguments.length === 1) {
                    return widgetDefs[name];
                }
                var override = !! widgetDefs[name];
                widgetDefs[name] = spec;
                if (!override) {
                    addJqmNgWidgetDirective(name, $compileProvider);
                }
            },
            $get: ["$injector", function($injector) {
                return {
                    lookup: function(widgetName) {
                        return widgetInstances[widgetName];
                    },
                    _init: function() {
                        var widgetName, widgetInstance;
                        for (widgetName in widgetDefs) {
                            widgetInstance = widgetInstances[widgetName] = $injector.invoke(widgetDefs[widgetName]);
                            patchJqmWidget(widgetName, widgetInstance);
                        }
                    },
                    preventJqmWidgetCreation: preventJqmWidgetCreation,
                    markJqmWidgetCreation: markJqmWidgetCreation,
                    patchJq: patchJq,
                    createWidget: function(widgetName, iElement, iAttrs) {
                        var initArgs = JSON.parse(iAttrs[calcDirectiveName(widgetName)]);
                        delegateDomManipToWrapper(function() {
                            $.fn.orig[widgetName].apply(iElement, initArgs);
                        }, iElement);
                    },
                    bindDefaultAttrsAndEvents: bindDefaultAttrsAndEvents,
                    bindDisabledAttribute: bindDisabledAttribute,
                    refreshAfterNgModelRender: refreshAfterNgModelRender,
                    refreshOnChildrenChange: refreshOnChildrenChange,
                    triggerAsyncRefresh: triggerAsyncRefresh
                };
            }]
        };

        return provider;
    }

    function calcDirectiveName(widgetName) {
        return "ngm" + widgetName[0].toUpperCase() + widgetName.substring(1);
    }

    function addJqmNgWidgetDirective(widgetName, $compileProvider) {
        var directiveName = calcDirectiveName(widgetName);
        $compileProvider.directive(directiveName, ["jqmNgWidget", directiveImpl]);
        return;

        function directiveImpl(jqmNgWidget) {
            return {
                restrict: 'A',
                // after the normal angular widgets like input, ngModel, ...
                priority: 0,
                require: ['?ngModel', '?select'],
                compile: function(tElement, tAttrs) {
                    var initArgs = JSON.parse(tAttrs[directiveName]);
                    return {
                        pre: function(scope, iElement, iAttrs, ctrls) {
                            var widgetSpec = jqmNgWidget.lookup(widgetName);
                            if (widgetSpec.preLink) {
                                widgetSpec.preLink(widgetName, scope, iElement, iAttrs, ctrls[0], ctrls[1]);
                            }
                        },
                        post: function(scope, iElement, iAttrs, ctrls) {
                            var widgetSpec = jqmNgWidget.lookup(widgetName);
                            widgetSpec.link(widgetName, scope, iElement, iAttrs, ctrls[0], ctrls[1]);
                        }
                    };
                }
            };
        }
    }

    function patchJqmWidget(widgetName, widgetInstance) {
        var widgetAttr = "data-ngm-" + widgetName;
        patchJq(widgetName, function() {
            if (markJqmWidgetCreation()) {
                var args = Array.prototype.slice.call(arguments);
                var self = this;
                for (var k = 0; k < self.length; k++) {
                    var element = self.eq(k);
                    if (widgetInstance && widgetInstance.precompile) {
                        widgetInstance.precompile(element, args);
                    }
                    element.attr(widgetAttr, JSON.stringify(args));
                }
            }
            if (preventJqmWidgetCreation()) {
                return false;
            }
            return $.fn.orig[widgetName].apply(this, arguments);
        });
    }

    function patchJq(fnName, callback) {
        $.fn.orig[fnName] = $.fn.orig[fnName] || $.fn[fnName];
        $.fn[fnName] = callback;
    }

    function execWithFlag(flag, fn) {
        if (!fn) {
            return execFlags[flag];
        }
        var old = execFlags[flag];
        execFlags[flag] = true;
        var res = fn();
        execFlags[flag] = old;
        return res;
    }

    function preventJqmWidgetCreation(fn) {
        return execWithFlag('preventJqmWidgetCreation', fn);
    }

    function markJqmWidgetCreation(fn) {
        return execWithFlag('markJqmWidgetCreation', fn);
    }

    function preventDomManipWrapper(fn) {
        return execWithFlag('preventDomManipWrapper', fn);
    }

    function delegateDomManipToWrapper(origCreate, element) {
        var oldParents = Array.prototype.slice.call(element.parents()),
            newParents,
            i, oldParent, newParent;

        oldParents.unshift(element[0]);
        preventDomManipWrapper(origCreate);
        newParents = Array.prototype.slice.call(element.parents());
        newParents.unshift(element[0]);

        for (i = 0; i < oldParents.length; i++) {
            oldParent = oldParents[oldParents.length - i - 1];
            newParent = newParents[newParents.length - i - 1];
            if (oldParent !== newParent) {
                $(oldParent).data("wrapperDelegate", $(newParent));
                break;
            }
        }
    }

    function enableDomManipDelegate(fnName, callFilter) {
        var old = $.fn[fnName];
        $.fn[fnName] = function() {
            if (enableDomManipDelegate.recurse || preventDomManipWrapper() || (callFilter && !callFilter.apply(this, arguments))) {
                return old.apply(this, arguments);
            }
            try {
                enableDomManipDelegate.recurse = true;
                var args = Array.prototype.slice.call(arguments),
                    delegate,
                    arg0 = args[0],
                    argDelegate;
                delegate = this.data("wrapperDelegate");
                if (delegate && fnName === 'remove') {
                    old.apply(this, arguments);
                }
                if (arg0 && typeof arg0.data === "function") {
                    argDelegate = arg0.data("wrapperDelegate");
                    args[0] = argDelegate || args[0];
                }
                return old.apply(delegate || this, args);
            } finally {
                enableDomManipDelegate.recurse = false;
            }
        };
    }

    function bindDefaultAttrsAndEvents(widgetName, scope, iElement, iAttrs, ngModelCtrl) {
        var widgetInstance = iElement.data($.mobile[widgetName].prototype.widgetFullName);
        if (!widgetInstance) {
            return;
        }
        if (widgetInstance.disable && widgetInstance.enable && (iAttrs.disabled || iAttrs.ngDisabled)) {
            bindDisabledAttribute(widgetName, iElement, iAttrs);
        }
        if (widgetInstance.refresh) {
            refreshOnChildrenChange(widgetName, scope, iElement);
            if (ngModelCtrl) {
                refreshAfterNgModelRender(widgetName, scope, iElement, ngModelCtrl);
            }
        }
    }

    function bindDisabledAttribute(widgetName, iElement, iAttrs) {
        iAttrs.$observe("disabled", function(value) {
            if (value) {
                iElement[widgetName]("disable");
            } else {
                iElement[widgetName]("enable");
            }
        });
    }

    function refreshAfterNgModelRender(widgetName, scope, iElement, ngModelCtrl) {
        addCtrlFunctionListener(ngModelCtrl, "$render", function() {
            triggerAsyncRefresh(widgetName, scope, iElement, "refresh");
        });
    }

    function addCtrlFunctionListener(ctrl, ctrlFnName, fn) {
        var listenersName = "_listeners" + ctrlFnName;
        if (!ctrl[listenersName]) {
            ctrl[listenersName] = [];
            var oldFn = ctrl[ctrlFnName];
            ctrl[ctrlFnName] = function() {
                var res = oldFn.apply(this, arguments);
                for (var i = 0; i < ctrl[listenersName].length; i++) {
                    ctrl[listenersName][i]();
                }
                return res;
            };
        }
        ctrl[listenersName].push(fn);
    }

    function refreshOnChildrenChange(widgetName, scope, iElement) {
        iElement.bind("$childrenChanged", function() {
            triggerAsyncRefresh(widgetName, scope, iElement, "refresh");
        });
    }

    function triggerAsyncRefresh(widgetName, scope, iElement, options) {
        var prop = "_refresh" + widgetName;
        var refreshId = (iElement.data(prop) || 0) + 1;
        iElement.data(prop, refreshId);
        scope.$root.$postDigestOne(function() {
            if (iElement.data(prop) === refreshId) {
                iElement[widgetName](options);
            }
        });
    }



})(window.jQuery, window.angular);