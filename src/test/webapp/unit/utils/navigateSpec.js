describe("navigate", function () {
    describe("$navigate service", function () {
        it('should be able to change the page', inject(function ($navigate, $location) {
            $navigate('#somePage');
            expect($location.hash()).toBe('somePage');
        }));

        it('should allow an object to pass through to changePage', inject(function ($navigate, $location) {
            var changePageObj = {target:'#somePage', transition:'someTransition'};
            $navigate(changePageObj);
            expect($location.$$routeOverride).toEqual({jqmOptions: changePageObj});
        }));

        it('should be able to change the page with a transition', inject(function ($navigate, $location) {
            $navigate('someTransition:#somePage');
            expect($location.$$routeOverride).toEqual({jqmOptions: {transition: 'someTransition'}});
            expect($location.hash()).toBe('somePage');
        }));

        it('should be able to go back', inject(function ($navigate, $location) {
            spyOn($location, 'goBack');
            $navigate('back');
            expect($location.goBack).toHaveBeenCalled();
        }));

        it('should be able to go back to a page', inject(function ($navigate, $location) {
            $navigate('back:page1');
            expect($location.path()).toBe('/page1');
            expect($location.$$replace).toBe('back');
        }));

    });
});
