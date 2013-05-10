(function (angular, $) {
    var ng = angular.module("ng");
    ng.config(["jqmNgWidgetProvider", function(jqmNgWidgetProvider) {
        // register a default handler for all widgets.
        var widgetName, widget;
        for (widgetName in $.mobile) {
            widget = $.mobile[widgetName];
            if (widgetName!=='page' && angular.isFunction(widget) && widget.prototype.widget) {
                jqmNgWidgetProvider.widget(widgetName, ["jqmNgWidget", defaultWidget]);
            }
        }

        // register special override handlers
        jqmNgWidgetProvider.widget("checkboxradio", ["jqmNgWidget", checkboxRadioWidget]);
        jqmNgWidgetProvider.widget("button", ["jqmNgWidget", buttonWidget]);
        jqmNgWidgetProvider.widget("collapsible", ["jqmNgWidget", "$parse", collapsibleWidget]);
        jqmNgWidgetProvider.widget("dialog", ["jqmNgWidget", dialogWidget]);
        jqmNgWidgetProvider.widget("controlgroup", ["jqmNgWidget", controlgroupWidget]);
        jqmNgWidgetProvider.widget("textinput", ["jqmNgWidget", textinputWidget]);
        jqmNgWidgetProvider.widget("slider", ["jqmNgWidget", "$parse", sliderWidget]);
        jqmNgWidgetProvider.widget("popup", ["jqmNgWidget", "$parse", popupWidget]);
        jqmNgWidgetProvider.widget("panel", ["jqmNgWidget", "$parse", panelWidget]);
        jqmNgWidgetProvider.widget("table", ["jqmNgWidget", tableWidget]);
    }]);

    function defaultWidget(jqmNgWidet) {
        return {
            link: function(widgetName, scope, iElement, iAttrs, ngModelCtrl, selectCtrl) {
                jqmNgWidet.createWidget(widgetName, iElement, iAttrs);
                jqmNgWidet.bindDefaultAttrsAndEvents(widgetName, scope, iElement, iAttrs, ngModelCtrl);
            }
        };
    }

    function textinputWidget(jqmNgWidget) {
        return {
            preLink: function(widgetName, scope, iElement, iAttrs, ngModelCtrl, selectCtrl) {
                if (iAttrs.type === 'range') {
                    iAttrs.type = 'number';
                }
            },
            link: function(widgetName, scope, iElement, iAttrs, ngModelCtrl, selectCtrl) {
                jqmNgWidget.createWidget(widgetName, iElement, iAttrs);
                jqmNgWidget.bindDefaultAttrsAndEvents(widgetName, scope, iElement, iAttrs, ngModelCtrl);
            }
        };
    }

    function popupWidget(jqmNgWidet, $parse) {
        return {
            link: function(widgetName, scope, iElement, iAttrs, ngModelCtrl, selectCtrl) {
                jqmNgWidet.createWidget(widgetName, iElement, iAttrs);
                jqmNgWidet.bindDefaultAttrsAndEvents(widgetName, scope, iElement, iAttrs, ngModelCtrl);
                addOpenedBinding("popup", $parse, scope, iElement, iAttrs, '_');
            }
        };
    }

    function panelWidget(jqmNgWidet, $parse) {
        return {
            link: function(widgetName, scope, iElement, iAttrs, ngModelCtrl, selectCtrl) {
                jqmNgWidet.createWidget(widgetName, iElement, iAttrs);
                jqmNgWidet.bindDefaultAttrsAndEvents(widgetName, scope, iElement, iAttrs, ngModelCtrl);
                addOpenedBinding("panel", $parse, scope, iElement, iAttrs, '');
            }
        };
    }

    function addOpenedBinding(widgetName, $parse, scope, iElement, iAttrs, openCloseMethodPrefix) {
        var syncing = false;
        if (iAttrs.opened) {
            var openedGetter = $parse(iAttrs.opened),
                openedSetter = openedGetter.assign;

            scope.$watch(openedGetter, updateWidget);
            if (openedSetter) {
                updateScopeOn(openCloseMethodPrefix+"open", true);
                updateScopeOn(openCloseMethodPrefix+"close", false);
            }
        }

        function updateScopeOn(methodName, scopeValue) {
            var widget = iElement.data($.mobile[widgetName].prototype.widgetFullName),
                _old = widget[methodName];
            widget[methodName] = function() {
                var res = _old.apply(this, arguments);
                if (!syncing) {
                    syncing = true;
                    scope.$apply(function () {
                        openedSetter(scope, scopeValue);
                    });
                    syncing = false;
                }
                return res;
            };
        }

        function updateWidget(opened) {
            if (syncing) {
                return;
            }
            syncing = true;
            if (opened) {
                iElement[widgetName]("open");
            } else {
                iElement[widgetName]("close");
            }
            syncing = false;
        }
    }

    function sliderWidget(jqmNgWidet, $parse) {
        return {
            link: function(widgetName, scope, iElement, iAttrs, ngModelCtrl, selectCtrl) {
                if (selectCtrl) {
                    waitForNgOptionsAndNgRepeatToCreateOptions(scope, function() {
                        selectSecondOptionIfFirstIsUnknownOptionToRemoveUnkownOption(iElement, ngModelCtrl);
                        jqmNgWidet.createWidget(widgetName, iElement, iAttrs);
                        jqmNgWidet.bindDefaultAttrsAndEvents(widgetName, scope, iElement, iAttrs, ngModelCtrl);
                    });
                } else {
                    var modelValue;
                    if (ngModelCtrl) {
                        // Note: ngModelCtrl.$modelValue is not filled yet,
                        // so we need to evaluate the ng-model attribute ourselves...
                        modelValue = $parse(iAttrs.ngModel)(scope);
                    }
                    setMinValueInScopeIfNoValueInScopeAsJqmStartsWithMinValue(iAttrs, ngModelCtrl, modelValue);
                    jqmNgWidet.createWidget(widgetName, iElement, iAttrs);
                    jqmNgWidet.bindDefaultAttrsAndEvents(widgetName, scope, iElement, iAttrs, ngModelCtrl);
                }
            }
        };

        function waitForNgOptionsAndNgRepeatToCreateOptions(scope, callback) {
            // Note: scope.$evalAsync does not work here, as it 
            // could get executed not until the next $digest, which would be too late!
            scope.$root.$postDigestOne(function(requireDigest) {
                requireDigest();
                callback();
            });
        }

        function setMinValueInScopeIfNoValueInScopeAsJqmStartsWithMinValue(iAttrs, ngModelCtrl, modelValue) {
            if (ngModelCtrl && typeof iAttrs.min !== "undefined" && modelValue===undefined) {
                var _$pristine = ngModelCtrl.$pristine;
                ngModelCtrl.$pristine = false;
                ngModelCtrl.$setViewValue(iAttrs.min);
                ngModelCtrl.$render();
                ngModelCtrl.$pristine = _$pristine;
            }
        }

        function selectSecondOptionIfFirstIsUnknownOptionToRemoveUnkownOption(iElement, ngModelCtrl) {
            var options = iElement.children("option"),
                initValue = options.eq(0).val(),
                selectedIndex;
            if (initValue === '?' || initValue.indexOf('? ')===0) {
                options.eq(1).prop("selected", true);
                var _$pristine = ngModelCtrl.$pristine;
                ngModelCtrl.$pristine = false;
                iElement.trigger("change");
                ngModelCtrl.$pristine = _$pristine;
            }
        }
    }



    function checkboxRadioWidget(jqmNgWidet) {
        return {
            precompile: checkboxRadioPrecompile,
            link: function(widgetName, scope, iElement, iAttrs, ngModelCtrl) {
                var label = iElement.parent("label");
                if (!iAttrs.ngmNoLabel && label.length===0) {
                    // If two checkboxes are created by ng-repeat, and the
                    // ng-repeat is on the checkbox and not on the label,
                    // the first checkbox will be fine, but the second one
                    // will be at an odd place in the dom...
                    throw new Error("Don't use ng-repeat or other conditional directives on checkboxes/radiobuttons directly. Instead, wrap the input into a label and put the directive on that input!");
                }
                jqmNgWidet.createWidget(widgetName, iElement, iAttrs);

                jqmNgWidet.bindDefaultAttrsAndEvents(widgetName, scope, iElement, iAttrs, ngModelCtrl);

                iAttrs.$observe("checked", function (value) {
                    jqmNgWidet.triggerAsyncRefresh(widgetName, scope, iElement, "refresh");
                });
            }
        };

        function checkboxRadioPrecompile(origElement, initArgs) {
            // wrap the input temporarily into it's label (will be undone by the widget).
            // By this, the jqm widget will always
            // use this label, even if there are other labels with the same id on the same page.
            // This is important if we use ng-repeat on checkboxes, as this could
            // create multiple checkboxes with the same id!
            // This needs to be done in the precompile, as otherwise angular compiler could get into trouble
            // when input and label are siblings!
            // See the checkboxradio-Plugin in jqm for the selectors used to locate the label.
            var parentLabel = $(origElement).closest("label");
            var container = $(origElement).closest("form,fieldset,:jqmData(role='page'),:jqmData(role='dialog')");
            if (container.length === 0) {
                container = origElement.parent();
            }
            var label = parentLabel.length ? parentLabel : container.find("label").filter("[for='" + origElement[0].id + "']");
            if (label.length===0) {
                origElement.attr("ngm-no-label", "true");
            } else {
                label.append(origElement);
            }
        }
    }

    function buttonWidget(jqmNgWidet) {
        return {
            precompile: function(origElement, initArgs) {
                // Add a text node with the value content,
                // as we need a text node later in the jqm button markup!
                if (origElement[0].nodeName.toUpperCase() === 'INPUT') {
                    var value = origElement.val();
                    origElement.append(document.createTextNode(value));
                }
            },
            link: function(widgetName, scope, iElement, iAttrs, ngModelCtrl) {
                // Button destroys the text node and recreates a new one. This does not work
                // if the text node contains angular expressions, so we move the
                // text node to the right place.
                var textNode = iElement.contents();
                jqmNgWidet.createWidget(widgetName, iElement, iAttrs);
                var textSpan = iElement.parent().find(".ui-btn-text");
                textSpan.empty();
                textSpan.append(textNode);

                jqmNgWidet.bindDefaultAttrsAndEvents(widgetName, scope, iElement, iAttrs, ngModelCtrl);
            }
        };
    }

    function collapsibleWidget(jqmNgWidet, $parse) {
        return {
            link: function(widgetName, scope, iElement, iAttrs, ngModelCtrl) {
                jqmNgWidet.createWidget(widgetName, iElement, iAttrs);
                jqmNgWidet.bindDefaultAttrsAndEvents(widgetName, scope, iElement, iAttrs, ngModelCtrl);
                bindCollapsedAttribute(scope, iElement, iAttrs);
            }
        };

        function bindCollapsedAttribute(scope, iElement, iAttrs) {
            var syncing = false;
            if (iAttrs.collapsed) {
                var collapsedGetter = $parse(iAttrs.collapsed);
                var collapsedSetter = collapsedGetter.assign;
                scope.$watch(collapsedGetter, updateWidget);
                if (collapsedSetter) {
                    updateScopeOn("collapse", true);
                    updateScopeOn("expand", false);
                }
            }

            function updateWidget(collapsed) {
                if (syncing) {
                    return;
                }
                syncing = true;
                if (collapsed) {
                    iElement.triggerHandler("collapse");
                } else {
                    iElement.triggerHandler("expand");
                }
                syncing = false;
            }

            function updateScopeOn(eventName, newCollapsedValue) {
                iElement.bind(eventName, function (event) {
                    if (syncing) {
                        return;
                    }
                    syncing = true;
                    if ( iElement[0]===event.target ) {
                        scope.$apply(function () {
                            collapsedSetter(scope, newCollapsedValue);
                        });
                    }
                    syncing = false;
                });
            }
        }
    }

    function dialogWidget(jqmNgWidet) {
        return {
            precompile: dialogPrecompile,
            link: function(widgetName, scope, iElement, iAttrs, ngModelCtrl) {
                jqmNgWidet.createWidget(widgetName, iElement, iAttrs);
                // add handler to enhanced close button manually (the one we added in precompile),
                // and remove the other close button (the one the widget created).
                var closeButtons = iElement.find(':jqmData(role="header") a:jqmData(icon="delete")');
                closeButtons.eq(1).bind("click", function() {
                    iElement.dialog("close");
                });
                closeButtons.eq(0).remove();

                jqmNgWidet.bindDefaultAttrsAndEvents(widgetName, scope, iElement, iAttrs, ngModelCtrl);
            }
        };

        // Dialog: separate event binding and dom enhancement.
        // Note: We do need to add the close button during precompile,
        // as the enhancement for the dialog header depends on it (calculation which button is left, right, ...),
        // and that is executed when we create the page widget, which is before the dialog widget is created :-(
        // We cannot adjust the timing of the header enhancement as it is no jqm widget.
        function dialogPrecompile(origElement, initAttrs) {
            FakeDialog.prototype = $.mobile.dialog.prototype;
            var fakeDialog = new FakeDialog(origElement, {}),
                options = fakeDialog.options,
                value = options.closeBtn;

            // The following code is adapted from $.mobile.dialog.prototype._setCloseBtn
            if ( value !== "none" ) {
                // Sanitize value
                var location = ( value === "left" ? "left" : "right" );
                var btn = $( "<a href='#' class='ui-btn-" + location + "' data-" + $.mobile.ns + "icon='delete' data-" + $.mobile.ns + "iconpos='notext'>"+ options.closeBtnText + "</a>" );
                origElement.find( ":jqmData(role='header')" ).first().prepend( btn );
            }

            function FakeDialog(element, options) {
                this.element = element;
                this.options = $.widget.extend( {},
                    this.options,
                    this._getCreateOptions(),
                    options
                );
            }
        }
    }

    function controlgroupWidget(jqmNgWidet) {
        return {
            link: function(widgetName, scope, iElement, iAttrs, ngModelCtrl) {
                jqmNgWidet.createWidget(widgetName, iElement, iAttrs);

                jqmNgWidet.bindDefaultAttrsAndEvents(widgetName, scope, iElement, iAttrs, ngModelCtrl);
                iElement.bind("$childrenChanged", function () {
                    jqmNgWidet.triggerAsyncRefresh(widgetName, scope, iElement, {});
                });
            }
        };
    }

    function tableWidget(jqmNgWidet) {
        return {
            link: function(widgetName, scope, iElement, iAttrs, ngModelCtrl, selectCtrl) {
                var widget, popupId, popup;
                jqmNgWidet.createWidget(widgetName, iElement, iAttrs);
                widget = iElement.data($.mobile[widgetName].prototype.widgetFullName);
                // The column-toggle widget creates a popup with a no enhanced controlgroup
                // and relies on the order in which jqm enhances the widgets.
                // However, this order is different in the adapter,
                // so we need to make sure that the popup is properly enhanced.
                if (widget && widget.options.mode==='columntoggle') {
                    popupId = ( iElement.attr( "id" ) || widget.options.classes.popup ) + "-popup";
                    popup = $("#"+popupId);
                    popup.trigger("create");
                }
                jqmNgWidet.bindDefaultAttrsAndEvents(widgetName, scope, iElement, iAttrs, ngModelCtrl);
            }
        };
    }

})(angular, $);