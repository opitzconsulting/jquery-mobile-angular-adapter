/**
* jQuery Mobile angularJS adaper v1.0.7-SNAPSHOT
* http://github.com/tigbro/jquery-mobile-angular-adapter
*
* Copyright 2011, Tobias Bosch (OPITZ CONSULTING GmbH)
* Licensed under the MIT license.
*/
/**
 * Simple implementation of require/define assuming all
 * modules are named, in one file and in the correct order.
 */
(function (window) {

    var defined = [];
    var def;
    var jqmng = window.jqmng = {};
    jqmng.define = def = function(name, deps, value) {
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
    };

    jqmng.require = function(deps, callback) {
        if (typeof callback === 'function') {
            var args = [];
            for (var i=0; i<deps.length; i++) {
                var dep = deps[i];
                args.push(defined[dep]);
            }
            callback.apply(this, args);
        }

    }
})(window);


jqmng.define('angular', function() {
    if (typeof angular !== "undefined") {
        return angular;
    }
});
jqmng.define('jquery', function() {
    if (typeof $ !== "undefined") {
        return $;
    }
});
jqmng.define('jqmng/event', ['angular'], function (angular) {
    var mod = angular.module('ng');

    /**
     * A widget to bind general events like touches, ....
     */
    mod.directive("ngmEvent", function () {
        return {
            compile:function (element, attrs) {
                var eventHandlers = angular.fromJson(attrs.ngmEvent);
                return function (scope, element, attrs) {
                    for (var eventType in eventHandlers) {
                        registerEventHandler(scope, element, eventType, eventHandlers[eventType]);
                    }
                }
            }
        }
    });

    function registerEventHandler(scope, element, eventType, handler) {
        element.bind(eventType, function (event) {
            var res = scope.$apply(handler, element);
            if (eventType.charAt(0) == 'v') {
                // This is required to prevent a second
                // click event, see
                // https://github.com/jquery/jquery-mobile/issues/1787
                event.preventDefault();
            }
        });
    }

    function createEventDirective(directive, eventType) {
        mod.directive(directive, function () {
            return function (scope, element,attrs) {
                var eventHandler = attrs[directive];
                registerEventHandler(scope, element, eventType, eventHandler);
            };
        });
    }

    var eventDirectives = {ngmTaphold:'taphold', ngmSwipe:'swipe', ngmSwiperight:'swiperight',
        ngmSwipeleft:'swipeleft',
        ngmPagebeforeshow:'pagebeforeshow',
        ngmPagebeforehide:'pagebeforehide',
        ngmPageshow:'pageshow',
        ngmPagehide:'pagehide',
        ngmClick:'vclick'
    };
    for (var directive in eventDirectives) {
        createEventDirective(directive, eventDirectives[directive])
    }

});
/*
 * Defines the ng:if tag. This is useful if jquery mobile does not allow
 * an ng:switch element in the dom, e.g. between ul and li.
 * Uses ng:repeat and angular.Object.iff under the hood.
 */
jqmng.define('jqmng/if', ['angular'], function (angular) {
    var mod = angular.module('ng');
    var ngIfDirective = {
        transclude: 'element',
        priority: 1000,
        terminal: true,
        compile: function(element, attr, linker) {
            return function(scope, iterStartElement, attr){
                var expression = attr.ngmIf;

                var lastElement;
                var lastScope;
                scope.$watch(expression, function(newValue){
                        if (newValue) {
                            lastScope = scope.$new();
                            linker(lastScope, function(clone){
                                lastElement = clone;
                                iterStartElement.after(clone);
                            });
                        } else {
                            lastElement && lastElement.remove();
                            lastScope && lastScope.$destroy();
                        }
                    });
            };
        }
    };
    mod.directive('ngmIf', function() { return ngIfDirective; });
});

