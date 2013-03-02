/**
 * Helper function to be able to use the jquery mobile mobileinit event
 * in the standalone build, that already includes jquery and jquery mobile.
 */
(function(window) {
    if (window.mobileinit) {
        $(window.document).bind("mobileinit", function() {
            window.mobileinit.apply(this, arguments);
        });
    }

})(window);
