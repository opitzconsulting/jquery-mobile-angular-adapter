jqmng.require(['angular'], function(angular) {
    describe("navigate", function() {
        describe("$navigate service", function() {
            var navigate, oldUrlHistory, goSpy, changePageSpy;
            beforeEach(function() {
                changePageSpy = spyOn($.mobile, 'changePage');
                goSpy = spyOn(window.history, 'go');
                navigate = angular.injector(["ng"]).get('$navigate');

                oldUrlHistory = $.mobile.urlHistory.stack;
            });
            afterEach(function() {
                $.mobile.urlHistory.stack = oldUrlHistory;
            });
            it('should be able to change the page', function() {
                navigate('somePage');
                expect(changePageSpy).toHaveBeenCalledWith('#somePage');
            });

            it('should allow an object to pass through to changePage', function() {
                var changePageObj = {target: 'somePage', transition: 'someTransition'};
                navigate(changePageObj);
                expect(changePageSpy).toHaveBeenCalledWith('#somePage', changePageObj);
            });

            it('should be able to change the page with a transition', function() {
                navigate('someTransition:somePage');
                expect(changePageSpy).toHaveBeenCalledWith('#somePage', {transition: 'someTransition'});
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

            it('should be able to go back to a page that is not in the history with using the reverse transition', function() {
                $.mobile.urlHistory.stack = [
                    {pageUrl: 'page1'},
                    {pageUrl: 'page2'},
                    {pageUrl: 'page3'}
                ];
                navigate('back:page4');
                expect(goSpy).not.toHaveBeenCalled();
                expect(changePageSpy).toHaveBeenCalledWith('#page4', {reverse: true});
            });
        });

        describe('$navigate filter', function() {
            var scope, navigateSpy, $q, deferred;
            beforeEach(function() {
                navigateSpy = jasmine.createSpy();
                var injector = angular.injector(["ng", function($provide) {
                    $provide.value('$navigate', navigateSpy);
                }]);
                scope = injector.get('$rootScope');
                $q = injector.get('$q');
                deferred = $q.defer();
                scope.deferResult = function() {
                    return deferred.promise;
                }
            });
            it('should navigate to the success outcome if result is not false', function() {
                scope.$apply("undefined | navigate:'success:page1':'failure:page2'");
                expect(navigateSpy).toHaveBeenCalledWith('page1');
            });
            it('should navigate to the failure outcome if result is false', function() {
                scope.$apply("false| navigate:'success:page1':'failure:page2'");
                expect(navigateSpy).toHaveBeenCalledWith('page2');
            });
            it('should navigate to the given outcome', function() {
                scope.$apply("'myout' | navigate:'success:page1': 'failure:page2' : 'myout:page3'");
                expect(navigateSpy).toHaveBeenCalledWith('page3');
            });
            it('should navigate to the success outcome if promise is resolved', function() {
                deferred.resolve();
                scope.$apply("deferResult() | navigate:'success:page1' : 'failure:page2'");
                expect(navigateSpy).toHaveBeenCalledWith('page1');
            });
            it('should navigate to the failure outcome if promise is rejected', function() {
                deferred.reject();
                scope.$apply("deferResult() | navigate:'success:page1' : 'failure:page2'");
                expect(navigateSpy).toHaveBeenCalledWith('page2');
            });
            it('should navigate to the given outcome of the resolved promise', function() {
                deferred.resolve('myout');
                scope.$apply("deferResult() | navigate: 'success:page1' : 'failure:page2' : 'myout:page3'");
                expect(navigateSpy).toHaveBeenCalledWith('page3');
            });
            it('should navigate to the given outcome of the rejected promise', function() {
                deferred.reject('myout');
                scope.$apply("deferResult() | navigate: 'success:page1' : 'failure:page2': 'myout:page3'");
                expect(navigateSpy).toHaveBeenCalledWith('page3');
            });
            it('should navigate to the given outcome with the given transition', function() {
                scope.$apply("'myout' | navigate: 'success:page1' : 'failure:page2' : 'myout:transition1:page3'");
                expect(navigateSpy).toHaveBeenCalledWith('transition1:page3');
            });

        });
    });
});
