/**
 * Created by rt on 5/4/16.
 */

var app = angular.module('uldb');

app.controller('ImporterController', [
    '$scope',
    '$http',
    'Upload',
    'AlertService2',
    function ($scope, $http, Upload, AlertService2) {
        $scope.alertService = AlertService2;
        $scope.data = null;
        $scope.upload = function (file) {
            if (file) {
                Upload.upload({
                    url: '/tools/upload_xlsx/',
                    data: { excel_file: file }
                }).then(function (resp) {
                    var response = resp.data;
                    $scope.customer = response['CUSTOMER_INFO'][0]['Name'];
                    $scope.data = response;
                }, function (resp) {
                    AlertService2.danger(resp.data.data);
                });
            }
        };

        $scope.attemptImport = function () {
            if ($scope.data == null) {
                AlertService2.danger('Please select a file first.');
            } else {
                $http.post('/tools/upload_json/', { data: $scope.data }).then(function (response) {
                    $scope.errors = { 'Errors': response.data['Errors'] };
                    delete response.data['Errors'];
                    $scope.resp = response.data;
                }).catch(function (error) {
                    $scope.errors = error.data;
                    AlertService2.danger(error.data['Errors']);
                });
            }
        };
    }
]);

app.controller('HijackController', [
    '$scope',
    '$http',
    'SearchService',
    'CustomSearchService',
    'User',
    'AlertService2',
    '$window',
    function ($scope, $http, SearchService, CustomSearchService, User, AlertService2, $window) {
        $scope.alertService = AlertService2;
        $scope.title = {
            plural: 'Impersonate User',
            singular: 'Impersonate User'
        };
        if ($scope.$parent === $scope.$root) $scope.$root.title = $scope.title;
        $scope.getUsers = new CustomSearchService(User, 'impersonation', true).search;
        $scope.hijack = function (user) {
            $http.post('/hijack/' + user.id + '/').then(function (response) {

            });
        };

        $scope.hijackAction = function () {
            if ($scope.hasOwnProperty('user')) {
                return '/hijack/' + $scope.user.id + '/';
            }
            return '/';
        };
        $scope.token = $http.defaults.headers.common['X-CSRF-Token'];
        $scope.location = $window.location.href;
    }
]);

app.controller('MiscToolsController', [
    '$scope',
    '$http',
    'TaskService2',
    function ($scope, $http, TaskService2) {
        $scope.result = null;

        var post_then_update = function (uri) {
            $http.post(uri).then(function (response) {
                TaskService2.processTask(response.data.task_id).then(function (result) {
                    $scope.result = result;
                }).catch(function (error) {
                    $scope.result = error;
                });
            });
        };

        $scope.refresh_nagios = function () {
            $http.post('/func/refresh_nagios/').then(function (response) {
                TaskService2.processTask(response.data.task_id).then(function (result) {
                    $scope.result = result;
                }).catch(function (error) {
                    $scope.result = error;
                });
            });
        };

        $scope.refresh_observium_hosts = function () {
            post_then_update('/func/refresh_observium_hosts/');
        };
        $scope.refresh_observium_interfaces = function () {
            post_then_update('/func/refresh_observium_interfaces/');
        };
        $scope.refresh_observium_stats = function () {
            post_then_update('/func/refresh_observium_stats/');
        };

        $scope.settings_debug_mode = function () {
            $http.get('/rest/debug_mode/').then(function (response) {
                $scope.debug_mode = response.data.result.toString();
            });
        };

        $scope.settings_debug_mode();

        $scope.update_proxy_config = function () {
            $http.post('/func/update_proxy_configs/').then(function (response) {
                $scope.proxy_update_response = response.data;
            }).catch(function (error) {
                $scope.proxy_update_response = error;
            });
        };

        $scope.security_center_integ = null;
        $http.get('/func/get_tenable/').then(function (response) {
            $scope.security_center_integ = response.data;
        });
    }
]);

app.controller('ProxyCookiesController', [
    '$scope',
    '$http',
    '$uibModal',
    'AlertService2',
    '$window',
    function ($scope, $http, $uibModal, AlertService2, $window) {
        // get all proxies
        $http.get('/func/get_proxies/').then(function (response) {
            $scope.results = response.data;
        });

        $http.get('/func/get_proxy_server/')
            .then(function (response) {
                $scope.proxy_server = response.data;
            });

        $scope.proxy_rebuild = function (result) {
            var idx = $scope.results.indexOf(result);
            $scope.results[idx]['loader'] = true;
            $http.post('/func/regenerate_proxy/', { id: result.id })
                .then(function (response) {
                    $scope.results[idx]['loader'] = false;
                    $scope.results[idx]['rebuilt_at'] = response.data.rebuilt_at;
                }).catch(function (error) {
                    $scope.results[idx]['loader'] = false;
                    $scope.results[idx]['rebuilt_at'] = error;
                });
        };

        $scope.refresh_subdomains = function () {
            $http.get('/func/refresh_subdomains/', { id: null })
                .then(function (response) {
                    console.log(response);
                });
        };


        // ---------- Delete Proxy -------------------- //


        $scope.delete_proxy = function (result) {
            if (confirm("are you sure")) {
                var idx = $scope.results.indexOf(result);

                $scope.results[idx]['loader'] = true;
                $http.post('/func/delete_proxy/', { id: result.id })
                    .then(function (response) {
                        $scope.results[idx]['loader'] = false;
                        $window.location.reload();
                    }).catch(function (error) {
                        $scope.results[idx]['loader'] = false;
                        $window.location.reload();
                    });
            }
        };



        //----------- Delet Proxy End ------------------//


        //------------------------ Create Proxy ----------------------------- // 


        $scope.search_customers = function (search) {
            return $http({
                method: 'GET',
                url: 'rest/fast/org',
                params: {
                    search: search
                }
            }).
                then(function (response) {
                    var names = [];
                    for (var i = 0; i < response.data.results.length; i++) {
                        names.push(response.data.results[i]);
                    }
                    return names;
                });



        };

        var modalSupport = null;
        var showModal = function (template, controller, size) {
            if (modalSupport !== null) {
                modalSupport.dismiss('cancel');
            }
            $scope.loader = false;
            modalSupport = $uibModal.open({
                templateUrl: template,
                controller: controller,
                scope: $scope,
                size: size
            });

            modalSupport.result.then(function (selectedItem) {
                $scope.selected = selectedItem;
            }, function () {
            });
        };

        $scope.cancel = function () {
            modalSupport.dismiss('cancel');
        };


        $scope.add_proxy_modal = function () {
            showModal('add_proxy_modal.html', null, 'xs add_proxy_modal');
        };

        $scope.add_proxy = function (new_proxy) {
            $http.post('/func/create_proxy/', new_proxy)
                .then(function (response) {
                    $scope.cancel();
                    AlertService2.success("Successfully added proxy!");
                    // $window.location.reload();
                }).catch(function (error) {
                    $scope.cancel();
                    console.log(error.data);
                    AlertService2.danger(error.data);
                });
        };


        $scope.proxy_types_by_category = [];

        $scope.proxy_types = {
            'firewall': [{ name: 'Cisco Firewall', type: 'CiscoFirewallReverseProxy' }, { name: 'Juniper Firewall', type: 'JuniperFirewallProxy' }],
            'switch': [{ name: 'Cisco Switch', type: 'CiscoSwitchProxy' }, { name: 'Juniper Switch', type: 'JuniperSwitchProxy' }],
            'load_balancer': [{ name: 'F5 Load Balancer', type: 'F5LoadBalancerReverseProxy' }, { name: 'Citrix Netscaler', type: 'CitrixNetScalerProxy' }],
            'server': [{ name: 'Esxi Hypervisor', type: 'VmwareEsxiProxy' }],
            'private_cloud': [{ name: 'Vmware Cloud', type: 'VmwareVcenterProxy' }, { name: 'OpenStack Cloud', type: 'OpenStackProxy' }]

        };

        $scope.get_proxy_types = function (new_proxy) {
            $scope.proxy_types_by_category = $scope.proxy_types[new_proxy.device_category];
            $scope.device_category = new_proxy.device_category;
        };


        $scope.get_devices_by_category = function (search) {
            if ($scope.device_category) {

                var url = 'rest/fast/' + $scope.device_category + '/';
                return $http({
                    method: 'GET',
                    url: url,
                    params: {
                        search: search
                    }
                }).
                    then(function (response) {
                        var values = [];
                        angular.forEach(response.data.results, function (value, key) {
                            values.push({ name: value.name, id: value.id });
                        });
                        return values;
                    });
            }
        };

    }
]);

