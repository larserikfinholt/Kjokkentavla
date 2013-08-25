define(['plugins/http', 'durandal/app', 'knockout', 'underscore','calendar/dummydata'], function (http, app, ko,_, dummydata) {

    var CalendarEntry = function (init) {
        var self = this;

        this.title = init.title;
        this.start = init.start;
        this.id = init.id;
        this.type = init.type;

    };

    function randomData(user) {
        var id = 0;
        var max1 = Math.floor(Math.random() * 4) + 1;
        var max2 = Math.floor(Math.random() * 4);
        var date = Date();
        for (var i = 0; i < max1; i++) {
            user.addCalendarEntry(new CalendarEntry({ id: id++, title: 'Fotballtrening title' + i, start: date, type: 0 }));
        }
        for (var i = 0; i < max2; i++) {
            user.addCalendarEntry(new CalendarEntry({ id: id++, title: 'Husk dette' + i, start: date, type: 1 }));
        }


        max1 = Math.floor(Math.random() * 4) + 1;
        max2 = Math.floor(Math.random() * 3);

        date = new Date(new Date().getTime() + 1000 * 60 * 60 * 24);
        for (var i = 0; i < max1; i++) {
            user.addCalendarEntry(new CalendarEntry({ id: id++, title: 'ImorgenAktitet title' + i, start: date, type: 0 }));
        }
        for (var i = 0; i < max2 ; i++) {
            user.addCalendarEntry(new CalendarEntry({ id: id++, title: 'Remember this' + i, start: date, type: 1 }));
        }

    }
    function dummyData(user) {
        var idcount = 0;
        for (var i = 0; i < 7; i++) {
            var date = new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * i);

            var day = date.getDay();
            _.each(dummydata.todos, function (data) {
                _.each(data.userIds[day], function (userId) {
                    if (user.id == userId) {
                        user.addCalendarEntry(new CalendarEntry({ id: idcount++, title: data.title, start: date, type: 1, todoId: data.id }));
                    }
                });
            });
            for (var j = 0; j < 3; j++) {
                user.addCalendarEntry(new CalendarEntry({ id: idcount++, title: 'Fotballtrening title' + j, start: date, type: 0 }));
            }
        }
    }

    var calendarService = {
        loadForUser: function (user) {

            //randomData(user);
            dummyData(user);



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