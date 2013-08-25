define(['plugins/http', 'durandal/app', 'knockout', 'calendarservice/calendarservice', 'calendar/calendar-dialog', 'calendar/todo-dialog'], function (http, app, ko, cal, calendarModal,todoDialog) {

    var User = function (init) {
        var self = this;
        this.name = init.name;
        this.id = init.id;
        this.entries = ko.observableArray([]);

        this.addCalendarEntry = function (entry) {
            self.entries.push(entry);
        };
        this.entriesForDate = function (date, type) {

            return ko.utils.arrayFilter(this.entries(), function (item) {
                var d = new Date(item.start);
                return d.getDate() == date.getDate() &&
                    item.type== type;
            });
        };
        this.add = function (item) {
            self.showCalendarEditDialog(cal.service.getEmpty());
        };

        this.openItem = function (item) {
            if (item.type == 0) {
                self.showCalendarEditDialog(item);
            } else {
                self.showToDoEditDialog(item);
            }
        };
        this.showCalendarEditDialog = function(item){
            calendarModal.show(item).then(function (item) {
                if (item) {
                    cal.service.updateCalendarEntry(self, item);
                }
            });
        }
        this.showToDoEditDialog = function (item) {
            todoDialog.show(item).then(function (item) {
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