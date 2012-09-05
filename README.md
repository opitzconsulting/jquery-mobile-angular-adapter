JQuery Mobile Angular Adapter
=====================

Description
-------------

Integration between jquery mobile and angular.js. Needed as jquery mobile
enhances the pages with new elements and styles and so does angular. With this adapter,
all widgets in jquery mobile can be used directly in angular, without further modifications.
Furthermore, this adapter also provides special utilities useful for mobile applications.

If you are interested in how to build mobile web apps with this adapter, have a look at the german book
[Mobile Web-Apps mit JavaScript](http://www.opitz-consulting.com/go_javascriptbuch).


Dependencies
----------------
- angular 1.0.1
- jquery 1.7.1
- jquery mobile 1.1.1 Final

Examples
------------
- [Todo mobile](http://jsfiddle.net/tigbro/Du2DY/): JsFiddle
- [Todo mobile](https://github.com/tigbro/todo-mobile): Single source app for jquery-mobile and sencha touch:
- [Rent Your Legacy Car](https://github.com/mjswa/rylc-html5): A more complex example from the german book [Mobile Web-Apps mit JavaScript](http://www.opitz-consulting.com/go_javascriptbuch).


Reporting Issues
-------------
- Issues can be reported at the Github project.
- Please provide a jsfiddle, using [this template](http://jsfiddle.net/tigbro/ZHKBA/).


Usage
---------
Note: The directive `ng-app` for the html element is required, as in all angular applications.


### Plain ###

Include this adapter _after_ angular and jquery mobile (see below).

    <html ng-app>
    <head>
        <title>MobileToys</title>
        <link rel="stylesheet" href="lib/jquery.mobile-1.1.css"/>
        <script src="lib/jquery-1.7.1.js"></script>
        <script src="lib/jquery.mobile-1.1.0.js"></script>
        <script src="lib/angular-1.1.0.js"></script>
        <script src="lib/jquery-mobile-angular-adapter.js"></script>
    </head>

### With requirejs 2.x ###

Create a `index.xhtml` file like the one below:

    <html ng-app>
    <head>
        <title>MobileToys</title>
        <link rel="stylesheet" href="lib/jquery.mobile-1.1.css"/>
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

Directory layout
-------------------
This project follows the usual maven directory layout:

- src/main/webapp: The production code
- src/test/webapp: The test code
- compiled: The result of the javascript compilation
- compiled/min: Contains the minified files.


Build
--------------------------
The build is done using maven and node js.

- `mvn clean package`: This will create a new version of the adapter and put it into `/compiled`.
- `mvn clean package -Ptest -Dbrowser=<path to your browser>`: As above, but will also execute the unit and ui tests.

Results of the build:

- `compiled/jquery-mobile-angular-adapter-<version>.js`: The adapter in one file, without dependencies.
- `compiled/jquery-mobile-angular-adapter-standalone-<version>.js`: The adapter in one file including jquery, jquery-mobile and angular.
   If you want to do something during the initialization of jquery-mobile, use the following callback:
  `window.mobileinit = function() { ... }`

Running the tests
-------------------

- `mvn clean integration-test -Ptest`: This will do a build and execute the tests using js-test-driver.
  The browser that is used can be specified in the pom.xml.
- `mvn clean package jetty:run`: This will start a webserver under `localhost:8080/jqmng`.
  The unit-tests can be run via the url `localhost:8080/jqmng/UnitSpecRunner.html`
  The ui-tests can be run via the url `localhost:8080/jqmng/UiSpecRunner.html`


Jqm hashchange handling, `$location` service and routes
---------------------

By default, jqm listens for all hash changes and shows the the page with the id of the current location hash.
Also, if you navigate programmatically to a new page (e.g. by the `$navigate` service), the hash is also adjusted.
This mode of url handling is called jqm compatibility mode in the adapter. It is enabled by default.
Please note that this is different to both, the hashbang and the html5 mode of angular. For this to work,
the adapter replaces the default `$location` service of angular with new one that directly maps `window.location`
to `$location`. This mode is not useful together with angular routes.


However, you can also turn the jqm compatibility mode off. Then, jquery mobile will neither listen to hash changes
nor will it update the hash when pages are changed programmatically (e.g. by the `$navigate` service). This is useful
if you want to manually control the urls in angular. For this, there is the function `jqmCompatMode(bool)` in the
`$locationProvider`. Here is an example for turning jqm compatibility mode off:

    module.config(function($locationProvider) { $locationProvider.jqmCompatMode(false); });

_Please note_: In this mode, routes from angular still cannot be used. Routes work together with the `ng-view` directive.
And that directive will inject a loaded page into it's body. However, jquery mobile requires all pages to be loaded directly
under the body element of the page. So, the problem with using routes is now how `ng-view` works. The feature request #59
addresses this issue by requesting new directives.

A replacement for using routes to load external pages is using `$navigate` with an external url, e.g. `$navigate('somePage.html')`.
This will load `somePage.html` using ajax and show it afterwards using jquery mobile navigation. Note that the caching
can be configured, see here: [http://jquerymobile.com/demos/1.1.1/docs/pages/page-cache.html](http://jquerymobile.com/demos/1.1.1/docs/pages/page-cache.html). Note that this approach also allows to specify navigate properties, like the transition animation to use, ...
See `$navigate` for details.


Scopes
-----------
Every page of jquery mobile gets a separate scope. The `$digest` of the global scope only evaluates the currently active page,
so there is no performance interaction between pages.

For communicating between the pages use the `ngm-shared-controller` directive (see below).

Directives, Filters and Services
-----------

### Directive `ngm-shared-controller`

Syntax: `<div ngm-shared-controller="name1:Controller1,name2:Controller2, ...">`

Mobile pages are small, so often a usecase is split up into multiple pages.
To share common behaviour and state between those pages, this directive allows shared controllers.

The directive will create an own scope for every given controllers and store it
in the variables as `name1`, `name2`, ....
If the controller is used on more than one page, the instance of the controller is shared.

Note that the shared controller have the full scope functionality, e.g. for dependecy injection
or using `$watch`.

### Event-Directives

The following event directives are supported:

- `ngm-click`
- `ngm-tap`
- `ngm-taphold`
- `ngm-swipe`
- `ngm-swiperight`
- `ngm-swipeleft`
- `ngm-pagebeforeshow`
- `ngm-pagebeforehide`
- `ngm-pageshow`
- `ngm-pagehide`


For the mentioned events there are special directives to simplify the markup. Each of them is equivalent to
using the `ngm-event` directive with the corresponding event name.

Usage: E.g. `<a href="#" ngm-swipeleft="myFn()">`


### Directive ngm-if
The directive `@ngm-if` allows to add/remove an element to/from the dom, depending on an expression.
This is especially useful at places where we cannot insert an `ng-switch` into the dom. E.g. jquery mobile
does not allow elements between an `ul` and an `li` element.

Usage: E.g. `<div ngm-if="myFlag">asdfasdf</div>`

### Service `$navigate`

Syntax: `$navigate('[transition]:pageId'[,activateFn][,activateFnParam1, ...])`

Service to change the given page.
- The pageId is the pageId of `$.mobile.changePage`, e.g. `#homepage` for navigation within the current page
  or `somePage.html` for loading another page.
- If the transition has the special value `back` than the browser will go back in history to
  the defined page, e.g. `back:#hompage`.
- The transition may be omitted, e.g. `$navigate('#homepage')`.
- To go back one page use `$navigate('back')`.
- If the `activateFn` function is given, it will be called after the navigation on the target page with
  `activateFnParam1, ...` as arguments. The invocation is done before the `pagebeforeshow` event on the target page.
- If you want to pass special options to the jquery mobile `changePage` function:
  Pass in an object to the `$navigate` function instead of a pageId. This object will be forwarded
  to jqm `changePage`. To define the new pageId, this object needs the additional property `target`.


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
- `$.mobile.loadingMessageWithCancel`: for waitForWithCancel
- `$.mobile.loadingMessage`: for all other cases


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

    <a href="#" ngm-if="pagerId.hasMore" ngm-click="pagerId.loadMore()">Load More</a>

- `pagerId` is the id used in the `paged` filter.
- `pagerId.hasMore` returns a boolean indicating if all pages of the list have been loaded.
- `pagerId.loadMore()` loads the next page into the list.

The following example shows an example for a paged list for the data in the variable `myList`:


    <ul data-role="listview">
        <li ng-repeat="item in list | paged:'pager1'">{{item}}</li>
        <li ngm-if="pager1.hasMore">
            <a href="#" ngm-click="pager1.loadMore()">Load more</a>
         </li>
    </ul>

Note: `pagerId.cache` stores the last result that was returns for a `list | paged:'pagerId'` expression. This can be
  used to check whether the paged list is empty, .. without refiltering the list.

Notes on the integration of some jqm widgets
----------------

### widget collapsible

- The attribute `data-collapsed` has bidirectional data binding, e.g.

    <div data-role="collapsible" data-collapsed="someProperty">...</div>



Integration strategy
---------------------

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

