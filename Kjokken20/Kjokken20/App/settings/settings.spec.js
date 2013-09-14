define(["durandal/app", "durandal/system", "settings/settings"], function (app, system, target) {
    describe("Settings", function () {

        //var validSettings = { familyName: 'Flint', mainCalendar: 'cal@cal.com', users: [{ name: 'user1', calendar: 'calendar1@gmail.com' }] };

        it("should update userid to a uniqe value", function () {

            var users = [{ id: 1, name: 'lars' }, { id: 2, name: 'qwe' }, {id:-1, name:'new1'}, {id:-1,name:'new2'}];

            target.updateNewUsersWithUniqeId(users);

            expect(users[2].id).toBe(3);
            expect(users[3].id).toBe(4);


        });






        xit("should load settings on 'authentication:success'", function () {
            //expect(target.unittestLoadedStarted).toBe(false);
            //app.trigger("authentication:success", {jalla:'jalla2'});
            //expect(target.unittestLoadedStarted).toBe(true);
        });

        xit("should send 'settings:loaded' when settings are loaded", function () {
            var eventTriggered = false;
            app.on('settings:loaded', function (e) {
                eventTriggered = true;
            });
            expect(eventTriggered).toBe(false);
            target.loadSettings({}).then(function(){
                expect(eventTriggered).toBe(true);
            });
        });

        xit("should have settings availible as plain object", function () {
            target.updateSettings(validSettings);
            var a = target.getSettings();
            expect(a.users[0].name).toBe('user1');
        });
        xit("should validate that the settings are valid", function () {

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

        xit("should save settings and send 'settings:updated' event on save", function () {
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