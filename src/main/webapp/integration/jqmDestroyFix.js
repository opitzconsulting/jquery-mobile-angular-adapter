(function($) {
    function patch(obj, fnName, callback) {
        var _old = obj[fnName];
        obj[fnName] = function() {
            return callback(_old, this, arguments);
        }
    }

    // selectmenu may create parent elements and extra pages
    patch($.mobile.selectmenu.prototype, 'destroy', function(old, self, args) {
        old.apply(self, args);
        var menuPage = self.menuPage;
        var screen = self.screen;
        var listbox = self.listbox;
        menuPage && menuPage.remove();
        screen && screen.remove();
        listbox && listbox.remove();
    });

    // Listview may create subpages that need to be removed when the widget is destroyed.
    patch($.mobile.listview.prototype, "destroy", function(old, self, args) {
        // Destroy the widget instance first to prevent
        // a stack overflow.
        // Note: If there are more than 1 listview on the page, childPages will return
        // the child pages of all listviews.
        var id = self.element.attr('id');
        var childPageRegex = new RegExp($.mobile.subPageUrlKey + "=" +id+"-");
        var childPages = self.childPages();
        old.apply(self, args);
        for (var i=0; i<childPages.length; i++) {
            var childPage = $(childPages[i]);
            var dataUrl = childPage.attr('data-url');
            if (dataUrl.match(childPageRegex)) {
                childPage.remove();
            }
        }
    });

    // Slider appends a new element after the input/select element for which it was created.
    // The angular compiler does not like this, so we wrap the two elements into a new parent node.
    patch($.mobile.slider.prototype, "_create", function(old, self, args) {
        var res = old.apply(self, args);
        var parent = self.element[0].parentNode;
        var div = document.createElement("div");
        parent.insertBefore(div, self.element[0]);
        div.appendChild(self.element[0]);
        div.appendChild(self.slider[0]);
        self.wrapper = $(div);
        return res;
    });

    // Copy of the initialization code from jquery mobile for controlgroup.
    // Needed in jqm 1.1, as we want to do a manual initialization.
    // See the open task in jqm 1.1 for controlgroup.
    if ( $.fn.controlgroup ) {
        $( document ).bind( "pagecreate create", function( e ){
            $( ":jqmData(role='controlgroup')", e.target )
                .jqmEnhanceable()
                .controlgroup({ excludeInvisible: false });
        });
    }

})(window.jQuery);