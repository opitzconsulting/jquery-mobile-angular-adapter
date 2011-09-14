// Wrapper module as facade for the internal modules.
define([
    'externals',
    'jqmng/ng-autoinit',
    'jqmng/globalScope',
    'jqmng/activePage',
    'jqmng/waitDialog',
    'jqmng/event',
    'jqmng/fadein',
    'jqmng/if',
    'jqmng/paging',
    'jqmng/widgets/jqmPage',
    'jqmng/widgets/angularButton',
    'jqmng/widgets/angularDiv',
    'jqmng/widgets/angularInput',
    'jqmng/widgets/angularSelect',
    'jqmng/widgets/angularUl',
], function(externals, autoinit, globalScope, activePage, waitDialog) {
    return {
        globalScope: globalScope.globalScope,
        activePage: activePage.activePage,
        waitDialog: waitDialog
    }
});