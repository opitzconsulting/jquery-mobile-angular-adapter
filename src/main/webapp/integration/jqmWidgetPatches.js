(function ($) {
    function patch(obj, fnName, callback) {
        var _old = obj[fnName];
        obj[fnName] = function () {
            return callback(_old, this, arguments);
        }
    }

    // selectmenu may create parent elements and extra pages
    patch($.mobile.selectmenu.prototype, 'destroy', function (old, self, args) {
        old.apply(self, args);
        var menuPage = self.menuPage;
        var screen = self.screen;
        var listbox = self.listbox;
        menuPage && menuPage.remove();
        screen && screen.remove();
        listbox && listbox.remove();
    });

    // Listview may create subpages that need to be removed when the widget is destroyed.
    patch($.mobile.listview.prototype, "destroy", function (old, self, args) {
        // Destroy the widget instance first to prevent
        // a stack overflow.
        // Note: If there are more than 1 listview on the page, childPages will return
        // the child pages of all listviews.
        var id = self.element.attr('id');
        var childPageRegex = new RegExp($.mobile.subPageUrlKey + "=" + id + "-");
        var childPages = self.childPages();
        old.apply(self, args);
        for (var i = 0; i < childPages.length; i++) {
            var childPage = $(childPages[i]);
            var dataUrl = childPage.attr('data-url');
            if (dataUrl.match(childPageRegex)) {
                childPage.remove();
            }
        }
    });

    // refresh of listview should refresh also non visible entries if the
    // listview itself is not visible
    patch($.mobile.listview.prototype, "refresh", function (old, self, args) {
        if (self.element.filter(":visible").length === 0) {
            return old.call(self, true);
        } else {
            return old.apply(self, args);
        }
    });

    // Copy of the initialization code from jquery mobile for controlgroup.
    // Needed in jqm 1.1, as we want to do a manual initialization.
    // See the open task in jqm 1.1 for controlgroup.
    if ($.fn.controlgroup) {
        $(document).bind("pagecreate create", function (e) {
            $(":jqmData(role='controlgroup')", e.target)
                .jqmEnhanceable()
                .controlgroup({ excludeInvisible:false });
        });
    }

    // Patch 1: controlgroup should not exclude invisible children
    // as long as it is not visible itself!
    // Patch 2: to refresh a controlgroup we call it multiple times.
    // However, controlgroup then wraps its children multiple times
    // in nested divs.

    patch($.fn, "controlgroup", function (old, self, args) {
        var _wrapInner = $.fn.wrapInner;
        if (self.children(".ui-controlgroup-controls").length>0) {
            $.fn.wrapInner = function() { };
        }
        try {
            if (self.filter(":visible").length === 0) {
                var options = args[0] || {};
                options.excludeInvisible = false;
                return old.call(self, options);
            }
            return old.apply(self, args);
        } finally {
            $.fn.wrapInner = _wrapInner;
        }
    });

    // collapsible has problems when a collapsible is created with a nested collapsible,
    // if the nested collapsible is created before the outside collapsible.
    var _c = $.fn.collapsible;
    var nestedContentClass = "ui-collapsible-content";
    $.fn.collapsible = function() {
        var nestedContent = this.find(".ui-collapsible-content");
        nestedContent.removeClass(nestedContentClass);
        try {
            return _c.apply(this, arguments);
        } finally {
            nestedContent.addClass(nestedContentClass);
        }
    };

    // navbar does not contain a refresh function, so we add it here.
    $.mobile.navbar.prototype.refresh = function() {
        var $navbar = this.element,
            $navbtns = $navbar.find( "a" ),
            iconpos = $navbtns.filter( ":jqmData(icon)" ).length ?
                this.options.iconpos : undefined;

        var list = $navbar.find("ul");
        var listEntries = list.children("li");
        list.removeClass(function (index, css) {
            return (css.match(/\bui-grid-\S+/g) || []).join(' ');
        });
        listEntries.removeClass(function (index, css) {
            return (css.match(/\bui-block-\S+/g) || []).join(' ');
        });
        list.jqmEnhanceable().grid({ grid: this.options.grid });

        $navbtns.buttonMarkup({
            corners:	false,
            shadow:		false,
            inline:     true,
            iconpos:	iconpos
        });
    };

})($);