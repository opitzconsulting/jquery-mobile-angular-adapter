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
 * Integration between jQuery Mobile and angular.js. Needed as jQuery Mobile
 * enhances the pages with new elements and styles and so does angular.
 */

/*
 * Basic compile integration.
 */
(function(angular, $) {
	var globalScope = null;
	
	/**
	 * Lazily initializes the global scope. If a controller named
	 * MainController exists, it will be used as the controller
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
		if (window.MainController) {
			globalScope.$become(MainController);
		}
		return globalScope;
	}

    $.mobile.globalScope = function() {
        if (arguments.length==0) {
            return getGlobalScope();
        } else {
            globalScope = arguments[0];
        }
    };

	// create an own scope for every page when the page is initialized.
	var oldPage = $.fn.page;
	$.fn.page = function() {
		var oldWidgetInstance = $.data(this[0], 'page');
		var res = oldPage.apply(this, arguments);
		if (oldWidgetInstance == undefined) {
			var childScope = getGlobalScope().$new();
            angular.compile(this)(childScope);
		}
        return res;
	};

	// listen to pageshow and update the angular $location-service.
	// Prevents an errornous back navigation when navigating to another page.
	// This occurs when angular does things by an xhr and it's eval
	// method takes some time to run (race condition...).
	// See $location service, especially the sync and updateBrowser functions.
	angular.service("createWatchPageShow", function($browser, $location) {
		$('.ui-page').live('pageshow', function(event, ui){
			$location.update($browser.getUrl());
		});
	}, {$inject: ['$browser','$location'], $eager:true});
})(angular, jQuery);


/*
 * Modification of the angular widgets for the integration with jquery mobile.
 */
(function(angular) {
	/* A widget for clicks.
	 * Just as ng:click. However, also prevents the default action.
	 */
	angular.directive("ngm:click", function(expression, element){
		var linkFn = function($updateView, element){
		    var self = this;
		    element.bind('vclick', function(event){
		      var res = self.$tryEval(expression, element);
		      $updateView();
              event.stopPropagation();
              event.preventDefault();
		    });
		  };
		  linkFn.$inject = ['$updateView'];
		  return linkFn;
		});
	
    /*
     * Need to call refresh on the jquery mobile selectmenu,
     * when angular changes the data.
     * For this, we are wrapping the old select widget...
     */
    var oldSelect = angular.widget('select');
    angular.widget('select', function(element){
        var name = element.attr('name');
        var oldRes = oldSelect.apply(this, arguments);
        var myRes = function($updateView, $defer, element) {
            var res = oldRes.apply(this, arguments);
            var scope = this;
            scope.$watch(name, function(value) {
                var data = element.data();
                if (data.selectmenu) {
                    element.selectmenu("refresh");
                } else if (data.slider) {
                    element.slider("refresh");
                }
            });
            return res;
        }
        myRes.$inject = oldRes.$inject;
        return myRes;
    });
})(angular);


/*
 * Special angular services for jquery mobile
 */
(function(angular) {
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
            if (arguments.length==0) {
               var currPage = $.mobile.activePage;
                if (currPage) {
                    return currPage.attr('id');
                } else {
                    return null;
                }
           } else {
               // set the page...
               var pageId = arguments[0];
               if (pageId=='back') {
                   window.history.back();
               } else {
                   $.mobile.changePage.apply($.mobile.changePage, arguments);
               }
           }
        };
    });

})(angular);


/*
 * Defines templating mechanisms useful for jquery mobile
 */
(function(angular) {
	var templates = {};

	function quickClone(element) {
		  return angular.element(element[0].cloneNode(true));
	}

	function eachAttribute(element, fn){
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
				};
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




