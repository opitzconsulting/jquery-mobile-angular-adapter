describe("table", function () {
    it("should stamp the widget using the jqm widget", function() {
        var spy = testutils.spyOnJq('table');
        var c = testutils.compileInPage('<div data-role="table" ng-repeat="l in list"></div>');
        expect(spy.callCount).toBe(0);
        var scope = c.page.scope();
        scope.list = [1,2];
        scope.$root.$digest();
        expect(spy.callCount).toBe(2);
    });
    describe('reflow table', function() {
        it('should add the header values into the body cells using <b> tags', inject(function($rootScope) {
            var c = testutils.compileInPage('<table data-role="table" data-mode="reflow">'+
                '<thead><tr><th>Col1</th><th>Col2</th></tr></thead>'+
                '<tbody><tr ng-repeat="row in rows"><td>{{row.col1}}</td><td>{{row.col2}}</td></tr></tbody></table>');
            $rootScope.rows = [{col1: 'val11', col2: 'val12'},{col1: 'val21', col2: 'val22'}];
            $rootScope.$apply();
            expect(c.page.find("td").eq(0).find("b.ui-table-cell-label").text()).toBe('Col1');
            expect(c.page.find("td").eq(0).contents(":not(b)").text()).toBe('val11');
            expect(c.page.find("td").eq(1).find("b.ui-table-cell-label").text()).toBe('Col2');
            expect(c.page.find("td").eq(1).contents(":not(b)").text()).toBe('val12');
            expect(c.page.find("td").eq(2).find("b.ui-table-cell-label").text()).toBe('Col1');
            expect(c.page.find("td").eq(2).contents(":not(b)").text()).toBe('val21');
            expect(c.page.find("td").eq(3).find("b.ui-table-cell-label").text()).toBe('Col2');
            expect(c.page.find("td").eq(3).contents(":not(b)").text()).toBe('val22');
        }));
    });
    describe('columntoggle table', function() {
        var c;
        beforeEach(inject(function($rootScope) {
            c = testutils.compileInPage('<table id="table" data-role="table" data-mode="columntoggle">'+
                '<thead><tr><th data-priority="1">Col1</th><th data-priority="2">Col2</th></tr></thead>'+
                '<tbody><tr ng-repeat="row in rows"><td>{{row.col1}}</td><td>{{row.col2}}</td></tr></tbody></table>');
            $rootScope.rows = [{col1: 'val11', col2: 'val12'},{col1: 'val21', col2: 'val22'}];
            $rootScope.$apply();
        }));
        it('should add the data-priority and the ui-table-cell-visible / ui-table-cell-hidden depending on which cells are visible', inject(function($rootScope) {
            $('#table-popup input[type="checkbox"]').eq(0).click();
            expect(c.page.find("td").eq(0).prop("className")).toBe('ng-binding ui-table-priority-1 ui-table-cell-visible');
            expect(c.page.find("td").eq(1).prop("className")).toBe('ng-binding ui-table-priority-2 ui-table-cell-hidden');
            expect(c.page.find("td").eq(2).prop("className")).toBe('ng-binding ui-table-priority-1 ui-table-cell-visible');
            expect(c.page.find("td").eq(3).prop("className")).toBe('ng-binding ui-table-priority-2 ui-table-cell-hidden');
        }));
        it('should enhance the popup', function() {
            var popup = c.page.find("#table-popup");
            var fieldset = popup.children("fieldset");
            expect(fieldset.hasClass("ui-controlgroup")).toBe(true);
        });
    });
});
