/**
 * Module that exposes the services so they can be used without
 * requirejs.
 */
define(['jqm-angular'], function(jqmng) {
    // create global variables
    $.mobile.globalScope = jqmng.globalScope;

    // export waitDialog as angular Service
    angular.service('waitdialog', function() {
        return jqmng.waitDialog;
    });
    angular.service('$activePage', function() {
        return jqmng.activePage;
    });

});