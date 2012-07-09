'use strict';

describe('deferredAngularBootstrap', function () {
    var element;

    var bootstrap;
    var jqReady;
    var element;
    var jqLite;
    var deferAngularBootstrap;

    function outerHtml(el) {
        return el.outerHTML;
    }

    function bootstrapAfterReady() {
        expect(bootstrap).not.toHaveBeenCalled();
        if (jqReady.callCount === 0) {
            return bootstrap;
        }
        jqReady.mostRecentCall.args[0]();
        return bootstrap;
    }

    beforeEach(function () {
        jqLite = window.jQuery;
        element = {
            getElementById:function (id) {
                return element.getElementById[id] || [];
            },

            getAttribute:function (name) {
                return element[name];
            },

            ownerDocument:{
                addEventListener:jasmine.createSpy('addEventListener'),
                readyState:"complete"
            }
        };
        bootstrap = jasmine.createSpy('bootstrap');
        jqReady = spyOn(jQuery.fn, 'ready');
        deferAngularBootstrap = $.mobile.deferAngularBootstrap;
        spyOn(window, 'addEventListener');
        spyOn(jQuery, "holdReady");
    });

    describe('hold jQuery ready, defer bootstrap with jQuery.ready and release jQuery ready', function () {
        var appElement;
        beforeEach(function () {
            appElement = jqLite('<div ng-app></div>')[0];
            element.querySelectorAll = function (arg) {
                return element.querySelectorAll[arg] || [];
            };
            element.querySelectorAll['.ng\\:app'] = [appElement];
            element.ownerDocument.readyState = "";
        });

        it("with document.DOMContentLoaded", function () {
            deferAngularBootstrap(element, bootstrap);
            expect(jQuery.holdReady).toHaveBeenCalledWith(true);
            expect(jQuery.fn.ready).not.toHaveBeenCalled();
            var c = element.ownerDocument.addEventListener.mostRecentCall.args;
            expect(c[0]).toBe("DOMContentLoaded");
            expect(c[2]).toBe(false);
            c[1]();
            expect(jQuery.holdReady).toHaveBeenCalledWith(false);
            expect(jQuery.fn.ready).toHaveBeenCalled();

            expect(bootstrap).not.toHaveBeenCalled();
            jQuery.fn.ready.mostRecentCall.args[0]();
            expect(bootstrap).toHaveBeenCalledWith(appElement, []);
        });

        it("with window.load", function () {
            deferAngularBootstrap(element, bootstrap);
            expect(jQuery.holdReady).toHaveBeenCalledWith(true);
            expect(jQuery.fn.ready).not.toHaveBeenCalled();
            var c = window.addEventListener.mostRecentCall.args;
            expect(c[0]).toBe("load");
            expect(c[2]).toBe(false);
            c[1]();
            expect(jQuery.holdReady).toHaveBeenCalledWith(false);
            expect(jQuery.fn.ready).toHaveBeenCalled();

            expect(bootstrap).not.toHaveBeenCalled();
            jQuery.fn.ready.mostRecentCall.args[0]();
            expect(bootstrap).toHaveBeenCalledWith(appElement, []);
        });

        it("with document.DOMContentChanged and window.load", function () {
            deferAngularBootstrap(element, bootstrap);
            element.ownerDocument.addEventListener.mostRecentCall.args[1]();
            window.addEventListener.mostRecentCall.args[1]();
            expect(jQuery.holdReady.callCount).toBe(2);
            expect(jQuery.fn.ready.callCount).toBe(1);
        });

        it("with document.readyState===complete", function () {
            element.ownerDocument.readyState = "complete";
            deferAngularBootstrap(element, bootstrap);
            expect(jQuery.holdReady).toHaveBeenCalledWith(true);
            expect(jQuery.fn.ready).toHaveBeenCalled();
            expect(jQuery.holdReady).toHaveBeenCalledWith(false);

            expect(bootstrap).not.toHaveBeenCalled();
            jQuery.fn.ready.mostRecentCall.args[0]();
            expect(bootstrap).toHaveBeenCalledWith(appElement, []);
        });

    });

    describe('find and replace angular markup', function () {
        it('should do nothing when not found', function () {
            deferAngularBootstrap(element, bootstrap);
            expect(bootstrapAfterReady()).not.toHaveBeenCalled();
        });


        it('should look for ngApp directive in id', function () {
            var appElement = jqLite('<div id="ng-app" data-ng-app="ABC" test="test" class="test"></div>')[0];
            jqLite(document.body).append(appElement);
            deferAngularBootstrap(element, bootstrap);
            expect(outerHtml(appElement)).toBe('<div test="test" class="test"></div>');
            expect(bootstrapAfterReady()).toHaveBeenCalledOnceWith(appElement, ['ABC']);
        });


        it('should look for ngApp directive in className', function () {
            var appElement = jqLite('<div data-ng-app="ABC" test="test" class="test"></div>')[0];
            element.querySelectorAll = function (arg) {
                return element.querySelectorAll[arg] || [];
            }
            element.querySelectorAll['.ng\\:app'] = [appElement];
            deferAngularBootstrap(element, bootstrap);
            expect(outerHtml(appElement)).toBe('<div test="test" class="test"></div>');

            expect(bootstrapAfterReady()).toHaveBeenCalledOnceWith(appElement, ['ABC']);
        });


        it('should look for ngApp directive using querySelectorAll', function () {
            var appElement = jqLite('<div x-ng-app="ABC"></div>')[0];
            element.querySelectorAll = function (arg) {
                return element.querySelectorAll[arg] || [];
            }
            element.querySelectorAll['[ng\\:app]'] = [ appElement ];
            deferAngularBootstrap(element, bootstrap);
            expect(outerHtml(appElement)).toBe('<div></div>');
            expect(bootstrapAfterReady()).toHaveBeenCalledOnceWith(appElement, ['ABC']);
        });


        it('should bootstrap using class name', function () {
            var appElement = jqLite('<div class="ng-app: ABC;"></div>')[0];
            deferAngularBootstrap(jqLite('<div></div>').append(appElement)[0], bootstrap);
            expect(outerHtml(appElement)).toBe('<div></div>');
            expect(bootstrapAfterReady()).toHaveBeenCalledOnceWith(appElement, ['ABC']);
        });

        it('should bootstrap using class name and other prefix class names', function () {
            var appElement = jqLite('<div class="test:test; ng-app: ABC;"></div>')[0];
            deferAngularBootstrap(jqLite('<div></div>').append(appElement)[0], bootstrap);
            expect(outerHtml(appElement)).toBe('<div class="test:test;"></div>');
            expect(bootstrapAfterReady()).toHaveBeenCalledOnceWith(appElement, ['ABC']);
        });

        it('should bootstrap using class name and other postfix class names', function () {
            var appElement = jqLite('<div class="ng-app: ABC;test:test"></div>')[0];
            deferAngularBootstrap(jqLite('<div></div>').append(appElement)[0], bootstrap);
            expect(outerHtml(appElement)).toBe('<div class="test:test"></div>');
            expect(bootstrapAfterReady()).toHaveBeenCalledOnceWith(appElement, ['ABC']);
        });

        it('should bootstrap anonymously', function () {
            var appElement = jqLite('<div x-ng-app></div>')[0];
            element.querySelectorAll = function (arg) {
                return element.querySelectorAll[arg] || [];
            }
            element.querySelectorAll['[x-ng-app]'] = [ appElement ];
            deferAngularBootstrap(element, bootstrap);
            expect(outerHtml(appElement)).toBe('<div></div>');
            expect(bootstrapAfterReady()).toHaveBeenCalledOnceWith(appElement, []);
        });


        it('should bootstrap anonymously using class only', function () {
            var appElement = jqLite('<div class="ng-app"></div>')[0];
            deferAngularBootstrap(jqLite('<div></div>').append(appElement)[0], bootstrap);
            expect(outerHtml(appElement)).toBe('<div></div>');
            expect(bootstrapAfterReady()).toHaveBeenCalledOnceWith(appElement, []);
        });


        it('should bootstrap if the annotation is on the root element', function () {
            var appElement = jqLite('<div class="ng-app"></div>')[0];
            deferAngularBootstrap(appElement, bootstrap);
            expect(outerHtml(appElement)).toBe('<div></div>');
            expect(bootstrapAfterReady()).toHaveBeenCalledOnceWith(appElement, []);
        });

    });


});