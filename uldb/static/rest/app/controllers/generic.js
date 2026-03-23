var app = angular.module('uldb');
app.controller('DashboardController', [
    '$scope',
    '$rootScope',
    'AlertService2',
    'BreadCrumbService',
    'Organization',
    'VMwareService',
    'CustomDataService',
    '$http',
    // 'CustomerDashboardDetails',
    function ($scope, $rootScope, AlertService2, BreadCrumbService, Organization, VMwareService, CustomDataService, $http
        // , CustomerDashboardDetails
    ) {
        $scope.pageSize = 10;
        $scope.alertService = AlertService2;
        $scope.fullview = true;
        $scope.customerview = false;

        $scope.collapsedserver = false;
        $scope.collapsedvserver = false;
        $scope.collapsedfirewall = false;
        $scope.collapsedloadbalancer = false;
        $scope.collapsedswitch = false;
        $scope.collapsedcabinet = false;
        $scope.collapsedcage = false;
        $scope.collapsedpdu = false;

        $scope.bread = BreadCrumbService;
        $scope.$on('$destroy', function () {
            $scope.bread.pushIfTop({ name: "Dashboard", url: '#/dashboard' }, $scope);
        });

        /*** load Organization on type ***/

        $scope.getOrgs = function (val) {
            return Organization.get({ 'search': val }).$promise.then(function (response) {
                return response.results;
            });
        };

        // $scope.FillCustomerDashboard = function (org) {
        //     CustomerDashboardDetails.get({ 'id': org.id }).$promise.then(function (response) {
        //         $scope.fullview = false;
        //         $scope.customerview = true;
        //
        //         $scope.servers = response.servers;
        //         $scope.virtualservers = response.virtualservers;
        //         $scope.firewalls = response.firewalls;
        //         $scope.loadbalancers = response.loadbalancers;
        //         $scope.switches = response.switches;
        //         $scope.cabinets = response.cabinets;
        //         $scope.cages = response.cages;
        //         $scope.pdus = response.pdus;
        //     });
        // };

        $scope.CheckCustomer = function (event) {

            if (event.target.value == "") {
                $scope.fullview = true;
                $scope.customerview = false;
            }
        };
    }
]);

app.controller('ServerController', [
    '$scope',
    '$rootScope',
    'Server',
    'AlertService2',
    'SearchService',
    'AbstractControllerFactory',
    function ($scope, $rootScope, Server, AlertService2, SearchService, AbstractControllerFactory) {
        $scope.title = {
            plural: 'Servers',
            singular: 'Server'
        };

        $scope.resourceClass = Server;
        // $scope.breadCrumb = { name: "Servers", url: "#/servers" };
        $scope.ctrl = new AbstractControllerFactory($scope.resourceClass, $scope, "name");

        $scope.rows = [
            {
                name: "system_name", description: "Name", required: true,
                opaque: 'link',
                read: function (result) {
                    return {
                        url: "#/servers/" + result.id,
                        text: result.system_name
                    };
                }
            },
            { name: "system_assettag", description: "Asset Tag", required: true },
            {
                name: "instance_type", description: "Instance Type", required: true,
                opaque: 'stringTransform',
                subfield: "instance_type",
                read: function (result) {
                    if (result.instance !== null) {
                        return result.instance.instance_type;
                    }
                    return "Not configured";
                }
            },
            {
                name: "os", description: "Operating System", required: true,
                opaque: 'stringTransform',
                subfield: "name",
                read: function (result) {
                    if (result.related.instance.os === null) {
                        return "";
                    }
                    return result.related.instance.os.name + " " + result.related.instance.os.version;
                }
            },
            {
                name: "customer", description: "Customer", required: true,
                opaque: "link",
                read: function (result) {
                    if (result.related.customer !== null) {
                        window.orgfrom = "Server";
                        return {
                            url: "#/org/" + result.related.customer.id,
                            text: result.related.customer.name
                        };
                    }
                    return "";
                },
                subfield: "name"
            },
        ];
    }
]);

app.controller('SwitchController', [
    '$scope',
    '$routeParams',
    '$location',
    'AbstractControllerFactory2',
    'ULDBService2',
    function ($scope, $routeParams, $location, AbstractControllerFactory2, ULDBService2) {
        //  TAB CONTROL : Temporary for Demo
        $scope.tabs = [
            { name: 'Switches', url: 'switch' },
            { name: 'Cisco Switch', url: 'cisco-switch' },
            { name: 'Juniper Switch', url: 'juniper-switch' },
        ];

        $scope.activeTab = 0;
        $scope.updateTab = function (idx) {
            $location.path($scope.tabs[idx].url);
        };
        //  END TAB CONTROL FUNCTIONALITY

        $scope.ctrl = AbstractControllerFactory2($scope, ULDBService2.sw());
    }
]);

app.controller('LoadBalancerController', [
    '$scope',
    '$routeParams',
    '$location',
    'AbstractControllerFactory2',
    'ULDBService2',
    function ($scope, $routeParams, $location, AbstractControllerFactory2, ULDBService2) {

        //  TAB CONTROL : Temporary for Demo
        $scope.tabs = [
            { name: 'Load Balancers', url: 'loadbalancer' },
            { name: 'Virtual Load Balancers', url: 'virtual_load_balancer' },
            { name: 'NetScaler VPX', url: 'citrix-vpx-device' },
            { name: 'F5 Load Balancer', url: 'f5-lb-proxy' },
        ];

        $scope.activeTab = 0;
        $scope.updateTab = function (idx) {
            $location.path($scope.tabs[idx].url);
        };
        //  END TAB CONTROL FUNCTIONALITY

        $scope.ctrl = AbstractControllerFactory2($scope, ULDBService2.loadBalancer());
    }
]);

app.controller('VirtualLoadBalancerController', [
    '$scope',
    '$routeParams',
    '$location',
    'AbstractControllerFactory2',
    'ULDBService2',
    function ($scope, $routeParams, $location, AbstractControllerFactory2, ULDBService2) {

        //  TAB CONTROL : Temporary for Demo
        $scope.tabs = [
            { name: 'Load Balancers', url: 'loadbalancer' },
            { name: 'Virtual Load Balancers', url: 'virtual_load_balancer' },
            { name: 'NetScaler VPX', url: 'citrix-vpx-device' },
            { name: 'F5 Load Balancer', url: 'f5-lb-proxy' },
        ];

        $scope.activeTab = 1;
        $scope.updateTab = function (idx) {
            $location.path($scope.tabs[idx].url);
        };
        //  END TAB CONTROL FUNCTIONALITY

        $scope.ctrl = AbstractControllerFactory2($scope, ULDBService2.virtualLoadBalancer());
    }
]);

app.controller('ManufacturerDetailController', [
    '$scope',
    '$routeParams',
    'Manufacturer',
    'AlertService2',
    '$uibModal',
    'BreadCrumbService',
    function ($scope, $routeParams, Manufacturer, AlertService2, $uibModal, BreadCrumbService) {
        $scope.alertService = AlertService2;

        var resourceClass = Manufacturer;

        // generic stuff, refactor out later
        var id = $routeParams.id;

        $scope.bread = BreadCrumbService;

        $scope.$on('$destroy', function () {
            $scope.bread.pushIfTop({ name: "Manufacturer Details", url: '#/manufacturers/' + id }, $scope);
        });

        resourceClass.get({ id: id }).$promise.then(function (response) {
            $scope.result = response;
        });

        $scope.cols = [
            { name: 'name', description: 'Name', required: true },
        ];

    }
]);


app.controller('SwitchDetailController', [
    '$scope',
    '$routeParams',
    'Switch',
    'SwitchPort',
    'AlertService2',
    '$uibModal',
    'BreadCrumbService',
    function ($scope, $routeParams, Switch, SwitchPort, AlertService2, $uibModal, BreadCrumbService) {
        $scope.alertService = AlertService2;

        var resourceClass = Switch;

        // generic stuff, refactor out later
        var id = $routeParams.id;
        //$scope.breadCrumb = {name: "SwitchDetails", url:"#/switch/"+id};

        $scope.bread = BreadCrumbService;

        $scope.$on('$destroy', function () {
            $scope.bread.pushIfTop({ name: "Switch Details", url: '#/switch/' + id }, $scope);
        });

        $scope.result = resourceClass.get({ id: id });
        $scope.result.$promise.then(function (response) {
            $scope.inheritedColumnsModel = response.switch_model_details;
        });
        $scope.cols = [
            { name: 'name', description: 'Name', required: true },
            { name: 'assettag', description: 'Asset Tag', required: true },
            { name: 'ip_address', description: 'IP Address', required: true },
            { name: 'salesforce_id', description: 'Salesforce ID', required: true },
        ];
        $scope.inheritedCols = [
            { name: 'model', description: "Model" },
            { name: 'num_ports', description: "Total Ports" },
            { name: 'num_uplink_ports', description: "Total Uplink Ports" },
            { name: 'port_speed', description: "Port Speed" },
            { name: 'uplink_port_speed', description: "Uplink Port Speed" },
            { name: 'port_phy', description: "Port PHY" },
            { name: 'uplink_port_phy', description: "Uplink Port PHY" },
        ];
        $scope.editPort = function (port, idx) {
            $scope.modal = {
                templateUrl: '/static/rest/app/templates/snippets/modal.html',
                scope: $scope,
                size: 'md',
                controller: 'GenericModal',
                resolve: {
                    obj: function () {
                        return JSON.parse(JSON.stringify(port));
                    },
                    resourceClass: function () {
                        return SwitchPort;
                    },
                    array: function () {
                        return $scope.result.ports;
                    },
                    idField: function () {
                        return "port_number";
                    },
                    rows: function () {
                        return [
                            { name: 'port_name', description: "Port Name", required: true }
                        ];
                    }
                }
            };
            $scope.method = 'Edit';
            var modalInstance = $uibModal.open($scope.modal);
            modalInstance.result.then();
        };
    }
]);


app.controller('SwitchModelDetailController', [
    '$scope',
    '$routeParams',
    'SwitchModel',
    'AlertService2',
    '$uibModal',
    'BreadCrumbService',
    function ($scope, $routeParams, SwitchModel, AlertService2, $uibModal, BreadCrumbService) {
        $scope.alertService = AlertService2;

        var resourceClass = SwitchModel;

        var id = $routeParams.id;
        $scope.bread = BreadCrumbService;

        $scope.$on('$destroy', function () {
            $scope.bread.pushIfTop({ name: "Switch Model Details", url: '#/switchmodel/' + id }, $scope);
        });

        $scope.result = resourceClass.get({ id: id });
        $scope.cols = [
            { name: 'name', description: "Model" },
            { name: 'num_ports', description: "Total Ports" },
            { name: 'num_uplink_ports', description: "Total Uplink Ports" },
            { name: 'port_speed_mbps', description: "Port Speed" },
            { name: 'uplink_port_speed_mbps', description: "Uplink Port Speed" },
            { name: 'port_phy', description: "Port PHY" },
            { name: 'uplink_port_phy', description: "Uplink Port PHY" },
        ];


    }
]);

app.controller('VirtualMachineDetailController', [
    '$scope',
    '$routeParams',
    'VirtualMachine',
    'Instance',
    'AlertService2',
    '$uibModal',
    'BreadCrumbService',
    'ULDBService2',
    function ($scope, $routeParams, VirtualMachine, Instance, AlertService2, $uibModal, BreadCrumbService, ULDBService2) {
        var resourceClass = VirtualMachine;
        var id = $routeParams.id;

        $scope.alertService = AlertService2;
        $scope.bread = BreadCrumbService;

        resourceClass.get({ id: id }).$promise.then(function (response) {
            $scope.result = response;
            $scope.title = {
                singular: $scope.result.name,
                plural: $scope.result.name
            };
            if ($scope.$parent === $scope.$root) $scope.$root.title = $scope.title;
            $scope.syscols = ULDBService2.virtualMachine().fields();
            $scope.svrcols = ULDBService2.instance().fields();
            $scope.$on('$destroy', function () {
                $scope.bread.pushIfTop({ name: $scope.result.name, url: '#/vm/' + id }, $scope);
            });
        });

        $scope.modify = function () {
            // original is a reference to the object
            // obj is a copy of original
            $scope.original = $scope.result;
            $scope.obj = angular.copy($scope.result);
            $scope.activeCols = $scope.syscols;
            $scope.resourceClass = VirtualMachine;
            var modalInstance = $uibModal.open({
                templateUrl: '/static/rest/app/templates/modal/requestor.html',
                controller: 'EditServerModal',
                scope: $scope,
                size: 'md'
            });
            modalInstance.result.then();
        };

        $scope.modifyInstance = function () {
            $scope.original = $scope.result.instance;
            $scope.obj = angular.copy($scope.result.instance);
            $scope.activeCols = $scope.svrcols;
            $scope.resourceClass = Instance;
            var modalInstance = $uibModal.open({
                templateUrl: '/static/rest/app/templates/modal/requestor.html',
                controller: 'EditServerModal',
                scope: $scope,
                size: 'md'
            });
            modalInstance.result.then();
        };
    }
]);

app.controller('CustomerDetailController', [
    '$scope',
    '$routeParams',
    'Organization',
    'AlertService2',
    '$uibModal',
    'BreadCrumbService',
    function ($scope, $routeParams, Organization, AlertService2, $uibModal, BreadCrumbService) {
        $scope.alertService = AlertService2;
        var resourceClass = Organization;

        var id = $routeParams.id;
        $scope.bread = BreadCrumbService;
        $scope.$on('$destroy', function () {
            $scope.bread.pushIfTop({ name: "Customer Detail", url: '#/org/' + id }, $scope);
            window.orgfrom = "";
        });

        resourceClass.get({ id: id }).$promise.then(function (response) {
            $scope.result = response;
        });

        $scope.cols = [
            { name: 'name', description: 'Name', required: true },
            { name: 'address1', description: 'Address1', required: true },
            { name: 'address2', description: 'Address2', required: true },
            { name: 'city', description: 'City', required: true },
            { name: 'state', description: 'State', required: true },
            { name: 'country', description: 'Country', required: true },
            { name: 'phone', description: 'Contact', required: true },
            { name: 'email', description: 'Email', required: true },
        ];
    }
]);

app.controller('VDCDetailController', [
    '$scope',
    '$routeParams',
    '$location',
    'VirtualDataCenter',
    'VDCRelated',
    'AlertService2',
    '$uibModal',
    'BreadCrumbService',
    function ($scope, $routeParams, $location, VirtualDataCenter, VDCRelated, AlertService2, $uibModal, BreadCrumbService) {
        $scope.alertService = AlertService2;
        var resourceClass = VDCRelated;

        var id = $routeParams.id;
        $scope.bread = BreadCrumbService;
        $scope.$on('$destroy', function () {
            $scope.bread.pushIfTop({ name: "Virtual Data Center Details", url: '#/virtualdatacenter/' + id }, $scope);
        });

        $scope.serveravailable = false;
        $scope.sanavailable = false;
        $scope.switchavailable = false;
        $scope.firewallavailable = false;
        $scope.loadbalanceravailable = false;

        $scope.ShowSwitchDetails = function (id) {
            $location.path("/switch/" + id);
        };

        $scope.ShowFirewallDetails = function (id) {
            $location.path("/firewall/" + id);
        };

        $scope.ShowLoadbalancerDetails = function (id) {
            $location.path("/loadbalancer/" + id);
        };

        $scope.ShowInstanceDetails = function (id) {
            $location.path("/instance/" + id);
        };

        $scope.vdcresult = VirtualDataCenter.get({ id: id });

        resourceClass.get({ id: id }).$promise.then(function (response) {
            if (response.servers.length > 0) {
                $scope.serverdet = response.servers;
                $scope.serveravailable = true;
            }
            else {
                $scope.serveravailable = false;
            }
            if (response.storage_servers.length > 0) {
                $scope.sanserverdet = response.storage_servers;
                $scope.sanavailable = true;
            }
            else {
                $scope.sanavailable = false;
            }
            if (response.switches.length > 0) {
                $scope.switchdet = response.switches;
                $scope.switchavailable = true;
            }
            else {
                $scope.switchavailable = false;
            }
            if (response.firewalls.length > 0) {
                $scope.firewalldet = response.firewalls;
                $scope.firewallavailable = true;
            }
            else {
                $scope.firewallavailable = false;
            }
            if (response.loadbalancers.length > 0) {
                $scope.loadbalancerdet = response.loadbalancers;
                $scope.loadbalanceravailable = true;
            }
            else {
                $scope.loadbalanceravailable = false;
            }
        });

        $scope.vdccols = [
            { name: 'name', description: 'Name', required: true },
            { name: 'cloud_type', description: 'Cloud Type', required: true },
            { name: 'is_allocated', description: 'Allocated', required: true },

        ];

    }
]);

app.controller('LocationDetailController', [
    '$scope',
    '$routeParams',
    'Location',
    'AlertService2',
    '$uibModal',
    'BreadCrumbService',
    function ($scope, $routeParams, Location, AlertService2, $uibModal, BreadCrumbService) {
        $scope.alertService = AlertService2;

        var resourceClass = Location;

        // generic stuff, refactor out later
        var id = $routeParams.id;

        $scope.bread = BreadCrumbService;

        $scope.$on('$destroy', function () {
            $scope.bread.pushIfTop({ name: "Location Details", url: '#/location/' + id }, $scope);
        });

        resourceClass.get({ id: id }).$promise.then(function (response) {
            $scope.result = response;
        });

        $scope.cols = [
            { name: 'name', description: 'Location Name', required: true },
            { name: 'latitude', description: 'Latitude', required: true },
            { name: 'longitude', description: 'Longitude', required: true },
        ];

    }
]);

