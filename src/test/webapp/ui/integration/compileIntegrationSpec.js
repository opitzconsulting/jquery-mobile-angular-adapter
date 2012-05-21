describe('compileIntegration', function () {

    it("should call $.mobile.initializePage when the first page is compiled using angular", function () {
        var rootScope;
        loadHtml('/jqmng/ui/test-fixture.html', function (frame) {
            var $ = frame.$;
            var _old = $.mobile.initializePage;
            $.mobile.initializePage = function () {
                rootScope = $("body").injector().get("$rootScope");
                return _old.apply(this, arguments);
            }
        });
        runs(function () {
            expect(rootScope).toBeTruthy();
        });
    });

    it("should angular compile pages loaded dynamically by jqm", function () {
        loadHtml('/jqmng/ui/test-fixture.html');
        runs(function () {
            var $ = testframe().$;
            $.mobile.changePage('/jqmng/ui/externalPage.html');
        });
        waitsForAsync();
        runs(function () {
            var $ = testframe().$;
            var page1Scope = $("#start").scope();
            var extPage = $("#externalPage");
            expect($.trim(extPage.text())).toBe('3');
            var extPageScope = extPage.scope();
            expect(extPageScope).toBeTruthy();
            expect(extPageScope).not.toBe(extPageScope.$root);
            expect(extPageScope.$root).toBe(page1Scope.$root);
        });
    });

    describe("page stamping", function() {
        it("should allow to use jqm pages with ng-repeat", function() {
            loadHtml('/jqmng/ui/empty-fixture.html', function (win) {
                var $ = win.$;
                $("body").attr("ng-controller", "PageController");
                $("body").append('<div id="{{page.name}}" data-role="page" ng-repeat="page in pages"><div data-role="header"><h1>{{page.title}}</h1></div><div data-role="content"><a href="" class="addPage" ng-click="addPage()">Add page</a><a href="#{{page.next}}" class="nextPage">Next page</a></div></div>');
                win.PageController = function($scope) {
                    $scope.pages = [];
                    $scope.addPage = function() {
                        var count = $scope.pages.length;
                        $scope.pages.push({name: 'page'+count, title:'Page '+count, next: 'page'+(count+1)});
                    };
                    $scope.addPage();
                };
            });
            runs(function() {
                var $ = testframe().$;
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
            runs(function() {
                var $ = testframe().$;
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
