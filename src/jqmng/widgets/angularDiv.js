define([
    'jqmng/widgets/widgetProxyUtil',
    'jqmng/widgets/jqmCollapsible'
], function(proxyUtil, jqmCollapsible) {
    proxyUtil.createAngularWidgetProxy('div', function(element) {
        var isCollapsible = jqmCollapsible.isCollapsible(element);
        var name = element.attr('name');
        return function(element, origBinder) {
            var res = origBinder();
            if (isCollapsible) {
                jqmCollapsible.compileCollapsible.call(this, element, name);
            }
            return res;
        };
    });


});
