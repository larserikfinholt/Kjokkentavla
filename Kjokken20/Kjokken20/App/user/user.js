define(['plugins/http', 'durandal/app', 'knockout', 'calendarservice/calendarservice'], function (http, app, ko, cal) {

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
        this.openItem = function (item) {

            console.log(item);

        };


        this.loadCalendar = function () {
            cal.service.loadForUser(self);
        };
    };

    return {

        User:User

    }


});