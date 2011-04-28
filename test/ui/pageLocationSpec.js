describe("pageLocation", function() {
	var compile, element, scope;

	beforeEach(function() {
		element = null;
        compile = function(html) {
			// create a jquery mobile page widget. This should
			// initialize jquery mobile and also angular js!
            element = frame().$(html);
			element.page();
			// get the angularJs scope from the jquery element.
			scope = element.scope();
		};

	});

    it('should return the current page', function() {
        loadHtml('/jqmng/test/ui/test-fixture.html');
        runs(function() {
            var scope = frame().$.mobile.globalScope();
            var pageLocation = scope.$service("$pageLocation");
            expect(pageLocation()).toEqual("start");
        });

    });

    it('should be able to change to page', function() {
        var pageLocation;
        loadHtml('/jqmng/test/ui/test-fixture.html');
        runs(function() {
            var scope = frame().$.mobile.globalScope();
            pageLocation = scope.$service("$pageLocation");
            expect(pageLocation()).toEqual("start");
            pageLocation("page2");
        });
        waitsForAsync();
        runs(function() {
            expect(pageLocation()).toEqual("page2");
        });

    });

});