// app.controller('PDUController', [
//     '$scope',
//     'PDU',
//     'PowerCircuit',
//     'InvStatus',
//     'AbstractControllerFactory',
//     'SearchService',
//     'OrganizationFast',
//     'CabinetFast',
//     'PDUModelFast',
//     function ($scope, PDU, PowerCircuit, InvStatus, AbstractControllerFactory, SearchService,
//               OrganizationFast, CabinetFast, PDUModelFast) {
//         $scope.resourceClass = PDU;
//         $scope.breadCrumb = { name: "PDU", url: "#/pdu" };
//         $scope.title = {
//             plural: 'PDUs',
//             singular: 'PDU'
//         };
//         $scope.ctrl = new AbstractControllerFactory($scope.resourceClass, $scope, "hostname");

//         var searchService = new SearchService(OrganizationFast);
//         $scope.getOrgs = searchService.search;

//         var cabSearch = new SearchService(CabinetFast);
//         $scope.getCabs = cabSearch.search;

//         var pduModelSearch = new SearchService(PDUModelFast);
//         $scope.getPduModels = pduModelSearch.search;

//         var PowerCircuitSearch = new SearchService(PowerCircuit);
//         $scope.getPowerCircuits = PowerCircuitSearch.search;

//         var InvStatusSearch = new SearchService(InvStatus);
//         $scope.getStatus = InvStatusSearch.search;

//         $scope.rows = [
//             { name: "hostname", description: "Hostname", required: true },
//             { name: 'assettag', description: 'Assettag', required: true },
//             { name: "ip_address", description: "IP Address", required: true },
//             { name: "serialnumber", description: "Serial Number", required: true, hide: true },
//             {
//                 name: "pdu_model", description: "PDU Model", required: true,
//                 opaque: 'stringTransform',
//                 read: function (result) {
//                     if (result.pdu_model && result.pdu_model.model_number) {
//                         return result.pdu_model.model_number;
//                     }
//                     else if (result.pdu_model !== null) {
//                         return result.pdu_model;
//                     }
//                     else {
//                         return "";
//                     }
//                 },
//                 render: $scope.getPduModels,
//                 subfield: "model_number"
//             },
//             {
//                 name: "cabinet", description: "Cabinet", required: true,
//                 opaque: 'stringTransform',
//                 subfield: "name",
//                 read: function (result) {

//                     if (result.cabinet && result.cabinet.name) {
//                         return result.cabinet.name;
//                     }
//                     else if (result.cabinet !== null) {
//                         return result.cabinet;
//                     }
//                     else {
//                         return "";
//                     }
//                 },
//                 render: $scope.getCabs
//             },
//             {
//                 name: "power_circuit", description: "Power Circuit", required: true,
//                 opaque: 'stringTransform',
//                 subfield: "name",
//                 read: function (result) {

//                     if (result.power_circuit && result.power_circuit.name) {
//                         return result.power_circuit.name;
//                     }
//                     else if (result.power_circuit !== null) {
//                         return result.power_circuit;
//                     }
//                     else {
//                         return "";
//                     }
//                 },
//                 render: $scope.getPowerCircuits
//             },
//             {
//                 name: "customer", description: "Customer", required: true,
//                 /* opaque: 'stringTransform',
//                  subfield: "name",
//                  read: function (result) {
//                  if (result.customer !== null && "name" in result.customer) {
//                  return result.customer.name;
//                  }
//                  return "";
//                  },*/
//                 opaque: "link",
//                 read: function (result) {
//                     if (result.customer && result.customer.name) {
//                         window.orgfrom = "PDU";
//                         return {
//                             url: "#/org/" + result.customer.id,
//                             text: result.customer.name
//                         }
//                     }
//                     else if (result.customer !== null) {
//                         return {
//                             url: "#/org/" + result.customer_id,
//                             text: result.customer
//                         }
//                     }
//                     else {
//                         return "";
//                     }
//                 },
//                 edit: function (result) {
//                     if (!('url' in result)) {
//                         return null;
//                     }
//                     return $scope.customers.find(function (e, i, arr) {
//                         return e.id == result.id;
//                     });
//                 },
//                 render: $scope.getOrgs,
//                 subfield: "name"
//             },
//             {
//                 name: "status", description: "Status", hide: true, required: true,
//                 opaque: 'stringTransform',
//                 read: function (result) {
//                     if (result.status && result.status.status_type) {
//                         return result.status.status_type;
//                     }
//                     else if (result.status !== null) {
//                         return result.status;
//                     }
//                     else {
//                         return "";
//                     }
//                 },
//                 render: $scope.getStatus,
//                 subfield: "status_type"
//             },
//             { name: "user", description: "User Name", required: true, hide: true },
//             { name: "password", description: "Password", required: true, changepasswordfield: true, hide: true },
//             { name: "salesforce_id", description: "Salesforce ID", required: true },
//         ];

//         $scope.title = {
//             plural: "PDUs",
//             singular: "PDU"
//         };
//     }
// ]);
app.controller('PDUController', [
    '$scope',
    'PDU',
    'AbstractControllerFactory2',
    'ULDBService2',
    function ($scope, PDU, AbstractControllerFactory2, ULDBService2) {
        $scope.ctrl = AbstractControllerFactory2($scope, ULDBService2.pdu());
        $scope.fields = ULDBService2.pdu().fields();
    }
]);


app.controller('CPUController', [
    '$scope',
    'CPU',
    'AbstractControllerFactory2',
    'ULDBService2',
    function ($scope, CPU, AbstractControllerFactory2, ULDBService2) {
        $scope.ctrl = AbstractControllerFactory2($scope, ULDBService2.cpu());
        $scope.fields = ULDBService2.cpu().fields();
    }
]);

app.controller('IPv6BlockAllocationController', [
    '$scope',
    'CPU',
    'AbstractControllerFactory2',
    'ULDBService2',
    function ($scope, CPU, AbstractControllerFactory2, ULDBService2) {
        $scope.ctrl = AbstractControllerFactory2($scope, ULDBService2.IPv6BlockAllocation());
        // $scope.fields = ULDBService2.IPv6Allocation().fields();
    }
]);

app.controller('DiskController', [
    '$scope',
    'Disk',
    'AbstractControllerFactory2',
    'ULDBService2',
    function ($scope, Disk, AbstractControllerFactory2, ULDBService2) {
        $scope.ctrl = AbstractControllerFactory2($scope, ULDBService2.disk());
        $scope.fields = ULDBService2.disk().fields();
    }
]);

app.controller('MemoryController', [
    '$scope',
    'Memory',
    'MemoryType',
    'AlertService2',
    'SearchService',
    'AbstractControllerFactory2',
    'ULDBService2',
    function ($scope, Memory, MemoryType, AlertService2, SearchService, AbstractControllerFactory2, ULDBService2) {
        $scope.ctrl = AbstractControllerFactory2($scope, ULDBService2.memory());
        $scope.fields = ULDBService2.memory().fields();
    }
]);

app.controller('ChassisController', [
    '$scope',
    'Chassis',
    'ChassisModelFast',
    'AlertService2',
    'SearchService',
    'AbstractControllerFactory',
    function ($scope, Chassis, ChassisModelFast, AlertService2, SearchService, AbstractControllerFactory) {
        $scope.resourceClass = Chassis;
        // $scope.breadCrumb = { name: "Chassis", url: "#/chassis" };
        $scope.title = {
            plural: "Chassis",
            singular: "Chassis"
        };
        $scope.ctrl = new AbstractControllerFactory($scope.resourceClass, $scope, "assettag");

        var ChassisModelSearch = new SearchService(ChassisModelFast);
        $scope.getChassisModels = ChassisModelSearch.search;

        $scope.rows = [
            { name: "assettag", description: "Assettag", required: true },
            { name: "serialnumber", description: "Serial Number", required: true },
            {
                name: "chassis_model", description: "Model", required: true,
                opaque: true,
                subfield: "model_name",
                read: function (result) {
                    if (result.chassis_model && result.chassis_model.model_name) {
                        return result.chassis_model.model_name;
                    }
                    else if (result.chassis_model !== null) {
                        return result.chassis_model;
                    }
                    else {
                        return "";
                    }
                },
                edit: function (result) {
                    if (result.chassis_model && result.chassis_model.model_name) {
                        return result.chassis_model.model_name;
                    }
                    else if (result.chassis_model !== null) {
                        return result.chassis_model;
                    }
                    else {
                        return "";
                    }
                },
                render: $scope.getChassisModels
            }
        ];
    }
]);

// app.controller('MotherboardController', [
//     '$scope',
//     'Motherboard',
//     'MotherboardModelFast',
//     'AlertService2',
//     'SearchService',
//     'AbstractControllerFactory',
//     function ($scope, Motherboard, MotherboardModelFast, AlertService2, SearchService, AbstractControllerFactory) {
//         $scope.resourceClass = Motherboard;
//         $scope.breadCrumb = { name: "Motherboard", url: "#/motherboard" };
//         $scope.title = {
//             plural: "Motherboards",
//             singular: "Motherboard"
//         };
//         $scope.ctrl = new AbstractControllerFactory($scope.resourceClass, $scope, "assettag");

//         var MotherboardModelSearch = new SearchService(MotherboardModelFast);
//         $scope.getMotherboardModels = MotherboardModelSearch.search;

//         $scope.rows = [
//             { name: "asset_tag", description: "Asset Tag", required: true },
//             { name: "serial_number", description: "Serial Number", required: true },
//             {
//                 name: "model", description: "Model", required: true,
//                 opaque: true,
//                 subfield: "name",
//                 read: function (result) {
//                     if (result.model && result.model.name) {
//                         return result.model.name;
//                     }
//                     else if (result.model !== null) {
//                         return result.model;
//                     }
//                     else {
//                         return "";
//                     }
//                 },
//                 edit: function (result) {
//                     if (result.model && result.model.name) {
//                         return result.model.name;
//                     }
//                     else if (result.model !== null) {
//                         return result.model;
//                     }
//                     else {
//                         return "";
//                     }
//                 },
//                 render: $scope.getMotherboardModels
//             }
//         ];
//     }
// ]);

app.controller('MotherboardController', [
    '$scope',
    'Memory',
    'MemoryType',
    'AlertService2',
    'SearchService',
    'AbstractControllerFactory2',
    'ULDBService2',
    function ($scope, Memory, MemoryType, AlertService2, SearchService, AbstractControllerFactory2, ULDBService2) {
        $scope.ctrl = AbstractControllerFactory2($scope, ULDBService2.motherboard());
        $scope.fields = ULDBService2.motherboard().fields();
    }
]);
app.controller('MotherboardDetailController', [
    '$scope',
    '$routeParams',
    'Motherboard',
    'AlertService2',
    '$uibModal',
    'BreadCrumbService',
    function ($scope, $routeParams, Motherboard, AlertService2, $uibModal, BreadCrumbService) {
        $scope.alertService = AlertService2;

        var resourceClass = Motherboard;

        // generic stuff, refactor out later
        var id = $routeParams.id;
        //$scope.breadCrumb = {name: "SwitchDetails", url:"#/switch/"+id};

        $scope.bread = BreadCrumbService;

        $scope.$on('$destroy', function () {
            $scope.bread.pushIfTop({ name: "Motherboard Details", url: '#/motherboard/' + id }, $scope);
        });

        resourceClass.get({ id: id }).$promise.then(function (response) {
            $scope.result = response;
        });

        $scope.cols = [
            // { name: 'model', description: 'Name', required: true },
            { name: 'asset_tag', description: 'Asset Tag', required: true },
            {
                name: "model", description: "Name", required: true,
                opaque: 'stringTransform',
                subfield: "model",
                read: function (result) {
                    if ($scope.result.model === null) {
                        return "";
                    }
                    return $scope.result.model.name;
                }
            },
            { name: 'serial_number', description: 'Serial Number', required: true },
        ];

    }
]);


app.controller('NICController', [
    '$scope',
    'NIC',
    'AbstractControllerFactory2',
    'ULDBService2',
    function ($scope, NIC, AbstractControllerFactory2, ULDBService2) {
        $scope.ctrl = AbstractControllerFactory2($scope, ULDBService2.nic());
        $scope.fields = ULDBService2.nic().fields();
    }
]);

app.controller('IPMIController', [
    '$scope',
    'IPMI',
    'IPMIModelFast',
    'AlertService2',
    'SearchService',
    'AbstractControllerFactory',
    function ($scope, IPMI, IPMIModelFast, AlertService2, SearchService, AbstractControllerFactory) {
        $scope.resourceClass = IPMI;
        // $scope.breadCrumb = { name: "IPMI", url: "#/ipmi" };
        $scope.title = {
            plural: "IPMI Modules",
            singular: "IPMI Module"
        };
        $scope.ctrl = new AbstractControllerFactory($scope.resourceClass, $scope, "assettag");


        var IPMIModelSearch = new SearchService(IPMIModelFast);
        $scope.getIPMIModels = IPMIModelSearch.search;

        $scope.rows = [
            { name: "assettag", description: "Assettag", required: true },
            { name: "serialnumber", description: "Serial Number", required: true },
            {
                name: "ipmi_type", description: "Controller", required: true,
                opaque: true,
                subfield: "controller",
                read: function (result) {
                    if (result.ipmi_type && result.ipmi_type.controller) {
                        return result.ipmi_type.controller;
                    }
                    else if (result.ipmi_type !== null) {
                        return result.ipmi_type;
                    }
                    else {
                        return "";
                    }
                },
                edit: function (result) {
                    if (result.ipmi_type && result.ipmi_type.controller) {
                        return result.ipmi_type.controller;
                    }
                    else if (result.ipmi_type !== null) {
                        return result.ipmi_type;
                    }
                    else {
                        return "";
                    }
                },
                render: $scope.getIPMIModels
            }
        ];


    }
]);

app.controller('FirewallController', [
    '$scope',
    '$routeParams',
    '$location',
    'Firewall',
    'FirewallModelFast',
    'OrganizationFast',
    'CabinetFast',
    'AlertService2',
    'SearchService',
    'AbstractControllerFactory2',
    'ULDBService2',
    function ($scope, $routeParams, $location, Firewall, FirewallModelFast, OrganizationFast, CabinetFast, AlertService2, SearchService, AbstractControllerFactory2, ULDBService2) {
        //  TAB CONTROL : Temporary for Demo
        $scope.tabs = [
            { name: 'Firewall', url: 'firewall' },
            { name: 'Juniper Firewall', url: 'juniper-firewall' },
            { name: 'Cisco Firewall', url: 'cisco-firewall' },
        ];

        $scope.activeTab = 0;
        $scope.updateTab = function (idx) {
            $location.path($scope.tabs[idx].url);
        };
        //  END TAB CONTROL FUNCTIONALITY

        $scope.ctrl = AbstractControllerFactory2($scope, ULDBService2.firewall());
        $scope.rows = [
            {
                name: "name", description: "Name", required: true,
                opaque: "link",
                read: function (result) {
                    return {
                        url: "#/firewall/" + result.id,
                        text: result.name
                    };
                }
            },
            { name: "serialnumber", description: "Serial number", required: true },
            {
                name: "firewall_model", description: "Model", required: true,
                opaque: 'stringTransform',
                /*opaquelist: true,
                 list: $scope.firewalls,*/
                subfield: "model",
                read: function (result) {
                    if (result.firewall_model && result.firewall_model.model) {
                        return result.firewall_model.model;
                    }
                    else if (result.firewall_model !== null) {
                        return result.firewall_model;
                    }
                    else {
                        return "";
                    }
                },
                render: $scope.getFirewallModels

            },
            { name: "assettag", description: "Asset Tag", required: true },
            { name: "private_ipaddress", description: "Private IP address", required: true },
            { name: "public_ipaddress", description: "Public IP address", required: true },
            {
                name: "cabinet", description: "Cabinet", required: true,
                opaque: 'stringTransform',
                //opaquelist: true,
                subfield: "name",
                //list: $scope.cabinets,
                read: function (result) {

                    if (result.cabinet && result.cabinet.name) {
                        return result.cabinet.name;
                    }
                    else if (result.cabinet !== null) {
                        return result.cabinet;
                    }
                    else {
                        return "";
                    }
                },
                render: $scope.getCabinets

            },
            {
                name: "customer", description: "Customer", required: true,
                /*opaque: true,
                 subfield: "name",
                 read: function (result) {
                 if (result.customer !== null && "name" in result.customer) {
                 return result.customer.name;
                 }
                 return "";
                 },*/
                opaque: "link",
                read: function (result) {
                    if (result.customer && result.customer.name) {
                        window.orgfrom = "Firewall";
                        return {
                            url: "#/org/" + result.customer.id,
                            text: result.customer.name
                        };
                    }
                    else if (result.customer !== null) {
                        return {
                            url: "#/org/" + result.customer_id,
                            text: result.customer
                        };
                    }
                    else {
                        return "";
                    }
                },
                edit: function (result) {
                    if (!('url' in result)) {
                        return null;
                    }
                    return $scope.customers.find(function (e, i, arr) {
                        return e.id == result.id;
                    });
                },
                render: $scope.getOrgs,
                subfield: "name"
            },
            { name: "salesforce_id", description: "Salesforce ID", required: true },
        ];
    }
]);

