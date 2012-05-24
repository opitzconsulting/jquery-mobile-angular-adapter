describe('moveCloningDirectives', function() {

    describe('attributes', function() {
        function testAttr(attrName) {
            var source = $('<div '+attrName+'="someValue"></div>');
            var target = $("<div></div>");
            $.mobile.moveCloningDirectives(source, target);
            expect(target.attr(attrName)).toBe("someValue");
            expect(source.attr(attrName)).toBeFalsy();

        }

        it("should move attributes", function() {
            var attributeNames = ["ng-repeat", "ng:repeat", "data-ng-repeat", "ngm-if", "ngm:if", "data-ngm-if"];
            for (var i=0; i<attributeNames.length; i++) {
                testAttr(attributeNames[i]);
            }
        });

        it("should not move other attributes", function() {
            var attrName = "someName";
            var source = $('<div '+attrName+'="someValue"></div>');
            var target = $("<div></div>");
            $.mobile.moveCloningDirectives(source, target);
            expect(target.attr(attrName)).toBeFalsy();
            expect(source.attr(attrName)).toBe("someValue");
        });

    });

    describe("class names", function() {
        function testClassName(className) {
            var source = $('<div class="'+className+'"></div>');
            var target = $("<div></div>");
            $.mobile.moveCloningDirectives(source, target);
            expect(target.hasClass(className)).toBe(true);
            expect(source.hasClass(className)).toBe(false);

        }

        it("should move class names", function() {
            var attributeNames = ["ng-repeat", "ng:repeat", "data-ng-repeat", "ngm-if", "ngm:if", "data-ngm-if"];
            for (var i=0; i<attributeNames.length; i++) {
                testClassName(attributeNames[i]);
            }
        });
    });

});