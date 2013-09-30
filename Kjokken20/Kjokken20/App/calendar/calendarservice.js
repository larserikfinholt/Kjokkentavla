define(['plugins/http', 'durandal/app', 'knockout', 'underscore','calendar/dummydata', 'services/googleCalendar', 'addons/manager', 'calendar/calendarEntry'], function (http, app, ko,_, dummydata, googleCalendar, addonManager, calendar) {


    function googleData(user) {
        var now = new Date();
        if (user.calendar) {
            //console.log('start loading from calendar ' + user.calendar, user);
            googleCalendar.loadCalendar({ calendarId: user.calendar, timeMin: '2013-09-13T21:32:53.699Z', timeMax:'2014-09-14T21:32:53.699Z', singleEvents:true }).then(function (result) {

                if (result != undefined) {
                    _.each(result, function (item) {
                        var toAdd = new calendar.CalendarEntry({ id: item.etag, title: item.summary, start: moment(item.start.dateTime), type:0 });
                        user.addCalendarEntry(toAdd);

                    });
                } else {
                    //console.log('no results from', user);
                }

            });
        }
    }



    function randomData(user) {
        var id = 0;
        var max1 = Math.floor(Math.random() * 4) + 1;
        var max2 = Math.floor(Math.random() * 4);
        var date = Date();
        for (var i = 0; i < max1; i++) {
            user.addCalendarEntry(new calendar.CalendarEntry({ id: id++, title: 'Fotballtrening title' + i, start: date, type: 0 }));
        }
        for (var i = 0; i < max2; i++) {
            user.addCalendarEntry(new calendar.CalendarEntry({ id: id++, title: 'Husk dette' + i, start: date, type: 1 }));
        }


        max1 = Math.floor(Math.random() * 4) + 1;
        max2 = Math.floor(Math.random() * 3);

        date = new Date(new Date().getTime() + 1000 * 60 * 60 * 24);
        for (var i = 0; i < max1; i++) {
            user.addCalendarEntry(new calendar.CalendarEntry({ id: id++, title: 'ImorgenAktitet title' + i, start: date, type: 0 }));
        }
        for (var i = 0; i < max2 ; i++) {
            user.addCalendarEntry(new calendar.CalendarEntry({ id: id++, title: 'Remember this' + i, start: date, type: 1 }));
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
                        user.addCalendarEntry(new calendar.CalendarEntry({ id: idcount++, title: data.title, start: date, type: 1, todoId: data.id }));
                    }
                });
            });
            for (var j = 0; j < 3; j++) {
                user.addCalendarEntry(new calendar.CalendarEntry({ id: idcount++, title: 'Fotballtrening title' + j, start: date, type: 0 }));
            }
        }
    }

    var calendarService = {
        loadForUser: function (user) {

            //randomData(user);
            //dummyData(user);
            googleData(user);

        },
        updateCalendarEntry: function (user, item) {
            user.entries.remove(function (toRemove) { return toRemove.id == item.id; });
            if (item.deleteMe) {
                console.log("deleted");
            } else {
                console.log("updated");
                item.id = 99;
                user.addCalendarEntry(item);
            }
        },
        getEmpty: function () {
            return new calendar.CalendarEntry({ id: -1, title: '', start: new Date() });
        }
    };

  

    return {

        service: calendarService,

    }


});