// app.controller('CageController', [
//     '$scope',
//     'Cage',
//     'DataCenter',
//     'OrganizationFast',
//     'SearchService',
//     'AlertService2',
//     'AbstractControllerFactory',
//     function ($scope, Cage, DataCenter, OrganizationFast, SearchService, AlertService2, AbstractControllerFactory) {
//         $scope.resourceClass = Cage;
//         $scope.breadCrumb = { name: "Cage", url: "#/cage" };
//         $scope.title = {
//             plural: "Cages",
//             singular: "Cage"
//         };
//         $scope.ctrl = new AbstractControllerFactory($scope.resourceClass, $scope, "name");

//         $scope.customers = [];
//         OrganizationFast.query({ page_size: 9000 }).$promise.then(function (success) {
//             $scope.customers.push.apply($scope.customers, success.results);
//         }).catch(function (error) {
//             console.log(error);
//         });
//         var searchService = new SearchService(OrganizationFast);
//         $scope.getOrgs = searchService.search;
//         var DatacenterSearch = new SearchService(DataCenter);
//         $scope.getDatacenter = DatacenterSearch.search;

//         $scope.rows = [
//             { name: "name", description: "Name", required: true },
//             {
//                 name: "datacenter", description: "Datacenter", required: true,
//                 opaque: 'stringTransform',
//                 subfield: "datacenter_name",
//                 read: function (result) {
//                     if (result.datacenter && result.datacenter.datacenter_name) {
//                         return result.datacenter.datacenter_name;
//                     }
//                     else if (result.datacenter !== null) {
//                         return result.datacenter;
//                     }
//                     else {
//                         return "";
//                     }
//                 },
//                 edit: function (result) {
//                     return result.datacenter.datacenter_name;
//                 },
//                 render: $scope.getDatacenter
//             },
//             {
//                 name: "customer", description: "Customer", required: true,
//                 opaque: 'link',
//                 subfield: "name",
//                 read: function (result) {
//                     if (result.customer && result.customer.name) {
//                         return result.customer.name;
//                     }
//                     else if (result.customer !== null) {
//                         return {
//                             url: "#/org/" + result.customer_id,
//                             text: result.customer
//                         }
//                     }
//                     else {
//                         return "";
//                     }
//                 },
//                 edit: function (result) {
//                     if (!('url' in result)) {
//                         return null;
//                     }
//                     return $scope.customers.find(function (e, i, arr) {
//                         return e.id == result.id;
//                     });
//                 },
//                 render: $scope.getOrgs,
//                 subfield: "name"
//             },
//             { name: "salesforce_id", description: "Salesforce ID", required: true },
//         ];


//     }
// ]);

app.controller('CageController', [
    '$scope',
    'Cage',
    'AbstractControllerFactory2',
    'ULDBService2',
    function ($scope, PDU, AbstractControllerFactory2, ULDBService2) {
        $scope.ctrl = AbstractControllerFactory2($scope, ULDBService2.cage());
        $scope.fields = ULDBService2.cage().fields();
    }
]);
/*** Power circuit ***/

// app.controller('PowerCircuitController', [
//     '$scope',
//     'PowerCircuit',
//     'ElectricalPanel',
//     'ElectricalCircuit',
//     'OutletType',
//     'AMPSType',
//     'VoltageType',
//     'DataCenter',
//     'SearchService',
//     'AlertService2',
//     'AbstractControllerFactory',
//     function ($scope, PowerCircuit, ElectricalPanel, ElectricalCircuit, OutletType, AMPSType, VoltageType, DataCenter, SearchService, AlertService2, AbstractControllerFactory) {
//         $scope.resourceClass = PowerCircuit;
//         $scope.breadCrumb = { name: "PowerCircuit", url: "#/powercircuit" };
//         $scope.title = {
//             plural: "Power Circuits",
//             singular: "Power Circuit"
//         };
//         $scope.ctrl = new AbstractControllerFactory($scope.resourceClass, $scope, "name");

//         var ElectricalPanelSearch = new SearchService(ElectricalPanel);
//         $scope.getElectricalPanel = ElectricalPanelSearch.search;

//         var ElectricalCircuitSearch = new SearchService(ElectricalCircuit);
//         $scope.getElectricalCircuit = ElectricalCircuitSearch.search;

//         var OutletTypeSearch = new SearchService(OutletType);
//         $scope.getOutletType = OutletTypeSearch.search;

//         var AMPSTypeSearch = new SearchService(AMPSType);
//         $scope.getAMPSType = AMPSTypeSearch.search;

//         var VoltageTypeSearch = new SearchService(VoltageType);
//         $scope.getVoltageType = VoltageTypeSearch.search;

//         var DatacenterSearch = new SearchService(DataCenter);
//         $scope.getDatacenter = DatacenterSearch.search;

//         $scope.rows = [
//             { name: "name", description: "Name", required: true },
//             { name: "assettag", description: "Assettag", required: true },
//             {
//                 name: "panel", description: "Panel", required: true,
//                 opaque: true,
//                 subfield: "name",
//                 read: function (result) {
//                     if (result.panel && result.panel.name) {
//                         return result.panel.name;
//                     }
//                     else if (result.panel !== null) {
//                         return result.panel;
//                     }
//                     else {
//                         return "";
//                     }
//                 },
//                 edit: function (result) {
//                     if (result.panel && result.panel.name) {
//                         return result.panel.name;
//                     }
//                     else if (result.panel !== null) {
//                         return result.panel;
//                     }
//                     else {
//                         return "";
//                     }
//                 },
//                 render: $scope.getElectricalPanel
//             },
//             {
//                 name: "circuit", description: "Breaker", required: true,
//                 opaque: true,
//                 subfield: "name",
//                 read: function (result) {
//                     if (result.circuit && result.circuit.name) {
//                         return result.circuit.name;
//                     }
//                     else if (result.circuit !== null) {
//                         return result.circuit;
//                     }
//                     else {
//                         return "";
//                     }
//                 },
//                 edit: function (result) {
//                     if (result.circuit && result.circuit.name) {
//                         return result.circuit.name;
//                     }
//                     else if (result.circuit !== null) {
//                         return result.circuit;
//                     }
//                     else {
//                         return "";
//                     }
//                 },
//                 render: $scope.getElectricalCircuit
//             },
//             {
//                 name: "voltagetype", description: "Voltage Type", required: true,
//                 opaque: true,
//                 subfield: "voltage_type",
//                 read: function (result) {
//                     if (result.voltagetype && result.voltagetype.voltage_type) {
//                         return result.voltagetype.voltage_type;
//                     }
//                     else if (result.voltagetype !== null) {
//                         return result.voltagetype;
//                     }
//                     else {
//                         return "";
//                     }
//                 },
//                 edit: function (result) {
//                     if (result.voltagetype && result.voltagetype.voltage_type) {
//                         return result.voltagetype.voltage_type;
//                     }
//                     else if (result.voltagetype !== null) {
//                         return result.voltagetype;
//                     }
//                     else {
//                         return "";
//                     }
//                 },
//                 render: $scope.getVoltageType
//             },
//             {
//                 name: "ampstype", description: "AMPs Type", required: true,
//                 opaque: true,
//                 subfield: "amps_type",
//                 read: function (result) {
//                     if (result.ampstype && result.ampstype.amps_type) {
//                         return result.ampstype.amps_type;
//                     }
//                     else if (result.ampstype !== null) {
//                         return result.ampstype;
//                     }
//                     else {
//                         return "";
//                     }
//                 },
//                 edit: function (result) {
//                     if (result.ampstype && result.ampstype.amps_type) {
//                         return result.ampstype.amps_type;
//                     }
//                     else if (result.ampstype !== null) {
//                         return result.ampstype;
//                     }
//                     else {
//                         return "";
//                     }
//                 },
//                 render: $scope.getAMPSType
//             },
//             {
//                 name: "outlettype", description: "Outlet Type", required: true,
//                 opaque: true,
//                 subfield: "outlet_type",
//                 read: function (result) {
//                     if (result.outlettype && result.outlettype.outlet_type) {
//                         return result.outlettype.outlet_type;
//                     }
//                     else if (result.outlettype !== null) {
//                         return result.outlettype;
//                     }
//                     else {
//                         return "";
//                     }
//                 },
//                 edit: function (result) {
//                     if (result.outlettype && result.outlettype.outlet_type) {
//                         return result.outlettype.outlet_type;
//                     }
//                     else if (result.outlettype !== null) {
//                         return result.outlettype;
//                     }
//                     else {
//                         return "";
//                     }
//                 },
//                 render: $scope.getOutletType
//             },
//             {
//                 name: "datacenter", description: "Datacenter", required: true,
//                 opaque: true,
//                 subfield: "datacenter_name",
//                 read: function (result) {
//                     if (result.datacenter && result.datacenter.datacenter_name) {
//                         return result.datacenter.datacenter_name;
//                     }
//                     else if (result.datacenter !== null) {
//                         return result.datacenter;
//                     }
//                     else {
//                         return "";
//                     }
//                 },
//                 edit: function (result) {
//                     if (result.datacenter && result.datacenter.datacenter_name) {
//                         return result.datacenter.datacenter_name;
//                     }
//                     else if (result.datacenter !== null) {
//                         return result.datacenter;
//                     }
//                     else {
//                         return "";
//                     }
//                 },
//                 render: $scope.getDatacenter
//             },
//             { name: "salesforce_id", description: "Salesforce ID", required: true },
//         ];
//     }
// ]);

app.controller('PowerCircuitController', [
    '$scope',
    'AbstractControllerFactory2',
    'ULDBService2',
    function ($scope, AbstractControllerFactory2, ULDBService2) {
        $scope.ctrl = AbstractControllerFactory2($scope, ULDBService2.power_circuit());
    }
]);

app.controller('ColoCloudController', [
    '$scope',
    'AbstractControllerFactory2',
    'ULDBService2',
    function ($scope, AbstractControllerFactory2, ULDBService2) {
        $scope.ctrl = AbstractControllerFactory2($scope, ULDBService2.colo_cloud());
    }
]);

app.controller('TerminalServerController', [
    '$scope',
    'AbstractControllerFactory2',
    'ULDBService2',
    function ($scope, AbstractControllerFactory2, ULDBService2) {
        $scope.ctrl = AbstractControllerFactory2($scope, ULDBService2.terminalserver());
    }
]);

app.controller('CustomDeviceController', [
    '$scope',
    'AbstractControllerFactory2',
    'ULDBService2',
    function ($scope, AbstractControllerFactory2, ULDBService2) {
        $scope.ctrl = AbstractControllerFactory2($scope, ULDBService2.customdevice());
    }
]);

// app.controller('TerminalServerController', [
//     '$scope',
//     'TerminalServer',
//     'TerminalServerModel',
//     'CabinetFast',
//     'InvStatus',
//     'OrganizationFast',
//     'SearchService',
//     'AlertService2',
//     'AbstractControllerFactory',
//     function ($scope, TerminalServer, TerminalServerModel, CabinetFast, InvStatus, OrganizationFast, SearchService, AlertService2, AbstractControllerFactory) {
//         $scope.resourceClass = TerminalServer;
//         // $scope.breadCrumb = { name: "Terminal Server", url: "#/terminalserver" };
//         $scope.title = {
//             plural: "Terminal Servers",
//             singular: "Terminal Server"
//         };
//         $scope.ctrl = new AbstractControllerFactory($scope.resourceClass, $scope, "name");

//         $scope.customers = [];
//         OrganizationFast.query({ page_size: 9000 }).$promise.then(function (success) {
//             $scope.customers.push.apply($scope.customers, success.results);
//         }).catch(function (error) {
//             console.log(error);
//         });
//         var searchService = new SearchService(OrganizationFast);
//         $scope.getOrgs = searchService.search;

//         var InvStatusSearch = new SearchService(InvStatus);
//         $scope.getStatus = InvStatusSearch.search;

//         var cabinetSearch = new SearchService(CabinetFast);
//         $scope.getCabinets = cabinetSearch.search;

//         var TerminalServerModelSearch = new SearchService(TerminalServerModel);
//         $scope.getTerminalServerModel = TerminalServerModelSearch.search;

//         $scope.rows = [
//             { name: "name", description: "Name", required: true },
//             { name: "assettag", description: "Assettag", required: true },
//             { name: "serialnumber", description: "Serial Number", required: true },
//             { name: "ip_address", description: "IP Address", required: true, hide: true },
//             {
//                 name: "terminalserver_model", description: "Model", required: true,
//                 opaque: true,
//                 subfield: "model",
//                 read: function (result) {
//                     if (result.terminalserver_model && result.terminalserver_model.model) {
//                         return result.terminalserver_model.model;
//                     }
//                     else if (result.terminalserver_model !== null) {
//                         return result.terminalserver_model;
//                     }
//                     else {
//                         return "";
//                     }
//                 },
//                 edit: function (result) {
//                     if (result.terminalserver_model && result.terminalserver_model.model) {
//                         return result.terminalserver_model.model;
//                     }
//                     else if (result.terminalserver_model !== null) {
//                         return result.terminalserver_model;
//                     }
//                     else {
//                         return "";
//                     }
//                 },
//                 render: $scope.getTerminalServerModel
//             },
//             {
//                 name: "cabinet", description: "Cabinet", required: true, hide: true,
//                 opaque: true,
//                 subfield: "name",
//                 read: function (result) {
//                     if (result.cabinet && result.cabinet.name) {
//                         return result.cabinet.name;
//                     }
//                     else if (result.cabinet !== null) {
//                         return result.cabinet;
//                     }
//                     else {
//                         return "";
//                     }
//                 },
//                 edit: function (result) {
//                     if (result.cabinet && result.cabinet.name) {
//                         return result.cabinet.name;
//                     }
//                     else if (result.cabinet !== null) {
//                         return result.cabinet;
//                     }
//                     else {
//                         return "";
//                     }
//                 },
//                 render: $scope.getCabinets
//             },
//             {
//                 name: "customer", description: "Customer", required: true,
//                 opaque: "link",
//                 subfield: "name",
//                 read: function (result) {

//                     if (result.customer && result.customer.name) {
//                         window.orgfrom = "Terminal Server";
//                         return {
//                             url: "#/org/" + result.customer.id,
//                             text: result.customer.name
//                         };
//                     }
//                     else if (result.customer !== null) {
//                         return {
//                             url: "#/org/" + result.customer_id,
//                             text: result.customer
//                         };
//                     }
//                     else {
//                         return "";
//                     }
//                 },
//                 edit: function (result) {
//                     if (!('url' in result)) {
//                         return null;
//                     }
//                     return $scope.customers.find(function (e, i, arr) {
//                         return e.id == result.id;
//                     });
//                 },
//                 render: $scope.getOrgs
//             },
//             {
//                 name: "status", description: "Status", required: true, hide: true,
//                 opaque: 'stringTransform',
//                 read: function (result) {
//                     if (result.status && result.status.status_type) {
//                         return result.status.status_type;
//                     }
//                     else if (result.status !== null) {
//                         return result.status;
//                     }
//                     else {
//                         return "";
//                     }
//                 },
//                 render: $scope.getStatus,
//                 subfield: "status_type"
//             },
//             { name: "user", description: "User Name", required: true, hide: true },
//             { name: "password", description: "Password", required: true, changepasswordfield: true, hide: true },
//             { name: "is_allocated", description: "Is Allocated", required: true },
//             { name: "salesforce_id", description: "Salesforce ID", required: true },
//         ];
//     }
// ]);

/*** Terminal server model ***/




// app.controller('CabinetController', [
//     '$scope',
//     'Cabinet',
//     'CabinetType',
//     'CabinetModelFast',
//     'OrganizationFast',
//     'DataCenter',
//     'Cage',
//     'AlertService2',
//     'SearchService',
//     'AbstractControllerFactory',
//     function ($scope, Cabinet, CabinetType, CabinetModelFast, OrganizationFast, DataCenter, Cage, AlertService2, SearchService, AbstractControllerFactory) {
//         $scope.resourceClass = Cabinet;
//         $scope.breadCrumb = { name: "Cabinet", url: "#/cabinet" };
//         $scope.title = {
//             plural: "Cabinets",
//             singular: "Cabinet"
//         };
//         $scope.ctrl = new AbstractControllerFactory($scope.resourceClass, $scope, "name");

//         $scope.customers = [];
//         OrganizationFast.query({ page_size: 9000 }).$promise.then(function (success) {
//             $scope.customers.push.apply($scope.customers, success.results);
//         }).catch(function (error) {
//             console.log(error);
//         });
//         var searchService = new SearchService(OrganizationFast);
//         $scope.getOrgs = searchService.search;
//         var cabinetModelSearch = new SearchService(CabinetModelFast);
//         $scope.getCabinetModels = cabinetModelSearch.search;
//         var cabinetTypeSearch = new SearchService(CabinetType);
//         $scope.getCabinetTypes = cabinetTypeSearch.search;
//         var DatacenterSearch = new SearchService(DataCenter);
//         $scope.getDatacenter = DatacenterSearch.search;
//         var CageSearch = new SearchService(Cage);
//         $scope.getCages = CageSearch.search;

