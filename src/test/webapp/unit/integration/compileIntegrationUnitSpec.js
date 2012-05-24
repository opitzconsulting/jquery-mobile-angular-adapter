describe('compileIntegrationUnit', function () {


    it("should create jqm pages when angular compiles a page", function () {
        var c = testutils.compile('<div data-role="page"></div>');
        expect(c.hasClass('ui-page')).toBe(true);
    });

    it("should create jqm dialogs when angular compiles a page", function () {
        var c = testutils.compile('<div data-role="dialog"></div>');
        expect(c.hasClass('ui-page')).toBe(true);
    });

    it("should stamp stateless markup without calling jqm", function () {
        // Note: buttonMarkup is a stateless widget
        var spy = testutils.spyOnJq('buttonMarkup').andCallThrough();
        var c = testutils.compileInPage('<div><a href="" data-role="button" ng-repeat="l in list"></a></div>');
        expect(spy.callCount).toBeGreaterThan(0);
        spy.reset();
        var scope = c.element.scope();
        scope.list = [1, 2];
        scope.$digest();
        expect(spy.callCount).toBe(0);
        var childLinks = c.element.children(".ui-btn");
        expect(childLinks.length).toBe(2);
    });

    it("should call stateless jqm widgets as few as possible", function () {
        var spy = testutils.spyOnJq('buttonMarkup').andCallThrough();
        var c = testutils.compileInPage('<a href="" data-role="button"></a>');
        expect(spy.callCount).toBe(1);
    });

    it("should stamp stateful jqm widgets using the jqm widgets", function () {
        // Note: button is a stateful widget
        var spy = testutils.spyOnJq('button').andCallThrough();
        var c = testutils.compileInPage('<div><button ng-repeat="l in list"></button></div>');
        expect(spy.callCount).toBe(0);
        var scope = c.element.scope();
        scope.list = [1, 2];
        scope.$digest();
        expect(spy.callCount).toBe(2);
        var childWrapper = c.element.children("div.ui-btn");
        expect(childWrapper.length).toBe(2);
        var childButtons = c.element.find("button");
        var btn1 = childButtons.eq(0).data("button");
        var btn2 = childButtons.eq(1).data("button");
        expect(btn1).toBeTruthy();
        expect(btn2).toBeTruthy();
        expect(btn1).not.toBe(btn2);
    });

    it("should not angular compile pages created manually calling the page plugin", function () {
        var container = testutils.compile("<div></div>");
        var page = $('<div data-role="page">{{1+2}}</div>');
        container.append(page);
        page.page();
        $.mobile.activePage = page;
        page.scope().$root.$digest();
        expect(page.text()).toBe('{{1+2}}');
        expect(page.scope()).toBe(container.scope());
    });

    it("should angular compile pages loaded by jquery from external sources", function() {
        var container = testutils.compile("<div></div>");
        var page = $('<div data-role="page">{{1+2}}</div>');
        page.attr("data-" + $.mobile.ns + "external-page", "someUrl");
        container.append(page);
        page.page();
        $.mobile.activePage = page;
        page.scope().$root.$digest();
        expect(page.text()).toBe('3');
        expect(page.scope().$parent).toBe(container.scope());
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
            inject(function($compile) {
                $compile(container.contents())(childScope);
            });
            return {
                page:c.page,
                container: container
            }
        }

        it("should stamp stateless markup without calling jqm", function () {
            // Note: buttonMarkup is a stateless widget
            var spy = testutils.spyOnJq('buttonMarkup').andCallThrough();
            var c = compileInPartialInPage('<div><a href="" data-role="button" ng-repeat="l in list"></a></div>');
            expect(spy.callCount).toBe(1);
            spy.reset();
            var scope = c.container.scope();
            scope.list = [1, 2];
            scope.$digest();
            expect(spy.callCount).toBe(0);
            var childLinks = c.container.children("div").children(".ui-btn");
            expect(childLinks.length).toBe(2);
        });

        it("should stamp stateful jqm widgets using the jqm widgets", function () {
            // Note: button is a widget
            var spy = testutils.spyOnJq('button').andCallThrough();
            var c = compileInPartialInPage('<div><button ng-repeat="l in list"></button></div>');
            expect(spy.callCount).toBe(0);
            var scope = c.container.scope();
            scope.list = [1, 2];
            scope.$digest();
            expect(spy.callCount).toBe(2);
            var childWrapper = c.container.children("div").children("div.ui-btn");
            expect(childWrapper.length).toBe(2);
            var childButtons = c.container.find("button");
            var btn1 = childButtons.eq(0).data("button");
            var btn2 = childButtons.eq(1).data("button");
            expect(btn1).toBeTruthy();
            expect(btn2).toBeTruthy();
            expect(btn1).not.toBe(btn2);
        });
    });

    describe('template directives', function() {
        it("should enhance markup created by directives with template property and replace mode", function() {
            module("ngMock", function ($compileProvider) {
                $compileProvider.directive('sample', function () {
                    return {
                        restrict:'A',
                        replace: true,
                        template: '<a href="" data-role="button"></a>'
                    }
                });
            });
            var c = testutils.compileInPage('<div sample="true"></div>');
            expect(c.element.hasClass("ui-btn")).toBe(true);
            expect(c.element[0].nodeName.toUpperCase()).toBe('A');
        });

        it("should enhance markup created by directives with template property and append mode", function() {
            module("ngMock", function ($compileProvider) {
                $compileProvider.directive('sample', function () {
                    return {
                        restrict:'A',
                        replace: false,
                        template: '<a href="" data-role="button"></a>'
                    }
                });
            });
            var c = testutils.compileInPage('<div sample="true"></div>');
            var link = c.element.children("a");
            expect(link.hasClass("ui-btn")).toBe(true);
            expect(link[0].nodeName.toUpperCase()).toBe('A');
        });

        it("should enhance markup created by directives with templateUrl property and replace mode", function() {
            var _$httpBackend;

            module("ngMock", function ($compileProvider) {
                $compileProvider.directive('sampleUrl', function () {
                    return {
                        restrict:'A',
                        replace: true,
                        templateUrl: 'sampleUrl'
                    }
                });

            });
            inject(function ($httpBackend) {
                $httpBackend.when('GET', /.*sampleUrl*/).respond('<a href="" data-role="button" class="sampleUrl"></a>');
                _$httpBackend = $httpBackend;
            });
            var c = testutils.compileInPage('<div sample-url="true"></div>');
            _$httpBackend.flush();
            var element = c.page.find("a");
            expect(element.hasClass("ui-btn")).toBe(true);
            expect(element[0].nodeName.toUpperCase()).toBe('A');
            expect(element.hasClass("sampleUrl")).toBe(true);
        });

        it("should enhance markup created by directives with templateUrl property and append mode", function() {
            var _$httpBackend;

            module("ngMock", function ($compileProvider) {
                $compileProvider.directive('sampleUrl', function () {
                    return {
                        restrict:'A',
                        replace: false,
                        templateUrl: 'sampleUrl'
                    }
                });

            });
            inject(function ($httpBackend) {
                $httpBackend.when('GET', /.*sampleUrl*/).respond('<a href="" data-role="button" class="sampleUrl"></a>');
                _$httpBackend = $httpBackend;
            });
            var c = testutils.compileInPage('<div sample-url="true"></div>');
            _$httpBackend.flush();
            var link = c.element.children("a");
            expect(link.hasClass("ui-btn")).toBe(true);
            expect(link[0].nodeName.toUpperCase()).toBe('A');
            expect(link.hasClass("sampleUrl")).toBe(true);
        });

    });

    it("should allow binding to input fields that got degraded by jqm as jqm replaces those input fields with new elements", function () {
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

    describe("page stamping", function() {
        it("should allow to use jqm pages with ng-repeat", function() {
            var e = testutils.compile('<div><div id="{{page.name}}" data-role="page" ng-repeat="page in pages"></div></div>');
            expect(e.children().length).toBe(0);
            var scope = e.scope();
            scope.pages = [{name: 'page1'}, {name: 'page2'}];
            scope.$root.$digest();
            var pages = e.children('div');
            expect(pages.length).toBe(2);
            var page1 = pages.eq(0);
            expect(page1.attr("id")).toBe("page1");
            expect(page1.data("page")).toBeTruthy();
            var page2 = pages.eq(1);
            expect(page2.attr("id")).toBe("page2");
            expect(page2.data("page")).toBeTruthy();

        });
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
