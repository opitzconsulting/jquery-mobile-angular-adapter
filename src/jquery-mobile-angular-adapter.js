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




/**
 * Global scope
 */
(function(angular, $) {
    var globalScope = null;

    /**
     * Lazily initializes the global scope. If a controller named
     * GlobalController exists, it will be used as the controller
     * for the global scope.  The global scope can be used
     * to communicate between the pages.
     */
    function getGlobalScope() {
        if (globalScope) {
            return globalScope;
        }
        // Always use a singleton controller for that main scope.
        // create a global scope over all pages,
        // so common data is possible.
        globalScope = angular.scope();
        if (window.GlobalController) {
            globalScope.$become(GlobalController);
        }
        return globalScope;
    }

    $.mobile.globalScope = function() {
        if (arguments.length == 0) {
            return getGlobalScope();
        } else {
            globalScope = arguments[0];
        }
    };
})(angular, $);

/*
 * Compile integration.
 */
(function(angular, $) {


    function reentrantSwitch(fnNormal, fnReentrant) {
        var reentrant = false;
        return function() {
            if (!reentrant) {
                try {
                    reentrant = true;
                    return fnNormal.apply(this, arguments);
                } finally {
                    reentrant = false;
                }
            } else {
                return fnReentrant.apply(this, arguments);
            }
        }
    }

    $.mobile.inJqmPageCompile = false;

    var oldPage = $.fn.page;
    $.fn.page = reentrantSwitch(function() {
        var self = this;

        var instanceExists = this.data() && this.data().page;
        if (!instanceExists) {
            $.mobile.inJqmPageCompile = true;
            var res = oldPage.apply(self, arguments);
            $.mobile.inJqmPageCompile = false;
            // Create an own separate scope for every page,
            // so the performance of one page does not depend
            // on other pages.
            var childScope = angular.scope($.mobile.globalScope());
            angular.compile(this)(childScope);
        } else {
            res = oldPage.apply(self, arguments);
        }
        return res;
    }, oldPage);

})(angular, jQuery);

/*
 * Integration of jquery mobile and angular widgets.
 */
