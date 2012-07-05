'use strict';

/**
 * Create jasmine.Spy on given method, but ignore calls without arguments
 * This is helpful when need to spy only setter methods and ignore getters
 */
function spyOnlyCallsWithArgs(obj, method) {
    var spy = spyOn(obj, method);
    obj[method] = function() {
        if (arguments.length) return spy.apply(this, arguments);
        return spy.originalValue.apply(this);
    };
    return spy;
}

var jqLite = window.jQuery;


describe('ngm extensions to $location', function() {
    var url;

    function initService() {
        return module(function($provide, $locationProvider){
            $locationProvider.jqmCompatMode(true);
        });
    }
    function initBrowser(url, basePath) {
        return function($browser){
            $browser.url(url);
            $browser.$$baseHref = basePath;
        };
    }

    function newUrl(url) {
        var res;
        inject(function($location) {
            res = $location;
        });
        res.$$parse(url);
        return res;
    }

    afterEach(function() {
        // link rewriting used in html5 mode on legacy browsers binds to document.onClick, so we need
        // to clean this up after each test.
        jqLite(document).unbind('click');
    });

    describe('NewUrl', function() {
        beforeEach(function() {
            initService();
            inject(initBrowser('http://new.com/a/b', '/a/b'));

            url = newUrl('http://www.domain.com:9877/path/b?search=a&b=c&d#hash');
        });


        it('should provide common getters', function() {
            expect(url.absUrl()).toBe('http://www.domain.com:9877/path/b?search=a&b=c&d#hash');
            expect(url.protocol()).toBe('http');
            expect(url.host()).toBe('www.domain.com');
            expect(url.port()).toBe(9877);
            expect(url.path()).toBe('/path/b');
            expect(url.search()).toEqual({search: 'a', b: 'c', d: true});
            expect(url.hash()).toBe('hash');
            expect(url.url()).toBe('/path/b?search=a&b=c&d#hash');
        });


        it('path() should change path', function() {
            url.path('/new/path');
            expect(url.path()).toBe('/new/path');
            expect(url.absUrl()).toBe('http://www.domain.com:9877/new/path?search=a&b=c&d#hash');
        });


        it('search() should accept string', function() {
            url.search('x=y&c');
            expect(url.search()).toEqual({x: 'y', c: true});
            expect(url.absUrl()).toBe('http://www.domain.com:9877/path/b?x=y&c#hash');
        });


        it('search() should accept object', function() {
            url.search({one: 1, two: true});
            expect(url.search()).toEqual({one: 1, two: true});
            expect(url.absUrl()).toBe('http://www.domain.com:9877/path/b?one=1&two#hash');
        });


        it('search() should change single parameter', function() {
            url.search({id: 'old', preserved: true});
            url.search('id', 'new');

            expect(url.search()).toEqual({id: 'new', preserved: true});
        });


        it('search() should remove single parameter', function() {
            url.search({id: 'old', preserved: true});
            url.search('id', null);

            expect(url.search()).toEqual({preserved: true});
        });


        it('hash() should change hash fragment', function() {
            url.hash('new-hash');
            expect(url.hash()).toBe('new-hash');
            expect(url.absUrl()).toBe('http://www.domain.com:9877/path/b?search=a&b=c&d#new-hash');
        });


        it('url() should change the path, search and hash', function() {
            url.url('/some/path?a=b&c=d#hhh');
            expect(url.url()).toBe('/some/path?a=b&c=d#hhh');
            expect(url.absUrl()).toBe('http://www.domain.com:9877/some/path?a=b&c=d#hhh');
            expect(url.path()).toBe('/some/path');
            expect(url.search()).toEqual({a: 'b', c: 'd'});
            expect(url.hash()).toBe('hhh');
        });


        it('url() should change only hash when no search and path specified', function() {
            url.url('#some-hash');

            expect(url.hash()).toBe('some-hash');
            expect(url.url()).toBe('/path/b?search=a&b=c&d#some-hash');
            expect(url.absUrl()).toBe('http://www.domain.com:9877/path/b?search=a&b=c&d#some-hash');
        });


        it('url() should change only search and hash when no path specified', function() {
            url.url('?a=b');

            expect(url.search()).toEqual({a: 'b'});
            expect(url.hash()).toBe('');
            expect(url.path()).toBe('/path/b');
        });


        it('url() should reset search and hash when only path specified', function() {
            url.url('/new/path');

            expect(url.path()).toBe('/new/path');
            expect(url.search()).toEqual({});
            expect(url.hash()).toBe('');
        });


        it('replace should set $$replace flag and return itself', function() {
            expect(url.$$replace).toBe(false);

            url.replace();
            expect(url.$$replace).toBe(true);
            expect(url.replace()).toBe(url);
        });


        it('should parse new url', function() {
            url = newUrl('http://host.com/base');
            expect(url.path()).toBe('/base');

            url = newUrl('http://host.com/base#');
            expect(url.path()).toBe('/base');
        });


        it('should prefix path with forward-slash', function() {
            url = newUrl('http://server/a');
            url.path('b');

            expect(url.path()).toBe('/b');
            expect(url.absUrl()).toBe('http://server/b');
        });


        it('should set path to forward-slash when empty', function() {
            url = newUrl('http://server');
            expect(url.path()).toBe('/');
            expect(url.absUrl()).toBe('http://server/');
        });


        it('setters should return Url object to allow chaining', function() {
            expect(url.path('/any')).toBe(url);
            expect(url.search('')).toBe(url);
            expect(url.hash('aaa')).toBe(url);
            expect(url.url('/some')).toBe(url);
        });


        it('should not preserve old properties when parsing new url', function() {
            url.$$parse('http://www.domain.com:9877/a');

            expect(url.path()).toBe('/a');
            expect(url.search()).toEqual({});
            expect(url.hash()).toBe('');
            expect(url.absUrl()).toBe('http://www.domain.com:9877/a');
        });


        describe('encoding', function() {

            it('should encode special characters', function() {
                url.path('/a <>#');
                url.search({'i j': '<>#'});
                url.hash('<>#');

                expect(url.path()).toBe('/a <>#');
                expect(url.search()).toEqual({'i j': '<>#'});
                expect(url.hash()).toBe('<>#');
                expect(url.absUrl()).toBe('http://www.domain.com:9877/a%20%3C%3E%23?i%20j=%3C%3E%23#%3C%3E%23');
            });


            it('should not encode !$:@', function() {
                url.path('/!$:@');
                url.search('');
                url.hash('!$:@');

                expect(url.absUrl()).toBe('http://www.domain.com:9877/!$:@#!$:@');
            });


            it('should decode special characters', function() {
                url = newUrl('http://host.com/a%20%3C%3E%23?i%20j=%3C%3E%23#x%20%3C%3E%23');
                expect(url.path()).toBe('/a <>#');
                expect(url.search()).toEqual({'i j': '<>#'});
                expect(url.hash()).toBe('x <>#');
            });
        });
    });

    describe('wiring', function() {

        beforeEach(initService());
        beforeEach(inject(initBrowser('http://new.com/a/b', '/a/b')));


        it('should update $location when browser url changes', inject(function($browser, $location) {
            spyOn($location, '$$parse').andCallThrough();
            $browser.url('http://new.com/a/b#!/aaa');
            $browser.poll();
            expect($location.absUrl()).toBe('http://new.com/a/b#!/aaa');
            expect($location.path()).toBe('/a/b');
            expect($location.hash()).toBe('!/aaa');
            expect($location.$$parse).toHaveBeenCalledOnce();
        }));


        // location.href = '...' fires hashchange event synchronously, so it might happen inside $apply
        it('should not $apply when browser url changed inside $apply', inject(
            function($rootScope, $browser, $location) {
                var OLD_URL = $browser.url(),
                    NEW_URL = 'http://updated.com/url';


                $rootScope.$apply(function() {
                    $browser.url(NEW_URL);
                    $browser.poll(); // simulate firing event from browser
                    expect($location.absUrl()).toBe(OLD_URL); // should be async
                });

                expect($location.absUrl()).toBe(NEW_URL);
            }));

        // location.href = '...' fires hashchange event synchronously, so it might happen inside $digest
        it('should not $apply when browser url changed inside $digest', inject(
            function($rootScope, $browser, $location) {
                var OLD_URL = $browser.url(),
                    NEW_URL = 'http://updated.com/url',
                    notRunYet = true;

                $rootScope.$watch(function() {
                    if (notRunYet) {
                        notRunYet = false;
                        $browser.url(NEW_URL);
                        $browser.poll(); // simulate firing event from browser
                        expect($location.absUrl()).toBe(OLD_URL); // should be async
                    }
                });

                $rootScope.$digest();
                expect($location.absUrl()).toBe(NEW_URL);
            }));


        it('should update browser when $location changes', inject(function($rootScope, $browser, $location) {
            var $browserUrl = spyOnlyCallsWithArgs($browser, 'url').andCallThrough();
            $location.path('/new/path');
            expect($browserUrl).not.toHaveBeenCalled();
            $rootScope.$apply();

            expect($browserUrl).toHaveBeenCalledOnce();
            expect($browser.url()).toBe('http://new.com/new/path');
        }));


        it('should update browser only once per $apply cycle', inject(function($rootScope, $browser, $location) {
            var $browserUrl = spyOnlyCallsWithArgs($browser, 'url').andCallThrough();
            $location.path('/new/path');

            $rootScope.$watch(function() {
                $location.search('a=b');
            });

            $rootScope.$apply();
            expect($browserUrl).toHaveBeenCalledOnce();
            expect($browser.url()).toBe('http://new.com/new/path?a=b');
        }));


        it('should replace browser url when url was replaced at least once',
            inject(function($rootScope, $location, $browser) {
                var $browserUrl = spyOnlyCallsWithArgs($browser, 'url').andCallThrough();
                $location.path('/n/url').replace();
                $rootScope.$apply();

                expect($browserUrl).toHaveBeenCalledOnce();
                expect($browserUrl.mostRecentCall.args).toEqual(['http://new.com/n/url', true]);
            }));


        it('should update the browser if changed from within a watcher', inject(function($rootScope, $location, $browser) {
            $rootScope.$watch(function() { return true; }, function() {
                $location.path('/changed');
            });

            $rootScope.$digest();
            expect($browser.url()).toBe('http://new.com/changed');
        }));
    });

    describe('location cancellation', function() {
        it('should fire $before/afterLocationChange event', inject(function($location, $browser, $rootScope, $log) {
            expect($browser.url()).toEqual('http://server/');

            $rootScope.$on('$locationChangeStart', function(event, newUrl, oldUrl) {
                $log.info('before', newUrl, oldUrl, $browser.url());
            });
            $rootScope.$on('$locationChangeSuccess', function(event, newUrl, oldUrl) {
                $log.info('after', newUrl, oldUrl, $browser.url());
            });

            expect($location.url()).toEqual('/');
            $location.url('/somePath');
            expect($location.url()).toEqual('/somePath');
            expect($browser.url()).toEqual('http://server/');
            expect($log.info.logs).toEqual([]);

            $rootScope.$apply();

            expect($log.info.logs.shift()).
                toEqual(['before', 'http://server/somePath', 'http://server/', 'http://server/']);
            expect($log.info.logs.shift()).
                toEqual(['after', 'http://server/somePath', 'http://server/', 'http://server/somePath']);
            expect($location.url()).toEqual('/somePath');
            expect($browser.url()).toEqual('http://server/somePath');
        }));


        it('should allow $locationChangeStart event cancellation', inject(function($location, $browser, $rootScope, $log) {
            expect($browser.url()).toEqual('http://server/');
            expect($location.url()).toEqual('/');

            $rootScope.$on('$locationChangeStart', function(event, newUrl, oldUrl) {
                $log.info('before', newUrl, oldUrl, $browser.url());
                event.preventDefault();
            });
            $rootScope.$on('$locationChangeSuccess', function(event, newUrl, oldUrl) {
                throw Error('location should have been canceled');
            });

            expect($location.url()).toEqual('/');
            $location.url('/somePath');
            expect($location.url()).toEqual('/somePath');
            expect($browser.url()).toEqual('http://server/');
            expect($log.info.logs).toEqual([]);

            $rootScope.$apply();

            expect($log.info.logs.shift()).
                toEqual(['before', 'http://server/somePath', 'http://server/', 'http://server/']);
            expect($log.info.logs[1]).toBeUndefined();
            expect($location.url()).toEqual('/');
            expect($browser.url()).toEqual('http://server/');
        }));

        it ('should fire $locationChangeSuccess event when change from browser location bar',
            inject(function($log, $location, $browser, $rootScope) {
                $rootScope.$apply(); // clear initial $locationChangeStart

                expect($browser.url()).toEqual('http://server/');
                expect($location.url()).toEqual('/');

                $rootScope.$on('$locationChangeStart', function(event, newUrl, oldUrl) {
                    throw Error('there is no before when user enters URL directly to browser');
                });
                $rootScope.$on('$locationChangeSuccess', function(event, newUrl, oldUrl) {
                    $log.info('after', newUrl, oldUrl);
                });


                $browser.url('http://server/#/somePath');
                $browser.poll();

                expect($log.info.logs.shift()).
                    toEqual(['after', 'http://server/#/somePath', 'http://server/']);
            })
        );
    });

    describe('link rewriting', function() {

        var root, link, originalBrowser, lastEventPreventDefault;

        function configureService(linkHref, attrs, content) {
            module(function($provide, $locationProvider) {
                attrs = attrs ? ' ' + attrs + ' ' : '';

                // fake the base behavior
                if (linkHref[0] == '/') {
                    linkHref = 'http://host.com' + linkHref;
                } else if(!linkHref.match(/:\/\//)) {
                    linkHref = 'http://host.com/base/' + linkHref;
                }

                link = jqLite('<a href="' + linkHref + '"' + attrs + '>' + content + '</a>')[0];

                $locationProvider.jqmCompatMode(true);
                $locationProvider.hashPrefix('!');
                return function($rootElement, $document) {
                    $rootElement.append(link);
                    root = $rootElement[0];
                };
            });
        }

        afterEach(function() {
            link && $(link).remove();
            $(root).unbind("click");
        });

        function initBrowser() {
            return function($browser){
                $browser.url('http://host.com/base');
                $browser.$$baseHref = '/base/index.html';
            };
        }

        function initLocation() {
            return function($browser, $location, $rootElement) {
                originalBrowser = $browser.url();
                // we have to prevent the default operation, as we need to test absolute links (http://...)
                // and navigating to these links would kill jstd
                $rootElement.bind('click', function(e) {
                    lastEventPreventDefault = e.isDefaultPrevented();
                    e.preventDefault();
                });
            };
        }

        function expectRewriteTo($browser, url) {
            expect(lastEventPreventDefault).toBe(true);
            expect($browser.url()).toBe(url);
        }

        function expectNoRewrite($browser) {
            expect(lastEventPreventDefault).toBe(false);
            expect($browser.url()).toBe(originalBrowser);
        }

        it('should not rewrite rel link to new url', function() {
            configureService('link?a#b');
            inject(
                initBrowser(),
                initLocation(),
                function($browser) {
                    link.click();
                    expectNoRewrite($browser);
                }
            );
        });
    });
});