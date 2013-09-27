define(['durandal/system', 'durandal/app', 'azurelib', 'logf'],
    function (system, app, azurelib, logf) {


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


        var loadAddonSettings = function () {

            logf.debug("loading addonsettings....");

            return client.getTable("AddonSettings").read();
        }




        var updateAddonSettings = function (settings) {

            return client.getTable("AddonSettings").update(settings);

        }
        var loadAddonData = function () {

            return client.getTable("AddonData").read();
        }


        var login = function (googleAuthResult) {

            logf.auth('Azure client doing google login with token', googleAuthResult.access_token);
            client.login("google",  {"access_token": googleAuthResult.access_token}).then(function (user) {
                logf.auth("Azure client login success for user", user);
                app.trigger("login:success", user);
                loadSettings().done(function (settings) {
                    logf.debug("settings loaded from azure", settings);
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
            updateSettings: updateSettings,
            updateAddonSettings: updateAddonSettings,
            loadAddonSettings: loadAddonSettings,
            loadAddonData: loadAddonData,


        }


    });