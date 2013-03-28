(function ($) {
    function patch(obj, fnName, callback) {
        var _old = obj[fnName];
        obj[fnName] = function () {
            return callback(_old, this, arguments);
        };
    }

    function collectEventListeners(callback) {
        var unbindCalls = [],
            cleanupCalls = [],
            recursive = false,
            i;

        patchBindFn("on", "off");
        try {
            callback();
        } finally {
            for (i=0; i<cleanupCalls.length; i++) {
                cleanupCalls[i]();
            }
        }

        return unbind;

        function unbind() {
            for (i=0; i<unbindCalls.length; i++) {
                unbindCalls[i]();
            }
        }

        function patchBindFn(bindName, unbindName) {
            var _old = $.fn[bindName];
            $.fn[bindName] = patched;
            cleanupCalls.push(function() {
                $.fn[bindName] = _old;
            });

            function patched() {
                if (!recursive) {
                    var el = this,
                        args = arguments;
                    unbindCalls.push(function() {
                        el[unbindName].apply(el, args);
                    });
                }
                recursive = true;
                try {
                    return _old.apply(this, arguments);
                } finally {
                    recursive = false;
                }
            }
        }
    }

    // if navigating from a jqm page to the same jqm page,
    // never remove the page from the dom cache.
    $(document).on("pageremove", "div", function(event) {
        if ($.mobile.activePage && $.mobile.activePage[0]===this) {
            event.preventDefault();
        }
    });

    // if navigating from a jqm page ot the same jqm page,
    // and a transition like 'slide' was specified,
    // fall back to the sequential transition 'fade',
    // as we are transitioning the same page twice!
    $(document).on("pagebeforechange", function(event, triggerData) {
        if ($.mobile.activePage && triggerData.toPage[0]===$.mobile.activePage[0]) {
            if (triggerData.options.transition !== 'none') {
                triggerData.options.transition = 'fade';
            }
        }
    });

    // selectmenu may create parent elements and extra pages
    patch($.mobile.selectmenu.prototype, 'destroy', function (old, self, args) {
        old.apply(self, args);
        var menuPage = self.menuPage;
        if (menuPage) {
            menuPage.remove();
        }
    });

    // Copy of the initialization code from jquery mobile for controlgroup.
    // Needed as jqm does not do this before the ready event.
    // And if angular is included before jqm, angular will process the first page
    // on ready event before the controlgroup is listening for pagecreate event.
    if ($.fn.controlgroup) {
        $.mobile.document.bind( "pagecreate create", function( e )  {
            $.mobile.controlgroup.prototype.enhanceWithin( e.target, true );
        });
    }

    // $.fn.grid throws an error if it contains no children
    patch($.fn, 'grid', function(old, self, args) {
        if (self.children().length===0) {
            return;
        }
        return old.apply(self, args);
    });

    // navbar does not contain a refresh function, so we add it here.
    patch($.mobile.navbar.prototype, '_create', function captureClickListener(old, self, args) {
        // In the _create function, navbar binds listeners to elements.
        // We need to capture that listener so that we can unbind it later.
        var res;
        self.unbindListeners = collectEventListeners(function() {
            res = old.apply(self, args);
        });
        return res;
    });

    $.mobile.navbar.prototype.refresh = function () {
        // clean up.
        // old listeners
        if (this.unbindListeners) {
            this.unbindListeners();
            this.unbindListeners = null;
        }
        // old css classes
        var $navbar = this.element;
        var list = $navbar.find("ul");
        var listEntries = list.children("li");
        list.removeClass(function (index, css) {
            return (css.match(/\bui-grid-\S+/g) || []).join(' ');
        });
        listEntries.removeClass(function (index, css) {
            return (css.match(/\bui-block-\S+/g) || []).join(' ');
        });
        // recreate
        this._create();
    };
    // rangeslider enable/disable throws
    // TypeError: Function.prototype.apply: Arguments list has wrong type
    $.mobile.rangeslider.prototype._setOption = function( options ) {
        // Old: this._superApply(options);
        $.Widget.prototype._setOption.apply(this, arguments);
        this.refresh();
    };

})(window.jQuery);