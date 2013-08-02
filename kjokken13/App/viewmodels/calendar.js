define(['durandal/system', 'services/logger', 'durandal/app', 'services/data', 'knockout', 'underscore'],
    function (system, logger, app, data, ko, _) {
    var vm = {
        title: 'Calendar2',
        entries: ko.observableArray([]),
        settings: null,

        updateSettings: function(settings) {
            this.settings=settings;
            this.loadAll();
        },

        loadAll: function() {
            var self = this;
            log('Load all calendars');

            _.each(self.settings.users, function (user) {
                data.getCalendar(user, function (d) {
                    //console.log(d.entries);
                    ko.utils.arrayPushAll(self.entries(), d.entries);
                    self.entries.valueHasMutated();
                });
            });
        },
        canActivate: function () {
            return this.settings=!null;
        },
        activate: function (context) {
            var self = this;
            log("activate calendar", context);
            if (!this.settings) {
                log("Calendar not ready - settings not availible");
            }
        },

        test: function () {
            app.trigger("appcount:changed", { context: "all", values: [{ app: 'calendar', count: 3 }, { app: 'husk', count: 5 }] });
        }
    };

    app.on("settings:loaded").then(function (settings) {
        vm.updateSettings(settings);
    });

    return vm;


    function log(msg, data, showToast) {
        logger.log(msg, data, system.getModuleId(vm), showToast);
    }

});