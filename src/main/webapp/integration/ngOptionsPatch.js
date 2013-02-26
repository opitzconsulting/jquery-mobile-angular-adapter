(function ($, angular) {
    // This is a copy of parts of angular's ngOptions directive to detect changes in the values
    // of ngOptions (emits the $childrenChanged event on the scope).
    // This is needed as ngOptions does not provide a way to listen to changes.

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
    var mod = angular.module('ng');
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
                    element.trigger("$childrenChanged");
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

                if( attr.role === 'slider' ) {
                    // Slider labels are create at widget creation and need to have the options
                    // available, do this here since default link step will empty the options

                    // Algorithm from angularjs Options()
                    var options = [];
                    var locals = {};
                    var values = valuesFn(scope) || [];
                    var keys = keyName ? sortedKeys(values) : values;
                    var length = keys.length;
                    for(var index = 0; index < length; index++) {

                        locals[valueName] = values[keyName ? locals[keyName]=keys:index];

                        var label = displayFn(scope, locals);
                        label = label === undefined ? '' : label;

                        var value = keyName ? keys[index] : index;

                        var opt = document.createElement('option');
                        opt.setAttribute("value", value);
                        opt.text = label;

                        options.push(opt);
                        element[0].appendChild(opt);
                    }

                    // We need to remove our options since Angular will blindly
                    // append the model options since it assumes that it is in
                    // full control
                    unregister = scope.$watch(function () {
                        for(var index = 0; index < length; index++){
                            element[0].removeChild(options[index]);
                        }
                        unregister();
                    });
                }
            }
        };
    }]);


})($, angular);
