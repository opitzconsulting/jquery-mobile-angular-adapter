(function ($, angular) {
    // Only digest the $.mobile.activePage when rootScope.$digest is called.
    var ng = angular.module('ng');
    $('div').live('pagebeforeshow', function (event, data) {
        var page = $(event.target);
        var currPageScope = page.scope();
        if (currPageScope) {
            currPageScope.$root.$digest();
        }
    });

    ng.config(['$provide', function ($provide) {
        $provide.decorator('$rootScope', ['$delegate', function ($rootScope) {
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
                return _$digest.apply(this, arguments);
            };
            return $rootScope;
        }]);
    }]);

    var _execFlags = {};

    function execWithFlag(flag, fn) {
        if (!fn) {
            return _execFlags[flag];
        }
        var old = _execFlags[flag];
        _execFlags[flag] = true;
        var res = fn();
        _execFlags[flag] = old;
        return res;
    }

    function preventJqmWidgetCreation(fn) {
        return execWithFlag('preventJqmWidgetCreation', fn);
    }

    function markJqmWidgetCreation(fn) {
        return execWithFlag('markJqmWidgetCreation', fn);
    }

    function createPagesWithoutPageCreateEvent(pages) {
        preventJqmWidgetCreation(function () {
            var oldPrefix = $.mobile.page.prototype.widgetEventPrefix;
            $.mobile.page.prototype.widgetEventPrefix = 'noop';
            pages.page();
            $.mobile.page.prototype.widgetEventPrefix = oldPrefix;
        });
    }


    $.mobile.autoInitializePage = false;
    var jqmInitialized = false;

    ng.config(['$provide', function ($provide) {
        $provide.decorator('$compile', ['$delegate', function ($delegate) {
            var selector = ':jqmData(role="page"), :jqmData(role="dialog")';
            var rolePageAttr = 'jqm-page';
            return function (element) {
                // Find page elements
                var pages = element.filter(selector).add(element.find(selector));

                // enhance non-widgets markup.
                markJqmWidgetCreation(function () {
                    preventJqmWidgetCreation(function () {
                        if (pages.length > 0) {
                            // TODO testcase?
                            // element contains pages.
                            // create temporary pages for the non widget markup, that we destroy afterwards.
                            // This is ok as non widget markup does not hold state, i.e. no permanent reference to the page.
                            pages.page();
                        } else {
                            // TODO testcase?
                            // Within a page...
                            element.parent().trigger("create");
                        }
                    });
                });

                // Destroy the temporary pages again
                pages.page("destroy");

                // Mark jqm pages for our directive.
                // We want to create a special directive that matches data-role="page" and data-role="dialog",
                // but none of the other data-role="..." elements of jquery mobile. As we want to create a new
                // scope for those elements (but not for the others), this is only possible, if we preprocess the dom and add a new attribute
                // that is unique for pages and dialogs, for which we can register an angular directive.
                pages.attr(rolePageAttr, true);
                return $delegate.apply(this, arguments);
            }
        }]);
    }]);

    // Directive for jquery mobile pages. Refreshes the jquery mobile widgets
    // when the page changes.
    ng.directive('jqmPage', ['$compile', function ($compile) {
        return {
            restrict:'A',
            scope:true,
            compile:function (tElement, tAttrs) {
                return {
                    pre:function preLink(scope, iElement, iAttrs) {
                        // Create the page widget without the pagecreate-Event.
                        // This does no dom transformation, so it's safe to call this in the prelink function.
                        createPagesWithoutPageCreateEvent(iElement);
                        if (!jqmInitialized) {
                            jqmInitialized = true;
                            $.mobile.initializePage();
                        }

                        // Detach the scope from the normal $digest cycle.
                        // Needed so that only $.mobile.activePage gets digested when rootScope.$digest
                        // is called.
                        scope.$disconnect();
                    }
                }
            }
        };
    }]);

    $.fn.orig = {};

    function patchJq(fnName, callback) {
        $.fn.orig[fnName] = $.fn.orig[fnName] || $.fn[fnName];
        $.fn[fnName] = callback;
    }

    // If jqm loads a page from an external source, angular needs to compile it too!
    ng.run(['$rootScope', '$compile', function ($rootScope, $compile) {
        patchJq('page', function () {
            if (!preventJqmWidgetCreation() && !this.data("page")) {
                if (this.attr("data-" + $.mobile.ns + "external-page")) {
                    $compile(this)($rootScope);
                }
            }
            return $.fn.orig.page.apply(this, arguments);
        });
    }]);

    function patchJqmWidget(widgetName) {
        patchJq(widgetName, function () {
            if (markJqmWidgetCreation()) {
                this.attr("jqm-widget", widgetName);
            }
            if (preventJqmWidgetCreation()) {
                return false;
            }
            return $.fn.orig[widgetName].apply(this, arguments);
        });
    }

    var jqmWidgetLinker = {};
    ng.directive('jqmWidget', function () {
        return {
            require:['?ngModel'],
            compile:function () {
                return {
                    post:function (scope, iElement, iAttrs, ctrls) {
                        var widgetName = iAttrs.jqmWidget;
                        if (!iElement.data(widgetName)) {
                            iElement[widgetName]();
                        }
                        var linker = jqmWidgetLinker[widgetName];
                        for (var i = 0; i < linker.length; i++) {
                            linker[i].apply(this, arguments);
                        }
                    }
                }
            }
        }
    });


    $.mobile.registerJqmNgWidget = function (widgetName, linkFn) {
        var linkFns = linkFn?[linkFn]:[];
        jqmWidgetLinker[widgetName] = linkFns;
        patchJqmWidget(widgetName);
    }
})(window.jQuery, window.angular);