app.controller('TenableController', [
    '$scope',
    '$sce',
    'ULDBService2',
    'AbstractControllerFactory2',
    function ($scope, $sce, ULDBService2, AbstractControllerFactory2) {
        $scope.ctrl = AbstractControllerFactory2($scope, ULDBService2.tenable());
        $scope.iframe = {
            src: null
        };
        $scope.loadIframe = function (result, idx) {
            $scope.iframe.src = $sce.trustAsResourceUrl(result.proxy_fqdn);
        };
        $scope.clearIframe = function (result, idx) {
            $scope.iframe.src = null;
        };
        $scope.additional_actions = [
            {
                name: 'Load in iframe',
                func: $scope.loadIframe
            }
        ];
    }
]);

app.controller('VcenterProxyController', [
    '$scope',
    '$sce',
    '$location',
    'ULDBService2',
    'AlertService2',
    'AbstractControllerFactory2',
    function ($scope, $sce, $location, ULDBService2, AlertService2, AbstractControllerFactory2) {

        //  TAB CONTROL : Temporary for Demo
        $scope.tabs = [
            { name: 'vCenter API Account', url: 'vmware-dashboard' },
            { name: 'vCenter Proxy', url: 'vmware-vcenter' },
            { name: 'VMware ESXi Proxy', url: 'vmware-esxi' },
            //            { name: 'Manage Openstack', url: 'openstack-proxy' }
        ];

        $scope.activeTab = 1;
        $scope.updateTab = function (idx) {
            $location.path($scope.tabs[idx].url);
        };
        //  END TAB CONTROL FUNCTIONALITY

        $scope.ctrl = AbstractControllerFactory2($scope, ULDBService2.vcenter());
        $scope.iframe = {
            src: null
        };
        $scope.loadIframe = function (result, idx) {
            $scope.vcenter_heading = result.name;
            $scope.iframe.src = $sce.trustAsResourceUrl(result.proxy_fqdn);
        };
        $scope.clearIframe = function (result, idx) {
            $scope.iframe.src = null;
        };
        $scope.additional_actions = [
            {
                name: 'Load in iframe',
                func: $scope.loadIframe
            }
        ];
    }
]);

app.controller('EsxiProxyController', [
    '$scope',
    '$sce',
    '$location',
    'ULDBService2',
    'AbstractControllerFactory2',
    function ($scope, $sce, $location, ULDBService2, AbstractControllerFactory2) {

        //  TAB CONTROL : Temporary for Demo
        $scope.tabs = [
            { name: 'vCenter API Account', url: 'vmware-dashboard' },
            { name: 'vCenter Proxy', url: 'vmware-vcenter' },
            { name: 'VMware ESXi Proxy', url: 'vmware-esxi' },
            //                { name: 'Manage Openstack', url: 'openstack-proxy' }
        ];

        $scope.activeTab = 2;
        $scope.updateTab = function (idx) {
            $location.path($scope.tabs[idx].url);
        };
        //  END TAB CONTROL FUNCTIONALITY

        $scope.ctrl = AbstractControllerFactory2($scope, ULDBService2.esxi());
        $scope.iframe = {
            src: null
        };
        $scope.loadIframe = function (result, idx) {
            $scope.esxi_heading = result.name;
            $scope.iframe.src = $sce.trustAsResourceUrl(result.proxy_fqdn);
        };
        $scope.clearIframe = function (result, idx) {
            $scope.iframe.src = null;
        };
        $scope.additional_actions = [
            {
                name: 'Load in iframe',
                func: $scope.loadIframe
            }
        ];
    }
]);

app.controller('OpenstackProxyController2', [
    '$scope',
    '$sce',
    '$location',
    'ULDBService2',
    'AbstractControllerFactory2',
    function ($scope, $sce, $location, ULDBService2, AbstractControllerFactory2) {

        //  TAB CONTROL : Temporary for Demo
        $scope.tabs = [
            { name: 'OpenStack API Account', url: 'openstack-dashboard' },
            { name: 'OpenStack Proxy', url: 'openstack-proxy' }
        ];

        $scope.activeTab = 1;
        $scope.updateTab = function (idx) {
            $location.path($scope.tabs[idx].url);
        };
        //  END TAB CONTROL FUNCTIONALITY

        $scope.ctrl = AbstractControllerFactory2($scope, ULDBService2.openstack_proxy());
        $scope.iframe = {
            src: null
        };
        $scope.loadIframe = function (result, idx) {
            $scope.iframe.src = $sce.trustAsResourceUrl(result.proxy_fqdn);
        };
        $scope.clearIframe = function (result, idx) {
            $scope.iframe.src = null;
        };
        $scope.additional_actions = [
            {
                name: 'Load in iframe',
                func: $scope.loadIframe
            }
        ];
    }
]);

