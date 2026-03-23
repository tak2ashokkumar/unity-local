'use strict';
var rest_app = angular.module('uldbapi', ['ngResource']);

// maybe this should be an angular factory...
var DRFQueryFactory = function () {
    var query = function () {
        return {
            method: 'GET',
            cache: false,
            isArray: false
            , transformResponse: function (data, headersGetter) {
                var d = angular.fromJson(data);
                return {
                    results: d.results,
                    count: d.count
                };
            }
        };
    };
    return new query();
};

var registry = [
    { resourceName: 'VCenter', uri: 'vcenter' }

    // server stuff
    , { resourceName: 'ExampleData', uri: 'example_data' }
    , { resourceName: 'Server', uri: 'server' }
    , { resourceName: 'BMServer', uri: 'bm_server' }
    , { resourceName: 'VirtualMachine', uri: 'vm' }
    , { resourceName: 'SAN', uri: 'san' }
    , { resourceName: 'Manufacturer', uri: 'manufacturer' }
    , { resourceName: 'ServerManufacturer', uri: 'server_manufacturer' }
    , { resourceName: 'MobileDeviceManufacturer', uri: 'mobile_manufacturer' }
    , { resourceName: 'StorageManufacturer', uri: 'storage_manufacturer' }
    , { resourceName: 'PDUManufacturer', uri: 'pdu_manufacturer' }
    , { resourceName: 'Chassis', uri: 'chassis' }
    , { resourceName: 'Motherboard', uri: 'motherboard' }
    , { resourceName: 'MotherboardModel', uri: 'motherboardmodel' }
    , { resourceName: 'Disk', uri: 'disk' }
    , { resourceName: 'DiskType', uri: 'disktype' }
    , { resourceName: 'CPU', uri: 'cpu' }
    , { resourceName: 'CPUType', uri: 'cpumodel' }
    , { resourceName: 'Memory', uri: 'memory' }
    , { resourceName: 'MemoryType', uri: 'memorytype' }
    , { resourceName: 'NIC', uri: 'nic' }
    , { resourceName: 'NICType', uri: 'nictype' }
    , { resourceName: 'RAIDController', uri: 'raidcontroller' }
    , { resourceName: 'IPMI', uri: 'ipmi' }
    , { resourceName: 'IPMIModel', uri: 'ipmitype' }
    , { resourceName: 'StorageModel', uri: 'storage_model' }
    , { resourceName: 'MobileDeviceModel', uri: 'mobile_model' }
    , { resourceName: 'ServerModel', uri: 'server_model' }
    , { resourceName: 'InstanceType', uri: 'instancetype' }
    , { resourceName: 'OS', uri: 'os' }
    , { resourceName: 'Admin', uri: 'admin' }
    , { resourceName: 'SystemPowerSupplyPort', uri: 'systempowersupplyport' }
    , { resourceName: 'CloudTypes', uri: 'cloudtype' }
    , { resourceName: 'DiskControllerTypes', uri: 'diskcontroller' }
    , { resourceName: 'VirtualDataCenter', uri: 'virtualdatacenter' }

    // organization/user stuff
    , { resourceName: 'Organization', uri: 'org' }
    , { resourceName: 'OrgStorageInventory', uri: 'org_storage' }
    , { resourceName: 'OrgMonitoringConfig', uri: 'org_monitoring_config' }
    , { resourceName: 'User', uri: 'user' }
    , { resourceName: 'Role', uri: 'role' }
    , { resourceName: 'Group', uri: 'group' }
    , { resourceName: 'OrganizationType', uri: 'organizationtype' }
    , { resourceName: 'CustomerType', uri: 'customertype' }
    , { resourceName: 'AccessType', uri: 'access_type' }
    , { resourceName: 'UnityModules', uri: 'unity_modules' }
    , { resourceName: 'AccessList', uri: 'access_list' }
    , { resourceName: 'OrgSummary', uri: 'org_summary' }

    // Release Notes
    , { resourceName: 'Release', uri: 'release' }

    // logical server stuff
    , { resourceName: 'Instance', uri: 'instance' }
    , { resourceName: 'HostMonitor', uri: 'host_monitor' }
    , { resourceName: 'GraphedPort', uri: 'graphed_port' }
    , { resourceName: 'NagiosHost', uri: 'nagios_hosts' }
    , { resourceName: 'SystemType', uri: 'systemtype' }
    , { resourceName: 'ServerType', uri: 'instancetype' }
    , { resourceName: 'ProductType', uri: 'producttype' }

    // networking
    , { resourceName: 'Switch', uri: 'switch' }
    , { resourceName: 'SwitchModel', uri: 'switchmodel' }
    , { resourceName: 'LoadBalancer', uri: 'loadbalancer' }
    , { resourceName: 'VirtualLoadBalancer', uri: 'virtual_load_balancer' }
    , { resourceName: 'Firewall', uri: 'firewall' }
    , { resourceName: 'PowerCircuit', uri: 'powercircuit' }
    , { resourceName: 'ColoCloud', uri: 'colo_cloud' }
    , { resourceName: 'LoadBalancerModel', uri: 'loadbalancermodel' }
    , { resourceName: 'FirewallModel', uri: 'firewallmodel' }
    , { resourceName: 'IPv6Block', uri: 'ipv6_blocks' }
    , { resourceName: 'ObserviumHost', uri: 'observium_host' }
    , { resourceName: 'TransitPort', uri: 'transit_port' }

    // infrastructure
    , { resourceName: 'DataCenter', uri: 'datacenter' }
    , { resourceName: 'Location', uri: 'location' }
    , { resourceName: 'PDU', uri: 'pdu' }
    , { resourceName: 'PDUModel', uri: 'pdumodel' }
    , { resourceName: 'Cabinet', uri: 'cabinet' }
    , { resourceName: 'CabinetModel', uri: 'cabinetmodel' }
    , { resourceName: 'CabinetType', uri: 'cabinettype' }
    , { resourceName: 'Cage', uri: 'cage' }
    , { resourceName: 'ElectricalPanel', uri: 'panel' }
    , { resourceName: 'ElectricalCircuit', uri: 'electricalcircuit' }
    , { resourceName: 'TerminalServer', uri: 'terminalserver' }
    , { resourceName: 'CustomDevice', uri: 'customdevice' }
    , { resourceName: 'TerminalServerModel', uri: 'terminalservermodel' }
    , { resourceName: 'SwitchPort', uri: 'switchport' }
    , { resourceName: 'SwitchMonitor', uri: 'switch_monitor' }
    , { resourceName: 'MonitoredSwitchPort', uri: 'switch_monitor_ports' }

    // status (should this be here?)
    , { resourceName: 'InvStatus', uri: 'invstatustype' }
    , { resourceName: 'CabinetOption', uri: 'cabinetoption' }
    , { resourceName: 'CircuitOption', uri: 'circuitoption' }
    , { resourceName: 'CPUSocketType', uri: 'cpusockettype' }
    , { resourceName: 'AMPSType', uri: 'ampstype' }
    , { resourceName: 'OutletType', uri: 'outlettype' }
    , { resourceName: 'PeripheralType', uri: 'peripheraltype' }
    , { resourceName: 'ClusterType', uri: 'clustertype' }
    , { resourceName: 'SASControllerType', uri: 'sascontroller' }
    , { resourceName: 'VoltageType', uri: 'voltagetype' }
    , { resourceName: 'VLANPoolType', uri: 'vlanpool' }
    , { resourceName: 'VLAN', uri: 'vlan' }

    // erroneously here due to bad code duplication
    , { resourceName: 'ChassisModelFast', uri: 'chassistype' }
    , { resourceName: 'NICModelFast', uri: 'nictype' }
    , { resourceName: 'MotherboardModelFast', uri: 'motherboardmodel' }
    , { resourceName: 'IPMIModelFast', uri: 'ipmitype' }
    , { resourceName: 'LoadbalancerModelFast', uri: 'loadbalancermodel' }
    , { resourceName: 'FirewallModelFast', uri: 'firewallmodel' }
    , { resourceName: 'CabinetModelFast', uri: 'cabinet_model' }
    , { resourceName: 'CabinetModelFast', uri: 'cabinet_model' }

    // ip
    , { resourceName: 'PublicIPv4Allocation', uri: 'public_ipv4_allocations' }
    , { resourceName: 'PublicIPv4Assignment', uri: 'public_ipv4_assignments' }
    , { resourceName: 'PrivateIPv4Allocation', uri: 'private_ipv4_allocations' }
    , { resourceName: 'PrivateIPv4Assignment', uri: 'private_ipv4_assignments' }
    , { resourceName: 'IPv6Allocation', uri: 'ipv6_allocations' }
    , { resourceName: 'IPv6Location', uri: 'ipv6_regions' }

    // ticket
    , { resourceName: 'TicketOrg', uri: 'ticket_org' }
    , { resourceName: 'TicketUser', uri: 'ticket_user' }
    , { resourceName: 'ZendeskTicket', uri: 'zendesk_ticket' }

    // celery
    , { resourceName: 'CeleryTask', uri: 'celery_task' }
    , { resourceName: 'CeleryWorker', uri: 'celery_worker' }

    //Management Interfaces - Proxy
    , { resourceName: 'VcenterProxy', uri: 'vcenter' }
    , { resourceName: 'EsxiProxy', uri: 'esxi' }
    , { resourceName: 'OpenstackProxy', uri: 'openstack_proxy' }
    , { resourceName: 'F5LoadBalancer', uri: 'f5loadbalancer' }
    , { resourceName: 'CiscoFirewallProxy', uri: 'cisco_firewall' }
    , { resourceName: 'CiscoSwitchProxy', uri: 'cisco_switch' }
    , { resourceName: 'CitrixProxy', uri: 'citrix_vpx_device' }
    , { resourceName: 'JuniperSwitchProxy', uri: 'juniper_switch' }
    , { resourceName: 'JuniperFirewallProxy', uri: 'juniper_firewall' }
    , { resourceName: 'TenableSecurityCenter', uri: 'tenable' }

    , { resourceName: 'Vcenter', uri: 'vcenter' }
    , { resourceName: 'EsxiDetail', uri: 'esxi' }
    , { resourceName: 'OpenstackDetail', uri: 'openstack_proxy' }
    , { resourceName: 'F5LoadBalancerDetail', uri: 'f5loadbalancer' }
    , { resourceName: 'CiscoDetail', uri: 'cisco' }
    , { resourceName: 'CitrixDetail', uri: 'citrix_vpx_device' }
    , { resourceName: 'JuniperDetail', uri: 'juniper_switch' }

    , { resourceName: 'TerraformVM', uri: 'terraform' }
    , { resourceName: 'AWSAMIS', uri: 'aws_amis' }

    , { resourceName: 'SwitchPortMap', uri: 'switchport' }
    , { resourceName: 'ServiceCatalogue', uri: 'service_catalogue' }
    , { resourceName: 'OpenAuditCollectorMapping', uri: 'collector_map' }

    , { resourceName: 'DevOpsScripts', uri: 'collector_map' }
];


