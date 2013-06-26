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
