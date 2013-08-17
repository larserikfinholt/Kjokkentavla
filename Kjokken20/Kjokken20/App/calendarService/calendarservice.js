define(['plugins/http', 'durandal/app', 'knockout'], function (http, app, ko) {

    var CalendarEntry = function (init) {
        var self = this;

        this.title = init.title;
        this.start = init.start;

    };

    var calendarService = {
        loadForUser: function (user) {
            console.log("loading calendar for usera ", user);
            for (var i = 0; i < 3; i++) {
                user.addCalendarEntry(new CalendarEntry({ title: 'Fotballtrening title' + i, start: Date() }));
            }
        }
    };

  

    return {

        service: calendarService,
        CalendarEntry: CalendarEntry

    }


});