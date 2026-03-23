/**
 * Created by rt on 10/4/16.
 */
var app = angular.module('uldb');

app.controller('PrivateCloudController', [
    '$scope',
    '$uibModal',
    '$routeParams',
    '$location',
    'OrganizationFast',
    'DatacenterFast',
    'PrivateCloud',
    'AbstractControllerFactory2',
    'TemplateDirectory',
    'SearchService',
    'AlertService2',
    function ($scope,
        $uibModal,
        $routeParams,
        $location,
        OrganizationFast,
        DatacenterFast,
        PrivateCloud,
        AbstractControllerFactory2,
        TemplateDirectory,
        SearchService,
        AlertService2) {

        //  TAB CONTROL : Temporary for Demo
        $scope.tabs = [
            { name: 'Private Cloud', url: 'cloud' },
            // { name: 'Manage Vcenter', url: 'vmware-vcenter' },
            // { name: 'Manage ESXi', url: 'vmware-esxi' },
            // { name: 'Manage Openstack', url: 'openstack-proxy' }
        ];

        $scope.activeTab = 0;
        $scope.updateTab = function (idx) {
            $location.path($scope.tabs[idx].url);
        };
        //  END TAB CONTROL FUNCTIONALITY

        $scope.title = {
            plural: 'Private Cloud',
            singular: 'Private Cloud'
        };
        $scope.$root.title = $scope.title;
        $scope.getOrgs = new SearchService(OrganizationFast).search;
        $scope.getDcs = new SearchService(DatacenterFast).search;
        $scope.platform_types = ['OpenStack', 'VMware', 'Hyper-V'];

        $scope.proxy_link = function (cloud) {
            if (cloud.platform_type === 'VMware') {
                if (cloud.vcenter_proxy.length > 0) {
                    return cloud.vcenter_proxy;
                }
            } else if (cloud.platform_type === 'OpenStack') {
                if (cloud.openstack_proxy.length > 0) {
                    return cloud.openstack_proxy;
                }
            }
            return null;
        };
        $scope.proxy_prefix = function (cloud) {
            return {
                'VMware': 'vmware-vcenter',
                'OpenStack': 'openstack-proxy'
            }[cloud.platform_type];
        };

        $scope.private_clouds = [];
        PrivateCloud.query().$promise.then(function (response) {
            $scope.private_clouds = response.results;
        }).catch(function (error) {
            AlertService2.danger(error);
        });


        $scope.createPrivateCloud = function () {
            $scope.resourceClass = PrivateCloud;
            var modalInstance = $uibModal.open({
                templateUrl: TemplateDirectory.modals.privateCloud,
                controller: 'EditServerModal',
                scope: $scope,
                size: 'md'
            });
            modalInstance.result.then(function () {

            });
        };
    }
]);

app.controller('PrivateCloudController2', [
    '$scope',
    '$uibModal',
    '$routeParams',
    '$location',
    'OrganizationFast',
    'DatacenterFast',
    'PrivateCloud',
    'ULDBService2',
    'AbstractControllerFactory2',
    'TemplateDirectory',
    'SearchService',
    'AlertService2',
    function ($scope,
        $uibModal,
        $routeParams,
        $location,
        OrganizationFast,
        DatacenterFast,
        PrivateCloud,
        ULDBService2,
        AbstractControllerFactory2,
        TemplateDirectory,
        SearchService,
        AlertService2) {

        //  TAB CONTROL : Temporary for Demo
        $scope.tabs = [
            { name: 'Private Cloud', url: 'cloud' },
            // { name: 'Manage Vcenter', url: 'vmware-vcenter' },
            // { name: 'Manage ESXi', url: 'vmware-esxi' },
            // { name: 'Manage Openstack', url: 'openstack-proxy' }
        ];

        $scope.activeTab = 0;
        $scope.updateTab = function (idx) {
            $location.path($scope.tabs[idx].url);
        };
        //  END TAB CONTROL FUNCTIONALITY

        $scope.title = {
            plural: 'Private Cloud',
            singular: 'Private Cloud'
        };
        $scope.$root.title = $scope.title;

        $scope.proxy_link = function (cloud) {
            console.log('cloud : ', angular.toJson(cloud));
            if (cloud.platform_type === 'VMware') {
                if (cloud.vcenter_proxy.length > 0) {
                    // console.log("Here ==>"+angular.toJson(cloud.vcenter_proxy));
                    return cloud.vcenter_proxy;
                }
            } else if (cloud.platform_type === 'OpenStack') {
                if (cloud.openstack_proxy.length > 0) {
                    return cloud.openstack_proxy;
                }
            }
            return null;
        };
        $scope.proxy_prefix = function (cloud) {
            return {
                'VMware': 'vmware-vcenter',
                'OpenStack': 'openstack-proxy'
            }[cloud.platform_type];
        };


        $scope.ctrl = AbstractControllerFactory2($scope, ULDBService2.private_cloud());


    }
]);

app.controller('PrivateCloudDetailController', [
    '$scope',
    '$http',
    '$routeParams',
    '$uibModal',
    '$location',
    '$sce',
    '$mdToast',
    '$timeout',
    'Organization',
    'DataCenter',
    'PrivateCloud',
    'Server',
    'VirtualMachine',
    'Switch',
    'LoadBalancer',
    'VirtualLoadBalancer',
    'Firewall',
    'GraphedPort',
    'NagiosService',
    'SearchService',
    'AlertService2',
    'TemplateDirectory',
    'PrivateCloudService',
    'TaskService2',
    'AbstractControllerFactory2',
    'TableHeaders',
    'ULDBService2',
    function ($scope,
        $http,
        $routeParams,
        $uibModal,
        $location,
        $sce,
        $mdToast,
        $timeout,
        Organization,
        DataCenter,
        PrivateCloud,
        Server,
        VirtualMachine,
        Switch,
        LoadBalancer,
        VirtualLoadBalancer,
        Firewall,
        GraphedPort,
        NagiosService,
        SearchService,
        AlertService2,
        TemplateDirectory,
        PrivateCloudService,
        TaskService2,
        AbstractControllerFactory2,
        TableHeaders,
        ULDBService2) {
        var resourceClass = PrivateCloud;
        var id = $routeParams.id;
        var updateGraph = PrivateCloudService.updateGraphFactory('mynetwork');

        $scope.tabs = [
            { name: 'Overview', url: '/static/rest/app/templates/cloud/pc-overview.html' },
            { name: 'Management', url: '/static/rest/app/templates/cloud/pc-manage.html' },
            { name: 'Components', url: '/static/rest/app/templates/cloud/pc-modify.html' },
            { name: 'Networking', url: '/static/rest/app/templates/cloud/pc-networking.html' },
            { name: 'Virtual Load Balancing', url: '/static/rest/app/templates/cloud/pc-lb.html' },
        ];

        var fetch_vlb = function () {
            if (angular.isDefined($scope.cloud)) {
                $http.get($scope.cloud.url + 'virtual_load_balancers/').then(function (response) {
                    $scope.cloud.virtual_load_balancers = response.data;
                    $scope.cloud.virtual_load_balancers.forEach(function (e, i, arr) {
                        $http.get(e.url + 'f5_info/').then(function (response) {
                            e['vlb_extern'] = response.data;
                        });
                    });
                });
            }
        };

        $scope.stripUrl = function () {
            return function (str) {
                return str.match(/.*~(\w+)/)[1];
            };
        };

        $scope.activeTab = 0;
        $scope.updateTab = function (idx) {
            $location.search({ t: $scope.tabs[idx].name });
            if ($scope.tabs[idx].name === 'Virtual Load Balancing') {
                fetch_vlb();
            }
        };
        var tab = $routeParams.t;
        if (tab) {
            $scope.tabs.forEach(function (e, i, arr) {
                if (e.name === tab) {
                    $scope.activeTab = i;
                    if (e.name === 'Virtual Load Balancing') {
                        fetch_vlb();
                    }
                }
            });
        }

        $scope.host_data = [];
        $scope.service_data = [];
        resourceClass.get({ id: id }).$promise.then(function (response) {
            $scope.cloud = response;
            $scope.title = {
                plural: response.name,
                singular: response.name
            };
            $scope.$root.title = $scope.title;
            updateGraph([
                response.switches.length,
                response.firewalls.length,
                response.load_balancers.length,
                response.servers.length,
                response.vms.length
            ]);

            var stats_promise = $http.get('/rest/v3.1/private_cloud/' + response.uuid + '/health_stats/');
            stats_promise.then(function (response) {
                var data = NagiosService.parseStats(response);
                $scope.host_data = data.host_data;
                $scope.service_data = data.service_data;
            });
            fetch_vlb();
        });

        $scope.proxy_link = function (cloud) {
            if (cloud !== undefined) {
                if (cloud.platform_type === 'VMware') {
                    if (cloud.vcenter_proxy.length > 0) {
                        return cloud.vcenter_proxy[0];
                    }
                } else if (cloud.platform_type === 'OpenStack') {
                    if (cloud.openstack_proxy.length > 0) {
                        return cloud.openstack_proxy[0];
                    }
                }
            }
            return null;
        };
        $scope.getItems = function (item_type) {
            var _m = {
                'servers': Server,
                'vms': VirtualMachine,
                'switches': Switch,
                'firewalls': Firewall,
                'load_balancers': LoadBalancer,
                'virtual_load_balancers': VirtualLoadBalancer
            };
            return new SearchService(_m[item_type]).search;
        };

        $scope.createPrivateCloud = function () {
            $scope.resourceClass = PrivateCloud;
            var modalInstance = $uibModal.open({
                templateUrl: 'privateCloudModal.html',
                controller: 'EditServerModal',
                scope: $scope,
                size: 'md'
            });
            modalInstance.result.then(function () {

            });
        };

        $scope.link = function (cls) {
            $scope.item_type = cls;
            var modalInstance = $uibModal.open({
                templateUrl: TemplateDirectory.modals.privateCloudItem,
                controller: 'AddPrivateCloudItemModalController',
                scope: $scope,
                size: 'md'
            });
            modalInstance.result.then(function (responseData) {
                $scope.cloud = responseData;
            });
        };

        $scope.portSearch = new SearchService(GraphedPort).search;
        $scope.addPort = function () {
            var modalInstance = $uibModal.open({
                templateUrl: TemplateDirectory.modals.cloud.addPortModal,
                controller: 'AddPrivateCloudUpstreamModalController',
                scope: $scope,
                size: 'md'
            });
        };

        var _cloud_url = function (cloud) {
            return '/rest/v3.1/private_cloud/' + cloud.uuid + '/';
        };

        $scope.addVsphereAccess = function (cloud) {
            var config = {
                title: 'Add vCenter',
                fields: [
                    { name: 'hostname', display: 'Hostname' },
                    { name: 'username', display: 'User' },
                    { name: 'password', display: 'Password' }
                ],
                endpoint: '/rest/v3.1/private_cloud/' + cloud.uuid + '/associate_vmware/',
                successFunc: function (response) {
                    AlertService2.success('Associated vCenter.');
                }
            };
            //var modalInstance =
            $uibModal.open({
                templateUrl: TemplateDirectory.modals.simpleModal,
                controller: 'SimpleModalController',
                scope: $scope,
                resolve: {
                    config: function () {
                        return config;
                    }
                },
                size: 'md'
            });
        };

        $scope.linkVlbApi = function (vlb) {
            var config = {
                title: 'Add F5 API',
                fields: [
                    { name: 'hostname', display: 'Hostname' },
                    { name: 'username', display: 'User' },
                    { name: 'password', display: 'Password' }
                ],
                endpoint: vlb.url + 'link_f5/',
                successFunc: function (response) {
                    // update existing obj
                    console.log(vlb);
                    angular.extend(vlb, response.data);
                    console.log(vlb);
                    //
                    AlertService2.success('Linked F5 LB.');
                }
            };
            $uibModal.open({
                templateUrl: TemplateDirectory.modals.simpleModal,
                controller: 'SimpleModalController',
                scope: $scope,
                resolve: {
                    config: function () {
                        return config;
                    }
                },
                size: 'md'
            });
        };

        $scope.linkVlbProxy = function (vlb) {
            var config = {
                title: 'Add F5 VE Reverse Proxy',
                fields: [
                    { name: 'name', display: 'Name' },
                    { name: 'backend_url', display: 'Backend URL' }
                ],
                endpoint: vlb.url + 'configure_proxy/',
                successFunc: function (response) {
                    // update existing obj
                    angular.extend(vlb, response.data);
                    //
                    AlertService2.success('Linked F5 Reverse Proxy.');
                }
            };
            $uibModal.open({
                templateUrl: TemplateDirectory.modals.simpleModal,
                controller: 'SimpleModalController',
                scope: $scope,
                resolve: {
                    config: function () {
                        return config;
                    }
                },
                size: 'md'
            });
        };

        $scope.unlinkVlbProxy = function (vlb) {
            $http.delete(vlb.url + 'deconfigure_proxy/').then(function (response) {
                // patch precisely
                angular.extend(vlb.proxy, response.data.proxy);
                AlertService2.success('Successfully removed proxy config.');
            }).catch(errFunc);
        };

        var errFunc = function (error) {
            AlertService2.danger(error);
        };

        $scope.unlinkVlbApi = function (vlb) {
            $http.post(vlb.url + 'unlink_f5/').then(function (response) {
                angular.extend(vlb, response.data);
                AlertService2.success('Unlinked API.');
            }).catch(errFunc);
        };


        $scope.testVcenter = function (cloud) {
            $http.post('/rest/v3.1/private_cloud/' + cloud.uuid + '/test_vmware/').then(function (response) {
                TaskService2.processTask(response.data.task_id).then(function (response) {
                    AlertService2.success('Connection to VMware was successful.');
                }).catch(function (error) {
                    AlertService2.error('Connection to VMware was successful.');
                });
            }).catch(function (error) {
                AlertService2.danger(error);
            });
        };


        var _link = function (obj, index, cloud, vmwareAction, nameField) {
            $scope.modalTitle = 'Link to ' + obj.name;
            $scope.selectedUnityObject = obj;
            $scope.nameField = nameField;
            $uibModal.open({
                templateUrl: TemplateDirectory.modals.cloud.vmwarePicker,
                controller: 'VmwarePickerController',
                scope: $scope,
                resolve: {
                    request_uri: function () {
                        return [_cloud_url(cloud) + vmwareAction];
                    }
                },
                size: 'md'
            });
        };

        $scope.linkHost = function (server, index, cloud) {
            return _link(server, index, cloud, 'vmware_hosts/', 'hostname');
        };

        $scope.linkVlb = function (vlb, index, cloud) {
            return _link(vlb, index, cloud, 'vmware_vms/', 'name');
        };

        $scope.focusServer = function (server) {
            console.log(server);
        };

        $scope.vlbState = {
            selection: null,
            idx: null
        };

        $scope.vmNetworks = function (vlb) {
            if (vlb && vlb.hasOwnProperty('vmware_vm')) {
                var deviceArray = vlb.vmware_vm.config.config.hardware.device;
                var vNics = deviceArray.filter(function (e, i, arr) {
                    return e._meta === 'vim.vm.device.VirtualE1000' || e._meta === 'vim.vm.device.VirtualVmxnet3';
                });
                return vNics;
            }
            return [];
        };

        $scope.vlbFields = ULDBService2.virtualLoadBalancerExt.fields;

        var showToast = function (message) {
            $mdToast.hide();
            return $mdToast.show(
                $mdToast.simple()
                    .textContent(message)
                    .position('top right')
                    .hideDelay(3000)
                    .parent(document.getElementById('pageview'))

            );
        };

        $scope.refreshVlb = function (vlb, index, cloud) {
            var promise = $http.post(vlb.url + 'refresh_vmware/');
            showToast('Refreshing ' + vlb.name);

            promise.then(function (response) {
                showToast('Successfully refreshed ' + vlb.name);
                angular.extend(vlb, response.data);
            }).catch(function (error) {
                showToast('Could not refresh object.');
            });
        };

        $scope.disassociateVlb = function (vlb, index, cloud) {
            console.log("disc");
        };

        $scope.selectVlb = function (vlb, index) {
            $scope.vlbState.selection = vlb;
            $scope.vlbState.idx = index;
        };

        $scope.deselectVlb = function () {
            $scope.vlbState = {
                selection: null,
                idx: null
            };
        };

        $scope.removePort = function (port, index) {
            $http.post('/rest/v3.1/private_cloud/'
                + $scope.cloud.uuid
                + '/remove_port/', port
            ).then(function (response) {
                angular.extend($scope.cloud, response.data);
                AlertService2.success('Removed port [' + port.switch + ' ' + port.interface_name + ']');
            }).catch(function (error) {
                AlertService2.danger(error);
            });
        };

        $scope.proxyState = {
            embedded: false,
            trust: null
        };
        $scope.embedProxy = function (vlb) {
            $scope.proxyState.trust = trustSrc('https://' + vlb.proxy.proxy_url);
            $scope.proxyState.embedded = true;
        };


        var trustSrc = function (src) {
            return $sce.trustAsResourceUrl(src);
        };

        $scope.clearProxy = function () {
            $scope.proxyState.trust = null;
            $scope.proxyState.embedded = false;
        };
    }
]);


