require([
    'lib/order!lib/jquery-1.6.2',
    'lib/order!lib/jquery.mobile.noinit',
    'lib/order!lib/angular-0.9.19',
    'lib/order!lib/jquery.mobile-1.0b2-oc1',
    'lib/order!jqm-angular-global',
    'lib/order!lib/jasmine.js',
    'lib/order!lib/jasmine-html',
    'lib/order!unit/unit-tests'
], function() {
    require.ready(function() {
        jasmine.getEnv().addReporter(new jasmine.TrivialReporter());
        jasmine.getEnv().execute();
    });
});