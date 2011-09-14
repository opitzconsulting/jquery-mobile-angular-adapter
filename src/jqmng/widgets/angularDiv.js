define([
    'jqmng/widgets/widgetProxyUtil',
    'jqmng/widgets/jqmCollapsible'
], function(proxyUtil, jqmCollapsible) {
    proxyUtil.createAngularWidgetProxy('div', function(element) {
        var jqmWidgets = element[0].jqmwidgets || {};
        var name = element.attr('name');
        var jqmoptions = element[0].jqmoptions;
        return function(element, origBinder) {
            var res = origBinder();
            if (jqmWidgets.collapsible) {
                jqmCollapsible.compileCollapsible.call(this, element, name);
            }
            return res;
        };
    });


});
