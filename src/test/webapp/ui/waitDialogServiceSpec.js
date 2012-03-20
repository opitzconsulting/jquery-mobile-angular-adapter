jqmng.require([], function () {

    describe("waitdialogService", function () {
        var service, loader, $, win, injector, $q;

        beforeEach(function () {
            loadHtml('/jqmng/ui/test-fixture.html');
            runs(function () {
                win = testframe();
                $ = win.$;
                loader = $(".ui-loader");
                spyOn($.mobile, 'showPageLoadingMsg').andCallThrough();
                spyOn($.mobile, 'hidePageLoadingMsg').andCallThrough();
                injector = win.$("body").injector();
                service = injector.get("$waitDialog");
                $q = injector.get("$q");
            });
        });

        describe('show/hide', function () {

            it('should show the jqm wait dialog', function () {
                runs(function () {
                    expect($.mobile.showPageLoadingMsg).not.toHaveBeenCalled();
                    service.show();
                    expect($.mobile.showPageLoadingMsg).toHaveBeenCalled();
                    service.hide();
                });
            });

            it('should show the default message if no message was given and $.mobile.loadingMessageTextVisible is true', function () {
                runs(function () {
                    $.mobile.loadingMessageTextVisible = true;
                    $.mobile.loadingMessage = 'test';
                    service.show();
                    var text = loader.find("h1");
                    expect(text.is(":visible")).toBe(true);
                    expect(text.text()).toEqual("test");
                });
            });

            it('should not show the default message if no message was given and $.mobile.loadingMessageTextVisible is false', function () {
                runs(function () {
                    $.mobile.loadingMessageTextVisible = false;
                    $.mobile.loadingMessage = 'test';
                    service.show();
                    var text = loader.find("h1");
                    expect(text.is(":visible")).toBe(false);
                });
            });

            it('should show the given message, even if $.mobile.loadingMessageTextVisible is false', function () {
                runs(function () {
                    $.mobile.loadingMessageTextVisible = false;
                    service.show('test2');
                    var text = loader.find("h1");
                    expect(text.text()).toEqual("test2");
                    expect(text.is(":visible")).toBe(true);
                    expect($.mobile.loadingMessageTextVisible).toBe(false);
                });
            });

            it('should hide the dialog if showing', function () {
                runs(function () {
                    service.show();
                    expect($.mobile.hidePageLoadingMsg).not.toHaveBeenCalled();
                    service.hide();
                    expect($.mobile.hidePageLoadingMsg).toHaveBeenCalled();
                });
            });

            it('should call the callback when the dialog is clicked', function () {
                runs(function () {
                    var callback = jasmine.createSpy();
                    service.show(callback);
                    expect(callback).not.toHaveBeenCalled();
                    loader.trigger('vclick');
                    expect(callback).toHaveBeenCalled();
                });
            });


            it('should be able to stack show calls relative to the message', function () {
                runs(function () {
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

            it('should be able to stack show calls relative to the callbacks', function () {
                runs(function () {
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

        });

        describe('waitFor', function () {
            it('should waitFor the end of promises with the default message', function () {
                runs(function () {
                    var p = $q.defer();
                    service.waitFor(p.promise);
                    expect(loader.find("h1").text()).toEqual($.mobile.loadingMessage);
                    expect($.mobile.showPageLoadingMsg).toHaveBeenCalled();
                    p.resolve();
                    $("body").scope().$apply();
                    expect($.mobile.hidePageLoadingMsg).toHaveBeenCalled();
                });
            });

            it('should waitFor the end of promises with the given message', function () {
                runs(function () {
                    var p = $q.defer();
                    service.waitFor(p.promise, 'someMessage');
                    expect(loader.find("h1").text()).toEqual("someMessage");
                    expect($.mobile.showPageLoadingMsg).toHaveBeenCalled();
                    p.resolve();
                    $("body").scope().$apply();
                    expect($.mobile.hidePageLoadingMsg).toHaveBeenCalled();
                });
            });

            it('should waitFor the end of already finished promises and call show before hide', function () {
                runs(function () {
                    var hideCalledAfterShow = false;
                    $.mobile.hidePageLoadingMsg.andCallFake(function () {
                        hideCalledAfterShow = $.mobile.showPageLoadingMsg.callCount > 0;
                    });
                    var p = $q.defer();
                    p.resolve();
                    service.waitFor(p.promise);
                    $("body").scope().$apply();
                    expect(hideCalledAfterShow).toBeTruthy();
                });
            });

        });

        describe('waitForWithCancel', function () {

            it('should waitFor the end of promises and cancel promises when clicked', function () {
                runs(function () {
                    var p = $q.defer();
                    var callback = jasmine.createSpy();
                    p.promise.then(null, callback);
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

});