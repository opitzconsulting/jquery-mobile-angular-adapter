// Wrapper module as facade for the internal modules.
define([
    'angular',
    'jquery',
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
], function(angular, $, globalScope, activePage, waitDialog) {
    // create global variables
    $.mobile.globalScope = globalScope.globalScope;

    // export waitDialog as angular Service
    angular.service('waitdialog', function() {
        return waitDialog;
    });
    angular.service('$activePage', function() {
        return activePage.activePage;
    });
    return {
        globalScope: globalScope.globalScope,
        activePage: activePage.activePage,
        waitDialog: waitDialog
    }
});