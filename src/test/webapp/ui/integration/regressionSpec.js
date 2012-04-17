describe("usecases", function () {
    describe("lists", function () {
        it("should refresh lists with ng-repeat", function () {
            var scope, dialog, dialogOpen;
            loadHtml('/jqmng/ui/test-fixture.html', function (frame) {
                var page = frame.$('#start');
                page.attr('ng-controller', 'PageController');
                page.append(
                    '<div data-role="content">' +
                        '<button ng-click="fill()" id="fill">Fill</button><ul data-role="listview" id="list"><li ng-repeat="item in items"></li></ul>' +
                        '</div>');
                frame.PageController = function ($scope) {
                    $scope.fill = function () {
                        $scope.items = [1, 2];
                    }
                }
            });
            var list, fillBtn;
            runs(function () {
                var $ = testframe().$;
                var page = $("#start");
                list = page.find("#list");
                fillBtn = page.find("#fill");
                fillBtn.click();
            });
            waitsForAsync();
            runs(function () {
                var lis = list.find('li');
                expect(lis.length).toBe(2);
                expect(lis.eq(0).hasClass('ui-li')).toBe(true);
                expect(lis.eq(1).hasClass('ui-li')).toBe(true);
            });
        });

    });

});
