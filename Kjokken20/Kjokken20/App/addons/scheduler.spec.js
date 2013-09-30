define(['addons/scheduler'], function (cal) {

    describe('Scheduler', function () {


        var data = new scheduler.Schedule({

            display: 'wholeday',
            repeat: 'weekly',
            users: [
                {
                    name: 'Lars',
                    days: [0, 2, 3]
                }
            ],
        });

        it('should set title and type on every items', function () {

            var target = new cal.Scheduler({

                display: 'wholeday',
                repeat: 'weekly',
                users: [
                    {
                        name: 'Lars',
                        days: [0, 2, 3]
                    }
                ],
            });

            var start = moment('30.09.2013', 'DD-MM-YYYY');
            var stop = moment().add(14, 'days', { title: 'myTitle', type: '123' });

            var results = target.getScheduledItems(start, stop)

            expect(results[0].title).toBe('myTitle');
            expect(results[0].type).toBe('123');

        });


    });

});