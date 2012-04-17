describe("fadein", function () {
    var d;
    it('should fade the element in in the given amount of time', function () {
        runs(function () {
            d = testutils.compileInPage('<button id="mysel" ngm-fadein="100">Test</button>');
            expect(parseFloat(d.element.css('opacity') - 0.1)).toBeLessThan(0.001);
        });
        waits(100);
        runs(function () {
            expect(parseFloat(d.element.css('opacity') - 1)).toBeLessThan(0.001);
        });
    });

});
