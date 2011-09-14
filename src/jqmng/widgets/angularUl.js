define([
    'jqmng/widgets/widgetProxyUtil',
    'jqmng/widgets/jqmListView'
], function(proxyUtil, jqmListView) {
    proxyUtil.createAngularWidgetProxy('ul', function(element) {
        var jqmWidgets = element[0].jqmwidgets || {};
        var jqmoptions = element[0].jqmoptions;
        return function(element, origBinder) {
            var res = origBinder();
            if (jqmWidgets.listview) {
                jqmListView.compileListview.call(this, element);
            }
            return res;
        };
    });
});
