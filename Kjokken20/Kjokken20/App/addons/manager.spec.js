define(["addons/manager", 'services/azuremobile'], function (target, azuremobile) {
    describe("Addon Manger", function () {

        beforeEach(function () {
            if (sessionStorage.loggedInUser) {
                azuremobile.client.currentUser = JSON.parse(sessionStorage.loggedInUser);
            } else {
                console.error("Not able to get user from session storage");
            }
        });


        it('should load data and call init on all addons', function () {

            var flag = "-";

            runs(function () {
                target.init();

            }, function (error) {
                console.log("err:", error);
                flag = "error";
            });

            waitsFor(function () {
                return target.initCompleted==true;
            }, 2000);

            runs(function () {
                expect(target.initCompleted).toBe(true);
            });

        });

    });
});

