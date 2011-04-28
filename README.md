JQuery Mobile Angular Adapter
=====================

Description
-------------

Integration between jQuery Mobile and angular.js. Needed as jQuery Mobile
enhances the pages with new elements and styles and so does angular.

Ensures that angular enhances a page right after jQuery Mobile has finished enhancing the page.
By this, all elements have the correct styles, and angular can take them
and modify them (e.g. copy rows for lists, ...). This ordering is also needed as
jQuery Mobile only enhances pages when they are navigated to, and not
all at once (as angular does in autoinit mode).

Furthermore automatically refreshs the jquery mobile widgets when the corresponding
values in angular change.
E.g. the select tag is enhanced by jquery mobile,
and if someone changes it's value programmatically, the refresh-function needs to be called.
The integration between jquery mobile and angular watches for such changes in the model
and automatically calls the refresh function.

Finally provides a templating mechanism, so that jqurey mobile can style elements in advance,
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
Also creates a global scope to provide communication between the different page scopes.
If a controller named `MainController` exists it will become the controller
for the global scope.



Tags, Directives and Services
-----------

### Directive ngm:click(handler)
Special click handler that integrates with jquery mobile: It stops
all jquery mobile navigation actions.

Usage: E.g. `<a href="#" ngm:click="myFn()">`


### Service $pageLocation
Service to access and change the current page.
A call without parameters returns the current page id, a call with parameters
changes the current page.

Parameters (see $.mobile.changePage)
- pageId: Id of page to navigate to. The special page id "back" navigates back.
- transition (optional): Transition to be used.
- reverse (optional): If the transition should be executed in reverse style

Usage: E.g. `$pageLocation('page2')

### Function $.mobile.globalScope
Helper function to access the global scope.
If no parameter is supplied this returns the current global scope.
If a parameter is supplied this will set the current global scope.


Templating
-----------
Templates can be defined using the attribute `ngm:define` and referenced by the attribute
`ngm:use`. The value of the `ngm:define` defines the template name that should be defined.
The value of the `ngm:use` attribute defines an expression that returns the template name
to be inserted. This expression is watched, so whenever the expression changes,
the corresponding template is used.

Example:
The following example shows a list that displays the names of persons.
It defines two templates: Ony for readonly view and one with a delete button.
The template name is stored in the variable personTemplate. By changing this
variable in the controller, is is possible to switch between the two layouts.


				<ul data-role="listview" data-inset="true" data-theme="c">
                    <li ngm:define="personReadonly">
						<a href="#person">
							{{person.name}}</a>
                    </li>
					<li ngm:define="personEdit">
						<a href="#person">
							{{person.name}}</a>
						<a href="" data-icon="delete" ng:mclick="deletePerson(person)" ngm:fadein="700"></a>
					</li>
					<li ng:repeat="person in personList"
						ngm:use="personTemplate">
                    </li>
                </ul>


For smooth fadings between template changes, there is also the directive `ngm:fadein`.
This specifies that the display of the coresponding element (in the delete button in the example)
should be done via a transition lasting a defined amount of milliseconds (the value of the attribute).