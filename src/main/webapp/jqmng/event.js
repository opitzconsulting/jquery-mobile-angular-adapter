define(['angular'], function(angular) {
    /* A widget for clicks.
     * Just as ng:click, but reacts to the jquery mobile vclick event, which
     * includes taps, mousedowns, ...
     */
    angular.directive("ngm:click", function(expression, element) {
        return angular.directive('ngm:event')('{vclick:"' + expression + '"}', element);
    });

    /**
     * A widget to bind general events like touches, ....
     */
    angular.directive("ngm:event", function(expression, element) {
        var eventHandlers = angular.fromJson(expression);

        var linkFn = function($updateView, element) {
            for (var eventType in eventHandlers) {
                registerEventHandler(this, $updateView, element, eventType, eventHandlers[eventType]);
            }
        };
        linkFn.$inject = ['$updateView'];
        return linkFn;
    });

    function registerEventHandler(scope, $updateView, element, eventType, handler) {
        element.bind(eventType, function(event) {
            var res = scope.$tryEval(handler, element);
            $updateView();
            if (eventType.charAt(0) == 'v') {
                // This is required to prevent a second
                // click event, see
                // https://github.com/jquery/jquery-mobile/issues/1787
                event.preventDefault();
            }
        });
    }

    function createEventDirective(directive, eventType) {
        angular.directive('ngm:' + directive, function(eventHandler) {
            var linkFn = function($updateView, element) {
                registerEventHandler(this, $updateView, element, eventType, eventHandler);
            };
            linkFn.$inject = ['$updateView'];
            return linkFn;
        });
    }

    var eventDirectives = {taphold:'taphold',swipe:'swipe', swiperight:'swiperight',
        swipeleft:'swipeleft',
        pagebeforeshow:'pagebeforeshow',
        pagebeforehide:'pagebeforehide',
        pageshow:'pageshow',
        pagehide:'pagehide',
        click:'vclick'
    };
    for (var directive in eventDirectives) {
        createEventDirective(directive, eventDirectives[directive])
    }

});