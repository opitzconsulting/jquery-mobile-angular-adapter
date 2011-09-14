define([
    'jqmng/widgets/widgetProxyUtil',
    'jqmng/widgets/disabledHandling'
], function(proxyUtil, disabledHandling) {
    disabledHandling.textinput = true;

    proxyUtil.createJqmWidgetProxy('textinput');
    function compileTextInput(element, name, jqmoptions) {
        var scope = this;
        element.textinput();
    }

    return {
        compileTextInput: compileTextInput
    }


});
