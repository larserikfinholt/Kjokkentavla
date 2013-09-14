define(['durandal/system', 'durandal/app', 'services/azuremobile', 'gapi'],
    function (system, app, azureMobile, gapiCalendar) {

        var scopes = ['https://www.googleapis.com/auth/plus.me', ' https://www.googleapis.com/auth/calendar'];
        var clientId = '910460127884.apps.googleusercontent.com';

        console.log('loaded googleCalendar module');


        var vm = {
            isAuthorized: false,

            getAvailibleCalendars: function () {


                var dfd = new jQuery.Deferred();
                if (this.isAuthorized) {
                    gapi.client.load('calendar', 'v3', function () {
                        // Step 5: Assemble the API request
                        var request = gapi.client.calendar.calendarList.list({
                        });
                        // Step 6: Execute the API request
                        request.execute(function (resp) {
                            if (resp != undefined && resp.error) {
                                console.error("Error during gapi call", resp);
                                dfd.reject(resp.error);
                            } else {
                                console.log('Got results from google calendar', resp);
                                var items = resp.items.map(function (cal) {

                                    return { value: cal.id, name: cal.summary };

                                });
                                dfd.resolve(items);
                            }
                        });
                    });
                } else {
                    dfd.resolve('Not authorized...');
                }
                return dfd.promise();

            },
            getGooglePlusProfile: function () {

                var dfd = new jQuery.Deferred();
                if (this.isAuthorized) {
                    gapi.client.load('plus', 'v1', function () {
                        // Step 5: Assemble the API request
                        var request = gapi.client.plus.people.get({
                            'userId': 'me'
                        });
                        // Step 6: Execute the API request
                        request.execute(function (resp) {
                            if (resp != undefined && resp.error) {
                                console.error("Error during gapi call", resp);
                                dfd.reject(resp.error);
                            } else {
                                console.log('Got results from google', resp);
                                dfd.resolve(resp.displayName);
                            }
                        });
                    });
                } else {
                    dfd.resolve('Not authorized...');
                }
                return dfd.promise();

            },
            grantAccessToCalendars: function (noPopup) {

                var dfd = new jQuery.Deferred();


                gapi.auth.authorize({ client_id: clientId, scope: scopes, immediate: noPopup }, function (authResult) {

                    if (authResult && !authResult.error) {
                        console.log('gapi.auth.authorize success', authResult.accessToken);
                        app.trigger('googleauth:success', authResult);
                        vm.isAuthorized = true;
                        dfd.resolve(true);
                    } else {
                        console.error("gapi.auth.authorize failed", authResult);
                        dfd.reject('auth failed');
                    }
                });

                return dfd.promise();
            },
            loadCalendar: function (calendar) {
                var dfd = new jQuery.Deferred();
                if (this.isAuthorized) {
                    gapi.client.load('calendar', 'v3', function () {
                        // Step 5: Assemble the API request
                        var request = gapi.client.calendar.events.list({calendarId: calendar
                        });
                        // Step 6: Execute the API request
                        request.execute(function (resp) {
                            if (resp != undefined && resp.error) {
                                console.error("Error during gapi call", resp);
                                dfd.reject(resp.error);
                            } else {
                                console.log('Got events from google calendar', resp);
                                dfd.resolve(resp.items);
                            }
                        });
                        
                    });
                } else {
                    dfd.resolve('Not authorized...');
                }
                return dfd.promise();





            }

        };


        //vm.grantAccessToCalendars(true);


        return vm;





    });