app.controller('F5LoadBalancerProxyController2', [
    '$scope',
    '$window',
    '$sce',
    '$location',
    'ULDBService2',
    'AbstractControllerFactory2',
    function ($scope, $window, $sce, $location, ULDBService2, AbstractControllerFactory2) {

        //  TAB CONTROL : Temporary for Demo
        $scope.tabs = [
            { name: 'Load Balancers', url: 'loadbalancer' },
            { name: 'Virtual Load Balancers', url: 'virtual_load_balancer' },
            { name: 'NetScaler VPX', url: 'citrix-vpx-device' },
            { name: 'F5 Load Balancer', url: 'f5-lb-proxy' }
        ];

        $scope.activeTab = 3;
        $scope.updateTab = function (idx) {
            $location.path($scope.tabs[idx].url);
        };
        //  END TAB CONTROL FUNCTIONALITY

        $scope.ctrl = AbstractControllerFactory2($scope, ULDBService2.f5lb());
        $scope.iframe = {
            src: null
        };
        $scope.loadIframe = function (result, idx) {
            // $scope.iframe.src = $sce.trustAsResourceUrl(result.proxy_fqdn);
            $window.open(result.proxy_fqdn, '_blank');
        };
        $scope.clearIframe = function (result, idx) {
            $scope.iframe.src = null;
        };
        $scope.additional_actions = [
            {
                name: 'Manage in New Tab',
                func: $scope.loadIframe
            }
        ];
    }
]);

app.controller('CitrixVPXProxyController', [
    '$scope',
    '$window',
    '$sce',
    '$location',
    'ULDBService2',
    'AbstractControllerFactory2',
    function ($scope, $window, $sce, $location, ULDBService2, AbstractControllerFactory2) {

        //  TAB CONTROL : Temporary for Demo
        $scope.tabs = [
            { name: 'Load Balancers', url: 'loadbalancer' },
            { name: 'Virtual Load Balancers', url: 'virtual_load_balancer' },
            { name: 'NetScaler VPX', url: 'citrix-vpx-device' },
            { name: 'F5 Load Balancer', url: 'f5-lb-proxy' },
        ];

        $scope.activeTab = 2;
        $scope.updateTab = function (idx) {
            $location.path($scope.tabs[idx].url);
        };
        //  END TAB CONTROL FUNCTIONALITY

        $scope.ctrl = AbstractControllerFactory2($scope, ULDBService2.citrix());
        $scope.iframe = {
            src: null
        };

        $scope.loadIframe = function (result, idx) {
            // $scope.iframe.src = $sce.trustAsResourceUrl(result.proxy_fqdn);
            $window.open(result.proxy_fqdn, '_blank');
        };

        $scope.clearIframe = function (result, idx) {
            $scope.iframe.src = null;
        };
        $scope.additional_actions = [
            {
                name: 'Manage in New Tab',
                func: $scope.loadIframe
            }
        ];
    }
]);

app.controller('CiscoFirewallProxyController', [
    '$scope',
    '$sce',
    '$location',
    'ULDBService2',
    'AbstractControllerFactory2',
    function ($scope, $sce, $location, ULDBService2, AbstractControllerFactory2) {

        //  TAB CONTROL : Temporary for Demo
        $scope.tabs = [
            { name: 'Firewall', url: 'firewall' },
            { name: 'Juniper Firewall', url: 'juniper-firewall' },
            { name: 'Cisco Firewall', url: 'cisco-firewall' }
        ];

        $scope.activeTab = 2;
        $scope.updateTab = function (idx) {
            $location.path($scope.tabs[idx].url);
        };
        //  END TAB CONTROL FUNCTIONALITY

        $scope.ctrl = AbstractControllerFactory2($scope, ULDBService2.cisco_firewall());
        $scope.iframe = {
            src: null
        };
        $scope.loadIframe = function (result, idx) {
            $scope.iframe.src = $sce.trustAsResourceUrl(result.proxy_fqdn);
        };
        $scope.clearIframe = function (result, idx) {
            $scope.iframe.src = null;
        };
        $scope.additional_actions = [
            {
                name: 'Load in iframe',
                func: $scope.loadIframe
            }
        ];
    }
]);

app.controller('JuniperFirewallProxyController', [
    '$scope',
    '$window',
    '$sce',
    '$location',
    'ULDBService2',
    'AbstractControllerFactory2',
    function ($scope, $window, $sce, $location, ULDBService2, AbstractControllerFactory2) {

        //  TAB CONTROL : Temporary for Demo
        $scope.tabs = [
            { name: 'Firewall', url: 'firewall' },
            { name: 'Juniper Firewall', url: 'juniper-firewall' },
            { name: 'Cisco Firewall', url: 'cisco-firewall' }
        ];

        $scope.activeTab = 1;
        $scope.updateTab = function (idx) {
            $location.path($scope.tabs[idx].url);
        };
        //  END TAB CONTROL FUNCTIONALITY

        $scope.ctrl = AbstractControllerFactory2($scope, ULDBService2.juniper_firewall());
        $scope.iframe = {
            src: null
        };
        $scope.loadIframe = function (result, idx) {
            // $scope.iframe.src = $sce.trustAsResourceUrl(result.proxy_fqdn);
            $window.open(result.proxy_fqdn, '_blank');
        };
        $scope.clearIframe = function (result, idx) {
            $scope.iframe.src = null;
        };
        $scope.additional_actions = [
            {
                name: 'Manage in New Tab',
                func: $scope.loadIframe
            }
        ];
    }
]);

app.controller('JuniperSwitchProxyController2', [
    '$scope',
    '$sce',
    '$location',
    'ULDBService2',
    'AbstractControllerFactory2',
    function ($scope, $sce, $location, ULDBService2, AbstractControllerFactory2) {

        //  TAB CONTROL : Temporary for Demo
        $scope.tabs = [
            { name: 'Switches', url: 'switch' },
            { name: 'Cisco Switch', url: 'cisco-switch' },
            { name: 'Juniper Switch', url: 'juniper-switch' }
        ];

        $scope.activeTab = 2;
        $scope.updateTab = function (idx) {
            $location.path($scope.tabs[idx].url);
        };
        //  END TAB CONTROL FUNCTIONALITY

        $scope.ctrl = AbstractControllerFactory2($scope, ULDBService2.juniper_switch());
        $scope.iframe = {
            src: null
        };
        $scope.loadIframe = function (result, idx) {
            $scope.iframe.src = $sce.trustAsResourceUrl(result.proxy_fqdn);
        };
        $scope.clearIframe = function (result, idx) {
            $scope.iframe.src = null;
        };
        $scope.additional_actions = [
            {
                name: 'Load in iframe',
                func: $scope.loadIframe
            }
        ];
    }
]);

app.controller('CiscoSwitchProxyController', [
    '$scope',
    '$window',
    '$sce',
    '$location',
    'ULDBService2',
    'AbstractControllerFactory2',
    function ($scope, $window, $sce, $location, ULDBService2, AbstractControllerFactory2) {

        //  TAB CONTROL : Temporary for Demo
        $scope.tabs = [
            { name: 'Switches', url: 'switch' },
            { name: 'Cisco Switch', url: 'cisco-switch' },
            { name: 'Juniper Switch', url: 'juniper-switch' }
        ];

        $scope.activeTab = 1;
        $scope.updateTab = function (idx) {
            $location.path($scope.tabs[idx].url);
        };
        //  END TAB CONTROL FUNCTIONALITY

        $scope.ctrl = AbstractControllerFactory2($scope, ULDBService2.cisco_switch());
        $scope.iframe = {
            src: null
        };
        $scope.loadIframe = function (result, idx) {
            // $scope.iframe.src = $sce.trustAsResourceUrl(result.proxy_fqdn);
            $window.open(result.proxy_fqdn, '_blank');
        };
        $scope.clearIframe = function (result, idx) {
            $scope.iframe.src = null;
        };
        $scope.additional_actions = [
            {
                name: 'Manage in New Tab',
                func: $scope.loadIframe
            }
        ];
    }
]);

