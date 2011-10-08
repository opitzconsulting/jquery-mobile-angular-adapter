/**
 * Helper functions for proxying jquery widgets and angular widgets.
 */
define(['jquery', 'angular', 'jqmng/globalScope'], function($, angular, globalScope) {
    /**
     * Creates a proxy around an existing angular widget.
     * Needed to use the angular functionalities like disabled handling,
     * invalidWidgets marking, formatting and validation.
     * @param tagname
     * @param compileFn
     */
    function createAngularWidgetProxy(tagname, compileFn) {

        var oldWidget = angular.widget(tagname);
        angular.widget(tagname, function() {
            var oldBinder;
            var bindFn = compileFn.apply(this, arguments);
            var newBinder = function() {
                var elementArgumentPos = (oldBinder && oldBinder.$inject && oldBinder.$inject.length) || 0;
                var element = arguments[elementArgumentPos];
                var self = this;
                var myargs = arguments;
                var oldBinderCalled = false;
                var res;
                if (bindFn) {
                    res = bindFn.call(this, element, function() {
                        oldBinderCalled = true;
                        return oldBinder && oldBinder.apply(self, myargs);
                    });
                }
                if (!oldBinderCalled) {
                    return oldBinder && oldBinder.apply(self, myargs);
                }
                return res;
            }
            // execute the angular compiler after our compiler!
            oldBinder = oldWidget && oldWidget.apply(this, arguments);
            if (!oldWidget) {
                this.descend(true);
                this.directives(true);
            }

            newBinder.$inject = oldBinder && oldBinder.$inject;
            return newBinder;
        });
    }

    /**
     * Creates a proxy around an existing angular directive.
     * Needed e.g. to intercept the disabled handling, ...
     * @param directiveName
     * @param compileFn
     */
    function createAngularDirectiveProxy(directiveName, compileFn) {
        var oldDirective = angular.directive(directiveName);
        angular.directive(directiveName, function(expression) {
            var oldBinder = oldDirective.apply(this, arguments);
            var bindFn = compileFn(expression);
            var newBinder = function() {
                var elementArgumentPos = (oldBinder.$inject && oldBinder.$inject.length) || 0;
                var element = arguments[elementArgumentPos];
                var scope = this;
                var res = oldBinder.apply(this, arguments);
                bindFn.call(this, element);
                return res;
            }
            newBinder.$inject = oldBinder.$inject;
            return newBinder;
        });
    }

    var afterCompileQueue = [];

    function executeAfterCompileQueue() {
        while (afterCompileQueue.length>0) {
            var callback = afterCompileQueue.shift();
            callback();
        }
    }

    function afterCompile(callback) {
        afterCompileQueue.push(callback);
    }

    var fireJqmCreateEventList = [];

    function fireJqmCreateEvents() {
        // Fire the event for the parents. Needed by jquery mobile to work.
        // Fire the event for every parent only once...
        var parents = [], element, parent;
        for (var i=0; i<fireJqmCreateEventList.length; i++) {
            element = fireJqmCreateEventList[i];
            parent = element.parent();
            if (!parent.fireJqmCreateEvents) {
                parents.push(parent);
                parent.fireJqmCreateEvents = true;
            }
        }
        for (var i=0; i<parents.length; i++) {
            parent = parents[i];
            delete parent.fireJqmCreateEvents;
            $(parent).trigger('create');
        }

        fireJqmCreateEventList = [];
    }

    function fireJqmCreateEvent(element) {
        fireJqmCreateEventList.push(element);
    }

    globalScope.onCreate(function(scope) {
        scope.$onEval(99999, function() {
            executeAfterCompileQueue();
            fireJqmCreateEvents();
        });
    });


    return {
        createAngularDirectiveProxy: createAngularDirectiveProxy,
        createAngularWidgetProxy: createAngularWidgetProxy,
        afterCompile: afterCompile,
        fireJqmCreateEvent: fireJqmCreateEvent
    }
});