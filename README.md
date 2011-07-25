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
This also applies to the `disabled` attribute.
The integration between jquery mobile and angular watches for such changes in the model
and automatically calls the refresh function.

Finally provides a templating mechanism, so that jquery mobile can style elements in advance,
that may be used later by angular for dynamic component changes. This is similar to the switch
statement in angular. However, jquery mobile does not always allow an extra nesting of elements
into custom elements. E.g. if there should be two templates for an li element,
jquery mobile requires them to be directly under an ul element, without any other elements in between.


Sample
------------
See project [phonecat-mobile](https://github.com/tigbro/phonecat-mobile).


Limitations
------------
This deactivates angular's feature to change urls via the `$browser` or `$location` services.
This was needed as angular's url handling is incompatibly with jquery mobile and leads to
unwanted navigations.


Features
-----------

- selectmenu: Detects when options change and refreshes the menu transparently.



Usage
---------

Include this adapter _after_ angular and jquery mobile (see below).

ATTENTION: Do NOT use the `autobind` mode of angular!


    <html xmlns:ng="http://angularjs.org" xmlns:ngm="http://jqm-angularjs.org">
    <head>
        <title>MobileToys</title>
        <link rel="stylesheet" href="lib/jquery.mobile-1.0b1-oc1.css"/>
        <script src="lib/jquery-1.6.1.js"></script>
        <script src="lib/jquery.mobile-1.0b1-oc1.js"></script>
        <script src="lib/angular-0.9.15.js"></script>
        <script src="lib/jquery-mobile-angular-adapter.js"></script>
    </head>


Scopes
-----------
The adapter creates a separate angular scope for every page of jquery mobile.
It also creates a global scope to provide communication between the different page scopes.
If a controller named `GlobalController` exists it will become the controller
for the global scope. The `$eval` of the global scope only evaluates the currently active page,
so there is no performance interaction between pages.

The global scope can be access via the function `$.mobile.globalScope`:
If no parameter is supplied this returns the current global scope.
If a parameter is supplied this will set the current global scope.

However, please use `this.$root` to access the global scope in your code. This simplifies testing!

Callbacks for page changes
--------------
On page change, the integration looks for a method named `onPassivate` in the
current page scope. If the function exists it will
be called with the scope of the new page as parameter.
Afterwards, the function `onActivate` is searched for on the new scope
and called with the old scope as parameter. By this, pages can commuicate with each other
very easily.

Note that for creating a function in a scope just assign a controller for that page,
e.g. `<div data-role="page" ng:controller="MyController">`.


Widgets, Directives and Services
-----------

### Directive ngm:click(handler)
Special click handler that integrates with jquery mobile's `vclick` event and by this also reacts to touches.
Also see `ng:event` for the general case of binding a handler to events.

Usage: E.g. `<a href="#" ngm:click="myFn()">`

### Directive ng:event(event1:handler1,event2:handler2,...)
General event handler that integrates with jquery events, and also with jquery mobile events.
The value of the attribute has the syntax `<events>:<function expression>,...`. The `events` part may contain one or
more events (see jQuery bind function). There may be more than one events/function pair in the expression, separated by a komma.

Usage: E.g. `<a href="#" ng:event="swiperight:myFn()">`

### Attribute Widget @ng:if
The attribute widget `@ng:if` allows to add/remove an element to/from the dom, depending on an expression.
This is especially useful at places where we cannot insert an `ng:switch` into the dom. E.g. jquery mobile
does not allow elements between an `ul` and an `li` element.

Usage: E.g. `<div ng:if="myFlag">asdfasdf</div>`


### Directive ng:enterkey(handler)
Special click handler that fires when the enter key is pressed.

Usage: E.g. `<input type="submit" ng:enterkey="myFn()">`


### Directive ng:fadein
For smooth fadings between `ng:if` changes, there is also the directive `ngm:fadein`.
This specifies that the display of the coresponding element
should be shown via a transition lasting a defined amount of milliseconds (the value of the attribute).

Usage: E.g. `<div ng:fadein="700">asdf</div>`


### Service $activePage
Service to access and change the current page.
A call without parameters returns the current page id, a call with parameters
changes the current page.

Parameters (see $.mobile.changePage)
- pageId: Id of page to navigate to. The special page id "back" navigates back.
- transition (optional): Transition to be used.
- reverse (optional): If the transition should be executed in reverse style

Usage: E.g. `$activePage('page2')`

### Service waitdialog
The service `waitdialog` allows the access to the jquery mobile wait dialog. It provides the following functions:
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
        <li ng:if="list.$paged().hasMorePages()">
            <a href="#" ngm:click="list.$paged().loadNextPage()">Load more</a>
         </li>
    </ul>



Modularization
---------------
To modularize an angular jquery mobile application, use the following schema:

- For every jquery mobile page one JS-file with a controller for that page.
  To communicate with the controllers of other pages use the
  `onActivate` and `onPassivate` functions (see above).
  For fiels and functions on all pages use the `GlobalController`.
- For every jquery mobile page one HTML-file that only contains
  the div with the jquery mobile page and the `ng:controller` attribute for the controller.
  However, due to the page loading in jquery mobile, this cannot contain any css nor JS links.
  See the jquery mobile documentation for further details about loading external pages.
  E.g.


    <html>
        <body>
            <div id="mypage" data-role="page" ng:controller="MyPageController">
            ...
            </div>
        </body>
    </html>


- One `index.html` that includes the libraries and all CSS files

