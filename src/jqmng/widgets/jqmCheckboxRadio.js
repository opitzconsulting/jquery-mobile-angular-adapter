define([
    'jqmng/widgets/widgetProxyUtil',
    'jqmng/widgets/disabledHandling',
    'jqmng/widgets/pageCompile'
], function(proxyUtil, disabledHandling, pageCompile) {
    disabledHandling.checkboxradio = true;

    function compileCheckboxRadio(element, name) {
        var scope = this;
        // The checkboxradio widget looks for a label
        // within the page. So we need to defer the creation.
        pageCompile.afterCompile(function() {
            element.checkboxradio();
            scope.$watch(name, function(value) {
                element.checkboxradio('refresh');
            });
        });
    }

    function isCheckboxRadio(element) {
        return element.filter($.mobile.checkboxradio.prototype.options.initSelector)
            .not(":jqmData(role='none'), :jqmData(role='nojs')").length > 0;

    }

    return {
        compileCheckboxRadio: compileCheckboxRadio,
        isCheckboxRadio: isCheckboxRadio
    }


});