requirejs.config({
    urlArgs: "bust=" + (new Date()).getTime() ,
    paths: {
        //alias to plugins
        'text': '../Scripts/text',
        'durandal': '../Scripts/durandal',
        'plugins': '../Scripts/durandal/plugins',
        'transitions': '../Scripts/durandal/transitions',
        'underscore': '../Scripts/underscore',
        'knockout': '../Scripts/knockout-2.3.0',
        'komap': '../Scripts/knockout.mapping-latest',
        'jquery': '../Scripts/jquery-1.9.1',
        'azurelib': '../Scripts/mobileservices.web-1.0.0.min',

    },
    shim: {
        'underscore': {
            exports: '_'
        }
    }
});

define('jquery', function () { return jQuery; });
define('knockout', ko);

// Offline remove
define('gapi', ['async!https://apis.google.com/js/client.js!onload'],
    function () {
        console.log('gapi loaded');
        // step 2: reference the api key (https://code.google.com/apis/console/?pli=1#project:910460127884:access)
        var apikey = 'aizasyane4eqbcntag7whwav8ylbmcilgvelesq';
        //gapi.client.setApiKey(apikey);
        return gapi.client;
    }
);

// Offline include
//define('gapi', [], function () {
//    var auth = {
//        authorize: function () { }
//    }
//    var gapi = {
//        auth: auth
//    };
//    window.gapi = gapi;
//});


define(['durandal/system', 'durandal/app', 'durandal/viewLocator', 'services/auth', 'logf'], function (system, app, viewLocator, auth, logf) {
    //>>excludeStart("build", true);
    system.debug(true);
    //>>excludeEnd("build");

    //// create the custom log type - system
    //logf.addType("system", "green", "log");
    //logf.addType('auth', 'yellow', 'log');
    //logf.addType('event', 'blue', 'info');
    //logf.off('system', 'auth');
    // reassigning the system.logger to custom logger. this replaces -> system.debug(true);
    system.log = logf.system;

    // Global auth for use with google
    window.auth = auth;

    app.title = 'Kjøkkentavla';


    app.configurePlugins({
        router: true,
        dialog: true,
        widget: true
    });

    app.start().then(function () {
        //Replace 'viewmodels' in the moduleId with 'views' to locate the view.
        //Look for partial views in a 'views' folder in the root.
        viewLocator.useConvention();

        //Show the app by setting the root view model for our application with a transition.
        app.setRoot('shell/shell', 'entrance');

        //window.auth.login();
    });


    ko.bindingHandlers.textualDate = {
        update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var valueUnwrapped = ko.utils.unwrapObservable(valueAccessor());
            var textContent = moment(valueUnwrapped).format("MMM Do YY");
            ko.bindingHandlers.text.update(element, function () { return textContent; });
        }
    };
});

window.handleGoogleLoaded = function (result) {
    console.log(result, app);



    gapi.auth.authorize({ client_id: 'clientId', scope: 'scopes', immediate: true }, function (res) {
        console.log(res);
    });
};