(function ($, angular) {

    function watchJQueryDomChangesInSubtree(element, callback) {
        for (var fnName in jqFnWatchers) {
            jqFnWatchers[fnName](element, fnName, callback);
        }
    }

    var jqFnWatchers = {
        append: watchDomAddingFn,
        after: watchAttributeChangingFn,
        text: watchAttributeChangingFn,
        val: watchAttributeChangingFn,
        prop: watchAttributeChangingFn,
        attr: watchAttributeChangingFn,
        remove: watchAttributeChangingFn
    };

    function watchDomAddingFn(node, fnName, callback) {
        var _old = node[fnName];
        node[fnName] = function (otherNode) {
            watchJQueryDomChangesInSubtree(otherNode, callback);
            var res = _old.apply(this, arguments);
            callback();
            return res;
        };
    }

    function watchAttributeChangingFn(node, fnName, callback) {
        var _old = node[fnName];
        node[fnName] = function (otherNode) {
            var res = _old.apply(this, arguments);
            callback();
            return res;
        };
    }


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

    function sortedKeys(obj) {
        var keys = [];
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                keys.push(key);
            }
        }
        return keys.sort();
    }

    var NG_OPTIONS_REGEXP = /^\s*(.*?)(?:\s+as\s+(.*?))?(?:\s+group\s+by\s+(.*))?\s+for\s+(?:([\$\w][\$\w\d]*)|(?:\(\s*([\$\w][\$\w\d]*)\s*,\s*([\$\w][\$\w\d]*)\s*\)))\s+in\s+(.*)$/;
    mod.directive('ngOptions', ['$parse', function ($parse) {
        return {
            require: ['select', '?ngModel'],
            link:function (scope, element, attr, ctrls) {
                // if ngModel is not defined, we don't need to do anything
                if (!ctrls[1]) return;

                var match;
                var optionsExp = attr.ngOptions;

                if (! (match = optionsExp.match(NG_OPTIONS_REGEXP))) {
                    throw Error(
                        "Expected ngOptions in form of '_select_ (as _label_)? for (_key_,)?_value_ in _collection_'" +
                            " but got '" + optionsExp + "'.");
                }

                var displayFn = $parse(match[2] || match[1]),
                    valueName = match[4] || match[6],
                    keyName = match[5],
                    groupByFn = $parse(match[3] || ''),
                    valueFn = $parse(match[2] ? match[1] : valueName),
                    valuesFn = $parse(match[7]);

                scope.$watch(optionsModel, function() {
                    scope.$emit("$childrenChanged");
                    console.log("now");
                }, true);

                function optionsModel() {
                    var optionGroups = [], // Temporary location for the option groups before we render them
                        optionGroupName,
                        values = valuesFn(scope) || [],
                        keys = keyName ? sortedKeys(values) : values,
                        length,
                        index,
                        locals = {};

                    // We now build up the list of options we need (we merge later)
                    for (index = 0; length = keys.length, index < length; index++) {
                        var value = values[index];
                        locals[valueName] = values[keyName ? locals[keyName]=keys[index]:index];
                        optionGroupName = groupByFn(scope, locals);
                        optionGroups.push({
                            id: keyName ? keys[index] : index,   // either the index into array or key from object
                            label: displayFn(scope, locals), // what will be seen by the user
                            optionGroup: optionGroupName
                        });
                    }
                    return optionGroups;
                }
            }
        };
    }]);


})(window.jQuery, window.angular);