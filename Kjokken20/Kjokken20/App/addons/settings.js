define(['logf', 'durandal/app','addons/scheduler', 'addons/readbook/readbooksettings', 'settings/settings'], function (logf,app, scheduler, readbook, mainSettings) {

    var settingsDfd = new jQuery.Deferred();

    var vm = {

        detailSettings: ko.observable(),
        schedule: ko.observable(),
        allUsers: ko.observableArray([]),
        allSavedSettings: [],
        settingsRetrived: function () { return settingsDfd.promise(); },

        init: function (allUsers, allSettings) {
            this.allUsers(allUsers);
            this.allSavedSettings=allSettings;
        },
        save: function(){

            logf.debug('saving addon settings', this);
        },
        activate: function (id) {
            logf.info('Activating route', id);
            var self = this;
            return this.settingsRetrived().then(function () {

                logf.debug("Initializing addonsettings", id, self.allUsers());

                self.schedule(new scheduler.Schedule({

                    display: 'wholeday',
                    repeat: 'weekly',
                    users: [
                        {
                            name: 'Lars',
                            days: [0, 2, 3]
                        }
                    ],
                }));
                switch (id) {
                    case '1':
                        self.detailSettings(new readbook.ReadbookSettings('jalla'));
                        break;
                    default:
                        logf.warn('Invalid setting id', id);

                }
            });
        },
       


    };

    app.on("settings:loaded", function (settings) {
        vm.init(settings.users, settings.addonSettings);
        logf.debug("...resolving settingsDfd");
        settingsDfd.resolve(true);
    });


    return vm;
})