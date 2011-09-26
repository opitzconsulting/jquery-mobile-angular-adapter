/**
 * The MIT License
 *
 * Copyright (c) 2011 Tobias Bosch (OPITZ CONSULTING GmbH, www.opitz-consulting.com)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
(function() {

// Placeholder for the build process

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
define('angular', function() {
    if (typeof angular !== "undefined") {
        return angular;
    }
});

define('jquery', function() {
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

    return {
        globalScope: getGlobalScope,
        onCreate: onCreate
    }
});

define('jqmng/activePage',['jquery', 'jqmng/globalScope'], function($, globalScope) {
    /*
     * Service for page navigation.
     * A call without parameters returns the current page id.
     * Parameters (see $.mobile.changePage)
     * - pageId: Id of page to navigate to. The special page id "back" navigates back.
     * - transition (optional): Transition to be used.
     * - reverse (optional): If the transition should be executed in reverse style
     */
    function activePage() {
        if (arguments.length == 0) {
            var currPage = $.mobile.activePage;
            if (currPage) {
                return currPage.attr('id');
            } else {
                return null;
            }
        } else {
            // set the page...
            var pageId = arguments[0];
            if (pageId == 'back') {
                window.history.back();
            } else {
                $.mobile.changePage.apply($.mobile.changePage, arguments);
            }
        }
    }

    $('div').live('pagebeforehide', function(event, ui) {
        var currPageScope = $(event.target).scope();
        if (!currPageScope) {
            return;
        }
        var nextPage = ui.nextPage;
        var nextPageScope = nextPage && nextPage.scope();
        if (currPageScope.onPassivate) {
            currPageScope.onPassivate.call(currPageScope, nextPageScope);
        }
    });

    $('div').live('pagebeforeshow', function(event, ui) {
        var currPageScope = $(event.target).scope();
        if (!currPageScope) {
            return;
        }
        var prevPage = ui.prevPage;
        var prevPageScope = prevPage && prevPage.scope();
        if (currPageScope.onActivate) {
            currPageScope.onActivate.call(currPageScope, prevPageScope);
        }
    });

    return {
        activePage: activePage
    }

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
     * This immediately closes wait dialogs that are opened in the onActivate
     * function of controllers.
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
        show();
        promise.always(function() {
            hide();
        });
    }

    /**
     *
     * @param promise
     * @param cancelData
     * @param msg (optional)
     */
    function waitForWithCancel(promise, cancelData, msg) {
        if (!msg) {
            msg = $.mobile.loadingMessageWithCancel;
        }
        show(msg, function() {
            promise.reject(cancelData);
        });
        promise.always(function() {
            hide();
        });
    }

    return {
        show: show,
        hide: hide,
        waitFor: waitFor,
        waitForWithCancel:waitForWithCancel
    };
});

