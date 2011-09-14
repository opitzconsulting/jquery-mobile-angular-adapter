// Provides the functionality for usage without require.js
require([
    'externals',
    'jqmng/ng-autoinit',
    'jqmng/globalScope',
    'jqmng/activePage',
    'jqmng/waitDialog',
    'jqmng/event',
    'jqmng/fadein',
    'jqmng/if',
    'jqmng/paging',
    'jqmng/widgets/pageCompile',
    'jqmng/widgets/angularButton',
    'jqmng/widgets/angularDiv',
    'jqmng/widgets/angularInput',
    'jqmng/widgets/angularSelect',
    'jqmng/widgets/angularUl',
], function(externals, autoinit, globalScope, activePage, waitDialog) {
    // create global variables
    $.mobile.globalScope = globalScope.globalScope;

    // export waitDialog as angular Service
    angular.service('waitdialog', function() {
        return waitDialog;
    });
    angular.service('$activePage', function() {
        return activePage.activePage;
    });

});