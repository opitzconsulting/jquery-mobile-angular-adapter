define([
    'jqmng/widgets/widgetProxyUtil',
    'jqmng/widgets/jqmSelectMenu',
    'jqmng/widgets/jqmSlider',
    'jqmng/widgets/jqmCheckboxRadio',
    'jqmng/widgets/jqmTextInput',
    'jqmng/widgets/jqmButton'
],
    function(proxyUtil, jqmSelectMenu, jqmSlider, jqmCheckboxRadio, jqmTextInput, jqmButton) {
    proxyUtil.createAngularWidgetProxy('input', function(element) {
        var jqmWidgets = element[0].jqmwidgets || {};
        var name = element.attr('name');
        var options = element[0].jqmoptions;
        var oldType = element[0].type;
        // Need to set the type temporarily always to 'text' so that
        // the original angular widget is used.
        if (jqmWidgets.textinput) {
            element[0].type = 'text';
            element[0]['data-type'] = oldType;
        }
        return function(element, origBinder) {
            element[0].type = oldType;
            if (jqmWidgets.checkboxradio) {
                // Angular only binds to the click event for radio and check boxes,
                // but jquery mobile fires a change event. So be sure that angular also listens to the change event.
                var origBind = element.bind;
                element.bind = function(events, callback) {
                    if (events.indexOf('click') != -1) {
                        events += " change";
                    }
                    return origBind.call(this, events, callback);
                };
            }
            var res = origBinder();
            if (jqmWidgets.slider) {
                jqmSlider.compileSlider.call(this, element, name, options);
            }
            if (jqmWidgets.checkboxradio) {
                jqmCheckboxRadio.compileCheckboxRadio.call(this, element, name, options);
            }
            if (jqmWidgets.button) {
                jqmButton.compileButton.call(this, element, name, options);
            }
            if (jqmWidgets.textinput) {
               jqmTextInput.compileTextInput.call(this, element, name, options);
            }
            return res;
        };
    });

});
