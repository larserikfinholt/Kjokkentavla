define(['addons/scheduler'], function (cal) {

    describe('Scheduler', function () {


        it('should set title and type on every items', function () {

            var target = new cal.Schedule({

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
            var stop = moment().add(14, 'days');

            var results = target.getScheduledItems(start, stop, { title: 'myTitle', type: '123' })

            expect(results[0].title).toBe('myTitle');
            expect(results[0].type).toBe('123');

        });

        it('should return one item for each day when all days are marked', function () {
            var target = new cal.Schedule({
                repeat: 'weekly',
                users: [
                    {
                        name: 'Lars',
                        days: [0, 1, 2, 3, 4, 5]
                    },
                {
                    name: 'Camilla',
                    days: [6]
                }
                ],
            });
            var start = moment('30.09.2013', 'DD-MM-YYYY');
            var stop = moment(start).add(7, 'days');

            var results = target.getScheduledItems(start, stop, {})

            expect(results.length).toBe(7);

        });


        it('should return name of owner', function () {
            var target = new cal.Schedule({

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
            var stop = moment().add(14, 'days');

            var results = target.getScheduledItems(start, stop, { title: 'myTitle', type: '123' })

            expect(results[0].owner).toBe('Lars');


        });


    });

});