jqmng.require(['angular', "unit/testUtils"], function(angular, utils) {
    describe("event shortcuts", function() {
        it("should eval the expression when the event is fired", function() {
            var events = {taphold:'taphold',swipe:'swipe', swiperight:'swiperight',
                swipeleft:'swipeleft',
                pagebeforeshow:'pagebeforeshow',
                pagebeforehide:'pagebeforehide',
                pageshow:'pageshow',
                pagehide:'pagehide',
                click:'vclick'
            };
            for (var event in events) {
                var d = utils.compileInPage('<span ngm-'+event+'="executed=true"></span>');
                var element = d.element;
                var scope = element.scope();
                element.trigger(events[event]);
                expect(scope.executed).toEqual(true);
            }
        });

        it("should work together with ng-model", function() {
            var d = utils.compileInPage('<input ng-click="executed=true" type="text" ng-model="data">');
            var element = d.element;
            var scope = element.scope();
            element.trigger('click');
            expect(scope.executed).toEqual(true);
            element.val('test');
            utils.triggerInputEvent(element);
            expect(scope.data).toBe('test');
        });
    });

});