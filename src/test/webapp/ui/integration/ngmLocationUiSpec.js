describe("angularUrlIntegration", function () {
    it('should be able to change pages using $location service', function () {
        var $, $location, scope;
        loadHtml('/jqmng/ui/test-fixture.html');
        runs(function () {
            $ = testframe().$;
            var injector = $("body").injector();
            scope = $("body").scope();
            $location = injector.get("$location");

            expect($.mobile.activePage.attr("id")).toBe("start");
            $location.hash("page2");
            scope.$digest();
        });
        waitsForAsync();
        runs(function() {
            expect($.mobile.activePage.attr("id")).toBe("page2");
            expect($location.hash()).toBe('page2');
            expect(testframe().location.hash).toBe('#page2');
        })
    });

    it('should be able to change pages using window.location', function () {
        var $, $location, scope;
        loadHtml('/jqmng/ui/test-fixture.html');
        runs(function () {
            $ = testframe().$;
            var injector = $("body").injector();
            scope = $("body").scope();
            $location = injector.get("$location");

            expect($.mobile.activePage.attr("id")).toBe("start");
            testframe().location.hash = 'page2';
        });
        waitsForAsync();
        runs(function() {
            expect($.mobile.activePage.attr("id")).toBe("page2");
            expect($location.hash()).toBe('page2');
            expect(testframe().location.hash).toBe('#page2');
        });
    });

});
