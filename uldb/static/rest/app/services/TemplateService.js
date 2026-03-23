var app = angular.module('uldb');

app.factory('TemplateDirectory', [
    function () {
        var modalDirectory = '/static/rest/app/templates/modal/';
        var modals = {
            'privateCloud': 'privateCloudModal.html',
            'privateCloudItem': 'privateCloudItemModal.html',
            simpleModal: 'simpleModal.html'
        };

        for (var k in modals) {
            if (modals.hasOwnProperty(k)) {
                modals[k] = modalDirectory + modals[k];
            }
        }


        var cloudModalDirectory = function (name) {
            return modalDirectory + '/cloud/' + name + '.html';
        };

        modals['cloud'] = {
            addPortModal: null,
            vmwarePicker: null
        };

        for (var m in modals['cloud']) {
            if (modals['cloud'].hasOwnProperty(m)) {
                modals['cloud'][m] = cloudModalDirectory(m);
            }
        }


        return {
            'privateCloudModal': '/static/rest/app/templates/modal/privateCloudModal.html',
            modals: modals
        };
    }
]);