//         $scope.rows = [
//             { name: "name", description: "Name", required: true },
//             {
//                 name: "cabinet_model", description: "Model", required: true,
//                 opaque: 'stringTransform',
//                 subfield: "model",
//                 read: function (result) {
//                     if (result.cabinet_model && result.cabinet_model.model) {
//                         return result.cabinet_model.model;
//                     }
//                     else if (result.cabinet_model !== null) {
//                         return result.cabinet_model;
//                     }
//                     else {
//                         return "";
//                     }
//                 },

//                 render: $scope.getCabinetModels
//             },
//             {
//                 name: "cabinet_type", description: "Type", required: true,
//                 opaque: 'stringTransform',
//                 subfield: "cabinet_type",
//                 read: function (result) {
//                     if (result.cabinet_type && result.cabinet_type.cabinet_type) {
//                         return result.cabinet_type.cabinet_type;
//                     }
//                     else if (result.cabinet_type !== null) {
//                         return result.cabinet_type;
//                     }
//                     else {
//                         return "";
//                     }
//                 },

//                 render: $scope.getCabinetTypes
//             },
//             {
//                 name: "datacenter", description: "Datacenter", required: true,
//                 opaque: 'stringTransform',
//                 subfield: "datacenter_name",
//                 read: function (result) {
//                     if (result.datacenter && result.datacenter.datacenter_name) {
//                         return result.datacenter.datacenter_name;
//                     }
//                     else if (result.datacenter !== null) {
//                         return result.datacenter;
//                     }
//                     else {
//                         return "";
//                     }
//                 },

//                 render: $scope.getDatacenter
//             },
//             {
//                 name: "cage", description: "Cage", required: true,
//                 opaque: 'stringTransform',
//                 subfield: "name",
//                 read: function (result) {
//                     if (result.cage && result.cage.name) {
//                         return result.cage.name;
//                     }
//                     else if (result.cage !== null) {
//                         return result.cage;
//                     }
//                     else {
//                         return "";
//                     }
//                 },

//                 render: $scope.getCages
//             },
//             {
//                 name: "customer", description: "Customer", required: true,
//                 /*opaque: true,
//                  subfield: "name",
//                  read: function (result) {
//                  if (result.related.customer !== null && "name" in result.related.customer) {
//                  return result.related.customer.name;
//                  }
//                  return "";

//                  },*/
//                 opaque: "link",
//                 subfield: "name",
//                 read: function (result) {
//                     if (result.customer && result.customer.name) {
//                         window.orgfrom = "Cabinet";
//                         return {
//                             url: "#/org/" + result.customer.id,
//                             text: result.customer.name
//                         }
//                     }
//                     else if (result.customer !== null) {
//                         return {
//                             url: "#/org/" + result.customer_id,
//                             text: result.customer
//                         }
//                     }
//                     else {
//                         return "";
//                     }
//                 },
//                 edit: function (result) {
//                     if (!('url' in result)) {
//                         return null;
//                     }
//                     return $scope.customers.find(function (e, i, arr) {
//                         return e.id == result.id;
//                     });
//                 },
//                 render: $scope.getOrgs
//             },
//             { name: "salesforce_id", description: "Salesforce ID", required: true },
//         ];
//     }
// ]);

app.controller('CabinetController', [
    '$scope',
    'Cabinet',
    'AbstractControllerFactory2',
    'ULDBService2',
    function ($scope, Cabinet, AbstractControllerFactory2, ULDBService2) {
        $scope.ctrl = AbstractControllerFactory2($scope, ULDBService2.cabinet());
        // $scope.fields = ULDBService2.cabinet().fields();
    }
]);

app.controller('CabinetDetailController', [
    '$scope',
    '$routeParams',
    'Cabinet',
    'AlertService2',
    '$uibModal',
    'BreadCrumbService',
    function ($scope, $routeParams, Cabinet, AlertService2, $uibModal, BreadCrumbService) {
        $scope.alertService = AlertService2;

        var resourceClass = Cabinet;

        // generic stuff, refactor out later
        var id = $routeParams.id;

        $scope.bread = BreadCrumbService;

        $scope.$on('$destroy', function () {
            $scope.bread.pushIfTop({ name: "Cabinet Details", url: '#/cabinet/' + id }, $scope);
        });

        resourceClass.get({ id: id }).$promise.then(function (response) {
            $scope.result = response;
        });

        $scope.cols = [
            { name: 'name', description: 'Name', required: true },
            {
                name: "datacenter", description: "Datacenter", required: true, hide: true,
                opaque: 'stringTransform',
                subfield: "name",
                read: function (result) {
                    if ($scope.result.datacenter === null) {
                        return "";
                    }
                    return $scope.result.datacenter.name;
                }
            },
            {
                name: "cabinet_model", description: "Cabinet Model", required: true, hide: true,
                opaque: 'stringTransform',
                subfield: "model",
                read: function (result) {
                    if ($scope.result.cabinet_model === null) {
                        return "";
                    }
                    return $scope.result.cabinet_model.model;
                }
            },
            {
                name: "cabinet_type", description: "Cabinet Type", required: true, hide: true,
                opaque: 'stringTransform',
                subfield: "cabinet_type",
                read: function (result) {
                    if ($scope.result.cabinet_type === null) {
                        return "";
                    }
                    return $scope.result.cabinet_type.cabinet_type;
                }
            },
            {
                name: "customer", description: "Organization", required: true, hide: true,
                opaque: 'stringTransform',
                subfield: "name",
                read: function (result) {
                    if ($scope.result.customer === null) {
                        return "";
                    }
                    return $scope.result.customer.name;
                }
            },

        ];

    }
]);


app.controller('OrganizationController', [
    '$scope',
    'AbstractControllerFactory2',
    '$uibModal',
    'ULDBService2',
    'DTOptionsBuilder',
    '$sce',
    function ($scope, AbstractControllerFactory2, $uibModal, ULDBService2, DTOptionsBuilder, $sce) {
        $scope.ctrl = AbstractControllerFactory2($scope, ULDBService2.organization());

        $scope.$watch('model.results', function () {
            if ($scope.model && $scope.model.results) {
                for (var i = 0; i < $scope.model.results.length; i++) {
                    var logo = $scope.model.results[i].logo ? ($scope.model.results[i].logo.includes('data:image') ? $scope.model.results[i].logo : 'data:image/png;base64,' + $scope.model.results[i].logo) : null;
                    $scope.model.results[i].logo = $sce.trustAsResourceUrl(logo);
                }
            }
        });

        $scope.dtOptions = DTOptionsBuilder.newOptions()
            .withPaginationType('full_numbers')
            .withDisplayLength(25)
            .withOption('Filter', false)
            .withOption('lengthMenu', [25, 50, 100])
            .withOption('order', [1, 'desc'])
            .withBootstrap();

        $scope.show_logo = function (logo) {
            $scope.logo = logo;
            var modalInstance = $uibModal.open({
                templateUrl: '/static/rest/app/templates/modal/show_logo.html',
                scope: $scope,
                size: 'md'
            });
            modalInstance.result.then();
            $scope.cancel = function () {
                modalInstance.dismiss('cancel');
            };
        };
    }
]);


app.controller('OrganizationSummaryController', [
    '$scope',
    'OrgSummary',
    'SearchService',
    'OrganizationFast',
    function ($scope, OrgSummary, SearchService, OrganizationFast) {
        var searchService = new SearchService(OrganizationFast);
        $scope.getOrgs = searchService.search;

        $scope.model = null;

        $scope.getOrgSummary = function (org) {
            var summary = OrgSummary.get({ id: org.id });
            summary.$promise.then(function (response) {
                $scope.model = response;
            });
        };
    }
]);

app.controller('UserController', [
    '$scope',
    'AbstractControllerFactory2',
    'ULDBService2',
    'DTOptionsBuilder',
    function ($scope, AbstractControllerFactory2, ULDBService2, DTOptionsBuilder) {

        $scope.configObject = {};
        $scope.configObject.paginate = true;
        $scope.configObject.page_size = 10;

        $scope.ctrl = AbstractControllerFactory2($scope, ULDBService2.user(), $scope.configObject);


        $scope.searchKeyword = '';

        $scope.rows = [
            { name: "is_active", description: "Is Active", required: true, ischeck: true, checkvalue: "Active" },
            { name: "is_staff", description: "Is Staff", required: true, ischeck: true, checkvalue: "Staff" },
            { name: "is_customer_admin", description: "Is Customer Admin", required: true, ischeck: true, checkvalue: "Customer Admin" },
            { name: "first_name", description: "First Name", required: true },
            { name: "last_name", description: "Last Name", required: true },
            {
                name: "org", description: "Organization", required: true,
                opaque: true,
                subfield: "name",
                read: function (result) {
                    if (result.org && result.org.name) {
                        return result.org.name;
                    }
                    else if (result.org !== null) {
                        return result.org;
                    }
                    else {
                        return "";
                    }
                },
                edit: function (result) {
                    if (!('url' in result)) {
                        return null;
                    }
                    return $scope.customers.find(function (e, i, arr) {
                        return e.id == result.id;
                    });
                },
                render: $scope.getOrgs
            },
            { name: "salesforce_id", description: "Salesforce ID" },
        ];

        $scope.dtOptions = DTOptionsBuilder.newOptions()
            .withPaginationType('full_numbers')
            .withDisplayLength(10)
            .withOption('Filter', false)
            .withOption('lengthMenu', [10, 25, 50, 100])
            .withOption('order', [1, 'desc'])
            .withBootstrap();
    }
]);

app.controller('StorageManagementController', [
    '$scope',
    '$http',
    'AbstractControllerFactory2',
    'ULDBService2',
    '$uibModal',
    function ($scope, $http, AbstractControllerFactory2, ULDBService2, $uibModal) {
        $scope.ctrl = AbstractControllerFactory2($scope, ULDBService2.storage_inventory());
    }
]);



app.controller('ReleaseNotesController', [
    '$scope',
    'AbstractControllerFactory2',
    'ULDBService2',
    function ($scope, AbstractControllerFactory2, ULDBService2) {
        $scope.ctrl = AbstractControllerFactory2($scope, ULDBService2.release());
    }
]);

app.controller('GroupController', [
    '$scope',
    'Group',
    'OrganizationFast',
    'AlertService2',
    'SearchService',
    'AbstractControllerFactory',
    function ($scope, Group, OrganizationFast, AlertService2, SearchService, AbstractControllerFactory) {
        $scope.resourceClass = Group;
        // $scope.breadCrumb = { name: "Group", url: "#/group" };
        $scope.title = {
            plural: "Groups",
            singular: "Group"
        };
        $scope.ctrl = new AbstractControllerFactory($scope.resourceClass, $scope, "group_name");

        $scope.customers = [];
        OrganizationFast.query({ page_size: 9000 }).$promise.then(function (success) {
            $scope.customers.push.apply($scope.customers, success.results);
        }).catch(function (error) {
            //console.log(error);
        });

        var searchService = new SearchService(OrganizationFast);
        $scope.getOrgs = searchService.search;

        $scope.rows = [
            { name: "group_name", description: "Name", required: true },
            {
                name: "org", description: "Organization", required: true,
                opaque: true,
                subfield: "name",
                read: function (result) {
                    if (result.org && result.org.name) {
                        return result.org.name;
                    }
                    else if (result.org !== null) {
                        return result.org;
                    }
                    else {
                        return "";
                    }
                },
                edit: function (result) {
                    if (!('url' in result)) {
                        return null;
                    }
                    return $scope.customers.find(function (e, i, arr) {
                        return e.id == result.id;
                    });
                },
                render: $scope.getOrgs
            }
        ];
    }
]);

/*** vCenter server details ***/

app.controller('VCenterController', [
    '$scope',
    'VCenter',
    'OrganizationFast',
    'SearchService',
    'AlertService2',
    'AbstractControllerFactory',
    function ($scope, VCenter, OrganizationFast, SearchService, AlertService2, AbstractControllerFactory) {
        $scope.resourceClass = VCenter;
        // $scope.breadCrumb = { name: "vCenter Server", url: "#/vcenterserver" };
        $scope.title = {
            plural: "vCenter Servers",
            singular: "vCenter Server"
        };
        $scope.ctrl = new AbstractControllerFactory($scope.resourceClass, $scope, "name");

        $scope.customers = [];
        OrganizationFast.query({ page_size: 9000 }).$promise.then(function (success) {
            $scope.customers.push.apply($scope.customers, success.results);
        }).catch(function (error) {
            //console.log(error);
        });
        var searchService = new SearchService(OrganizationFast);
        $scope.getOrgs = searchService.search;

        $scope.rows = [
            { name: "name", description: "Name", required: true },
            { name: "fqdn", description: "FQDN", required: true },
            { name: "ulapi_uuid", description: "UUID", required: true },
            {
                name: "customer", description: "Customer", required: true,
                opaque: "link",
                subfield: "name",
                read: function (result) {
                    if (result.customer && result.customer.name) {
                        window.orgfrom = "vCenter Server";
                        return {
                            url: "#/org/" + result.customer.id,
                            text: result.customer.name
                        };
                    }
                    else if (result.customer !== null) {
                        return {
                            url: "#/org/" + result.customer_id,
                            text: result.customer
                        };
                    }
                    else {
                        return "";
                    }
                },
                edit: function (result) {
                    if (!('url' in result)) {
                        return null;
                    }
                    return $scope.customers.find(function (e, i, arr) {
                        return e.id == result.id;
                    });
                },
                render: $scope.getOrgs
            }
        ];
    }
]);

app.controller('FirewallDetailController', [
    '$scope',
    '$routeParams',
    'Firewall',
    'AlertService2',
    '$uibModal',
    'BreadCrumbService',
    function ($scope, $routeParams, Firewall, AlertService2, $uibModal, BreadCrumbService) {
        $scope.alertService = AlertService2;

        var resourceClass = Firewall;

        // generic stuff, refactor out later
        var id = $routeParams.id;
        //$scope.breadCrumb = {name: "SwitchDetails", url:"#/switch/"+id};

        $scope.bread = BreadCrumbService;

        $scope.$on('$destroy', function () {
            $scope.bread.pushIfTop({ name: "Firewall Details", url: '#/firewall/' + id }, $scope);
        });

        resourceClass.get({ id: id }).$promise.then(function (response) {
            $scope.result = response;
        });

        $scope.cols = [
            { name: 'name', description: 'Name', required: true },
            { name: 'asset_tag', description: 'Asset Tag', required: true },
            {
                name: "firewall_model", description: "Model", required: true,
                opaque: 'stringTransform',
                subfield: "model",
                read: function (result) {
                    if ($scope.result.model === null) {
                        return "";
                    }
                    return $scope.result.model.name;
                }
            },
            {
                name: "cabinet", description: "Cabinet", required: true,
                opaque: 'stringTransform',
                subfield: "name",
                read: function (result) {
                    if ($scope.result.cabinet === null) {
                        return "";
                    }
                    return $scope.result.cabinet.name;
                }
            },
            { name: 'serial_number', description: 'Serial Number', required: true },
            // { name: 'private_ipaddress', description: 'Private IP Address', required: true },
            // { name: 'public_ipaddress', description: 'Public IP Address', required: true },
            // {
            //     name: "status", description: "Status", required: true,
            //     opaque: 'stringTransform',
            //     subfield: "status_type",
            //     read: function (result) {
            //         if ($scope.result.status === null) {
            //             return "";
            //         }
            //         return $scope.result.status.status_type;
            //     }
            // },
            // { name: 'is_vdc', description: 'VDC', required: true },
            // { name: 'is_allocated', description: 'Allocated', required: true },
            { name: 'salesforce_id', description: 'Salesforce ID', required: true },
        ];

    }
]);

app.controller('FirewallModelDetailController', [
    '$scope',
    '$routeParams',
    'FirewallModel',
    'AlertService2',
    '$uibModal',
    'BreadCrumbService',
    function ($scope, $routeParams, FirewallModel, AlertService2, $uibModal, BreadCrumbService) {
        $scope.alertService = AlertService2;

        var resourceClass = FirewallModel;

        // generic stuff, refactor out later
        var id = $routeParams.id;
        //$scope.breadCrumb = {name: "SwitchDetails", url:"#/switch/"+id};

        $scope.bread = BreadCrumbService;

        $scope.$on('$destroy', function () {
            $scope.bread.pushIfTop({ name: "Firewall Model Details", url: '#/firewall/' + id }, $scope);
        });

        resourceClass.get({ id: id }).$promise.then(function (response) {
            $scope.result = response;
        });

        $scope.cols = [
            { name: "name", description: "Name" },
            {
                name: "manufacturer", description: "Manufacturer", required: true, hide: true,
                opaque: 'stringTransform',
                subfield: "status_type",
                read: function (result) {
                    if ($scope.result.manufacturer === null) {
                        return "";
                    }
                    return $scope.result.manufacturer.name;
                }
            },
            { name: "operating_system", description: "Operating System" },
            { name: "num_ports", description: "Total Ports" },
            { name: "num_uplink_port", description: "Total Uplink Ports" },
        ];

    }
]);

