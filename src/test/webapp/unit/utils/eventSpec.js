describe('events', function () {
    describe("event shortcuts", function () {
        it("should eval the expression when the event is fired", function () {
            var jqmEvents = ['tap', 'taphold', 'swipe', 'swiperight', 'swipeleft', 'vmouseover',
                'vmouseout',
                'vmousedown',
                'vmousemove',
                'vmouseup',
                'vclick',
                'vmousecancel',
                'orientationchange',
                'scrollstart',
                'scrollend',
                'pagebeforeshow',
                'pagebeforehide',
                'pageshow',
                'pagehide'
            ];
            var i,event;
            for (i=0; i<jqmEvents.length; i++) {
                event = jqmEvents[i];
                var d = testutils.compileInPage('<span ngm-' + event + '="executed=true"></span>');
                var element = d.element;
                var scope = element.scope();
                element.trigger(event);
                expect(scope.executed).toEqual(true);
            }
        });

        it("should work together with ng-model", function () {
            var d = testutils.compileInPage('<input ngm-vclick="executed=true" type="text" ng-model="data">');
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
