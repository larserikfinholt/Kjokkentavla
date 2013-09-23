define(['addons/readbook/readbook'], function () {

    var manager = {};
    var addons =

    manager.init = function () {


    };

    manager.loadItems = function (user) {

        if (user.userId > 0) {


        } else {
            console.error("Invalid user", user);
        }

    };


    return manager;


});