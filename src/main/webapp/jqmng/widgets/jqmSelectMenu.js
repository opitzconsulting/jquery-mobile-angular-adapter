define(['jquery'], function($) {

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
    var oldCreate = fn._create;
    fn._create = function() {
        var res = oldCreate.apply(this, arguments);
        var self = this;

        // Note: We cannot use the prototype here,
        // as there is a plugin in jquery mobile that overwrites
        // the refresh and open functions...
        var oldRefresh = self.refresh;
        self.refresh = function() {
            // The refresh is not enough (for native menus): also
            // update the internal widget data to adjust to the new number of options.
            this.selectOptions = this.element.find( "option" );
            return oldRefresh.apply(this, arguments);
        };
        // Refresh the menu on open.
        var oldOpen = self.open;
        self.open = function() {
            this.refresh();
            return oldOpen.apply(this, arguments);
        };
    };
});