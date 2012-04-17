(function (angular) {
    /*
     * Defines the ng:if tag. This is useful if jquery mobile does not allow
     * an ng:switch element in the dom, e.g. between ul and li.
     * Uses ng:repeat and angular.Object.iff under the hood.
     */
    var mod = angular.module('ng');
    var ngIfDirective = {
        transclude: 'element',
        priority: 1000,
        terminal: true,
        compile: function(element, attr, linker) {
            return function(scope, iterStartElement, attr){
                var expression = attr.ngmIf;

                var lastElement;
                var lastScope;
                scope.$watch(expression, function(newValue){
                        if (newValue) {
                            lastScope = scope.$new();
                            linker(lastScope, function(clone){
                                lastElement = clone;
                                iterStartElement.after(clone);
                            });
                        } else {
                            lastElement && lastElement.remove();
                            lastScope && lastScope.$destroy();
                        }
                    });
            };
        }
    };
    mod.directive('ngmIf', function() { return ngIfDirective; });
})(window.angular);
