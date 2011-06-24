describe("ng:enterKey", function() {
    var element, scope;

    function compile(html) {
        element = angular.element(html);
        scope = angular.compile(element)();
    }

    beforeEach(function() {
        scope = null;
        element = null;

    });

    it('should eval the expression when the enterkey is hit', function() {
        compile('<div><input type="text" name="test" ng:enterkey="res=true"</div>');
        expect(scope.res).toBeFalsy();
        var input = element.find('input');
        var event = jQuery.Event("keypress");
        event.keyCode = 13;
        input.trigger(event);
        expect(scope.res).toBeTruthy();
    });
});

