define(["user/user"], function (target) {
    describe("User", function () {


        xit("should be possible to create instance", function () {
            var a = new target.User({ user: 'user1', calendar: 'cal@cal.com' });
            a.loadCalendar();

        });
    });
});