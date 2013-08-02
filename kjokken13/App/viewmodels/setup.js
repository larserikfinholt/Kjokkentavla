define(['services/logger'], function (logger) {
    var vm = {
        activate: activate,
        title: 'Setup'
    };

    return vm;

    //#region Internal Methods
    function activate() {
        return true;
    }
    //#endregion
});