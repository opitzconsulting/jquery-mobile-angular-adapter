define([
    'jqmng/widgets/widgetProxyUtil',
    'jqmng/widgets/disabledHandling',
    'jqmng/widgets/pageCompile'
], function(proxyUtil, disabledHandling, pageCompile) {
    disabledHandling.selectmenu = true;

    function compileSelectMenu(element, name) {
        var scope = this;
        // The selectmenu needs access to the page,
        // so we can not create it until after the eval cycle!
        pageCompile.afterCompile(function() {
            // The selectmenu widget creates a parent tag. This needs
            // to be deleted when the select tag is deleted from the dom.
            // Furthermore, it creates ui-selectmenu and ui-selectmenu-screen divs, as well as new dialogs
            var removeSlaves;
            var newElements = proxyUtil.recordDomAdditions(".ui-selectmenu,.ui-selectmenu-screen,:jqmData(role='dialog')", function() {
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

    function isSelectMenu(element) {
        return element.filter($.mobile.selectmenu.prototype.options.initSelector)
            .not(":jqmData(role='none'), :jqmData(role='nojs')").length > 0;
    }

    return {
        compileSelectMenu: compileSelectMenu,
        isSelectMenu: isSelectMenu
    }
});