var fastRegistry = [
    { resourceName: 'OrganizationFast', uri: 'org' }
    , { resourceName: 'UserFast', uri: 'user' }
    , { resourceName: 'DatacenterFast', uri: 'datacenter' }
    , { resourceName: 'SwitchModelFast', uri: 'switchmodel' }
    , { resourceName: 'PDUModelFast', uri: 'pdumodel' }
    , { resourceName: 'CabinetFast', uri: 'cabinet' }
    , { resourceName: 'SwitchFast', uri: 'switch' }
    , { resourceName: 'FirewallFast', uri: 'firewall' }
    , { resourceName: 'LoadBalancerFast', uri: 'load_balancer' }
    , { resourceName: 'ServerFast', uri: 'server' }
    , { resourceName: 'StorageFast', uri: 'storagedevice' }
    , { resourceName: 'MacDeviceFast', uri: 'macdevice' }
    , { resourceName: 'PDUFast', uri: 'pdu' }
    , { resourceName: 'InstanceFast', uri: 'instance' }
    , { resourceName: 'DatabaseServerFast', uri: 'database_server' }

    , { resourceName: 'AWSInstanceFast', uri: 'aws_instance' }
    , { resourceName: 'VMwareVMFast', uri: 'vmware_vm' }
    , { resourceName: 'VCloudVMFast', uri: 'vcloud_vm' }
    , { resourceName: 'ESXIVMFast', uri: 'esxi_vm' }
    , { resourceName: 'HyperVVMFast', uri: 'hyperv_vm' }
    , { resourceName: 'ProxmoxVM', uri: 'proxmox_vm' }
    , { resourceName: 'G3KVM', uri: 'g3kvm_vm' }
    , { resourceName: 'OpenStackVMFast', uri: 'openstack_vm' }
    , { resourceName: 'CustomCloudVMFast', uri: 'vm' }

    , { resourceName: 'TicketUserGroupFast', uri: 'ticket_group' }
    , { resourceName: 'PrivateCloudFast', uri: 'private_cloud' }
];

