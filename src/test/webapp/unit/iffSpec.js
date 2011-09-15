define(['angular'], function(angular) {
    describe("iff", function() {
        it('should return the second argument if the first is truthy', function() {
            expect(angular.Object.iff(null, true, 1, 2)).toEqual(1);
        });

        it('should return the third argument if the first is falsy', function() {
            expect(angular.Object.iff(null, false, 1, 2)).toEqual(2);
        });
    });


});
