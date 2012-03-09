define([
    'jquery', 'jqmng/widgets/widgetProxyUtil'
],
    function($, proxyUtil) {
        function isCheckboxRadio(element) {
            return element.filter($.mobile.checkboxradio.prototype.options.initSelector)
                .not(":jqmData(role='none'), :jqmData(role='nojs')").length > 0;

        }

        function isTextInput(element) {
            return element.filter($.mobile.textinput.prototype.options.initSelector)
                .not(":jqmData(role='none'), :jqmData(role='nojs')").length > 0;
        }

        var oldInput = angular.widget("input");
        angular.widget("input", function(element) {
            var textinput = isTextInput(element);
            var checkboxRadio = isCheckboxRadio(element);

            var name = element.attr('name');
            var type = element.attr('type');
            var origType = type;
            // Need to set the type temporarily always to 'text' so that
            // the original angular widget is used.
            if (textinput) {
                type = 'text';
            }
            // We fake an element during compile phase, as setting the type attribute
            // is not allowed by the dom (although it works in many browsers...)
            var fakeElement = [
                {type: type}
            ];
            var origBinder = oldInput.call(this, fakeElement);
            var newBinder = function() {
                var scope = this;
                var element = arguments[newBinder.$inject.length];
                var origBind = element.bind;
                if (checkboxRadio) {
                    // Angular binds to the click event for radio and check boxes,
                    // but jquery mobile fires a change event. So be sure that angular only listens to the change event,
                    // and no more to the click event, as the click event is too early / jqm has not updated
                    // the checked status.

                    element.bind = function(events, callback) {
                        if (events.indexOf('click') != -1) {
                            events = "change";
                        }
                        return origBind.call(this, events, callback);
                    };
                }
                if (origType === 'date') {
                    // on iOS 5, date inputs do not fire a change event.
                    // so we need to also listen for blur events.
                    element.bind = function(events, callback) {
                        if (events.indexOf('change') != -1) {
                            events += " blur";
                        }
                        return origBind.call(this, events, callback);
                    };
                }
                var res = origBinder.apply(this, arguments);
                // Watch the name and refresh the widget if needed
                if (name) {
                    scope.$watch(name, function(value) {
                        // Angular only sets the checked property on the dom element,
                        // but not explicitly the css attribute. However, the later is checked by jquery mobile.
                        if (checkboxRadio) {
                            element.attr('checked', element[0].checked);
                        }
                        var data = element.data();
                        for (var key in data) {
                            var widget = data[key];
                            if (widget.refresh) {
                                element[key]("refresh");
                            }
                        }
                    });
                }
                return res;
            };
            newBinder.$inject = origBinder.$inject || [];
            return newBinder;
        });

    });
