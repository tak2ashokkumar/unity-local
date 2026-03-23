var app = angular.module('uldb');

app.controller('SystemManufacturerController', [
    '$scope',
    'AbstractControllerFactory2',
    'ULDBService2',
    function ($scope, AbstractControllerFactory2, ULDBService2) {
        $scope.ctrl = AbstractControllerFactory2($scope, ULDBService2.server_manufacturer());
    }
]);

app.controller('StorageManufacturerController', [
    '$scope',
    'AbstractControllerFactory2',
    'ULDBService2',
    function ($scope, AbstractControllerFactory2, ULDBService2) {
        $scope.ctrl = AbstractControllerFactory2($scope, ULDBService2.storage_manufacturer());
    }
]);

app.controller('PDUManufacturerController', [
    '$scope',
    'AbstractControllerFactory2',
    'ULDBService2',
    function ($scope, AbstractControllerFactory2, ULDBService2) {
        $scope.ctrl = AbstractControllerFactory2($scope, ULDBService2.pdu_manufacturer());
    }
]);

app.controller('ManufacturerController', [
    '$scope',
    'AbstractControllerFactory2',
    'ULDBService2',
    function ($scope, AbstractControllerFactory2, ULDBService2) {
        $scope.ctrl = AbstractControllerFactory2($scope, ULDBService2.manufacturer());
    }
]);

app.controller('CPUTypeController', [
    '$scope',
    '$http',
    'AbstractControllerFactory2',
    'ULDBService2',
    'InfoModalService',
    function ($scope, $http, AbstractControllerFactory2, ULDBService2, InfoModalService) {
        $scope.ctrl = AbstractControllerFactory2($scope, ULDBService2.cpuModel());
        $scope.additional_actions = [
            {
                name: "View Related CPUs",
                func: function (result, index) {
                    $http.get(result.url + 'cpus/').then(function (response) {
                        InfoModalService(response, $scope, 'CPUs', 'cpu', ['uuid', 'serial_number', 'server'], 'cpuModel').then();
                    });
                }
            }
        ];
    }
]);

app.controller('MemoryModelController', [
    '$scope',
    '$http',
    'AbstractControllerFactory2',
    'ULDBService2',
    'InfoModalService',
    function ($scope, $http, AbstractControllerFactory2, ULDBService2, InfoModalService) {
        $scope.ctrl = AbstractControllerFactory2($scope, ULDBService2.memModel());
        $scope.additional_actions = [
            {
                name: "View Related Memory",
                func: function (result, index) {
                    $http.get(result.url + 'memory/').then(function (response) {
                        InfoModalService(response,
                            $scope,
                            'Memory',
                            'memory',
                            ['uuid', 'serial_number', 'server'], 'memModel').then();
                    });
                }
            }
        ];
    }
]);

app.controller('DiskTypeController', [
    '$scope',
    'AbstractControllerFactory2',
    'ULDBService2',
    function ($scope, AbstractControllerFactory2, ULDBService2) {
        $scope.ctrl = AbstractControllerFactory2($scope, ULDBService2.diskModel());
    }
]);

app.controller('NICTypeController', [
    '$scope',
    'AbstractControllerFactory2',
    'ULDBService2',
    function ($scope, AbstractControllerFactory2, ULDBService2) {
        $scope.ctrl = AbstractControllerFactory2($scope, ULDBService2.nicModel());
    }
]);

app.controller('IPMIModelController', [
    '$scope',
    'AbstractControllerFactory2',
    'ULDBService2',
    function ($scope, AbstractControllerFactory2, ULDBService2) {
        $scope.ctrl = AbstractControllerFactory2($scope, ULDBService2.ipmiModel());
    }
]);

app.controller('ServerModelController', [
    '$scope',
    'AbstractControllerFactory2',
    'ULDBService2',
    function ($scope, AbstractControllerFactory2, ULDBService2) {
        $scope.ctrl = AbstractControllerFactory2($scope, ULDBService2.serverModel());
    }
]);

