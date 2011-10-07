define(['jquery', 'jqmng/globalScope'], function($, globalScope) {
    /*
     * Service for page navigation.
     * Parameters (see $.mobile.changePage)
     * - pageId: Id of page to navigate to. The special page id "back" navigates back.
     * - transition (optional): Transition to be used.
     */
    function activate(pageId, transition) {
        // set the page...
        if (pageId == 'back') {
            window.history.back();
        } else {
            if (pageId.charAt(0)!=='#') {
                pageId = '#'+pageId;
            }
            $.mobile.changePage.call($.mobile, pageId, transition);
        }
    }

    return {
        activate: activate
    }

});