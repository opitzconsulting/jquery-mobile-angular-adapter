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
  There changes were made to keep the API similar to the sencha-touch-angular-adapter.
  If you have to access the current page, use `$.mobile.activePage`.

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