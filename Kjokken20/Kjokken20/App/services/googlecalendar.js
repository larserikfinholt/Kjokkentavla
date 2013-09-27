define(['durandal/system', 'durandal/app', 'services/azuremobile', 'gapi','logf'],
    function (system, app, azureMobile, gapiCalendar,logf) {

        if (window.superhack == undefined) {

            var scopes = ['https://www.googleapis.com/auth/plus.me', ' https://www.googleapis.com/auth/calendar'];
            var clientId = '910460127884-r0d4g4h94h5j1lt8oab9h9o9mfgahd71.apps.googleusercontent.com';
            if (window.location.href.indexOf("localhost") > 0) { clientId = '910460127884.apps.googleusercontent.com'; }

            logf.debug('loaded googleCalendar module');

            window.setTimeout(function () {

                if (!window.superhack.isAuthorized) {

                    logf.auth('Not authenticated yet. Trying to authorize automatic... ', vm);
                    window.superhack.grantAccessToCalendars(true);
                } else {
                    logf.auth('Already authenticated....');
                }

            }, 2000);

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
                                    logf.error("Error during gapi call", resp);
                                    dfd.reject(resp.error);
                                } else {
                                    logf.debug('Got results from google calendar', resp);
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
                                    logf.error("Error during gapi call", resp);
                                    dfd.reject(resp.error);
                                } else {
                                    //console.log('Got results from google', resp);
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
                    var self = this;
                    var dfd = new jQuery.Deferred();

                    logf.auth("GrantAccessToCalendars - calling gapi.auth.authorize. Immediate:", noPopup);
                    gapi.auth.authorize({ client_id: clientId, scope: scopes, immediate: noPopup }, function (authResult) {

                        if (authResult && !authResult.error) {
                            logf.auth('gapi.auth.authorize success', authResult.access_token);
                            if (authResult.access_token == undefined) {
                                logf.error("Empty accesstoken from gapi.auth.auhorize", authResult);
                            }
                            self.isAuthorized = true;
                            app.trigger('googleauth:success', authResult);
                            dfd.resolve(true);
                        } else {
                            console.error("gapi.auth.authorize failed", authResult);
                            dfd.reject('auth failed');
                        }
                    });

                    return dfd.promise();
                },
                loadCalendar: function (args) {
                    var dfd = new jQuery.Deferred();
                    if (this.isAuthorized) {
                        gapi.client.load('calendar', 'v3', function () {
                            // Step 5: Assemble the API request
                            var request = gapi.client.calendar.events.list(args);
                            // Step 6: Execute the API request
                            request.execute(function (resp) {
                                if (resp != undefined && resp.error) {
                                    console.error("Error during gapi call", resp);
                                    dfd.reject(resp.error);
                                } else {
                                    //console.log('Got events from google calendar', resp);
                                    dfd.resolve(resp.items);
                                }
                            });

                        });
                    } else {
                        log.error("'resolving with not authorized", this);
                        dfd.resolve('Not authorized...');
                    }
                    return dfd.promise();





                }

            };


            //vm.grantAccessToCalendars(true);

            window.superhack = vm;

            window.fallbackAuth = function () {
                //alert('this is just temporary....');
                //azureMobile.login();
                window.superhack.grantAccessToCalendars(true);
            }



            return vm;


        }
        return window.superhack;


    });