var billingRegistry = [
    { resourceName: 'SalesforceOpportunity', uri: 'salesforce_opportunity' }
    , { resourceName: 'Invoice', uri: 'invoice' }
    , { resourceName: 'ServiceContract', uri: 'service_contract' }
];

var v3p1Registry = [
    { resourceName: 'PrivateCloud', uri: 'private_cloud' }
    // , { resourceName: 'TenableSecurityCenter', uri: 'tenable' } // Could not resolve URL for hyperlinked relationship
];

var v3Registry = [
    { resourceName: 'MaintenanceSchedule', uri: 'mschedules' }
];

var openStackRegistry = [
    { resourceName: 'OpenStackController', uri: 'controller' }
    , { resourceName: 'OpenStackInstance', uri: 'instance' }
];

var vmwareRegistry = [
    { resourceName: 'VMwareVcenter', uri: 'vcenter' }
    , { resourceName: 'VMwareVcenterConfig', uri: 'vcenter_config' }
];

var observiumRegistry = [
    { resourceName: 'ObserviumInstance', uri: 'instance' }
    , { resourceName: 'ObserviumServer', uri: 'server' }
    , { resourceName: 'ObserviumSwitch', uri: 'switch' }
    , { resourceName: 'ObserviumFirewall', uri: 'firewall' }
    , { resourceName: 'ObserviumLoadBalancer', uri: 'load_balancer' }
    , { resourceName: 'ObserviumPDU', uri: 'pdu' }
    , { resourceName: 'ObserviumAWSInstance', uri: 'aws_instance' }
    , { resourceName: 'ObserviumVMwareVM', uri: 'vmware_vm' }
    , { resourceName: 'ObserviumVCloudVM', uri: 'vcloud_vm' }
    , { resourceName: 'ObserviumESXIVM', uri: 'esxi_vm' }
    , { resourceName: 'ObserviumHyperVVM', uri: 'hyperv_vm' }
    , { resourceName: 'ObserviumProxmoxVM', uri: 'proxmox_vm' }
    , { resourceName: 'ObserviumG3KVMVM', uri: 'g3kvm_vm' }
    , { resourceName: 'ObserviumStorage', uri: 'storagedevice' }
    , { resourceName: 'ObserviumMacDevice', uri: 'macdevice' }
    , { resourceName: 'ObserviumBilling', uri: 'billing' }
    , { resourceName: 'ObserviumOpenStackVM', uri: 'openstack_vm' }
    , { resourceName: 'ObserviumCustomCloudVM', uri: 'custom_vm' }
];

