(function ($, angular) {


    $('div').live('pagebeforeshow', function (event, data) {
        var page = $(event.target);
        var currPageScope = page.scope();
        if (page.data('angularLinked') && currPageScope) {
            // We only need to trigger the digest for pages
            // creates by angular, and not for those that are dynamically created by jquery mobile.
            currPageScope.$reconnect();
            currPageScope.$root.$digest();
        }
    });

    $('div').live('pagebeforehide', function (event, data) {
        var page = $(event.target);
        var currPageScope = page.scope();
        if (page.data('angularLinked') && currPageScope) {
            currPageScope.$destroy();
        }
    });

    var ng = angular.module('ng');
    ng.run(patchRootDigest);
    ng.run(deactivateAngularLocationService);

    var _page = $.fn.page;
    ng.run(['$rootScope', '$compile', function ($rootScope, $compile) {
        $.fn.page = function () {
            var element = this;
            if (!element.data('angularLinked')) {
                var scope = $rootScope.$new();
                // trigger a separate page compile...
                $compile(element)(scope);
                $rootScope.$digest();
            }
            return _page.apply(this, arguments);
        };
    }]);

    /**
     * Deactivate the url changing capabilities
     * of angular, so we do not get into trouble with
     * jquery mobile: angular saves the current url before a $digest
     * and updates the url after the $digest.
     * <p>
     * This also replaces the hashListen implementation
     * of angular by the jquery mobile impementation,
     * so we do not have two polling functions, ...
     * <p>
     * Attention: By this, urls can no more be changed via angular's $location service!
     */
    function deactivateAngularLocationService($browser) {
        $browser.onHashChange = function (handler) {
            $(window).bind('hashchange', handler);
            return handler;
        };
        var lastUrl = location.href;
        $browser.url = function (url) {
            if (url) {
                lastUrl = url;
            }
            return lastUrl;
        };
    }

    deactivateAngularLocationService.$inject = ['$browser'];

    var jqmCompilePages = [];

    function patchRootDigest($rootScope) {
        var _apply = $rootScope.$apply;
        $rootScope.$apply = function () {
            if ($rootScope.$$phase) {
                return $rootScope.$eval.apply(this, arguments);
            }
            return _apply.apply(this, arguments);
        };
        var refreshing = false;
        var _digest = $rootScope.$digest;
        $rootScope.$digest = function () {
            if ($rootScope.$$phase) {
                return;
            }
            var res = _digest.apply(this, arguments);
            if (refreshing) {
                return;
            }
            refreshing = true;
            // run the jquery mobile page compiler
            // AFTER the angular compiler or any linking function is completely finished.
            // (Cannot be done in an angular directive, as this would lead to
            // interaction problems between angular and jqm modifying the dom...)
            if (this === $rootScope) {
                if (jqmCompilePages.length > 0) {
                    var pages = jqmCompilePages;
                    jqmCompilePages = [];
                    if (!$rootScope.jqmInitialized) {
                        $rootScope.jqmInitialized = true;
                        $.mobile.initializePage();
                    }
                    for (var i = 0; i < pages.length; i++) {
                        pages[i].page();
                    }
                }
                $.mobile.autoRefresh();
            }
            refreshing = false;
            return res;
        };
    }

    patchRootDigest.$inject = ['$rootScope'];

    /**
     * This is a copy of the degrade inputs plugin of jquery
     * mobile. We need it here to execute this replacement
     * at the right time, i.e. before we do the compile with angular.
     * @param targetPage
     */
    function degradeInputs(targetPage) {
        var options = $.mobile.page.prototype.options;

        // degrade inputs to avoid poorly implemented native functionality
        targetPage.find("input").not(options.keepNativeDefault).each(function () {
            var $this = $(this),
                type = this.getAttribute("type"),
                optType = options.degradeInputs[ type ] || "text";

            if (options.degradeInputs[ type ]) {
                var html = $("<div>").html($this.clone()).html(),
                    // In IE browsers, the type sometimes doesn't exist in the cloned markup, so we replace the closing tag instead
                    hasType = html.indexOf(" type=") > -1,
                    findstr = hasType ? /\s+type=["']?\w+['"]?/ : /\/?>/,
                    repstr = " type=\"" + optType + "\" data-" + $.mobile.ns + "type=\"" + type + "\"" + ( hasType ? "" : ">" );

                $this.replaceWith(html.replace(findstr, repstr));
            }
        });
    }

    $.mobile.autoInitializePage = false;

    // We want to create a special directive that matched data-role="page" and data-role="dialog",
    // but none of the other data-role="..." elements of jquery mobile. As we want to create a new
    // scope for that directive, this is only possible, if we preprocess the dom and add a new attribute
    // that is unique for pages and dialogs.
    ng.config(['$provide', function ($provide) {
        $provide.decorator('$compile', ['$delegate', function ($delegate) {
            var selector = ':jqmData(role="page"), :jqmData(role="dialog")';
            var rolePageAttr = 'data-role-page';
            return function (element) {
                element.filter(selector).add(element.find(selector)).attr(rolePageAttr, true);
                degradeInputs(element);
                return $delegate.apply(this, arguments);
            }
        }]);
    }]);

    // Directive for jquery mobile pages. Refreshes the jquery mobile widgets
    // when the page changes.
    ng.directive('rolePage', function () {
        return {
            restrict:'A',
            scope:true,
            compile:function compile(tElement, tAttrs) {
                return {
                    pre:function preLink(scope, iElement, iAttrs) {
                        jqmCompilePages.push(iElement);
                        iElement.data('angularLinked', true);
                        // Detatch the scope for the normal $digest cycle
                        scope.$destroy();
                    }
                }
            }
        };
    });
})(window.jQuery, window.angular);