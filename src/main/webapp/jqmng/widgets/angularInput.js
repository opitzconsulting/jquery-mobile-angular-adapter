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

        proxyUtil.createAngularWidgetProxy('input', function(element) {
            var textinput = isTextInput(element);
            var checkboxRadio = isCheckboxRadio(element);

            var name = element.attr('name');
            var oldType = element[0].type;
            // Need to set the type temporarily always to 'text' so that
            // the original angular widget is used.
            if (textinput) {
                element[0].type = 'text';
                element[0]['data-type'] = oldType;
            }
            return function(element, origBinder) {
                var scope = this;
                element[0].type = oldType;
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
                var res = origBinder();
                // Watch the name and refresh the widget if needed
                scope.$watch(name, function(value) {
                    var data = element.data();
                    for (var key in data) {
                        var widget = data[key];
                        if (widget.refresh) {
                            element[key]("refresh");
                        }
                    }
                });
                return res;
            };
        });

    });
