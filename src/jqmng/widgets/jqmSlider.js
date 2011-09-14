define([
    'jqmng/widgets/widgetProxyUtil',
    'jqmng/widgets/disabledHandling'
], function(proxyUtil, disabledHandling) {
    disabledHandling.slider = true;

    function compileSlider(element, name) {
        var scope = this;
        proxyUtil.afterEvalCallback(function() {
            // The slider widget creates an element of class ui-slider
            // after the slider.
            var newElements = recordDomAdditions(".ui-slider", function() {
                element.slider();
            });
            proxyUtil.removeSlavesWhenMasterIsRemoved(element, $(newElements));

            scope.$watch(name, function(value) {
                element.slider('refresh');
            });
        });
    }

    function isSlider(element) {
        return element.filter($.mobile.slider.prototype.options.initSelector)
            .not(":jqmData(role='none'), :jqmData(role='nojs')").length > 0;

    }

    return {
        compileSlider: compileSlider,
        isSlider: isSlider
    }

});