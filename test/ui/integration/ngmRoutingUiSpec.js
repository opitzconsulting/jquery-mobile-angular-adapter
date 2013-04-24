describe("ngmRouting", function () {
    var baseUrl = '../ui/fixtures/test-fixture.html';

    function initWithHistorySupport(historySupport) {
        uit.append(function(angular) {
            var ng = angular.module("ng");
            ng.config(['$provide', function ($provide) {
                $provide.decorator("$sniffer", ['$delegate', function ($sniffer) {
                    $sniffer.history = historySupport;
                    return $sniffer;
                }]);
            }]);
        });
    }

    inject(function($sniffer) {
        if ($sniffer.history) {
            historySupportTrueSpecs();
        }
    });

    function historySupportTrueSpecs() {
        describe('history support true', function () {
            initWithHistorySupport(true);

            describe('initial page', function () {
                it('should be able to start at an internal subpage without hashbang', function () {
                    uit.url(baseUrl+'#page2');
                    uit.runs(function ($, $location, location) {
                        expect($.mobile.activePage.attr("id")).toBe("page2");
                        expect($location.path()).toBe('/test-fixture.html');
                        expect($location.hash()).toBe('page2');
                        expect(location.pathname).toEndWith('/test-fixture.html');
                    });
                });

                it('should be able to start at an internal subpage with hashbang', function () {
                    uit.url(baseUrl+'#!/test-fixture.html?{now}#page2');
                    uit.runs(function ($, $location, location) {
                        expect($.mobile.activePage.attr("id")).toBe("page2");
                        expect($location.path()).toBe('/test-fixture.html');
                        expect($location.hash()).toBe('page2');
                        expect(location.pathname).toEndWith('/test-fixture.html');
                    });
                });

                it('should call $.mobile.changePage only once with the subpage if a subpage is given', function () {
                    uit.url(baseUrl+'#!/test-fixture.html#page2');
                    uit.runs(function ($) {
                        expect($.mobile.changePage.callCount).toBe(2);
                        var pageStr = $.mobile.changePage.argsForCall[0][0];
                        expect(pageStr.indexOf('#page2')).not.toBe(-1);
                    });
                });

                it('should be able to start at an external subpage', function () {
                    uit.url(baseUrl+'#!/externalPage.html');
                    uit.runs(function ($, $location, location) {
                        expect($.mobile.activePage.attr("id")).toBe("externalPage");
                        expect($location.path()).toBe('/externalPage.html');
                        expect($location.hash()).toBe('');
                        expect(location.pathname).toEndWith('/externalPage.html');
                    });
                });

                it('should be able to start at an internal page when search parameters are used', function () {
                    uit.url(baseUrl+'?a=b#!/test-fixture.html?a=b&{now}#page2');
                    uit.runs(function ($) {
                        expect($.mobile.activePage.attr("id")).toBe("page2");
                    });
                });

            });

            describe('navigation in the app', function () {
                uit.url(baseUrl);

                it('should be able to change to an internal page', function () {
                    uit.runs(function ($, $location, $rootScope) {
                        expect($.mobile.activePage.attr("id")).toBe("start");
                        $location.hash("page2");
                        $rootScope.$apply();
                    });
                    uit.runs(function ($, $location, location) {
                        expect($.mobile.activePage.attr("id")).toBe("page2");
                        expect($location.path()).toBe('/test-fixture.html');
                        expect($location.hash()).toBe('page2');
                        expect(location.pathname).toEndWith('/test-fixture.html');
                    });
                });
                it('should be able to change to the active page again, calling $activate', function() {
                    var activateSpy;
                    uit.append(function(angular, $) {
                        var ng = angular.module("ng");
                        ng.config(['$routeProvider', function ($routeProvider) {
                            $routeProvider.when('/hello/:name', {
                                templateUrl: '#page2',
                                onActivate: 'onActivate()'
                            });
                        }]);
                        ng.controller("Page2Ctrl", function($scope) {
                            $scope.onActivate = activateSpy = jasmine.createSpy('activateSpy');
                        });
                        $("#page2").attr("ng-controller", "Page2Ctrl");
                    });
                    uit.runs(function($location, $rootScope) {
                        $location.path('/hello/page1');
                        $rootScope.$apply();
                        expect(activateSpy.callCount).toBe(1);
                        $location.path('/hello/page2');
                        $rootScope.$apply();
                        expect(activateSpy.callCount).toBe(2);
                    });
                });

                it('should be able to change to external pages', function () {
                    uit.runs(function ($, $location, $rootScope) {
                        expect($.mobile.activePage.attr("id")).toBe("start");
                        $location.path("/externalPage.html");
                        $rootScope.$apply();
                    });
                    uit.runs(function ($, $location, location) {
                        expect($.mobile.activePage.attr("id")).toBe("externalPage");
                        expect($location.path()).toBe('/externalPage.html');
                        expect($location.hash()).toBe('');
                        expect(location.pathname).toEndWith('/externalPage.html');
                    });
                });

                it('should be able to load external pages in a different folder, adjust the links in the page, go back again and the same again', function () {
                    var startUrl;
                    uit.runs(function (window, location, $, $location, $rootScope) {
                        window.tag = true;
                        startUrl = location.href.substring(0, location.href.indexOf('?'));
                        expect($.mobile.activePage.attr("id")).toBe("start");
                        $location.path("/someFolder/externalPage.html");
                        $rootScope.$apply();
                    });
                    uit.runs(function (window, location, $) {
                        expect(location.pathname).toEndWith('/externalPage.html');
                        expect($("#basePageLink").prop("href")).toBe(startUrl);
                        expect(window.tag).toBe(true);
                        $("#basePageLink").click();
                    });
                    uit.runs(function (window, location) {
                        expect(window.tag).toBe(true);
                        expect(location.pathname).toEndWith('/test-fixture.html');
                    });
                    uit.runs(function ($location, $rootScope) {
                        $location.path("/someFolder/externalPage.html");
                        $rootScope.$apply();
                    });
                    uit.runs(function ($) {
                        expect($.mobile.activePage.attr("id")).toBe("externalPage");
                    });

                });
            });
        });
    }

    describe('history support false', function () {
        initWithHistorySupport(false);

        describe('initial page', function () {

            it('should be able to start at an internal subpage with hashbang', function () {
                uit.url(baseUrl+'#!/test-fixture.html?{now}#page2');
                uit.runs(function ($, $location, location) {
                    expect($.mobile.activePage.attr("id")).toBe("page2");
                    expect($location.path()).toBe('/test-fixture.html');
                    expect($location.hash()).toBe('page2');
                    expect(location.pathname).toEndWith('/test-fixture.html');
                });
            });

            it('should be able to start at an external subpage', function () {
                uit.url(baseUrl+'#!/externalPage.html');
                uit.runs(function ($, $location, location) {
                    expect($.mobile.activePage.attr("id")).toBe("externalPage");
                    expect($location.path()).toBe('/externalPage.html');
                    expect($location.hash()).toBe('');
                    expect(location.pathname).toEndWith('/test-fixture.html');
                });
            });

            it('should be able to start at an internal page when search parameters are used', function () {
                uit.url(baseUrl+'?a=b#!/test-fixture.html?a=b&{now}#page2');
                uit.runs(function($) {
                    expect($.mobile.activePage.attr("id")).toBe("page2");
                });
            });

        });

        describe('navigation in the app', function () {
            uit.url(baseUrl);
            it('should be able to change to an internal page', function () {
                uit.runs(function ($, $location, $rootScope) {
                    expect($.mobile.activePage.attr("id")).toBe("start");
                    $location.hash("page2");
                    $rootScope.$apply();
                });
                uit.runs(function ($, $location, location) {
                    expect($.mobile.activePage.attr("id")).toBe("page2");
                    expect($location.path()).toBe('/test-fixture.html');
                    expect($location.hash()).toBe('page2');
                    expect(location.pathname).toEndWith('/test-fixture.html');
                });
            });

            it('should be able to load external pages in a different folder, adjust the links in that page, go back again and the same again', function () {
                uit.runs(function (window, $, $location, $rootScope) {
                    window.tag = true;
                    expect($.mobile.activePage.attr("id")).toBe("start");
                    $location.path("/externalPage.html");
                    $rootScope.$apply();
                });
                uit.runs(function (window, $, $location, location) {
                    expect(window.tag).toBe(true);
                    expect($.mobile.activePage.attr("id")).toBe("externalPage");
                    expect($location.path()).toBe('/externalPage.html');
                    expect($location.hash()).toBe('');
                    expect(location.pathname).toEndWith('/test-fixture.html');
                    $("#basePageLink").click();
                });
                uit.runs(function (window, location) {
                    expect(window.tag).toBe(true);
                    expect(location.pathname).toEndWith('/test-fixture.html');
                });
                uit.runs(function ($location, $rootScope) {
                    $location.path("/externalPage.html");
                    $rootScope.$apply();
                });
                uit.runs(function ($) {
                    expect($.mobile.activePage.attr("id")).toBe("externalPage");
                });
            });
        });
    });

    describe('$location.back', function () {
        it('should go back in history when $location.back is used but no more forward', function () {
            uit.url(baseUrl+"#start");
            uit.append(function($, window) {
                $("body").attr("ng-controller", "Ctrl");
                window.Ctrl = function($scope, $location) {
                    $scope.goBack = function() {
                        $location.url("#page2");
                        $location.back();
                    };
                };
                $("body").append('<div data-role="page" id="page3"><a href="#" ng-click="goBack()" id="back">To start</a></div>');
            });
            uit.runs(function ($, $location, $rootScope) {
                expect($.mobile.activePage.attr("id")).toBe("start");
                $location.hash('page2');
                $rootScope.$apply();
                $location.hash('page3');
                $rootScope.$apply();
            });
            uit.runs(function ($, $location, $rootScope) {
                expect($.mobile.activePage.attr("id")).toBe("page3");
                $("#back").click();
            });
            uit.runs(function ($, $history, $browser) {
                expect($.mobile.activePage.attr("id")).toBe("page2");
                expect($browser.url()).toEndWith("#page2");
                $history.go(-1);
            });
            uit.runs(function ($, $history, $browser) {
                expect($.mobile.activePage.attr("id")).toBe("start");
                expect($browser.url()).toEndWith("#start");
            });
        });
    });

    describe('onActivate', function () {
        function initPage2(Page2Controller, attrs) {
            uit.append(function($, window, angular) {
                var page = $('#page2');
                page.attr("ng-controller", "Page2Controller");
                window.Page2Controller = Page2Controller;
                if (attrs) {
                    for (var attr in attrs) {
                        page.attr(attr, attrs[attr]);
                    }
                }
                var mod = angular.module("ng");
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
            uit.url(baseUrl+"#start");
            initPage2(function ($scope) {
                $scope.onActivate = function () {
                    onActivateArguments = arguments;
                };
                $scope.onBeforeShow = function () {
                    beforeShowCallCount++;
                    onActivateArgumentsOnBeforeShow = onActivateArguments;
                };
            }, {'ngm-pagebeforeshow':"onBeforeShow()"});
            uit.runs(function ($location, $rootScope) {
                beforeShowCallCount = 0;
                onActivateArgumentsOnBeforeShow = undefined;
                expect(onActivateArguments).toBeUndefined();
                expect(onActivateArgumentsOnBeforeShow).toBeUndefined();
                $location.path('/page2');
                $location.routeOverride({
                    locals:expectedArgs
                });
                $rootScope.$apply();
            });
            uit.runs(function () {
                expect(onActivateArguments).toEqual([expectedArgs.a]);
                expect(onActivateArgumentsOnBeforeShow).toBe(onActivateArguments);
                expect(beforeShowCallCount).toBe(1);
            });
        });

        it("should call the onActivate function on the target page on back navigation", function () {
            var onActivateArguments,
                expectedArgs = {a:2};
            uit.url(baseUrl+"#!/page2");
            initPage2(function ($scope) {
                $scope.onActivate = function () {
                    onActivateArguments = arguments;
                };
            });
            uit.runs(function ($location, $rootScope) {
                $location.path("/start");
                $rootScope.$apply();
            });
            uit.runs(function ($location, $rootScope, $history) {
                expect(onActivateArguments).toBeTruthy();
                expect(onActivateArguments.a).toBeUndefined();
                $history.goBack();
                $location.routeOverride({
                    locals:expectedArgs
                });
                $rootScope.$apply();
            });
            uit.runs(function () {
                expect(onActivateArguments).toEqual([expectedArgs.a]);
            });
        });

    });

    describe('vclick events on empty anchor tags', function () {
        var el;
        uit.url(baseUrl+"#start");

        function init(hrefValue) {
            uit.append(function ($) {
                $("#start").append('<div data-role="content"><a href="' + hrefValue + '" id="link"></a></div>');
                el = $("#link");
            });
        }

        it('should execute a vclick handler when a click event occurs on empty links', function () {
            init("");
            uit.runs(function () {
                var spy = jasmine.createSpy('vclick');
                el.bind('vclick', spy);
                el.trigger('click');
                expect(spy).toHaveBeenCalled();
            });
        });

        it('should execute a vclick handler when a click event occurs on links with href="#"', function () {
            init("#");
            uit.runs(function () {
                var spy = jasmine.createSpy('vclick');
                el.bind('vclick', spy);
                el.trigger('click');
                expect(spy).toHaveBeenCalled();
            });
        });

        it('should execute a vclick handler when a click event occurs on a link with a filled href attribute', function() {
            init("#someHash");
            uit.runs(function () {
                var spy = jasmine.createSpy('vclick');
                el.bind('vclick', spy);
                el.trigger('click');
                expect(spy).toHaveBeenCalled();
            });

        });

        it('should not update $location nor window.location when an empty link is clicked', function () {
            init("");
            uit.runs(function ($location, $rootScope) {
                $location.hash('someHash');
                $rootScope.$apply();
                el.trigger('click');
                expect($location.hash()).toBe('someHash');
            });
        });

        it('should not update $location nor window.location when a link with href="#" is clicked', function () {
            init("#");
            uit.runs(function ($location, $rootScope) {
                $location.hash('someHash');
                $rootScope.$apply();
                el.trigger('click');
                expect($location.hash()).toBe('someHash');
            });
        });

        it('should update $location if a link with a filled href attribute is clicked', function() {
            init("#someHash2");
            uit.runs(function ($location, $rootScope) {
                $location.hash('someHash');
                $rootScope.$apply();
                el.trigger('click');
                expect($location.hash()).toBe('someHash2');
            });

        });
    });

    describe('navigation cases', function() {
        uit.url(baseUrl);
        describe('from and to the same template url', function() {
            function init(transition) {
                uit.append(function(window, $, angular) {
                    var ng = angular.module("ng");
                    ng.config(function($routeProvider) {
                        $routeProvider.when('/page/:id',{
                            templateUrl:'page1.html',
                            jqmOptions: {
                                transition: transition,
                                speed: "fast"
                            }
                        });
                    });
                });
            }
            it('should navigate without removing the page from the dom', function() {
                init('none');
                uit.runs(function($location, $rootScope) {
                    $location.path("/page/1");
                    $rootScope.$apply();
                });
                uit.runs(function($location, $rootScope) {
                    $location.path("/page/2");
                    $rootScope.$apply();
                });
                uit.runs(function($) {
                    expect($(':jqmData(role="page")').length).toBe(3);
                    expect($.mobile.activePage.attr("id")).toBe('page1');
                });
            });
            it('should navigate and set the activePageClass correctly if using the slide transition', function() {
                init('slide');
                uit.runs(function($location, $rootScope) {
                    $location.path("/page/1");
                    $rootScope.$apply();
                });
                uit.runs(function($location, $rootScope) {
                    $location.path("/page/2");
                    $rootScope.$apply();
                });
                uit.runs(function($) {
                    expect($.mobile.activePage.attr("id")).toBe('page1');
                    expect($.mobile.activePage.hasClass($.mobile.activePageClass)).toBe(true);
                });
            });
            it('should fall back to fade transition for a not none transition', function() {
                init('slide');
                uit.runs(function($location, $rootScope) {
                    $location.path("/page/1");
                    $rootScope.$apply();
                });
                uit.runs(function($location, $rootScope, $) {
                    expect($.mobile.activePage.data("lastNavProps").transition).toBe('slide');
                    $location.path("/page/2");
                    $rootScope.$apply();
                });
                uit.runs(function($) {
                    expect($.mobile.activePage.data("lastNavProps").transition).toBe('fade');
                });
            });
            it('should keep the none transition', function() {
                init('none');
                uit.runs(function($location, $rootScope) {
                    $location.path("/page/1");
                    $rootScope.$apply();
                });
                uit.runs(function($location, $rootScope, $) {
                    expect($.mobile.activePage.data("lastNavProps").transition).toBe('none');
                    $location.path("/page/2");
                    $rootScope.$apply();
                });
                uit.runs(function($) {
                    expect($.mobile.activePage.data("lastNavProps").transition).toBe('none');
                });
            });
        });
        it('should navigate between multiple pages and remove the last page from the dom', function() {
            uit.runs(function($location, $rootScope) {
                $location.path("/page1.html");
                $rootScope.$apply();
            });
            uit.runs(function($location, $rootScope) {
                $location.path("/page2.html");
                $rootScope.$apply();
            });
            uit.runs(function($) {
                expect($(':jqmData(role="page")').length).toBe(3);
                expect($.mobile.activePage.attr("id")).toBe('page2');
            });
        });
    });

    describe('form with empty action', function() {
        it('allows to register a custom click handler', function() {
            var clickSpy, submit;
            uit.url(baseUrl);
            uit.append(function(window, $) {
                var page = $("#start");
                page.append('<div data-role="content"><form data-ajax="false" ng-click="click()"><inputy type="submit" id="submit"></div>');
                page.attr("ng-controller", "MainCtrl");
                window.MainCtrl = function($scope) {
                    $scope.click = clickSpy = jasmine.createSpy('click');
                };
                submit = page.find("#submit");
            });
            uit.runs(function() {
                submit.click();
                expect(clickSpy).toHaveBeenCalled();
            });
        });
    });

    describe('scroll position', function() {
        var bottomScrollPos, initScrollPos;
        uit.url(baseUrl+"#start");
        uit.append(function($) {
            var longText = new Array(500).join('<p>Hello</p>'),
                pageContent = '<div data-role="content">'+longText+'</div>';
            $("#start").append(pageContent);
            $("#page2").append(pageContent);
        });
        function scrollDown() {
            uit.inject(function($, window, document) {
                $(window).scrollTop($(document).height());
                $(window).trigger("scrollstop");
            });
        }
        function scrollPos() {
            var res;
            uit.inject(function($, window) {
                res = $(window).scrollTop();
            });
            return res;
        }
        beforeEach(function() {
            uit.runs(function($location,$rootScope) {
                initScrollPos = scrollPos();
                scrollDown();
                bottomScrollPos = scrollPos();
            });
            uit.runs(function($location, $rootScope) {
                $location.url("#page2");
                $rootScope.$apply();
            });
        });
        it('resets the scroll position when navigating using links', function() {
            uit.runs(function($, $location,$rootScope) {
                $location.url("#start");
                $rootScope.$apply();
                expect(scrollPos()).toBe(initScrollPos);
            });
        });
        it('restores the scroll position when going back', function() {
            uit.runs(function($,$location,$rootScope,$history) {
                $history.goBack();
            });
            uit.runs(function($) {
                expect($.mobile.activePage.attr("id")).toBe("start");
                expect(scrollPos()).toBe(bottomScrollPos);
            });
        });
        it('restores the scroll position when going forward', function() {
            uit.runs(function($location,$rootScope,$history) {
                scrollDown();
                $history.goBack();
            });
            uit.runs(function($history) {
                $history.go(1);
            });
            uit.runs(function($) {
                expect($.mobile.activePage.attr("id")).toBe("page2");
                expect(scrollPos()).toBe(bottomScrollPos);
            });
        });
    });
});
