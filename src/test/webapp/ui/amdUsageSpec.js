describe('amdUsage', function () {
    it('should work in AMD environments', function () {
        loadHtml('/jqmng/ui/test-fixture-amd.html');
        runs(function () {
            var win = testframe();
            var $ = win.$;
            expect($("#start").hasClass("ui-page")).toBe(true);
        });
    });

});
