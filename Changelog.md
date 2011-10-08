Changelog
=====================

1.0.3
-------------
- Bugfix to styling of elements like <a>, ... when used with ng:if (see issue #10).
- Bugfix for selects with options using `ng:repeat`: If the number of options changed
  new values were not displayed be jquery mobile. Was broken by 1.0.2.
- Added a custom style to hide the angular validation popup (the red line around
  elements with validation errors still appears).
- `$activePage` was renamed to `$activate` and does not return the current page any more when
  called with no arguments. Furthermore, it does not more require the pageId to start with a `#`.
  If you have to access the current page, use `$.mobile.activePage`.
- `ngm:shared-controller` was added to share state between spearate pages
- `onActivate` and `onPassivate` callbacks were removed. Use
  `ngm:event="pagebeforeshow:myCallback()"` instead, and `ngm:shared-controller` for sharing sate between pages.
- `ngm:enterKey` was removed. Please use a form with `ng:submit` (and `data-ajax=false`) for this.
- `<input type="range">` did produce two sliders. Bug was introduced in 1.0.2.

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