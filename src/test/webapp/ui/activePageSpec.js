define(function() {

    describe("activePage", function() {

        it('should return the current page', function() {
            loadHtml('/jqmng/ui/test-fixture.html');
            runs(function() {
                var scope = testframe().$("#start").scope();
                var activePage = scope.$service("$activePage");
                expect(activePage()).toEqual("start");
            });

        });

        it('should be able to change to page', function() {
            var activePage;
            loadHtml('/jqmng/ui/test-fixture.html');
            runs(function() {
                var scope = testframe().$("#start").scope();
                activePage = scope.$service("$activePage");
                expect(activePage()).toEqual("start");
                activePage("#page2");
            });
            waitsForAsync();
            runs(function() {
                expect(activePage()).toEqual("page2");
            });
        });

    });

});
