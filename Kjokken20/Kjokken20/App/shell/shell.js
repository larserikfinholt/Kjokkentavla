define(['plugins/router', 'durandal/app', 'main/main'], function (router, app, main) {
    return {
        router: router,
        search: function() {
            //It's really easy to show a message box.
            //You can add custom options too. Also, it returns a promise for the user's response.
            app.showMessage('Search not yet implemented...');
        },
        activate: function () {
            router.map([
                { route: '', title:'Main', moduleId: 'main/main', nav: true },
                { route: 'flickr', moduleId: 'viewmodels/flickr', nav: true }
            ]).buildNavigationModel();
            
            app.trigger("settings:loaded", {});

            return router.activate();
        }
    };
});