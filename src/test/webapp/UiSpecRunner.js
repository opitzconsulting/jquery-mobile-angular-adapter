require([
    'lib/order!lib/jquery-1.6.2',
    'lib/order!lib/jasmine.js',
    'lib/order!lib/jasmine-ui.js',
    'lib/order!lib/jasmine-html',
    'lib/order!ui/ui-tests'
], function() {
    require.ready(function() {
        jasmine.getEnv().addReporter(new jasmine.TrivialReporter());
        jasmine.getEnv().execute();
    });
});