define('jqmng/event',['angular'], function(angular) {
    /* A widget for clicks.
     * Just as ng:click, but reacts to the jquery mobile vclick event, which
     * includes taps, mousedowns, ...
     */
    angular.directive("ngm:click", function(expression, element) {
        return angular.directive('ngm:event')('vclick:' + expression, element);
    });

    /* A widget to bind general events like touches, ....
     */
    angular.directive("ngm:event", function(expression, element) {
        var eventHandlers = {};
        var pattern = /(.*?):(.*?)($|,)/g;
        var match;
        var hasData = false;
        while (match = pattern.exec(expression)) {
            hasData = true;
            var event = match[1];
            var handler = match[2];
            eventHandlers[event] = handler;
        }
        if (!hasData) {
            throw "Expression " + expression + " needs to have the syntax <event>:<handler>,...";
        }

        var linkFn = function($updateView, element) {
            var self = this;
            for (var eventType in eventHandlers) {
                    (function(eventType) {
                        var handler = eventHandlers[eventType];
                        element.bind(eventType, function(event) {
                            var res = self.$tryEval(handler, element);
                            $updateView();
                            if (eventType.charAt(0)=='v') {
                                // This is required to prevent a second
                                // click event, see
                                // https://github.com/jquery/jquery-mobile/issues/1787
                                event.preventDefault();
                            }
                        });
                    })(eventType);
            }
        };
        linkFn.$inject = ['$updateView'];
        return linkFn;
    });

    /* A widget that reacts when the user presses the enter key.
     */
    angular.directive("ngm:enterkey", function(expression, element) {
        var linkFn = function($updateView, element) {
            var self = this;
            element.bind('keypress', function(e) {
                var key = e.keyCode || e.which;
                if (key == 13) {
                    var res = self.$tryEval(expression, element);
                    $updateView();
                }
            });
        };
        linkFn.$inject = ['$updateView'];
        return linkFn;
    });
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

/**
 * Integration of the page widget.
 */
define('jqmng/widgets/pageCompile',['jquery', 'angular', 'jqmng/globalScope'], function($, angular, globalScope) {
    // redirect all events from the page widget,
    // so we can intercept them.
    $.mobile.page.prototype.widgetEventPrefix = 'jqmngpage';

    var afterCompileQueue = [];

    function executeAfterCompileQueue() {
        while (afterCompileQueue.length>0) {
            var callback = afterCompileQueue.shift();
            callback();
        }
    }

    function addAfterCompileCallback(callback) {
        if (afterCompileQueue.length==0) {
            setTimeout(executeAfterCompileQueue, 0);
        }
        afterCompileQueue.push(callback);
    }

    $('div').live('jqmngpagecreate', function(event) {
        var page = $(event.target);
        var parentScope = globalScope.globalScope();
        var childScope = angular.scope(parentScope);
        angular.compile(page)(childScope);
        addAfterCompileCallback(function() {
            // The second pagecreate does only initialize
            // the widgets that we did not already create by angular.
            page.trigger("pagecreate");
        });
        executeAfterCompileQueue();
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

    return {
        afterCompile: addAfterCompileCallback
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

    /**
     * Removes all elements from list1 that are contained in list2
     * and returns a new list.
     * @param list1
     * @param list2
     */
    function minusArray(list1, list2) {
        var res = [];
        // temporarily add marker...
        for (var i=0; i<list2.length; i++) {
            list2[i].diffMarker = true;
        }
        for (var i=0; i<list1.length; i++) {
            if (!list1[i].diffMarker) {
                res.push(list1[i]);
            }
        }
        for (var i=0; i<list2.length; i++) {
            delete list2[i].diffMarker;
        }
        return res;
    }

    function recordDomAdditions(selector, callback) {
        var oldState = $(selector);
        callback();
        var newState = $(selector);
        return minusArray(newState, oldState);
    }

    var garbageCollector = [];

    function isConnectedToDocument(element) {
        var rootElement = document.documentElement;
        while (element!==null && element!==rootElement) {
            element = element.parentNode;
        }
        return element===rootElement;
    }

    function removeSlaveElements() {
        var rootElement = document.documentElement;
        for (var i=0; i<garbageCollector.length; i++) {
            var entry = garbageCollector[i];
            if (!isConnectedToDocument(entry.master[0])) {
                entry.slaves.remove();
                garbageCollector.splice(i, 1);
                i--;
            }
        }
    }

    function removeSlavesWhenMasterIsRemoved(master, slaves) {
        garbageCollector.push({master: master, slaves:slaves});
    }

    globalScope.onCreate(function(scope) {
        scope.$onEval(99999, function() {
            removeSlaveElements();
        });
    });


    return {
        recordDomAdditions: recordDomAdditions,
        createAngularDirectiveProxy: createAngularDirectiveProxy,
        createAngularWidgetProxy: createAngularWidgetProxy,
        removeSlavesWhenMasterIsRemoved: removeSlavesWhenMasterIsRemoved
    }
});

define('jqmng/widgets/disabledHandling',[
    'jqmng/widgets/widgetProxyUtil'
], function(widgetProxyUtil) {
    /**
     * Binds the enabled/disabled handler of angular and jquery mobile together,
     * for the jqm widgets that are in jqmWidgetDisabledHandling.
     */
    var jqmWidgetDisabledHandling = {};

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
                            if (typeof key === 'string' && jqmWidgetDisabledHandling[key]) {
                                element[key](jqmOperation);
                            }
                        }
                    }
                });
            }
        }
    });

    return jqmWidgetDisabledHandling;
});

