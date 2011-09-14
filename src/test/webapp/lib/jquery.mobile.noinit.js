/*
 * Helper library to prevent the auto initialization of jquery.
 * Needed for unit tests.
 */
$(document).bind("mobileinit", function(){
   $.extend(  $.mobile , {
    gradeA: function() {
        return false;
    }
  });
});
