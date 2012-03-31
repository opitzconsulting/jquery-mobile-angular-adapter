jqmng.define('jqmng/scopeReconnect', ['angular'], function (angular) {

    var ng = angular.module('ng');
    ng.config(['$provide', function($provide) {
        $provide.decorator('$rootScope', ['$delegate', function($rootScope) {
            var _$destroy = $rootScope.$destroy;
            $rootScope.$destroy = function() {
                this.$$destroyed = true;
                var res = _$destroy.apply(this, arguments);
                this.$$nextSibling = this.$$prevSibling = null;
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
                var parent = child.$parent;
                child.$$destroyed = false;
                // See Scope.$new for this logic...
                child.$$prevSibling = parent.$$childTail;
                if (parent.$$childHead) {
                    parent.$$childTail.$$nextSibling = child;
                    parent.$$childTail = child;
                } else {
                    parent.$$childHead = parent.$$childTail = child;
                }

            };
            return $rootScope;
        }]);
    }]);
});