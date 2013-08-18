define(['plugins/http', 'durandal/app', 'knockout', 'user/user', 'underscore'], function (http, app, ko, usermodule, _) {

    

    var vm = {
        users: ko.observableArray([]),
        currentDay: ko.observable(new Date()),
        addUser: function (user) {
            this.users.push(user);
        },
        loadCalendars: function () {
            _.each(this.users(), function (user) {
                console.log(user);
                user.loadCalendar();
            });
        },


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