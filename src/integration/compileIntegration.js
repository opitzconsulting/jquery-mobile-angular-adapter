(function ($, angular) {
    var ng = angular.module('ng'),
        jqmInitialized = false,
        lastCreatedPages = [];

    $.mobile.autoInitializePage = false;

    ng.config(['$provide', function ($provide) {
        $provide.decorator('$rootScope', ['$delegate', digestOnlyCurrentScopeDecorator]);
    }]);

    ng.config(["$precompileProvider", function($precompile) {
        $precompile.addHandler(["jqmNgWidget", "element", precompilePageAndWidgets]);
    }]);
    ng.run(['$rootScope', '$compile', 'jqmNgWidget', initExternalJqmPagesOnLoad]);

    ng.directive('ngmPage', ["jqmNgWidget", "$timeout", ngmPageDirective]);

    return;

    // -------------------------
    // implementation functions

    // Only digest the $.mobile.activePage when rootScope.$digest is called.
    function digestOnlyCurrentScopeDecorator($rootScope) {
        var _$digest = $rootScope.$digest;
        var lastActiveScope;
        $rootScope.$digest = function () {
            if (this === $rootScope) {
                var p = $.mobile.activePage;
                var activeScope = p && p.scope();
                if (lastActiveScope && lastActiveScope !== activeScope) {
                    lastActiveScope.$disconnect();
                }
                lastActiveScope = activeScope;
                if (activeScope) {
                    activeScope.$reconnect();
                }
            }
            var res = _$digest.apply(this, arguments);
            if (this === $rootScope) {
                var hasPages = lastCreatedPages.length;
                while (lastCreatedPages.length) {
                    var pageScope = lastCreatedPages.shift();
                    // Detach the scope of the created pages from the normal $digest cycle.
                    // Needed so that only $.mobile.activePage gets digested when rootScope.$digest
                    // is called.
                    // However, allow one digest to process every page
                    // so that we can use ng-repeat also for jqm pages!
                    pageScope.$disconnect();
                }
                if (hasPages && !jqmInitialized) {
                    jqmInitialized = true;
                    var _changePage = $.mobile.changePage;
                    $.mobile.changePage = function () {};
                    //$.mobile.changePage.defaults = _changePage.defaults;
                    try {
                        $.mobile.initializePage();
                    } finally {
                        $.mobile.changePage = _changePage;
                    }
                    $rootScope.$broadcast("jqmInit");
                }
            }

            return res;
        };
        return $rootScope;
    }

    /**
     * This $precompile handler will enhance the dom during compile
     * with non widget markup. This will also mark elements that contain
     * jqm widgets.
     */
    function precompilePageAndWidgets(jqmNgWidget, element) {
        var pageSelector = ':jqmData(role="page"), :jqmData(role="dialog")';
        // save the old parent
        var oldParentNode = element[0].parentNode;

        // if the element is not connected with the document element,
        // the enhancements of jquery mobile do not work (uses event listeners for the document).
        // So temporarily connect it...
        connectToDocument(element[0], markPagesAndWidgetsAndApplyNonWidgetMarkup);

        // If the element wrapped itself into a new element,
        // return the element that is under the same original parent
        while (element[0].parentNode !== oldParentNode) {
            element = element.eq(0).parent();
        }

        return element;

        // --------------
        function markPagesAndWidgetsAndApplyNonWidgetMarkup() {
            var pages = element.find(pageSelector).add(element.filter(pageSelector));
            pages.attr("ngm-page", "true");

            // enhance non-widgets markup.
            jqmNgWidget.markJqmWidgetCreation(function () {
                jqmNgWidget.preventJqmWidgetCreation(function () {
                    if (pages.length > 0) {
                        // element contains pages.
                        // create temporary pages for the non widget markup, that we destroy afterwards.
                        // This is ok as non widget markup does not hold state, i.e. no permanent reference to the page.
                        pages.page();
                    } else {
                        element.parent().trigger("create");
                    }
                });
            });

            // Destroy the temporary pages again
            pages.page("destroy");
        }
    }

    function connectToDocument(node, callback) {
        if (!node.parentNode) {
            return callback();
        }
        // search the top most element for node.
        while (node.parentNode && node.parentNode.nodeType === 1) {
            node = node.parentNode;
        }
        var oldParentNode = node.parentNode;
        if (oldParentNode !== document) {
            document.documentElement.appendChild(node);
        }
        try {
            return callback();
        } finally {
            if (oldParentNode !== document) {
                oldParentNode.appendChild(node);
            }
        }
    }

    /**
     * Special directive for pages, as they need an own scope.
     */
    function ngmPageDirective(jqmNgWidget, $timeout) {
        return {
            restrict:'A',
            scope:true,
            compile:function (tElement, tAttrs) {
                tElement.removeAttr("ngm-page");
                return {
                    pre:function (scope, iElement, iAttrs) {
                        if (!$.mobile.pageContainer) {
                            $.mobile.pageContainer = iElement.parent().addClass("ui-mobile-viewport");
                        }

                        // Create the page widget without the pagecreate-Event.
                        // This does no dom transformation, so it's safe to call this in the prelink function.
                        createPagesWithoutPageCreateEvent(jqmNgWidget, iElement);
                        lastCreatedPages.push(scope);
                        iElement.bind('pagebeforeshow', function (event) {
                            var page = $(event.target);
                            // do a digest using $timeout,
                            // so that other pagebeforeshow handlers have a chance
                            // to react on this!
                            $timeout(angular.noop);
                        });
                    }
                };
            }
        };
    }

    function createPagesWithoutPageCreateEvent(jqmNgWidget, pages) {
        jqmNgWidget.preventJqmWidgetCreation(function () {
            var oldPrefix = $.mobile.page.prototype.widgetEventPrefix;
            $.mobile.page.prototype.widgetEventPrefix = 'noop';
            pages.page();
            $.mobile.page.prototype.widgetEventPrefix = oldPrefix;
        });
    }

    // If jqm loads a page from an external source, angular needs to compile it too!
    function initExternalJqmPagesOnLoad($rootScope, $compile, jqmNgWidget) {
        jqmNgWidget.patchJq('page', function () {
            if (!jqmNgWidget.preventJqmWidgetCreation() && !this.data($.mobile.page.prototype.widgetFullName)) {
                if (this.attr("data-" + $.mobile.ns + "external-page")) {
                    correctRelativeLinks(this);
                    $compile(this)($rootScope);
                }
            }
            return $.fn.orig.page.apply(this, arguments);
        });

        var base = $.mobile.base.element.attr("href");
        function correctRelativeLinks(page) {
            // correct the relative links in this page relative
            // to the page url.
            // Jqm does this when a link is clicked (using link.attr("href"),
            // but we want to use link.prop("href")
            var url = page.jqmData( "url" );
            if ( !url || !$.mobile.path.isPath( url ) ) {
                url = base;
            }
            var pageUrl = $.mobile.path.makeUrlAbsolute( url, base);
            page.find( "a:not([rel='external'], [target])" ).each(function() {
                var $this = $(this),
                    thisUrl = $this.attr( 'href' );
                $this.attr('href', $.mobile.path.makeUrlAbsolute(thisUrl, pageUrl));
            });
        }
    }



})($, angular);