app.controller('CloudVirtualMachineController', [
    '$scope',
    '$http',
    '$uibModal',
    'TemplateDirectory',
    '$window',
    '$routeParams',
    '$timeout',
    'AlertService2',
    'TableHeaders',
    'TaskService2',
    function ($scope, $http, $uibModal, TemplateDirectory, $window, $routeParams, $timeout, AlertService2, TableHeaders, TaskService2) {

        $scope.get_cloud_vms = function () {
            $http.get('/rest/fast/private_cloud/' + $routeParams.id + '/').then(function (response) {

                $scope.cloud_type = response.data.platform_type;

                $scope.title = {
                    plural: response.data.name,
                    singular: response.data.name
                };
                $scope.$root.title = $scope.title;
                if ($scope.cloud_type === 'VMware') {
                    $http({
                        url: '/rest/vmware/migrate/virtual_machines/',
                        method: 'GET',
                        params: {
                            cloud_id: $routeParams.id,
                        },
                    }).then(function (response) {
                        if (response.data.hasOwnProperty('task_id')) {
                            TaskService2.processTask(response.data.task_id, 500).then(function (result) {
                                if (result) {
                                    $http({
                                        url: '/rest/vmware/migrate/',
                                        params: { cloud_id: $routeParams.id, },
                                        method: 'GET',
                                    }).then(function (response) {
                                        $scope.vmware_result = response.data.results;
                                        $scope.vmware_loaded = true;
                                        angular.forEach($scope.vmware_result, function (value, key) {
                                            if (value.state == "poweredOn") {
                                                value.power = true;
                                            }
                                            else {
                                                value.power = false;
                                            }
                                        });
                                    });
                                }

                            }).catch(function (error) {
                                $scope.vmware_result = [];
                                $scope.vmware_loaded = true;
                            });
                        }
                        else {
                            $scope.vmware_result = response.data;
                            $scope.vmware_loaded = true;
                            angular.forEach($scope.vmware_result, function (value, key) {
                                if (value.state == "poweredOn") {
                                    value.power = true;
                                }
                                else {
                                    value.power = false;
                                }
                            });
                        }

                    });
                    $scope.vmware_rows = [
                        { name: 'name', description: "Name", required: true },
                        { name: 'os_name', description: "Operating System", required: true },
                        { name: 'host_name', description: "Host Name", required: true },
                        { name: 'cpu_core', description: "CPU Cores", required: true },
                        { name: 'vcpus', description: "vCPUs", required: true },
                        { name: 'guest_memory', description: "Memory", required: true },
                        { name: 'management_ip', description: "Management IP", required: true },
                        { name: 'state', description: "Power State", required: true },
                    ];
                }
                else if ($scope.cloud_type === 'OpenStack') {
                    $http({
                        url: '/rest/openstack/migration/' + $routeParams.id + '/virtual_machines/',
                        method: 'GET',
                    }).then(function (response) {
                        if (response.data.hasOwnProperty('task_id')) {
                            TaskService2.processTask(response.data.task_id, 500).then(function (result) {

                                if (result) {
                                    $http({
                                        url: '/rest/openstack/migration/',
                                        params: { cloud_id: $routeParams.id, },
                                        method: 'GET',
                                    }).then(function (response) {
                                        $scope.openstack_result = response.data.results;
                                        $scope.openstack_loaded = true;
                                        angular.forEach($scope.openstack_result, function (value, key) {
                                            // console.log("Value :"+angular.toJson(value));
                                            if (value.last_known_state == "ACTIVE") {
                                                value.power = true;
                                            }
                                            else {
                                                value.power = false;
                                            }
                                        });
                                    });
                                }
                            }).catch(function (error) {
                                $scope.openstack_result = [];
                                $scope.openstack_loaded = true;
                            });
                        }
                        else {
                            $scope.openstack_result = response.data;
                            $scope.openstack_loaded = true;
                            angular.forEach($scope.openstack_result, function (value, key) {
                                // console.log("Value :"+angular.toJson(value));
                                if (value.last_known_state == "ACTIVE") {
                                    value.power = true;
                                }
                                else {
                                    value.power = false;
                                }
                            });
                        }

                    });
                    $scope.openstack_rows = [
                        { name: 'name', description: "Name", required: true },
                        { name: 'os_id', description: "ID", required: true },
                        { name: 'vcpu', description: "vCPUs", required: true },
                        { name: 'memory', description: "Memory (MB)", required: true },
                        { name: 'disk', description: "Disk (GB)", required: true },
                        { name: 'operating_system', description: "Image", required: true },
                        { name: 'ip_address', description: "IP Address", required: true },
                        { name: 'management_ip', description: "Management IP", required: true },
                        { name: 'last_known_state', description: "Power State", required: true }
                    ];
                }

                else {
                    AlertService2.danger('No Records !!');
                }

            });
        };

        $scope.get_cloud_vms();

        $scope.powerOn = function (index, cloud_type) {
            $scope.loader = true;
            var endpoint = null;
            if (cloud_type === "VMware") {
                endpoint = '/rest/vmware/migrate/power_on/';
            }
            else if (cloud_type === "OpenStack") {
                endpoint = '/rest/openstack/migration/power_on/';
            }
            else {
                endpoint == null;
            }
            return $http({
                url: endpoint,
                data: { 'vm_id': index, 'cloud_uuid': $routeParams.id },
                method: 'POST',
            }).then(function (response) {
                $scope.get_cloud_vms();
                $scope.loader = false;
                AlertService2.success("VM Powered On");
            });
        };

        $scope.powerOff = function (index, cloud_type) {
            $scope.loader = true;
            var endpoint = null;
            if (cloud_type === "VMware") {
                endpoint = '/rest/vmware/migrate/power_off/';
            }
            else if (cloud_type === "OpenStack") {
                endpoint = '/rest/openstack/migration/power_off/';
            }
            else {
                endpoint == null;
            }
            return $http({
                url: endpoint,
                data: { 'vm_id': index, 'cloud_uuid': $routeParams.id },
                method: 'POST',
            }).then(function (response) {
                $scope.get_cloud_vms();
                $scope.loader = false;
                AlertService2.success("VM Powered Off");
            });
        };


        $scope.console_vm = function (instance_id, cloud_type) {
            // AlertService2.danger('Coming soon....');

            // console.log('Coming soon....')
            var endpoint = null;
            if (cloud_type === "VMware") {
                endpoint = '/admin#/vmware-vm/webconsole/iframe/';
            }
            else if (cloud_type === "OpenStack") {
                endpoint = '/admin#/openstack-vm/webconsole/iframe/';
            }
            else {
                endpoint == null;
            }
            $window.location.href = endpoint + instance_id;
            $window.location.reload();

        };

        $scope.addManagementIPAddress = function (selection, instance_id, cloud_type) {
            var config = {
                title: 'Add Management IP Address',
                cloud_id: $routeParams.id,
                instance_id: instance_id,
                fields: [
                    { name: 'management_ip', display: 'Management IP Address', err_msg: 'management_ipMsg' }
                ],
                endpoint: '',
                successFunc: function (response) {
                    AlertService2.success('Associated Management IP.');
                }
            };

            if (cloud_type === "VMware") {
                config.endpoint = '/rest/vmware/migrate/' + instance_id;
            }
            else if (cloud_type === "OpenStack") {
                config.endpoint = '/rest/openstack/migration/' + instance_id;
            }
            else {
                config.endpoint = null;
            }
            //var modalInstance =
            $uibModal.open({
                templateUrl: TemplateDirectory.modals.simpleModal,
                controller: 'AddManagementIpAddressModalController',
                scope: $scope,
                resolve: {
                    config: function () {
                        return config;
                    }
                },
                size: 'md'
            });
        };

        $scope.disableVisibility = function (index, cloud_type) {
            console.log("Called disable Visbility ");
            var endpoint = null;
            if (cloud_type === "VMware") {
                endpoint = '/rest/vmware/migrate/disable_vm/';
            }
            else if (cloud_type === "OpenStack") {
                endpoint = '/rest/openstack/migration/disable_vm/';
            }
            else {
                endpoint = null;
            }

            $scope.loader = true;
            return $http({
                url: endpoint,
                data: { 'vm_id': index, 'cloud_uuid': $routeParams.id },
                method: 'POST',
            }).then(function (response) {
                $scope.get_cloud_vms();
                $scope.loader = false;
                AlertService2.success("VM disabled for customer console");
            });
        };

        $scope.enableVisibility = function (index, cloud_type) {
            console.log("Called enable Visbility ");
            var endpoint = null;
            if (cloud_type === "VMware") {
                endpoint = '/rest/vmware/migrate/enable_vm/';
            }
            else if (cloud_type === "OpenStack") {
                endpoint = '/rest/openstack/migration/enable_vm/';
            }
            else {
                endpoint = null;
            }

            $scope.loader = true;
            return $http({
                url: endpoint,
                data: { 'vm_id': index, 'cloud_uuid': $routeParams.id },
                method: 'POST',
            }).then(function (response) {
                $scope.get_cloud_vms();
                $scope.loader = false;
                AlertService2.success("VM enabled for customer console");
            });
        };

    }
]);