define('jqmng/widgets/jqmButton',[
    'jqmng/widgets/widgetProxyUtil',
    'jqmng/widgets/disabledHandling'
], function(proxyUtil, disabledHandling) {
    disabledHandling.button = true;

    function compileButton(element, name) {
        var scope = this;
        element.button();
        // the input button widget creates a new parent element.
        // remove that element when the input element is removed
        proxyUtil.removeSlavesWhenMasterIsRemoved(element, element.parent());
    }

    function isButton(element) {
        return element.filter($.mobile.button.prototype.options.initSelector)
            .not(":jqmData(role='none'), :jqmData(role='nojs')").length > 0;

    }

    return {
        compileButton: compileButton,
        isButton: isButton
    }

});

define('jqmng/widgets/angularButton',[
    'jqmng/widgets/widgetProxyUtil',
    'jqmng/widgets/jqmButton'
], function(proxyUtil, jqmButton) {

    proxyUtil.createAngularWidgetProxy('button', function(element) {
        var isButton = jqmButton.isButton(element);
        var name = element.attr('name');
        return function(element, origBinder) {
            var res = origBinder();
            if (isButton) {
                jqmButton.compileButton.call(this, element, name);
            }
            return res;
        }
    });
});

define('jqmng/widgets/jqmCollapsible',[
    'jqmng/widgets/widgetProxyUtil',
    'jqmng/widgets/disabledHandling'
], function(proxyUtil, disabledHandling) {

    function compileCollapsible(element, name) {
        var scope = this;
        element.collapsible();
    }

    function isCollapsible(element) {
        return element.filter($.mobile.collapsible.prototype.options.initSelector).length > 0;
    }

    return {
        compileCollapsible: compileCollapsible,
        isCollapsible: isCollapsible
    }
});

define('jqmng/widgets/angularDiv',[
    'jqmng/widgets/widgetProxyUtil',
    'jqmng/widgets/jqmCollapsible'
], function(proxyUtil, jqmCollapsible) {
    proxyUtil.createAngularWidgetProxy('div', function(element) {
        var isCollapsible = jqmCollapsible.isCollapsible(element);
        var name = element.attr('name');
        return function(element, origBinder) {
            var res = origBinder();
            if (isCollapsible) {
                jqmCollapsible.compileCollapsible.call(this, element, name);
            }
            return res;
        };
    });


});

define('jqmng/widgets/jqmSelectMenu',[
    'jqmng/widgets/widgetProxyUtil',
    'jqmng/widgets/disabledHandling',
    'jqmng/widgets/pageCompile'
], function(proxyUtil, disabledHandling, pageCompile) {
    disabledHandling.selectmenu = true;

    function compileSelectMenu(element, name) {
        var scope = this;
        // The selectmenu needs access to the page,
        // so we can not create it until after the eval cycle!
        pageCompile.afterCompile(function() {
            // The selectmenu widget creates a parent tag. This needs
            // to be deleted when the select tag is deleted from the dom.
            // Furthermore, it creates ui-selectmenu and ui-selectmenu-screen divs, as well as new dialogs
            var removeSlaves;
            var newElements = proxyUtil.recordDomAdditions(".ui-selectmenu,.ui-selectmenu-screen,:jqmData(role='dialog')", function() {
                element.selectmenu();
                removeSlaves = element.parent();
            });
            removeSlaves = removeSlaves.add(newElements);
            proxyUtil.removeSlavesWhenMasterIsRemoved(element, removeSlaves);

            scope.$watch(name, function(value) {
                element.selectmenu('refresh', true);
            });
            // update the value when the number of options change.
            // needed if the default values changes.
            var oldCount;
            scope.$onEval(999999, function() {
                var newCount = element[0].childNodes.length;
                if (oldCount !== newCount) {
                    oldCount = newCount;
                    element.trigger('change');
                }
            });
        });
    }

    function isSelectMenu(element) {
        return element.filter($.mobile.selectmenu.prototype.options.initSelector)
            .not(":jqmData(role='none'), :jqmData(role='nojs')").length > 0;
    }

    return {
        compileSelectMenu: compileSelectMenu,
        isSelectMenu: isSelectMenu
    }
});

