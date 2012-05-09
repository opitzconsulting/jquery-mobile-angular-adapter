(function (angular) {

    var ng = angular.module('ng');
    ng.config(['$provide', function($provide) {
        $provide.decorator('$rootScope', ['$delegate', function($rootScope) {
            var _$new = $rootScope.$new;
            $rootScope.$new = function() {
                var res = _$new.apply(this, arguments);
                res.$emit("$childrenChanged");
                return res;
            };
            // Note: Angular already supports the $destroy event.
            // However, it only does a broadcast to the child scopes,
            // but not an emit to the parent scopes.
            var _$destroy = $rootScope.$destroy;
            $rootScope.$destroy = function() {
                this.$emit("$childrenChanged");
                return _$destroy.apply(this, arguments);
            };
            return $rootScope;
        }]);
    }]);
})(window.angular);