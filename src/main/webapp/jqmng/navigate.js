define(['jquery', 'angular'], function($, angular) {
    /*
     * Service for page navigation.
     * target has the syntax: [<transition>:]pageId
     */
    function navigate(target) {
        var parts = target.split(':');
        var animation, pageId;
        if (parts.length === 2 && parts[0] === 'back') {
            var relativeIndex = getIndexInStackAndRemoveTail(parts[1]);
            window.history.go(relativeIndex);
            return;
        } else if (parts.length === 2) {
            animation = parts[0];
            pageId = parts[1];
        } else {
            pageId = parts[0];
            animation = undefined;
        }
        if (pageId === 'back') {
            window.history.go(-1);
        } else {
            if (pageId.charAt(0) !== '#') {
                pageId = '#' + pageId;
            }
            $.mobile.changePage.call($.mobile, pageId, animation);
        }
    }

    angular.service('$navigate', function() {
        return navigate;
    });

    function getIndexInStackAndRemoveTail(pageId) {
        var stack = $.mobile.urlHistory.stack;
        var res = 0;
        var pageUrl;
        for (var i = stack.length - 2; i >= 0; i--) {
            pageUrl = stack[i].pageUrl;
            if (pageUrl === pageId) {
                var res = i - stack.length + 1;
                stack.splice(i + 1, stack.length - i);
                return res;
            }
        }
        return undefined;
    }

    /**
     * Helper function to put the navigation part out of the controller into the page.
     * @param scope
     */
    angular.Object.navigate = function(scope) {
        var service = scope.$service("$navigate");
        if (arguments.length === 2) {
            // used without the test.
            service(arguments[1]);
            return;
        }
        // parse the arguments...
        var test = arguments[1];
        var outcomes = {};
        var parts;
        for (var i = 2; i < arguments.length; i++) {
            parts = arguments[i].split(':');
            outcomes[parts[0]] = parts[1];
        }
        if (test && test.then) {
            // test is a promise.
            test.then(function(test) {
                if (outcomes[test]) {
                    service(outcomes[test]);
                } else if (outcomes.success) {
                    service(outcomes.success);
                }
            }, function(test) {
                if (outcomes[test]) {
                    service(outcomes[test]);
                } else  if (outcomes.failure) {
                    service(outcomes.failure);
                }
            });
        } else {
            if (outcomes[test]) {
                service(outcomes[test]);
            } else if (test !== false && outcomes.success) {
                service(outcomes.success);
            } else if (test === false && outcomes.failure) {
                service(outcomes.failure);
            }
        }
    };

    return navigate;

});