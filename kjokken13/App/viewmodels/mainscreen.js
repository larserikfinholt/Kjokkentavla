define(['services/logger', 'viewmodels/models', 'viewmodels/users'], function (logger, models, usersmodel) {
    var vm = {
        activate: activate,
        title: 'Details View',

        users: ko.observableArray([]),

        updateSettings: function (settings) {
            _.each(settings.users, function (user) {

                users.push(new models.User(user));

                data.getCalendar(user, function (d) {
                    //console.log(d.entries);
                    ko.utils.arrayPushAll(self.entries(), d.entries);
                    self.entries.valueHasMutated();
                });
            });


        }
    };


    app.on("settings:loaded").then(function (settings) {
        vm.updateSettings(settings);
    });

    return vm;

});