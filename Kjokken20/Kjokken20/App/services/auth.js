define(['durandal/system','durandal/app', 'services/mockdata', 'services/googleauth'],
    function (system,app, mock, google) {


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