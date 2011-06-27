describe("arrayPaging", function() {
    it('should use the default page size if no page size defined', function() {
        var l = [-1,-2];
        for (var i=0; i<$.mobile.defaultListPageSize; i++) {
            l.push(i);
        }
        var pagedList = angular.Array.loadedPages(l);
        expect(pagedList.length).toEqual($.mobile.defaultListPageSize);
        expect(pagedList).toEqual(l.slice(0, $.mobile.defaultListPageSize));
    });

    it('should use the given page size if defined', function() {
        var l = [1,2,3,4];
        l.pageSize = 2;
        var pagedList = angular.Array.loadedPages(l);
        expect(pagedList.length).toEqual(l.pageSize);
        expect(pagedList).toEqual(l.slice(0, l.pageSize));
    });

    it('should show the first page by default', function() {
        var l = [1,2,3,4];
        l.pageSize = 2;
        var pagedList = angular.Array.loadedPages(l);
        expect(pagedList).toEqual(l.slice(0, l.pageSize));
    });

    it('should load the next page via loadNextPage', function() {
        var l = [1,2,3,4,5];
        l.pageSize = 2;
        angular.Array.loadNextPage(l);
        var pagedList = angular.Array.loadedPages(l);
        expect(pagedList).toEqual(l.slice(0, 4));
    });

    it('should load an incomplete last page', function() {
        var l = [1,2,3];
        l.pageSize = 2;
        var pagedList = angular.Array.loadedPages(l);
        expect(pagedList).toEqual(l.slice(0, 2));
        angular.Array.loadNextPage(l);
        var pagedList = angular.Array.loadedPages(l);
        expect(pagedList).toEqual(l.slice(0, 3));
    });

    it('should load a complete last page', function() {
        var l = [1,2,3,4];
        l.pageSize = 2;
        var pagedList = angular.Array.loadedPages(l);
        expect(pagedList).toEqual(l.slice(0, 2));
        angular.Array.loadNextPage(l);
        var pagedList = angular.Array.loadedPages(l);
        expect(pagedList).toEqual(l.slice(0, 4));
    });

    it('should not do anything when loadNextPage is called at the end of the list', function() {
        var l = [1,2];
        l.pageSize = 2;
        angular.Array.loadNextPage(l);
        var pagedList = angular.Array.loadedPages(l);
        expect(pagedList).toEqual(l.slice(0, 2));
    });

    it('should have more pages when not at the end of the list', function() {
        var l = [1,2,3,4];
        l.pageSize = 2;
        expect(angular.Array.hasMorePages(l)).toBeTruthy();
    });

    it('should not have more pages when exactly at the end of the list', function() {
        var l = [1,2];
        l.pageSize = 2;
        expect(angular.Array.hasMorePages(l)).toBeFalsy();
    });

    it('should have more pages when exactly at the end-1 of the list', function() {
        var l = [1,2,3];
        l.pageSize = 2;
        expect(angular.Array.hasMorePages(l)).toBeTruthy();
    });
});

