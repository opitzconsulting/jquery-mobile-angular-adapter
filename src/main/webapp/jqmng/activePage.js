define(['jquery', 'jqmng/globalScope'], function($, globalScope) {
    /*
     * Service for page navigation.
     * A call without parameters returns the current page id.
     * Parameters (see $.mobile.changePage)
     * - pageId: Id of page to navigate to. The special page id "back" navigates back.
     * - transition (optional): Transition to be used.
     * - reverse (optional): If the transition should be executed in reverse style
     */
    function activePage() {
        if (arguments.length == 0) {
            var currPage = $.mobile.activePage;
            if (currPage) {
                return currPage.attr('id');
            } else {
                return null;
            }
        } else {
            // set the page...
            var pageId = arguments[0];
            if (pageId == 'back') {
                window.history.back();
            } else {
                $.mobile.changePage.apply($.mobile.changePage, arguments);
            }
        }
    }

    $('div').live('pagebeforehide', function(event, ui) {
        var currPageScope = $(event.target).scope();
        if (!currPageScope) {
            return;
        }
        var nextPage = ui.nextPage;
        var nextPageScope = nextPage && nextPage.scope();
        if (currPageScope.onPassivate) {
            currPageScope.onPassivate.call(currPageScope, nextPageScope);
        }
    });

    $('div').live('pagebeforeshow', function(event, ui) {
        var currPageScope = $(event.target).scope();
        if (!currPageScope) {
            return;
        }
        var prevPage = ui.prevPage;
        var prevPageScope = prevPage && prevPage.scope();
        if (currPageScope.onActivate) {
            currPageScope.onActivate.call(currPageScope, prevPageScope);
        }
    });

    return {
        activePage: activePage
    }

});