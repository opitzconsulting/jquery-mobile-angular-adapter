define([
    'jqmng/widgets/widgetProxyUtil'
], function(proxyUtil) {
    proxyUtil.createAngularWidgetProxy('select', function(element) {
        var name = element.attr('name');
        return function(element, origBinder) {
            var scope = this;
            var res = origBinder();
            if (name) {
                scope.$watch(name, function(value) {
                    var data = element.data();
                    for (var key in data) {
                        var widget = data[key];
                        if (widget.refresh) {
                            element[key]("refresh");
                        }
                    }
                });
            }

            return res;
        }
    });

});