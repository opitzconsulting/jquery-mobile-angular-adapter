/**
* jQuery Mobile angularJS adaper v${project.version}
* http://github.com/tigbro/jquery-mobile-angular-adapter
*
* Copyright 2011, Tobias Bosch (OPITZ CONSULTING GmbH)
* Licensed under the MIT license.
*/
<jsp:include page="integration/jqmDestroyFix.js"/>
<jsp:include page="integration/scopeReconnect.js"/>
<jsp:include page="integration/scopeReentrance.js"/>
<jsp:include page="integration/compileIntegration.js"/>
<jsp:include page="integration/jqmAngularWidgets.js"/>
<jsp:include page="integration/deactivateNgLocationChange.js"/>
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
