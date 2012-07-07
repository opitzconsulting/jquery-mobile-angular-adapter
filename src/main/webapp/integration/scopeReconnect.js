(function (angular) {

    var ng = angular.module('ng');
    ng.config(['$provide', function($provide) {
        $provide.decorator('$rootScope', ['$delegate', function($rootScope) {
            $rootScope.$disconnect = function() {
                if (this.$root == this) return; // we can't disconnect the root node;
                var parent = this.$parent;
                this.$$disconnected = true;
                // See Scope.$destroy
                if (parent.$$childHead == this) parent.$$childHead = this.$$nextSibling;
                if (parent.$$childTail == this) parent.$$childTail = this.$$prevSibling;
                if (this.$$prevSibling) this.$$prevSibling.$$nextSibling = this.$$nextSibling;
                if (this.$$nextSibling) this.$$nextSibling.$$prevSibling = this.$$prevSibling;
                this.$$nextSibling = this.$$prevSibling = null;
            };
            $rootScope.$reconnect = function() {
                if (this.$root == this) return; // we can't disconnect the root node;
                var child = this;
                if (!child.$$disconnected) {
                    return;
                }
                var parent = child.$parent;
                child.$$disconnected = false;
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
})(angular);