app.controller('MobileDeviceModelController', [
    '$scope',
    'AbstractControllerFactory2',
    'ULDBService2',
    function ($scope, AbstractControllerFactory2, ULDBService2) {
        $scope.ctrl = AbstractControllerFactory2($scope, ULDBService2.mobileModel());
    }
]);

app.controller('MobileDeviceManufacturerController', [
    '$scope',
    'AbstractControllerFactory2',
    'ULDBService2',
    function ($scope, AbstractControllerFactory2, ULDBService2) {
        $scope.ctrl = AbstractControllerFactory2($scope, ULDBService2.mobile_manufacturer());
    }
]);

app.controller('StorageModelController', [
    '$scope',
    'AbstractControllerFactory2',
    'ULDBService2',
    function ($scope, AbstractControllerFactory2, ULDBService2) {
        $scope.ctrl = AbstractControllerFactory2($scope, ULDBService2.storageModel());
    }
]);

app.controller('DatacenterController', [
    '$scope',
    'AbstractControllerFactory2',
    'ULDBService2',
    function ($scope, AbstractControllerFactory2, ULDBService2) {
        $scope.title = {
            plural: 'Datacenter Types',
            singular: 'Datacenter Type'
        };
        $scope.$root.title = $scope.title;
        
        $scope.ctrl = AbstractControllerFactory2($scope, ULDBService2.datacenter());
    }
]);

app.controller('LocationController', [
    '$scope',
    'AbstractControllerFactory2',
    'ULDBService2',
    function ($scope, AbstractControllerFactory2, ULDBService2) {
        $scope.title = {
            plural: 'Location Types',
            singular: 'Location Type'
        };
        $scope.$root.title = $scope.title;
        $scope.ctrl = AbstractControllerFactory2($scope, ULDBService2.location());
    }
]);

app.controller('OrgTypeController', [
    '$scope',
    'OrganizationType',
    'AlertService2',
    'AbstractControllerFactory',
    function ($scope, OrganizationType, AlertService2, AbstractControllerFactory) {
        $scope.resourceClass = OrganizationType;
        // $scope.breadCrumb = { name: "Organization Type", url: "#/orgtype" };
        $scope.title = {
            plural: "Organization Types",
            singular: "Organization Type"
        };
        $scope.ctrl = new AbstractControllerFactory($scope.resourceClass, $scope, "organization_type");

        $scope.rows = [
            { name: "organization_type", description: "Type", required: true }
        ];
    }
]);

app.controller('CustomerTypeController', [
    '$scope',
    'CustomerType',
    'AlertService2',
    'AbstractControllerFactory',
    function ($scope, CustomerType, AlertService2, AbstractControllerFactory) {
        $scope.resourceClass = CustomerType;
        // $scope.breadCrumb = { name: "Customer Type", url: "#/customertype" };
        $scope.title = {
            plural: "Customer Types",
            singular: "Customer Type"
        };
        $scope.ctrl = new AbstractControllerFactory($scope.resourceClass, $scope, "customer_type");

        $scope.rows = [
            { name: "customer_type", description: "Type", required: true }
        ];
    }
]);

app.controller('SwitchModelController', [
    '$scope',
    'AbstractControllerFactory2',
    'ULDBService2',
    function ($scope, AbstractControllerFactory2, ULDBService2) {
        $scope.ctrl = AbstractControllerFactory2($scope, ULDBService2.switchModel());
    }
]);

app.controller('SystemTypesController', [
    '$scope',
    'SystemType',
    'AlertService2',
    'AbstractControllerFactory',
    function ($scope, SystemType, AlertService2, AbstractControllerFactory) {
        $scope.resourceClass = SystemType;
        // $scope.breadCrumb = { name: "System Types", url: "#/systemtype" };
        $scope.title = {
            plural: "System Types",
            singular: "System Type"
        };
        $scope.ctrl = new AbstractControllerFactory($scope.resourceClass, $scope, "system_type");

        $scope.rows = [
            { name: "system_type", description: "System Type", required: true }
        ];
    }
]);

