describe('amdUsage', function () {
    uit.url('../ui/fixtures/test-fixture-amd.html');
    it('should work in AMD environments', function () {
        uit.runs(function ($) {
            expect($("#start").hasClass("ui-page")).toBe(true);
        });
    });

});
