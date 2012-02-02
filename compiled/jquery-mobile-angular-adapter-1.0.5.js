/**
 * jQuery Mobile angularJS adaper v1.0.5
 * http://github.com/tigbro/jquery-mobile-angular-adapter
 *
 * Copyright 2011, Tobias Bosch (OPITZ CONSULTING GmbH)
 * Licensed under the MIT license.
 */
(function() {

// Placeholder for the build process
;
/**
 * Simple implementation of require/define assuming all
 * modules are named, in one file and in the correct order.
 * This is just what r.js produces.
 * This implementation is used for creating standalone bundles
 * that do no more require require.js
 */
// This syntax is needed for the namespace function of r.js to work.
var requirejs, require, define;
(function (window) {

    if (typeof define !== "undefined") {
        //If a define is already in play via another AMD loader,
        //do not overwrite.
        return;
    }


    var defined = [];
    var def;
    define = def = function(name, deps, value) {
        var dotJs = name.indexOf('.js');
        if (dotJs!==-1) {
            name = name.substring(0, dotJs);
        }
        if (arguments.length==2) {
            // No deps...
            value = deps;
            deps = [];
        }
        if (typeof value === 'function') {
            var args = [];
            for (var i=0; i<deps.length; i++) {
                var dep = deps[i];
                args.push(defined[dep]);
            }
            value = value.apply(this, args);
        }
        defined[name] = value;
    }

    require = function(deps, callback) {
        if (typeof callback === 'function') {
            var args = [];
            for (var i=0; i<deps.length; i++) {
                var dep = deps[i];
                args.push(defined[dep]);
            }
            callback.apply(this, args);
        }

    }

    require.ready = $;
})(window);

/**
 * Wrapper around window.angular.
 */
define('angular',[], function() {
    if (typeof angular !== "undefined") {
        return angular;
    }
});

define('jquery',[], function() {
    if (typeof $ !== "undefined") {
        return $;
    }
});

/**
 * Global scope
 */
define('jqmng/globalScope',['jquery', 'angular'], function($, angular) {
    var onCreateListeners = [];

    /**
     * Widget to stop the page compilation at the body
     */
    angular.widget("body", function(element) {
        this.descend(false);
        this.directives(true);
        return function(element) {
            var scope = this;
            for (var i=0; i<onCreateListeners.length; i++) {
                onCreateListeners[i](scope);
            }
        }
    });

    var globalScope;

    /**
     * Return the global scope.
     * This equals the scope of the body element.
     */
    function getGlobalScope() {
        if (!globalScope) {
            globalScope = $("body").scope();
            if (!globalScope) {
                angular.compile($(document))();
            }
            globalScope = $("body").scope();
        }
        return globalScope;
    }

    function onCreate(listener) {
        onCreateListeners.push(listener);
    }

    $.mobile.globalScope = getGlobalScope;

    return {
        globalScope: getGlobalScope,
        onCreate: onCreate
    }
});

define('jqmng/navigate',['jquery', 'angular'], function($, angular) {
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
        var navigateOptions, pageId;
        callActivateFnOnPageChange(activateFunctionName, activateParams);
        if (typeof target === 'object') {
            navigateOptions = target;
            pageId = navigateOptions.target;
        } else {
            var parts = splitAtFirstColon(target);
            if (parts.length === 2 && parts[0] === 'back') {
                var pageId = parts[1];
                var relativeIndex = getIndexInStack(pageId);
                if (relativeIndex === undefined) {
                    pageId = jqmChangePage(pageId, {reverse: true});
                } else {
                    window.history.go(relativeIndex);
                }
                return;
            } else if (parts.length === 2) {
                navigateOptions = { transition: parts[0] };
                pageId = parts[1];
            } else {
                pageId = parts[0];
                navigateOptions = undefined;
            }
        }
        if (pageId === 'back') {
            window.history.go(-1);
        } else {
            jqmChangePage(pageId, navigateOptions);
        }
    }

    function jqmChangePage(pageId, navigateOptions) {
        if (pageId.charAt(0) !== '#') {
            pageId = '#' + pageId;
        }
        var callArgs = [pageId];
        if (navigateOptions) {
            callArgs.push(navigateOptions);
        }
        $.mobile.changePage.apply($.mobile, callArgs);
        return pageId;
    }


    angular.service('$navigate', function() {
        return navigate;
    });

    function getIndexInStack(pageId) {
        var stack = $.mobile.urlHistory.stack;
        var res = 0;
        var pageUrl;
        for (var i = stack.length - 2; i >= 0; i--) {
            pageUrl = stack[i].pageUrl;
            if (pageUrl === pageId) {
                return i - stack.length + 1;
            }
        }
        return undefined;
    }

    /**
     * Helper function to put the navigation part out of the controller into the page.
     * @param scope
     */
    angular.Object.navigate = function(scope) {
        var service = scope.$service("$navigate");
        if (arguments.length === 2) {
            // used without the test.
            service(arguments[1]);
            return;
        }
        // parse the arguments...
        var test = arguments[1];
        var outcomes = {};
        var parts;
        for (var i = 2; i < arguments.length; i++) {
            parts = splitAtFirstColon(arguments[i]);
            outcomes[parts[0]] = parts[1];
        }
        if (test && test.then) {
            // test is a promise.
            test.then(function(test) {
                if (outcomes[test]) {
                    service(outcomes[test]);
                } else if (outcomes.success) {
                    service(outcomes.success);
                }
            }, function(test) {
                if (outcomes[test]) {
                    service(outcomes[test]);
                } else if (outcomes.failure) {
                    service(outcomes.failure);
                }
            });
        } else {
            if (outcomes[test]) {
                service(outcomes[test]);
            } else if (test !== false && outcomes.success) {
                service(outcomes.success);
            } else if (test === false && outcomes.failure) {
                service(outcomes.failure);
            }
        }
    };

    return navigate;

});

/*
 * waitdialog service.
 */
define('jqmng/waitDialog',['jquery'], function($) {
    var showCalls = [];

    function onClick(event) {
        var lastCall = showCalls[showCalls.length - 1];
        if (lastCall.callback) {
            lastCall.callback.apply(this, arguments);
        }
        // This is required to prevent a second
        // click event, see
        // https://github.com/jquery/jquery-mobile/issues/1787
        event.preventDefault();
    }

    var loadDialog;

    function initIfNeeded() {
        if (!loadDialog || loadDialog.length == 0) {
            loadDialog = $(".ui-loader");
            loadDialog.bind('vclick', onClick);
        }
    }

    if (!$.mobile.loadingMessageWithCancel) {
        $.mobile.loadingMessageWithCancel = 'Loading. Click to cancel.';
    }

    function updateUi() {
        initIfNeeded();
        if (showCalls.length > 0) {
            var lastCall = showCalls[showCalls.length - 1];
            var msg = lastCall.msg;
            $.mobile.loadingMessage = msg;
            $.mobile.showPageLoadingMsg();
        } else {
            $.mobile.hidePageLoadingMsg();
        }
    }

    /**
     * jquery mobile hides the wait dialog when pages are transitioned.
     * This immediately closes wait dialogs that are opened in the pagebeforeshow event.
     */
    $('div').live('pageshow', function(event, ui) {
        updateUi();
    });

    /**
     *
     * @param msg (optional)
     * @param tapCallback (optional)
     */
    function show() {
        var msg, tapCallback;
        if (typeof arguments[0] == 'string') {
            msg = arguments[0];
        }
        if (typeof arguments[0] == 'function') {
            tapCallback = arguments[0];
        }
        if (typeof arguments[1] == 'function') {
            tapCallback = arguments[1];
        }
        if (!msg) {
            msg = $.mobile.loadingMessage;
        }

        showCalls.push({msg: msg, callback: tapCallback});
        updateUi();
    }

    function hide() {
        showCalls.pop();
        updateUi();
    }

    /**
     *
     * @param promise
     * @param msg (optional)
     */
    function waitFor(promise, msg) {
        show(msg);
        promise.always(function() {
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
            msg = $.mobile.loadingMessageWithCancel;
        }
        show(msg, function() {
            deferred.reject(cancelData);
        });
        deferred.always(function() {
            hide();
        });
    }

    var res = {
        show: show,
        hide: hide,
        waitFor: waitFor,
        waitForWithCancel:waitForWithCancel
    };

    angular.service('$waitDialog', function() {
        return res;
    });

    return res;
});

define('jqmng/event',['angular'], function(angular) {
    /* A widget for clicks.
     * Just as ng:click, but reacts to the jquery mobile vclick event, which
     * includes taps, mousedowns, ...
     */
    angular.directive("ngm:click", function(expression, element) {
        return angular.directive('ngm:event')('{vclick:"' + expression + '"}', element);
    });

    /**
     * A widget to bind general events like touches, ....
     */
    angular.directive("ngm:event", function(expression, element) {
        var eventHandlers = angular.fromJson(expression);

        var linkFn = function($updateView, element) {
            for (var eventType in eventHandlers) {
                registerEventHandler(this, $updateView, element, eventType, eventHandlers[eventType]);
            }
        };
        linkFn.$inject = ['$updateView'];
        return linkFn;
    });

    function registerEventHandler(scope, $updateView, element, eventType, handler) {
        element.bind(eventType, function(event) {
            var res = scope.$tryEval(handler, element);
            $updateView();
            if (eventType.charAt(0) == 'v') {
                // This is required to prevent a second
                // click event, see
                // https://github.com/jquery/jquery-mobile/issues/1787
                event.preventDefault();
            }
        });
    }

    function createEventDirective(directive, eventType) {
        angular.directive('ngm:' + directive, function(eventHandler) {
            var linkFn = function($updateView, element) {
                registerEventHandler(this, $updateView, element, eventType, eventHandler);
            };
            linkFn.$inject = ['$updateView'];
            return linkFn;
        });
    }

    var eventDirectives = {taphold:'taphold',swipe:'swipe', swiperight:'swiperight',
        swipeleft:'swipeleft',
        pagebeforeshow:'pagebeforeshow',
        pagebeforehide:'pagebeforehide',
        pageshow:'pageshow',
        pagehide:'pagehide',
        click:'vclick'
    };
    for (var directive in eventDirectives) {
        createEventDirective(directive, eventDirectives[directive])
    }

});

define('jqmng/fadein',['angular'], function(angular) {
    /*
     * Directive that fades in an element when angular
     * uses it. Useful in templating when the underlying template changed.
     */
    angular.directive("ngm:fadein", function(expression, element) {
        this.directives(true);
        this.descend(true);
        element.css({opacity:0.1});
        return function(element) {
            element.animate({opacity:1.0}, parseInt(expression));
        };
    });

});

/*
 * Defines the ng:if tag. This is useful if jquery mobile does not allow
 * an ng:switch element in the dom, e.g. between ul and li.
 * Uses ng:repeat and angular.Object.iff under the hood.
 */
define('jqmng/if',['angular'], function(angular) {
    angular.Object.iff = function(self, test, trueCase, falseCase) {
        if (test) {
            return trueCase;
        } else {
            return falseCase;
        }
    }

    angular.widget('@ngm:if', function(expression, element) {
        var newExpr = 'ngmif in $iff(' + expression + ",[1],[])";
        element.removeAttr('ngm:if');
        return angular.widget('@ng:repeat').call(this, newExpr, element);
    });
});

/**
 * Paging Support for lists.
 * Note that this will cache the result of two calls until the next eval cycle
 * or a change to the filter or orderBy arguments.
 * <p>
 * Operations on the result:
 * - hasMorePages: returns whether there are more pages that can be loaded via loadNextPage
 * - loadNextPage: Loads the next page of the list
 *
 * Usage:
 <li ng:repeat="l in list.$paged()">{{l}}</li>
 <li ngm:if="list.$paged().hasMorePages()">
 <a href="#" ngm:click="list.$paged().loadNextPage()">Load more</a>
 </li>
 */
define('jqmng/paging',['jquery', 'angular', 'jqmng/globalScope'], function($, angular, globalScope) {
    /**
     * The default page size for all lists.
     * Can be overwritten using array.pageSize.
     */
    if (!$.mobile.defaultListPageSize) {
        $.mobile.defaultListPageSize = 10;
    }

    var globalEvalId = 0;
    globalScope.onCreate(function(scope) {
        scope.$onEval(-99999, function() {
            globalEvalId++;
        });
    });

    var enhanceFunctions = {
        init : init,
        refresh : refresh,
        refreshIfNeeded : refreshIfNeeded,
        setFilter : setFilter,
        setOrderBy : setOrderBy,
        loadNextPage : loadNextPage,
        hasMorePages : hasMorePages,
        reset : reset
    };

    var usedProps = {
        pageSize: true,
        originalList: true,
        refreshNeeded: true,
        filter: true,
        orderBy: true,
        loadedCount: true,
        availableCount: true,
        evalId: true
    }


    function createPagedList(list) {
        var res = [];
        for (var fnName in enhanceFunctions) {
            res[fnName] = enhanceFunctions[fnName];
        }
        res.init(list);
        var oldHasOwnProperty = res.hasOwnProperty;
        res.hasOwnProperty = function(propName) {
            if (propName in enhanceFunctions || propName in usedProps) {
                return false;
            }
            return oldHasOwnProperty.apply(this, arguments);
        }
        return res;
    }

    function init(list) {
        if (list.pageSize) {
            this.pageSize = list.pageSize;
        } else {
            this.pageSize = $.mobile.defaultListPageSize;
        }
        this.originalList = list;
        this.refreshNeeded = true;
        this.reset();
    }

    function refresh() {
        var list = this.originalList;
        if (this.filter) {
            list = angular.Array.filter(list, this.filter);
        }
        if (this.orderBy) {
            list = angular.Array.orderBy(list, this.orderBy);
        }
        var loadedCount = this.loadedCount;
        if (loadedCount<this.pageSize) {
            loadedCount = this.pageSize;
        }
        if (loadedCount>list.length) {
            loadedCount = list.length;
        }
        this.loadedCount = loadedCount;
        this.availableCount = list.length;
        var newData = list.slice(0, loadedCount);
        var spliceArgs = [0, this.length].concat(newData);
        this.splice.apply(this, spliceArgs);
    }

    function refreshIfNeeded() {
        if (this.evalId != globalEvalId) {
            this.refreshNeeded = true;
            this.evalId = globalEvalId;
        }
        if (this.refreshNeeded) {
            this.refresh();
            this.refreshNeeded = false;
        }
        return this;
    }

    function setFilter(filterExpr) {
        if (!angular.Object.equals(this.filter, filterExpr)) {
            this.filter = filterExpr;
            this.refreshNeeded = true;
        }
    }

    function setOrderBy(orderBy) {
        if (!angular.Object.equals(this.orderBy, orderBy)) {
            this.orderBy = orderBy;
            this.refreshNeeded = true;
        }
    }

    function loadNextPage() {
        this.loadedCount = this.loadedCount + this.pageSize;
        this.refreshNeeded = true;
    }

    function hasMorePages() {
        this.refreshIfNeeded();
        return this.loadedCount < this.availableCount;
    }

    function reset() {
        this.loadedCount = 0;
        this.refreshNeeded = true;
    }

    /**
     * Returns the already loaded pages.
     * Also includes filtering (second argument) and ordering (third argument),
     * as the standard angular way does not work with paging.
     *
     * Does caching: Evaluates the filter and order expression only once in an eval cycle.
     * ATTENTION: There can only be one paged list per original list.
     */
    angular.Array.paged = function(list, filter, orderBy) {
        var pagedList = list.pagedList;
        if (!pagedList) {
            pagedList = createPagedList(list);
            list.pagedList = pagedList;
        }
        pagedList.setFilter(filter);
        pagedList.setOrderBy(orderBy);
        pagedList.refreshIfNeeded();
        return pagedList;

    };
});

define('jqmng/sharedController',['angular'], function(angular) {
    function findCtrlFunction(name) {
        var parts = name.split('.');
        var base = window;
        var part;
        for (var i = 0; i < parts.length; i++) {
            part = parts[i];
            base = base[part];
        }
        return base;
    }

    function sharedCtrl(rootScope, name) {
        var ctrl = findCtrlFunction(name);
        var instance = rootScope[name];
        if (!instance) {
            instance = rootScope.$new(ctrl);
            rootScope[name] = instance;
        }
        return instance;
    }

    function parseSharedControllersExpression(expression) {
        var pattern = /([^\s,:]+)\s*:\s*([^\s,:]+)/g;
        var match;
        var hasData = false;
        var controllers = {}
        while (match = pattern.exec(expression)) {
            hasData = true;
            controllers[match[1]] = match[2];
        }
        if (!hasData) {
            throw "Expression " + expression + " needs to have the syntax <name>:<controller>,...";
        }
        return controllers;
    }

    angular.directive('ngm:shared-controller', function(expression) {
        this.scope(true);
        var controllers = parseSharedControllersExpression(expression);
        return function(element) {
            var scope = this;
            for (var name in controllers) {
                scope[name] = sharedCtrl(scope.$root, controllers[name]);
            }
        }

    });
});

/**
 * Integration of the page widget.
 */
define('jqmng/widgets/pageCompile',['jquery', 'angular', 'jqmng/globalScope'], function($, angular, globalScope) {
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
        // Do NOT use childScope here:
        // The page may have created an own scope by using ng:controller,
        // and we only eval that child scope!
        page.scope().$onEval(99999, function() {
            if (createJqmWidgetsFlag) {
                createJqmWidgetsFlag = false;
                page.trigger('create');
            }
        });
        page.bind('requestrefresh', function() {
            createJqmWidgetsFlag = true;
        });
        page.trigger("pagecreate");
    });

    /**
     * For refreshing widgets we implement a new strategy for jquery mobile:
     * When new elements are added or removed to the dom, the requestrefresh event is fired on those elements.
     * All elements that have a refresh event and through which the event passes are marked.
     * During the next page create event those widgets automatically refresh themselves.
     * The page create event is automatically fired at the end of every eval, when at least one requestrefresh
     * event happened.
     */
    function installFireRequestrefreshEventWhenElementsAreRemoved() {
        var _cleanData = $.cleanData;
        $.cleanData = function(elems) {
            for (var i = 0, elem; (elem = elems[i]) != null; i++) {
                $(elem).trigger("requestrefresh");
            }
            _cleanData(elems);
        };
    }

    installFireRequestrefreshEventWhenElementsAreRemoved();

    /**
     * Directive for fireing the requestrefresh event when new elements are created by angular.
     * This directive is used by our enhanced ng:repeat and ng:switch widgets.
     */
    angular.directive("ngm:createwidgets", function(expression) {
        return function(element) {
            element.trigger('requestrefresh');

        };
    });

    function instrumentRefreshOnInit(widget) {
        var _create = widget.prototype._create;
        widget.prototype._create = function() {
            var res = _create.apply(this, arguments);
            var self = this;
            this.element.bind("requestrefresh", function() {
                self.requestrefresh = true;
            });
            return res;
        };
        // the _init function is called whenever the widget is
        // called like this: element.widget().
        // This happens every time the create event is fired through jquery mobile.
        var _init = widget.prototype._init;
        widget.prototype._init = function() {
            var res = _init.apply(this, arguments);
            if (this.requestrefresh) {
                this.requestrefresh = false;
                this.refresh();
            }
            return res;

        }
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

    $('div').live('jqmngpagebeforeshow', function(event, data) {
        var currPageScope = $(event.target).scope();
        if (currPageScope) {
            setCurrScope(currPageScope);
            currPageScope.$service("$updateView")();
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

    var currScope = null;

    function setCurrScope(scope) {
        currScope = scope;
    }

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

    return {
        setCurrScope: setCurrScope
    }
});

/**
 * Helper functions for proxying jquery widgets and angular widgets.
 */
define('jqmng/widgets/widgetProxyUtil',['jquery', 'angular', 'jqmng/globalScope'], function($, angular, globalScope) {
    /**
     * Creates a proxy around an existing angular widget.
     * Needed to use the angular functionalities like disabled handling,
     * invalidWidgets marking, formatting and validation.
     * @param tagname
     * @param compileFn
     */
    function createAngularWidgetProxy(tagname, compileFn) {

        var oldWidget = angular.widget(tagname);
        angular.widget(tagname, function() {
            var oldBinder;
            var bindFn = compileFn.apply(this, arguments);
            var newBinder = function() {
                var elementArgumentPos = (oldBinder && oldBinder.$inject && oldBinder.$inject.length) || 0;
                var element = arguments[elementArgumentPos];
                var self = this;
                var myargs = arguments;
                var oldBinderCalled = false;
                var res;
                if (bindFn) {
                    res = bindFn.call(this, element, function() {
                        oldBinderCalled = true;
                        return oldBinder && oldBinder.apply(self, myargs);
                    });
                }
                if (!oldBinderCalled) {
                    return oldBinder && oldBinder.apply(self, myargs);
                }
                return res;
            }
            // execute the angular compiler after our compiler!
            oldBinder = oldWidget && oldWidget.apply(this, arguments);
            if (!oldWidget) {
                this.descend(true);
                this.directives(true);
            }

            newBinder.$inject = oldBinder && oldBinder.$inject;
            return newBinder;
        });
    }

    /**
     * Creates a proxy around an existing angular directive.
     * Needed e.g. to intercept the disabled handling, ...
     * @param directiveName
     * @param compileFn
     */
    function createAngularDirectiveProxy(directiveName, compileFn) {
        var oldDirective = angular.directive(directiveName);
        angular.directive(directiveName, function(expression) {
            var oldBinder = oldDirective.apply(this, arguments);
            var bindFn = compileFn(expression);
            var newBinder = function() {
                var elementArgumentPos = (oldBinder.$inject && oldBinder.$inject.length) || 0;
                var element = arguments[elementArgumentPos];
                var scope = this;
                var res = oldBinder.apply(this, arguments);
                bindFn.call(this, element);
                return res;
            }
            newBinder.$inject = oldBinder.$inject;
            return newBinder;
        });
    }

    return {
        createAngularDirectiveProxy: createAngularDirectiveProxy,
        createAngularWidgetProxy: createAngularWidgetProxy
    }
});

define('jqmng/widgets/angularRepeat',['jqmng/widgets/widgetProxyUtil'], function(proxyUtil) {
    /**
     * Modify original ng:repeat so that all created items directly have a parent
     * (old style repeat). This is slower, however simplifies the integration with jquery mobile a lot!
     * <p>
     * This also takes care for jquery widgets wrapping themselves into other elements
     * (e.g. setting a div as new parent).
     */
    angular.widget('@ng:repeat', function(expression, element) {
        element.attr('ngm:createwidgets', 'true');
        element.removeAttr('ng:repeat');
        element.replaceWith(angular.element('<!-- ng:repeat: ' + expression + ' -->'));
        var linker = this.compile(element);
        return function(iterStartElement) {
            var match = expression.match(/^\s*(.+)\s+in\s+(.*)\s*$/),
                lhs, rhs, valueIdent, keyIdent;
            if (! match) {
                throw Error("Expected ng:repeat in form of '_item_ in _collection_' but got '" +
                    expression + "'.");
            }
            lhs = match[1];
            rhs = match[2];
            match = lhs.match(/^([\$\w]+)|\(([\$\w]+)\s*,\s*([\$\w]+)\)$/);
            if (!match) {
                throw Error("'item' in 'item in collection' should be identifier or (key, value) but got '" +
                    rhs + "'.");
            }
            valueIdent = match[3] || match[1];
            keyIdent = match[2];
            var children = [], currentScope = this;
            var parent = iterStartElement.parent();
            this.$onEval(function() {
                var index = 0,
                    childCount = children.length,
                    lastIterElement = iterStartElement,
                    collection = this.$tryEval(rhs, iterStartElement),
                    collectionLength = angular.Array.size(collection, true),
                    childScope,
                    key;

                for (key in collection) {
                    if (collection.hasOwnProperty(key)) {
                        if (index < childCount) {
                            // reuse existing child
                            childScope = children[index];
                            childScope[valueIdent] = collection[key];
                            if (keyIdent) childScope[keyIdent] = key;
                            lastIterElement = childScope.$element;
                            childScope.$position = index == 0
                                ? 'first'
                                : (index == collectionLength - 1 ? 'last' : 'middle');
                            childScope.$eval();
                        } else {
                            // grow children
                            childScope = angular.scope(currentScope);
                            childScope[valueIdent] = collection[key];
                            if (keyIdent) childScope[keyIdent] = key;
                            childScope.$index = index;
                            childScope.$position = index == 0
                                ? 'first'
                                : (index == collectionLength - 1 ? 'last' : 'middle');
                            children.push(childScope);
                            linker(childScope, function(clone) {
                                clone.attr('ng:repeat-index', index);

                                // Always use old way for jquery mobile, so
                                // that new elements instantly have a connection to the document root.
                                // Some jquery mobile widgets add new parents.
                                // Compensate this for adding.
                                var appendPosition = lastIterElement;
                                while (appendPosition.length>0 && appendPosition.parent()[0]!==parent[0]) {
                                    appendPosition = appendPosition.parent();
                                }
                                appendPosition.after(clone);
                                lastIterElement = clone;
                            });
                        }
                        index ++;
                    }
                }

                // shrink children
                while (children.length > index) {
                    // Sencha Integration: Destroy widgets
                    var child = children.pop();
                    var childElement = child.$element;
                    childElement.remove();
                }

            }, iterStartElement);
        };
    });


});

define('jqmng/widgets/angularSwitch',['jqmng/widgets/widgetProxyUtil'], function(proxyUtil) {
    /**
     * Modify the original ng:switch so that it adds the ngm:createwidgets attribute to all cases that will
     * fire the jqm create event whenever a new scope is created.
     */
    proxyUtil.createAngularWidgetProxy('ng:switch', function(element) {
        element.children().attr('ngm:createwidgets', 'true');
        return function(element, origBinder) {
            return origBinder();
        }
    });
});

define('jqmng/widgets/angularInput',[
    'jquery', 'jqmng/widgets/widgetProxyUtil'
],
    function($, proxyUtil) {
        function isCheckboxRadio(element) {
            return element.filter($.mobile.checkboxradio.prototype.options.initSelector)
                .not(":jqmData(role='none'), :jqmData(role='nojs')").length > 0;

        }

        function isTextInput(element) {
            return element.filter($.mobile.textinput.prototype.options.initSelector)
                .not(":jqmData(role='none'), :jqmData(role='nojs')").length > 0;
        }

        var oldInput = angular.widget("input");
        angular.widget("input", function(element) {
            var textinput = isTextInput(element);
            var checkboxRadio = isCheckboxRadio(element);

            var name = element.attr('name');
            var type = element.attr('type');
            var origType = type;
            // Need to set the type temporarily always to 'text' so that
            // the original angular widget is used.
            if (textinput) {
                type = 'text';
            }
            // We fake an element during compile phase, as setting the type attribute
            // is not allowed by the dom (although it works in many browsers...)
            var fakeElement = [
                {type: type}
            ];
            var origBinder = oldInput.call(this, fakeElement);
            var newBinder = function() {
                var scope = this;
                var element = arguments[newBinder.$inject.length];
                var origBind = element.bind;
                if (checkboxRadio) {
                    // Angular binds to the click event for radio and check boxes,
                    // but jquery mobile fires a change event. So be sure that angular only listens to the change event,
                    // and no more to the click event, as the click event is too early / jqm has not updated
                    // the checked status.

                    element.bind = function(events, callback) {
                        if (events.indexOf('click') != -1) {
                            events = "change";
                        }
                        return origBind.call(this, events, callback);
                    };
                }
                if (origType === 'date') {
                    // on iOS 5, date inputs do not fire a change event.
                    // so we need to also listen for blur events.
                    element.bind = function(events, callback) {
                        if (events.indexOf('change') != -1) {
                            events += " blur";
                        }
                        return origBind.call(this, events, callback);
                    };
                }
                var res = origBinder.apply(this, arguments);
                // Watch the name and refresh the widget if needed
                if (name) {
                    scope.$watch(name, function(value) {
                        var data = element.data();
                        for (var key in data) {
                            var widget = data[key];
                            if (widget.refresh) {
                                element[key]("refresh");
                            }
                        }
                    });
                }
                return res;
            };
            newBinder.$inject = origBinder.$inject || [];
            return newBinder;
        });

    });

define('jqmng/widgets/angularSelect',[
    'jqmng/widgets/widgetProxyUtil'
], function(proxyUtil) {
    proxyUtil.createAngularWidgetProxy('select', function(element) {
        var name = element.attr('name');
        return function(element, origBinder) {
            var scope = this;
            var res = origBinder();
            var oldVal;
            if (name) {
                // Note: We cannot use $watch here, as ng:options uses $onEval to change the options,
                // and that gets executed after the $watch.
                scope.$onEval(function() {
                    var newVal = scope.$eval(name);
                    if (newVal!==oldVal) {
                        oldVal = newVal;
                        var data = element.data();
                        for (var key in data) {
                            var widget = data[key];
                            if (widget.refresh) {
                                element[key]("refresh");
                            }
                        }
                    }
                });
            }

            return res;
        }
    });

});

define('jqmng/widgets/disabledHandling',[
    'jqmng/widgets/widgetProxyUtil'
], function(widgetProxyUtil) {
    widgetProxyUtil.createAngularDirectiveProxy('ng:bind-attr', function(expression) {
        var regex = /([^:{'"]+)/;
        var attr = regex.exec(expression)[1];
        if (attr !== 'disabled') {
            return function() {

            };
        } else {
            return function(element) {
                var scope = this;
                var oldValue;
                // Note: We cannot use scope.$watch here:
                // We want to be called after the proxied angular implementation, and
                // that uses $onEval. $watch always gets evaluated before $onEval.
                scope.$onEval(function() {
                    var value = element.attr(attr);
                    if (value != oldValue) {
                        oldValue = value;
                        var jqmOperation = value?"disable":"enable";
                        var data = element.data();
                        for (var key in data) {
                            var widget = data[key];
                            if (widget[jqmOperation]) {
                                element[key](jqmOperation);
                            }
                        }
                    }
                });
            }
        }
    });
});

define('jqmng/widgets/jqmButton',[
    'jquery'
], function($) {
    // Button wraps the actual button into another div that is stored in the
    // "button" property.
    var fn = $.mobile.button.prototype;
    var oldDestroy = fn.destroy;
    fn.destroy = function() {
        // Destroy the widget instance first to prevent
        // a stack overflow.
        oldDestroy.apply(this, arguments);
        this.button.remove();
    };

});

define('jqmng/widgets/jqmListView',[
    'jquery'
], function($) {
    // Listview may create subpages that need to be removed when the widget is destroyed.
    var fn = $.mobile.listview.prototype;
    var oldDestroy = fn.destroy;
    fn.destroy = function() {
        // Destroy the widget instance first to prevent
        // a stack overflow.
        // Note: If there are more than 1 listview on the page, childPages will return
        // the child pages of all listviews.
        var id = this.element.attr('id');
        var childPageRegex = new RegExp($.mobile.subPageUrlKey + "=" +id+"-");
        var childPages = this.childPages();
        oldDestroy.apply(this, arguments);
        for (var i=0; i<childPages.length; i++) {
            var childPage = $(childPages[i]);
            var dataUrl = childPage.attr('data-url');
            if (dataUrl.match(childPageRegex)) {
                childPage.remove();
            }
        }
    };
    var oldCreate = fn._create;
    fn._create = function() {
        var self = this;
        var res = oldCreate.apply(this, arguments);
        // refresh the list when the children change.
        this.element.bind('create', function(event) {
            self.refresh();
            // register listeners when the children are destroyed.
            // Do this only once per child.
            var children = self.element.children('li');
            var child, i;
            for (i=0; i<children.length; i++) {
                child = children.eq(i);
                if (!child.data('listlistener')) {
                    child.data('listlistener', true);
                    child.bind("remove", function() {
                        self.refresh();
                    });
                }
            }
        });
    };
});

define('jqmng/widgets/jqmSelectMenu',['jquery'], function($) {

    // selectmenu may create parent element and extra pages
    var fn = $.mobile.selectmenu.prototype;
    var oldDestroy = fn.destroy;
    fn.destroy = function() {
        // Destroy the widget instance first to prevent
        // a stack overflow.
        var parent = this.element.closest(".ui-select");
        var menuPage = this.menuPage;
        var screen = this.screen;
        var listbox = this.listbox;
        oldDestroy.apply(this, arguments);
        parent && parent.remove();
        menuPage && menuPage.remove();
        screen && screen.remove();
        listbox && listbox.remove();
    };
    var oldCreate = fn._create;
    fn._create = function() {
        var res = oldCreate.apply(this, arguments);
        var self = this;

        // Note: We cannot use the prototype here,
        // as there is a plugin in jquery mobile that overwrites
        // the open functions...
        var oldOpen = self.open;
        self.open = function() {
            this.refresh();
            return oldOpen.apply(this, arguments);
        };
    };
});

define('jqmng/widgets/jqmSlider',['jquery'], function($) {
    // Slider wraps the actual input into another div that is stored in the
    // "slider" property.
    var fn = $.mobile.slider.prototype;
    var oldDestroy = fn.destroy;
    fn.destroy = function() {
        // Destroy the widget instance first to prevent
        // a stack overflow.
        oldDestroy.apply(this, arguments);
        this.slider.remove();
    };
});

define('jqmng/jqmngStyle',[], function() {
    /* Special styles for jquery-mobile-angular-adapter */
    /* Don't show the angular validation popup */
    // TODO use the css plugin for this...
    var styles =
        "#ng-callout {display: none}";
    $('head').append('<style type=\"text/css\">' + styles + '</style>');

});

// Wrapper module as facade for the internal modules.
define('jqm-angular',[
    'angular',
    'jquery',
    'jqmng/globalScope',
    'jqmng/navigate',
    'jqmng/waitDialog',
    'jqmng/event',
    'jqmng/fadein',
    'jqmng/if',
    'jqmng/paging',
    'jqmng/sharedController',
    'jqmng/widgets/pageCompile',
    'jqmng/widgets/angularRepeat',
    'jqmng/widgets/angularSwitch',
    'jqmng/widgets/angularInput',
    'jqmng/widgets/angularSelect',
    'jqmng/widgets/disabledHandling',
    'jqmng/widgets/jqmButton',
    'jqmng/widgets/jqmListView',
    'jqmng/widgets/jqmSelectMenu',
    'jqmng/widgets/jqmSlider',
    'jqmng/jqmngStyle'
]);
})();
