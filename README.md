JQuery Mobile Angular Adapter
=====================

Description
-------------

Integration between jquery mobile and angular.js. Needed as jquery mobile
enhances the pages with new elements and styles and so does angular. Another reason is
that jquery mobile only enhances pages when they are navigated to, and not
all at once, as angular does in autoinit mode.

Automatically refreshs the jquery mobile widgets when the corresponding
values in angular change.
E.g. the select tag is enhanced by jquery mobile,
and if someone changes it's value programmatically, the refresh-function needs to be called.

Fixes the jquery mobile widgets so that they are correctly removed form the dom,
when angular removes them (e.g. in a `ng-repeat`).

Provides special enhancements useful for mobile applications.

Dependencies
----------------
- angular 1.0
- jquery 1.7.1
- jquery mobile 1.1.0

Sample
------------
- Js fiddle [Todo mobile](http://jsfiddle.net/tigbro/Du2DY/).
- Single source app for jquery-mobile and sencha touch: [https://github.com/tigbro/todo-mobile](https://github.com/tigbro/todo-mobile)

Limitations
------------
This deactivates angular's feature to change urls via the `$browser` or `$location` services.
This was needed as angular's url handling is incompatibly with jquery mobile and leads to
unwanted navigations.

Usage
---------

Include this adapter _after_ angular and jquery mobile (see below).

ATTENTION: The directive `ng-app` for the html element is required, as in all angular applications.


    <html xmlns:ng="http://angularjs.org" xmlns:ngm="http://jqm-angularjs.org" ng-app>
    <head>
        <title>MobileToys</title>
        <link rel="stylesheet" href="lib/jquery.mobile-1.1.css"/>
        <script src="lib/jquery-1.7.1.js"></script>
        <script src="lib/jquery.mobile-1.1.0.js"></script>
        <script src="lib/angular-1.1.0.js"></script>
        <script src="lib/jquery-mobile-angular-adapter.js"></script>
    </head>


Directory layout
-------------------
This follows the usual maven directory layout:

- src/main/webapp: The production code
- src/test/webapp: The test code
- compiled: The result of the javascript compilation
- compiled/min: Contains the minified files.


Build
--------------------------
The build is done using maven and node js.

- `mvn clean package`: This will create a new version of the adapter and put it into `/compiled`.

The build also creates a standalone library including jquery, jquery-mobile and angular.
If you want to do something during the initialization of jquery-mobile, use the following callback:
`window.mobileinit = function() { ... }`

Running the tests
-------------------

- `mvn clean integration-test -Ptest`: This will do a build and execute the tests using js-test-driver.
  The browser that is used can be specified in the pom.xml.
- `mvn clean package jetty:run`: This will start a webserver under `localhost:8080/jqmng`.
  The unit-tests can be run via the url `localhost:8080/jqmng/UnitSpecRunner.html`
  The ui-tests can be run via the url `localhost:8080/jqmng/UiSpecRunner.html`


Scopes
-----------
Every page of jquery mobile gets a separate scope. The `$digest` of the global scope only evaluates the currently active page,
so there is no performance interaction between pages.

For communicating between the pages use the `ngm-shared-controller` directive (see below).

Widgets, Directives and Services
-----------

### Directive ngm-shared-controller="name1:Controller1,name2:Controller2, ..."
Mobile pages are small, so often a usecase is split up into multiple pages.
To share common behaviour and state between those pages, this directive allows shared controllers.

The directive will create an own scope for every given controllers and store it
in the variables as `name1`, `name2`, ....
If the controller is used on more than one page, the instance of the controller is shared.

Note that the shared controller have the full scope functionality, e.g. for dependecy injection
or using `$watch`.

### Directive ngm-event="{event1:'handler1',event2:'handler2',...}"
General event handler that integrates with jquery events, and also with jquery mobile events.
The value of the attribute is json and defines the event - handler mapping.

Usage: E.g. `<a href="#" ngm-event="{swiperight:'myFn()'}">`

### Event-Directives `ngm-click`, `ngm-tap`,`ngm-taphold`,`ngm-swipe`,`ngm-swiperight`,`ngm-swipeleft`,`ngm-pagebeforeshow`,`ngm-pagebeforehide`,`ngm-pageshow`,`ngm-pagehide`
For the mentioned events there are special directives to simplify the markup. Each of them is equivalent to
using the `ngm-event` directive with the corresponding event name.

Usage: E.g. `<a href="#" ngm-swipeleft="myFn()">`

### Directive ngm-fadein
For smooth fadings between `ngm-if` changes, there is also the directive `ngm-fadein`.
This specifies that the display of the coresponding element
should be shown via a transition lasting a defined amount of milliseconds (the value of the attribute).

Usage: E.g. `<div ngm-fadein="700">asdf</div>`


### Attribute Widget @ngm-if
The attribute widget `@ngm-if` allows to add/remove an element to/from the dom, depending on an expression.
This is especially useful at places where we cannot insert an `ng-switch` into the dom. E.g. jquery mobile
does not allow elements between an `ul` and an `li` element.

Usage: E.g. `<div ngm-if="myFlag">asdfasdf</div>`

### Service $navigate('[transition]:pageId'[,activateFn][,activateFnParam1, ...])
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


### Filter `navigate`: Navigation in Expressions
Every expression can now use the `$navigate` as a filter to define the navigation outside of the controlers
in the html pages. By this, the controllers stay independent of the navigation process and is reusable.

Syntax: `test | $activate: 'outcome1:target' : 'outcome2:target' : ...`

Example: `<button ngm-click="doSomething() | navigate : 'success:successPage' : 'failure:failurePage'">`

This navigates to that target whose outcome equals
to the test. The special outcomes `success` is applied for any value for `test` that is not `false` (e.g. also `undefined`),
and the outcome `failure` is used for the value `false` of test.
This also supports promises. In that case, the navivation is done with the first argument of
the `done` / `fail` callback of the promise. Also, the `success` outcome is mapped to the `done` callback
and the `failure` outcome to the `fail` callback.


### Filter `paged`: Paging for lists
Lists can be paged in the sense that more entries can be additionally loaded. By "loading" we mean the
display of a sublist of a list that is already fully loaded in JavaScript. This is useful, as the main performance
problems result from DOM operations, which can be reduced with this paging mechanism.

To implement this paging mechanism, the angular filter `paged` was created.
For displaying a page within a list, simply use:

    list | paged:{pageSize: 12, filter: someFilter, orderBy: someOrder})

This returns the subarray of the given filtered and ordered array with the currently loaded pages.
For the `filter` and `orderBy` parameter see the builtin angular filters `filter` and `orderBy`.
The parameters `pageSize`, `filter` and `orderBy` are optional and can be combined in any order.
If the pageSize is omitted, the default page size is used. This is by default 10, and can be configured using

    module(["ng"]).value('defaultListPageSize', 123);

To show a button that loads the next page of the list, use the following syntax:

    <a href="#" ngm-if="list | paged:'hasMore'" ngm-click="list | paged:'loadMore'">Load More</a>

The filter `paged|'hasMore'` returns a boolean indicating if all pages of the list have been loaded.
The filter `paged|'loadMore'` loads the next page into the list.

Note that this will cache the result of the paging, filtering and sorting until something changes.
By this, paging should work fine also for large lists.

The following example shows an example for a paged list for the data in the variable `myList`:


    <ul data-role="listview">
        <li ng-repeat="item in list | paged:{pageSize:10}">{{item}}</li>
        <li ngm-if="list | paged:'hasMore'">
            <a href="#" ngm-click="list | paged:'loadMore'">Load more</a>
         </li>
    </ul>




