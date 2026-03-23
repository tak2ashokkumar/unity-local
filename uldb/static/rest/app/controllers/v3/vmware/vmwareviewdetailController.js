var app = angular.module('uldb');
app.controller('vmwareviewdetailController', [
    '$scope',
    '$rootScope',
    '$q',
    '$filter',
    '$routeParams',
    '$location',
    '$http',
    'CustomDataService',
    'AdminApi',
    'DataFormattingService',
    'VmwareService',
    'TaskService',
    'TableHeaders',
    'RestService',
    'AlertService2',
    'ValidationService',
    function ($scope,
              $rootScope,
              $q,
              $filter,
              $routeParams,
              $location,
              $http,
              CustomDataService,
              AdminApi,
              DataFormattingService,
              VmwareService,
              TaskService,
              TableHeaders,
              RestService,
              AlertService2,
              ValidationService) {
        $scope.listsnapshot = false;
        $scope.listdata = false;
        $scope.title = {
            plural: "VMware",
            singular: "VMware"
        };
        if ($scope.$parent === $rootScope) $scope.$root.title = $scope.title;
        var key = $routeParams.key;
        var vcenter_id = $routeParams.id;
        var vm_id = $routeParams.vm_id;

        if (key == "list_snapshot") {
            $scope.listsnapshot = true;
        }

        $scope.vmware_listsnapshot_headers = TableHeaders.vm_listsnapshot_header;
        $scope.vmware_listsnapshot = {};

        load_vmware_listsnapshot(vcenter_id, vm_id);

        function load_vmware_listsnapshot(vcenter_id, vm_id) {
            var url = AdminApi.vm_get_listsnapshot.replace(":vcenter_id", vcenter_id).replace(":vm_id", vm_id);
            VmwareService.get_vmware_listsnapshot(url).then(function (result) {
                $scope.vmware_listsnapshot = result;
            });
        }
    }]);
