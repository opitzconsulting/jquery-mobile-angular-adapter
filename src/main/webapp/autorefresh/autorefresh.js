(function ($) {

    /**
     * For refreshing widgets we implement the following strategy for jquery mobile:
     * When new elements are added or removed to the dom, or attributes change, we set a special
     * flag on them and all of their parents by using the $.fn.jqmChanged plugin.
     * When someone calls $.mobile.autoRefresh we trigger the create event on the jqm pages of
     * those changed elements.
     * Furthermore, we also automatically call the refresh function of those widgets, who themselves or their
     * children have changed, whenever a create event is received.
     * <p>
     * The $.mobile.autoRefresh function is automatically fired at the end of every $digest.
     */

    var jqmChangedElements = [];
    var inRefresh = false;

    function jqmChangedAccessor(el, value) {
        var domEl = el[0];
        if (arguments.length === 1) {
            return !!domEl.jqmChanged;
        }
        if (!value) {
            delete domEl.jqmChanged;
        } else {
            if (!inRefresh) {
                domEl.jqmChanged = true;
                jqmChangedElements.push(el);
            }
        }
    }

    function markElementWithParents(el, value) {
        if (jqmChangedAccessor(el) === value) {
            return;
        }
        if (!value) {
            jqmChangedAccessor(el, false);
        } else {
            jqmChangedAccessor(el, true);
            if (el.parent().length > 0) {
                markElementWithParents(el.parent(), true);
            }
        }
    }

    $.fn.jqmChanged = function (value) {
        if (arguments.length === 0) {
            if (this.length === 0) {
                return false;
            }
            return jqmChangedAccessor(this.eq(0));
        }
        var i;
        for (i = 0; i < this.length; i++) {
            markElementWithParents(this.eq(i), value);
        }
    };

    $.mobile.autoRefresh = function () {
        if (inRefresh) {
            return;
        }
        inRefresh = true;
        var i,el;
        // trigger the refresh event on changed pages.
        // Note: We cannot reset the changed flag in this loop,
        // as we need the flag in the refresh function of widgets...
        for (i = 0; i < jqmChangedElements.length; i++) {
            el = jqmChangedElements[i];
            if (el.data("page")) {
                el.trigger("create");
            }
        }
        // reset the jqmChanged flag for al changed elements.
        for (i = 0; i < jqmChangedElements.length; i++) {
            jqmChangedAccessor(jqmChangedElements[i], false);
        }
        // Ignore all refresh requests that were created during the refreshing...
        jqmChangedElements = [];
        inRefresh = false;
    };

    function beforeJQueryPlugin(pluginName, callback) {
        var oldFn = $.fn[pluginName];
        $.fn[pluginName] = function () {
            callback.apply(this, arguments);
            return oldFn.apply(this, arguments);
        };
    }

    function afterJQueryPlugin(pluginName, callback) {
        var oldFn = $.fn[pluginName];
        $.fn[pluginName] = function () {
            var res = oldFn.apply(this, arguments);
            callback.apply(this, arguments);
            return res;
        };
    }

    function markElementsWhenDomElementsAreCreatedOrDeleted() {
        var markElementChangedFns = ['append', 'prepend', 'html'];
        for (var i = 0; i < markElementChangedFns.length; i++) {
            beforeJQueryPlugin(markElementChangedFns[i], function () {
                this.jqmChanged(true);
            });
        }
        var markParentChangedFns = ['before', 'after', 'remove'];
        for (var i = 0; i < markParentChangedFns.length; i++) {
            beforeJQueryPlugin(markParentChangedFns[i], function () {
                // For remove, before and after, we need to set the parent to changed.
                this.parent().jqmChanged(true);
            });
        }
    }

    markElementsWhenDomElementsAreCreatedOrDeleted();

    function markElementsWhenDomAttributesChange() {
        var interestingAttributes = {'disabled':true, 'selected':true, 'checked':true};

        function listenToSetter(fnName) {
            afterJQueryPlugin(fnName, function (attrName) {
                if (arguments.length >= 2) {
                    if (attrName in interestingAttributes) {
                        this.jqmChanged(true);
                    }
                }
            });
        }

        function listenToRemoval(fnName) {
            afterJQueryPlugin(fnName, function (attrName) {
                if (attrName in interestingAttributes) {
                    this.jqmChanged(true);
                }
            });
        }

        listenToSetter('prop');
        listenToSetter('attr');
        listenToRemoval('removeAttr');
    }

    markElementsWhenDomAttributesChange();


    function instrumentWidgetsWithRefreshFunction() {
        function instrumentRefreshOnInit(widget) {
            // the _init function is called whenever the widget is
            // called like this: element.widget().
            // This happens every time the create event is fired through jquery mobile.
            // We use this mechanism to trigger a refresh.
            var _init = widget.prototype._init;
            widget.prototype._init = function () {
                var res = _init.apply(this, arguments);
                if (this.element.jqmChanged()) {
                    this.refresh();
                }
                return res;
            };

        }

        for (var name in $.mobile) {
            var val = $.mobile[name];
            if (typeof val === 'function') {
                if (val.prototype.refresh) {
                    instrumentRefreshOnInit(val);
                }
            }
        }
    }

    instrumentWidgetsWithRefreshFunction();

})(window.jQuery);
