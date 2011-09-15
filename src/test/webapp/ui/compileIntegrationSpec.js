define([], function() {
    describe('compileIntegration', function() {
        describe("globalScope", function() {
            it('should be equal to body.scope and defined', function() {
                loadHtml('/jqmng/ui/test-fixture.html');
                runs(function() {
                    var win = testframe();
                    var globalScope = win.$.mobile.globalScope();
                    expect(globalScope).toBeDefined();
                    expect(globalScope).toBe(win.$("body").scope());
                });
            });

            it('should use ng:controller on the body element', function() {
                loadHtml('/jqmng/ui/test-fixture.html', function(window) {
                    window.$("body").attr("ng:controller", "TestController");
                    window.TestController = function() {
                        this.mytest = true;
                    }
                });
                runs(function() {
                    var win = testframe();
                    var globalScope = win.$.mobile.globalScope();
                    expect(globalScope.mytest).toBeTruthy();
                });
            });
        });

        it('should use the globalScope as parent of all page scopes', function() {
            loadHtml('/jqmng/ui/test-fixture.html');
            runs(function() {
                var win = testframe();
                var page1 = win.$("#start");
                page1.page();
                expect(page1.scope()).toBeTruthy();
                expect(page1.scope().$parent).toBe(win.$.mobile.globalScope());
            });
        });

        it('should use a separate scope for every page whose eval does not trigger the eval of other pages', function() {
            loadHtml('/jqmng/ui/test-fixture.html');
            runs(function() {
                var win = testframe();
                var page1 = win.$("#start");
                page1.page();
                var scope1 = page1.scope();
                var page2 = win.$("#page2");
                page2.page();
                var scope2 = page2.scope();
                expect(scope1).not.toBe(scope2);
                var page1evalCount = 0;
                scope1.$onEval(function() {
                    page1evalCount++;
                });
                var page2evalCount = 0;
                scope2.$onEval(function() {
                    page2evalCount++;
                });
                scope1.$eval();
                expect(page1evalCount).toEqual(1);
                expect(page2evalCount).toEqual(0);
                scope2.$eval();
                expect(page1evalCount).toEqual(1);
                expect(page2evalCount).toEqual(1);
            });
        });

    });
});
