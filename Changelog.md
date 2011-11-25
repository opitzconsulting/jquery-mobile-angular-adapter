Changelog
=====================

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