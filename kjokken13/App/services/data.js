define(['durandal/system', 'services/logger', 'services/mockdata', 'services/googledata'],
    function (system, logger, mock, google) {

        var ds = window.runMode == "GoogleAndGoogle" ? google : mock;
    
        var data = {
            getCalendar: ds.getCalendar,
            getUsers: ds.getUsers,
            loadSettings: ds.loadSettings,
            loadAvailbleCalendars:ds.loadAvailbleCalendars,
            saveSettings:ds.saveSettings
        };

        return data;

    });