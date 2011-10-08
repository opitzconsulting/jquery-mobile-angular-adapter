define([], function() {

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
        this.element.bind('elementsAdded elementsRemoved', function(event) {
            event.stopPropagation();
            // refresh when the number of options change.
            self.refresh();
            // The default element may have changed, save it into the model
            self.element.trigger('change');
        });
    };
    var oldRefresh = fn.refresh;
    fn.refresh = function() {
        // The refresh is not enough: also
        // update the internal widget data to adjust to the new number of options.
        this.selectOptions = this.element.find( "option" );
        return oldRefresh.apply(this, arguments);
    }
});