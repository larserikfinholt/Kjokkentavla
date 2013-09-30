define(['calendar/calendarEntry'], function (calendar) {

    var Schedule = function (options) {

        this.displayTimeOptions = ['Whole day', 'Morning', 'Evening'];
        this.displayTime = options.displayTime;
        this.repeatOptions = ['Weekly', 'Monthly'];
        this.repeat = options.repeat;
        this.users = options.users;

        this.getScheduledItems=function(start, stop, options){

            var items;





            items.push(new calendar.CalendarEntry({ title: options.title, start: moment.utc().toISOString(), type: options.type }));

            return items;
        };
    }

    var OnClickPopup = function (options) {

        this.title=options.title;
        this.values=options.values;
        this.actionOptions=['closeDialog', 'hideItem'];
        this.actions=options.values;

    }

    return {

        OnClickPopup: OnClickPopup,
        Schedule:Schedule
    }

});