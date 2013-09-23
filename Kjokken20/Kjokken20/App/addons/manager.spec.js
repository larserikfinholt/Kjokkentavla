define(["addons/manager"], function (target) {
    describe("Addon Manger", function () {

        it('should load configurations for all addons', function () {

            var flag = "-";

            runs(function () {
                target.loadSettings().then(function (d) {
                    expect(d).toBe(true);
                    flag = "ok";
                });

            }, function (error) {
                console.log("err:", error);
                flag = "error";
            });

            waitsFor(function () {
                return flag != "-";
            }, 2000);

            runs(function () {
                expect(flag).toBe("ok");
            });

        });

    });
});

