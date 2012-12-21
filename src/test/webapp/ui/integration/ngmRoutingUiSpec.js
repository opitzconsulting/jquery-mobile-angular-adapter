describe("ngmRouting", function () {
    var $, win, $location, scope, errors, $history;

    beforeEach(function () {
        errors = [];
    });

    afterEach(function () {
        expect(errors).toEqual([]);
    });

    function initWithHistorySupport(hash, historySupport, beforeLoadCallback) {
        loadHtml('/jqmng/ui/test-fixture.html' + (hash || ''), function (win) {
            win.onerror = function (event) {
                errors.push(event);
            };
            var ng = win.angular.module("ng");
            ng.config(['$provide', function ($provide) {
                $provide.decorator("$sniffer", ['$delegate', function ($sniffer) {
                    $sniffer.history = historySupport;
                    return $sniffer;
                }]);
            }]);
            $ = win.$;
            if (beforeLoadCallback) {
                beforeLoadCallback(win);
            }
        });
        runs(function () {
            win = testframe();
            var injector = $("body").injector();
            scope = $("body").scope();
            $location = injector.get("$location");
            $history = injector.get("$history");
        });
    }

    describe('history support true', function () {
        function init(hash) {
            initWithHistorySupport(hash, true, function(win) {
                var _changePage = win.$.mobile.changePage;
                spyOn(win.$.mobile, 'changePage').andCallThrough();
                $.mobile.changePage.defaults = _changePage.defaults;
            });
        }

        describe('initial page', function () {

            it('should be able to start at an internal subpage without hashbang', function () {
                init('#page2');
                waits(500);
                runs(function () {
                    expect($.mobile.activePage.attr("id")).toBe("page2");
                    expect($location.path()).toBe('/test-fixture.html');
                    expect($location.hash()).toBe('page2');
                    expect(win.location.pathname).toBe('/jqmng/ui/test-fixture.html');
                });
            });

            it('should be able to start at an internal subpage with hashbang', function () {
                init('#!/test-fixture.html#page2');
                waits(500);
                runs(function () {
                    expect($.mobile.activePage.attr("id")).toBe("page2");
                    expect($location.path()).toBe('/test-fixture.html');
                    expect($location.hash()).toBe('page2');
                    expect(win.location.pathname).toBe('/jqmng/ui/test-fixture.html');
                });
            });

            it('should call $.mobile.changePage only once with the subpage if a subpage is given', function () {
                init('#!/test-fixture.html#page2');
                waits(500);
                runs(function () {
                    expect($.mobile.changePage.callCount).toBe(2);
                    var pageStr = $.mobile.changePage.argsForCall[0][0];
                    expect(pageStr.indexOf('#page2')).not.toBe(-1);
                });
            });

            it('should be able to start at an external subpage', function () {
                init('#!/externalPage.html');
                runs(function () {
                    expect($.mobile.activePage.attr("id")).toBe("externalPage");
                    expect($location.path()).toBe('/externalPage.html');
                    expect($location.hash()).toBe('');
                    expect(win.location.pathname).toBe('/jqmng/ui/externalPage.html');
                });
            });

            it('should be able to start at an internal page when search parameters are used', function () {
                init('?a=b#!/test-fixture.html?a=b#page2');
                runs(function () {
                    expect($.mobile.activePage.attr("id")).toBe("page2");
                });
            });

        });

        describe('navigation in the app', function () {
            it('should be able to change to an internal page', function () {
                init();
                runs(function () {
                    expect($.mobile.activePage.attr("id")).toBe("start");
                    $location.hash("page2");
                    scope.$apply();
                });
                waitsForAsync();
                runs(function () {
                    expect($.mobile.activePage.attr("id")).toBe("page2");
                    expect($location.path()).toBe('/test-fixture.html');
                    expect($location.hash()).toBe('page2');
                    expect(win.location.pathname).toBe('/jqmng/ui/test-fixture.html');
                });
            });

            it('should be able to change to external pages', function () {
                init();
                runs(function () {
                    expect($.mobile.activePage.attr("id")).toBe("start");
                    $location.path("/externalPage.html");
                    scope.$apply();
                });
                waitsForAsync();
                runs(function () {
                    expect($.mobile.activePage.attr("id")).toBe("externalPage");
                    expect($location.path()).toBe('/externalPage.html');
                    expect($location.hash()).toBe('');
                    expect(win.location.pathname).toBe('/jqmng/ui/externalPage.html');
                });
            });

            it('should be able to load external pages in a different folder, adjust the base tag correctly and go back again', function () {
                var startUrl;
                init();
                runs(function () {
                    win.tag = true;
                    startUrl = win.location.href;
                    expect($.mobile.activePage.attr("id")).toBe("start");
                    $location.path("/someFolder/externalPage.html");
                    scope.$apply();
                });
                waitsForAsync();
                runs(function () {
                    expect(win.location.pathname).toBe('/jqmng/ui/someFolder/externalPage.html');
                    expect($("#basePageLink").prop("href")).toBe(startUrl);
                    expect($("base").prop("href")).toBe(win.location.href);
                    expect(win.tag).toBe(true);
                    $("#basePageLink").click();
                });
                waitsForAsync();
                runs(function () {
                    expect(win.tag).toBe(true);
                    expect(win.location.pathname).toBe('/jqmng/ui/test-fixture.html');
                });
            });
        });
    });

    describe('history support false', function () {
        function init(hash) {
            initWithHistorySupport(hash, false);
        }

        describe('initial page', function () {

            it('should be able to start at an internal subpage with hashbang', function () {
                init('#!/test-fixture.html#page2');
                waits(500);
                runs(function () {
                    expect($.mobile.activePage.attr("id")).toBe("page2");
                    expect($location.path()).toBe('/test-fixture.html');
                    expect($location.hash()).toBe('page2');
                    expect(win.location.pathname).toBe('/jqmng/ui/test-fixture.html');
                });
            });

            it('should be able to start at an external subpage', function () {
                init('#!/externalPage.html');
                runs(function () {
                    expect($.mobile.activePage.attr("id")).toBe("externalPage");
                    expect($location.path()).toBe('/externalPage.html');
                    expect($location.hash()).toBe('');
                    expect(win.location.pathname).toBe('/jqmng/ui/test-fixture.html');
                });
            });

            it('should be able to start at an internal page when search parameters are used', function () {
                init('?a=b#!/test-fixture.html?a=b#page2');
                runs(function () {
                    expect($.mobile.activePage.attr("id")).toBe("page2");
                });
            });

        });

        describe('navigation in the app', function () {
            it('should be able to change to an internal page', function () {
                init();
                runs(function () {
                    expect($.mobile.activePage.attr("id")).toBe("start");
                    $location.hash("page2");
                    scope.$apply();
                });
                waitsForAsync();
                runs(function () {
                    expect($.mobile.activePage.attr("id")).toBe("page2");
                    expect($location.path()).toBe('');
                    expect($location.hash()).toBe('page2');
                    expect(win.location.pathname).toBe('/jqmng/ui/test-fixture.html');
                });
            });

            it('should be able to load external pages in a different folder, adjust the base tag correctly and go back again', function () {
                init();
                runs(function () {
                    win.tag = true;
                    expect($.mobile.activePage.attr("id")).toBe("start");
                    $location.path("/externalPage.html");
                    scope.$apply();
                });
                waitsForAsync();
                runs(function () {
                    expect(win.tag).toBe(true);
                    expect($.mobile.activePage.attr("id")).toBe("externalPage");
                    expect($location.path()).toBe('/externalPage.html');
                    expect($location.hash()).toBe('');
                    expect(win.location.pathname).toBe('/jqmng/ui/test-fixture.html');
                    $("#basePageLink").click();
                });
                waitsForAsync();
                runs(function () {
                    expect(win.tag).toBe(true);
                    expect(win.location.pathname).toBe('/jqmng/ui/test-fixture.html');
                });
            });
        });
    });

    describe('$location.back', function () {
        it('should go back in history when $location.back is used', function () {
            initWithHistorySupport('#start', true);
            waits(500);
            runs(function () {
                expect($.mobile.activePage.attr("id")).toBe("start");
                $location.hash('page2');
                scope.$apply();
            });
            waitsForAsync();
            runs(function () {
                expect($.mobile.activePage.attr("id")).toBe("page2");
                $location.hash("start");
                $location.backMode();
                scope.$apply();
            });
            waitsForAsync();
            runs(function () {
                expect($.mobile.activePage.attr("id")).toBe("start");
                $history.go(1);
            });
            waitsForAsync();
            runs(function () {
                expect($.mobile.activePage.attr("id")).toBe("page2");
            });
        });
    });

    describe('onActivate', function () {
        function visitPage(page, Page2Controller, attrs) {
            initWithHistorySupport(page, true, function (frame) {
                var page = $('#page2');
                page.attr("ng-controller", "Page2Controller");
                frame.Page2Controller = Page2Controller;
                if (attrs) {
                    for (var attr in attrs) {
                        page.attr(attr, attrs[attr]);
                    }
                }
                var mod = frame.angular.module("ng");
                mod.config(function($routeProvider) {
                    $routeProvider.when('/start', {
                        templateUrl: '#start'
                    });
                    $routeProvider.when('/page2', {
                        templateUrl: '#page2',
                        onActivate: 'onActivate(a)'
                    });
                });
            });
        }

        it("should call the onActivate function on the target page before the pagebeforeshow event", function () {
            var onActivateArguments, onActivateArgumentsOnBeforeShow,
                expectedArgs = {a:2};
            var beforeShowCallCount = 0;
            visitPage("#start", function ($scope) {
                $scope.onActivate = function () {
                    onActivateArguments = arguments;
                };
                $scope.onBeforeShow = function () {
                    beforeShowCallCount++;
                    onActivateArgumentsOnBeforeShow = onActivateArguments;
                }
            }, {'ngm-pagebeforeshow':"onBeforeShow()"});
            runs(function () {
                beforeShowCallCount = 0;
                onActivateArgumentsOnBeforeShow = undefined;
                expect(onActivateArguments).toBeUndefined();
                expect(onActivateArgumentsOnBeforeShow).toBeUndefined();
                $location.path('/page2');
                $location.routeOverride({
                    locals:expectedArgs
                });
                scope.$apply();
            });
            waitsForAsync();
            runs(function () {
                expect(onActivateArguments).toEqual([expectedArgs.a]);
                expect(onActivateArgumentsOnBeforeShow).toBe(onActivateArguments);
                expect(beforeShowCallCount).toBe(1);
            });
        });

        it("should call the onActivate function on the target page on back navigation", function () {
            var onActivateArguments,
                expectedArgs = {a:2};
            visitPage("#!/page2", function ($scope) {
                $scope.onActivate = function () {
                    onActivateArguments = arguments;
                }
            });
            runs(function () {
                $location.path("/start");
                scope.$apply();
            });
            waitsForAsync();
            runs(function () {
                expect(onActivateArguments).toBeTruthy();
                expect(onActivateArguments.a).toBeUndefined();
                $location.goBack();
                $location.routeOverride({
                    locals:expectedArgs
                });
                scope.$apply();
            });
            waitsForAsync();
            runs(function () {
                expect(onActivateArguments).toEqual([expectedArgs.a]);
            });
        });

    });

    describe('vclick events on empty anchor tags', function () {
        var el;

        function init(hrefValue) {
            initWithHistorySupport('#start', true, function (win) {
                win.$("#start").append('<div data-role="content"><a href="' + hrefValue + '" id="link"></a></div>');
                el = win.$("#link");
            });
        }

        it('should execute a vclick handler when a click event occurs on empty links', function () {
            init("");
            runs(function () {
                var spy = jasmine.createSpy('vclick');
                el.bind('vclick', spy);
                el.trigger('click');
                expect(spy).toHaveBeenCalled();
            });
        });

        it('should execute a vclick handler when a click event occurs on links with href="#"', function () {
            init("#");
            runs(function () {
                var spy = jasmine.createSpy('vclick');
                el.bind('vclick', spy);
                el.trigger('click');
                expect(spy).toHaveBeenCalled();
            });
        });

        it('should execute a vclick handler when a click event occurs on a link with a filled href attribute', function() {
            init("#someHash");
            runs(function () {
                var spy = jasmine.createSpy('vclick');
                el.bind('vclick', spy);
                el.trigger('click');
                expect(spy).toHaveBeenCalled();
            });

        });

        it('should not update $location nor window.location when an empty link is clicked', function () {
            init("");
            runs(function () {
                $location.hash('someHash');
                scope.$apply();
                el.trigger('click');
                expect($location.hash()).toBe('someHash');
            });
        });

        it('should not update $location nor window.location when a link with href="#" is clicked', function () {
            init("#");
            runs(function () {
                $location.hash('someHash');
                scope.$apply();
                el.trigger('click');
                expect($location.hash()).toBe('someHash');
            });
        });

        it('should update $location if a link with a filled href attribute is clicked', function() {
            init("#someHash2");
            runs(function () {
                $location.hash('someHash');
                scope.$apply();
                el.trigger('click');
                expect($location.hash()).toBe('someHash2');
            });

        });
    });

});
