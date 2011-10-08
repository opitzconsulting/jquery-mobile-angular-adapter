define([
    'jqmng/widgets/widgetProxyUtil',
    'jquery'
], function(proxyUtil, $) {

    function compileListView(element) {
        var scope = this;
        // The listview widget looks for the persistent footer,
        // so we need to defer the creation.
        proxyUtil.afterCompile(function() {
            element.listview();
            // refresh the listview when the number of children changes.
            // This does not need to check for changes to the
            // ordering of children, for the following reason:
            // The only changes to elements is done by ng:repeat.
            // And ng:repeat reuses the same element for the same index position,
            // independent of the value of that index position.
            var oldCount;
            scope.$onEval(999999, function() {
                var newCount = element[0].childNodes.length;
                if (oldCount !== newCount) {
                    oldCount = newCount;
                    element.listview("refresh");
                }
            });
        });
    }

    function isListView(element) {
        return element.filter($.mobile.listview.prototype.options.initSelector).length > 0;
    }

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


    return {
        compileListView: compileListView,
        isListView: isListView
    }
});
