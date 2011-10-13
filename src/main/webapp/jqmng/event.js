define(['angular'], function(angular) {
    /* A widget for clicks.
     * Just as ng:click, but reacts to the jquery mobile vclick event, which
     * includes taps, mousedowns, ...
     */
    angular.directive("ngm:click", function(expression, element) {
        return angular.directive('ngm:event')('{vclick:"' + expression+'"}', element);
    });

    /**
     * A widget to bind general events like touches, ....
     */
    angular.directive("ngm:event", function(expression, element) {
        var eventHandlers = angular.fromJson(expression);

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
});