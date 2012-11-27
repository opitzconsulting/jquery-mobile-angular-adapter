'use strict';

describe('ngmRouting', function() {
    describe('$browser.inHashChange', function() {
        it('should set inHashChange during url change callbacks', function() {
            var onUrlChangeSpy;
            module(function($provide) {
                $provide.decorator('$browser', ['$delegate', function($browser) {
                    onUrlChangeSpy = spyOn($browser, 'onUrlChange');
                    return $browser;
                }]);
                $.mobile._registerBrowserDecorator($provide);
            });

            inject(function($browser) {
                var hashChangeDuringCallback;
                var callback = jasmine.createSpy('callback').andCallFake(function() {
                    hashChangeDuringCallback = $browser.inHashChange;
                });
                $browser.onUrlChange(callback);
                expect(onUrlChangeSpy).toHaveBeenCalled();
                expect($browser.inHashChange).toBe(0);
                onUrlChangeSpy.mostRecentCall.args[0]();
                expect($browser.inHashChange).toBe(0);
                expect(hashChangeDuringCallback).toBe(1);
            });
        });
    });

    describe('$location.routeOverride', function() {
        beforeEach(function() {
            spyOn($.mobile, "changePage");
            module(function($routeProvider) {
                $routeProvider.when('/someRoute', {
                    templateUrl: 'someTemplateUrl'
                });
            });
        });

        it('should save the override on the $location object', inject(function($location) {
            var someOverride = {};
            $location.routeOverride(someOverride);
            expect($location.$$routeOverride).toBe(someOverride);
        }));

        it('should override the urlTemplate and save it into the ngmTemplateUrl route property', function() {
            inject(function($location, $route, $rootScope) {
                var overriddenValue = 'someTemplate2';
                $location.path('/someRoute');
                $location.routeOverride({
                    templateUrl: overriddenValue
                });
                $rootScope.$digest();
                expect($route.current.ngmTemplateUrl).toBe(overriddenValue);
            });
        });

        it('should override the jqmOptions', function() {
            inject(function($location, $route, $rootScope) {
                var overriddenValue = {};
                $location.path('/someRoute');
                $location.routeOverride({
                    jqmOptions: overriddenValue
                });
                $rootScope.$digest();
                expect($route.current.jqmOptions).toBe(overriddenValue);
            });
        });

        it('should override the onActivate property', function() {
            inject(function($location, $route, $rootScope) {
                var overriddenValue = 'someActivateFn';
                $location.path('/someRoute');
                $location.routeOverride({
                    onActivate: overriddenValue
                });
                $rootScope.$digest();
                expect($route.current.onActivate).toBe(overriddenValue);
            });
        });

        it('should override the locals', function() {
            inject(function($location, $route, $rootScope) {
                var overriddenValue = {
                    key1: 'value1'
                };
                $location.path('/someRoute');
                $location.routeOverride({
                    locals: overriddenValue
                });
                $rootScope.$digest();
                expect($route.current.locals).toEqual(overriddenValue);
            });
        });
    });

    describe('misc', function() {
        it('should deactivate jqm hash listening and changing', function() {
            expect($.mobile.pushStateEnabled).toBe(false);
            expect($.mobile.hashListeningEnabled).toBe(false);
            expect($.mobile.linkBindingEnabled).toBe(false);
            expect($.mobile.changePage.defaults.changeHash).toBe(false);
        });

        it('should not change the base tag during jqm navigation, as angular does not like this (see following bug test)', inject(function($browser, $location) {
            expect($.support.dynamicBaseTag).toBe(false);
            var oldHref = $.mobile.base.element.attr("href");
            $.mobile.base.set("somePage");
            expect($.mobile.base.element.attr("href")).toBe(oldHref);
        }));

        it('should still contain the angular bug: changing the $location.path in a click function of an anchor when the base tag is different to the document location results in a wrong location', inject(function($browser, $location) {
            spyOn($.mobile, 'changePage');
            var initUrl = $browser.$$url;

            var c = testutils.compileInPage('<a ng-click="click()">Link</a>');

            var base = $("base");
            var oldBase = base.attr("href");
            base.attr('href', initUrl+'test.html');

            var link = c.element;
            var scope = link.scope();
            scope.click = function() {
                $location.path("/someLink");
            };
            link.click();
            // This is the bug: This should really be equal if everything would work as it should be!
            expect($location.path()).not.toEqual("/someLink");

            base.attr('href', oldBase);

        }));
    });

    describe('route listening', function() {

    });




});