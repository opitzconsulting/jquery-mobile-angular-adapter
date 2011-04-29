describe("slider", function() {
	var compile, element, scope;

	beforeEach(function() {
		element = null;
        compile = function(html) {
			// create a jquery mobile page widget. This should
			// initialize jquery mobile and also angular js!
            element = $(html);
			element.page();
			// get the angularJs scope from the jquery element.
			scope = element.scope();
		};

	});

    it('should save the ui value into the model', function() {
            compile('<div id="page1" data-role="page">' +
                    '<div data-role="content">' +
                    '<select name="mysel" id="mysel" data-role="slider"><option value="v1" default="true">v1</option><option value="v2">v2</option></select>' +
                    '</div>' +
                    '</div>');
            var select = element.find("#mysel");
            expect(select[0].value).toEqual("v1");
            var scope = select.scope();
            expect(scope.$get('mysel')).toEqual("v1");
            select[0].value = "v2";
            select.change();
            expect(scope.$get('mysel')).toEqual("v2");
    });

    it('should save the model value into the ui', function() {
            compile('<div id="page1" data-role="page">' +
                    '<div data-role="content">' +
                    '<select name="mysel2" id="mysel2" data-role="slider"><option value="v1" default="true">v1</option><option value="v2">v2</option></select>' +
                    '</div>' +
                    '</div>');
            var select = element.find("#mysel2");
            var scope = select.scope();
            expect(select[0].value).toEqual("v1");
            // jquery mobile creates a new span
            // that displays the actual value of the select box.
            var anchor = element.find("a");
            expect(anchor.attr('aria-valuetext')).toEqual("v1");
            scope.$set("mysel2", "v2");
            scope.$eval();
            expect(select[0].value).toEqual("v2");
            anchor = element.find("a");
            expect(anchor.attr('aria-valuetext')).toEqual("v2");
    });

});
