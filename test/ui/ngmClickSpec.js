describe("ngmClick", function() {
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

    it('should eval the expression', function() {
        loadHtml('/jqmng/test/ui/test-fixture.html');
        runs(function() {
            compile('<div id="page1" data-role="page">' +
                    '<div data-role="content"><a href="#" ngm:click="clicked = true" id="mylink"></a></div>' +
                    '</div>');
            var link = element.find("#mylink");
            expect(scope.clicked).toEqual(undefined);
            link.click();
            expect(scope.clicked).toEqual(true);
        });
    });

    it('should allow the default jquery mobile navigation if not used', function() {
        loadHtml('/jqmng/test/ui/test-fixture.html');
        runs(function() {
            compile('<div id="page1" data-role="page">' +
                    '<div data-role="content"><a id="mylink" href="#start"' +
                    '</div>');
            var link = element.find("#mylink");
            expect(frame().document.location.hash).toEqual("");
            link.trigger("vclick");
        });
        waitsForAsync();
        runs(function() {
            expect(frame().document.location.hash).toEqual("#start");
        });
    });

    it('should stop the default jquery mobile navigation if used with click', function() {
        loadHtml('/jqmng/test/ui/test-fixture.html');
        runs(function() {
            compile('<div id="page1" data-role="page">' +
                    '<div data-role="content"><a id="mylink" href="#start" ngm:click="clicked=true"' +
                    '</div>');
            var link = element.find("#mylink");
            expect(frame().document.location.hash).toEqual("");
            var evt = frame().document.createEvent('MouseEvents');
            evt.initMouseEvent('click', true, true, null, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
            link[0].dispatchEvent(evt);
        });
        waitsForAsync();
        runs(function() {
            expect(frame().document.location.hash).toEqual("");
        });
    });

    it('should stop the default jquery mobile navigation if used with vclick', function() {
        loadHtml('/jqmng/test/ui/test-fixture.html');
        runs(function() {
            compile('<div id="page1" data-role="page">' +
                    '<div data-role="content"><a id="mylink" href="#start" ngm:click="clicked=true"' +
                    '</div>');
            var link = element.find("#mylink");
            expect(frame().document.location.hash).toEqual("");
            link.trigger("vclick");
        });
        waitsForAsync();
        runs(function() {
            expect(frame().document.location.hash).toEqual("");
        });
    });
});
