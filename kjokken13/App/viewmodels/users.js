define(['durandal/system', 'services/logger', 'durandal/app', 'services/data', 'viewmodels/settings'],
    function (system, logger, app, data, settings) {

        var vm = {
            title: "Manage users",
            selectedUser: ko.observable({}),
            useOwnCalendar: ko.observable(false),
            calendars: ko.observable(),
            save: function () {
                var self = this;
                var dialogResult = {};
                dialogResult.user = this.selectedUser();
                return self.modal.close(dialogResult);
            },
            activate: function (context) {
                var self = this;
                this.selectedUser(context);
                log("Activate User", context);
                if (this.calendars.length == 0) {
                    return data.loadAvailbleCalendars().done(function (d) {
                        log("loadAvailbleCalendars done", d);
                        self.calendars = ko.mapping.fromJS(d);
                        return self;
                    });
                }
                return true;
            }

        };


        return vm;

        function log(msg, data, showToast) {
            logger.log(msg, data, system.getModuleId(vm), showToast);
        }

    });