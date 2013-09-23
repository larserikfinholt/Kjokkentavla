define(["services/googlecalendar"], function (target) {
    describe("Google calendar services", function () {

        it('should grant access to calendars', function () {
            var flag = "-";

            runs(function () {
                target.grantAccessToCalendars().then(function (d) {
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


        it("should get list of all calendars", function () {
            var flag = "-";

            runs(function () {
                target.getAvailibleCalendars().then(function (d) {

                    console.log("got calendars", d);
                    expect(d.length).toBeGreaterThan(4);
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

        it("should get list of all entries for given calendars", function () {
            var flag = "-";

            runs(function () {
                target.loadCalendar({ calendarId: 'lars.erik.finholt@gmail.com', timeMin: '2013-09-01T21:32:53.699Z' }).then(function (d) {

                    console.log("got calendars events", d);
                    expect(d.length).toBeGreaterThan(1);
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


        it("should get name of current user", function () {
            var flag = "-";

            runs(function () {
                target.getGooglePlusProfile().then(function (d) {

                    console.log("got calendars", d);
                    expect(d).toBe('Lars Erik Finholt');
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