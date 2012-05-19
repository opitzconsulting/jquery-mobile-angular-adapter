(function ($, angular) {
    /**
     * Modify the original repeat: Make sure that all elements are added under the same parent.
     * This is important, as some jquery mobile widgets wrap the elements into new elements,
     * and angular just uses element.after().
     * See angular issue 831
     */
    function instrumentNodeForNgRepeat(referenceElement, node) {
        function correctDomNode(jqElement) {
            var target = jqElement[0];
            var parent = referenceElement[0].parentNode;
            while (target.parentNode !== parent) {
                target = target.parentNode;
                if (!target) {
                    throw new Error("Could not find the expected parent in the node path", this, parent);
                }
            }
            jqElement[0] = target;
        }

        var _oldAfter = node.after;
        node.after = function (otherNode) {
            correctDomNode(this);
            instrumentNodeForNgRepeat(referenceElement, otherNode);
            return _oldAfter.apply(this, arguments);
        };

        var _oldRemove = node.remove;
        node.remove = function() {
            correctDomNode(this);
            return _oldRemove.apply(this, arguments);
        }
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
                        instrumentNodeForNgRepeat(iterStartElement, iterStartElement);
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
                            // Note: need to be parent() as jquery cannot trigger events on comments
                            // (angular creates a comment node when using transclusion, as ng-repeat does).
                            iterStartElement.parent().trigger("$childrenChanged");
                        });
                    }
                };
            }
        };
    });
})(window.jQuery, window.angular);