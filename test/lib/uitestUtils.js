(function () {
    var uit = uitest.current;
    // uit.trace(true);
    uit.feature("xhrSensor", "timeoutSensor", "intervalSensor", "jqmAnimationSensor", "angularIntegration", "mobileViewport");

    // disable transitions and speed up timeout during ui tests for better test performance
    function jqueryMobileSpeedup() {
        var errors;
        uit.prepend(function (window) {
            // Allow at most 20ms as timeouts.
            var oldTimeout = window.setTimeout;
            window.setTimeout = function (fn, delay) {
                if (delay > 20) {
                    delay = 20;
                }
                return oldTimeout.call(this, fn, delay);
            };
            if (window.console && window.console.error) {
                var _error = window.console.error;
                window.console.error = function(msg) {
                    errors.push(msg);
                    return _error.apply(this, arguments);
                };
            }
            window.onerror = function (event) {
                errors.push(event);
            };
        });
        uit.append(function (window, $) {
            // Disable transitions
            $.mobile.defaultPageTransition = "none";
            $.mobile.defaultDialogTransition = "none";

            var _changePage = $.mobile.changePage;
            spyOn($.mobile, 'changePage').andCallThrough();
            $.mobile.changePage.defaults = _changePage.defaults;
        });
        beforeEach(function() {
            errors = [];
        });
        afterEach(function() {
            expect(errors).toEqual([]);
        });
    }

    jqueryMobileSpeedup();

    // -----

    window.uit = uit;
})();
