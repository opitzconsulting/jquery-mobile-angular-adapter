define(['jquery', 'jqmng/globalScope'], function($, globalScope) {
    /*
     * Service for page navigation.
     * Parameters (see $.mobile.changePage)
     * - pageId: Id of page to navigate to. The special page id "back" navigates back.
     * - transition (optional): Transition to be used.
     * - reverse (optional): If the transition should be executed in reverse style
     */
    function activate(pageId, transition, reverse) {
        // set the page...
        if (pageId == 'back') {
            window.history.back();
        } else {
            if (pageId.charAt(0)!=='#') {
                pageId = '#'+pageId;
            }
            $.mobile.changePage.call($.mobile, pageId, transition, reverse);
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
        activate: activate
    }

});