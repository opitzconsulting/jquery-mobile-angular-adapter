describe("dialog", function () {
    it("should stamp the widget using the jqm widget", function () {
        var spy = testutils.spyOnJq('dialog');
        var c = testutils.compile('<div><div data-role="dialog" ng-repeat="l in list"></div></div>');
        expect(spy.callCount).toBe(0);
        var scope = c.scope();
        scope.list = [1, 2];
        scope.$root.$digest();
        expect(spy.callCount).toBe(2);
    });

    it("should enhance the close button", function () {
        var dialog = testutils.compile('<div data-role="dialog"><div data-role="header"></div></div>');
        var closeSpy = spyOn(dialog.data($.mobile.dialog.prototype.widgetFullName), "close");
        var closeButton = dialog.find("a");
        expect(closeButton.length).toBe(1);
        expect(closeButton.hasClass("ui-btn")).toBe(true);
        expect(closeButton.hasClass("ui-btn-up-a")).toBe(true);
        closeButton.click();
        expect(closeSpy).toHaveBeenCalled();
    });

    describe('routing for dialogs', function () {
        it('should mark the history entry with .tempUrl when the dialog is opened', inject(function ($location, $rootScope, $browser, $history, $timeout) {
            $location.url('/somePath#someHash');
            $rootScope.$apply();
            var page = $.mobile.activePage = testutils.compile('<div data-role="dialog" id="someHash"></div>');
            page.trigger("pagebeforechange", {toPage: page, options: {navByNg: true}});
            page.trigger("pagebeforeshow");
            $rootScope.$apply();
            expect($location.url()).toBe('/somePath#someHash');
            expect($history.urlStack[$history.activeIndex].tempUrl).toBe(true);
        }));
        it('should remove dialog history entries when a normal page is visited', inject(function ($location, $history, $rootScope) {
            spyOn($history, 'removePastEntries');
            var page = $.mobile.activePage = testutils.compile('<div data-role="page"></div>');
            $history.urlStack = [{url: '/dialog1', tempUrl:true},{url: '/page1'},{url: '/dialog2', tempUrl: true},{url: '/page2'}];
            $history.activeIndex = 3;
            page.trigger("pagebeforechange", {toPage: page, options: {navByNg: true}});
            page.trigger("pagebeforeshow");
            expect($history.removePastEntries).toHaveBeenCalledWith(1);
        }));
        it('should go back on close if the dialog was navigated to by angular', inject(function($location, $rootScope, $history) {
            spyOn($history, 'goBack');
            var page = $.mobile.activePage = testutils.compile('<div data-role="dialog"></div>');
            page.trigger("pagebeforechange", {toPage: page, options: {navByNg: true}});
            page.trigger("pagebeforeshow");
            page.dialog("close");
            expect($history.goBack).toHaveBeenCalled();
        }));
        it('should not go back on close if the dialog was not navigated to by angular', inject(function($location, $rootScope, $history) {
            spyOn($history, 'goBack');
            var page = $.mobile.activePage = testutils.compile('<div data-role="dialog"></div>');
            page.trigger("pagebeforechange", {toPage: page, options: {}});
            page.trigger("pagebeforeshow");
            page.dialog("close");
            expect($history.goBack).not.toHaveBeenCalled();
        }));


    });
});
