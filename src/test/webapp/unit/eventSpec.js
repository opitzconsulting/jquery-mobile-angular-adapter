jqmng.require(['angular', "unit/testUtils"], function(angular, utils) {
    describe("ngm:event", function() {

        it('should eval the expression when the event is fired', function() {
            var d = utils.compileInPage('<span ngm:event="{click:\'clicked=true\'}"></span>');
            var scope = d.element.scope();
            d.element.click();
            expect(scope.clicked).toEqual(true);
        });

        it('should work with multiple event/function pairs', function() {
            var d = utils.compileInPage('<span ngm:event="{mousedown:\'m = true\', click:\'c = true\'}"></span>');
            var element = d.element;
            var scope = element.scope();
            expect(scope.c).toEqual(undefined);
            element.click();
            expect(scope.c).toEqual(true);
            expect(scope.m).toEqual(undefined);
            delete scope.c;
            element.mousedown();
            expect(scope.c).toEqual(undefined);
            expect(scope.m).toEqual(true);
        });
    });

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
                var d = utils.compileInPage('<span ngm:'+event+'="executed=true"></span>');
                var element = d.element;
                var scope = element.scope();
                element.trigger(events[event]);
                expect(scope.executed).toEqual(true);
            }
        });

        it("should work together with ng:model", function() {
            var d = utils.compileInPage('<input ng:click="executed=true" type="text" ng:model="data"></span>');
            var element = d.element;
            var scope = element.scope();
            element.trigger('click');
            expect(scope.executed).toEqual(true);
            element.val('test');
            element.trigger('blur');
            expect(scope.data).toBe('test');
        });
    });

});