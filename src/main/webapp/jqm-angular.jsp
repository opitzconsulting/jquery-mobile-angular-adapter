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
<jsp:include page="integration/pageCompile.js"/>
<jsp:include page="integration/jqmAngularWidgets.js"/>
<jsp:include page="integration/deactivateNgLocationChange.js"/>
<jsp:include page="integration/angularNgRepeat.js"/>
<jsp:include page="integration/angularNgOptions.js"/>
<jsp:include page="integration/angularOption.js"/>
<jsp:include page="integration/angularNgSwitch.js"/>
<jsp:include page="integration/angularNgInclude.js"/>
<jsp:include page="integration/angularInput.js"/>

<jsp:include page="utils/if.js"/>

<%--

<jsp:include page="utils/event.js"/>
<jsp:include page="utils/navigate.js"/>
<jsp:include page="utils/sharedController.js"/>
<jsp:include page="utils/waitDialog.js"/>
<jsp:include page="utils/paging.js"/>
<jsp:include page="utils/fadein.js"/>

--%>