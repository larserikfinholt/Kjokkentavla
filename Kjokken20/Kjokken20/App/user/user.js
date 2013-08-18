define(['plugins/http', 'durandal/app', 'knockout', 'calendarservice/calendarservice', 'calendar/calendar-dialog'], function (http, app, ko, cal, calendarModal) {

    var User = function (init) {
        var self = this;
        this.name = init.name;
        this.entries = ko.observableArray([]);

        this.addCalendarEntry = function (entry) {
            self.entries.push(entry);
        };
        this.entriesForDate = function (date) {

            return ko.utils.arrayFilter(this.entries(), function (item) {
                var d = new Date(item.start);
                return d.getDate() == date.getDate();
            });
        };
        this.add = function (item) {
            self.showCalendarEditDialog(cal.service.getEmpty());
        };

        this.openItem = function (item) {
            self.showCalendarEditDialog(item);

        };
        this.showCalendarEditDialog = function(item){
            calendarModal.show(item).then(function (item) {
                if (item) {
                    cal.service.updateCalendarEntry(self, item);
                }
            });
        }


        this.loadCalendar = function () {
            cal.service.loadForUser(self);
        };
    };

    return {

        User:User

    }


});