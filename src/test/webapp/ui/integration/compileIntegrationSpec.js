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

    it("should not angular compile pages created manually calling the page plugin", function () {
        loadHtml('/jqmng/ui/test-fixture.html');
        runs(function () {
            var $ = testframe().$;
            var page3 = $('<div id="externalPage" data-role="page">{{1+2}}</div>');
            $("body").append(page3);
            page3.page();
            expect(page3.text()).toBe('{{1+2}}');
            expect(page3.scope()).toBe(page3.scope().$root);
        });

    });

    it('should use the $rootScope as parent of all page scopes', function () {
        loadHtml('/jqmng/ui/test-fixture.html');
        runs(function () {
            var win = testframe();
            var page1 = win.$("#start");
            page1.page();
            expect(page1.scope()).toBeTruthy();
            expect(page1.scope().$root).toBe(win.$(win.document.documentElement).scope());
        });
    });

    it("should work with degraded inputs", function () {
        loadHtml('/jqmng/ui/test-fixture.html', function (win) {
            var $ = win.$;
            $.mobile.page.prototype.options.degradeInputs.number = "text";
            var page1 = $("#start");
            page1.append('<input type="number" ng-model="myname" id="myname">');
        });
        runs(function () {
            var win = testframe();
            var $ = win.$;
            var page1 = $("#start");
            var input = page1.find("#myname");
            expect(input.length).toBe(1);
            expect(input.attr("type")).toBe("text");
            var scope = page1.scope();
            scope.myname = 1234;
            scope.$digest();
            expect(input.val()).toBe("1234");
        })
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
});
