(function ($, angular) {

    function waitDialogFactory(rootScope) {

        var showCalls = [];

        function onClick(event) {
            var lastCall = showCalls[showCalls.length - 1];
            if (lastCall.callback) {
                rootScope.$apply(function () {
                    lastCall.callback.apply(this, arguments);
                });
            }
            // This is required to prevent a second
            // click event, see
            // https://github.com/jquery/jquery-mobile/issues/1787
            event.preventDefault();
        }

        var loadDialog;

        $(document).delegate(".ui-loader", "vclick", onClick);

        if (!$.mobile.loader.prototype.options.textWithCancel) {
            $.mobile.loader.prototype.options.textWithCancel = 'Loading. Click to cancel.';
        }

        function updateUi() {
            if (!$.mobile.firstPage) {
                rootScope.$on("jqmInit", updateUi);
                return;
            }
            if (showCalls.length > 0) {
                var lastCall = showCalls[showCalls.length - 1];
                var msg = lastCall.msg;
                if (msg) {
                    $.mobile.loading('show', {text:msg, textVisible:!!msg});
                } else {
                    $.mobile.loading('show');
                }
            } else {
                $.mobile.loading('hide');
            }
        }

        /**
         * jquery mobile hides the wait dialog when pages are transitioned.
         * This immediately closes wait dialogs that are opened in the pagebeforeshow event.
         */
        $(document).on('pageshow', 'div', function (event, ui) {
            updateUi();
        });

        /**
         *
         * @param msg (optional)
         * @param tapCallback (optional)
         */
        function show() {
            var msg, tapCallback;
            if (typeof arguments[0] === 'string') {
                msg = arguments[0];
            }
            if (typeof arguments[0] === 'function') {
                tapCallback = arguments[0];
            }
            if (typeof arguments[1] === 'function') {
                tapCallback = arguments[1];
            }

            showCalls.push({msg:msg, callback:tapCallback});
            updateUi();
        }

        function hide() {
            showCalls.pop();
            updateUi();
        }

        function always(promise, callback) {
            promise.then(callback, callback);
        }

        /**
         *
         * @param promise
         * @param msg (optional)
         */
        function waitFor(promise, msg) {
            show(msg);
            always(promise, function () {
                hide();
            });
        }

        /**
         *
         * @param deferred
         * @param cancelData
         * @param msg (optional)
         */
        function waitForWithCancel(deferred, cancelData, msg) {
            if (!msg) {
                msg = $.mobile.loader.prototype.options.textWithCancel;
            }
            show(msg, function () {
                deferred.reject(cancelData);
            });
            always(deferred.promise, function () {
                hide();
            });
        }

        return {
            show:show,
            hide:hide,
            waitFor:waitFor,
            waitForWithCancel:waitForWithCancel
        };
    }

    var mod = angular.module('ng');
    mod.factory('$waitDialog', ['$rootScope', waitDialogFactory]);
})($, angular);