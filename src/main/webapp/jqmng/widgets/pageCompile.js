jqmng.define('jqmng/widgets/pageCompile', ['jquery', 'angular'], function ($, angular) {
    // redirect all events from the page widget,
    // so we can intercept them.
    $.mobile.page.prototype.widgetEventPrefix = 'jqmngpage';

    /**
     * For refreshing widgets we implement a new strategy for jquery mobile:
     * When new elements are added or removed to the dom, the requestrefresh event is fired on those elements.
     * All elements that have a refresh event and through which the event passes are marked.
     * During the next page create event those widgets automatically refresh themselves.
     * The page create event is automatically fired at the end of every $%digest, when at least one requestrefresh
     * event happened.
     */
    function listenTojQueryFunction(fnName) {
        var oldFn = $.fn[fnName];
        $.fn[fnName] = function () {
            this.parent().trigger('requestrefresh');
            return oldFn.apply(this, arguments);
        };
    }

    function fireRequestrefreshWhenDomIsManipulatedWithjQuery() {
        var changeFns = ['domManip', 'html', 'remove'];
        for (var i = 0; i < changeFns.length; i++) {
            listenTojQueryFunction(changeFns[i]);
        }
    }

    fireRequestrefreshWhenDomIsManipulatedWithjQuery();



    function instrumentRefreshOnInit(widget) {
        var _create = widget.prototype._create;
        widget.prototype._create = function () {
            var res = _create.apply(this, arguments);
            var self = this;
            this.element.bind("requestrefresh", function () {
                self.requestrefresh = true;
            });

            return res;
        };
        // the _init function is called whenever the widget is
        // called like this: element.widget().
        // This happens every time the create event is fired through jquery mobile.
        var _init = widget.prototype._init;
        widget.prototype._init = function () {
            var res = _init.apply(this, arguments);
            if (this.requestrefresh) {
                this.requestrefresh = false;
                this.refresh();
            }
            return res;
        };

    }

    function instrumentWidgetsWithRefreshFunction() {
        for (var name in $.mobile) {
            var val = $.mobile[name];
            if (typeof val === 'function') {
                if (val.prototype.refresh) {
                    instrumentRefreshOnInit(val);
                }
            }
        }
    }

    instrumentWidgetsWithRefreshFunction();

    $('div').live('jqmngpagebeforecreate', function (event) {
        // TODO check if the page already has a scope from angular.
        // If not, the page was loaded dynamically by jquery mobile.
        // Then create a new scope and compile the page!
        var page = $(event.target);
        page.trigger("pagebeforecreate");
    });

    $('div').live('jqmngpagecreate', function (event) {
        var page = $(event.target);
        page.trigger("pagecreate");
    });

    $('div').live('jqmngpagebeforeshow', function (event, data) {
        var page = $(event.target);
        var currPageScope = page.scope();
        if (page.data('angularLinked') && currPageScope) {
            // We only need to trigger the digest for pages
            // creates by angular, and not for those that are dynamically created by jquery mobile.
            setCurrScope(currPageScope);
            currPageScope.$root.$digest();
        }
        var page = $(event.target);
        page.trigger("pagebeforeshow", data);
    });

    $('div').live('jqmngpagebeforehide', function (event, data) {
        var page = $(event.target);
        page.trigger("pagebeforehide", data);
    });

    $('div').live('jqmngpagehide', function (event, data) {
        var page = $(event.target);
        page.trigger("pagehide", data);
    });

    $('div').live('jqmngpageshow', function (event, data) {
        var page = $(event.target);
        page.trigger("pageshow", data);
    });

    var currScope = null;

    function setCurrScope(scope) {
        currScope = scope;
    }

    var ng = angular.module('ng');
    ng.run(patchRootDigest);
    ng.run(deactivateAngularLocationService);

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
            $browser.onHashChange = function(handler) {
                $(window).bind('hashchange', handler);
                return handler;
            };
            var lastUrl = location.href;
            $browser.url = function(url) {
                if (url) {
                    lastUrl = url;
                }
                return lastUrl;
            };
    }
    deactivateAngularLocationService.$inject = ['$browser'];

    var compiledPages = [];

    function patchRootDigest($rootScope) {
        var _apply = $rootScope.$apply;
        $rootScope.$apply = function() {
            if ($rootScope.$$phase) {
                return $rootScope.$eval.apply(this, arguments);
            }
            return _apply.apply(this, arguments);
        };

        var _digest = $rootScope.$digest;
        $rootScope.$digest = function() {
            if ($rootScope.$$phase) {
                return;
            }
            var res = _digest.apply(this, arguments);
            if (this===$rootScope) {
                // digest the current page separately.
                // This is due to performance reasons!
                currScope && currScope.$digest();
            }
            // run the jquery mobile page compiler
            // AFTER the angular compiler is completely finished.
            // (Cannot be done in an angular directive...)
            if (compiledPages.length>0) {
                var pages = compiledPages;
                compiledPages = [];
                if (!$rootScope.jqmInitialized) {
                    $rootScope.jqmInitialized = true;
                    //$(window).unbind("hashchange");
                    $.mobile.initializePage();
                }
                for (var i=0; i<pages.length; i++) {
                    pages[i].page();
                }
            }

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
        targetPage.find( "input" ).not( options.keepNativeDefault ).each(function() {
            var $this = $( this ),
                type = this.getAttribute( "type" ),
                optType = options.degradeInputs[ type ] || "text";

            if ( options.degradeInputs[ type ] ) {
                var html = $( "<div>" ).html( $this.clone() ).html(),
                    // In IE browsers, the type sometimes doesn't exist in the cloned markup, so we replace the closing tag instead
                    hasType = html.indexOf( " type=" ) > -1,
                    findstr = hasType ? /\s+type=["']?\w+['"]?/ : /\/?>/,
                    repstr = " type=\"" + optType + "\" data-" + $.mobile.ns + "type=\"" + type + "\"" + ( hasType ? "" : ">" );

                $this.replaceWith( html.replace( findstr, repstr ) );
            }
        });
    }

    $.mobile.autoInitializePage = false;

    // Directive for jquery mobile pages. Refreshes the jquery mobile widgets
    // when the page changes.
    ng.directive('role', function () {
        return {
            restrict:'A',
            scope:true,
            compile:function compile(tElement, tAttrs) {
                if (tAttrs.role !== 'page' && tAttrs.role !== 'dialog') {
                    return {};
                }
                degradeInputs(tElement);
                return {
                    pre:function preLink(scope, iElement, iAttrs) {
                        compiledPages.push(iElement);
                        iElement.data('angularLinked', true);
                        // Detatch the scope for the normal $digest cycle
                        scope.$destroy();
                        var createJqmWidgetsFlag = false;
                        iElement.bind('requestrefresh', function () {
                            createJqmWidgetsFlag = true;
                        });
                        var oldDigest = scope.$digest;
                        scope.$digest = function () {
                            var res = oldDigest.apply(this, arguments);
                            // Create jquery mobile widgets as needed on the page
                            if (iElement.data("page") && createJqmWidgetsFlag) {
                                createJqmWidgetsFlag = false;
                                iElement.trigger('create');
                            }
                            return res;
                        };
                    }
                }
            }
        };
    });
});