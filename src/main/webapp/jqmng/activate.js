define(['jquery', 'angular'], function($, angular) {
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

    /**
     * Helper function to put the navigation part out of the controller into the page.
     * @param self
     * @param result
     * @param trueCase
     * @param falseCase
     */
    angular.Object.activate = function(self, result, trueCase, falseCase) {
        if (arguments.length===2) {
            // used without the test.
            activate(result);
            return;
        }
        if (result && result.then) {
            result.then(function() {
                activate(trueCase);
            }, function() {
                if (falseCase) {
                    activate(falseCase);
                }
            });
        } else {
            if (result!==false) {
                activate(trueCase);
            } else {
                if (falseCase) {
                    activate(falseCase);
                }
            }
        }
    };


    return {
        activate: activate
    }

});