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

<jsp:include page="autorefresh/main.jsp"/>

<jsp:include page="integration/scopeReconnect.js"/>
<jsp:include page="integration/angularInput.js"/>
<jsp:include page="integration/angularRepeat.js"/>
<jsp:include page="integration/angularNgModel.js"/>
<jsp:include page="integration/pageCompile.js"/>

<jsp:include page="utils/event.js"/>
<jsp:include page="utils/if.js"/>
<jsp:include page="utils/navigate.js"/>
<jsp:include page="utils/sharedController.js"/>
<jsp:include page="utils/waitDialog.js"/>
<jsp:include page="utils/paging.js"/>
<jsp:include page="utils/fadein.js"/>