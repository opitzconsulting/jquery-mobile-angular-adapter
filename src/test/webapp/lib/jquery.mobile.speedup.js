/*
 * Helper library to speed up ui tests with jquery mobile
 */
$(document).bind("mobileinit", function(){
    // Disable transitions
    $.mobile.defaultPageTransition = "none";
    $.mobile.defaultDialogTransition = "none";
    var oldTimeout = window.setTimeout;
    // Allow at most 20ms as timeouts.
    window.setTimeout = function(fn, delay) {
        if (delay>20) {
            delay = 20;
        }
        return oldTimeout.call(this, fn, delay);
    };


});
