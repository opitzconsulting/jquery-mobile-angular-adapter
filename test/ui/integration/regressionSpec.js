describe("regression", function () {
    describe("lists", function () {
        uit.url("../ui/fixtures/test-fixture.html");

        it("should refresh lists with ng-repeat", function () {
            var scope, dialog, dialogOpen;
            uit.append(function (window, $) {
                var page = $('#start');
                page.attr('ng-controller', 'PageController');
                page.append(
                    '<div data-role="content">' +
                        '<button ng-click="fill()" id="fill">Fill</button><ul data-role="listview" id="list"><li ng-repeat="item in items"></li></ul>' +
                        '</div>');
                window.PageController = function ($scope) {
                    $scope.fill = function () {
                        $scope.items = [1, 2];
                    };
                };
            });
            var list, fillBtn;
            uit.runs(function ($) {
                var page = $("#start");
                list = page.find("#list");
                fillBtn = page.find("#fill");
                fillBtn.click();
            });
            uit.runs(function () {
                var lis = list.find('li');
                expect(lis.length).toBe(2);
                expect(lis.eq(0).hasClass('ui-li')).toBe(true);
                expect(lis.eq(1).hasClass('ui-li')).toBe(true);
            });
        });

        it("should refresh non visible children as long as the listview itself is not visible", function () {
            uit.append(function ($) {
                var page = $('#start');
                page.append(
                    '<div data-role="content">' +
                        '<ul data-role="listview" ng-init="list = [1,2]" id="list1" data-inset="true">' +
                        '<li ng-repeat="l in list"><a href="">{{l}}</a></li></ul>' +
                        '</div>');
            });
            uit.runs(function ($) {
                var btns = $("#list1 li");
                expect(btns.eq(0).hasClass("ui-first-child")).toBe(true);
                expect(btns.eq(0).hasClass("ui-last-child")).toBe(false);
                expect(btns.eq(1).hasClass("ui-first-child")).toBe(false);
                expect(btns.eq(1).hasClass("ui-last-child")).toBe(true);

            });
        });

    });

    describe("controlgroup", function () {
        uit.url("../ui/fixtures/test-fixture.html");

        it("should update the corners of children during creation", function () {
            uit.append(function ($) {
                var page = $('#start');
                page.append(
                    '<div data-role="content">' +
                        '<div data-role="controlgroup" id="group1">' +
                        '<a href="" data-role="button">1</a><a href="" data-role="button">2</a>' +
                        '</div>' +
                        '</div>');
            });
            uit.runs(function ($) {
                var btns = $("#group1").children("div").children("a");
                expect(btns.eq(0).hasClass("ui-first-child")).toBe(true);
                expect(btns.eq(0).hasClass("ui-last-child")).toBe(false);
                expect(btns.eq(1).hasClass("ui-first-child")).toBe(false);
                expect(btns.eq(1).hasClass("ui-last-child")).toBe(true);
            });
        });

        it("should refresh non visible children as long as the controlgroup itself is not visible", function () {
            uit.append(function ($) {
                var page = $('#start');
                page.append(
                    '<div data-role="content">' +
                        '<div data-role="controlgroup" ng-init="list = [1,2]" id="group1">' +
                        '<a href="" data-role="button" ng-repeat="l in list">{{l}}</a></div>' +
                        '</div>');
            });
            uit.runs(function ($) {
                var btns = $("#group1").children("div").children("a");
                expect(btns.eq(0).hasClass("ui-first-child")).toBe(true);
                expect(btns.eq(0).hasClass("ui-last-child")).toBe(false);
                expect(btns.eq(1).hasClass("ui-first-child")).toBe(false);
                expect(btns.eq(1).hasClass("ui-last-child")).toBe(true);

            });
        });
    });

    describe('namespace', function () {
        uit.url("../ui/fixtures/empty-fixture.html");

        it("should allow to use a different jquery mobile namespace", function () {
            uit.append(function($) {
                $.mobile.ns = "jqm-";
                $("body").append('<div data-jqm-role="page" id="page"><div data-jqm-role="header"><h1>hello</h1></div></div>');
            });
            uit.runs(function ($) {
                var page = $("#page");
                expect(page.hasClass("ui-page")).toBe(true);
                expect(page.children("div").hasClass("ui-header")).toBe(true);
            });

        });

    });

    describe('navigation', function () {
        it("should navigate correctly when angular is loaded before jqm", function () {
            uit.url("../ui/fixtures/test-fixture-ngBeforeJqm.html#!/page1.html");
            uit.runs(function ($location, $rootScope) {
                $location.path("page2.html");
                $rootScope.$apply();
            });
            uit.runs(function ($, history) {
                expect($.mobile.activePage.attr("id")).toBe("page2");
                history.back();
            });
            uit.runs(function ($) {
                expect($.mobile.activePage.attr("id")).toBe("page1");
            });
        });
    });

    describe('digest on page change', function() {
        it("should digest watchers on next page", function() {
            uit.url("../ui/fixtures/test-fixture.html");
            uit.append(function($) {
                $("#page2").append('<span id="someFlag">{{someFlag}}</span>');
            });
            uit.runs(function($location, $rootScope) {
                $location.url("#page2");
                $rootScope.someFlag = "ok";
                $rootScope.$apply();
            });
            uit.runs(function($) {
                expect($("#someFlag").text()).toBe("ok");
            });
        });
    });

    describe('selectmenu', function() {
        it("should open a non-native selectmenu popup on an external page on first click", function() {
            uit.url("../ui/fixtures/test-fixture.html");
            uit.runs(function($location, $rootScope) {
                $location.url("pageWithSelect.html");
                $rootScope.$apply();
            });
            uit.runs(function($) {
                var select = $("#mysel");
                select.parent().find("a").click();
                expect(select.data("mobileSelectmenu").isOpen).toBe(true);
            });
        });
    });

});
