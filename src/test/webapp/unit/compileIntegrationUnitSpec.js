define(["unit/testUtils"], function(utils) {
    describe('compileIntegrationUnit', function() {
        it("should fire the create event only once for the current page at the end of the eval cycle when multiple requestrefresh events occured", function() {
            var c = utils.compileInPage('<div></div>');
            var element = c.element;
            var scope = element.scope();
            var createCount = 0;
            c.page.bind('create', function() {
                createCount++;
            });
            element.trigger('requestrefresh');
            element.trigger('requestrefresh');
            var createdBeforeOnEval = false;
            scope.$onEval(function() {
                createdBeforeOnEval = element.children().eq(0).hasClass("ui-btn");
            });
            c.page.scope().$eval();
            expect(createdBeforeOnEval).toBe(false);
            expect(createCount).toEqual(1);
        });

        it("should fire the create event when a requestrefresh event occured, a page controller exists and the page is evaled", function() {
            window.SomePageController = function() {

            };
            var c = utils.compileInPage('<div></div>', 'SomePageController');
            var element = c.element;
            var scope = element.scope();
            var createCount = 0;
            c.page.bind('create', function() {
                createCount++;
            });
            element.trigger('requestrefresh');
            c.page.scope().$eval();
            expect(createCount).toEqual(1);
        });

        it("should fire the requestrefresh event when elements are removed", function() {
            var c = utils.compileInPage('<div><span></span></div>');
            var element = c.element;
            var scope = element.scope();
            var eventCount = 0;
            c.page.bind('requestrefresh', function() {
                eventCount++;
            });
            element.find('span').remove();
            expect(eventCount).toEqual(1);
        });

    });
});
