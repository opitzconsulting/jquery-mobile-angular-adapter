(function($,angular) {
    var ng = angular.module('ng'),
        execFlags = {};

    $.fn.orig = {};

    ng.provider("jqmNgWidget", ["$compileProvider", jqmNgWidgetProvider]);
    ng.run(["jqmNgWidget", function(jqmNgWidget) {
        jqmNgWidget._init();
    }]);

    enableDomManipDelegate("after");
    enableDomManipDelegate("before");
    enableDomManipDelegate("remove");

    return;

    // --------------

    function jqmNgWidgetProvider($compileProvider) {
        var widgetDefs = {},
            widgetInstances = {};

        var provider = {
            widget: function(name, spec) {
                if (arguments.length===1) {
                    return widgetDefs[name];
                }
                widgetDefs[name] = spec;
                addJqmNgWidgetDirective(name, $compileProvider);
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
        return "ngm"+widgetName[0].toUpperCase()+widgetName.substring(1);
    }

    function addJqmNgWidgetDirective(widgetName, $compileProvider) {
        var directiveName = calcDirectiveName(widgetName);
        $compileProvider.directive(directiveName, ["jqmNgWidget", directiveImpl]);
        return;

        function directiveImpl(jqmNgWidget) {
            return {
                restrict:'A',
                // after the normal angular widgets like input, ngModel, ...
                priority:0,
                require:['?ngModel', '?select'],
                compile:function (tElement, tAttrs) {
                    var initArgs = JSON.parse(tAttrs[directiveName]);
                    return {
                        pre:function (scope, iElement, iAttrs, ctrls) {
                            var widgetSpec = jqmNgWidget.lookup(widgetName);
                            if (widgetSpec.preLink) {
                                widgetSpec.preLink(widgetName, scope, iElement, iAttrs, ctrls[0], ctrls[1]);
                            }
                        },
                        post:function (scope, iElement, iAttrs, ctrls) {
                            var widgetSpec = jqmNgWidget.lookup(widgetName);
                            widgetSpec.link(widgetName, scope, iElement, iAttrs, ctrls[0], ctrls[1]);
                        }
                    };
                }
            };
        }
    }

    function patchJqmWidget(widgetName, widgetInstance) {
        var widgetAttr = "data-ngm-"+widgetName;
        patchJq(widgetName, function () {
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

    function delegateDomManipToWrapper(origCreate, element) {
        var oldParents = Array.prototype.slice.call(element.parents()),
            newParents,
            i,oldParent, newParent;

        oldParents.unshift(element[0]);
        origCreate();
        newParents = Array.prototype.slice.call(element.parents());
        newParents.unshift(element[0]);

        for (i=0; i<oldParents.length; i++) {
            oldParent= oldParents[oldParents.length-i-1];
            newParent = newParents[newParents.length-i-1];
            if (oldParent!==newParent) {
                $(oldParent).data("wrapperDelegate", $(newParent));
                break;
            }
        }
    }

    function enableDomManipDelegate(fnName) {
        var old = $.fn[fnName];
        $.fn[fnName] = function() {
            var args = Array.prototype.slice.call(arguments),
                delegate,
                arg0 = args[0],
                argDelegate;
            delegate = this.data("wrapperDelegate");
            if (arg0 && typeof arg0.data === "function") {
                argDelegate = arg0.data("wrapperDelegate");
                args[0] = argDelegate || args[0];
            }
            return old.apply(delegate||this, args);
        };
    }

    function bindDefaultAttrsAndEvents(widgetName, scope, iElement, iAttrs, ngModelCtrl) {
        var widgetInstance = iElement.data(widgetName);
        if (!widgetInstance) {
            return;
        }
        if (widgetInstance.disable && widgetInstance.enable) {
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
        iAttrs.$observe("disabled", function (value) {
            if (value) {
                iElement[widgetName]("disable");
            } else {
                iElement[widgetName]("enable");
            }
        });
    }

    function refreshAfterNgModelRender(widgetName, scope, iElement, ngModelCtrl) {
        addCtrlFunctionListener(ngModelCtrl, "$render", function () {
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

    function refreshOnChildrenChange(widgetName, scope, iElement) {
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



})(window.jQuery, window.angular);