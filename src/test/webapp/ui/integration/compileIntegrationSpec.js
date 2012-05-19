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

    it("should evaluate the widget.prototype.options.initSelector and register corresponding angular directives", function() {
        loadHtml('/jqmng/ui/test-fixture.html', function (win) {
            var $ = win.$;
            $.mobile.button.prototype.options.initSelector = 'type1, type2.someClass, [type3="button"], :jqmData(type4="button")';
            var page1 = $("#start");
            page1.append('<div id="btn1plain"></div><type1 id="btn1"></type1>');
            page1.append('<type2 id="btn2plain"></type2><type2 class="someClass" id="btn2"></type2>');
            page1.append('<div type3="plain" id="btn3plain1"></div><div data-type3="button" id="btn3plain2"></div><div type3="button" id="btn3"></div>');
            page1.append('<div data-type4="plain" id="btn4plain"></div><div data-type4="button" id="btn4"></div>');
        });
        runs(function () {
            var $ = testframe().$;
            expect($("#btn1plain").data("button")).toBeFalsy();
            expect($("#btn1").data("button")).toBeTruthy();
            expect($("#btn2plain").data("button")).toBeFalsy();
            expect($("#btn2").data("button")).toBeTruthy();
            expect($("#btn3plain1").data("button")).toBeFalsy();
            expect($("#btn3plain2").data("button")).toBeFalsy();
            expect($("#btn3").data("button")).toBeTruthy();
            expect($("#btn4plain").data("button")).toBeFalsy();
            expect($("#btn4").data("button")).toBeTruthy();
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
