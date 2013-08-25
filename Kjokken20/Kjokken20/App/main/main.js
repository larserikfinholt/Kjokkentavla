define(['plugins/http', 'durandal/app', 'knockout', 'user/user', 'underscore', 'calendar/dummydata'], function (http, app, ko, usermodule, _, dummydata) {

    

    var vm = {
        users: ko.observableArray([]),
        selectedDate: ko.observable(new Date()), 
        addUser: function (user) {
            this.users.push(user);
        },
        loadCalendars: function () {
            _.each(this.users(), function (user) {
                user.loadCalendar();
            });
        },
        changeDate: function (data, event) {
            if ($(event.currentTarget).data('direction') == 'next') {
                this.selectedDate(new Date(this.selectedDate().getTime() + 1000 * 60 * 60 * 24));
            } else {
                this.selectedDate(new Date(this.selectedDate().getTime() - 1000 * 60 * 60 * 24));
            }
        }
    };

    app.on("settings:loaded", function () {

        _.each(dummydata.users, function (user) {

            vm.addUser(new usermodule.User(user));
        });


        vm.loadCalendars();


    });


    return vm;

});