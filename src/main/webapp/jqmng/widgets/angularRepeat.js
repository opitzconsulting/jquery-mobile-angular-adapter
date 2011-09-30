define(['jqmng/widgets/widgetProxyUtil'], function(proxyUtil) {
    /**
     * Helper directive to detect elements that were created via ng:repeat.
     * This will fire "create" events to initialize all jquery mobile widgets that
     * need no special care by this adapter.
     */
    angular.directive('ngm:firecreateevent', function(expression) {
        return function(element) {
            proxyUtil.fireJqmCreateEvent(element);
        }
    });

    /**
     * Proxy the original ng:repeat widget to add ngm:firecreateevent directive.
     */
    var oldRepeat = angular.widget('@ng:repeat');
    angular.widget('@ng:repeat', function(expression, element) {
        element.attr('ngm:firecreateevent', 'true');
        var oldLinker = oldRepeat.apply(this, arguments);
        return function(element) {
            return oldLinker.apply(this, arguments);
        }
    });

});