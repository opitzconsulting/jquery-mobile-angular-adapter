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
                        lastActiveScope.$destroy();
                    }
                    lastActiveScope = activeScope;
                    if (activeScope) {
                        activeScope.$reconnect();
                    }
                }
                return _$digest.apply(this, arguments);
            };
            return $rootScope;
        }]);
    }]);

    $.mobile.autoInitializePage = false;
    var jqmInitialized = false;

    // We want to create a special directive that matches data-role="page" and data-role="dialog",
    // but none of the other data-role="..." elements of jquery mobile. As we want to create a new
    // scope for those elements (but not for the others), this is only possible, if we preprocess the dom and add a new attribute
    // that is unique for pages and dialogs, for which we can register an angular directive.
    ng.config(['$provide', function ($provide) {
        $provide.decorator('$compile', ['$delegate', function ($delegate) {
            var selector = ':jqmData(role="page"), :jqmData(role="dialog")';
            var rolePageAttr = 'jqm-page';
            return function (element) {
                var parentPage = element.parents(selector);
                if (parentPage.length > 0) {
                    // within a parent page: enhance non-widgets markup.
                    var old = preventJqmWidgetCreation;
                    preventJqmWidgetCreation = true;
                    element.parent().trigger("create");
                    preventJqmWidgetCreation = old;
                } else {
                    element.filter(selector).add(element.find(selector)).attr(rolePageAttr, true);
                }
                return $delegate.apply(this, arguments);
            }
        }]);
    }]);

    var preventJqmWidgetCreation = false;

    // Directive for jquery mobile pages. Refreshes the jquery mobile widgets
    // when the page changes.
    ng.directive('jqmPage', ['$compile', function ($compile) {
        return {
            restrict:'A',
            scope:true,
            compile:function(tElement, tAttrs) {
                var old = preventJqmWidgetCreation;
                preventJqmWidgetCreation = true;
                if (!jqmInitialized) {
                    jqmInitialized = true;
                    $.mobile.initializePage();
                }
                tElement.page();
                preventJqmWidgetCreation = old;
                return {
                    pre:function preLink(scope, iElement, iAttrs) {
                        // Detach the scope from the normal $digest cycle.
                        // Needed so that only $.mobile.activePage gets digested when rootScope.$digest
                        // is called.
                        scope.$destroy();
                    }
                }
            }
        };
    }]);

    // If jqm loads a page from an external source, angular needs to compile it too!
    ng.run(['$rootScope', '$compile', function ($rootScope, $compile) {
        var _page = $.fn.page;
        $.fn.page = function () {
            if (!preventJqmWidgetCreation) {
                if (this.attr("data-" + $.mobile.ns + "external-page")) {
                    $compile(this)($rootScope.$new());
                }
            }
            return _page.apply(this, arguments);
        };
    }]);

    var jqmWidgetDeactivate = {};

    function deactivateJqmWidgetEnhanceDuringPageCompile(widgetName) {
        if (jqmWidgetDeactivate[widgetName]) {
            return;
        }
        jqmWidgetDeactivate[widgetName] = true;
        var jqmWidgetProto = $.mobile[widgetName].prototype;
        var _enhance = jqmWidgetProto.enhance;
        jqmWidgetProto.enhance = function () {
            if (preventJqmWidgetCreation) {
                return;
            }
            return _enhance.apply(this, arguments);
        };
    }

    ng.config(["$compileProvider", function ($compileProvider) {
        var jqmNgBindings = {};

        var SPECIAL_CHARS_REGEXP = /([\:\-\_]+(.))/g;

        /**
         * Converts snake_case to camelCase.
         * Also there is special case for Moz prefix starting with upper case letter.
         * @param name Name to normalize
         */
        function normalizeDirectiveName(name) {
            if (name.indexOf('data-') === 0) {
                name = name.substring(5);
            }
            // camelCase
            return name.
                replace(SPECIAL_CHARS_REGEXP, function (_, separator, letter, offset) {
                return offset ? letter.toUpperCase() : letter;
            });
        }

        function bindJqmWidgetToAngularWidget(jqmWidgetName, directiveName, directiveType, filter, linkfn) {
            var bindings = jqmNgBindings[directiveName];
            if (!bindings) {
                bindings = [];
                jqmNgBindings[directiveName] = bindings;
                $compileProvider.directive(normalizeDirectiveName(directiveName), function () {
                    return {
                        restrict:directiveType,
                        require:['?ngModel'],
                        compile:function () {
                            return {
                                post:function (scope, iElement, iAttrs, ctrls) {
                                    for (var i = 0; i < bindings.length; i++) {
                                        var localJqmWidgetName = bindings[i].widgetName;
                                        if (!iElement.data(localJqmWidgetName)) {
                                            var localFilter = bindings[i].filter;
                                            if (!localFilter || iElement.filter(localFilter).length > 0) {
                                                iElement[localJqmWidgetName]();
                                                if (bindings[i].link) {
                                                    bindings[i].link.apply(this, arguments);
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                });
            }
            bindings.push({widgetName:jqmWidgetName, filter:filter, link:linkfn});

            deactivateJqmWidgetEnhanceDuringPageCompile(jqmWidgetName);
        }

        // Supported Syntax:
        // button
        // input[type="name"]
        // :jqmData(type='search') -> Replace with [data-type="search"]
        // [type='button']
        var jqmDataRE = /:jqmData\(([^)]*)\)/g;

        function getSelectorParts(jqmWidgetName) {
            var parts = $.mobile[jqmWidgetName].prototype.options.initSelector.split(',');
            for (var i = 0; i < parts.length; i++) {
                var part = parts[i];
                part = $.trim(part);
                // see jquery mobile
                parts[i] = part.replace(jqmDataRE, "[data-" + ( $.mobile.ns || "" ) + "$1]");
            }
            return parts;
        }

        var selectorRegex = /(\[)?([A-Za-z0-9\-]+)(.*)/;

        /**
         * Registers a jqm widget at the angular compiler, so that angular creates the right widget at the right place.
         * For this, this function will parse the jqm selectors and create the needed angular widgets.
         * <p>
         * Only use this for "real" jqm widgets, i.e. widgets that are not only markup, and also contain listeners.
         * @param widgetName
         * @param linkFn An additional angular linking function (optional)
         */
        function parseSelectorAndRegisterJqmWidget(widgetName, linkFn) {
            var selectorParts = getSelectorParts(widgetName);
            for (var i = 0; i < selectorParts.length; i++) {
                var part = selectorParts[i];
                var match = selectorRegex.exec(part);
                if (!match) {
                    throw new Error("Could not parse the selector " + part);
                }
                var attrDirective = match[1];
                var directiveName = match[2];
                if (attrDirective) {
                    bindJqmWidgetToAngularWidget(widgetName, directiveName, 'A', part, linkFn);
                } else {
                    var filter = match[3];
                    bindJqmWidgetToAngularWidget(widgetName, directiveName, 'E', filter, linkFn);
                }
            }
        }

        $compileProvider.parseSelectorAndRegisterJqmWidget = parseSelectorAndRegisterJqmWidget;
    }]);
})(window.jQuery, window.angular);