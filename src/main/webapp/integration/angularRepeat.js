(function ($, angular) {
    /**
     * Modify the original repeat: Make sure that all elements are added under the same parent.
     * This is important, as some jquery mobile widgets wrap the elements into new elements,
     * and angular just uses element.after().
     * See angular issue 831
     */
    function instrumentNodeForNgRepeat(scope, parent, node, fnName) {
        var _old = node[fnName];
        node[fnName] = function (otherNode) {
            var target = this;
            while (target.parent()[0] !== parent) {
                target = target.parent();
                if (target.length === 0) {
                    throw new Error("Could not find the expected parent in the node path", this, parent);
                }
            }
            instrumentNodeForNgRepeat(scope, parent, otherNode, fnName);
            var res = _old.call(target, otherNode);
            scope.$emit("$childrenChanged");
            return res;
        };
    }

    var mod = angular.module('ng');
    mod.directive('ngRepeat', function () {
        return {
            priority:1000, // same as original repeat
            compile:function (element, attr, linker) {
                return {
                    pre:function (scope, iterStartElement, attr) {
                        instrumentNodeForNgRepeat(scope, iterStartElement.parent()[0], iterStartElement, 'after');
                    }
                };
            }
        };
    });
})(window.jQuery, window.angular);