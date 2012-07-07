/**
 * Different usecases to reproduce errors from github issues.
 */
describe('regression', function () {
    describe('links', function () {
        it("should not style a link with the ui-link class when it is used in a listview but use ui-link-inherited", function () {
            var c = testutils.compileInPage('<ul data-role="listview"><li ng-repeat="l in [1]"><a href="" ></a></li></ul>');
            expect(c.element.find('a').hasClass('ui-link')).toBe(false);
            expect(c.element.find('a').hasClass('ui-link-inherit')).toBe(true);
        });
        it("should not style buttonMarkup with ui-link", function() {
            var c = testutils.compileInPage('<a href="" data-role="button"></a>');
            expect(c.element.hasClass('ui-link')).toBe(false);

        });
    });

    describe("selectmenu", function () {
        it('should be able to display the label of a new entry when the options grow in a native menu', function () {
            var c = testutils.compileInPage(
                '<select data-native-menu="true" ng-model="myval" ng-options="e.value for e in list"></select>');
            var page = c.page;
            var select = c.element;
            var scope = select.scope();
            expect(scope.myval).toBeFalsy();
            scope.list = [
                {value:'value1'}
            ];
            scope.myval = scope.list[0];
            scope.$root.$apply();
            expect(page.find(".ui-select .ui-btn-text").text()).toEqual("value1");
        });
    });

    describe("ngm-if", function () {
        it('should work with select options', function () {
            var element = testutils.compile('<div><select name="test"><option ngm-if="test" value="v1">V1</option></select></div>');
            var scope = element.scope();
            var select = element.find('select');
            var options = select.children('option');
            expect(options.length).toEqual(0);
            scope.test = true;
            scope.$root.$digest();
            var options = select.children('option');
            expect(options.length).toEqual(1);
        });
    });

    describe("controlgroup", function () {
        it("should allow to add another controlgoup using templateUrl", function () {
            var _$httpBackend;

            module("ngMock", function ($compileProvider) {
                $compileProvider.directive('sampleUrl', function () {
                    return {
                        restrict:'A',
                        replace:true,
                        templateUrl:'sampleUrl'
                    }
                });

            });
            inject(function ($httpBackend) {
                $httpBackend.when('GET', /.*sampleUrl*/).respond('<div data-role="controlgroup"></div>');
                _$httpBackend = $httpBackend;
            });
            var c = testutils.compileInPage('<div><div data-role="controlgroup"></div><div sample-url="true"></div></div>');
            _$httpBackend.flush();
            var groups = c.element.children("div");
            expect(groups.length).toBe(2);
            expect(groups.eq(0).hasClass("ui-controlgroup")).toBe(true);
            expect(groups.eq(1).hasClass("ui-controlgroup")).toBe(true);
        });
    });

    describe("fieldset", function () {
        it("should allow to compile directive with a templateUrl that contains a fieldset with a search input", function () {
            var _$httpBackend;

            module("ngMock", function ($compileProvider) {
                $compileProvider.directive('sampleUrl', function () {
                    return {
                        restrict:'A',
                        replace:true,
                        templateUrl:'sampleUrl'
                    }
                });

            });
            inject(function ($httpBackend) {
                $httpBackend.when('GET', /.*sampleUrl*/).respond('<fieldset><input type="search"></fieldset>');
                _$httpBackend = $httpBackend;
            });
            var c = testutils.compileInPage('<div><div sample-url="true"></div></div>');
            _$httpBackend.flush();
            var fieldset = c.element.children("fieldset");
            expect(fieldset.children("div.ui-input-search").length).toBe(1);
        });
    });

    describe('checkboxes', function () {
        it("should update the ui for two checkboxes from the model", function () {
            var c = testutils.compileInPage(
                '<div><input type="checkbox" ng-model="model1" id="chk1"><label for="chk1">Chk1</label>'
                    + '<input type="checkbox" ng-model="model2" id="chk2"><label for="chk2">Chk2</label></div>'
            );
            var element = c.element;
            var chk1Label = element.children("div").eq(0).children("label");
            var chk2Label = element.children("div").eq(1).children("label");
            expect(chk1Label.hasClass('ui-checkbox-on')).toBeFalsy();
            expect(chk2Label.hasClass('ui-checkbox-on')).toBeFalsy();

            var scope = element.scope();
            scope.model1 = scope.model2 = true;
            scope.$digest();

            expect(chk1Label.hasClass('ui-checkbox-on')).toBeTruthy();
            expect(chk2Label.hasClass('ui-checkbox-on')).toBeTruthy();

        });
    });

});

