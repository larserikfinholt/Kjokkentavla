define(["services/azuremobile"], function (target) {
    describe("Azure mobile services", function () {

        beforeEach(function () {
            if (sessionStorage.loggedInUser) {
                target.client.currentUser = JSON.parse(sessionStorage.loggedInUser);
            }
        });

        it("should be possible to login", function () {
            var client = target.client,
                flag = "-";

            console.log("beore:", client.currentUser);

            if (sessionStorage.loggedInUser) {
                client.currentUser = JSON.parse(sessionStorage.loggedInUser);
                expect(client.currentUser).not.toBe(null);
            } else {
                console.log("sessionStorage is empty - doing a login");

                runs(function () {
                    client.login("google").then(function (d) {
                        sessionStorage.loggedInUser = JSON.stringify(client.currentUser);
                        console.log("ok", d, client);
                        console.log("after:", client.currentUser);
                        expect(client.currentUser.userId).toBe("Google:107478337081053732571");
                        flag = "ok";
                    }, function (error) {
                        console.log("err:", error);
                        flag = "error";
                    });
                });

                waitsFor(function () {
                    return flag != "-";
                }, 20000);

                runs(function () {
                    expect(flag).toBe("ok");

                });
            }

        });


        it("should be possible to logout", function () {
            var client = target.client,
                flag = "-";

            client.logout();

            expect(client.currentUser).toBe(null);


        });

        it("should always return settings if users is logged in", function () {
            var client = target.client,
                         flag = '-';

            if (client.currentUser != null) {
                runs(function () {
                    target.loadSettings().done(
                        function (d) {
                            console.log("Settings returned:", d);
                            flag = "ok";
                        },
                        function (err) {
                            console.log("err:", err)
                            flag = "error" + err;
                        }
                        );
                });

                waitsFor(function () {
                    return flag != "-";
                }, 2000);

                runs(function () {
                    expect(flag).toBe("ok");

                });

            }

        });


        it("should be able to update settings", function () {

            var client = target.client,
                         flag = '-';


            expect(client.currentUser).not.toBe(null);

            var timestamp = new Date().getMilliseconds();

            if (client.currentUser != null) {
                runs(function () {
                    target.loadSettings().done(function (orginal) {
                        orginal.name = "UpdatedName" + timestamp;
                        //orginal.users=  [{ id: 1, name: 'lars' }, { id: 2, name: 'Camilla' }];
                        target.updateSettings(orginal).done(
                            function (d) {
                                expect(d.name).toBe("UpdatedName" + timestamp);
                                console.log("read back", d);
                                flag = "ok";
                            },
                            function (err) {
                                console.log("error updating:", err)
                                flag = "error";
                            }
                            );
                    });
                });

                waitsFor(function () {
                    return flag != "-";
                }, 2000);

                runs(function () {
                    expect(flag).toBe("ok");

                });

            }



        });


        it("should return addonsettings if users is logged in", function () {
            var client = target.client,
                         flag = '-';

            if (client.currentUser != null) {
                runs(function () {
                    target.loadAddonSettings().done(
                        function (d) {
                            console.log("Settings returned:", d);
                            flag = "ok";
                        },
                        function (err) {
                            console.log("err:", err)
                            flag = "error" + err;
                        }
                        );
                });

                waitsFor(function () {
                    return flag != "-";
                }, 2000);

                runs(function () {
                    expect(flag).toBe("ok");

                });

            }

        });
        it("should be able to update addonsettings", function () {

            var client = target.client,
                         flag = '-';

            var timestamp = new Date().getMilliseconds();

            if (client.currentUser != null) {
                runs(function () {
                    target.loadAddonSettings().done(function (results) {
                        if (results.length > 0) {
                            var orginal = _.findWhere(results, { appName: 'test' });
                            var str = moment().format('ss');
                            orginal.lastModified = str;
                            target.updateAddonSettings(orginal).done(
                                function (d) {
                                    expect(d.lastModified).toBe(str);
                                    console.log("read back", d);
                                    flag = "ok";
                                },
                                function (err) {
                                    console.log("error updating:", err)
                                    flag = "error";
                                }
                                );
                        } else {
                            console.log("nothing to test on.,");
                            client.getTable("AddonSettings").insert({ appName: 'test', config: { test: 123, jalla: 'jalla' } }).then(function (dum) {
                                console.log("added dummydata...", dum);
                            });
                        }
                    });
                });

                waitsFor(function () {
                    return flag != "-";
                }, 2000);

                runs(function () {
                    expect(flag).toBe("ok");

                });

            }



        });

        it("should be able to add and delete addondata", function () {

            var client = target.client,
                        flag = '-';

            runs(function () {
                target.insertAddonEntry({ appName: 'test', value: 'unittest', memberId: 99, time: moment.utc().toISOString() }).then(function (justAdded) {
                    expect(justAdded.appName).toBe('test');
                    //console.log("read back inserted", justAdded);
                    target.deleteAddonEntry(justAdded).done(function (d) {
                        flag = "ok";
                    }, function (err) {
                        console.log('error deleting', err);
                    });

                });
            });

            waitsFor(function () {
                return flag != "-";
            }, 2000);

            runs(function () {
                expect(flag).toBe("ok");

            });




        });


        xit("should be possible to add an item", function () {
            var client = target.client,
                item = { text: "Awesome item" },
                flag = "-";



            runs(function () {
                client.getTable("Item").insert(item).done(
                    function (d) {
                        console.log("ok", d);
                        flag = "ok";
                    },
                    function (err) {
                        console.log("err:", err)
                        flag = "error";
                    }
                    );
            });

            waitsFor(function () {
                return flag != "-";
            }, 2000);

            runs(function () {
                expect(flag).toBe("error");

            });

        });
    });
});