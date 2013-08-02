define(['durandal/system', 'services/logger', 'durandal/app'],
    function (system, logger,app) {
        var data = {
            handleClientLoad: handleClientLoad,
            checkAuth: checkAuth,
            handleAuthResult: handleAuthResult,
            handleAuthClick: handleAuthClick,
            verifyAllScopes: verifyAllScopes,
            getCalendar: getCalendar,
            getUsers: getUsers,
            loadSettings: loadSettings,
            loadAvailbleCalendars:loadAvailbleCalendars,
            saveSettings:saveSettings
        };




        $.mockJSON.data.APPNAME = [
        'calendar',
        'Husk',
          'Trening'
        ];
        // fake calendars
        $.mockJSON.data.CALENDAR = [
            "lars.erik.finholt@gmail.com",
            "sigrid.finholt@gmail.com",
            "markus.finholt@gmail.com",
            "camilla.finholt@gmail.com",

        ]
        // fake entry titles
        $.mockJSON.data.TITLE = [
            "Bursdag",
            "Forballtrening",
            "Foreldremøte",
            "Jobbe seint",
            "Rette prøver",
            "Fotballkamp",
            "KRIK",
            "Nærmiljømøte"
        ]

        // fake dates
        $.mockJSON.data.DATES = [];
        var now = new Date();
        for (var i = 0; i < 50; i++) {
            $.mockJSON.data.DATES.push((new Date(now.getTime() + 1000 * 60 * 60 * Math.random() * 50)).toJSON());
        }

        // Settings service
        // settings/* 
        $.mockjax({
            url: '/settings/*',
            data: { action: "bar" },
            responseTime: 750,
            responseText: $.mockJSON.generateFromTemplate({
                "users|3-7": [
                    {
                        "name": '@MALE_FIRST_NAME',
                        "calendar": "@CALENDAR",
                    }],
                mainCalendar: "familien.finholt@gmail.com",
                "temp|2-8": [{
                    "married|0-1": true,
                    "email": "@EMAIL",
                    "firstName": "@MALE_FIRST_NAME",
                    "lastName": "@LAST_NAME",
                    "birthday": "@DATE_MM/@DATE_DD/@DATE_YYYY",
                    "percentHealth|0-100": 0
                }]
            })
        });
        // Calendar entries service
        // calendars/*
        $.mockjax({
            url: '/calendars/*',
            data: { action: "bar" },
            responseTime: 750,
            responseText: $.mockJSON.generateFromTemplate({
                "entries|2-8": [{
                    "description": "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
                    "owner": "@MALE_FIRST_NAME",
                    "title": "@TITLE",
                    "start": '@DATES',
                }]
            })
        });
        // availibel calendars
        // availiblecalendars/*
        $.mockjax({
            url: '/availbleCalendars/*',
            data: { action: "bar" },
            responseTime: 750,
            responseText: $.mockJSON.generateFromTemplate({
                "entries|2-8": [{
                    "id": "@EMAIL",
                    "summary": "@EMAIL"
                }]
            })
        });
        // post users/*
        $.mockjax({
            url: '/users/*',
            data: { action: "bar" },
            type: "POST",
            responseTime: 750,
            responseText: {
                status: 'success',
                user: 'Are you a turtle?'
            }
        });

        return data;




        function loadSettings(suc) {
            suc({
                familyName: 'Finholt',
                familyCalendar: 'familien.finholt@gmail.com',
                users: [{
                    name: "Lars Erik",
                    id: "users/1",
                    calendar: "lars.erik.finholt@gmail.com"
                },
                {
                    name: "Camilla",
                    id: "users/2",
                    calendar: "camilla.finholt@gmail.com"
                }
                ]
            });
        }


        function getCalendar(user, suc) {
            log("Getting calendar for", user.name);
            return $.getJSON("/calendars/" + user.name).success(suc);
        }

        function getUsers() {
            return $.ajax({
                url: "/services/2",

            });
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


        function handleClientLoad() {
            window.setTimeout(auth.checkAuth, 1);
        }

        function checkAuth() {
            handleAuthResult("fake");
            //gapi.auth.authorize({ client_id: clientId, scope: scopes, immediate: true }, handleAuthResult);
        }

        function handleAuthResult(authResult) {
            log("Fake authentication");
            var authorizeButton = document.getElementById('authorize-button');
            if (true /*authResult && !authResult.error*/) {
                app.trigger("authentication:success");
                authorizeButton.style.visibility = 'hidden';
                verifyAllScopes();
            } else {
                app.trigger("authentication:fail");
                authorizeButton.style.visibility = '';
                authorizeButton.onclick = handleAuthClick;
            }
        }
        function handleAuthClick(event) {

            //gapi.auth.authorize({ client_id: clientId, scope: scopes, immediate: false }, handleAuthResult);
            return false;
        }

        function verifyAllScopes() {
            log("Verify scopes: Token:", "Fake");

        }




        function log(msg, d, showToast) {
            logger.log(msg, d, system.getModuleId(data), showToast);
        }

    });