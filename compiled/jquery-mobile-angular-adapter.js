/*! jquery-mobile-angular-adapter - v1.3.2-SNAPSHOT - 2013-06-27
* https://github.com/opitzconsulting/jquery-mobile-angular-adapter
* Copyright (c) 2013 Tobias Bosch; Licensed MIT */
(function(factory) {
if (typeof define === "function" && define.amd) {
define(["jquery", "angular", "jquery.mobile"], factory);
} else {
factory(window.jQuery, window.angular);
}
})(function($, angular) {
(function ($) {
    function patch(obj, fnName, callback) {
        var _old = obj[fnName];
        obj[fnName] = function () {
            return callback(_old, this, arguments);
        };
    }

    function collectEventListeners(callback) {
        var unbindCalls = [],
            cleanupCalls = [],
            recursive = false,
            i;

        patchBindFn("on", "off");
        try {
            callback();
        } finally {
            for (i=0; i<cleanupCalls.length; i++) {
                cleanupCalls[i]();
            }
        }

        return unbind;

        function unbind() {
            for (i=0; i<unbindCalls.length; i++) {
                unbindCalls[i]();
            }
        }

        function patchBindFn(bindName, unbindName) {
            var _old = $.fn[bindName];
            $.fn[bindName] = patched;
            cleanupCalls.push(function() {
                $.fn[bindName] = _old;
            });

            function patched() {
                if (!recursive) {
                    var el = this,
                        args = arguments;
                    unbindCalls.push(function() {
                        el[unbindName].apply(el, args);
                    });
                }
                recursive = true;
                try {
                    return _old.apply(this, arguments);
                } finally {
                    recursive = false;
                }
            }
        }
    }

    // if navigating from a jqm page to the same jqm page,
    // never remove the page from the dom cache.
    $(document).on("pageremove", "div", function(event) {
        if ($.mobile.activePage && $.mobile.activePage[0]===this) {
            event.preventDefault();
        }
    });

    // if navigating from a jqm page ot the same jqm page,
    // and a transition like 'slide' was specified,
    // fall back to the sequential transition 'fade',
    // as we are transitioning the same page twice!
    $(document).on("pagebeforechange", function(event, triggerData) {
        if ($.mobile.activePage && triggerData.toPage[0]===$.mobile.activePage[0]) {
            if (triggerData.options.transition !== 'none') {
                triggerData.options.transition = 'fade';
            }
        }
    });

    // selectmenu may create parent elements and extra pages
    patch($.mobile.selectmenu.prototype, 'destroy', function (old, self, args) {
        old.apply(self, args);
        var menuPage = self.menuPage;
        if (menuPage) {
            menuPage.remove();
        }
    });

    // Copy of the initialization code from jquery mobile for controlgroup.
    // Needed as jqm does not do this before the ready event.
    // And if angular is included before jqm, angular will process the first page
    // on ready event before the controlgroup is listening for pagecreate event.
    if ($.fn.controlgroup) {
        $.mobile.document.bind( "pagecreate create", function( e )  {
            $.mobile.controlgroup.prototype.enhanceWithin( e.target, true );
        });
    }

    // $.fn.grid throws an error if it contains no children
    patch($.fn, 'grid', function(old, self, args) {
        if (self.children().length===0) {
            return;
        }
        return old.apply(self, args);
    });

    // navbar does not contain a refresh function, so we add it here.
    patch($.mobile.navbar.prototype, '_create', function captureClickListener(old, self, args) {
        // In the _create function, navbar binds listeners to elements.
        // We need to capture that listener so that we can unbind it later.
        var res;
        self.unbindListeners = collectEventListeners(function() {
            res = old.apply(self, args);
        });
        return res;
    });

    $.mobile.navbar.prototype.refresh = function () {
        // clean up.
        // old listeners
        if (this.unbindListeners) {
            this.unbindListeners();
            this.unbindListeners = null;
        }
        // old css classes
        var $navbar = this.element;
        var list = $navbar.find("ul");
        var listEntries = list.children("li");
        list.removeClass(function (index, css) {
            return (css.match(/\bui-grid-\S+/g) || []).join(' ');
        });
        listEntries.removeClass(function (index, css) {
            return (css.match(/\bui-block-\S+/g) || []).join(' ');
        });
        // recreate
        this._create();
    };
    // rangeslider enable/disable throws
    // TypeError: Function.prototype.apply: Arguments list has wrong type
    $.mobile.rangeslider.prototype._setOption = function( options ) {
        // Old: this._superApply(options);
        $.Widget.prototype._setOption.apply(this, arguments);
        this.refresh();
    };

})(window.jQuery);
/**
 * Helper that introduces the concept of precompilation: Preprocess the dom before
 * angular processes it.
 * <p>
 * Usage: Create a decorator or a factory for the $precompile service.
 */
(function ($, angular) {
    var ng = angular.module('ng');
    ng.provider("$precompile", $precompileProvider);
    ng.config(['$provide', precompileCompileDecorator]);
    ng.config(['$compileProvider', '$provide', precompileTemplateDirectives]);

    return;

    // ------------------

    function $precompileProvider() {
        var handlers = [];
        return {
            addHandler: function(handler) {
                handlers.push(handler);
            },
            $get: ["$injector", function($injector) {
                return function(element) {
                    var i;
                    for (i=0; i<handlers.length; i++) {
                        element = $injector.invoke(handlers[i], this, {element: element});
                    }
                    return element;
                };
            }]
        };
    }

    function precompileCompileDecorator($provide) {
        $provide.decorator('$compile', ['$precompile', '$delegate', function ($precompile, $compile) {
            return function () {
                var args = Array.prototype.slice.call(arguments);
                args[0] = $precompile(args[0]);
                return $compile.apply(this, args);
            };
        }]);
    }

    function precompileHtmlString(html, $precompile) {
        var $template = $('<div>' + html + '</div>');
        $precompile($template.contents());
        return $template.html();
    }

    function precompileTemplateDirectives ($compileProvider, $provide) {
        var directiveTemplateUrls = {};

        // Hook into the registration of directives to:
        // - preprocess template html
        // - mark urls from templateUrls so we can preprocess it later in $http
        var _directive = $compileProvider.directive;
        $compileProvider.directive = function (name, factory) {
            var newFactory = function ($precompile, $injector) {
                var res = $injector.invoke(factory);
                if (res.template) {
                    res.template = precompileHtmlString(res.template, $precompile);
                } else if (res.templateUrl) {
                    directiveTemplateUrls[res.templateUrl] = true;
                }
                return res;
            };
            return _directive.call(this, name, ['$precompile', '$injector', newFactory]);
        };

        // preprocess $http results for templateUrls.
        $provide.decorator('$http', ['$q', '$delegate', '$precompile', function ($q, $http, $precompile) {
            var _get = $http.get;
            $http.get = function (url) {
                var res = _get.apply(this, arguments);
                if (directiveTemplateUrls[url]) {
                    var _success = res.success;
                    res.success = function(callback) {
                        var newCallback = function() {
                            var args = Array.prototype.slice.call(arguments);
                            var content = args[0];
                            args[0] = precompileHtmlString(content, $precompile);
                            return callback.apply(this, args);
                        };
                        return _success(newCallback);
                    };
                }
                return res;
            };
            return $http;
        }]);
    }

})($, angular);
(function(angular) {

    var ng = angular.module('ng');
    ng.config(['$provide', function($provide) {
        $provide.decorator('$rootScope', ['$delegate', scopeReconnectDecorator]);
        $provide.decorator('$rootScope', ['$delegate', scopePostDigestDecorator]);
        $provide.decorator('$rootScope', ['$delegate', scopeReentranceDecorator]);
    }]);

    function scopeReconnectDecorator($rootScope) {
        $rootScope.$disconnect = function() {
            if (this.$root === this) {
                return; // we can't disconnect the root node;
            }
            var parent = this.$parent;
            this.$$disconnected = true;
            // See Scope.$destroy
            if (parent.$$childHead === this) {
                parent.$$childHead = this.$$nextSibling;
            }
            if (parent.$$childTail === this) {
                parent.$$childTail = this.$$prevSibling;
            }
            if (this.$$prevSibling) {
                this.$$prevSibling.$$nextSibling = this.$$nextSibling;
            }
            if (this.$$nextSibling) {
                this.$$nextSibling.$$prevSibling = this.$$prevSibling;
            }
            this.$$nextSibling = this.$$prevSibling = null;
        };
        $rootScope.$reconnect = function() {
            if (this.$root === this) {
                return; // we can't disconnect the root node;
            }
            var child = this;
            if (!child.$$disconnected) {
                return;
            }
            var parent = child.$parent;
            child.$$disconnected = false;
            // See Scope.$new for this logic...
            child.$$prevSibling = parent.$$childTail;
            if (parent.$$childHead) {
                parent.$$childTail.$$nextSibling = child;
                parent.$$childTail = child;
            } else {
                parent.$$childHead = parent.$$childTail = child;
            }

        };
        return $rootScope;
    }

    function scopePostDigestDecorator($rootScope) {
        var preListeners = [],
            postOneListeners = [],
            postAlwaysListeners = [],
            _digest = $rootScope.$digest;
        $rootScope.$preDigest = function(callback) {
            addListener(this, '$$preDigestListeners', callback);
        };
        $rootScope.$postDigestOne = function(callback) {
            addListener(this, '$$postDigestOneListeners', callback);
        };
        $rootScope.$postDigestAlways = function(callback) {
            addListener(this, '$$postDigestAlwaysListeners', callback);
        };
        $rootScope.$digest = function() {
            var i, res,
                redigest = true;
            while (redigest) {
                redigest = false;
                loopListeners(this, '$$preDigestListeners', []);
                res = _digest.apply(this, arguments);
                loopListeners(this, '$$postDigestOneListeners', [requireRedigest], true);
                loopListeners(this, '$$postDigestAlwaysListeners', [requireRedigest]);
            }
            return res;

            function requireRedigest() {
                redigest = true;
            }
        };
        return $rootScope;

        function addListener(self, property, listener) {
            var id, listeners;
            if (!self.hasOwnProperty(property)) {
                self[property] = [];
            }
            self[property].push(listener);
        }

        function loopListeners(self, property, args, clearAfterCalling) {
            var i, listeners;
            if (self.hasOwnProperty(property)) {
                listeners = self[property];
                if (clearAfterCalling) {
                    self[property] = [];
                }
                for (i=0; i<listeners.length; i++) {
                    listeners[i].apply(null, args);
                }
            }
        }
    }

    function scopeReentranceDecorator($rootScope) {
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
        };
        return $rootScope;
    }
})(angular);
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
(function($, angular) {
    var ng = angular.module('ng'),
        execFlags = {};

    $.fn.orig = {};

    ng.provider("jqmNgWidget", ["$compileProvider", jqmNgWidgetProvider]);
    ng.run(["jqmNgWidget", function(jqmNgWidget) {
        jqmNgWidget._init();
    }]);

    enableDomManipDelegate("after");
    enableDomManipDelegate("before");
    enableDomManipDelegate("css", function(attrName, value) {
        // if the element is shown/hidden, delegate this to the wrapper
        // (see ng-show). Only catch the setter!
        return attrName === 'display' && arguments.length >= 2;
    });
    enableDomManipDelegate("remove");

    return;

    // --------------

    /**
     * @ngdoc object
     * @name ng.jqmNgWidgetProvider
     *
     * @description
     * Helper service for creating a custom directive for a jqm widget.
     * The provider contains a method for registering widgets,
     * and the service provides methods for refreshing the widget.
     */
    function jqmNgWidgetProvider($compileProvider) {
        var widgetDefs = {},
        widgetInstances = {};

        var provider = {
            /**
             * @name ng.jgmNgWidgetProvider#widget
             * @methodOf ng.jgmNgWidgetProvider
             *
             * @description
             * Registers a directive for a jqm widget.
             *
             * @param {string} widgetName jqm widget name, e.g. 'dialog'.
             * @param {function()} directive injectable function, that returns an object with the following properties:
             * <ul>
             * <li>{function(element)} precompile Optional will be called before angular compiles a html snippet.</li>
             * <li>{function(element)} preLink Optional will be called just like normal directives `preLink` function.
             * <li>{function(element)} link will be called just like normal directives `link`/`postLink` function.
             */
            widget: function(name, spec) {
                if (arguments.length === 1) {
                    return widgetDefs[name];
                }
                var override = !! widgetDefs[name];
                widgetDefs[name] = spec;
                if (!override) {
                    addJqmNgWidgetDirective(name, $compileProvider);
                }
            },
            $get: ["$injector", function($injector) {
                return {
                    lookup: function(widgetName) {
                        return widgetInstances[widgetName];
                    },
                    _init: function() {
                        var widgetName, widgetInstance;
                        for (widgetName in widgetDefs) {
                            widgetInstance = widgetInstances[widgetName] = $injector.invoke(widgetDefs[widgetName]);
                            patchJqmWidget(widgetName, widgetInstance);
                        }
                    },
                    preventJqmWidgetCreation: preventJqmWidgetCreation,
                    markJqmWidgetCreation: markJqmWidgetCreation,
                    patchJq: patchJq,
                    createWidget: function(widgetName, iElement, iAttrs) {
                        var initArgs = JSON.parse(iAttrs[calcDirectiveName(widgetName)]);
                        delegateDomManipToWrapper(function() {
                            $.fn.orig[widgetName].apply(iElement, initArgs);
                        }, iElement);
                    },
                    bindDefaultAttrsAndEvents: bindDefaultAttrsAndEvents,
                    bindDisabledAttribute: bindDisabledAttribute,
                    refreshAfterNgModelRender: refreshAfterNgModelRender,
                    refreshOnChildrenChange: refreshOnChildrenChange,
                    triggerAsyncRefresh: triggerAsyncRefresh
                };
            }]
        };

        return provider;
    }

    function calcDirectiveName(widgetName) {
        return "ngm" + widgetName[0].toUpperCase() + widgetName.substring(1);
    }

    function addJqmNgWidgetDirective(widgetName, $compileProvider) {
        var directiveName = calcDirectiveName(widgetName);
        $compileProvider.directive(directiveName, ["jqmNgWidget", directiveImpl]);
        return;

        function directiveImpl(jqmNgWidget) {
            return {
                restrict: 'A',
                // after the normal angular widgets like input, ngModel, ...
                priority: 0,
                require: ['?ngModel', '?select'],
                compile: function(tElement, tAttrs) {
                    var initArgs = JSON.parse(tAttrs[directiveName]);
                    return {
                        pre: function(scope, iElement, iAttrs, ctrls) {
                            var widgetSpec = jqmNgWidget.lookup(widgetName);
                            if (widgetSpec.preLink) {
                                widgetSpec.preLink(widgetName, scope, iElement, iAttrs, ctrls[0], ctrls[1]);
                            }
                        },
                        post: function(scope, iElement, iAttrs, ctrls) {
                            var widgetSpec = jqmNgWidget.lookup(widgetName);
                            widgetSpec.link(widgetName, scope, iElement, iAttrs, ctrls[0], ctrls[1]);
                        }
                    };
                }
            };
        }
    }

    function patchJqmWidget(widgetName, widgetInstance) {
        var widgetAttr = "data-ngm-" + widgetName;
        patchJq(widgetName, function() {
            if (markJqmWidgetCreation()) {
                var args = Array.prototype.slice.call(arguments);
                var self = this;
                for (var k = 0; k < self.length; k++) {
                    var element = self.eq(k);
                    if (widgetInstance && widgetInstance.precompile) {
                        widgetInstance.precompile(element, args);
                    }
                    element.attr(widgetAttr, JSON.stringify(args));
                }
            }
            if (preventJqmWidgetCreation()) {
                return false;
            }
            return $.fn.orig[widgetName].apply(this, arguments);
        });
    }

    function patchJq(fnName, callback) {
        $.fn.orig[fnName] = $.fn.orig[fnName] || $.fn[fnName];
        $.fn[fnName] = callback;
    }

    function execWithFlag(flag, fn) {
        if (!fn) {
            return execFlags[flag];
        }
        var old = execFlags[flag];
        execFlags[flag] = true;
        var res = fn();
        execFlags[flag] = old;
        return res;
    }

    function preventJqmWidgetCreation(fn) {
        return execWithFlag('preventJqmWidgetCreation', fn);
    }

    function markJqmWidgetCreation(fn) {
        return execWithFlag('markJqmWidgetCreation', fn);
    }

    function preventDomManipWrapper(fn) {
        return execWithFlag('preventDomManipWrapper', fn);
    }

    function delegateDomManipToWrapper(origCreate, element) {
        var oldParents = Array.prototype.slice.call(element.parents()),
            newParents,
            i, oldParent, newParent;

        oldParents.unshift(element[0]);
        preventDomManipWrapper(origCreate);
        newParents = Array.prototype.slice.call(element.parents());
        newParents.unshift(element[0]);

        for (i = 0; i < oldParents.length; i++) {
            oldParent = oldParents[oldParents.length - i - 1];
            newParent = newParents[newParents.length - i - 1];
            if (oldParent !== newParent) {
                $(oldParent).data("wrapperDelegate", $(newParent));
                break;
            }
        }
    }

    function enableDomManipDelegate(fnName, callFilter) {
        var old = $.fn[fnName];
        $.fn[fnName] = function() {
            if (enableDomManipDelegate.recurse || preventDomManipWrapper() || (callFilter && !callFilter.apply(this, arguments))) {
                return old.apply(this, arguments);
            }
            try {
                enableDomManipDelegate.recurse = true;
                var args = Array.prototype.slice.call(arguments),
                    delegate,
                    arg0 = args[0],
                    argDelegate;
                delegate = this.data("wrapperDelegate");
                if (delegate && fnName === 'remove') {
                    old.apply(this, arguments);
                }
                if (arg0 && typeof arg0.data === "function") {
                    argDelegate = arg0.data("wrapperDelegate");
                    args[0] = argDelegate || args[0];
                }
                return old.apply(delegate || this, args);
            } finally {
                enableDomManipDelegate.recurse = false;
            }
        };
    }

    function bindDefaultAttrsAndEvents(widgetName, scope, iElement, iAttrs, ngModelCtrl) {
        var widgetInstance = iElement.data($.mobile[widgetName].prototype.widgetFullName);
        if (!widgetInstance) {
            return;
        }
        if (widgetInstance.disable && widgetInstance.enable && (iAttrs.disabled || iAttrs.ngDisabled)) {
            bindDisabledAttribute(widgetName, iElement, iAttrs);
        }
        if (widgetInstance.refresh) {
            refreshOnChildrenChange(widgetName, scope, iElement);
            if (ngModelCtrl) {
                refreshAfterNgModelRender(widgetName, scope, iElement, ngModelCtrl);
            }
        }
    }

    function bindDisabledAttribute(widgetName, iElement, iAttrs) {
        iAttrs.$observe("disabled", function(value) {
            if (value) {
                iElement[widgetName]("disable");
            } else {
                iElement[widgetName]("enable");
            }
        });
    }

    function refreshAfterNgModelRender(widgetName, scope, iElement, ngModelCtrl) {
        addCtrlFunctionListener(ngModelCtrl, "$render", function() {
            triggerAsyncRefresh(widgetName, scope, iElement, "refresh");
        });
    }

    function addCtrlFunctionListener(ctrl, ctrlFnName, fn) {
        var listenersName = "_listeners" + ctrlFnName;
        if (!ctrl[listenersName]) {
            ctrl[listenersName] = [];
            var oldFn = ctrl[ctrlFnName];
            ctrl[ctrlFnName] = function() {
                var res = oldFn.apply(this, arguments);
                for (var i = 0; i < ctrl[listenersName].length; i++) {
                    ctrl[listenersName][i]();
                }
                return res;
            };
        }
        ctrl[listenersName].push(fn);
    }

    function refreshOnChildrenChange(widgetName, scope, iElement) {
        iElement.bind("$childrenChanged", function() {
            triggerAsyncRefresh(widgetName, scope, iElement, "refresh");
        });
    }

    function triggerAsyncRefresh(widgetName, scope, iElement, options) {
        var prop = "_refresh" + widgetName;
        var refreshId = (iElement.data(prop) || 0) + 1;
        iElement.data(prop, refreshId);
        scope.$root.$postDigestOne(function() {
            if (iElement.data(prop) === refreshId) {
                iElement[widgetName](options);
            }
        });
    }



})(window.jQuery, window.angular);
(function (angular, $) {
    var ng = angular.module("ng");
    ng.config(["jqmNgWidgetProvider", function(jqmNgWidgetProvider) {
        // register a default handler for all widgets.
        var widgetName, widget;
        for (widgetName in $.mobile) {
            widget = $.mobile[widgetName];
            if (widgetName!=='page' && angular.isFunction(widget) && widget.prototype.widget) {
                jqmNgWidgetProvider.widget(widgetName, ["jqmNgWidget", defaultWidget]);
            }
        }

        // register special override handlers
        jqmNgWidgetProvider.widget("checkboxradio", ["jqmNgWidget", checkboxRadioWidget]);
        jqmNgWidgetProvider.widget("button", ["jqmNgWidget", buttonWidget]);
        jqmNgWidgetProvider.widget("collapsible", ["jqmNgWidget", "$parse", collapsibleWidget]);
        jqmNgWidgetProvider.widget("dialog", ["jqmNgWidget", dialogWidget]);
        jqmNgWidgetProvider.widget("controlgroup", ["jqmNgWidget", controlgroupWidget]);
        jqmNgWidgetProvider.widget("textinput", ["jqmNgWidget", textinputWidget]);
        jqmNgWidgetProvider.widget("slider", ["jqmNgWidget", "$parse", sliderWidget]);
        jqmNgWidgetProvider.widget("popup", ["jqmNgWidget", "$parse", popupWidget]);
        jqmNgWidgetProvider.widget("panel", ["jqmNgWidget", "$parse", panelWidget]);
        jqmNgWidgetProvider.widget("table", ["jqmNgWidget", tableWidget]);
    }]);

    function defaultWidget(jqmNgWidet) {
        return {
            link: function(widgetName, scope, iElement, iAttrs, ngModelCtrl, selectCtrl) {
                jqmNgWidet.createWidget(widgetName, iElement, iAttrs);
                jqmNgWidet.bindDefaultAttrsAndEvents(widgetName, scope, iElement, iAttrs, ngModelCtrl);
            }
        };
    }

    function textinputWidget(jqmNgWidget) {
        return {
            preLink: function(widgetName, scope, iElement, iAttrs, ngModelCtrl, selectCtrl) {
                if (iAttrs.type === 'range') {
                    iAttrs.type = 'number';
                }
            },
            link: function(widgetName, scope, iElement, iAttrs, ngModelCtrl, selectCtrl) {
                jqmNgWidget.createWidget(widgetName, iElement, iAttrs);
                jqmNgWidget.bindDefaultAttrsAndEvents(widgetName, scope, iElement, iAttrs, ngModelCtrl);
            }
        };
    }

    function popupWidget(jqmNgWidet, $parse) {
        return {
            link: function(widgetName, scope, iElement, iAttrs, ngModelCtrl, selectCtrl) {
                jqmNgWidet.createWidget(widgetName, iElement, iAttrs);
                jqmNgWidet.bindDefaultAttrsAndEvents(widgetName, scope, iElement, iAttrs, ngModelCtrl);
                addOpenedBinding("popup", $parse, scope, iElement, iAttrs, '_');
            }
        };
    }

    function panelWidget(jqmNgWidet, $parse) {
        return {
            link: function(widgetName, scope, iElement, iAttrs, ngModelCtrl, selectCtrl) {
                jqmNgWidet.createWidget(widgetName, iElement, iAttrs);
                jqmNgWidet.bindDefaultAttrsAndEvents(widgetName, scope, iElement, iAttrs, ngModelCtrl);
                addOpenedBinding("panel", $parse, scope, iElement, iAttrs, '');
            }
        };
    }

    function addOpenedBinding(widgetName, $parse, scope, iElement, iAttrs, openCloseMethodPrefix) {
        var syncing = false;
        if (iAttrs.opened) {
            var openedGetter = $parse(iAttrs.opened),
                openedSetter = openedGetter.assign;

            scope.$watch(openedGetter, updateWidget);
            if (openedSetter) {
                updateScopeOn(openCloseMethodPrefix+"open", true);
                updateScopeOn(openCloseMethodPrefix+"close", false);
            }
        }

        function updateScopeOn(methodName, scopeValue) {
            var widget = iElement.data($.mobile[widgetName].prototype.widgetFullName),
                _old = widget[methodName];
            widget[methodName] = function() {
                var res = _old.apply(this, arguments);
                if (!syncing) {
                    syncing = true;
                    scope.$apply(function () {
                        openedSetter(scope, scopeValue);
                    });
                    syncing = false;
                }
                return res;
            };
        }

        function updateWidget(opened) {
            if (syncing) {
                return;
            }
            syncing = true;
            if (opened) {
                iElement[widgetName]("open");
            } else {
                iElement[widgetName]("close");
            }
            syncing = false;
        }
    }

    function sliderWidget(jqmNgWidet, $parse) {
        return {
            link: function(widgetName, scope, iElement, iAttrs, ngModelCtrl, selectCtrl) {
                if (selectCtrl) {
                    waitForNgOptionsAndNgRepeatToCreateOptions(scope, function() {
                        selectSecondOptionIfFirstIsUnknownOptionToRemoveUnkownOption(iElement, ngModelCtrl);
                        jqmNgWidet.createWidget(widgetName, iElement, iAttrs);
                        jqmNgWidet.bindDefaultAttrsAndEvents(widgetName, scope, iElement, iAttrs, ngModelCtrl);
                    });
                } else {
                    var modelValue;
                    if (ngModelCtrl) {
                        // Note: ngModelCtrl.$modelValue is not filled yet,
                        // so we need to evaluate the ng-model attribute ourselves...
                        modelValue = $parse(iAttrs.ngModel)(scope);
                    }
                    setMinValueInScopeIfNoValueInScopeAsJqmStartsWithMinValue(iAttrs, ngModelCtrl, modelValue);
                    jqmNgWidet.createWidget(widgetName, iElement, iAttrs);
                    jqmNgWidet.bindDefaultAttrsAndEvents(widgetName, scope, iElement, iAttrs, ngModelCtrl);
                }
            }
        };

        function waitForNgOptionsAndNgRepeatToCreateOptions(scope, callback) {
            // Note: scope.$evalAsync does not work here, as it 
            // could get executed not until the next $digest, which would be too late!
            scope.$root.$postDigestOne(function(requireDigest) {
                requireDigest();
                callback();
            });
        }

        function setMinValueInScopeIfNoValueInScopeAsJqmStartsWithMinValue(iAttrs, ngModelCtrl, modelValue) {
            if (ngModelCtrl && typeof iAttrs.min !== "undefined" && modelValue===undefined) {
                var _$pristine = ngModelCtrl.$pristine;
                ngModelCtrl.$pristine = false;
                ngModelCtrl.$setViewValue(iAttrs.min);
                ngModelCtrl.$render();
                ngModelCtrl.$pristine = _$pristine;
            }
        }

        function selectSecondOptionIfFirstIsUnknownOptionToRemoveUnkownOption(iElement, ngModelCtrl) {
            var options = iElement.children("option"),
                initValue = options.eq(0).val(),
                selectedIndex;
            if (initValue === '?' || initValue.indexOf('? ')===0) {
                options.eq(1).prop("selected", true);
                var _$pristine = ngModelCtrl.$pristine;
                ngModelCtrl.$pristine = false;
                iElement.trigger("change");
                ngModelCtrl.$pristine = _$pristine;
            }
        }
    }



    function checkboxRadioWidget(jqmNgWidet) {
        return {
            precompile: checkboxRadioPrecompile,
            link: function(widgetName, scope, iElement, iAttrs, ngModelCtrl) {
                var label = iElement.parent("label");
                if (!iAttrs.ngmNoLabel && label.length===0) {
                    // If two checkboxes are created by ng-repeat, and the
                    // ng-repeat is on the checkbox and not on the label,
                    // the first checkbox will be fine, but the second one
                    // will be at an odd place in the dom...
                    throw new Error("Don't use ng-repeat or other conditional directives on checkboxes/radiobuttons directly. Instead, wrap the input into a label and put the directive on that input!");
                }
                jqmNgWidet.createWidget(widgetName, iElement, iAttrs);

                jqmNgWidet.bindDefaultAttrsAndEvents(widgetName, scope, iElement, iAttrs, ngModelCtrl);

                iAttrs.$observe("checked", function (value) {
                    jqmNgWidet.triggerAsyncRefresh(widgetName, scope, iElement, "refresh");
                });
            }
        };

        function checkboxRadioPrecompile(origElement, initArgs) {
            // wrap the input temporarily into it's label (will be undone by the widget).
            // By this, the jqm widget will always
            // use this label, even if there are other labels with the same id on the same page.
            // This is important if we use ng-repeat on checkboxes, as this could
            // create multiple checkboxes with the same id!
            // This needs to be done in the precompile, as otherwise angular compiler could get into trouble
            // when input and label are siblings!
            // See the checkboxradio-Plugin in jqm for the selectors used to locate the label.
            var parentLabel = $(origElement).closest("label");
            var container = $(origElement).closest("form,fieldset,:jqmData(role='page'),:jqmData(role='dialog')");
            if (container.length === 0) {
                container = origElement.parent();
            }
            var label = parentLabel.length ? parentLabel : container.find("label").filter("[for='" + origElement[0].id + "']");
            if (label.length===0) {
                origElement.attr("ngm-no-label", "true");
            } else {
                label.append(origElement);
            }
        }
    }

    function buttonWidget(jqmNgWidet) {
        return {
            precompile: function(origElement, initArgs) {
                // Add a text node with the value content,
                // as we need a text node later in the jqm button markup!
                if (origElement[0].nodeName.toUpperCase() === 'INPUT') {
                    var value = origElement.val();
                    origElement.append(document.createTextNode(value));
                }
            },
            link: function(widgetName, scope, iElement, iAttrs, ngModelCtrl) {
                // Button destroys the text node and recreates a new one. This does not work
                // if the text node contains angular expressions, so we move the
                // text node to the right place.
                var textNode = iElement.contents();
                jqmNgWidet.createWidget(widgetName, iElement, iAttrs);
                var textSpan = iElement.parent().find(".ui-btn-text");
                textSpan.empty();
                textSpan.append(textNode);

                jqmNgWidet.bindDefaultAttrsAndEvents(widgetName, scope, iElement, iAttrs, ngModelCtrl);
            }
        };
    }

    function collapsibleWidget(jqmNgWidet, $parse) {
        return {
            link: function(widgetName, scope, iElement, iAttrs, ngModelCtrl) {
                jqmNgWidet.createWidget(widgetName, iElement, iAttrs);
                jqmNgWidet.bindDefaultAttrsAndEvents(widgetName, scope, iElement, iAttrs, ngModelCtrl);
                bindCollapsedAttribute(scope, iElement, iAttrs);
            }
        };

        function bindCollapsedAttribute(scope, iElement, iAttrs) {
            var syncing = false;
            if (iAttrs.collapsed) {
                var collapsedGetter = $parse(iAttrs.collapsed);
                var collapsedSetter = collapsedGetter.assign;
                scope.$watch(collapsedGetter, updateWidget);
                if (collapsedSetter) {
                    updateScopeOn("collapse", true);
                    updateScopeOn("expand", false);
                }
            }

            function updateWidget(collapsed) {
                if (syncing) {
                    return;
                }
                syncing = true;
                if (collapsed) {
                    iElement.triggerHandler("collapse");
                } else {
                    iElement.triggerHandler("expand");
                }
                syncing = false;
            }

            function updateScopeOn(eventName, newCollapsedValue) {
                iElement.bind(eventName, function (event) {
                    if (syncing) {
                        return;
                    }
                    syncing = true;
                    if ( iElement[0]===event.target ) {
                        scope.$apply(function () {
                            collapsedSetter(scope, newCollapsedValue);
                        });
                    }
                    syncing = false;
                });
            }
        }
    }

    function dialogWidget(jqmNgWidet) {
        return {
            precompile: dialogPrecompile,
            link: function(widgetName, scope, iElement, iAttrs, ngModelCtrl) {
                jqmNgWidet.createWidget(widgetName, iElement, iAttrs);
                // add handler to enhanced close button manually (the one we added in precompile),
                // and remove the other close button (the one the widget created).
                var closeButtons = iElement.find(':jqmData(role="header") a:jqmData(icon="delete")');
                closeButtons.eq(1).bind("click", function() {
                    iElement.dialog("close");
                });
                closeButtons.eq(0).remove();

                jqmNgWidet.bindDefaultAttrsAndEvents(widgetName, scope, iElement, iAttrs, ngModelCtrl);
            }
        };

        // Dialog: separate event binding and dom enhancement.
        // Note: We do need to add the close button during precompile,
        // as the enhancement for the dialog header depends on it (calculation which button is left, right, ...),
        // and that is executed when we create the page widget, which is before the dialog widget is created :-(
        // We cannot adjust the timing of the header enhancement as it is no jqm widget.
        function dialogPrecompile(origElement, initAttrs) {
            FakeDialog.prototype = $.mobile.dialog.prototype;
            var fakeDialog = new FakeDialog(origElement, {}),
                options = fakeDialog.options,
                value = options.closeBtn;

            // The following code is adapted from $.mobile.dialog.prototype._setCloseBtn
            if ( value !== "none" ) {
                // Sanitize value
                var location = ( value === "left" ? "left" : "right" );
                var btn = $( "<a href='#' class='ui-btn-" + location + "' data-" + $.mobile.ns + "icon='delete' data-" + $.mobile.ns + "iconpos='notext'>"+ options.closeBtnText + "</a>" );
                origElement.find( ":jqmData(role='header')" ).first().prepend( btn );
            }

            function FakeDialog(element, options) {
                this.element = element;
                this.options = $.widget.extend( {},
                    this.options,
                    this._getCreateOptions(),
                    options
                );
            }
        }
    }

    function controlgroupWidget(jqmNgWidet) {
        return {
            link: function(widgetName, scope, iElement, iAttrs, ngModelCtrl) {
                jqmNgWidet.createWidget(widgetName, iElement, iAttrs);

                jqmNgWidet.bindDefaultAttrsAndEvents(widgetName, scope, iElement, iAttrs, ngModelCtrl);
                iElement.bind("$childrenChanged", function () {
                    jqmNgWidet.triggerAsyncRefresh(widgetName, scope, iElement, {});
                });
            }
        };
    }

    function tableWidget(jqmNgWidet) {
        return {
            link: function(widgetName, scope, iElement, iAttrs, ngModelCtrl, selectCtrl) {
                var widget, popupId, popup;
                jqmNgWidet.createWidget(widgetName, iElement, iAttrs);
                widget = iElement.data($.mobile[widgetName].prototype.widgetFullName);
                // The column-toggle widget creates a popup with a no enhanced controlgroup
                // and relies on the order in which jqm enhances the widgets.
                // However, this order is different in the adapter,
                // so we need to make sure that the popup is properly enhanced.
                if (widget && widget.options.mode==='columntoggle') {
                    popupId = ( iElement.attr( "id" ) || widget.options.classes.popup ) + "-popup";
                    popup = $("#"+popupId);
                    popup.trigger("create");
                }
                jqmNgWidet.bindDefaultAttrsAndEvents(widgetName, scope, iElement, iAttrs, ngModelCtrl);
            }
        };
    }

})(angular, $);
(function ($, angular) {

    var mod = angular.module("ng");

    $.mobile._registerBrowserDecorators = $.mobile._registerBrowserDecorators || [];
    $.mobile._registerBrowserDecorators.push(registerBrowserDecorator);

    mod.config(['$provide', function ($provide) {
        registerBrowserDecorator($provide);
    }]);
    mod.factory('$history', $historyFactory);

    return;

    // ---------------
    // implementation functions

    function registerBrowserDecorator($provide) {
        $provide.decorator('$browser', ['$delegate', emitOnUrlChangeAsynchronously]);
        $provide.decorator('$browser', ['$delegate', browserHashReplaceDecorator]);
        $provide.decorator('$browser', ['$delegate', allowFileUrlsInBaseHref]);
        $provide.decorator('$browser', ['$delegate', '$history', '$rootScope', '$injector', browserHistoryDecorator]);
        $provide.decorator('$location', ['$delegate', '$history', locationBackDecorator]);

        function emitOnUrlChangeAsynchronously($browser) {
            // popstate also restores the scrolling position from the 
            // corresponding pushState.
            // By this, we are unable to change the scroll position in a popstate
            // (e.g. browser back button), which we want to do as it's the 
            // default behaviour of jquery mobile.
            // jQuery Mobile also does a setTimout when a popstate is received...
            var _onUrlChange = $browser.onUrlChange;
            $browser.onUrlChange = function() {
                var _bind = $.fn.bind;
                $.fn.bind = function(eventName, listener) {
                    if (this[0]===window) {
                        listener = wrapListener(listener);
                        return _bind.call(this, eventName, listener);
                    }
                    return _bind.apply(this, arguments);
                };
                try {
                    return _onUrlChange.apply(this, arguments);
                } finally {
                    $.fn.bind = _bind;
                }
            };
            return $browser;

            function wrapListener(listener) {
                return function() {
                    window.setTimeout(listener,0);
                };
            }
        }

        function locationBackDecorator($location, $history) {
            $location.back = function () {
                $location.$$replace = "back";
                return this;
            };
            return $location;
        }

        function allowFileUrlsInBaseHref($browser) {
            var _baseHref = $browser.baseHref;
            $browser.baseHref = function () {
                // Patch for baseHref to return the correct path also for file-urls.
                // See bug https://github.com/angular/angular.js/issues/1690
                var href = _baseHref.call(this);
                return href ? href.replace(/^file?\:\/\/[^\/]*/, '') : href;
            };
            return $browser;
        }

        function browserHashReplaceDecorator($browser) {
            var _url = $browser.url;
            $browser.url = function() {
                var res = _url.apply(this, arguments);
                if (arguments.length===0) {
                    res = res.replace(/%23/g,'#');
                    res = res.replace(/ /g,'%20');
                }
                return res;
            };
            return $browser;
        }

        function browserHistoryDecorator($browser, $history, $rootScope, $injector) {
            var _url = $browser.url,
                _onUrlChange = $browser.onUrlChange,
                _stopOnUrlChangeListeners;
            var cachedRouteOverride = null;

            _onUrlChange.call($browser, function(newUrl) {
                if (cachedRouteOverride) {
                    var $location = $injector.get('$location');
                    $location.routeOverride(cachedRouteOverride);
                }
                $history.onUrlChangeBrowser(newUrl);
                if (_stopOnUrlChangeListeners) {
                    _stopOnUrlChangeListeners.apply(this, arguments);
                }
            });
            $browser.onUrlChange = function(cb) {
                _onUrlChange.call(this, function() {
                    if (!_stopOnUrlChangeListeners) {
                        cb.apply(this, arguments);
                    }
                });
            };

            $browser.stopOnUrlChangeListeners = function(replaceCallack) {
                _stopOnUrlChangeListeners = replaceCallack;
            };

            $history.removePastEntries = function(number) {
                var current = $history.urlStack[$history.activeIndex],
                    replacedIndex = $history.activeIndex-number,
                    replaced = $history.urlStack[replacedIndex];
                if (current.url !== replaced.url) {
                    $browser.stopOnUrlChangeListeners(function() {
                        if (current) {
                            $browser.url(current.url, true);
                            $history.urlStack[replacedIndex] = current;
                            current = null;
                        } else {
                            $browser.stopOnUrlChangeListeners(null);
                        }
                    });
                } else {
                    // Attention: angular does not call
                    // onUrlChanged listeners if we are going back 
                    // in history to the same url where we already are.
                    // Therefore we cannot use $browser.stopOnUrlChangeListeners
                    // in this case!
                    // Note: angular-mocks does not simulate this correctly :-(
                    $history.urlStack[replacedIndex] = current;
                }
                $history.go(-number);
            };


            $browser.url = function (url, replace) {
                if (url) {
                    // setter
                    var res = _url.call(this, url, replace === true);
                    $history.onUrlChangeProgrammatically(url, replace === true, replace==='back');
                    return res;
                } else {
                    // getter
                    return _url.apply(this, arguments);
                }
            };
            return $browser;
        }
    }

    function $historyFactory() {
        var $history;
        return $history = {
            go:go,
            goBack:goBack,
            urlStack:[],
            indexOf: indexOf,
            activeIndex:-1,
            fromUrlChange:false,
            onUrlChangeProgrammatically:onUrlChangeProgrammatically,
            onUrlChangeBrowser:onUrlChangeBrowser
        };

        function go(relativeIndex) {
            // Always execute history.go asynchronously.
            // This is required as firefox and IE10 trigger the popstate event
            // in sync. By using a setTimeout we have the same behaviour everywhere.
            // Don't use $defer here as we don't want to trigger another digest cycle.
            // Note that we need at least 20ms to ensure that
            // the hashchange/popstate event for the current page
            // as been delivered (in IE this can take some time...).
            window.setTimeout(function() {
                window.history.go(relativeIndex);
            },20);
        }

        function goBack() {
            $history.go(-1);
        }

        function indexOf(url) {
            var i,
                urlStack = $history.urlStack;
            for (i=0; i<urlStack.length; i++) {
                if (urlStack[i].url===url) {
                    return i;
                }
            }
            return -1;
        }

        function findInPast(url) {
            var index = $history.activeIndex-1;
            while (index >= 0 && $history.urlStack[index].url !== url) {
                index--;
            }
            return index;
        }

        function onUrlChangeBrowser(url) {
            var oldIndex = $history.activeIndex;
            $history.activeIndex = indexOf(url);
            if ($history.activeIndex === -1) {
                onUrlChangeProgrammatically(url, false);
            } else {
                $history.lastIndexFromUrlChange = oldIndex;
            }
        }

        function onUrlChangeProgrammatically(url, replace, back) {
            var currentEntry = $history.urlStack[$history.activeIndex];
            if (!currentEntry || currentEntry.url !== url) {
                $history.lastIndexFromUrlChange = -1;
                if (!replace) {
                    $history.activeIndex++;
                }
                $history.urlStack.splice($history.activeIndex, $history.urlStack.length - $history.activeIndex);
                $history.urlStack.push({url: url});
            }
            if (back) {
                var currIndex = $history.activeIndex;
                var newIndex = findInPast(url);
                if (newIndex !== -1 && currIndex !== -1) {
                    $history.removePastEntries(currIndex - newIndex);
                }
            }
        }
    }
})(window.jQuery, window.angular);
/**
 * This combines the routing of angular and jquery mobile. In detail, it deactivates the routing in jqm
 * and reuses that of angular.
 */
(function (angular, $) {
    var DEFAULT_JQM_PAGE = 'DEFAULT_JQM_PAGE',
        mod = angular.module("ng");

    disableJqmHashChange();

    // html5 mode is always required, so we are able to allow links like
    // <a href="somePage.html"> to load external pages.
    mod.config(['$locationProvider', function ($locationProvider) {
        $locationProvider.html5Mode(true);
        $locationProvider.hashPrefix('!');
    }]);

    mod.directive('ngView', function () {
        throw new Error("ngView is not allowed and not needed with the jqm adapter.");
    });

    patchAngularToAllowVclicksOnEmptyAnchorTags();

    mod.config(['$routeProvider', configMobileRoutes]);
    mod.run(["$rootScope", "$location", applyRouteOverrideOnRouteChangeStart]);
    mod.run(["$rootScope", "$route", "$routeParams", "$location", "$history", onPageShowEvalOnActivateAndUpdateDialogUrls]);
    mod.run(["$rootScope", "$route", "$location", "$browser", "$history",applyDefaultNavigationOnRouteChangeSuccess]);
    mod.run(["$rootScope", "$location", "$history", instrumentDialogCloseToNavigateBackWhenOpenedByRouting]);
    mod.config(['$provide', function ($provide) {
        $provide.decorator('$location', ['$delegate', locationRouteOverrideDecorator]);
    }]);

    function patchAngularToAllowVclicksOnEmptyAnchorTags() {
        // Problem 1:
        // Angular has a directive for links with an empty "href" attribute.
        // This directive has a click-listener which prevents the default action
        // and stops the propagation of the event to parent elements.
        // However, for simulating vclicks in desktop browsers, jQuery Mobile has a click-listener
        // on the document. As angular stops propagation of the event, jQuery Mobile never
        // receives it and therefore never fires the vclick event.

        // Problem 2:
        // Links with a href-Attribute of value "#" are noops in plain jquery mobile apps
        // (see e.g. the close button of dialogs).
        // However, angular interprets such links as a normal link and by this updates
        // the hash of $location-service to be empty.

        // Solution part1: new directive that sets the href-Attribute of all links to "#". By this,
        // the mentioned angular directive for links with empty href-Attributes does no more apply
        mod.directive('a', allowEmptyAnchorLinkDirective);
        // Solution part2: patch the listener for clicks in angular that updates $location to only be executed
        // when the href-Attribute of a link is not equal to "#". Otherwise still prevent the default action,
        // so that the browser does not update the browser location directly.
        // Here we just prevent angular from installing it's default click handler
        // and create our own.
        mod.config(['$locationProvider', replaceDefaultClickHandlerLocationDecorator]);
    }

    return;


    // ------------------

    function locationRouteOverrideDecorator($location) {
        $location.routeOverride = function (routeOverride) {
            if (arguments.length === 0) {
                return $location.$$routeOverride;
            }
            $location.$$routeOverride = routeOverride;
            return this;
        };

        // If we start the app with a url like
        // index.html?a=b#!/somePage.html, i.e.
        // we have a search parameter and load an external subpage,
        // then angular does not parse the given hashbang url correctly.
        // Here, we correct the wrong parsing.
        var hash = $location.hash();
        if (hash && hash.indexOf('!') === 0) {
            $location.search({});
            $location.url(hash.substring(1));
        }

        return $location;
    }

    // This needs to be outside of a angular config callback, as jqm reads this during initialization.
    function disableJqmHashChange() {
        $.mobile.pushStateEnabled = false;
        $.mobile.hashListeningEnabled = false;
        $.mobile.linkBindingEnabled = false;
        $.mobile.changePage.defaults.changeHash = false;
        $.mobile._handleHashChange = function () {
        };
        // We deactivate dynamic base tag,
        // e.g. so that xhrs are always against the
        // url with which the app was started!
        if ($.support.dynamicBaseTag) {
            $.support.dynamicBaseTag = false;
            $.mobile.base.set = function () {
            };
        }
        $.mobile.changePage.defaults.allowSamePageTransition = true;
        var _add = $.mobile.urlHistory.add;
        $.mobile.urlHistory.add = function() {
            var res = _add.apply(this, arguments);
            var history = $.mobile.urlHistory,
                stack = history.stack,
                removeEntries = stack.length-3;
            if (stack.length>3) {
                stack.splice(0, removeEntries);
                history.activeIndex -= removeEntries;
                if (history.activeIndex<0) {
                    history.activeIndex = 0;
                }
            }
            return res;
        };
    }


    function configMobileRoutes($routeProvider) {
        var _when = $routeProvider.when;
        $routeProvider.when = function (path, params) {
            if (!params.templateUrl && !params.redirectTo) {
                throw new Error("Only routes with templateUrl or redirectTo are allowed with the jqm adapter!");
            }
            if (params.controller) {
                throw new Error("Controllers are not allowed on routes with the jqm adapter. However, you may use the onActivate parameter");
            }
            return _when.apply(this, arguments);
        };

        $routeProvider.otherwise({
            templateUrl:DEFAULT_JQM_PAGE
        });
    }

    function getBasePath(path) {
        return path.substr(0, path.lastIndexOf('/'));
    }

    function applyRouteOverrideOnRouteChangeStart($rootScope, $location) {
        $rootScope.$on('$routeChangeStart', function(event, newRoute) {
            // always clone the original jqmOptions as we might modify them 
            // afterwards...
            newRoute.jqmOptions = angular.extend({}, newRoute.jqmOptions);
            var routeOverride = $location.$$routeOverride;
            delete $location.$$routeOverride;
            if (routeOverride) {
                if (routeOverride.onActivate) {
                    newRoute.onActivate = routeOverride.onActivate;
                }
                angular.extend(newRoute.jqmOptions, routeOverride.jqmOptions);

                newRoute.resolve = newRoute.resolve || {};
                angular.forEach(routeOverride.locals, function (value, key) {
                    newRoute.resolve[key] = function () {
                        return value;
                    };
                });
            }

            // Prevent angular from loading the template, as jquery mobile already does this!
            newRoute.ngmTemplateUrl = newRoute.templateUrl;
            newRoute.templateUrl = undefined;
        });
    }

    function onPageShowEvalOnActivateAndUpdateDialogUrls($rootScope, $route, $routeParams, $location, $history) {
        $(document).on("pagebeforechange", saveLastNavInfoIntoActivePage);

        $rootScope.$on("pagebeforeshow", pageBeforeShowHandler);
        function pageBeforeShowHandler(scope, event) {
            var activePage = $(event.target);
            var jqmNavInfo = activePage.data("lastNavProps");
            if (!jqmNavInfo || !jqmNavInfo.navByNg) {
                return;
            }
            var currentRoute = $route.current,
                onActivateParams,
                currentHistoryEntry = $history.urlStack[$history.activeIndex];
            if (currentHistoryEntry) {
                $.mobile.urlHistory.getActive().lastScroll = currentHistoryEntry.lastScroll;
            }
            if (isDialog(activePage)) {
                currentHistoryEntry.tempUrl = true;
            } else if (isNormalPage(activePage)) {
                removePastTempPages($history);
            }
            if (currentRoute && currentRoute.onActivate) {
                onActivateParams = angular.extend({}, currentRoute.locals, $routeParams);
                activePage.scope().$eval(currentRoute.onActivate, onActivateParams);
            }
        }

        function saveLastNavInfoIntoActivePage(event, data) {
            if (typeof data.toPage === 'object') {
                data.toPage.data("lastNavProps", data.options);
            }
        }

        function removePastTempPages($history) {
            var i = $history.activeIndex-1, removeCount = 0;
            while (i>=0 && $history.urlStack[i].tempUrl) {
                removeCount++;
                i--;
            }
            if (removeCount>0) {
                $history.removePastEntries(removeCount);
            }
        }
    }

    function isDialog(page) {
        return page && page.jqmData("role") === "dialog";
    }

    function isNormalPage(page) {
        return page && page.jqmData("role") === "page";
    }

    function applyDefaultNavigationOnRouteChangeSuccess($rootScope, $route, $location, $browser, $history) {
        $rootScope.$on('$routeChangeSuccess', function() {
            var newRoute = $route.current;
            if (newRoute.redirectTo) {
                return;
            }
            var $document = $(document);

            var url = newRoute.ngmTemplateUrl;
            if (url === DEFAULT_JQM_PAGE) {
                url = $location.url();
                // $location always yiels absolute urls...
                if (url && url.charAt(0)==='/') {
                    url = url.slice(1);
                }
            }
            url = $.mobile.path.makeUrlAbsolute(url, $browser.baseHref());
            var navConfig = newRoute.jqmOptions || {};
            restoreOrSaveTransitionForUrlChange(navConfig);
            navConfig.navByNg = true;

            if (!$.mobile.firstPage) {
                $rootScope.$on("jqmInit", startNavigation);
            } else {
                startNavigation();
            }

            function startNavigation() {
                $.mobile.changePage(url, navConfig);
            }

            function restoreOrSaveTransitionForUrlChange(navConfig) {
                var lastEntry,
                    currentEntry = $history.urlStack[$history.activeIndex];
                if (!currentEntry) {
                    // In some Unit-Testcases, there is no active $history entry.
                    // do nothing then...
                    return;
                }
                if ($history.lastIndexFromUrlChange >=0 ) {
                    // Navigating in the history
                    lastEntry = $history.urlStack[$history.lastIndexFromUrlChange];

                    var transitionHistoryEntry;
                    if ($history.lastIndexFromUrlChange > $history.activeIndex) {
                        navConfig.reverse = true;
                        transitionHistoryEntry = lastEntry;
                    } else {
                        transitionHistoryEntry = currentEntry;
                    }
                    if (transitionHistoryEntry && transitionHistoryEntry.jqmOptions) {
                        navConfig.transition = transitionHistoryEntry.jqmOptions.transition;
                    }
                } else {
                    // Creating new history entries...
                    lastEntry = $history.urlStack[$history.activeIndex - 1];
                    currentEntry.jqmOptions = navConfig;
                }
                if (lastEntry) {
                    lastEntry.lastScroll = $.mobile.urlHistory.getActive().lastScroll;
                }
            }
        });
    }

    function instrumentDialogCloseToNavigateBackWhenOpenedByRouting($rootScope, $location, $history) {
        var dialogProto = $.mobile.dialog.prototype;
        dialogProto.origClose = dialogProto.origClose || dialogProto.close;
        dialogProto.close = function () {
            var jqmNavInfo = $.mobile.activePage.data("lastNavProps");
            if (this._isCloseable && jqmNavInfo && jqmNavInfo.navByNg) {
                this._isCloseable = false;
                $rootScope.$apply(function () {
                    $history.goBack();
                });
            } else {
                this.origClose();
            }
        };
    }

    function defaultClickHandler(event, iElement, $scope, $location, $history) {
        // Attention: Do NOT stopPropagation, as otherwise
        // jquery Mobile will not generate a vclick event!
        var rel = iElement.jqmData("rel");
        if (rel === 'back') {
            event.preventDefault();
            $scope.$apply(function () {
                $history.goBack();
            });
        } else if (rel === 'popup') {
            // For popups, we don't want their hash in the url,
            // but only open the popup
            event.preventDefault();
            $scope.$apply(function() {
                var popup = $.mobile.activePage.find(iElement.attr('href'));
                if (popup.length) {
                    var offset = iElement.offset();
                    popup.popup( "open", {
                        x: offset.left + iElement.outerWidth() / 2,
                        y: offset.top + iElement.outerHeight() / 2,
                        transition: iElement.jqmData( "transition" ),
                        positionTo: iElement.jqmData( "position-to" )
                    });
                }
            });
        } else if (isNoopLink(iElement)) {
            event.preventDefault();
        } else {
            var absHref = iElement.prop('href'),
                rewrittenUrl = $location.$$rewriteAppUrl(absHref),
                ajax = iElement.jqmData("ajax");

            if (absHref && !iElement.attr('target') && ajax !== false && rel !== 'external' && rewrittenUrl) {
                // See original angular default click handler:
                // update location manually
                $location.$$parse(rewrittenUrl);
                event.preventDefault();
                // hack to work around FF6 bug 684208 when scenario runner clicks on links
                window.angular['ff-684208-preventDefault'] = true;
                // Additional handling
                var override = $location.routeOverride() || {};
                var jqmOptions = override.jqmOptions = {
                    link:iElement
                };
                var trans = iElement.jqmData("transition");
                if (trans) {
                    jqmOptions.transition = trans;
                }
                var direction = iElement.jqmData("direction");
                if (direction) {
                    jqmOptions.reverse = direction === "reverse";
                }
                $location.routeOverride(override);
                $scope.$apply();
            }
        }
    }

    function isNoopLink(element) {
        var href = element.attr('href');
        return (href === '#' || !href);
    }

    function allowEmptyAnchorLinkDirective() {
        return {
            restrict:'E',
            compile:function (element, attr) {
                if (isNoopLink(element)) {
                    attr.$set('href', '#');
                }
            }
        };
    }

    function replaceDefaultClickHandlerLocationDecorator($locationProvider) {
        var orig$get = $locationProvider.$get;
        $locationProvider.$get = ['$injector', '$rootElement', '$rootScope', '$browser', '$history', function ($injector, $rootElement, $rootScope, $browser, $history) {
            var $location = preventClickHandlersOnRootElementWhileCalling($rootElement,
                function () {
                    return $injector.invoke(orig$get, $locationProvider);
                });
            // register our default click handler always at the document
            // and in a setTimeout, so that we are always later than
            // vclicks by jquery mobile. Needed e.g. for selectmenu popups
            // who change the link in a vclick.
            $(function() {
                $(document).bind('click', checkAndCallDefaultClickHandler);
            });
            // Note: Some of this click handler was copied from the original
            // default click handler in angular.
            function checkAndCallDefaultClickHandler(event) {
                // TODO(vojta): rewrite link when opening in new tab/window (in legacy browser)
                // currently we open nice url link and redirect then

                if (event.ctrlKey || event.metaKey || event.which === 2) {
                    return;
                }

                var elm = $(event.target);

                // traverse the DOM up to find first A tag
                while (angular.lowercase(elm[0].nodeName) !== 'a') {
                    // ignore rewriting if no A tag (reached root element, or no parent - removed from document)
                    if (elm[0] === $rootElement[0] || !(elm = elm.parent())[0]) {
                        return;
                    }
                }
                defaultClickHandler(event, elm, $rootScope, $location, $history);
            }
            return $location;
        }];
    }

    function preventClickHandlersOnRootElementWhileCalling($rootElement, callback) {
        var _bind = $.fn.bind;
        try {
            $.fn.bind = function (eventName) {
                if (eventName === 'click' && this[0] === $rootElement[0]) {
                    return;
                }
                return _bind.apply(this, arguments);
            };
            return callback();
        }
        finally {
            $.fn.bind = _bind;
        }
    }


})(angular, $);

(function ($, angular) {
    // Patch for ng-repeat to fire an event whenever the children change.
    // Only watching Scope create/destroy is not enough here, as ng-repeat
    // caches the scopes during reordering.

    function shallowEquals(collection1, collection2) {
        var x;
        if (!!collection1 ^ !!collection2) {
            return false;
        }
        if (!collection1) {
            return true;
        }
        if (angular.isArray(collection1)) {
            if (collection1.length !== collection2.length) {
                return false;
            }
        }
        for (x in collection1) {
            if (collection2[x] !== collection1[x]) {
                return false;
            }
        }
        for (x in collection2) {
            if (collection2[x] !== collection1[x]) {
                return false;
            }
        }
        return true;
    }

    function shallowClone(collection) {
        if (!collection) {
            return collection;
        }
        var res;
        if (angular.isArray(collection)) {
            res = [];
        } else {
            res = {};
        }
        for (var x in collection) {
            res[x] = collection[x];
        }
        return res;
    }

    var mod = angular.module('ng');
    mod.directive('ngRepeat', function () {
        return {
            priority:1000, // same as original repeat
            compile:function (element, attr, linker) {
                return {
                    pre:function (scope, iterStartElement, attr) {
                        var expression = attr.ngRepeat;
                        var match = expression.match(/^.+in\s+(.*)\s*$/);
                        if (!match) {
                            throw new Error("Expected ngRepeat in form of '_item_ in _collection_' but got '" +
                                expression + "'.");
                        }
                        var collectionExpr = match[1];
                        var lastCollection;
                        var changeCounter = 0;
                        scope.$watch(function () {
                            var collection = scope.$eval(collectionExpr);
                            if (!shallowEquals(collection, lastCollection)) {
                                lastCollection = shallowClone(collection);
                                changeCounter++;
                            }
                            return changeCounter;
                        }, function () {
                            // Note: need to be parent() as jquery cannot trigger events on comments
                            // (angular creates a comment node when using transclusion, as ng-repeat does).
                            iterStartElement.parent().trigger("$childrenChanged");
                        });
                    }
                };
            }
        };
    });
})($, angular);
(function ($, angular) {
    // This is a copy of parts of angular's ngOptions directive to detect changes in the values
    // of ngOptions (emits the $childrenChanged event on the scope).
    // This is needed as ngOptions does not provide a way to listen to changes.

    function sortedKeys(obj) {
        var keys = [];
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                keys.push(key);
            }
        }
        return keys.sort();
    }

    var NG_OPTIONS_REGEXP = /^\s*(.*?)(?:\s+as\s+(.*?))?(?:\s+group\s+by\s+(.*))?\s+for\s+(?:([\$\w][\$\w\d]*)|(?:\(\s*([\$\w][\$\w\d]*)\s*,\s*([\$\w][\$\w\d]*)\s*\)))\s+in\s+(.*)$/;
    var mod = angular.module('ng');
    mod.directive('ngOptions', ['$parse', function ($parse) {
        return {
            require: ['select', '?ngModel'],
            link:function (scope, element, attr, ctrls) {
                // if ngModel is not defined, we don't need to do anything
                if (!ctrls[1]) {
                    return;
                }

                var match;
                var optionsExp = attr.ngOptions;

                if (! (match = optionsExp.match(NG_OPTIONS_REGEXP))) {
                    throw new Error(
                        "Expected ngOptions in form of '_select_ (as _label_)? for (_key_,)?_value_ in _collection_'" +
                            " but got '" + optionsExp + "'.");
                }

                var displayFn = $parse(match[2] || match[1]),
                    valueName = match[4] || match[6],
                    keyName = match[5],
                    groupByFn = $parse(match[3] || ''),
                    valueFn = $parse(match[2] ? match[1] : valueName),
                    valuesFn = $parse(match[7]);

                scope.$watch(optionsModel, function() {
                    element.trigger("$childrenChanged");
                }, true);

                function optionsModel() {
                    var optionGroups = [], // Temporary location for the option groups before we render them
                        optionGroupName,
                        values = valuesFn(scope) || [],
                        keys = keyName ? sortedKeys(values) : values,
                        length,
                        index,
                        locals = {};

                    // We now build up the list of options we need (we merge later)
                    length = keys.length;
                    for (index = 0; index < length; index++) {
                        var value = values[index];
                        locals[valueName] = values[keyName ? locals[keyName]=keys[index]:index];
                        optionGroupName = groupByFn(scope, locals);
                        optionGroups.push({
                            id: keyName ? keys[index] : index,   // either the index into array or key from object
                            label: displayFn(scope, locals), // what will be seen by the user
                            optionGroup: optionGroupName
                        });
                    }
                    return optionGroups;
                }
            }
        };
    }]);


})($, angular);
(function (angular) {
    var ng = angular.module("ng");
    ng.directive('option', ['$interpolate', function ($interpolate) {
        return {
            restrict:'E',
            compile:function (tElement, tAttrs) {
                var textInterpolateFn = $interpolate(tElement.text(), true);
                var valueInterpolateFn = tElement.attr('value');
                if (valueInterpolateFn !== false && typeof valueInterpolateFn !== 'undefined') {
                    valueInterpolateFn = $interpolate(tElement.attr('value'), true);
                }
                return function (scope, iElement, iAttrs) {
                    scope.$watch(textInterpolateFn, function () {
                        iElement.trigger("$childrenChanged");
                    });
                    scope.$watch(valueInterpolateFn, function () {
                        iElement.trigger("$childrenChanged");
                    });
                };
            }
        };
    }]);
})(angular);

