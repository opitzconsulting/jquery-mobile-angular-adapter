define('jqmng/jqmngStyle', function() {
    /* Special styles for jquery-mobile-angular-adapter */
    /* Don't show the angular validation popup */
    // TODO use the css plugin for this...
    var styles =
        "#ng-callout {display: none}";
    $('head').append('<style type=\"text/css\">' + styles + '</style>');

});
