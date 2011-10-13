define([
    'jqmng/widgets/widgetProxyUtil'
], function(proxyUtil) {
    proxyUtil.createAngularWidgetProxy('select', function(element) {
        var name = element.attr('name');
        return function(element, origBinder) {
            var scope = this;
            var res = origBinder();
            var oldVal;
            if (name) {
                // Note: We cannot use $watch here, as ng:options uses $onEval to change the options,
                // and that gets executed after the $watch.
                scope.$onEval(function() {
                    var newVal = scope.$eval(name);
                    if (newVal!==oldVal) {
                        oldVal = newVal;
                        var data = element.data();
                        for (var key in data) {
                            var widget = data[key];
                            if (widget.refresh) {
                                element[key]("refresh");
                            }
                        }
                    }
                });
            }

            return res;
        }
    });

});