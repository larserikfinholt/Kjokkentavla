define(['logf'], function (logf) {

    var vm = {

      

        settings: {},
        init: function (settings, data, users) {
            logf.debug('ReadBook init', settings, data, users);

            _.each(users, function (user) {



            });
            

            this.settings = settings;
        },

        loadItemsForUser: function (user) {


        }

    };

    return vm;


});
