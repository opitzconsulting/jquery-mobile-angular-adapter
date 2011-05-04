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
    }

    function reset() {
        activateCallCount = 0;
        activateThis = null;
        activatePrevScope = null;
        passivateCallCount = 0;
        passivateThis = null;
        passivateNextScope = null;
    }

    beforeEach(function() {
        reset();
    });


    it('should call onActivate when the page is initially shown', function() {
        loadHtml('/jqmng/test/ui/test-fixture.html', instrumentPage);
        runs(function() {
            expect(activateCallCount).toEqual(1);
            expect(activateThis.name).toEqual("StartController");
            expect(activatePrevScope).toEqual(null);
        });
    });
    it('should not call onPassivate when the page is initially shown', function() {
        loadHtml('/jqmng/test/ui/test-fixture.html',instrumentPage);
        runs(function() {
            expect(passivateCallCount).toEqual(0);
        });
    });

    it('should call onActivate when the page is changed', function() {
        loadHtml('/jqmng/test/ui/test-fixture.html', instrumentPage);
        runs(function() {
            var startPageScope = frame().$("#start").scope();
            var activePage = startPageScope.$service("$activePage");
            reset();
            expect(activateCallCount).toEqual(0);
            activePage("page2");
            expect(activateCallCount).toEqual(1);
            expect(activateThis.name).toEqual("Page2Controller");
            expect(activatePrevScope.name).toEqual("StartController");
        });
    });

    it('should call onPassivate when the page is changed', function() {
        loadHtml('/jqmng/test/ui/test-fixture.html',instrumentPage);
        runs(function() {
            var startPageScope = frame().$("#start").scope();
            var activePage = startPageScope.$service("$activePage");
            reset();
            expect(passivateCallCount).toEqual(0);
            activePage("page2");
            expect(passivateCallCount).toEqual(1);
            expect(passivateThis.name).toEqual("StartController");
            expect(passivateNextScope.name).toEqual("Page2Controller");
        });
    });
    // TODO create a test for back navigation.
    // However, this does not work well in iframe, see https://bugs.webkit.org/show_bug.cgi?id=40451

});