app.controller('BackupHistoryController', [
    '$scope',
    '$uibModalInstance',
    '$http',
    '$routeParams',
    'AlertService2',
    function ($scope, $uibModalInstance, $http, $routeParams, AlertService2) {
        $scope.cancel = function () {
            $uibModalInstance.dismiss();
        };

        $scope.noRecordsFoundMsg = function () {
            if ($scope.backup_history.length === 0) {
                $scope.backup_history_message = 'No records found';
            }
        };

        if ($scope.backup_type == "OpenStack") {
            $http.get('/rest/v3/vm_backup/' + $scope.backup_id + '/openstack_backup_history/').then(function (result) {
                console.log("OpenStack:" + result);
                $scope.backup_history = result.data.openstack_backup_list;
                $scope.noRecordsFoundMsg();
            });
        }
        else {
            $http.get('/rest/vmware/migrate/' + $scope.backup_id + '/vmware_backup_history/').then(function (result) {
                console.log("Vmware" + JSON.stringify(result));
                $scope.backup_history = result.data.vmware_backup_list;
                $scope.noRecordsFoundMsg();
            });
        }

    }
]);

app.controller('VmMigrationController', [
    '$scope',
    '$http',
    '$uibModal',
    'OrganizationFast',
    'AlertService2',
    'TableHeaders',
    'TaskService2',
    function ($scope, $http, $uibModal, OrganizationFast, AlertService2, TableHeaders, TaskService2) {

        var getParamsObj = function () {
            var urlObj = {};
            urlObj.cloud_id = $scope.uuid;
            return urlObj;
        };

        $scope.getOrgs = function (val) {
            return OrganizationFast.query({ 'search': val }).$promise.then(function (response) {
                return response.results;
            });
        };

        $scope.getClouds = function (org) {
            $scope.org_id = org.id;
            $scope.cloud_list = [];
            $http.get('/rest/fast/private_cloud/?org_id=' + org.id).success(function (response) {
                $scope.cloud_list.length = 0;
                angular.forEach(response.results, function (value, key) {
                    $scope.cloud_list.push({ short: { uuid: value.uuid, platform_type: value.platform_type }, long: value.name });
                });
                // Load the page with first found cloud
                if ($scope.cloud_list.length > 0) {
                    $scope.cloud_list_select = $scope.cloud_list[0];
                    $scope.load_vm_list($scope.cloud_list_select);
                }
                else {
                    $scope.show_empty_message();
                    AlertService2.danger('No Cloud records found');
                }
            })
                .error(function (response) {
                    AlertService2.danger(response);
                });
        };

        $scope.load_vm_list = function (data) {
            $scope.virtual_machines = '';
            $scope.vm_list_message = '';
            $scope.uuid = data.short.uuid;
            $scope.get_vm_migrations(data.short);
        };

        $scope.show_empty_message = function () {
            $scope.virtual_machines = '';
            $scope.vm_list_message = 'No records to display';
        };

        $scope.get_migrations_from_db = function () {
            $http({
                url: $scope.apiurl,
                params: getParamsObj(),
                method: 'GET',
            }).then(function (response) {
                $scope.virtual_machines = response.data.results; //VM Migration related VMs
                if ($scope.virtual_machines.length === 0) {
                    $scope.vm_list_message = 'No records to display';
                }

            });
        };


        $scope.get_vm_migrations = function (selection) {
            if (selection.platform_type === 'VMware') {
                $scope.vmware_loaded = false;
                $http({
                    url: '/rest/vmware/migrate/virtual_machines/',
                    method: 'GET',
                    params: {
                        'cloud_id': $scope.uuid
                    },
                }).then(function (response) {
                    if (response.data.hasOwnProperty('task_id')) {
                        TaskService2.processTask(response.data.task_id, 500).then(function (result) {
                            $scope.apiurl = '/rest/vmware/migrate/';
                            $scope.get_migrations_from_db();
                        }).catch(function (error) {
                            $scope.virtual_machines = []; //VM Migration related VMs
                            console.log(error);
                            AlertService2.danger('Error in fetching virtual machine data');
                        });
                    }
                    else {
                        $scope.virtual_machines = [];
                        if ($scope.virtual_machines.length == 0) {
                            $scope.vm_list_message = 'No records to display';
                        }
                    }
                });
                $scope.vmware_loaded = true;
                $scope.vm_headers = TableHeaders.vmware_migration_headers;
            }
            else if (selection.platform_type === 'OpenStack') {
                $scope.openstack_loaded = false;
                $http({
                    url: '/rest/openstack/migration/' + selection.uuid + '/virtual_machines/',
                    method: 'GET',
                }).then(function (response) {
                    if (response.data.hasOwnProperty('task_id')) {
                        TaskService2.processTask(response.data.task_id, 500).then(function (result) {
                            $scope.apiurl = '/rest/openstack/migration/';
                            $scope.get_migrations_from_db();
                        }).catch(function (error) {
                            $scope.virtual_machines = []; //VM Migration related VMs
                            console.log(error);
                            AlertService2.danger('Error in fetching virtual machine data');
                        });
                    }
                    else {
                        $scope.virtual_machines = [];
                        if ($scope.virtual_machines.length == 0) {
                            $scope.vm_list_message = 'No records to display';
                        }
                    }
                });
                $scope.openstack_loaded = true;
                $scope.vm_headers = TableHeaders.openstack_migration_headers;
            }
            else {

                // $scope.vm_migrate_show = false;
                $scope.migrate_instance_unsupported = "This feature is not available for " + selection.platform_type + " Cloud";
                AlertService2.danger($scope.migrate_instance_unsupported);
                $scope.vm_list_message = "This feature is not available for " + selection.platform_type + " Cloud";
                $scope.virtual_machines = [];
            }
        };

        $scope.awsAccountSelection = function () {
            var modalInstance = $uibModal.open({
                templateUrl: 'awsAccountSelection.html',
                scope: $scope,
                size: 'md',
                controller: 'MigartionAwsAccountSelectionController'
            });
            modalInstance.result.then();
        };

        $scope.clear_account_selectbox = function () {
            $scope.azure_account_list = [];
            $scope.azure_resource_list = [];
            $scope.azure_storage_list = [];
            $scope.azure_container_list = [];
            $scope.aws_account_list = [];
            $scope.aws_region_list = [];
            $scope.aws_region_data = [];
            $scope.aws_bucket_list = [];
        };

        $scope.vm_migration_params = {};
        $scope.cloud_type = '';

        $scope.loadAwsRegionList = function (data) {
            $scope.aws_region_list = [];
            angular.forEach($scope.aws_region_data, function (value, key) {
                if (value.account == data.short) {
                    angular.forEach(value.region, function (item, index) {
                        $scope.aws_region_list.push({ long: item, short: item, account: value.account });
                    });
                }
            });
        };

        $scope.loadAwsBucketList = function (data) {
            $http.get('/customer/aws/' + data.account + '/region/' + data.short + '/s3_bucket/').then(function (response) {
                $scope.aws_bucket_list = [];
                angular.forEach(response.data.Buckets, function (value, key) {
                    $scope.aws_bucket_list.push({ long: value.Name, short: value.Name });
                });
            });
        };

        $scope.migrate_vm_to_aws = function (vm_id, vm_name, cloud_type, target_type, power_state, index) {
            //TODO remove it with modal after demo

            $scope.clear_account_selectbox();
            var account_data = [];
            $scope.cloud_type = cloud_type;
            $scope.vm_migration_params['vm_id'] = vm_id;
            $scope.vm_migration_params['target_type'] = target_type;

            if (target_type == 'AWS') {
                if ((cloud_type === 'vmware' && power_state === 'poweredOff') || (cloud_type == 'openstack' && power_state === 'SHUTOFF')) {
                    $http.get('/rest/v3/aws/?org_id=' + $scope.org_id).then(function (response) {
                        $scope.aws_region_data = [];
                        $scope.aws_account_list = [];
                        angular.forEach(response.data.results, function (value, key) {
                            $scope.aws_account_list.push({ long: value.aws_user + ' -- ' + value.account_name, short: value.id });
                            $scope.aws_region_data.push({ account: value.id, region: value.region });
                        });
                        // if ($scope.aws_account_list.length == 1) {
                        //     $scope.selected_aws_account = $scope.aws_account_list[0];
                        // }

                    });
                    $scope.awsAccountSelection();

                }
                else {
                    AlertService2.danger("Please power off " + vm_name + " to initiate VM migration");
                }
            }
        };

        $scope.migrate_openstack_to_aws = function (account) {

            //small wait so that celery updates the status of tasks
            $http.post('/rest/openstack/migration/vm_migrate/', {
                "vm_id": $scope.vm_migration_params['vm_id'],
                'target_type': $scope.vm_migration_params['target_type'],
                "cloud_uuid": $scope.uuid,
                "account": account
            }).success(function (response) {
                AlertService2.success("VM back up Process Initiated. Process will take a while");
                // AlertService2.success("VM backup image stored successfully in "+target_type+" storage ");
            }).error(function (error, status) {
                console.log("Failed while downloading VM snapshot" + status);
                // console.log(error);
                AlertService2.danger(error);
                // if (status != 504) {
                //     AlertService2.danger("Failed while downloading VM image" + error);
                //     $scope.get_vm_snapshots();
                // }

            });

        };

        $scope.migrate_vmware_to_aws = function (account) {

            $http.post('/rest/vmware/migrate/vm_migrate/', {
                "vm_id": $scope.vm_migration_params['vm_id'],
                'target_type': $scope.vm_migration_params['target_type'],
                "cloud_uuid": $scope.uuid,
                "account": account
            }).success(function (response) {

                // console.log("VM migration initiated successfully "+response)
                AlertService2.success('VM migration initiated successfully. Process will take a while.');
            })
                .error(function (response) {
                    // console.log("Failed while migrating VM to AWS : "+angular.toJson(response));
                    // AlertService2.danger('Failed while migrating VM to AWS : ');
                    AlertService2.danger(response);
                });
        };

    }
]);


