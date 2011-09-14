define(function() {

    describe("ng:event", function() {

        it('should eval the expression when the event is fired', function() {
            loadHtml('/jqmng/ui/test-fixture.html', function(frame) {
                frame.$("#start").before('<div id="page1" data-role="page">' +
                    '<div data-role="content"><a href="#" ng:event="click:clicked = true" id="mylink"></a></div>' +
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

        it('should work with multiple events', function() {
            loadHtml('/jqmng/ui/test-fixture.html', function(frame) {
                frame.$("#start").before('<div id="page1" data-role="page">' +
                    '<div data-role="content"><a href="#" ng:event="mousedown click:clicked = true" id="mylink"></a></div>' +
                    '</div>');

            });
            runs(function() {
                var element = testframe().$("#page1");
                var scope = element.scope();
                var link = element.find("#mylink");
                expect(scope.clicked).toEqual(undefined);
                link.click();
                expect(scope.clicked).toEqual(true);
                scope.clicked = false;
                link.mousedown();
                expect(scope.clicked).toEqual(true);

            });
        });

        it('should work with multiple event/function pairs', function() {
            loadHtml('/jqmng/ui/test-fixture.html', function(frame) {
                frame.$("#start").before('<div id="page1" data-role="page">' +
                    '<div data-role="content"><a href="#" ng:event="mousedown:m = true,click:c = true" id="mylink"></a></div>' +
                    '</div>');

            });
            runs(function() {
                var element = testframe().$("#page1");
                var scope = element.scope();
                var link = element.find("#mylink");
                expect(scope.c).toEqual(undefined);
                link.click();
                expect(scope.c).toEqual(true);
                expect(scope.m).toEqual(undefined);
                delete scope.c;
                link.mousedown();
                expect(scope.c).toEqual(undefined);
                expect(scope.m).toEqual(true);

            });
        });
    });

});