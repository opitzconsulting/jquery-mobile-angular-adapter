describe("globalScope", function() {
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

    it('should use the global controller als global scope', function() {
        $.mobile.globalScope(null);
        window.GlobalController = function() {
            this.test = 'hallo';
        };
        var result;
        compile('page1', '<div id="page1" data-role="page"></div>');
        expect(scope.$get('test')).toEqual('hallo');

    });

    it('should access and change the global scope via $.mobile.globalScope', function() {
        var globalScope = $.mobile.globalScope();
        expect(globalScope).toBeDefined();
        $.mobile.globalScope(null);
        var globalScope2 = $.mobile.globalScope();
        expect(globalScope2).not.toEqual(globalScope);
        $.mobile.globalScope(globalScope);
        var globalScope3 = $.mobile.globalScope();
        expect(globalScope).toEqual(globalScope3);

    });


    it('should use a common global scope as parent of all page scopes', function() {
        compile('page1', '<div id="page1" data-role="page">' +
                '</div>');
        var page1 = element.scope();
        expect(page1).toBeDefined();
        compile('page2', '<div id="page2" data-role="page">' +
                '</div>');
        var page2 = element.scope();
        page1.id = "page1";
        page2.id = "page2";
        expect(page1.id).not.toEqual(page2.id);
        expect(page2).toBeDefined();
        expect(page1.$parent).toEqual(page2.$parent);
    });

    it('should work without global controller', function() {
        $.mobile.globalScope(null);
        window.GlobalController = null;
        window.TestController = function() {
            this.test = 'hallo';
        };
        compile('page1', '<div id="page1" data-role="page"  ng:controller="TestController"></div>');
        expect(scope.$get('test')).toEqual('hallo');
    });

});
