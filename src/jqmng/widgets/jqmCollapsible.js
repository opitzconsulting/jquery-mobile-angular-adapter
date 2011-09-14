define([
    'jqmng/widgets/widgetProxyUtil',
    'jqmng/widgets/disabledHandling'
], function(proxyUtil, disabledHandling) {
    proxyUtil.createJqmWidgetProxy('collapsible');
    function compileCollapsible(element, name) {
        var scope = this;
        element.collapsible();
    }

    return {
        compileCollapsible: compileCollapsible
    }
});
