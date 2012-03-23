jqmng.require(["unit/testUtils"], function (utils) {
    describe('compileIntegrationUnit', function () {
        it("should create jqm pages when angular compiles a page", function () {
            var c = utils.compile('<div data-role="page"></div>');
            expect(c.hasClass('ui-page')).toBe(true);
        });

        it("should create jqm dialogs when angular compiles a page", function () {
            var c = utils.compile('<div data-role="dialog"></div>');
            expect(c.hasClass('ui-page')).toBe(true);
        });

        it("should create jqm pages when angular compiles a page", function () {
            var c = utils.compileInPage('<div></div>');
            expect(c.page.hasClass('ui-page')).toBe(true);
        });

        it("should enhance widgets when added to a page after a $digest cycle", function () {
            var c = utils.compileInPage('<div></div>');
            c.element.append('<a href="" data-role="button">Test</a>');
            expect(c.page.find('a').hasClass('ui-btn')).toBe(false);
            c.page.scope().$digest();
            expect(c.page.find('a').hasClass('ui-btn')).toBe(true);
        });

        it("should fire a requestrefresh event when widgets are added to the page", function () {
            var c = utils.compileInPage('<div></div>');
            var eventCount = 0;
            c.page.bind('requestrefresh', function () {
                eventCount++;
            });
            c.element.append('<a href="" data-role="button">Test</a>');
            expect(eventCount).toEqual(1);
        });

        it("should fire the requestrefresh event when elements are removed", function () {
            var c = utils.compileInPage('<div><span></span></div>');
            var element = c.element;
            var scope = element.scope();
            var eventCount = 0;
            c.page.bind('requestrefresh', function () {
                eventCount++;
            });
            element.find('span').remove();
            expect(eventCount).toEqual(1);
        });

        it("should call $digest only for the current page", function () {
            var c = utils.compile('<div data-role="page" id="page1"></div><div data-role="page" id="page2"></div>');
            var page1 = c.eq(0);
            var page2 = c.eq(1);
            var watch1Counter = 0;
            page1.scope().$watch(function () {
                watch1Counter++;
            });
            var watch2Counter = 0;
            page2.scope().$watch(function () {
                watch2Counter++;
            });
            var rootScope = page1.scope().$root;
            page1.data("page")._trigger("beforeshow");
            watch1Counter = watch2Counter = 0;
            rootScope.$digest();
            expect(watch1Counter).toBeGreaterThan(0);
            expect(watch2Counter).toBe(0);
            page1.data("page")._trigger("beforehide");
            page2.data("page")._trigger("beforeshow");
            watch1Counter = watch2Counter = 0;
            rootScope.$digest();
            expect(watch2Counter).toBeGreaterThan(0);
            expect(watch1Counter).toBe(0);
        });

        it("should work fine with asyncEval that changes something in the page", function () {
            var page = utils.compile('<div data-role="page" id="page1"></div>');
            page.data("page")._trigger("beforeshow");
            var pageCounter = 0;
            var scope = page.scope();
            scope.$watch('flag', function () {
                pageCounter++;
            });
            scope.$root.$evalAsync(function () {
                scope.flag = true;
            });
            pageCounter = 0;
            scope.$root.$digest();
            expect(pageCounter).toBe(1);
        });

        it("should work with pages created dynamically by jquery mobile", function () {
            var element = utils.compile('<div></div>');
            var page = $('<div data-role="page" id="page1"></div>').page();
            element.append(page);
            page.data("page")._trigger("beforeshow");
            element.scope().$root.$digest();
        });

        it("should allow $apply within $apply", function () {
            var scope = angular.injector(["ng"]).get("$rootScope");
            var res;
            scope.$watch(function () {
                res = scope.$apply('1+2');
            });
            scope.$apply();
            expect(res).toBe(3);
        });

        it("should allow $digest within $digest", function () {
            var scope = angular.injector(["ng"]).get("$rootScope");
            scope.$watch(function () {
                scope.$digest();
            });
            scope.$digest();
        });

    });
});
