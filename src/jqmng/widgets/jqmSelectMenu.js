define([
    'jqmng/widgets/widgetProxyUtil',
    'jqmng/widgets/disabledHandling'
], function(proxyUtil, disabledHandling) {
    disabledHandling.selectmenu = true;
    proxyUtil.createJqmWidgetProxy('selectmenu');

    function compileSelectMenu(element, name) {
        var scope = this;
        // The selectmenu needs access to the page,
        // so we can not create it until after the eval cycle!
        proxyUtil.afterEvalCallback(function() {
            // The selectmenu widget creates a parent tag. This needs
            // to be deleted when the select tag is deleted from the dom.
            // Furthermore, it creates ui-selectmenu and ui-selectmenu-screen divs, as well as new dialogs
            var removeSlaves;
            var newElements = recordDomAdditions(".ui-selectmenu,.ui-selectmenu-screen,:jqmData(role='dialog')", function() {
                element.selectmenu();
                removeSlaves = element.parent();
            });
            removeSlaves = removeSlaves.add(newElements);
            proxyUtil.removeSlavesWhenMasterIsRemoved(element, removeSlaves);

            scope.$watch(name, function(value) {
                element.selectmenu('refresh', true);
            });
            // update the value when the number of options change.
            // needed if the default values changes.
            var oldCount;
            scope.$onEval(999999, function() {
                var newCount = element[0].childNodes.length;
                if (oldCount !== newCount) {
                    oldCount = newCount;
                    element.trigger('change');
                }
            });
        });
    }

    return {
        compileSelectMenu: compileSelectMenu
    }
});