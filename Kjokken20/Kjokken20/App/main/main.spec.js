define(['main/main'], function (target) {

    describe('Main view', function () {

        it('should set the first day to be monday, and current day to be today', function () {

            expect(moment(target.selectedDate()).format('LL')).toBe(moment().format('LL'));
            expect(target.selectedWeek().format('dddd')).toBe('Monday');

        });

        it('should calculate week when going up or down', function () {

            target.changeWeek(1);
            expect(target.selectedWeek().format('dddd')).toBe('Monday');
            expect(target.days().length).toBe(6);
            console.log(target.days());
            
            

        });

    });

});