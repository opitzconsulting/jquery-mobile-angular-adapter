define([
    'jqmng/widgets/widgetProxyUtil',
    'jqmng/widgets/disabledHandling'
], function(proxyUtil, disabledHandling) {
    disabledHandling.button = true;
    proxyUtil.createJqmWidgetProxy('button');
    function compileButton(element, name, jqmoptions) {
        var scope = this;
        element.button(jqmoptions);
        // the input button widget creates a new parent element.
        // remove that element when the input element is removed
        proxyUtil.removeSlavesWhenMasterIsRemoved(element, element.parent());
    }

    return {
        compileButton: compileButton
    }

});