define([
    'angular'
], function(angular) {
    describe("arrayPaging", function() {
        function normalize(l) {
            return l.slice(0, l.length);
        }

        it('should cache the result between two calls', function() {
            var l = ['11','12','13','14','15'];
            l.pageSize = 2;
            var orderByFn = function(v) {
                return v
            };
            var p1 = angular.Array.paged(l, '1', orderByFn);
            expect(normalize(p1)).toEqual(['11','12']);
            l.shift();
            var p2 = angular.Array.paged(l, '1', orderByFn);
            expect(p1).toBe(p2);
            expect(normalize(p2)).toEqual(['11','12']);
        });

        it('should refresh when the global scope evals', function() {
            var l = [1,2,3,4,5];
            l.pageSize = 2;
            var p1 = angular.Array.paged(l);
            expect(normalize(p1)).toEqual([1,2]);
            l.shift();
            $.mobile.globalScope().$eval();
            var p2 = angular.Array.paged(l);
            expect(p1).toBe(p2);
            expect(normalize(p2)).toEqual([2,3]);
        });

        it('should refresh when the filter changes', function() {
            var l = ['1','12','123'];
            l.pageSize = 2;
            var p1 = angular.Array.paged(l);
            expect(normalize(p1)).toEqual(['1','12']);
            l.shift();
            var p2 = angular.Array.paged(l, '1');
            expect(p1).toBe(p2);
            expect(normalize(p2)).toEqual(['12', '123']);
        });

        it('should refresh when the orderBy changes', function() {
            var l = ['1','12','123'];
            l.pageSize = 2;
            var orderByFn1 = function(v) {
                return v
            };
            var orderByFn2 = function(v) {
                return -v
            };
            var p1 = angular.Array.paged(l, '1', orderByFn1);
            expect(normalize(p1)).toEqual(['1','12']);
            l.shift();
            var p2 = angular.Array.paged(l, '1', orderByFn2);
            expect(p1).toBe(p2);
            expect(normalize(p2)).toEqual(['123', '12']);
        });

        it('should use the default page size if no page size defined', function() {
            var l = [-1,-2];
            for (var i = 0; i < $.mobile.defaultListPageSize; i++) {
                l.push(i);
            }
            var pagedList = angular.Array.paged(l);
            expect(pagedList.length).toEqual($.mobile.defaultListPageSize);
            expect(normalize(pagedList)).toEqual(l.slice(0, $.mobile.defaultListPageSize));
        });

        it('should use the given page size if defined', function() {
            var l = [1,2,3,4];
            l.pageSize = 2;
            var pagedList = angular.Array.paged(l);
            expect(pagedList.length).toEqual(l.pageSize);
            expect(normalize(pagedList)).toEqual(l.slice(0, l.pageSize));
        });

        it('should show the first page by default', function() {
            var l = [1,2,3,4];
            l.pageSize = 2;
            var pagedList = angular.Array.paged(l);
            expect(normalize(pagedList)).toEqual(l.slice(0, l.pageSize));
        });

        it('should load the next page via loadNextPage', function() {
            var l = [1,2,3,4,5];
            l.pageSize = 2;
            var pagedList = angular.Array.paged(l);
            pagedList.loadNextPage(l);
            pagedList = angular.Array.paged(l);
            expect(normalize(pagedList)).toEqual(l.slice(0, 4));
        });

        it('should load an incomplete last page', function() {
            var l = [1,2,3];
            l.pageSize = 2;
            var pagedList = angular.Array.paged(l);
            expect(normalize(pagedList)).toEqual(l.slice(0, 2));
            pagedList.loadNextPage();
            pagedList = angular.Array.paged(l);
            expect(normalize(pagedList)).toEqual(l.slice(0, 3));
        });

        it('should load a complete last page', function() {
            var l = [1,2,3,4];
            l.pageSize = 2;
            var pagedList = angular.Array.paged(l);
            expect(normalize(pagedList)).toEqual(l.slice(0, 2));
            pagedList.loadNextPage(l);
            pagedList = angular.Array.paged(l);
            expect(normalize(pagedList)).toEqual(l.slice(0, 4));
        });

        it('should not do anything when loadNextPage is called at the end of the list', function() {
            var l = [1,2];
            l.pageSize = 2;
            var pagedList = angular.Array.paged(l);
            pagedList.loadNextPage();
            pagedList = angular.Array.paged(l);
            expect(normalize(pagedList)).toEqual(l.slice(0, 2));
        });

        it('should have more pages when not at the end of the list', function() {
            var l = [1,2,3,4];
            l.pageSize = 2;
            var pagedList = angular.Array.paged(l);
            expect(pagedList.hasMorePages(l)).toBeTruthy();
        });

        it('should not have more pages when exactly at the end of the list', function() {
            var l = [1,2];
            l.pageSize = 2;
            var pagedList = angular.Array.paged(l);
            expect(pagedList.hasMorePages(l)).toBeFalsy();
        });

        it('should have more pages when exactly at the end-1 of the list', function() {
            var l = [1,2,3];
            l.pageSize = 2;
            var pagedList = angular.Array.paged(l);
            expect(pagedList).toBeTruthy();
        });

        it('should reduce the entry count permanently when the page shrinks', function() {
            var l = ['1','12','123'];
            l.pageSize = 2;
            angular.Array.paged(l).loadNextPage(l);
            expect(normalize(angular.Array.paged(l, '1'))).toEqual(['1','12','123']);
            expect(normalize(angular.Array.paged(l, '2'))).toEqual(['12','123']);
            expect(normalize(angular.Array.paged(l, '1'))).toEqual(['1','12']);
        });

        it('should reduce the entry count permanently to the page size when the page shrinks lower than the page size', function() {
            var l = ['1','12','123'];
            l.pageSize = 2;
            angular.Array.paged(l).loadNextPage(l);
            expect(normalize(angular.Array.paged(l, '3'))).toEqual(['123']);
            expect(normalize(angular.Array.paged(l, '1'))).toEqual(['1','12']);
        });

        it('should page and filter with the second argument', function() {
            var l = [1,2,2,2,2];
            l.pageSize = 2;
            expect(normalize(angular.Array.paged(l, '2'))).toEqual([2,2]);
            angular.Array.paged(l, '2').loadNextPage();
            expect(normalize(angular.Array.paged(l, '2'))).toEqual([2,2,2,2]);
        });

        it('should page and sort with the second and third argument', function() {
            var l = [1,2,3,4];
            l.pageSize = 2;
            var filterFn = function() {
                return true;
            };
            var orderByFn = function(v) {
                return -v
            };
            expect(normalize(angular.Array.paged(l, filterFn, orderByFn))).toEqual([4,3]);
            angular.Array.paged(l, filterFn, orderByFn).loadNextPage(l);
            expect(normalize(angular.Array.paged(l, filterFn, orderByFn))).toEqual([4,3,2,1]);
        });

        it('should only have numbers as own attributes', function() {
            var l = [1];
            l.pageSize = 2;
            var pagedList = angular.Array.paged(l, 'true', 'true');
            for (var x in pagedList) {
                if (pagedList.hasOwnProperty(x)) {
                    expect(x).toEqual("0");
                }
            }
        });
    });


});
