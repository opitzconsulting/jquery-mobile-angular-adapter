describe('history', function() {
    uit.url("../ui/fixtures/empty-fixture.html");

    describe('removePastEntries', function() {
        function createHistory(number) {
            uit.inject(function($location, $rootScope) {
                var i;
                for (i=0; i<number; i++) {
                    $location.path("path"+i);
                    $rootScope.$apply();
                }
            });
        }
        it('should remove the given number of entries from $history.urlStack', function() {
            var initialUrlStack;
            uit.runs(function($history) {
                createHistory(3);
                initialUrlStack = $history.urlStack.slice();
                expect($history.activeIndex).toBe(3);
                expect(initialUrlStack.length).toBe(4);
                $history.removePastEntries(2);
            });
            uit.runs(function($history, location) {
                expect($history.activeIndex).toBe(1);
                expect($history.urlStack).toEqual([initialUrlStack[0], initialUrlStack[3]]);
                expect(location.href).toBe(initialUrlStack[3].url);
            });
        });
    });
});