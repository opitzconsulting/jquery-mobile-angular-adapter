describe('compileIntegrationUnit', function () {
    beforeEach(function() {
        jasmine.Clock.useMock();
    });


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
        var spy = spyOn($.fn, 'buttonMarkup').andCallThrough();
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
        var spy = spyOn($.fn, 'buttonMarkup').andCallThrough();
        var c = testutils.compileInPage('<a href="" data-role="button"></a>');
        expect(spy.callCount).toBe(1);
    });

    it("should allow to compile elements that have a parent that does not belong to the document nor document fragment", inject(function($compile, $rootScope) {
        var el = $(document.createElement("div"));
        el.html('<span></span>');
        expect(el[0].parentNode).toBe(null);
        $compile(el.contents())($rootScope);
    }));

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
        var btn1 = childButtons.eq(0).data($.mobile.button.prototype.widgetFullName);
        var btn2 = childButtons.eq(1).data($.mobile.button.prototype.widgetFullName);
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

    describe('pages loaded by jquery from external resources', function() {
        var container, page;
        function init(url, content) {
            container = testutils.compile("<div></div>");
            page = $('<div data-role="page">'+content+'</div>');
            page.attr("data-" + $.mobile.ns + "external-page", url);
            page.jqmData("url", url);
            container.append(page);
            page.page();
            $.mobile.activePage = page;
            page.scope().$root.$digest();
        }

        it("should angular compile", function() {
            init('someUrl', '{{1+2}}');
            expect(page.text()).toBe('3');
            expect(page.scope().$parent).toBe(container.scope());
        });

        it("should adjust relative links", function() {
            init('somePath/someUrl.html', '<a href="test.html">');
            var link = page.find("a");
            expect(link.attr("href")).toBe('somePath/test.html');
        });

        it("should allow anchors without a href", function() {
            init('somePath/someUrl.html', '<a>');
            var link = page.find("a");
            expect(link.attr("href")).toBe('#');
        });

        it("should not adjust absolute links", function() {
            init('somePath/someUrl.html', '<a href="/test.html">');
            var link = page.find("a");
            expect(link.attr("href")).toBe('/test.html');
        });

        it("should not adjust empty links", function() {
            init('somePath/someUrl.html', '<a href="">');
            var link = page.find("a");
            expect(link.attr("href")).toBe('#');
        });

        it("should not adjust empty hash links", function() {
            init('somePath/someUrl.html', '<a href="#">');
            var link = page.find("a");
            expect(link.attr("href")).toBe('#');
        });
    });

    describe("partials loaded by angular", function() {
        var containerCompile, _$httpBackend;

        beforeEach(function() {
            containerCompile = testutils.compileInPage('<div id="container" ng-include="templateUrl"></div>');
        });

        function compileInPartialInPage(html) {
            var c = containerCompile;
            var container = c.element;
            var scope = container.scope();
            scope.templateUrl = "someUrl";
            inject(function ($httpBackend) {
                $httpBackend.when('GET', /.*someUrl*/).respond(html);
                scope.$digest();
                $httpBackend.flush();
                _$httpBackend = $httpBackend;
            });
            return {
                page:c.page,
                container: container
            };
        }

        it("should enhance the partial content", function() {
            var c = compileInPartialInPage('<a href="" data-role="button">Test</a>');
            expect(c.container.children(".ui-btn").length).toBe(1);
        });

        it("should stamp stateless markup without calling jqm", function () {
            // Note: buttonMarkup is a stateless widget
            var spy = spyOn($.fn, 'buttonMarkup').andCallThrough();
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
            var btn1 = childButtons.eq(0).data($.mobile.button.prototype.widgetFullName);
            var btn2 = childButtons.eq(1).data($.mobile.button.prototype.widgetFullName);
            expect(btn1).toBeTruthy();
            expect(btn2).toBeTruthy();
            expect(btn1).not.toBe(btn2);
        });
    });

    describe('template directives', function() {
        it("should enhance non widget markup created by directives with template property and replace mode", function() {
            module("ngMock", function ($compileProvider) {
                $compileProvider.directive('sample', function () {
                    return {
                        restrict:'A',
                        replace: true,
                        template: '<a href="" data-role="button"></a>'
                    };
                });
            });
            var c = testutils.compileInPage('<div sample="true"></div>');
            expect(c.element.hasClass("ui-btn")).toBe(true);
            expect(c.element[0].nodeName.toUpperCase()).toBe('A');
        });

        it("should enhance widget markup created by directives with template property and replace mode", function() {
            module("ngMock", function ($compileProvider) {
                $compileProvider.directive('sample', function () {
                    return {
                        restrict:'A',
                        replace: true,
                        template: '<button>test</button>'
                    };
                });
            });
            var c = testutils.compileInPage('<div sample="true"></div>');
            expect(c.element.hasClass("ui-btn")).toBe(true);
            // special case: button wraps itself into a new element
            expect(c.element.children("button").length).toBe(1);
        });

        it("should not enhance other elements outside of the template", function() {
            module("ngMock", function ($compileProvider) {
                $compileProvider.directive('sample', function () {
                    return {
                        restrict:'A',
                        replace: true,
                        template: '<a href="" data-role="button"></a>'
                    };
                });
            });
            var element = $("<a href='' data-role='button' class='temp'></a>");
            $("body").append(element);
            testutils.compileInPage('<div sample="true"></div>');
            expect(element.hasClass("ui-btn")).toBe(false);

        });

        it("should enhance markup created by directives with template property and append mode", function() {
            module("ngMock", function ($compileProvider) {
                $compileProvider.directive('sample', function () {
                    return {
                        restrict:'A',
                        replace: false,
                        template: '<a href="" data-role="button"></a>'
                    };
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
                    };
                });

            });
            inject(function ($httpBackend) {
                $httpBackend.when('GET', /.*sampleUrl*/).respond('<div><a href="" data-role="button" class="sampleUrl"></a><select data-role="none"></select></div>');
                _$httpBackend = $httpBackend;
            });
            var c = testutils.compileInPage('<div sample-url="true"></div>');
            _$httpBackend.flush();
            var element = c.page.find("a");
            expect(element.hasClass("ui-btn")).toBe(true);
            expect(element[0].nodeName.toUpperCase()).toBe('A');
            expect(element.hasClass("sampleUrl")).toBe(true);
            var selectWithNoRole = c.page.find("select");
            expect(selectWithNoRole.parent()[0].className).toBe('');
        });

        it("should enhance markup created by directives with templateUrl property and append mode", function() {
            var _$httpBackend;

            module("ngMock", function ($compileProvider) {
                $compileProvider.directive('sampleUrl', function () {
                    return {
                        restrict:'A',
                        replace: false,
                        templateUrl: 'sampleUrl'
                    };
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
        var input = c.element.find("input");
        expect(input.attr("type")).toBe("text");
        var scope = input.scope();
        scope.name = 123;
        scope.$digest();
        expect(input.val()).toBe('123');
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
            expect(page1.data($.mobile.page.prototype.widgetFullName)).toBeTruthy();
            var page2 = pages.eq(1);
            expect(page2.attr("id")).toBe("page2");
            expect(page2.data($.mobile.page.prototype.widgetFullName)).toBeTruthy();

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

        it("should digest on pagebeforeshow", inject(function() {
            var c = testutils.compileInPage('<div></div>');
            var scope = c.page.scope();
            var counter = 0;
            scope.$watch(function() {
                counter++;
            });
            c.page.trigger("pagebeforeshow");
            expect(counter).toBe(2);
        }));
        it("should $emit pagebeforeshow on the page and the root scope", function() {
            var c = testutils.compileInPage('<div></div>');
            var scope = c.page.scope();
            scope.$reconnect();
            var pageCounter = 0,
                rootCounter = 0;
            scope.$on("pagebeforeshow", function() {
                pageCounter++;
            });
            scope.$root.$on("pagebeforeshow", function() {
                rootCounter++;
            });
            c.page.trigger("pagebeforeshow");
            expect(pageCounter).toBe(1);
            expect(rootCounter).toBe(1);
        });
        it("should $emit pagebeforeshow on the page and the root scope even if the page is disconnected", function() {
            var c = testutils.compileInPage('<div></div>');
            var scope = c.page.scope();
            scope.$disconnect();
            var pageCounter = 0,
                rootCounter = 0;
            scope.$on("pagebeforeshow", function() {
                pageCounter++;
            });
            scope.$root.$on("pagebeforeshow", function() {
                rootCounter++;
            });
            c.page.trigger("pagebeforeshow");
            expect(pageCounter).toBe(1);
            expect(rootCounter).toBe(1);
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

    it('should not remove pages form page cache when navigating to the same page', function() {
        var page = $('<div data-role="page" data-external-page="true"></div>');
        $(document.body).append(page);
        try {
            page.one( 'pagecreate', $.mobile._bindPageRemove );
            page.page();

            $.mobile.activePage = page;
            page.trigger("pagehide");
            expect(page.parent().length).toBe(1);
        } finally {
            page.remove();
        }
    });

});
