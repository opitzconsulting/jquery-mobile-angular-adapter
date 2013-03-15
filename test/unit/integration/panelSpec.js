describe("panel", function () {
    describe('data-opened', function() {
        var panel, scope, panelSpy, widget;
        beforeEach(function() {
            panelSpy = testutils.spyOnJq('panel').andCallThrough();
        });
        function init(openedAttribute) {
            var c = testutils.compile('<div data-role="page"><div data-role="panel" id="panel1" data-opened="'+openedAttribute+'"></div><div data-role="content"></div></div>');
            panelSpy.reset();
            panel = c.find("#panel1");
            widget = panel.data($.mobile.panel.prototype.widgetFullName);
            scope = c.scope();
        }

        it('should update the data-opened variable', function () {
            init('openVar');
            expect(scope.openVar).toBeUndefined();
            expect(widget._open).toBe(false);
            panel.panel("open");
            expect(scope.openVar).toBe(true);
            expect(widget._open).toBe(true);
        });
        it('should work with fixed data-opened value', function () {
            init('true');
            expect(widget._open).toBe(true);
            panel.panel("close");
            // expect no exception here.
            expect(widget._open).toBe(false);
        });
        it("should update the ui when data-opened changes", function() {
            init('openVar');
            expect(widget._open).toBe(false);
            scope.openVar = true;
            scope.$digest();
            expect(widget._open).toBe(true);
        });

    });
});
