define(['plugins/http', 'durandal/app', 'knockout', 'user/user', 'underscore'], function (http, app, ko, usermodule, _) {

    

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


        vm.addUser(new usermodule.User({ name: 'user1' }));
        vm.addUser(new usermodule.User({ name: 'user2' }));
        vm.addUser(new usermodule.User({ name: 'user3' }));
        vm.addUser(new usermodule.User({ name: 'user4' }));
        vm.addUser(new usermodule.User({ name: 'user5' }));

        vm.loadCalendars();


    });


    return vm;

});