var zabbixRegistry = [
    { resourceName: 'ZabbixInstance', uri: 'instance' },
    { resourceName: 'ZabbixCustomer', uri: 'zabbix_customers' },
    { resourceName: 'ZabbixSwitch', uri: 'switch' },
    { resourceName: 'ZabbixFirewall', uri: 'firewall' },
    { resourceName: 'ZabbixLoadbalancer', uri: 'loadbalancer' },
    { resourceName: 'ZabbixServer', uri: 'server' },
    { resourceName: 'ZabbixStorage', uri: 'storagedevice' },
    { resourceName: 'ZabbixMacDevice', uri: 'macdevice' },
    { resourceName: 'ZabbixDatabaseServer', uri: 'databaseserver' },
    { resourceName: 'ZabbixPDU', uri: 'pdu' },
    { resourceName: 'ZabbixVMwareVM', uri: 'vmwarevm' },
    { resourceName: 'ZabbixVCloudVM', uri: 'vcloudvm' },
    { resourceName: 'ZabbixESXIVM', uri: 'esxivm' },
    { resourceName: 'ZabbixHyperVVM', uri: 'hypervvm' },
    { resourceName: 'ZabbixOpenStackVM', uri: 'openstackvm' },
    { resourceName: 'ZabbixCustomVM', uri: 'customvm' },
    { resourceName: 'ZabbixTemplates', uri: 'zabbix_templates' },
];

var orchestrationRegistry = [
    { resourceName: 'AdminScripts', uri: 'admin_scripts' },
];

function expandFastUri(uri) {
    return '/rest/fast/' + uri + '/:id/';
}

function expandAdminUri(uri) {
    return '/rest/' + uri + '/:id/';
}

function expandBillingUri(uri) {
    return '/rest/v3.1/billing/' + uri + '/:id/';
}

function expand3p1Uri(uri) {
    return '/rest/v3.1/' + uri + '/:uuid/';
}

function expand3Uri(uri) {
    return '/rest/v3/' + uri + '/:id/';
}

function expandOpenStackUri(uri) {
    return '/rest/openstack/' + uri + '/:id/';
}

function expandVMwareUri(uri) {
    return '/rest/vmware/' + uri + '/:id/';
}

function expandObserviumUri(uri) {
    return '/rest/observium/' + uri + '/:id/';
}

function expandZabbixUri(uri) {
    return '/rest/zabbix/' + uri + '/:id/';
}

function expandOrchestrationUri(uri) {
    return '/rest/orchestration/' + uri + '/:id/';
}

function initRegistry(reg, resolverFunc) {
    reg.forEach(function (e, i, arr) {
        // here's where the real work is done
        rest_app.factory(e.resourceName, ['$resource',
            function ($resource) {
                var url = resolverFunc(e.uri);
                var resource = $resource(url, {
                    id: '@id'
                }, {
                        query: DRFQueryFactory(),
                        update: { method: 'PUT' }
                    });
                resource.reflect = e;
                return resource;
            }
        ]);
    });
}


function initRegistryUUID(reg, resolverFunc) {
    reg.forEach(function (e, i, arr) {
        // here's where the real work is done
        rest_app.factory(e.resourceName, ['$resource',
            function ($resource) {
                var url = resolverFunc(e.uri);
                var resource = $resource(url, {
                    uuid: '@uuid'
                }, {
                        query: DRFQueryFactory(),
                        update: { method: 'PUT' }
                    });
                resource.reflect = e;
                return resource;
            }
        ]);
    });
}

initRegistry(registry, expandAdminUri);
initRegistry(fastRegistry, expandFastUri);
initRegistry(billingRegistry, expandBillingUri);
initRegistryUUID(v3p1Registry, expand3p1Uri);
initRegistry(v3Registry, expand3Uri);
initRegistry(openStackRegistry, expandOpenStackUri);
initRegistry(vmwareRegistry, expandVMwareUri);
initRegistry(observiumRegistry, expandObserviumUri);
initRegistry(zabbixRegistry, expandZabbixUri);
initRegistry(orchestrationRegistry, expandOrchestrationUri);


rest_app.provider('UnityIntegrations', function () {
    this.salesforce_domain = 'na4.salesforce.com';
    var app_config = null;


    this.$get = ['$http', function ($http) {
        var domain = this.salesforce_domain;
        if (this.app_config === null) {
            $http.get('/func/app_config/').then(function (response) {
                this.app_config = response.data;
            });
        }
        return {
            getSalesforceLink: function (sfid) {
                return 'https://' + domain + '/' + sfid;
            },
            getAppConfig: function () {
                return this.app_config;
            }
        };
    }];

    this.setSalesforceDomain = function (domain) {
        this.salesforce_domain = domain;
    };
});

