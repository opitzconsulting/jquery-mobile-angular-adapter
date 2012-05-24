describe('ng-include', function () {
    var eventSpy, scope, element;

    function init(response, parentPage) {
        inject(function ($httpBackend) {
            $httpBackend.when('GET', /.*/).respond(response);
            if (parentPage) {
                element = testutils.compileInPage('<div ng-include="src"></div>').element;
            } else {
                element = testutils.compile('<div ng-include="src"></div>');
            }
            scope = element.scope();
            eventSpy = jasmine.createSpy("$childrenChanged");
            element.bind("$childrenChanged", eventSpy);
        });
    }

    it("should enhance loaded non widget markup", inject(function ($httpBackend) {
        init('<a href="" data-role="button"></a>', true);

        scope.src = 'someUri';
        scope.$root.$digest();
        $httpBackend.flush();
        expect(element.children('a').hasClass('ui-btn')).toBe(true);
    }));

    it("should enhance loaded widget markup", inject(function ($httpBackend) {
        init('<div><button></button></div>', true);

        scope.src = 'someUri';
        scope.$root.$digest();
        $httpBackend.flush();

        expect(element.children('div').children('div').hasClass('ui-btn')).toBe(true);
    }));

    it("should compile included jqm page", inject(function($httpBackend) {
        init('<div data-role="page"></div>');

        scope.src = 'someUri';
        scope.$root.$digest();
        $httpBackend.flush();
        expect(element.children('div').hasClass('ui-page')).toBe(true);

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

