define([
    'jqmng/widgets/widgetProxyUtil',
    'jqmng/widgets/disabledHandling',
    'jquery',
    'jqmng/widgets/pageCompile'
], function(proxyUtil, disabledHandling, $, pageCompile) {

    function compileListView(element) {
        var scope = this;
        // The listview widget looks for the persistent footer,
        // so we need to defer the creation.
        pageCompile.afterCompile(function() {
            // listviews may create subpages for nested lists.
            // Be sure that they get removed from the dom when the list is removed.
            var newElemens = proxyUtil.recordDomAdditions(":jqmData(role='page')", function() {
                element.listview();
            });
            proxyUtil.removeSlavesWhenMasterIsRemoved(element, $(newElemens));
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

    return {
        compileListView: compileListView,
        isListView: isListView
    }
});
