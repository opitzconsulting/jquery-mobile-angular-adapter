define(['angular'], function(angular) {
    /**
     * Auto init for angular. This is needed as we use require-js to load
     * angular and cannot specify the ng:autobind attribute.
     */
    $(function() {
        angular.compile($(document))();
    });
});