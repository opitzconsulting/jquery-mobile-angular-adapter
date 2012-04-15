jqmng.define('jqmng/widgets/angularInput', ['jquery', 'angular'], function ($, angular) {
    function isCheckboxRadio(element) {
        return element.filter($.mobile.checkboxradio.prototype.options.initSelector)
            .not(":jqmData(role='none'), :jqmData(role='nojs')").length > 0;

    }

    function isTextInput(element) {
        return element.filter($.mobile.textinput.prototype.options.initSelector)
            .not(":jqmData(role='none'), :jqmData(role='nojs')").length > 0;
    }

    var mod = angular.module('ng');
    mod.directive("input", function () {
        return {
            restrict: 'E',
            require: '?ngModel',
            compile:function (tElement, tAttrs) {
                var textinput = isTextInput(tElement);
                var checkboxRadio = isCheckboxRadio(tElement);

                var name = tElement.attr('name');
                var type = tElement.attr('type');

                return {
                    pre:function (scope, iElement, iAttrs, ctrl) {
                        if (!ctrl) {
                            return;
                        }
                        var _bind = iElement.bind;
                        if (type==='date') {
                            // Angular binds to the input or keydown+change event.
                            // However, date inputs on IOS5 do not fire any of those (only the blur event).
                            iElement.bind = function (events, callback) {
                                if (events.indexOf('input') != -1 || events.indexOf('change') != -1) {
                                    events = "change blur";
                                }
                                return _bind.call(this, events, callback);
                            };
                        }
                        if (checkboxRadio) {
                            // Angular binds to the click event for radio and check boxes,
                            // but jquery mobile fires a change event. So be sure that angular only listens to the change event,
                            // and no more to the click event, as the click event is too early / jqm has not updated
                            // the checked status.

                            iElement.bind = function (events, callback) {
                                if (events.indexOf('click') != -1) {
                                    events = "change";
                                }
                                return _bind.call(this, events, callback);
                            };
                        }
                    },
                    post:function (scope, iElement, iAttrs, ctrl) {
                        if (!ctrl) {
                            return;
                        }
                        var _$render = ctrl.$render;
                        ctrl.$render = function() {
                            var res = _$render.apply(this, arguments);
                            // Angular only sets the checked property on the dom element,
                            // but not explicitly the css attribute. However, the later is checked by jquery mobile.
                            if (checkboxRadio) {
                                iElement.attr('checked', iElement[0].checked);
                            }
                            var data = iElement.data();
                            for (var key in data) {
                                var widget = data[key];
                                if (widget.refresh) {
                                    iElement[key]("refresh");
                                }
                            }

                            return res;
                        };
                    }

                }
            }
        };

    });
});
