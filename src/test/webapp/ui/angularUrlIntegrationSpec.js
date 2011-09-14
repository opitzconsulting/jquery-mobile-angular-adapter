define(function() {

    describe("angularUrlIntegration", function() {
        it('should not be able to change urls', function() {
            loadHtml('/jqmng/ui/test-fixture.html');
            runs(function() {
                var fr = testframe();
                var scope = fr.angular.scope();
                var browser = scope.$service('$browser');
                var oldLoc = fr.window.location.href;
                browser.setUrl(fr.window.location.href + "#test");
                expect(fr.window.location.href).toEqual(oldLoc);
            })
        });

        it('should use jquery hashchange event instead of the own one', function() {
            loadHtml('/jqmng/ui/test-fixture.html');
            runs(function() {
                var fr = testframe();
                var scope = fr.angular.scope();
                var browser = scope.$service("$browser");
                var count = 0;
                browser.onHashChange(function() {
                    count++;
                });
                expect(count).toEqual(0);
                fr.$(fr.window).trigger('hashchange');
                expect(count).toEqual(1);
            });
        });

    });

});