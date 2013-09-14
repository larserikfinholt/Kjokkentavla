require.config({
    //urlArgs: 'cb='+ Math.random(),

    baseUrl: '/App',


    paths: {
        jquery: '/scripts/jquery-1.9.1',
        'knockout': '/scripts/knockout-2.3.0',
        'komap': '../Scripts/knockout.mapping-latest',
        'jasmine': '/scripts/jasmine/jasmine',
        'jasmine-html': '/scripts/jasmine/jasmine-html',
        'text': '../Scripts/text',
        'durandal': '../Scripts/durandal',
        'plugins': '../Scripts/durandal/plugins',
        'transitions': '../Scripts/durandal/transitions',
        'underscore': '../Scripts/underscore',
        'azurelib': '../Scripts/mobileservices.web-1.0.0.min'



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

define('gapi', ['async!https://apis.google.com/js/client.js!onload'],
    function () {
        console.log('gapi loaded');
        // Step 2: Reference the API key (https://code.google.com/apis/console/?pli=1#project:910460127884:access)
        var apiKey = 'AIzaSyANE4eQbcntAG7wHWAv8YLBMcILGVeleSQ';
        gapi.client.setApiKey(apiKey);
        return gapi.client;
    }
);


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
    specs.push('/app/settings/settings.spec.js');
    specs.push('/app/services/googlecalendar.spec.js');
    //specs.push('/app/specs/auth.spec.js');
    //specs.push('/app/specs/settings.spec.js');
    //specs.push('/app/specs/calendar.spec.js');



    $(function () {
        require(specs, function (spec) {
            jasmineEnv.execute();
        });
    });

});