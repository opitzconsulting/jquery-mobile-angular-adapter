define([
    'jqmng/widgets/widgetProxyUtil',
    'jqmng/widgets/jqmButton'
], function(proxyUtil, jqmButton) {

    proxyUtil.createAngularWidgetProxy('button', function(element) {
        var jqmWidgets = element[0].jqmwidgets || {};
        var name = element.attr('name');
        var jqmoptions = element[0].jqmoptions;
        return function(element, origBinder) {
            var res = origBinder();
            if (jqmWidgets.button) {
                jqmButton.compileButton.call(this, element, name, jqmoptions);
            }
            return res;
        }
    });
});
