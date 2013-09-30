define(['plugins/http', 'durandal/app', 'knockout', 'calendar/calendarservice', 'calendar/calendar-dialog', 'calendar/todo-dialog'], function (http, app, ko, cal, calendarModal,todoDialog) {

    var User = function (init) {
        var self = this;
        this.name = init.name;
        this.id = init.id;
        this.calendar = init.calendar;
        this.entries = ko.observableArray([]);

        this.addCalendarEntry = function (entry) {
            self.entries.push(entry);
        };
        this.entriesForDate = function (date, type){//, index) {
            //var tmp = 0
            //if (index) {
            //    tmp = index();
            //    console.log(date, tmp);
            //}
            return ko.utils.arrayFilter(this.entries(), function (item) {
                //var d = moment(item.start).add(tmp, 'days');
                var d = moment(item.start);//.add(tmp, 'days');
                return d.isSame(date, 'day') &&
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