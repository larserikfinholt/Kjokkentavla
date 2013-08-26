require.config({
    //urlArgs: 'cb='+ Math.random(),

    baseUrl: '/App',


    paths: {
        jquery: '/scripts/jquery-1.9.1',
        'knockout': '/scripts/knockout-2.3.0',
        'knockout.mapping': '/scripts/knockout.mapping-latest.debug',
        //'mockJSON': '/scripts/mockjson',
        //'mockajax': '/scripts/mockajax',
        'jasmine': '/scripts/jasmine/jasmine',
        'jasmine-html': '/scripts/jasmine/jasmine-html',
        'text': '../Scripts/text',
        'durandal': '../Scripts/durandal',
        'plugins': '../Scripts/durandal/plugins',
        'transitions': '../Scripts/durandal/transitions',
        'underscore': '../Scripts/underscore'

    },
    shim: {
        jasmine: {
            exports: 'jasmine'
        },
        'jasmine-html': {
            deps: ['jasmine'],
            exports: 'jasmine'
        },
        'underscore': {
            exports: '_'
        },
        mockJSON: {
            exports: 'mockJSON'
        }

    }
});


require(['jquery', 'jasmine-html'], function ($, jasmine) {

    var jasmineEnv = jasmine.getEnv();
    jasmineEnv.updateInterval = 1000;

    var htmlReporter = new jasmine.HtmlReporter();

    jasmineEnv.addReporter(htmlReporter);

    jasmineEnv.specFilter = function (spec) {
        return htmlReporter.specFilter(spec);
    };

    var specs = [];
    specs.push('/app/user/user.spec.js');
    specs.push('/app/services/azuremobile.spec.js');
    //specs.push('/app/specs/auth.spec.js');
    //specs.push('/app/specs/settings.spec.js');
    //specs.push('/app/specs/calendar.spec.js');



    $(function () {
        require(specs, function (spec) {
            jasmineEnv.execute();
        });
    });

});