Hi,
just released version 1.3.0 of jquery-mobile-angular adapter. This works with angular 1.0.5 and jquery-mobile 1.3.0.

* Github: [https://github.com/tigbro/jquery-mobile-angular-adapter](https://github.com/tigbro/jquery-mobile-angular-adapter)
* Download: [https://github.com/tigbro/jquery-mobile-angular-adapter/tree/1.3.0](https://github.com/tigbro/jquery-mobile-angular-adapter/tree/1.3.0) 
* Changelog: [https://github.com/tigbro/jquery-mobile-angular-adapter/blob/master/Changelog.md](https://github.com/tigbro/jquery-mobile-angular-adapter/blob/master/Changelog.md)
* JsFiddle for Todo-App: [http://jsfiddle.net/tigbro/Du2DY/](http://jsfiddle.net/tigbro/Du2DY/)
* Template for submitting issues: [http://jsfiddle.net/tigbro/ZHKBA/](http://jsfiddle.net/tigbro/ZHKBA/) and [http://plnkr.co/edit/ZrKB8H4fjnlak6WgKOTj](http://plnkr.co/edit/ZrKB8H4fjnlak6WgKOTj) (Plnkr)

Thanks all who provided feedback and submitted issues! Your are great!!

New features:

Features:

- upgrade to angular 1.0.5, jqm 1.3.0 and jquery 1.9
- popup widget and panel widget has bidi databinding for `data-opened` attribute.
- Refactored build system to grunt.js, testacular, [https://github.com/tigbro/uitest.js](https://github.com/tigbro/uitest.js) and travis-ci.
- Added provider `jqmNgWidget` to easily adapt new jqm plugins with angular.
  Also automatically detects widgets of jqm plugins and registers angular directives for them.
- onActivate in routes: Now all properties of `$routeParams` can be accessed as local variables
  in the expression.
- Many bug fixes to the routing integration with jquey mobile.

Breaking changes:

- Does no more work with angular <1.0.5 or jqm <1.3
- multi page listview widget is no more supported (see here for the jqm statement: 
https://github.com/jquery/jquery-mobile/issues/5657).
- URI scheme for dialogs and popups:
    - URLs for dialogs do no more redirect to the url `&ui-state=dialog`. However,
      leaving a dialog will still remove it automatically from the history.
    - Popups do no more change the url when opened or closed (and by this, they cannot be
      closed using the back browser button).
- checkbox/radiobox: ng-repeat or other conditional directives are no more allowed on the input of checkboxes/radioboxes,
  as they also need their corresponding labels. Instead, wrap the input into the label
  and put the ng-repeat on the label.
- `$location.goBack()` was moved to `$history.goBack()`.
- `$location.backMode()` was replaced by `$location.back()` (so it is more similar to `$location.replace()`).
- `<input type="range">` now correctly uses numbers as value in the scope, not strings.
- dynamicBaseTag of jQuery mobile is now deactivated as it lead to problems with XHRs, ...

Known issues:

- dynamic content in jqm tables (reflow table, ...) does not work, as 
  jqm does not provide a correct refresh method for those widgets. Jqm 1.3.1 will provide this, see [https://github.com/jquery/jquery-mobile/issues/5570](https://github.com/jquery/jquery-mobile/issues/5570).


Feedback welcome! 

Tobias 