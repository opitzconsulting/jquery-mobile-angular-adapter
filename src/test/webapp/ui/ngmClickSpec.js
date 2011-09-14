define(function() {

    describe("ngmClick", function() {

        it('should eval the expression', function() {
            loadHtml('/jqmng/ui/test-fixture.html', function(frame) {
                frame.$("#start").before('<div id="page1" data-role="page">' +
                    '<div data-role="content"><a href="#" ngm:click="clicked = true" id="mylink"></a></div>' +
                    '</div>');

            });
            runs(function() {
                var element = testframe().$("#page1");
                var scope = element.scope();
                var link = element.find("#mylink");
                expect(scope.clicked).toEqual(undefined);
                link.click();
                expect(scope.clicked).toEqual(true);
            });
        });

        it('should react to normal clicks', function() {
            loadHtml('/jqmng/ui/test-fixture.html', function(frame) {
                frame.$("#start").before('<div id="page1" data-role="page">' +
                    '<div data-role="content"><a id="mylink" href="#start" ngm:click="clicked=true"' +
                    '</div>');
            });
            runs(function() {
                var element = testframe().$("#page1");
                var link = element.find("#mylink");
                expect(testframe().document.location.hash).toEqual("");
                link.click();
            });
            waitsForAsync();
            runs(function() {
                expect(testframe().document.location.hash).toEqual("#start");
            });
        });
    });

});