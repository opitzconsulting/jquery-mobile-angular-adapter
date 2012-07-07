(function (angular) {
    var mod = angular.module('ng');

    function registerEventHandler(scope, element, eventType, handler) {
        element.bind(eventType, function (event) {
            var res = scope.$apply(handler, element);
            if (eventType.charAt(0) == 'v') {
                // This is required to prevent a second
                // click event, see
                // https://github.com/jquery/jquery-mobile/issues/1787
                event.preventDefault();
            }
        });
    }

    function createEventDirective(directive, eventType) {
        mod.directive(directive, function () {
            return function (scope, element,attrs) {
                var eventHandler = attrs[directive];
                registerEventHandler(scope, element, eventType, eventHandler);
            };
        });
    }

    var eventDirectives = {ngmTaphold:'taphold', ngmSwipe:'swipe', ngmSwiperight:'swiperight',
        ngmSwipeleft:'swipeleft',
        ngmPagebeforeshow:'pagebeforeshow',
        ngmPagebeforehide:'pagebeforehide',
        ngmPageshow:'pageshow',
        ngmPagehide:'pagehide',
        ngmClick:'vclick'
    };
    for (var directive in eventDirectives) {
        createEventDirective(directive, eventDirectives[directive])
    }

})(angular);