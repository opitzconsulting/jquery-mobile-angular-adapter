/**
 * Integration of the page widget.
 */
define(['jqmng/jquery', 'angular', 'jqmng/globalScope'], function($, angular, globalScope) {

    function reentrantSwitch(fnNormal, fnReentrant) {
        var reentrant = false;
        return function() {
            if (!reentrant) {
                try {
                    reentrant = true;
                    return fnNormal.apply(this, arguments);
                } finally {
                    reentrant = false;
                }
            } else {
                return fnReentrant.apply(this, arguments);
            }
        }
    }

    var inJqmPageCompile = false;

    var oldPage = $.fn.page;
    $.fn.page = reentrantSwitch(function() {
        var self = this;

        var instanceExists = this.data() && this.data().page;
        if (!instanceExists) {
            inJqmPageCompile = true;
            var res = oldPage.apply(self, arguments);
            inJqmPageCompile = false;
            // Create an own separate scope for every page,
            // so the performance of one page does not depend
            // on other pages.
            var childScope = angular.scope(globalScope.globalScope());
            angular.compile(this)(childScope);
        } else {
            res = oldPage.apply(self, arguments);
        }
        return res;
    }, oldPage);

    function isInJqmPageCompile() {
        return inJqmPageCompile;
    }

    return {
        inJqmPageCompile: isInJqmPageCompile
    }
});