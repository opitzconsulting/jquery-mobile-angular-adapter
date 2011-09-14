define([
    'jqmng/widgets/widgetProxyUtil',
    'jqmng/widgets/disabledHandling'
], function(proxyUtil, disabledHandling) {
    disabledHandling.textinput = true;

    function compileTextInput(element, name) {
        var scope = this;
        element.textinput();
    }

    function isTextInput(element) {
        return element.filter($.mobile.textinput.prototype.options.initSelector)
            .not(":jqmData(role='none'), :jqmData(role='nojs')").length > 0;
    }

    return {
        compileTextInput: compileTextInput,
        isTextInput: isTextInput
    }


});
