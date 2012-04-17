(function ($, angular) {

    /**
     * Modify the original repeat: Make sure that all elements are added under the same parent.
     * This is important, as some jquery mobile widgets wrap the elements into new elements,
     * and angular just uses element.after().
     * See angular issue TODO
     */
    function instrumentNodeFunction(parent, node, fnName) {
        var _old = node[fnName];
        node[fnName] = function (otherNode) {
            var target = this;
            while (target.parent()[0] !== parent) {
                target = target.parent();
                if (target.length === 0) {
                    throw new Error("Could not find the expected parent in the node path", this, parent);
                }
            }
            instrumentNode(parent, otherNode);
            return _old.call(target, otherNode);
        };
    }

    function instrumentNode(parent, node) {
        var fns = ['after', 'before'];
        for (var i = 0; i < fns.length; i++) {
            instrumentNodeFunction(parent, node, fns[i]);
        }
    }

    var mod = angular.module('ng');
    mod.directive('ngRepeat', function () {
        return {
            priority:1000, // same as original repeat
            compile:function (element, attr, linker) {
                return {
                    pre:function (scope, iterStartElement, attr) {
                        instrumentNode(iterStartElement.parent()[0], iterStartElement);
                    }
                };
            }
        };
    });

})(window.jQuery, window.angular);