describe('jqmAutoRefresh', function () {
    beforeEach(function () {
        $.mobile.autoRefresh();
    });

    function assertElementAndParentsChanged(el, value) {
        while (el.length) {
            expect(el.jqmChanged()).toBe(value);
            el = el.parent();
        }
    }

    it("should mark the parents of appended elements as changed", function () {
        var c = testutils.compileInPage('<div></div>');
        var el = $('<div></div>');
        expect(c.element.jqmChanged()).toBe(false);
        c.element.append(el);
        expect(el.jqmChanged()).toBe(false);
        assertElementAndParentsChanged(c.element, true);
    });

    it("should mark the parents of removed elements as changed", function () {
        var c = testutils.compileInPage('<div><div></div></div>');
        var el = c.element.children().eq(0);
        expect(c.element.jqmChanged()).toBe(false);
        el.remove();
        expect(el.jqmChanged()).toBe(false);
        assertElementAndParentsChanged(c.element, true);
    });

    it("should mark the parents of after elements as changed", function () {
        var c = testutils.compileInPage('<div><div></div></div>');
        var el = c.element.children().eq(0);
        expect(c.element.jqmChanged()).toBe(false);
        var el2 = $("<div></div>");
        el.after(el2);
        expect(el.jqmChanged()).toBe(false);
        expect(el2.jqmChanged()).toBe(false);
        assertElementAndParentsChanged(c.element, true);
    });

    function checkAttributeSet(attrName) {
        var c = testutils.compileInPage('<div></div>');
        var el = c.element;
        expect(el.jqmChanged()).toBe(false);
        el.attr(attrName, true);
        expect(el.jqmChanged()).toBe(true);
    }

    it("should mark elements as changed when the disabled, selected or checked attribute is set", function () {
        checkAttributeSet("disabled");
        checkAttributeSet("selected");
        checkAttributeSet("checked");
    });

    function checkAttributeRemove(attrName) {
        var c = testutils.compileInPage('<div></div>');
        var el = c.element;
        expect(el.jqmChanged()).toBe(false);
        el.removeAttr(attrName);
        expect(el.jqmChanged()).toBe(true);
    }

    it("should mark elements as changed when the disabled, selected or checked attribute is removed", function () {
        checkAttributeRemove("disabled");
        checkAttributeRemove("selected");
        checkAttributeRemove("checked");
    });

    function checkPropertySet(attrName) {
        var c = testutils.compileInPage('<div></div>');
        var el = c.element;
        expect(el.jqmChanged()).toBe(false);
        el.prop(attrName, true);
        expect(el.jqmChanged()).toBe(true);
    }

    it("should mark elements as changed when the disabled, selected or checked property is set", function () {
        checkPropertySet("disabled");
        checkPropertySet("selected");
        checkPropertySet("checked");
    });


    it("should reset the changed flag when $.mobile.autoRefresh is called", function () {
        var c = testutils.compileInPage('<div></div>');
        var el = c.element;
        el.jqmChanged(true);
        $.mobile.autoRefresh();
        assertElementAndParentsChanged(el, false);
    });

    it("should trigger the create event on the changed page when a child element in that page is changed", function () {
        var c = testutils.compileInPage('<div></div>');
        var el = c.element;
        el.jqmChanged(true);
        var createCount = 0;
        c.page.bind("create", function () {
            createCount++;
        });
        $.mobile.autoRefresh();
        expect(createCount).toBe(1);
    });

    it("should not trigger the create event when nothing changed", function () {
        var c = testutils.compileInPage('<div></div>');
        var createCount = 0;
        $.mobile.autoRefresh();
        c.page.bind("create", function () {
            createCount++;
        });
        $.mobile.autoRefresh();
        $.mobile.autoRefresh();
        expect(createCount).toBe(0);
    });

    it("should refresh widgets on the create event if they were changed", function () {
        var c = testutils.compileInPage('<button>Test</button>');
        c.element.attr("disabled", "disabled");
        $.mobile.autoRefresh();
        expect(c.element.hasClass("ui-state-disabled")).toBe(true);
    });

    it("should not refresh widgets on the create event if they were not changed", function () {
        var c = testutils.compileInPage('<button>Test</button>');
        c.element[0].disabled = "disabled";
        $.mobile.autoRefresh();
        expect(c.element.hasClass("ui-state-disabled")).toBe(false);
    });

    it("should fire create event only once when multiple elements are added to the page", function () {
        var c = testutils.compileInPage('<div></div>');
        var eventCount = 0;
        c.page.bind('create', function () {
            eventCount++;
        });
        c.element.append('<a href="" data-role="button">Test</a>');
        c.element.append('<a href="" data-role="button">Test</a>');
        $.mobile.autoRefresh();
        expect(eventCount).toEqual(1);
    });

    it("should fire the create event only once event when multiple elements are removed", function () {
        var c = testutils.compileInPage('<div><span></span><span></span></div>');
        var element = c.element;
        var scope = element.scope();
        var eventCount = 0;
        c.page.bind('create', function () {
            eventCount++;
        });
        element.find('span').eq(0).remove();
        element.find('span').eq(0).remove();
        $.mobile.autoRefresh();
        expect(eventCount).toEqual(1);
    });

    it("should not fire another create event if the dom was modified within a create event", function () {
        var c = testutils.compileInPage('<div></div>');
        var eventCount = 0;
        c.page.bind('create', function () {
            eventCount++;
            c.element.append('<a href="" data-role="button">Test</a>');
        });
        c.element.append('<a href="" data-role="button">Test</a>');
        $.mobile.autoRefresh();
        $.mobile.autoRefresh();
        expect(eventCount).toEqual(1);

    });
});
