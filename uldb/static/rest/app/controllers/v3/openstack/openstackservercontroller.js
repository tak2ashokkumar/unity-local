var app = angular.module('uldb');
app.controller('OpenstackServerController', [
    '$scope',
    '$rootScope',
    '$http',
    '$q',
    '$routeParams',
    '$filter',
    '$location',
    'CustomDataService',
    'OpenstackService',
    'TaskService',
    'AlertService2',
    'AdminApi',
    'DataFormattingService',
    'TableHeaders',
    'RestService',
    'NovaService',
    function(
        $scope,
        $rootScope,
        $http,
        $q,
        $routeParams,
        $filter,
        $location,
        CustomDataService,
        OpenstackService,
        TaskService,
        AlertService2,
        AdminApi,
        DataFormattingService,
        TableHeaders,
        RestService,
        NovaService) {

        $scope.adapter_id = $routeParams.adapter_id;
        $scope.alertService = AlertService2;

        var url = AdminApi.validate_nova_controller.replace(':adapter_id', $scope.adapter_id);
        NovaService.get_nova_data(url).then(function(result) {
            if (result.data.data.status === true) {
                $scope.title = {
                    plural: "Nova Controllers",
                    singular: "Nova Controller"
                };
                if ($scope.$parent === $rootScope) $scope.$root.title = $scope.title;
                $scope.serverid = $routeParams.serverid;
                $scope.openstack_server_ip_headers = TableHeaders.openstack_server_ip_headers;
                var load_serverips = function() {
                    OpenstackService.get_server_ip_data(
                        AdminApi.get_server_ip_info.replace(':adapter_id', $scope.adapter_id).replace(':instance_id', $scope.serverid)
                    ).then(function(result) {
                        $scope.server_ip_content = DataFormattingService.formatBooleanTableData(result);
                    });
                };
                load_serverips();
            } else {
                AlertService2.addAlert({
                    msg: "Invalid Access",
                    severity: 'danger'
                });
                return $location.path("/nova");
            }
        });
    }
]);
