/**
 * This combines the routing of angular and jquery mobile. In detail, it deactivates the routing in jqm
 * and reuses that of angular.
 */
(function (angular, $) {
    var mod = angular.module("ng");

    function registerBrowserDecorator($provide) {
        $provide.decorator('$browser', ['$delegate', function ($browser) {
            // Always return the same base href, as jquery mobile changes
            // the base tag depending on which pages it is loading!
            $browser.initialBaseHref = $browser.baseHref();
            $browser.baseHref = function () {
                // Patch for baseHref to return the correct path also for file-urls.
                // See bug https://github.com/angular/angular.js/issues/1690
                var href = $browser.initialBaseHref;
                return href ? href.replace(/^file?\:\/\/[^\/]*/, '') : href;
            };
            return $browser;
        }]);


        $provide.decorator('$location', ['$delegate', locationRouteOverrideDecorator]);

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

            // TODO file a bug report in angular for this!
            var hash = $location.hash();
            if (hash && hash.indexOf('!') === 0) {
                $location.search({});
                $location.url(hash.substring(1));
            }

            return $location;
        }
    }

    $.mobile._registerBrowserDecorators = $.mobile._registerBrowserDecorators || [];
    $.mobile._registerBrowserDecorators.push(registerBrowserDecorator);

    mod.config(['$provide', function ($provide) {
        registerBrowserDecorator($provide);
    }]);


    // This needs to be outside of a angular config callback, as jqm reads this during initialization.
    function disableJqmHashChange() {
        $.mobile.pushStateEnabled = false;
        $.mobile.hashListeningEnabled = false;
        $.mobile.linkBindingEnabled = false;
        $.mobile.changePage.defaults.changeHash = false;
        $.mobile._handleHashChange = function () {
        };
    }

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

    var DEFAULT_JQM_PAGE = 'DEFAULT_JQM_PAGE';

    mod.config(['$routeProvider', function ($routeProvider) {
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
    }]);

    function getBasePath(path) {
        return path.substr(0, path.lastIndexOf('/'));
    }

    mod.run(['$route', '$rootScope', '$location', '$browser', '$history', function ($route, $rootScope, $location, $browser, $history) {
        var _dialogUrl = '/' + $.mobile.dialogHashKey;

        $rootScope.$on('$routeChangeStart', onRouteChangeStart);
        $rootScope.$on('jqmPagebeforeshow', onPagebeforeshow);
        $rootScope.$on('$routeChangeSuccess', onRouteChangeSuccess);
        removeDialogUrlWhenLocationHashChanges($rootScope, $location);
        instrumentPopupCloseToNavigateBackWhenDialogUrlIsSet();
        instrumentDialogCloseToNavigateBackWhenDialogUrlIsSet();

        // ----------

        function onRouteChangeStart(event, newRoute) {
            var routeOverride = $location.$$routeOverride;
            delete $location.$$routeOverride;
            if (routeOverride) {
                if (routeOverride.onActivate) {
                    newRoute.onActivate = routeOverride.onActivate;
                }
                newRoute.jqmOptions = newRoute.jqmOptions || {};
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
        }


        function onPagebeforeshow(event) {
            var current = $route.current;
            if (current && current.onActivate) {
                event.targetScope.$eval(current.onActivate, current.locals);
            }
            var isDialog = $.mobile.activePage && $.mobile.activePage.jqmData("role") === "dialog";
            if (isDialog) {
                dialogUrl(true);
            }
        }

        function onRouteChangeSuccess() {
            var newRoute = $route.current;
            var $document = $(document);

            var url = newRoute.ngmTemplateUrl;
            if (url === DEFAULT_JQM_PAGE) {
                if (dialogUrl()) {
                    return;
                }
                var url = $location.url();
                var baseHref = $browser.baseHref();
                if (url.indexOf('/') === -1) {
                    url = baseHref + url;
                } else {
                    url = getBasePath(baseHref) + url;
                }
            }
            if (!url) {
                return;
            }
            var navConfig = newRoute.jqmOptions = newRoute.jqmOptions || {};
            if ($history.fromUrlChange) {
                navConfig.fromHashChange = true;
            }

            if (!$.mobile.firstPage) {
                $rootScope.$on("jqmInit", startNavigation);
            } else {
                startNavigation();
            }

            function startNavigation() {
                $.mobile.changePage(url, navConfig);
                if ($.mobile.popup.active) {
                    // Popup are available without loading,
                    // so we can check them right after calling $.mobile.changePage!
                    dialogUrl(true);
                }

            }
        }

        function removeDialogUrlWhenLocationHashChanges($rootScope, $location) {
            $rootScope.$on('$locationChangeStart', function() {
                var hash = $location.hash();
                if (dialogUrl() && hash) {
                    $location.url($location.$$urlBeforeDialog);
                    delete $location.$$urlBeforeDialog;
                    $location.hash(hash);
                }
            });
        }

        function instrumentPopupCloseToNavigateBackWhenDialogUrlIsSet() {
            var popupProto = $.mobile.popup.prototype;
            var _close = popupProto._close;
            popupProto._close = function () {
                if (dialogUrl()) {
                    $rootScope.$apply(function () {
                        $location.goBack();
                    });
                } else {
                    _close.apply(this, arguments);
                }
            };
        }

        function instrumentDialogCloseToNavigateBackWhenDialogUrlIsSet() {
            var dialogProto = $.mobile.dialog.prototype;
            dialogProto.origClose = dialogProto.close;
            dialogProto.close = function () {
                if (this._isCloseable) {
                    this._isCloseable = false;
                    if (dialogUrl()) {
                        $rootScope.$apply(function () {
                            $location.goBack();
                        });
                    } else {
                        this.origClose();
                    }
                }
            };
        }

        // gets or sets a dialog url.
        // We use the same behaviour as in jQuery Mobile: dialog urls
        // are here for allowing users to click "back" to close the dialog,
        // but prevent him from opening them again via "forward".
        function dialogUrl() {
            if (arguments.length === 0) {
                // getter
                return $location.path() === _dialogUrl;
            }
            // setter
            $location.$$urlBeforeDialog = $location.url();
            $location.url(_dialogUrl);
            $location.replace();
        }
    }]);

    function defaultClickHandler(event, iElement, $scope, $location) {
        // Attention: Do NOT stopPropagation, as otherwise
        // jquery Mobile will not generate a vclick event!
        var rel = iElement.jqmData("rel");
        if (rel === 'back') {
            event.preventDefault();
            $scope.$apply(function () {
                $location.goBack();
            });
        } else if (isNoopLink(iElement)) {
            event.preventDefault();
        } else {
            var absHref = iElement.prop('href'),
                rewrittenUrl = $location.$$rewriteAppUrl(absHref);

            if (absHref && !iElement.attr('target') && rel !== 'external' && rewrittenUrl) {
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
                if (rel) {
                    jqmOptions.role = rel;
                }
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

    (function patchAngularToAllowVclicksOnEmptyAnchorTags() {
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
        mod.directive('a', function () {
            return {
                restrict:'E',
                compile:function (element, attr) {
                    if (isNoopLink(element)) {
                        attr.$set('href', '#');
                    }
                }
            };
        });

        // Solution part2: patch the listener for clicks in angular that updates $location to only be executed
        // when the href-Attribute of a link is not equal to "#". Otherwise still prevent the default action,
        // so that the browser does not update the browser location directly.
        // Here we just prevent angular from installing it's default click handler
        // and create our own.
        mod.config(['$locationProvider', function ($locationProvider) {
            var orig$get = $locationProvider.$get;
            $locationProvider.$get = ['$injector', '$rootElement', '$rootScope', '$browser', function ($injector, $rootElement, $rootScope, $browser) {
                var $location = preventClickHandlersOnRootElementWhileCalling($rootElement,
                    function () {
                        return $injector.invoke(orig$get, $locationProvider);
                    });
                // Note: Some of this click handler was copied from the original
                // default click handler in angular.
                $rootElement.bind('click', function (event) {
                    // TODO(vojta): rewrite link when opening in new tab/window (in legacy browser)
                    // currently we open nice url link and redirect then

                    if (event.ctrlKey || event.metaKey || event.which == 2) return;

                    var elm = $(event.target);

                    // traverse the DOM up to find first A tag
                    while (angular.lowercase(elm[0].nodeName) !== 'a') {
                        // ignore rewriting if no A tag (reached root element, or no parent - removed from document)
                        if (elm[0] === $rootElement[0] || !(elm = elm.parent())[0]) return;
                    }
                    defaultClickHandler(event, elm, $rootScope, $location);
                });
                return $location;
            }];
        }]);

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
    })();


})(angular, $);