(function(angular) {
    // TODO refactor this: Create a config for every jqm widget...

    var ng = angular.module("ng");
    ng.config(["$compileProvider", function($compileProvider) {
        $compileProvider.parseSelectorAndRegisterJqmWidget('button', function (scope, iElement, iAttrs) {
            disabledHandling('button', scope, iElement, iAttrs);

        });
        $compileProvider.parseSelectorAndRegisterJqmWidget('collapsible', function (scope, iElement, iAttrs) {
            disabledHandling('collapsible', scope, iElement, iAttrs);

        });

        $compileProvider.parseSelectorAndRegisterJqmWidget('textinput', function (scope, iElement, iAttrs) {
            disabledHandling('textinput', scope, iElement, iAttrs);

        });

        $compileProvider.parseSelectorAndRegisterJqmWidget('checkboxradio', function (scope, iElement, iAttrs, ctrls) {
            disabledHandling('checkboxradio', scope, iElement, iAttrs);
            refreshOnNgModelRender('checkboxradio', iElement, ctrls);

        });
        $compileProvider.parseSelectorAndRegisterJqmWidget('slider', function (scope, iElement, iAttrs, ctrls) {
            disabledHandling('slider', scope, iElement, iAttrs);
            refreshOnNgModelRender('slider', iElement, ctrls);

        });

        $compileProvider.parseSelectorAndRegisterJqmWidget('listview', function (scope, iElement, iAttrs, ctrls) {
            refreshOnChildrenChange('listview', scope, iElement);
        });

        $compileProvider.parseSelectorAndRegisterJqmWidget('collapsibleset', function (scope, iElement, iAttrs, ctrls) {
            refreshOnChildrenChange('collapsibleset', scope, iElement);
        });

        $compileProvider.parseSelectorAndRegisterJqmWidget('selectmenu', function (scope, iElement, iAttrs, ctrls) {
            disabledHandling('selectmenu', scope, iElement, iAttrs);
            refreshOnNgModelRender('selectmenu', iElement, ctrls);
            refreshOnChildrenChange('selectmenu', scope, iElement);
        });
    }]);

    function disabledHandling(widget, scope, iElement, iAttrs) {
        iAttrs.$observe("disabled", function (value) {
            if (value) {
                iElement[widget]("disable");
            } else {
                iElement[widget]("enable");
            }
        });
    }

    function addCtrlFunctionListener(ctrl, ctrlFnName, fn) {
        var listenersName = "_listeners"+ctrlFnName;
        if (!ctrl[listenersName]) {
            ctrl[listenersName] = [];
            var oldFn = ctrl[ctrlFnName];
            ctrl[ctrlFnName] = function() {
                var res = oldFn.apply(this, arguments);
                for (var i=0; i<ctrl[listenersName].length; i++) {
                    ctrl[listenersName][i]();
                }
                return res;
            };
        }
        ctrl[listenersName].push(fn);
    }

    function refreshOnNgModelRender(widget, iElement, ctrls) {
        var ngModelCtrl = ctrls[0];
        if (ngModelCtrl) {
            addCtrlFunctionListener(ngModelCtrl, "$render", function() {
                iElement[widget]("refresh");
            });
        }
    }

    function refreshOnChildrenChange(widget, scope, iElement) {
        scope.$on("$childrenChanged", function() {
            triggerRefresh(widget, scope, iElement);
        });
    }

    function evalAsync(scope, callback) {
        // Note: We cannot use scope.$evalAsync here due to a bug:
        // See https://github.com/angular/angular.js/issues/947
        if (!scope._patchedEvalAsync) {
            var state = scope._patchedEvalAsync = {changeCount: 0, queue: []};
            scope.$watch('_patchedEvalAsync.changeCount', function() {
                while (state.queue.length) {
                    state.queue.pop()();
                }
            });
        }
        scope._patchedEvalAsync.queue.push(callback);
        scope._patchedEvalAsync.changeCount++;
    }

    function triggerRefresh(widget, scope, iElement) {
        scope.refreshCount = scope.refreshCount+1 || 1;
        evalAsync(scope, function() {
            scope.refreshCount--;
            if (scope.refreshCount===0) {
                iElement[widget]("refresh");
            }
        });
    }


})(window.angular);