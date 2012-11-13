(function ($, angular) {

    var mod = angular.module("ng");
    mod.config(['$provide', function ($provide) {
        $provide.decorator('$location', ['$delegate', function ($location) {
            $location.back = function () {
                $location.$$back = true;
                return this;
            };
            return $location;
        }]);
    }]);

    /* TODO
    mod.run(['$rootScope', '$location', '$history', function ($rootScope, $location, $history) {
        var urlStack = [];
        var activeIndex = -1;

        $rootScope.$on('$locationChangeStart', function (event, newUrl) {
            if ($location.$$back) {
                delete $location.$$back;


                event.preventDefault();
            }
            // TODO problem, when some one else is rejecting the change
            $location.$$savedReplace = $location.$$replace;
        });
        $rootScope.$on('$locationChangeSuccess', function (event, newUrl) {
            activeIndex = urlStack.indexOf(newUrl);
            if (activeIndex === -1) {
                if ($location.$$savedReplace && urlStack.length) {
                    urlStack[urlStack.length-1] = newUrl;
                } else {
                    urlStack.push(newUrl);
                }
                activeIndex = urlStack.length-1;
            } else {

            }
        });
    }]);

    */

    mod.factory('$history', function () {
        function go(relativeIndex) {
            window.history.go(relativeIndex);
        }

        return {
            go:go
        };
    });
})(window.jQuery, window.angular);