define(['durandal/app','services/azuremobile', 'addons/scheduler','addons/readbook/readbook'], function (app, azuremobile, scheduler, readbook) {

    var manager = {};

    function dummySettings() {
        var readBookSettings = {

            schedule: new scheduler.Schedule({

                display: 'wholeday',
                repeat: 'weekly',
                users: [
                    {
                        name: 'Lars',
                        days: [0, 2, 3]
                    }
                ],
            }),

            popup: new scheduler.OnClickPopup({

                title: 'Hvor mye har du lest?',
                values: [
                    { title: '15 min', value: 15 },
                    { title: '15 min', value: 15 }
                ],
                actions: ['closeDialog', 'hideItem']
            }),

            activeBook: 'Tonje Glimmerdal',


        };
        return readBookSettings;

    };

    manager.init = function (settings, users) {
        var self = this;
        azuremobile.loadAddonData().then(function (data) {
            // init all apps
            var readbookSettings = dummySettings(); // _.settings.findWhere({ appName: 'test' })
            readbook.init(readbookSettings, data, users);

            self.initCompleted = true;
        });
    }

    manager.saveAddonEntry = function (entry) {

        azuremobile.saveAddonEntry(entry);

    };

    manager.deleteAddonEntry = function (entryId) {

        azuremobile.deleteAddonEntry(entryId);

    };


    return manager;


});