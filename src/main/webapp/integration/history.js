(function ($, angular) {

    var mod = angular.module("ng");
    mod.config(['$provide', function ($provide) {
        $provide.decorator('$location', ['$delegate', '$history', function ($location, $history) {
            $location.backMode = function () {
                $location.$$replace = "back";
                return this;
            };
            $location.goBack = function () {
                if ($history.activeIndex <= 0) {
                    throw new Error("There is no page in the history to go back to!");
                }
                // TODO
                //this.$$parse($history.urlStack[$history.activeIndex - 1]);
                //this.backMode();
                $history.go(-1);
                return this;
            };
            return $location;
        }]);

    }]);

    mod.factory('$history', function () {
        var $history;

        function go(relativeIndex) {
            window.history.go(relativeIndex);
        }

        function onUrlChangeBrowser(url) {
            $history.activeIndex = $history.urlStack.indexOf(url);
            if ($history.activeIndex === -1) {
                onUrlChangeProgrammatically(url, false);
            } else {
                $history.fromUrlChange = true;
            }
        }

        function onUrlChangeProgrammatically(url, replace, back) {
            if (back) {
                // Algorithm for going back:
                // We just do a normal navigation with angular,
                // by which we are adding a new entry into the navigation log.
                // After the normal navigation, we also do a history.go(-...)
                // to update the browser history.
                // However, this second navigation does not trigger anything, as it
                // does not change the url.
                // This algorithm works well as by this we don't have to intercept $browser from
                // doing anything, which would be tricky, as the digest cycle assumes that calling
                // $browser.url-setter results in an immediate update to $browser.url getter,
                // but changing browser history via history.go is asynchronous (in contrast
                // to hash changing using location.hash / location.href).
                // Furthermore, the route instance does not change, by which we can pass
                // route overrides also when going back (see ngmRouting.js)
                var currIndex = $history.activeIndex;
                var newIndex = $history.urlStack.lastIndexOf(url, currIndex - 1);
                if (newIndex !== -1 && currIndex !== -1) {
                    // Update $history to contain the right values immediately
                    $history.activeIndex = newIndex;
                    $history.fromUrlChange = true;
                    // Reason for "-1" here:
                    // we always do an additional change for the current url (see algorithm above).
                    $history.go(newIndex - currIndex - 1);
                    // Note: Don't reflect the additional url change in the internal
                    // urlStack, so calculating the new activeIndex works as expected.
                    return;
                }
            }
            if ($history.urlStack[$history.activeIndex] === url) {
                return;
            }
            $history.fromUrlChange = false;
            if (!replace) {
                $history.activeIndex++;
            }
            $history.urlStack.splice($history.activeIndex, $history.urlStack.length - $history.activeIndex);
            $history.urlStack.push(url);
        }

        return $history = {
            go:go,
            urlStack:[],
            activeIndex:-1,
            fromUrlChange:false,
            onUrlChangeProgrammatically:onUrlChangeProgrammatically,
            onUrlChangeBrowser:onUrlChangeBrowser
        };
    });
})(window.jQuery, window.angular);