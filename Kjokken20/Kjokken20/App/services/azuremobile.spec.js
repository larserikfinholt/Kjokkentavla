define(["services/azuremobile"], function (target) {
    describe("Azure mobile services", function () {

        it("should be possible to login", function () {
            var client = target.client,
                flag = "-";
            
            console.log("beore:",client.currentUser);

            runs(function () {
                client.login("google").then(function (d) {
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

        });


        it("should be possible to logout", function () {
            var client = target.client,
                flag = "-";

            client.logout();

            expect(client.currentUser).toBe(null);


        });


        it("should be possible to add an item", function () {
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
                return flag!="-";
            }, 2000);

            runs(function () {
                expect(flag).toBe("error");

            });

        });
    });
});