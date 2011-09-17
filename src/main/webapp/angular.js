/**
 * Wrapper around window.angular.
 */
define('angular', function() {
    if (typeof angular !== "undefined") {
        return angular;
    }
});