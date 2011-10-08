// Wrapper module as facade for the internal modules.
define([
    'angular',
    'jquery',
    'jqmng/globalScope',
    'jqmng/activate',
    'jqmng/waitDialog',
    'jqmng/event',
    'jqmng/fadein',
    'jqmng/if',
    'jqmng/paging',
    'jqmng/sharedController',
    'jqmng/widgets/pageCompile',
    'jqmng/widgets/angularRepeat',
    'jqmng/widgets/angularInput',
    'jqmng/widgets/angularSelect',
    'jqmng/widgets/disabledHandling',
    'jqmng/widgets/jqmButton',
    'jqmng/widgets/jqmListView',
    'jqmng/widgets/jqmSelectMenu',
    'jqmng/widgets/jqmSlider',
    'jqmng/jqmngStyle'
], function(angular, $, globalScope, activate, waitDialog) {
    // create global variables
    $.mobile.globalScope = globalScope.globalScope;

    // export waitDialog as angular Service
    angular.service('$waitDialog', function() {
        return waitDialog;
    });
    angular.service('$activate', function() {
        return activate.activate;
    });
    return {
        globalScope: globalScope.globalScope,
        activate: activate.activate,
        waitDialog: waitDialog
    }
});