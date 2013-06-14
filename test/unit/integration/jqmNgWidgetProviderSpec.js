describe('jqmNgWidgetProvider', function () {

    describe('createWidget', function() {
        it('should call the original jquery widget with the params from the attrs', inject(function(jqmNgWidget) {
            var initParams = [{a:1}];
            var el = $("<div></div>");
            $.fn.orig.someWidget = jasmine.createSpy('someWidget');
            jqmNgWidget.createWidget('someWidget', el, {ngmSomeWidget: JSON.stringify(initParams)});
            expect($.fn.orig.someWidget).toHaveBeenCalledWith(initParams[0]);
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
            it('should allow after and before during widget creation without delegating to the wrapper when two widgets are created for the same element',inject(function(jqmNgWidget) {
                var root = $('<div class="root"><div class="el"></div>');
                var el = root.children(".el");
                $.fn.orig.someWidget = function() {
                    this.wrap('<div class="wrapper"></div>');
                };
                $.fn.orig.someWidget2 = function() {
                    this.after('<div class="after"></div>');
                };
                jqmNgWidget.createWidget('someWidget', el, {ngmSomeWidget: "[]"});
                jqmNgWidget.createWidget('someWidget2', el, {ngmSomeWidget2: "[]"});
                expect(el.next().hasClass('after')).toBe(true);
            }));

            describe('elements that unwrap themselves during destroy', function() {
                var root, el, removeCounter;
                beforeEach(inject(function(jqmNgWidget) {
                    root = $('<div class="root"><div class="el"></div>');
                    el = root.children(".el");
                    removeCounter = 0;
                    $.fn.orig.someWidget = function() {
                        this.wrap('<div class="wrapper"></div>');
                        var self = this;
                        this.on("remove", function() {
                            var wrapper = self.parent();
                            self.insertAfter( wrapper );
                            wrapper.remove();
                            removeCounter++;
                        });
                    };
                    jqmNgWidget.createWidget('someWidget', el, {ngmSomeWidget: "[]"});
                }));
                it('should be removable with the wrapper using el.remove ', function() {
                    el.remove();
                    expect(root.children().length).toBe(0);
                    expect(removeCounter).toBe(1);
                });
                it('should get only one remove event if the wrapper parent is removed', function() {
                    root.remove();
                    expect(removeCounter).toBe(1);
                });
            });

            it('should trigger only one remove event if the container is removed ', inject(function(jqmNgWidget) {
                var root = $('<div class="root"><div class="el"></div>');
                var el = root.children(".el");
                var removeCounter = 0,
                    removeEventCounter = 0;
                $.fn.orig.someWidget = function() {
                    this.wrap('<div class="wrapper"></div>');
                    var self = this;
                    this.on("remove", function() {
                        var wrapper = self.parent();
                        self.insertAfter( wrapper );
                        wrapper.remove();
                        removeCounter++;
                    });
                };
                jqmNgWidget.createWidget('someWidget', el, {ngmSomeWidget: "[]"});
                el.bind("remove", function() {
                    removeEventCounter++;
                });
                root.children().remove();
                // expect(root.children().length).toBe(0);
                // expect(removeCounter).toBe(1);
                expect(removeEventCounter).toBe(1);
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

            it('should apply css-display changes to the wrapper', inject(function(jqmNgWidget) {
                var root = $('<div class="root"><div class="sibling"></div><div class="el"></div>');
                var el = root.children(".el");
                $.fn.orig.someWidget = function() {
                    this.wrap('<div class="wrapper"></div>');
                };
                jqmNgWidget.createWidget('someWidget', el, {ngmSomeWidget: "[]"});
                var wrapper = el.parent();
                el.css("display", 'none');
                expect(wrapper.css("display")).toBe('none');
                expect(el.css("display")).toBe('');
            }));

            it('should delegate ng-show to the wrapper', function() {
                var d = testutils.compileInPage('<button ng-show="show">{{name}}</button>');
                var input = d.element.find("button");
                var wrapper = input.parent();
                expect(wrapper.css("display")).toBe('none');
                var scope = input.scope();
                scope.show = true;
                scope.$apply();
                expect(wrapper.css("display")).toBe('block');
            });
        });
    });

});
