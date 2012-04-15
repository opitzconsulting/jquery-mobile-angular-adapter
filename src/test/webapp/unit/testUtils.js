jqmng.define('unit/testUtils', ["jquery", "angular"], function($, angular) {

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

    function compileInPage(html, pageControllerName) {
        var elements = test$("<div>"+html+"</div>").children().addClass("result", "true");
        var page = test$('<div id="start" data-role="page" data-url="start"><div data-role="content"></div></div>');
        test$("body").append(page);
        if (pageControllerName) {
            page.attr('ng-controller', pageControllerName);
        }
        page.find(":jqmData(role='content')").append(elements);
        angular.injector(['ng']).invoke(function($compile, $rootScope) {
            $compile(page)($rootScope);
            $rootScope.$apply();
        });
        page.trigger("pagebeforeshow");
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
        angular.injector(['ng']).invoke(function($compile, $rootScope) {
            rootScope = $rootScope;
            $compile(wrapperElement)($rootScope);
            $rootScope.$apply();
        });
        return $(".result").removeClass("result");
    }

    var inputEventSupported = "oninput" in document.createElement('div');

    function triggerInputEvent(element) {
        if (inputEventSupported) {
            element.trigger('input');
        } else {
            element.trigger('change');
        }
    }

    return {
        compile: compile,
        compileInPage: compileInPage,
        triggerInputEvent: triggerInputEvent
    };
});