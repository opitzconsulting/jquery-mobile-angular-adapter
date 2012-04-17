(function(angular) {
    /*
     * Directive that fades in an element when angular
     * uses it. Useful in templating when the underlying template changed.
     */
    angular.module(["ng"]).directive("ngmFadein", function() {
        return {
            compile: function(element) {
                element.css({opacity:0.1});
                return function(scope, element, attrs) {
                    element.animate({opacity:1.0}, parseInt(attrs.ngmFadein));
                }
            }
        };
    });
})(window.angular);
