define(['angular'], function(angular) {

    describe("ng:if", function() {
        var element, scope;

        function compile(html) {
            element = angular.element(html);
            scope = angular.compile(element)();
        }

        beforeEach(function() {
            scope = null;
            element = null;

        });

        it('should add the element if the expression is true', function() {
            compile('<div><span ng:if="true">A</span></div>');
            expect(element.children('span').length).toEqual(1);
        });

        it('should remove the element if the expression is false', function() {
            compile('<div><span ng:if="false">A</span></div>');
            expect(element.children('span').length).toEqual(0);
        });

        it('should use an own scope', function() {
            compile('<div><span ng:if="true"><span ng:init="test = true"></span></span></div>');
            expect(scope.test).toBeFalsy();
            expect(element.children('span').scope().test).toBeTruthy();
        });

        it('should work with select options', function() {
            compile('<div><select name="test"><option ng:if="test" value="v1">V1</option></select></div>');
            var select = element.find('select');
            var options = select.children('option');
            expect(options.length).toEqual(0);
            scope.test = true;
            scope.$eval();
            var options = select.children('option');
            expect(options.length).toEqual(1);
        });
    });

});
