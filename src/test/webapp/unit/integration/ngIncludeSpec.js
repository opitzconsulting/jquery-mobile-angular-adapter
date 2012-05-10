describe('ng-include', function () {
    var eventSpy, scope, element;

    function init(response) {
        inject(function ($httpBackend) {
            $httpBackend.when('GET', /.*/).respond(response);
            var c = testutils.compileInPage('<div ng-include="src"></div>');
            element = c.element;
            scope = c.element.scope();
            eventSpy = jasmine.createSpy("$childrenChanged");
            scope.$on("$childrenChanged", eventSpy);
        });
    }

    it("should enhance loaded non widget markup", inject(function ($httpBackend) {
        init('<a href="" data-role="button"></a>');

        scope.src = 'someUri';
        scope.$root.$digest();
        $httpBackend.flush();
        expect(element.children('a').hasClass('ui-btn')).toBe(true);
    }));

    it("should enhance loaded widget markup", inject(function ($httpBackend) {
        init('<button></button>');

        scope.src = 'someUri';
        scope.$root.$digest();
        $httpBackend.flush();

        console.log(element);
        expect(element.children('div').hasClass('ui-btn')).toBe(true);
    }));

    it("should trigger the $childrenChanged event when data is finished loading", inject(function ($httpBackend) {
        init('hello');

        scope.src = 'someUri';
        scope.$root.$digest();
        eventSpy.reset();

        $httpBackend.flush();
        expect(eventSpy.callCount).toBe(1);
    }));

    it("should trigger the $childrenChanged event when the content is cleared", inject(function ($httpBackend) {
        init('hello');

        scope.src = 'someUri';
        scope.$root.$digest();
        $httpBackend.flush();

        eventSpy.reset();
        scope.src = '';
        scope.$root.$digest();
        expect(eventSpy.callCount).toBe(1);
    }));

    it("should not do anything if src does not change", function () {
        init('hello');
        eventSpy.reset();
        scope.$root.$digest();
        expect(eventSpy.callCount).toBe(0);
    });
});

