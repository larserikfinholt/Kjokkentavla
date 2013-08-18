define(['durandal/app','plugins/dialog', 'knockout'], function (app,dialog, ko) {
    var CustomModal = function (d) {
        this.selectedItem = d;
        console.log("show:", d);
        this.input = ko.observable('');
    };

    CustomModal.prototype.ok = function () {
        dialog.close(this, this.selectedItem);
    };
    CustomModal.prototype.cancel = function () {
        dialog.close(this, null);
    };
    CustomModal.prototype.remove = function () {
        var self = this;
        app.showMessage('Are you sure you want to delete?', 'Delete entry', ['Yes', 'No']).then(function () {
            self.selectedItem.deleteMe = true;
            dialog.close(self, self.selectedItem);

        });
    };

    CustomModal.show = function (selectedItem) {
        return dialog.show(new CustomModal(selectedItem));
    };

    return CustomModal;
}); 