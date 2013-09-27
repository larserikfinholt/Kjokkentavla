define(['plugins/router', 'durandal/app', 'main/main', 'logf'], function (router, app, main, logf) {
    var shell= {
        router: router,
        search: function() {
            //It's really easy to show a message box.
            //You can add custom options too. Also, it returns a promise for the user's response.
            app.showMessage('Search not yet implemented...');
        },
        loggedIn: ko.observable(false),

        activate: function () {
            router.map([
                { route: '', title:'Main', moduleId: 'main/main', nav: true },
                { route: 'flickr', moduleId: 'viewmodels/flickr', nav: true },
            { route: 'settings', moduleId: 'settings/settings', nav: true }
            ]).buildNavigationModel();
            
            return router.activate();
        }
    };

    app.on("login:success", function (authResult) {
        logf.auth("Authentication sucess - removing login screen", authResult, true);
        shell.loggedIn(true);
    });

    return shell;
});