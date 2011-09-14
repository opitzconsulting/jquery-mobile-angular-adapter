define(['jqmng/jquery', 'jqmng/globalScope'], function($, globalScope) {
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

    var currScope = null;
    // The eval function of the global scope should eval
    // the active scope only.
    globalScope.onCreate(function(scope) {
        scope.$onEval(function() {
            // Note that wen cannot use $.mobile.activePage here,
            // as this has an old valud in the pagebeforeshow event!
            if (currScope) {
                currScope.$eval();
            }
        });
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
        currScope = currPageScope;
        globalScope.updateView();
    });

    /**
     * Deactivate the url changing capabilities
     * of angular, so we do not get into trouble with
     * jquery mobile: angular saves the current url before a $eval
     * and updates the url after the $eval.
     * <p>
     * This also replaces the hashListen implementation
     * of angular by the jquery mobile impementation,
     * so we do not have two polling functions, ...
     * <p>
     * Attention: By this, urls can no more be changed via angular's $location service!
     */
    (function(angular) {
        var oldBrowser = angular.service("$browser");
        angular.service("$browser", function() {
            var res = oldBrowser.apply(this, arguments);
            res.onHashChange = function(handler) {
                $(window).bind('hashchange', handler);
                return handler;
            };
            res.setUrl = function() {
            };
            return res;
        }, {$inject:['$log']});
    })(angular);

    return {
        activePage: activePage
    }

});