rest_app.provider('ColumnRegistry', function () {

    // resources needed for querying
    // var systemManufacturerApi;
    // var chassisApi;
    // var public_ipv4_allocation;
    // var virtual_machine;
    // var serverApi;
    // var instanceApi;
    // var operatingSystemApi;
    // var organizationApi;
    // var filter
    var resources = {
        filterProv: null,
        systemManufacturerApi: null,
        chassisApi: null,
        public_ipv4_allocation: null,
        virtual_machine: null,
        serverApi: null,
        instanceApi: null,
        operatingSystemApi: null,
        organizationApi: null,
        sfOpportunity: null
    };

    // helper utilities
    var _filter = function (list, iterable) {
        if (list !== undefined && list.length > 0) {
            return iterable.filter(function (e, i, arr) {
                return (list[i.name] !== -1);
            });
        }
        return iterable;
    };

    var search = function (api, val) {
        return api.get({ search: val }).$promise.then(function (response) {
            return response.results;
        });
    };

    // the service itself
    var service = function () {
        var server = function () {
            var fields = function (list) {
                var _f = [
                    { name: 'name', description: 'Name', required: true },
                    { name: 'asset_tag', description: 'Asset Tag', required: true },
                    { name: 'memory_mb', description: 'Memory (MB)', required: false },
                    { name: 'disk_gb', description: 'Disk Capacity (GB)', required: false },
                    {
                        name: 'server_manufacturer', description: 'Manufacturer', required: true,
                        opaque: true,
                        subfield: 'name',
                        read: function (server) {
                            if (server.system_manufacturer) {
                                return server.system_manufacturer.name;
                            }
                            return '';
                        },
                        inputMethod: {
                            type: 'typeahead',
                            invoker: function (val) {
                                return search(resources.systemManufacturerApi, val);
                            },
                            render: function (rel) {
                                return rel.name;
                            },
                            accessor: 'name'
                        }
                    },
                    { name: 'serial_number', description: 'Serial number', required: true },
                    {
                        name: 'chassis', description: 'Chassis', required: true,
                        opaque: true,
                        subfield: 'assettag',
                        read: function (server) {
                            if (server.chassis) {
                                return server.chassis.model_name;
                            }
                            return '';
                        },
                        inputMethod: {
                            type: 'typeahead',
                            invoker: function (val) {
                                return search(resources.chassisApi, val);
                            },
                            render: function (rel) {
                                return rel.model_name;
                            },
                            accessor: 'model_name'
                        }
                    },
                    {
                        name: 'motherboard', description: 'Motherboard', required: true,
                        opaque: true,
                        subfield: 'assettag',
                        read: function (server) {
                            if
                                (server.motherboard) {
                                return server.motherboard.mb_model.model_name;
                            }
                            return '';
                        }

                    },
                    { name: 'salesforce_id', description: 'Salesforce ID', required: true },
                    { name: 'description', description: 'Description', required: true }
                ];
                return _filter(list, _f);
            };
            var title = {
                singular: 'Server',
                plural: 'Servers'
            };
            var idField = 'system_name';
            var path = '/servers/';
            var modal = {
                templateUrl: '/static/rest/app/templates/modal/requestor.html',
                size: 'md',
                controller: 'EditServerModal'
            };
            return {
                resource: resources.serverApi,
                fields: fields,
                title: title,
                idField: idField,
                path: path,
                modal: modal
            };
        };

        var virtualMachine = function () {
            var fields = function (list) {
                var _f = [
                    { name: 'name', description: 'Name' },
                    {
                        name: 'uuid',
                        description: 'UUID',
                        required: false
                    },
                    { name: 'vcpu', description: 'vCPU' },
                    {
                        name: 'memory', description: 'RAM',
                        transform: 'accessor',
                        access: function (item) {
                            return item.memory + ' ' + item.memory_measuretype;
                        }
                    },
                    { name: 'memory_measuretype', description: 'Memory Units (GB)', required: true, hidden: true },
                    {
                        name: 'disk', description: 'Disk',
                        transform: 'accessor',
                        access: function (item) {
                            return item.disk + ' ' + item.disk_measuretype;
                        }
                    },
                    { name: 'disk_measuretype', description: 'Storage Units (GB, TB)', required: true, hidden: true },
                    { name: 'ethports', description: 'NICs', required: true },
                    {
                        name: 'hypervisor',
                        description: 'Hypervisor',
                        required: true,
                        transform: 'accessor',
                        access: function (item) {
                            return item.hypervisor.system_name;
                        },
                        inputMethod: {
                            type: 'typeahead',
                            accessor: 'system_name',
                            invoker: function (val) {
                                return search(resources.serverApi, val);
                            }
                        }
                    },
                    {
                        name: 'os',
                        description: 'Operating System',
                        transform: 'accessor',
                        access: function (item) {
                            if (item && item.os != null) {
                                return item.os.full_name;
                            }
                            return '';
                        },
                        inputMethod: {
                            type: 'typeahead',
                            accessor: 'full_name',
                            invoker: function (val) {
                                return search(resources.operatingSystemApi, val);
                            }
                        }
                    },
                    {
                        name: 'customer',
                        description: 'Customer',
                        required: true,
                        transform: 'accessor',
                        access: function (item) {
                            return item.customer.organization_name;
                        },
                        inputMethod: {
                            type: 'typeahead',
                            accessor: 'organization_name',
                            invoker: function (val) {
                                return search(resources.organizationApi, val);
                            }
                        }
                    }

                ];
                return _filter(list, _f);
            };
            var title = {
                singular: 'Virtual Machine',
                plural: 'Virtual Machines'
            };

            var idField = 'name';
            var path = '/vm/';
            var modal = {
                templateUrl: '/static/rest/app/templates/modal/requestor.html',
                size: 'md',
                controller: 'EditServerModal'
            };

            return {
                resource: resources.virtual_machine,
                fields: fields,
                title: title,
                idField: idField,
                path: path,
                modal: modal
            };
        };

        var instance = function () {
            var fields = function (list) {
                var _f = [
                    {
                        name: 'name',
                        description: 'Hostname'
                    },
                    {
                        name: 'uuid',
                        description: 'UUID',
                        required: false
                    },
                    {
                        name: 'os',
                        description: 'Operating System',
                        transform: 'accessor',
                        access: function (item) {
                            if (item && item.os != null) {
                                return item.os.full_name;
                            }
                            return '';
                        },
                        inputMethod: {
                            type: 'typeahead',
                            accessor: 'full_name',
                            invoker: function (val) {
                                return search(resources.operatingSystemApi, val);
                            }
                        }
                    },
                    {
                        name: 'ordered_date',
                        description: 'Ordered Date',
                        transform: 'accessor',
                        access: function (item) {
                            return resources.filterProv('date')(item.ordered_date, 'medium');
                        }
                    },
                    {
                        name: 'modified_user',
                        description: 'Last Modified By',
                        required: false
                    },
                    {
                        name: 'customer',
                        description: 'Customer',
                        required: true,
                        transform: 'accessor',
                        access: function (item) {
                            return item.customer.organization_name;
                        },
                        inputMethod: {
                            type: 'typeahead',
                            accessor: 'organization_name',
                            invoker: function (val) {
                                return search(resources.organizationApi, val);
                            }
                        }
                    }
                ];
                return _filter(list, _f);
            };

            return {
                resource: resources.instanceApi,
                fields: fields
            };
        };

        var organization = function () {
            var title = {
                singular: 'Organization',
                plural: 'Organizations'
            };
            var fields = function (list) {
                var _f = [
                    //{ name: "organization_name", description: "Name", required: true },
                    {
                        name: 'organization_name', description: 'Name', required: true,
                        cls: 'col-xs-3',
                        opaque: 'link',
                        subfield: 'organization_name',
                        read: function (result) {
                            if (result.id) {
                                return {
                                    url: '#/organization/' + result.id + '/',
                                    text: result.organization_name
                                };
                            }
                            else if (result.organization_name !== null) {
                                return result.organization_name;
                            }
                            else {
                                return '';
                            }
                        }
                    },
                    { name: 'is_active', description: 'Is Active', required: true, ischeck: true, checkvalue: 'Active' },
                    {
                        name: 'organization_type', description: 'Type', required: true, hide: true,
                        opaque: 'stringTransform',
                        subfield: 'organization_type',
                        read: function (result) {
                            if (result.organization_type && result.organization_type.organization_type) {
                                return result.organization_type.organization_type;
                            }
                            else if (result.organization_type !== null) {
                                return result.organization_type;
                            }
                            else {
                                return '';
                            }
                        }
                    },
                    { name: 'address1', description: 'Address1', required: true, hide: true },
                    { name: 'address2', description: 'Address2', required: true, hide: true },
                    { name: 'city', description: 'City', required: true, hide: true },
                    { name: 'state', description: 'State', required: true, hide: true },
                    { name: 'country', description: 'Country', required: true, hide: true },
                    { name: 'postal_code', description: 'Postal Code', required: true, hide: true },
                    { name: 'domain', description: 'Domain', required: true, hide: true },
                    { name: 'phone', description: 'Phone', required: true },
                    { name: 'email', cls: 'col-xs-3', description: 'Email', required: true },
                    { name: 'customer_id', description: 'Customer ID', required: true },
                    { name: 'ul_id', description: 'ULID', required: true, hide: true },
                    {
                        name: 'customer_type', description: 'Customer Type', required: true, hide: true,
                        opaque: 'stringTransform',
                        subfield: 'customer_type',
                        read: function (result) {
                            if (result.customer_type && result.customer_type.customer_type) {
                                return result.customer_type.customer_type;
                            }
                            else if (result.customer_type !== null) {
                                return result.customer_type;
                            }
                            else {
                                return '';
                            }
                        }
                    },
                    { name: 'default_snmp_community', description: 'SNMP Community', required: true, hide: true },
                    { name: 'default_snmp_version', description: 'SNMP Version', required: true, hide: true },
                    { name: 'salesforce_id', description: 'Salesforce ID', required: true }
                ];
                return _filter(list, _f);
            };
            var modal = {
                templateUrl: '/static/rest/app/templates/modal/requestor.html',
                size: 'md',
                controller: 'EditServerModal'
            };
            return {
                resource: resources.organizationApi,
                fields: fields,
                title: title,
                path: '/organization/',
                modal: modal
            };
        };

        var sfOpportunity = function () {
            var title = {
                singular: 'Opportunity',
                plural: 'Opportunities'
            };

            var modal = {
                templateUrl: '/static/rest/app/templates/modal/requestor.html',
                size: 'md',
                controller: 'EditServerModal'
            };

            var fields = function (list) {
                var _f = [
                    {
                        name: 'name',
                        description: 'Name',
                        required: true,
                        opaque: 'link',
                        subfield: 'name',
                        read: function (result) {
                            if (result.id) {
                                return {
                                    url: '#/sf_opportunity/' + result.id + '/',
                                    text: result.organization_name
                                };
                            }
                            else if (result.organization_name !== null) {
                                return result.organization_name;
                            }
                            else {
                                return '';
                            }
                        }
                    },
                    {
                        name: 'customer',
                        description: 'Customer',
                        required: true,
                        hide: true,
                        opaque: 'link',
                        subfield: 'name',
                        read: function (result) {
                            if (result.hasOwnProperty('id')) {
                                return {
                                    url: '#/organization/' + result.id + '/',
                                    text: result.name
                                };
                            }
                        }
                    }
                ];
                return _filter(list, _f);
            };
            return {
                resource: resources.sfOpportunity,
                path: '/sf_opportunity/',
                fields: fields,
                title: title,
                modal: modal
            };
        };

        // return all columns here
        return {
            server: server,
            virtualMachine: virtualMachine,
            instance: instance,
            resources: resources,
            organization: organization,
            sfOpportunity: sfOpportunity
        };
    };

    // left here to be configured in the future
    this.$get = [
        '$filter',
        'ServerManufacturer',
        'Chassis',
        'PublicIPv4Allocation',
        'VirtualMachine',
        'Server',
        'Instance',
        'OS',
        'Organization',
        'SalesforceOpportunity',
        function ($filter,
            ServerManufacturer, Chassis, PublicIPv4Allocation, VirtualMachine,
            Server, Instance, OS, Organization, SalesforceOpportunity) {
            resources.filterProv = $filter;
            resources.serverManufacturerApi = ServerManufacturer;
            resources.chassisApi = Chassis;
            resources.public_ipv4_allocation = PublicIPv4Allocation;
            resources.virtual_machine = VirtualMachine;
            resources.serverApi = Server;
            resources.instanceApi = Instance;
            resources.operatingSystemApi = OS;
            resources.organizationApi = Organization;
            resources.sfOpportunity = SalesforceOpportunity;
            return new service();
        }
    ];
});


