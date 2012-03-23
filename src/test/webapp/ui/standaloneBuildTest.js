jqmng.require([], function() {
    describe('standalone', function() {
        it('should use the globalScope as parent of all page scopes', function() {
            loadHtml('/jqmng/ui/test-fixture-standalone.html', function(frame) {
                var page = frame.$('#start');
                page.append('<div data-role="content">'+
                    '<ul data-role="listview" ng-init="list=[1,2,3]" id="list">'+
                    '<li ng-repeat="l in list">{{l}}</li>'+
                    '</ul>'+
                '</div>');
            });
            runs(function() {
                var win = testframe();
                expect(win.mobileInitTest).toBe(true);
                var list = win.$("#list");
                var lis = list.children();
                expect(lis.length).toBe(3);
                for (var i=0; i<3; i++) {
                    expect(lis.eq(i).hasClass("ui-li")).toBe(true);
                }
            });
        });

    });
});