app.controller('LoadBalancerDetailController', [
    '$scope',
    '$routeParams',
    'LoadBalancer',
    'AlertService2',
    '$uibModal',
    'BreadCrumbService',
    function ($scope, $routeParams, LoadBalancer, AlertService2, $uibModal, BreadCrumbService) {
        $scope.alertService = AlertService2;

        var resourceClass = LoadBalancer;

        // generic stuff, refactor out later
        var id = $routeParams.id;

        $scope.bread = BreadCrumbService;

        $scope.$on('$destroy', function () {
            $scope.bread.pushIfTop({ name: 'Load Balancer Details', url: '#/loadbalancer/' + id }, $scope);
        });

        resourceClass.get({ id: id }).$promise.then(function (response) {
            $scope.result = response;
            //console.log('Result : ' + angular.toJson(response));
        });

        $scope.cols = [
            { name: 'name', description: 'Name', required: true },
            { name: 'asset_tag', description: 'Asset Tag', required: true },
            {
                name: 'model', description: 'Model', required: true, hide: true,
                opaque: 'stringTransform',
                subfield: 'name',
                read: function (result) {
                    if ($scope.result.model === null) {
                        return '';
                    }
                    return $scope.result.model.name;
                }
            },
            {
                name: 'cabinet', description: 'Cabinet', required: true, hide: true,
                opaque: 'stringTransform',
                subfield: 'name',
                read: function (result) {
                    if ($scope.result.cabinet === null) {
                        return '';
                    }
                    return $scope.result.cabinet.name;
                }
            },
            { name: 'serial_number', description: 'Serial Number', required: true },

            //Commented out following things since they were not linked

            // { name: 'private_ipaddress', description: 'Private IP Address', required: true },
            // { name: 'public_ipaddress', description: 'Public IP Address', required: true },
            // {
            //     name: "status", description: "Status", required: true, hide: true,
            //     opaque: 'stringTransform',
            //     subfield: "status_type",
            //     read: function (result) {
            //         if ($scope.result.status === null) {
            //             return "";
            //         }
            //         return $scope.result.status.status_type;
            //     }
            // },
            // { name: 'is_vdc', description: 'VDC', required: true },
            // { name: 'is_allocated', description: 'Allocated', required: true },

            { name: 'salesforce_id', description: 'Salesforce ID', required: true },
        ];

    }
]);

app.controller('CPUmodelDetailController', [
    '$scope',
    '$routeParams',
    'CPUType',
    'AlertService2',
    '$uibModal',
    'BreadCrumbService',
    function ($scope, $routeParams, CPUType, AlertService2, $uibModal, BreadCrumbService) {
        $scope.alertService = AlertService2;

        var resourceClass = CPUType;

        // generic stuff, refactor out later
        var id = $routeParams.id;

        $scope.bread = BreadCrumbService;

        $scope.$on('$destroy', function () {
            $scope.bread.pushIfTop({ name: 'CPU Model Details', url: '#/cpumodel/' + id }, $scope);
        });

        resourceClass.get({ id: id }).$promise.then(function (response) {
            $scope.result = response;
        });

        $scope.cols = [
            { name: 'name', description: 'Name', required: true },
            { name: 'clock_speed_mhz', description: 'Clock Speed', required: true },
            { name: 'cores', description: 'Number of cores', required: true },
            { name: 'perf_index', description: 'Perf Index', required: true },
            { name: 'threads_per_core', description: 'Threads per core', required: true },
            { name: 'turbo_clock_speed_mhz', description: 'Turbo Clock speed', required: true },
            {
                name: "manufacturer", description: "Manufacturer", required: true, hide: true,
                opaque: 'stringTransform',
                subfield: "status_type",
                read: function (result) {
                    if ($scope.result.manufacturer === null) {
                        return "";
                    }
                    return $scope.result.manufacturer.name;
                }
            },
            {
                name: "socket_type", description: "Socket Type", required: true, hide: true,
                opaque: 'stringTransform',
                subfield: "name",
                read: function (result) {
                    if ($scope.result.name === null) {
                        return "";
                    }
                    return $scope.result.name;
                }
            },

        ];

    }
]);

app.controller('LoadBalancerModelDetailController', [
    '$scope',
    '$routeParams',
    'LoadBalancerModel',
    'AlertService2',
    '$uibModal',
    'BreadCrumbService',
    function ($scope, $routeParams, LoadBalancerModel, AlertService2, $uibModal, BreadCrumbService) {
        $scope.alertService = AlertService2;

        var resourceClass = LoadBalancerModel;

        // generic stuff, refactor out later
        var id = $routeParams.id;

        $scope.bread = BreadCrumbService;

        $scope.$on('$destroy', function () {
            $scope.bread.pushIfTop({ name: "Load Balancer Model Details", url: '#/loadbalancermodel/' + id }, $scope);
        });

        resourceClass.get({ id: id }).$promise.then(function (response) {
            $scope.result = response;
        });

        $scope.cols = [
            { name: 'name', description: 'Name', required: true },
            { name: 'operating_system', description: 'Operating System', required: true },
            {
                name: "manufacturer", description: "Manufacturer", required: true, hide: true,
                opaque: 'stringTransform',
                subfield: "status_type",
                read: function (result) {
                    if ($scope.result.manufacturer === null) {
                        return "";
                    }
                    return $scope.result.manufacturer.name;
                }
            },
            { name: 'num_ports', description: "Total Ports" },
            { name: 'num_uplink_ports', description: "Total Uplink Ports" },
        ];

    }
]);

app.controller('InstanceDetailController', [
    '$scope',
    '$routeParams',
    'InstanceRelated',
    'AlertService2',
    '$uibModal',
    'BreadCrumbService',
    function ($scope, $routeParams, InstanceRelated, AlertService2, $uibModal, BreadCrumbService) {
        $scope.alertService = AlertService2;

        var resourceClass = InstanceRelated;

        // generic stuff, refactor out later
        var id = $routeParams.id;

        $scope.bread = BreadCrumbService;

        $scope.$on('$destroy', function () {
            $scope.bread.pushIfTop({ name: "Instance Details", url: '#/instance/' + id + '/related_details/' }, $scope);
        });

        resourceClass.get({ id: id }).$promise.then(function (response) {
            $scope.result = response.server;
        });

        $scope.cols = [
            { name: 'name', description: 'Name', required: true },
            {
                name: "instance_type", description: "Type", required: true, hide: true,
                opaque: 'stringTransform',
                subfield: "instance_type",
                read: function (result) {
                    if ($scope.result.instance_type === null) {
                        return "";
                    }
                    return $scope.result.instance_type;
                }
            },
            {
                name: "customer", description: "Customer", required: true, hide: true,
                opaque: 'stringTransform',
                subfield: "name",
                read: function (result) {
                    if ($scope.result.customer === null) {
                        return "";
                    }
                    return $scope.result.customer.name;
                }
            },
            {
                name: "os", description: "Operating System", required: true, hide: true,
                opaque: 'stringTransform',
                subfield: "name",
                read: function (result) {
                    if ($scope.result.os === null) {
                        return "";
                    }
                    return $scope.result.os.name + ' ' + $scope.result.os.version;
                }
            },
            {
                name: "virtualsystem", description: "Cloud Type", required: true, hide: true,
                opaque: 'stringTransform',
                subfield: "cloud_type",
                read: function (result) {
                    if ($scope.result.virtualsystem === null) {
                        return "";
                    }
                    return $scope.result.virtualsystem.cloud_type;
                }
            },
            {
                name: "virtualsystem", description: "vCPU", required: true, hide: true,
                opaque: 'stringTransform',
                subfield: "vcpu",
                read: function (result) {
                    if ($scope.result.virtualsystem === null) {
                        return "";
                    }
                    return $scope.result.virtualsystem.vcpu;
                }
            },
            {
                name: "virtualsystem", description: "ETH Ports", required: true, hide: true,
                opaque: 'stringTransform',
                subfield: "ethports",
                read: function (result) {
                    if ($scope.result.virtualsystem === null) {
                        return "";
                    }
                    return $scope.result.virtualsystem.ethports;
                }
            },
            {
                name: "virtualsystem", description: "Memory", required: true, hide: true,
                opaque: 'stringTransform',
                subfield: "memory",
                read: function (result) {
                    if ($scope.result.virtualsystem === null) {
                        return "";
                    }
                    return $scope.result.virtualsystem.memory + ' ' + $scope.result.virtualsystem.memory_measuretype;
                }
            },
            {
                name: "virtualsystem", description: "Disk", required: true, hide: true,
                opaque: 'stringTransform',
                subfield: "disk",
                read: function (result) {
                    if ($scope.result.virtualsystem === null) {
                        return "";
                    }
                    return $scope.result.virtualsystem.disk + ' ' + $scope.result.virtualsystem.disk_measuretype;
                }
            }
        ];

    }
]);


/*** IPv6 Allocation ***/

app.controller('IPv6AllocationController', [
    '$scope',
    '$uibModal',
    'IPv6Allocation',
    'AlertService2',
    'SearchService',
    'AbstractControllerFactory',
    function ($scope, $uibModal, IPv6Allocation, AlertService2, SearchService, AbstractControllerFactory) {
        $scope.resourceClass = IPv6Allocation;
        // $scope.breadCrumb = { name: "IPv6 Config", url: "#/ipv6alloc" };
        $scope.title = {
            plural: "IPv6 Allocations",
            singular: "IPv6 Allocation"
        };
        $scope.ctrl = new AbstractControllerFactory($scope.resourceClass, $scope, "name");

        $scope.rows = [
            { name: "name", description: "Name", required: true },
            { name: "prefix", description: "Prefix", required: true },
            { name: "prefixlen", description: "Prefix Len", required: true },
            { name: "description", description: "Description", required: true },
        ];

    }
]);


/*** IPv6 Locations ***/

app.controller('IPv6LocationController', [
    '$scope',
    'IPv6Location',
    'IPv6Allocation',
    'AlertService2',
    'SearchService',
    'AbstractControllerFactory',
    function ($scope, IPv6Location, IPv6Allocation, AlertService2, SearchService, AbstractControllerFactory) {
        $scope.resourceClass = IPv6Location;
        // $scope.breadCrumb = { name: "IPv6 Locations", url: "#/ipv6loc" };
        $scope.title = {
            plural: "IPv6 Locations",
            singular: "IPv6 Location"
        };
        $scope.ctrl = new AbstractControllerFactory($scope.resourceClass, $scope, "name");

        $scope.ipv6allocation = [];

        IPv6Allocation.query({ page_size: 9000 }).$promise.then(function (success) {
            $scope.ipv6allocation.push.apply($scope.ipv6allocation, success.results);
        }).catch(function (error) {
            //console.log(error);
        });

        var IPV6AllocationSearch = new SearchService(IPv6Allocation);
        $scope.getParentAllocation = IPV6AllocationSearch.search;

        $scope.rows = [
            //{ name: "name", description: "Name", required: true},
            {
                name: "name", description: "Name", required: true,
                opaque: "link",
                read: function (result) {
                    window.assign_location_ipv6 = result.name;
                    return {
                        url: "#/ipv6assign/" + result.id + "/",
                        text: result.name
                    };
                }
            },

            { name: "description", description: "Description", required: true },
            {
                name: "allocation", description: "Parent Allocation", required: true,
                /*opaqueselect: true,
                 subfield: "url",
                 shownamefield: "prefix",
                 shownamesubfield: "prefixlen",*/
                opaque: 'stringTransform',
                subfield: "name",
                read: function (result) {
                    if (result.allocation && result.allocation.name) {
                        return result.allocation.name;
                    }
                    else if (result.allocation !== null) {
                        return result.allocation;
                    }
                    else {
                        return "";
                    }
                },
                edit: function (result) {
                    if (result.allocation && result.allocation.name) {
                        return result.allocation;
                    }
                    else if (result.allocation !== null) {
                        return result.allocation;
                    }
                    else {
                        return "";
                    }
                },
                render: $scope.getParentAllocation
            }
        ];
    }
]);

app.controller('AccountController', [
    '$scope',
    '$routeParams',
    '$location',
    '$http',
    'UserAccount',
    'User',
    'ChangePassword',
    'AlertService',
    '$uibModal',
    'BreadCrumbService',
    function ($scope, $routeParams, $location, $http, UserAccount, User, ChangePassword,
        AlertService, $uibModal, BreadCrumbService) {

        var resourceClass = UserAccount;

        $scope.showmessage = false;

        if (window.savechanges && window.savechanges != "") {

            $scope.showmessage = true;
            $scope.alertMsg = window.savechanges;
            window.savechanges = "";
        }
        else {
            $scope.showmessage = false;
            window.savechanges = "";
        }

        $scope.closeAlert = function () {
            $scope.showmessage = false;
        };

        $scope.bread = BreadCrumbService;

        $scope.chgpwd = false;

        $scope.old_password = "";

        $scope.$on('$destroy', function () {
            $scope.bread.pushIfTop({ name: "User Account", url: '#/account/' }, $scope);
        });

        resourceClass.get().$promise.then(function (response) {
            $scope.orgprofileresult = response.customer;
            $scope.accessresult = response.user_accesslist;
            if (response.last_login) {
                $scope.recentactivityresult = { last_login: response.last_login };
            }
            $scope.userid = response.customer.email;
            window.pwduserid = response.customer.email;

            $scope.email = response.user_id;
            $scope.has_two_factor = response.has_two_factor;
            $scope.user = response.user;
            //$scope.two_factor = response.
        });

        $scope.sendTestEmail = function () {
            $http.post("/account/test_email/").then(function (response) {
                // should be 204, no response
                //console.log("sent");
            });
        };

        $scope.enableTwoFactor = function () {
            var modalInstance = $uibModal.open({
                templateUrl: 'otpModal.html',
                controller: 'TwoFactorModalController',
                scope: $scope,
                size: 'md'
            });
            modalInstance.result.then();
        };

        $scope.orgprofilecols = [
            { name: 'name', description: 'Name', required: true },
            { name: 'address1', description: 'Address1', required: true },
            { name: 'address2', description: 'Address2', required: true },
            { name: 'city', description: 'City', required: true },
            { name: 'state', description: 'State', required: true },
            { name: 'domain', description: 'Domain', required: true },
            { name: 'phone', description: 'Contact', required: true },
            { name: 'email', description: 'Email', required: true },
        ];

        $scope.recentactivitycols = [
            { name: 'last_login', description: 'Last Login', required: true },
        ];

        $scope.changePassword = function () {
            var modalInstance = $uibModal.open({
                templateUrl: '/static/rest/app/templates/modal/changepwdmodal.html',
                controller: 'ChangePasswordModalController',
                scope: $scope,
                size: 'md'
            });
            modalInstance.result.then();
        };
    }
]);


