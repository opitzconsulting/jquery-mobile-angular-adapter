describe("navigate", function () {
    function visitPage(page, Page2Controller, events) {
        loadHtml('/jqmng/ui/test-fixture.html#' + page, function (frame) {
            var page = frame.$('#page2');
            page.attr("ng-controller", "Page2Controller");
            frame.Page2Controller = Page2Controller;
            if (events) {
                page.attr("ngm-event", frame.angular.toJson(events));
            }
        });
    }

    function navigate() {
        var $ = testwindow().$;
        var injector = $("#start").injector();
        var navigate = injector.get("$navigate");
        return navigate.apply(this, arguments);
    }


    it("should call the given function on the target page", function () {
        var onActivateArguments;
        visitPage("start", function ($scope) {
            $scope.onActivate = function () {
                onActivateArguments = arguments;
            }
        });
        runs(function () {
            expect(onActivateArguments).toBeFalsy();
            navigate("#page2", "onActivate");
        });
        waitsForAsync();
        runs(function () {
            expect(onActivateArguments).toBeTruthy();
        });
    });
    it("should call the given function with the given arguments on the target page", function () {
        var onActivateArguments;
        visitPage("start", function ($scope) {
            $scope.onActivate = function () {
                onActivateArguments = arguments;
            }
        });
        runs(function () {
            expect(onActivateArguments).toBeFalsy();
            navigate("#page2", "onActivate", "param1", "param2");
        });
        waitsForAsync();
        runs(function () {
            expect(onActivateArguments).toEqual(["param1", "param2"]);
        });
    });
    it("should call the given function on the target page on back navigation", function () {
        var onActivateArguments;
        visitPage("page2", function ($scope) {
            $scope.onActivate = function () {
                onActivateArguments = arguments;
            }
        });
        runs(function () {
            navigate("#start");
        });
        waitsForAsync();
        runs(function () {
            expect(onActivateArguments).toBeFalsy();
            navigate("back", "onActivate");
        });
        waitsForAsync();
        runs(function () {
            expect(onActivateArguments).toBeTruthy();
        });
    });
    it("should call the given function on the target page on back navigation with pageId", function () {
        var onActivateArguments;
        visitPage("page2", function ($scope) {
            $scope.onActivate = function () {
                onActivateArguments = arguments;
            }
        });
        runs(function () {
            navigate("#start");
        });
        waitsForAsync();
        runs(function () {
            expect(onActivateArguments).toBeFalsy();
            navigate("back:#page2", "onActivate");
        });
        waitsForAsync();
        runs(function () {
            expect(onActivateArguments).toBeTruthy();
        });
    });

    it("should be able to go back using a pageId", function() {
        visitPage("page2", function() {

        });
        runs(function () {
            var $ = testframe().$;
            expect($.mobile.activePage.attr("id")).toBe("page2");
            navigate("#start");
        });
        waitsForAsync();
        runs(function () {
            var $ = testframe().$;
            expect($.mobile.activePage.attr("id")).toBe("start");
            spyOn($.mobile, 'changePage').andCallThrough();
            navigate("back:#page2");
            expect($.mobile.changePage).not.toHaveBeenCalled();
        });
        waitsForAsync();
        runs(function () {
            var $ = testframe().$;
            expect($.mobile.activePage.attr("id")).toBe("page2");
        });

    });

    it("should call the given function on the target page before the pagebeforeshow event", function () {
        var onActivateArguments, onActivateArgumentsOnBeforeShow
        var beforeShowCallCount = 0;
        visitPage("start", function ($scope) {
            $scope.onActivate = function () {
                onActivateArguments = arguments;
            };
            $scope.onBeforeShow = function () {
                beforeShowCallCount++;
                onActivateArgumentsOnBeforeShow = onActivateArguments;
            }
        }, {pagebeforeshow:"onBeforeShow()"});
        runs(function () {
            beforeShowCallCount = 0;
            onActivateArgumentsOnBeforeShow = undefined;
            expect(onActivateArguments).toBeUndefined();
            expect(onActivateArgumentsOnBeforeShow).toBeUndefined();
            navigate("#page2", "onActivate");
        });
        waitsForAsync();
        runs(function () {
            expect(onActivateArguments).toBeTruthy();
            expect(onActivateArgumentsOnBeforeShow).toBe(onActivateArguments);
            expect(beforeShowCallCount).toBe(1);
        });
    });
});
