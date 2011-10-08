define([
    'jqmng/widgets/widgetProxyUtil',
    'jqmng/widgets/jqmSelectMenu'
], function(proxyUtil, jqmSelectMenu) {
    proxyUtil.createAngularWidgetProxy('select', function(element) {
        var isSelectMenu = jqmSelectMenu.isSelectMenu(element);
        var name = element.attr('name');
        return function(element, origBinder) {
            var scope = this;
            var res = origBinder();
            if (isSelectMenu) {
                jqmSelectMenu.compileSelectMenu.call(this, element, name);
            }
            scope.$watch(name, function(value) {
                var data = element.data();
                for (var key in data) {
                    var widget = data[key];
                    if (widget.refresh) {
                        if (key==='selectmenu') {
                            // The refresh is not enough: also
                            // update the internal widget data to adjust to the new number of options.
                            widget.selectOptions = element.find( "option" );
                        }
                        element[key]("refresh");
                    }
                }
            });

            return res;
        }
    });

});