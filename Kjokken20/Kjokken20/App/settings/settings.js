define(['plugins/http', 'durandal/app', 'knockout', 'komap', 'calendar/dummydata', 'settings/user-dialog', 'services/azuremobile', 'services/googlecalendar','logf'], function (http, app, ko, komap, dum, userDialog, azureService, googleCalendarService,logf) {

    var UserVM = function (option) {
        this.id = option.id;
        this.name = ko.observable(option.name);
        this.calendar = ko.observable(option.calendar);
    }


    var SettingsVM = function (option) {
        this.id = option.id;
        this.familyName = ko.observable(option.familyName);
        this.familyCalendar = ko.observable(option.familyCalendar);
        this.users = ko.observableArray(option.users);
    }



    var vm = {
        title: 'Jalla',
        saved: null,
        
        settings: ko.observable(''),
        availibleCalendars: ko.observableArray([]),
        isNotGoogleAuthenticated: ko.observable(true),

        editUser: function (user) {
            logf.debug("editiing user:", user);
        },
        editUser: function (item) {
            userDialog.show(item).then(function (item) {
                if (item) {
                    console.log(item);
                    if (item.deleteMe == true) {
                        vm.settings().users.remove(item);
                    }

                    //cal.service.updateCalendarEntry(self, item);
                }
            });
        },
        newUser: function () {
            this.settings().users.push({ name: ko.observable(''), calendar: ko.observable(''), id: ko.observable(-1) });
            logf.debug('added empty user', this.settings());
        },
        updateNewUsersWithUniqeId: function(users){
            console.log(users);
            var highestId = (_.max(users, function (user) {
                return user.id;
            })).id;
            var noIds = _.where(users, { id: -1 });
            _.each(noIds, function (user) {
                user.id = ++highestId;
            });

        },
        saveSettings: function () {
            // make any new userIds uniqe
            this.saved = komap.toJS(this.settings);
            this.updateNewUsersWithUniqeId(this.saved.users);

            logf.debug("Saving settings to azure....", this.saved);
            azureService.updateSettings(this.saved);
            app.trigger("settings:updated", this.saved);
        },
        grantGoogleAccess: function () {
            var self = this;
            googleCalendarService.grantAccessToCalendars(false).then(function(){
                self.loadAvailibleCalendars();
            });

        },
        loadAvailibleCalendars: function () {
            var self = this;
            googleCalendarService.getAvailibleCalendars().then(function (calendars) {
                logf.debug('Got availible calendars', calendars);
                self.availibleCalendars(calendars);
                self.settings(komap.fromJS(vm.saved, mapping));
            });

        },
        activate: function () {
            logf.debug("Activate Settings");
            var self = this;
            if (this.availibleCalendars.length == 0) {
                self.loadAvailibleCalendars();
            }
        }

    };

    var mapping = {
        'users': {
            create: function (options) {
                return new UserVM(options.data);
            }
        }
    };

    app.on('googleauth:success', function (authResult) {
        logf.event("googleauth:success");
        logf.auth("starting azure login process...", authResult);
        vm.isNotGoogleAuthenticated(false);
        azureService.login(authResult);
    });
    app.on("settings:updated", function (settings) {
        vm.saved = settings;
        vm.settings(komap.fromJS(vm.saved, mapping));
    });

    app.on("settings:loaded", function (settings) {
        vm.saved = settings;
        //vm.grantGoogleAccess();
    });

    return vm;


});