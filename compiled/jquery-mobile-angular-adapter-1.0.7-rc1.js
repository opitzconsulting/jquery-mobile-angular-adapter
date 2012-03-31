/**
* jQuery Mobile angularJS adaper v1.0.7-rc1
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
jqmng.define('jqmng/scopeReconnect', ['angular'], function (angular) {

    var ng = angular.module('ng');
    ng.config(['$provide', function($provide) {
        $provide.decorator('$rootScope', ['$delegate', function($rootScope) {
            var _$destroy = $rootScope.$destroy;
            $rootScope.$destroy = function() {
                this.$$destroyed = true;
                var res = _$destroy.apply(this, arguments);
                this.$$nextSibling = this.$$prevSibling = null;
            };
            $rootScope.$reconnect = function() {
                var child = this;
                if (child===$rootScope) {
                    // Nothing to do here.
                    return;
                }
                if (!child.$$destroyed) {
                    return;
                }
                var parent = child.$parent;
                child.$$destroyed = false;
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
        }]);
    }]);
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
        var callArgs = [pageId];
        if (navigateOptions) {
            callArgs.push(navigateOptions);
        }
        $.mobile.changePage.apply($.mobile, callArgs);
        return pageId;
    }


    var mod = angular.module('ng');
    mod.factory('$navigate', function() {
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

    mod.run(['$rootScope', '$navigate', function($rootScope, $navigate) {
        $rootScope.$navigate = function() {
            var args = Array.prototype.slice.call(arguments);
            args.unshift($navigate);
            return navigateExpression.apply(this, args);
        }
    }]);

    mod.filter('navigate', ['$navigate', function($navigateService) {
        return function(test) {
            // parse the arguments...
            var outcomes = {};
            var parts;
            for (var i = 1; i < arguments.length; i++) {
                parts = splitAtFirstColon(arguments[i]);
                outcomes[parts[0]] = parts[1];
            }
            if (test && test.then) {
                // test is a promise.
                test.then(function(test) {
                    if (outcomes[test]) {
                        $navigateService(outcomes[test]);
                    } else if (outcomes.success) {
                        $navigateService(outcomes.success);
                    }
                }, function(test) {
                    if (outcomes[test]) {
                        $navigateService(outcomes[test]);
                    } else if (outcomes.failure) {
                        $navigateService(outcomes.failure);
                    }
                });
            } else {
                if (outcomes[test]) {
                    $navigateService(outcomes[test]);
                } else if (test !== false && outcomes.success) {
                    $navigateService(outcomes.success);
                } else if (test === false && outcomes.failure) {
                    $navigateService(outcomes.failure);
                }
            }
        };
    }]);

    return navigate;

});
jqmng.define('jqmng/sharedController', ['angular'], function(angular) {
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
    mod.factory('$waitDialog', ['$rootScope', function($rootScope) {
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

    $('div').live('pagebeforeshow', function (event, data) {
        var page = $(event.target);
        var currPageScope = page.scope();
        if (page.data('angularLinked') && currPageScope) {
            // We only need to trigger the digest for pages
            // creates by angular, and not for those that are dynamically created by jquery mobile.
            currPageScope.$reconnect();
            currPageScope.$root.$digest();
        }
    });

    $('div').live('pagebeforehide', function (event, data) {
        var page = $(event.target);
        var currPageScope = page.scope();
        if (page.data('angularLinked') && currPageScope) {
            currPageScope.$destroy();
        }
    });

    var ng = angular.module('ng');
    ng.run(patchRootDigest);
    ng.run(deactivateAngularLocationService);

    var _page = $.fn.page;
    ng.run(['$rootScope', '$compile', function($rootScope, $compile) {
        $.fn.page = function() {
            var element = this;
            if (!element.data('angularLinked')) {
                var scope = $rootScope.$new();
                // trigger a separate page compile...
                $compile(element)(scope);
                $rootScope.$digest();
            }
            return _page.apply(this, arguments);
        };
    }]);

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

    var jqmCompilePages = [];
    var jqmRefreshPages = {};

    function patchRootDigest($rootScope) {
        var _apply = $rootScope.$apply;
        $rootScope.$apply = function() {
            if ($rootScope.$$phase) {
                return $rootScope.$eval.apply(this, arguments);
            }
            return _apply.apply(this, arguments);
        };
        var refreshing = false;
        var _digest = $rootScope.$digest;
        $rootScope.$digest = function() {
            if ($rootScope.$$phase) {
                return;
            }
            var res = _digest.apply(this, arguments);
            if (refreshing) {
                return;
            }
            refreshing = true;
            // run the jquery mobile page compiler
            // AFTER the angular compiler or any linking function is completely finished.
            // (Cannot be done in an angular directive, as this would lead to
            // interaction problems between angular and jqm modifying the dom...)
            if (this===$rootScope) {
                if (jqmCompilePages.length>0) {
                    var pages = jqmCompilePages;
                    jqmCompilePages = [];
                    if (!$rootScope.jqmInitialized) {
                        $rootScope.jqmInitialized = true;
                        $.mobile.initializePage();
                    }
                    for (var i=0; i<pages.length; i++) {
                        pages[i].page();
                    }
                }
                var pages = jqmRefreshPages;
                jqmRefreshPages = {};
                for (var id in pages) {
                    pages[id].trigger("create");
                }
                // Ignore all refresh requests that were created during the refreshing...
                jqmRefreshPages = {};
            }
            refreshing = false;
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

    // We want to create a special directive that matched data-role="page" and data-role="dialog",
    // but none of the other data-role="..." elements of jquery mobile. As we want to create a new
    // scope for that directive, this is only possible, if we preprocess the dom and add a new attribute
    // that is unique for pages and dialogs.
    ng.config(['$provide', function($provide) {
        $provide.decorator('$compile', ['$delegate', function($delegate) {
            var selector = ':jqmData(role="page"), :jqmData(role="dialog")';
            var rolePageAttr = 'data-role-page';
            return function(element) {
                element.filter(selector).add(element.find(selector)).attr(rolePageAttr, true);
                degradeInputs(element);
                return $delegate.apply(this, arguments);
            }
        }]);
    }]);

    // Directive for jquery mobile pages. Refreshes the jquery mobile widgets
    // when the page changes.
    ng.directive('rolePage', function () {
        return {
            restrict:'A',
            scope:true,
            compile:function compile(tElement, tAttrs) {
                var id = tAttrs.id;
                return {
                    pre:function preLink(scope, iElement, iAttrs) {
                        jqmCompilePages.push(iElement);
                        iElement.data('angularLinked', true);
                        // Detatch the scope for the normal $digest cycle
                        scope.$destroy();
                        iElement.bind('requestrefresh', function () {
                            jqmRefreshPages[id] = iElement;
                        });
                    }
                }
            }
        };
    });
});
jqmng.define('jqmng/paging', ['jquery', 'angular'], function ($, angular) {

    function pagedListFilterFactory(defaultListPageSize, filterFilter, orderByFilter) {

        function createPagedList(list) {
            var enhanceFunctions = {
                refreshIfNeeded:refreshIfNeeded,
                setFilter:setFilter,
                setOrderBy:setOrderBy,
                setPageSize:setPageSize,
                loadNextPage:loadNextPage,
                hasMorePages:hasMorePages,
                reset:reset,
                refreshCount:0
            };

            var pagedList = [];
            var pageSize, originalList, originalListClone, refreshNeeded, filter, orderBy, loadedCount, availableCount;

            for (var fnName in enhanceFunctions) {
                pagedList[fnName] = enhanceFunctions[fnName];
            }
            init(list);
            var oldHasOwnProperty = pagedList.hasOwnProperty;
            pagedList.hasOwnProperty = function (propName) {
                if (propName in enhanceFunctions) {
                    return false;
                }
                return oldHasOwnProperty.apply(this, arguments);
            };
            return pagedList;

            function init(list) {
                setPageSize(-1);
                originalList = list;
                originalListClone = [];
                refreshNeeded = true;
                reset();
            }

            function refresh() {
                var list = originalList;
                originalListClone = [].concat(list);
                if (filter) {
                    list = filterFilter(list, filter);
                }
                if (orderBy) {
                    list = orderByFilter(list, orderBy);
                }
                if (loadedCount < pageSize) {
                    loadedCount = pageSize;
                }
                if (loadedCount > list.length) {
                    loadedCount = list.length;
                }
                availableCount = list.length;
                var newData = list.slice(0, loadedCount);
                var spliceArgs = [0, pagedList.length].concat(newData);
                pagedList.splice.apply(pagedList, spliceArgs);
                pagedList.refreshCount++;
            }

            function refreshIfNeeded() {
                if (originalList.length != originalListClone.length) {
                    refreshNeeded = true;
                } else {
                    for (var i = 0; i < originalList.length; i++) {
                        if (originalList[i] !== originalListClone[i]) {
                            refreshNeeded = true;
                            break;
                        }
                    }
                }
                if (refreshNeeded) {
                    refresh();
                    refreshNeeded = false;
                }
                return pagedList;
            }

            function setPageSize(newPageSize) {
                if (!newPageSize || newPageSize < 0) {
                    newPageSize = defaultListPageSize;
                }
                if (newPageSize !== pageSize) {
                    pageSize = newPageSize;
                    refreshNeeded = true;
                }
            }

            function setFilter(newFilter) {
                if (!angular.equals(filter, newFilter)) {
                    filter = newFilter;
                    refreshNeeded = true;
                }
            }

            function setOrderBy(newOrderBy) {
                if (!angular.equals(orderBy, newOrderBy)) {
                    orderBy = newOrderBy;
                    refreshNeeded = true;
                }
            }

            function loadNextPage() {
                loadedCount = loadedCount + pageSize;
                refreshNeeded = true;
            }

            function hasMorePages() {
                refreshIfNeeded();
                return loadedCount < availableCount;
            }

            function reset() {
                loadedCount = 0;
                refreshNeeded = true;
            }
        }

        return function (list, param) {
            if (!list) {
                return list;
            }
            var pagedList = list.pagedList;
            if (typeof param === 'string') {
                if (!pagedList) {
                    return;
                }
                // commands do not create a new paged list nor do they change the attributes of the list.
                if (param === 'loadMore') {
                    pagedList.loadNextPage();
                } else if (param === 'hasMore') {
                    return pagedList.hasMorePages();
                }
                return;
            }
            if (!pagedList) {
                pagedList = createPagedList(list);
                list.pagedList = pagedList;
            }
            if (param) {
                pagedList.setPageSize(param.pageSize);
                pagedList.setFilter(param.filter);
                pagedList.setOrderBy(param.orderBy);
            }
            pagedList.refreshIfNeeded();
            return pagedList;
        };
    }

    pagedListFilterFactory.$inject = ['defaultListPageSize', 'filterFilter', 'orderByFilter'];
    var mod = angular.module(['ng']);
    mod.constant('defaultListPageSize', 10);
    mod.filter('paged', pagedListFilterFactory);
});
jqmng.define('jqmng/fadein',['angular'], function(angular) {
    /*
     * Directive that fades in an element when angular
     * uses it. Useful in templating when the underlying template changed.
     */
    angular.module(["ng"]).directive("ngmFadein", function() {
        return {
            compile: function(element) {
                element.css({opacity:0.1});
                return function(scope, element, attrs) {
                    element.animate({opacity:1.0}, parseInt(attrs.ngmFadein));
                }
            }
        };
    });
});
