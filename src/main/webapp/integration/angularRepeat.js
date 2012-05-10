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
            return res;
        };
    }

    function shallowEquals(collection1, collection2) {
        if (!!collection1 ^ !!collection2) {
            return false;
        }
        for (var x in collection1) {
            if (collection2[x] !== collection1[x]) {
                return false;
            }
        }
        for (var x in collection2) {
            if (collection2[x] !== collection1[x]) {
                return false;
            }
        }
        return true;
    }

    function shallowClone(collection) {
        if (!collection) {
            return collection;
        }
        var res;
        if (collection.length) {
            res = [];
        } else {
            res = {};
        }
        for (var x in collection) {
            res[x] = collection[x];
        }
        return res;
    }

    var mod = angular.module('ng');
    mod.directive('ngRepeat', function () {
        return {
            priority:1000, // same as original repeat
            compile:function (element, attr, linker) {
                return {
                    pre:function (scope, iterStartElement, attr) {
                        instrumentNodeForNgRepeat(scope, iterStartElement.parent()[0], iterStartElement, 'after');
                        var expression = attr.ngRepeat;
                        var match = expression.match(/^.+in\s+(.*)\s*$/);
                        if (!match) {
                            throw Error("Expected ngRepeat in form of '_item_ in _collection_' but got '" +
                                expression + "'.");
                        }
                        var collectionExpr = match[1];
                        var lastCollection;
                        var changeCounter = 0;
                        scope.$watch(function () {
                            var collection = scope.$eval(collectionExpr);
                            if (!shallowEquals(collection, lastCollection)) {
                                lastCollection = shallowClone(collection);
                                changeCounter++;
                            }
                            return changeCounter;
                        }, function () {
                            scope.$emit("$childrenChanged");
                        });
                    }
                };
            }
        };
    });
})(window.jQuery, window.angular);