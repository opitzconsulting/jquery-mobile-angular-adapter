(function($, angular) {
    function splitAtFirstColon(value) {
        var pos = value.indexOf(':');
        if (pos===-1) {
            return [value];
        }
        return [
            value.substring(0, pos),
            value.substring(pos+1)
        ];
    }

    var mod = angular.module('ng');
    mod.factory('$navigate', ['$location', '$history', function($location, $history) {
        /*
         * Service for page navigation.
         * @param target has the syntax: [<transition>:]pageId
         * @param activateFunctionName Function to call in the target scope.
         * @param further params Parameters for the function that should be called in the target scope.
         */
        function navigate(target, activateFunctionName, activateParams) {
            var navigateOptions;
            if (typeof target === 'object') {
                navigateOptions = target;
                target = navigateOptions.target;
            }
            var parts = splitAtFirstColon(target);
            var isBack = false;
            if (parts.length === 2 && parts[0] === 'back') {
                isBack = true;
                target = parts[1];
            } else if (parts.length === 2) {
                navigateOptions = { transition: parts[0] };
                target = parts[1];
            }
            if (target === 'back') {
                $history.go(-1);
                return;
            }
            if (isBack) {
                $location.back();
            }
            $location.routeOverride({
                jqmOptions: navigateOptions,
                onActivate: activateFunctionName,
                locals: activateParams
            });
            if (target.charAt(0)==='#') {
                $location.hash(target.substring(1));
            } else {
                $location.path(target);
            }
        }

        return navigate;
    }]);


})($, angular);