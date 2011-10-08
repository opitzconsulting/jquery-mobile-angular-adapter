define([
    'jqmng/widgets/widgetProxyUtil'
], function(widgetProxyUtil) {
    widgetProxyUtil.createAngularDirectiveProxy('ng:bind-attr', function(expression) {
        var regex = /([^:{'"]+)/;
        var attr = regex.exec(expression)[1];
        if (attr !== 'disabled') {
            return function() {

            };
        } else {
            return function(element) {
                var scope = this;
                var oldValue;
                // Note: We cannot use scope.$watch here:
                // We want to be called after the proxied angular implementation, and
                // that uses $onEval. $watch always gets evaluated before $onEval.
                scope.$onEval(function() {
                    var value = element.attr(attr);
                    if (value != oldValue) {
                        oldValue = value;
                        var jqmOperation = value?"disable":"enable";
                        var data = element.data();
                        for (var key in data) {
                            var widget = data[key];
                            if (widget[jqmOperation]) {
                                element[key](jqmOperation);
                            }
                        }
                    }
                });
            }
        }
    });
});