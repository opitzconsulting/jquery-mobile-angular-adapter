(function (angular) {
    var mod = angular.module('ng');

    function registerEventHandler(scope, $parse, element, eventType, handler) {
        var fn = $parse(handler);
        element.bind(eventType, function (event) {
            scope.$apply(function() {
                fn(scope, {$event:event});
            });
            if (eventType.charAt(0) == 'v') {
                // This is required to prevent a second
                // click event, see
                // https://github.com/jquery/jquery-mobile/issues/1787
                event.preventDefault();
            }
        });
    }

    function createEventDirective(directive, eventType) {
        mod.directive(directive, ['$parse', function ($parse) {
            return function (scope, element, attrs) {
                var eventHandler = attrs[directive];
                registerEventHandler(scope, $parse, element, eventType, eventHandler);
            };
        }]);
    }

    // See http://jquerymobile.com/demos/1.2.0/docs/api/events.html
    var jqmEvents = ['tap', 'taphold', 'swipe', 'swiperight', 'swipeleft', 'vmouseover',
        'vmouseout',
        'vmousedown',
        'vmousemove',
        'vmouseup',
        'vclick',
        'vmousecancel',
        'orientationchange',
        'scrollstart',
        'scrollend',
        'pagebeforeshow',
        'pagebeforehide',
        'pageshow',
        'pagehide'
    ];
    var event, directive, i;
    for (i=0; i<jqmEvents.length; i++) {
        event = jqmEvents[i];
        directive = 'ngm' + event.substring(0, 1).toUpperCase() + event.substring(1);
        createEventDirective(directive, event);
    }

})(angular);