var app = angular.module('uldb');
app.controller('GCPSnapshotsController', [
    '$scope',
    '$rootScope',
    '$state',
    '$stateParams',
    '$q',
    '$window',
    '$location',
    '$filter',
    '$timeout',
    '$http',
    'BreadCrumbService',
    'ClientDashboardService',
    'GCPService',
    '$uibModal',
    'TaskService',
    'ClientApi',
    'TableHeaders',
    'DataFormattingService',
    'RestService',
    'AlertService2',
    'ValidationService',
    'SearchService',
    'TaskService2',
    function (
        $scope,
        $rootScope,
        $state,
        $stateParams,
        $q,
        $window,
        $location,
        $filter,
        $timeout,
        $http,
        BreadCrumbService,
        ClientDashboardService,
        GCPService,
        $uibModal,
        TaskService,
        ClientApi,
        TableHeaders,
        DataFormattingService,
        RestService,
        AlertService2,
        ValidationService,
        SearchService,
        TaskService2) {

        var intialParams = {'page': 1, 'page_size': 10, 'account_id': $stateParams.uuidp};

        var defineSnapshotsElements = function () {
            $scope.gcp_rows = [
                {name: 'name', description: "Name", required: true},
                {name: 'status', description: "Status", required: true, is_sort_disabled: true},
                {name: 'storage_bytes', description: "Storage", required: true},
                {name: 'source_vm_disk', description: "Source VM", required: true},
                {name: 'disk_size_gb', description: "Disk Size", required: true},
                {name: 'storage_location', description: "Storage Location", required: true, is_sort_disabled: true},
                {name: 'creation_timestamp', description: "Creation Time", required: true, is_sort_disabled: true},
                // {name: 'management_ip', description: "Management IP", required: true},
            ];
        };

        $scope.getSearchResults = function(searchKeyword){
            var params = {
                'account_id': $stateParams.uuidp,
                'page': 1,
                'search': searchKeyword
            };
            $scope.get_synced_snapshots(params);
        };

        $scope.get_synced_snapshots = function(params){
             $http({
                url: '/customer/gcp/snapshots/',
                params: params,
                method: 'GET',
            }).then(function (response) {
                $scope.snapshot_result = response.data.results;
                $scope.model_count = response.data.count;
                $scope.platform_type = 'GCP Director';
                $scope.snapshot_loaded = true;
            });
        };

        $scope.sort = {
            sortingColumn: '',
            reverse: false
        };

        // Mange by creating support request
        var modalSupport = null;
        var showModal = function (template, controller) {
            if (modalSupport !== null) {
                modalSupport.dismiss('cancel');
            }
            $scope.loader = false;
            modalSupport = $uibModal.open({
                templateUrl: template,
                controller: controller,
                scope: $scope,
            });

            modalSupport.result.then(function (selectedItem) {
                $scope.selected = selectedItem;
            }, function () {
            });
        };

        $scope.getSortingResults = function (sort) {
            $scope.sortingColumn = sort.sortingColumn;
            $scope.sortkey = sort.sortingColumn;
            $scope.page = 1;
            var params = {
                'account_id': $stateParams.uuidp,
                'page': $scope.page,
                'ordering': sort.sortingColumn,
                'search': $scope.searchKeyword
            };
            $scope.get_synced_snapshots(params);
        };

        $scope.manage_request_vm = function (device_name, device_type, result) {
            console.log("Manage by ticket called.....");
            $scope.device_type = device_type;
            $scope.device_name = device_name;
            $scope.description = 
                "Device Type: " + device_type + "\n" +
                "Device Name: " + device_name + "\n" +
                "Source VM: " + result.source_vm_disk + "\n" +
                "Storage Location: " + result.storage_location + "\n" +
                "Creation Time: " + result.creation_timestamp;
            showModal('static/rest/app/client/templates/manage_request.html', 'ManageRequestController');
        };

        var load_snapshots = function(){

            // $scope.$on('$destroy', function () {
            //     BreadCrumbService.pushIfTop({ name: "GCP ", url: '#/gcp-dasboard' }, $scope);
            // });

            $http({
                url: '/customer/gcp/snapshots/sync_snapshots',
                method: 'GET',
                params: {
                    account_id: $stateParams.uuidp,
                },
            }).then(function (response) {
                if(response.data.sn_db_count > 0)
                    $scope.get_synced_snapshots(intialParams);
                
                if (response.data.hasOwnProperty('task_id')) {
                    TaskService2.processTask(response.data.task_id, 500).then(function (result) {
                        if (result) {
                            $scope.get_synced_snapshots(intialParams);
                        }

                    }).catch(function (error) {
                        AlertService2.danger("Error while fetching GCP virtual machines:");
                        $scope.snapshot_result = [];
                        $scope.snapshot_loaded = true;
                    });
                } else {
                    $scope.snapshot_result = response.data;
                    $scope.snapshot_loaded = true;
                    $scope.platform_type = response.data.platform_type;
                }

            });
            defineSnapshotsElements();
        };

        load_snapshots();


    }
]);
