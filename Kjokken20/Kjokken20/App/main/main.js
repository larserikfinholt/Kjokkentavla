define(['plugins/http', 'durandal/app', 'knockout', 'user/user', 'underscore', 'calendar/dummydata', 'settings/settings'], function (http, app, ko, usermodule, _, dummydata, settings) {

    moment.lang('en', {
        week: {
            dow: 1, // Monday is the first day of the week.
            doy: 4  // The week that contains Jan 4th is the first week of the year.
        }
    });


    var vm = {
        users: ko.observableArray([]),
        selectedDate: ko.observable(new Date()),
        selectedWeek: ko.observable(moment().weekday(0)),
        showDayView: ko.observable(true),
        days: ko.observableArray([]),
        toggleView: function () {
            this.showDayView(!this.showDayView());
        },
        addUser: function (user) {
            this.users.push(user);
        },
        loadCalendars: function () {
            console.log('loading calendars for all users');
            _.each(this.users(), function (user) {
                user.loadCalendar();
            });
        },
        changeDate: function (data, event) {

            if ($(event.currentTarget).data('direction') == 'next') {
                if (this.showDayView()) {
                    this.selectedDate(new Date(this.selectedDate().getTime() + 1000 * 60 * 60 * 24));
                } else {
                    this.changeWeek(1);
                }
            } else {
                if (this.showDayView()) {
                    this.selectedDate(new Date(this.selectedDate().getTime() - 1000 * 60 * 60 * 24));
                } else {
                    this.changeWeek(-1);
                }
            }
        },
        changeWeek: function (change) {

            this.selectedWeek(this.selectedWeek().add(change, 'weeks'));

            this.days.removeAll();
            for (var i = 0; i < 6; i++) {
                var tmp = moment(this.selectedWeek());
                tmp.add(i, 'days');
                this.days.push(tmp);
            }
        }
    };

    vm.changeWeek(0);

    app.on("settings:loaded", function (settings) {
        console.log("settings loaded", settings);

        _.each(settings.users, function (user) {
            vm.addUser(new usermodule.User(user));
        });
    });

    app.on('googleauth:success', function (authResult) {
        vm.loadCalendars();
    });

    app.on("settings:updated", function (settings) {
        console.log("settings updated", settings);
        vm.users.length = 0;
        _.each(settings.users, function (user) {
            vm.addUser(new usermodule.User(user));
        });
        vm.loadCalendars();
    });


    return vm;

});