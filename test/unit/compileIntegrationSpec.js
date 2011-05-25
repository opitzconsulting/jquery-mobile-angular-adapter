describe("compile integration", function() {
    var element, scope;

    function compile(html) {
        // create a jquery mobile page widget. This should
        // initialize jquery mobile and also angular js!
        element = $(html);
        element.page();
        // get the angularJs scope from the jquery element.
        scope = element.scope();
    }

    beforeEach(function() {
        element = null;
        scope = null;
    });

    it('should create a scope for every page', function() {
        compile('<div id="page1" data-role="page">' +
                '</div>');
        expect(element.scope()).toBeDefined();
    });

    it('should use a separate scope for every page whose eval does not trigger the eval of other pages', function() {
        compile('<div id="page1" data-role="page">' +
                '</div>');
        var page1 = element.scope();
        expect(page1).toBeDefined();
        compile('<div id="page2" data-role="page">' +
                '</div>');
        var page2 = element.scope();
        var page1evalCount = 0;
        page1.$onEval(function() {
            page1evalCount++;
        });
        var page2evalCount = 0;
        page2.$onEval(function() {
            page2evalCount++;
        });
        page1.$eval();
        expect(page1evalCount).toEqual(1);
        expect(page2evalCount).toEqual(0);
        page2.$eval();
        expect(page1evalCount).toEqual(1);
        expect(page2evalCount).toEqual(1);

        expect(page1.$parent===page1).toBeTruthy();
        expect(page2.$parent===page2).toBeTruthy();

    });

    /*
     it('should prevent race conditions due to hash changes', function() {
     // TODO find a correct case to reproduce the problem!
     var alocation = null;
     var browser = null;
     window.MainController = null;
     window.MainController = function($browser,$location) {
     browser = $browser;
     alocation = $location;
     };
     MainController.$inject = ['$browser','$location'];
     var root = $('<div><div id="page1" data-role="page">Hello</div><div id="page2" data-role="page">hello</div></div>');
     $("body").append(root);
     $.mobile.initializePage();
     var page1 = $("#page1");
     // compile only page1, not page 2
     var page2 = $("#page2");
     expect(page1.scope()).toBeDefined();
     expect(page2.scope()).toBeUndefined();
     // second page does not get initialized until we navigate to it...
     alocation.hash = "test";
     console.log("First: "+browser.getUrl());
     $.mobile.changePage(page2);
     //page1.scope().$root.$eval();
     console.log("Second: "+browser.getUrl());
     expect(page1.scope()).toBeDefined();
     expect(page2.scope()).toBeDefined();
     });
     */

});
