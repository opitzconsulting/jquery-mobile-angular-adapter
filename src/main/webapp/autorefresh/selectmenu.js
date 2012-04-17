(function ($) {

    // selectmenu may create parent element and extra pages
    var fn = $.mobile.selectmenu.prototype;
    var oldDestroy = fn.destroy;
    fn.destroy = function () {
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

    // the refresh of the non native selectmenu plugin is broken in 1.1.0 as
    // it does not read out the enabled/disabled state.
    $(document).bind("selectmenubeforecreate", function (event) {
        var selectmenuWidget = $(event.target).data("selectmenu");
        if (!selectmenuWidget.options.nativeMenu) {
            var _refresh = selectmenuWidget.refresh;
            selectmenuWidget.refresh = function () {
                _refresh.apply(this, arguments);
                var input = this.element[0];
                if (input.disabled) {
                    this.disable();
                } else {
                    this.enable();
                }
            }
        }
    });
})(window.jQuery);