// Temporary controller until we have a real way of listing all VMs
// For now this offers only the first private clouds backups.
app.controller('VmBackupController', [
    '$scope',
    '$http',
    '$location',
    'OrganizationFast',
    '$timeout',
    '$uibModal',
    'AlertService2',
    'TableHeaders',
    'TaskService2',
    function ($scope, $http, $location, OrganizationFast, $timeout, $uibModal,
        AlertService2, TableHeaders, TaskService2) {

        var status_dict = {
            'IN': 'In-Progress',
            'C': 'Completed',
            'NA': 'N/A',
            'F': 'Failed'
        };

        $scope.getOrgs = function (val) {
            return OrganizationFast.query({ 'search': val }).$promise.then(function (response) {
                return response.results;
            });
        };

        $scope.getClouds = function (org) {
            $scope.cloud_list = [];
            $http.get('/rest/fast/private_cloud/?org_id=' + org.id).success(function (response) {
                $scope.cloud_list.length = 0;
                angular.forEach(response.results, function (value, key) {
                    $scope.cloud_list.push({ short: { uuid: value.uuid, platform_type: value.platform_type }, long: value.name });
                });
                // Load the page with first found cloud
                if ($scope.cloud_list.length > 0) {
                    $scope.cloud_list_select = $scope.cloud_list[0];
                    $scope.load_vm_list($scope.cloud_list_select);
                }
                else {
                    $scope.show_empty_message();
                    AlertService2.danger('No Cloud records found');
                }
            })
                .error(function (response) {
                    AlertService2.danger(response);
                });
        };

        // $scope.vm_snapshots = [];
        // $scope.vm_list_message = '';
        // // var uuid = $scope.uuid;
        // // temporary method to get uuid for this view
        // $scope.cloud_list = [];
        // $http.get('/rest/v3.1/private_cloud/').then(function (response) {
        //     $scope.cloud_list.length = 0;
        //     angular.forEach(response.data.results, function (value, key) {
        //         $scope.cloud_list.push({ short: value.uuid, long: value.name });
        //     });
        //     // Load the page with first found cloud
        //     if ($scope.cloud_list.length > 0) {
        //         $scope.cloud_list_select = $scope.cloud_list[0];
        //         $scope.load_vm_list($scope.cloud_list_select);
        //     }
        //     else {
        //         AlertService2.danger('No Cloud records found');
        //     }

        // });

        $scope.load_vm_list = function (data) {
            $scope.vm_snapshots = '';
            $scope.vm_list_message = '';
            $scope.uuid = data.short.uuid;
            $scope.get_vm_snapshots(data.short);
        };

        $scope.show_empty_message = function () {
            $scope.vm_snapshots = [];
            $scope.vm_list_message = 'No records to display';
        };

        var getParamsObj = function () {
            var urlObj = {};
            urlObj.cloud_id = $scope.uuid;
            return urlObj;
        };

        $scope.get_vms_from_db = function () {
            $http({
                url: $scope.apiurl,
                params: getParamsObj(),
                method: 'GET',
            }).then(function (response) {
                $scope.vm_snapshots = response.data.results; //VM Migration related VMs
                if ($scope.vm_snapshots.length === 0) {
                    $scope.show_empty_message();
                }
                else {
                    angular.forEach($scope.vm_snapshots, function (value, key) {
                        value.back_up_status = status_dict[value.back_up_status];
                    });

                }
            });
        };


        $scope.get_vm_snapshots = function (selection) {
            if (selection.platform_type === 'VMware') {
                $http({
                    url: '/rest/vmware/migrate/virtual_machines/',
                    method: 'GET',
                    params: {
                        'cloud_id': $scope.uuid
                    }
                }).then(function (response) {
                    if (response.data.hasOwnProperty('task_id')) {
                        TaskService2.processTask(response.data.task_id, 500).then(function (result) {
                            $scope.apiurl = '/rest/vmware/migrate/';
                            $scope.get_vms_from_db();
                        }).catch(function (error) {
                            $scope.show_empty_message(); // VM Backup related VMs
                        });
                    }
                    else {
                        $scope.vm_snapshots = [];
                        $scope.show_empty_message();
                    }
                });
                $scope.vm_backup_headers = TableHeaders.vmware_vm_headers;
            }
            else if (selection.platform_type === 'OpenStack') {
                $http({
                    url: '/rest/v3/vm_backup/get_vm_list/',
                    method: 'GET',
                    params: { cloud_id: selection.uuid }
                }).then(function (response) {
                    if (response.data.hasOwnProperty('task_id')) {
                        TaskService2.processTask(response.data.task_id, 500).then(function (result) {
                            $scope.apiurl = '/rest/openstack/migration/';
                            $scope.get_vms_from_db();
                            // angular.forEach($scope.vm_snapshots, function (value, key) {
                            //     value.back_up_status = status_dict[value.backup_status];
                            // });
                            console.log("$scope.vm_snapshots", $scope.vm_snapshots);
                        });

                    }
                }).catch(function (error) {
                    console.log(error.message);
                    $scope.show_empty_message();
                });
                $scope.vm_backup_headers = TableHeaders.openstack_vm_headers;
            }
            else {

                $scope.backup_instance_show = false;
                $scope.vm_snapshots = [];
                $scope.backup_instance_unsupported = "This feature is not available for " + selection.platform_type + " Cloud";
                AlertService2.danger($scope.backup_instance_unsupported);
                $scope.vm_list_message = "This feature is not available for " + selection.platform_type + " Cloud";
            }

        };

        // $scope.get_vm_snapshots();


        $scope.backupOpenStackVm = function (vm_id, target_type, index) {
            //TODO remove it with modal after demo
            $scope.clear_account_selectbox();
            var account_data = [];
            $scope.cloud_type = 'openstack';
            $scope.openstack_backup_params['vm_id'] = vm_id;
            $scope.openstack_backup_params['target_type'] = target_type;

            if (target_type == 'AWS') {
                $http.get('/rest/v3/aws/').then(function (response) {
                    $scope.aws_region_data = [];
                    $scope.aws_account_list = [];
                    angular.forEach(response.data.results, function (value, key) {
                        $scope.aws_account_list.push({ long: value.aws_user + ' -- ' + value.account_name, short: value.id });
                        $scope.aws_region_data.push({ account: value.id, region: value.region });
                    });
                    console.log($scope.aws_account_list);
                    if ($scope.aws_account_list.length == 1) {
                        console.log('nitin');
                        $scope.request.aws_account_list = $scope.aws_account_list;
                    }

                });
                $scope.awsAccountSelection();
            }
            if (target_type == 'Azure') {
                $http.get('/rest/v3/azure/').then(function (response) {
                    $scope.azure_account_list = [];
                    angular.forEach(response.data.results, function (value, key) {
                        $scope.azure_account_list.push({
                            long: value.account_name + '  ' + value.subscription_id, short: value.id,
                            subscription: value.subscription_id
                        });
                    });
                });
                $scope.azureAccountSelection();
            }


        };

        //below scope variables are used in selectboxes for the aws & azure account selection window
        $scope.clear_account_selectbox = function () {
            $scope.azure_account_list = [];
            $scope.azure_resource_list = [];
            $scope.azure_storage_list = [];
            $scope.azure_container_list = [];
            $scope.aws_account_list = [];
            $scope.aws_region_list = [];
            $scope.aws_region_data = [];
            $scope.aws_bucket_list = [];
        };

        $scope.loadAzureResourceList = function (data) {
            $http.get('/rest/v3/azure/' + data.short + '/resource_group/').then(function (response) {
                $scope.azure_resource_list = [];
                angular.forEach(response.data, function (value, key) {
                    $scope.azure_resource_list.push({ long: value.name, short: value.name, account: data.short });
                });
            });
        };


        $scope.loadAzureStorageList = function (data) {
            $http.get('/rest/v3/azure/' + data.account + '/resource_group/' + data.short + '/storage_account/').then(function (response) {
                $scope.azure_storage_list = [];
                angular.forEach(response.data, function (value, key) {
                    if (value.provisioning_state == 'Succeeded' && value.kind == 'BlobStorage') {
                        $scope.azure_storage_list.push({
                            long: value.name + ' - ' + value.kind,
                            short: value.name,
                            resourcegroup: data.short,
                            account: data.account
                        });
                    }
                });
            });
        };

        $scope.loadAzureContainerList = function (data) {
            $http.get('/rest/v3/azure/' + data.account + '/resource_group/' + data.resourcegroup + '/' + data.short + '/blob/').then(function (response) {
                $scope.azure_container_list = [];
                angular.forEach(response.data, function (value, key) {
                    $scope.azure_container_list.push({ long: value.name, short: value.name });
                });
            });
        };

        $scope.loadAwsRegionList = function (data) {
            $scope.aws_region_list = [];
            angular.forEach($scope.aws_region_data, function (value, key) {
                if (value.account == data.short) {
                    angular.forEach(value.region, function (item, index) {
                        $scope.aws_region_list.push({ long: item, short: item, account: value.account });
                    });
                }
            });
        };

        $scope.loadAwsBucketList = function (data) {
            $http.get('/rest/v3/aws/' + data.account + '/region/' + data.short + '/s3_bucket/').then(function (response) {
                $scope.aws_bucket_list = [];
                angular.forEach(response.data.Buckets, function (value, key) {
                    $scope.aws_bucket_list.push({ long: value.Name, short: value.Name });
                });
            });
        };

        $scope.vmbackup_params = {};
        $scope.openstack_backup_params = {};

        $scope.vmwareBackup = function (account) {

            //small wait so that celery updates the status of tasks
            // $timeout(function () {
            //     $scope.get_vm_snapshots();
            // }, 5000);
            AlertService2.success("VM back up Process Initiated. Process will take a while");
            $http.post('/rest/vmware/migrate/vmware_vm_backup/', {
                "instance_id": $scope.vmbackup_params['vm_id'],
                'target_type': $scope.vmbackup_params['target_type'], "cloud_uuid": $scope.uuid, "account": account
            }).success(function (response) {
                // AlertService2.success("VM backup image stored successfully in "+target_type+" storage ");
                AlertService2.success("VM back up Process Initiated. Process will take a while");
                $scope.get_vm_snapshots();
            })
                .error(function (error, status) {

                    AlertService2.danger(error);
                    // if (status != 504) {
                    //     AlertService2.danger("Failed while downloading VM image" + error);
                    //     $scope.get_vm_snapshots();
                    // }

                });
        };

        $scope.openstackBackup = function (account) {

            AlertService2.success("VM back up Process Initiated. Process will take a while");
            //small wait so that celery updates the status of tasks
            $timeout(function () {
                $scope.get_vm_snapshots();
            }, 5000);
            $http.post('/rest/v3/vm_backup/download_vm_snapshots/', {
                "vm_id": $scope.openstack_backup_params['vm_id'],
                'target_type': $scope.openstack_backup_params['target_type'], "cloud_uuid": $scope.uuid, "account": account
            }).success(function (response) {
                // AlertService2.success("VM backup image stored successfully in "+target_type+" storage ");
            })
                .error(function (error, status) {
                    console.log("Failed while downloading VM snapshot" + status);
                    AlertService2.danger(error);
                    // if (status != 504) {
                    //     AlertService2.danger("Failed while downloading VM image" + error);
                    //     $scope.get_vm_snapshots();
                    // }

                });

        };

        $scope.backupVMWareVm = function (vm_id, target_type, index) {
            $scope.clear_account_selectbox();
            var account_data = [];
            $scope.cloud_type = 'vmware';
            $scope.vmbackup_params['vm_id'] = vm_id;
            $scope.vmbackup_params['target_type'] = target_type;

            if (target_type == 'AWS') {
                $http.get('/rest/v3/aws/').then(function (response) {
                    $scope.aws_account_list = [];
                    $scope.aws_region_data = [];

                    angular.forEach(response.data.results, function (value, key) {
                        $scope.aws_account_list.push({ long: value.aws_user + ' -- ' + value.account_name, short: value.id });
                        $scope.aws_region_data.push({ account: value.id, region: value.region });
                    });
                });
                $scope.awsAccountSelection();
            }
            if (target_type == 'Azure') {
                $http.get('/rest/v3/azure/').then(function (response) {
                    $scope.azure_account_list = [];
                    angular.forEach(response.data.results, function (value, key) {
                        $scope.azure_account_list.push({
                            long: value.account_name + '  ' + value.subscription_id, short: value.id,
                            subscription: value.subscription_id
                        });
                    });
                });
                $scope.azureAccountSelection();
            }

        };

        $scope.backupHistory = function (backup_id, backup_type, index) {
            $scope.backup_id = backup_id;
            $scope.backup_type = backup_type;
            var modalInstance = $uibModal.open({
                templateUrl: 'backupHistory.html',
                scope: $scope,
                size: 'md',
                controller: 'BackupHistoryController'
            });
            modalInstance.result.then();
            // AlertService2.success("Backup History will be available very soon.");
        };


        $scope.awsAccountSelection = function () {
            var modalInstance = $uibModal.open({
                templateUrl: 'awsAccountSelection.html',
                scope: $scope,
                size: 'md',
                controller: 'AwsAccountSelectionController'
            });
            modalInstance.result.then();
        };

        $scope.azureAccountSelection = function () {
            var modalInstance = $uibModal.open({
                templateUrl: 'azureAccountSelection.html',
                scope: $scope,
                size: 'md',
                controller: 'AzureAccountSelectionController'
            });
            modalInstance.result.then();
        };

        $scope.powerOffVm = function (vm_name, index) {
            AlertService2.danger("You need to power off VM " + vm_name + " to enable migration.");
            // alert("Please power off VM "+vm_name+" to migrate it to AWS");
        };
    }
]);


