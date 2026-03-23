var app = angular.module('uldb');
app.controller('AWSController', [ '$scope', '$rootScope', '$q', 'CustomDataService',
  function ($scope, $rootScope, $q, CustomDataService) {

    $scope.aws_roles_content = CustomDataService.get_aws_roles_data();
    $scope.aws_policies_content = CustomDataService.get_aws_policies_data();
    $scope.aws_customers_content = CustomDataService.get_aws_customers_data();
    $scope.aws_network_content = CustomDataService.get_aws_network_data();
    $scope.aws_datacenters_content = CustomDataService.get_aws_datacenters_data();
    $scope.aws_datastores_content = CustomDataService.get_aws_datastores_data();
    $scope.aws_hosts_content = CustomDataService.get_aws_hosts_data();
    $scope.aws_managementservers_content = CustomDataService.get_aws_managementservers_data();
    $scope.aws_virtualmachines_content = CustomDataService.get_aws_virtualmachines_data();

    $scope.aws_roles_content_modeldata = {"title":"Create Roles",  "page":"/static/rest/app/templates/aws/aws_roles_create.html"};

    $scope.aws_roles_content_rows = [
                                        //{ name: "organization_name", description: "Name", required: true },
                                        { name: "role_name", description: "Role Name", required: true },
                                        { name: "role_type", description: "Role Type", required: true }
    ];
    /*$scope.endpoints_tenant_content = CustomDataService.get_endpoints_tenant_data();
    $scope.vm_tenant_content = CustomDataService.get_vm_tenant_data();
    $scope.os_hosts_tenant_content = CustomDataService.get_os_hosts_tenant_data();

    $scope.hy_content = CustomDataService.get_hypervisor_data();
    $scope.tenant_content = CustomDataService.get_tenant_data();

    $scope.endpoints_tenant_content_modeldata = {"title":"Create Endpoints for tenant",  "page":"/static/rest/app/templates/openstack/endpoints_tenant_add.html"};
    $scope.aws_policies_content_modeldata = {"title":"Create Server",  "page":"/static/rest/app/templates/openstack/vm_tenant_create.html"};

    $scope.vm_tenant_content_rows = [
                                        //{ name: "organization_name", description: "Name", required: true },
                                        { name: "server_name", description: "Server Name", required: true },
                                        { name: "server_type", description: "Server Type", required: true }
    ];*/

    /*$scope.addClick = function(click1){
        console.log("Printing here : "+click1);
        $scope.showModal = !$scope.showModal;
        console.log("$scope.showModal : "+$scope.showModal);
    };*/
  }
]);







