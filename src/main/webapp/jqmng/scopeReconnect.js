jqmng.define('jqmng/scopeReconnect', ['angular'], function (angular) {


    var ng = angular.module('ng');
    ng.run(['$rootScope', function($rootScope) {
        var _$destroy = $rootScope.$destroy;
        $rootScope.$destroy = function() {
            this.$$destroyed = true;
            return _$destroy.apply(this, arguments);
        };
        $rootScope.$reconnect = function() {
            var child = this;
            if (child===$rootScope) {
                // Nothing to do here.
                return;
            }
            if (!child.$$destroyed) {
                return;
            }
            child.$$destroyed = false;
            // See Scope.$new for this logic...
            child.$$prevSibling = $rootScope.$$childTail;
            if ($rootScope.$$childHead) {
                $rootScope.$$childTail.$$nextSibling = child;
                $rootScope.$$childTail = child;
            } else {
                $rootScope.$$childHead = $rootScope.$$childTail = child;
            }

        }
    }]);
});