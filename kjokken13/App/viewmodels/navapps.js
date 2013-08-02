define(['durandal/app','services/logger'], function (app,logger) {



    var vm = {
        title: 'Nav apps View',
        apps: ko.observableArray([]),
        activeApp: ko.observable('All')
    };


    app.on("apps:loaded").then(function (apps) {

        logger.log('Apps loaded', apps, 'apps', true);
        vm.apps(apps);
    });

    return vm;

});