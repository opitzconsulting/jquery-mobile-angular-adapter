describe('events', function () {
    describe("event shortcuts", function () {
        it("should eval the expression when the event is fired", function () {
            var events = {taphold:'taphold', swipe:'swipe', swiperight:'swiperight',
                swipeleft:'swipeleft',
                pagebeforeshow:'pagebeforeshow',
                pagebeforehide:'pagebeforehide',
                pageshow:'pageshow',
                pagehide:'pagehide',
                click:'vclick'
            };
            for (var event in events) {
                var d = testutils.compileInPage('<span ngm-' + event + '="executed=true"></span>');
                var element = d.element;
                var scope = element.scope();
                element.trigger(events[event]);
                expect(scope.executed).toEqual(true);
            }
        });

        it("should work together with ng-model", function () {
            var d = testutils.compileInPage('<input ngm-click="executed=true" type="text" ng-model="data">');
            var element = d.element;
            var scope = element.scope();
            element.trigger('vclick');
            expect(scope.executed).toEqual(true);
            element.val('test');
            testutils.triggerInputEvent(element);
            expect(scope.data).toBe('test');
        });


    });

    describe('ngm-event', function() {
        it("should execute teh ")
    });

});
