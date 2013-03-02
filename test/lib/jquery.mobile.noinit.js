/*
 * Helper library to prevent the auto initialization of jquery.
 * Needed for unit tests. Include this after jquery mobile.
 */
$.mobile.initializePage = function() {
};

$(function() {
    // just trigger the pagecontainer create event once.
    $.mobile.pageContainer = $("<div></div>");
    $(window).trigger("pagecontainercreate");
});

