/**
 * Integration of the page widget.
 */
define(['jquery', 'angular', 'jqmng/globalScope'], function($, angular, globalScope) {
    // redirect all events from the page widget,
    // so we can intercept them.
    $.mobile.page.prototype.widgetEventPrefix = 'jqmngpage';

    /**
     * This is a copy of the degrade inputs plugin of jquery
     * mobile. We need it here to execute this replacement
     * at the right time, i.e. before we do the page compile with
     * angular.
     * @param targetPage
     */
    function degradeInputs(targetPage) {
        var page = targetPage.data("page"), options;

        if (!page) {
            return;
        }

        options = page.options;

        // degrade inputs to avoid poorly implemented native functionality
        targetPage.find("input").not(page.keepNativeSelector()).each(function() {
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

    $('div').live('jqmngpagecreate', function(event) {
        var page = $(event.target);
        var parentScope = globalScope.globalScope();
        var childScope = angular.scope(parentScope);
        degradeInputs(page);
        angular.compile(page)(childScope);
        parentScope.$eval();
        var createJqmWidgetsFlag = false;
        childScope.$onEval(99999, function() {
            if (createJqmWidgetsFlag) {
                createJqmWidgetsFlag = false;
                page.trigger('create');
            }
        });
        childScope.createJqmWidgets = function() {
            createJqmWidgetsFlag = true;
        }
        page.trigger("pagecreate");
    });

    $('div').live('jqmngpagebeforeshow', function(event, data) {
        var currPageScope = $(event.target).scope();
        if (currPageScope) {
            currScope = currPageScope;
            currScope.$service("$updateView")();
        }
        var page = $(event.target);
        page.trigger("pagebeforeshow", data);
    });

    $('div').live('jqmngpagebeforehide', function(event, data) {
        var page = $(event.target);
        page.trigger("pagebeforehide", data);
    });

    $('div').live('jqmngpagehide', function(event, data) {
        var page = $(event.target);
        page.trigger("pagehide", data);
    });

    $('div').live('jqmngpageshow', function(event, data) {
        var page = $(event.target);
        page.trigger("pageshow", data);
    });

    /**
     * When scopes are created by angular, the elements within the scope need to be enhanced by jquery mobile.
     * We do this by using a special directive that triggers the create event on the page.
     * In a later release of angular there will be angular events that we can hook to.
     * <p>
     * Note that is is required to use the page as target for the event, as some jqm plugins
     * require the parent elements to be enhanced before the child elements, e.g.
     * If there are links in a list:
     * The "links" plugin will not enhance links that have the ui-link-inherited class,
     * which gets set by the listview plugin.
     * We solve this problem by always triggering the create event
     * on the page, and letting jquery mobile figure out the correct order.
     */
    angular.directive("ngm:createwidgets", function(expression) {
        return function(element) {
            var scope = this;
            scope.createJqmWidgets && scope.createJqmWidgets();
        };
    });

    var currScope = null;
    // The eval function of the global scope should eval
    // the active scope only.
    globalScope.onCreate(function(scope) {
        scope.$onEval(function() {
            // Note that wen cannot use $.mobile.activePage here,
            // as this is not set until the pageshow event, but
            // our pages are created before this!
            if (currScope) {
                currScope.$eval();
            }
        });
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
});