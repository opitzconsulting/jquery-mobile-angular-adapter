/**
* jQuery Mobile angularJS adaper standalone v${project.version}
* http://github.com/tigbro/jquery-mobile-angular-adapter
*
* Copyright 2011, Tobias Bosch (OPITZ CONSULTING GmbH)
* Licensed under the MIT license.
*
* Includes jQuery JavaScript Library
* http://jquery.com/
*
* Copyright 2011, John Resig
* Dual licensed under the MIT or GPL Version 2 licenses.
* http://jquery.org/license
*
* Includes Sizzle.js
* http://sizzlejs.com/
* Copyright 2011, The Dojo Foundation
* Released under the MIT, BSD, and GPL Licenses.
*
* Includes jQuery Mobile Framework
* http://jquerymobile.com
*
* Copyright 2011 (c) jQuery Project
* Dual licensed under the MIT or GPL Version 2 licenses.
* http://jquery.org/license
*
* Includes  AngularJS
* @license AngularJS v1.0.0rc1
* (c) 2010-2012 AngularJS http://angularjs.org
* License: MIT
*/
<jsp:include page="lib/jquery.js"/>
<jsp:include page="mobileinit.js"/>
<jsp:include page="lib/jquery.mobile.js"/>
<jsp:include page="lib/angular.js"/>

(function(factory) {
if (typeof define === "function" && define.amd) {
define(["jquery", "angular", "jquery.mobile"], factory);
} else {
factory(window.jQuery, window.angular);
}
})(function($, angular) {
<jsp:include page="integration/jqmWidgetPatches.js"/>
<jsp:include page="integration/precompileSupport.js"/>
<jsp:include page="integration/scopeReconnect.js"/>
<jsp:include page="integration/scopeReentrance.js"/>
<jsp:include page="integration/compileIntegration.js"/>
<jsp:include page="integration/jqmAngularWidgets.js"/>
<jsp:include page="integration/ngmRouting.js"/>
<jsp:include page="integration/history.js"/>
<jsp:include page="integration/ngRepeatPatch.js"/>
<jsp:include page="integration/ngOptionsPatch.js"/>
<jsp:include page="integration/option.js"/>
<jsp:include page="integration/li.js"/>
<jsp:include page="integration/ngSwitchPatch.js"/>
<jsp:include page="integration/ngIncludePatch.js"/>
<jsp:include page="integration/ngInputPatch.js"/>

<jsp:include page="utils/if.js"/>
<jsp:include page="utils/event.js"/>
<jsp:include page="utils/sharedController.js"/>
<jsp:include page="utils/waitDialog.js"/>
<jsp:include page="utils/paging.js"/>
});