app.controller('TwoFactorModalController', [
    '$scope',
    '$uibModalInstance',
    '$window',
    function ($scope, $uibModalInstance, $window) {
        $scope.enable = function () {
            // This will destroy the application and fallback to an MVC app.
            $window.location.href = '/account/two_factor/';
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }
]);

app.controller('ChangePasswordModalController', [
    '$scope',
    '$http',
    '$routeParams',
    '$location',
    'UserAccount',
    'User',
    'ChangePassword',
    'AlertService2',
    '$uibModal',
    '$uibModalInstance',
    function ($scope, $http, $routeParams, $location, UserAccount, User, ChangePassword, AlertService2, $uibModal, $uibModalInstance) {

        $scope.pwd = new ChangePassword();
        //$scope.pwd.id = window.pwduserid;
        $scope.servererror = false;

        $scope.ClearValidation = function () {
            $scope.error = '';
            $scope.oldpwdMsg = '';
            $scope.newpwd1Msg = '';
            $scope.newpwd2Msg = '';
            $scope.msg = '';
        };

        $scope.check = function () {
            var minPwLength = 8;
            if ($scope.pwd.hasOwnProperty('new_password1')) {
                if ($scope.pwd.new_password1.length < minPwLength) {
                    $scope.err = true;
                    $scope.error = 'New password must be at least ' + minPwLength + ' characters long.';
                }
                else if ($scope.pwd.hasOwnProperty('new_password2')) {
                    if ($scope.pwd.new_password1 !== $scope.pwd.new_password2) {
                        $scope.err = true;
                        $scope.error = 'New password values must match.';
                    }
                    else {
                        $scope.err = false;
                        $scope.error = '';
                    }
                }
            }
        };

        $scope.changePassword = function () {
            var pwdvalidated = true;
            //$scope.pwd.id = window.pwduserid;
            if ($scope.pwd.old_password) {
                $scope.oldpwderr = false;
                if (pwdvalidated)
                    pwdvalidated = true;
            }
            else {
                $scope.oldpwderr = true;
                pwdvalidated = false;
                $scope.oldpwdMsg = 'This field is required';
            }
            if ($scope.pwd.new_password1) {
                $scope.newpwd1err = false;
                if (pwdvalidated)
                    pwdvalidated = true;
            }
            else {
                $scope.newpwd1err = true;
                pwdvalidated = false;
                $scope.newpwd1Msg = 'This field is required';
            }
            if ($scope.pwd.new_password2) {
                $scope.newpwd2err = false;
                if (pwdvalidated)
                    pwdvalidated = true;
            }
            else {
                $scope.newpwd2err = true;
                pwdvalidated = false;
                $scope.newpwd2Msg = 'This field is required';
            }
            if (pwdvalidated && $scope.err === false) {
                $http.post(
                    '/rest/user/{id}/change_password/'.fmt({ id: $scope.user.id }),
                    $scope.pwd)
                    .then(function (response) {
                        AlertService2.showToast('Password updated.');
                        $uibModalInstance.close();
                    }).catch(function (error) {
                        AlertService2.showToast('Error updating password.');
                    });
                //
                // $scope.pwd.$save().then(function (result) {
                //     var pwdvalidated = false;
                //     if (result.detail) {
                //         //window.savechanges = result.detail;
                //         $uibModalInstance.close();
                //         //$location.path('/setting/');
                //     }
                // }, function (error) {
                //     if (error.data && error.data.Error) {
                //         $scope.err = true;
                //         $scope.error = error.data.Error;
                //     }
                // });
            }

        };

        $scope.cancel = function () {
            $uibModalInstance.close();
        };

    }]);

app.controller('UserMenuController', [
    '$scope',
    '$routeParams',
    '$location',
    '$uibModal',
    '$http',
    '$window',
    function ($scope, $routeParams, $location, $uibModal, $http, $window) {
        $scope.ShowAboutDetails = function () {
            var modalInstance = $uibModal.open({
                templateUrl: '/static/rest/app/templates/modal/detailmodal.html',
                controller: 'AboutModalController',
                scope: $scope,
                size: 'md'
            });
            modalInstance.result.then();
        };

        $scope.logout = function () {
            $http.post('logout/').then(function (response) {
                $window.location.href = "/";
            });
        };

    }
]);

app.controller('AboutModalController', [
    '$scope',
    '$routeParams',
    '$location',
    'UserAccount',
    '$uibModalInstance',
    function ($scope, $routeParams, $location, UserAccount, $uibModalInstance) {


        var resourceClass = UserAccount;

        $scope.modaltitle = 'About';

        resourceClass.get().$promise.then(function (response) {

            $scope.detailresult = { release_version: response.release_version, release_date: response.release_date };

        });

        $scope.detailcols = [
            { name: 'release_version', description: 'Release Version', required: true },
            { name: 'release_date', description: 'Release Date', required: true },
        ];

        $scope.cancel = function () {
            $uibModalInstance.close();
        };
    }]);


app.controller('OrganizationDetailController', [
    '$scope',
    '$route',
    '$routeParams',
    '$http',
    '$uibModal',
    'Organization',
    'OrganizationDetails',
    'Server',
    'ServerFast',
    'VirtualMachine',
    'Firewall',
    'Switch',
    'LoadBalancer',
    'SAN',
    'FirewallModel',
    'SwitchModel',
    'LoadBalancerModel',
    'User',
    'Cabinet',
    'CabinetModel',
    'CabinetType',
    'Cage',
    'DataCenter',
    'OS',
    'Instance',
    'BMServer',
    'PDU',
    'PDUModel',
    'CabinetFast',
    'OrganizationFast',
    'AccessList',
    'ServerManufacturer',
    'PrivateCloudFast',
    'AlertService2',
    'GroupsRolesByOrg',
    '$location',
    'BreadCrumbService',
    'SearchService',
    'CustomSearchService',
    'InvoiceService',
    function ($scope,
        $route,
        $routeParams,
        $http,
        $uibModal,
        Organization,
        OrganizationDetails,
        Server,
        ServerFast,
        VirtualMachine,
        Firewall,
        Switch,
        LoadBalancer,
        SAN,
        FirewallModel,
        SwitchModel,
        LoadBalancerModel,
        User,
        Cabinet,
        CabinetModel,
        CabinetType,
        Cage,
        DataCenter,
        OS,
        Instance,
        BMServer,
        PDU,
        PDUModel,
        CabinetFast,
        OrganizationFast,
        AccessList,
        ServerManufacturer,
        PrivateCloudFast,
        AlertService2,
        GroupsRolesByOrg,
        $location,
        BreadCrumbService,
        SearchService,
        CustomSearchService,
        InvoiceService) {
        $scope.alertService = AlertService2;
        var resourceClass = Organization;
        var id = $routeParams.id;
        var tab = $routeParams.t;

        // $scope.bread = BreadCrumbService;
        // $scope.$on('$destroy', function () {
        //     $scope.bread.pushIfTop({ name: "Organization Detail", url: '#/organization/' + id }, $scope);
        // });
        resourceClass.get({ id: id }).$promise.then(function (response) {
            $scope.orgresult = response;
            $scope.title = {
                plural: $scope.orgresult.name,
                singular: $scope.orgresult.name
            };
            if ($scope.$parent === $scope.$root) $scope.$root.title = $scope.title;
            $scope.users = response.users;
        }).then(function () {
            $http.get('/rest/org/' + $scope.orgresult.id + '/assets/').then(function (response) {
                $scope.assets = response.data;
                var _array = [
                    {
                        heading: 'Servers',
                        items: $scope.assets['servers'],
                        key: 'name',
                        resourceClass: Server,
                        add: true,
                        custom: [
                            {
                                name: 'Add/Edit Hypervisor',
                                func: function (name, collection) {
                                    return $scope['modify_server_inst'](name, collection, this.fields);
                                },
                                fields: [
                                    {
                                        name: 'os',
                                        err_msg: 'osMsg',
                                        description: 'Operating System',
                                        required: true,
                                        transform: 'accessor',
                                        access: function (item) {
                                            if (item && item.instance != null && item.instance.os != null) {
                                                return item.instance.os.full_name;
                                            }
                                            return "";
                                        },
                                        inputMethod: {
                                            type: 'typeahead',
                                            accessor: 'full_name',
                                            invoker: new CustomSearchService(OS, 'type', "Hypervisor").search
                                        }
                                    },
                                    {
                                        name: 'functional_hostname',
                                        err_msg: 'functional_hostnameMsg',
                                        description: 'Hostname'
                                    },
                                    {
                                        name: 'virtualization_type',
                                        err_msg: 'virtualization_typeMsg',
                                        description: 'Virtualization Type', required: true, hidden: true,
                                        inputMethod: {
                                            type: 'choices',
                                            choices: ['ESXi', 'Hyper V', 'KVM']
                                        }
                                    },
                                    {
                                        name: 'ordered_date',
                                        err_msg: 'ordered_dateMsg',
                                        description: 'Ordered Date',
                                        inputMethod: {
                                            type: 'datetime',
                                        }
                                    }
                                ]
                            },
                            {
                                name: 'Add/Edit Bare Metal',
                                func: function (name, collection) {
                                    return $scope['add_bm_server'](name, collection, this.fields);
                                },
                                fields: [
                                    {
                                        name: 'management_ip',
                                        err_msg: 'management_ipMsg',
                                        description: 'Management IP'
                                    },
                                    {
                                        name: 'os',
                                        err_msg: 'osMsg',
                                        description: 'Operating System',
                                        transform: 'accessor',
                                        access: function (item) {
                                            if (item && item.bm_server != null && item.bm_server.os != null) {
                                                return item.bm_server.os.full_name;
                                            }
                                            return "";
                                        },
                                        inputMethod: {
                                            type: 'typeahead',
                                            accessor: 'full_name',
                                            invoker: new CustomSearchService(OS, "type", "OS").search
                                        }
                                    },

                                    {
                                        name: 'bmc_type',
                                        err_msg: 'bmc_typeMsg',
                                        description: 'BM Controller Type',
                                        inputMethod: {
                                            type: 'choices',
                                            choices: ['IPMI', 'DRAC', 'None']
                                        }
                                    },
                                    {
                                        name: 'version',
                                        err_msg: 'versionMsg',
                                        description: 'DRAC Version',
                                        inputMethod: {
                                            type: 'choices',
                                            choices: ['5', '6', '7', '8']
                                        }
                                    },
                                    {
                                        name: 'ip',
                                        err_msg: 'ipMsg',
                                        description: 'BM Mangement IP'
                                    },
                                    {
                                        name: 'username',
                                        err_msg: 'usernameMsg',
                                        description: 'Username'
                                    },
                                    {
                                        name: 'password',
                                        err_msg: 'passwordMsg',
                                        description: 'Password',
                                        passwordfield: true,
                                        hide: true
                                    },
                                    {
                                        name: 'proxy_url',
                                        err_msg: 'proxy_urlMsg',
                                        description: 'Proxy URL',
                                    },
                                ]
                            },
                            {
                                name: 'Delete Hypervisor',
                                func: function (name, collection) {
                                    return $scope['delete_server_inst'](name, collection);
                                }
                            },
                            {
                                name: 'Delete Bare Metal',
                                func: function (name, collection) {
                                    return $scope['delete_server_bm'](name, collection);
                                }
                            }
                        ]
                    },
                    {
                        heading: 'Virtual Machines',
                        items: $scope.assets['virtual_servers'],
                        key: 'name',
                        resourceClass: VirtualMachine,
                        add: true,
                        custom: [
                            {
                                name: 'Modify Instance',
                                func: function (name, collection) {
                                    return $scope['modify_vm_inst'](name, collection, this.fields);
                                },
                                fields: [
                                    {
                                        name: 'os',
                                        err_msg: 'osMsg',
                                        description: 'Operating System',
                                        transform: 'accessor',
                                        access: function (item) {
                                            if (item && item.instance != null && item.instance.os != null) {
                                                return item.instance.os.full_name;
                                            }
                                            return "";
                                        },
                                        inputMethod: {
                                            type: 'typeahead',
                                            accessor: 'full_name',
                                            invoker: new SearchService(OS).search
                                        }

                                    },
                                    {
                                        name: 'functional_hostname',
                                        err_msg: 'functional_hostnameMsg',
                                        description: 'Hostname'
                                    },
                                    {
                                        name: 'ordered_date',
                                        err_msg: 'ordered_dateMsg',
                                        description: 'Ordered Date',
                                        inputMethod: {
                                            type: 'datetime',
                                        }
                                    }
                                ]
                            },
                            {
                                name: 'Delete Instance',
                                func: function (name, collection) {
                                    return $scope['delete_server_inst'](name, collection);
                                }
                            }
                        ]
                    },
                    {
                        heading: 'Firewalls',
                        items: $scope.assets['firewalls'],
                        key: 'name',
                        resourceClass: Firewall,
                        add: true
                    },
                    {
                        heading: 'Switches',
                        items: $scope.assets['switches'],
                        key: 'name',
                        resourceClass: Switch,
                        add: true
                    },
                    {
                        heading: 'Load Balancers',
                        items: $scope.assets['load_balancers'],
                        key: 'name',
                        resourceClass: LoadBalancer,
                        add: true
                    },
                    // Temporarily removing SAN
                    // {
                    //     heading: 'SANs',
                    //     items: $scope.assets['sans'],
                    //     key: 'system_name',
                    //     resourceClass: SAN,
                    //     // add: true
                    // }
                ];
                var _array_colo = [
                    {
                        heading: 'Cabinets',
                        items: $scope.assets['cabinets'],
                        key: 'name',
                        resourceClass: Cabinet,
                        add: true
                    },
                    {
                        heading: 'Cages',
                        items: $scope.assets['cages'],
                        key: 'name',
                        resourceClass: Cage,
                        add: true
                    },
                    {
                        heading: 'PDUs',
                        items: $scope.assets['pdus'],
                        key: 'hostname',
                        resourceClass: PDU,
                        add: true
                    }
                ];
                $scope.collections = _array;
                $scope.colo_collections = _array_colo;
            });
        });

        $scope.transformAccessTypes = function (accessTypes) {
            return accessTypes.map(function (e, i, arr) {
                return e.name;
            }).join();
        };


        $scope.orgcols = [
            { name: 'name', description: 'Name', required: true },
            { name: 'address1', description: 'Address1', required: true },
            { name: 'address2', description: 'Address2', required: true },
            { name: 'city', description: 'City', required: true },
            { name: 'state', description: 'State', required: true },
            { name: 'country', description: 'Country', required: true },
            { name: 'phone', description: 'Contact', required: true },
            { name: 'email', description: 'Email', required: true },
            { name: 'salesforce_id', description: 'Salesforce ID', required: true },
            { name: 'auth_key', description: 'Auth Key', required: false }
        ];

        $scope.asset_fields = {
            'Servers': [
                { name: 'name', description: 'Name', required: true },
                {
                    name: 'manufacturer', description: 'Manufacturer', hidden: true,
                    transform: 'accessor',
                    nullify: true,
                    required: true,
                    access: function (item) {
                        return item.manufacturer.name;
                    },
                    inputMethod: {
                        type: 'typeahead',
                        accessor: 'name',
                        invoker: new SearchService(ServerManufacturer).search
                    }
                },
                {
                    name: 'private_cloud', description: 'Cloud',
                    transform: 'accessor',
                    nullify: true,
                    access: function (item) {
                        //console.log(item.private_cloud);
                        if (item.private_cloud) {
                            return item.private_cloud.name;
                        }
                        else {
                            return '';
                        }
                    },
                    inputMethod: {
                        type: 'typeahead',
                        accessor: 'name',
                        invoker: new SearchService(PrivateCloudFast).search
                    }
                },
                { name: 'asset_tag', description: 'Asset Tag', nullify: true },
                {
                    name: 'server_type', description: 'Server Type', required: false,
                    transform: 'accessor',
                    nullify: true,
                    access: function (item) {
                        //console.log(item.private_cloud);
                        if (item.instance) {
                            if (item.bm_server) {
                                return "BM Server/Hypervisor";
                            }
                            else {
                                return "Hypervisor";
                            }
                        }
                        else if (item.bm_server) {
                            if (item.instance) {
                                return "BM Server/Hypervisor";
                            }
                            else {
                                return "BM Server";
                            }
                        }
                        else {
                            return 'None';
                        }
                    }
                },
                {
                    name: 'os',
                    description: 'Operating System',
                    required: false,
                    transform: 'accessor',
                    access: function (item) {
                        if (item && item.instance != null && item.instance.os != null) {
                            return item.instance.os.full_name;
                        }
                        return '';
                    },
                },
                { name: 'num_cpus', description: 'CPUs', required: true, },
                { name: 'num_cores', description: 'Cores', required: true, },
                { name: 'memory_mb', description: 'Memory', required: true, },
                { name: 'capacity_gb', description: 'Capacity (GB)', required: true, },
                { name: 'position', description: 'Position' },
                { name: 'size', description: 'Size' },
                {
                    name: 'cabinet',
                    description: 'Cabinet',
                    required: true,
                    transform: 'accessor',
                    access: function (item) {
                        if (item.cabinet)
                            return item.cabinet.name;
                    },
                    inputMethod: {
                        type: 'typeahead',
                        accessor: 'name',
                        invoker: new SearchService(CabinetFast).search
                    }
                },
                { name: 'description', description: 'Description', nullify: true }
            ],
            'Virtual Machines': [
                { name: 'name', description: 'Name', required: true },
                { name: 'management_ip', description: "Management IP" },
                { name: 'num_cpus', description: 'vCPUs', required: true },
                { name: 'num_cores', description: 'Total Cores' },
                {
                    name: 'memory_mb', description: 'RAM (MB)',
                    transform: 'accessor',
                    required: true,
                    access: function (item) {
                        return item.memory_mb;
                    }
                },
                {
                    name: 'private_cloud', description: 'Cloud', required: true,
                    transform: 'accessor',
                    access: function (item) {
                        //console.log(item.private_cloud);
                        if (item.private_cloud) {
                            return item.private_cloud.name;
                        }
                        else {
                            return '';
                        }
                    },
                    inputMethod: {
                        type: 'typeahead',
                        accessor: 'name',
                        invoker: new SearchService(PrivateCloudFast).search
                    }
                },
                {
                    name: 'capacity_gb', description: 'Disk Size (GB)',
                    transform: 'accessor',
                    access: function (item) {
                        return item.capacity_gb;
                    }
                },
                { name: 'ethports', description: 'NICs', required: true },
                {
                    name: 'os',
                    err_msg: 'osMsg',
                    description: 'Operating System',
                    required: true,
                    transform: 'accessor',
                    access: function (item) {
                        if (item && item.bm_server != null && item.bm_server.os != null) {
                            return item.bm_server.os.full_name;
                        }
                        return "";
                    },
                    inputMethod: {
                        type: 'typeahead',
                        accessor: 'full_name',
                        invoker: new CustomSearchService(OS, "type", "OS").search
                    }
                },
                {
                    name: 'server', description: 'Hypervisor',
                    transform: 'accessor',
                    access: function (item) {
                        if (item.server)
                            return item.server.name;
                    },
                    inputMethod: {
                        type: 'typeahead',
                        accessor: 'name',
                        invoker: new SearchService(ServerFast).search
                    }
                }
            ],
            'Firewalls': [
                { name: 'name', description: 'Name' },
                { name: 'asset_tag', description: 'Asset Tag' },
                // { name: 'cloud', description: 'Cloud',
                //     transform: 'accessor',
                //     access: function (item) {
                //         if (item.cloud) {
                //             return item.cloud[0].name;
                //         }
                //         else{
                //             return '';
                //         }
                //     },
                //     inputMethod: {
                //         type: 'typeahead',
                //         accessor: 'name',
                //         invoker: new SearchService(PrivateCloudFast).search
                //     }
                // },
                // // { name: 'public_ipaddress', description: 'IP Address' },
                {
                    name: 'model', description: 'Model',
                    transform: 'accessor',
                    access: function (item) {
                        if (item.model) {
                            return item.model.name;
                        }
                        else {
                            return item.model;
                        }
                    },
                    inputMethod: {
                        type: 'typeahead',
                        accessor: 'name',
                        invoker: new SearchService(FirewallModel).search
                    }
                }
            ],
            'Switches': [
                { name: 'name', description: 'Name' },
                { name: 'asset_tag', description: 'Asset Tag' },
                // { name: 'private_cloud', description: 'Cloud',
                //     transform: 'accessor',
                //     access: function (item) {
                //         //console.log(item.private_cloud);
                //         if (item.private_cloud) {
                //             return item.private_cloud.name;
                //         }
                //         else{
                //             return '';
                //         }
                //     },
                //     inputMethod: {
                //         type: 'typeahead',
                //         accessor: 'name',
                //         invoker: new SearchService(PrivateCloudFast).search
                //     }
                // },
                // { name: 'ip_address', description: 'IP Address' },
                {
                    name: 'model', description: 'Model',
                    transform: 'accessor',
                    access: function (item) {
                        return item.model.name;
                    },
                    inputMethod: {
                        type: 'typeahead',
                        accessor: 'name',
                        invoker: new SearchService(SwitchModel).search
                    }
                }
            ],
            'Load Balancers': [
                { name: 'name', description: 'Name' },
                { name: 'asset_tag', description: 'Asset Tag' },
                // { name: 'private_cloud', description: 'Cloud',
                //     transform: 'accessor',
                //     access: function (item) {
                //         //console.log(item.private_cloud);
                //         if (item.private_cloud) {
                //             return item.private_cloud.name;
                //         }
                //         else{
                //             return '';
                //         }
                //     },
                //     inputMethod: {
                //         type: 'typeahead',
                //         accessor: 'name',
                //         invoker: new SearchService(PrivateCloudFast).search
                //     }
                // },
                // { name: 'public_ipaddress', description: 'IP Address' },
                {
                    name: 'model', description: 'Model',
                    transform: 'accessor',
                    access: function (item) {
                        return item.model.name;
                    },
                    inputMethod: {
                        type: 'typeahead',
                        accessor: 'name',
                        invoker: new SearchService(LoadBalancerModel).search
                    }
                }
            ],
            'SANs': [
                { name: 'name', description: 'Name' },
                { name: 'asset_tag', description: 'Asset Tag' },
                { name: 'system_type', description: 'Type' },
                {
                    name: 'os_name', description: 'OS Name',
                    transform: 'accessor',
                    unnest: function (item) {
                        return item.related.instance.os.name;
                    }
                }
            ],
            'Cages': [
                { name: 'name', description: 'Name' },
            ],
            'Cabinets': [
                { name: 'name', description: 'Name' },
                {
                    name: 'cabinet_model',
                    description: 'Cabinet Model',
                    transform: 'accessor',
                    access: function (item) {
                        return item.cabinet_model.model;
                    },
                    inputMethod: {
                        type: 'typeahead',
                        accessor: 'model',
                        invoker: new SearchService(CabinetModel).search
                    }
                },
                {
                    name: 'cage',
                    description: 'Cage',
                    transform: 'accessor',
                    access: function (item) {
                        if (item.cage == null) {
                            return '';
                        }
                        else {
                            return item.cage.name;
                        }
                    },
                    inputMethod: {
                        type: 'typeahead',
                        accessor: 'name',
                        invoker: new SearchService(Cage).search
                    }
                },
                {
                    name: 'cabinet_type',
                    description: 'Type',
                    transform: 'accessor',
                    access: function (item) {
                        return item.cabinet_type.cabinet_type;
                    },
                    inputMethod: {
                        type: 'typeahead',
                        accessor: 'cabinet_type',
                        invoker: new SearchService(CabinetType).search
                    }
                }
            ],
            'PDUs': [
                {
                    name: 'hostname',
                    description: 'Hostname'
                },
                {
                    name: 'ip_address',
                    description: 'IP Address'
                },
                {
                    name: 'cabinet',
                    description: 'Cabinet',
                    transform: 'accessor',
                    access: function (item) {
                        return item.cabinet.name;
                    },
                    inputMethod: {
                        type: 'typeahead',
                        accessor: 'name',
                        invoker: new SearchService(CabinetFast).search
                    }
                },
                // {
                //    name: 'power_circuit',
                //    description: 'Power Circuit',
                //    transform: 'accessor',
                //    access: function (item) {
                //         if (item.power_circuit && item.power_circuit.name) {
                //             return item.power_circuit.name;
                //         }
                //         else if (item.power_circuit !== null) {
                //             return item.power_circuit;
                //         }
                //         else {
                //             return "";
                //         }
                //    },
                //    inputMethod: {
                //        type: 'typeahead',
                //        accessor: 'name',
                //        invoker: new SearchService(PowerCircuit).search
                //    }
                // },

                {
                    name: 'pdu_model',
                    description: 'Model',
                    transform: 'accessor',
                    access: function (item) {
                        if (item && item.pdu_model != null) {
                            return item.pdu_model.model_number;
                        }
                    },
                    inputMethod: {
                        type: 'typeahead',
                        accessor: 'model_number',
                        invoker: new SearchService(PDUModel).search
                    }
                }
            ]

        };

        // Displaying error msg above field
        angular.forEach($scope.asset_fields, function (item, i) {
            angular.forEach(item, function (subitem, i) {
                item[i] = angular.extend(subitem, { err_msg: subitem.name + 'Msg' });
            });
        });

        $scope.tabs = [
            { name: 'Organization', url: 'orgDetails.html' },
            { name: 'Assets', url: 'assets.html' },
            { name: 'Colo', url: 'colo.html' },
            { name: 'Opportunities', url: 'orgOppty.html' },
            //{ name: 'Invoices', url: 'orgInvoices.html'}
        ];

        // select the tab based on param
        $scope.activeTab = 0;
        if (tab) {
            $scope.tabs.forEach(function (e, i, arr) {
                if (e.name == tab) {
                    $scope.activeTab = i;
                }
            });
        }
        $scope.updateTab = function (idx) {
            $location.search({ t: $scope.tabs[idx].name });
        };

        $scope.resourceClass = User;
        $scope.modal = {
            templateUrl: 'genericModal.html',
            scope: $scope,
            size: 'md',
            controller: 'UserEditController',
            resolve: {
                idField: function () {
                    return "id";
                }
            }
        };

        $scope.selection = {
            selected: null,
            index: null
        };

        $scope.delete_server_inst = function (name, collection) {
            if (confirm("are you sure")) {
                var inst = new Instance(collection.selection.item.instance);
                inst.$delete().then(function (response) {
                    collection.selection.item.instance = null;
                });
            }
        };

        $scope.delete_server_bm = function (name, collection) {
            if (confirm("Are you sure?")) {
                var bm = new BMServer(collection.selection.item.bm_server);
                bm.$delete().then(function (response) {
                    collection.selection.item.bm_server = null;
                });
            }
        };

        $scope.generateInvoice = function () {
            var modalInstance = $uibModal.open({
                templateUrl: 'invoiceModal.html',
                controller: 'GenerateInvoiceModalController',
                scope: $scope,
                size: 'md'
            });
            modalInstance.result.then(function () {

            });
        };

        $scope.oppty = null;
        $scope.invoices = [];

        var getOpptyInvoices = function (oppty) {
            var invoices = [];
            $scope.assets.invoices.forEach(function (e, i, arr) {
                if (oppty.id == e.opportunity.id) {
                    invoices.push(e);
                }
            });
            return invoices;
        };
        // _array.forEach(function (e, i, arr) {
        //     var _side = $scope.left_side;
        //     if (left_has_more()) {
        //         _side = $scope.right_side;
        //     }
        //     _side.push(e);
        // });

        $scope.selectedInvoice = {
            selected: null,
            index: null,
        };

        $scope.selectedOppty = {
            selected: null,
            index: null,
        };

        $scope.selectInvoice = function (result, $index) {
            $scope.selectedInvoice.index = $index;
            $scope.selectedInvoice.selected = result;
        };

        $scope.selectOppty = function (result, $index) {
            $scope.selectedOppty.index = $index;
            $scope.selectedOppty.selected = result;
            $scope.invoices = getOpptyInvoices($scope.selectedOppty.selected);
            if ($scope.invoices.length) {
                $scope.selectInvoice($scope.invoices[0], 0);
            }
            else {
                $scope.selectInvoice(null, null);
            }
            $scope.oppty = $scope.selectedOppty.selected;
        };

        $scope.exportInvoice = function () {
            var invoice = $scope.selectedInvoice.selected;
            InvoiceService.generatePDF(invoice);
        };

        $scope.modify_server_inst = function (name, collection, fields) {
            $scope.obj = {};
            if (collection.selection.item.instance != null) {
                $scope.obj = angular.extend({}, collection.selection.item.instance);
            }
            $scope.activeCols = fields;
            $scope.resourceClass = Instance;
            if (angular.equals({}, $scope.obj)) {
                $scope.method = 'Add';
            } else {
                $scope.method = 'Edit';
            }
            $scope.mangle = function (obj) {
                // console.log("Mangle Object : "+angular.toJson(collection.selection))
                obj.system = collection.selection.item;
                obj.name = collection.selection.item.name;
                obj.customer = $scope.orgresult;
                // collection.selection.item.
                //console.log("Selected Item : " + angular.toJson(collection.selection.item));
            };

            $scope.list = collection.items;
            //console.log($scope.list);

            var modalInstance = $uibModal.open({
                templateUrl: '/static/rest/app/templates/modal/modify_instance.html',
                controller: 'ModifyInstanceModal',
                scope: $scope,
                size: 'md'
            });
            modalInstance.result.then(function () {
                delete $scope.mangle;
                delete $scope.method;
                $route.reload();
            });
        };

        $scope.add_bm_server = function (name, collection, fields) {
            $scope.obj = {};
            $scope.activeCols = fields;
            console.log('collection : ', angular.toJson(collection));
            $scope.obj = {};
            if (collection.selection.item.bm_server != null) {
                $scope.obj = angular.extend({}, collection.selection.item.bm_server);
                if ($scope.obj.bm_controller) {
                    $scope.obj.ip = angular.copy($scope.obj.bm_controller.ip);
                    $scope.obj.username = angular.copy($scope.obj.bm_controller.username);
                    $scope.obj.proxy_url = angular.copy($scope.obj.bm_controller.proxy_url);
                    if ($scope.obj.bmc_type == 'DRAC') {
                        $scope.obj.version = angular.copy($scope.obj.bm_controller.version).toString();
                    }
                }
            }
            if (angular.equals({}, $scope.obj)) {
                $scope.method = 'Add';
            } else {
                $scope.method = 'Edit';
            }
            $scope.mangle = function (obj) {
                obj.server = collection.selection.item;
            };

            var modalInstance = $uibModal.open({
                templateUrl: '/static/rest/app/templates/modal/modify_baremetal.html',
                controller: 'AddBMServerModal',
                scope: $scope,
                size: 'md'
            });
            modalInstance.result.then(function () {
                delete $scope.mangle;
                delete $scope.method;
                $route.reload();
            });

            $scope.list = collection.items;


        };

        $scope.modify_vm_inst = function (name, collection, fields, mangleFunc) {
            $scope.obj = {};
            if (collection.selection.item.instance != null) {
                $scope.obj = angular.extend({}, collection.selection.item.instance);
            }
            $scope.activeCols = fields;
            $scope.resourceClass = Instance;
            if (angular.equals({}, $scope.obj)) {
                $scope.method = 'Add';
            } else {
                $scope.method = 'Edit';
            }
            $scope.mangle = function (obj) {
                obj.virtualsystem = collection.selection.item;
                obj.name = collection.selection.item.name;
                obj.customer = $scope.orgresult;
                // collection.selection.item.
                //console.log("Selected Item : " + collection.selection.item);
            };

            var modalInstance = $uibModal.open({
                templateUrl: '/static/rest/app/templates/modal/requestor.html',
                controller: 'ModifyInstanceModal',
                scope: $scope,
                size: 'md'
            });
            modalInstance.result.then(function () {
                delete $scope.mangle;
                delete $scope.method;
                $route.reload();
            });
        };

        $scope.create = function (collection) {
            $scope.obj = {};
            $scope.activeCols = $scope.asset_fields[collection.heading];
            $scope.resourceClass = collection.resourceClass;
            $scope.method = 'Add';
            $scope.list = collection.items;
            $scope.mangle = function (obj) {
                obj.customer = $scope.orgresult;
            };
            var modalInstance = $uibModal.open({
                templateUrl: '/static/rest/app/templates/modal/requestor.html',
                controller: 'EditServerModal',
                scope: $scope,
                size: 'md'
            });
            modalInstance.result.then(function () {
                // clean up
                delete $scope.mangle;
                delete $scope.method;
            });
        };

        $scope.addUser = function () {
            var modalInstance = $uibModal.open({
                templateUrl: 'aclModal.html',
                controller: 'ImportUserModalController',
                scope: $scope,
                size: 'lg'
            });
            modalInstance.result.then();
        };

        $scope.exportUser = function () {
            var modalInstance = $uibModal.open({
                templateUrl: 'exportUserModal.html',
                controller: 'ExportUserModalController',
                scope: $scope,
                size: 'lg'
            });
            modalInstance.result.then();
        };

        $scope.generate_auth_key = function () {
            $http.post('/rest/org/' + id + '/generate_auth_key/')
                .then(function (response) {
                    $scope.orgresult.auth_key = response.data.auth_key;
                });
        };

        $scope.inviteUser = function () {
            var modalInstance = $uibModal.open({
                templateUrl: 'inviteUserModal.html',
                controller: 'InviteUserModalController',
                scope: $scope,
                size: 'lg'
            });
            modalInstance.result.then();
        };

        $scope.modify = function (collection) {
            // original is a reference to the object
            // obj is a copy of original
            var selection = collection.selection;
            $scope.original = selection.item;
            $scope.obj = angular.copy($scope.original);
            $scope.activeCols = $scope.asset_fields[collection.heading];
            $scope.resourceClass = collection.resourceClass;
            $scope.method = 'Edit';
            var modalInstance = $uibModal.open({
                templateUrl: '/static/rest/app/templates/modal/requestor.html',
                controller: 'EditServerModal',
                scope: $scope,
                size: 'md'
            });
            modalInstance.result.then();
        };

        // $scope.delete = function (collection) {
        //     // original is a reference to the object
        //     // obj is a copy of original
        //     var selection = collection.selection;
        //     $scope.original = selection.item;
        //     $scope.obj = angular.copy($scope.original);
        //     $scope.activeCols = $scope.asset_fields[collection.heading];
        //     var resource = collection.resourceClass;

        // };

        $scope.remove = function (collection, idx) {
            var selection = collection.selection;
            var objId = selection.item.id;
            $scope.resourceClass = collection.resourceClass;
            var resource = $scope.resourceClass;
            var newObj = new resource({ id: objId });
            newObj.$delete().then(function (response) {
                var delete_msg = "Deleted Successfully";
                if (selection.item.name) {
                    delete_msg = 'Deleted ' + selection.item.name + ' successfully';
                }
                AlertService2.success(delete_msg);
                collection.items.splice(idx, 1);

            }).catch(function (error) {
                var retval = error;
                if (error.hasOwnProperty('detail')) {
                    retval = error.detail;
                }
                else if (error.hasOwnProperty('data')) {
                    if (error.data.hasOwnProperty('detail')) {
                        retval = error.data.detail;
                    }
                }
                AlertService2.danger(retval);
            });
        };

        $scope.getGroupssByOrg = function (org) {
            GroupsRolesByOrg.get({ id: org.id }).$promise.then(function (response) {
                $scope.rolelist = response.roles;
                $scope.grouplist = response.groups;
            }).catch(function (error) {
                //console.log(error);
            });

        };

        $scope.selectHook = function () {
        };
        $scope.unselectHook = function () {
        };

        $scope.unselect = function (result, $index) {
            $scope.selection.index = null;
            $scope.selection.selected = null;
            $scope.unselectHook(result, $index);
        };

        $scope.select = function (result, $index, collection) {
            collection.selection = {
                item: result,
                index: $index
            };
        };

        $scope.edituser = function () {

            $scope.DescriptionChange = false;

            //$scope.obj = JSON.parse(JSON.stringify($scope.selection.selected));
            $http.get($scope.selection.selected.url).then(function (response) {

                $scope.obj = JSON.parse(JSON.stringify(response.data));
                if ($scope.obj.groups && $scope.obj.roles) {
                    $scope.getGroupssByOrg($scope.obj.org);

                }

                if ($scope.obj.password || $scope.obj.switch_model) {
                    $scope.DescriptionChange = true;
                    $scope.obj.password = undefined;
                }
            });

            $scope.method = 'Edit';
            var modalInstance = $uibModal.open($scope.modal);
            modalInstance.result.then();
        };

    }
]);

app.controller('ModifyInstanceModal', [
    '$scope',
    '$uibModalInstance',
    'AlertService2',
    function ($scope, $uibModalInstance, AlertService2) {
        // probably a repeat of the generic modal
        // expects $scope.resourceClass to be set
        var resource = $scope.resourceClass;
        if ($scope.method === undefined) {
            $scope.method = 'Edit';
        }
        $scope.create = function (obj, list) {
            // mangle the object to set some defaults
            // usually customer
            obj = $scope.purge(obj);
            obj.instance_type = "Hypervisor";
            if ($scope.mangle !== undefined) {
                $scope.mangle(obj);
            }
            var newObj = new resource(obj);
            newObj.$save().then(function (response) {
                $uibModalInstance.close();
            }).catch(function (error) {
                $scope.attach_msg(obj, error);
            });
        };

        $scope.update = function (obj) {
            // obj: a Resource object in JSON
            obj = $scope.purge(obj);
            obj.instance_type = "Hypervisor";
            resource.update(obj).$promise.then(function (response) {
                $uibModalInstance.close();
            }).catch(function (error) {
                $scope.attach_msg(obj, error);
            });
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };

        $scope.attach_msg = function (obj, error) {
            // Attaches Error msg to obj to display validation error
            if (error.hasOwnProperty('data') && typeof error.data !== 'string')
                angular.forEach(error.data, function (value, key) {
                    obj[key + "Msg"] = value[0];
                });
            return obj;
        };

        $scope.purge = function (obj) {
            // Avoids posting of error msg
            if (!angular.equals({}, obj))
                angular.forEach(obj, function (value, key) {
                    if (key.indexOf('Msg') != -1)
                        delete obj[key];
                });
            return obj;
        };
    }
]);


app.controller('AddBMServerModal', [
    '$scope',
    'BMServer',
    '$uibModalInstance',
    'AlertService2',
    function ($scope, BMServer, $uibModalInstance, AlertService2) {
        var resource = BMServer;
        if ($scope.method === undefined) {
            $scope.method = 'Edit';
        }
        $scope.create = function (obj, list) {
            obj = $scope.purge(obj);
            if ($scope.mangle !== undefined) {
                $scope.mangle(obj);
            }
            var newObj = new resource(obj);
            newObj.$save().then(function (response) {
                $uibModalInstance.close();
            }).catch(function (error) {
                console.log("Error while Adding BM Server" + JSON.stringify(error));
                $scope.attach_msg(obj, error);
            });
        };

        $scope.update = function (obj) {
            obj = $scope.purge(obj);
            if ($scope.mangle !== undefined) {
                $scope.mangle(obj);
            }
            resource.update(obj).$promise.then(function (response) {
                $uibModalInstance.close();
            }).catch(function (error) {
                $scope.attach_msg(obj, error);
                console.log("Error while Editing BM Server" + JSON.stringify(error));
            });
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };

        $scope.attach_msg = function (obj, error) {
            // Attaches Error msg to obj to display validation error
            if (error.hasOwnProperty('data') && typeof error.data !== 'string')
                angular.forEach(error.data, function (value, key) {
                    obj[key + "Msg"] = value[0];
                });
            return obj;
        };

        $scope.purge = function (obj) {
            // Avoids posting of error msg
            if (!angular.equals({}, obj))
                angular.forEach(obj, function (value, key) {
                    if (key.indexOf('Msg') != -1)
                        delete obj[key];
                });
            return obj;
        };
    }
]);

app.controller('ImportUserModalController', [
    '$scope',
    '$http',
    'AlertService2',
    '$uibModalInstance',
    function ($scope, $http, AlertService2, $uibModalInstance) {
        var req = $http.get('/salesforce/contacts/', { params: { accountid: $scope.orgresult.salesforce_id } });
        var contacts = null;
        req.then(function (response) {
            //console.log(response);
            console.log("==================>" + angular.toJson(response.data));
            if (response.data.length == 0) {
                $scope.error = "Unable to fetch Contacts from Salesforce";
                AlertService2.danger("Unable to fetch Contacts from Salesforce");
            }
            else {
                $scope.contacts = response.data;
            }
        }).catch(function (error) {
            AlertService2.danger(error.data.message + " . " + error.data.detail);
        });
        $scope.addContact = function (contact) {
            if (contact) {
                $http.post($scope.orgresult.url + "import_salesforce_user/", { data: contact }).then(function (response) {
                    //console.log(response);
                    $uibModalInstance.close();
                }).catch(function (error) {
                    $scope.error = error.data.detail;
                    //console.log(angular.toJson($scope.error));
                });
            }
            else {
                AlertService2.danger("Please Select a Valid Contact");
            }


        };
        $scope.format_name = function (contact) {
            return contact.first_name + " " + contact.last_name + " (" + contact.email + ")";
        };
        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }
]);


app.controller('ExportUserModalController', [
    '$scope',
    '$http',
    'AlertService2',
    '$uibModalInstance',
    function ($scope, $http, AlertService2, $uibModalInstance) {
        console.log("Organization Result :" + angular.toJson($scope.orgresult));

        var req = $http.get('/rest/org/' + $scope.orgresult.id + '/zendesk_unlinked_users/');
        var contacts = null;

        req.then(function (response) {
            console.log("==================>" + angular.toJson(response.data.users));
            if (response.data.length == 0) {
                $scope.error = "Unable to fetch Contacts";
                AlertService2.danger("Unable to fetch Contacts");
            }
            else {
                $scope.contacts = response.data.users;
            }
        }).catch(function (error) {
            $scope.error = error.data.detail;
            AlertService2.danger(error.data.message + " . " + error.data.detail);
        });

        $scope.exportContact = function (contact) {
            console.log("==================>" + angular.toJson(contact));
            if (contact) {
                console.log(angular.toJson(contact));
                $http.post($scope.orgresult.url + "export_user_zendesk/", { data: contact }).then(function (response) {
                    //console.log(response);
                    $uibModalInstance.close();
                }).catch(function (error) {
                    $scope.error = error.data.detail;
                    // console.log(angular.toJson($scope.error));
                });
            }
            else {
                $scope.error = "Please Select a Valid Contact";
                AlertService2.danger("Please Select a Valid Contact");
            }


        };
        $scope.format_name = function (contact) {
            return contact.first_name + " " + contact.last_name + " (" + contact.email + ")";
        };
        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }
]);

app.controller('InviteUserModalController', [
    '$scope',
    '$http',
    'AlertService2',
    '$uibModalInstance',
    function ($scope, $http, AlertService2, $uibModalInstance) {
        $scope.contacts = [];
        $scope.dropdownExtraSettings = { enableSearch: true, showSelectAll: true, keyboardControls: true, scrollableHeight: '200px', checkBoxes: true, scrollable: true };
        var req = $http.get('/rest/org/' + $scope.orgresult.id + '/get_user_details/');
        req.then(function (response) {
            if (response.data.length == 0) {
                AlertService2.danger("Unable to fetch User");
            }
            else {
                angular.forEach(response.data.users, function (value, key) {
                    $scope.contacts.push({ 'id': value.id, 'label': value.email });
                });
                $scope.inviteContacts = [];
            }
        }).catch(function (error) {
            $scope.contacts = [];
            AlertService2.danger(error.data.message + " . " + error.data.detail);
        });
        $scope.inviteUser = function (contact) {
            if (contact) {
                $http.post("/rest/user/send_bulk_email_invitation/", { data: contact }).then(function (response) {
                    $uibModalInstance.close();
                    alert("Emails sent successfully.");
                    AlertService2.success("Emails sent successfully.");
                }).catch(function (error) {
                    $scope.error = error.data.detail;
                    AlertService2.success("Error while sending email: ", $scope.error);
                });
            }
            else {
                AlertService2.danger("Please Select a Valid Contact");
            }
        };
        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }
]);


app.controller('UserDetailController', [
    '$scope',
    '$routeParams',
    '$http',
    'User',
    'AlertService2',
    '$uibModal',
    '$location',
    'BreadCrumbService',
    'AccessType',
    'SearchService',
    'OrganizationFast',
    function ($scope, $routeParams, $http, User, AlertService2, $uibModal,
        $location, BreadCrumbService, AccessType, SearchService, OrganizationFast) {
        $scope.alertService = AlertService2;
        $scope.getOrgs = new SearchService(OrganizationFast).search;
        var resourceClass = User;
        var id = $routeParams.id;
        $scope.bread = BreadCrumbService;
        $scope.$on('$destroy', function () {
            $scope.bread.pushIfTop({ name: 'User Detail', url: '#/user/' + id }, $scope);
        });

        var fetched = resourceClass.get({ id: id }).$promise;

        fetched.then(function (response) {
            $scope.result = response;
            $http.get($scope.result.url + 'get_audit_data/').then(function (response) {
                $scope.audit_data = response.data;
            });
        });

        AccessType.query().$promise.then(function (response) {
            $scope.accessTypes = response.results;
        }).catch(function (error) {
            AlertService2.danger(error);
        });


        $scope.getLastInvite = function () {
            if ('result' in $scope) {
                var invs = $scope.result.invitations.length;
                if (invs > 0) {
                    return $scope.result.invitations[invs - 1];
                }
            }
            return null;
        };

        $scope.checkPending = function () {
            // Check each item to see if there's still an invitation waiting.
            if ('result' in $scope) {
                return $scope.result.invitations.find(function (e, i, arr) {
                    return e.pending === true;
                });
            }
        };

        $scope.sendEmailInvitation = function (user) {
            $http.post(user.url + 'send_email_invitation/').then(function (response) {
                AlertService2.success('Invitation email sent to ' + user.email);
                $scope.result.invitations = response.data.invitations;
            }).catch(function (error) {
                AlertService2.danger('Could not send email.  Check server logs for more details.');
            });
        };

        $scope.changeAccess = function () {
            $scope.obj = angular.copy($scope.result);
            var modalInstance = $uibModal.open({
                templateUrl: 'userAccessControl.html',
                controller: 'UserAccessControlModal',
                scope: $scope,
                size: 'md'
            });
            modalInstance.result.then();
        };

        $scope.changeDetails = function () {
            $scope.obj = angular.copy($scope.result);
            var modalInstance = $uibModal.open({
                templateUrl: 'userDetails.html',
                controller: 'UserAccessControlModal',
                scope: $scope,
                size: 'md'
            });
            modalInstance.result.then();
        };

        $scope.deleteUser = function (user) {
            return $http.delete(user.url).then(function (response) {
                AlertService2.success('Deleted ' + user.email);
                $location.path('/user');
            }).catch(function (response) {
                AlertService2.danger('Could not delete ' + user.email);
            });
        };

        var user_active = function (is_active) {
            return User.update(angular.extend({}, $scope.result, { is_active: is_active })).$promise.then(function (response) {
                angular.extend($scope.result, response);
            }).catch(function (error) {
                AlertService2.danger(error);
            });
        };

        $scope.disableUser = function () {
            return user_active(false);
        };

        $scope.enableUser = function () {
            return user_active(true);
        };

        $scope.rescindInvitation = function (invite) {
            $http.post(invite.url + 'rescind/').then(function (response) {
                angular.extend(invite, response.data);
                AlertService2.success("Updated invitation.");
            });
        };
    }
]);


app.controller('UserAccessControlModal', [
    '$scope',
    '$uibModalInstance',
    'AlertService2',
    'User',
    function ($scope, $uibModalInstance, AlertService2, User) {
        $scope.update = function (obj) {
            // expects a Resource object
            User.update(obj).$promise.then(function (response) {
                angular.extend($scope.result, response);
                $uibModalInstance.close();
                AlertService2.success("Updated " + $scope.result.email);
            });
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }
]);


app.controller('UserEditController', [
    '$scope',
    '$routeParams',
    '$http',
    '$uibModal',
    'User',
    'OrganizationFast',
    'AccessList',
    'AlertService2',
    'GroupsRolesByOrg',
    '$location',
    'BreadCrumbService',
    'SearchService',
    'AbstractControllerFactory',
    '$uibModalInstance',
    function ($scope, $routeParams, $http, $uibModal, User, OrganizationFast, AccessList, AlertService2, GroupsRolesByOrg, $location, BreadCrumbService, SearchService, AbstractControllerFactory, $uibModalInstance) {
        $scope.alertService = AlertService2;


        var id = $routeParams.id;

        $scope.customers = [];
        $scope.roles = [];
        $scope.groups = [];
        //$scope.grouplist = [];
        $scope.accesslist = [];

        OrganizationFast.query({ page_size: 9000 }).$promise.then(function (success) {
            $scope.customers.push.apply($scope.customers, success.results);
        }).catch(function (error) {
            //console.log(error);
        });

        AccessList.query({ page_size: 9000 }).$promise.then(function (success) {
            $scope.accesslist.push.apply($scope.accesslist, success.results);
        }).catch(function (error) {
            //console.log(error);
        });

        var searchService = new SearchService(OrganizationFast);
        $scope.getOrgs = searchService.search;


        $scope.resourceClass = User;

        $scope.rows = [
            //{ name: "user_id", description: "User ID", required: true},
            {
                name: "email", description: "User ID", required: true,
                opaque: "link",
                subfield: "email",
            },
            { name: "is_active", description: "Is Active", required: true, ischeck: true, checkvalue: "Active" },
            { name: "first_name", description: "First Name", required: true },
            { name: "last_name", description: "Last Name", required: true },
            {
                name: "password",
                description: "Temporary Password",
                alterdescription: "Password",
                required: true,
                passwordfield: true,
                hide: true
            },
            { name: "password_expiry", description: "Password Expiry", required: true, opaquedate: true, hide: true },
            {
                name: "org", description: "Organization", required: true,
                opaque: true,
                rendermethod: "GroupssByOrg",
                subfield: "name",

                edit: function (result) {
                    if (!('url' in result)) {
                        return null;
                    }
                    return $scope.customers.find(function (e, i, arr) {
                        return e.id == result.id;
                    });
                },
                render: $scope.getOrgs
            },
            {
                name: "roles", description: "Roles", required: true, hide: true,
                opaquelist: true,
                subfield: "name",
                fillbyobj: 'roles',

                edit: function (result) {
                    if (result.role && result.role.name) {
                        return result.role.name;
                    }
                    else if (result.role !== null) {
                        return result.role;
                    }
                    else {
                        return "";
                    }
                },
                //list: $scope.roles
            },
            {
                name: "groups", description: "Groups", required: true, hide: true,
                opaquelist: true,
                subfield: "group_name",
                trackby: "id",
                fillbyobj: 'groups',

                edit: function (result) {
                    if (result.group && result.group.group_name) {
                        return result.group.group_name;
                    }
                    else if (result.group !== null) {
                        return result.group;
                    }
                    else {
                        return "";
                    }
                },
                //list: $scope.groups
            },
            {
                name: "access_lists", description: "Access List", required: true, hide: true,
                opaquelist: true,
                subfield: "access_type",
                list: $scope.accesslist
            },
            { name: "salesforce_id", description: "Salesforce ID", required: true },
        ];

        $scope.title = {
            plural: "Users",
            singular: "User"
        };

        $scope.edit = function (obj, idx) {
            if (obj.password !== undefined) {
                obj.password = (obj.password == "" ? undefined : obj.password);
            }
            User.update(obj).$promise.then(function (response) {
                AlertService2.success("Edited " + response["id"]);
                $location.path("/organization/" + id);

            }).catch(function (error) {
                var retval = error;
                if ("detail" in error) {
                    retval = error.detail;
                } else if ("data" in error && "detail" in error.data) {
                    retval = error.data.detail;
                } else if ("data" in error) {
                    retval = error.data;
                }
                AlertService2.danger(retval);
            });

        };

        $scope.cancel = function () {
            $uibModalInstance.close();
        };


    }
]);


app.controller('AssociateVServerDetailController', [
    '$scope',
    '$routeParams',
    'URLService',
    'AlertService2',
    '$http',
    '$location',
    'BreadCrumbService',
    function ($scope, $routeParams, URLService, AlertService2, $http, $location, BreadCrumbService) {
        $scope.alertService = AlertService2;
        $scope.VMAvailable = false;
        $scope.showmessage = false;

        var ServerURL = URLService.GetSetURL("");

        var id = $routeParams.id;

        $scope.bread = BreadCrumbService;
        $scope.$on('$destroy', function () {
            $scope.bread.pushIfTop({
                name: "Associate Virtual Server Details",
                url: '#/server/vserver_details/' + id
            }, $scope);
        });

        if (window.savechanges && window.savechanges != "") {
            $scope.showmessage = true;
            $scope.alertMsg = window.savechanges;
            window.savechanges = "";
        }
        else {
            $scope.showmessage = false;
            window.savechanges = "";
        }

        $scope.closeAlert = function () {
            $scope.showmessage = false;
        };

        $http.get(ServerURL + "get_virtual_servers/").then(function (response) {

            if (response.data.virtual_instances.length > 0) {
                $scope.VMAvailable = true;
                $scope.vserverdet = response.data.virtual_instances;
                $scope.sysname = response.data.virtual_instances[0].system.system_name;

            }
            else {
                $scope.VMAvailable = false;
            }
        }, function (error) {
            $scope.VMAvailable = false;
        });


        $scope.EditVirtualServer = function (vserver) {
            var urlmodel = URLService.model;
            var seturl = URLService.GetSetURL(vserver.url);
            $location.path("/virtualserver_edit/");
            window.pagefrom = '/server/vserver_details/' + id;
            window.pageURL = ServerURL;
        };
    }
]);

