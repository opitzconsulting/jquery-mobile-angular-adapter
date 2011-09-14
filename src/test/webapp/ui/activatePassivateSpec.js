define(function() {
    describe("activatePassivateSpec", function() {

        var activateCallCount = 0;
        var activateThis = null;
        var activatePrevScope = null;
        var passivateCallCount = 0;
        var passivateThis = null;
        var passivateNextScope = null;

        function onActivate(prevPageScope) {
            activateCallCount++;
            activateThis = this;
            activatePrevScope = prevPageScope;
        }

        function onPassivate(nextPageScope) {
            passivateCallCount++;
            passivateThis = this;
            passivateNextScope = nextPageScope;
        }

        function instrumentPage(frame) {
            frame.StartController = function() {
                this.onActivate = onActivate;
                this.onPassivate = onPassivate;
                this.name = "StartController";
            }

            frame.Page2Controller = function() {
                this.onActivate = onActivate;
                this.onPassivate = onPassivate;
                this.name = "Page2Controller";
            }

            frame.$("#start").attr("ng:controller", "StartController");
            frame.$("#page2").attr("ng:controller", "Page2Controller");
            reset();
        }

        function reset() {
            activateCallCount = 0;
            activateThis = null;
            activatePrevScope = null;
            passivateCallCount = 0;
            passivateThis = null;
            passivateNextScope = null;
        }

        it('should eval the page after onActivate', function() {
            var page2scope;
            var evalCount;
            loadHtml('/jqmng/ui/test-fixture.html', instrumentPage);
            runs(function() {
                var $ = testframe().$;
                var startPageScope = $("#start").scope();
                // be sure to create the page2
                var page2 = $("#page2").page();
                page2scope = page2.scope();
                var activePage = startPageScope.$service("$activePage");
            });
            waitsForAsync();
            runs(function() {
                var $ = testframe().$;
                page2scope.$onEval(function() {
                    evalCount++;
                });
                evalCount = 0;
                $.mobile.globalScope().$service("$activePage")("#page2");
            });
            waitsForAsync();
            runs(function() {
                expect(evalCount).not.toEqual(0);
            });
        });

        it('should call onActivate when the page is initially shown', function() {
            loadHtml('/jqmng/ui/test-fixture.html', instrumentPage);
            runs(function() {
                expect(activateCallCount).toEqual(1);
                expect(activateThis.name).toEqual("StartController");
                expect(activatePrevScope).toEqual(null);
            });
        });

        it('should not call onPassivate when the page is initially shown', function() {
            loadHtml('/jqmng/ui/test-fixture.html', instrumentPage);
            runs(function() {
                expect(passivateCallCount).toEqual(0);
            });
        });

        it('should call onActivate and onPassivate when the page is changed', function() {
            loadHtml('/jqmng/ui/test-fixture.html', instrumentPage);
            runs(function() {
                var startPageScope = testframe().$("#start").scope();
                var activePage = startPageScope.$service("$activePage");
                reset();
                expect(activateCallCount).toEqual(0);
                expect(passivateCallCount).toEqual(0);
                activePage("#page2");
                expect(activateCallCount).toEqual(1);
                expect(activateThis.name).toEqual("Page2Controller");
                expect(activatePrevScope.name).toEqual("StartController");
                expect(passivateCallCount).toEqual(1);
                expect(passivateThis.name).toEqual("StartController");
                expect(passivateNextScope.name).toEqual("Page2Controller");
            });
        });

        it('should call onActivate and onPassivate when the page is changed via back', function() {
            var startPageScope, activePage;
            loadHtml('/jqmng/ui/test-fixture.html', instrumentPage);
            runs(function() {
                startPageScope = testframe().$("#start").scope();
                activePage = startPageScope.$service("$activePage");
                activePage("#page2");
                reset();
            });
            waitsForAsync();
            runs(function() {
                expect(activateCallCount).toEqual(0);
                expect(passivateCallCount).toEqual(0);
                activePage("back");
            });
            waitsForAsync();
            runs(function() {
                expect(activateCallCount).toEqual(1);
                expect(activateThis.name).toEqual("StartController");
                expect(activatePrevScope.name).toEqual("Page2Controller");
                expect(passivateCallCount).toEqual(1);
                expect(passivateThis.name).toEqual("Page2Controller");
                expect(passivateNextScope.name).toEqual("StartController");
            });
        });
    });

});
