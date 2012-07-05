describe("ngmLocation", function () {
    var $, $location, $navigate, scope, locationChangeSpy;

    function init(jqmCompatMode) {
        loadHtml('/jqmng/ui/test-fixture.html', function (win) {
            var ng = win.angular.module("ng");
            ng.config(function ($locationProvider) {
                $locationProvider.jqmCompatMode(jqmCompatMode);
            });
        });
        runs(function() {
            $ = testframe().$;
            var injector = $("body").injector();
            scope = $("body").scope();
            $location = injector.get("$location");
            $navigate = injector.get("$navigate");
            locationChangeSpy = jasmine.createSpy('$locationChangeSuccess');
            scope.$digest();
            scope.$on("$locationChangeSuccess", locationChangeSpy);
        });
    }

    describe('jqmCompatMode', function () {
        it('should be able to change pages using $location service', function () {
            init(true);
            runs(function () {
                expect($.mobile.activePage.attr("id")).toBe("start");
                $location.hash("page2");
                scope.$digest();
            });
            waitsForAsync();
            runs(function () {
                expect($.mobile.activePage.attr("id")).toBe("page2");
                expect($location.hash()).toBe('page2');
                expect(testframe().location.hash).toBe('#page2');
                expect(locationChangeSpy.callCount).toBe(1);
            })
        });

        it('should be able to change pages using window.location', function () {
            init(true);
            runs(function () {
                expect($.mobile.activePage.attr("id")).toBe("start");
                testframe().location.hash = 'page2';
            });
            waitsForAsync();
            runs(function () {
                expect($.mobile.activePage.attr("id")).toBe("page2");
                expect($location.hash()).toBe('page2');
                expect(testframe().location.hash).toBe('#page2');
                expect(locationChangeSpy.callCount).toBe(1);
            });
        });

        it('should be able to change pages using $navigate', function () {
            init(true);
            runs(function () {
                expect($.mobile.activePage.attr("id")).toBe("start");
                $navigate("#page2");
            });
            waitsForAsync();
            runs(function () {
                expect($.mobile.activePage.attr("id")).toBe("page2");
                expect($location.hash()).toBe('page2');
                expect(testframe().location.hash).toBe('#page2');
                expect(locationChangeSpy.callCount).toBe(1);
            });
        });
    });

    describe('not in jqmCompat mode', function() {

        it('$navigate should not change the hash', function () {
            init(false);
            runs(function () {
                expect($.mobile.activePage.attr("id")).toBe("start");
                $navigate("#page2");
            });
            waitsForAsync();
            runs(function () {
                expect($.mobile.activePage.attr("id")).toBe("page2");
                expect($location.hash()).toBe('');
                expect(locationChangeSpy.callCount).toBe(0);
            })
        });

        it('should not navigate jqm pages when the hash changes', function() {
            init(false);
            runs(function () {
                expect($.mobile.activePage.attr("id")).toBe("start");
                $location.hash("page2");
                scope.$digest();
            });
            waitsForAsync();
            runs(function () {
                expect($.mobile.activePage.attr("id")).toBe("start");
                expect($location.hash()).toBe('page2');
                expect(locationChangeSpy.callCount).toBe(1);
            })

        });
    });


});
