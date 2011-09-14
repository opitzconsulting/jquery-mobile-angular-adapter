define([
    'jqmng/widgets/widgetProxyUtil',
    'jqmng/widgets/disabledHandling'
], function(proxyUtil, disabledHandling) {
    disabledHandling.checkboxradio = true;
    proxyUtil.createJqmWidgetProxy('checkboxradio');
    function compileCheckboxRadio(element, name, jqmoptions) {
        var scope = this;
        // The checkboxradio widget looks for a label
        // within the page. So we need to defer the creation.
        proxyUtil.afterEvalCallback(function() {
            element.checkboxradio();
            scope.$watch(name, function(value) {
                element.checkboxradio('refresh');
            });
        });
    }

    return {
        compileCheckboxRadio: compileCheckboxRadio
    }


});