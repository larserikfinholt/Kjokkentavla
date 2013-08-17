/// <reference path="../../Scripts/knockout-2.2.1.js" />
define(['durandal/system', 'services/logger', 'durandal/app', 'services/data', 'knockout', 'underscore'],
    function (system, logger, app, data, ko, _) {
        var vm = {

            title: 'Calendar2',
            entries: ko.observableArray([]),
            currentDay: ko.observable(new Date()),
            users: ko.observableArray( []),
            settings: null,

            updateSettings: function (settings) {
                this.settings = settings;
                this.users(settings.users);
                this.loadAll();
            },

            next: function() {
                this.currentDay(new Date(this.currentDay().getTime() + 1000 * 60 * 60 * 24));
            },

            prev: function () {
                this.currentDay(new Date(this.currentDay().getTime() -  1000 * 60 * 60 * 24));
            },


            loadAll: function () {
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
                return this.settings = !null;
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

        vm.day0 = ko.computed(function () {
            return ko.utils.arrayFilter(this.entries(), function (item) {
                var d = new Date(item.start);
                return d.getDate() == vm.currentDay().getDate();
            });
        }, vm);

        vm.day1 = ko.computed(function () {
            return ko.utils.arrayFilter(this.entries(), function (item) {
                var d = new Date(item.start);
                return d.getDate() == (vm.currentDay().getDate()+1);
            });
        }, vm);

        vm.day2 = ko.computed(function () {
            return ko.utils.arrayFilter(this.entries(), function (item) {
                var d = new Date(item.start);
                return d.getDate() == (vm.currentDay().getDate() + 2);
            });
        }, vm);


        app.on("settings:loaded").then(function (settings) {
            vm.updateSettings(settings);
        });

        return vm;


        function log(msg, data, showToast) {
            logger.log(msg, data, system.getModuleId(vm), showToast);
        }

    });