app.controller('AwsAccountSelectionController', [
    '$scope',
    '$uibModalInstance',
    '$http',
    '$routeParams',
    'AlertService2',
    'TaskService2',
    function ($scope, $uibModalInstance, $http, $routeParams, AlertService2, TaskService2) {
        $scope.create = function (request) {
            //console.log(request);
            if ($scope.cloud_type == 'openstack') {
                $scope.openstackBackup(request);
            } else if ($scope.cloud_type == 'vmware') {
                $scope.vmwareBackup(request);
            }
            $scope.cancel();
        };
        $scope.cancel = function () {
            $uibModalInstance.dismiss();
        };
    }
]);


app.controller('AzureAccountSelectionController', [
    '$scope',
    '$uibModalInstance',
    '$http',
    '$routeParams',
    'AlertService2',
    'TaskService2',
    function ($scope, $uibModalInstance, $http, $routeParams, AlertService2, TaskService2) {
        $scope.create = function (request) {
            //console.log(request);
            if ($scope.cloud_type == 'openstack') {
                $scope.openstackBackup(request);
            } else if ($scope.cloud_type == 'vmware') {
                $scope.vmwareBackup(request);
            }
            $scope.cancel();
        };
        $scope.cancel = function () {
            $uibModalInstance.dismiss();
        };
    }
]);

app.controller('DBInstanceController', [
    '$scope',
    '$http',
    '$routeParams',
    'OrganizationFast',
    'AlertService2',
    '$uibModal',
    'PrivateCloud',
    'TaskService2',
    function ($scope, $http, $routeParams, OrganizationFast, AlertService2, $uibModal, PrivateCloud, TaskService2) {

        $scope.getOrgs = function (val) {
            return OrganizationFast.query({ 'search': val }).$promise.then(function (response) {
                return response.results;
            });
        };

        $scope.getClouds = function (org) {
            $scope.cloud_list = [];
            $scope.org_id = org.id;
            $http.get('/rest/fast/private_cloud/?org_id=' + org.id).success(function (response) {
                $scope.cloud_list.length = 0;
                angular.forEach(response.results, function (value, key) {
                    $scope.cloud_list.push({ short: { uuid: value.uuid, platform_type: value.platform_type }, long: value.name });
                });
                // Load the page with first found cloud
                if ($scope.cloud_list.length > 0) {
                    $scope.cloud_list_select = $scope.cloud_list[0];
                    $scope.load_db_instance($scope.cloud_list_select);
                }
                else {
                    $scope.show_empty_message();
                    AlertService2.danger('No Cloud records found');
                }
            })
                .error(function (response) {
                    AlertService2.danger(response);
                });
        };

        $scope.show_empty_message = function () {
            $scope.db_instances = '';
            $scope.db_instance_message = 'No records to display';
        };


        $scope.load_db_instance = function (data) {
            $scope.db_instances = '';
            $scope.db_instance_message = '';
            $scope.uuid = data.short.uuid;
            $scope.get_database_instances(data.short);
        };

        var getParamsObj = function () {
            var urlObj = {};
            urlObj.cloud_id = $scope.uuid;
            return urlObj;
        };


        $scope.get_database_instances_from_db = function () {
            $http({
                url: '/rest/vmware/db_instance/',
                params: getParamsObj(),
                method: 'GET',
            }).then(function (response) {
                $scope.db_instances = response.data.results; //VM Migration related VMs
                if ($scope.db_instances.length === 0) {
                    $scope.show_empty_message();
                }
            }).catch(function (error) {
                $scope.db_instances.count = 0;
                $scope.db_instances.results = { length: 0 };
                AlertService2.danger("Error in loading DB Instances");
                $scope.db_instance_unsupported = "No DB Instance Available";

            });
        };


        $scope.get_database_instances = function (selection) {
            if (selection.platform_type === 'VMware') {
                $http({
                    url: '/rest/vmware/db_instance/populate_database_instance_list',
                    method: "GET",
                    params: { cloud_id: selection.uuid }
                }).then(function (response) {

                    if (response.data.hasOwnProperty('task_id')) {
                        TaskService2.processTask(response.data.task_id, 500).then(function (result) {
                            $scope.get_database_instances_from_db();

                        }).catch(function (error) {
                            $scope.db_instance_message = "No DB Instance Available";
                        });
                    }
                    else {
                        $scope.db_instances = response.data;
                    }
                });
            }
            else {
                AlertService2.danger("This feature is not available for " + selection.platform_type + " Cloud");
                $scope.db_instance_message = "This feature is not available for " + selection.platform_type + " Cloud";
            }
        };

        $scope.reload_data = function (response) {
            $scope.db_instances = response;
        };

        $scope.createDbInstance = function () {
            var modalInstance = $uibModal.open({
                templateUrl: 'createDbInstance.html',
                scope: $scope,
                size: 'md',
                controller: 'CreateDBInstanceController'
            });
            modalInstance.result.then();
        };
    }
]);


app.controller('CreateDBInstanceController', [
    '$scope',
    '$uibModalInstance',
    '$http',
    '$routeParams',
    'AlertService2',
    'TaskService2',
    function ($scope, $uibModalInstance, $http, $routeParams, AlertService2, TaskService2) {
        $scope.create = function (request) {
            request.cloud = $scope.selected_cloud_uuid;

            // console.log("===>"+angular.toJson($scope.db_instances));
            $http.post("/rest/vmware/db_instance/", request).
                then(function (response) {
                    $uibModalInstance.close();
                    AlertService2.success("DB instance deployment is initializing.");
                    if (response.data.hasOwnProperty('task_id')) {
                        // TaskService2.processTask(response.data.task_id, 500).then(function (result) {
                        //     $scope.get_database_instances($scope.selected_cloud_uuid);
                        // )}
                        // $scope.get_database_instances($scope.selected_cloud_uuid);
                    }
                    else {
                        // $scope.get_database_instances($scope.selected_cloud_uuid);
                        // console.log("Response :"+angular.toJson(response));
                        $scope.reload_data(response.data);
                    }
                })
                .catch(function (error) {
                    AlertService2.danger("Error occured while creating db instance." + JSON.stringify(error));
                    console.log(JSON.stringify(error));
                });
        };
        $scope.cancel = function () {
            $uibModalInstance.dismiss();
        };
    }
]);

