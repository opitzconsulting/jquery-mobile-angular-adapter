(function (angular, $) {
    var widgetConfig = {
        checkboxradio:{
            handlers:[disabledHandler, refreshAfterNgModelRender, checkedHandler],
            precompile:checkboxRadioPrecompile,
            create:checkboxRadioCreate
        },
        button:{
            handlers:[disabledHandler],
            precompile:buttonPrecompile,
            create:buttonCreate
        },
        collapsible:{
            handlers:[disabledHandler, collapsedHandler]
        },
        textinput:{
            handlers:[disabledHandler],
            precompile:textinputPrecompile,
            create:textinputCreate
        },
        slider:{
            handlers:[disabledHandler, refreshAfterNgModelRender],
            precompile:sliderPrecompile,
            create:sliderCreate
        },
        listview:{
            handlers:[refreshOnChildrenChange]
        },
        collapsibleset:{
            handlers:[refreshOnChildrenChange]
        },
        selectmenu:{
            handlers:[disabledHandler, refreshAfterNgModelRender, refreshOnChildrenChange],
            precompile:selectmenuPrecompile,
            create:selectmenuCreate
        },
        controlgroup:{
            handlers:[refreshControlgroupOnChildrenChange]
        },
        navbar:{
            handlers:[refreshOnChildrenChange]
        },
        dialog:{
            handlers:[],
            precompile:dialogPrecompile,
            create:dialogCreate
        },
        fixedtoolbar:{
            handlers:[]
        }
    };

    function mergeHandlers(widgetName, list) {
        return function ($injector) {
            var args = Array.prototype.slice.call(arguments);
            args.unshift(widgetName);
            args.push($injector);
            for (var i = 0; i < list.length; i++) {
                list[i].apply(this, args);
            }
        }
    }

    var config;
    for (var widgetName in widgetConfig) {
        config = widgetConfig[widgetName];
        config.link = mergeHandlers(widgetName, config.handlers);
        $.mobile.registerJqmNgWidget(widgetName, config);
    }

    // -------------------
    // precompile functions

    // Checkboxradio wraps the input and label into a new element.
    // The angular compiler does not like this, as it changes elements that are not
    // in the subtree of the input element that is currently linked.
    function checkboxRadioPrecompile(origElement, initArgs) {
        // Selectors: See the checkboxradio-Plugin in jqm.
        var parentLabel = $(origElement).closest("label");
        var container = $(origElement).closest("form,fieldset,:jqmData(role='page'),:jqmData(role='dialog')");
        if (container.length===0) {
            container = origElement.parent();
        }
        var label = parentLabel.length ? parentLabel : container.find("label").filter("[for='" + origElement[0].id + "']");
        var wrapper = $("<div></div>").insertBefore(origElement).append(origElement).append(label);
        moveCloningDirectives(origElement, origElement.parent());
        return wrapper;
    }

    function checkboxRadioCreate(origCreate, element, initArgs) {
        var _wrapAll = $.fn.wrapAll;
        var input = element.children("input");
        var wrapper = element;

        return withPatches($.fn, {
            wrapAll: function(_wrapAll, self, args) {
                var container = args[0];
                if (self[0] === input[0]) {
                    $.fn.wrapAll = _wrapAll;
                    var tempContainer = $(container);
                    wrapper[0].className = tempContainer[0].className;
                    return input;
                }
                return _wrapAll.apply(self, args);
            }
        }, function() {
            return origCreate.apply(input, initArgs);
        });
    }

    // Slider appends a new element after the input/select element for which it was created.
    // The angular compiler does not like this, so we wrap the two elements into a new parent node.
    function sliderPrecompile(origElement, initArgs) {
        origElement.wrapAll("<div></div>");
        var wrapper = origElement.parent();
        moveCloningDirectives(origElement, wrapper);
        return wrapper;
    }

    function sliderCreate(origCreate, element, initArgs) {
        var slider = element.children().eq(0);
        origCreate.apply(slider, initArgs);
    }

    // Button wraps itself into a new element.
    // Angular does not like this, so we do it in advance.
    function buttonPrecompile(origElement, initArgs) {
        var wrapper = $("<div></div>")
            .text(origElement.text() || origElement.val())
            .insertBefore(origElement)
            .append(origElement);
        moveCloningDirectives(origElement, wrapper);
        return wrapper;
    }

    function buttonCreate(origCreate, element, initArgs) {
        var wrapper = element;
        var button = element.children().eq(0);
        return withPatches($.fn, {
            text: function(_text, self, args) {
                if (args.length > 0) {
                    // Only catch the first setter call
                    $.fn.text = _text;
                    return wrapper;
                }
                return _text.apply(self, args);
            },
            insertBefore: function(_insertBefore, self, args) {
                var element = args[0];
                if (self[0] === wrapper[0] && element[0] === button[0]) {
                    return wrapper;
                }
                return _insertBefore.apply(self, args);
            }
        }, function() {
            return origCreate.apply(button, initArgs);
        });
    }

    // selectmenu wraps itself into a new element.
    // Angular does not like this, so we do it in advance.
    function selectmenuPrecompile(origElement, initArgs) {
        var wrapper = $("<div></div>").insertBefore(origElement).append(origElement);
        moveCloningDirectives(origElement, wrapper);
        return wrapper;
    }

    function selectmenuCreate(origCreate, element, initArgs) {
        var wrapper = element;
        var select = element.children().eq(0);

        return withPatches($.fn, {
           wrap: function(_wrap, self, args) {
               var container = args[0];
               if (self[0] === select[0]) {
                   $.fn.wrap = _wrap;
                   var tempContainer = $(container);
                   wrapper[0].className = tempContainer[0].className;

                   return select;
               }
               return _wrap.apply(self, args);
           }
        }, function() {
            return origCreate.apply(select, initArgs);
        });
    }

    // textinput for input-type "search" wraps itself into a new element
    function textinputPrecompile(origElement, initArgs) {
        if (!origElement.is("[type='search'],:jqmData(type='search')")) {
            return origElement;
        }
        var wrapper = $("<div></div>").insertBefore(origElement).append(origElement);
        moveCloningDirectives(origElement, wrapper);
        return wrapper;
    }

    function textinputCreate(origCreate, element, initArgs) {
        if (element[0].nodeName.toUpperCase()!=="DIV") {
            // no wrapper
            return origCreate.apply(element, initArgs);
        }
        var wrapper = element;
        var input = element.children().eq(0);

        return withPatches($.fn, {
            wrap: function(_wrap, self, args) {
                var container = args[0];
                if (self[0] === input[0]) {
                    $.fn.wrap = _wrap;
                    var tempContainer = $(container);
                    wrapper[0].className = tempContainer[0].className;

                    return input;
                }
                return _wrap.apply(self, args);
            }
        }, function() {
            return origCreate.apply(input, initArgs);
        });
    }

    // Dialog: separate event binding and dom enhancement.
    // Note: We do need to add the close button during precompile,
    // as the enhancement for the dialog header and footer depends on it.
    // We cannot adjust the timing of the header enhancement as it is no jqm widget.
    function dialogPrecompile(origElement, initAttrs) {
        var options = $.mobile.dialog.prototype.options;
        var $el = origElement,
            headerCloseButton = $( "<a href='#' data-" + $.mobile.ns + "icon='delete' data-" + $.mobile.ns + "iconpos='notext'>"+ options.closeBtnText + "</a>" ),
            dialogWrap = $("<div/>", {
                "role" : "dialog",
                "class" : "ui-dialog-contain ui-corner-all ui-overlay-shadow"
            });

        $el
            .wrapInner( dialogWrap )
            .children()
            .find( ":jqmData(role='header')" )
            .prepend( headerCloseButton )
            .end()
            .children( ':first-child')
            .addClass( "ui-corner-top" )
            .end()
            .children( ":last-child" )
            .addClass( "ui-corner-bottom" );

        headerCloseButton.buttonMarkup();
        $el.data("headerCloseButton", headerCloseButton);

        return $el;
    }

    function dialogCreate(origCreate, element, initArgs) {
        return withPatches($.fn, {
            init: function(_init, self, args) {
                // return the already created header close button
                var selector = args[0];
                if (selector && selector.indexOf && selector.indexOf("<a href='#' data-")===0) {
                    return element.data("headerCloseButton");
                }
                return _init.apply(self, args);
            },
            wrapInner: function(_wrapInner, self, args) {
                if (self[0]===element[0]) {
                    return $();
                }
                return _wrapInner.apply(self, args);
            }
        }, function() {
            return origCreate.apply(element, initArgs);
        });
    }

    function withPatches(obj, patches, callback) {
        var _old = {};

        function patchProp(prop) {
            var oldFn = _old[prop] = obj[prop];
            obj[prop] = function() {
                return patches[prop](oldFn, this, arguments);
            };
            obj[prop].prototype = oldFn.prototype;
        }

        var prop;
        for (prop in patches) {
            patchProp(prop);
        }
        try {
            return callback();
        } finally {
            for (prop in _old) {
                obj[prop] = _old[prop];
            }
        }
    }

    var CLONING_DIRECTIVE_REGEXP = /(^|[\W])(repeat|switch-when|if)($|[\W])/;

    function moveCloningDirectives(source, target) {
        // iterate over the attributes
        var cloningAttrNames = [];
        var node = source[0];
        var targetNode = target[0];
        var nAttrs = node.attributes;
        var attrCount = nAttrs && nAttrs.length;
        if (attrCount) {
            for (var attr, name,
                     j = attrCount - 1; j >= 0; j--) {
                attr = nAttrs[j];
                name = attr.name;
                if (CLONING_DIRECTIVE_REGEXP.test(name)) {
                    node.removeAttributeNode(attr);
                    targetNode.setAttributeNode(attr);
                }
            }
        }

        // iterate over the class names.
        var targetClassName = '';
        var className = node.className;
        var match;
        if (className) {
            className = className.replace(/[^;]+;?/, function (match) {
                if (CLONING_DIRECTIVE_REGEXP.test(match)) {
                    targetClassName += match;
                    return '';
                }
                return match;
            });
        }
        if (targetClassName) {
            targetNode.className = targetClassName;
            node.className = className;
        }
    }

    // Expose for tests.
    $.mobile.moveCloningDirectives = moveCloningDirectives;


    // -------------------
    // link handlers
    function disabledHandler(widgetName, scope, iElement, iAttrs, ctrls) {
        iAttrs.$observe("disabled", function (value) {
            if (value) {
                iElement[widgetName]("disable");
            } else {
                iElement[widgetName]("enable");
            }
        });
    }

    function collapsedHandler(widgetName, scope, iElement, iAttrs, ctrls, $inject) {
        var $parse = $inject.get("$parse");
        if (iAttrs.collapsed) {
            var collapsedGetter = $parse(iAttrs.collapsed);
            var collapsedSetter = collapsedGetter.assign;
            scope.$watch(collapsedGetter, function(value) {
                if (value) {
                    iElement.trigger("collapse");
                } else {
                    iElement.trigger("expand");
                }
            });

            iElement.bind("collapse", function () {
                scope.$apply(function() {
                    collapsedSetter(scope, true);
                });
            });
            iElement.bind("expand", function () {
                scope.$apply(function() {
                    collapsedSetter(scope, false);
                });
            });
        }
    }

    function checkedHandler(widgetName, scope, iElement, iAttrs, ctrls) {
        iAttrs.$observe("checked", function (value) {
            triggerAsyncRefresh(widgetName, scope, iElement, "refresh");
        });
    }

    function addCtrlFunctionListener(ctrl, ctrlFnName, fn) {
        var listenersName = "_listeners" + ctrlFnName;
        if (!ctrl[listenersName]) {
            ctrl[listenersName] = [];
            var oldFn = ctrl[ctrlFnName];
            ctrl[ctrlFnName] = function () {
                var res = oldFn.apply(this, arguments);
                for (var i = 0; i < ctrl[listenersName].length; i++) {
                    ctrl[listenersName][i]();
                }
                return res;
            };
        }
        ctrl[listenersName].push(fn);
    }

    function refreshAfterNgModelRender(widgetName, scope, iElement, iAttrs, ctrls) {
        var ngModelCtrl = ctrls[0];
        if (ngModelCtrl) {
            addCtrlFunctionListener(ngModelCtrl, "$render", function () {
                triggerAsyncRefresh(widgetName, scope, iElement, "refresh");
            });
        }
    }

    function refreshControlgroupOnChildrenChange(widgetName, scope, iElement, iAttrs, ctrls) {
        iElement.bind("$childrenChanged", function () {
            triggerAsyncRefresh(widgetName, scope, iElement, {});
        });
    }


    function refreshOnChildrenChange(widgetName, scope, iElement, iAttrs, ctrls) {
        iElement.bind("$childrenChanged", function () {
            triggerAsyncRefresh(widgetName, scope, iElement, "refresh");
        });
    }

    function triggerAsyncRefresh(widgetName, scope, iElement, options) {
        var prop = "_refresh" + widgetName;
        var refreshId = (iElement.data(prop) || 0) + 1;
        iElement.data(prop, refreshId);
        scope.$evalAsync(function () {
            if (iElement.data(prop) === refreshId) {
                iElement[widgetName](options);
            }
        });
    }


})(angular, $);