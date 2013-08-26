define(['durandal/system','durandal/app'],
    function (system,app) {


        var client = new WindowsAzure.MobileServiceClient(
            "https://kjokken.azure-mobile.net/",
            "bMMmFAajPWIagbBynXZBgxIZHZjCJt18"
        );

        return {

            client:client

        }


    });