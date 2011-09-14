define([
    'jqmng/widgets/widgetProxyUtil',
    'jqmng/widgets/jqmSelectMenu',
    'jqmng/widgets/jqmSlider'
], function(proxyUtil, jqmSelectMenu, jqmSlider) {
    proxyUtil.createAngularWidgetProxy('select', function(element) {
        var jqmWidgets = element[0].jqmwidgets || {};
        var name = element.attr('name');
        return function(element, origBinder) {
            var res = origBinder();
            if (jqmWidgets.selectmenu) {
                jqmSelectMenu.compileSelectMenu.call(this, element, name);
            }
            if (jqmWidgets.slider) {
                jqmSlider.compileSlider.call(this, element, name);
            }
            return res;
        }
    });

});