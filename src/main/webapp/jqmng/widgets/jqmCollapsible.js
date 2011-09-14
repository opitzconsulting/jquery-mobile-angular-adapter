define([
    'jqmng/widgets/widgetProxyUtil',
    'jqmng/widgets/disabledHandling'
], function(proxyUtil, disabledHandling) {

    function compileCollapsible(element, name) {
        var scope = this;
        element.collapsible();
    }

    function isCollapsible(element) {
        return element.filter($.mobile.collapsible.prototype.options.initSelector).length > 0;
    }

    return {
        compileCollapsible: compileCollapsible,
        isCollapsible: isCollapsible
    }
});
