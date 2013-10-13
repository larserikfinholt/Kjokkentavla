define(['plugins/http', 'durandal/app', 'knockout', 'user/user', 'underscore', 'calendar/dummydata', 'settings/settings', 'addons/manager', 'addons/settings', 'logf'],
    function (http, app, ko, usermodule, _, dummydata, settings, addonManager, addonSettings, logf) {

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
        init: function (settings) {
            var self = this;
            // Remove all users
            self.clearAll();
            // Add users bacck
            _.each(settings.users, function (user) {
                self.addUser(new usermodule.User(user));
            });
            // Load calendars

            ////////////////////

            console.log("Skipping calendar load");return;
            logf.debug('loading calendar items for all users');
            _.each(this.users(), function (user) {
                user.loadCalendar();
            });
        },
        addUser: function (user) {
            this.users.push(user);
        },
        clearAll: function() {
            this.users.removeAll();
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
        logf.event("settings loaded");
        vm.init(settings);
        addonManager.init(settings.addonSettings, vm.users());
    });

    app.on('login:success', function (authResult) {
        logf.event('login:success');
    });

    app.on("settings:updated", function (settings) {
        logf.event("settings updated");
        vm.init(settings);
    });
    app.on("logon:fail", function (feil) {
        logf.event("logon:fail", feil);
    });





    return vm;

});