app.controller('ServerTypesController', [
    '$scope',
    'ServerType',
    'AlertService2',
    'AbstractControllerFactory',
    function ($scope, ServerType, AlertService2, AbstractControllerFactory) {
        $scope.resourceClass = ServerType;
        // $scope.breadCrumb = { name: "Server Types", url: "#/servertype" };
        $scope.title = {
            plural: "Server Types",
            singular: "Server Type"
        };
        $scope.ctrl = new AbstractControllerFactory($scope.resourceClass, $scope, "instance_type");

        $scope.rows = [
            { name: "instance_type", description: "Instance Type", required: true }

        ];
    }
]);


app.controller('ProductTypesController', [
    '$scope',
    'AbstractControllerFactory2',
    'ULDBService2',
    function ($scope, AbstractControllerFactory2, ULDBService2) {
        $scope.title = {
            plural: 'Product Types',
            singular: 'Product Type'
        };
        $scope.$root.title = $scope.title;

        $scope.ctrl = AbstractControllerFactory2($scope, ULDBService2.product_type());

    }
]);


app.controller('CabinetTypesController', [
    '$scope',
    'AbstractControllerFactory2',
    'ULDBService2',
    function ($scope, AbstractControllerFactory2, ULDBService2) {
        $scope.title = {
            plural: 'Cabinet Types',
            singular: 'Cabinet Type'
        };
        $scope.$root.title = $scope.title;

        $scope.ctrl = AbstractControllerFactory2($scope, ULDBService2.cabinet_type());
    }
]);

app.controller('CabinetOptionsController', [
    '$scope',
    'AbstractControllerFactory2',
    'ULDBService2',
    function ($scope, AbstractControllerFactory2, ULDBService2) {
        $scope.title = {
            plural: 'Cabinet Options',
            singular: 'Cabinet Option'
        };
        $scope.$root.title = $scope.title;
        
        $scope.ctrl = AbstractControllerFactory2($scope, ULDBService2.cabinet_options());
    }
]);


app.controller('CircuitOptionsController', [
    '$scope',
    'AbstractControllerFactory2',
    'ULDBService2',
    function ($scope, AbstractControllerFactory2, ULDBService2) {
        $scope.title = {
            plural: 'Circuit Options',
            singular: 'Circuit Option'
        };
        $scope.$root.title = $scope.title;

        $scope.ctrl = AbstractControllerFactory2($scope, ULDBService2.circuit_options());
    }
]);


app.controller('CPUSocketTypesController', [
    '$scope',
    'CPUSocketType',
    'AlertService2',
    'AbstractControllerFactory',
    function ($scope, CPUSocketType, AlertService2, AbstractControllerFactory) {
        $scope.resourceClass = CPUSocketType;
        // $scope.breadCrumb = { name: "CPU Socket Types", url: "#/cpusockettype" };
        $scope.title = {
            plural: "CPU Socket Types",
            singular: "CPU Socket Type"
        };
        $scope.ctrl = new AbstractControllerFactory($scope.resourceClass, $scope, "cpusocket_type");

        $scope.rows = [
            { name: "cpusocket_type", description: "Type", required: true },
            { name: "support_processors", description: "Support Processors", required: true }
        ];
    }
]);

app.controller('AMPSTypesController', [
    '$scope',
    'AbstractControllerFactory2',
    'ULDBService2',
    function ($scope, AbstractControllerFactory2, ULDBService2) {
        $scope.title = {
            plural: "AMP Types",
            singular: "AMP Type"
        };
        $scope.$root.title = $scope.title;

        $scope.ctrl = AbstractControllerFactory2($scope, ULDBService2.amps_type());
    }
]);

app.controller('OutletTypesController', [
    '$scope',
    'AbstractControllerFactory2',
    'ULDBService2',
    function ($scope, AbstractControllerFactory2, ULDBService2) {
        $scope.title = {
            plural: "Outlet Types",
            singular: "Outlet Type"
        };
        $scope.$root.title = $scope.title;

        $scope.ctrl = AbstractControllerFactory2($scope, ULDBService2.outlet_type());
    }
]);


app.controller('PeripheralTypesController', [
    '$scope',
    'AbstractControllerFactory2',
    'ULDBService2',
    function ($scope, AbstractControllerFactory2, ULDBService2) {
        $scope.ctrl = AbstractControllerFactory2($scope, ULDBService2.peripheral_type());
    }
]);

