define([
    'jquery'
], function($) {
    // Listview may create subpages that need to be removed when the widget is destroyed.
    var fn = $.mobile.listview.prototype;
    var oldDestroy = fn.destroy;
    fn.destroy = function() {
        // Destroy the widget instance first to prevent
        // a stack overflow.
        // Note: If there are more than 1 listview on the page, childPages will return
        // the child pages of all listviews.
        var id = this.element.attr('id');
        var childPageRegex = new RegExp($.mobile.subPageUrlKey + "=" +id+"-");
        var childPages = this.childPages();
        oldDestroy.apply(this, arguments);
        for (var i=0; i<childPages.length; i++) {
            var childPage = $(childPages[i]);
            var dataUrl = childPage.attr('data-url');
            if (dataUrl.match(childPageRegex)) {
                childPage.remove();
            }
        }
    };
    var oldCreate = fn._create;
    fn._create = function() {
        var self = this;
        var res = oldCreate.apply(this, arguments);
        // refresh the list when the children change.
        this.element.bind('create', function(event) {
            self.refresh();
            // register listeners when the children are destroyed.
            // Do this only once per child.
            var children = self.element.children('li');
            var child, i;
            for (i=0; i<children.length; i++) {
                child = children.eq(i);
                if (!child.data('listlistener')) {
                    child.data('listlistener', true);
                    child.bind("remove", function() {
                        self.refresh();
                    });
                }
            }
        });
    };
});
