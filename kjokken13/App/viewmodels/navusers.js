define(['durandal/app','services/logger'], function (app, logger) {
    var vm = {
        title: 'Nav users View',
        users: ko.observableArray([]),
        activeUser: ko.observable('All')
    };

    app.on("settings:loaded").then(function (settings) {
        // set badge to 0 for default
        _.each(settings.users, function (u) { u.count = 0; });
        vm.users(settings.users);
    });

    return vm;


    function log(msg, d, showToast) {
        logger.log(msg, d, system.getModuleId(data), showToast);
    }

});