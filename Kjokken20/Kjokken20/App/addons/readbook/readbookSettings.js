define(['logf'], function (logf) {

    var ReadbookSettings = function (init) {

        this.init = init;

        this.activate= function () {
            logf.debug('activting readbooksettings');
        }


    };

    return {

        ReadbookSettings: ReadbookSettings

    };

})