app.controller('ClusterTypesController', [
    '$scope',
    'AbstractControllerFactory2',
    'ULDBService2',
    function ($scope, AbstractControllerFactory2, ULDBService2) {
        $scope.title = {
            singular: 'Cluster Type',
            plural: 'Cluster Types'
        };
        $scope.$root.title = $scope.title;
        $scope.ctrl = AbstractControllerFactory2($scope, ULDBService2.cluster_type());
    }
]);

app.controller('SASControllerTypesController', [
    '$scope',
    'AbstractControllerFactory2',
    'ULDBService2',
    function ($scope, AbstractControllerFactory2, ULDBService2) {
        // $scope.resourceClass = SASControllerType;
        // $scope.breadCrumb = { name: "SAS Controller Types", url: "#/sascontrollertype" };
        $scope.title = {
            plural: "SAS Controller Types",
            singular: "SAS Controller Type"
        };
        $scope.ctrl = AbstractControllerFactory2($scope, ULDBService2.sascontroller_type());

        // $scope.rows = [
        //     { name: "sascontroller_type", description: "Type", required: true },
        //     { name: "sas_raid_support", description: "RAID Support", required: true }

        // ];
    }
]);

app.controller('VoltageTypesController', [
    '$scope',
    'AbstractControllerFactory2',
    'ULDBService2',
    function ($scope, AbstractControllerFactory2, ULDBService2) {
        $scope.title = {
            plural: "Voltage Types",
            singular: "Voltage Type"
        };
        $scope.$root.title = $scope.title;

        $scope.ctrl = AbstractControllerFactory2($scope, ULDBService2.voltage_type());
    }
]);

app.controller('LoadBalancerModelController', [
    '$scope',
    'AbstractControllerFactory2',
    'ULDBService2',
    function ($scope, AbstractControllerFactory2, ULDBService2) {
        $scope.ctrl = AbstractControllerFactory2($scope, ULDBService2.loadBalancerModel());
    }
]);

app.controller('FirewallModelController', [
    '$scope',
    'AbstractControllerFactory2',
    'ULDBService2',
    function ($scope, AbstractControllerFactory2, ULDBService2) {
        $scope.title = {
            plural: "Firewall Model Types",
            singular: "Firewall Model Type"
        };
        $scope.$root.title = $scope.title;
        $scope.ctrl = AbstractControllerFactory2($scope, ULDBService2.firewallModel());
    }
]);

app.controller('PDUModelController', [
    '$scope',
    'AbstractControllerFactory2',
    'ULDBService2',
    function ($scope, AbstractControllerFactory2, ULDBService2) {
        $scope.title = {
            plural: "PDU Model Types",
            singular: "PDU Model Type"
        };
        $scope.$root.title = $scope.title;
        $scope.ctrl = AbstractControllerFactory2($scope, ULDBService2.pduModel());
    }
]);

app.controller('TerminalServerModelController', [
    '$scope',
    'AbstractControllerFactory2',
    'ULDBService2',
    function ($scope, AbstractControllerFactory2, ULDBService2) {
        $scope.ctrl = AbstractControllerFactory2($scope, ULDBService2.terminalServerModel());

    }
]);

app.controller('ElectricalPanelController', [
    '$scope',
    'AbstractControllerFactory2',
    'ULDBService2',
    function ($scope, AbstractControllerFactory2, ULDBService2) {
        $scope.title = {
            plural: "Electrical Panel Types",
            singular: "Electrical Panel Type"
        };
        $scope.$root.title = $scope.title;

        $scope.ctrl = AbstractControllerFactory2($scope, ULDBService2.electricalpanel());

    }
]);

app.controller('ElectricalCircuitController', [
    '$scope',
    'AbstractControllerFactory2',
    'ULDBService2',
    function ($scope, AbstractControllerFactory2, ULDBService2) {
        $scope.title = {
            plural: "Electrical Circuit Types",
            singular: "Electrical Circuit Type"
        };
        $scope.$root.title = $scope.title;

        $scope.ctrl = AbstractControllerFactory2($scope, ULDBService2.electricalcircuit());

    }
]);

