describe("navigate", function () {
    describe("$navigate service", function () {
        var navigate, oldUrlHistory, goSpy, changePageSpy;
        beforeEach(function () {
            changePageSpy = spyOn($.mobile, 'changePage');
            goSpy = spyOn(window.history, 'go');
            navigate = angular.injector(["ng"]).get('$navigate');

            oldUrlHistory = $.mobile.urlHistory.stack;
            $.mobile.urlHistory.stack = [
            ];
        });
        afterEach(function () {
            $.mobile.urlHistory.stack = oldUrlHistory;
        });
        it('should be able to change the page', function () {
            navigate('#somePage');
            expect(changePageSpy).toHaveBeenCalledWith('#somePage');
        });

        it('should allow an object to pass through to changePage', function () {
            var changePageObj = {target:'#somePage', transition:'someTransition'};
            navigate(changePageObj);
            expect(changePageSpy).toHaveBeenCalledWith('#somePage', changePageObj);
        });

        it('should be able to change the page with a transition', function () {
            navigate('someTransition:#somePage');
            expect(changePageSpy).toHaveBeenCalledWith('#somePage', {transition:'someTransition'});
        });

        it('should be able to go back', function () {
            navigate('back');
            expect(goSpy).toHaveBeenCalledWith(-1);
            expect(changePageSpy).not.toHaveBeenCalled();
        });

        it("should add the pageId during changePage to new history entries", function() {
            var page = $('<div id="page1"></div>');
            $(document).trigger("pagebeforechange", {toPage: page});
            var urlHistory = $.mobile.urlHistory;
            urlHistory.addNew();
            expect(urlHistory.stack.length).toBe(1);
            expect(urlHistory.stack[0].pageId).toBe("page1");
        });

        it('should be able to go back to a page', function () {
            $.mobile.urlHistory.stack = [
                {pageId:'page1'},
                {pageId:'page2'},
                {pageId:'page3'}
            ];
            $.mobile.urlHistory.activeIndex = 2;
            var page = $('<div id="page1"></div>');
            var res = $.Deferred();
            res.resolve(null, null, page);
            spyOn($.mobile, "loadPage").andReturn(res);
            navigate('back:page1');
            expect(goSpy).toHaveBeenCalledWith(-2);
            expect(changePageSpy).not.toHaveBeenCalled();
        });

        it('should be able to go back to a page that is not in the history using changePage with reverse transition', function () {
            $.mobile.urlHistory.stack = [
                {pageId:'page1'},
                {pageId:'page2'},
                {pageId:'page3'}
            ];
            $.mobile.urlHistory.activeIndex = 2;
            var page = $('<div id="page4"></div>');
            var res = $.Deferred();
            res.resolve(null, null, page);
            spyOn($.mobile, "loadPage").andReturn(res);
            navigate('back:page4');

            expect(goSpy).not.toHaveBeenCalled();
            expect(changePageSpy).toHaveBeenCalledWith('page4', {reverse:true});
        });
    });
});
