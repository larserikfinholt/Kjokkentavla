define(['durandal/system', 'viewmodels/models', 'durandal/app', 'services/data', 'viewmodels/settings'],
    function (system, models, app, data, settings) {

        var usersVm = {
            
            users: ko.observableArray([]),

            updateSettings: function (settings) {
                var self = this;
                _.each(settings.users, function (user) {
                    var userToAdd = new models.User(user);
                    userToAdd.loadCalendars();
                    self.users.push(userToAdd);
                });
            }

        };


        app.on("settings:loaded").then(function (settings) {
            usersVm.updateSettings(settings);
        });

            
        return usersVm;

    });