(function($, angular, window) {


    beforeEach(function() {
        $(".temp").remove();
        $(":jqmData(role='page')").remove();
        $.mobile.pageContainer = $("body");
        $.mobile.firstPage = $();
        $.mobile.urlHistory.stack = [ {url : 'someUrl' } ];
        $.mobile.urlHistory.activeIndex = 0;
        $.mobile.origChangePage = $.mobile.changePage;
        spyOn($.mobile, 'changePage');
        spyOn(window.history, 'go');
        module("ng", function($provide) {
            $provide.value('$rootElement', $("body"));
            var i;
            for (i=0; i<$.mobile._registerBrowserDecorators.length; i++) {
                $.mobile._registerBrowserDecorators[i]($provide);
            }
        });
        spyOn(angular.mock.$Browser.prototype, 'url').andCallThrough();
        $.mobile.popup.active = undefined;
    });

    afterEach(function() {
        clearEvents();
    });

    var markEvents = function() {
        var key,
            cache = angular.element.cache;

        for(key in cache) {
            if (cache.hasOwnProperty(key)) {
                var events = cache[key].events;
                for (var eventName in events) {
                    var entries = events[eventName];
                    for (var i=0; i<entries.length; i++) {
                        entries[i].doNotClear = true;
                    }
                }
            }
        }
    };
    markEvents();

    var clearEvents = function() {
        var key,
            cache = angular.element.cache;

        for(key in cache) {
            if (cache.hasOwnProperty(key)) {
                var handle = cache[key].handle;
                var elem = handle?$(handle.elem):null;
                if (elem) {
                    var events = cache[key].events;
                    for (var eventName in events) {
                        var entries = events[eventName];
                        for (var i=entries.length-1; i>=0; i--) {
                            if (!entries[i].doNotClear) {
                                elem.unbind(eventName, entries[i].handler);
                            }
                        }
                    }
                }
            }
        }
    };


    function test$() {
        return $.apply(this, arguments);
    }

    function spyOnJq(fnName) {
        $.fn.orig[fnName] = $.fn.orig[fnName] || $.fn[fnName];
        return spyOn($.fn.orig, fnName);
    }

    function compileInPage(html, pageControllerName) {
        var container = test$("<div>"+html+"</div>");
        var page = test$('<div id="start" data-role="page" data-url="start"><div data-role="content"></div></div>');
        test$("body").append(page);
        if (pageControllerName) {
            page.attr('ng-controller', pageControllerName);
        }
        page.find(":jqmData(role='content')").append(container);

        inject(function($compile, $rootScope) {
            $compile(page)($rootScope);
            $.mobile.activePage = page;
            $rootScope.$apply();
        });
        page.addClass("temp", "true");
        return {
            page: page,
            element: container.children()
        }
    }

    function compile(html) {
        var wrapperElement = $('<div>'+html+'</div>');
        wrapperElement.children().addClass("result", "true");
        $("body").append(wrapperElement);
        var rootScope;
        inject(function($compile, $rootScope) {
            rootScope = $rootScope;
            $compile(wrapperElement)($rootScope);
            $rootScope.$apply();
        });
        return $(".result").removeClass("result").addClass("temp", "true");
    }

    function triggerInputEvent(element) {
        // Angular uses the "input" event in browsers that support it (eg. chrome).
        // However, as jquery mobile fires the change event itself by some widgets,
        // we ensured that angular always also reacts to the change event.
        element.trigger('change');
    }

    // API
    window.testutils = {
        compile: compile,
        compileInPage: compileInPage,
        triggerInputEvent: triggerInputEvent,
        spyOnJq: spyOnJq
    };
})(window.jQuery, window.angular, window);