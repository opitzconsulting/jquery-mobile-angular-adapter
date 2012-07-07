(function($, angular) {
    function splitAtFirstColon(value) {
        var pos = value.indexOf(':');
        if (pos===-1) {
            return [value];
        }
        return [
            value.substring(0, pos),
            value.substring(pos+1)
        ];
    }

    function instrumentUrlHistoryToSavePageId() {
        var lastToPage;
        $(document).on("pagebeforechange", function(event, data) {
            if (typeof data.toPage === "object") {
                lastToPage = data.toPage;
            }
        });
        var urlHistory = $.mobile.urlHistory;
        var _addNew = urlHistory.addNew;
        urlHistory.addNew = function() {
            var res = _addNew.apply(this, arguments);
            var lastEntry = urlHistory.stack[urlHistory.stack.length-1];
            lastEntry.pageId = lastToPage.attr("id");
            return res;
        }
    }
    instrumentUrlHistoryToSavePageId();

    function getNavigateIndexInHistory(pageId) {
        var urlHistory = $.mobile.urlHistory;
        var activeIndex = urlHistory.activeIndex;
        var stack = $.mobile.urlHistory.stack;
        for (var i = stack.length - 1; i >= 0; i--) {
            if (i!==activeIndex && stack[i].pageId === pageId) {
                return i - activeIndex;
            }
        }
        return undefined;
    }

    function callActivateFnOnPageChange(fnName, params) {
        if (fnName) {
            $(document).one("pagebeforechange", function(event, data) {
                var toPageUrl = $.mobile.path.parseUrl( data.toPage );
                var page = $("#"+toPageUrl.hash.substring(1));
                function executeCall() {
                    var scope = page.scope();
                    scope[fnName].apply(scope, params);
                }
                if (!page.data("page")) {
                    page.one("pagecreate", executeCall);
                    return;
                }
                executeCall();
            });
        }
    }

    /*
     * Service for page navigation.
     * @param target has the syntax: [<transition>:]pageId
     * @param activateFunctionName Function to call in the target scope.
     * @param further params Parameters for the function that should be called in the target scope.
     */
    function navigate(target, activateFunctionName) {
        var activateParams = Array.prototype.slice.call(arguments, 2);
        callActivateFnOnPageChange(activateFunctionName, activateParams);
        var navigateOptions;
        if (typeof target === 'object') {
            navigateOptions = target;
            target = navigateOptions.target;
        }
        var parts = splitAtFirstColon(target);
        var isBack = false;
        if (parts.length === 2 && parts[0] === 'back') {
            isBack = true;
            target = parts[1];
        } else if (parts.length === 2) {
            navigateOptions = { transition: parts[0] };
            target = parts[1];
        }
        if (target === 'back') {
            window.history.go(-1);
            return;
        }
        if (isBack) {
            // The page may be removed from the DOM by the cache handling
            // of jquery mobile.
            $.mobile.loadPage(target, {showLoadMsg: true}).then(function(_a,_b,page) {
                var relativeIndex = getNavigateIndexInHistory(page.attr("id"));
                if (relativeIndex!==undefined) {
                    window.history.go(relativeIndex);
                } else {
                    jqmChangePage(target, {reverse: true});
                }
            });
        } else {
            jqmChangePage(target, navigateOptions);
        }
    }

    function jqmChangePage(target, navigateOptions) {
        if (navigateOptions) {
            $.mobile.changePage(target, navigateOptions);
        } else {
            $.mobile.changePage(target);
        }
    }


    var mod = angular.module('ng');
    mod.factory('$navigate', function() {
        return navigate;
    });



    return navigate;

})($, angular);