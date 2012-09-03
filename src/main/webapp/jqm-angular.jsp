/**
* jQuery Mobile angularJS adaper v${project.version}
* http://github.com/tigbro/jquery-mobile-angular-adapter
*
* Copyright 2011, Tobias Bosch (OPITZ CONSULTING GmbH)
* Licensed under the MIT license.
*/
(function(factory) {
if (typeof define === "function" && define.amd) {
define(["jquery", "angular", "jquery.mobile"], factory);
} else {
factory(window.jQuery, window.angular);
}
})(function($, angular) {
<jsp:include page="integration/jqmWidgetPatches.js"/>
<jsp:include page="integration/deferAngularBootstrap.js"/>
<jsp:include page="integration/precompileSupport.js"/>
<jsp:include page="integration/scopeReconnect.js"/>
<jsp:include page="integration/scopeReentrance.js"/>
<jsp:include page="integration/compileIntegration.js"/>
<jsp:include page="integration/jqmAngularWidgets.js"/>
<jsp:include page="integration/ngmLocationProvider.js"/>
<jsp:include page="integration/ngRepeatPatch.js"/>
<jsp:include page="integration/ngOptionsPatch.js"/>
<jsp:include page="integration/option.js"/>
<jsp:include page="integration/li.js"/>
<jsp:include page="integration/ngSwitchPatch.js"/>
<jsp:include page="integration/ngIncludePatch.js"/>
<jsp:include page="integration/ngInputPatch.js"/>

<jsp:include page="utils/if.js"/>
<jsp:include page="utils/event.js"/>
<jsp:include page="utils/navigate.js"/>
<jsp:include page="utils/sharedController.js"/>
<jsp:include page="utils/waitDialog.js"/>
<jsp:include page="utils/paging.js"/>
});