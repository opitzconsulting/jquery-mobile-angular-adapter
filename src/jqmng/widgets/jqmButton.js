define([
    'jqmng/widgets/widgetProxyUtil',
    'jqmng/widgets/disabledHandling'
], function(proxyUtil, disabledHandling) {
    disabledHandling.button = true;

    function compileButton(element, name) {
        var scope = this;
        element.button();
        // the input button widget creates a new parent element.
        // remove that element when the input element is removed
        proxyUtil.removeSlavesWhenMasterIsRemoved(element, element.parent());
    }

    function isButton(element) {
        return element.filter($.mobile.button.prototype.options.initSelector)
            .not(":jqmData(role='none'), :jqmData(role='nojs')").length > 0;

    }

    return {
        compileButton: compileButton,
        isButton: isButton
    }

});