app.controller('OrganizationCollectorMapController', [
    '$scope',
    'AbstractControllerFactory2',
    '$uibModal',
    'ULDBService2',
    function ($scope, AbstractControllerFactory2, $uibModal, ULDBService2) {
        $scope.iframe = {
            src: null
        };
        $scope.ctrl = AbstractControllerFactory2($scope, ULDBService2.open_audit_collector_map());
    }
]);

/*
* Observium Monitoring Part
*/
app.controller('ObserviumInstanceController', [
    '$scope',
    '$sce',
    '$location',
    'ULDBService2',
    'AbstractControllerFactory2',
    '$uibModal',
    function ($scope, $sce, $location, ULDBService2, AbstractControllerFactory2, $uibModal) {


        $scope.ctrl = AbstractControllerFactory2($scope, ULDBService2.observium_instance());

        $scope.iframe = {
            src: null
        };
        $scope.additional_actions = [
            // {
            //     name: "Change Api Keys",
            //     func: function (result, index) {
            //           $scope.change_api_keys_entity = result.id;
            //           $scope.change_api_keys_url = "/rest/observium/instance/change_api_keys/";
            //           $scope.changeApiKeys( );
            //     }
            // },
            {
                name: "Change Password",
                func: function (result, index) {
                    $scope.change_password_entity = result.id;
                    $scope.change_password_url = "/rest/observium/instance/change_password/";
                    $scope.changePassword();
                }
            }
        ];

        // $scope.changeApiKeys = function ( ) {
        //     var modalInstance = $uibModal.open({
        //         templateUrl: '/static/rest/app/templates/change_api_keys.html',
        //         scope: $scope,
        //         size: 'md',
        //         controller: 'changeApiKeysContoller'
        //     });
        //     modalInstance.result.then();
        // };

        $scope.changePassword = function () {
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

app.controller('ObserviumDeviceMapController', [
    '$scope',
    '$location',
    'ULDBService2',
    'AbstractControllerFactory2',
    '$uibModal',
    function ($scope, $location, ULDBService2, AbstractControllerFactory2, $uibModal) {
        $scope.iframe = {
            src: null
        };

        $scope.header = "Mappings";

        //  TAB CONTROL : Temporary for Demo
        $scope.tabs = [
            {
                name: 'Switch', uldbservice: ULDBService2.observium_switch(),
            },
            {
                name: 'Firewall', uldbservice: ULDBService2.observium_firewall(),
            },
            {
                name: 'LoadBalancer', uldbservice: ULDBService2.observium_loadbalancer(),
            },
            {
                name: 'Server', uldbservice: ULDBService2.observium_server(),
            },
            {
                name: 'Storage', uldbservice: ULDBService2.observium_storage(),
            },
            {
                name: 'Mac Device', uldbservice: ULDBService2.observium_mac_device(),
            },
            {
                name: 'PDU', uldbservice: ULDBService2.observium_pdu(),
            },
            {
                name: 'VMware VM', uldbservice: ULDBService2.observium_vmware_vm(),
            },
            {
                name: 'Vcloud VM', uldbservice: ULDBService2.observium_vcloud_vm(),
            },
            {
                name: 'OpenStack VM', uldbservice: ULDBService2.observium_openstack_vm(),
            },
            {
                name: 'ESXI VM', uldbservice: ULDBService2.observium_esxi_vm(),
            },
            {
                name: 'Hyper-V VM', uldbservice: ULDBService2.observium_hyperv_vm(),
            },
            {
                name: 'Custom Cloud VM', uldbservice: ULDBService2.observium_custom_cloud_vm(),
            },
            {
                name: 'Proxmox VM', uldbservice: ULDBService2.observium_proxmox_vm(),
            },
            {
                name: 'G3 KVM', uldbservice: ULDBService2.observium_g3kvm_vm(),
            },
            {
                name: 'AWS Instance', uldbservice: ULDBService2.observium_aws_instance(),
            },
        ];

        $scope.activeTab = 0;
        $scope.ctrl = AbstractControllerFactory2($scope, $scope.tabs[$scope.activeTab].uldbservice);
        $scope.updateTab = function (idx) {
            $scope.activeTab = idx;
            $scope.model = null;
            $scope.ctrl = AbstractControllerFactory2($scope, $scope.tabs[$scope.activeTab].uldbservice);
            $location.path($scope.tabs[idx].url);
        };

        // $scope.$watch('model.results', function () {
        //     if ($scope.model && $scope.model.results) {
        //         for (var i = 0; i < $scope.model.results.length; i++) {
        //             if ($scope.model.results[i].zabbix_customer) {
        //                 $scope.model.results[i].zabbix_customer.customer_zabbix_name = $scope.model.results[i].zabbix_customer.customer.name + ' - ' + $scope.model.results[i].zabbix_customer.zabbix_instance.account_name;
        //             }
        //         }
        //     }
        // });

        // $scope.$watch('obj', function (newValue, oldValue) {
        //     if (newValue) {
        //         if ($scope.obj.zabbix_customer) {
        //             $scope.obj.zabbix_customer.customer_zabbix_name = $scope.obj.zabbix_customer.customer.name + ' - ' + $scope.obj.zabbix_customer.zabbix_instance.account_name;
        //         }
        //     }
        // });
    }
]);

app.controller('ObserviumBillingMapController', [
    '$scope',
    '$sce',
    '$location',
    'ULDBService2',
    'AbstractControllerFactory2',
    '$uibModal',
    function ($scope, $sce, $location, ULDBService2, AbstractControllerFactory2, $uibModal) {

        //  TAB CONTROL : Temporary for Demo
        $scope.tabs = [
            { name: 'Billing Mapping', url: '/observium/billing_map' },
        ];


        $scope.activeTab = 0;
        $scope.updateTab = function (idx) {
            $location.path($scope.tabs[idx].url);
        };
        //  END TAB CONTROL FUNCTIONALITY

        $scope.ctrl = AbstractControllerFactory2($scope, ULDBService2.observium_billing());

        $scope.iframe = {
            src: null
        };

    }
]);

app.controller('SwitchPortMapController', [
    '$scope',
    '$sce',
    '$location',
    'ULDBService2',
    'AbstractControllerFactory2',
    '$uibModal',
    function ($scope, $sce, $location, ULDBService2, AbstractControllerFactory2, $uibModal) {
        $scope.tabs = [
            { name: 'Switch Port Mapping', url: '/observium/port/switch_map' },
        ];
        $scope.activeTab = 0;
        $scope.updateTab = function (idx) {
            $location.path($scope.tabs[idx].url);
        };

        $scope.iframe = {
            src: null
        };

        $scope.ctrl = AbstractControllerFactory2($scope, ULDBService2.switch_port_map());
    }
]);

/*
* Zabbix Monitoring Part
*/
app.controller('ZabbixInstanceController', [
    '$scope',
    'ULDBService2',
    'AbstractControllerFactory2',
    '$uibModal',
    function ($scope, ULDBService2, AbstractControllerFactory2, $uibModal) {

        $scope.iframe = {
            src: null
        };

        $scope.header = "Zabbix Instances";

        $scope.ctrl = AbstractControllerFactory2($scope, ULDBService2.zabbix_instance());

        $scope.additional_actions = [
            {
                name: "Change Password",
                func: function (result, index) {
                    $scope.change_password_entity = result.id;
                    $scope.change_password_url = "/rest/zabbix/instance/change_password/";
                    $scope.changePassword();
                }
            }
        ];

        $scope.changePassword = function () {
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

app.controller('ZabbixInstanceCustomerMapController', [
    '$scope',
    'ULDBService2',
    'AbstractControllerFactory2',
    '$uibModal',
    function ($scope, ULDBService2, AbstractControllerFactory2, $uibModal) {

        $scope.iframe = {
            src: null
        };

        $scope.header = "Customer - Zabbix Instance Map";
        $scope.ctrl = AbstractControllerFactory2($scope, ULDBService2.zabbix_customer_instance_map());
    }
]);

app.filter('orgMonitoringConfigToolNameFilter', function () {
    return function (input) {
        if (input) {
            for (var key in input) {
                if (input[key]) {
                    return key;
                }
            }
            return Object.keys(input)[0];
        } else {
            return;
        }
    };
});

app.controller('OrgMonitoringConfigController', [
    '$scope',
    '$filter',
    'AbstractControllerFactory2',
    'ULDBService2',
    function ($scope, $filter, AbstractControllerFactory2, ULDBService2) {

        $scope.ctrl = AbstractControllerFactory2($scope, ULDBService2.org_monitoring_config(), $scope.configObject);

        $scope.$watch('model.results', function () {
            if ($scope.model && $scope.model.results) {
                for (var i = 0; i < $scope.model.results.length; i++) {
                    $scope.model.results[i].url = location.origin + '/rest/org_monitoring_config/' + $scope.model.results[i].id + '/';
                }
            }
        });

        $scope.$watch('obj', function (newValue, oldValue) {
            if (newValue) {
                $scope.obj.switch = $filter('orgMonitoringConfigToolNameFilter')($scope.obj.switch);
                $scope.obj.firewall = $filter('orgMonitoringConfigToolNameFilter')($scope.obj.firewall);
                $scope.obj.load_balancer = $filter('orgMonitoringConfigToolNameFilter')($scope.obj.load_balancer);
                $scope.obj.hypervisor = $filter('orgMonitoringConfigToolNameFilter')($scope.obj.hypervisor);
                $scope.obj.baremetal = $filter('orgMonitoringConfigToolNameFilter')($scope.obj.baremetal);
                $scope.obj.mac_device = $filter('orgMonitoringConfigToolNameFilter')($scope.obj.mac_device);
                $scope.obj.vm = $filter('orgMonitoringConfigToolNameFilter')($scope.obj.vm);
                $scope.obj.storage = $filter('orgMonitoringConfigToolNameFilter')($scope.obj.storage);
                $scope.obj.database = $filter('orgMonitoringConfigToolNameFilter')($scope.obj.database);
                $scope.obj.pdu = $filter('orgMonitoringConfigToolNameFilter')($scope.obj.pdu);
            }
        });
    }
]);

app.controller('ZabbixTemplateDefinitionController', [
    '$scope',
    '$http',
    '$uibModal',
    'ZabbixInstance',
    'ServiceFunctionProvider',
    function ($scope, $http, $uibModal, ZabbixInstance, ServiceFunctionProvider) {
        var modalInstance;
        $scope.templates = [];
        $scope.obj = {};
        $scope.obj.item_key = {};
        $scope.obj.template = {};

        $scope.get_template_definitions = function () {
            $http.get('rest/zabbix/zabbix_templates/').then(function (response) {
                $scope.template_definitions = response.data ? response.data.results : [];
            });
        };
        $scope.get_template_definitions();

        $scope.add = function () {
            $scope.method = 'Add';
            $scope.obj = {};
            modalInstance = $uibModal.open({
                templateUrl: 'templateDefinition.html',
                scope: $scope,
                size: 'md'
            });
            modalInstance.result.then();
        };

        $scope.edit = function (def) {
            $scope.onInstanceSelect(def.zabbix_instance);
            $scope.method = 'Edit';
            $scope.obj = def;
            modalInstance = $uibModal.open({
                templateUrl: 'templateDefinition.html',
                scope: $scope,
                size: 'md'
            });
            modalInstance.result.then();
        };

        $scope.get_instances = function (viewValue) {
            return ServiceFunctionProvider.custom_search(ZabbixInstance, viewValue);
        };

        $scope.onInstanceSelect = function (item) {
            $http.get('rest/zabbix/instance/' + item.id + '/templates/').then(function (response) {
                $scope.templates = response.data;
            });
        };

        $scope.onSubmit = function () {
            if ($scope.obj.template_id) {
                for (var i = 0; i < $scope.templates.length; i++) {
                    if ($scope.templates[i].template_id == $scope.obj.template_id) {
                        $scope.obj.template_name = $scope.templates[i].name;
                    }
                }
                // $scope.obj.template_name = $scope.templates.find(tmpl => tmpl.template_id == $scope.obj.template_id).name;
            }
            if ($scope.method == 'Add') {
                $http.post('rest/zabbix/zabbix_templates/', $scope.obj).then(function (response) {
                    $scope.get_template_definitions();
                    $scope.cancel();
                });
            } else {
                $http.put('rest/zabbix/zabbix_templates/' + $scope.obj.id + '/', $scope.obj).then(function (response) {
                    $scope.get_template_definitions();
                    $scope.cancel();
                });
            }
        };

        $scope.delete = function (def) {
            $scope.obj = def;
            modalInstance = $uibModal.open({
                templateUrl: 'deleteTemplateDefinition.html',
                scope: $scope,
                size: 'md'
            });
            modalInstance.result.then();
        };

        $scope.confirmDelete = function () {
            $http.delete('rest/zabbix/zabbix_templates/' + $scope.obj.id + '/').then(function (response) {
                $scope.get_template_definitions();
                $scope.cancel();
            });
        };

        $scope.cancel = function () {
            $scope.obj = {};
            modalInstance.close();
            modalInstance.dismiss();
        };
    }
]);

app.controller('ZabbixTemplateMappingController', [
    '$scope',
    '$http',
    '$uibModal',
    'ZabbixInstance',
    'ServiceFunctionProvider',
    function ($scope, $http, $uibModal, ZabbixInstance, ServiceFunctionProvider) {

        var os_types = [
            {
                'name': 'ESXi',
                'value': 'ESXi'
            },
            {
                'name': 'Hypervisor',
                'value': 'Hypervisor'
            },
            {
                'name': 'Linux',
                'value': 'Linux'
            },
            {
                'name': 'MacOS',
                'value': 'MacOS'
            },
            {
                'name': 'Nimble',
                'value': 'Nimble'
            },
            {
                'name': 'Windows',
                'value': 'Windows'
            },
        ]
        var public_cloud_types = [
            {
                'name': 'Amazon Web Services (AWS)',
                'value': 'aws'
            },
            {
                'name': 'Microsoft Azure',
                'value': 'azure'
            },
            {
                'name': 'Google Cloud Platform (GCP)',
                'value': 'gcp'
            },
            {
                'name': 'Oracle Cloud Infrastructure (OCI)',
                'value': 'oci'
            }
        ]
        var private_cloud_types = [
            {
                'name': 'Vmware Vcenter',
                'value': 'VMware'
            },
            {
                'name': 'United Private Cloud vCenter',
                'value': 'United Private Cloud vCenter'
            },
        ]
        var controller_types = [
            {
                'name': 'Docker',
                'value': 'docker'
            },
        ]
        var integration_account_types = [
            {
                'name': 'Veeam',
                'value': 'veeam'
            },
            {
                'name': 'Viptela',
                'value': 'viptela'
            },
            {
                'name': 'Cisco Meraki',
                'value': 'meraki'
            },
        ]

        $scope.get_display_name = function (list, value) {
            for (var i = 0; i < list.length; i++) {
                if (list[i].value == value) {
                    return list[i].name;
                }
            }
            return value;
        }

        //  TAB CONTROL : Temporary for Demo
        $scope.tabs = [
            {
                name: 'manufacturer', display_name: 'Manufacturer Mapping', url: 'rest/zabbix/manufacturer_templates/',
                item: {
                    name: 'Manufacturer', url: 'rest/manufacturer/', key: 'manufacturer',
                },
                data: {
                    interface_types: ['Agent', 'SNMP']
                }
            },
            {
                name: 'server_manufacturer', display_name: 'Server Manufacturer Mapping', url: 'rest/zabbix/servermanufacturer_templates/',
                item: {
                    name: 'Server Manufacturer', url: 'rest/server_manufacturer/', key: 'server_manufacturer',
                    sub_item: { name: 'Server Model', url: 'rest/server_model/', key: 'server_model', item_key: 'manufacturer', res: [] },
                },
                data: {
                    interface_types: ['Agent', 'SNMP'],
                }
            },
            {
                name: 'storage_manufacturer', display_name: 'Storage Manufacturer Mapping', url: 'rest/zabbix/storagemanufacturer_templates/',
                item: {
                    name: 'Storage Manufacturer', url: 'rest/storage_manufacturer/', key: 'storage_manufacturer',
                },
                data: {
                    interface_types: ['API', 'Agent', 'SNMP']
                },
            },
            {
                name: 'pdu', display_name: 'PDU Manufacturer Mapping', url: 'rest/zabbix/pdu_templates/',
                item: {
                    name: 'PDU Manufacturer', url: 'rest/pdu_manufacturer/', key: 'pdu_manufacturer',
                },
                data: {
                    interface_types: ['SNMP']
                }
            },
            {
                name: 'database', display_name: 'Database Mapping', url: 'rest/zabbix/database_templates/',
                item: {
                    name: 'Database Type', url: 'rest/database_type/', key: 'database_type',
                },
                data: {
                    interface_types: ['Agent', 'ODBC']
                }
            },
            {
                name: 'os_type', display_name: 'Operating System Type Mapping', url: 'rest/zabbix/os_templates/',
                item: {
                    name: 'Operating System Type', url: 'rest/os/', key: 'os_type', data: os_types
                },
                data: {
                    interface_types: ['Agent', 'SNMP']
                }
            },
            {
                name: 'public_cloud', display_name: 'Public Cloud Mapping', url: 'rest/zabbix/public_cloud_templates/',
                item: {
                    name: 'Public Cloud Type', key: 'type', data: public_cloud_types
                },
            },
            {
                name: 'private_cloud', display_name: 'Private Cloud Mapping', url: 'rest/zabbix/private_cloud_templates/',
                item: {
                    name: 'Private Cloud Type', key: 'type', data: private_cloud_types
                },
            },
            {
                name: 'controller', display_name: 'Controller Mapping', url: '/rest/zabbix/container_templates/',
                item: {
                    name: 'Controller Type', key: 'controller_type', data: controller_types
                },
                data: {
                    interface_types: ['Agent']
                }
            },
            {
                name: 'veeam', display_name: 'Integration Mapping', url: 'rest/zabbix/integ_account_template/',
                item: {
                    name: 'Account Type', key: 'account_type', data: integration_account_types
                },
            },
        ];

        $scope.activeTab = $scope.tabs[3];
        $scope.activeTabNumber = 0;
        var modalInstance;
        $scope.templates = [];
        $scope.items = [];
        $scope.interface_types = $scope.tabs[0].data.interface_types;

        $scope.updateTab = function (idx) {
            $scope.template_mappings = [];
            $scope.activeTabNumber = idx;
            $scope.activeTab = $scope.tabs[idx];
            $scope.interface_types = $scope.tabs[idx].data ? $scope.tabs[idx].data.interface_types : null;
            $scope.get_template_mappings();
        };
        //  END TAB CONTROL FUNCTIONALITY

        $scope.obj = {};
        $scope.get_template_mappings = function () {
            $http.get($scope.activeTab.url).then(function (response) {
                $scope.template_mappings = response.data ? response.data.results : [];
                if ($scope.activeTab.item) {
                    $scope.get_items();
                }
            });
        };
        $scope.get_template_mappings();

        $scope.get_items = function () {
            if ($scope.activeTab.item.data) {
                $scope.items = $scope.activeTab.item.data;
            } else {
                $http.get($scope.activeTab.item.url).then(function (response) {
                    $scope.items = response.data ? response.data.results : [];
                    for (var i = 0; i < $scope.items.length; i++) {
                        if ($scope.items[i].full_name) {
                            $scope.items[i].name = $scope.items[i].full_name;
                        }
                    }
                });
            }
        };

        $scope.get_subitems = function (item_value) {
            if (!$scope.activeTab.item.sub_item || !item_value) {
                return;
            }
            $scope.activeTab.item.sub_item.res = [];
            if ($scope.activeTab.item.sub_item.data) {
                $scope.activeTab.item.sub_item.res = $scope.activeTab.item.sub_item.data;
            } else {
                var sub_item_url = $scope.activeTab.item.sub_item.url
                    + '?' + $scope.activeTab.item.sub_item.item_key + '=' + item_value.id.toString()
                    + '&page_size=0';
                $http.get(sub_item_url).then(function (response) {
                    $scope.activeTab.item.sub_item.res = response.data ? response.data.results : [];
                    var k = [''];
                    var p = k.concat(response.data.results);
                    for (var i = 0; i < $scope.activeTab.item.sub_item.res.length; i++) {
                        if ($scope.activeTab.item.sub_item.res[i].full_name) {
                            $scope.activeTab.item.sub_item.res[i].name = $scope.activeTab.item.sub_item.res[i].full_name;
                        }
                    }
                });
            }
        }

        $scope.add = function () {
            $scope.method = 'Add';
            $scope.obj = {};
            modalInstance = $uibModal.open({
                templateUrl: 'templateMapping.html',
                scope: $scope,
                size: 'md'
            });
            modalInstance.result.then();
        };

        $scope.edit = function (mapping) {
            if ($scope.activeTab.item && $scope.activeTab.item.sub_item) {
                $scope.get_subitems(mapping[$scope.activeTab.item.key]);
            }
            $scope.onInstanceSelect(mapping.zabbix_instance);
            $scope.method = 'Edit';
            $scope.obj = mapping;
            modalInstance = $uibModal.open({
                templateUrl: 'templateMapping.html',
                scope: $scope,
                size: 'md'
            });
            modalInstance.result.then();
        };

        $scope.get_instances = function (viewValue) {
            return ServiceFunctionProvider.custom_search(ZabbixInstance, viewValue);
        };

        $scope.onInstanceSelect = function (item) {
            $http.get('rest/zabbix/instance/' + item.id + '/zabbix_templates/').then(function (response) {
                $scope.templates = response.data;
            });
        };

        $scope.onSubmit = function () {
            if ($scope.method == 'Add') {
                $http.post($scope.activeTab.url, $scope.obj).then(function (response) {
                    $scope.get_template_mappings();
                    $scope.cancel();
                });
            } else {
                $http.put($scope.activeTab.url + $scope.obj.id + '/', $scope.obj).then(function (response) {
                    $scope.get_template_mappings();
                    $scope.cancel();
                });
            }
        };

        $scope.delete = function (mapping) {
            $scope.obj = mapping;
            modalInstance = $uibModal.open({
                templateUrl: 'deleteTemplateMapping.html',
                scope: $scope,
                size: 'md'
            });
            modalInstance.result.then();
        };

        $scope.confirmDelete = function () {
            $http.delete($scope.activeTab.url + $scope.obj.id + '/').then(function (response) {
                $scope.get_template_mappings();
                $scope.cancel();
            });
        };

        $scope.cancel = function () {
            $scope.obj = {};
            modalInstance.close();
            modalInstance.dismiss();
        };
    }
]);

app.controller('ZabbixDeviceMapController', [
    '$scope',
    '$http',
    '$uibModal',
    'ServiceFunctionProvider',
    'ZabbixCustomer',
    'SwitchFast',
    'FirewallFast',
    'LoadBalancerFast',
    'ServerFast',
    'MacDeviceFast',
    'VMwareVMFast',
    'VCloudVMFast',
    'ESXIVMFast',
    'HyperVVMFast',
    'OpenStackVMFast',
    'CustomCloudVMFast',
    'StorageFast',
    'DatabaseServerFast',
    'PDUFast',
    function ($scope, $http, $uibModal, ServiceFunctionProvider, ZabbixCustomer,
        SwitchFast, FirewallFast, LoadBalancerFast, ServerFast, MacDeviceFast,
        VMwareVMFast, VCloudVMFast, ESXIVMFast, HyperVVMFast, OpenStackVMFast, CustomCloudVMFast,
        StorageFast, DatabaseServerFast, PDUFast,) {

        //  TAB CONTROLS
        $scope.tabs = [
            {
                name: 'Switch', url: 'rest/zabbix/switch/', deviceRef: 'switch'
            },
            {
                name: 'Firewall', url: 'rest/zabbix/firewall/', deviceRef: 'firewall'
            },
            {
                name: 'Load Balancer', url: 'rest/zabbix/loadbalancer/', deviceRef: 'loadbalancer'
            },
            {
                name: 'Hypervisor', url: 'rest/zabbix/server/', deviceRef: 'server'
            },
            {
                name: 'Baremetal', url: 'rest/zabbix/bm_server/', deviceRef: 'server'
            },
            {
                name: 'Mac Device', url: 'rest/zabbix/macdevice/', deviceRef: 'macdevice'
            },
            {
                name: 'VMware VM', url: 'rest/zabbix/vmwarevm/', deviceRef: 'vmwarevm'
            },
            {
                name: 'VCloud VM', url: 'rest/zabbix/vcloudvm/', deviceRef: 'vcloudvm'
            },
            {
                name: 'ESXI VM', url: 'rest/zabbix/esxivm/', deviceRef: 'esxivm'
            },
            {
                name: 'Hyper-v VM', url: 'rest/zabbix/hypervvm/', deviceRef: 'hypervvm'
            },
            {
                name: 'OpenStack VM', url: 'rest/zabbix/openstackvm/', deviceRef: 'openstackvm'
            },
            {
                name: 'Custom VM', url: 'rest/zabbix/customvm/', deviceRef: 'customvm'
            },
            {
                name: 'Storage', url: 'rest/zabbix/storagedevice/', deviceRef: 'storagedevice'
            },
            {
                name: 'Database Server', url: 'rest/zabbix/databaseserver/', deviceRef: 'database_server'
            },
            {
                name: 'PDU', url: 'rest/zabbix/pdu/', deviceRef: 'pdu'
            },
        ];

        $scope.activeTab = $scope.tabs[0];
        $scope.activeTabNumber = 0;
        var modalInstance;
        $scope.templates = [];
        $scope.items = [];
        $scope.header = 'Zabbix Instance - ' + $scope.tabs[0].name + 'Mapping';

        $scope.updateTab = function (idx) {
            $scope.device_mappings = null;
            $scope.templates = [];
            $scope.activeTabNumber = idx;
            $scope.activeTab = $scope.tabs[idx];
            $scope.header = 'Zabbix Instance - ' + $scope.tabs[idx].name + 'Mapping';
            $scope.get_device_mappings();
        };
        //  END TAB CONTROL FUNCTIONALITY

        $scope.obj = {};
        $scope.get_device_mappings = function () {
            $http.get($scope.activeTab.url).then(function (response) {
                var mappings = [];
                if (response.data) {
                    for (var i = 0; i < response.data.results.length; i++) {
                        if (response.data.results[i] && response.data.results[i].zabbix_customer) {
                            response.data.results[i].zabbix_customer.customer_zabbix_name = response.data.results[i].zabbix_customer.customer.name + ' - ' + response.data.results[i].zabbix_customer.zabbix_instance.account_name;
                            response.data.results[i].device = response.data.results[i][$scope.activeTab.deviceRef];
                            mappings.push(response.data.results[i]);
                        }
                    }
                }
                $scope.device_mappings = mappings.concat([]);
            });
        };
        $scope.get_device_mappings();

        $scope.add = function () {
            $scope.method = 'Add';
            $scope.obj = {};
            modalInstance = $uibModal.open({
                templateUrl: 'deviceMapping.html',
                scope: $scope,
                size: 'md'
            });
            modalInstance.result.then();
        };

        $scope.edit = function (mapping) {
            $scope.method = 'Edit';
            $scope.templates = [];
            $http.get('rest/zabbix/instance/' + mapping.zabbix_customer.zabbix_instance.id + '/zabbix_templates/').then(function (response) {
                $scope.templates = response.data;
                let selectedTemplates = [];
                for (var t = 0; t < mapping.zabbix_templates.length; t++) {
                    for (var i = 0; i < response.data.length; i++) {
                        if (mapping.zabbix_templates[t] == response.data[i].template_name) {
                            selectedTemplates.push(response.data[i]);
                            break;
                        }
                    }
                }
                mapping.templates = selectedTemplates;
                $scope.obj = mapping;
                modalInstance = $uibModal.open({
                    templateUrl: 'deviceMapping.html',
                    scope: $scope,
                    size: 'md'
                });
                modalInstance.result.then();
            });
        };

        $scope.get_instances = function (viewValue) {
            return ServiceFunctionProvider.search_zabbix_instance(ZabbixCustomer, viewValue);
        };

        $scope.get_devices = function (viewValue) {
            switch ($scope.activeTab.deviceRef) {
                case 'switch': return ServiceFunctionProvider.custom_search(SwitchFast, viewValue, 'is_shared', false);
                case 'firewall': return ServiceFunctionProvider.custom_search(FirewallFast, viewValue, 'is_shared', false);
                case 'loadbalancer': return ServiceFunctionProvider.custom_search(LoadBalancerFast, viewValue, 'is_shared', false);
                case 'server': return ServiceFunctionProvider.search(ServerFast, viewValue);
                case 'server': return ServiceFunctionProvider.search(ServerFast, viewValue);
                case 'macdevice': return ServiceFunctionProvider.search(MacDeviceFast, viewValue);
                case 'vmwarevm': return ServiceFunctionProvider.search(VMwareVMFast, viewValue);
                case 'vcloudvm': return ServiceFunctionProvider.search(VCloudVMFast, viewValue);
                case 'esxivm': return ServiceFunctionProvider.search(ESXIVMFast, viewValue);
                case 'hypervvm': return ServiceFunctionProvider.search(HyperVVMFast, viewValue);
                case 'openstackvm': return ServiceFunctionProvider.search(OpenStackVMFast, viewValue);
                case 'customvm': return ServiceFunctionProvider.search(CustomCloudVMFast, viewValue);
                case 'storagedevice': return ServiceFunctionProvider.search(StorageFast, viewValue);
                case 'database_server': return ServiceFunctionProvider.search(DatabaseServerFast, viewValue);
                case 'pdu': return ServiceFunctionProvider.search(PDUFast, viewValue);
                default: return [];
            }
        };

        $scope.onInstanceSelect = function (item) {
            $scope.templates = [];
            $http.get('rest/zabbix/instance/' + item.zabbix_instance.id + '/zabbix_templates/').then(function (response) {
                $scope.templates = response.data;
            });
        };

        $scope.onDeviceSelect = function (selected) {
            $scope.obj[$scope.activeTab.deviceRef] = selected;
        }

        $scope.onSubmit = function () {
            delete ($scope.obj.device);
            if ($scope.method == 'Add') {
                $http.post($scope.activeTab.url, $scope.obj).then(function (response) {
                    $scope.get_device_mappings();
                    $scope.cancel();
                });
            } else {
                $http.put($scope.activeTab.url + $scope.obj.id + '/', $scope.obj).then(function (response) {
                    $scope.get_device_mappings();
                    $scope.cancel();
                });
            }
        };

        $scope.delete = function (mapping) {
            $scope.obj = mapping;
            modalInstance = $uibModal.open({
                templateUrl: 'deleteDeviceMapping.html',
                scope: $scope,
                size: 'md'
            });
            modalInstance.result.then();
        };

        $scope.confirmDelete = function () {
            $http.delete($scope.activeTab.url + $scope.obj.id + '/').then(function (response) {
                $scope.get_device_mappings();
                $scope.cancel();
            });
        };

        $scope.cancel = function () {
            $scope.obj = {};
            modalInstance.close();
            modalInstance.dismiss();
        };
    }
]);

app.controller('ZabbixAgentDetailsController', [
    '$scope',
    '$http',
    '$uibModal',
    function ($scope, $http, $uibModal) {
        var modalInstance;
        $scope.os_distributions = ['Windows', 'Ubuntu', 'Debian', 'Red Hat Enterprise Linux', 'SUSE Linux Enterprise Server'];
        $scope.os_versions = [];
        $scope.hardwares = ['amd 64'];
        $scope.obj = {};

        $scope.get_agent_details = function () {
            $http.get('rest/zabbix_agent_map/').then(function (response) {
                $scope.agent_details = response.data ? response.data.results : [];
            });
        };
        $scope.get_agent_details();

        $scope.add = function () {
            $scope.method = 'Add';
            $scope.obj = {};
            modalInstance = $uibModal.open({
                templateUrl: 'agentDetails.html',
                scope: $scope,
                size: 'md'
            });
            modalInstance.result.then();
        };

        $scope.edit = function (agent) {
            $scope.method = 'Edit';
            $scope.obj = agent;
            $scope.get_os_version();
            modalInstance = $uibModal.open({
                templateUrl: 'agentDetails.html',
                scope: $scope,
                size: 'md'
            });
            modalInstance.result.then();
        };

        $scope.get_os_version = function () {
            switch ($scope.obj.os_distribution) {
                case 'Windows': $scope.os_versions = ['any']; break;
                case 'Ubuntu': $scope.os_versions = ['22.04 (Jammy)', '20.04 (Focal)', '18.04 (Bionic)', '16.04 (Xenial)', '14.04 (Trusty)']; break;
                case 'Debian': $scope.os_versions = ['11 (Bullseye)', '10 (Buster)', '9 (Stretch)', '8 (Jessie)']; break;
                case 'Red Hat Enterprise Linux': $scope.os_versions = ['9 (Plow)', '8 (Ootpa)', '7 (Maipo)', '6 (Santiago)']; break;
                case 'SUSE Linux Enterprise Server': $scope.os_versions = ['15', '12']; break;
                default: $scope.os_versions = []; break;
            }
        }

        $scope.onSubmit = function () {
            if ($scope.method == 'Add') {
                $http.post('rest/zabbix_agent_map/', $scope.obj).then(function (response) {
                    $scope.get_agent_details();
                    $scope.cancel();
                });
            } else {
                $http.put('rest/zabbix_agent_map/' + $scope.obj.id + '/', $scope.obj).then(function (response) {
                    $scope.get_agent_details();
                    $scope.cancel();
                });
            }
        };

        $scope.delete = function (def) {
            $scope.obj = def;
            modalInstance = $uibModal.open({
                templateUrl: 'deleteAgentDetails.html',
                scope: $scope,
                size: 'md'
            });
            modalInstance.result.then();
        };

        $scope.confirmDelete = function () {
            $http.delete('rest/zabbix_agent_map/' + $scope.obj.id + '/').then(function (response) {
                $scope.get_agent_details();
                $scope.cancel();
            });
        };

        $scope.cancel = function () {
            $scope.obj = {};
            modalInstance.close();
            modalInstance.dismiss();
        };
    }
]);

