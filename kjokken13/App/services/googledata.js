define(['durandal/system', 'services/logger'],
    function (system, logger) {


        var data = {
            getCalendar: getCalendar,
            getUsers: getUsers,
            loadSettings: loadSettings,
            loadAvailbleCalendars: loadAvailbleCalendars,
            saveSettings: saveSettings
        };

        return data;

        function getCalendar(user, suc) {
            log("Getting calendar for", user.name);
            return $.getJSON("/calendars/" + user.name).success(suc);
        }

        function getUsers() {
            return $.ajax({
                url: "/services/2",

            });
        }

        function loadSettings() {

        }

        function saveSettings(toSave) {
            return $.ajax({
                url: "/users/1",
                data: { action: "bar" },
                type: 'POST',
            });
        }
        function loadAvailbleCalendars() {
            return $.getJSON("/availbleCalendars/1", { action: "bar" });

        }


        function log(msg, d, showToast) {
            logger.log(msg, d, system.getModuleId(data), showToast);
        }



    });