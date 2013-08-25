requirejs.config({
    urlArgs: "bust=" + (new Date()).getTime() ,
    paths: {
        'text': '../Scripts/text',
        'durandal': '../Scripts/durandal',
        'plugins': '../Scripts/durandal/plugins',
        'transitions': '../Scripts/durandal/transitions',
        'underscore': '../Scripts/underscore',
        'knockout': '../Scripts/knockout-2.3.0',
        'jquery': '../Scripts/jquery-1.9.1'
    },
    shim: {
        'underscore': {
            exports: '_'
        }
    }
});

define('jquery', function () { return jQuery; });
define('knockout', ko);

define(['durandal/system', 'durandal/app', 'durandal/viewLocator', 'services/auth'], function (system, app, viewLocator, auth) {
    //>>excludeStart("build", true);
    system.debug(true);
    //>>excludeEnd("build");

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