(function(angular) {

    var jqmAngularWidgets = {};
    var jqmWidgetProxies = {};
    var angularWidgetProxies = {};


    /**
     * Synchronizes an angular and jquery mobile widget.
     * @param tagname
     * @param jqmWidget
     * @param compileFn compile function(element, jqmWidget, origBinder) just like the compile functions of angular.
     *  If the origBinder was not called, it will get called automatically after the new binder.
     */
    function jqmAngularWidget(tagname, jqmWidget, compileFn) {
        if (!jqmWidgetProxies[jqmWidget]) {
            createJqmWidgetProxy(jqmWidget);
            jqmWidgetProxies[jqmWidget] = true;
        }

        if (!angularWidgetProxies[tagname]) {
            createAngularWidgetProxy(tagname, function(element) {
                var jqmWidget = element.attr('jqmwidget');
                if (!jqmWidget) {
                    return function() {
                    };
                }
                var jqmAngularCompileFn = jqmAngularWidgets[tagname + ":" + jqmWidget];
                return jqmAngularCompileFn.call(this, element);
            });
            angularWidgetProxies[tagname] = true;
        }
        jqmAngularWidgets[tagname + ":" + jqmWidget] = compileFn;
    }

    /*
     * Integration of the widgets of jquery mobile:
     * Prevent the normal create call for the widget, and let angular
     * do the initialization. This is important as angular
     * might create multiple elements with the widget (e.g. in ng:repeat), and the widgets of jquery mobile
     * register listeners to elements.
     */
    function createJqmWidgetProxy(jqmWidget) {
        var oldWidget = $.fn[jqmWidget];
        $.fn[jqmWidget] = function(options) {
            var instanceExists = this.data() && this.data()[jqmWidget];
            if (instanceExists || this.length == 0) {
                return oldWidget.apply(this, arguments);
            } else if ($.mobile.inJqmPageCompile) {
                // Prevent initialization during precompile,
                // and mark the element so that the angular widget
                // can create the widget!
                for (var i = 0; i < this.length; i++) {
                    this[i].jqmoptions = options;
                }
                this.attr('jqmwidget', jqmWidget);
                return this;
            } else {
                return oldWidget.apply(this, arguments);
            }
        };
        for (var key in oldWidget) {
            $.fn[jqmWidget][key] = oldWidget[key];
        }
    }

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
                var oldParent = element[0].parentNode;
                var res = bindFn.call(this, element, function() {
                    oldBinderCalled = true;
                    return oldBinder && oldBinder.apply(self, myargs);
                });
                if (!oldBinderCalled) {
                    return oldBinder && oldBinder.apply(self, myargs);
                }
                // Some jquery mobile widgets add a new parent node above them
                // (e.g. select). So be sure that those new elements
                // also gets deleted when the child is deleted!
                if (element.length > 0 && element[0].parentNode != oldParent) {
                    var newNodeUnderParent = element[0];
                    while (newNodeUnderParent.parentNode != oldParent) {
                        newNodeUnderParent = newNodeUnderParent.parentNode;
                    }
                    if (newNodeUnderParent != element[0]) {
                        element.remove = function() {
                            $(newNodeUnderParent).remove();
                        }
                    }
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
     * Binds the enabled/disabled handler of angular and jquery mobile together,
     * for the jqm widgets that are in jqmWidgetDisabledHandling.
     */
    var jqmWidgetDisabledHandling = {};
    createAngularDirectiveProxy('ng:bind-attr', function(expression) {
        return function(element) {

            var jqmWidget = element.attr('jqmwidget');
            if (!jqmWidget || !jqmWidgetDisabledHandling[jqmWidget]) {
                return;
            }
            var regex = /([^:{'"]+)/;
            var attr = regex.exec(expression)[1];
            var scope = this;
            if (attr == 'disabled') {
                var oldValue;
                // Note: We cannot use scope.$watch here:
                // We want to be called after the proxied angular implementation, and
                // that uses $onEval. $watch always gets evaluated before $onEval.
                scope.$onEval(function() {
                    var value = element.attr(attr);
                    if (value != oldValue) {
                        oldValue = value;
                        if (value) {
                            element[jqmWidget]("disable");
                        } else {
                            element[jqmWidget]("enable");
                        }
                    }
                });
            }
        }
    });

    /**
     * Creates a virtual page for the given element all all of it's siblings and
     * executes the callback with the element and the virtual page as arguments.
     * Useful to create jquery mobile widget in an isolated environment.
     * @param element
     * @param callback
     */
    function executeWithVirtualPage(element, callback) {
        // Note: We cannot use jquery functions here,
        // as they do not work correctly with document fragments
        // as parent node!
        var parent = element[0].parentNode;
        var pageElement = $('<div data-role="page" class="ui-page"></div>');
        // The parent of the virtual page is a document fragment.
        // We need to add some functions so that jquery does
        // create errors during some queries...
        pageElement[0].parentNode.getAttribute = function() {
            return null;
        };
        // Also create a fake page container.
        // Some widgets like selectmenu use this variable directly!
        var pageContainer = $('<div></div>');
        var oldPageContainer = $.mobile.pageContainer;
        $.mobile.pageContainer = pageContainer;
        var children = parent.childNodes;
        while (children.length > 0) {
            pageElement[0].appendChild(children[0]);
        }
        try {
            return callback(element, pageElement, pageContainer);
        } finally {
            $.mobile.pageContainer = oldPageContainer;
            var children = pageElement[0].childNodes;
            while (children.length > 0) {
                parent.appendChild(children[0]);
            }
        }
    }

    jqmWidgetDisabledHandling.selectmenu = true;
    jqmAngularWidget('select', 'selectmenu', function(element) {
        var name = element.attr('name');
        return function(element, origBinder) {
            var res = origBinder();
            var scope = this;
            // The selectmenu widget from jquery mobile
            // creates elements for the popup directly under the page,
            // and also a dialog on the same level as the page.
            // We grab these elements and insert them only when the dialog is open into the dom.
            executeWithVirtualPage(element, function(element, pageElement, pageContainer) {
                element.selectmenu();
                // save the elements that were created directly under the page,
                // and insert them into the dom when needed.
                var dialog = pageContainer.children();
                dialog.detach();
                dialog.bind("pagebeforeshow", function() {
                    dialog.appendTo($.mobile.pageContainer);
                });
                dialog.bind("pagehide", function() {
                    dialog.detach();
                });

                var pageElements = pageElement.children(".ui-selectmenu, .ui-selectmenu-screen");
                pageElements.detach();
                var instance = element.data().selectmenu;
                var oldOpen = instance.open;
                var oldRefresh = instance.refresh;
                instance.refresh = function() {
                    var page = element.closest('.ui-page');
                    if (page.length>0) {
                        var needsAttach = pageElements.parent().length==0;
                        if (needsAttach) {
                            page.append(pageElements);
                        }
                        try {
                            return oldRefresh.apply(this, arguments);
                        } finally {
                            if (needsAttach) {
                                pageElements.detach();
                            }
                        }
                    }

                };
                instance.open = function() {
                    var page = element.closest('.ui-page');
                    page.append(pageElements);
                    // always refresh the menu when opening.
                    // By this we do not have to watch for changes to the options.
                    oldRefresh.call(instance, true);
                    return oldOpen.apply(this, arguments);
                };
                var oldClose = instance.close;
                instance.close = function() {
                    var res = oldClose.apply(this, arguments);
                    pageElements.detach();
                    return res;
                };
            });
            scope.$watch(name, function(value) {
                element.selectmenu('refresh', true);
            });
            // update the value when the number of options change.
            // needed if the default values changes.
            var oldCount;
            scope.$onEval(999999, function() {
                var newCount = element[0].childNodes.length;
                if (oldCount!==newCount) {
                    oldCount = newCount;
                    element.trigger('change');
                }
            });

            return res;
        }
    });

    jqmWidgetDisabledHandling.slider = true;
    jqmAngularWidget('select', 'slider',
            function(element) {
                var name = element.attr('name');
                return function(element, origBinder) {
                    var res = origBinder();
                    // The slider widget creates an element
                    // after the slider. So we wrap it into
                    // a div. Needed for ng:repeat and others...
                    element.wrap('<ngm:group class="ng-widget"></ngm:group>');
                    element.slider();
                    var scope = this;
                    scope.$watch(name, function(value) {
                        element.slider('refresh');
                    });
                    return res;
                };
            });

    jqmAngularWidget('input', 'slider',
            function(element) {
                var oldType = element[0].type;
                element[0].type = 'text';
                element[0]['data-type'] = 'range';
                var name = element.attr('name');
                return function(element, origBinder) {
                    element[0].type = oldType;
                    var res = origBinder();
                    // The slider widget creates an element
                    // after the slider. So we wrap it into
                    // a div. Needed for ng:repeat and others...
                    element.wrap('<ngm:group class="ng-widget"></ngm:group>');
                    element.slider();
                    // apply the textinput widget also
                    element.textinput();
                    var scope = this;
                    scope.$watch(name, function(value) {
                        element.slider('refresh');
                    });
                    return res;
                };
            });

    jqmWidgetDisabledHandling.checkboxradio = true;
    jqmAngularWidget('input', 'checkboxradio', function(element) {
        var name = element.attr('name');
        return function(element, origBinder) {
            // Angular only binds to the click event for radio and check boxes,
            // but jquery mobile fires a change event. So fire a click event when a change event occurs...
            var origBind = element.bind;
            element.bind = function(events, callback) {
                if (events.indexOf('click') != -1) {
                    events += " change";
                }
                return origBind.call(this, events, callback);
            };

            var res = origBinder();
            var scope = this;
            // The checkboxradio widget looks for a label
            // within the page. So we need a virtual page.
            executeWithVirtualPage(element, function(element, pageElement) {
                element.checkboxradio();
            });
            scope.$watch(name, function(value) {
                element.checkboxradio('refresh');
            });
            return res;
        }
    });

    jqmWidgetDisabledHandling.button = true;
    jqmAngularWidget('button', 'button', function(element) {
        var options = element[0].jqmoptions;
        return function(element, origBinder) {
            var res = origBinder();
            var scope = this;
            element.button(options);
            return res;
        }
    });

    jqmAngularWidget('input', 'button', function(element) {
        var options = element[0].jqmoptions;
        return function(element, origBinder) {
            var res = origBinder();
            var scope = this;
            element.button(options);
            return res;
        }
    });

    jqmAngularWidget('div', 'collapsible', function(element) {
        var name = element.attr('name');
        return function(element, origBinder) {
            var res = origBinder();
            var scope = this;
            element.collapsible();
            return res;
        }
    });

    jqmWidgetDisabledHandling.textinput = true;
    jqmAngularWidget('input', 'textinput', function(element) {
        var name = element.attr('name');
        return function(element, origBinder) {
            var res = origBinder();
            var scope = this;
            element.textinput();
            return res;
        }
    });

    /**
     * Integration of the listview widget.
     * Special case as the the ng:repeat angular widget is added
     * to the children of the ul element, to which the jquery mobile
     * listview widget is added.
     **/
    jqmAngularWidget('ul', 'listview', function(element) {
        element.find('li').attr('jqmwidget', 'listviewchild');
        return function(element, origBinder) {
            var res = origBinder();
            executeWithVirtualPage(element, function(element, pageElement) {
                element.listview();
                var oldRefresh = element.data().listview.refresh;
                // The listview widget looks for the persistent footer.
                // However, this is not possible with ng:repeat. So use a fake
                // refresh function...
                element.data().listview.refresh = function() {
                    var self = this;
                    var args = arguments;
                    return executeWithVirtualPage(element, function() {
                        return oldRefresh.apply(self, args);
                    });
                }
            });

            return res;
        }
    });

    createAngularWidgetProxy('@ng:repeat', function(expression, element) {
        var isListView = false;
        if (element.attr('jqmwidget') == 'listviewchild') {
            isListView = true;
        }
        if (!isListView) {
            return function() {
            };
        }
        var match = expression.match(/^\s*(.+)\s+in\s+(.*)\s*$/);
        var rhs = match[2];
        return function(element, origBinder) {
            var res = origBinder();
            var scope = this;
            // Note: We cannot use scope.$watch here:
            // We want to be called after the proxied angular implementation, and
            // that uses $onEval. $watch always gets evaluated before $onEval.
            var oldSize;
            scope.$onEval(function() {
                var collection = scope.$tryEval(rhs, element);
                // for the listview widget, we only need to
                // check for changes to the list size, as ng:repeat
                // reuses the same dom element for an index position,
                // even if the object at that index changes.
                var size = angular.Object.size(collection);
                if (size != oldSize) {
                    oldSize = size;
                    var list = element.parent();
                    list.listview('refresh');
                }
            });
            return res;
        }
    });


})(angular);


/*
 * onactiveate and onpassivate callbacks for scopes
 */
(function(angular, $) {
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

    var currScope = null;
    // The eval function of the global scope should eval
    // the active scope only.
    $.mobile.globalScope().$onEval(function() {
        // Note that wen cannot use $.mobile.activePage here,
        // as this has an old valud in the pagebeforeshow event!
        if (currScope) {
            currScope.$eval();
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
        currScope = currPageScope;
        $.mobile.globalScope().$service('$updateView')();
    });
})(angular, $);

/*
 * $activePage service.
 */
(function(angular, window) {
    /*
     * Service for page navigation.
     * A call without parameters returns the current page id.
     * Parameters (see $.mobile.changePage)
     * - pageId: Id of page to navigate to. The special page id "back" navigates back.
     * - transition (optional): Transition to be used.
     * - reverse (optional): If the transition should be executed in reverse style
     */
    angular.service('$activePage', function() {
        return function() {
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
        };
    });

})(angular, window);

/*
 * Defines the ng:if tag. This is useful if jquery mobile does not allow
 * an ng:switch element in the dom, e.g. between ul and li.
 * Uses ng:repeat and angular.Object.iff under the hood.
 */
(function(angular) {
    angular.Object.iff = function(self, test, trueCase, falseCase) {
        if (test) {
            return trueCase;
        } else {
            return falseCase;
        }
    }

    angular.widget('@ng:if', function(expression, element) {
        var newExpr = 'ngif in $iff(' + expression + ",[1],[])";
        element.removeAttr('ng:if');
        return angular.widget('@ng:repeat').call(this, newExpr, element);
    });
})(angular);


/*
 * The ng:fadein directive
 */
(function(angular) {
    /*
     * Directive that fades in an element when angular
     * uses it. Useful in templating when the underlying template changed.
     */
    angular.directive("ng:fadein", function(expression, element) {
        this.directives(true);
        this.descend(true);
        element.css({opacity:0.1});
        return function(element) {
            element.animate({opacity:1.0}, parseInt(expression));
        };
    });

})(angular);


/**
 * Deactivate the url chaning capabilities
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

(function(angular) {
    /* A widget for clicks.
     * Just as ng:click, but reacts to the jquery mobile vclick event, which
     * includes taps, mousedowns, ...
     */
    angular.directive("ngm:click", function(expression, element) {
        return angular.directive('ng:event')('vclick:' + expression, element);
    });
})(angular);

(function(angular) {
    /* A widget to bind general events like touches, ....
     */
    angular.directive("ng:event", function(expression, element) {
        var pattern = /(.*?):(.*)/;
        var match = pattern.exec(expression);
        if (!match) {
            throw "Expression " + expression + " needs to have the syntax <event>:<handler>";
        }
        var event = match[1];
        var handler = match[2];

        var linkFn = function($updateView, element) {
            var self = this;
            element.bind(event, function(event) {
                var res = self.$tryEval(handler, element);
                $updateView();
            });
        };
        linkFn.$inject = ['$updateView'];
        return linkFn;
    });
})(angular);

(function(angular) {
    /* A widget that reacts when the user presses the enter key.
     */
    angular.directive("ng:enterkey", function(expression, element) {
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
})(angular);

/**
 * Paging Support for lists:
 * Usage:
 <li ng:repeat="l in list.$loadedPages()">{{l}}</li>
 <li ng:if="list.$hasMorePages()">
 <a href="#" ngm:click="list.$loadNextPage()">Load more</a>
 </li>
 */
(function(angular) {
    /**
     * The default page size for all lists.
     * Can be overwritten using array.pageSize.
     */
    if (!$.mobile.defaultListPageSize) {
        $.mobile.defaultListPageSize = 10;
    }

    function getPageSize(list) {
        if (list.pageSize) {
            return list.pageSize;
        }
        return $.mobile.defaultListPageSize;
    }

    function getLoadedEntryCount(list) {
        var res;
        if (!list.loadedCount) {
            res = getPageSize(list);
        } else {
            res = list.loadedCount;
        }
        return Math.min(list.length, res);
    }

    function shrinkLoadedEntryCountIfNeeded(list) {
        if (list.loadedCount && list.loadedCount > list.length) {
            list.loadedCount = list.length;
            if (list.loadedCount < getPageSize(list)) {
                delete list.loadedCount;
            }
        }
    }

    /**
     * Resets the loaded pages for the current list.
     */
    angular.Array.resetPaging = function(list) {
        delete list.loadedCount;
    }

    /**
     * Returns the already loaded pages.
     * Also includes filtering (second argument) and ordering (third argument),
     * as the standard angular way does not work with paging.
     */
    angular.Array.paged = function(list, filterExpr, orderExpr) {
        var origList = list;
        if (filterExpr) {
            list = angular.Array.filter(list, filterExpr);
        }
        if (orderExpr) {
            list = angular.Array.orderBy(list, orderExpr);
        }
        shrinkLoadedEntryCountIfNeeded(origList);

        // Use the loaded count of the unchanged list.
        // This is the only place where we can store
        // the paging state!
        return list.slice(0, getLoadedEntryCount(origList));
    }

    /**
     * Boolean indicating if there are more pages
     */
    angular.Array.hasMorePages = function(list) {
        return getLoadedEntryCount(list) < list.length;
    }

    /**
     * Loads the next page and appends it to the already loaded pages.
     */
    angular.Array.loadNextPage = function(list) {
        list.loadedCount = Math.min(list.length, getLoadedEntryCount(list) + getPageSize(list));
    }

})(angular);