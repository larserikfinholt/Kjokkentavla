define(['plugins/http', 'durandal/app', 'knockout'], function (http, app, ko) {

    var CalendarEntry = function (init) {
        var self = this;

        this.title = init.title;
        this.start = init.start;

    };

    var calendarService = {
        loadForUser: function (user) {
            for (var i = 0; i < 3; i++) {
                user.addCalendarEntry(new CalendarEntry({ title: 'Fotballtrening title' + i, start: Date() }));
            }
            for (var i = 0; i < 3; i++) {
                user.addCalendarEntry(new CalendarEntry({ title: 'ImorgenAktitet title' + i, start: new Date(new Date().getTime() + 1000 * 60 * 60 * 24) }));
            }
        }
    };

  

    return {

        service: calendarService,
        CalendarEntry: CalendarEntry

    }


});