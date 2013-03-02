describe("arrayPaging", function () {
    var pagedFilter, injector, scope;
    beforeEach(function () {
        injector = angular.injector(["ng", "ngMock"]);
        pagedFilter = injector.get("pagedFilter");
        scope = {};
    });

    describe('integration test', function () {
        var element, scope;
        it('should page divs', function() {
            var d = testutils.compileInPage('<div><div ng-repeat="l in list | paged:\'pager1\':2"></div>');
            element = d.element;
            scope = element.scope();
            scope.list = [1,2,3,4];
            scope.$apply();
            expect(element.children("div").length).toBe(2);
        });
        it('should allow hasMore if it is used before paged filter', function() {
            var d = testutils.compileInPage('<div><a href="" ngm-if="pager1.hasMore" ng-click="pager1.loadMore()"></a><div ng-repeat="l in list | paged:\'pager1\':2"></div>');
            element = d.element;
            scope = element.scope();
            scope.list = [1,2,3,4];
            scope.$apply();
            expect(element.children("div").length).toBe(2);
            element.children("a").click();
            expect(element.children("div").length).toBe(4);
            expect(element.children("a").length).toBe(0);
        });
        it('should be chainable', function() {
            var d = testutils.compileInPage('<div><div ng-repeat="l in list | filter:\'1\' | paged:\'pager1\':2">{{l}}</div>');
            element = d.element;
            scope = element.scope();
            scope.list = ['1', '12', '13','4'];
            scope.$apply();
            var entries = element.children("div");
            expect(entries.length).toBe(2);
            expect(entries.eq(0).text()).toBe('1');
            expect(entries.eq(1).text()).toBe('12');
        });
    });

    describe('unit test', function () {

        it('should throw an error if the pager id is missing', function() {
            var error = false;
            try {
                pagedFilter([], undefined);
            } catch (e) {
                // expected
                error = true;
            }
            if (!error) {
                throw new Error("Error expected");
            }
        });

        it('should return undefined for undefined', function () {
            expect(pagedFilter(undefined)).toBeUndefined();
        });

        it('should update when the list changes', function () {
            var l = [1, 2, 3, 4, 5];
            var p1 = pagedFilter.call(scope, l, 'id1', 2);
            expect(p1).toEqual([1, 2]);
            l.shift();
            var p2 = pagedFilter.call(scope, l, 'id1', 2);
            expect(p2).toEqual([2, 3]);
        });

        it('should use the default page size if no page size defined', function () {
            var l = [-1, -2];
            var defaultPageSize = injector.get('defaultListPageSize');
            expect(defaultPageSize).toBe(10);
            for (var i = 0; i < defaultPageSize; i++) {
                l.push(i);
            }
            var pagedList = pagedFilter.call(scope, l, 'id1');
            expect(pagedList.length).toEqual(defaultPageSize);
            expect(pagedList).toEqual(l.slice(0, defaultPageSize));
        });

        it('should use the given page size if defined', function () {
            var l = [1, 2, 3, 4];
            var pageSize = 2;
            var pagedList = pagedFilter.call(scope, l, 'id1', pageSize);
            expect(pagedList.length).toEqual(pageSize);
            expect(pagedList).toEqual(l.slice(0, pageSize));
        });

        it('should show the first page by default', function () {
            var l = [1, 2, 3, 4];
            var pagedList = pagedFilter.call(scope, l, 'id1', 2);
            expect(pagedList).toEqual(l.slice(0, 2));
        });

        it('should load the next page via loadMore', function () {
            var l = [1, 2, 3, 4, 5];
            var pagedList = pagedFilter.call(scope, l, 'id1', 2);
            scope.id1.loadMore();
            pagedList = pagedFilter.call(scope, l, 'id1', 2);
            expect(pagedList).toEqual(l.slice(0, 4));
        });

        it('should keep the state of the underlying list instance changes', function () {
            var l = [1, 2, 3, 4, 5];
            var pagedList = pagedFilter.call(scope, l, 'id1', 2);
            scope.id1.loadMore();
            expect(pagedFilter.call(scope, l, 'id1', 2)).toEqual([1, 2, 3, 4]);
            l = [1, 2, 3, 4, 5];
            expect(pagedFilter.call(scope, l, 'id1', 2)).toEqual([1, 2, 3, 4]);
        });

        it('should load an incomplete last page', function () {
            var l = [1, 2, 3];
            var pagedList = pagedFilter.call(scope, l, 'id1', 2);
            expect(pagedList).toEqual(l.slice(0, 2));
            scope.id1.loadMore();
            pagedList = pagedFilter.call(scope, l, 'id1', 2);
            expect(pagedList).toEqual(l.slice(0, 3));
        });

        it('should load a complete last page', function () {
            var l = [1, 2, 3, 4];
            var pagedList = pagedFilter.call(scope, l, 'id1', 2);
            expect(pagedList).toEqual(l.slice(0, 2));
            scope.id1.loadMore();
            pagedList = pagedFilter.call(scope, l, 'id1', 2);
            expect(pagedList).toEqual(l.slice(0, 4));
        });

        it('should not do anything when loadMore is called at the end of the list', function () {
            var l = [1, 2];
            var pagedList = pagedFilter.call(scope, l, 'id1', 2);
            scope.id1.loadMore();
            pagedList = pagedFilter.call(scope, l, 'id1', 2);
            expect(pagedList).toEqual(l.slice(0, 2));
        });

        it('should have more pages when not at the end of the list', function () {
            var l = [1, 2, 3, 4];
            pagedFilter.call(scope, l, 'id1', 2);
            expect(scope.id1.hasMore).toBeTruthy();
        });

        it('should not have more pages when exactly at the end of the list', function () {
            var l = [1, 2];
            pagedFilter.call(scope, l, 'id1', 2);
            expect(scope.id1.hasMore).toBeFalsy();
        });

        it('should have more pages when exactly at the end-1 of the list', function () {
            var l = [1, 2, 3];
            pagedFilter.call(scope, l, 'id1', 2);
            expect(scope.id1.hasMore).toBeTruthy();
        });

        it('should reduce the entry count permanently when the page shrinks', function () {
            var l = ['1', '12', '123'];
            pagedFilter.call(scope, l, 'id1', 2);
            scope.id1.loadMore();
            expect(pagedFilter.call(scope, l, 'id1', 2)).toEqual(['1', '12', '123']);
            l = ['12', '123'];
            expect(pagedFilter.call(scope, l, 'id1', 2)).toEqual(['12', '123']);
            l = ['1', '12', '123'];
            expect(pagedFilter.call(scope, l, 'id1', 2)).toEqual(['1', '12']);
        });

        it('should reduce the entry count permanently to the page size when the page shrinks lower than the page size', function () {
            var l = ['1', '12', '123'];
            pagedFilter.call(scope, l, 'id1', 2);
            pagedFilter.call(scope, l, "id1", "loadMore");
            l = ['123'];
            expect(pagedFilter.call(scope, l, 'id1', 2)).toEqual(['123']);
            l = ['1', '12', '123'];
            expect(pagedFilter.call(scope, l, 'id1', 2)).toEqual(['1', '12']);
        });

        it('should save the last paging result in the cache property', function() {
            var l = ['1', '12', '123'];
            var pagedList = pagedFilter.call(scope, l, 'id1', 2);
            expect(scope.id1.cache).toBe(pagedList);
        });
    });
});
