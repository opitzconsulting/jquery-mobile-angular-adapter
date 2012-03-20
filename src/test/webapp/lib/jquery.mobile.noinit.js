/*
 * Helper library to prevent the auto initialization of jquery.
 * Needed for unit tests. Include this after jquery mobile.
 */
$.mobile.initializePage = function() { };

