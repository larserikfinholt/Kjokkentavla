define(["durandal/app", "durandal/system", "viewmodels/calendar"], function (app, system, calendar) {
    describe("Calendar", function () {

        var settings = { users: [{ name: 'user1', calendar: 'jalla@gmail.com' }] };

        it("should load all calenders when the 'settings:loaded' event is run", function () {
            app.trigger("settings:loaded", settings);
            expect(calendar.settings.users[0].name).toBe('user1');
        });
    });
});