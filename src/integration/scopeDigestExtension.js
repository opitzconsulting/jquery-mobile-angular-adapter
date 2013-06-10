(function(angular) {

    var ng = angular.module('ng');
    ng.config(['$provide', function($provide) {
        $provide.decorator('$rootScope', ['$delegate', scopeReconnectDecorator]);
        $provide.decorator('$rootScope', ['$delegate', scopePostDigestDecorator]);
        $provide.decorator('$rootScope', ['$delegate', scopeReentranceDecorator]);
    }]);

    function scopeReconnectDecorator($rootScope) {
        $rootScope.$disconnect = function() {
            if (this.$root === this) {
                return; // we can't disconnect the root node;
            }
            var parent = this.$parent;
            this.$$disconnected = true;
            // See Scope.$destroy
            if (parent.$$childHead === this) {
                parent.$$childHead = this.$$nextSibling;
            }
            if (parent.$$childTail === this) {
                parent.$$childTail = this.$$prevSibling;
            }
            if (this.$$prevSibling) {
                this.$$prevSibling.$$nextSibling = this.$$nextSibling;
            }
            if (this.$$nextSibling) {
                this.$$nextSibling.$$prevSibling = this.$$prevSibling;
            }
            this.$$nextSibling = this.$$prevSibling = null;
        };
        $rootScope.$reconnect = function() {
            if (this.$root === this) {
                return; // we can't disconnect the root node;
            }
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
    }

    function scopePostDigestDecorator($rootScope) {
        var preListeners = [],
            postOneListeners = [],
            postAlwaysListeners = [],
            _digest = $rootScope.$digest;
        $rootScope.$preDigest = function(callback) {
            addListener(this, '$$preDigestListeners', callback);
        };
        $rootScope.$postDigestOne = function(callback) {
            addListener(this, '$$postDigestOneListeners', callback);
        };
        $rootScope.$postDigestAlways = function(callback) {
            addListener(this, '$$postDigestAlwaysListeners', callback);
        };
        $rootScope.$digest = function() {
            var i, res,
                redigest = true;
            while (redigest) {
                redigest = false;
                loopListeners(this, '$$preDigestListeners', []);
                res = _digest.apply(this, arguments);
                loopListeners(this, '$$postDigestOneListeners', [requireRedigest], true);
                loopListeners(this, '$$postDigestAlwaysListeners', [requireRedigest]);
            }
            return res;

            function requireRedigest() {
                redigest = true;
            }
        };
        return $rootScope;

        function addListener(self, property, listener) {
            var id, listeners;
            if (!self.hasOwnProperty(property)) {
                self[property] = [];
            }
            self[property].push(listener);
        }

        function loopListeners(self, property, args, clearAfterCalling) {
            var i, listeners;
            if (self.hasOwnProperty(property)) {
                listeners = self[property];
                if (clearAfterCalling) {
                    self[property] = [];
                }
                for (i=0; i<listeners.length; i++) {
                    listeners[i].apply(null, args);
                }
            }
        }
    }

    function scopeReentranceDecorator($rootScope) {
        var _apply = $rootScope.$apply;
        $rootScope.$apply = function() {
            if ($rootScope.$$phase) {
                return $rootScope.$eval.apply(this, arguments);
            }
            return _apply.apply(this, arguments);
        };
        var _digest = $rootScope.$digest;
        $rootScope.$digest = function() {
            if ($rootScope.$$phase) {
                return;
            }
            var res = _digest.apply(this, arguments);
        };
        return $rootScope;
    }
})(angular);