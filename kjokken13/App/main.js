requirejs.config({
    paths: {
        'text': '../Scripts/text',
        'durandal': '../Scripts/durandal',
        'plugins': '../Scripts/durandal/plugins',
        'transitions': '../Scripts/durandal/transitions',
        'underscore': '../Scripts/underscore',
        'knockout.mapping': '/scripts/knockout.mapping-latest.debug',
    },
    shim: {
        'underscore': {
            exports: '_'
        }
    }
});

define('jquery', [], function() { return jQuery; });
define('knockout', [], function () { return ko; });
define('komapping', [], function () { return ko.mapping; });

define(['durandal/system', 'durandal/app', 'durandal/viewLocator', 'services/auth', 'viewmodels/settings'],  function (system, app, viewLocator, auth, settings) {
    //>>excludeStart("build", true);
    system.debug(true);
    //>>excludeEnd("build");

    // Global auth for use with google
    window.auth = auth;

    app.title = 'Durandal Starter Kit';

    app.configurePlugins({
        router: true,
        dialog: true,
        widget: true
    });

    app.start().then(function() {
        //Replace 'viewmodels' in the moduleId with 'views' to locate the view.
        //Look for partial views in a 'views' folder in the root.
        viewLocator.useConvention();

        //Show the app by setting the root view model for our application with a transition.
        app.setRoot('viewmodels/shell', 'entrance');
    });
});


window.handleGoogleLoaded = function (result) {
    console.log(result, app);

    gapi.auth.authorize({ client_id: 'clientId', scope: 'scopes', immediate: true }, function (res) {
        console.log(res);
    });
};