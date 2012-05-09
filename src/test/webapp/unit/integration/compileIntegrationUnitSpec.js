describe('compileIntegrationUnit', function () {


    it("should create jqm pages when angular compiles a page", function () {
        var c = testutils.compile('<div data-role="page"></div>');
        expect(c.hasClass('ui-page')).toBe(true);
    });

    it("should create jqm dialogs when angular compiles a page", function () {
        var c = testutils.compile('<div data-role="dialog"></div>');
        expect(c.hasClass('ui-page')).toBe(true);
    });

    it("should stamp non widget markup without calling jqm", function () {
        // Note: buttonMarkup is a non widget markup
        spyOn($.fn, 'buttonMarkup').andCallThrough();
        var c = testutils.compileInPage('<div><a href="" data-role="button" ng-repeat="l in list"></a></div>');
        expect($.fn.buttonMarkup.callCount).toBe(1);
        $.fn.buttonMarkup.reset();
        var scope = c.element.scope();
        scope.list = [1, 2];
        scope.$digest();
        expect($.fn.buttonMarkup.callCount).toBe(0);
        var childLinks = c.element.children(".ui-btn");
        expect(childLinks.length).toBe(2);
    });

    it("should stamp jqm widgets using the jqm widgets", function () {
        // Note: button is a widget
        spyOn($.fn, 'button').andCallThrough();
        var c = testutils.compileInPage('<div><button ng-repeat="l in list"></button></div>');
        expect($.fn.button.callCount).toBe(0);
        var scope = c.element.scope();
        scope.list = [1, 2];
        scope.$digest();
        expect($.fn.button.callCount).toBe(2);
        var childWrapper = c.element.children("div.ui-btn");
        expect(childWrapper.length).toBe(2);
        var childButtons = c.element.find("button");
        var btn1 = childButtons.eq(0).data("button");
        var btn2 = childButtons.eq(1).data("button");
        expect(btn1).toBeTruthy();
        expect(btn2).toBeTruthy();
        expect(btn1).not.toBe(btn2);
    });

    describe("partials loaded by angular", function() {
        var containerCompile;

        beforeEach(function() {
            containerCompile = testutils.compileInPage('<div id="container"></div>');
        });

        function compileInPartialInPage(html) {
            var c = containerCompile;
            var container = c.element;
            var scope = container.scope();
            var childScope = scope.$new();
            container.html(html);
            var $compile = c.injector.get("$compile");
            $compile(container.contents())(childScope);
            return {
                page:c.page,
                container: container
            }
        }

        it("should stamp non widget markup without calling jqm", function () {
            // Note: buttonMarkup is a non widget markup
            spyOn($.fn, 'buttonMarkup').andCallThrough();
            var c = compileInPartialInPage('<a href="" data-role="button" ng-repeat="l in list"></a>');
            expect($.fn.buttonMarkup.callCount).toBe(1);
            $.fn.buttonMarkup.reset();
            var scope = c.container.scope();
            scope.list = [1, 2];
            scope.$digest();
            expect($.fn.buttonMarkup.callCount).toBe(0);
            var childLinks = c.container.children(".ui-btn");
            expect(childLinks.length).toBe(2);
        });

        it("should stamp jqm widgets using the jqm widgets", function () {
            // Note: button is a widget
            spyOn($.fn, 'button').andCallThrough();
            var c = compileInPartialInPage('<button ng-repeat="l in list"></button>');
            expect($.fn.button.callCount).toBe(0);
            var scope = c.container.scope();
            scope.list = [1, 2];
            scope.$digest();
            expect($.fn.button.callCount).toBe(2);
            var childWrapper = c.container.children("div.ui-btn");
            expect(childWrapper.length).toBe(2);
            var childButtons = c.container.find("button");
            var btn1 = childButtons.eq(0).data("button");
            var btn2 = childButtons.eq(1).data("button");
            expect(btn1).toBeTruthy();
            expect(btn2).toBeTruthy();
            expect(btn1).not.toBe(btn2);
        });
    });

    it("should allow binding to input fields that got degraded by jqm", function () {
        var oldDegrade = $.mobile.page.prototype.options.degradeInputs.number;
        $.mobile.page.prototype.options.degradeInputs.number = "text";
        var c = testutils.compileInPage('<input type="number" ng-model="name">');
        expect(c.element.attr("type")).toBe("text");
        var scope = c.element.scope();
        scope.name = 123;
        scope.$digest();
        expect(c.element.val()).toBe('123');
        $.mobile.page.prototype.options.degradeInputs.number = oldDegrade;
    });

    describe("scopes", function () {
        it("should create an own scope for a page", function () {
            var c = testutils.compile('<div data-role="page"></div>');
            expect(c.scope()).not.toBe(c.scope().$root);
        });

        it("should not create an own scope for a non page widgets that also use data-role", function () {
            var c = testutils.compile('<a href="" data-role="button"></a>');
            expect(c.scope()).toBe(c.scope().$root);
        });

        it("should digest on pagebeforeshow", function() {
            var c = testutils.compileInPage('<div></div>');
            var scope = c.page.scope();
            var counter = 0;
            scope.$watch(function() {
                counter++;
            });
            c.page.trigger("pagebeforeshow");
            expect(counter).toBe(2);
        });

        it("should digest only the $.mobile.activePage and no other pages when rootScope.$digest is called", function() {
            var c = testutils.compile('<div data-role="page" id="page1"></div><div data-role="page" id="page2"></div>');
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

            $.mobile.activePage = page1;
            rootScope.$digest();
            expect(watch1Counter).toBe(2);
            expect(watch2Counter).toBe(0);

            watch1Counter = watch2Counter = 0;
            $.mobile.activePage = page2;
            rootScope.$digest();
            expect(watch1Counter).toBe(0);
            expect(watch2Counter).toBe(2);
        });
    });

});
