describe("activePage", function() {
    it('should return the current page', function() {
        loadHtml('/jqmng/test/ui/test-fixture.html');
        runs(function() {
            var scope = frame().$.mobile.globalScope();
            var activePage = scope.$service("$activePage");
            expect(activePage()).toEqual("start");
        });

    });

    it('should be able to change to page', function() {
        var activePage;
        loadHtml('/jqmng/test/ui/test-fixture.html');
        runs(function() {
            var scope = frame().$.mobile.globalScope();
            activePage = scope.$service("$activePage");
            expect(activePage()).toEqual("start");
            activePage("page2");
        });
        waitsForAsync();
        runs(function() {
            expect(activePage()).toEqual("page2");
        });

    });

});
