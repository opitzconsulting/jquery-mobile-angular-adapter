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

    it('should use the same scope', function() {
        compile('<div><span ng:if="true"><span ng:init="test = true"></span></span></div>');
        expect(scope.test).toBeTruthy();
        expect(scope.$element).toEqual(element);
    });
});

