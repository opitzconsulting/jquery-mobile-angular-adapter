describe('standalone', function () {
    uit.url('../ui/fixtures/test-fixture-standalone.html');
    it('should work in standalone mode and call the mobileInit function', function () {
        uit.append(function($) {
            var page = $('#start');
            page.append('<div data-role="content">' +
                '<ul data-role="listview" ng-init="list=[1,2,3]" id="list">' +
                '<li ng-repeat="l in list">{{l}}</li>' +
                '</ul>' +
                '</div>');

        });
        uit.runs(function (window, $) {
            expect(window.mobileInitTest).toBe(true);
            var list = $("#list");
            var lis = list.children();
            expect(lis.length).toBe(3);
            for (var i = 0; i < 3; i++) {
                expect(lis.eq(i).hasClass("ui-li")).toBe(true);
            }
        });
    });

});
