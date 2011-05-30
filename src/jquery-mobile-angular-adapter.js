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

/*
 * Basic compile integration.
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
    $.mobile.afterUpdateViewQueue = [];
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
            var childScope = angular.scope();
            // Overwrite the onEval of the root scope,
            // to be able to react to updateView calls.
            var oldEval = childScope.$eval;
            var evalCount = 0;
            childScope.$eval = function() {
                evalCount++;
                try {
                    return oldEval.apply(this, arguments);
                } finally {
                    evalCount--;
                    if (evalCount==0) {
                        // evaluate the after updateView queue
                        var queue = $.mobile.afterUpdateViewQueue;
                        while (queue.length > 0) {
                            var entry = queue.shift();
                            entry();
                        }
                    }
                }
            }
            angular.compile(this)(childScope);
        } else {
            res = oldPage.apply(self, arguments);
        }
        return res;
    }, oldPage);


    // TODO create a reproduce case for this. Maybe this is no more needed??
    // listen to pageshow and update the angular $location-service.
    // Prevents an errornous back navigation when navigating to another page.
    // This occurs when angular does things by an xhr and it's eval
    // method takes some time to run (race condition...).
    // See $location service, especially the sync and updateBrowser functions.
    angular.service("createWatchPageShow", function($browser, $location) {
        $('.ui-page').live('pageshow', function(event, ui) {
            $location.update($browser.getUrl());
        });
    }, {$inject: ['$browser','$location'], $eager:true});
})(angular, jQuery);


/*
 * Integration of jquery mobile and angular widgets.
 */
(function(angular) {
    /* A widget for clicks.
     * Just as ng:click, but reacts to the jquery mobile vclick event, which
     * includes taps, mousedowns, ...
     */
    angular.directive("ngm:click", function(expression, element) {
        var linkFn = function($updateView, element) {
            var self = this;
            element.bind('vclick', function(event) {
                var res = self.$tryEval(expression, element);
                $updateView();
            });
        };
        linkFn.$inject = ['$updateView'];
        return linkFn;
    });

    var jqmAngularWidgets = {};
    var jqmWidgetProxies = {};
    var angularWidgetProxies = {};


    /**
     * Synchronizes an angular and jquery mobile widget.
     * @param tagname
     * @param jqmWidget
     * @param compileFn compile function(element, jqmWidget) just like the compile functions of angular.
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
                    return function() { };
                }
                var jqmAngularCompileFn = jqmAngularWidgets[tagname+":"+jqmWidget];
                return jqmAngularCompileFn.call(this, element);
            });
            angularWidgetProxies[tagname] = true;
        }
        jqmAngularWidgets[tagname+":"+jqmWidget] = compileFn;
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
            if (instanceExists || this.length==0) {
                return oldWidget.apply(this, arguments);
            } else if ($.mobile.inJqmPageCompile) {
                // Prevent initialization during precompile,
                // and mark the element so that the angular widget
                // can create the widget!
                for (var i=0; i<this.length; i++) {
                    this[i].options = options;
                }
                this.attr('jqmwidget', jqmWidget);
                return this;
            } else {
                // record the function calls
                // and do not execute them until the end of the compilation.
                // Neded for e.g. selectmenu with ng:repeat:
                // ng:repeat uses dom fragements, so the current element
                // is not part of the complete dom yet. However, selectmenu
                // requires access to the parent element, and inserts siblings to the element.
                // Therefor the creation of the widget as well as all function calls
                // is deferred, after the
                // angular compilation.
                this[0].functionCalls = this[0].functionCalls || [];
                var functionCalls = this[0].functionCalls;
                if (functionCalls.length == 0) {
                    var self = this;
                    $.mobile.afterUpdateViewQueue.push(function() {
                        self[0].functionCalls = [];
                        for (var i = 0; i < functionCalls.length; i++) {
                            var call = functionCalls[i];
                            oldWidget.apply(self, call);
                        }
                    });
                }
                var call = Array.prototype.slice.call(arguments, 0);
                functionCalls.push(call);
                return this;
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
            var oldBinder = oldWidget && oldWidget.apply(this, arguments);
            if (!oldWidget) {
                this.descend(true);
                this.directives(true);
            }
            var bindFn = compileFn.apply(this, arguments);
            var newBinder = function() {
                var elementArgumentPos = (oldBinder && oldBinder.$inject && oldBinder.$inject.length) || 0;
                var element = arguments[elementArgumentPos];
                var res = oldBinder && oldBinder.apply(this, arguments);
                bindFn.call(this, element);
                return res;
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
            var regex = /"([^"]*)"/;
            var attr = regex.exec(expression)[1];
            var scope = this;
            if (attr=='disabled') {
                var oldValue;
                // Note: We cannot use scope.$watch here:
                // We want to be called after the proxied angular implementation, and
                // that uses $onEval. $watch always gets evaluated before $onEval.
                scope.$onEval(function() {
                    var value = element.attr(attr);
                    if (value!=oldValue) {
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
     * Definition of the jquery mobile and angular widget interaction
     */
    jqmWidgetDisabledHandling.selectmenu = true;
    jqmAngularWidget('select', 'selectmenu', function(element) {
        var name = element.attr('name');
        return function(element) {
            var scope = this;
            element.selectmenu();
            scope.$watch(name, function(value) {
                element.selectmenu('refresh');
            });
        }
    });

    jqmWidgetDisabledHandling.slider = true;
    jqmAngularWidget('select', 'slider',
            function(element) {
                var name = element.attr('name');
                return function(element) {
                    element.slider();
                    var scope = this;
                    scope.$watch(name, function(value) {
                        element.slider('refresh');
                    });
                };
            });

    jqmWidgetDisabledHandling.checkboxradio = true;
    jqmAngularWidget('input', 'checkboxradio', function(element) {
        var name = element.attr('name');
        return function(element) {
            var scope = this;
            element.checkboxradio();
            scope.$watch(name, function(value) {
                element.checkboxradio('refresh');
            });
            var inChange = false;
            // Angular only binds to the click event,
            // but jquery mobile fires a change event when the checkbox
            // is changed. So fire a click event when a change event occurs...
            element.bind('change', function() {
                if (!inChange) {
                    inChange = true;
                    element.trigger('click');
                    inChange = false;
                }
            });
        }
    });

    jqmWidgetDisabledHandling.button = true;
    jqmAngularWidget('button', 'button', function(element) {
        var options = element[0].options;
        return function(element) {
            var scope = this;
            element.button(options);
        }
    });

    jqmAngularWidget('div', 'collapsible', function(element) {
        var name = element.attr('name');
        return function(element) {
            var scope = this;
            element.collapsible();
        }
    });

    jqmWidgetDisabledHandling.textinput = true;
    jqmAngularWidget('input', 'textinput', function(element) {
        var name = element.attr('name');
        return function(element) {
            var scope = this;
            element.textinput();
        }
    });

    /**
     * Integration of the listview widget.
     * Special case as the the ng:repeat angular widget is added
     * to the children of the ul element, to which the jquery mobile
     * listview widget is added.
     **/
    jqmAngularWidget('ul', 'listview', function(element) {
       element.find('li').attr('jqmwidget','listviewchild');
       return function(element) {
           element.listview();
       }
    });

    createAngularWidgetProxy('@ng:repeat', function(expression, element) {
        var isListView = false;
        if (element.attr('jqmwidget')=='listviewchild') {
            isListView = true;
        }
        if (!isListView) {
            return function() { };
        }
        var match = expression.match(/^\s*(.+)\s+in\s+(.*)\s*$/);
        var rhs = match[2];
        return function(element) {
            var scope = this;
            // Note: We cannot use scope.$watch here:
            // We want to be called after the proxied angular implementation, and
            // that uses $onEval. $watch always gets evaluated before $onEval.
            var oldSize;
            scope.$onEval(function() {
                var collection = scope.$tryEval(rhs, element);
                var size = angular.Object.size(collection);
                if (size!=oldSize) {
                    oldSize = size;
                    element.parent().listview('refresh');
                }
            });
        }
    });


})(angular);