jqmng.define('jqmng/navigate', ['jquery', 'angular'], function($, angular) {
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


    var mod = angular.module('ng');
    mod.provider('$navigate', function() {
        this.$get = function() {
            return navigate;
        }
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

    return navigate;

});
jqmng.define('jqmng/sharedController', ['angular'], function(angular) {
    var storageName = '$$sharedControllers';

    function sharedCtrl(rootScope, controllerName, $controller) {
        var storage = rootScope[storageName] = rootScope[storageName] || {};
        var scopeInstance = storage[controllerName];
        if (!scopeInstance) {
            scopeInstance = rootScope.$new();
            $controller(controllerName, {$scope: scopeInstance});
            storage[controllerName] = scopeInstance;
        }
        return scopeInstance;
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

    var mod = angular.module('ng');
    mod.directive('ngmSharedController', ['$controller', function($controller) {
        return {
            scope: true,
            compile: function(element, attrs) {
                var expression = attrs.ngmSharedController;
                var controllers = parseSharedControllersExpression(expression);
                var preLink = function(scope) {
                    for (var name in controllers) {
                        scope[name] = sharedCtrl(scope.$root, controllers[name], $controller);
                    }
                };
                return {
                    pre: preLink
                }
            }
        };
    }]);
});
/*
 * waitdialog service.
 */
jqmng.define('jqmng/waitDialog', ['jquery'], function($) {
    var showCalls = [];

    function onClick(event) {
        var lastCall = showCalls[showCalls.length - 1];
        if (lastCall.callback) {
            rootScope.$apply(function() {
                lastCall.callback.apply(this, arguments);
            });
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
            var oldMessage = $.mobile.loadingMessage;
            var oldTextVisible = $.mobile.loadingMessageTextVisible;
            if (msg) {
                $.mobile.loadingMessage = msg;
                $.mobile.loadingMessageTextVisible = true;
            }
            $.mobile.showPageLoadingMsg();
            $.mobile.loadingMessageTextVisible = oldTextVisible;
            $.mobile.loadingMessage = oldMessage;
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

        showCalls.push({msg: msg, callback: tapCallback});
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
        always(promise, function() {
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
        always(deferred.promise, function() {
            hide();
        });
    }

    var res = {
        show: show,
        hide: hide,
        waitFor: waitFor,
        waitForWithCancel:waitForWithCancel
    };

    var mod = angular.module('ng');
    var rootScope;
    mod.service('$waitDialog', ['$rootScope', function($rootScope) {
        rootScope = $rootScope;
        return res;
    }]);

    return res;
});
jqmng.define('jqmng/widgets/angularInput', ['jquery', 'angular'], function ($, angular) {
    function isCheckboxRadio(element) {
        return element.filter($.mobile.checkboxradio.prototype.options.initSelector)
            .not(":jqmData(role='none'), :jqmData(role='nojs')").length > 0;

    }

    function isTextInput(element) {
        return element.filter($.mobile.textinput.prototype.options.initSelector)
            .not(":jqmData(role='none'), :jqmData(role='nojs')").length > 0;
    }

    var mod = angular.module('ng');
    mod.directive("input", function () {
        return {
            restrict: 'E',
            require: '?ngModel',
            compile:function (tElement, tAttrs) {
                var textinput = isTextInput(tElement);
                var checkboxRadio = isCheckboxRadio(tElement);

                var name = tElement.attr('name');
                var type = tElement.attr('type');

                return {
                    pre:function (scope, iElement, iAttrs, ctrl) {
                        if (!ctrl) {
                            return;
                        }
                        var _bind = iElement.bind;
                        if (checkboxRadio) {
                            // Angular binds to the click event for radio and check boxes,
                            // but jquery mobile fires a change event. So be sure that angular only listens to the change event,
                            // and no more to the click event, as the click event is too early / jqm has not updated
                            // the checked status.

                            iElement.bind = function (events, callback) {
                                if (events.indexOf('click') != -1) {
                                    events = "change";
                                }
                                return _bind.call(this, events, callback);
                            };
                        }
                    },
                    post:function (scope, iElement, iAttrs, ctrl) {
                        if (!ctrl) {
                            return;
                        }
                        var _$render = ctrl.$render;
                        ctrl.$render = function() {
                            var res = _$render.apply(this, arguments);
                            // Angular only sets the checked property on the dom element,
                            // but not explicitly the css attribute. However, the later is checked by jquery mobile.
                            if (checkboxRadio) {
                                iElement.attr('checked', iElement[0].checked);
                            }
                            var data = iElement.data();
                            for (var key in data) {
                                var widget = data[key];
                                if (widget.refresh) {
                                    iElement[key]("refresh");
                                }
                            }

                            return res;
                        };
                    }

                }
            }
        };

    });
});

jqmng.define('jqmng/widgets/angularRepeat', ['jquery', 'angular'], function ($, angular) {

    /**
     * Modify the original repeat: Make sure that all elements are added under the same parent.
     * This is important, as some jquery mobile widgets wrap the elements into new elements,
     * and angular just uses element.after().
     */
    function instrumentNodeFunction(parent, node, fnName) {
        var _old = node[fnName];
        node[fnName] = function (otherNode) {
            var target = this;
            while (target.parent()[0] !== parent) {
                target = target.parent();
                if (target.length === 0) {
                    throw new Error("Could not find the expected parent in the node path", this, parent);
                }
            }
            instrumentNode(parent, otherNode);
            return _old.call(target, otherNode);
        };
    }

    function instrumentNode(parent, node) {
        var fns = ['after', 'before'];
        for (var i = 0; i < fns.length; i++) {
            instrumentNodeFunction(parent, node, fns[i]);
        }
    }

    var mod = angular.module('ng');
    mod.directive('ngRepeat', function () {
        return {
            priority:1000, // same as original repeat
            compile:function (element, attr, linker) {
                return {
                    pre:function (scope, iterStartElement, attr) {
                        instrumentNode(iterStartElement.parent()[0], iterStartElement);
                    }
                };
            }
        };
    });

});
jqmng.define('jqmng/widgets/angularSelect', ['jquery', 'angular'], function ($, angular) {
    var mod = angular.module('ng');
    mod.directive("select", function () {
        return {
            restrict:'E',
            require:'?ngModel',
            compile:function (tElement, tAttrs) {
                return {
                    post:function (scope, iElement, iAttrs, ctrl) {
                        if (!ctrl) {
                            return;
                        }
                        var _$render = ctrl.$render;
                        ctrl.$render = function () {
                            var res = _$render.apply(this, arguments);
                            var data = iElement.data();
                            for (var key in data) {
                                var widget = data[key];
                                if (widget.refresh) {
                                    iElement[key]("refresh");
                                }
                            }

                            return res;
                        };
                    }
                }

            }
        }
    });
});
jqmng.define('jqmng/widgets/disabledHandling', ['jquery', 'angular'], function ($, angular) {
        var mod = angular.module('ng');

        function instrumentAttrSetter(element, attr) {
            // Note: We cannot use attr.$observe here, as we also want to
            // be able to listen to ng-bind-attr!
            var _$set = attr.$set;
            if (_$set.instrumented) {
                return;
            }
            attr.$set = function (key, value) {
                var res = _$set.apply(this, arguments);
                if (key === 'disabled') {
                    var jqmOperation = 'enable';
                    if (value === 'disabled' || value == 'true') {
                        jqmOperation = 'disable';
                    }
                    var data = element.data();
                    for (var key in data) {
                        var widget = data[key];
                        if (widget[jqmOperation]) {
                            element[key](jqmOperation);
                        }
                    }
                }
                return res;
            };
            attr.$set.instrumented = true;
        }

        mod.directive('ngBindAttr', function () {
            return {
                compile:function () {
                    return {
                        post:function (scope, element, attr) {
                            instrumentAttrSetter(element, attr);
                        }
                    }
                }
            }
        });

        mod.directive('disabled', function () {
            return {
                compile:function () {
                    return {
                        post:function (scope, element, attr) {
                            instrumentAttrSetter(element, attr);
                        }
                    }
                }
            }
        });

        mod.directive('ngDisabled', function () {
            return {
                compile:function () {
                    return {
                        post:function (scope, element, attr) {
                            instrumentAttrSetter(element, attr);
                        }
                    }
                }
            }
        });
    }
);
jqmng.define('jqmng/widgets/jqmButton', [
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
jqmng.define('jqmng/widgets/jqmListView', [
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

jqmng.define('jqmng/widgets/jqmSelectMenu', ['jquery'], function($) {

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
jqmng.define('jqmng/widgets/jqmSlider', ['jquery'], function($) {
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
/*
<%-- TODO
jsp:include page="jqmng/paging.js"
--%>
*/
