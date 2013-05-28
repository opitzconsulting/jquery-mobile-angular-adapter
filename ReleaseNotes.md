Hi,
just released version 1.3.1 of jquery-mobile-angular adapter. This works with angular 1.0.6 and jquery-mobile 1.3.1.

* Github: [https://github.com/opitzconsulting/jquery-mobile-angular-adapter](https://github.com/opitzconsulting/jquery-mobile-angular-adapter)
* Download: [https://github.com/opitzconsulting/jquery-mobile-angular-adapter/tree/1.3.1](https://github.com/opitzconsulting/jquery-mobile-angular-adapter/tree/1.3.1) 
* Changelog: [https://github.com/opitzconsulting/jquery-mobile-angular-adapter/blob/master/Changelog.md](https://github.com/opitzconsulting/jquery-mobile-angular-adapter/blob/master/Changelog.md)
* Todo-App: [http://jsfiddle.net/UbTmM/](http://jsfiddle.net/UbTmM/)
* Template for submitting issues: [http://jsfiddle.net/jsBZh/](http://jsfiddle.net/jsBZh/) (inline pages) and [http://plnkr.co/edit/iKRaageOffYy3J9stfnZ](http://plnkr.co/edit/iKRaageOffYy3J9stfnZ) (external pages)

Thanks all who provided feedback and submitted issues!

New features:

- upgrade to angular 1.0.6 and jqm 1.3.1.
- jqm `table` widget now fully working, as jqm added the refresh function.

Breaking changes:

- routes with absolute urls in `templateUrl` are not treated as real absolute urls,
  and not prefixed with the base url of the document ([issue 155](https://github.com/opitzconsulting/jquery-mobile-angular-adapter/issues/155))


Feedback welcome! 

Tobias 