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
when angular removes them (e.g. in a `ng:repeat`).

Provides special enhancements useful for mobile applications.

Finally provies a special version of jquery mobile that contains some bugfixes.

Dependencies
----------------
- angular 0.9.19
- jquery 1.6.2 (Please note: Newer versions of jquery do not work, as angular 0.9.19
  does not work with them...)
- jquery mobile 1.0rc2

Bugfixed version of jquery mobile
---------------------------------
This also provides a special version of jquery-mobile that contains the following:

- address bar will always be visible on android. This is not yet really solved
  by jquery mobile as without this, the address bar shows up again from time to time.
  (see jquery mobile #1673)
- Bugfix for highlighting problem on `data-role="listview"` lists toghether with
  jquery 1.6.2. Those lists will not remove the highlighting when the mouse hovers
  over them. The underlying issue is an issue of jquery (see jquery #10192) and already
  fixed in jquery 1.7. However, the adapter currently only runs with angular 0.9.19,
  which does not work with jquery 1.7.

Sample
------------
- Js fiddle [Todo mobile](http://jsfiddle.net/tigbro/Du2DY/).
- Single source app for jquery-mobile and sencha touch: [https://github.com/tigbro/todo-mobile](https://github.com/tigbro/todo-mobile)
- Sample Github project with requirejs [phonecat-mobile](https://github.com/tigbro/phonecat-mobile).


Limitations
------------
This deactivates angular's feature to change urls via the `$browser` or `$location` services.
This was needed as angular's url handling is incompatibly with jquery mobile and leads to
unwanted navigations.


Usage
---------

Include this adapter _after_ angular and jquery mobile (see below).

ATTENTION: Do NOT use the `autobind` mode of angular!


    <html xmlns:ng="http://angularjs.org" xmlns:ngm="http://jqm-angularjs.org">
    <head>
        <title>MobileToys</title>
        <link rel="stylesheet" href="lib/jquery.mobile-1.0-oc1.css"/>
        <script src="lib/jquery-1.6.1.js"></script>
        <script src="lib/jquery.mobile-1.0-oc1.js"></script>
        <script src="lib/angular-0.9.15.js"></script>
        <script src="lib/jquery-mobile-angular-adapter.js"></script>
    </head>


Directory layout
-------------------
This follows the usual maven directory layout:

- src/main/webapp: The production code
- src/test/webapp: The test code
- compiled: The result of the javascript compilation
- compiled/jquery-mobile: The bugfixed version of jquery-mobile.
- compiled/min: Contains the minified files.


Build
--------------------------
The build is done using maven and requirejs.

- `mvn clean package -Pbuild`: This will create a new version of the adapter and put it into `/compiled`.

The build also creates a standalone library including jquery, jquery-mobile and angular.
If you want to do something during the initialization of jquery-mobile, use the following callback:
`window.mobileinit = function() { ... }`

Please install the latest version of the maven plugin `brew`. This project provides a
snapshot release in `/localrepo`.

Running the tests
-------------------

- `mvn clean integration-test -Ptest`: This will do a build and execute the tests using js-test-driver.
  The browser that is used can be specified in the pom.xml.
- `mvn clean package jetty:run`: This will start a webserver under `localhost:8080/jqmng`.
  The unit-tests can be run via the url `localhost:8080/jqmng/UnitSpecRunner.html`
  The ui-tests can be run via the url `localhost:8080/jqmng/UiSpecRunner.html`


Scopes
-----------
The adapter creates a global scope by compiling just down until the `body` tag and then stopping there.
Any controller associated to the `body` tag will be part of the global scope.

Every page of jquery mobile gets a separate scope. The `$eval` of the global scope only evaluates the currently active page,
so there is no performance interaction between pages.

For communicating between the pages use the `ngm:shared-controller` directive (see below).

The global scope can be access via the function `$.mobile.globalScope` or via `$("body").scope()`.
However, please use `this.$root` to access the global scope in your code. This simplifies testing!



Widgets, Directives and Services
-----------

### Directive ngm:shared-controller="name1:Controller1,name2:Controller2, ..."
Mobile pages are small, so often a usecase is split up into multiple pages.
To share common behaviour and state between those pages, this directive allows shared controllers.

The directive will create an own scope for every given controllers and store it
in the variables as `name1`, `name2`, ....
If the controller is used on more than one page, the instance of the controller is shared.

Note that the shared controller have the full scope functionality, e.g. for dependecy injection
or using `$watch`.

### Directive ngm:event="{event1:'handler1',event2:'handler2',...}"
General event handler that integrates with jquery events, and also with jquery mobile events.
The value of the attribute is json and defines the event - handler mapping.

Usage: E.g. `<a href="#" ngm:event="{swiperight:'myFn()'}">`

### Directive ngm:click="handler"
Special click handler that integrates with jquery mobile's `vclick` event and by this also reacts to touches.
Also see `ngm:event` for the general case of binding a handler to events.

Usage: E.g. `<a href="#" ngm:click="myFn()">`

### Attribute Widget @ngm:if
The attribute widget `@ngm:if` allows to add/remove an element to/from the dom, depending on an expression.
This is especially useful at places where we cannot insert an `ng:switch` into the dom. E.g. jquery mobile
does not allow elements between an `ul` and an `li` element.

Usage: E.g. `<div ngm:if="myFlag">asdfasdf</div>`

### Directive ngm:fadein
For smooth fadings between `ngm:if` changes, there is also the directive `ngm:fadein`.
This specifies that the display of the coresponding element
should be shown via a transition lasting a defined amount of milliseconds (the value of the attribute).

Usage: E.g. `<div ngm:fadein="700">asdf</div>`


### Service $navigate('[transition]:pageId'[,activateFn][,activateFnParam1, ...])
Service to change the given page.
- If the transition has the special value `back` than the browser will go back in history to
  the defined page, e.g. `back:hompage`.
- The transition may be omitted, e.g. `$navigate('homepage')`.
- To go back one page use `$navigate('back')`.
- If the `activateFn` function is given, it will be called after the navigation on the target page with
  `activateFnParam1, ...` as arguments. The invocation is done before the `pagebeforeshow` event on the target page.

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


### Function angular.Object.iff / $iff
Every expression can now use the function `$iff` as a ternary operator:
`$iff(test, trueCase, falseCase)` will return the `trueCase` if the `test` is truthy and the `falseCase` otherwise.

### Function angular.Object.navigate / $navigate
Every expression can now use the `$navigate` expression to define the navigation outside of the controlers
in the html pages. By this, the controllers stay independent of the navigation process and is reusable.

There are two types of syntax:
1. `$activate(target)`: Navigates to the given target using the `$navigate` service, so the target can also
   include a transition.
2. `$activate(test,'outcome1:target','outcome2:target',...)`: Navigates to that target whose outcome equals
   to the test. The special outcomes `success` is applied for any value for `test` that is not `false` (e.g. also `undefined`),
   and the outcome `failure` is used for the value `false` of test.
   This also supports promises. In that case, the navivation is done with the first argument of
   the `done` / `fail` callback of the promise. Also, the `success` outcome is mapped to the `done` callback
   and the `failure` outcome to the `fail` callback.


### Paging for lists
Lists can be paged in the sense that more entries can be additionally loaded. By "loading" we mean the
display of a sublist of a list that is already fully loaded in JavaScript. This is useful, as the main performance
problems result from DOM operations, which can be reduced with this paging mechanism.

To implement this paging mechaism, we extend the angular array type with the folling function:
`angular.Array.paged(array[,filterExpr[,orderByExpr]])`:

This returns the subarray of the given filtered and ordered array with the currently loaded pages.
The default page size is defined by `$.mobile.defaultListPageSize`. It can be overwritten by the property `pageSize`
on arrays. For the filtering and sorting see the `angular.Array.filter` and `angular.Array.orderBy`.

The resulting list provides the following functions:
- `hasMorePages()`: Returns a boolean indicating if there are more pages that can be loaded.
- `loadNextPage()`: Loads the next page from the list that was given to `angular.Array.paged`.

Note that this will cache the result of two calls until the next eval cycle or a change to the filter or orderBy arguments.

As angular instruments all lists in expressions automatically with the functions form the `angular.Array` namespace,
the function `paged` can directly be used in all angular expressions, with a `$` as prefix.
The following example shows an example for a paged list for the data in the variable `myList`:


    <ul data-role="listview">
        <li ng:repeat="item in list.$paged()">{{item}}</li>
        <li ngm:if="list.$paged().hasMorePages()">
            <a href="#" ngm:click="list.$paged().loadNextPage()">Load more</a>
         </li>
    </ul>