app.controller('OperatingSystemController', [
    '$scope',
    'AbstractControllerFactory2',
    'ULDBService2',
    function ($scope, AbstractControllerFactory2, ULDBService2) {
        $scope.ctrl = AbstractControllerFactory2($scope, ULDBService2.os());
    }
]);

app.controller('CloudTypeController', [
    '$scope',
    'AbstractControllerFactory2',
    'ULDBService2',
    function ($scope, AbstractControllerFactory2, ULDBService2) {
        $scope.title = {
            singular: 'Cloud Type',
            plural: 'Cloud Types'
        };
        $scope.$root.title = $scope.title;

        $scope.ctrl = AbstractControllerFactory2($scope, ULDBService2.cloud_type());
    }
]);

app.controller('DiskControllerTypeController', [
    '$scope',
    'DiskControllerTypes',
    'AlertService2',
    'ULDBService2',
    'AbstractControllerFactory2',
    function ($scope, DiskControllerTypes, AlertService2, ULDBService2, AbstractControllerFactory2) {
        $scope.title = {
            plural: "Disk Controller Types",
            singular: "Disk Controller Type"
        };
        $scope.$root.title = $scope.title;
        $scope.ctrl = AbstractControllerFactory2($scope, ULDBService2.disk_controller_type());
    }
]);

app.controller('RAIDControllerTypeController', [
    '$scope',
    'AbstractControllerFactory2',
    'ULDBService2',
    function ($scope, AbstractControllerFactory2, ULDBService2) {
        // $scope.resourceClass = RAIDController;
        // $scope.breadCrumb = { name: "RAID Controller Types", url: "#/raidcontrollertype" };
        $scope.title = {
            plural: "RAID Controller Types",
            singular: "RAID Controller Type"
        };
        $scope.$root.title = $scope.title;
        $scope.ctrl = AbstractControllerFactory2($scope, ULDBService2.raidcontroller_type());

        // $scope.ctrl = new AbstractControllerFactory($scope.resourceClass, $scope, "controller");
        
        // $scope.rows = [
        //     { name: "controller", description: "Controller", required: true },
        //     { name: "assettag", description: "Assettag", required: true },
        //     { name: "serialnumber", description: "Serial Number", required: true },
        //     { name: "raid_support", description: "RAID Support", required: true },
        //     { name: "is_allocated", description: "Is Allocated", required: true,
        //         inputMethod: {
        //             type: 'choices',
        //             choices: [true, false]
        //         }
        //     },
        //     {
        //         name: "manufacturer", description: "Manufacturer", required: true,
        //         opaque: true,
        //         subfield: "name",
        //         read: function (result) {
        //             if (result.manufacturer && result.manufacturer.name) {
        //                 return result.manufacturer.name;
        //             }
        //             else if (result.manufacturer !== null) {
        //                 return result.manufacturer;
        //             }
        //             else {
        //                 return "";
        //             }
        //         },
        //         edit: function (result) {
        //             if (!('url' in result)) {
        //                 return null;
        //             }
        //             return $scope.manufacturers.find(function (e, i, arr) {
        //                 return e.url == result.url;
        //             });
        //         },
        //         render: $scope.getManufacturer
        //     },
        //     // {
        //     //     name: "status", description: "Status", required: true,
        //     //     opaque: 'stringTransform',
        //     //     read: function (result) {
        //     //         if (result.status && result.status.status_type) {
        //     //             return result.status.status_type;
        //     //         }
        //     //         else if (result.status !== null) {
        //     //             return result.status;
        //     //         }
        //     //         else {
        //     //             return "";
        //     //         }
        //     //     },
        //     //     render: $scope.getStatus,
        //     //     subfield: "status_type"
        //     // }
        // ];
    }
]);

app.controller('MotherboardModelController', [
    '$scope',
    'AbstractControllerFactory2',
    'ULDBService2',
    function ($scope, AbstractControllerFactory2, ULDBService2) {
        $scope.title = {
            plural: "Motherboard Model Types",
            singular: "Motherboard Model Type"
        };
        $scope.$root.title = $scope.title;
        $scope.ctrl = AbstractControllerFactory2($scope, ULDBService2.moboModel());
    }
]);


