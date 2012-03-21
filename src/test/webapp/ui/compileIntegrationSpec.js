jqmng.require([], function() {
    describe('compileIntegration', function() {
        it('should use the globalScope as parent of all page scopes', function() {
            loadHtml('/jqmng/ui/test-fixture.html');
            runs(function() {
                var win = testframe();
                var page1 = win.$("#start");
                page1.page();
                expect(page1.scope()).toBeTruthy();
                expect(page1.scope().$parent).toBe(win.$(win.document.documentElement).scope());
            });
        });

        it('should use a separate scope for every page whose digest does not trigger the digest of other pages', function() {
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
                scope1.$watch(function() {
                    page1evalCount++;
                });
                var page2evalCount = 0;
                scope2.$watch(function() {
                    page2evalCount++;
                });
                win.$.mobile.changePage('#start');
                scope1.$digest();
                expect(page1evalCount).toBeGreaterThan(0);
                expect(page2evalCount).toEqual(0);
                page1evalCount = page2evalCount = 0;
                win.$.mobile.changePage('#page2');
                scope2.$digest();
                expect(page1evalCount).toEqual(0);
                expect(page2evalCount).toBeGreaterThan(0);
            });
        });

        it('should style all non widgets when using ngm:if', function() {
            loadHtml('/jqmng/ui/test-fixture.html', function(win) {
                var $ = win.$;
                var page1 = $("#start");
                page1.append('<a data-role="button" ngm:if="test" id="myAnchor"></a>');
            });
            runs(function() {
                var win = testframe();
                var $ = win.$;
                var page1 = $("#start");
                var anchors = page1.find("#myAnchor");
                expect(anchors.length).toBe(0);
                var scope = page1.scope();
                scope.test = true;
                scope.$root.$digest();
                var anchors = page1.find("#myAnchor");
                expect(anchors.length).toBe(1);
                expect(anchors.hasClass('ui-btn')).toBeTruthy();
            })
        });

        it("should work with degraded inputs", function() {
            loadHtml('/jqmng/ui/test-fixture.html', function(win) {
                var $ = win.$;
                $.mobile.page.prototype.options.degradeInputs.number = "text";
                var page1 = $("#start");
                page1.append('<input type="number" name="myname" id="myname">');
            });
            runs(function() {
                var win = testframe();
                var $ = win.$;
                var page1 = $("#start");
                var input = page1.find("#myname");
                expect(input.length).toBe(1);
                expect(input.attr("type")).toBe("text");
                var scope = page1.scope();
                scope.myname = "hello";
                scope.$root.$eval();
                expect(input.val()).toBe("hello");
            })
        });
    });
});
