define(['logf', 'addons/scheduler'], function (logf, scheduler) {

    var vm = {



        settings: {},
        init: function (settings, data, users) {
            //logf.debug('ReadBook init', settings, data, users);

            _.each(users, function (user) {



            });

            this.users = users;
            this.settings = settings;
        },

        loadItemsForUser: function (user) {


        },

        // tmp
        schedule: new scheduler.Schedule({
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
        }),
        users: ['Lars', 'Camilla', 'Markus', 'Ingvild', 'Sigrid'],
        //tmp: ko.observable([true, false, true, true, true, true, true]),
        save: function () {
            logf.debug('save', this.tmp());
        }
        //isChecked: ko.computed({
        //    read: function (d) {

        //        console.log('read', d);
        //        return this.tmp[d];
        //    },
        //    write:
        //        function (a, b) {
        //            console.log('write', a, b);

        //        }
        //})

    };

    return vm;


});
