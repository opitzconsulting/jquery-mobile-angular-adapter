describe('jqmNgWidgetProvider', function () {

    describe('createWidget', function() {
        it('should call the original jquery widget with the params from the attrs', inject(function(jqmNgWidget) {
            var initParams = [{a:1}];
            var el = $("<div></div>");
            $.fn.orig.someWidget = jasmine.createSpy('someWidget');
            jqmNgWidget.createWidget('someWidget', el, {ngmSomeWidget: JSON.stringify(initParams)});
            expect($.fn.orig.someWidget).toHaveBeenCalledWith(initParams[0]);
        }));

        it('should add a parameter to the widget that it has been created by angular', inject(function(jqmNgWidget) {
            var initParams = [{a:1}];
            var el = $("<div></div>");
            $.fn.orig.someWidget = jasmine.createSpy('someWidget').andCallFake(function() {
                this.data("someWidget", {});
            });
            jqmNgWidget.createWidget('someWidget', el, {ngmSomeWidget: JSON.stringify(initParams)});
            expect(el.data("someWidget").createdByNg).toBe(true);
        }));

        describe('wrapping widgets', function() {
            it('should apply after, before, remove to the wrapper if applied to the element', inject(function(jqmNgWidget) {
                var root = $('<div class="root"><div class="sibling"></div><div class="el"></div>');
                var el = root.children(".el");
                $.fn.orig.someWidget = function() {
                    this.wrap('<div class="wrapper"></div>');
                };
                jqmNgWidget.createWidget('someWidget', el, {ngmSomeWidget: "[]"});

                var wrapper = el.parent(".wrapper");
                expect(wrapper.length).toBe(1);
                expect(root.children().eq(1).filter(".wrapper").length).toBe(1);
                expect(root.children().eq(0).filter(".sibling").length).toBe(1);

                var sibling = root.children(".sibling");
                el.after(sibling);
                expect(root.children().eq(0).filter(".wrapper").length).toBe(1);
                expect(root.children().eq(1).filter(".sibling").length).toBe(1);

                el.before(sibling);
                expect(root.children().eq(1).filter(".wrapper").length).toBe(1);
                expect(root.children().eq(0).filter(".sibling").length).toBe(1);

                el.remove();
                expect(root.children().length).toBe(1);
                expect(root.children().eq(0).filter(".sibling").length).toBe(1);
            }));

            it('should apply after, before to the wrapper if applied to another element with the element as argument', inject(function(jqmNgWidget) {
                var root = $('<div class="root"><div class="sibling"></div><div class="el"></div>');
                var el = root.children(".el");
                $.fn.orig.someWidget = function() {
                    this.wrap('<div class="wrapper"></div>');
                };
                jqmNgWidget.createWidget('someWidget', el, {ngmSomeWidget: "[]"});

                var wrapper = el.parent(".wrapper");
                expect(wrapper.length).toBe(1);
                expect(root.children().eq(1).filter(".wrapper").length).toBe(1);
                expect(root.children().eq(0).filter(".sibling").length).toBe(1);

                var sibling = root.children(".sibling");
                sibling.before(el);
                expect(root.children().eq(0).filter(".wrapper").length).toBe(1);
                expect(root.children().eq(1).filter(".sibling").length).toBe(1);

                sibling.after(el);
                expect(root.children().eq(1).filter(".wrapper").length).toBe(1);
                expect(root.children().eq(0).filter(".sibling").length).toBe(1);
            }));
        });
    });

});
