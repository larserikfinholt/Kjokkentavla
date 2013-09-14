define(['durandal/system', 'durandal/app', 'azurelib'],
    function (system, app, azurelib) {


        var client = new WindowsAzure.MobileServiceClient(
            "https://kjokken.azure-mobile.net/",
            "bMMmFAajPWIagbBynXZBgxIZHZjCJt18"
        );

        var loadSettings = function () {

            return client.getTable("Settings").read();
        }

        var updateSettings = function (settings) {

            return client.getTable("Settings").update(settings);

        }

        var login = function () {

            client.login("google").then(function (user) {
                console.log("login success", user);
                app.trigger("login:success", user);
                loadSettings().done(function (settings) {
                    console.log("settings loaded from azure", settings);
                    if (settings.familyName == undefined) {
                        settings.familyName = '';
                    }
                    if (settings.familyCalendar == undefined) {
                        settings.familyCalendar = '';
                    }
                    if (settings.users == undefined) {
                        settings.users = [];
                    }
                    app.trigger("settings:loaded", settings);
                }, function (err) {
                    alert("could not load settings", err);
                });
            }, function (err) {
                app.trigger("login:fail", err);
            });
        };




        return {

            client: client,
            login: login,
            loadSettings: loadSettings,
            updateSettings: updateSettings

        }


    });