define(['plugins/http', 'durandal/app', 'knockout', 'calendarservice/calendarservice'], function (http, app, ko, cal) {

    var User = function (init) {
        var self = this;
        this.name = init.name;
        this.entries = ko.observableArray([]);

        this.addCalendarEntry = function (entry) {
            self.entries.push(entry);
        };

        this.loadCalendar = function () {
            cal.service.loadForUser(self);
        };
    };

    return {

        User:User

    }


});