/**
 * Helper that introduces the concept of precompilation: Preprocess the dom before
 * angular processes it.
 * <p>
 * Usage: Create a decorator or a factory for the $precompile service.
 */
(function ($, angular) {
    var ng = angular.module('ng');
    ng.provider("$precompile", $precompileProvider);
    ng.config(['$provide', precompileCompileDecorator]);
    ng.config(['$compileProvider', '$provide', precompileTemplateDirectives]);

    return;

    // ------------------

    function $precompileProvider() {
        var handlers = [];
        return {
            addHandler: function(handler) {
                handlers.push(handler);
            },
            $get: ["$injector", function($injector) {
                return function(element) {
                    var i;
                    for (i=0; i<handlers.length; i++) {
                        element = $injector.invoke(handlers[i], this, {element: element});
                    }
                    return element;
                };
            }]
        };
    }

    function precompileCompileDecorator($provide) {
        $provide.decorator('$compile', ['$precompile', '$delegate', function ($precompile, $compile) {
            return function () {
                var args = Array.prototype.slice.call(arguments);
                args[0] = $precompile(args[0]);
                return $compile.apply(this, args);
            };
        }]);
    }

    function precompileHtmlString(html, $precompile) {
        var $template = $('<div>' + html + '</div>');
        $precompile($template.contents());
        return $template.html();
    }

    function precompileTemplateDirectives ($compileProvider, $provide) {
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
                            var args = Array.prototype.slice.call(arguments);
                            var content = args[0];
                            args[0] = precompileHtmlString(content, $precompile);
                            return callback.apply(this, args);
                        };
                        return _success(newCallback);
                    };
                }
                return res;
            };
            return $http;
        }]);
    }

})($, angular);