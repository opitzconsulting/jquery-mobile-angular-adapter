# PROJECT IS IN MAINTENANCE MODE. 
# NEW PROJECT [angular-jqm](https://github.com/opitzconsulting/angular-jqm)#
Newer versions of jqm will be integrated using angular-jqm and not this project.

Background: See the post in the angular mailing list: [https://groups.google.com/d/msg/angular/qG8YRwVaL_g/zgKAvaArmB0J](https://groups.google.com/d/msg/angular/qG8YRwVaL_g/zgKAvaArmB0J)


[![Build Status](https://travis-ci.org/opitzconsulting/jquery-mobile-angular-adapter.png)](https://travis-ci.org/opitzconsulting/jquery-mobile-angular-adapter)
#JQuery Mobile Angular Adapter

##Description

Integration between jquery mobile and angular.js. Needed as jquery mobile
enhances the pages with new elements and styles and so does angular. With this adapter,
all widgets in jquery mobile can be used directly in angular, without further modifications.
Furthermore, this adapter also provides special utilities useful for mobile applications.

If you are interested in how to build mobile web apps with this adapter, have a look at the german book
[Mobile Web-Apps mit JavaScript](http://www.opitz-consulting.com/go_javascriptbuch).


##Dependencies
- angular 1.0.6
- jquery 1.8+
- jquery mobile 1.3.1 Final

##Examples
- See the [wiki page](https://github.com/opitzconsulting/jquery-mobile-angular-adapter/wiki)
- [Todo mobile](http://jsfiddle.net/ocdemo/UM5Mr/): JsFiddle
- [Rent Your Legacy Car](https://github.com/mjswa/rylc-html5): A more complex example from the german book [Mobile Web-Apps mit JavaScript](http://www.opitz-consulting.com/go_javascriptbuch).


##Reporting Issues
- Issues can be reported at the Github project.
- Please provide a [JS-Fiddle](http://jsfiddle.net/ocdemo/4AEQK/) or a
  [Plunk](http://plnkr.co/edit/M4WTl9moMl2z8B9Mc0b2). A plunk is great
  if you have external jqm pages in your example.


##Usage
Note: The directive `ng-app` for the html element is required, as in all angular applications.


### Plain ###

Include this adapter _after_ angular and jquery mobile (see below).

    <html ng-app>
    <head>
        <title>MobileToys</title>
        <link rel="stylesheet" href="lib/jquery.mobile.css"/>
        <script src="lib/jquery.js"></script>
        <script src="lib/jquery.mobile.js"></script>
        <script src="lib/angular.js"></script>
        <script src="lib/jquery-mobile-angular-adapter.js"></script>
    </head>

### With requirejs 2.x ###

Create a `index.xhtml` file like the one below:

    <html ng-app>
    <head>
        <title>MobileToys</title>
        <link rel="stylesheet" href="lib/jquery.mobile.css"/>
        <script src="lib/requirejs.js" data-main="main.js"/>
    </head>
    <body>
       ... your jqm pages ...
    </body>
    </html>

And a `main.js` file with the following content:

    require.config({
      shim:{
        'angular':{ deps:['jquery'], exports:'angular'}
      }
    });
    function tryHoldReady() {
      if (!tryHoldReady.executed && window.jQuery) {
        window.jQuery.holdReady(true);
        tryHoldReady.executed = true;
      }
    }
    tryHoldReady();
    require.onResourceLoad = tryHoldReady;
    require([
      "jquery",
      "jquery-mobile-angular-adapter",
      ... // your controllers, angular modules, ...
    ], function (jquery) {
      jquery.holdReady(false);
    });


Notes:

- This assumes that all libs are in the root folder of your webapp. To put them into a subfolder like `lib` use the
  paths argument in the call to `require.config` (e.g. `paths: {angular: lib/angular}`, ...)
- The libraries jQuery, jQuery Mobile and the adapter are already AMD modules. Only angular is not, which is why
  we need a shim config for it.
- We simulate a later `load` event of the document by using `jQuery.holdReady`, by which we wait until all modules
  have been loaded. This is needed as the normal `load` event may occur before all modules have been loaded by requirejs.
  Note that this functionality was already included in requirejs 1.x, but no more in requirejs 2.x.
- Usage of manual bootstrap of angular does not work well with jquery-mobile, as jquery-mobile relies on the
  jQuery ready event to be fired at the right time.

## Versioning
The adapter always takes the major and minor version of jquery mobile, e.g. if you want to use jquery mobile 1.3.x, use the adapter version 1.3.x.
The patch version is assigend incrementally.

## Build
Directory structure

- compiled: The created versions of the adapter.
    - jquery-mobile-angular-adapter.js: The adapter.
    - jquery-mobile-angular-adapter-standalone.js: Version of the adapter that includes jquery,   angular and jquery mobile. If you want to do something during the initialization of jquery- mobile, use the following callback:
    `window.mobileinit = function() { ... }`

- src: The main files of uitest.js
- test/ui: The ui self tests for uitest.js
- test/unit: The unit tests of uitest.js

Install the dependencies: `npm install`.

Build it: `./node_modules/.bin/grunt`

Auto-Run tests when file change: `./node_modules/.bin/grunt dev`

##Navigation and routes

The adapter integrates angular routes with jquery mobile:

- We set `$locationProvider.html5Mode(true)`, `$locationProvider.hashPrefix('!')`
  and add the tag `<base href="{address of your html file}">` to your header.
    * See the [angular docs](http://docs.angularjs.org/guide/dev_guide.services.$location) on details about this!
    * By this, we are compatible to the default jquery mobile url layout,
  e.g. links like `<a href="somePage.html">` are possible and do not reload the whole page but use AJAX and result in modern browsers in a url of `/somePage.html` (via history API).
    * The `<base>` tag is created by jquery mobile. For routes, this makes all routes relative
  to the current page. E.g. if your page is under `/test/index.html`, and you want a route to
  `/test/somePage.html` then your route would be `$routeProvider.when(`/somePage.html`).
- Default routing: If no route is defined, the default jquery mobile url handling applies:
    * Navigation to a hash shows the page whose id is the same as the hash, e.g.
    `<a href="#somePage">`.
    * Navigation to a normal page loads that page using ajax and
    then navigates to that page, e.g. `<a href="somePage.html">`
- You can set the special property `jqmOptions` on routes, e.g.

        $routeProvider.when('/somePage', {
            templateUrl:'someTemplate.html',
            jqmOptions: { transition: 'flip' }
        });

    Those properties are directly passed to `$.mobile.changePage`. For a documentation of the available options
    have a look at the jquery mobile documentation.
- You can set the special property `onActivate` in routes. If this is set,
  it will be evaluated in the scope of the page to which the route navigates to,
  before the `pagebeforeshow` event.

  This expression can also use the properties from `$routeParams` and `$route.current.locals`, which are calculates by the `resolve` entry
  of the route. E.g.

        $routeProvider.when('/somePage/:name', {
            templateUrl:'someTemplate.html',
            onActivate: 'someFn(someParam, name)',
            resolve: {someParam: function() { return 'hello'; }}
        });

        function SomePageController($scope) {
           $scope.someFn = function(someParam, name) {
              expect(someParam).toBe('hello');
           }
        }

- relative links in pages are treated relative to the templateUrl of the route,
  not the route path. E.g. given the mapping

        $routeProvider.when('/someFolder/page1.html', { templateUrl:'#page1' });
        $routeProvider.when('/someFolder/page2.html', { templateUrl:'/someTemplateFolder/page2.html' });

  Page1 is embedded page, and therefore, all links within that page are relative to the initial url of the app. Page2 is an external page and all relative links in that page are relative to the folder `/someTemplateFolder`.

- Please also look at the extensions to the `$location` service for controlling history and changing route params for just one route call.

Default routing: `basePath+$location.url()`

* E.g. for a page `/somePath/somePage.html` and `location.url()=='/page1'` this results in `/somePath/page1`.
* To be compatible to plain jquery mobile the adapter creates a default routing for all urls that are not
  mapped by other routes.
* If a document contains the link `<a href="somePage">` and the user clicks on that link, angular updates `$location.url`
  to `/somePage`. However, in plain jquery mobile, this should load the page `/somePath/somePage`. This is why
  we append the `basePath` to the `$location.url()`.


Notes:

- Using `$.mobile.changePage` directly is not recommended. It still works, but it will no more update the browser location.href.
- If you don't want `$locationProvider.html5Mode` you can disable it. 
  By this, you get hash urls like `/index.html#!/somePath...` back. E.g.
          
           module.config(function($locationProvider) { $locationProvider.html5Mode(false) }));

- Internally, we use jquery mobile to load the pages and do the transition between the pages.
  By this, we automatically support the prefetching and caching functionality for pages from jquery mobile (see their docs for details).
  E.g. use `<a href="prefetchThisPage.html" data-prefetch> ... </a>` in a parent page to prefetch a child page.
- If you want to start an app directly on a subpage, use the following url:
  * For an external page that should be loaded using ajax: `index.html#!/somePage.html`
  * For an internal page that is also contained in the `index.html`: `index.html#/!index.html#someOtherPage` (yes, this url contains
    2 hashes). If you are sure that all browsers that you use support the new history API, you can also use the url
    `index.html#someOtherPage` to start at an internal page.


Restrictions:

- controllers on routes are not supported. Please use `ng-controller` within the page to be loaded for this
  or the `onActivate` function on routes.
  The reasoning behind this is that some pages of jquery mobile are local pages in the same document as the main page
  and others are loaded using ajax. However, the pages in the same document are compiled at the same time the main page is compiled.
  Furthermore, by supporting the page cache of jquery mobile assigning a controller would also not be possible.
  To pass data via routes just let your controllers examine the current route using the `$route` and `$routeParams` service.
- Routes with a `templateUrl` must point to a full jquery mobile page. Loading parts of jquery mobile pages is not supported.
- The `ngView` directive cannot be used as jqm pages need to be inserted at a special place in the DOM.
  However, the adapter takes care of the normal `ngView` handling and inserts the pages at the right place.
- There needs to be an initial page in the main document of the application. I.e. a `<div data-role="page">` within
  that html file that also includes angular and jqm. All other pages can then be included using routes with
  a `templateUrl` property.


##Scopes
Every page of jquery mobile gets a separate scope. The `$digest` of the global scope only evaluates the currently active page,
so there is no performance interaction between pages.

For communicating between the pages use the `ngm-shared-controller` directive (see below).

##Directives, Filters and Services

### Directive `ngm-shared-controller`

Syntax: `<div ngm-shared-controller="name1:Controller1,name2:Controller2, ...">`

Mobile pages are small, so often a usecase is split up into multiple pages.
To share common behaviour and state between those pages, this directive allows shared controllers.

The directive will create an own scope for every given controllers and store it
in the variables as `name1`, `name2`, ....
If the controller is used on more than one page, the instance of the controller is shared.

Note that the shared controller have the full scope functionality, e.g. for dependecy injection
or using `$watch`.

### Event-Directives of jQuery Mobile

The following event directives are supported (see [http://jquerymobile.com/demos/1.2.0/docs/api/events.html](http://jquerymobile.com/demos/1.2.0/docs/api/events.html)):

- `ngm-tap`,`taphold`,
- `ngm-swipe`,`ngm-swiperight`,`ngm-swipeleft`,
- `ngm-vmouseover`,`ngm-vmouseout`,`ngm-vmousedown`,`ngm-vmousemove`,`ngm-vmouseup`,`ngm-vclick`,`ngm-vmousecancel`,
- `ngm-orientationchange`,
- `ngm-scrollstart`,`ngm-scrollend`,
- `ngm-pagebeforeshow`,`ngm-pagebeforehide`,`ngm-pageshow`,`ngm-pagehide`


Usage: E.g. `<a href="#" ngm-swipeleft="myFn()">`


### Directive ngm-if
The directive `@ngm-if` allows to add/remove an element to/from the dom, depending on an expression.
This is especially useful at places where we cannot insert an `ng-switch` into the dom. E.g. jquery mobile
does not allow elements between an `ul` and an `li` element.

Usage: E.g. `<div ngm-if="myFlag">asdfasdf</div>`

### Service `$history`

Methods and Properties:

* `$history.go(relativeIndex)`: This will directly call `window.history.go(relativeIndex)`.
* `$history.goBack()`: Calls `$history.go(-1)`.
* `$history.urlStack`: This contains the list of visited urls
* `$history.activeIndex`: This defines the currently active index in the `urlStack`
* `$history.removePastEntries(number)`: This will remove the given number of history entries
  before the current entry. The current entry stays current. Used when leaving dialogs, or for `$location.back()`. Note: This does not fire any `$locationChange*` events.


### Service `$location` (extensions)

- `$location.routeOverride(someOverride)`: By this, you can override route properties only
  for the next routing. This is useful e.g. for passing special parameters to the `onActivate` expression. The following
  properties of routes can be overridden:

     * `jqmOptions`: Options to give to `$.mobile.changePage` of jquery mobile (e.g. `transition`, ...)
     * `locals`: the resolved functions from the `resolve` hash in a route.
     * `onActivate`: the expression to evaluate on the target page with the `locals`.

     E.g.

         $location.routeOverride({
           locals: {someKey: 'someValue'},
           jqmOptions: {transition: 'pop'}
         });
         $location.path('/someRoutePath');

         function SomePageController($scope) {
            $scope.someActivateFn = function(someKey) {
               expect(someKey).toBe(someValue);
            }
         }

- `$location.backMode()`: This will try to go back in history to the url specified by `$location`. E.g. if the navigation path
  to the current page is `page1->page2->page3` and we then call `$location.path('page1'); $location.backMode()` this will
  go two steps back in history.
  Note that this is in analogy to the already existing angular method `$location.replace`.


### Service $waitDialog
The service `$waitDialog` allows the access to the jquery mobile wait dialog. It provides the following functions:
- `show(msg, callback)`: Opens the wait dialog and shows the given message (if existing).
    If the user clicks on the wait dialog the given callback is called.
    This can be called even if the dialog is currently showing. It will the change the message
    and revert back to the last message when the hide function is called.
- `hide()`: Restores the dialog state before the show function was called.
- `waitFor(promise, msg)`: Shows the dialog as long as the given promise runs. Shows the given message if defined.
- `waitForWithCancel(promise, cancelData, msg)`: Same as above, but rejects the promise with the given cancelData
   when the user clicks on the wait dialog.

Default messages are:
- `$.mobile.loader.prototype.options.textWithCancel`: for waitForWithCancel. This is a new property.
- `$.mobile.loader.prototype.options.text`: for all other cases, see the jquery mobile docs.


### Filter `paged`: Paging for lists
Lists can be paged in the sense that more entries can be additionally loaded. By "loading" we mean the
display of a sublist of a list that is already fully loaded in JavaScript. This is useful, as the main performance
problems result from DOM operations, which can be reduced with this paging mechanism.

To implement this paging mechanism, the angular filter `paged` was created.
For displaying a page within a list, simply use:

    list | paged:'pagerId':12

This returns the subarray of the given array with the currently loaded pages.

Parameters:

1. The first parameter is required and must be unique for every usage of the `paged` filter. It is the property name in the scope
which stores the state of pagination for this filter usage, and also contains the function `loadMore` and `hasMore` (see below).
2. If the second parameter is a number, it is interpreted as the pageSize. If this parameter is omitted, the default page size is used.
This is by default 10, and can be configured using

    module(["ng"]).value('defaultListPageSize', 123);

For filtering and sorting the paged array, you can use filter chaining with the angular filters `filter` and `orderBy`, e.g.

    list | filter:{name:'someName'} | orderBy:'name' | paged:'pagerId'

To show a button that loads the next page of the list, use the following syntax:

    <a href="#" ngm-if="pagerId.hasMore" ngm-vclick="pagerId.loadMore()">Load More</a>

- `pagerId` is the id used in the `paged` filter.
- `pagerId.hasMore` returns a boolean indicating if all pages of the list have been loaded.
- `pagerId.loadMore()` loads the next page into the list.

The following example shows an example for a paged list for the data in the variable `myList`:


    <ul data-role="listview">
        <li ng-repeat="item in list | paged:'pager1'">{{item}}</li>
        <li ngm-if="pager1.hasMore">
            <a href="#" ngm-vclick="pager1.loadMore()">Load more</a>
         </li>
    </ul>

Note: `pagerId.cache` stores the last result that was returns for a `list | paged:'pagerId'` expression. This can be
  used to check whether the paged list is empty, .. without refiltering the list.

## Notes on the integration of some jqm widgets

### widget `collapsible`

- The attribute `data-collapsed` has bidirectional data binding, e.g.

        <div data-role="collapsible" data-collapsed="someProperty">...</div>

### widget `checkboxradio`

- using `ng-repeat` with a checkbox or radio button without a wrapper element can be done like the following:

        <label ng-repeat="l in [1,2]">
            {{l}}
            <input type="checkbox">
        </label>

### widget `popup`

- the jqm adapter does not change the url when a popup is opened/closed. This is due to the fact that the jqm adatper assumes that urls represent routings for pages, and not parts of pages.

- The new attribute `data-opened` has bidirectional data binding for opening/closing the popup, e.g.

        <div data-role="popup" data-opened="someProperty">...</div>

### widget `panel`

- the jqm adapter does not change the url when a panel is opened/closed. This is due to the fact that the jqm adatper assumes that urls represent routings for pages, and not parts of pages.

- The new attribute `data-opened` has bidirectional data binding for opening/closing the panel, e.g.

        <div data-role="panel" data-opened="someProperty">...</div>


### widget `slider` in a `<select>`

- jQuery Mobile does not yet support refreshing a `slider` widget when child `<option>` elements have changed. As a consequence, using `<select data-role="slider">` with `ng-options` only uses
the initial state of the `ng-options` collection. Chaning the `ng-options` collection will not
update the widget.
- `ng-repeat` is not supported on a `<select data-role="slider">` yet, as jqm 
  creates a sibling element to the select, instead of a wrapper (like in all other cases).

##Integrating custom jquery mobile plugins with angular

All integration work is done using the `jqmNgWidget` provider. 

This will automatically create angular directives
for all jqm widgets that are contained in `$.mobile` and use the jqm widget factory (e.g. $.mobile.dialog). If you want to specify a custom handler for a jqm directive,
use the following pattern:

    ng.config(["jqmNgWidgetProvider", function(jqmNgWidgetProvider) {
        jqmNgWidgetProvider.widget("somePlugin", ["jqmNgWidget", function(jqmNgWidget) {
            return {
                link: function(widgetName, scope, iElement, iAttrs, ngModelCtrl) {
                    jqmNgWidet.createWidget(widgetName, iElement, iAttrs);
                    // Do additional binding work...
                }
            }
        }]);
    }]);

See src/main/webapp/widgetAdapters.js for more examples.

##Integration strategy

Jquery mobile has two kinds of markup:

- Stateless markup/widgets: Markup, that does not hold state or event listeners, and just adds css classes to the dom.
  E.g. `$.fn.buttonMarkup`, which is created using `<a href="..." data-role="button">`
- Stateful markup/widgets: Markup that holds state (e.g. event listeners, ...). This markup uses the jquery ui widget factory.
  E.g. `$.mobile.button`, which is created using `<button>`.

Integration strategy:

1. We have a `precompile` phase: This is called before the angular compiles does it's work, i.e. before
   `$compile` is called, and before `directive.template` and `directive.templateUrl` is evaluated.
   Here, we trigger the jqm `create` and `pagecreate` event.
   Before this, we instrument all stateful jqm widgets (see above), so they do not
   really create the jqm widget, but only add the attribute `jqm-create=<widgetName>` and `jqm-link=<widgetname>`
   to the corresponding element. By this, all stateless  markup can be used by angular for stamping (e.g. in ng-repeat),
   without calling a jqm method again, so we are fast.
   Furthermore, we have special handlers in the precompile phase for those jqm widgets that wrap themselves into new elements
   (checkboxradio, slider, button, selectmenu, search input), as the angular compiler does not like this.
   Finally, we also mark all jqm pages with the `jqm-page` attribute. This is needed as jqm pages are
   represented as `data-role=page` in the dom and angular does not allow to create directives that only match
   pages but not other jqm widgets.

2. We have the directive `ngmPage`:
   This creates an own scope for every page. By this, we are able to disconnect the scope of the pages that
   are not visible right now. This is important for optimizing performance.
   This creates the jqm pages by calling `element.page()` in the pre link phase, however without the
   `pagecreate` event. By this, we only create the page instance, but do not modify the dom
   (as this is not allowed in the pre link phase). Furthermore, the `page` jqm widget instance is already
    available for the other widgets, which are created in the post link phase.

3. We have the directive `ngmCreate`:
   This will create the jqm widgets in the post link phase. For widgets that wrap themselves into new elements this
   needs to be called for the wrapper, that was already created in the precompile phase. This is important as
   the jqm widgets do more DOM transformations during creations that the angular compiler does not like
   (e.g. the jqm widget `<input type="checkbox>"` enhances the sibling `<label>` element and wraps that element).
   By calling the widget during the post link phase of the wrapper element those DOM modifications are ok with angular.

4. We have the directive `ngmLink`:
   Here we listen for changes in the model and refresh the jqm widgets when needed and vice versa.
   For elements that wrap themselves into new elements this will be called on the original element
   (e.g. the `<input>` for `<input type="checkbox">` elements), in contrast to the `ngmCreate` directive.

4. All together: This minimizes the number DOM traversals and DOM changes

   * We use angular's stamping for stateless widget markup, i.e. we call the jqm functions only once,
     and let angular do the rest.
   * We do not use the jqm `create` event for refreshing widgets,
     but angular's directives. By this, we prevent unneeded executions of jquery selectors.
   * We reuse the selectors in jqm for detecting which elements should be enhanced with which jqm widgets.

Ohter possibilities not chosen:

- Calling the jqm "create"-Event whenever the DOM changes (see the jqm docs). However,
  this is very slow, as this would lead to many DOM traversals by the different jqm listeners
  for the "create"-Event.

Integration of jqm routing and angular routing:
- We chose to use the angular routing, as it is very flexible and programmable, and it is easier to integrate jqm
  routing with angular routing and the other way around.
