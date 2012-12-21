Changelog
=====================

1.1.2
-------------
Breaking changes:

- The url to start an app at a specific page (i.e. not the first page) changed.
- `$navigate` is no more. Please use the new angular route integration and
  the extensions to the `$location` service instead.
- Changed `ngm-click` to `ngm-vclick` as this matches directly to the jqm docs.
- Location for Wait-Dialog default messages changed.

New features:

- support for angular routes for jqm pages.
- general `$history` service and extensions to the `$location` service to
  control history and route parameters for a single route call.
- added missing event directives.

Internal changes:

- updated to angular 1.0.3 and jqm 1.2.0
- internal refactorings and simplifications.

Migration for the old `$navigate` service:

- `$navigate('back:somePage')`: going back to an url in history. Replace with:

        $location.url('somePage');
        $location.backMode();

- `$navigate('back')`: Going back on step in history. Replace with: `$location.goBack();`

- `$navigate('slide:somePage')`: showing a page with a special transition. Replace with:

        $location.url('somePage');
        $location.routeOverride({
            jqmOptions: 'slide'
        });

- `$navigate('somePage', 'someFn', param1, param2, ...)`: Showing a page an calling the given function on the scope
   of that page before the page is shown. Replace with:

        $location.url('somePage');
        $location.routeOverride({
            locals: {
                param1: param1,
                param2: param2,
                ...
            },
            onActivate: 'someFn(param1, param2, ...)'
        });

Beyond this, you can define default values for `onActivate` and `jqmOptions` on routes directly when they are defined,
e.g.:

    $routeProvider.when('/somePage', {
        templateUrl:'someTemplate.html',
        jqmOptions: { transition: 'flip' },
        onActivate: 'someFn(a)',
        resolve: {
            a: function() { return 'hello'; }
        }
    });


1.1.1
-------------
- Updated to jquery mobile 1.1.1
- Bugfixes to different elements.
- Collapsible now has bidirectonal data binding for the `data-collapsed` attribute.
- `navbar` automatically refreshes if children `li` elements are added / removed.
- `paged` filter changed and simplified, so that it can be used with angular filter chaining.


1.1.0
-------------
- Updated to angular 1.0.1.
- Added link to german book about using the adapter and a more complex example.
- Added AMD module support.
- complete refactoring for performance improvements, and to support directives with template and templateUrl.
- $location service can now be used again. Note that by default, this uses
  a new `jqmCompat` mode. For routes to work this has to be disabled.
- Added jsfiddle template for reporting issues (see Readme)
- Support for namespaces for jqm tags (via `$.mobile.ns`).
- Better support for angular directives with template and templateUrl.
- ng-app directive of angular is required
- `$navigate` now does no more add the "#" automatically. This allows multiple ajax pages to be used.

- `paged` expression was changed to the `paged` filter.
- Removed `$navigate` expression. Use `$navigate` service instead. Reason: This puts too much logic in the html page and leads
  to errors if `$q` is not used correctly.
- Removed the `fadein` directive, as there are better ways to do this (see the corresponding jquery mobile plugin...)
- 'ngm:event' directive is gone. Please use the new event directives introduced in 1.0.5 like ngm-click, ...
- removed `iff` expression as it was only used internally and is now no more needed.
- removed `$.mobile.globalScope` as it was only used internally. Use angular's `$rootScope` service instead.
- removed custom build of jquery mobile, as no patches are needed any more to work
  with angular 1.0.

1.0.6
-------------
- Update to jquery mobile 1.1
- `$waitDialog.show()` if called without a message only shows the default message
  if `$.mobile.loadingMessageTextVisible` is true (see jquery mobile docs for that property).

1.0.5
------------
- Allow an object to be passed to `$navigate` service as first argument to leverage the full power
  of jqm `changePage` function.
- ng:switch now works correctly.
- Styling issues with links in lists were resolved
- New event directives: `ngm:tap`,`ngm:taphold`,`ngm:swipe`,`ngm:swiperight`,`ngm:swipeleft`,`ngm:pagebeforeshow`,`ngm:pagebeforehide`,`ngm:pageshow`,`ngm:pagehide`
- Upgraded to jquery mobile 1.0.1


1.0.4
------------
- Update to jQuery Mobile 1.0. The adapter itself was not changed,
  but the standalone version now includes jquery mobile 1.0.
- Pleaes note that the jquery mobile version provided with the adapter does
  not more contain the "transitions" branch from jquery mobile. For the detailed
  list of applied patches see the Readme.


1.0.3
-------------
- Upgraded to jQuery Mobile RC2.
- Provides a bugfixed version of jquery mobile.
- Bugfix to styling of elements like `<a>`, ... when used with ng:if (see issue #10).
- Added a custom style to hide the angular validation popup (the red line around
  elements with validation errors still appears).
- `$activePage` was renamed to `$navigate` and does not return the current page any more when
  called with no arguments. It also only takes a single argument in the form ´[transition]:pageId´.
  Furthermore, it does not more require the pageId to start with a `#`.
  If you have to access the current page, use `$.mobile.activePage`.
- Added `$navigate` function in expressions to move navigation from the controller to the page.
- `ngm:shared-controller` was added to share state between spearate pages
- `onActivate` and `onPassivate` callbacks were removed. Use
  `ngm:event="pagebeforeshow:myCallback()"` or `$navigate(toPage, activateFn)` instead.
- `ngm:enterKey` was removed. Please use a form with `ng:submit` (and `data-ajax=false`) for this.
- `<input type="range">` did produce two sliders. Bug was introduced in 1.0.2.
- `ngm:event` now expects it's value to be a json string.
- No special support for `ng:repeat` used in `<option>` elements, as angular does not support this.
  Added support for `ng:options`.

The changes to the `$activePage`, `onActivate` and `ngm:shared-controller` was made to have a more general
solution that is also possible for sencha touch applications. By this, applications can easily switch between
jquery mobile and sencha touch without changing the controller code.


1.0.2
-------------
- Updated to jqm 1.0b3
- Changed tags and service names to be consistent:
  - `waitdialog` -> `$waitDialog`
  - `ng:event` -> `ngm:event`
  - `ng:fadein` -> `ngm:fadein`
  - `ng:if` -> `ngm:if`
  - `ng:enterkey` -> `ngm:enterkey`


1.0.1
-------------
Added the `mobileinit` support for the standalone build.


1.0
-------------
Initial stable release