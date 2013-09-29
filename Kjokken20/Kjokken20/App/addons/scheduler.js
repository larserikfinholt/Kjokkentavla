define([], function () {

    var Schedule = function (options) {

        this.displayTimeOptions = ['Whole day', 'Morning', 'Evening'];
        this.displayTime = options.displayTime;
        this.repeatOptions = ['Weekly', 'Monthly'];
        this.repeat = options.repeat;
        this.users = options.users;
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