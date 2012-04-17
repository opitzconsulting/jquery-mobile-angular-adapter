(function($) {
    // textinput does not have a "refresh" function that
    // reads out the disabled attribute...
    // (jquery mobile 1.1 Final).
    var fn = $.mobile.textinput.prototype;
    fn.refresh = function() {
        var input = this.element[0];
        if (input.disabled) {
            this.disable();
        } else {
            this.enable();
        }
    };
})(window.jQuery);