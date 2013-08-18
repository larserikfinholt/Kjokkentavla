define(['plugins/http', 'durandal/app', 'knockout'], function (http, app, ko) {

    var CalendarEntry = function (init) {
        var self = this;

        this.title = init.title;
        this.start = init.start;
        this.id = init.id;

    };

    var calendarService = {
        loadForUser: function (user) {
            var id = 0;
            for (var i = 0; i < 3; i++) {
                user.addCalendarEntry(new CalendarEntry({ id:id++, title: 'Fotballtrening title' + i, start: Date() }));
            }
            for (var i = 0; i < 3; i++) {
                user.addCalendarEntry(new CalendarEntry({ id: id++, title: 'ImorgenAktitet title' + i, start: new Date(new Date().getTime() + 1000 * 60 * 60 * 24) }));
            }
        },
        updateCalendarEntry: function (user, item) {
            user.entries.remove(function (toRemove) { return toRemove.id == item.id; });
            if (item.deleteMe) {
                console.log("deleted");
            } else {
                console.log("updated");
                item.id = 99;
                user.entries.push(item);
            }
        },
        getEmpty: function () {
            return new CalendarEntry({ id: -1, title: '', start: new Date() });
        }
    };

  

    return {

        service: calendarService,
        CalendarEntry: CalendarEntry

    }


});