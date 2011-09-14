define([
    'jqmng/widgets/widgetProxyUtil',
    'jqmng/widgets/jqmSelectMenu',
    'jqmng/widgets/jqmSlider'
], function(proxyUtil, jqmSelectMenu, jqmSlider) {
    proxyUtil.createAngularWidgetProxy('select', function(element) {
        var isSelectMenu = jqmSelectMenu.isSelectMenu(element);
        var isSlider = jqmSlider.isSlider(element);
        var name = element.attr('name');
        return function(element, origBinder) {
            var res = origBinder();
            if (isSelectMenu) {
                jqmSelectMenu.compileSelectMenu.call(this, element, name);
            }
            if (isSlider) {
                jqmSlider.compileSlider.call(this, element, name);
            }
            return res;
        }
    });

});