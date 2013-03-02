describe("waitdialogService", function () {
    var service, $q, $rootScope;

    beforeEach(function () {
        spyOn($.mobile, "loading").andCallThrough();
        inject(['$waitDialog', '$q', '$rootScope', function(_$waitDialog, _$q, _$rootScope) {
            $q = _$q;
            service = _$waitDialog;
            $rootScope = _$rootScope;
        }]);
    });

    function clickLoader() {
        $(".ui-loader").trigger('vclick');
    }

    describe('show/hide', function () {

        it('should show the jqm wait dialog', function () {
            runs(function () {
                expect($.mobile.loading).not.toHaveBeenCalled();
                service.show();
                expect($.mobile.loading).toHaveBeenCalledWith('show');
                service.hide();
            });
        });

        it('should show the default message if no message was given', function () {
            runs(function () {
                service.show();
                expect($.mobile.loading.mostRecentCall.args).toEqual(["show"]);
            });
        });

        it('should show the given message', function () {
            runs(function () {
                service.show('test2');
                expect($.mobile.loading.mostRecentCall.args).toEqual(["show", {text: "test2", textVisible: true}]);
            });
        });

        it('should hide the dialog if showing', function () {
            runs(function () {
                service.show();
                expect($.mobile.loading.mostRecentCall.args).toEqual(["show"]);
                service.hide();
                expect($.mobile.loading.mostRecentCall.args).toEqual(["hide"]);
            });
        });

        it('should call the callback when the dialog is clicked', function () {
            runs(function () {
                var callback = jasmine.createSpy();
                service.show(callback);
                expect(callback).not.toHaveBeenCalled();
                clickLoader();
                expect(callback).toHaveBeenCalled();
            });
        });


        it('should be able to stack show calls relative to the message', function () {
            runs(function () {
                service.show('test1');
                service.show('test2');
                expect($.mobile.loading.mostRecentCall.args).toEqual(["show", {text: "test2", textVisible: true}]);
                service.hide();
                expect($.mobile.loading.mostRecentCall.args).toEqual(["show", {text: "test1", textVisible: true}]);
                service.hide();
                expect($.mobile.loading.mostRecentCall.args).toEqual(["hide"]);
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
                clickLoader();
                expect(callback1).not.toHaveBeenCalled();
                expect(callback2).toHaveBeenCalled();
                service.hide();
                clickLoader();
                expect(callback1).toHaveBeenCalled();
                expect(callback1).toHaveBeenCalled();
            });
        });

        it('should wait for jqm to initialize before using $.mobile.loading', function() {
            var _old = $.mobile.firstPage;
            delete $.mobile.firstPage;
            service.show();
            expect($.mobile.loading).not.toHaveBeenCalled();
            $.mobile.firstPage = _old;
            $rootScope.$emit('jqmInit');
            expect($.mobile.loading).toHaveBeenCalledWith('show');
        });

    });

    describe('waitFor', function () {
        it('should waitFor the end of promises with the default message', function () {
            runs(function () {
                var p = $q.defer();
                service.waitFor(p.promise);
                expect($.mobile.loading.mostRecentCall.args).toEqual(["show"]);
                p.resolve();
                $rootScope.$apply();
                expect($.mobile.loading.mostRecentCall.args).toEqual(["hide"]);
            });
        });

        it('should waitFor the end of promises with the given message', function () {
            runs(function () {
                var p = $q.defer();
                service.waitFor(p.promise, 'someMessage');
                expect($.mobile.loading.mostRecentCall.args).toEqual(["show", {text: "someMessage", textVisible: true}]);
                p.resolve();
                $rootScope.$apply();
                expect($.mobile.loading.mostRecentCall.args).toEqual(["hide"]);
            });
        });

        it('should waitFor the end of already finished promises and call show before hide', function () {
            runs(function () {
                var p = $q.defer();
                p.resolve();
                service.waitFor(p.promise);
                $rootScope.$apply();
                expect($.mobile.loading.mostRecentCall.args).toEqual(["hide"]);
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
                expect($.mobile.loading.mostRecentCall.args).toEqual(["show", { text : $.mobile.loader.prototype.options.textWithCancel, textVisible : true }]);
                clickLoader();
                expect($.mobile.loading.mostRecentCall.args).toEqual(["hide"]);
                expect(callback).toHaveBeenCalledWith(cancelRes);
            });
        });

        it('should use the default message if none is given', function() {
            $.mobile.loader.prototype.options.textWithCancel = 'test1';
            var p = $q.defer();
            service.waitForWithCancel(p);
            expect($.mobile.loading.mostRecentCall.args).toEqual(["show", { text : $.mobile.loader.prototype.options.textWithCancel, textVisible : true }]);
        });

        it('should use the given message', function() {
            var p = $q.defer();
            service.waitForWithCancel(p, null, 'someMessage');
            expect($.mobile.loading.mostRecentCall.args).toEqual(["show", { text : 'someMessage', textVisible : true }]);
        });
    });

});
