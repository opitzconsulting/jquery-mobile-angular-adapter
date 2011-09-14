define(function() {

    describe("ng:enterKey", function() {
        it('should eval the expression when the event is fired', function() {
            loadHtml('/jqmng/ui/test-fixture.html', function(frame) {
                frame.$("#start").before('<div id="page1" data-role="page">' +
                    '<div data-role="content"><input type="text" ng:enterkey="res = true" id="input"></a></div>' +
                    '</div>');

            });
            runs(function() {
                var $ = testframe().$;
                var element = testframe().$("#page1");
                var scope = element.scope();
                var input = element.find("#input");
                expect(scope.res).toEqual(undefined);
                var event = $.Event("keypress");
                event.keyCode = 13;
                input.trigger(event);
                expect(scope.res).toEqual(true);
            });
        });

    });

});