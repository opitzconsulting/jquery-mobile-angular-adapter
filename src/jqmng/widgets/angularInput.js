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
            var isTextinput = jqmTextInput.isTextInput(element);
            var isCheckboxRadio = jqmCheckboxRadio.isCheckboxRadio(element);
            var isSlider = jqmSlider.isSlider(element);
            var isButton = jqmButton.isButton(element);

            var name = element.attr('name');
            var oldType = element[0].type;
            // Need to set the type temporarily always to 'text' so that
            // the original angular widget is used.
            if (isTextinput) {
                element[0].type = 'text';
                element[0]['data-type'] = oldType;
            }
            return function(element, origBinder) {
                element[0].type = oldType;
                if (isCheckboxRadio) {
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
                if (isSlider) {
                    jqmSlider.compileSlider.call(this, element, name);
                }
                if (isCheckboxRadio) {
                    jqmCheckboxRadio.compileCheckboxRadio.call(this, element, name);
                }
                if (isButton) {
                    jqmButton.compileButton.call(this, element, name);
                }
                if (isTextinput) {
                    jqmTextInput.compileTextInput.call(this, element, name);
                }
                return res;
            };
        });

    });
