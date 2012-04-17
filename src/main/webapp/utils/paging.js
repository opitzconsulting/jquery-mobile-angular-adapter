(function ($, angular) {

    function pagedListFilterFactory(defaultListPageSize, filterFilter, orderByFilter) {

        function createPagedList(list) {
            var enhanceFunctions = {
                refreshIfNeeded:refreshIfNeeded,
                setFilter:setFilter,
                setOrderBy:setOrderBy,
                setPageSize:setPageSize,
                loadNextPage:loadNextPage,
                hasMorePages:hasMorePages,
                reset:reset,
                refreshCount:0
            };

            var pagedList = [];
            var pageSize, originalList, originalListClone, refreshNeeded, filter, orderBy, loadedCount, availableCount;

            for (var fnName in enhanceFunctions) {
                pagedList[fnName] = enhanceFunctions[fnName];
            }
            init(list);
            var oldHasOwnProperty = pagedList.hasOwnProperty;
            pagedList.hasOwnProperty = function (propName) {
                if (propName in enhanceFunctions) {
                    return false;
                }
                return oldHasOwnProperty.apply(this, arguments);
            };
            return pagedList;

            function init(list) {
                setPageSize(-1);
                originalList = list;
                originalListClone = [];
                refreshNeeded = true;
                reset();
            }

            function refresh() {
                var list = originalList;
                originalListClone = [].concat(list);
                if (filter) {
                    list = filterFilter(list, filter);
                }
                if (orderBy) {
                    list = orderByFilter(list, orderBy);
                }
                if (loadedCount < pageSize) {
                    loadedCount = pageSize;
                }
                if (loadedCount > list.length) {
                    loadedCount = list.length;
                }
                availableCount = list.length;
                var newData = list.slice(0, loadedCount);
                var spliceArgs = [0, pagedList.length].concat(newData);
                pagedList.splice.apply(pagedList, spliceArgs);
                pagedList.refreshCount++;
            }

            function refreshIfNeeded() {
                if (originalList.length != originalListClone.length) {
                    refreshNeeded = true;
                } else {
                    for (var i = 0; i < originalList.length; i++) {
                        if (originalList[i] !== originalListClone[i]) {
                            refreshNeeded = true;
                            break;
                        }
                    }
                }
                if (refreshNeeded) {
                    refresh();
                    refreshNeeded = false;
                }
                return pagedList;
            }

            function setPageSize(newPageSize) {
                if (!newPageSize || newPageSize < 0) {
                    newPageSize = defaultListPageSize;
                }
                if (newPageSize !== pageSize) {
                    pageSize = newPageSize;
                    refreshNeeded = true;
                }
            }

            function setFilter(newFilter) {
                if (!angular.equals(filter, newFilter)) {
                    filter = newFilter;
                    refreshNeeded = true;
                }
            }

            function setOrderBy(newOrderBy) {
                if (!angular.equals(orderBy, newOrderBy)) {
                    orderBy = newOrderBy;
                    refreshNeeded = true;
                }
            }

            function loadNextPage() {
                loadedCount = loadedCount + pageSize;
                refreshNeeded = true;
            }

            function hasMorePages() {
                refreshIfNeeded();
                return loadedCount < availableCount;
            }

            function reset() {
                loadedCount = 0;
                refreshNeeded = true;
            }
        }

        return function (list, param) {
            if (!list) {
                return list;
            }
            var pagedList = list.pagedList;
            if (typeof param === 'string') {
                if (!pagedList) {
                    return;
                }
                // commands do not create a new paged list nor do they change the attributes of the list.
                if (param === 'loadMore') {
                    pagedList.loadNextPage();
                } else if (param === 'hasMore') {
                    return pagedList.hasMorePages();
                }
                return;
            }
            if (!pagedList) {
                pagedList = createPagedList(list);
                list.pagedList = pagedList;
            }
            if (param) {
                pagedList.setPageSize(param.pageSize);
                pagedList.setFilter(param.filter);
                pagedList.setOrderBy(param.orderBy);
            }
            pagedList.refreshIfNeeded();
            return pagedList;
        };
    }

    pagedListFilterFactory.$inject = ['defaultListPageSize', 'filterFilter', 'orderByFilter'];
    var mod = angular.module(['ng']);
    mod.constant('defaultListPageSize', 10);
    mod.filter('paged', pagedListFilterFactory);
})(window.jQuery, window.angular);