rest_app.provider('ULDBService', function () {
    var public_ipv4_allocation;
    var column_registry;

    var service = function () {
        return column_registry;
    };

    this.$get = [
        'ColumnRegistry',
        'PublicIPv4Allocation',
        function (ColumnRegistry, PublicIPv4Allocation) {
            // hoist variables for dependencies
            column_registry = ColumnRegistry;
            public_ipv4_allocation = PublicIPv4Allocation;
            return new service();
        }
    ];
});


rest_app.factory('ServerRelated', ['$resource',
    function ($resource) {
        return $resource('/rest/server/:id/related_details/', {
            id: '@id'
        });
    }
]);

rest_app.factory('VirtualServerRelated', ['$resource',
    function ($resource) {
        return $resource('/rest/virtualsystem/:id/related_details/', {
            id: '@id'
        });
    }
]);

rest_app.factory('VDCRelated', ['$resource',
    function ($resource) {
        return $resource('/rest/virtualdatacenter/:id/related_details/', {
            id: '@id'
        });
    }
]);

rest_app.factory('InstanceRelated', ['$resource',
    function ($resource) {
        return $resource('/rest/instance/:id/related_details/', {
            id: '@id'
        });
    }
]);

rest_app.factory('SystemUpdate', ['$resource',
    function ($resource) {
        return $resource('/rest/server/:id/', { id: '@id' }, {
            update: { method: 'PUT', params: { id: '@id' } }
        });
    }]);

