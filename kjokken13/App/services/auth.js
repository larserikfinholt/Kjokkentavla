define(['durandal/system','durandal/app', 'services/logger', 'services/mockdata', 'services/googleauth'],
    function (system,app, logger, mock, google) {


        var ds = window.runMode=="Google"?google: mock;


        var auth = {
            handleClientLoad: ds.handleClientLoad,
            checkAuth: ds.checkAuth,
            handleAuthResult: ds.handleAuthResult,
            handleAuthClick: ds.handleAuthClick,
            verifyAllScopes: ds.verifyAllScopes
        };

        return auth;




    });