define(['durandal/app','services/azuremobile', 'addons/readbook/readbook'], function (app, azuremobile, readbook) {

    var manager = {};

    manager.settings = undefined;

    manager.init = function (settings) {
        // init all apps
        readbook.init(_.settings.findWhere({ appName: 'test' }));
        manager.allSettings = settings;
    }

    manager.loadSettings = function () {
        // function not used, will be loaded together with main settings
        azuremobile.loadAddonSettings().done(function (results) {
            manager.init(results);
        });
    };


    return manager;


});