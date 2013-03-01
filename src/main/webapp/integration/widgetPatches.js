(function ($) {
    function patch(obj, fnName, callback) {
        var _old = obj[fnName];
        obj[fnName] = function () {
            return callback(_old, this, arguments);
        }
    }

    // patch for selectmenu when it opens a menu in an own page
    $( document ).bind( "selectmenubeforecreate", function( event ) {
        var selectmenuWidget = $( event.target ).data( "selectmenu" );
        patch(selectmenuWidget, 'close', function (old, self, args) {
            if (self.options.disabled || !self.isOpen) {
                return;
            }
            if (self.menuType === "page") {
                // See mobile.dialog#close for the same logic as here!
                var dst = $.mobile.urlHistory.getPrev().url;
                if (!$.mobile.path.isPath(dst)) {
                    dst = $.mobile.path.makeUrlAbsolute("#" + dst);
                }

                $.mobile.changePage(dst, { changeHash:false, fromHashChange:true });
                self.isOpen = false;
            } else {
                old.apply(self, args);
            }
        });
    });

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

    // native selectmenu throws an error is no option is contained!
    $.mobile.selectmenu.prototype.placeholder = "";


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
    patch($.fn, "controlgroup", function (old, self, args) {
        if (self.filter(":visible").length === 0) {
            var options = args[0] || {};
            options.excludeInvisible = false;
            return old.call(self, options);
        }
        return old.apply(self, args);
    });

    // collapsible has problems when a collapsible is created with a nested collapsible,
    // if the nested collapsible is created before the outside collapsible.
    var _c = $.fn.collapsible;
    var nestedContentClass = "ui-collapsible-content";
    $.fn.collapsible = function () {
        var nestedContent = this.find(".ui-collapsible-content");
        nestedContent.removeClass(nestedContentClass);
        try {
            return _c.apply(this, arguments);
        } finally {
            nestedContent.addClass(nestedContentClass);
        }
    };

    // navbar does not contain a refresh function, so we add it here.

    patch($.mobile.navbar.prototype, '_create', function (old, self, args) {
        var _find = $.fn.find;
        var navbar = self.element;
        var navbarBtns;
        $.fn.find = function (selector) {
            var res = _find.apply(this, arguments);
            if (selector === 'a') {
                navbar.data('$navbtns', res);
            }
            return res;
        };
        try {
            return old.apply(self, args);
        } finally {
            $.fn.find = _find;
        }
    });

    $.mobile.navbar.prototype.refresh = function () {
        var $navbar = this.element;

        var $navbtns = $navbar.data("$navbtns");
        $navbtns.splice(0, $navbtns.length);
        $.each($navbar.find("a"), function (key, value) {
            $navbtns.push(value);
        });
        var iconpos = $navbtns.filter(":jqmData(icon)").length ?
            this.options.iconpos : undefined;

        var list = $navbar.find("ul");
        var listEntries = list.children("li");
        list.removeClass(function (index, css) {
            return (css.match(/\bui-grid-\S+/g) || []).join(' ');
        });
        listEntries.removeClass(function (index, css) {
            return (css.match(/\bui-block-\S+/g) || []).join(' ');
        });
        list.jqmEnhanceable().grid({ grid:this.options.grid });

        $navbtns.buttonMarkup({
            corners:false,
            shadow:false,
            inline:true,
            iconpos:iconpos
        });
    };
})(window.jQuery);