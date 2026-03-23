var app = angular.module('uldb');

app.controller('CustomerPrivateCloudController', [
    '$scope',
    '$uibModal',
    '$stateParams',
    '$location',
    'CustomerOrganization',
    'CustomerDatacenter',
    'CustomerPrivateCloud',
    'AbstractControllerFactory2',
    'SearchService',
    'AlertService2',
    'CustomerVcenter',
    'CustomerEsxi',
    'CustomerOpenstack',
    function ($scope,
              $uibModal,
              $stateParams,
              $location,
              CustomerOrganization,
              CustomerDatacenter,
              PrivateCloud,
              AbstractControllerFactory2,
              SearchService,
              AlertService2,
              CustomerVcenter,
              CustomerEsxi,
              CustomerOpenstack) {
        //  TAB CONTROL FUNCTIONALITY  todo: factor out into service? or directive?
        $scope.tabs = [
            {name: 'Cloud', url: 'currentCloudData.html'},
            // { name: 'Private Cloud', url: 'cloud' },
            {name: 'Manage Vcenter', url: 'vcenterData.html'},
            {name: 'Manage Esxi', url: 'esxiData.html'},
            {name: 'Manage Openstack', url: 'openstackData.html'}
        ];

        // select the tab based on param
        $scope.activeTab = 0;
        var tab = $stateParams.t;
        if (tab) {
            $scope.tabs.forEach(function (e, i, arr) {
                if (e.name === tab) {
                    $scope.activeTab = i;
                }
            });
        }
        $scope.redirectTab = function (idx) {
            $location.path($scope.tabs[idx].url);
            // window.dispatchEvent(new Event('resize'));  // fixes charts in data
        };
        //  END TAB CONTROL FUNCTIONALITY

        $scope.title = {
            plural: 'Private Cloud',
            singular: 'Private Cloud'
        };
        $scope.$root.title = $scope.title;
        $scope.getOrgs = new SearchService(CustomerOrganization).search;
        $scope.getDcs = new SearchService(CustomerDatacenter).search;
        $scope.platform_types = ['OpenStack', 'VMware'];

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
                templateUrl: 'privateCloudModal.html',
                controller: 'EditServerModal',
                scope: $scope,
                size: 'md'
            });
            modalInstance.result.then(function () {

            });
        };

        $scope.vcenterData = [];
        CustomerVcenter.query().$promise.then(function (response) {
            $scope.vcenterData = response.results;
        });
        $scope.vheading = "VMware vCenter";

        $scope.esxiData = [];
        CustomerEsxi.query().$promise.then(function (response) {
            $scope.esxiData = response.results;
        });
        $scope.eheading = "VMware ESXi";

        $scope.openstackData = [];
        CustomerOpenstack.query().$promise.then(function (response) {
            $scope.openstackData = response.results;
        });
        $scope.oheading = 'OpenStack Controller';
    }
]);