rest_app.factory('InstanceUpdate', ['$resource',
    function ($resource) {
        return $resource('/rest/instance/:id/', { id: '@id' }, {
            update: { method: 'PUT', params: { id: '@id' } }
        });
    }]);

rest_app.factory('CabinetUpdate', ['$resource',
    function ($resource) {
        return $resource('/rest/cabinet/:id/', { id: '@id' }, {
            update: { method: 'PUT', params: { id: '@id' } }
        });
    }]);


rest_app.factory('IPv6Allocation', ['$resource',
    function ($resource) {
        return $resource('/rest/ipv6_allocations/:id/', {
            id: '@id'
        }, {
                query: DRFQueryFactory(),
                update: {
                    method: 'PUT'
                }
            });
    }
]);

rest_app.factory('IPv6Location', ['$resource',
    function ($resource) {
        return $resource('/rest/ipv6_regions/:id/', {
            id: '@id'
        }, {
                query: DRFQueryFactory(),
                update: {
                    method: 'PUT'
                }
            });
    }
]);
rest_app.factory('IPv6Location', ['$resource',
    function ($resource) {
        return $resource('/rest/ipv6_regions/:id/', {
            id: '@id'
        }, {
                query: DRFQueryFactory(),
                update: {
                    method: 'PUT'
                }
            });
    }
]);

rest_app.factory('IPv6Assignment', ['$resource',
    function ($resource) {
        return $resource('/rest/ipv6_assignments/:id/', {
            id: '@id'
        }, {
                query: DRFQueryFactory(),
                update: {
                    method: 'PUT'
                }
            });
    }
]);

rest_app.factory('IPv6AssignmentRegionWise', ['$resource',
    function ($resource) {
        return $resource('/rest/ipv6_assignments/:id/region_wise/', {
            id: '@id'
        }, {
                query: DRFQueryFactory(),
                update: {
                    method: 'PUT'
                }
            });
    }
]);

rest_app.factory('IPv6Interface', ['$resource',
    function ($resource) {
        return $resource('/rest/ipv6_assignments/:id/get_interface/', {
            id: '@id'
        }, {
                query: DRFQueryFactory(),
                update: {
                    method: 'PUT'
                }
            });
    }
]);

rest_app.factory('IPv6Create48', ['$resource',
    function ($resource) {
        return $resource('/rest/ipv6_assignments/:id/create_48/', {});
    }
]);

rest_app.factory('IPv6Create64', ['$resource',
    function ($resource) {
        return $resource('/rest/ipv6_assignments/:id/create_64/', {});
    }
]);

