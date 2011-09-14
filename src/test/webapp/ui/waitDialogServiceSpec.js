define(function() {

    describe("waitdialogService", function() {
        var updateViewSpy, service, loader, $, win;

        beforeEach(function() {
            loadHtml('/jqmng/ui/test-fixture.html');
            runs(function() {
                win = testframe();
                $ = win.$;
                loader = $(".ui-loader");
                spyOn($.mobile, 'showPageLoadingMsg').andCallThrough();
                spyOn($.mobile, 'hidePageLoadingMsg').andCallThrough();
                updateViewSpy = jasmine.createSpy();
                service = win.angular.service('waitdialog')(updateViewSpy);
            });
        });

        it('should show the jqm wait dialog', function() {
            runs(function() {
                expect($.mobile.showPageLoadingMsg).not.toHaveBeenCalled();
                service.show();
                expect($.mobile.showPageLoadingMsg).toHaveBeenCalled();
                service.hide();
            });
        });

        it('should use the default message if not message was given', function() {
            runs(function() {
                $.mobile.loadingMessage = 'test';
                service.show();
                expect(loader.find("h1").text()).toEqual("test");
            });
        });

        it('should show the given message if given', function() {
            runs(function() {
                service.show('test2');
                expect(loader.find("h1").text()).toEqual("test2");
            });
        });

        it('should hide the dialog if showing', function() {
            runs(function() {
                service.show();
                expect($.mobile.hidePageLoadingMsg).not.toHaveBeenCalled();
                service.hide();
                expect($.mobile.hidePageLoadingMsg).toHaveBeenCalled();
            });
        });

        it('should call the callback when the dialog is clicked', function() {
            runs(function() {
                var callback = jasmine.createSpy();
                service.show(callback);
                expect(callback).not.toHaveBeenCalled();
                loader.trigger('vclick');
                expect(callback).toHaveBeenCalled();
            });
        });


        it('should be able to stack show calls relative to the message', function() {
            runs(function() {
                $.mobile.loadingMessage = 'test';
                service.show('test1');
                service.show('test2');
                expect(loader.find("h1").text()).toEqual("test2");
                service.hide();
                expect(loader.find("h1").text()).toEqual("test1");
                expect($.mobile.hidePageLoadingMsg).not.toHaveBeenCalled();
                service.hide();
                expect($.mobile.hidePageLoadingMsg).toHaveBeenCalled();
            });
        });

        it('should be able to stack show calls relative to the callbacks', function() {
            runs(function() {
                var callback1 = jasmine.createSpy();
                var callback2 = jasmine.createSpy();
                service.show('test1', callback1);
                service.show('test2', callback2);
                expect(callback1).not.toHaveBeenCalled();
                expect(callback2).not.toHaveBeenCalled();
                loader.trigger('vclick');
                expect(callback1).not.toHaveBeenCalled();
                expect(callback2).toHaveBeenCalled();
                service.hide();
                loader.trigger('vclick');
                expect(callback1).toHaveBeenCalled();
                expect(callback1).toHaveBeenCalled();
            });
        });

        it('should waitFor the end of promises', function() {
            runs(function() {
                var p = $.Deferred();
                service.waitFor(p);
                expect($.mobile.showPageLoadingMsg).toHaveBeenCalled();
                p.resolve();
                expect($.mobile.hidePageLoadingMsg).toHaveBeenCalled();
            });
        });

        it('should waitFor the end of already finished promises and call show before hide', function() {
            runs(function() {
                var hideCalledAfterShow = false;
                $.mobile.hidePageLoadingMsg.andCallFake(function() {
                    hideCalledAfterShow = $.mobile.showPageLoadingMsg.callCount > 0;
                });
                var p = $.Deferred();
                p.resolve();
                service.waitFor(p);
                expect(hideCalledAfterShow).toBeTruthy();
            });
        });

        it('should waitFor the end of promises and cancel promises when clicked', function() {
            runs(function() {
                var p = $.Deferred();
                var callback = jasmine.createSpy();
                p.fail(callback);
                var cancelRes = {test:true};
                service.waitForWithCancel(p, cancelRes);
                expect($.mobile.showPageLoadingMsg).toHaveBeenCalled();
                loader.trigger('vclick');
                expect($.mobile.hidePageLoadingMsg).toHaveBeenCalled();
                expect(callback).toHaveBeenCalledWith(cancelRes);
            });
        });
    });

});