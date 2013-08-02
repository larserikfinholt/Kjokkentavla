define(['plugins/router', 'durandal/app'], function (router, app) {
    var shell = {
        router: router,
        search: function() {
            //It's really easy to show a message box.
            //You can add custom options too. Also, it returns a promise for the user's response.
            app.showMessage('Search not yet implemented...');
        },
        activate: function () {
            router.map([
                { route: '', title:'Home', moduleId: 'viewmodels/home', nav: true },
                { route: 'settings', moduleId: 'viewmodels/settings', nav: true },
                { route: 'calendar', moduleId: 'viewmodels/calendar', nav: true }
            ]).buildNavigationModel();
            
            return router.activate();
        },
        loggedIn: ko.observable(false)

    };

    app.on("authentication:success", function (authResult) {
        log("Authentication sucess", authResult, true);

        shell.loggedIn(true);
    });


    return shell;



    function log(msg, data, showToast) {
        //logger.log(msg, data, system.getModuleId(shell), showToast);
        console.log(msg);
    }
});