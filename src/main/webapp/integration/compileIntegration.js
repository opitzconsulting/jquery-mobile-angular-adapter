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

    var lastCreatedPages = [];

    /**
     * This directive will preprocess the dom during compile.
     * For this, the directive needs to have the highest priority possible,
     * so that it is used even before ng-repeat.
     */
    var preProcessDirective = {
        restrict:'EA',
        priority:100000,
        compile:function (tElement, tAttrs) {
            // Note: We cannot use tAttrs here, as this is also copied when
            // angular uses a directive with the template-property and replace-mode.
            if (tElement[0].preProcessDirective) {
                return;
            }
            tElement[0].preProcessDirective = true;

            // For page elements:
            var roleAttr = tAttrs.role;
            var isPage = roleAttr == 'page' || roleAttr == 'dialog';

            // enhance non-widgets markup.
            markJqmWidgetCreation(function () {
                preventJqmWidgetCreation(function () {

                    if (isPage) {
                        // element contains pages.
                        // create temporary pages for the non widget markup, that we destroy afterwards.
                        // This is ok as non widget markup does not hold state, i.e. no permanent reference to the page.
                        tElement.page();
                    } else {
                        if (!tElement[0].jqmEnhanced) {
                            tElement.parent().trigger("create");
                        }
                    }
                    // Note: The page plugin also enhances child elements,
                    // so we tag the child elements also in that case.
                    // Note: We cannot use $.fn.data here, as this is also copied when
                    // angular uses a directive with the template-property.
                    var children = tElement[0].getElementsByTagName("*");
                    for (var i = 0; i < children.length; i++) {
                        children.item(i).jqmEnhanced = true;
                    }
                    tElement[0].jqmEnhanced = true;

                });
            });

            // Destroy the temporary pages again
            if (isPage) {
                tElement.page("destroy");
            }
        }
    };


    /**
     * This directive creates the jqm widgets.
     */
    var widgetDirective = {
        restrict:'EA',
        // after the normal angular widgets like input, ngModel, ...
        priority:0,
        // This will be changed by the setWidgetScopeDirective...
        scope:false,
        require:['?ngModel'],
        compile:function (tElement, tAttrs) {
            // Note: We cannot use tAttrs here, as this is also copied when
            // angular uses a directive with the template-property and replace-mode.
            if (tElement[0].widgetDirective) {
                return;
            }
            tElement[0].widgetDirective = true;

            // For page elements:
            var roleAttr = tAttrs["role"];
            var isPage = roleAttr == 'page' || roleAttr == 'dialog';
            var widgets = tElement.data("jqm-widgets");
            var linkers = tElement.data("jqm-linkers");
            return {
                pre:function (scope, iElement, iAttrs) {
                    if (isPage) {
                        // Create the page widget without the pagecreate-Event.
                        // This does no dom transformation, so it's safe to call this in the prelink function.
                        createPagesWithoutPageCreateEvent(iElement);
                        lastCreatedPages.push(scope);
                    }
                },
                post:function (scope, iElement, iAttrs, ctrls) {
                    if (widgets && widgets.length) {
                        var widget;
                        for (var i = 0; i < widgets.length; i++) {
                            widget = widgets[i];
                            widget.create.apply(iElement, widget.args);
                        }
                    }
                    if (linkers) {
                        for (var i=0; i<linkers.length; i++) {
                            linkers[i].apply(this, arguments);
                        }
                    }
                }
            };
        }
    };

    /**
     * This widget sets or resets the properties of the actual widgetDirective.
     * This is especially required for the scope property.
     * We need this as angular does not (yet) allow us to create a widget for e.g. data-role="page",
     * but not for data-role="content".
     */
    var setWidgetScopeDirective = {
        restrict:widgetDirective.restrict,
        priority:widgetDirective.priority + 1,
        compile:function (tElement, tAttrs) {
            widgetDirective.scope = (tAttrs.role == 'page' || tAttrs.role == 'dialog');
        }
    };

    /**
     * Register our directives for all possible elements with jqm markup.
     * Note: We cannot just create a widget for the jqm-widget attribute, that we create,
     * as this would not work for the jqm widgets on the root element of the compile
     * (angular calculates the directives to apply before calling the compile function of
     * any of those directives).
     * @param tagList
     */
    function registerDirective(tagList) {
        for (var i = 0; i < tagList.length; i++) {
            ng.directive(tagList[i], function () {
                return preProcessDirective;
            });
            ng.directive(tagList[i], function () {
                return setWidgetScopeDirective;
            });
            ng.directive(tagList[i], function () {
                return widgetDirective;
            });
        }
    }

    registerDirective(['div', 'role', 'input', 'select', 'button', 'textarea', 'fieldset']);

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
                for (var k = 0; k < this.length; k++) {
                    var element = this.eq(k);
                    var widgetElement = element;
                    var linkElement = element;
                    var createData = {
                        widgetElement:widgetElement,
                        linkElement:linkElement,
                        create:$.fn.orig[widgetName]
                    };
                    if (jqmNgWidgets[widgetName].precompile) {
                        jqmNgWidgets[widgetName].precompile(createData);
                        // allow the precompile to change the element to which
                        // we add the data.
                        widgetElement = createData.widgetElement;
                        linkElement = createData.linkElement;
                    }
                    var jqmWidgets = widgetElement.data("jqm-widgets");
                    if (!jqmWidgets) {
                        jqmWidgets = [];
                        widgetElement.data("jqm-widgets", jqmWidgets);
                    }
                    var linkers = linkElement.data("jqm-linkers");
                    if (!linkers) {
                        linkers = [];
                        linkElement.data("jqm-linkers", linkers);
                    }

                    var widgetExists = false;
                    for (var i = 0; i < jqmWidgets.length; i++) {
                        if (jqmWidgets[i].name == widgetName) {
                            widgetExists = true;
                            break;
                        }
                    }
                    if (!widgetExists) {
                        jqmWidgets.push({name:widgetName, args:Array.prototype.slice.call(arguments), create:createData.create});
                        linkers.push(jqmNgWidgets[widgetName].link);
                    }
                }
            }
            if (preventJqmWidgetCreation()) {
                return false;
            }
            return $.fn.orig[widgetName].apply(this, arguments);
        });
    }

    var jqmNgWidgets = {};

    $.mobile.registerJqmNgWidget = function (widgetName, precompileFn, linkFn) {
        jqmNgWidgets[widgetName] = {
            precompile: precompileFn,
            link:linkFn
        };
        patchJqmWidget(widgetName);
    }
})(window.jQuery, window.angular);