app.controller('ChassisTypeController', [
    '$scope',
    'AbstractControllerFactory2',
    'ULDBService2',
    function ($scope, AbstractControllerFactory2, ULDBService2) {
        $scope.title = {
            plural: "Chassis Types",
            singular: "Chassis Type"
        };
        $scope.$root.title = $scope.title;
        $scope.ctrl = AbstractControllerFactory2($scope, ULDBService2.chassis_type());
    }
]);


app.controller('OpenStackDashboardController', [
    '$scope',
    '$location',
    'AbstractControllerFactory2',
    'ULDBService2',
    '$uibModal',
    function ($scope, $location, AbstractControllerFactory2, ULDBService2,$uibModal) {
        //  TAB CONTROL
        $scope.tabs = [
            { name: 'OpenStack API Account', url: 'openstack-dashboard' },
            { name: 'OpenStack Proxy', url: 'openstack-proxy' }
        ];

        $scope.activeTab = 0;
        $scope.updateTab = function (idx) {
            $location.path($scope.tabs[idx].url);
        };
        //  END TAB CONTROL FUNCTIONALITY
        $scope.ctrl = AbstractControllerFactory2($scope, ULDBService2.openstack());

        $scope.additional_actions = [
            {
                name: "Change Password",
                func: function (result, index) {
                      // console.log(result);
                      $scope.change_password_entity = result.id;
                      $scope.change_password_url = "/rest/openstack/controller/change_password/";
                      $scope.changePassword();
                }
            }
        ];


        $scope.changePassword = function ( ) {
            var modalInstance = $uibModal.open({
                templateUrl: '/static/rest/app/templates/change_password.html',
                scope: $scope,

                size: 'md',
                controller: 'changePasswordContoller'
            });
            modalInstance.result.then();
        };


    }
]);

app.controller('VMwareDashboardController', [
    '$scope',
    '$location',
    'AbstractControllerFactory2',
    'ULDBService2',
    '$uibModal',
    function ($scope, $location, AbstractControllerFactory2, ULDBService2,$uibModal) {

        $scope.tabs = [
            { name: 'vCenter API Account', url: 'vmware-dashboard' },
            { name: 'vCenter Config', url: 'vmware-config' },
            { name: 'vCenter Proxy', url: 'vmware-vcenter' },
            { name: 'Vmware ESXi Proxy', url: 'vmware-esxi' },
        ];

        $scope.activeTab = 0;
        $scope.updateTab = function (idx) {
            $location.path($scope.tabs[idx].url);
        };

        $scope.ctrl = AbstractControllerFactory2($scope, ULDBService2.vmware());

        $scope.additional_actions = [
            {
                name: "Change Password",
                func: function (result, index) {
                      $scope.change_password_entity = result.id;
                      $scope.change_password_url = "/rest/vmware/vcenter/change_password/";
                      $scope.changePassword( );
                }
            }
        ];


        $scope.changePassword = function ( ) {
            var modalInstance = $uibModal.open({
                templateUrl: '/static/rest/app/templates/change_password.html',
                scope: $scope,

                size: 'md',
                controller: 'changePasswordContoller'
            });
            modalInstance.result.then();
        };

    }
]);


app.controller('VMwareVcenterConfigController', [
    '$scope',
    '$location',
    'AbstractControllerFactory2',
    'ULDBService2',
    '$uibModal',
    function ($scope, $location, AbstractControllerFactory2, ULDBService2,$uibModal) {

        $scope.tabs = [
            { name: 'vCenter API Account', url: 'vmware-dashboard' },
            { name: 'vCenter Config', url: 'vmware-config' },
            { name: 'vCenter Proxy', url: 'vmware-vcenter' },
            { name: 'Vmware ESXi Proxy', url: 'vmware-esxi' },
        ];

        $scope.activeTab = 0;
        $scope.updateTab = function (idx) {
            $location.path($scope.tabs[idx].url);
        };

        $scope.ctrl = AbstractControllerFactory2($scope, ULDBService2.vmware_config());

    }
]);




