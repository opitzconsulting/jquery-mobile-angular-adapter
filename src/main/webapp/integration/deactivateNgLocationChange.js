(function (angular) {
    /**
     * Deactivate the url changing capabilities
     * of angular, so we do not get into trouble with
     * jquery mobile: angular saves the current url before a $digest
     * and updates the url after the $digest.
     * <p>
     * This also replaces the hashListen implementation
     * of angular by the jquery mobile impementation,
     * so we do not have two polling functions, ...
     * <p>
     * Attention: By this, urls can no more be changed via angular's $location service!
     */

    var ng = angular.module("ng");

    function deactivateAngularLocationService($browser) {
        $browser.onHashChange = function (handler) {
            $(window).bind('hashchange', handler);
            return handler;
        };
        var lastUrl = location.href;
        $browser.url = function (url) {
            if (url) {
                lastUrl = url;
            }
            return lastUrl;
        };
    }

    deactivateAngularLocationService.$inject = ['$browser'];
    ng.run(deactivateAngularLocationService);
})(window.angular);