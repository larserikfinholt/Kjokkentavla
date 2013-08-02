define(['durandal/system', 'durandal/plugins/router', 'durandal/app', 'services/logger', 'services/data','viewmodels/settings', 'viewmodels/calendar'],
    function (system, router, app, logger, data,se,calendar) {
        var self = this;
        var shell = {
            activate: activate,
            router: router,
            loggedIn: ko.observable(false)
        };

        app.on("authentication:success", function (authResult) {
            log("Authentication sucess", authResult, true);

            shell.loggedIn(true);
        });
        

      

        return shell;

        //#region Internal Methods
        function activate() {
            //return boot();

            router.map([
               { route: '', title: 'Home', moduleId: 'viewmodels/home', nav: true },
               { route: 'settings', moduleId: 'viewmodels/settings', nav: true }
            ]).buildNavigationModel();

            return router.activate();
        }

        function boot() {
            router.mapNav('home');
            router.mapNav('calendar');
            router.mapRoute('settings');
            log('Boot completed!', null, true);
            return router.activate('home');
        }

        function log(msg, data, showToast) {
            logger.log(msg, data, system.getModuleId(shell), showToast);
        }
        //#endregion
    });