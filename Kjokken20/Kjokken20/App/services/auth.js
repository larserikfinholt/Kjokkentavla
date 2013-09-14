define(['durandal/system','durandal/app', 'services/mockdata', 'services/googleauth', 'services/azuremobile'],
    function (system,app, mock, google, azure) {


        var ds = {};

        switch (window.runMode) {
            case "Google":
                ds = google;
                break;
            case "Fake":
                ds = mock;
                break;
            case "AzureGoogle":
                ds = azure;
                break;
            default:
                throw new Error("Auth not set in index");

        }

        var auth = {
            handleClientLoad: ds.handleClientLoad,
            checkAuth: ds.checkAuth,
            handleAuthResult: ds.handleAuthResult,
            handleAuthClick: ds.handleAuthClick,
            verifyAllScopes: ds.verifyAllScopes,
            login: ds.login
        };

        return auth;




    });