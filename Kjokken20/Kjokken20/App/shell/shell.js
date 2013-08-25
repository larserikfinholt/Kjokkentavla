define(['plugins/router', 'durandal/app', 'main/main'], function (router, app, main) {
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
                { route: 'flickr', moduleId: 'viewmodels/flickr', nav: true }
            ]).buildNavigationModel();
            
            app.trigger("settings:loaded", {});

            return router.activate();
        }
    };

    app.on("authentication:success", function (authResult) {
        log("Authentication sucess", authResult, true);

        shell.loggedIn(true);
    });

    return shell;
});