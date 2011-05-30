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


Usage
---------

Include this adapter _after_ angular and jquery mobile, e.g.


    <html xmlns:ng="http://angularjs.org" xmlns:ngm="http://jqm-angularjs.org">
    <head>
        <title>MobileToys</title>
        <link rel="stylesheet" href="lib/jquery.mobile-1.0a4.css"/>
        <script src="lib/jquery-1.5.1.js"></script>
        <script src="lib/jquery.mobile-1.0a4.js"></script>
        <script src="lib/angular-0.9.15.js"></script>
        <script src="lib/jquery-mobile-angular-adapter.js"></script>
    </head>


Scopes
-----------
The adapter creates a separate angular scope for every page of jquery mobile.
There is no global scope by purpose, so the performance of evaluating one page does not depend
on the expressions on other pages.

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


Tags, Directives and Services
-----------

### Directive ngm:click(handler)
Special click handler that integrates with jquery mobile's vlick event.

Usage: E.g. `<a href="#" ngm:click="myFn()">`


### Service $activePage
Service to access and change the current page.
A call without parameters returns the current page id, a call with parameters
changes the current page.

Parameters (see $.mobile.changePage)
- pageId: Id of page to navigate to. The special page id "back" navigates back.
- transition (optional): Transition to be used.
- reverse (optional): If the transition should be executed in reverse style

Usage: E.g. `$activePage('page2')`


Templating
-----------
Templates can be defined using the attribute `ngm:define` and referenced by the attribute
`ngm:switch`. The value of the `ngm:define` defines the template name that should be defined.
The value of the `ngm:switch` attribute defines an expression that returns the template name
to be inserted. This expression is watched, so whenever the expression changes,
the corresponding template is used.

Example:
The following example shows a list that displays the names of persons.
It defines two templates: Ony for readonly view and one with a delete button.
The template name is stored in the variable personTemplate. By changing this
variable in the controller, is is possible to switch between the two layouts.


    <ul data-role="listview" data-inset="true" data-theme="c">
        <li ngm:define="personReadonly">
		    <a href="#person">{{person.name}}</a>
        </li>
        <li ngm:define="personEdit">
            <a href="#person">{{person.name}}</a>
            <a href="" data-icon="delete" ng:mclick="deletePerson(person)" ngm:fadein="700"></a>
        </li>
        <li ng:repeat="person in personList" ngm:switch="personTemplate">
        </li>
    </ul>


For smooth fadings between template changes, there is also the directive `ngm:fadein`.
This specifies that the display of the coresponding element (the delete button in the example)
should be done via a transition lasting a defined amount of milliseconds (the value of the attribute).



Modularization
---------------
To modularize an angular jquery mobile application, use the following schema:

- For every jquery mobile page one JS-file with a controller for that page.
  To communicate with the controllers of other pages use the
  `onActivate` and `onPassivate` functions (see above). Usually, the `GlobalController` should
  not be needed.
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

Note that the links between the pages should have the following form: `<a href="#mypage.html">`.

