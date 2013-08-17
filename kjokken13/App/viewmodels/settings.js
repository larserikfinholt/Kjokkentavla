define(['durandal/system', 'services/logger', 'durandal/app', 'services/data', 'plugins/router', 'knockout', 'underscore', 'knockout.mapping'],
    function (system, logger, app, data, router, ko, _, komap) {
        var vm = {
            settings: ko.observable(),
            title: 'Settings',
            loadComplete: false,
            wizard: ko.observable(''),

            hasLoaded: function () {
                return this.loadComplete;
            },
            updateSettings: function (s) {
                this.settings(komap.fromJS(s));
                this.loadComplete = true;
                log("Settings loaded", s);
            },

            getSettings: function () {
                var set = komap.toJS(this.settings);
                return set;
            },

            deleteUser: function (user) {
                this.settings.users.remove(user);
            },

            newUser: function () {
                this.settings.users.push({ id: "", calendar: "", name: "" });
            },
            loadSettings: function (authResult) {
                console.log("start loading settings...");
                return data.loadSettings(authResult).then(function (s) {
                    vm.updateSettings(s);
                    vm.loadComplete = true;
                    if (vm.isValid()) {
                        app.trigger("settings:loaded", s);
                        //router.navigate("calendar");

                    } else {
                        //router.navigate("settings");
                    }
                });
            },

            saveSettings: function () {
                var toSave = komap.toJS(this.settings);
                return data.saveSettings(toSave).done(function () {
                    log("settings saved", toSave);
                    app.trigger("settings:updated", toSave);
                    router.navigate("calendar");
                });
            },


        };

        vm.isValid = ko.computed(function () {
            if (this.settings() == undefined) { return false; }

            if (!(this.settings().familyName())) {
                log("Setting validation failed - missing familyName");
                return false;
            }
            if (!(this.settings().mainCalendar())) {
                log("Setting validation failed - missing main calendar");
                return false;
            }
            if (!(this.settings().users().length > 0)) {
                log("Setting validation failed - not enough users", this.settings);
                return false;
            }
            return true;


        }, vm)


        app.on("authentication:success", vm.loadSettings);


        return vm;


        function log(msg, data, showToast) {
            console.log(msg, data);
            logger.log(msg, data, system.getModuleId(vm), showToast);
        }

    });