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

    $.mobile.autoInitializePage = false;
    var lastCreatedPages = [];
    var jqmInitialized = false;

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
                        $.mobile.initializePage();
                    }
                }

                return res;
            };
            return $rootScope;
        }]);
    }]);

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
     * This directive will enhance the dom during compile
     * with non widget markup. This will also mark elements that contain
     * jqm widgets.
     */
    ng.factory('$precompile', function () {
        var pageSelector = ':jqmData(role="page"), :jqmData(role="dialog")';

        return function (element) {
            // save the old parent
            var oldParentNode = element[0].parentNode;

            // if the element is not connected with the document element,
            // the enhancements of jquery mobile do not work (uses event listeners for the document).
            // So temporarily connect it...
            connectToDocument(element[0], function () {

                var pages = element.find(pageSelector).add(element.filter(pageSelector));
                pages.attr("ngm-page", "true");

                // enhance non-widgets markup.
                markJqmWidgetCreation(function () {
                    preventJqmWidgetCreation(function () {
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
            });

            // If the element wrapped itself into a new element,
            // return the element that is under the same original parent
            while (element[0].parentNode !== oldParentNode) {
                element = element.eq(0).parent();
            }

            return element;
        }
    });

    /**
     * Special directive for pages, as they need an own scope.
     */
    ng.directive('ngmPage', function () {
        return {
            restrict:'A',
            scope:true,
            compile:function (tElement, tAttrs) {
                tElement.removeAttr("ngm-page");
                return {
                    pre:function (scope, iElement, iAttrs) {
                        // Create the page widget without the pagecreate-Event.
                        // This does no dom transformation, so it's safe to call this in the prelink function.
                        createPagesWithoutPageCreateEvent(iElement);
                        lastCreatedPages.push(scope);
                    }
                };
            }
        };
    });

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

    $.mobile.registerJqmNgWidget = function (widgetName, widgetSpec) {
        jqmWidgets[widgetName] = widgetSpec;
        patchJqmWidget(widgetName, widgetSpec.precompile);
    };

    var jqmWidgets = {};
    /**
     * Directive for calling the create function of a jqm widget.
     * For elements that wrap themselves into new elements (like `<input type="checked">`) ngmCreate will be called
     * on the wrapper element for the input and the label, which is created during precompile.
     * ngmLink will be called on the actual input element, so we have access to the ngModel and attrs for $observe calls.
     */
    ng.directive("ngmCreate", function () {
        return {
            restrict:'A',
            // after the normal angular widgets like input, ngModel, ...
            priority:0,
            compile:function (tElement, tAttrs) {
                var widgets = JSON.parse(tAttrs.ngmCreate);
                return {
                    post:function (scope, iElement, iAttrs, ctrls) {
                        var widgetName, widgetSpec, initArgs, origCreate;
                        for (widgetName in widgets) {
                            widgetSpec = jqmWidgets[widgetName];
                            initArgs = widgets[widgetName];
                            origCreate = $.fn.orig[widgetName];
                            if (widgetSpec.create) {
                                widgetSpec.create(origCreate, iElement, initArgs);
                            } else {
                                origCreate.apply(iElement, initArgs);
                            }
                        }
                    }
                };
            }
        }
    });

    /**
     * Directive for connecting widgets with angular. See ngmCreate.
     */
    ng.directive("ngmLink", ["$injector", function ($injector) {
        return {
            restrict:'A',
            priority:0,
            require:['?ngModel'],
            compile:function (tElement, tAttrs) {
                var widgets = JSON.parse(tAttrs.ngmLink);
                return {
                    post:function (scope, iElement, iAttrs, ctrls) {
                        var widgetName, widgetSpec;
                        for (widgetName in widgets) {
                            widgetSpec = jqmWidgets[widgetName];
                            widgetSpec.link(scope, iElement, iAttrs, ctrls, $injector);
                        }
                    }
                };
            }
        }
    }]);

    function patchJqmWidget(widgetName, precompileFn) {
        patchJq(widgetName, function () {
            if (markJqmWidgetCreation()) {
                var args = Array.prototype.slice.call(arguments);
                var self = this;
                for (var k = 0; k < self.length; k++) {
                    var element = self.eq(k);
                    var createElement = element;
                    if (precompileFn) {
                        createElement = precompileFn(element, args) || createElement;
                    }
                    var ngmCreateStr = createElement.attr("ngm-create") || '{}';
                    var ngmCreate = JSON.parse(ngmCreateStr);
                    ngmCreate[widgetName] = args;
                    createElement.attr("ngm-create", JSON.stringify(ngmCreate));
                    // attribute needs to be after the ngm-create attribute!
                    var ngmLinkStr = element.attr("ngm-link") || '{}';
                    var ngmLink = JSON.parse(ngmLinkStr);
                    ngmLink[widgetName] = true;
                    element.attr("ngm-link", JSON.stringify(ngmLink));
                }
            }
            if (preventJqmWidgetCreation()) {
                return false;
            }
            return $.fn.orig[widgetName].apply(this, arguments);
        });
    }

    $.fn.orig = {};

    function patchJq(fnName, callback) {
        $.fn.orig[fnName] = $.fn.orig[fnName] || $.fn[fnName];
        $.fn[fnName] = callback;
    }

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

})($, angular);