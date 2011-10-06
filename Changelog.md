Changelog
=====================

1.0.3
-------------
- Bugfix to styling of elements like <a>, ... when used with ng:if (see issue #10).
- Bugfix for selects with options using `ng:repeat`: If the number of options changed
  new values were not displayed be jquery mobile. Was broken by 1.0.2.
- Added a custom style to hide the angular validation popup (the red line around
  elements with validation errors still appears).
-

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