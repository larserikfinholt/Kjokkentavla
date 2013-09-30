define([], function () {

    var CalendarEntry = function (init) {
        var self = this;

        this.title = init.title;
        this.start = init.start;
        this.id = init.id;
        this.type = init.type;

    };

    return {
        CalendarEntry:CalendarEntry
    }

});