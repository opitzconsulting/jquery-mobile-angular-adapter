define(['angular'], function(angular) {
    /* A widget for clicks.
     * Just as ng:click, but reacts to the jquery mobile vclick event, which
     * includes taps, mousedowns, ...
     */
    angular.directive("ngm:click", function(expression, element) {
        return angular.directive('ng:event')('vclick:' + expression, element);
    });

    /* A widget to bind general events like touches, ....
     */
    angular.directive("ng:event", function(expression, element) {
        var eventHandlers = {};
        var pattern = /(.*?):(.*?)($|,)/g;
        var match;
        var hasData = false;
        while (match = pattern.exec(expression)) {
            hasData = true;
            var event = match[1];
            var handler = match[2];
            eventHandlers[event] = handler;
        }
        if (!hasData) {
            throw "Expression " + expression + " needs to have the syntax <event>:<handler>,...";
        }

        var linkFn = function($updateView, element) {
            var self = this;
            for (var eventType in eventHandlers) {
                    (function(eventType) {
                        var handler = eventHandlers[eventType];
                        element.bind(eventType, function(event) {
                            var res = self.$tryEval(handler, element);
                            $updateView();
                            if (eventType.charAt(0)=='v') {
                                // This is required to prevent a second
                                // click event, see
                                // https://github.com/jquery/jquery-mobile/issues/1787
                                event.preventDefault();
                            }
                        });
                    })(eventType);
            }
        };
        linkFn.$inject = ['$updateView'];
        return linkFn;
    });

    /* A widget that reacts when the user presses the enter key.
     */
    angular.directive("ng:enterkey", function(expression, element) {
        var linkFn = function($updateView, element) {
            var self = this;
            element.bind('keypress', function(e) {
                var key = e.keyCode || e.which;
                if (key == 13) {
                    var res = self.$tryEval(expression, element);
                    $updateView();
                }
            });
        };
        linkFn.$inject = ['$updateView'];
        return linkFn;
    });
});