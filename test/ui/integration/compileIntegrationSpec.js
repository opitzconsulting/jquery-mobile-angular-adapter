describe('compileIntegration', function () {

    it("should call $.mobile.initializePage when the first page is compiled using angular", function () {
        uit.url('../ui/fixtures/test-fixture.html');
        var rootScope;
        uit.append(function ($) {
            var _old = $.mobile.initializePage;
            $.mobile.initializePage = function () {
                rootScope = $("body").injector().get("$rootScope");
                return _old.apply(this, arguments);
            };
        });
        uit.runs(function () {
            expect(rootScope).toBeTruthy();
        });
    });

    it("should angular compile pages loaded dynamically by jqm", function () {
        uit.url('../ui/fixtures/test-fixture.html');
        uit.runs(function ($) {
            $.mobile.changePage('externalPage.html');
        });
        uit.runs(function ($) {
            var page1Scope = $("#start").scope();
            var extPage = $("#externalPage");
            expect($.trim(extPage.text())).toBe('3');
            var extPageScope = extPage.scope();
            expect(extPageScope).toBeTruthy();
            expect(extPageScope).not.toBe(extPageScope.$root);
            expect(extPageScope.$root).toBe(page1Scope.$root);
        });
    });

    it("should allow manual bootstrap using $compile on the document", function() {
        uit.url('../ui/fixtures/empty-fixture.html');
        uit.append(function($) {
            $("html").removeAttr("ng-app");
        });
        uit.runs(function(window,$) {
            $("body").append('<div id="somePage" data-role="page"></div>');
            window.angular.bootstrap(window.document);
            expect($("#somePage").hasClass("ui-page")).toBe(true);
        });
    });

    describe("page stamping", function() {
        uit.url('../ui/fixtures/empty-fixture.html');
        it("should allow to use jqm pages with ng-repeat", function() {
            uit.append(function(window,$) {
                $("body").attr("ng-controller", "PageController");
                $("body").append('<div id="{{page.name}}" data-role="page" ng-repeat="page in pages"><div data-role="header"><h1>{{page.title}}</h1></div><div data-role="content"><a href="" class="addPage" ng-click="addPage()">Add page</a><a href="#{{page.next}}" class="nextPage">Next page</a></div></div>');
                window.PageController = function($scope) {
                    $scope.pages = [];
                    $scope.addPage = function() {
                        var count = $scope.pages.length;
                        $scope.pages.push({name: 'page'+count, title:'Page '+count, next: 'page'+(count+1)});
                    };
                    $scope.addPage();
                };
            });
            uit.runs(function($) {
                var pages = $("body").children('div[data-role="page"]');
                expect(pages.length).toBe(1);
                var page0 = pages.eq(0);
                expect($.mobile.activePage[0]).toBe(page0[0]);
                expect(page0.attr("id")).toBe("page0");
                expect(page0.attr("data-url")).toBe("page0");
                expect(page0.find('h1').text()).toBe('Page 0');
                page0.find(".addPage").click();
                page0.find(".nextPage").click();
            });
            uit.runs(function($) {
                var pages = $("body").children('div[data-role="page"]');
                expect(pages.length).toBe(2);
                var page1 = pages.eq(1);
                expect($.mobile.activePage[0]).toBe(page1[0]);
                expect(page1.attr("id")).toBe("page1");
                expect(page1.attr("data-url")).toBe("page1");
                expect(page1.find('h1').text()).toBe('Page 1');
            });
        });
    });
});