rest_app.factory('AvailableServer', ['$resource',
    function ($resource) {
        return $resource('/rest/virtualdatacenter/get_available_servers/', {});
    }
]);

rest_app.factory('AvailableSAN', ['$resource',
    function ($resource) {
        return $resource('/rest/virtualdatacenter/get_available_sans/', {});
    }
]);

rest_app.factory('AvailableFirewall', ['$resource',
    function ($resource) {
        return $resource('/rest/virtualdatacenter/get_available_firewalls/', {});
    }
]);

rest_app.factory('AvailableLoadbalancer', ['$resource',
    function ($resource) {
        return $resource('/rest/virtualdatacenter/get_available_loadbalancers/', {});
    }
]);

rest_app.factory('AvailableSwitch', ['$resource',
    function ($resource) {
        return $resource('/rest/virtualdatacenter/get_available_switches/', {});
    }
]);

rest_app.factory('StorageServer', ['$resource',
    function ($resource) {
        return $resource('/rest/server/get_storage_servers/', {});
    }
]);

rest_app.factory('Hypervisor', ['$resource',
    function ($resource) {
        return $resource('/rest/instance/get_hypervisor/', {});
    }
]);

rest_app.factory('ChassisAvailable', ['$resource',
    function ($resource) {
        return $resource('/rest/server/avail_chassis/', {});
    }
]);

rest_app.factory('MotherboardAvailable', ['$resource',
    function ($resource) {
        return $resource('/rest/server/avail_motherboards/', {});
    }
]);

rest_app.factory('DisksAvailable', ['$resource',
    function ($resource) {
        return $resource('/rest/server/avail_disks/', {});
    }
]);

rest_app.factory('MemoryAvailable', ['$resource',
    function ($resource) {
        return $resource('/rest/server/avail_memories/', {});
    }
]);

rest_app.factory('CPUAvailable', ['$resource',
    function ($resource) {
        return $resource('/rest/server/avail_cpus/', {});
    }
]);

rest_app.factory('NICAvailable', ['$resource',
    function ($resource) {
        return $resource('/rest/server/avail_nics/', {});
    }
]);

rest_app.factory('RAIDAvailable', ['$resource',
    function ($resource) {
        return $resource('/rest/server/avail_raids/', {});
    }
]);

rest_app.factory('IPMIAvailable', ['$resource',
    function ($resource) {
        return $resource('/rest/server/avail_ipmis/', {});
    }
]);

rest_app.factory('CabinetsAvailable', ['$resource',
    function ($resource) {
        return $resource('/rest/cabinet/avail_cabinets/', {});
    }
]);

rest_app.factory('ULAdmin', ['$resource',
    function ($resource) {
        return $resource('/rest/virtualsystem/get_uladmin/', {});
    }
]);


rest_app.factory('InstanceByOrg', ['$resource',
    function ($resource) {
        return $resource('/rest/instance/:customer/', {
            customer: '@id'
        });
    }
]);


rest_app.factory('GraphedPortUpdate', ['$resource', function ($resource) {
    return $resource('/rest/graphed_port/:id/', { id: '@id' }, {
        update: { method: 'PUT', params: { id: '@id' } }
    });
}]);

rest_app.factory('UserAccount', ['$resource',
    function ($resource) {
        return $resource('/rest/user/profile/:id/', {
            id: '@id'
        }, {
                query: DRFQueryFactory(),
                update: { method: 'PUT' }
            });
    }
]);

rest_app.factory('ChangePassword', ['$resource',
    function ($resource) {
        return $resource('/rest/user/:id/change_password/', {
            id: '@id'
        }, {
                query: DRFQueryFactory(),
                update: {
                    method: 'PUT'
                }
            });
    }
]);

rest_app.factory('GroupsRolesByOrg', ['$resource',
    function ($resource) {
        return $resource('/rest/org/:id/get_groups_roles/', {
            id: '@id'
        }, {
                query: DRFQueryFactory(),
                update: {
                    method: 'PUT'
                }
            });
    }
]);

rest_app.factory('DefaultAccess', ['$resource',
    function ($resource) {
        return $resource('/rest/user/get_portal_access/', {});
    }
]);

rest_app.factory('OrganizationDetails', ['$resource',
    function ($resource) {
        return $resource('/rest/org/:id/get_user_details/', {
            id: '@id'
        });
    }
]);

rest_app.factory('OrganizationHostMonitor', ['$resource',
    function ($resource) {
        return $resource('/rest/host_monitor/:id/organization/', {
            id: '@id'
        });
    }
]);


rest_app.factory('ZendeskOrganization', ['$resource',
    // function ($resource) {
    //     return $resource('/rest/zendesk_ticket/get_orgs/', {
    //         id: '@id'
    //     }, {
    //         query: DRFQueryFactory(),
    //         update: {
    //             method: 'PUT'
    //         }
    //     });
    // }
    function ($resource) {
        var query = function () {
            return {
                method: 'GET',
                cache: false,
                isArray: false
                , transformResponse: function (data, headersGetter) {
                    var d = angular.fromJson(data);
                    return {
                        results: d.result.organizations,
                        count: d.result.count
                    };
                }
            };
        };
        var resource = $resource('/rest/zendesk_ticket/get_orgs/', {
            id: '@id'
        }, {
                query: query()
            });
        return resource;
    }
]);
