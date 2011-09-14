/*
 * Defines the ng:if tag. This is useful if jquery mobile does not allow
 * an ng:switch element in the dom, e.g. between ul and li.
 * Uses ng:repeat and angular.Object.iff under the hood.
 */
define(['angular'], function(angular) {
    angular.Object.iff = function(self, test, trueCase, falseCase) {
        if (test) {
            return trueCase;
        } else {
            return falseCase;
        }
    }

    angular.widget('@ng:if', function(expression, element) {
        var newExpr = 'ngif in $iff(' + expression + ",[1],[])";
        element.removeAttr('ng:if');
        return angular.widget('@ng:repeat').call(this, newExpr, element);
    });
});
