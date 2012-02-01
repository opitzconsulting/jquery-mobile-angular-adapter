define(["jquery", "angular"], function($, angular) {

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

    function compilePage(html) {
        var res = test$(html);
        test$("body").append(res);
        res.page();
        return res;
    }

    function compileInPage(html) {
        var elements = test$("<div>"+html+"</div>").children().addClass("result", "true");
        var page = test$('<div id="start" data-role="page" data-url="start"><div data-role="content"></div></div>');
        test$("body").append(page);
        page.find(":jqmData(role='content')").append(elements);
        page.page();
        return {
            page: page,
            element: page.find(".result")
        }

    }

    return {
        compilePage: compilePage,
        compileInPage: compileInPage
    };
});