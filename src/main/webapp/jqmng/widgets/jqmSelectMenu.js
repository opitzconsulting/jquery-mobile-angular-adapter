define([
    'jqmng/widgets/widgetProxyUtil',
    'jqmng/widgets/disabledHandling'
], function(proxyUtil) {

    function compileSelectMenu(element, name) {
        var scope = this;
        // The selectmenu needs access to the page,
        // so we can not create it until after the eval cycle!
        proxyUtil.afterCompile(function() {
            element.selectmenu();

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


    // selectmenu may create:
    // - parent element
    var fn = $.mobile.selectmenu.prototype;
    var oldDestroy = fn.destroy;
    fn.destroy = function() {
        // Destroy the widget instance first to prevent
        // a stack overflow.
        var parent = this.element.closest(".ui-select");
        var menuPage = this.menuPage;
        var screen = this.screen;
        var listbox = this.listbox;
        oldDestroy.apply(this, arguments);
        parent && parent.remove();
        menuPage && menuPage.remove();
        screen && screen.remove();
        listbox && listbox.remove();
    };

    return {
        compileSelectMenu: compileSelectMenu,
        isSelectMenu: isSelectMenu
    }
});