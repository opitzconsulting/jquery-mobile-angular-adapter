(function (angular) {
    /**
     * Modify the original switch: Make sure that all elements are removed, even if they
     * wrap themselves into new elements.
     * See angular issue 831
     */
    function instrumentNodeForNgSwitch(parent, node) {
        function correctDomNode(jqElement) {
            var target = jqElement[0];
            while (target.parentNode !== parent[0]) {
                target = target.parentNode;
                if (!target) {
                    throw new Error("Could not find the expected parent in the node path", this, parent);
                }
            }
            jqElement[0] = target;
        }

        var _oldAppend = node.append;
        node.append = function (childNode) {
            var _oldRemove = childNode.remove;
            childNode.remove = function() {
                correctDomNode(this);
                return _oldRemove.apply(this, arguments);
            };

            return _oldAppend.apply(this, arguments);
        };

    }

    var ng = angular.module("ng");
    ng.directive("ngSwitch",
        function () {
            return {
                restrict:'EA',
                compile:function (element, attr) {
                    var watchExpr = attr.ngSwitch || attr.on;
                    return function (scope, element) {
                        instrumentNodeForNgSwitch(element, element);
                        scope.$watch(watchExpr, function (value) {
                            element.trigger("$childrenChanged");
                        });
                    }
                }
            }
        });
})(window.angular);