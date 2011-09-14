describe("compile integration", function() {
    var element, scope, container;

    function compile(id, html) {
        // Note: The html needs to be added to the dom,
        // as otherwise we get errors due to using a DocumentFragment...
        $("#jqmtest").append(html);
        element = $("#"+id);
        element.page();
        // get the angularJs scope from the jquery element.
        scope = element.scope();
    }

    beforeEach(function() {
        $("body").append('<div id="jqmtest"></div>');
        element = null;
        scope = null;
    });

    afterEach(function() {
        $("#jqmtest").remove();
    });

    it('should create a scope for every page', function() {
        compile('page1', '<div id="page1" data-role="page">' +
                '</div>');
        expect(element.scope()).toBeDefined();
    });

    it('should use a separate scope for every page whose eval does not trigger the eval of other pages', function() {
        compile('page1', '<div id="page1" data-role="page">' +
                '</div>');
        var page1 = element.scope();
        expect(page1).toBeDefined();
        compile('page2', '<div id="page2" data-role="page">' +
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
    });
});
