define([
    'jqmng/widgets/widgetProxyUtil',
    'jqmng/widgets/jqmListView'
], function(proxyUtil, jqmListView) {
    proxyUtil.createAngularWidgetProxy('ul', function(element) {
        var isListView = jqmListView.isListView(element);
        return function(element, origBinder) {
            var res = origBinder();
            if (isListView) {
                jqmListView.compileListview.call(this, element);
            }
            return res;
        };
    });
});
