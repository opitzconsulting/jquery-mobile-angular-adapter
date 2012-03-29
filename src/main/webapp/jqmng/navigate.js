jqmng.define('jqmng/navigate', ['jquery', 'angular'], function($, angular) {
    function splitAtFirstColon(value) {
        var pos = value.indexOf(':');
        if (pos===-1) {
            return [value];
        }
        return [
            value.substring(0, pos),
            value.substring(pos+1)
        ];
    }

    function callActivateFnOnPageChange(fnName, params) {
        if (fnName) {
            $(document).one("pagebeforechange", function(event, data) {
                var toPageUrl = $.mobile.path.parseUrl( data.toPage );
                var page = $("#"+toPageUrl.hash.substring(1));
                function executeCall() {
                    var scope = page.scope();
                    scope[fnName].apply(scope, params);
                }
                if (!page.data("page")) {
                    page.one("pagecreate", executeCall);
                    return;
                }
                executeCall();
            });
        }
    }

    /*
     * Service for page navigation.
     * @param target has the syntax: [<transition>:]pageId
     * @param activateFunctionName Function to call in the target scope.
     * @param further params Parameters for the function that should be called in the target scope.
     */
    function navigate(target, activateFunctionName) {
        var activateParams = Array.prototype.slice.call(arguments, 2);
        var navigateOptions, pageId;
        callActivateFnOnPageChange(activateFunctionName, activateParams);
        if (typeof target === 'object') {
            navigateOptions = target;
            pageId = navigateOptions.target;
        } else {
            var parts = splitAtFirstColon(target);
            if (parts.length === 2 && parts[0] === 'back') {
                var pageId = parts[1];
                var relativeIndex = getIndexInStack(pageId);
                if (relativeIndex === undefined) {
                    pageId = jqmChangePage(pageId, {reverse: true});
                } else {
                    window.history.go(relativeIndex);
                }
                return;
            } else if (parts.length === 2) {
                navigateOptions = { transition: parts[0] };
                pageId = parts[1];
            } else {
                pageId = parts[0];
                navigateOptions = undefined;
            }
        }
        if (pageId === 'back') {
            window.history.go(-1);
        } else {
            jqmChangePage(pageId, navigateOptions);
        }
    }

    function jqmChangePage(pageId, navigateOptions) {
        var callArgs = [pageId];
        if (navigateOptions) {
            callArgs.push(navigateOptions);
        }
        $.mobile.changePage.apply($.mobile, callArgs);
        return pageId;
    }


    var mod = angular.module('ng');
    mod.factory('$navigate', function() {
        return navigate;
    });

    function getIndexInStack(pageId) {
        var stack = $.mobile.urlHistory.stack;
        var res = 0;
        var pageUrl;
        for (var i = stack.length - 2; i >= 0; i--) {
            pageUrl = stack[i].pageUrl;
            if (pageUrl === pageId) {
                return i - stack.length + 1;
            }
        }
        return undefined;
    }

    mod.run(['$rootScope', '$navigate', function($rootScope, $navigate) {
        $rootScope.$navigate = function() {
            var args = Array.prototype.slice.call(arguments);
            args.unshift($navigate);
            return navigateExpression.apply(this, args);
        }
    }]);

    mod.filter('navigate', ['$navigate', function($navigateService) {
        return function(test) {
            // parse the arguments...
            var outcomes = {};
            var parts;
            for (var i = 1; i < arguments.length; i++) {
                parts = splitAtFirstColon(arguments[i]);
                outcomes[parts[0]] = parts[1];
            }
            if (test && test.then) {
                // test is a promise.
                test.then(function(test) {
                    if (outcomes[test]) {
                        $navigateService(outcomes[test]);
                    } else if (outcomes.success) {
                        $navigateService(outcomes.success);
                    }
                }, function(test) {
                    if (outcomes[test]) {
                        $navigateService(outcomes[test]);
                    } else if (outcomes.failure) {
                        $navigateService(outcomes.failure);
                    }
                });
            } else {
                if (outcomes[test]) {
                    $navigateService(outcomes[test]);
                } else if (test !== false && outcomes.success) {
                    $navigateService(outcomes.success);
                } else if (test === false && outcomes.failure) {
                    $navigateService(outcomes.failure);
                }
            }
        };
    }]);

    return navigate;

});