(function (angular) {
    var ng = angular.module("ng");
    ng.directive('li', function() {
        return {
            restrict:'E',
            compile:function (tElement, tAttrs) {
                return function (scope, iElement, iAttrs) {
                    iElement.bind("$childrenChanged", function () {
                        iElement.removeClass(function(a,css) { return (css.match (/\bui-\S+/g) || []).join(' '); });
                        var buttonElements = iElement.data("buttonElements");
                        if (buttonElements) {
                            var text = buttonElements.text;
                            while (text.firstChild) {
                                iElement[0].appendChild(text.firstChild);
                            }
                            $(buttonElements.inner).remove();
                        }
                        iElement.removeData("buttonElements");
                    });
                };
            }
        };
    });
})(angular);
(function (angular) {
    // Patch for ng-switch to fire an event whenever the children change.

    var ng = angular.module("ng");
    ng.directive("ngSwitch",
        function () {
            return {
                restrict:'EA',
                compile:function (element, attr) {
                    var watchExpr = attr.ngSwitch || attr.on;
                    return function (scope, element) {
                        scope.$watch(watchExpr, function (value) {
                            element.trigger("$childrenChanged");
                        });
                    };
                }
            };
        });
})(angular);
(function (angular) {
    // Patch for ng-include to fire an event whenever the children change.

    var ng = angular.module("ng");
    ng.directive("ngInclude",
        function () {
            return {
                restrict:'ECA',
                compile:function (element, attr) {
                    var srcExp = attr.ngInclude || attr.src;
                    return function (scope, element) {
                        scope.$watch(srcExp, function (src) {
                            element.trigger("$childrenChanged");
                        });
                        scope.$on("$includeContentLoaded", function() {
                            element.trigger("$childrenChanged");
                        });
                    };
                }
            };
        });
})(angular);
(function ($, angular) {
    var mod = angular.module('ng');

    function inputDirectivePatch() {
        return {
            restrict:'E',
            require:'?ngModel',
            compile:function (tElement, tAttrs) {
                var type = tElement.attr('type');
                return {
                    pre:function (scope, iElement, iAttrs, ctrl) {
                        if (!ctrl) {
                            return;
                        }
                        var listenToEvents = [];
                        if (type === 'date') {
                            // Angular binds to the input or keydown+change event.
                            // However, date inputs on IOS5 do not fire any of those (only the blur event).
                            // See ios5 bug TODO
                            listenToEvents.push("blur");
                        }
                        // always bind to the change event, if angular would only listen to the "input" event.
                        // Needed as jqm often fires change events when the input widgets change...
                        listenToEvents.push("change");

                        var _bind = iElement.bind;
                        iElement.bind = function (events, callback) {
                            if (events.indexOf('input') !== -1 || events.indexOf('change') !== -1) {
                                for (var i=0; i<listenToEvents.length; i++) {
                                    var event = listenToEvents[i];
                                    if (events.indexOf(event)===-1) {
                                        events+=" "+event;
                                    }
                                }
                            }
                            return _bind.call(this, events, callback);
                        };
                    }
                };
            }
        };
    }

    mod.directive("input", inputDirectivePatch);
    mod.directive("textarea", inputDirectivePatch);
})($, angular);

