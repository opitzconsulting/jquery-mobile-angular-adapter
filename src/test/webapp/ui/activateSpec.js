define(function() {
    function currentPageId() {
        return testframe().$.mobile.activePage.attr('id');
    }

    describe("activate", function() {

        it('should be able to change to page', function() {
            var activate;
            loadHtml('/jqmng/ui/test-fixture.html');
            runs(function() {
                var scope = testframe().$("#start").scope();
                activate = scope.$service("$activate");
                expect(currentPageId()).toEqual("start");
                activate("page2");
            });
            waitsForAsync();
            runs(function() {
                expect(currentPageId()).toEqual("page2");
            });
        });

    });

});
