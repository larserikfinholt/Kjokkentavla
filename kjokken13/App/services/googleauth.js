define(['durandal/system', 'durandal/app', 'services/logger'],
    function (system, app,logger) {

        var scopes = 'https://www.googleapis.com/auth/plus.me';
        var clientId =  '910460127884-r0d4g4h94h5j1lt8oab9h9o9mfgahd71.apps.googleusercontent.com';


        var auth = {
            handleClientLoad: handleClientLoad,
            checkAuth: checkAuth,
            handleAuthResult: handleAuthResult,
            handleAuthClick: handleAuthClick,
            verifyAllScopes: verifyAllScopes
        };

        return auth;




        function handleClientLoad() {
            log("Google authentication");
            var apiKey = 'AIzaSyANE4eQbcntAG7wHWAv8YLBMcILGVeleSQ';
            gapi.client.setApiKey(apiKey);
            window.setTimeout(auth.checkAuth, 1);
        }

        function checkAuth() {
            if (window.location.href.indexOf("localhost")>0) { clientId = '910460127884.apps.googleusercontent.com'; }
            gapi.auth.authorize({ client_id: clientId, scope: scopes, immediate: true }, handleAuthResult);
        }

        function handleAuthResult(authResult) {
            var authorizeButton = document.getElementById('authorize-button');
            if (authResult && !authResult.error) {
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
            gapi.auth.authorize({ client_id: clientId, scope: scopes, immediate: false }, handleAuthResult);
            return false;
        }

        function verifyAllScopes() {
            var token = gapi.auth.getToken();
            log("Verify scopes: Token:", token);

        }

        function log(msg, data, showToast) {
            logger.log(msg, data, system.getModuleId(auth), showToast);
        }



    });