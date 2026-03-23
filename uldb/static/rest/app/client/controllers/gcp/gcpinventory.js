var app = angular.module('uldb');

app.controller('GCPInventoryController', [
    '$scope',
    '$state',
    '$stateParams',
    '$timeout',
    '$http',
    '$location',
    function ($scope, $state, $stateParams, $timeout, $http, $location) {

        console.log('in GCPInventoryController with : ');
        $scope.loader = true;
        $scope.showDetailsView = false;

        $scope.setLoader = function (value) {
            $scope.loader = value;
        };

        $scope.setActiveSubTab = function (value) {
            $scope.activeSubTab = value;
        };

        $scope.setshowDetailsView = function (value) {
            $scope.showDetailsView = value;
        };

        $scope.tabs = [
            {
                'tabname': 'Virtual Machines',
            },
            {
                'tabname': 'Snapshots',
            },
        ];

        switch ($state.current.name) {
            case 'public_cloud.inventory.virtual-machines' :
                $scope.activeTab = 0;
                break;
            case 'public_cloud.inventory.snapshots' :
                $scope.activeTab = 1;
                break;
            default :
                $scope.activeTab = 0;
        }

        $scope.activeSubTab = 0;
        $scope.getTabData = function (tab) {
            $scope.showDetailsView = false;
            switch (tab.tabname) {
                case 'Virtual Machines' :
                    console.log('in overview tab');
                    $scope.setLoader(true);
                    $scope.submenutabs = null;
                    $state.go('public_cloud.inventory.virtual-machines', {uuidp: $stateParams.uuidp}, {reload: false});
                    break;
                case 'Snapshots' :
                    $scope.setLoader(true);
                    $scope.submenutabs = [];
                    $state.go('public_cloud.inventory.snapshots', {uuidp: $stateParams.uuidp}, {reload: false});
                    break;
                default : 
                    console.log('something went wrong!');
            }

            $timeout(function () {
                $scope.activeSubTab = 2;
                $scope.addClassforTabs('.actonecls ul', 2);
            }, 1000);
        };

        $scope.goToPreviousPage = function () {
            $state.go('public_cloud.gcp-dashboard', null, {reload: false});
            $timeout(function () {
                $scope.addClassforTabs('.actonecls ul', 2);
            }, 1000);
        };

    }
]);