define('jqmng/widgets/jqmSlider',[
    'jqmng/widgets/widgetProxyUtil',
    'jqmng/widgets/disabledHandling',
    'jqmng/widgets/pageCompile'
], function(proxyUtil, disabledHandling, pageCompile) {
    disabledHandling.slider = true;

    function compileSlider(element, name) {
        var scope = this;
        pageCompile.afterCompile(function() {
            // The slider widget creates an element of class ui-slider
            // after the slider.
            var newElements = proxyUtil.recordDomAdditions(".ui-slider", function() {
                element.slider();
            });
            proxyUtil.removeSlavesWhenMasterIsRemoved(element, $(newElements));

            scope.$watch(name, function(value) {
                element.slider('refresh');
            });
        });
    }

    function isSlider(element) {
        return element.filter($.mobile.slider.prototype.options.initSelector)
            .not(":jqmData(role='none'), :jqmData(role='nojs')").length > 0;

    }

    return {
        compileSlider: compileSlider,
        isSlider: isSlider
    }

});

define('jqmng/widgets/jqmCheckboxRadio',[
    'jqmng/widgets/widgetProxyUtil',
    'jqmng/widgets/disabledHandling',
    'jqmng/widgets/pageCompile'
], function(proxyUtil, disabledHandling, pageCompile) {
    disabledHandling.checkboxradio = true;

    function compileCheckboxRadio(element, name) {
        var scope = this;
        // The checkboxradio widget looks for a label
        // within the page. So we need to defer the creation.
        pageCompile.afterCompile(function() {
            element.checkboxradio();
            scope.$watch(name, function(value) {
                element.checkboxradio('refresh');
            });
        });
    }

    function isCheckboxRadio(element) {
        return element.filter($.mobile.checkboxradio.prototype.options.initSelector)
            .not(":jqmData(role='none'), :jqmData(role='nojs')").length > 0;

    }

    return {
        compileCheckboxRadio: compileCheckboxRadio,
        isCheckboxRadio: isCheckboxRadio
    }


});

define('jqmng/widgets/jqmTextInput',[
    'jqmng/widgets/widgetProxyUtil',
    'jqmng/widgets/disabledHandling'
], function(proxyUtil, disabledHandling) {
    disabledHandling.textinput = true;

    function compileTextInput(element, name) {
        var scope = this;
        element.textinput();
    }

    function isTextInput(element) {
        return element.filter($.mobile.textinput.prototype.options.initSelector)
            .not(":jqmData(role='none'), :jqmData(role='nojs')").length > 0;
    }

    return {
        compileTextInput: compileTextInput,
        isTextInput: isTextInput
    }


});

define('jqmng/widgets/angularInput',[
    'jqmng/widgets/widgetProxyUtil',
    'jqmng/widgets/jqmSelectMenu',
    'jqmng/widgets/jqmSlider',
    'jqmng/widgets/jqmCheckboxRadio',
    'jqmng/widgets/jqmTextInput',
    'jqmng/widgets/jqmButton'
],
    function(proxyUtil, jqmSelectMenu, jqmSlider, jqmCheckboxRadio, jqmTextInput, jqmButton) {
        proxyUtil.createAngularWidgetProxy('input', function(element) {
            var isTextinput = jqmTextInput.isTextInput(element);
            var isCheckboxRadio = jqmCheckboxRadio.isCheckboxRadio(element);
            var isSlider = jqmSlider.isSlider(element);
            var isButton = jqmButton.isButton(element);

            var name = element.attr('name');
            var oldType = element[0].type;
            // Need to set the type temporarily always to 'text' so that
            // the original angular widget is used.
            if (isTextinput) {
                element[0].type = 'text';
                element[0]['data-type'] = oldType;
            }
            return function(element, origBinder) {
                element[0].type = oldType;
                if (isCheckboxRadio) {
                    // Angular binds to the click event for radio and check boxes,
                    // but jquery mobile fires a change event. So be sure that angular only listens to the change event,
                    // and no more to the click event, as the click event is too early / jqm has not updated
                    // the checked status.
                    var origBind = element.bind;
                    element.bind = function(events, callback) {
                        if (events.indexOf('click') != -1) {
                            events = "change";
                        }
                        return origBind.call(this, events, callback);
                    };
                }
                var res = origBinder();
                if (isSlider) {
                    jqmSlider.compileSlider.call(this, element, name);
                }
                if (isCheckboxRadio) {
                    jqmCheckboxRadio.compileCheckboxRadio.call(this, element, name);
                }
                if (isButton) {
                    jqmButton.compileButton.call(this, element, name);
                }
                if (isTextinput) {
                    jqmTextInput.compileTextInput.call(this, element, name);
                }
                return res;
            };
        });

    });

