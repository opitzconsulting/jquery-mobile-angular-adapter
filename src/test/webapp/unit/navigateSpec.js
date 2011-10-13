define(['angular'], function(angular) {
    describe("navigate", function() {
        describe("$navigate service", function() {
            var navigate, oldUrlHistory, goSpy, changePageSpy;
            beforeEach(function() {
                changePageSpy = spyOn($.mobile, 'changePage');
                goSpy = spyOn(window.history, 'go');
                navigate = angular.service("$navigate")();
                oldUrlHistory = $.mobile.urlHistory.stack;
            });
            afterEach(function() {
                $.mobile.urlHistory.stack = oldUrlHistory;
            });
            it('should be able to change the page', function() {
                navigate('somePage');
                expect(changePageSpy).toHaveBeenCalledWith('#somePage', undefined);
            });

            it('should be able to change the page with a transition', function() {
                navigate('someTransition:somePage');
                expect(changePageSpy).toHaveBeenCalledWith('#somePage', 'someTransition');
            });

            it('should be able to go back', function() {
                navigate('back');
                expect(goSpy).toHaveBeenCalledWith(-1);
                expect(changePageSpy).not.toHaveBeenCalled();
            });

            it('should be able to go back to a page', function() {
                $.mobile.urlHistory.stack = [
                    {pageUrl: 'page1'},
                    {pageUrl: 'page2'},
                    {pageUrl: 'page3'}
                ];
                navigate('back:page1');
                expect(goSpy).toHaveBeenCalledWith(-2);
                expect(changePageSpy).not.toHaveBeenCalled();
            });

            it('should be able to go back to a page that is not in the history', function() {
                $.mobile.urlHistory.stack = [
                    {pageUrl: 'page1'},
                    {pageUrl: 'page2'},
                    {pageUrl: 'page3'}
                ];
                navigate('back:page4');
                expect(goSpy).not.toHaveBeenCalled();
                expect(changePageSpy).toHaveBeenCalledWith('#page4', undefined);
            });
        });

        describe('$navigate expression', function() {
            var scope, navigateSpy;
            beforeEach(function() {
                navigateSpy = jasmine.createSpy();
                scope = angular.scope(null, angular.service, {$navigate: navigateSpy});
            });
            it('should navigate if a single argument is given', function() {
                scope.$eval("$navigate('myPage')");
                expect(navigateSpy).toHaveBeenCalledWith('myPage');
            });
            it('should navigate to the success outcome if result is not false', function() {
                scope.$eval("$navigate(undefined, 'success:page1', 'failure:page2')");
                expect(navigateSpy).toHaveBeenCalledWith('page1');
            });
            it('should navigate to the failure outcome if result is false', function() {
                scope.$eval("$navigate(false, 'success:page1', 'failure:page2')");
                expect(navigateSpy).toHaveBeenCalledWith('page2');
            });
            it('should navigate to the given outcome', function() {
                scope.$eval("$navigate('myout', 'success:page1', 'failure:page2', 'myout:page3')");
                expect(navigateSpy).toHaveBeenCalledWith('page3');
            });
            it('should navigate to the success outcome if promise is resolved', function() {
                var promise = $.Deferred().resolve();
                scope.test = promise;
                scope.$eval("$navigate(test, 'success:page1', 'failure:page2')");
                expect(navigateSpy).toHaveBeenCalledWith('page1');
            });
            it('should navigate to the failure outcome if promise is rejected', function() {
                var promise = $.Deferred().reject();
                scope.test = promise;
                scope.$eval("$navigate(test, 'success:page1', 'failure:page2')");
                expect(navigateSpy).toHaveBeenCalledWith('page2');
            });
            it('should navigate to the given outcome of the resolved promise', function() {
                var promise = $.Deferred().resolve('myout');
                scope.test = promise;
                scope.$eval("$navigate(test, 'success:page1', 'failure:page2', 'myout:page3')");
                expect(navigateSpy).toHaveBeenCalledWith('page3');
            });
            it('should navigate to the given outcome of the rejected promise', function() {
                var promise = $.Deferred().reject('myout');
                scope.test = promise;
                scope.$eval("$navigate(test, 'success:page1', 'failure:page2', 'myout:page3')");
                expect(navigateSpy).toHaveBeenCalledWith('page3');
            });
            it('should navigate to the given outcome with the given transition', function() {
                scope.$eval("$navigate('myout', 'success:page1', 'failure:page2', 'myout:transition1:page3')");
                expect(navigateSpy).toHaveBeenCalledWith('transition1:page3');
            });

        });

    });

});
