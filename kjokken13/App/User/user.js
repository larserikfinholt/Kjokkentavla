define(['durandal/system', 'services/calendar'], function (system, calendarService) {

    var User = function (init) {
        var self = this;
        console.log('creating user', init);
        this.name = init.name;
        this.calendar = init.calendar;

        this.loadCalendar = function () {

            calendarService.loadForUser(self);|

        }

    }

    

    return {
        User: User,
    }

});