(function (angular) {
    /*
     * Defines the ng:if tag. This is useful if jquery mobile does not allow
     * an ng-switch element in the dom, e.g. between ul and li.
     */
    var ngIfDirective = {
        transclude:'element',
        priority:1000,
        terminal:true,
        compile:function (element, attr, linker) {
            return function (scope, iterStartElement, attr) {
                iterStartElement[0].doNotMove = true;
                var expression = attr.ngmIf;
                var lastElement;
                var lastScope;
                scope.$watch(expression, function (newValue) {
                    if (lastElement) {
                        lastElement.remove();
                        lastElement = null;
                    }
                    if (lastScope) {
                        lastScope.$destroy();
                        lastScope = null;
                    }
                    if (newValue) {
                        lastScope = scope.$new();
                        linker(lastScope, function (clone) {
                            lastElement = clone;
                            iterStartElement.after(clone);
                        });
                    }
                    // Note: need to be parent() as jquery cannot trigger events on comments
                    // (angular creates a comment node when using transclusion, as ng-repeat does).
                    iterStartElement.parent().trigger("$childrenChanged");
                });
            };
        }
    };
    var ng = angular.module('ng');
    ng.directive('ngmIf', function () {
        return ngIfDirective;
    });
})(angular);

(function (angular) {
    var mod = angular.module('ng');


    // See http://jquerymobile.com/demos/1.2.0/docs/api/events.html
    var jqmEvents = ['tap', 'taphold', 'swipe', 'swiperight', 'swipeleft', 'vmouseover',
        'vmouseout',
        'vmousedown',
        'vmousemove',
        'vmouseup',
        'vclick',
        'vmousecancel',
        'orientationchange',
        'scrollstart',
        'scrollend',
        'pagebeforeshow',
        'pagebeforehide',
        'pageshow',
        'pagehide'
    ];
    var ngEvents = {'pagebeforeshow': true};
    var event, directive, i;
    for (i=0; i<jqmEvents.length; i++) {
        event = jqmEvents[i];
        directive = 'ngm' + event.substring(0, 1).toUpperCase() + event.substring(1);
        createEventDirective(directive, event, ngEvents[event]);
    }

    function registerEventHandler(scope, $parse, element, eventType, ngEvent, handler) {
        var fn = $parse(handler);
        if (ngEvent) {
            scope.$on(eventType, function(ngEvent, jqEvent) {
                fn(ngEvent.currentScope, {$event:jqEvent});
            });
        } else {
            element.bind(eventType, function (event) {
                scope.$apply(function() {
                    fn(scope, {$event:event});
                });
                if (eventType.charAt(0) === 'v') {
                    // This is required to prevent a second
                    // click event, see
                    // https://github.com/jquery/jquery-mobile/issues/1787
                    event.preventDefault();
                }
            });
        }
    }

    function createEventDirective(directive, eventType, ngEvent) {
        mod.directive(directive, ['$parse', function ($parse) {
            return function (scope, element, attrs) {
                var eventHandler = attrs[directive];
                registerEventHandler(scope, $parse, element, eventType, ngEvent, eventHandler);
            };
        }]);
    }

})(angular);
(function(angular) {
    var storageName = '$$sharedControllers';

    function storage(rootScope) {
        return rootScope[storageName] = rootScope[storageName] || {};
    }

    function sharedCtrl(rootScope, controllerName, $controller, usedInPage) {
        var store = storage(rootScope);
        var scopeInstance = store[controllerName];
        if (!scopeInstance) {
            scopeInstance = rootScope.$new();
            $controller(controllerName, {$scope: scopeInstance});
            store[controllerName] = scopeInstance;
            scopeInstance.$$referenceCount = 0;
        }
        scopeInstance.$$referenceCount++;
        usedInPage.bind("$destroy", function() {
            scopeInstance.$$referenceCount--;
            if (scopeInstance.$$referenceCount===0) {
                scopeInstance.$destroy();
                delete store[controllerName];
            }
        });
        return scopeInstance;
    }

    function parseSharedControllersExpression(expression) {
        var pattern = /([^\s,:]+)\s*:\s*([^\s,:]+)/g;
        var match;
        var hasData = false;
        var controllers = {};
        while (match = pattern.exec(expression)) {
            hasData = true;
            controllers[match[1]] = match[2];
        }
        if (!hasData) {
            throw "Expression " + expression + " needs to have the syntax <name>:<controller>,...";
        }
        return controllers;
    }

    var mod = angular.module('ng');
    mod.directive('ngmSharedController', ['$controller', function($controller) {
        return {
            scope: true,
            compile: function(element, attrs) {
                var expression = attrs.ngmSharedController;
                var controllers = parseSharedControllersExpression(expression);
                var preLink = function(scope) {
                    for (var name in controllers) {
                        scope[name] = sharedCtrl(scope.$root, controllers[name], $controller, element);
                    }
                };
                return {
                    pre: preLink
                };
            }
        };
    }]);
})(angular);
(function ($, angular) {

    function waitDialogFactory(rootScope) {

        var showCalls = [];

        function onClick(event) {
            var lastCall = showCalls[showCalls.length - 1];
            if (lastCall.callback) {
                rootScope.$apply(function () {
                    lastCall.callback.apply(this, arguments);
                });
            }
            // This is required to prevent a second
            // click event, see
            // https://github.com/jquery/jquery-mobile/issues/1787
            event.preventDefault();
        }

        var loadDialog;

        $(document).delegate(".ui-loader", "vclick", onClick);

        if (!$.mobile.loader.prototype.options.textWithCancel) {
            $.mobile.loader.prototype.options.textWithCancel = 'Loading. Click to cancel.';
        }

        function updateUi() {
            if (!$.mobile.firstPage) {
                rootScope.$on("jqmInit", updateUi);
                return;
            }
            if (showCalls.length > 0) {
                var lastCall = showCalls[showCalls.length - 1];
                var msg = lastCall.msg;
                if (msg) {
                    $.mobile.loading('show', {text:msg, textVisible:!!msg});
                } else {
                    $.mobile.loading('show');
                }
            } else {
                $.mobile.loading('hide');
            }
        }

        /**
         * jquery mobile hides the wait dialog when pages are transitioned.
         * This immediately closes wait dialogs that are opened in the pagebeforeshow event.
         */
        $(document).on('pageshow', 'div', function (event, ui) {
            updateUi();
        });

        /**
         *
         * @param msg (optional)
         * @param tapCallback (optional)
         */
        function show() {
            var msg, tapCallback;
            if (typeof arguments[0] === 'string') {
                msg = arguments[0];
            }
            if (typeof arguments[0] === 'function') {
                tapCallback = arguments[0];
            }
            if (typeof arguments[1] === 'function') {
                tapCallback = arguments[1];
            }

            showCalls.push({msg:msg, callback:tapCallback});
            updateUi();
        }

        function hide() {
            showCalls.pop();
            updateUi();
        }

        function always(promise, callback) {
            promise.then(callback, callback);
        }

        /**
         *
         * @param promise
         * @param msg (optional)
         */
        function waitFor(promise, msg) {
            show(msg);
            always(promise, function () {
                hide();
            });
        }

        /**
         *
         * @param deferred
         * @param cancelData
         * @param msg (optional)
         */
        function waitForWithCancel(deferred, cancelData, msg) {
            if (!msg) {
                msg = $.mobile.loader.prototype.options.textWithCancel;
            }
            show(msg, function () {
                deferred.reject(cancelData);
            });
            always(deferred.promise, function () {
                hide();
            });
        }

        return {
            show:show,
            hide:hide,
            waitFor:waitFor,
            waitForWithCancel:waitForWithCancel
        };
    }

    var mod = angular.module('ng');
    mod.factory('$waitDialog', ['$rootScope', waitDialogFactory]);
})($, angular);
(function ($, angular) {

    function pagedListFilterFactory(defaultListPageSize) {

        return function (list, stateProperty, operator) {
            if (!list) {
                return list;
            }
            if (!stateProperty) {
                throw new Error("Missing pager property");
            }
            var scope = this;
            var state = scope[stateProperty];
            if (!state) {
                state = scope[stateProperty] = {
                    loadMore: function() {
                        this.loadMoreCalled = true;
                    }
                };
            }
            var pageSize = operator ? (+operator) : defaultListPageSize;
            var endIndex = state.endIndex || pageSize;
            if (state.loadMoreCalled) {
                state.loadMoreCalled = false;
                endIndex += pageSize;
            }
            if (endIndex >= list.length) {
                endIndex = list.length;
            }
            if (endIndex < pageSize) {
                endIndex = pageSize;
            }
            state.hasMore = endIndex < list.length;
            state.endIndex = endIndex;
            state.cache = list.slice(0, endIndex);
            return state.cache;
        };
    }

    pagedListFilterFactory.$inject = ['defaultListPageSize'];
    var mod = angular.module(['ng']);
    mod.constant('defaultListPageSize', 10);
    mod.filter('paged', pagedListFilterFactory);
})($, angular);
});