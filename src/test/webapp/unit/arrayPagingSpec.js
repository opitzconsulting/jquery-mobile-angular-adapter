jqmng.require([
    'angular'
], function(angular) {
    describe("arrayPaging", function() {
        var pagedFilter, injector;
        beforeEach(function() {
            injector = angular.injector(["ng"]);
            pagedFilter = injector.get("pagedFilter");
        });

        function normalize(l) {
            return l.slice(0, l.length);
        }

        it('should return undefined for undefined', function() {
            expect(pagedFilter(undefined)).toBeUndefined();
        });

        it('should cache the array between two calls if nothing changed', function() {
            var l = ['11','12','13','14','15'];
            var orderByFn = function(v) {
                return v
            };
            var p1 = pagedFilter(l, { pageSize: 2, filter: '1', orderBy: orderByFn});
            var p2 = pagedFilter(l, { pageSize: 2, filter: '1', orderBy: orderByFn});
            expect(p1).toBe(p2);
            expect(normalize(p1)).toEqual(['11','12']);
            expect(p1.refreshCount).toBe(1);
        });

        it('should refresh when the list changes', function() {
            var l = [1,2,3,4,5];
            var p1 = pagedFilter(l, { pageSize: 2 });
            expect(normalize(p1)).toEqual([1,2]);
            l.shift();
            var p2 = pagedFilter(l, { pageSize: 2 });
            expect(normalize(p2)).toEqual([2,3]);
        });

        it('should refresh when the filter changes', function() {
            var l = ['1','12','123'];
            var p1 = pagedFilter(l, { pageSize: 2 });
            expect(normalize(p1)).toEqual(['1','12']);
            var p2 = pagedFilter(l, { pageSize: 2, filter: '2' });
            expect(p1).toBe(p2);
            expect(normalize(p2)).toEqual(['12', '123']);
        });

        it('should refresh when the orderBy changes', function() {
            var l = ['1','12','123'];
            var orderByFn1 = function(v) {
                return v
            };
            var orderByFn2 = function(v) {
                return -v
            };
            var p1 = pagedFilter(l, { pageSize: 2, orderBy: orderByFn1 });
            expect(normalize(p1)).toEqual(['1','12']);
            l.shift();
            var p2 = pagedFilter(l, { pageSize: 2, orderBy: orderByFn2 });
            expect(p1).toBe(p2);
            expect(normalize(p2)).toEqual(['123', '12']);
        });

        it('should use the default page size if no page size defined', function() {
            var l = [-1,-2];
            var defaultPageSize = injector.get('defaultListPageSize');
            expect(defaultPageSize).toBe(10);
            for (var i = 0; i < defaultPageSize; i++) {
                l.push(i);
            }
            var pagedList = pagedFilter(l);
            expect(pagedList.length).toEqual(defaultPageSize);
            expect(normalize(pagedList)).toEqual(l.slice(0, defaultPageSize));
        });

        it('should use the given page size if defined', function() {
            var l = [1,2,3,4];
            var pageSize = 2;
            var pagedList = pagedFilter(l, {pageSize: pageSize});
            expect(pagedList.length).toEqual(pageSize);
            expect(normalize(pagedList)).toEqual(l.slice(0, pageSize));
        });

        it('should show the first page by default', function() {
            var l = [1,2,3,4];
            var pagedList = pagedFilter(l, {pageSize: 2});
            expect(normalize(pagedList)).toEqual(l.slice(0, 2));
        });

        it('should load the next page via loadMore', function() {
            var l = [1,2,3,4,5];
            var pagedList = pagedFilter(l, {pageSize: 2});
            pagedFilter(l, "loadMore");
            pagedList = pagedFilter(l, {pageSize: 2});
            expect(normalize(pagedList)).toEqual(l.slice(0, 4));
        });

        it('should load an incomplete last page', function() {
            var l = [1,2,3];
            var pagedList = pagedFilter(l, {pageSize: 2});
            expect(normalize(pagedList)).toEqual(l.slice(0, 2));
            pagedFilter(l, "loadMore");
            pagedList = pagedFilter(l, {pageSize: 2});
            expect(normalize(pagedList)).toEqual(l.slice(0, 3));
        });

        it('should load a complete last page', function() {
            var l = [1,2,3,4];
            var pagedList = pagedFilter(l, {pageSize: 2});
            expect(normalize(pagedList)).toEqual(l.slice(0, 2));
            pagedFilter(l, "loadMore");
            pagedList = pagedFilter(l, {pageSize: 2});
            expect(normalize(pagedList)).toEqual(l.slice(0, 4));
        });

        it('should not do anything when loadMore is called at the end of the list', function() {
            var l = [1,2];
            var pagedList = pagedFilter(l, {pageSize: 2});
            pagedFilter(l, "loadMore");
            pagedList = pagedFilter(l, {pageSize: 2});
            expect(normalize(pagedList)).toEqual(l.slice(0, 2));
        });

        it('should have more pages when not at the end of the list', function() {
            var l = [1,2,3,4];
            pagedFilter(l, {pageSize: 2});
            expect(pagedFilter(l, "hasMore")).toBeTruthy();
        });

        it('should not have more pages when exactly at the end of the list', function() {
            var l = [1,2];
            pagedFilter(l, {pageSize: 2});
            expect(pagedFilter(l, "hasMore")).toBeFalsy();
        });

        it('should have more pages when exactly at the end-1 of the list', function() {
            var l = [1,2,3];
            pagedFilter(l, {pageSize: 2});
            expect(pagedFilter(l, "hasMore")).toBeTruthy();
        });

        it('should reduce the entry count permanently when the page shrinks', function() {
            var l = ['1','12','123'];
            pagedFilter(l, {pageSize: 2});
            pagedFilter(l, "loadMore");
            expect(normalize(pagedFilter(l, {pageSize: 2, filter: '1'}))).toEqual(['1','12','123']);
            expect(normalize(pagedFilter(l, {pageSize: 2, filter: '2'}))).toEqual(['12','123']);
            expect(normalize(pagedFilter(l, {pageSize: 2, filter: '1'}))).toEqual(['1','12']);
        });

        it('should reduce the entry count permanently to the page size when the page shrinks lower than the page size', function() {
            var l = ['1','12','123'];
            pagedFilter(l, {pageSize: 2});
            pagedFilter(l, "loadMore");
            expect(normalize(pagedFilter(l, {pageSize: 2, filter: '3'}))).toEqual(['123']);
            expect(normalize(pagedFilter(l, {pageSize: 2, filter: '1'}))).toEqual(['1','12']);
        });

        it('should page and filter', function() {
            var l = [1,2,2,2,2];
            expect(normalize(pagedFilter(l, {pageSize: 2, filter: '2'}))).toEqual([2,2]);
            pagedFilter(l, {pageSize: 2, filter: '2'});
            pagedFilter(l, "loadMore");
            expect(normalize(pagedFilter(l, {pageSize: 2, filter: '2'}))).toEqual([2,2,2,2]);
        });

        it('should page and sort', function() {
            var l = [1,2,3,4];
            var filterFn = function() {
                return true;
            };
            var orderByFn = function(v) {
                return -v
            };
            expect(normalize(pagedFilter(l, {pageSize: 2, filter: filterFn, orderBy :orderByFn}))).toEqual([4,3]);
            pagedFilter(l, "loadMore");
            expect(normalize(pagedFilter(l, {pageSize: 2, filter: filterFn, orderBy :orderByFn}))).toEqual([4,3,2,1]);
        });

        it('should only have numbers as own attributes', function() {
            var l = [1];
            var pagedList = pagedFilter(l, {pageSize: 2, filter: 'true', orderBy: 'true'});
            for (var x in pagedList) {
                if (pagedList.hasOwnProperty(x)) {
                    expect(x).toEqual("0");
                }
            }
        });
    });


});
