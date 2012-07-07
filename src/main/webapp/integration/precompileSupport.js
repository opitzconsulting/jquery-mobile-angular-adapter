/**
 * Helper that introduces the concept of precompilation: Preprocess the dom before
 * angular processes it.
 * <p>
 * Usage: Create a decorator or a factory for the $precompile service.
 */
(function ($, angular) {
    var ng = angular.module('ng');
    ng.factory("$precompile", function() {
        return function(element) {
            // This is empty and can be decorated using $provide.decorator.
            return element;
        }
    });

    ng.config(['$provide', function ($provide) {
        $provide.decorator('$compile', ['$precompile', '$delegate', function ($precompile, $compile) {
            return function () {
                arguments[0] = $precompile(arguments[0]);
                return $compile.apply(this, arguments);
            }
        }]);
    }]);

    function precompileHtmlString(html, $precompile) {
        var $template = $('<div>' + html + '</div>');
        $precompile($template.contents());
        return $template.html();
    }

    ng.config(['$compileProvider', '$provide', function ($compileProvider, $provide) {
        var directiveTemplateUrls = {};

        // Hook into the registration of directives to:
        // - preprocess template html
        // - mark urls from templateUrls so we can preprocess it later in $http
        var _directive = $compileProvider.directive;
        $compileProvider.directive = function (name, factory) {
            var newFactory = function ($precompile, $injector) {
                var res = $injector.invoke(factory);
                if (res.template) {
                    res.template = precompileHtmlString(res.template, $precompile);
                } else if (res.templateUrl) {
                    directiveTemplateUrls[res.templateUrl] = true;
                }
                return res;
            };
            return _directive.call(this, name, ['$precompile', '$injector', newFactory]);
        };

        // preprocess $http results for templateUrls.
        $provide.decorator('$http', ['$q', '$delegate', '$precompile', function ($q, $http, $precompile) {
            var _get = $http.get;
            $http.get = function (url) {
                var res = _get.apply(this, arguments);
                if (directiveTemplateUrls[url]) {
                    var _success = res.success;
                    res.success = function(callback) {
                        var newCallback = function() {
                            var content = arguments[0];
                            arguments[0] = precompileHtmlString(content, $precompile);
                            return callback.apply(this, arguments);
                        };
                        return _success(newCallback);
                    };
                }
                return res;
            };
            return $http;
        }]);
    }]);

})($, angular);