app.controller('changePasswordContoller', [
    '$scope',
    '$uibModalInstance',
    '$http',
    '$routeParams',
    'AlertService2',
    'TaskService2',
    function ($scope, $uibModalInstance, $http, $routeParams, AlertService2, TaskService2) {


        $scope.change_password = function (request) {
            var validation_msg = "This field is required";
            var stop_execution = false;

            $scope.password_errmsg = '';
            $scope.confirm_password_errmsg = '';

            if(request === undefined){
                $scope.password_errmsg = validation_msg;
                $scope.confirm_password_errmsg = validation_msg;
                return;
            }
            if(request.password === undefined || request.password == '' ){
                $scope.password_errmsg = validation_msg;
                stop_execution = true;
            }
            if(request.confirm_password === undefined || request.confirm_password == '' ){
                $scope.confirm_password_errmsg = validation_msg;
                stop_execution = true;
            }
            if(request.password != request.confirm_password ){
                $scope.confirm_password_errmsg = 'Passwords do not match.';
                stop_execution = true;
            }
            if(stop_execution){
                return;
            }
            request.entity_id = $scope.change_password_entity;

            $http.post($scope.change_password_url, request).
            then(function (response) {
                $uibModalInstance.close();
                if (response.data.hasOwnProperty('task_id')){
                    TaskService2.processTask(response.data.task_id).then(function (response) {
                        AlertService2.success('Password Updated Successfully');
                    }).catch(function (error) {
                        AlertService2.danger('Invalid credential');
                    });
                }
                else{
                    $uibModalInstance.close();
                    AlertService2.success(response.data);
                }
            })
            .catch(function (error) {
                AlertService2.danger("Error occured while updating password. "+ JSON.stringify(error.data));
            });

        };
        $scope.cancel = function () {
            $uibModalInstance.dismiss();
        };
    }
]);


app.controller('changeApiKeysContoller', [
    '$scope',
    '$uibModalInstance',
    '$http',
    '$routeParams',
    'AlertService2',
    'TaskService2',
    '$rootScope',
    function ($scope, $uibModalInstance, $http, $routeParams, AlertService2, TaskService2, $rootScope) {

        $scope.change_api_keys = function (request) {
            var validation_msg = "This field is required";
            var stop_execution = false;
            $scope.access_id_errmsg = '';
            $scope.access_key_errmsg = '';

            if(request === undefined){
                $scope.access_id_errmsg = validation_msg;
                $scope.access_key_errmsg = validation_msg;
                return;
            }
            if(request.access_id === undefined || request.access_id == '' ){
                $scope.access_id_errmsg = validation_msg;
                stop_execution = true;
            }
            if(request.access_key === undefined || request.access_key == '' ){
                $scope.access_key_errmsg = validation_msg;
                stop_execution = true;
            }
            if(stop_execution){
                return;
            }
            request.entity_id = $scope.change_api_keys_entity;

            $http.post($scope.change_api_keys_url, request).
            then(function (response) {
                console.log('response : ' , angular.toJson(response));
                $uibModalInstance.close();
                AlertService2.success(response.data);
            })
            .catch(function (error) {
                AlertService2.danger(error.data);
            });

        };
        $scope.cancel = function () {
            $uibModalInstance.dismiss();
        };
    }
]);


app.controller('MaintenanceScheduleController', [
    '$scope',
    '$location',
    'AbstractControllerFactory2',
    'AbstractControllerFactory3',
    'ULDBService2',
    function ($scope, $location, AbstractControllerFactory2, AbstractControllerFactory3, ULDBService2) {
        $scope.title = {
            plural: 'Maintenance Schedules',
            singular: 'Maintenance Schedule'
        };
        $scope.$root.title = $scope.title;

        $scope.ctrl = AbstractControllerFactory2($scope, ULDBService2.maintenace_schedule());

        // $scope.handler = {
        //     modifiable: true
        // };
        // $scope.config = {
        //     shownFields: ['description', 'status', 'datacenter', 'impacted_customer', 'start_date', 'end_date']
        // };
        // $scope.ctrl = AbstractControllerFactory3($scope.handler, ULDBService2.maintenace_schedule(), $scope.config);
    }
]);