/**
 * This will delay the angular initialization by two nested calls to jQuery.fn.ready.
 * By this, angular initialization will always be the last that is called by jQuery.fn.ready.
 * This is needed so that other libs (especially jqm), who also rely on jQuery.fn.ready for initialization, have
 * the chance to initialize before angular, no matter in which order the libs are included in the dom.
 * <p>
 * Concrete problem: See ui/integration/regressionSpec#navigation
 * <p>
 * Details: This is a copy of the scan for ng-app, ... attributes of angular. This will also remove
 * those attributes from the dom, so angular does not get to see them.
 */
(function ($, angular) {
    var forEach = angular.forEach;
    function deferAngularBootstrap(element, bootstrap) {
        $.holdReady(true);
        var doc = element.nodeType === 9 ? element : element.ownerDocument;
        addReadyListener(doc, function () {
            var config = findAndRemoveAngularConfig(element);
            if (config) {
                $(function () {
                    bootstrap(config.appElement, config.module);
                })
            }
            $.holdReady(false);
        });
    }

    function findAndRemoveAngularConfig(element) {
        var elements = [element],
            appElement,
            module,
            names = ['ng:app', 'ng-app', 'x-ng-app', 'data-ng-app'],
            NG_APP_CLASS_REGEXP = /\sng[:\-]app(:\s*([\w\d_]+);?)?\s/;

        function append(element) {
            element && elements.push(element);
        }

        forEach(names, function (name) {
            names[name] = true;
            append(document.getElementById(name));
            name = name.replace(':', '\\:');
            if (element.querySelectorAll) {
                forEach(element.querySelectorAll('.' + name), append);
                forEach(element.querySelectorAll('.' + name + '\\:'), append);
                forEach(element.querySelectorAll('[' + name + ']'), append);
            }
        });

        forEach(elements, function (element) {
            if (!appElement) {
                if (element.getAttribute) {
                    var id = element.getAttribute("id");
                    forEach(names, function (name) {
                        if (id === name) {
                            element.removeAttribute("id");
                        }
                    });
                }
                if (element.className) {
                    var newClassAttr = element.className.replace(/[^;]+;?/g, function (classPart) {
                        var className = ' ' + classPart + ' ';
                        var match = NG_APP_CLASS_REGEXP.exec(className);
                        if (match) {
                            appElement = element;
                            module = (match[2] || '').replace(/\s+/g, ',');
                            return '';
                        }
                        return classPart;
                    });
                    if (!newClassAttr) {
                        element.removeAttribute("class");
                    } else {
                        element.className = newClassAttr;
                    }
                }
                var attrs = [];
                forEach(element.attributes, function (attr) {
                    if (!appElement && names[attr.name]) {
                        appElement = element;
                        module = attr.value;
                        attrs.push(attr);
                    }
                });
                forEach(attrs, function (attr) {
                    element.removeAttributeNode(attr);
                });
            }
        });
        if (appElement) {
            return {
                appElement:appElement,
                module:module ? [module] : []
            }
        } else {
            return undefined;
        }
    }

    // See jQuery.bindReady
    function addReadyListener(document, fn) {
        var executed = false;

        function callOnce() {
            if (!executed) {
                executed = true;
                fn();
            }
        }

        // Catch cases where $(document).ready() is called after the
        // browser event has already occurred.
        if (document.readyState === "complete") {
            callOnce();
        } else {
            document.addEventListener("DOMContentLoaded", callOnce, false);

            // A fallback to window.onload, that will always work
            window.addEventListener("load", callOnce, false);
        }
    }

    deferAngularBootstrap(document, angular.bootstrap);

    // expose for tests
    $.mobile.deferAngularBootstrap = deferAngularBootstrap;
})($, angular);
