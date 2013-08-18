define(["durandal/app", "durandal/system", "viewmodels/calendar"], function (app, system, calendar) {
    describe("Calendar", function () {

        var settings = { users: [{ name: 'user1', calendar: 'jalla@gmail.com' }] };

        it("should load all calenders when the 'settings:loaded' event is run", function () {
            app.trigger("settings:loaded", settings);
            expect(calendar.settings.users[0].name).toBe('user1');
        });

        it("should show only today and tomorrows activities in separate lists", function () {

            fillWithDummyDate(calendar);

            expect(calendar.day0().length).toBe(3);
            expect(calendar.day1().length).toBe(1);

        });
        it("should show each user in a separate area for current day", function () {

            expect(calendar.user0().length).toBe(1);

        });

        it("should show tomorrow +/- 1 day when clicking on 'next'/'prev'", function () {

            calendar.entries.removeAll();
            fillWithDummyDate(calendar);
            expect(calendar.day0().length).toBe(3);
            expect(calendar.day1().length).toBe(1);
            expect(calendar.day2().length).toBe(0);

            calendar.next();

            expect(calendar.day0().length).toBe(1);
            expect(calendar.day1().length).toBe(0);
            expect(calendar.day2().length).toBe(0);

            calendar.prev();

            expect(calendar.day0().length).toBe(3);
            expect(calendar.day1().length).toBe(1);
            expect(calendar.day2().length).toBe(0);

        });
    });

    function fillWithDummyDate(calendar) {


        var now = new Date('2013-08-02T12:16:02.052Z');

        calendar.entries.push({ title: 'title0', decription: 'description0', owner: 'owner0', start: '2013-08-02T12:16:02.052Z' });
        calendar.entries.push({ title: 'title1', decription: 'description1', owner: 'owner1', start: '2013-08-02T13:16:02.052Z' });
        calendar.entries.push({ title: 'title2', decription: 'description2', owner: 'owner2', start: '2013-08-02T14:16:02.052Z' });
        calendar.entries.push({ title: 'title3', decription: 'description3', owner: 'owner3', start: '2013-08-03T15:16:02.052Z' });

        calendar.currentDay(now);

    }
});