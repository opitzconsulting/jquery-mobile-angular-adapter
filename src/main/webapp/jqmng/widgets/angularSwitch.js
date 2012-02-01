define(['jqmng/widgets/widgetProxyUtil'], function(proxyUtil) {
    /**
     * Modify the original ng:switch so that it adds the ngm:createwidgets attribute to all cases that will
     * fire the jqm create event whenever a new scope is created.
     */
    proxyUtil.createAngularWidgetProxy('ng:switch', function(element) {
        element.children().attr('ngm:createwidgets', 'true');
        return function(element, origBinder) {
            return origBinder();
        }
    });
});