app.controller('DevOpsScriptsController', [
    '$scope',
    '$http',
    '$uibModal',
    'Upload',
    'DTOptionsBuilder',
    'AbstractControllerFactory2',
    function ($scope, $http, $uibModal, Upload, DTOptionsBuilder, AbstractControllerFactory2) {
        $scope.error = null;

        $scope.script_types = ['Ansible Playbook', 'Terraform Script', 'Bash Script', 'Python Script', 'Powershell Script'];
        $scope.obj = {};

        $scope.get_scripts = function () {
            $http.get('/rest/orchestration/admin_scripts/').then(function (res) {
                $scope.devops_scripts = res.data;
            });
        }
        $scope.get_scripts();

        $scope.add = function () {
            $scope.error = null;
            $scope.method = 'Add';
            $scope.obj = {};
            modalInstance = $uibModal.open({
                templateUrl: 'scriptCRUD.html',
                scope: $scope,
                size: 'md'
            });
            modalInstance.result.then();
        };

        var onSubmitAdd = function (script_file) {
            if (!script_file) {
                $scope.error = "Please select all mandatory fields"
                return;
            }
            var formData = Object.assign({ script_file: script_file }, $scope.obj);
            Upload.upload({
                url: '/rest/orchestration/admin_scripts/',
                method: 'POST',
                data: formData
            }).then(function (response) {
                $scope.get_scripts();
                $scope.cancel();
            }, function (error) {
                if (error.data && error.data.detail) {
                    $scope.error = error.data.detail;
                }
                console.error('Error', error);
            });
        }

        $scope.edit = function (script) {
            $scope.error = null;
            $scope.method = 'Edit';
            $scope.obj = Object.assign({}, { id: script.uuid, name: script.name, description: script.description, script_type: script.script_type });
            modalInstance = $uibModal.open({
                templateUrl: 'scriptCRUD.html',
                scope: $scope,
                size: 'md'
            });
            modalInstance.result.then();
        }

        var onSubmitEdit = function (script_file) {
            if (script_file) {
                var formData = Object.assign({ script_file: script_file }, $scope.obj);
                Upload.upload({
                    url: '/rest/orchestration/admin_scripts/' + $scope.obj.id + '/',
                    method: 'PATCH',
                    data: formData
                }).then(function (response) {
                    $scope.get_scripts();
                    $scope.cancel();
                }, function (error) {
                    if (error.data && error.data.detail) {
                        $scope.error = error.data.detail;
                    }
                    console.error('Error', error);
                });
            } else {
                var formData = Object.assign({}, $scope.obj);
                $http.patch('/rest/orchestration/admin_scripts/' + $scope.obj.id + '/', formData).then(function (response) {
                    $scope.get_scripts();
                    $scope.cancel();
                });
            }
        }

        $scope.onSubmit = function (script_file) {
            if ($scope.method == 'Add') {
                onSubmitAdd(script_file);
            } else {
                onSubmitEdit(script_file);
            }
        };

        $scope.delete = function (script) {
            $scope.obj = Object.assign({}, { id: script.uuid, name: script.name, description: script.description, script_type: script.script_type });
            modalInstance = $uibModal.open({
                templateUrl: 'deleteScript.html',
                scope: $scope,
                size: 'md'
            });
            modalInstance.result.then();
        }

        $scope.confirmDelete = function () {
            $scope.error = null;
            console.log('$scope.obj : ', $scope.obj);
            $http.delete('/rest/orchestration/admin_scripts/' + $scope.obj.id + '/').then(function (response) {
                $scope.get_scripts();
                $scope.cancel();
            });
        };

        $scope.viewScript = function (script) {
            $scope.obj = Object.assign({}, { id: script.uuid, name: script.name, description: script.description, content: script.content });
            modalInstance = $uibModal.open({
                templateUrl: 'viewScriptContent.html',
                scope: $scope,
                size: 'md'
            });
            modalInstance.result.then();
        }

        $scope.cancel = function () {
            $scope.obj = {};
            $scope.error = null;
            modalInstance.close();
            modalInstance.dismiss();
        };

        $scope.dtOptions = DTOptionsBuilder.newOptions()
            .withPaginationType('full_numbers')
            .withDisplayLength(10)
            .withOption('Filter', false)
            .withOption('lengthMenu', [10, 25, 50, 100])
            .withOption('order', [1, 'desc'])
            .withBootstrap();

    }
]);