app.controller('CustomerPrivateCloudDetailController', [
    '$scope',
    '$http',
    '$location',
    '$window',
    '$state',
    '$rootScope',
    '$stateParams',
    '$uibModal',
    '$timeout',
    'CustomerOrganization',
    'CustomerDatacenter',
    'CustomerPrivateCloud',
    'CustomerServer',
    'CustomerVirtualMachine',
    'CustomerSwitch',
    'CustomerLoadBalancer',
    'CustomerFirewall',
    'CustomerGraphedPort',
    'NagiosService',
    'AbstractControllerFactory2',
    'SearchService',
    'TableHeaders',
    'AlertService2',
    'ProxyDetailControllerService',
    'TaskService2',
    function ($scope,
              $http,
              $location,
              $window,
              $state,
              $rootScope,
              $stateParams,
              $uibModal,
              $timeout,
              CustomerOrganization,
              CustomerDatacenter,
              CustomerPrivateCloud,
              CustomerServer,
              CustomerVirtualMachine,
              CustomerSwitch,
              CustomerLoadBalancer,
              CustomerFirewall,
              CustomerGraphedPort,
              NagiosService,
              AbstractControllerFactory2,
              SearchService,
              TableHeaders,
              AlertService2,
              ProxyDetailControllerService,
              TaskService2) {

        var resourceClass = CustomerPrivateCloud;
        $scope.host_data = [];
        $scope.service_data = [];
        $scope.data_availabe = true;
        $scope.loader = true;
        $scope.openstack_backup_params = {};
        $scope.cloud_type = '';
        var id = '';

        $scope.ctrl = AbstractControllerFactory2($scope, CustomerPrivateCloud, $rootScope.configObject);

        $scope.update_activity_log_entry = function (cloud) {
            console.log("inside new tab openstack");
            var instance_id = '';
            var device_type = '';
            if (cloud.platform_type == "VMware") {
                device_type = 'vcenter';
                if (cloud.vcenter_proxy.length > 0){
                    instance_id = cloud.vcenter_proxy[0].uuid;
                }
            }
            else if (cloud.platform_type == "OpenStack") {
                device_type = 'openstack_proxy';
                if (cloud.openstack_proxy.length > 0){
                    instance_id = cloud.openstack_proxy[0].uuid;
                }
            }
            if (instance_id){
                ProxyDetailControllerService.updateActivityLog(instance_id, device_type);
            }
        };

        $scope.updateActivityLog = function(index, instance_id, device_type){
            ProxyDetailControllerService.updateActivityLog(instance_id, device_type);
        };

        $scope.close_confirm = function(){
            modalSupport.dismiss('cancel');
        };

        $scope.manage_request = function (name, bm_server) {
            $scope.device_type = "Bare Metal Server";
            $scope.device_name = name;
            $scope.description = 
                "Bare Metal Server: " + name + "\n" +
                "Management IP: " + bm_server.management_ip;
            showModal('static/rest/app/client/templates/manage_request.html', 'ManageRequestController');

        };

        $scope.cancel = function(){
            modalSupport.dismiss('cancel');
        };

        $scope.updateTitle = function () {
            $rootScope.header = "";
            $scope.title = {
                plural: "Unity",
                singular: "Unity"
            };
            if ($scope.$parent == $scope.$root) $scope.$root.title = $scope.title;
        };

        $scope.manage_request_hypervisor = function (device_name, device_type, result) {
            $scope.device_type = device_type;
            $scope.device_name = device_name;
            $scope.description = '\n \n ##- Please type your description above this line -##\n' +
                "===============\n" +
                "Device Type: " + device_type + "\n" +
                "Device Name: " + device_name + "\n" +
                "System Type: " + result.instance.instance_type + "\n" +
                "Virtualization Type: " + result.instance.virtualization_type + "\n" +
                "OS Name: " + result.instance.os.full_name + "\n" +
                "Cloud Name: " + result.private_cloud.name + "\n" +
                "===============\n";
            $scope.ctrl.showModal('static/rest/app/client/templates/manage_request.html', 'ManageRequestController');
        };

        $scope.manage_request_cloud = function (result) {
            $scope.device_type = "Private Cloud";
            $scope.device_name = result.name;
            $scope.description = '\n \n ##- Please type your description above this line -##\n' +
                "===============\n" +
                "Device Name: " + $scope.device_name + "\n" +
                "Virtualization Platform: " + result.platform_type + "\n" +
                "===============\n";
            $scope.ctrl.showModal('static/rest/app/client/templates/manage_request.html', 'ManageRequestController');
        };

        $scope.manage_request_vm = function (device_name, device_type, result) {
            $scope.device_type = device_type;
            $scope.device_name = device_name;
            $scope.description = '\n \n ##- Please type your description above this line -##\n' +
                "===============\n" +
                "Device Type: " + device_type + "\n" +
                "Device Name: " + device_name + "\n" +
                "Operating System: " + result.os_name + "\n" +
                "Host Name: " + result.host_name + "\n" +
                "Management IP: " + result.management_ip + "\n" +
                "Power State: " + result.state + "\n" +
                "===============\n";
            $scope.ctrl.showModal('static/rest/app/client/templates/manage_request.html', 'ManageRequestController');
        };


        $scope.manage_request_custom_vm = function (device_name, device_type, result) {
            $scope.device_type = device_type;
            $scope.device_name = device_name;
            $scope.description = '\n \n ##- Please type your description above this line -##\n' +
                "===============\n" +
                "Device Type: " + device_type + "\n" +
                "Device Name: " + device_name + "\n" +
                "Operating System: " + result.os.name + "\n" +
                "Management IP: " + result.management_ip + "\n" +
                "===============\n";
            $scope.ctrl.showModal('static/rest/app/client/templates/manage_request.html', 'ManageRequestController');
        };


        var manangeVMwareSummary = function (response) {
            $scope.hypervisors = true;
            if (response.vcenter_proxy.length > 0) {
                $scope.proxy_platform_link = "#/vmware-vcenter/"+ id + "/";
                $scope.proxy_link_cloud = response.proxy.proxy_fqdn;
            }
            var usage_data = $http.get('/customer/private_cloud/' + id + '/usage_data/');
            usage_data.then(function (response) {
                $scope.overview_data = response.data;

                $scope.vcpus_used = response.data.total_cpus_allocated;
                $scope.vcpus_total = response.data.total_num_cores;
                var vcpus_free = ($scope.vcpus_total - $scope.vcpus_used);
                $scope.vcpus_available = (vcpus_free < 0 ? 0 : vcpus_free);
                $scope.vcpus_percent = Math.round(($scope.vcpus_used * 100) / $scope.vcpus_total);

                if (response.data.static_memory_capacity !== "N/A"){
                    $scope.memory_used = Math.round(response.data.total_memory_allocated / 1024);
                    $scope.memory_total = Math.round(response.data.static_memory_capacity);
                    var memory_free = Math.round($scope.memory_total - $scope.memory_used);
                    $scope.memory_available = (memory_free < 0 ? 0 : memory_free);
                    $scope.memory_percent = Math.round(($scope.memory_used * 100) / $scope.memory_total);

                }
                else{
                    $scope.memory_used = Math.round(response.data.total_memory_allocated / 1024);
                    $scope.memory_total = response.data.static_memory_capacity;
                    var memory_free = (0 - $scope.memory_used);
                    $scope.memory_available = 'N/A';
                }

                if (response.data.static_disk_capacity !== "N/A"){
                    $scope.storage_used = Math.round((response.data.disk_capacity / (1024 * 1024 * 1024)) + response.data.bm_servers_storage);
                    $scope.storage_total = Math.round(response.data.static_disk_capacity * 1000);
                    var storage_free = ($scope.storage_total - $scope.storage_used);
                    $scope.storage_available = (storage_free < 0 ? 0 : storage_free);
                    $scope.storage_percent = Math.round(($scope.storage_used * 100) / $scope.storage_total);
                }
                else{
                    $scope.storage_used = Math.round((response.data.disk_capacity / (1024 * 1024 * 1024)) + response.data.bm_servers_storage);
                    $scope.storage_total = response.data.static_disk_capacity;
                    var storage_free = (0 - $scope.storage_used);
                    $scope.storage_available = "N/A";
                }

                $scope.vcpu_bar = ($scope.vcpus_percent < 65) ? "success" : ((65 < $scope.vcpus_percent) ? (($scope.vcpus_percent < 85) ? "warning" : "danger") : "danger");
                $scope.memory_bar = ((response.data.static_memory_capacity == "N/A") ? "success" : ($scope.memory_percent < 65) ? "success" : ((65 < $scope.memory_percent) ? (($scope.memory_percent < 85) ? "warning" : "danger") : "danger"));
                $scope.storage_bar = ((response.data.static_disk_capacity == "N/A") ? "success" : ($scope.storage_percent < 65) ? "success" : ((65 < $scope.storage_percent) ? (($scope.storage_percent < 85) ? "warning" : "danger") : "danger"));

                $scope.loader = false;

            }).catch(function (error, status) {
                AlertService2.danger("Unable to fetch VMware statistcs. Please contact Administrator (support@unityonecloud.com)");
                $scope.data_availabe = false;
                $scope.loader = false;
            });
        };

        var manangeOpenStackSummary = function (response) {
            $scope.hypervisors = true;
            if (response.openstack_proxy.length > 0) {
                $scope.proxy_platform_link = "#/openstack-proxy/"+ id + "/";
                $scope.proxy_link_cloud = response.proxy.proxy_fqdn;
            }
            var usage_data = $http.get('/customer/private_cloud/' + id + '/usage_data/');
            usage_data.then(function (response) {
                $scope.hypervisors = false;

                $scope.vcpus_used = response.data.vcpus_used;
                $scope.vcpus_total = response.data.vcpus;
                var vcpus_free = ($scope.vcpus_total - $scope.vcpus_used);
                $scope.vcpus_available = (vcpus_free < 0 ? 0 : vcpus_free);
                var vcpus_percent = ($scope.vcpus_used * 100) / $scope.vcpus_total;
                $scope.vcpus_percent = (vcpus_percent > 100 ? 100 : vcpus_percent);

                if (response.data.static_disk_capacity !== "N/A"){
                    $scope.memory_used = Math.round(response.data.memory_mb_used / 1000);
                    $scope.memory_total = response.data.static_memory_capacity;
                    var memory_free = Math.round($scope.memory_total - $scope.memory_used);
                    $scope.memory_available = (memory_free < 0 ? 0 : memory_free);
                    $scope.memory_percent = Math.round(($scope.memory_used * 100) / $scope.memory_total);
                }
                else{
                    $scope.memory_used = Math.round(response.data.memory_mb_used / 1000);
                    $scope.memory_total = response.data.static_memory_capacity;
                    var memory_free = (0 - $scope.memory_used);
                    $scope.memory_available = "N/A";
                }

                if (response.data.static_disk_capacity !== "N/A"){
                    $scope.storage_used = response.data.local_gb_used + response.data.bm_servers_storage;
                    $scope.storage_total = response.data.static_disk_capacity * 1000;
                    var storage_free = ($scope.storage_total - $scope.storage_used);
                    $scope.storage_available = (storage_free < 0 ? 0 : storage_free);
                    var storage_percent = Math.round(($scope.storage_used * 100) / $scope.storage_total);
                    $scope.storage_percent = (storage_percent > 100 ? 100 : storage_percent);
                }
                else{
                    $scope.storage_used = response.data.local_gb_used + response.data.bm_servers_storage;
                    $scope.storage_total = response.data.static_disk_capacity;
                    var storage_free = (0 - $scope.storage_used);
                    $scope.storage_available = "N/A";
                }
                $scope.vcpu_bar = ($scope.vcpus_percent < 65) ? "success" : ((65 < $scope.vcpus_percent) ? (($scope.vcpus_percent < 85) ? "warning" : "danger") : "danger");
                $scope.memory_bar = ((response.data.static_memory_capacity == "N/A") ? "success" : ($scope.memory_percent < 65) ? "success" : ((65 < $scope.memory_percent) ? (($scope.memory_percent < 85) ? "warning" : "danger") : "danger"));
                $scope.storage_bar = ((response.data.static_disk_capacity == "N/A") ? "success" : ($scope.storage_percent < 65) ? "success" : ((65 < $scope.storage_percent) ? (($scope.storage_percent < 85) ? "warning" : "danger") : "danger"));

                $scope.loader = false;
            }).catch(function (error, status) {
                AlertService2.danger("Unable to fetch OpenStack statistcs. Please contact Administrator (support@unityonecloud.com)");
                $scope.data_availabe = false;
                $scope.loader = false;
            });
        };

        var manangeVCloudSummary = function (response) {
            // TO DO
        };

        var manageHypervisorsSummary = function (response) {
            $scope.hyperV = true;
            $scope.hypervisors = false;
            $scope.loader = false;
        };

        var get_vms_count = function (id, platform_type) {
            if (platform_type == 'VMware') {
                var url = '/rest/vmware/migrate/';
            }
            else if (platform_type == 'vCloud Director') {
                var url = '/customer/vclouds/virtual_machines/';
            }
            else if (platform_type == 'Openstack') {
                var url = '/rest/openstack/migration/';
            }
            else{
                var url = '/rest/customer/virtual_machines/';
            }
            var params = {
                'cloud_id': id,
                'platform_type': platform_type
            };
            $http({
                url: url,
                params: params,
                method: 'GET',
            }).then(function (response) {
                $scope.vm_summary_count = response.data.count;
            });
        };

        var manageSummayData = function () {
            resourceClass.get({uuid: id}).$promise.then(function (response) {
                $scope.cloud = response;
                $scope.platform_type = response.platform_type;
                $scope.shared_switches = response.switch.filter(function (obj) {
                    return obj.is_shared;
                });
                $scope.shared_firewalls = response.firewall.filter(function (obj) {
                    return obj.is_shared;
                });
                $scope.shared_load_balancers = response.load_balancer.filter(function (obj) {
                    return obj.is_shared;
                });

                if (response.platform_type === "VMware") {
                    get_vms_count(id, 'VMware');
                    manangeVMwareSummary(response);
                } else if (response.platform_type === "OpenStack") {
                    get_vms_count(id, 'Openstack');
                    manangeOpenStackSummary(response);
                } else if (response.platform_type === "Custom") {
                    get_vms_count(id, 'Custom');
                    $scope.loader = false;
                } else if (response.platform_type === "vCloud Director") {
                    get_vms_count(id, 'vCloud Director');
                    manangeVCloudSummary(response);
                } else {
                    $scope.data_availabe = false;
                    manageHypervisorsSummary(response);
                }
                var stats_promise = $http.get('/customer/private_cloud/' + response.uuid + '/health_stats/');
                stats_promise.then(function (response) {
                    var data = NagiosService.parseStats(response);
                    $scope.host_data = data.host_data;
                    $scope.service_data = data.service_data;
                });

                var getCustomDevicesCount = function(){
                    $http.get('/customer/customdevices/', {params: {'uuid': id}}).then(function (response) {
                        $scope.customDevicesCount = response.data.count;
                    });
                }();
            });
        };

        var manageHypervisorsData = function () {
            if ($scope.hypervisors) {
                // $scope.esxiData = [];
                $http.get('/customer/servers/').then(function (response) {
                    $scope.esxiData = [];
                    angular.forEach(response.data.results, function (value, key) {
                        if (value.private_cloud) {
                            if (value.private_cloud.uuid == id) {
                                $scope.esxiData.push(value);
                            }
                        }
                    });
                    $scope.loader = false;
                    $scope.hypervisors_loaded = true;
                });
            } else {
                $scope.loader = false;
                $scope.hypervisors_loaded = true;
            }
        };

        var manageBaremetalsData = function () {
            console.log("Baremetals ===>");
            if ($scope.baremetalservers) {
                var url = '/customer/bm_servers/?page=' + 1 + '&page_size=' + 0;
                $http.get(url).then(function (response) {
                    $scope.baremetal_servers = [];
                    angular.forEach(response.data, function (value, key) {
                        if (value.server.private_cloud) {
                            if (value.server.private_cloud.uuid == id) {
                                $scope.baremetal_servers.push(value);
                            }
                        }
                    });
                    $scope.loader = false;
                    $scope.baremetals_loaded = true;
                });
            } else {
                $scope.loader = false;
                $scope.baremetals_loaded = true;
            }
        };

        $scope.get_bm_server_controller_power_stats = function (device) {
            if (device.bmc_type == "IPMI" || device.bmc_type == "DRAC"){
                device.controller_message = device.bmc_type + ' Stats';
                device.power_on = null;
                device.action_support = null;
                device.action_message = 'Start Server';
                $http({
                    method: "GET",
                    url: '/customer/bm_servers/'+ device.uuid + '/power_status/',
                }).then(function (response) {
                    var response_power_str = response.data;
                    response_power_str = response_power_str.split('\n');
                    if(response_power_str[0] === 'Chassis Power is on'){
                        device.power_on = true;
                        device.action_support = 'power_off';
                        device.action_message = 'Stop Server';
                        device.controller_message = device.bmc_type + ' Stats';
                    }else{
                        device.controller_message = 'Server Powered off';
                        device.power_on = false;
                        device.action_support = 'power_on';
                        device.action_message = 'Start Server';
                    }
                }).catch(function (error) {
                    device.action_support = null;
                    device.action_message = 'Device not Configured with IPMI/DRAC';
                    device.controller_message = 'Device not Configured with IPMI/DRAC';
                });
            }
            else{
                device.action_support = null;
                device.action_message = 'Device not Configured with IPMI/DRAC';
                device.controller_message = 'Device not Configured with IPMI/DRAC';
            }
        };

        var manageSwitchesData = function (page_no) {
            if ($scope.switches) {
                $http.get('/customer/switches/', {params: {'uuid': id}}).then(function (response) {
                    // $scope.switchesData = response.data.results;
                    // $scope.loader = false;
                    // $scope.switches_loaded = true;
                    $scope.model = response.data;
                    if(page_no == 1){
                        $scope.switchesData = response.data.results;
                    }else{
                        for(var i = 0; i < response.data.results.length; i++){
                            $scope.switchesData.push(response.data.results[i]);
                        }
                    }
                    $scope.loader = false;
                    $scope.switches_loaded = true;
                });
            } else {
                $scope.loader = false;
                $scope.switches_loaded = true;
            }
        };

        var manageFirewallsData = function (page_no) {
            if ($scope.firewalls) {
                $http.get('/customer/firewalls/', {params: {'uuid': id}}).then(function (response) {
                    // $scope.firewallsData = response.data.results;
                    // $scope.loader = false;
                    // $scope.firewalls_loaded = true;

                    $scope.model = response.data;
                    if(page_no == 1){
                        $scope.firewallsData = response.data.results;
                    }else{
                        for(var i = 0; i < response.data.results.length; i++){
                            $scope.firewallsData.push(response.data.results[i]);
                        }
                    }
                    $scope.loader = false;
                    $scope.firewalls_loaded = true;
                });
            } else {
                $scope.loader = false;
                $scope.firewalls_loaded = true;
            }
        };

        var manageLoadBalancersData = function (page_no) {
            if ($scope.load_balancers) {
                $http.get('/customer/load_balancers/', {params: {'uuid': id}}).then(function (response) {
                    // $scope.loadBalancersData = response.data.results;
                    // $scope.loader = false;
                    // $scope.load_balancers_loaded = true;

                    $scope.model = response.data;
                    if(page_no == 1){
                        $scope.load_balancersData = response.data.results;
                    }else{
                        for(var i = 0; i < response.data.results.length; i++){
                            $scope.load_balancersData.push(response.data.results[i]);
                        }
                    }
                    $scope.loader = false;
                    $scope.load_balancers_loaded = true;
                });
            } else {
                $scope.loader = false;
                $scope.load_balancers_loaded = true;
            }
        };

        var manageCustomDevicesData = function () {
            if ($scope.custom_devices) {
                $scope.loader = true;
                $http.get('/customer/customdevices/', {params: {'uuid': id}}).then(function (response) {
                    $scope.customDevicesData = response.data.results;
                    if ($scope.customDevicesData.length>0){
                        for (var i=0; i<$scope.customDevicesData.length; i++){
                            $scope.get_uptime_details($scope.customDevicesData[i]);
                        }
                    }
                    $scope.loader = false;
                    $scope.custom_devices_loaded = true;
                    console.log("$scope.customDevicesData : ", angular.toJson($scope.customDevicesData));
                });
            } else {
                $scope.loader = false;
                $scope.custom_devices_loaded = true;
            }
        };

        //$scope.device_alerts = [];
        var manageAlertsData = function () {

            var total_alerts = [];
            $scope.cloud_uuid = id;
            $scope.alerts_data = $http.get('/customer/private_cloud/' + id + '/alerts_data/',{params: {'detail_flag': false}});
            $scope.alerts_data.then(function (response){

                if(response.data.error === undefined){
                    angular.forEach(response.data.device_alerts, function (value, key) {
                        total_alerts = total_alerts.concat(value);
                    });
                    $scope.device_alerts = total_alerts;
                    $scope.loader = false;
                    $scope.alerts_loaded = true;
                }
                else{
                    AlertService2.danger(response.data.error);
                    $scope.alerts_loaded = true;
                }
                console.log('$scope.device_alerts : ', angular.toJson($scope.device_alerts));
            }).catch(function (error, status) {
                   $scope.alerts_loaded = true;
            });

        };

        $scope.customdevicedetailspopoverobj = {
            templateUrl: 'customdevicedetailstemplate.html',
        };

        $scope.get_uptime_details = function(device){
            var url = '/customer/uptimerobot/' + device.uptime_robot_id + '/get_device_uptime_data';
            $http.get(url).then(function (response) {
                device.details = response.data;
            }).catch(function (error) {
                // AlertService2.danger(error.data);
                device.details = null;
            });
        };

        $scope.show_uptime_details = function(device){
            $scope.device_details = device.details; 
        };

        $scope.show_customdevice_details = function(device){
            $scope.customdevice = device; 
            showModal('static/rest/app/client/templates/modals/customdevice_detail.html');
        };

        $scope.powerStatusToggle = function (index, instance_id, vm_poweron_state, cloud_type) {
            $scope.power_loader = false;
            if (vm_poweron_state === true) {
                $scope.vm_power_state = 'POWER OFF';
            }
            else {
                $scope.vm_power_state = 'POWER ON';
            }

            var modalInstance;
            modalInstance = $uibModal.open({
                templateUrl: 'static/rest/app/templates/snippets/confirmation_modal.html',
                scope: $scope,
                size: 'md'
            });

            $scope.cancel = function () {
                modalInstance.close();
            };

            $scope.showVMWareAuthModal = function(){
                if (cloud_type == "VMware"){
                    $scope.vmware_auth_modal = "Please provide Vcenter credentials to " + $scope.vm_power_state +" this VM.";
                }
                else if (cloud_type == "OpenStack"){
                    $scope.vmware_auth_modal = "Please provide Openstack Controller credentials to " + $scope.vm_power_state +" this VM.";
                }
                $scope.cancel();
                modalInstance = $uibModal.open({
                    templateUrl: 'static/rest/app/templates/snippets/vmware_auth_modal.html',
                    scope: $scope,
                    size: 'md'
                });
            };

            $scope.powerToggle = function (vcenter_username, vcenter_password) {
                console.log("Index : " + index);
                $scope.vcenterUsernameErr = false;
                $scope.vcenterUsernameErrMsg = null;
                $scope.vcenterPasswordErr = false;
                $scope.vcenterPasswordErrMsg = null;

                if (vcenter_username==null || vcenter_username==''){
                    $scope.vcenterUsernameErr = true;
                    $scope.vcenterUsernameErrMsg = '(Username is mandatory)';
                    return 0;
                }
                if (vcenter_password==null || vcenter_password==''){
                    $scope.vcenterPasswordErr = true;
                    $scope.vcenterPasswordErrMsg = '(Password is mandatory)';
                    return 0;
                }
                if (cloud_type === "VMware") {
                    $scope.vmware_result[index].powerStateLoading = true;
                    if (vm_poweron_state === true) {
                        var url = '/rest/vmware/migrate/power_off/';
                        var msg_alert = 'VM Powered Off';
                    } else {
                        var url = '/rest/vmware/migrate/power_on/';
                        var msg_alert = 'VM Powered On';
                    }
                } else if (cloud_type === "OpenStack") {
                    $scope.openstack_result[index].powerStateLoading = true;
                    if (vm_poweron_state === true) {
                        var url = '/rest/openstack/migration/power_off/';
                        var msg_alert = 'VM Powered Off';
                    } else {
                        var url = '/rest/openstack/migration/power_on/';
                        var msg_alert = 'VM Powered On';
                    }
                    $scope.loader = true;
                } else {
                    AlertService2.warning("VM not found!");
                    return;
                }
                $scope.cancel();
                return $http({
                    url: url,
                    data: {
                        'vm_id': instance_id,
                        'cloud_uuid': id,
                        'vcenter_username': vcenter_username,
                        'vcenter_password': vcenter_password
                    },
                    method: 'POST'
                }).then(function (response) {
                if (response.data.hasOwnProperty('task_id')) {
                    AlertService2.success('Request has been submitted. It will take few mins to complete.');
                    TaskService2.processTask(response.data.task_id, 500).then(function (result) {
                        if (result) {
                            if (result.error){
                                AlertService2.danger(result.error);
                            }
                            if (result.success){
                                AlertService2.success(msg_alert);
                                $scope.vmware_result[index] = result.success;
                                $scope.setVmwarePowerState();
                            }
                        }
                        $scope.vmware_result[index].powerStateLoading = false;
                    }).catch(function (error) {
                        AlertService2.danger("Server Error");
                        $scope.vmware_result[index].powerStateLoading = false;
                    });
                } else {
                    AlertService2.success(msg_alert);
                    $scope.openstack_result[index] = response.data;
                    $scope.openstack_result[index].powerStateLoading = false;
                    $scope.setOpenStackPowerState();
                    $scope.loader = false;
                }
                }).catch(function (response) {
                    AlertService2.danger(response.data);
                    if (cloud_type === "VMware") {
                        $scope.vmware_result[index].powerStateLoading = false;
                    }
                    else if(cloud_type === "OpenStack"){
                        $scope.openstack_result[index].powerStateLoading = false;
                    }
                    modalInstance.close();
                    $scope.loader = false;
                });
            };
        };

        $scope.console_vm = function (instance_id) {
            // AlertService2.danger('Coming soon....');
            $window.location.href = "/main#/vmware-vm/webconsole/iframe/" + instance_id;
            $window.location.reload();
        };


        var defineVMwareformElements = function () {
            $scope.vmware_rows = [
                {name: 'name', description: "Name", required: true},
                {name: 'Power Status', description: "Power Status", required: true, is_sort_disabled: true},
                {name: 'os_name', description: "Operating System", required: true},
                // {name: 'host_name', description: "Host Name", required: true},
                // {name: 'cpu_core', description: "CPU Cores", required: true},
                // {name: 'vcpus', description: "vCPUs", required: true},
                // {name: 'guest_memory', description: "Memory (MB)", required: true},
                {name: 'management_ip', description: "Management IP", required: true},
                // {name: 'state', description: "Power State", required: true},
            ];
        };

        var defineOpenStackformElements = function () {
            $scope.openstack_rows = [
                {name: 'name', description: "Name", required: true},
                {name: 'Power Status', description: "Power Status", required: true, is_sort_disabled: true},
                // {name: 'os_id', description: "ID", required: true},
                // {name: 'vcpu', description: "vCPUs", required: true},
                // {name: 'memory', description: "Memory (MB)", required: true},
                // {name: 'disk', description: "Disk (GB)", required: true},
                {name: 'operating_system', description: "Image", required: true},
                // {name: 'ip_address', description: "IP Address", required: true},
                {name: 'management_ip', description: "Management IP", required: true},
                // {name: 'last_known_state', description: "Power State", required: true}
            ];
        };

        var manangeVMwareVms = function (response, id) {
            $scope.uuid = id;
            $http({
                url: '/rest/vmware/migrate/virtual_machines/',
                method: 'GET',
                params: {
                    cloud_id: $scope.uuid,
                },
            }).then(function (response) {
                if (response.data.hasOwnProperty('task_id')) {
                    TaskService2.processTask(response.data.task_id, 500).then(function (result) {
                        if (result) {
                            $http({
                                url: '/rest/vmware/migrate/',
                                params: {'page': 1, 'page_size': 10, 'cloud_id': $scope.uuid},
                                method: 'GET',
                            }).then(function (response) {
                                $scope.vmware_result = angular.copy(response.data.results);
                                $scope.model_results = angular.copy($scope.vmware_result);
                                $scope.model_count = angular.copy(response.data.count);
                                $scope.platform_type = 'VMware';
                                $scope.vmware_loaded = true;
                                $scope.setVmwarePowerState();
                                // angular.forEach($scope.vmware_result, function (value, key) {
                                //     if (value.state == "poweredOn"){
                                //         value.power = true;
                                //     }else{
                                //         value.power = false;
                                //     }
                                // });
                            });
                        }

                    }).catch(function (error) {
                        AlertService2.danger("Error while fetching VMware virtual machines:");
                        $scope.vmware_result = [];
                        $scope.vmware_loaded = true;
                    });
                } else {
                    $scope.vmware_result = response.data;
                    $scope.vmware_loaded = true;
                    $scope.platform_type = response.data.platform_type;
                    $scope.setVmwarePowerState();
                    // angular.forEach($scope.vmware_result, function (value, key) {
                    //     if (value.state == "poweredOn"){
                    //         value.power = true;
                    //     } else{
                    //         value.power = false;
                    //     }
                    // });
                }
            });
            defineVMwareformElements();
        };

        var manangeOpenStackVms = function (response, id) {
            $scope.openstack_loaded = false;
            $scope.uuid = id;
            $http({
                url: '/rest/openstack/migration/' + id + '/virtual_machines/',
                method: 'GET',
            }).then(function (response) {
                if (response.data.hasOwnProperty('task_id')) {
                    TaskService2.processTask(response.data.task_id, 500).then(function (result) {
                        if (result) {
                            $http({
                                url: '/rest/openstack/migration/',
                                params: {'page': 1, 'page_size': 10, 'cloud_id': $scope.uuid},
                                method: 'GET',
                            }).then(function (response) {
                                $scope.openstack_result = response.data.results;
                                console.log('$scope.openstack_result : ', angular.toJson($scope.openstack_result));
                                $scope.openstack_loaded = true;
                                $scope.platform_type = 'Openstack';
                                $scope.model_results = $scope.openstack_result;
                                $scope.model_count = response.data.count;
                                $scope.setOpenStackPowerState();
                            });
                        }
                    }).catch(function (error) {
                        AlertService2.danger("Error while fetching OpenStack virtual machines");
                        $scope.openstack_result = [];
                        $scope.openstack_loaded = true;
                    });
                } else {
                    $scope.openstack_result = response.data;
                    console.log('$scope.openstack_result : ', angular.toJson($scope.openstack_result));
                    $scope.openstack_loaded = true;
                    $scope.platform_type = response.data.platform_type;
                    $scope.setOpenStackPowerState();
                }
            });
            defineOpenStackformElements();
        };

        var manageCustomCloudVMs = function (response, id) {
            $scope.uuid = id;
            $http({
                url: '/rest/customer/virtual_machines/',
                params: {'page': 1, 'page_size': 10, 'cloud_id': $scope.uuid},
                method: 'GET',
            }).then(function (response) {
                $scope.custom_cloud_result = response.data.results;
                $scope.custom_cloud_loaded = true;
                $scope.platform_type = 'Custom';
                $scope.model_results = $scope.custom_cloud_result;
                $scope.model_count = response.data.count;
            }).catch(function (error) {
                AlertService2.danger("Error while fetching OpenStack virtual machines");
                $scope.custom_cloud_result = [];
                $scope.custom_cloud_loaded = true;
            });
            // defineOpenStackformElements();
        };

        $scope.get_cloud_vms = function (id, params) {
            $http.get('/customer/private_cloud_fast/' + id + '/').then(function (response) {
                $scope.cloud_type = response.data.platform_type;
                switch ($scope.cloud_type) {
                    case 'VMware' :
                        $scope.vmware_loaded = false;
                        $scope.vmware_result = undefined;
                        $scope.model_results = [];
                        $scope.model_count = 0;
                        manangeVMwareVms(response, id);
                        break;

                    case 'OpenStack' :
                        $scope.openstack_loaded = false;
                        $scope.openstack_result = undefined;
                        $scope.model_results = [];
                        $scope.model_count = 0;
                        manangeOpenStackVms(response, id);
                        break;

                    case 'Custom' :
                        $scope.custom_cloud_loaded = false;
                        $scope.custom_cloud_result = undefined;
                        $scope.model_results = [];
                        $scope.model_count = 0;
                        manageCustomCloudVMs(response, id);
                        break;
                    default :
                        $scope.hyperV_result = [];
                        $scope.loader = false;
                        $scope.showNotification('No Records !!', 'danger');
                        // AlertService2.danger('No Records !!');
                        $scope.model_results = [];
                        $scope.model_count = 0;
                        break;
                }
            });
        };

        var manageVirtualMachinesData = function () {
            // $scope.vmware_result = [];
            // $scope.openstack_result = [];

            $scope.loader = true;
            $scope.get_cloud_vms(id);
            $scope.loader = false;
        };

        $scope.show_device_stats = function(device_id, device_type){
            console.log('device_id : ', device_id);
            console.log('device_type : ', device_type);
            console.log('$state.current.name : ', $state.current.name);
            var cloud_name = $state.current.name.split('.').slice(1, -1)[0];
            console.log('cloud_name : ', cloud_name);
            var target_state = '';
            switch(device_type){
                case 'switch': 
                    target_state = 'private_cloud.'+ cloud_name + '.switch';
                    break;
                case 'firewall': 
                    target_state = 'private_cloud.'+ cloud_name + '.firewall';
                    break;
                case 'load_balancer': 
                    target_state = 'private_cloud.'+ cloud_name + '.load_balancer';
                    break;
                case 'hypervisor': 
                    target_state = 'private_cloud.'+ cloud_name + '.hypervisor';
                    break;
                case 'vmwarevm': 
                    localStorage.setItem('vm_platform_type', 'VMware');
                    target_state = 'private_cloud.'+ cloud_name + '.virtual_machine';
                    break;
                case 'openstackvm': 
                    localStorage.setItem('vm_platform_type', 'Openstack');
                    target_state = 'private_cloud.'+ cloud_name + '.virtual_machine';
                    break;
                case 'customvm':
                    localStorage.removeItem('vm_platform_type'); 
                    target_state = 'private_cloud.'+ cloud_name + '.virtual_machine';
                    break;
                default :

            }
            localStorage.setItem('isAllDevicesStats', true);
            $state.go(target_state, {uuidp: id, uuidc:device_id}, {reload: false});
        };

        var get_vmware_vms = function (id) {

            $http({
                url: '/rest/vmware/migrate/',
                params: {'page': 1, 'page_size': 0, 'cloud_id': id},
                method: 'GET',
            }).then(function (response) {
                $scope.virtual_machines = angular.copy(response.data);
                $scope.virtual_machines_loaded = true;
            }).catch(function (error) {
                AlertService2.danger("Error while fetching Virtual machines");
                $scope.virtual_machines_loaded = true;
            });
        };

        var get_openstack_vms = function (id) {
            $http({
                url: '/rest/openstack/migration/',
                params: {'page': 1, 'page_size': 0, 'cloud_id': id},
                method: 'GET',
            }).then(function (response) {
                $scope.virtual_machines = angular.copy(response.data);
                $scope.virtual_machines_loaded = true;
            }).catch(function (error) {
                AlertService2.danger("Error while fetching Virtual machines");
                $scope.virtual_machines_loaded = true;
            });
        };

        var get_custom_cloud_vms = function (id) {
            $http({
                url: '/rest/customer/virtual_machines/',
                params: {'page': 1, 'page_size': 0, 'cloud_id': id},
                method: 'GET',
            }).then(function (response) {
                $scope.virtual_machines = angular.copy(response.data);
                $scope.virtual_machines_loaded = true;
            }).catch(function (error) {
                AlertService2.danger("Error while fetching Virtual machines");
                $scope.virtual_machines_loaded = true;
            });
        };

        $scope.get_vm_types = function(){
            $http.get('/customer/private_cloud_fast/' + id + '/').then(function (response) {
                $scope.cloud_platform_type = response.data.platform_type;
                $scope.virtual_machines_loaded = false;
                switch ($scope.cloud_platform_type) {
                    case 'VMware' :
                        get_vmware_vms(id);
                        break;
                    case 'OpenStack' :
                        get_openstack_vms(id);
                        break;
                    case 'Custom' :
                        get_custom_cloud_vms(id);
                        break;
                    default :
                        $scope.showNotification('No Records !!', 'danger');
                        break;
                }
            });
        };

        var page_no = 1;

        var managePrivateCloudData = function () {
            switch ($scope.tabname) {
                case 'summary' :
                    $scope.esxiData = undefined;
                    $rootScope.showConsole = false;
                    manageSummayData();
                    break;
                case 'hypervisors' :
                    $scope.hypervisors = true;
                    $scope.hypervisors_loaded = false;
                    $rootScope.showConsole = false;
                    manageHypervisorsData(page_no);
                    break;
                case 'baremetals' :
                    $scope.baremetalservers = true;
                    $scope.baremetals_loaded = false;
                    $rootScope.showConsole = false;
                    manageBaremetalsData();
                    break;
                case 'virtual_machines':
                    $scope.esxiData = undefined;
                    $rootScope.showConsole = false;
                    manageVirtualMachinesData();
                    break;
                case 'load_balancers':
                    $scope.load_balancers = true;
                    $scope.load_balancers_loaded = false;
                    $rootScope.showConsole = false;
                    manageLoadBalancersData(page_no);
                    break;
                case 'switches':
                    $scope.switches = true;
                    $scope.switches_loaded = false;
                    $rootScope.showConsole = false;
                    manageSwitchesData(page_no);
                    break;
                case 'firewalls':
                    $scope.firewalls = true;
                    $scope.firewalls_loaded = false;
                    $rootScope.showConsole = false;
                    manageFirewallsData(page_no);
                    break;
                case 'all_devices':
                    $scope.alerts_loaded = false;
                    $rootScope.showConsole = false;
                    break;
                case 'other_devices':
                    $scope.custom_devices = true;
                    $scope.custom_devices_loaded = false;
                    $rootScope.showConsole = false;
                    manageCustomDevicesData();
                    break;
            }
        };

        $scope.$watch(function () {
            return $location.path();
        }, function (value) {
            $scope.tabname = value.split('/').pop();

            var urlend = value.split('/').slice(0, -1).pop();
            var urlend_overview = value.split('/').slice(0, -1).slice(0, -1).pop();

            if ((urlend === 'hypervisor') || (urlend_overview === 'hypervisor') || (urlend === 'firewall') || (urlend_overview === 'firewall')
            || (urlend === 'load_balancer') || (urlend_overview === 'load_balancer') || (urlend_overview === 'virtual_machine') || (urlend === 'virtual_machine')
            || (urlend === 'switch') || (urlend_overview === 'switch') || (urlend === 'baremetal_ipmi')
            || (urlend_overview === 'baremetal_ipmi') || (urlend === 'baremetal_drac') || (urlend_overview === 'baremetal_drac')) {
                $scope.is_observium_enabled = true;
            }else {
                $scope.is_observium_enabled = false;
            }

            if (value.indexOf("cloud") !== -1) { //Avoid calling in devices.firewalls state
                id = value.split('/').slice(0, -1).pop();
                console.log('id : ', angular.toJson(id));
                $scope.loader = true;
                $scope.model_results = [];
                $scope.searchKeyword = '';
                $scope.model_count = 0;
                managePrivateCloudData();

            }
        });

        $scope.popoverobj = {
            templateUrl: 'devicedetailstemplate.html',
        };

        var getDeviceName = function(device_name){
            var obj = {};
            switch(device_name){
                case 'hypervisor' :
                    obj.device_name = 'Hypervisor Statistics';
                    obj.device_api_name = 'servers';
                    return obj;
                case 'bm_server' :
                    obj.device_name = 'Bare Metal Server Statistics';
                    obj.device_api_name = 'servers';
                    return obj;
                case 'vmware' :
                    obj.device_name = 'VMware Virtual Machine Statistics';
                    obj.device_api_name = 'vmware';
                    return obj;
                case 'vcloud' :
                    obj.device_name = 'vCloud Virtual Machine Statistics';
                    obj.device_api_name = 'vcloud';
                    return obj;
                case 'openstack' :
                    obj.device_name = 'Openstack Virtual Machine Statistics';
                    obj.device_api_name = 'openstack';
                    return obj;
                case 'custom_vm' :
                    obj.device_name = 'Custom Virtual Machine Statistics';
                    obj.device_api_name = 'custom_vm';
                    return obj;
                case 'firewall' :
                    obj.device_name = 'Firewall Statistics';
                    obj.device_api_name = 'firewall';
                    return obj;
                case 'load_balancer' :
                    obj.device_name = 'LoadBalancer Statistics';
                    obj.device_api_name = 'load_balancer';
                    return obj; 
                case 'switch' :
                    obj.device_name = 'Switch Statistics';
                    obj.device_api_name = 'switch';
                    return obj; 
                default : 
                    console.log('something went wrong');
            }
        };

        $scope.get_observium_details = function (device_name, device) {
            var device_obj = getDeviceName(device_name);
            if (device_obj.device_api_name === ('openstack' || 'custom_vm')){
                device.uuid = device.instance_id;
            }
            device.observium_details = {};
            device.message = device_obj.device_name;
            $http({
                method: "GET",
                url: '/customer/observium/'+ device_obj.device_api_name + '/' + device.uuid + '/get_device_data/'
            }).then(function (response) {
                device.observium_details = response.data;
                device.observium_details.device_data.uptime = $scope.getuptime(response.data);
            }).catch(function (error) {
                device.observium_details = null;
                device.message = $rootScope.monitoring_not_enabled_msg;
            });
        };

        $scope.show_observium_details = function (device) {
            $scope.device_details = device.observium_details;
        };

        $scope.show_full_details = function(server){
            $scope.bm_details = angular.copy(server);
            showModal('baremetal_full_details.html');
        };

        $scope.show_controller_statistics = function(device_id, bmc_type){
            var target_state = $state.current.name.slice(0, -1);
            console.log("target_state : " + target_state);
            var bmc_type = "DRAC";
            if (bmc_type == "IPMI"){
                target_state = target_state + '_ipmi';
                $state.go(target_state, {uuidp: id, uuidc:device_id}, {reload: false});
            }
            else{
                target_state = target_state + '_drac';
                $state.go(target_state, {uuidp: id, uuidc: device_id}, {reload: false});
            }
        };

        $scope.xtermConsoleSameTab = function (index, instance_id) {
            $scope.loader = true;
            $http({
                method: "GET",
                url: '/customer/bm_servers/' + instance_id
            }).then(function (response) {

                $scope.loader = false;
                $scope.device_name = response.data.server.name;

                if (response.data.management_ip) {
                    $scope.request = {
                        hostname: response.data.management_ip,
                        port: parseInt(response.data.port),
                    };
                }
                else {
                    $scope.disableAccess = true;
                }

                $rootScope.showConsole = false;
                $scope.endpoint = "/customer/bm_servers/" + instance_id + "/check_auth/";
                var modalInstance = $uibModal.open({
                    templateUrl: 'xtermAuthenticate.html',
                    scope: $scope,
                    size: 'md',
                    controller: 'VMAuthController',
                    keyboard: false
                });
                modalInstance.result.then();

            }).catch(function (error) {
                return error;
            });
        };

        $scope.show_device_statistics = function(device_id, platform_type){
            if ($state.current.name.includes('switch')){
                var target_state = $state.current.name.slice(0, -2);    
            }
            else{
                var target_state = $state.current.name.slice(0, -1);
            }
            $scope.constant_platform_type = $scope.platform_type;
            $state.go(target_state, {uuidp: id, uuidc:device_id}, {reload: false});
        };

        $scope.show_server_statistics = function (device_id) {
            localStorage.setItem('isBareMetalStats', true);
            var bm_target_state = $state.current.name;
            var bm_array = bm_target_state.split(".");
            bm_array.splice(-1, 1);
            bm_array.push('hypervisor');
            var target_bm = bm_array.join(".");
            $state.go(target_bm, {uuidc: device_id}, {reload: false});
        };

        $scope.manage_bmserver_actions = function(device){
            $scope.selected = device;
            $scope.close_confirm = function(){
                modalSupport.dismiss('cancel');
            };

            if(device.power_on == true){
                $scope.bm_server_power_state = "Power Off";
            }
            else{
                $scope.bm_server_power_state = "Power On";
            }
            $scope.ipmi_username = device.bm_controller.username;
            modalSupport = $uibModal.open({
                template: '<div class="modal-content">' +
                    '<div class="modal-header">' +
                    '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' +
                    '<h4 class="modal-title">&nbsp; Bare Metal Server</h4>' +
                    '</div>' +
                    '<div class="modal-body">Are you sure you want to continue with this action?</div>' +
                    '<div class="modal-footer modal-button">' +
                    '<button class="btn btn-cancel" type="button" ng-click="close_confirm()">No</button>' +
                    '<button class="btn btn-default" type="submit" ng-click="confirm_action(selected)">Yes</button>' +
                    '</div>' +
                    '</div>',
                scope: $scope,
            });

            modalSupport.result.then(function (selectedItem) {
                $scope.selected = selectedItem;
            }, function () {
            });

            $scope.showIPMIAuthModal = function(){
                $scope.close_confirm();
                modalSupport = $uibModal.open({
                    templateUrl: 'static/rest/app/templates/snippets/ipmi_auth_modal.html',
                    scope: $scope,
                    size: 'md'
                });
            };
            $scope.confirm_action = function(ipmi_username, ipmi_password){

                $scope.ipmiUsernameErr = false;
                $scope.ipmiUsernameErrMsg = null;
                $scope.ipmiPasswordErr = false;
                $scope.ipmiPasswordErrMsg = null;

                if (ipmi_username==null || ipmi_username==''){
                    $scope.ipmiUsernameErr = true;
                    $scope.ipmiUsernameErrMsg = '(Username is mandatory)';
                    return 0;
                }
                if (ipmi_password==null || ipmi_password==''){
                    $scope.ipmiPasswordErr = true;
                    $scope.ipmiPasswordErrMsg = '(Password is mandatory)';
                    return 0;
                }
                $scope.close_confirm();
                $scope.loader = true;
                $http({
                    method: "POST",
                    data: {
                        'ipmi_username': ipmi_username,
                        'ipmi_password': ipmi_password
                    },
                    url: '/customer/bm_servers/'+ device.uuid + '/check_password/',
                }).then(function (response) {
                    console.log("Password validated Successfully");
                    $scope.ipmiPowerToggle();
                }).catch(function (error){
                    $scope.loader = false;
                    AlertService2.danger("Invalid Credential.");
                });
            };

            $scope.ipmiPowerToggle = function(){
                var msg = "";
                $http({
                    method: "POST",
                    url: '/customer/bm_servers/'+ device.uuid + '/' + device.action_support + '/',
                }).then(function (response) {
                    var response_power_str = response.data;
                    response_power_str = response_power_str.split('\n');
                    if(response_power_str[0] === 'Chassis Power Control: Up/On'){
                        device.power_on = true;
                        device.action_support = 'power_off';
                        device.action_message = 'Stop Server';
                        device.controller_message = device.bmc_type + ' Stats';
                        msg = "Started <b>" + device.server.name + "</b> Successfully";

                    }else{
                        device.power_on = false;
                        device.action_support = 'power_on';
                        device.action_message = 'Start Server';
                        device.controller_message = 'Server Powered off';
                        msg = "Stopped <b>" + device.server.name + "</b> Successfully";
                    }
                    $scope.loader = false;
                    AlertService2.success(msg);
                }).catch(function (error) {
                    $scope.loader = false;
                    AlertService2.success("Something went wrong !... Please try again later");
                });
            };
        };

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
        };

        $scope.show_vm_details = function(vm){
            $scope.vm_details = vm;
            if(vm.cloud.platform_type === 'OpenStack'){
                showModal('static/rest/app/client/templates/modals/openstack_vm_details.html');
            }else {
                showModal('static/rest/app/client/templates/modals/vmware_vm_details.html');
            }
        };

        $scope.close_modal = function(){
            modalSupport.dismiss('cancel');
        };
        
        $scope.getItems = function (item_type) {
            var _m = {
                'servers': CustomerServer,
                'vms': CustomerVirtualMachine,
                'switches': CustomerSwitch,
                'firewalls': CustomerFirewall,
                'load_balancers': CustomerLoadBalancer
            };
            return new SearchService(_m[item_type]).search;
        };

        $scope.portSearch = new SearchService(CustomerGraphedPort).search;

        var status_dict = {
            "IN": "In-Progress",
            "C": "Completed",
            "NA": "N/A",
            "F": "Failed"
        };

        $scope.cloudRedirect = function (uuid, platform_type, name) {
            $scope.tabname = 'virtual_machines';
            name = name.replace(/\s/g, '');
            name = name.toLowerCase();
            angular.element('.acttwocls ul').children('li').eq(0).removeClass("active");
            var vm_state = 'private_cloud.' + name + '.' + 'virtual_machines';
            $state.go(vm_state, {'uuidc': 'virtual_machines'}, {reload: false});
            $timeout(function () {
                angular.element('.actonecls ul').children('li').eq($rootScope.secondLevelActiveIndex).addClass("active");
                angular.element('.acttwocls ul').children('li').eq(4).addClass("active");
                $rootScope.thirdLevelActiveIndex = 4;
                // $scope.setTabSelectionsLocalObj();
            });

            console.log('second level active index : ', $rootScope.secondLevelActiveIndex);
            manageVirtualMachinesData();
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
            $http.get('/customer/azure/' + data.short + '/resource_group/').then(function (response) {
                $scope.azure_resource_list = [];
                angular.forEach(response.data, function (value, key) {
                    $scope.azure_resource_list.push({long: value.name, short: value.name, account: data.short});
                });
            });
        };

        $scope.loadAzureStorageList = function (data) {
            $http.get('/customer/azure/' + data.account + '/resource_group/' + data.short + '/storage_account/').then(function (response) {
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
            $http.get('/customer/azure/' + data.account + '/resource_group/' + data.resourcegroup + '/' + data.short + '/blob/').then(function (response) {
                $scope.azure_container_list = [];
                angular.forEach(response.data, function (value, key) {
                    $scope.azure_container_list.push({long: value.name, short: value.name});
                });
            });
        };

        $scope.loadAwsRegionList = function (data) {
            $scope.aws_region_list = [];
            angular.forEach($scope.aws_region_data, function (value, key) {
                if (value.account == data.short) {
                    angular.forEach(value.region, function (item, index) {
                        $scope.aws_region_list.push({long: item, short: item, account: value.account});
                    });
                }
            });
        };

        $scope.loadAwsBucketList = function (data) {
            $http.get('/customer/aws/' + data.account + '/region/' + data.short + '/s3_bucket/').then(function (response) {
                $scope.aws_bucket_list = [];
                angular.forEach(response.data.Buckets, function (value, key) {
                    $scope.aws_bucket_list.push({long: value.Name, short: value.Name});
                });
            });
        };

        $scope.vmbackup_params = {};

        $scope.vmwareBackup = function (account) {
            //small wait so that celery updates the status of tasks
            // $timeout(function () {
            //     $scope.get_vms_backup_migration();
            // }, 5000);
            // AlertService2.success("VM back up Process Initiated. Process will take a while");
            AlertService2.success("VM back up Process Initiated. Process will take a while");
            $http.post('/rest/vmware/migrate/vmware_vm_backup/', {
                "instance_id": $scope.vmbackup_params['vm_id'],
                'target_type': $scope.vmbackup_params['target_type'],"cloud_uuid": $stateParams.id, "account": account
            }).success(function (response) {
                // AlertService2.success("VM backup image stored successfully in "+target_type+" storage ");
                var msg = "VM backup image stored successfully in " + $scope.vmbackup_params['target_type'] + " storage ";
                AlertService2.success(msg);
                $scope.load_vm_list($scope.cloud_list_select);
            })
                .error(function (error, status) {
                    if (status != 504) {
                        AlertService2.danger("Failed while downloading VM image" + error);
                        var msg = "Failed while downloading VM image" + error;
                        AlertService2.danger(msg);
                        // $scope.get_vms_backup_migration();
                    }
                });
        };

        $scope.openstackBackup = function (account) {

            // AlertService2.success("VM back up Process Initiated. Process will take a while");
            AlertService2.success("VM back up Process Initiated. Process will take a while");
            //small wait so that celery updates the status of tasks
            // $timeout(function () {
            //     $scope.get_vm_snapshots();
            // }, 5000);
            $http.post('/rest/v3/vm_backup/download_vm_snapshots/', {
                "vm_id": $scope.openstack_backup_params['vm_id'],
                'target_type': $scope.openstack_backup_params['target_type'],
                "cloud_uuid": $stateParams.id,
                "account": account
            }).success(function (response) {
                // AlertService2.success("VM backup image stored successfully in "+target_type+" storage ");
                var msg = "VM backup image stored successfully in " + $scope.openstack_backup_params['target_type'] + " storage ";
                AlertService2.success(msg, 'success');

            })
                .error(function (error, status) {
                    if (status != 504) {
                        // AlertService2.danger("Failed while downloading VM image" + error);
                        AlertService2.danger("Failed while downloading VM image" + error);
                        // $scope.get_vm_snapshots();
                    }

                });

        };

        $scope.backupVMWareVm = function (vm_id, target_type, index) {
            $scope.clear_account_selectbox();
            var account_data = [];
            $scope.cloud_type = 'vmware';
            $scope.vmbackup_params['vm_id'] = vm_id;
            $scope.vmbackup_params['target_type'] = target_type;

            if (target_type == 'AWS') {
                $http.get('/customer/aws/').then(function (response) {
                    $scope.aws_account_list = [];
                    $scope.aws_region_data = [];

                    angular.forEach(response.data.results, function (value, key) {
                        $scope.aws_account_list.push({long: value.aws_user + ' -- ' + value.account_name, short: value.id});
                        $scope.aws_region_data.push({account: value.id, region: value.region});
                    });
                });
                $scope.awsAccountSelection();
            }
            if (target_type == 'Azure') {
                $http.get('/customer/azure/').then(function (response) {
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
            AlertService2.info("Backup History will be available very soon.");
        };

        $scope.migrateOpenStackVm = function (vm_id, target_type, index) {
            //TODO remove it with modal after demo

            var response = confirm("VM Migration is initializing. Do you want to continue ?");
            if (response == false) {
                return;
            }

            $http.post('/rest/openstack/migration/vm_migrate/', {
                "instance_id": vm_id,
                'cloud_id': $stateParams.id,
                "target_type": target_type
            }).success(function (response) {

                // AlertService2.success("VM migration initiated successfully. Process will take a while.");
                AlertService2.success("VM migration initiated successfully. Process will take a while.");
                // $scope.get_vms_backup_migration();
            })
                .error(function (response) {
                    AlertService2.danger("Failed while migrating VM to AWS : ");
                });
        };

        $scope.migrateVMWareVm = function (vm_id, target_type, index) {
            var response = confirm("VM Migration is initializing. Do you want to continue ?");
            if (response == false) {
                return;
            }

            $http.post('/rest/vmware/migrate/vm_migrate/', {
                "instance_id": vm_id,
                'cloud_id': $stateParams.id,
                "target_type": target_type
            }).success(function (response) {

                AlertService2.success("VM migration initiated successfully. Process will take a while.");
                // $scope.get_vms_backup_migration();
            })
                .error(function (response) {
                    AlertService2.danger(response);
                });
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
        };

        $scope.setVmwarePowerState = function () {
            angular.forEach($scope.vmware_result, function (value, key) {
                if (value.state == "poweredOn") {
                    value.power = true;
                } else {
                    value.power = false;
                }
            });
        };

        $scope.setOpenStackPowerState = function () {
            angular.forEach($scope.openstack_result, function (value, key) {
                if (value.last_known_state == "ACTIVE") {
                    value.power = true;
                } else {
                    value.power = false;
                }
            });
        };


        $scope.get_vms = function (params) {
            $scope.pagination_results_loaded = false;
            if ($scope.platform_type == 'VMware') {
                var url = '/rest/vmware/migrate/';
            }
            if ($scope.platform_type == 'Openstack') {
                var url = '/rest/openstack/migration/';
            }
            $http({
                url: url,
                params: params,
                method: 'GET',
            }).then(function (response) {
                if ($scope.page > 1) {
                    if ($scope.platform_type == 'VMware') {
                        $scope.vmware_result.push.apply($scope.vmware_result, response.data.results);
                        $scope.model_results = $scope.vmware_result;
                        $scope.model_count = response.data.count;
                        $scope.setVmwarePowerState();
                    }
                    else {
                        $scope.openstack_result.push.apply($scope.openstack_result, response.data.results);
                        $scope.model_results = $scope.openstack_result;
                        $scope.model_count = response.data.count;
                        $scope.setOpenStackPowerState();
                    }
                }
                else {
                    if ($scope.platform_type == 'VMware') {
                        $scope.vmware_result = response.data.results;
                        $scope.model_results = $scope.vmware_result;
                        $scope.model_count = response.data.count;
                        $scope.setVmwarePowerState();
                    }
                    else {
                        $scope.openstack_result = response.data.results;
                        $scope.model_results = $scope.openstack_result;
                        $scope.model_count = response.data.count;
                        $scope.setOpenStackPowerState();
                    }
                }
                $scope.pagination_results_loaded = true;
            });
        };

        $scope.sort = {
            sortingColumn: '',
            reverse: false
        };
        $scope.title = {
            plural: "Virtual Machines",
            singular: "Virtual Machine"
        };
        $scope.disable_action = true;
        $scope.disable_action_btn = true;
        $scope.searchKeyword = '';
        $scope.page = 1;

        // $scope.scrollbarConfig = {
        //     theme: 'light-3',
        //     scrollInertia: 500,
        //     autoHideScrollbar: false,
        //     setHeight: '90%',
        //     axis: 'y',
        //     advanced: {
        //         updateOnContentResize: true
        //     },
        //     scrollButtons: {
        //         scrollAmount: 'auto', // scroll amount when button pressed
        //         enable: true // enable scrolling buttons by default
        //     }
        // };

        $scope.loadPageData = function () {
            var params = {
                'page': $scope.page + 1,
                'page_size': 10,
                'ordering': $scope.sortingColumn,
                'search': $scope.searchKeyword,
                'cloud_id': $scope.uuid
            };
            if (($scope.page * 10) < $scope.model_count) {
                $scope.page = $scope.page + 1;
                $scope.get_vms(params);
            }
        };

        $scope.getSearchResults = function (sk) {
            $scope.searchKeyword = sk;
            $scope.page = 1;
            if (sk.length == 0) {
                var params = {
                    'cloud_id': $scope.uuid,
                    'page': 1,
                    'page_size': 10,
                    'ordering': $scope.sortingColumn
                };
            }
            else {
                var params = {
                    'cloud_id': $scope.uuid,
                    'page': 1,
                    'page_size': 10,
                    'search': sk,
                    'ordering': $scope.sortingColumn
                };
            }
            $scope.get_vms(params);
        };

        $scope.getSortingResults = function (sort) {
            $scope.sortingColumn = sort.sortingColumn;
            $scope.page = 1;
            var params = {
                'cloud_id': $scope.uuid,
                'page': $scope.page,
                'page_size': 10,
                'ordering': sort.sortingColumn,
                'search': $scope.searchKeyword
            };
            $scope.get_vms(params);
        };

        $scope.vmConsoleSameTab = function (index, instance_id, cloud_type) {

            if (cloud_type === 'VMware') {
                $http({
                    method: "GET",
                    url: '/customer/vmware_vms/' + instance_id + '/details/'
                }).then(function (response) {

                    $scope.loader = false;
                    $scope.device_name = response.data.vm_name;

                    if (response.data.ip_address) {
                        $scope.request = {
                            hostname: response.data.ip_address,
                            port: 2122,
                            // username: "root",
                            // password: ""
                        };
                    }
                    else {
                        $scope.disableAccess = true;
                    }

                    $rootScope.showConsole = false;
                    $scope.endpoint = "/rest/vmware_vms/" + instance_id + "/check_auth/";
                    var modalInstance = $uibModal.open({
                        templateUrl: 'vmAuthentcicate.html',
                        scope: $scope,
                        size: 'md',
                        controller: 'VMAuthController',
                        // backdrop  : 'static',
                        keyboard: false
                    });
                    modalInstance.result.then();

                }).catch(function (error) {
                    return error;
                });
            }
            else if (cloud_type === 'OpenStack') {
                $http({
                    method: "GET",
                    url: '/rest/openstack/migration/' + instance_id + '/details/'
                }).then(function (response) {

                    $scope.loader = false;
                    $scope.device_name = response.data.vm_name;

                    if (response.data.ip_address) {
                        $scope.request = {
                            hostname: response.data.ip_address,
                            port: 2122,
                            // username: "root",
                            // password: ""
                        };
                    }
                    else {
                        $scope.disableAccess = true;
                    }

                    $scope.endpoint = "/rest/openstack/migration/" + instance_id + "/check_auth/";
                    var modalInstance = $uibModal.open({
                        templateUrl: 'vmAuthentcicate.html',
                        scope: $scope,
                        size: 'md',
                        controller: 'VMAuthController',
                        // backdrop  : 'static',
                        keyboard: false
                    });
                    modalInstance.result.then();

                }).catch(function (error) {
                    return error;
                });
            }

            else if (cloud_type === 'Custom') {
                $http({
                    method: "GET",
                    url: '/rest/customer/virtual_machines/' + instance_id + '/'
                }).then(function (response) {

                    $scope.loader = false;
                    $scope.device_name = response.data.name;

                    if (response.data.management_ip) {
                        $scope.request = {
                            hostname: response.data.management_ip,
                            port: 2122,
                            // username: "root",
                            // password: ""
                        };
                    }
                    else {
                        $scope.disableAccess = true;
                    }

                    $scope.endpoint = "/rest/customer/virtual_machines/" + instance_id + "/check_auth/";
                    var modalInstance = $uibModal.open({
                        templateUrl: 'vmAuthentcicate.html',
                        scope: $scope,
                        size: 'md',
                        controller: 'VMAuthController',
                        // backdrop  : 'static',
                        keyboard: false
                    });
                    modalInstance.result.then();

                }).catch(function (error) {
                    return error;
                });
            }
        };

        $scope.closeVM = function () {
            console.log("Closing VM........");
            $scope.updateTitle();
            $rootScope.showConsole = false;
        };
    }
]);

app.controller('CustomerDBInstanceController', [
    '$scope',
    '$rootScope',
    '$http',
    '$stateParams',
    'AlertService2',
    '$uibModal',
    'CustomerPrivateCloud',
    'TaskService2',
    function ($scope, $rootScope, $http, $stateParams, AlertService2, $uibModal, CustomerPrivateCloud, TaskService2) {

        $scope.cloud_option_list = [];
        $scope.db_instances = {};
        $scope.page_no = 1;
        $scope.searchkey = '';
        $scope.sortkey = '';
        $scope.sort = {
            sortingColumn: '',
            reverse: false
        };

        var getParamsObj = function () {
            var urlObj = {};
            if (($scope.sortkey !== undefined) && ($scope.sortkey !== null) && ($scope.sortkey !== '')) {
                urlObj.ordering = $scope.sortkey;
            }
            urlObj.page = $scope.page_no;
            if (($scope.searchkey !== undefined) && ($scope.searchkey !== null) && ($scope.searchkey !== '')) {
                urlObj.search = $scope.searchkey;
            }
            urlObj.cloud_id = $scope.uuid;
            return urlObj;
        };

        $scope.get_database_instances_from_db = function () {
            $http({
                url: '/rest/vmware/db_instance/',
                params: getParamsObj(),
                method: 'GET',
            }).then(function (response) {
                if ($scope.page_no === 1)
                    $scope.db_instances = response.data; //VM Migration related VMs
                else {
                    $scope.db_instances.count = response.data.count;
                    $scope.db_instances.results = $scope.db_instances.results.concat(response.data.results);
                }


            }).catch(function (error) {
                $scope.db_instances.count = 0;
                $scope.db_instances.results = {length: 0};
                AlertService2.danger("Error in loading DB Instances");
                $scope.db_instance_unsupported = "No DB Instance Available";

            });
        };

        $scope.getSortingResults = function (sort) {
            if ((sort !== undefined) && (sort !== null) && (sort !== '')) {
                $scope.page_no = 1;
                $scope.sortkey = sort.sortingColumn;
                $scope.get_database_instances_from_db();
            }
        };

        $scope.getSearchResults = function () {
            $scope.page_no = 1;
            $scope.get_database_instances_from_db();
        };

        $scope.get_database_instances = function (uuid) {
            $scope.uuid = uuid;
            $http({
                url: '/rest/vmware/db_instance/populate_database_instance_list',
                method: "GET",
                params: {cloud_id: uuid}
            }).then(function (response) {
                if (response.data.hasOwnProperty('task_id')) {
                    TaskService2.processTask(response.data.task_id, 500).then(function (result) {
                        if (result) {
                            $scope.get_database_instances_from_db();
                        }
                    }).catch(function (error) {
                        $scope.db_instances.count = 0;
                        $scope.db_instances.results = {length: 0};
                        AlertService2.danger("Error in loading DB Instances");
                        $scope.db_instance_unsupported = "No DB Instance Available";
                    });
                } else
                    $scope.db_instances = response.data;
            }).catch(function (error) {
                AlertService2.danger('Error in loading DB Instances');
                $scope.db_instance_show = false;
                $scope.db_instances.count = 0;
                $scope.db_instances.results = {length: 0};
                $scope.db_instance_unsupported = "No DB Instance Available";
                return error;
            });
        };

        $http.get('/customer/private_cloud_fast/').then(function (response) {
            $scope.cloud_option_list.length = 0;
            $scope.cloud_response = response.data.results;
            $scope.vmware_cloud_list = [];
            angular.forEach(response.data.results, function (value, key) {
                $scope.cloud_option_list.push({short: value.uuid, long: value.name, platform_type: value.platform_type});
                if (value.platform_type == "VMware") {
                    $scope.vmware_cloud_list.push({short: value.uuid, long: value.name});
                }
            });
            // Load the page with first found cloud
            $scope.vmware_cloud_uuid_list = [];
            if ($scope.cloud_option_list.length > 0) {
                $scope.cloud_list_select = $scope.vmware_cloud_list[0];
                $scope.selected_cloud_uuid = $scope.cloud_list_select.short;
                angular.forEach($scope.vmware_cloud_list, function (value, key) {
                    $scope.vmware_cloud_uuid_list.push(value.short);
                });
                $scope.db_instance_show = true;
                $scope.get_database_instances($scope.cloud_list_select.short);
            }
            else {
                // $scope.db_instance_show = false;
                $scope.db_instance_show = false;
                $scope.db_instances.count = 0;
                $scope.db_instances.results = {length: 0};
                $scope.db_instance_unsupported = "No cloud associated with this organization. ";
            }
        });

        $scope.reload_data = function (response) {
            $scope.db_instances = response;
        };

        $scope.vcenterCredentials = function(vm_id){
            $scope.vcenter_username = "";
            $scope.vcenter_password = "";

            var modalInstance = $uibModal.open({
                templateUrl: 'static/rest/app/templates/snippets/vmware_auth_modal.html',
                scope: $scope,
                size: 'md'
            });

            $scope.cancel = function() {
                modalInstance.close();
            };
            
            $scope.powerToggle = function(vc_username, vc_password){
                $scope.vcenter_username = vc_username;
                $scope.vcenter_password = vc_password;

                $scope.vcenterUsernameErr = false;
                $scope.vcenterUsernameErrMsg = null;
                $scope.vcenterPasswordErr = false;
                $scope.vcenterPasswordErrMsg = null;

                if (vc_username==null || vc_username==''){
                    $scope.vcenterUsernameErr = true;
                    $scope.vcenterUsernameErrMsg = '(Username is mandatory)';
                    return 0;
                }
                if (vc_password==null || vc_password==''){
                    $scope.vcenterPasswordErr = true;
                    $scope.vcenterPasswordErrMsg = '(Password is mandatory)';
                    return 0;
                }

                AlertService2.success('Validating Vcenter credentials. Please wait.');
                $scope.cancel();
                var data = {
                    'vm_id': vm_id,
                    'vcenter_username': vc_username,
                    'vcenter_password': vc_password,
                    'cloud_uuid': $scope.uuid
                };
                $http.post('/rest/vmware/migrate/vcenter_auth_check/', data).success(function (response) {
                    AlertService2.success('Successfully authenticated.');
                    $scope.showAddDbInstanceModal();
                }).error(function (response) {
                    AlertService2.danger(response);
                });
            };
        };


        $scope.createDbInstance = function () {
            if ($scope.db_instance_show){
                $scope.vcenterCredentials();
            }
        };

        $scope.showAddDbInstanceModal = function(){
            var modalInstance = $uibModal.open({
                templateUrl: 'createDbInstance.html',
                scope: $scope,
                size: 'md',
                controller: 'CreateDBInstanceController'
            });
            modalInstance.result.then();
        };

        $scope.load_db_instance = function (cloud_list_select) {
            if (cloud_list_select == null) {
                return;
            }
            if ($scope.vmware_cloud_uuid_list.indexOf(cloud_list_select.short) !== -1) {
                delete $scope.db_instances.results;
                delete $scope.db_instances.count;
                $scope.selected_cloud_uuid = cloud_list_select.short;
                $scope.db_instance_show = true;
                $scope.get_database_instances(cloud_list_select.short);
            }
            else {
                $scope.db_instance_show = false;
                $scope.db_instances.count = 0;
                $scope.db_instances.results = {length: 0};
                $scope.db_instance_unsupported = "This feature is not available for " + cloud_list_select.platform_type + " Cloud";
            }
        };

        $scope.loadMoreResults = function () {
            if (angular.isDefined($scope.db_instances.count) && angular.isDefined($rootScope.configObject.page_size)) {
                if (($scope.page_no * $rootScope.configObject.page_size) < $scope.db_instances.count) {
                    $scope.page_no = $scope.page_no + 1;
                    $scope.get_database_instances_from_db();
                }
            }
        };
    }
]);

app.controller('BackupHistoryController', [
    '$scope',
    '$uibModalInstance',
    '$http',
    '$stateParams',
    'AlertService2',
    'TaskService2',
    function ($scope, $uibModalInstance, $http, $stateParams, AlertService2, TaskService2) {
        $scope.cancel = function () {
            $uibModalInstance.dismiss();
        };
        if ($scope.backup_type == "OpenStack") {
            $http.get('/rest/v3/vm_backup/' + $scope.backup_id + '/openstack_backup_history/').then(function (result) {
                $scope.backup_history = result.data.openstack_backup_list;
            });
        }
        else {
            $http.get('/rest/vmware/migrate/' + $scope.backup_id + '/vmware_backup_history/').then(function (result) {
                $scope.backup_history = result.data.vmware_backup_list;
            });
        }
    }
]);

app.controller('AwsAccountSelectionController', [
    '$scope',
    '$uibModalInstance',
    '$http',
    '$stateParams',
    'AlertService2',
    'TaskService2',
    'AwsService',
    function ($scope, $uibModalInstance, $http, $stateParams, AlertService2, TaskService2, AwsService) {


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

app.controller('MigartionAwsAccountSelectionController', [
    '$scope',
    '$uibModalInstance',
    '$http',
    '$stateParams',
    'AlertService2',
    'TaskService2',
    'AwsService',
    function ($scope, $uibModalInstance, $http, $stateParams, AlertService2, TaskService2, AwsService) {
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


app.controller('AzureAccountSelectionController', [
    '$scope',
    '$uibModalInstance',
    '$http',
    '$stateParams',
    'AlertService2',
    'TaskService2',
    function ($scope, $uibModalInstance, $http, $stateParams, AlertService2, TaskService2) {
        var required_message = " is required";

        $scope.create = function (request) {
            $scope.azure_account_list_errmsg = '';
            $scope.azure_resource_list_errmsg = '';
            $scope.azure_storage_list_errmsg = '';
            $scope.azure_container_list_errmsg = '';

            var stop_execution = false;
            if (request === undefined) {
                $scope.azure_account_list_errmsg = 'Azure Account' + required_message;
                $scope.azure_resource_list_errmsg = 'Resource group' + required_message;
                $scope.azure_storage_list_errmsg = 'Storage account' + required_message;
                $scope.azure_container_list_errmsg = 'Container' + required_message;
                return;
            }
            if (request.azure_account_list === undefined) {
                $scope.azure_account_list_errmsg = 'Azure Account' + required_message;
                stop_execution = true;
            }
            if (request.azure_resource_list === undefined) {
                $scope.azure_resource_list_errmsg = 'Resource group' + required_message;
                stop_execution = true;
            }
            if (request.azure_storage_list === undefined) {
                $scope.azure_storage_list_errmsg = 'Storage account' + required_message;
                stop_execution = true;
            }
            if (request.azure_container_list === undefined) {
                $scope.azure_container_list_errmsg = 'Container' + required_message;
                stop_execution = true;
            }
            if (stop_execution) {
                return;
            }

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

app.controller('CreateDBInstanceController', [
    '$scope',
    '$uibModalInstance',
    '$http',
    '$parse',
    '$stateParams',
    'AlertService2',
    'TaskService2',
    function ($scope, $uibModalInstance, $http, $parse, $stateParams, AlertService2, TaskService2) {
        $scope.request = {};
        $scope.request.database = "MYSQL";

        $scope.create = function (request) {
            var validation_msg = "This field is required";
            var ip_validation_msg = "This field is required or Invalid IP address";
            var stop_execution = false;
            $scope.database_errmsg = '';
            $scope.vm_name_errmsg = '';
            $scope.hostname_errmsg = '';
            $scope.ram_size_errmsg = '';
            $scope.cpus_errmsg = '';
            $scope.internal_ip_errmsg = '';
            $scope.routable_ip_errmsg = '';

            if (request === undefined) {
                //$scope.database_errmsg = validation_msg;
                $scope.vm_name_errmsg = validation_msg;
                $scope.hostname_errmsg = validation_msg;
                $scope.ram_size_errmsg = validation_msg;
                $scope.cpus_errmsg = validation_msg;
                $scope.internal_ip_errmsg = validation_msg;
                $scope.routable_ip_errmsg = validation_msg;
                return;
            }
            if (request.database === undefined || request.database == '') {
                $scope.database_errmsg = validation_msg;
                stop_execution = true;
            }
            if (request.vm_name === undefined) {
                $scope.vm_name_errmsg = validation_msg;
                stop_execution = true;
            }
            if (request.hostname === undefined) {
                $scope.hostname_errmsg = validation_msg;
                stop_execution = true;
            } else if (!(/^([a-zA-Z0-9]+)$/.test(request.hostname) )) {
                $scope.hostname_errmsg = 'Hostname should contain only numbers and characters';
                stop_execution = true;
            }
            if (request.ram_size === undefined) {
                $scope.ram_size_errmsg = validation_msg;
                stop_execution = true;
            }
            if (request.cpus === undefined) {
                $scope.cpus_errmsg = validation_msg;
                stop_execution = true;
            }
            if (request.internal_ip === undefined) {
                $scope.internal_ip_errmsg = ip_validation_msg;
                stop_execution = true;
            }
            if (request.routable_ip === undefined) {
                $scope.routable_ip_errmsg = ip_validation_msg;
                stop_execution = true;
            }
            request.cloud = $scope.selected_cloud_uuid;
            if ($scope.selected_cloud_uuid == null) {
                AlertService2.success("Please select a cloud from dropdown");
                stop_execution = true;
            }
            if (stop_execution) {
                return;
            }
            request.vcenter_username = $scope.vcenter_username;
            request.vcenter_password = $scope.vcenter_password;
            $http.post("/rest/vmware/db_instance/", request).then(function (response) {
                $uibModalInstance.close();
                //model.assign($scope, 42);
                AlertService2.success("DB instance deployment is initializing.");
                if (response.data.hasOwnProperty('task_id')) {
                    // TaskService2.processTask(response.data.task_id, 500).then(function (result) {
                    //     $scope.get_database_instances($scope.selected_cloud_uuid);
                    // )};
                    // $scope.get_database_instances($scope.selected_cloud_uuid);
                }
                else {
                    // $scope.get_database_instances($scope.selected_cloud_uuid);
                    $scope.reload_data(response.data);
                }
            }).catch(function (error) {
                angular.forEach(error.data, function (value, key) {
                    var field_name = key + '_errmsg';
                    var model = $parse(field_name);
                    model.assign($scope, value);
                });
                console.clear();
            });
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss();
        };
    }
]);

app.controller('CustomerVmBackupController', [
    '$scope',
    '$rootScope',
    '$http',
    '$timeout',
    '$uibModal',
    'AlertService2',
    'TableHeaders',
    'TaskService2',
    function ($scope, $rootScope, $http, $timeout, $uibModal,
              AlertService2, TableHeaders, TaskService2) {

        $scope.page_no = 1;
        $scope.searchkey = '';
        $scope.sortkey = '';
        $scope.sort = {
            sortingColumn: '',
            reverse: false
        };

        var status_dict = {
            'IN': 'In-Progress',
            'C': 'Completed',
            'NA': 'N/A',
            'F': 'Failed'
        };
        $scope.vm_snapshots = {};
        $scope.vm_list_message = '';
        $scope.cloud_list = [];

        $scope.show_empty_message = function () {
            $scope.vm_snapshots = {};
            $scope.vm_list_message = 'No records to display';
        };

        var getParamsObj = function () {
            var urlObj = {};
            if (($scope.sortkey !== undefined) && ($scope.sortkey !== null) && ($scope.sortkey !== '')) {
                urlObj.ordering = $scope.sortkey;
            }
            urlObj.page = $scope.page_no;
            if (($scope.searchkey !== undefined) && ($scope.searchkey !== null) && ($scope.searchkey !== '')) {
                urlObj.search = $scope.searchkey;
            }
            urlObj.cloud_id = $scope.uuid;
            return urlObj;
        };

        $scope.get_vms_from_db = function () {
            $http({
                url: $scope.apiurl,
                params: getParamsObj(),
                method: 'GET',
            }).then(function (response) {
                if ($scope.page_no === 1)
                    $scope.vm_snapshots = response.data; //VM Migration related VMs
                else {
                    $scope.vm_snapshots.count = response.data.count;
                    $scope.vm_snapshots.results = $scope.vm_snapshots.results.concat(response.data.results);
                }
            });
        };

        $scope.getSortingResults = function (sort) {
            if ((sort !== undefined) && (sort !== null) && (sort !== '')) {
                $scope.page_no = 1;
                $scope.sortkey = sort.sortingColumn;
                $scope.get_vms_from_db();
            }
        };

        $scope.getSearchResults = function () {
            $scope.page_no = 1;
            $scope.get_vms_from_db();
        };

        $scope.loadMoreResults = function () {
            if (angular.isDefined($scope.vm_snapshots.count) && angular.isDefined($rootScope.configObject.page_size)) {
                if (($scope.page_no * $rootScope.configObject.page_size) < $scope.vm_snapshots.count) {
                    $scope.page_no = $scope.page_no + 1;
                    $scope.get_vms_from_db();
                }
            }
        };

        $scope.get_openstack_vm = function () {
            $http({
                url: '/rest/v3/vm_backup/get_vm_list/',
                method: 'GET',
                params: {
                    cloud_id: $scope.uuid
                }
            }).then(function (response) {
                if (response.data.hasOwnProperty('task_id')) {
                    TaskService2.processTask(response.data.task_id, 500).then(function (result) {
                        if (result) {
                            $scope.apiurl = '/rest/openstack/migration/';
                            $scope.get_vms_from_db();
                        }
                        if (result.data == false) {
                            AlertService2.danger(result.message);
                        }
                    }).catch(function (error) {
                        $scope.vm_snapshots = {}; //VM Migration related VMs
                        AlertService2.danger('Unable to fetch OpenStack VMs. Please contact Administrator');
                    });
                } else {
                    $scope.vm_snapshots = response.data;
                    if (response.data.length == 0) {
                        $scope.show_empty_message();
                    }
                }
                $scope.vm_backup_headers = TableHeaders.openstack_backup_headers;
            }).catch(function (e) {
                $scope.vm_snapshots = {};
                AlertService2.danger('Unable to fetch OpenStack VMs. Please contact Adminstrator');
            });
        };

        $scope.get_vmware_vm = function () {
            $http({
                url: '/rest/vmware/migrate/virtual_machines/',
                method: 'GET',
                params: {
                    'cloud_id': $scope.uuid
                },
            }).then(function (response) {
                if (response.data.hasOwnProperty('task_id')) {
                    TaskService2.processTask(response.data.task_id, 500).then(function (result) {
                        if (result) {
                            $scope.apiurl = '/rest/vmware/migrate/';
                            $scope.page_no = 1;
                            $scope.get_vms_from_db();
                        }
                        if (result.data == false) {
                            AlertService2.danger(result.message);
                        }
                    }).catch(function (error) {
                        $scope.show_empty_message(); // VM Backup related VMs
                        AlertService2.danger('Unable to fetch VMware VMs. Please contact Adminstrator');
                    });
                } else {
                    $scope.vm_snapshots = response.data;
                }
            }).catch(function (e) {
                $scope.vm_snapshots = {};
                AlertService2.danger('Unable to fetch VMware VMs. Please contact Adminstrator');
            });
            $scope.vm_backup_headers = TableHeaders.vmware_vm_headers;
        };

        $scope.get_vm_snapshots = function (selection) {
            if (selection.platform_type === 'VMware') {
                $scope.get_vmware_vm();
            } else if (selection.platform_type === 'OpenStack') {
                $scope.get_openstack_vm();
            } else {
                $scope.backup_instance_show = false;
                $scope.vm_snapshots.results = {length: 0};
                $scope.vm_snapshots.count = 0;
                $scope.backup_instance_unsupported = "This feature is not available for " + selection.platform_type + " Cloud";
                // AlertService2.danger($scope.backup_instance_unsupported);
                // $scope.show_empty_message();
            }
        };

        $scope.load_vm_list = function (data) {
            $scope.vm_snapshots = {};
            $scope.vm_list_message = '';
            $scope.backup_instance_unsupported = '';
            $scope.uuid = data.short.uuid;
            $scope.get_vm_snapshots(data.short);
        };

        $http.get('/customer/private_cloud_fast/').then(function (response) {
            $scope.cloud_list.length = 0;
            angular.forEach(response.data.results, function (value, key) {
                $scope.cloud_list.push({
                    short: {uuid: value.uuid, platform_type: value.platform_type},
                    long: value.name
                });
            });
            if ($scope.cloud_list.length > 0) {
                $scope.cloud_list_select = $scope.cloud_list[0];
                $scope.load_vm_list($scope.cloud_list_select);
            } else {
                $scope.backup_instance_show = false;
                $scope.vm_snapshots.results = {length: 0};
                $scope.vm_snapshots.count = 0;
                $scope.backup_instance_unsupported = "No cloud associated with this organization. ";

            }
        });

        $scope.backup_status_check = function (data) {
            return !(( data == null ) ||( data == 'Backup to Azure Complete' ) ||
            ( data == 'Backup to Amazon S3 Complete' ) || ( data == 'Operation Failed'));
        };

        $scope.backupOpenStackVm = function (vm_id, target_type, index, vm_data) {
            if (vm_data.last_known_state == "ACTIVE") {
                AlertService2.danger("You need to power off VM " + vm_data.name + " to enable Backup.");
                return;
            }
            $scope.clear_account_selectbox();
            var account_data = [];
            $scope.cloud_type = 'openstack';
            $scope.openstack_backup_params['vm_id'] = vm_id;
            $scope.openstack_backup_params['target_type'] = target_type;

            if (target_type == 'AWS') {
                $http.get('/customer/aws/').then(function (response) {
                    $scope.aws_region_data = [];
                    $scope.aws_account_list = [];
                    angular.forEach(response.data.results, function (value, key) {
                        $scope.aws_account_list.push({long: value.aws_user + ' -- ' + value.account_name, short: value.id});
                        $scope.aws_region_data.push({account: value.id, region: value.region});
                    });
                });
                $scope.awsAccountSelection();
            }
            if (target_type == 'Azure') {
                $http.get('/customer/azure/').then(function (response) {
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
            $http.get('/customer/azure/' + data.short + '/resource_group/').then(function (response) {
                $scope.azure_resource_list = [];
                angular.forEach(response.data, function (value, key) {
                    $scope.azure_resource_list.push({long: value.name, short: value.name, account: data.short});
                });
            });
        };

        $scope.loadAzureStorageList = function (data) {
            $http.get('/customer/azure/' + data.account + '/resource_group/' + data.short + '/storage_account/').then(function (response) {
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
            $http.get('/customer/azure/' + data.account + '/resource_group/' + data.resourcegroup + '/' + data.short + '/blob/').then(function (response) {
                $scope.azure_container_list = [];
                angular.forEach(response.data, function (value, key) {
                    $scope.azure_container_list.push({long: value.name, short: value.name});
                });
            });
        };

        $scope.loadAwsRegionList = function (data) {
            $scope.aws_region_list = [];
            angular.forEach($scope.aws_region_data, function (value, key) {
                if (value.account == data.short) {
                    angular.forEach(value.region, function (item, index) {
                        $scope.aws_region_list.push({long: item, short: item, account: value.account});
                    });
                }
            });
        };

        $scope.loadAwsBucketList = function (data) {
            $http.get('/customer/aws/' + data.account + '/region/' + data.short + '/s3_bucket/').then(function (response) {
                $scope.aws_bucket_list = [];
                angular.forEach(response.data.Buckets, function (value, key) {
                    $scope.aws_bucket_list.push({long: value.Name, short: value.Name});
                });
            });
        };

        $scope.vmbackup_params = {};
        $scope.openstack_backup_params = {};

        $scope.vmwareBackup = function (account) {
            $http.post('/rest/vmware/migrate/vmware_vm_backup/', {
                "instance_id": $scope.vmbackup_params['vm_id'],
                'target_type': $scope.vmbackup_params['target_type'], "cloud_uuid": $scope.uuid, "account": account,
                'vcenter_username': $scope.vcenter_username,
                'vcenter_password': $scope.vcenter_password,
            }).success(function (response) {
                AlertService2.success("VM back up Process Initiated. Process will take a while");
                $scope.load_vm_list($scope.cloud_list_select);
            }).error(function (error, status) {
                AlertService2.danger(error);
            });
        };

        $scope.openstackBackup = function (account) {
            //small wait so that celery updates the status of tasks
            $http.post('/rest/v3/vm_backup/create_openstack_backup/', {
                "vm_id": $scope.openstack_backup_params['vm_id'],
                'target_type': $scope.openstack_backup_params['target_type'],
                "cloud_uuid": $scope.uuid,
                "account": account
            }).success(function (response) {
                AlertService2.success("VM back up Process Initiated. Process will take a while");
                $scope.load_vm_list($scope.cloud_list_select);
            }).error(function (error, status) {
                AlertService2.danger(error);
            });
        };

        $scope.vcenterCredentials = function(type, vm_id){
            $scope.vcenter_username = "";
            $scope.vcenter_password = "";

            var modalInstance = $uibModal.open({
                templateUrl: 'static/rest/app/templates/snippets/vmware_auth_modal.html',
                scope: $scope,
                size: 'md'
            });

            $scope.cancel = function() {
                modalInstance.close();
            };
            
            $scope.powerToggle = function(vc_username, vc_password, index){
                $scope.vcenter_username = vc_username;
                $scope.vcenter_password = vc_password;

                $scope.vcenterUsernameErr = false;
                $scope.vcenterUsernameErrMsg = null;
                $scope.vcenterPasswordErr = false;
                $scope.vcenterPasswordErrMsg = null;

                if (vc_username==null || vc_username==''){
                    $scope.vcenterUsernameErr = true;
                    $scope.vcenterUsernameErrMsg = '(Username is mandatory)';
                    return 0;
                }
                if (vc_password==null || vc_password==''){
                    $scope.vcenterPasswordErr = true;
                    $scope.vcenterPasswordErrMsg = '(Password is mandatory)';
                    return 0;
                }

                AlertService2.success('Validating Vcenter credentials. Please wait.');
                $scope.cancel();
                var data = {
                    'vm_id': vm_id,
                    'vcenter_username': vc_username,
                    'vcenter_password': vc_password,
                    'cloud_uuid': $scope.uuid
                };
                $http.post('/rest/vmware/migrate/vcenter_auth_check/', data).success(function (response) {
                    AlertService2.success('Successfully authenticated.');
                    if (type=='aws'){
                        $scope.awsAccountSelection();    
                    }
                    if (type=='azure'){
                        $scope.azureAccountSelection();    
                    }
                }).error(function (response) {
                    AlertService2.danger(response);
                });
            };
        };


        $scope.backupVMWareVm = function (vm_id, target_type, index, vm_data) {
            if (vm_data.state == "poweredOn") {
                AlertService2.danger("You need to power off VM " + vm_data.name + " to enable Backup.");
                return;
            }
            $scope.clear_account_selectbox();
            var account_data = [];
            $scope.cloud_type = 'vmware';
            $scope.vmbackup_params['vm_id'] = vm_id;
            $scope.vmbackup_params['target_type'] = target_type;

            if (target_type == 'AWS') {
                $http.get('/customer/aws/').then(function (response) {
                    $scope.aws_account_list = [];
                    $scope.aws_region_data = [];

                    angular.forEach(response.data.results, function (value, key) {
                        $scope.aws_account_list.push({long: value.aws_user + ' -- ' + value.account_name, short: value.id});
                        $scope.aws_region_data.push({account: value.id, region: value.region});
                    });
                    if ($scope.aws_account_list.length==0){
                        $scope.awsAccountSelection();
                    }
                    else{
                        $scope.vcenterCredentials('aws', $scope.vmbackup_params['vm_id']);
                    }
                });
            }
            if (target_type == 'Azure') {
                $http.get('/customer/azure/').then(function (response) {
                    $scope.azure_account_list = [];
                    angular.forEach(response.data.results, function (value, key) {
                        $scope.azure_account_list.push({
                            long: value.account_name + '  ' + value.subscription_id, short: value.id,
                            subscription: value.subscription_id
                        });
                    });
                    if ($scope.azure_account_list.length==0){
                        $scope.azureAccountSelection();
                    }
                    else{
                        $scope.vcenterCredentials('azure', $scope.vmbackup_params['vm_id']);
                    }
                });
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
        };
    }
]);

app.controller('CustomerVmMigrationController', [
    '$scope',
    '$rootScope',
    '$http',
    '$uibModal',
    'AlertService2',
    'TableHeaders',
    'TaskService2',
    function ($scope, $rootScope, $http, $uibModal, AlertService2, TableHeaders, TaskService2) {

        $scope.virtual_machines = {};

        $scope.page_no = 1;
        $scope.searchkey = '';
        $scope.sortkey = '';
        $scope.sort = {
            sortingColumn: '',
            reverse: false
        };

        var getParamsObj = function () {
            var urlObj = {};
            if (($scope.sortkey !== undefined) && ($scope.sortkey !== null) && ($scope.sortkey !== '')) {
                urlObj.ordering = $scope.sortkey;
            }
            urlObj.page = $scope.page_no;
            if (($scope.searchkey !== undefined) && ($scope.searchkey !== null) && ($scope.searchkey !== '')) {
                urlObj.search = $scope.searchkey;
            }
            urlObj.cloud_id = $scope.uuid;
            return urlObj;
        };

        $scope.get_migrations_from_db = function () {
            $http({
                url: $scope.apiurl,
                params: getParamsObj(),
                method: 'GET',
            }).then(function (response) {
                if ($scope.page_no === 1)
                    $scope.virtual_machines = response.data; //VM Migration related VMs
                else {
                    $scope.virtual_machines.count = response.data.count;
                    $scope.virtual_machines.results = $scope.virtual_machines.results.concat(response.data.results);
                }
            });
        };

        $scope.getSortingResults = function (sort) {
            if ((sort !== undefined) && (sort !== null) && (sort !== '')) {
                $scope.page_no = 1;
                $scope.sortkey = sort.sortingColumn;
                $scope.get_migrations_from_db();
            }
        };

        $scope.getSearchResults = function () {
            $scope.page_no = 1;
            $scope.get_migrations_from_db();
        };

        $scope.loadMoreResults = function () {
            if (angular.isDefined($scope.virtual_machines.count) && angular.isDefined($rootScope.configObject.page_size)) {
                if (($scope.page_no * $rootScope.configObject.page_size) < $scope.virtual_machines.count) {
                    $scope.page_no = $scope.page_no + 1;
                    $scope.get_migrations_from_db();
                }
            }
        };

        $scope.get_vmware_vm_migraions = function () {
            $scope.vm_migrate_show = true;
            $http({
                url: '/rest/vmware/migrate/virtual_machines/',
                method: 'GET',
                params: {
                    'cloud_id': $scope.uuid
                },
            }).then(function (response) {
                if (response.data.hasOwnProperty('task_id')) {
                    TaskService2.processTask(response.data.task_id, 500).then(function (result) {
                        if (result) {
                            $scope.apiurl = '/rest/vmware/migrate/';
                            $scope.page_no = 1;
                            $scope.get_migrations_from_db();
                        }
                        if (result.data == false) {
                            AlertService2.danger(result.message);
                        }
                    }).catch(function (error) {
                        $scope.virtual_machines = {}; //VM Migration related VMs
                        AlertService2.danger('Unable to fetch VMware VMs. Please contact Administrator');
                    });
                } else {
                    $scope.virtual_machines = response.data;
                    if (response.data.length == 0) {
                        $scope.show_empty_message();
                    }
                }
            }).catch(function (e) {
                $scope.virtual_machines = {}; //VM Migration related VMs
                AlertService2.danger('Unable to fetch VMware VMs. Please contact Administrator');
            });
            $scope.vm_headers = TableHeaders.vmware_migration_headers;
        };

        $scope.get_openstack_vm_migraions = function () {
            $http({
                url: '/rest/v3/vm_backup/get_vm_list/',
                method: 'GET',
                params: {
                    cloud_id: $scope.uuid,
                }
            }).then(function (response) {
                if (response.data.hasOwnProperty('task_id')) {
                    TaskService2.processTask(response.data.task_id, 500).then(function (result) {
                        if (result) {
                            $scope.apiurl = '/rest/openstack/migration/';
                            $scope.page_no = 1;
                            $scope.get_migrations_from_db();
                        }
                        if (result.data == false) {
                            AlertService2.danger(result.message);
                        }
                    }).catch(function (error) {
                        $scope.virtual_machines = {}; //VM Migration related VMs
                        AlertService2.danger('Unable to fetch OpenStack VMs. Please contact Adminstrator');
                    });
                } else {
                    $scope.virtual_machines = response.data;
                    if (response.data.length == 0) {
                        $scope.show_empty_message();
                    }
                }

            }).catch(function (e) {
                $scope.virtual_machines = {}; //VM Migration related VMs
                AlertService2.danger('Unable to fetch OpenStack VMs. Please contact Adminstrator');
            });
            $scope.vm_headers = TableHeaders.openstack_migration_headers;
        };

        $scope.get_vm_migrations = function (selection) {
            $scope.vmware_vms = '';
            if (selection.platform_type === 'VMware') {
                $scope.get_vmware_vm_migraions();
            } else if (selection.platform_type === 'OpenStack') {
                $scope.get_openstack_vm_migraions();
            } else {
                $scope.vm_migrate_show = false;
                $scope.virtual_machines.results = {};
                $scope.virtual_machines.results.length = 0;
                $scope.virtual_machines.count = 0;
                $scope.migrate_instance_unsupported = "This feature is not available for " + selection.platform_type + " Cloud";
                // AlertService2.danger($scope.migrate_instance_unsupported);
                // $scope.show_empty_message();
                // $scope.virtual_machines = {};
            }
        };

        $scope.load_vm_list = function (data) {
            $scope.virtual_machines = {};
            $scope.vm_list_message = '';
            $scope.migrate_instance_unsupported = '';
            $scope.uuid = data.short.uuid;
            $scope.get_vm_migrations(data.short);
        };

        $scope.load_cloud_data = function () {
            $scope.vm_list_message = '';
            $scope.cloud_list_migrate = [];
            $http.get('/customer/private_cloud_fast/').then(function (response) {
                $scope.cloud_list_migrate.length = 0;
                angular.forEach(response.data.results, function (value, key) {
                    $scope.cloud_list_migrate.push({
                        short: {uuid: value.uuid, platform_type: value.platform_type},
                        long: value.name
                    });
                });
                // Load the page with first found cloud
                if ($scope.cloud_list_migrate.length > 0) {
                    $scope.cloud_list_migrate_select = $scope.cloud_list_migrate[0];
                    $scope.load_vm_list($scope.cloud_list_migrate_select);
                } else {
//                    AlertService2.danger('No Cloud records found');
                    $scope.vm_migrate_show = false;
                    $scope.virtual_machines.results = {};
                    $scope.virtual_machines.results.length = 0;
                    $scope.virtual_machines.count = 0;
                    $scope.migrate_instance_unsupported = "No cloud associated with this organization. ";
                }
            });
        };

        $scope.load_cloud_data();

        $scope.backup_status_check = function (data) {
            return !(( data == null ) || ( data == 'Migration Complete' ) || ( data == 'Operation Failed'));
        };

        $scope.show_empty_message = function () {
            $scope.virtual_machines = {};
            $scope.vm_list_message = 'No records to display';
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
                        $scope.aws_region_list.push({long: item, short: item, account: value.account});
                    });
                }
            });
        };

        $scope.loadAwsBucketList = function (data) {
            $http.get('/customer/aws/' + data.account + '/region/' + data.short + '/s3_bucket/').then(function (response) {
                $scope.aws_bucket_list = [];
                angular.forEach(response.data.Buckets, function (value, key) {
                    $scope.aws_bucket_list.push({long: value.Name, short: value.Name});
                });
            });
        };

        $scope.vcenterCredentials = function(type, vm_id){
            $scope.vcenter_username = "";
            $scope.vcenter_password = "";

            var modalInstance = $uibModal.open({
                templateUrl: 'static/rest/app/templates/snippets/vmware_auth_modal.html',
                scope: $scope,
                size: 'md'
            });

            $scope.cancel = function() {
                modalInstance.close();
            };
            
            $scope.powerToggle = function(vc_username, vc_password){
                $scope.vcenter_username = vc_username;
                $scope.vcenter_password = vc_password;

                $scope.vcenterUsernameErr = false;
                $scope.vcenterUsernameErrMsg = null;
                $scope.vcenterPasswordErr = false;
                $scope.vcenterPasswordErrMsg = null;

                if (vc_username==null || vc_username==''){
                    $scope.vcenterUsernameErr = true;
                    $scope.vcenterUsernameErrMsg = '(Username is mandatory)';
                    return 0;
                }
                if (vc_password==null || vc_password==''){
                    $scope.vcenterPasswordErr = true;
                    $scope.vcenterPasswordErrMsg = '(Password is mandatory)';
                    return 0;
                }

                AlertService2.success('Validating Vcenter credentials. Please wait.');
                $scope.cancel();
                var data = {
                    'vm_id': vm_id,
                    'vcenter_username': vc_username,
                    'vcenter_password': vc_password,
                    'cloud_uuid': $scope.uuid
                };
                $http.post('/rest/vmware/migrate/vcenter_auth_check/', data).success(function (response) {
                    AlertService2.success('Successfully authenticated.');
                    if (type=='aws'){
                        $scope.awsAccountSelection();    
                    }
                    if (type=='azure'){
                        $scope.azureAccountSelection();    
                    }
                }).error(function (response) {
                    AlertService2.danger(response);
                });
            };
        };


        $scope.migrate_vm_to_aws = function (vm_id, vm_name, cloud_type, target_type, power_state, index) {
            //TODO remove it with modal after demo
            if (power_state === 'poweredOn' || power_state === 'ACTIVE'){
                AlertService2.danger("Please power off " + vm_name + " to initiate VM migration");
            }
            else{
                $scope.clear_account_selectbox();
                var account_data = [];
                $scope.cloud_type = cloud_type;
                $scope.vm_migration_params['vm_id'] = vm_id;
                $scope.vm_migration_params['target_type'] = target_type;

                if (target_type == 'AWS') {
                    if (cloud_type === 'vmware' && power_state === 'poweredOff') {
                        $http.get('/customer/aws/').then(function (response) {
                            $scope.aws_region_data = [];
                            $scope.aws_account_list = [];
                            angular.forEach(response.data.results, function (value, key) {
                                $scope.aws_account_list.push({
                                    long: value.aws_user + ' -- ' + value.account_name,
                                    short: value.id
                                });
                                $scope.aws_region_data.push({account: value.id, region: value.region});
                            });
                            if ($scope.aws_account_list.length==0){
                                $scope.awsAccountSelection();
                            }
                            else{
                                $scope.vcenterCredentials('aws', $scope.vm_migration_params['vm_id']);
                            }
                        });
                    } else if (cloud_type === 'openstack' && power_state === 'SHUTOFF') {
                        $http.get('/customer/aws/').then(function (response) {
                            $scope.aws_region_data = [];
                            $scope.aws_account_list = [];
                            angular.forEach(response.data.results, function (value, key) {
                                $scope.aws_account_list.push({
                                    long: value.aws_user + ' -- ' + value.account_name,
                                    short: value.id
                                });
                                $scope.aws_region_data.push({account: value.id, region: value.region});
                            });
                            $scope.awsAccountSelection();
                        });

                    } else {
                        AlertService2.danger("Please power off " + vm_name +" to initiate VM migration");
                    }
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
                AlertService2.success("VM Migration Process Initiated. Process will take a while");
                $scope.load_vm_list($scope.cloud_list_migrate_select);
            }).error(function (error, status) {
                AlertService2.danger(error);
            });
        };

        $scope.migrate_vmware_to_aws = function (account) {
            $http.post('/rest/vmware/migrate/vm_migrate/', {
                "vm_id": $scope.vm_migration_params['vm_id'],
                'target_type': $scope.vm_migration_params['target_type'],
                "cloud_uuid": $scope.uuid,
                "account": account,
                "vcenter_username": $scope.vcenter_username,
                "vcenter_password": $scope.vcenter_password
            }).success(function (response) {
                AlertService2.success('VM migration initiated successfully. Process will take a while.');
                $scope.load_vm_list($scope.cloud_list_migrate_select);
            }).error(function (response) {
                AlertService2.danger(response);
            });
        };
    }
]);

app.controller('CustomerTerraformController', [
    '$scope',
    '$rootScope',
    '$http',
    '$location',
    '$window',
    '$uibModal',
    'AlertService2',
    'TableHeaders',
    'TaskService2',
    function ($scope, $rootScope, $http, $location, $window, $uibModal, AlertService2, TableHeaders, TaskService2) {
        $scope.showConsole = false;
        $scope.show_empty_message = function () {
            $scope.terraform_vms = [];
            $scope.vm_list_message = 'No records to display';
        };

        $scope.loader = true;

        $scope.updateTitle = function () {
            $rootScope.header = "";
            $scope.title = {
                plural: "Unity",
                singular: "Unity"
            };
            if ($scope.$parent == $scope.$root) $scope.$root.title = $scope.title;
        };

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
                console.log('Modal dismissed at: ' + new Date());
            });
        };

        $scope.create_terraform_request = function () {
            $scope.device_type = 'Terraform';
            $scope.device_name = 'Create Terraform VM';
            $scope.description = "Please create Terraform VM.";
            showModal('static/rest/app/client/templates/manage_request.html', 'ManageRequestController');
        };

        $scope.manage_request_terraform = function (device_name, device_type, result) {
            $scope.device_type = device_type;
            $scope.device_name = device_name;
            $scope.description = 
                "Device Type: " + device_type + "\n" +
                "Device Name: " + device_name + "\n" +
                "Cloud Name: " + result.cloud.name + "\n" +
                "Host Name: " + result.hostname + "\n" +
                "Routable IP: " + result.routable_ip + "\n" +
                "Power State: " + result.status;
            showModal('static/rest/app/client/templates/manage_request.html', 'ManageRequestController');

        };

        $scope.powerStatusToggle = function (index, instance_id, vm_poweron_state, cloud) {
            if (vm_poweron_state === true) {
                $scope.vm_power_state = 'POWER OFF';
            }
            else {
                $scope.vm_power_state = 'POWER ON';
            }

            var modalInstance = $uibModal.open({
                templateUrl: 'static/rest/app/templates/snippets/confirmation_modal.html',
                scope: $scope,
                size: 'md'
            });
            $scope.cancel = function () {
                modalInstance.close();
            };

            $scope.powerToggle = function () {
                $scope.loader = true;
                if (vm_poweron_state === true) {
                    var url = '/customer/terraform/power_off/';
                    var msg_alert = 'VM Powered Off';
                } else {
                    var url = '/customer/terraform/power_on/';
                    var msg_alert = 'VM Powered On';
                }
                modalInstance.close();
                return $http({
                    url: url,
                    data: {
                        'vm_id': instance_id,
                        'cloud_uuid': cloud.id
                    },
                    method: 'POST'
                }).then(function (response) {
                    AlertService2.success(msg_alert);
                    $scope.terraform_vms[index] = response.data[0];
                    $scope.setTerraformVMPowerState();
                    $scope.loader = false;
                }).catch(function (response) {
                    modalInstance.close();
                    AlertService2.danger(response.data);
                    $scope.loader = false;
                });
            };
        };

        $scope.setTerraformVMPowerState = function () {
            angular.forEach($scope.terraform_vms, function (value, key) {
                if (value.status == "poweredOn") {
                    value.power = true;
                } else {
                    value.power = false;
                }
            });
        };

        // $scope.updateTitle();

        $scope.closeVM = function () {
            console.log("Closing VM........");
            $scope.updateTitle();
            $scope.showConsole = false;
        };

        $http({
            url: '/customer/terraform/',
            method: 'GET',
        }).then(function (response) {
            if (response.data.hasOwnProperty('task_id')) {
                TaskService2.processTask(response.data.task_id, 500).then(function (result) {
                    if (result) {
                        $http({
                            url: '/customer/terraform/',
                            method: 'GET',
                        }).then(function (response) {
                            $scope.loader = false;
                            $scope.terraform_vms = response.data.results;
                        }).catch(function (error) {
                            $scope.show_empty_message();
                            $scope.loader = false;
                            $scope.terraform_vms = [];
                            AlertService2.danger('Unable to fetch terraform VM. Please contact Adminstrator');
                        });
                    } else {
                        $scope.loader = false;
                        $scope.show_empty_message();
                        $scope.terraform_vms = [];
                    }
                }).catch(function (error) {
                    $scope.loader = false;
                    $scope.show_empty_message();
                    $scope.terraform_vms = [];
                    AlertService2.danger('Unable to fetch terraform VM. Please contact Adminstrator');
                });
            } else {
                $scope.loader = false;
                $scope.terraform_vms = response.data.results;
                if (response.data.results.length == 0) {
                    $scope.show_empty_message();
                }
            }
        }).catch(function (e) {
            $scope.loader = false;
            $scope.show_empty_message();
            $scope.terraform_vms = [];
            AlertService2.danger('Unable to fetch terraform VM. Please contact Adminstrator');
        });

        $scope.tf_headers = TableHeaders.terraform_headers;

        $scope.console_terraform = function (instance_id) {

            $scope.showConsole = true;
            $http({
                method: "GET",
                url: '/customer/terraform/' + instance_id + '/webconsole/'
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
                    // console.log("Sending :"+JSON.stringify({"tp": "init", "data": data}));
                    this._connection.send(JSON.stringify({"tp": "init", "data": data}));
                };

                WSSHClient.prototype.sendClientData = function (data) {
                    this._connection.send(JSON.stringify({"tp": "client", "data": data}));
                };

                var client = new WSSHClient();

                /*global Terminal term:true*/
                /*eslint no-undef: "error"*/
                var terminalContainer = document.getElementById('terminal-container');
                var term = new Terminal({screenKeys: true, useStyle: true, cursorBlink: true});
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

                rows = parseInt(availableHeight / characterHeight) - 1;
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

            $scope.vm_auth = true;

        };
    }
]);

app.controller('CustomerTerraformWebConsoleController', [
    '$scope',
    '$http',
    '$window',
    '$stateParams',
    '$rootScope',
    '$location',
    function ($scope, $http, $window, $stateParams, $rootScope, $location) {

        $scope.iframe = false;
        var url = $location.absUrl();
        if (url.indexOf('iframe') != -1) {
            $scope.iframe = true;
        }

        $scope.loader = true;

        $http({
            method: "GET",
            url: '/customer/terraform/' + $stateParams.uuid + '/webconsole/'
        }).then(function (response) {

            /*global MozWebSocket this._connection:true*/
            /*eslint no-undef: "error"*/
            $scope.loader = false;

            $scope.virtual_machine = response.data.vm_name;
            $rootScope.header = $scope.virtual_machine;
            $scope.title = {
                plural: $scope.virtual_machine,
                singular: $scope.virtual_machine
            };
            $scope.ip_address = response.data.vm_ip;
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
                // console.log("Sending :"+JSON.stringify({"tp": "init", "data": data}));
                this._connection.send(JSON.stringify({"tp": "init", "data": data}));
            };

            WSSHClient.prototype.sendClientData = function (data) {
                this._connection.send(JSON.stringify({"tp": "client", "data": data}));
            };

            var client = new WSSHClient();

            /*global Terminal term:true*/
            /*eslint no-undef: "error"*/
            var terminalContainer = document.getElementById('terminal-container');
            var term = new Terminal({screenKeys: true, useStyle: true, cursorBlink: true});
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

            rows = parseInt(availableHeight / characterHeight) - 1;
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

        $scope.vm_auth = true;

    }
]);

app.controller('CustomerVmwareWebConsoleController', [
    '$scope',
    '$http',
    '$uibModal',
    '$window',
    '$stateParams',
    '$rootScope',
    'UserOrgLogoService',
    '$location',
    '$timeout',
    function ($scope, $http, $uibModal, $window, $stateParams, $rootScope, UserOrgLogoService, $location, $timeout) {

        $scope.iframe = false;
        var url = $location.absUrl();
        if (url.indexOf('iframe') != -1) {
            $scope.iframe = true;
        }
        UserOrgLogoService.get_org_logo().then(function (result) {
            $scope.user_org_logo = result.data.logo;
        });
        $scope.loader = true;

        $scope.goBack = function () {
            $window.history.back();
        };

        $scope.closeTab = function () {
            $window.close();
        };

        $scope.device_type_label = "VM Name ";
        $scope.console_header = "Virtual Machine Authenticate ";

        $http({
            method: "GET",
            url: '/customer/vmware_vms/' + $stateParams.uuid + '/get_vm_details/'
        }).then(function (response) {

            $scope.loader = false;
            $scope.device_name = response.data.vm_name;

            $rootScope.header = $scope.device_name;
            $scope.title = {
                plural: $scope.device_name,
                singular: $scope.device_name
            };
            if ($scope.$parent == $scope.$root) $scope.$root.title = $scope.title;


            $scope.ip_address = response.data.ip_address;
            if ($scope.ip_address) {
                $scope.request = {
                    hostname: $scope.ip_address,
                    port: 2122,
                    // username: "root",
                    // password: ""
                };
            }
            else {
                $scope.disableAccess = true;
            }


            $scope.endpoint = "/rest/vmware_vms/"  + $stateParams.uuid + "/check_auth/";
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


        $scope.collapse = function () {
            $scope.open = [];
            var toggleMinimized = $scope.containsInArray(angular.element('#content-area')["0"].classList, 'minimized');
            if (toggleMinimized) {
                angular.element('#arrow').removeClass('fa fa-chevron-right').addClass('fa fa-chevron-left');
                $timeout(function () {
                    $scope.toggleMinimized = true;
                }, 100);
            } else {
                angular.element('#arrow').removeClass('fa fa-chevron-left').addClass('fa fa-chevron-right');
                $scope.toggleMinimized = false;
            }
        };
    }
]);


app.controller('CustomerVCloudWebConsoleController', [
    '$scope',
    '$http',
    '$uibModal',
    '$window',
    '$stateParams',
    'UserOrgLogoService',
    '$rootScope',
    '$location',
    '$timeout',
    function ($scope, $http, $uibModal, $window, $stateParams, UserOrgLogoService, $rootScope, $location, $timeout) {

        $scope.iframe = false;
        var url = $location.absUrl();
        if (url.indexOf('iframe') != -1) {
            $scope.iframe = true;
        }
        UserOrgLogoService.get_org_logo().then(function (result) {
            $scope.user_org_logo = result.data.logo;
        });
        $scope.loader = true;

        $scope.goBack = function () {
            $window.history.back();
        };

        $scope.closeTab = function () {
            $window.close();
        };

        $scope.device_type_label = "VM Name ";
        $scope.console_header = "Virtual Machine Authenticate ";

        $http({
            method: "GET",
            url: '/customer/vclouds/virtual_machines/' + $stateParams.uuid + '/get_vm_details/'
        }).then(function (response) {

            $scope.loader = false;
            $scope.device_name = response.data.vm_name;

            $rootScope.header = $scope.device_name;
            $scope.title = {
                plural: $scope.device_name,
                singular: $scope.device_name
            };
            if ($scope.$parent == $scope.$root) $scope.$root.title = $scope.title;


            $scope.ip_address = response.data.ip_address;
            if ($scope.ip_address) {
                $scope.request = {
                    hostname: $scope.ip_address,
                    port: 2122,
                    // username: "root",
                    // password: ""
                };
            }
            else {
                $scope.disableAccess = true;
            }


            $scope.endpoint = "/customer/vclouds/virtual_machines/"  + $stateParams.uuid + "/check_auth/";
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


        $scope.collapse = function () {
            $scope.open = [];
            var toggleMinimized = $scope.containsInArray(angular.element('#content-area')["0"].classList, 'minimized');
            if (toggleMinimized) {
                angular.element('#arrow').removeClass('fa fa-chevron-right').addClass('fa fa-chevron-left');
                $timeout(function () {
                    $scope.toggleMinimized = true;
                }, 100);
            } else {
                angular.element('#arrow').removeClass('fa fa-chevron-left').addClass('fa fa-chevron-right');
                $scope.toggleMinimized = false;
            }
        };
    }
]);

app.controller('CustomerBMWebConsoleController', [
    '$scope',
    '$http',
    '$uibModal',
    '$window',
    '$stateParams',
    'UserOrgLogoService',
    '$rootScope',
    '$location',
    '$timeout',
    function ($scope, $http, $uibModal, $window, $stateParams, UserOrgLogoService, $rootScope, $location, $timeout) {

        $scope.iframe = false;
        var url = $location.absUrl();
        if (url.indexOf('iframe') != -1) {
            $scope.iframe = true;
        }
        UserOrgLogoService.get_org_logo().then(function (result) {
            $scope.user_org_logo = result.data.logo;
        });
        $scope.loader = true;

        $scope.goBack = function () {
            $window.history.back();
        };

        $scope.closeTab = function () {
            $window.close();
        };

        $http({
            method: "GET",
            url: '/customer/bm_servers/' + $stateParams.uuid
        }).then(function (response) {

            $scope.loader = false;
            $scope.device_name = response.data.server.name;

            if (response.data.management_ip) {
                $scope.request = {
                    hostname: response.data.management_ip,
                    port: parseInt(response.data.port),
                };
            }
            else {
                $scope.disableAccess = true;
            }

            $rootScope.showConsole = false;
            $scope.endpoint = "/customer/bm_servers/" + $stateParams.uuid + "/check_auth/";
            var modalInstance = $uibModal.open({
                templateUrl: 'xtermAuthenticate.html',
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

app.controller('CustomerOpenStackWebConsoleController', [
    '$scope',
    '$http',
    '$uibModal',
    '$window',
    '$stateParams',
    'UserOrgLogoService',
    '$rootScope',
    '$location',
    function ($scope, $http, $uibModal, $window, $stateParams, UserOrgLogoService, $rootScope, $location) {

        $scope.iframe = false;
        var url = $location.absUrl();
        if (url.indexOf('iframe') != -1) {
            $scope.iframe = true;
        }
        UserOrgLogoService.get_org_logo().then(function (result) {
            $scope.user_org_logo = result.data.logo;
        });
        $scope.loader = true;

        $scope.goBack = function () {
            $window.history.back();
        };

        $scope.closeTab = function () {
            $window.close();
        };

        $scope.device_type_label = "VM Name ";
        $scope.console_header = "Virtual Machine Authenticate ";

        $http({
            method: "GET",
            url: '/rest/openstack/migration/' + $stateParams.uuid + '/details/'
        }).then(function (response) {

            $scope.loader = false;

            $scope.device_name = response.data.vm_name;

            $rootScope.header = $scope.device_name;
            $scope.title = {
                plural: $scope.device_name,
                singular: $scope.device_name
            };
            if ($scope.$parent == $scope.$root) $scope.$root.title = $scope.title;

            $scope.ip_address = response.data.ip_address;
            if ($scope.ip_address) {
                $scope.request = {
                    hostname: $scope.ip_address,
                    port: 2122,
                };
            }
            else {
                $scope.disableAccess = true;
            }

            $scope.endpoint = "/rest/openstack/migration/"  + $stateParams.uuid +  "/check_auth/";
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


app.controller('CustomerCustomCloudWebConsoleController', [
    '$scope',
    '$http',
    '$uibModal',
    '$window',
    '$stateParams',
    'UserOrgLogoService',
    '$rootScope',
    '$location',
    function ($scope, $http, $uibModal, $window, $stateParams, UserOrgLogoService, $rootScope, $location) {

        $scope.iframe = false;
        var url = $location.absUrl();
        if (url.indexOf('iframe') != -1) {
            $scope.iframe = true;
        }
        UserOrgLogoService.get_org_logo().then(function (result) {
            $scope.user_org_logo = result.data.logo;
        });
        $scope.loader = true;

        $scope.goBack = function () {
            $window.history.back();
        };

        $scope.closeTab = function () {
            $window.close();
        };

        $scope.device_type_label = "VM Name ";
        $scope.console_header = "Virtual Machine Authenticate ";

        $http({
            method: "GET",
            url: '/rest/customer/virtual_machines/' + $stateParams.uuid + '/'
        }).then(function (response) {

            $scope.loader = false;

            $scope.device_name = response.data.name;

            $rootScope.header = $scope.device_name;
            $scope.title = {
                plural: $scope.device_name,
                singular: $scope.device_name
            };
            if ($scope.$parent == $scope.$root) $scope.$root.title = $scope.title;

            $scope.ip_address = response.data.management_ip;
            if ($scope.ip_address) {
                $scope.request = {
                    hostname: $scope.ip_address,
                    port: 2122,
                };
            }
            else {
                $scope.disableAccess = true;
            }

            $scope.endpoint = "/rest/customer/virtual_machines/" +$stateParams.uuid+ "/check_auth/";
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

app.controller('CustomerFirewallWebConsoleController', [
    '$scope',
    '$http',
    '$uibModal',
    '$window',
    '$stateParams',
    'UserOrgLogoService',
    '$rootScope',
    '$location',
    function ($scope, $http, $uibModal, $window, $stateParams, UserOrgLogoService, $rootScope, $location) {

        $scope.iframe = false;
        var url = $location.absUrl();
        if (url.indexOf('iframe') != -1) {
            $scope.iframe = true;
        }
        UserOrgLogoService.get_org_logo().then(function (result) {
            $scope.user_org_logo = result.data.logo;
        });
        $scope.loader = true;

        $scope.goBack = function () {
            $window.history.back();
        };

        $scope.closeTab = function () {
            $window.close();
        };

        $scope.device_type_label = "Firewall Name ";
        $scope.console_header = "Firewall Authenticate ";

        $http({
            method: "GET",
            url: '/customer/firewalls/' + $stateParams.uuid
        }).then(function (response) {
            $scope.loader = false;

            $scope.device_name = response.data.name;

            $rootScope.header = $scope.device_name;
            $scope.title = {
                plural: $scope.device_name,
                singular: $scope.device_name
            };
            if ($scope.$parent == $scope.$root) $scope.$root.title = $scope.title;

            $scope.ip_address = response.data.management_ip;
            if ($scope.ip_address) {
                $scope.request = {
                    hostname: $scope.ip_address,
                    port: 2122,
                };
            }
            else {
                $scope.disableAccess = true;
            }

            $scope.endpoint = "/customer/firewalls/" + $stateParams.uuid + '/check_auth/';
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

app.controller('CustomerLoadBalancerWebConsoleController', [
    '$scope',
    '$http',
    '$uibModal',
    '$window',
    '$stateParams',
    'UserOrgLogoService',
    '$rootScope',
    '$location',
    function ($scope, $http, $uibModal, $window, $stateParams, UserOrgLogoService, $rootScope, $location) {

        $scope.iframe = false;
        var url = $location.absUrl();
        if (url.indexOf('iframe') != -1) {
            $scope.iframe = true;
        }

        UserOrgLogoService.get_org_logo().then(function (result) {
            $scope.user_org_logo = result.data.logo;
        });

        $scope.loader = true;

        $scope.goBack = function () {
            $window.history.back();
        };

        $scope.closeTab = function () {
            $window.close();
        };

        $scope.device_type_label = "LoadBalancer Name ";
        $scope.console_header = "LoadBalancer Authenticate ";

        $http({
            method: "GET",
            url: '/customer/load_balancers/' + $stateParams.uuid
        }).then(function (response) {
            $scope.loader = false;

            $scope.device_name = response.data.name;

            $rootScope.header = $scope.device_name;
            $scope.title = {
                plural: $scope.device_name,
                singular: $scope.device_name
            };
            if ($scope.$parent == $scope.$root) $scope.$root.title = $scope.title;

            $scope.ip_address = response.data.management_ip;
            if ($scope.ip_address) {
                $scope.request = {
                    hostname: $scope.ip_address,
                    port: 2122,
                };
            }
            else {
                $scope.disableAccess = true;
            }

            $scope.endpoint = "/customer/load_balancers/" + $stateParams.uuid + '/check_auth/';
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


app.controller('CustomerSwitchWebConsoleController', [
    '$scope',
    '$http',
    '$uibModal',
    '$window',
    '$stateParams',
    '$rootScope',
    'UserOrgLogoService',
    '$location',
    function ($scope, $http, $uibModal, $window, $stateParams, $rootScope, UserOrgLogoService, $location) {
        $scope.iframe = false;
        var url = $location.absUrl();
        if (url.indexOf('iframe') != -1) {
            $scope.iframe = true;
        }
        UserOrgLogoService.get_org_logo().then(function (result) {
            $scope.user_org_logo = result.data.logo;
        });

        $scope.loader = true;

        $scope.goBack = function () {
            $window.history.back();
        };

        $scope.closeTab = function () {
            $window.close();
        };

        $scope.device_type_label = "Switch Name ";
        $scope.console_header = "Switch Authenticate ";

        $http({
            method: "GET",
            url: '/customer/switches/' + $stateParams.uuid
        }).then(function (response) {
            $scope.loader = false;

            $scope.device_name = response.data.name;

            $rootScope.header = $scope.device_name;
            $scope.title = {
                plural: $scope.device_name,
                singular: $scope.device_name
            };
            if ($scope.$parent == $scope.$root) $scope.$root.title = $scope.title;

            $scope.ip_address = response.data.management_ip;
            if ($scope.ip_address) {
                $scope.request = {
                    hostname: $scope.ip_address,
                    port: 2122,
                };
            }
            else {
                $scope.disableAccess = true;
            }

            $scope.endpoint = "/customer/switches/" + $stateParams.uuid + '/check_auth/';
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

app.controller('CustomerServerWebConsoleController', [
    '$scope',
    '$http',
    '$uibModal',
    '$window',
    '$stateParams',
    'UserOrgLogoService',
    '$rootScope',
    '$location',
    function ($scope, $http, $uibModal, $window, $stateParams, UserOrgLogoService, $rootScope, $location) {

        $scope.iframe = false;
        var url = $location.absUrl();
        if (url.indexOf('iframe') != -1) {
            $scope.iframe = true;
        }

        UserOrgLogoService.get_org_logo().then(function (result) {
            $scope.user_org_logo = result.data.logo;
        });

        $scope.loader = true;

        $scope.goBack = function () {
            $window.history.back();
        };

        $scope.closeTab = function () {
            $window.close();
        };

        $scope.device_type_label = "Server Name ";
        $scope.console_header = "Server Authenticate ";

        $http({
            method: "GET",
            url: '/customer/servers/' + $stateParams.uuid
        }).then(function (response) {
            $scope.loader = false;

            $scope.device_name = response.data.name;

            $rootScope.header = $scope.device_name;
            $scope.title = {
                plural: $scope.device_name,
                singular: $scope.device_name
            };
            if ($scope.$parent == $scope.$root) $scope.$root.title = $scope.title;

            $scope.ip_address = response.data.bm_server.management_ip;
            if ($scope.ip_address) {
                $scope.request = {
                    hostname: $scope.ip_address,
                    port: 2122,
                };
            }
            else {
                $scope.disableAccess = true;
            }

            $scope.endpoint = "/customer/switches/" + $stateParams.uuid + '/check_auth/';
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

app.controller('CustomerVmwareWmksConsoleController', [
    '$scope',
    '$http',
    '$stateParams',
    'UserOrgLogoService',
    '$rootScope',
    '$location',
    function ($scope, $http, $stateParams, UserOrgLogoService, $rootScope, $location) {

        $scope.iframe = false;
        var url = $location.absUrl();
        if (url.indexOf('iframe') != -1) {
            $scope.iframe = true;
        }

        $scope.loader = true;

        $http({
            method: "GET",
            url: '/customer/vmware_vms/' + $stateParams.uuid + '/webconsole/'
        }).then(function (response) {

            $scope.loader = false;

            $rootScope.header = response.data.vm_name;
            $scope.title = {
                plural: response.data.vm_name,
                singular: response.data.vm_name
            };
            if ($scope.$parent == $scope.$root) $scope.$root.title = $scope.title;

            var _wmks = $("#wmksContainer")

                .wmks({"useVNCHandshake": false, "sendProperMouseWheelDeltas": true, "fitToParent": true})
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
    '$rootScope',
    '$uibModalInstance',
    '$http',
    '$q',
    '$stateParams',
    '$window',
    '$location',
    '$timeout',
    'AlertService2',
    function ($scope, $rootScope, $uibModalInstance, $http, $q, $stateParams, $window, $location, $timeout, AlertService2) {
        $scope.create = function (request) {
            if (request.username==null || request.username==''){
                $scope.loginUsernameErr = true;
                $scope.loginUsernameErrMsg = '(Username is mandatory)';
                return 0;
            }
            if (request.username!=null || request.username!=''){
                $scope.loginUsernameErr = false;
                $scope.loginUsernameErrMsg = null;
            }
            if (request.password==null || request.password==''){
                $scope.loginPasswordErr = true;
                $scope.loginPasswordErrMsg = '(Password is mandatory)';
                return 0;
            }
            if (request.password!==null || request.password!==''){
                $scope.loginPasswordErr = false;
                $scope.loginPasswordErrMsg = null;
            }

            $scope.errorMsg = "";
            $rootScope.routeDeferred = $q.defer();
            $rootScope.myPromise = $rootScope.routeDeferred.promise;

            $window.scrollTo(0, 0);
            /*global MozWebSocket this._connection:true*/
            /*eslint no-undef: "error"*/
            var options = {
                host: request.hostname,
                port: request.port,
                username: request.username,
                password: request.password
            };

            $http.post($scope.endpoint, options).then(function (response) {
                $scope.loader = false;
                $rootScope.showConsole = true;
                $uibModalInstance.dismiss();
                if ($scope.device_name) {
                    $rootScope.header = $scope.device_name;
                    $scope.title = {
                        plural: $scope.device_name,
                        singular: $scope.device_name
                    };
                }
                else{
                    $rootScope.header = $scope.virtual_machine;
                    $scope.title = {
                        plural: $scope.virtual_machine,
                        singular: $scope.virtual_machine
                    };
                }

                if ($scope.$parent == $scope.$root) $scope.$root.title = $scope.title;
                $timeout(function () {
                    if (angular.element('#terminal-container').length) {
                        function openTerminal(options) {
                            var client = new WSSHClient();
                            var term = new Terminal({cols: 80, rows: 24, screenKeys: true, useStyle: true});
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
                                    term.write('\n');
                                    console.debug('connection established one \n');
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
                            var endpoint = protocol + $window.location.host + "/vmterminal/" + $stateParams.uuid + '/';
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
                            this._connection.send(JSON.stringify({"tp": "init", "data": data}));
                        };

                        WSSHClient.prototype.sendClientData = function (data) {
                            this._connection.send(JSON.stringify({"tp": "client", "data": data}));
                        };

                        var client = new WSSHClient();

                        /*global Terminal term:true*/
                        /*eslint no-undef: "error"*/
                        var terminalContainer = document.getElementById('terminal-container');
                        var term = new Terminal({screenKeys: true, useStyle: true, cursorBlink: true});
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

                        rows = parseInt(availableHeight / characterHeight) - 1;
                        cols = parseInt(availableWidth / characterWidth);

                        term.resize(cols, rows);
                        // term.fit(); // The above code does the same thing as term.fit()

                        angular.extend(options, {rows: rows, cols: cols});

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
                                console.debug('connection established two');
                                $uibModalInstance.dismiss();

                                term.write('\r\n');
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

                        $scope.vm_auth = true;
                        var url = $location.absUrl();
                        if (url.indexOf('iframe') != -1) {
                            $scope.iframe = true;
                        }
                    }
                }, 0);

                $rootScope.myPromise = null;
                if ($rootScope.routeDeferred) {
                    $rootScope.routeDeferred.resolve();
                }

            })
                .catch(function (error) {
                    $scope.errorMsg = error.data;

                    $rootScope.myPromise = null;
                    if ($rootScope.routeDeferred) {
                        $rootScope.routeDeferred.resolve();
                    }
                });


        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss();
        };

    }
]);
