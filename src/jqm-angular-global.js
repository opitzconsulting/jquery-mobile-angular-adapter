// Provides the functionality for usage without require.js
require([
    'jqmng/globalScope',
    'jqmng/activePage',
    'jqmng/waitDialog',
    'jqmng/event',
    'jqmng/fadein',
    'jqmng/if',
    'jqmng/paging',
    'jqmng/widgets/angularButton',
    'jqmng/widgets/angularDiv',
    'jqmng/widgets/angularInput',
    'jqmng/widgets/angularSelect',
    'jqmng/widgets/angularUl',
], function(globalScope, activePage, waitDialog) {
    $.mobile.globalScope = globalScope.globalScope;

    // export waitDialog as angular Service
    angular.service('waitdialog', waitDialog);
    angular.service('$activePage', activePage.activePage);

});