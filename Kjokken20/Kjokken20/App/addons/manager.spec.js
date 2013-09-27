define(["addons/manager", 'services/azuremobile'], function (target, azuremobile) {
    describe("Addon Manger", function () {

        beforeEach(function () {
            if (sessionStorage.loggedInUser) {
                azuremobile.client.currentUser = JSON.parse(sessionStorage.loggedInUser);
            } else {
                console.error("Not able to get user from session storage");
            }
        });


        it('should load configurations for all addons on init and send "addonsettings:loaded"', function () {

            var flag = "-";

            runs(function () {
                target.init();

            }, function (error) {
                console.log("err:", error);
                flag = "error";
            });

            waitsFor(function () {
                return target.settings;
            }, 2000);

            runs(function () {
                expect(target.settings.length).toBeGreaterThan(1);
            });

        });

    });
});

