(function($, angular, window) {

    beforeEach(function() {
        $.mobile.pageContainer = $("body");
        $.mobile.firstPage = [];
    });

    afterEach(function() {
        $(":jqmData(role='page')").remove();
    });

    function test$() {
        return $.apply(this, arguments);
    }

    function spyOnJq(fnName) {
        if ($.fn.orig[fnName]) {
            return spyOn($.fn.orig, fnName);
        }
        return spyOn($.fn, fnName);
    }

    function compileInPage(html, pageControllerName) {
        var elements = test$("<div>"+html+"</div>").children().addClass("result", "true");
        var page = test$('<div id="start" data-role="page" data-url="start"><div data-role="content"></div></div>');
        test$("body").append(page);
        if (pageControllerName) {
            page.attr('ng-controller', pageControllerName);
        }
        page.find(":jqmData(role='content')").append(elements);
        inject(function($compile, $rootScope) {
            $compile(page)($rootScope);
            $.mobile.activePage = page;
            $rootScope.$apply();
        });
        return {
            page: page,
            element: $(".result").removeClass("result")
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
        return $(".result").removeClass("result");
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