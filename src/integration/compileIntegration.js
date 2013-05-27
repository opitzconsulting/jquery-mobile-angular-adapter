(function($, angular) {
    var ng = angular.module('ng'),
        jqmInitialized = false,
        lastCreatedPages = [];

    $.mobile.autoInitializePage = false;

    ng.config(["$precompileProvider", function($precompile) {
        $precompile.addHandler(["jqmNgWidget", "element", precompilePageAndWidgets]);
    }]);
    ng.run(['$rootScope', digestOnlyCurrentScope]);
    ng.run(['$rootScope', '$compile', 'jqmNgWidget', '$browser', initExternalJqmPagesOnLoad]);
    ng.run(['$rootScope', digestOnPageBeforeShow]);

    ng.directive('ngmPage', ["jqmNgWidget", "$timeout", ngmPageDirective]);

    return;

    // -------------------------
    // implementation functions

    // Only digest the $.mobile.activePage when rootScope.$digest is called.

    function digestOnlyCurrentScope($rootScope) {
        var lastActiveScope;
        $rootScope.$preDigest(function() {
            var p = $.mobile.activePage;
            var activeScope = p && p.scope();
            if (lastActiveScope && lastActiveScope !== activeScope) {
                lastActiveScope.$disconnect();
            }
            lastActiveScope = activeScope;
            if (activeScope) {
                activeScope.$reconnect();
            }
        });
        $rootScope.$postDigestAlways(function() {
            var hasPages = lastCreatedPages.length;
            while (lastCreatedPages.length) {
                var pageScope = lastCreatedPages.shift();
                // Detach the scope of the created pages from the normal $digest cycle.
                // Needed so that only $.mobile.activePage gets digested when rootScope.$digest
                // is called.
                // However, allow one digest to process every page
                // so that we can use databinding for ids, ... in 
                // ng-repeats for jqm pages.
                pageScope.$disconnect();
            }
            if (hasPages && !jqmInitialized) {
                jqmInitialized = true;
                var _changePage = $.mobile.changePage;
                $.mobile.changePage = function() {};
                try {
                    $.mobile.initializePage();
                } finally {
                    $.mobile.changePage = _changePage;
                }
                $rootScope.$broadcast("jqmInit");
            }
        });
    }

    function digestOnPageBeforeShow($rootScope) {
        $(document).on("pagebeforeshow", function(e) {
            $rootScope.$broadcast("pagebeforeshow", e);
            // The page may not be connected until the call
            // of $digest. So fire the event directly on the page scope.
            var pageScope = $(e.target).scope();
            if (pageScope && pageScope.$$disconnected) {
                pageScope.$broadcast("pagebeforeshow", e);
            }
            if ($rootScope.$$phase) {
                // If we are already digesting,
                // we need to force another digest,
                // as we are changing the scope structure on
                // page change (disconnect the scope of the old page
                // and reconnect the scope of the new page).
                $rootScope.$postDigestOne(function(requireRedigest) {
                    requireRedigest();
                });
            } else {
                $rootScope.$digest();
            }
        });
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
        connectToDocumentAndPage(jqmNgWidget, element[0], markPagesAndWidgetsAndApplyNonWidgetMarkup);

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
            jqmNgWidget.markJqmWidgetCreation(function() {
                jqmNgWidget.preventJqmWidgetCreation(function() {
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

    var emptyPage;

    function connectToDocumentAndPage(jqmNgWidget, node, callback) {
        if (!node.parentNode) {
            return callback();
        }
        // search the top most element for node.
        while (node.parentNode && node.parentNode.nodeType === 1) {
            node = node.parentNode;
        }
        var oldParentNode = node.parentNode;
        if (oldParentNode !== document) {
            if (!emptyPage) {
                emptyPage = $('<div data-role="page"></div>');
                createPagesWithoutPageCreateEvent(jqmNgWidget, emptyPage);
            }
            $("body").append(emptyPage);
            emptyPage.append(node);
        }
        try {
            return callback();
        } finally {
            if (oldParentNode !== document) {
                if (oldParentNode) {
                    oldParentNode.appendChild(node);
                }
                // Don't use remove, as this would destroy the page widget also,
                // but we want to cache it!
                emptyPage[0].parentNode.removeChild(emptyPage[0]);
            }
        }
    }

    /**
     * Special directive for pages, as they need an own scope.
     */

    function ngmPageDirective(jqmNgWidget, $timeout) {
        return {
            restrict: 'A',
            scope: true,
            compile: function(tElement, tAttrs) {
                tElement.removeAttr("ngm-page");
                return {
                    pre: function(scope, iElement, iAttrs) {
                        if (!$.mobile.pageContainer) {
                            $.mobile.pageContainer = iElement.parent().addClass("ui-mobile-viewport");
                        }

                        // Create the page widget without the pagecreate-Event.
                        // This does no dom transformation, so it's safe to call this in the prelink function.
                        createPagesWithoutPageCreateEvent(jqmNgWidget, iElement);
                        lastCreatedPages.push(scope);
                    }
                };
            }
        };
    }

    function createPagesWithoutPageCreateEvent(jqmNgWidget, pages) {
        jqmNgWidget.preventJqmWidgetCreation(function() {
            var oldPrefix = $.mobile.page.prototype.widgetEventPrefix;
            $.mobile.page.prototype.widgetEventPrefix = 'noop';
            pages.page();
            $.mobile.page.prototype.widgetEventPrefix = oldPrefix;
        });
    }

    // If jqm loads a page from an external source, angular needs to compile it too!

    function initExternalJqmPagesOnLoad($rootScope, $compile, jqmNgWidget, $browser) {
        jqmNgWidget.patchJq('page', function() {
            if (!jqmNgWidget.preventJqmWidgetCreation() && !this.data($.mobile.page.prototype.widgetFullName)) {
                if (this.attr("data-" + $.mobile.ns + "external-page")) {
                    correctRelativeLinks(this);
                    $compile(this)($rootScope);
                }
            }
            return $.fn.orig.page.apply(this, arguments);
        });

        function correctRelativeLinks(page) {
            // correct the relative links in this page relative
            // to the page url.
            // For external links, jqm already does this when
            // the page is loaded. However, normal links
            // are adjusted in jqm via their default jqm click handler.
            // As we use our own default click handler (see ngmRouting.js),
            // we need to adjust normal links ourselves.
            var pageUrl = page.jqmData("url"),
                pagePath = $.mobile.path.get(pageUrl),
                ABSOULTE_URL_RE = /^(\w+:|#|\/)/,
                EMPTY_RE = /^(\#|#|\/)/;

            page.find("a").each(function() {
                var $this = $(this),
                    thisUrl = $this.attr("href");
                if (thisUrl && thisUrl.length > 0 && !ABSOULTE_URL_RE.test(thisUrl)) {
                    $this.attr("href", pagePath + thisUrl);
                }
            });
        }
    }



})($, angular);