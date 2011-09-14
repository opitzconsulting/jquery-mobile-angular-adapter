define([
    'jqmng/widgets/widgetProxyUtil'
], function(widgetProxyUtil) {
    /**
     * Binds the enabled/disabled handler of angular and jquery mobile together,
     * for the jqm widgets that are in jqmWidgetDisabledHandling.
     */
    var jqmWidgetDisabledHandling = {};

    widgetProxyUtil.createAngularDirectiveProxy('ng:bind-attr', function(expression) {
        var regex = /([^:{'"]+)/;
        var attr = regex.exec(expression)[1];
        if (attr !== 'disabled') {
            return function() {

            };
        } else {
            return function(element) {
                // We have to use the element attribute here, instead of the object property.
                // Reason: The element may have been already been cloned by ng:repeat
                // and after the cloning, the object properties are lost.
                var jqmWidgetsAttr = element.attr('jqmwidgets') || '';
                var jqmWidgets = jqmWidgetsAttr.split(',');
                if (jqmWidgets.length==0) {
                    return;
                }
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
                        for (var i=0; i<jqmWidgets.length; i++) {
                            var widgetName = jqmWidgets[i];
                            var widgetExists = element.data()[jqmWidgets[i]];
                            if (widgetExists) {
                                element[widgetName](jqmOperation);
                            }
                        }
                    }
                });
            }
        }
    });

    return jqmWidgetDisabledHandling;
});