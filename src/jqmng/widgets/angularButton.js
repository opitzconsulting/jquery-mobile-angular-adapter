define([
    'jqmng/widgets/widgetProxyUtil',
    'jqmng/widgets/jqmButton'
], function(proxyUtil, jqmButton) {

    proxyUtil.createAngularWidgetProxy('button', function(element) {
        var isButton = jqmButton.isButton(element);
        var name = element.attr('name');
        return function(element, origBinder) {
            var res = origBinder();
            if (isButton) {
                jqmButton.compileButton.call(this, element, name);
            }
            return res;
        }
    });
});
