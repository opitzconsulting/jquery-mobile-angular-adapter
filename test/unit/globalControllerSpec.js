describe("mainController", function() {
	var compile, element, scope;

	beforeEach(function() {
		element = null;
        compile = function(html) {
			// create a jquery mobile page widget. This should
			// initialize jquery mobile and also angular js!
            element = $(html);
			element.page();
			// get the angularJs scope from the jquery element.
			scope = element.scope();
		};

	});

    it('should use the global controller als global scope', function() {
        $.mobile.globalScope(null);
        window.MainController = function() {
            this.test = 'hallo';
        };
        var result;
        compile('<div id="page1" data-role="page"></div>');
        expect(scope.$get('test')).toEqual('hallo');

    });

    it('should work without global controller', function() {
        $.mobile.globalScope(null);
        window.MainController = null;
        window.TestController = function() {
            this.test = 'hallo';
        };
        compile('<div id="page1" data-role="page"  ng:controller="TestController"></div>');
        expect(scope.$get('test')).toEqual('hallo');
    });

});