define('jqmng/widgets/angularSelect',[
    'jqmng/widgets/widgetProxyUtil',
    'jqmng/widgets/jqmSelectMenu',
    'jqmng/widgets/jqmSlider'
], function(proxyUtil, jqmSelectMenu, jqmSlider) {
    proxyUtil.createAngularWidgetProxy('select', function(element) {
        var isSelectMenu = jqmSelectMenu.isSelectMenu(element);
        var isSlider = jqmSlider.isSlider(element);
        var name = element.attr('name');
        return function(element, origBinder) {
            var res = origBinder();
            if (isSelectMenu) {
                jqmSelectMenu.compileSelectMenu.call(this, element, name);
            }
            if (isSlider) {
                jqmSlider.compileSlider.call(this, element, name);
            }
            return res;
        }
    });

});

define('jqmng/widgets/jqmListView',[
    'jqmng/widgets/widgetProxyUtil',
    'jqmng/widgets/disabledHandling',
    'jquery',
    'jqmng/widgets/pageCompile'
], function(proxyUtil, disabledHandling, $, pageCompile) {

    function compileListView(element) {
        var scope = this;
        // The listview widget looks for the persistent footer,
        // so we need to defer the creation.
        pageCompile.afterCompile(function() {
            // listviews may create subpages for nested lists.
            // Be sure that they get removed from the dom when the list is removed.
            var newElemens = proxyUtil.recordDomAdditions(":jqmData(role='page')", function() {
                element.listview();
            });
            proxyUtil.removeSlavesWhenMasterIsRemoved(element, $(newElemens));
            // refresh the listview when the number of children changes.
            // This does not need to check for changes to the
            // ordering of children, for the following reason:
            // The only changes to elements is done by ng:repeat.
            // And ng:repeat reuses the same element for the same index position,
            // independent of the value of that index position.
            var oldCount;
            scope.$onEval(999999, function() {
                var newCount = element[0].childNodes.length;
                if (oldCount !== newCount) {
                    oldCount = newCount;
                    element.listview("refresh");
                }
            });
        });
    }

    function isListView(element) {
        return element.filter($.mobile.listview.prototype.options.initSelector).length > 0;
    }

    return {
        compileListView: compileListView,
        isListView: isListView
    }
});

define('jqmng/widgets/angularUl',[
    'jqmng/widgets/widgetProxyUtil',
    'jqmng/widgets/jqmListView'
], function(proxyUtil, jqmListView) {
    proxyUtil.createAngularWidgetProxy('ul', function(element) {
        var isListView = jqmListView.isListView(element);
        return function(element, origBinder) {
            var res = origBinder();
            if (isListView) {
                jqmListView.compileListView.call(this, element);
            }
            return res;
        };
    });
});

// Wrapper module as facade for the internal modules.
define('jqm-angular',[
    'angular',
    'jquery',
    'jqmng/globalScope',
    'jqmng/activePage',
    'jqmng/waitDialog',
    'jqmng/event',
    'jqmng/fadein',
    'jqmng/if',
    'jqmng/paging',
    'jqmng/widgets/pageCompile',
    'jqmng/widgets/angularButton',
    'jqmng/widgets/angularDiv',
    'jqmng/widgets/angularInput',
    'jqmng/widgets/angularSelect',
    'jqmng/widgets/angularUl',
], function(angular, $, globalScope, activePage, waitDialog) {
    // create global variables
    $.mobile.globalScope = globalScope.globalScope;

    // export waitDialog as angular Service
    angular.service('$waitDialog', function() {
        return waitDialog;
    });
    angular.service('$activePage', function() {
        return activePage.activePage;
    });
    return {
        globalScope: globalScope.globalScope,
        activePage: activePage.activePage,
        waitDialog: waitDialog
    }
});
})();
