define(["durandal/app", "durandal/system", "viewmodels/settings", "services/data"], function (app, system, target, data) {
    describe("Settings", function () {

        var validSettings = { familyName: 'Flint', mainCalendar: 'cal@cal.com', users: [{ name: 'user1', calendar: 'calendar1@gmail.com' }] };

        xit("should load settings on 'authentication:success'", function () {
            //expect(target.unittestLoadedStarted).toBe(false);
            //app.trigger("authentication:success", {jalla:'jalla2'});
            //expect(target.unittestLoadedStarted).toBe(true);
        });

        it("should send 'settings:loaded' when settings are loaded", function () {
            var eventTriggered = false;
            app.on('settings:loaded', function (e) {
                eventTriggered = true;
            });
            expect(eventTriggered).toBe(false);
            target.loadSettings({}).then(function(){
                expect(eventTriggered).toBe(true);
            });
        });

        it("should have settings availible as plain object", function () {
            target.updateSettings(validSettings);
            var a = target.getSettings();
            expect(a.users[0].name).toBe('user1');
        });
        it("should validate that the settings are valid", function () {

            var failSettings = JSON.parse(JSON.stringify(validSettings));
            failSettings.mainCalendar = "";
            target.updateSettings(failSettings);
            expect(target.isValid()).toBe(false);
            // no users
            var failSettings = JSON.parse(JSON.stringify(validSettings));
            failSettings.users = [];
            expect(target.isValid()).toBe(false);

            target.updateSettings(validSettings);
            target.getSettings();
            expect(target.isValid()).toBe(true);


        });

        it("should save settings and send 'settings:updated' event on save", function () {
            //spyOn(data, 'saveSettings');
            var called=false;
            app.on("settings:updated", function () { console.log("settings:updated called"); called = true; });
            target.updateSettings(validSettings);
            expect(called).toBe(false);
            target.saveSettings().then(function () {
                expect(called).toBe(true);
            });
        });

    });
});