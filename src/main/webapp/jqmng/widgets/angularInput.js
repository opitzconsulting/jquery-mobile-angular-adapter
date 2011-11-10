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
            var type = element[0].type;
            // Need to set the type temporarily always to 'text' so that
            // the original angular widget is used.
            if (textinput) {
                type = 'text';
            }
            // We fake an element during compile phase, as setting the type attribute
            // is not allowed by the dom (although it works in many browsers...)
            var fakeElement = [{type: type}];
            var origBinder = oldInput.call(this, fakeElement);
            var newBinder = function() {
                var scope = this;
                var element = arguments[newBinder.$inject.length];
                if (checkboxRadio) {
                    // Angular binds to the click event for radio and check boxes,
                    // but jquery mobile fires a change event. So be sure that angular only listens to the change event,
                    // and no more to the click event, as the click event is too early / jqm has not updated
                    // the checked status.
                    var origBind = element.bind;
                    element.bind = function(events, callback) {
                        if (events.indexOf('click') != -1) {
                            events = "change";
                        }
                        return origBind.call(this, events, callback);
                    };
                }
                var res = origBinder.apply(this, arguments);
                // Watch the name and refresh the widget if needed
                if (name) {
                    scope.$watch(name, function(value) {
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