app.controller('TerraformController', [
    '$scope',
    '$routeParams',
    '$http',
    '$window',
    'OrganizationFast',
    'PrivateCloudFast',
    'TerraformVM',
    '$uibModal',
    'SearchService',
    'AlertService2',
    'TableHeaders',
    'TaskService2',
    function ($scope, $routeParams, $http, $window, OrganizationFast, PrivateCloudFast, TerraformVM, $uibModal, SearchService, AlertService2, TableHeaders, TaskService2) {

        $scope.org_id = null;
        $scope.alertService = AlertService2;

        $scope.getOrgs = function (val) {
            return OrganizationFast.query({ 'search': val }).$promise.then(function (response) {
                return response.results;
            });
        };

        var get_admin_org_id = function () {
            $http.get('rest/user/profile/').then(function (response) {
                $scope.admin_org_id = response.data.customer.id;
            });
        };

        get_admin_org_id();

        $scope.get_terraform_vms = function (org) {
            $scope.org_id = org.id;
            $scope.cloud_list = null;
            $http({
                url: '/rest/terraform/virtual_machines/?org_id=' + org.id,
                method: 'GET',
            }).then(function (response) {

                if (response.data.hasOwnProperty('task_id')) {
                    TaskService2.processTask(response.data.task_id, 500).then(function (result) {
                        $scope.assets = result.data; //Terraform related VMs
                    }).catch(function (error) {
                        $scope.terraform_vms = []; //Terraform related VMs
                        AlertService2.danger('Error in fetching terraform VM');
                    });

                }
                else {
                    $scope.assets = response.data;
                }

                $scope.get_cloud_data = function (param, obj) {
                    if (param == "UL Private Cloud" || param == "Customer Private Cloud") {
                        if (param == "UL Private Cloud") {
                            $scope.organization_id = $scope.admin_org_id;
                        }
                        else {
                            $scope.organization_id = $scope.org_id;
                        }
                        $http.get('rest/v3/private_cloud/?org_id=' + $scope.organization_id).then(function (response) {
                            $scope.cloud_list = response.data.results;
                            if (response.data.results.length == 0) {
                                obj["cloudMsg"] = "No " + param + " Available";
                                return obj;
                            }
                            else {
                                delete obj.cloudMsg;
                                return obj;
                            }
                        });
                    }
                };

                $scope.asset_fields = {
                    //
                    'Terraform': [
                        {
                            name: 'cloud_type',
                            err_msg: 'cloud_typeMsg',
                            description: 'Cloud Type', required: true, hidden: true,
                            inputMethod: {
                                type: 'choices',
                                choices: ['Customer Private Cloud', 'UL Private Cloud']
                            }
                        },
                        {
                            name: 'cloud',
                            err_msg: 'cloud_Msg',
                            description: 'Cloud', required: true, hidden: true,
                            inputMethod: {
                                type: 'choices',
                                choices: $scope.cloud_list
                            }
                        },
                        { name: 'vm_name', description: 'VM Name' },
                        { name: 'ram_size', description: 'RAM Size (MB)' },
                        { name: 'cpus', description: 'CPUs' },
                        { name: 'hostname', description: 'Hostname' },
                        { name: 'internal_ip', description: 'Internal IP' },
                        { name: 'routable_ip', description: 'Routable IP' },
                        { name: 'status', description: 'Power State', required: false },
                        { name: 'ssh_usr', description: 'SSH Username' },
                        {
                            name: 'ssh_pwd', description: 'SSH Password', hidden: true, hide_on_edit: true,
                            inputMethod: {
                                type: 'password',
                            }

                        },
                    ]
                };
                // Displaying error msg above field
                angular.forEach($scope.asset_fields, function (item, i) {
                    angular.forEach(item, function (subitem, i) {
                        item[i] = angular.extend(subitem, { err_msg: subitem.name + 'Msg' });
                    });
                });
                var _array = [
                    {
                        heading: 'Terraform',
                        items: $scope.assets,
                        key: 'name',
                        resourceClass: TerraformVM,
                        add: true,
                        custom: [
                            {
                                name: 'Modify Password',
                                func: function (name, collection) {
                                    return $scope['modify_password'](name, collection, this.fields);
                                },
                                fields: [
                                    {
                                        name: 'ssh_pwd',
                                        err_msg: 'ssh_pwdMsg',
                                        description: 'New Password',
                                        inputMethod: {
                                            type: 'password',
                                        }
                                    },
                                    {
                                        name: 'ssh_pwd1',
                                        err_msg: 'ssh_pwdMsg',
                                        description: 'Confirm Password',
                                        inputMethod: {
                                            type: 'password',
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                ];
                $scope.collections = _array;
            });
        };




        $scope.selection = {
            selected: null,
            index: null
        };

        $scope.create = function (collection) {
            $scope.obj = {};
            $scope.activeCols = $scope.asset_fields[collection.heading];
            $scope.resourceClass = collection.resourceClass;
            $scope.method = 'Add';
            $scope.list = collection.items;
            // $scope.mangle = function (obj) {
            //     obj.customer = $scope.orgresult;
            // };
            var modalInstance = $uibModal.open({
                templateUrl: '/static/rest/app/templates/modal/terraform_modal.html',
                controller: 'CreateTerraformModal',
                scope: $scope,
                size: 'md'
            });
            modalInstance.result.then(function () {
                // clean up
                // delete $scope.mangle;
                delete $scope.method;
            });
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
                templateUrl: '/static/rest/app/templates/modal/terraform_modal.html',
                controller: 'CreateTerraformModal',
                scope: $scope,
                size: 'md'
            });
            modalInstance.result.then();
        };

        $scope.modify_password = function (name, collection, fileds) {
            // original is a reference to the object
            // obj is a copy of original
            var selection = collection.selection;
            $scope.original = selection.item;
            $scope.obj = angular.copy($scope.original);
            $scope.activeCols = fileds;
            $scope.resourceClass = collection.resourceClass;
            $scope.method = 'Edit';
            var modalInstance = $uibModal.open({
                templateUrl: '/static/rest/app/templates/modal/requestor.html',
                controller: 'CreateTerraformModal',
                scope: $scope,
                size: 'md'
            });
            modalInstance.result.then();
        };

        $scope.remove = function (collection, idx) {
            var selection = collection.selection;
            var objId = selection.item.id;

            // console.log("Index  : "+idx)

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

        $scope.console_terraform = function (instance_id) {
            // AlertService2.danger('Coming soon....');
            $window.location.href = "/admin#/services/terraform/iframe/" + instance_id;
            $window.location.reload();

        };

    }
]);


app.controller('CreateTerraformModal', [
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
            obj = angular.extend($scope.purge(obj), { 'org': $scope.org.id });
            // console.log("Object : "+angular.toJson(obj));
            if ($scope.mangle !== undefined) {
                $scope.mangle(obj);
            }
            var newObj = new resource(obj);
            if (newObj.cloud) {
                if (newObj.cloud.platform_type == "VMware") {
                    newObj.$save().then(function (response) {
                        list.push(response);
                        $uibModalInstance.close();
                    }).catch(function (error) {
                        // AlertService2.danger(error);
                        // $scope.cancel();
                        $scope.attach_msg(obj, error);
                    });
                }
                else {
                    AlertService2.danger(newObj.cloud.platform_type + " is not supported yet.");
                }
            }
            else {
                newObj.$save().then(function (response) {
                    list.push(response);
                    $uibModalInstance.close();
                }).catch(function (error) {
                    // AlertService2.danger(error);
                    // $scope.cancel();
                    $scope.attach_msg(obj, error);
                });
            }


        };

        $scope.update = function (obj) {
            // obj: a Resource object in JSON
            obj = $scope.purge(obj);
            if (obj.cloud) {
                if (obj.cloud.platform_type == "VMware") {
                    resource.update(obj).$promise.then(function (response) {
                        angular.extend($scope.original, response);
                        $uibModalInstance.close();
                    }).catch(function (error) {
                        $scope.attach_msg(obj, error);
                    });
                }
                else {
                    AlertService2.danger(obj.cloud.platform_type + " is not supported yet.");
                }
            }
            else {
                resource.update(obj).$promise.then(function (response) {
                    angular.extend($scope.original, response);
                    $uibModalInstance.close();
                }).catch(function (error) {
                    $scope.attach_msg(obj, error);
                });
            }
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


app.controller('TerraformWebConsoleController', [
    '$scope',
    '$http',
    '$routeParams',
    '$rootScope',
    '$location',
    '$window',
    function ($scope, $http, $routeParams, $rootScope, $location, $window) {

        $scope.iframe = false;
        var url = $location.absUrl();
        if (url.indexOf('iframe') != -1) {
            $scope.iframe = true;
        }

        $scope.loader = true;

        $http({
            method: "GET",
            url: '/rest/terraform/' + $routeParams.uuid + '/webconsole/'
        }).then(function (response) {

            /*global MozWebSocket this._connection:true*/
            /*eslint no-undef: "error"*/

            $scope.loader = false;

            $rootScope.header = response.data.vm_name;
            $scope.title = {
                plural: response.data.vm_name,
                singular: response.data.vm_name
            };
            if ($scope.$parent == $scope.$root) $scope.$root.title = $scope.title;

            function WSSHClient() {
            }

            WSSHClient.prototype._generateEndpoint = function () {
                if (window.location.protocol == 'https:') {
                    var protocol = 'wss://';
                } else {
                    var protocol = 'ws://';
                }
                var endpoint = protocol + $window.location.host + "/webterminal/" + response.data.vm_id + '/';
                // var endpoint = protocol +'127.0.0.1:8080'+"/webterminal/"+ response.data.vm_id +'/';
                return endpoint;
            };

            WSSHClient.prototype.connect = function (options) {
                var endpoint = this._generateEndpoint();

                if (window.WebSocket) {
                    this._connection = new WebSocket(endpoint);
                }
                else if (window.MozWebSocket) {
                    this._connection = MozWebSocket(endpoint);
                }
                else {
                    options.onError('WebSocket Not Supported');
                    return;
                }

                this._connection.onopen = function () {
                    options.onConnect();
                };

                this._connection.onmessage = function (evt) {
                    var data = evt.data.toString();
                    options.onData(data);
                };


                this._connection.onclose = function (evt) {
                    options.onClose();
                };
            };

            WSSHClient.prototype.send = function (data) {
                this._connection.send(JSON.stringify(data));
            };

            WSSHClient.prototype.sendInitData = function (options) {
                var data = {
                    rows: options.rows,
                    cols: options.cols,
                };
                console.log("Sending :" + JSON.stringify({ "tp": "init", "data": data }));
                this._connection.send(JSON.stringify({ "tp": "init", "data": data }));
            };

            WSSHClient.prototype.sendClientData = function (data) {
                this._connection.send(JSON.stringify({ "tp": "client", "data": data }));
            };

            var client = new WSSHClient();

            /*global Terminal term:true*/
            /*eslint no-undef: "error"*/
            var terminalContainer = document.getElementById('terminal-container');
            var term = new Terminal({ screenKeys: true, useStyle: true, cursorBlink: true });
            term.open(terminalContainer);

            var parentElementStyle = window.getComputedStyle(term.element.parentElement),
                parentElementHeight = parseInt(parentElementStyle.getPropertyValue('height')),
                parentElementWidth = Math.max(0, parseInt(parentElementStyle.getPropertyValue('width')) - 17),
                elementStyle = window.getComputedStyle(term.element),
                elementPaddingVer = parseInt(elementStyle.getPropertyValue('padding-top')) + parseInt(elementStyle.getPropertyValue('padding-bottom')),
                elementPaddingHor = parseInt(elementStyle.getPropertyValue('padding-right')) + parseInt(elementStyle.getPropertyValue('padding-left')),
                availableHeight = parentElementHeight - elementPaddingVer,
                availableWidth = parentElementWidth - elementPaddingHor,
                container = term.rowContainer,
                subjectRow = term.rowContainer.firstElementChild,
                contentBuffer = subjectRow.innerHTML,
                characterHeight,
                rows,
                characterWidth,
                cols,
                geometry;

            subjectRow.style.display = 'inline';
            subjectRow.innerHTML = 'W'; // Common character for measuring width, although on monospace
            characterWidth = subjectRow.getBoundingClientRect().width;
            subjectRow.style.display = ''; // Revert style before calculating height, since they differ.
            characterHeight = subjectRow.getBoundingClientRect().height;
            subjectRow.innerHTML = contentBuffer;

            rows = parseInt(availableHeight / characterHeight);
            cols = parseInt(availableWidth / characterWidth);

            term.resize(cols, rows);
            // term.fit(); // The above code does the same thing as term.fit()

            var options = {
                rows: rows,
                cols: cols,
            };

            term.on('data', function (data) {
                client.sendClientData(data);
            });

            term.on('paste', function (data) {
                // console.debug('Sending paste data:' + data);
                client.sendClientData(data);
            });


            $('.terminal').detach().appendTo('#terminal-container');
            term.write('Connecting...');
            client.connect({
                onError: function (error) {
                    term.write('Error: ' + error + '\r\n');
                    console.debug('error happened');
                },
                onConnect: function () {
                    client.sendInitData(options);
                    console.debug('connection established');
                    term.focus();
                },
                onClose: function () {
                    term.write("\rconnection closed");
                    console.debug('connection reset by peer');
                },
                onData: function (data) {
                    term.write(data);
                    console.debug('get data:' + data);
                }
            });

        })
            .catch(function (error) {
                $scope.errorMsg = error.data;
            });

    }
]);

app.controller('MigartionAwsAccountSelectionController', [
    '$scope',
    '$uibModalInstance',
    '$http',
    '$routeParams',
    'AlertService2',
    'TaskService2',
    'AwsService',
    function ($scope, $uibModalInstance, $http, $routeParams, AlertService2, TaskService2, AwsService) {
        $scope.create = function (request) {
            $scope.aws_account_list_errmsg = '';
            $scope.aws_region_list_errmsg = '';
            $scope.aws_bucket_list_errmsg = '';
            var validate = AwsService.aws_request_validation(request);

            if (Object.keys(validate).length) {
                $scope.aws_account_list_errmsg = validate.aws_account_list_errmsg;
                $scope.aws_region_list_errmsg = validate.aws_region_list_errmsg;
                $scope.aws_bucket_list_errmsg = validate.aws_bucket_list_errmsg;
                return;
            }

            if ($scope.cloud_type == 'openstack') {
                $scope.migrate_openstack_to_aws(request);
            } else if ($scope.cloud_type == 'vmware') {
                $scope.migrate_vmware_to_aws(request);
            }
            $scope.cancel();
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss();
        };
    }
]);

app.controller('AdminAuditLogController', [
    '$scope',
    '$routeParams',
    '$location',
    '$uibModal',
    '$http',
    'OrganizationFast',
    '$window',
    '$httpParamSerializer',
    function ($scope, $routeParams, $location, $uibModal, $http, OrganizationFast, $window, $httpParamSerializer) {

        $scope.model = {};
        $scope.loader = true;

        $scope.getOrgs = function (val) {
            return OrganizationFast.query({ 'search': val }).$promise.then(function (response) {
                return response.results;
            });
        };

        $scope.datePicker = {};
        $scope.datePicker.date = {
            startDate: moment().subtract(7, "days"),
            endDate: moment()
        };
        $scope.selected_log = "all_logs";

        $scope.get_client_activity_logs = function (value) {

            $scope.loader = true;
            $scope.model.results = [];

            var organization_id = null;

            $scope.selected_log = value;
            var date_range = $scope.datePicker.date;
            if ($scope.org) {
                organization_id = $scope.org.id;
            }

            var start_date = date_range.startDate.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
            var end_date = date_range.endDate.set({ hour: 23, minute: 59, second: 59, millisecond: 0 });

            var params = {
                'start_date': start_date.format(),
                'end_date': end_date.format(),
                'user_organization': organization_id,
            };
            if (value == "customer_logs") {
                params.customer_log = organization_id;
            }

            if (value == "all_logins") {
                params.filter_logins = 3;
            }

            var serialized_params = $httpParamSerializer(params);
            var url = '/rest/activity_logs/?' + serialized_params;
            $scope.downloadUrl = '/rest/activity_logs/download/?' + serialized_params;
            $http.get(url).then(function (response) {
                $scope.loader = false;
                $scope.model = response.data;
            }).catch(function (error) {
                console.log(error);
                $scope.loader = false;
                $scope.model = {};
                $scope.model.results = [];
            });

        };

        $scope.options = {
            locale: {
                applyClass: 'btn-green',
                applyLabel: "Apply",
                fromLabel: "From",
                format: "DD-MMM-YYYY",
                toLabel: "To",
                cancelLabel: 'Cancel',
                customRangeLabel: 'Custom range',
            },
            eventHandlers: {
                'apply.daterangepicker': function (ev, picker) {
                    $scope.get_client_activity_logs($scope.selected_log);
                },
            }
        };


        $scope.changes_modal = function (result, action) {
            var changes = JSON.parse(result.changes);
            var modalInstance = $uibModal.open({
                templateUrl: 'activityLogChanges.html',
                scope: $scope,
                size: 'md',
                controller: 'activityLogChangesController'
            });
            $scope.logObject = angular.copy(result);
            $scope.logObject.changes = changes;
            $scope.action = action;
            $scope.changes_log_keys = Object.keys(changes);
            console.log('object keys : ', $scope.changes_log_keys);
            $scope.changes_log = changes;
            modalInstance.result.then();
        };

        $scope.get_client_activity_logs($scope.selected_log);

        $scope.change_action_to_text = function (action) {
            if (action == '0') {
                return 'CREATED';
            }
            else if (action == '1') {
                return 'UPDATED';
            }
            else if (action == '2') {
                return 'DELETED';
            }
        };
    }
]);

app.controller('activityLogChangesController', [
    '$scope',
    '$uibModalInstance',
    '$http',
    'AlertService2',
    'TaskService2',
    function ($scope, $uibModalInstance, $http, AlertService2, TaskService2) {
        $scope.cancel = function () {
            $uibModalInstance.dismiss();
        };

    }
]);

app.controller('VmwareWebConsoleController', [
    '$scope',
    '$http',
    '$uibModal',
    '$window',
    '$routeParams',
    '$rootScope',
    '$location',
    function ($scope, $http, $uibModal, $window, $routeParams, $rootScope, $location) {

        $scope.iframe = false;
        var url = $location.absUrl();
        if (url.indexOf('iframe') != -1) {
            $scope.iframe = true;
        }

        $scope.loader = true;

        $scope.goBack = function () {
            $window.history.back();
        };

        $scope.closeTab = function () {
            $window.close();
        };


        $http({
            method: "GET",
            url: '/rest/vmware_vms/' + $routeParams.uuid + '/details/'
        }).then(function (response) {

            $scope.loader = false;

            $rootScope.header = response.data.vm_name;
            $scope.title = {
                plural: response.data.vm_name,
                singular: response.data.vm_name
            };
            if ($scope.$parent == $scope.$root) $scope.$root.title = $scope.title;

            $scope.request = {
                hostname: response.data.ip_address,
                port: 2122,
                // username: "root",
                // password: ""
            };

            $scope.endpoint = "/rest/vmware_vms/check_auth/";
            var modalInstance = $uibModal.open({
                templateUrl: 'vmAuthentcicate.html',
                scope: $scope,
                size: 'md',
                controller: 'VMAuthController',
                backdrop: 'static',
                keyboard: false
            });
            modalInstance.result.then();

        }).catch(function (error) {
            return error;
        });

    }
]);

app.controller('OpenStackWebConsoleController', [
    '$scope',
    '$http',
    '$uibModal',
    '$window',
    '$routeParams',
    '$rootScope',
    '$location',
    function ($scope, $http, $uibModal, $window, $routeParams, $rootScope, $location) {

        $scope.iframe = false;
        var url = $location.absUrl();
        if (url.indexOf('iframe') != -1) {
            $scope.iframe = true;
        }

        $scope.loader = true;

        $scope.goBack = function () {
            $window.history.back();
        };

        $scope.closeTab = function () {
            $window.close();
        };

        $http({
            method: "GET",
            url: '/rest/openstack/migration/' + $routeParams.uuid + '/details/'
        }).then(function (response) {

            $scope.loader = false;

            $rootScope.header = response.data.vm_name;
            $scope.title = {
                plural: response.data.vm_name,
                singular: response.data.vm_name
            };
            if ($scope.$parent == $scope.$root) $scope.$root.title = $scope.title;

            $scope.request = {
                hostname: response.data.ip_address,
                port: 2122,
                // username: "root",
                // password: ""
            };

            $scope.endpoint = "/rest/openstack/migration/check_auth/";
            var modalInstance = $uibModal.open({
                templateUrl: 'vmAuthentcicate.html',
                scope: $scope,
                size: 'md',
                controller: 'VMAuthController',
                backdrop: 'static',
                keyboard: false
            });
            modalInstance.result.then();

        }).catch(function (error) {
            return error;
        });

    }
]);



app.controller('VmwareWmksConsoleController', [
    '$scope',
    '$http',
    '$routeParams',
    '$rootScope',
    '$location',
    function ($scope, $http, $routeParams, $rootScope, $location) {

        $scope.iframe = false;
        var url = $location.absUrl();
        if (url.indexOf('iframe') != -1) {
            $scope.iframe = true;
        }

        $scope.loader = true;

        $http({
            method: "GET",
            url: '/rest/vmware_vms/' + $routeParams.uuid + '/webconsole/'
        }).then(function (response) {

            $scope.loader = false;

            $rootScope.header = response.data.vm_name;
            $scope.title = {
                plural: response.data.vm_name,
                singular: response.data.vm_name
            };
            if ($scope.$parent == $scope.$root) $scope.$root.title = $scope.title;

            var _wmks = $("#wmksContainer")

                .wmks({ "useVNCHandshake": false, "sendProperMouseWheelDeltas": true, "fitToParent": true })
                .bind("wmksconnecting", function () {
                    console.log("The console is connecting");
                })
                .bind("wmksconnected", function () {

                    console.log("The console has been connected");
                })
                .bind("wmksdisconnected", function (evt, info) {
                    console.log("The console has been disconnected");
                    console.log(evt, info);
                })
                .bind("wmkserror", function (evt, errObj) {
                    console.log("Error!");
                    console.log(evt, errObj);
                })
                .bind("wmksiniterror", function (evt, customData) {
                    console.log(evt);
                    console.log(customData.errorMsg);
                    $("#vm_error").text(customData.errorMsg);
                    // alert(customData.errorMsg);
                })
                .bind("wmksresolutionchanged", function (canvas) {
                    console.log("Resolution has changed!");
                });

            _wmks.wmks("connect", response.data.websocket);


        }).catch(function (error) {
            return error;
        });

    }
]);

app.controller('VMAuthController', [
    '$scope',
    '$uibModalInstance',
    '$http',
    '$routeParams',
    '$window',
    'AlertService2',
    function ($scope, $uibModalInstance, $http, $routeParams, $window, AlertService2) {
        $scope.create = function (request) {

            /*global MozWebSocket this._connection:true*/
            /*eslint no-undef: "error"*/

            var options = {
                instance_id: $routeParams.uuid,
                host: request.hostname,
                port: request.port,
                username: request.username,
                password: request.password
            };

            // console.log("Options : "+angular.toJson(options));

            $http.post($scope.endpoint, options).
                then(function (response) {

                    function openTerminal(options) {
                        var client = new WSSHClient();
                        var term = new Terminal({ cols: 80, rows: 24, screenKeys: true, useStyle: true });
                        term.on('data', function (data) {
                            client.sendClientData(data);
                        });
                        term.open();
                        $('.terminal').detach().appendTo('#term');
                        term.write('Connecting...');
                        client.connect({
                            onError: function (error) {
                                term.write('Error: ' + error + '\r\n');
                                console.debug('error happened');
                            },
                            onConnect: function () {
                                client.sendInitData(options);
                                client.sendClientData('\r');
                                console.debug('connection established');
                            },
                            onClose: function () {
                                term.write("\rconnection closed");
                                console.debug('connection reset by peer');
                            },
                            onData: function (data) {
                                term.write(data);
                                console.debug('get data:' + data);
                            }
                        });
                    }

                    function store(options) {
                        window.localStorage.host = options.host;
                        window.localStorage.port = options.port;
                        window.localStorage.username = options.username;
                        window.localStorage.password = options.password;
                    }


                    function WSSHClient() {
                    }

                    WSSHClient.prototype._generateEndpoint = function () {
                        if (window.location.protocol == 'https:') {
                            var protocol = 'wss://';
                        } else {
                            var protocol = 'ws://';
                        }
                        var endpoint = protocol + $window.location.host + "/vmterminal/" + $routeParams.uuid + '/';
                        // var endpoint = protocol +'127.0.0.1:8080'+"/webterminal/"+ response.data.vm_id +'/';
                        return endpoint;
                    };

                    WSSHClient.prototype.connect = function (options) {
                        var endpoint = this._generateEndpoint();

                        if (window.WebSocket) {
                            this._connection = new WebSocket(endpoint);
                        }
                        else if (window.MozWebSocket) {
                            this._connection = MozWebSocket(endpoint);
                        }
                        else {
                            options.onError('WebSocket Not Supported');
                            return;
                        }

                        this._connection.onopen = function () {
                            options.onConnect();
                        };

                        this._connection.onmessage = function (evt) {
                            var data = evt.data.toString();
                            options.onData(data);
                        };


                        this._connection.onclose = function (evt) {
                            options.onClose();
                        };
                    };

                    WSSHClient.prototype.send = function (data) {
                        this._connection.send(JSON.stringify(data));
                    };

                    WSSHClient.prototype.sendInitData = function (options) {
                        var data = {
                            hostname: options.host,
                            port: options.port,
                            username: options.username,
                            password: options.password,
                            rows: options.rows,
                            cols: options.cols
                        };
                        // console.log("Sending :"+JSON.stringify({"tp": "init", "data": data}));
                        this._connection.send(JSON.stringify({ "tp": "init", "data": data }));
                    };

                    WSSHClient.prototype.sendClientData = function (data) {
                        this._connection.send(JSON.stringify({ "tp": "client", "data": data }));
                    };

                    var client = new WSSHClient();

                    /*global Terminal term:true*/
                    /*eslint no-undef: "error"*/
                    var terminalContainer = document.getElementById('terminal-container');
                    var term = new Terminal({ screenKeys: true, useStyle: true, cursorBlink: true });
                    term.open(terminalContainer);

                    var parentElementStyle = window.getComputedStyle(term.element.parentElement),
                        parentElementHeight = parseInt(parentElementStyle.getPropertyValue('height')),
                        parentElementWidth = Math.max(0, parseInt(parentElementStyle.getPropertyValue('width')) - 17),
                        elementStyle = window.getComputedStyle(term.element),
                        elementPaddingVer = parseInt(elementStyle.getPropertyValue('padding-top')) + parseInt(elementStyle.getPropertyValue('padding-bottom')),
                        elementPaddingHor = parseInt(elementStyle.getPropertyValue('padding-right')) + parseInt(elementStyle.getPropertyValue('padding-left')),
                        availableHeight = parentElementHeight - elementPaddingVer,
                        availableWidth = parentElementWidth - elementPaddingHor,
                        container = term.rowContainer,
                        subjectRow = term.rowContainer.firstElementChild,
                        contentBuffer = subjectRow.innerHTML,
                        characterHeight,
                        rows,
                        characterWidth,
                        cols,
                        geometry;

                    subjectRow.style.display = 'inline';
                    subjectRow.innerHTML = 'W'; // Common character for measuring width, although on monospace
                    characterWidth = subjectRow.getBoundingClientRect().width;
                    subjectRow.style.display = ''; // Revert style before calculating height, since they differ.
                    characterHeight = subjectRow.getBoundingClientRect().height;
                    subjectRow.innerHTML = contentBuffer;

                    rows = parseInt(availableHeight / characterHeight);
                    cols = parseInt(availableWidth / characterWidth);

                    term.resize(cols, rows);
                    // term.fit(); // The above code does the same thing as term.fit()

                    angular.extend(options, { rows: rows, cols: cols });

                    // alert(angular.toJson(options));

                    term.on('data', function (data) {
                        client.sendClientData(data);
                    });

                    term.on('paste', function (data) {
                        console.debug('Sending paste data:' + data);
                        client.sendClientData(data);
                    });


                    $('.terminal').detach().appendTo('#terminal-container');
                    term.write('Connecting...');
                    client.connect({
                        onError: function (error) {
                            term.write('Error: ' + error + '\r\n');
                            console.debug('error happened');
                        },
                        onConnect: function () {
                            client.sendInitData(options);
                            console.debug('connection established');
                            $uibModalInstance.dismiss();
                            term.focus();
                        },
                        onClose: function () {
                            term.write("\rconnection closed");
                            console.debug('connection reset by peer');
                        },
                        onData: function (data) {
                            term.write(data);
                            console.debug('get data:' + data);
                        }
                    });

                })
                .catch(function (error) {
                    $scope.errorMsg = error.data;
                });


        };

    }
]);