/*
 * onactiveate and onpassivate callbacks for scopes
 */
(function(angular, $) {
    $('div').live('pagebeforehide', function(event, ui) {
        var currPageScope = $(event.target).scope();
        var nextPage = ui.nextPage;
        var nextPageScope = nextPage && nextPage.scope();
        if (currPageScope.onPassivate) {
            currPageScope.onPassivate.call(currPageScope, nextPageScope);
        }
    });

    $('div').live('pagebeforeshow', function(event, ui) {
        var currPageScope = $(event.target).scope();
        var prevPage = ui.prevPage;
        var prevPageScope = prevPage && prevPage.scope();
        if (currPageScope.onActivate) {
            currPageScope.onActivate.call(currPageScope, prevPageScope);
        }
        currPageScope.$service('$updateView')();
    });
})(angular, $);

/*
 * Special angular services for jquery mobile
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
 * Defines templating mechanisms useful for jquery mobile
 */
(function(angular) {
    var templates = {};

    function quickClone(element) {
        return angular.element(element[0].cloneNode(true));
    }

    function eachAttribute(element, fn) {
        var i, attrs = element[0].attributes || [], attr, name, value = {};
        for (i = 0; i < attrs.length; i++) {
            attr = attrs[i];
            name = attr.name;
            value = attr.value;
            fn(name, value);
        }
    }

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

    /**
     * Defines a template to be used later by {@ngm:switch}. The value of the
     * attribute is the template id.
     */
    angular.widget("@ngm:define", function(expression, element) {
        element.removeAttr('ngm:define');
        templates[expression] = element;
        // hide the element, but do not remove it from the dom,
        // as otherwise the iteration in angular over the dom
        // gets confused!
        element.hide();
        // do not allow child tags nor directives, as we want to capture them!
        this.directives(false);
        this.descend(false);
        // and do nothing in the linkage-phase
        return function() {

        };
    });

    /**
     * Applies a template. The value of this attribute needs to be an angular expression
     * that evaluates to a template id defined by {@ngm:define}. When the expression
     * changes, the template also changes.
     */
    angular.widget("@ngm:switch", function(expression, element) {
        var compiler = this;
        element.removeAttr('ngm:switch');
        return function(element) {
            var scope = this;

            scope.$watch(expression, function(tplId) {
                var templateEntry = templates[tplId];
                if (!templateEntry) {
                    element.hide();
                    return;
                }
                ;
                var newElement = quickClone(templateEntry);
                newElement.show();
                // remove all children
                element.html('');
                eachAttribute(element, function(name, value) {
                    element.removeAttr(name);
                });
                // add the attributes of the template
                eachAttribute(newElement, function(name, value) {
                    element.attr(name, value);
                });
                // and also all children of the template
                element.append(newElement.contents());
                // now reevaluate the element again.
                // Attention: keep the old jquery element in the scope correct!
                var oldScopeElement = scope.$element;
                angular.compile(element)(scope);
                scope.$element = oldScopeElement;
            });

        };
    });
})(angular);




