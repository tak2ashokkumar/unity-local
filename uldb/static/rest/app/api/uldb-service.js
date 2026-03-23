// /**
//  * Created by rt on 10/19/16.
//  */
var rest_app = angular.module('uldbapi');
rest_app.factory('ULDBService2', [
    '$filter',
    'FieldProvider',
    'TitleProvider',
    'ServiceFunctionProvider',
    'ServerManufacturer',
    'MobileDeviceManufacturer',
    'StorageManufacturer',
    'PDUManufacturer',
    'Chassis',
    'IPv6Block',
    'PublicIPv4Allocation',
    'PublicIPv4Assignment',
    'VLAN',
    'DataCenter',
    'DatacenterFast',
    'Location',
    'TerminalServer',
    'CustomDevice',
    'Cabinet',
    'CabinetModel',
    'CabinetType',
    'Cage',
    'VirtualMachine',
    'Server',
    'SAN',
    'ServerFast',
    'DatabaseServerFast',
    'Instance',
    'OS',
    'Organization',
    'OrgMonitoringConfig',
    'OrgStorageInventory',
    'ServiceCatalogue',
    'User',
    'Release',
    'AccessType',
    'Role',
    'TicketUserGroupFast',
    'SalesforceOpportunity',
    'Invoice',
    'Switch',
    'Firewall',
    'LoadBalancer',
    'VirtualLoadBalancer',
    'Motherboard',
    'MotherboardModel',
    'CPU',
    'CPUType',
    'Memory',
    'MemoryType',
    'Disk',
    'DiskType',
    'DiskControllerTypes',
    'NIC',
    'NICType',
    'IPMIModel',
    'ServerModel',
    'MobileDeviceModel',
    'StorageModel',
    'Manufacturer',
    'SwitchModel',
    'LoadBalancerModel',
    'FirewallModel',
    'PDU',
    'PowerCircuit',
    'PDUModel',
    'TerminalServerModel',
    'ProductType',
    'SASControllerType',
    'PeripheralType',
    'ClusterType',
    'CloudTypes',
    'PrivateCloud',
    'ColoCloud',
    'PrivateCloudFast',
    'CabinetOption',
    'CircuitOption',
    'VoltageType',
    'AMPSType',
    'OutletType',
    'ElectricalPanel',
    'ElectricalCircuit',
    'RAIDController',
    'HostMonitor',
    'OrganizationHostMonitor',
    'GraphedPort',
    'CabinetFast',
    'OrganizationFast',
    'SwitchFast',
    'FirewallFast',
    'LoadBalancerFast',
    'PDUFast',
    'AWSInstanceFast',
    'VMwareVMFast',
    'VCloudVMFast',
    'ESXIVMFast',
    'HyperVVMFast',
    'OpenStackVMFast',
    'CustomCloudVMFast',
    'StorageFast',
    'MacDeviceFast',
    'OpenStackInstance',
    'ObserviumHost',
    'TransitPort',
    'TenableSecurityCenter',
    'VcenterProxy',
    'EsxiProxy',
    'OpenstackProxy',
    'F5LoadBalancer',
    'CiscoFirewallProxy',
    'CiscoSwitchProxy',
    'CitrixProxy',
    'JuniperSwitchProxy',
    'JuniperFirewallProxy',
    'ObserviumInstance',
    'ObserviumServer',
    'ObserviumSwitch',
    'ObserviumFirewall',
    'ObserviumLoadBalancer',
    'ObserviumPDU',
    'ObserviumAWSInstance',
    'ObserviumVMwareVM',
    'ObserviumOpenStackVM',
    'ObserviumCustomCloudVM',
    'ObserviumVCloudVM',
    'ObserviumESXIVM',
    'ObserviumHyperVVM',
    'ObserviumStorage',
    'ObserviumMacDevice',
    'ObserviumBilling',
    'ZabbixInstance',
    'ZabbixCustomer',
    'ZabbixSwitch',
    'ZabbixFirewall',
    'ZabbixLoadbalancer',
    'ZabbixServer',
    'ZabbixStorage',
    'ZabbixMacDevice',
    'ZabbixDatabaseServer',
    'ZabbixPDU',
    'ZabbixVMwareVM',
    'ZabbixVCloudVM',
    'ZabbixESXIVM',
    'ZabbixHyperVVM',
    'ZabbixOpenStackVM',
    'ZabbixCustomVM',
    'ZabbixTemplates',
    'OpenStackController',
    'VMwareVcenter',
    'VMwareVcenterConfig',
    'MaintenanceSchedule',
    'SwitchPortMap',
    'ServiceContract',
    'CeleryTask',
    'CeleryWorker',
    'CoreService',
    'CustomDataService',
    'AWSAMIS',
    'UnityModules',
    'ProxmoxVM',
    'G3KVM',
    'ObserviumProxmoxVM',
    'ObserviumG3KVMVM',
    'OpenAuditCollectorMapping',
    function ($filter,
        FieldProvider,
        TitleProvider,
        ServiceFunctionProvider,
        ServerManufacturer,
        MobileDeviceManufacturer,
        StorageManufacturer,
        PDUManufacturer,
        Chassis,
        IPv6Block,
        PublicIPv4Allocation,
        PublicIPv4Assignment,
        VLAN,
        DataCenter,
        DatacenterFast,
        Location,
        TerminalServer,
        CustomDevice,
        Cabinet,
        CabinetModel,
        CabinetType,
        Cage,
        VirtualMachine,
        Server,
        SAN,
        ServerFast,
        DatabaseServerFast,
        Instance,
        OS,
        Organization,
        OrgMonitoringConfig,
        OrgStorageInventory,
        ServiceCatalogue,
        User,
        Release,
        AccessType,
        Role,
        TicketUserGroupFast,
        SalesforceOpportunity,
        Invoice,
        Switch,
        Firewall,
        LoadBalancer,
        VirtualLoadBalancer,
        Motherboard,
        MotherboardModel,
        CPU,
        CPUType,
        Memory,
        MemoryType,
        Disk,
        DiskType,
        DiskControllerTypes,
        NIC,
        NICType,
        IPMIModel,
        ServerModel,
        MobileDeviceModel,
        StorageModel,
        Manufacturer,
        SwitchModel,
        LoadBalancerModel,
        FirewallModel,
        PDU,
        PowerCircuit,
        PDUModel,
        TerminalServerModel,
        ProductType,
        SASControllerType,
        PeripheralType,
        ClusterType,
        CloudTypes,
        PrivateCloud,
        ColoCloud,
        PrivateCloudFast,
        CabinetOption,
        CircuitOption,
        VoltageType,
        AMPSType,
        OutletType,
        ElectricalPanel,
        ElectricalCircuit,
        RAIDController,
        HostMonitor,
        OrganizationHostMonitor,
        GraphedPort,
        CabinetFast,
        OrganizationFast,
        SwitchFast,
        FirewallFast,
        LoadBalancerFast,
        PDUFast,
        AWSInstanceFast,
        VMwareVMFast,
        VCloudVMFast,
        ESXIVMFast,
        HyperVVMFast,
        OpenStackVMFast,
        CustomCloudVMFast,
        StorageFast,
        MacDeviceFast,
        OpenStackInstance,
        ObserviumHost,
        TransitPort,
        TenableSecurityCenter,
        VcenterProxy,
        EsxiProxy,
        OpenstackProxy,
        F5LoadBalancer,
        CiscoFirewallProxy,
        CiscoSwitchProxy,
        CitrixProxy,
        JuniperSwitchProxy,
        JuniperFirewallProxy,
        ObserviumInstance,
        ObserviumServer,
        ObserviumSwitch,
        ObserviumFirewall,
        ObserviumLoadBalancer,
        ObserviumPDU,
        ObserviumAWSInstance,
        ObserviumVMwareVM,
        ObserviumOpenStackVM,
        ObserviumCustomCloudVM,
        ObserviumVCloudVM,
        ObserviumESXIVM,
        ObserviumHyperVVM,
        ObserviumStorage,
        ObserviumMacDevice,
        ObserviumBilling,
        ZabbixInstance,
        ZabbixCustomer,
        ZabbixSwitch,
        ZabbixFirewall,
        ZabbixLoadbalancer,
        ZabbixServer,
        ZabbixStorage,
        ZabbixMacDevice,
        ZabbixDatabaseServer,
        ZabbixPDU,
        ZabbixVMwareVM,
        ZabbixVCloudVM,
        ZabbixESXIVM,
        ZabbixHyperVVM,
        ZabbixOpenStackVM,
        ZabbixCustomVM,
        ZabbixTemplates,
        OpenStackController,
        VMwareVcenter,
        VMwareVcenterConfig,
        MaintenanceSchedule,
        SwitchPortMap,
        ServiceContract,
        CeleryTask,
        CeleryWorker,
        CoreService,
        CustomDataService,
        AWSAMIS,
        UnityModules,
        ProxmoxVM,
        G3KVM,
        ObserviumProxmoxVM,
        ObserviumG3KVMVM,
        OpenAuditCollectorMapping) {
        // begin function

        var search = ServiceFunctionProvider.search;
        var custom_search = ServiceFunctionProvider.custom_search;
        var _inf = ServiceFunctionProvider.inner_factory;
        var gen_fields = ServiceFunctionProvider.gen_fields;
        var _filter = ServiceFunctionProvider.filter;
        var zabbix_instance_search = ServiceFunctionProvider.search_zabbix_instance;

        var server = function () {
            var _f = [
                {
                    name: 'name',
                    description: 'Name',
                    required: true,
                    opaque: 'link',
                    uriPrefix: '#/servers/',
                    idField: 'id',
                    readArray: [],
                    func: function (result) {
                        return '#/servers/{id}'.fmt(result);
                    }
                },
                {
                    name: 'private_cloud', description: 'Cloud',
                    // opaque: 'stringTransform',
                    opaque: 'link',
                    subfield: 'name',
                    readArray: ['name'],
                    uriPrefix: '#/cloud/',
                    idField: 'uuid',
                    inputMethod: {
                        type: 'typeahead',
                        invoker: function (val) {
                            return search(PrivateCloudFast, val);
                        },
                        accessor: 'name'
                    }
                },
                FieldProvider.gen_link_field(Cabinet, 'cabinet', 'id', CabinetFast),
                { name: 'asset_tag', description: 'Asset Tag', required: true },
                { name: 'num_cores', description: 'Cores', required: true },
                { name: 'memory_mb', description: 'Memory (MB)', required: true },
                { name: 'capacity_gb', description: 'Disk Capacity (GB)', required: true },
                // FieldProvider.manufacturer_field,
                {
                    name: 'manufacturer', description: 'Manufacturer', required: true,
                    opaque: 'stringTransform',
                    subfield: 'name',
                    readArray: ['name'],
                    inputMethod: {
                        type: 'typeahead',
                        invoker: function (val) {
                            return search(ServerManufacturer, val);
                        },
                        render: function (rel) {
                            return rel.name;
                        },
                        accessor: 'name'
                    }
                },
                { name: 'serial_number', description: 'Serial Number', required: true },
                FieldProvider.customer_field('customer', 'Customer'),
                {
                    name: 'chassis', description: 'Chassis', required: false,
                    opaque: true,
                    subfield: 'asset_tag',
                    readArray: ['model_name'],
                    read: function (server) {
                        if (server.chassis) {
                            return server.chassis.model_name;
                        }
                        return '';
                    },
                    inputMethod: {
                        type: 'typeahead',
                        invoker: function (val) {
                            return search(Chassis, val);
                        },
                        render: function (rel) {
                            return rel.model_name;
                        },
                        accessor: 'model_name'
                    }
                },
                // FieldProvider.motherboard_field, //Server does not contain Motherboard
                { name: 'salesforce_id', description: 'Salesforce ID', required: false },
                { name: 'description', description: 'Description', required: false },
                { name: "position", description: "Position" },
                { name: "size", description: "Size" },
                { name: "ip_address", description: "IP Address" },
                { name: "snmp_community", description: "SNMP Community" },
            ];

            var idField = 'name';
            var path = '/servers/';
            var modal = {
                templateUrl: '/static/rest/app/templates/modal/master_modal.html',
                size: 'md',
                // controller: 'EditServerModal'
                controller: 'YetAnotherModalController'
            };
            return _inf({
                resource: Server,
                fields: gen_fields(_f),
                idField: idField,
                path: '#/servers',
                modal: modal
            });
        };

        var san = function () {
            var _f = [
                {
                    name: 'name',
                    description: 'Name',
                    required: true,
                    // opaque: 'link',
                    uriPrefix: '#/sans/',
                    idField: 'id',
                    readArray: [],
                    func: function (result) {
                        return '#/sans/{id}'.fmt(result);
                    }
                },
                { name: 'asset_tag', description: 'Asset Tag', required: true },
                { name: 'num_cores', description: 'Cores', required: true },
                { name: 'memory_mb', description: 'Memory (MB)', required: true },
                { name: 'capacity_gb', description: 'Disk Capacity (GB)', required: true },
                {
                    name: 'manufacturer', description: 'Manufacturer', required: true,
                    opaque: 'stringTransform',
                    subfield: 'name',
                    readArray: ['name'],
                    inputMethod: {
                        type: 'typeahead',
                        invoker: function (val) {
                            return search(ServerManufacturer, val);
                        },
                        render: function (rel) {
                            return rel.name;
                        },
                        accessor: 'name'
                    }
                },
                { name: 'serial_number', description: 'Serial Number', required: true },
                FieldProvider.os_field,
                { name: 'salesforce_id', description: 'Salesforce ID', required: true },
                { name: 'description', description: 'Description', required: false },
                FieldProvider.customer_field('customer', 'Customer'),
                FieldProvider.cabinet_field
            ];

            var idField = 'name';
            var path = '/sans/';
            var modal = {
                templateUrl: '/static/rest/app/templates/modal/master_modal.html',
                size: 'md',
                // controller: 'EditServerModal'
                controller: 'YetAnotherModalController'
            };
            return _inf({
                resource: SAN,
                fields: gen_fields(_f),
                idField: idField,
                path: '#/sans',
                modal: modal
            });
        };

        var IPv6BlockAllocation = function () {
            var fields = function (list) {
                var _f = [
                    { name: 'name', description: 'Name', required: true },
                    // { name: 'arin_handle', description: 'ARIN Handle', required: true },
                    { name: 'description', description: 'Description', required: true },
                    { name: 'prefix', description: 'Prefix', required: true },
                    { name: 'prefixlen', description: 'Prefix Length', required: true }
                ];
                return _filter(list, _f);
            };

            var title = {
                singular: 'IPv6 Allocation',
                plural: 'IPv6 Allocations'
            };

            return {
                resource: IPv6Block,
                fields: fields,
                title: title,
                idField: 'uuid'
            };
        };

        var publicIPv4Allocation = function () {
            var fields = function (list) {
                var _f = [
                    { name: 'name', description: 'Name', required: true },
                    { name: 'arin_handle', description: 'ARIN Handle', required: true },
                    { name: 'description', description: 'Description', required: true },
                    { name: 'prefix', description: 'Prefix', required: true },
                    { name: 'prefixlen', description: 'Prefix Length', required: true }
                ];
                return _filter(list, _f);
            };

            var title = {
                singular: 'Public IPv4 Allocation',
                plural: 'Public IPv4 Allocations'
            };

            var idField = 'prefix';
            var path = '/ipv4_public/allocations/';

            var modal = {
                templateUrl: '/static/rest/app/templates/ipam/newBlockModal.html',
                size: 'md',
                controller: 'IPv4AddBlockModalController'
            };

            return {
                resource: PublicIPv4Allocation,
                fields: fields,
                title: title,
                idField: idField,
                path: path,
                modal: modal
            };
        };

        var vlan = function () {
            var _f = [
                { name: 'vlan_number', description: 'VLAN ID', required: true },
                FieldProvider.gen_link_field(Location, 'region'),
                FieldProvider.boolean_field('verified', 'Verified'),
                { name: 'ulid', description: 'ULID', required: true },
                FieldProvider.customer_field('customer', 'Customer')
            ];
            var modal = {
                templateUrl: '/static/rest/app/templates/modal/master_modal.html',
                size: 'md',
                controller: 'YetAnotherModalController'
            };
            return _inf({
                resource: VLAN,
                fields: gen_fields(_f),
                path: '#/vlan',
                idField: 'id',
                modal: modal
            });
        };


        var private_cloud = function () {

            var m2m_choices = function (resourceClass) {
                var result = [];
                resourceClass.query().$promise.then(function (success) {
                    angular.forEach(success.results, function (value, key) {
                        result.push(value);
                    });
                    // Not able to return success.results to choices
                    // return success.results;
                });
                return result;
            };

            var _f = [
                // { name: 'name', description: 'Cloud Name' },
                {
                    name: 'name', description: 'Cloud Name', required: true,
                    opaque: 'customLink', // For generating links with different URI prefix without invoker method
                    uriPrefix: '#/cloud-vm-list/',
                    idField: 'uuid',
                },
                FieldProvider.customer_field('customer'),
                {
                    name: 'colocation_cloud', description: 'Datacenter', required: true,
                    opaque: 'stringTransform',
                    // opaque: 'link',
                    subfield: 'name',
                    readArray: ['name'],
                    // uriPrefix: '#/datacenter/',
                    idField: 'id',
                    inputMethod: {
                        type: 'typeahead',
                        invoker: function (val) {
                            return search(ColoCloud, val);
                        },
                        accessor: 'display_name'
                    }
                },
                {
                    name: 'platform_type', description: 'Platform Type', required: true,
                    inputMethod: {
                        type: 'choices',
                        choices: ['VMware', 'OpenStack', 'Hyper-V', 'Custom', 'vCloud Director', 'Proxmox', 'G3 KVM']
                    }
                },
                { name: 'vcpu', description: 'vCPUs' },
                { name: 'memory', description: 'RAM in GB' },
                { name: 'storage', description: 'Storage in TB' },

                {
                    name: 'firewall', description: 'Firewalls', hide: true,
                    opaque: 'multiple',
                    subfield: 'name',
                    readArray: [],
                    idField: 'id',
                    inputMethod: {
                        type: 'multiple',
                        choices: m2m_choices(Firewall),
                        // choices: [true, false],
                        displayProp: 'name',
                        idProp: 'id'
                    }
                },

                {
                    name: 'switch', description: 'Switches', hide: true,
                    opaque: 'multiple',
                    subfield: 'name',
                    readArray: [],
                    idField: 'id',
                    inputMethod: {
                        type: 'multiple',
                        choices: m2m_choices(Switch),
                        // choices: [true, false],
                        displayProp: 'name',
                        idProp: 'id'
                    }
                },

                {
                    name: 'load_balancer', description: 'LoadBalancers', hide: true,
                    opaque: 'multiple',
                    subfield: 'name',
                    readArray: [],
                    idField: 'id',
                    inputMethod: {
                        type: 'multiple',
                        choices: m2m_choices(LoadBalancer),
                        // choices: [true, false],
                        displayProp: 'name',
                        idProp: 'id'
                    }
                },
                {
                    name: 'customdevice', description: 'CustomDevices', hide: true,
                    opaque: 'multiple',
                    subfield: 'name',
                    readArray: [],
                    idField: 'id',
                    inputMethod: {
                        type: 'multiple',
                        choices: m2m_choices(CustomDevice),
                        displayProp: 'name',
                        idProp: 'id'
                    }
                },
            ];

            return _inf({
                resource: PrivateCloud,
                path: '#/cloud/',
                idField: 'uuid',
                fields: gen_fields(_f)
            });
        };

        var colo_cloud = function () {
            var m2m_choices = function (resourceClass) {
                var result = [];
                resourceClass.query().$promise.then(function (success) {
                    angular.forEach(success.results, function (value, key) {
                        result.push(value);
                    });
                    // Not able to return success.results to choices
                    // return success.results;
                });
                return result;
            };

            var _f = [
                {
                    name: 'name', description: 'Cloud Name', required: true,
                    opaque: 'customLink', // For generating links with different URI prefix without invoker method
                    uriPrefix: '#/cloud-vm-list/',
                    idField: 'id',
                },
                FieldProvider.customer_field('customer'),
                { name: 'location', description: 'Location' },
                {
                    name: 'cabinets', description: 'Cabinets',
                    opaque: 'multiple',
                    subfield: 'name',
                    readArray: [],
                    idField: 'id',
                    inputMethod: {
                        type: 'multiple',
                        choices: m2m_choices(Cabinet),
                        // choices: [true, false],
                        displayProp: 'name',
                        idProp: 'id'
                    }
                },
            ];

            return _inf({
                resource: ColoCloud,
                path: '#/colo_cloud/',
                idField: 'id',
                fields: gen_fields(_f)
            });
        };

        var open_audit_collector_map = function () {
            var _f = [
                FieldProvider.customer_field('customer'),
                { name: 'collector_id', description: 'Collector ID' },
            ];

            return _inf({
                resource: OpenAuditCollectorMapping,
                path: '#/collector_map/',
                idField: 'id',
                fields: gen_fields(_f)
            });
        };

        var virtualMachine = function () {
            var _f = [
                { name: 'name', description: 'Name' },
                // {
                //     name: 'uuid',
                //     description: 'UUID',
                //     required: false
                // },
                { name: 'num_cores', description: 'Cores', required: true },
                { name: 'memory_mb', description: 'Memory (MB)', required: true },
                { name: 'capacity_gb', description: 'Disk Capacity (GB)', required: true },
                { name: 'ethports', description: 'NICs', required: true },
                {
                    name: 'server', description: 'Hypervisor', required: true,
                    opaque: 'stringTransform',
                    // opaque: 'link',
                    subfield: 'name',
                    readArray: ['name'],
                    // uriPrefix: '#/server/',
                    idField: 'id',
                    inputMethod: {
                        type: 'typeahead',
                        invoker: function (val) {
                            return search(ServerFast, val);
                        },
                        accessor: 'name'
                    }
                },
                FieldProvider.customer_field('customer')

            ];

            return _inf({
                resource: VirtualMachine,
                path: '#/vm/',
                idField: 'id',
                fields: gen_fields(_f)
            });
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
                                return search(OS, val);
                            }
                        }
                    },
                    {
                        name: 'ordered_date',
                        description: 'Ordered Date',
                        transform: 'accessor',
                        access: function (item) {
                            return $filter('date')(item.ordered_date, 'medium');
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
                            return item.customer.name;
                        },
                        inputMethod: {
                            type: 'typeahead',
                            accessor: 'name',
                            invoker: function (val) {
                                return search(Organization, val);
                            }
                        }
                    }
                ];
                return _filter(list, _f);
            };

            return {
                resource: Instance,
                fields: fields
            };
        };

        var sfOpportunity = function () {
            var _f = [
                {
                    name: 'name', description: 'Name', required: true,
                    opaque: 'salesforce',
                    salesforceUrl: 'https://cs2.unitedlayer.com',
                    sfId: 'sfid'
                },
                FieldProvider.customer_field('customer'),
                { name: 'account_name', description: 'SFDC Account', required: true },
                { name: 'owner_name', description: 'Owner', required: true },
                { name: 'mrc', description: 'MRC', required: true },
                { name: 'nrc', description: 'NRC', required: true },
                { name: 'stage_name', description: 'Stage', required: true }
            ];
            return _inf({
                resource: SalesforceOpportunity,
                fields: gen_fields(_f),
                path: '#/salesforce_opportunity',
                idField: 'uuid'
            });
        };

        var invoice = function () {
            var _f = [
                { name: 'billing_month', description: 'Month', required: true },
                { name: 'billing_year', description: 'Year', required: true },
                { name: 'amount_billed', description: 'Amount', required: true },
                { name: 'created_at', description: 'Created', required: true },
                { name: 'updated_at', description: 'Updated', required: true }
            ];
            return _inf({
                resource: Invoice,
                fields: gen_fields(_f),
                path: '#/invoice',
                idField: 'uuid'
            });
        };

        var pdu = function () {
            var fields = function (list) {
                var _f = [
                    { name: 'name', description: 'Name', required: true },
                    {
                        name: 'pdu_type', description: 'PDU Type', required: true,
                        inputMethod: {
                            type: 'choices',
                            choices: ["HORIZONTAL", "VERTICAL"]
                        }
                    },
                    {
                        name: 'manufacturer', description: 'Manufacturer', required: true,
                        opaque: 'stringTransform',
                        // opaque: 'link',
                        subfield: 'name',
                        readArray: ['name'],
                        // uriPrefix: '#/cpumodel/',
                        idField: 'id',
                        inputMethod: {
                            type: 'typeahead',
                            invoker: function (val) {
                                return search(PDUManufacturer, val);
                            },
                            accessor: 'name'
                        }
                    },
                    {
                        name: 'model', description: 'Model', required: true,
                        opaque: 'stringTransform',
                        // opaque: 'link',
                        subfield: 'outlet_type',
                        readArray: ['model_number'],
                        // uriPrefix: '#/cpumodel/',
                        idField: 'id',
                        inputMethod: {
                            type: 'typeahead',
                            invoker: function (val) {
                                return search(PDUModel, val);
                            },
                            accessor: 'model_number'
                        }
                    },
                    {
                        name: 'power_circuit', description: 'Power Circuit', required: true,
                        opaque: 'stringTransform',
                        // opaque: 'link',
                        subfield: 'name',
                        readArray: ['name'],
                        // uriPrefix: '#/motherboard/',
                        idField: 'id',
                        inputMethod: {
                            type: 'typeahead',
                            invoker: function (val) {
                                return search(PowerCircuit, val);
                            },
                            accessor: 'name'
                        }
                    },
                    { name: 'serialnumber', description: 'Serial Number', required: true },
                    {
                        name: 'cabinet', description: 'Cabinet', required: true,
                        opaque: 'stringTransform',
                        // opaque: 'link',
                        subfield: 'name',
                        readArray: ['name'],
                        // uriPrefix: '#/motherboard/',
                        idField: 'id',
                        inputMethod: {
                            type: 'typeahead',
                            invoker: function (val) {
                                return search(CabinetFast, val);
                            },
                            accessor: 'name'
                        }

                    },
                    { name: "position", description: "Position" },
                    { name: "size", description: "Size", required: true, },
                    { name: "sockets", description: "Sockets", required: true },
                    FieldProvider.customer_field('customer'),
                    { name: 'user', description: 'User Name', required: true, hide: true },
                    { name: 'password', description: 'Password', required: true, changepasswordfield: true, hide: true },
                    { name: 'salesforce_id', description: 'Salesforce ID', required: true },
                    { name: 'ip_address', description: 'IP Address', required: true },
                    { name: "snmp_community", description: "SNMP Community" },
                    { name: 'assettag', description: 'Asset Tag' },

                ];
                return _filter(list, _f);
            };
            return _inf({
                resource: PDU,
                path: '#/pdu/',
                fields: fields
            });
        };

        var cage = function () {
            var fields = function (list) {
                var _f = [
                    { name: 'name', description: 'Name', required: true },
                    {
                        name: 'datacenter', description: 'Datacenter', required: true,
                        opaque: 'stringTransform',
                        // opaque: 'link',
                        subfield: 'name',
                        readArray: ['name'],
                        // uriPrefix: '#/datacenter/',
                        idField: 'id',
                        inputMethod: {
                            type: 'typeahead',
                            invoker: function (val) {
                                return search(DatacenterFast, val);
                            },
                            accessor: 'name'
                        }
                    },
                    FieldProvider.customer_field('customer'),
                    { name: 'salesforce_id', description: 'Salesforce ID', required: true }
                ];
                return _filter(list, _f);
            };
            return _inf({
                resource: Cage,
                path: '#/cpu/',
                fields: fields
            });
        };

        var power_circuit = function () {
            var _f = [
                { name: 'name', description: 'Name', required: true },
                { name: 'assettag', description: 'Assettag', required: true },
                {
                    name: 'panel', description: 'Panel', required: true,
                    opaque: 'stringTransform',
                    // opaque: 'link',
                    subfield: 'name',
                    readArray: ['name'],
                    // uriPrefix: '#/panel/',
                    idField: 'id',
                    inputMethod: {
                        type: 'typeahead',
                        invoker: function (val) {
                            return search(ElectricalPanel, val);
                        },
                        accessor: 'name'
                    }
                },
                {
                    name: 'circuit', description: 'Electric Circuit', required: true,
                    opaque: 'stringTransform',
                    // opaque: 'link',
                    subfield: 'name',
                    readArray: ['name'],
                    // uriPrefix: '#/electricalciruit/',
                    idField: 'id',
                    inputMethod: {
                        type: 'typeahead',
                        invoker: function (val) {
                            return search(ElectricalCircuit, val);
                        },
                        accessor: 'name'
                    }
                },
                {
                    name: 'voltagetype', description: 'Voltage Type', required: true,
                    opaque: 'stringTransform',
                    // opaque: 'link',
                    subfield: 'name',
                    readArray: ['voltage_type'],
                    // uriPrefix: '#/voltagetype/',
                    idField: 'id',
                    inputMethod: {
                        type: 'typeahead',
                        invoker: function (val) {
                            return search(VoltageType, val);
                        },
                        accessor: 'voltage_type'
                    }
                },
                {
                    name: 'ampstype', description: 'AMPs Type', required: true,
                    opaque: 'stringTransform',
                    // opaque: 'link',
                    subfield: 'name',
                    readArray: ['amps_type'],
                    // uriPrefix: '#/cpumodel/',
                    idField: 'id',
                    inputMethod: {
                        type: 'typeahead',
                        invoker: function (val) {
                            return search(AMPSType, val);
                        },
                        accessor: 'amps_type'
                    }
                },
                {
                    name: 'outlettype', description: 'Outlet Type', required: true,
                    opaque: 'stringTransform',
                    // opaque: 'link',
                    subfield: 'name',
                    readArray: ['outlet_type'],
                    // uriPrefix: '#/outlettype/',
                    idField: 'id',
                    inputMethod: {
                        type: 'typeahead',
                        invoker: function (val) {
                            return search(OutletType, val);
                        },
                        accessor: 'outlet_type'
                    }
                },
                {
                    name: 'datacenter', description: 'Datacenter', required: true,
                    opaque: 'stringTransform',
                    // opaque: 'link',
                    subfield: 'name',
                    readArray: ['name'],
                    // uriPrefix: '#/datacenter/',
                    idField: 'id',
                    inputMethod: {
                        type: 'typeahead',
                        invoker: function (val) {
                            return search(DataCenter, val);
                        },
                        accessor: 'name'
                    }
                },
                FieldProvider.customer_field('customer'),
                { name: 'salesforce_id', description: 'Salesforce ID', required: true }
            ];
            return _inf({
                resource: PowerCircuit,
                fields: gen_fields(_f),
                path: '#/powercircuit',
                idField: 'id'
            });
        };


        var cpuModel = function () {
            var title = {
                singular: 'CPU Model',
                plural: 'CPU Models'
            };
            var fields = function (list) {
                var _f = [
                    FieldProvider.manufacturer_field,
                    { name: 'name', description: 'Model Name', required: true },
                    { name: 'cores', description: 'Cores', required: true },
                    { name: 'threads_per_core', description: 'Threads Per Core', required: true },
                    { name: 'clock_speed_mhz', description: 'Clock Speed (MHz)', required: true },
                    { name: 'turbo_clock_speed_mhz', description: 'Turbo Clock Speed (MHz)', required: true },
                    { name: 'perf_index', description: 'Performance Rank', required: true }
                ];
                return _filter(list, _f);
            };
            return _inf({
                resource: CPUType,
                path: '#/cpumodel/',
                fields: fields,
                title: title
            });
        };

        var cpu = function () {
            var fields = function (list) {
                var _f = [
                    // { name: "id", description: "Id", required: true },
                    // FieldProvider.uuidField(CPU),
                    {
                        name: 'model', description: 'CPU Model', required: true,
                        // opaque: 'stringTransform',
                        opaque: 'link',
                        subfield: 'name',
                        readArray: ['name'],
                        uriPrefix: '#/cpumodel/',
                        idField: 'id',
                        inputMethod: {
                            type: 'typeahead',
                            invoker: function (val) {
                                return search(CPUType, val);
                            },
                            accessor: 'name'
                        }
                    },
                    FieldProvider.server_field,
                    FieldProvider.motherboard_field
                    // {
                    //     name: 'motherboard', description: 'Motherboard', required: true,
                    //     opaque: 'link',
                    //     subfield: 'model',
                    //     readArray: ['model'],
                    //     uriPrefix: '#/motherboard/',
                    //     idField: 'id',
                    //     inputMethod: {
                    //         type: 'typeahead',
                    //         invoker: function (val) {
                    //             return search(Motherboard, val);
                    //         },
                    //         accessor: 'model'
                    //     }
                    // },
                ];
                return _filter(list, _f);
            };
            return _inf({
                resource: CPU,
                path: '#/cpu/',
                fields: fields
            });
        };

        var memModel = function () {
            var fields = function (list) {
                var _f = [
                    { name: 'asset_tag', description: 'Asset Tag', required: true },
                    {
                        name: 'manufacturer', description: 'Manufacturer', required: true,
                        opaque: 'stringTransform',
                        // opaque: 'link',
                        subfield: 'name',
                        readArray: ['name'],
                        uriPrefix: '#/manufacturer/',
                        inputMethod: {
                            type: 'typeahead',
                            invoker: function (val) {
                                return search(Manufacturer, val);
                            },
                            accessor: 'name'
                        }
                    },
                    { name: 'name', description: 'Model Name', required: true },
                    { name: 'memory_mb', description: 'Memory (MB)', required: true },
                    { name: 'ddr_generation', description: 'DDR Generation', required: true },
                    { name: 'ddr_clock_speed', description: 'Speed', required: true },
                    {
                        name: 'buffered', description: 'Buffered', required: true,
                        inputMethod: {
                            type: 'choices',
                            choices: [true, false]
                        }
                    },
                    {
                        name: 'ecc', description: 'ECC', required: true,
                        inputMethod: {
                            type: 'choices',
                            choices: [true, false]
                        }
                    },
                    { name: 'salesforce_id', description: 'Salesforce ID', required: true }
                ];
                return _filter(list, _f);
            };
            return _inf({
                resource: MemoryType,
                path: '#/memorytype/',
                fields: fields
            });
        };

        var memory = function () {
            var fields = function (list) {
                var _f = [
                    // FieldProvider.uuidField(Memory),
                    {
                        name: 'model', description: 'Model', required: true,
                        // opaque: 'stringTransform',
                        opaque: 'link',
                        subfield: 'name',
                        readArray: ['name'],
                        uriPrefix: '#/memorytype/',
                        inputMethod: {
                            type: 'typeahead',
                            invoker: function (val) {
                                return search(MemoryType, val);
                            },
                            accessor: 'name'
                        }
                    },
                    { name: 'serial_number', description: 'Serial Number', required: true },
                    FieldProvider.server_field,
                    FieldProvider.motherboard_field
                ];
                return _filter(list, _f);
            };
            return _inf({
                resource: Memory,
                path: '#/memory/',
                fields: fields,
                idField: 'id'
            });
        };

        var disk = function () {
            var fields = function (list) {
                var _f = [
                    { name: 'serial_number', description: 'Serial Number', required: true },
                    {
                        name: 'model', description: 'Model', required: true,
                        opaque: 'stringTransform',
                        // opaque: 'link',
                        subfield: 'name',
                        readArray: ['name'],
                        // uriPrefix: '#/diskmodel/',
                        idField: 'id',
                        inputMethod: {
                            type: 'typeahead',
                            invoker: function (val) {
                                return search(DiskType, val);
                            },
                            accessor: 'name'
                        }
                    }
                ];
                return _filter(list, _f);
            };

            return _inf({
                resource: Disk,
                fields: fields,
                path: '#/disk',
                idField: 'id'
            });
        };

        var diskModel = function () {
            var fields = function (list) {
                var _f = [
                    { name: 'name', description: 'Model Name', required: true },
                    {
                        name: 'interface', description: 'Interface', required: true,
                        inputMethod: {
                            type: 'choices',
                            choices: ['SATA', 'SCSI', 'IDE', 'M.2', 'PCI Express']
                        }
                    },
                    { name: 'rpm', description: 'RPM', required: true },
                    { name: 'seq_read_mbyte_per_sec', description: 'Seq. Read (MB/s)', required: true },
                    { name: 'seq_write_mbyte_per_sec', description: 'Seq. Write (MB/s)', required: true },
                    { name: 'random_iops', description: 'IOPS Rating', required: true },
                    {
                        name: 'form_factor', description: 'Form Factor', required: true,
                        inputMethod: {
                            type: 'choices',
                            choices: ['3.5', '2.5', 'M.2', 'mSATA']
                        }
                    },
                    { name: 'capacity_gb', description: 'Capacity (GB)', required: true },
                    {
                        name: 'media_type', description: 'Media Type', required: true,
                        inputMethod: {
                            type: 'choices',
                            choices: ['HDD', 'SDD']
                        }
                    },
                    FieldProvider.manufacturer_field
                ];
                return _filter(list, _f);
            };

            return _inf({
                resource: DiskType,
                fields: fields,
                path: '#/disktype',
                idField: 'uuid'
            });
        };

        var nic = function () {
            var fields = function (list) {
                var _f = [
                    { name: 'assettag', description: 'Asset Tag', required: false },
                    { name: 'serialnumber', description: 'Serial Number', required: true },
                    {
                        name: 'nic_model', description: 'Controller', required: true,
                        opaque: 'stringTransform',
                        // opaque: 'arbitraryLink',
                        // opaque: 'link',
                        subfield: 'nic_model',
                        readArray: ['controller'],
                        // uriPrefix: '#/diskmodel/',
                        idField: 'id',
                        inputMethod: {
                            type: 'typeahead',
                            invoker: function (val) {
                                return search(NICType, val);
                            },
                            accessor: 'controller'
                        }
                    },
                    { name: 'mac_address', description: 'MAC Address', required: true }

                ];
                return _filter(list, _f);
            };

            return _inf({
                resource: NIC,
                fields: fields,
                path: '#/nic',
                idField: 'id'
            });
        };

        var nicModel = function () {
            var _f = [
                { name: 'controller', description: 'NIC Controller', required: true },
                { name: 'nic_speed_mbps', description: 'Speed (Mbit/s)', required: true },
                { name: 'chipset', description: 'Chipset', required: true },
                { name: 'salesforce_id', description: 'Salesforce ID', required: true },
                FieldProvider.manufacturer_field
            ];
            return _inf({
                resource: NICType,
                fields: gen_fields(_f),
                path: '#/nictype',
                idField: 'uuid'
            });
        };

        var public_ipv4_assignment = function () {
            var fields = function (list) {
                var _f = [
                    { name: 'prefix', description: 'Prefix', required: true },
                    { name: 'prefixlen', description: 'Prefix Length', required: true },
                    { name: 'num_hosts_int', description: 'Num Hosts', required: true },
                    FieldProvider.customer_field('customer'),
                    { name: 'name', description: 'Block Name', required: true },
                    { name: 'description', description: 'Description', required: true }
                ];
                return _filter(list, _f);
            };
            var idField = 'prefix';
            var path = '/ipv4_public/assignments/';
            var modal = {
                templateUrl: '/static/rest/app/templates/ipam/assign_cust.html',
                size: 'md',
                controller: 'IPv4CustomerAssignmentModalController'
            };
            return _inf({
                resource: PublicIPv4Assignment,
                fields: fields,
                idField: idField,
                path: path,
                modal: modal
            });
        };

        var customdevice = function () {
            var m2m_choices = function (resourceClass) {
                var result = [];
                resourceClass.query().$promise.then(function (success) {
                    angular.forEach(success.results, function (value, key) {
                        result.push(value);
                    });
                    // Not able to return success.results to choices
                    // return success.results;
                });
                return result;
            };

            var fields = function (list) {
                var _f = [
                    { name: "name", description: "Name", required: true },
                    { name: "description", description: "Description", required: true },
                    { name: "type", description: "Type", required: true },
                    { name: "uptime_robot_id", description: "Monitoring Id", required: true },
                    FieldProvider.gen_link_field(Cabinet, 'cabinet', 'id', CabinetFast),
                    { name: "position", description: "Position" },
                    { name: "size", description: "Size" },
                    {
                        name: 'customers', description: 'Customers', required: true,
                        opaque: 'multiple',
                        subfield: 'name',
                        readArray: [],
                        idField: 'id',
                        inputMethod: {
                            type: 'multiple',
                            choices: m2m_choices(Organization),
                            displayProp: 'name',
                            idProp: 'id'
                        }
                    },

                ];
                return _filter(list, _f);
            };

            return _inf({
                resource: CustomDevice,
                fields: fields,
                path: '#/customdevice',
                idField: 'id'
            });
        };

        var terminalserver = function () {
            var fields = function (list) {
                var _f = [
                    { name: "name", description: "Name", required: true },
                    { name: "asset_tag", description: "Assettag", required: true },
                    { name: "serial_number", description: "Serial Number", required: true },
                    { name: "ip_address", description: "IP Address", required: true, hide: true },
                    {
                        name: 'model', description: 'Model', required: true,
                        opaque: 'stringTransform',
                        // opaque: 'link',
                        subfield: 'name',
                        readArray: ['name'],
                        // uriPrefix: '#/diskmodel/',
                        idField: 'id',
                        inputMethod: {
                            type: 'typeahead',
                            invoker: function (val) {
                                return search(TerminalServerModel, val);
                            },
                            accessor: 'name'
                        }
                    },
                    FieldProvider.gen_link_field(Cabinet, 'cabinet', 'id', CabinetFast),
                    FieldProvider.customer_field('customer'),
                    {
                        name: 'is_allocated', description: 'Is Allocated', required: true, hide: true,
                        inputMethod: {
                            type: 'choices',
                            choices: [true, false]
                        }
                    },
                    {
                        name: 'status', description: 'Status', required: true,
                        inputMethod: {
                            type: 'choices',
                            choices: ['AVAILABLE', 'IN_SERVICE', 'REPAIR/RMA', 'UNKNOWN']
                        }
                    }

                ];
                return _filter(list, _f);
            };

            return _inf({
                resource: TerminalServer,
                fields: fields,
                path: '#/terminalserver',
                idField: 'id'
            });
        };

        var cabinet = function () {
            var m2m_choices = function (resourceClass) {
                var result = [];
                resourceClass.query().$promise.then(function (success) {
                    angular.forEach(success.results, function (value, key) {
                        result.push(value);
                    });
                    // Not able to return success.results to choices
                    // return success.results;
                });
                return result;
            };
            var fields = function (list) {
                var _f = [
                    { name: 'name', description: 'Name', required: true },
                    {
                        name: 'model', description: 'Model', required: true,
                    },
                    {
                        name: 'size', description: 'Size', required: true,
                        inputMethod: {
                            type: 'number',
                        }
                    },
                    {
                        name: 'cabinet_type', description: 'Type', required: true,
                        opaque: 'stringTransform',
                        // opaque: 'link',
                        subfield: 'name',
                        readArray: ['cabinet_type'],
                        // uriPrefix: '#/diskmodel/',
                        idField: 'id',
                        inputMethod: {
                            type: 'typeahead',
                            invoker: function (val) {
                                return search(CabinetType, val);
                            },
                            accessor: 'cabinet_type'
                        }
                    },
                    {
                        name: 'cage', description: 'Cage',
                        opaque: 'stringTransform',
                        // opaque: 'link',
                        subfield: 'name',
                        readArray: ['name'],
                        // uriPrefix: '#/diskmodel/',
                        idField: 'id',
                        inputMethod: {
                            type: 'typeahead',
                            invoker: function (val) {
                                return search(Cage, val);
                            },
                            accessor: 'name'
                        }
                    },
                    // FieldProvider.customer_field('customer'),
                    {
                        name: 'customers', description: 'Customers', required: true,
                        opaque: 'multiple',
                        subfield: 'name',
                        readArray: [],
                        idField: 'id',
                        inputMethod: {
                            type: 'multiple',
                            choices: m2m_choices(Organization),
                            // choices: [true, false],
                            displayProp: 'name',
                            idProp: 'id'
                        }
                    },
                    { name: 'salesforce_id', description: 'Salesforce ID', required: true }

                ];
                return _filter(list, _f);
            };

            return _inf({
                resource: Cabinet,
                fields: fields,
                path: '#/cabinet',
                idField: 'id'
            });
        };

        var ipmiModel = function () {
            var _f = [
                {
                    name: 'version', description: 'Version', required: true,
                    inputMethod: {
                        type: 'choices',
                        choices: ['1.0', '1.5', '2.0']
                    }
                },
                { name: 'controller', description: 'Controller', required: true },
                FieldProvider.manufacturer_field
            ];
            return _inf({
                resource: IPMIModel,
                fields: gen_fields(_f),
                path: '#/ipmi_model',
                idField: 'id'
            });
        };

        var serverModel = function () {
            var _f = [
                FieldProvider.server_manufacturer_field,
                { name: 'name', description: 'Name', required: true },
                { name: 'power_consumption', description: 'Power Consumption' },
                {
                    name: 'end_of_life',
                    description: 'E-O-L',
                    opaque: 'arbitraryLink',
                    func: function (row) {
                        return $filter('date')(row.end_of_life, 'longDate');
                    },
                    inputMethod: {
                        type: 'datetime'
                    }
                },
                {
                    name: 'end_of_service',
                    description: 'E-O-S',
                    opaque: 'arbitraryLink',
                    func: function (row) {
                        return $filter('date')(row.end_of_service, 'longDate');
                    },
                    inputMethod: {
                        type: 'datetime'
                    }
                }
            ];
            return _inf({
                resource: ServerModel,
                fields: gen_fields(_f),
                path: '#/server_model',
                idField: 'id'
            });
        };

        var mobileModel = function () {
            var _f = [
                FieldProvider.mobile_manufacturer_field,
                { name: 'name', description: 'Name', required: true },
                { name: 'power_consumption', description: 'Power Consumption' },
                {
                    name: 'end_of_life',
                    description: 'E-O-L',
                    opaque: 'arbitraryLink',
                    func: function (row) {
                        return $filter('date')(row.end_of_life, 'longDate');
                    },
                    inputMethod: {
                        type: 'datetime'
                    }
                },
                {
                    name: 'end_of_service',
                    description: 'E-O-S',
                    opaque: 'arbitraryLink',
                    func: function (row) {
                        return $filter('date')(row.end_of_service, 'longDate');
                    },
                    inputMethod: {
                        type: 'datetime'
                    }
                }
            ];
            return _inf({
                resource: MobileDeviceModel,
                fields: gen_fields(_f),
                path: '#/mobile_model',
                idField: 'id'
            });
        };

        var storageModel = function () {
            var _f = [
                FieldProvider.storage_manufacturer_field,
                { name: 'name', description: 'Name', required: true },
                { name: 'power_consumption', description: 'Power Consumption' },
                {
                    name: 'end_of_life',
                    description: 'E-O-L',
                    opaque: 'arbitraryLink',
                    func: function (row) {
                        return $filter('date')(row.end_of_life, 'longDate');
                    },
                    inputMethod: {
                        type: 'datetime'
                    }
                },
                {
                    name: 'end_of_service',
                    description: 'E-O-S',
                    opaque: 'arbitraryLink',
                    func: function (row) {
                        return $filter('date')(row.end_of_service, 'longDate');
                    },
                    inputMethod: {
                        type: 'datetime'
                    }
                }
            ];
            return _inf({
                resource: StorageModel,
                fields: gen_fields(_f),
                path: '#/storage_model',
                idField: 'id'
            });
        };

        var manufacturer = function () {
            var _f = [
                { name: 'name', description: 'Name', required: true }
            ];
            return _inf({
                resource: Manufacturer,
                fields: gen_fields(_f),
                path: '#/manufacturers',
                idField: 'id'
            });
        };

        var server_manufacturer = function () {
            var _f = [
                { name: 'name', description: 'Name', required: true }
            ];
            return _inf({
                resource: ServerManufacturer,
                fields: gen_fields(_f),
                path: '#/manufacturers',
                idField: 'id'
            });
        };

        var storage_manufacturer = function () {
            var _f = [
                { name: 'name', description: 'Name', required: true }
            ];
            return _inf({
                resource: StorageManufacturer,
                fields: gen_fields(_f),
                path: '#/storage_manufacturers',
                idField: 'id'
            });
        };

        var pdu_manufacturer = function () {
            var _f = [
                { name: 'name', description: 'Name', required: true }
            ];
            return _inf({
                resource: PDUManufacturer,
                fields: gen_fields(_f),
                path: '#/pdu_manufacturers',
                idField: 'id'
            });
        };

        var mobile_manufacturer = function () {
            var _f = [
                { name: 'name', description: 'Name', required: true }
            ];
            return _inf({
                resource: MobileDeviceManufacturer,
                fields: gen_fields(_f),
                path: '#/mobile_manufacturers',
                idField: 'id'
            });
        };

        var motherboard = function () {
            var _f = [
                { name: 'asset_tag', description: 'Asset Tag', required: true },
                { name: 'serial_number', description: 'Serial Number', required: true },
                {
                    name: 'model', description: 'Motherboard Model', required: true,
                    opaque: 'stringTransform',
                    // opaque: 'link',
                    subfield: 'name',
                    readArray: ['name'],
                    // uriPrefix: '#/electricalpanel/',
                    idField: 'id',
                    inputMethod: {
                        type: 'typeahead',
                        invoker: function (val) {
                            return search(MotherboardModel, val);
                        },
                        accessor: 'name'
                    }
                }
            ];
            return _inf({
                resource: Motherboard,
                fields: gen_fields(_f),
                path: '#/motherboard',
                idField: 'id'
            });
        };

        var moboModel = function () {
            var _f = [
                { name: 'name', description: 'Model Name', required: true },
                { name: 'num_cpu_sockets', description: 'Total CPU', required: true },
                { name: 'num_dimm_slots', description: 'Total Memory Slots', required: true },
                { name: 'num_sata_ports', description: 'Total SATA Ports', required: true },
                { name: 'num_sas_ports', description: 'Total SAS Ports', required: true },
                { name: 'num_nic_ports', description: 'Total NIC Ports', required: true },
                { name: 'max_memory_capacity_gb', description: 'Memory Capacity', required: true },
                // FieldProvider.disk_controller_field,
                FieldProvider.cpu_socket_type_field,
                FieldProvider.nic_model_field,
                FieldProvider.ipmi_controller_field,
                FieldProvider.manufacturer_field
            ];
            return _inf({
                resource: MotherboardModel,
                fields: gen_fields(_f),
                path: '#/motherboardmodel',
                idField: 'id'
            });
        };

        var switchModel = function () {
            var _f = [
                FieldProvider.manufacturer_field,
                { name: 'name', description: 'Model Name', required: true },
                { name: 'num_ports', description: 'Ports', required: true },
                { name: 'num_uplink_ports', description: 'Uplink Ports', required: true },
                { name: 'port_speed_mbps', description: 'Port Speed', required: true },
                { name: 'uplink_port_speed_mbps', description: 'Uplink Port Speed', required: true },
                {
                    name: 'port_phy', description: 'Port Phy', required: true,
                    inputMethod: {
                        type: 'choices',
                        choices: ['10BASE-T', '100BASE-T', '1000BASE-T', '10000BASE-T', 'SFP', 'SFP+', 'XENPAK', 'XFP']
                    }
                },
                {
                    name: 'uplink_port_phy', description: 'Uplink Port Phy', required: true,
                    inputMethod: {
                        type: 'choices',
                        choices: ['10BASE-T', '100BASE-T', '1000BASE-T', '10000BASE-T', 'SFP', 'SFP+', 'XENPAK', 'XFP']
                    }
                },
                { name: 'power_consumption', description: 'Power Consumption' },
                {
                    name: 'end_of_life',
                    description: 'E-O-L',
                    opaque: 'arbitraryLink',
                    func: function (row) {
                        return $filter('date')(row.end_of_life, 'longDate');
                    },
                    inputMethod: {
                        type: 'datetime'
                    }
                },
                {
                    name: 'end_of_service',
                    description: 'E-O-S',
                    opaque: 'arbitraryLink',
                    func: function (row) {
                        return $filter('date')(row.end_of_service, 'longDate');
                    },
                    inputMethod: {
                        type: 'datetime'
                    }
                }
            ];
            return _inf({
                resource: SwitchModel,
                fields: gen_fields(_f),
                path: '#/switchmodel',
                idField: 'id'
            });
        };

        var loadBalancerModel = function () {
            var _f = [
                FieldProvider.manufacturer_field,
                { name: 'name', description: 'Model Name', required: true },
                { name: 'operating_system', description: 'Operating System', required: true },
                { name: 'num_ports', description: 'Ports', required: true },
                { name: 'num_uplink_ports', description: 'Uplink Ports', required: true },
                { name: 'power_consumption', description: 'Power Consumption' },
                {
                    name: 'end_of_life',
                    description: 'E-O-L',
                    opaque: 'arbitraryLink',
                    func: function (row) {
                        return $filter('date')(row.end_of_life, 'longDate');
                    },
                    inputMethod: {
                        type: 'datetime'
                    }
                },
                {
                    name: 'end_of_service',
                    description: 'E-O-S',
                    opaque: 'arbitraryLink',
                    func: function (row) {
                        return $filter('date')(row.end_of_service, 'longDate');
                    },
                    inputMethod: {
                        type: 'datetime'
                    }
                }
            ];
            return _inf({
                resource: LoadBalancerModel,
                fields: gen_fields(_f),
                path: '#/loadbalancermodel',
                idField: 'id'
            });
        };

        var firewallModel = function () {
            var _f = [
                FieldProvider.manufacturer_field,
                { name: 'name', description: 'Model Name', required: true },
                { name: 'operating_system', description: 'Operating System', required: true },
                { name: 'num_ports', description: 'Ports', required: true },
                { name: 'num_uplink_ports', description: 'Uplink Ports', required: true },
                { name: 'power_consumption', description: 'Power Consumption' },
                {
                    name: 'end_of_life',
                    description: 'E-O-L',
                    opaque: 'arbitraryLink',
                    func: function (row) {
                        return $filter('date')(row.end_of_life, 'longDate');
                    },
                    inputMethod: {
                        type: 'datetime'
                    }
                },
                {
                    name: 'end_of_service',
                    description: 'E-O-S',
                    opaque: 'arbitraryLink',
                    func: function (row) {
                        return $filter('date')(row.end_of_service, 'longDate');
                    },
                    inputMethod: {
                        type: 'datetime'
                    }
                }
            ];
            return _inf({
                resource: FirewallModel,
                fields: gen_fields(_f),
                path: '#/firewallmodel',
                idField: 'id'
            });
        };

        var pduModel = function () {
            var _f = [
                FieldProvider.pdu_manufacturer_field,
                { name: 'model_number', description: 'Model Number', required: true },
                { name: 'max_amps', description: 'MAX AMPS', required: true },
                { name: 'num_outlets', description: 'Number of Outlets', required: true },
                { name: 'outlet_type', description: 'Outlet Type', required: true },
                { name: 'input_voltage', description: 'Input Voltage', required: true },
                { name: 'output_voltage', description: 'Output Voltage', required: true },
                { name: 'power_consumption', description: 'Power Consumption' },
                {
                    name: 'end_of_life',
                    description: 'E-O-L',
                    opaque: 'arbitraryLink',
                    func: function (row) {
                        return $filter('date')(row.end_of_life, 'longDate');
                    },
                    inputMethod: {
                        type: 'datetime'
                    }
                },
                {
                    name: 'end_of_service',
                    description: 'E-O-S',
                    opaque: 'arbitraryLink',
                    func: function (row) {
                        return $filter('date')(row.end_of_service, 'longDate');
                    },
                    inputMethod: {
                        type: 'datetime'
                    }
                }
            ];
            return _inf({
                resource: PDUModel,
                fields: gen_fields(_f),
                path: '#/pdumodel',
                idField: 'id'
            });
        };

        var terminalServerModel = function () {
            var _f = [
                { name: 'name', description: 'Model', required: true },
                { name: 'num_ports', description: 'Total Ports', required: true },
                FieldProvider.manufacturer_field
            ];
            return _inf({
                resource: TerminalServerModel,
                fields: gen_fields(_f),
                path: '#/terminalservermodel',
                idField: 'id'
            });
        };

        var electricalpanel = function () {
            var _f = [
                { name: 'name', description: 'Name', required: true },
                { name: 'max_num_breakers', description: 'Max Num Of Breakers', required: true }
            ];
            return _inf({
                resource: ElectricalPanel,
                fields: gen_fields(_f),
                path: '#/electricalpanel',
                idField: 'id'
            });
        };

        var electricalcircuit = function () {
            var _f = [
                { name: 'name', description: 'Name', required: true },
                {
                    name: 'panel', description: 'Panel', required: true,
                    opaque: 'stringTransform',
                    // opaque: 'link',
                    subfield: 'name',
                    readArray: ['name'],
                    // uriPrefix: '#/electricalpanel/',
                    idField: 'id',
                    inputMethod: {
                        type: 'typeahead',
                        invoker: function (val) {
                            return search(ElectricalPanel, val);
                        },
                        accessor: 'name'
                    }
                }
            ];
            return _inf({
                resource: ElectricalCircuit,
                fields: gen_fields(_f),
                path: '#/electricalcircuit',
                idField: 'id'
            });
        };

        var os = function () {
            var _f = [
                { name: 'name', description: 'Name', required: true },
                { name: 'version', description: 'Version', required: true },
                {
                    name: 'platform_type', description: 'Platform Type', required: true,
                    inputMethod: {
                        type: 'choices',
                        choices: ['ESXi', 'Linux', 'Nimble', 'Windows', 'Hypervisor', 'MacOS']
                    }
                }
            ];
            return _inf({
                resource: OS,
                fields: gen_fields(_f),
                path: '#/os',
                idField: 'id'
            });
        };

        var product_type = function () {
            var _f = [
                { name: 'product_type', description: 'Product Type', required: true }
            ];
            return _inf({
                resource: ProductType,
                fields: gen_fields(_f),
                path: '#/producttype',
                idField: 'id'
            });
        };

        var sascontroller_type = function () {
            var _f = [
                { name: 'sascontroller_type', description: 'Type', required: true },
                { name: 'sas_raid_support', description: 'RAID Support', required: true }
            ];
            return _inf({
                resource: SASControllerType,
                fields: gen_fields(_f),
                path: '#/sascontrollertype',
                idField: 'id'
            });
        };

        var raidcontroller_type = function () {
            var _f = [
                { name: 'controller', description: 'Controller', required: true },
                { name: 'assettag', description: 'Assettag', required: true },
                { name: 'serialnumber', description: 'Serial Number', required: true },
                { name: 'raid_support', description: 'RAID Support', required: true },
                {
                    name: 'is_allocated', description: 'Is Allocated', required: true,
                    inputMethod: {
                        type: 'choices',
                        choices: [true, false]
                    }
                },
                FieldProvider.manufacturer_field
            ];
            return _inf({
                resource: RAIDController,
                fields: gen_fields(_f),
                path: '#/raidcontrollertype',
                idField: 'id'
            });
        };

        var disk_controller_type = function () {
            var _f = [
                { name: "controller", description: "Controller", required: true },
                { name: "ports", description: "Ports", required: true },
                { name: "raid_support", description: "RAID Support", required: true }];
            return _inf({
                resource: DiskControllerTypes,
                fields: gen_fields(_f),
                path: '#/diskcontroller',
                idField: 'id'
            });
        };

        var chassis_type = function () {
            var _f = [
                { name: 'model_name', description: 'Model Name', required: true },
                { name: 'num_psu_slots', description: 'Total Power Supply Slots', required: true },
                { name: 'num_drive_bays', description: 'Total Disk Bays', required: true },
                { name: 'drive_bay_width', description: 'Disk Bay Width', required: true },
                { name: 'num_fan_slots', description: 'Total Fan Slots', required: true },
                { name: 'dimensions', description: 'Size', required: true },
                FieldProvider.manufacturer_field
            ];
            return _inf({
                resource: Chassis,
                fields: gen_fields(_f),
                path: '#/chassistype',
                idField: 'id'
            });
        };

        var peripheral_type = function () {
            var _f = [
                { name: 'peripheral_type', description: 'Peripheral Type', required: true }
            ];
            return _inf({
                resource: PeripheralType,
                fields: gen_fields(_f),
                path: '#/peripheraltype',
                idField: 'id'
            });
        };

        var cluster_type = function () {
            var _f = [
                { name: 'name', description: 'Cluster Type', required: true }
            ];
            return _inf({
                resource: ClusterType,
                fields: gen_fields(_f),
                path: '#/clustertype',
                idField: 'id'
            });
        };

        var cloud_type = function () {
            var _f = [
                { name: 'cloud_type', description: 'Cloud Type', required: true },
                { name: 'vcpu', description: 'VCPU', required: true },
                { name: 'ethports', description: 'ETH Ports', required: true },
                { name: 'disksize', description: 'Disk Size', required: true },
                {
                    name: 'disk_measuretype', description: 'Disk Measure Type', required: true,
                    inputMethod: {
                        type: 'choices',
                        choices: ['MB', 'GB', 'TB']
                    }
                },
                { name: 'memorysize', description: 'Memory Size', required: true },
                {
                    name: 'memory_measuretype', description: 'Memory Measure Type', required: true,
                    inputMethod: {
                        type: 'choices',
                        choices: ['MB', 'GB', 'TB']
                    }
                }
            ];
            return _inf({
                resource: CloudTypes,
                fields: gen_fields(_f),
                path: '#/cloudtype',
                idField: 'id'
            });
        };

        var datacenter = function () {
            var _f = [
                { name: 'name', description: 'Datacenter Name', required: true },
                FieldProvider.location_field,
                { name: 'latitude', description: 'Latitude', required: false },
                { name: 'longitude', description: 'Longitude', required: false }

            ];
            return _inf({
                resource: DataCenter,
                fields: gen_fields(_f),
                path: '#/datacenter',
                idField: 'id'
            });
        };

        var location = function () {
            var _f = [
                { name: 'name', description: 'Location Name', required: true },
                { name: 'longitude', description: 'Longitude', required: true },
                { name: 'latitude', description: 'Latitude', required: true }

            ];
            return _inf({
                resource: Location,
                fields: gen_fields(_f),
                path: '#/location',
                idField: 'id'
            });
        };

        var cabinet_type = function () {
            var _f = [
                { name: 'cabinet_type', description: 'Cabinet Type', required: true }
            ];
            return _inf({
                resource: CabinetType,
                fields: gen_fields(_f),
                path: '#/cabinettype',
                idField: 'id'
            });
        };

        var cabinet_options = function () {
            var _f = [
                { name: 'cabinet_options', description: 'Cabinet Options', required: true }
            ];
            return _inf({
                resource: CabinetOption,
                fields: gen_fields(_f),
                path: '#/cabinetoption',
                idField: 'id'
            });
        };

        var circuit_options = function () {
            var _f = [
                { name: 'circuits', description: 'Circuits', required: true },
                {
                    name: 'power_type', description: 'Power Type', required: true,
                    inputMethod: {
                        type: 'choices',
                        choices: ['AC', 'DC', '3-Phase AC']
                    }
                },
                {
                    name: 'power_size', description: 'Power Size', required: true,
                    inputMethod: {
                        type: 'choices',
                        choices: ['120V', '180V', '240V']
                    }
                },
                { name: 'power_configuration', description: 'Configuration', required: true }
            ];
            return _inf({
                resource: CircuitOption,
                fields: gen_fields(_f),
                path: '#/circuitoption',
                idField: 'id'
            });
        };

        var voltage_type = function () {
            var _f = [
                {
                    name: 'voltage_type', description: 'Voltage Type', required: true,
                    inputMethod: {
                        type: 'choices',
                        choices: ['50V', '110V', '160V', '180V', '220V', '240V']
                    }
                }
            ];
            return _inf({
                resource: VoltageType,
                fields: gen_fields(_f),
                path: '#/voltagetype',
                idField: 'id'
            });
        };

        var amps_type = function () {
            var _f = [
                {
                    name: 'amps_type', description: 'AMPS Type', required: true,
                    inputMethod: {
                        type: 'choices',
                        choices: ['10A', '15A', '20A', '30A', '40A', '50A', '60A']
                    }
                }
            ];
            return _inf({
                resource: AMPSType,
                fields: gen_fields(_f),
                path: '#/ampstype',
                idField: 'id'
            });
        };

        var outlet_type = function () {
            var _f = [
                { name: 'outlet_type', description: 'Outlet Type', required: true }
            ];
            return _inf({
                resource: OutletType,
                fields: gen_fields(_f),
                path: '#/outlettype',
                idField: 'id'
            });
        };

        // unfortunately, we can't call this "switch", as it is a reserved word
        var networkSwitch = function () {
            var m2m_choices = function (resourceClass) {
                var result = [];
                resourceClass.query().$promise.then(function (success) {
                    angular.forEach(success.results, function (value, key) {
                        result.push(value);
                    });
                    // Not able to return success.results to choices
                    // return success.results;
                });
                return result;
            };
            var _f = [
                FieldProvider.self_name_field(Switch),
                { name: 'asset_tag', description: 'Asset Tag', required: true },
                { name: "management_ip", description: "Management IP" },
                FieldProvider.gen_link_field(SwitchModel, 'model'),
                FieldProvider.gen_link_field(Cabinet, 'cabinet', 'id', CabinetFast),
                // { name: 'user', description: 'User Name', required: true, hide: true },
                { name: 'serial_number', description: 'Serial Number', required: true },
                {
                    name: 'customers', description: 'Customers', required: true,
                    opaque: 'multiple',
                    subfield: 'name',
                    readArray: [],
                    idField: 'id',
                    inputMethod: {
                        type: 'multiple',
                        choices: m2m_choices(Organization),
                        // choices: [true, false],
                        displayProp: 'name',
                        idProp: 'id'
                    }
                },
                FieldProvider.boolean_field('is_shared', 'Shared'),
                FieldProvider.boolean_field('is_unitedconnect', 'UnitedConnect'),
                { name: "position", description: "Position" },
                { name: "size", description: "Size" },
                { name: "ip_address", description: "IP Address" },
                { name: "snmp_community", description: "SNMP Community" },
                //                FieldProvider.gen_link_field(ObserviumHost, 'observium_host', 'id', ObserviumHost, ['hostname'])
                // { name: "salesforce_id", description: "Salesforce ID", required: true },
                // FieldProvider.gen_link_field(ServiceContract, "service_contract")
            ];
            return _inf({
                resource: Switch,
                fields: gen_fields(_f),
                path: '#/switch',
                idField: 'id'
            });
        };

        var firewall = function () {
            var m2m_choices = function (resourceClass) {
                var result = [];
                resourceClass.query().$promise.then(function (success) {
                    angular.forEach(success.results, function (value, key) {
                        result.push(value);
                    });
                    // Not able to return success.results to choices
                    // return success.results;
                });
                return result;
            };
            var _f = [
                FieldProvider.self_name_field(Firewall),
                { name: 'asset_tag', description: 'Asset Tag', required: true },
                { name: "management_ip", description: "Management IP" },
                FieldProvider.gen_link_field(FirewallModel, 'model'),
                FieldProvider.gen_link_field(Cabinet, 'cabinet', 'id', CabinetFast),
                { name: 'serial_number', description: 'Serial Number', required: true },
                {
                    name: 'customers', description: 'Customers', required: true,
                    opaque: 'multiple',
                    subfield: 'name',
                    readArray: [],
                    idField: 'id',
                    inputMethod: {
                        type: 'multiple',
                        choices: m2m_choices(Organization),
                        // choices: [true, false],
                        displayProp: 'name',
                        idProp: 'id'
                    }
                },
                FieldProvider.boolean_field('is_shared', 'Shared'),

                { name: "position", description: "Position" },
                { name: "size", description: "Size" },
                { name: "ip_address", description: "IP Address" },
                { name: "snmp_community", description: "SNMP Community" },
                // { name: "salesforce_id", description: "Salesforce ID", required: true }
            ];
            return _inf({
                resource: Firewall,
                fields: gen_fields(_f),
                path: '#/firewall',
                idField: 'id'
            });
        };

        var release = function () {
            var _f = [
                {
                    name: 'name',
                    description: 'Release Label',
                    required: true,
                },
                {
                    name: 'is_active', description: 'Active', required: true, ischeck: true, checkvalue: 'Active',
                    inputMethod: {
                        type: 'choices',
                        choices: [true, false]
                    }
                },
                { name: 'version', description: 'Version', required: true },
                { name: 'description', description: 'Description', required: true },
                { name: 'file_url', description: 'File URL', required: true },
                {
                    name: 'release_date',
                    description: 'Release Date',
                    opaque: 'arbitraryLink',
                    func: function (row) {
                        return $filter('date')(row.release_date, 'medium');
                    },
                    inputMethod: {
                        type: 'datetime'
                    }
                }
            ];
            return _inf({
                resource: Release,
                fields: gen_fields(_f),
                path: '#/release',
                idField: 'id'
            });
        };

        var loadBalancer = function () {
            var m2m_choices = function (resourceClass) {
                var result = [];
                resourceClass.query().$promise.then(function (success) {
                    angular.forEach(success.results, function (value, key) {
                        result.push(value);
                    });
                    // Not able to return success.results to choices
                    // return success.results;
                });
                return result;
            };
            var _f = [
                FieldProvider.self_name_field(LoadBalancer),
                { name: 'asset_tag', description: 'Asset Tag', required: true },
                { name: "management_ip", description: "Management IP" },
                FieldProvider.gen_link_field(LoadBalancerModel, 'model'),
                FieldProvider.gen_link_field(Cabinet, 'cabinet', 'id', CabinetFast),
                { name: 'serial_number', description: 'Serial Number', required: true },
                {
                    name: 'customers', description: 'Customers', required: true,
                    opaque: 'multiple',
                    subfield: 'name',
                    readArray: [],
                    idField: 'id',
                    inputMethod: {
                        type: 'multiple',
                        choices: m2m_choices(Organization),
                        // choices: [true, false],
                        displayProp: 'name',
                        idProp: 'id'
                    }
                },
                FieldProvider.boolean_field('is_shared', 'Shared'),
                { name: "position", description: "Position" },
                { name: "size", description: "Size" },
                { name: "ip_address", description: "IP Address" },
                { name: "snmp_community", description: "SNMP Community" },
                // { name: "salesforce_id", description: "Salesforce ID", required: true },
                // FieldProvider.gen_link_field(ServiceContract, "service_contract")
            ];
            return _inf({
                resource: LoadBalancer,
                fields: gen_fields(_f),
                path: '#/loadbalancer',
                idField: 'id'
            });
        };

        var virtualLoadBalancer = function () {
            var _f = [
                FieldProvider.self_name_field(VirtualLoadBalancer),
                FieldProvider.gen_link_field(LoadBalancerModel, 'model'),
                FieldProvider.customer_field('customer')
            ];
            return _inf({
                resource: VirtualLoadBalancer,
                fields: gen_fields(_f),
                path: '#/virtual_loadbalancer',
                idField: 'id'
            });
        };

        var user = function () {
            //Create choices for m2m field
            var m2m_choices = function (resourceClass) {
                var result = [];
                resourceClass.query().$promise.then(function (success) {
                    angular.forEach(success.results, function (value, key) {
                        result.push(value);
                    });
                    // Not able to return success.results to choices
                    // return success.results;
                });
                return result;
            };

            var _f = [
                { name: 'first_name', description: 'First Name', required: true },
                { name: 'last_name', description: 'Last Name', required: true },
                {
                    name: 'email',
                    description: 'Email',
                    required: true,
                    opaque: 'link',
                    readArray: [],
                    uriPrefix: '#/user/',
                    idField: 'id'
                },
                FieldProvider.customer_field('org', 'Organization'),

                {
                    name: 'user_roles', description: 'User Role', required: true,
                    opaque: 'multiple',
                    subfield: 'name',
                    readArray: [],
                    idField: 'id',
                    inputMethod: {
                        type: 'multiple',
                        choices: m2m_choices(Role),
                        displayProp: 'name',
                        idProp: 'id'
                    }
                },

                {
                    name: 'access_types', description: 'Access Types', required: true,
                    opaque: 'multiple',
                    subfield: 'name',
                    readArray: [],
                    idField: 'id',
                    inputMethod: {
                        type: 'multiple',
                        choices: m2m_choices(AccessType),
                        // choices: [true, false],
                        displayProp: 'name',
                        idProp: 'id'
                    }
                },

                {
                    name: 'ticket_group', description: 'Groups', required: true,
                    opaque: 'multiple',
                    hide: true,
                    subfield: 'name',
                    readArray: [],
                    idField: 'id',
                    inputMethod: {
                        type: 'multiple',
                        choices: m2m_choices(TicketUserGroupFast),
                        // choices: [true, false],
                        displayProp: 'name',
                        idProp: 'id'
                    }
                },

                {
                    name: 'timezone',
                    description: 'Timezone',
                    required: true,
                    inputMethod: {
                        type: 'choices',
                        choices: CustomDataService.get_pytz_all_timezone(),
                    }
                },
                {
                    name: 'is_staff', description: 'Is Staff', required: true, hide: true, ischeck: true, checkvalue: 'Staff',
                    inputMethod: {
                        type: 'choices',
                        choices: [true, false]
                    }
                },
                {
                    name: 'is_active', description: 'Is Active', required: true, ischeck: true, checkvalue: 'Active',
                    inputMethod: {
                        type: 'choices',
                        choices: [true, false]
                    }
                },
                { name: 'salesforce_id', description: 'Salesforce ID', hide: true },

            ];
            return _inf({
                resource: User,
                fields: gen_fields(_f),
                path: '#/user',
                idField: 'id'
            });
        };


        var organization = function () {
            //Create choices for m2m field
            var m2m_choices = function (resourceClass) {
                var result = [];
                resourceClass.query().$promise.then(function (success) {
                    angular.forEach(success.results, function (value, key) {
                        result.push(value);
                    });
                    // Not able to return success.results to choices
                    // return success.results;
                });
                return result;
            };

            var regionArr = [
                {
                    'regionName': 'USA',
                    'regionValue': 22
                },
                {
                    'regionName': 'Europe',
                    'regionValue': 11
                },
            ]

            var _f = [
                FieldProvider.self_name_field(Organization, 'name'),
                { name: 'email', cls: 'col-xs-3', description: 'Email', required: true },
                FieldProvider.choice_field('organization_type', 'Type', ['INTERNAL', 'EXTERNAL', 'PARTNER', 'DEMO']),
                {
                    name: 'logo', description: 'Logo',
                    inputMethod: {
                        type: 'logo'
                    }
                },
                {
                    name: 'is_active', description: 'Is Active', required: true,
                    inputMethod: {
                        type: 'choices',
                        choices: [true, false]
                    }
                },
                { name: 'phone', description: 'Phone' },
                { name: 'address1', description: 'Address1', required: true, hide: true },
                { name: 'address2', description: 'Address2', hide: true },
                { name: 'city', description: 'City', required: true, hide: true },
                { name: 'state', description: 'State', required: true, hide: true },
                { name: 'country', description: 'Country', required: true, hide: true },
                { name: 'postal_code', description: 'Postal Code', required: true, hide: true },

                { name: 'domain', description: 'Domain', hide: true },
                { name: 'ulid', description: 'ULID', hide: true },
                FieldProvider.obj_arr_choice_field('region', 'Region', regionArr, 'regionName', 'regionValue'),
                FieldProvider.choice_field('customer_type', 'Customer Type', ['UL', 'EXT']),
                {
                    name: 'vpn_status', description: 'VPN Status', required: true,
                    inputMethod: {
                        type: 'choices',
                        choices: [true, false]
                    }
                },
                {
                    name: 'unity_modules', description: 'Unity Modules', required: true, hide: true,
                    opaque: 'multiple',
                    subfield: 'module_name',
                    readArray: [],
                    idField: 'module_id',
                    inputMethod: {
                        type: 'multiple',
                        choices: m2m_choices(UnityModules),
                        displayProp: 'module_name',
                        idProp: 'module_id'
                    }
                },
                {
                    name: 'is_management_enabled', description: 'Management Enabled', required: true,
                    inputMethod: {
                        type: 'choices',
                        choices: [true, false]
                    }
                },

                {
                    name: 'advanced_discovery', description: 'Advanced Discovery', required: true,
                    inputMethod: {
                        type: 'choices',
                        choices: [true, false]
                    }
                },

                { name: 'default_snmp_community', description: 'SNMP Community', hide: true },
                // { name: 'default_snmp_version', description: 'SNMP Version', required: true, hide: true },
                {
                    name: 'default_snmp_version', description: 'SNMP Version', hide: true,
                    inputMethod: {
                        type: 'choices',
                        choices: ['1', '2c', '3']
                    }
                },
                { name: 'salesforce_id', description: 'Salesforce ID', hide: true },
                { name: 'storage', description: 'Storage in TB', hide: true },
                { name: 'onboarding_status', description: 'Onboarding Status', hide: true },
                {
                    name: 'monitor_by', description: 'Monitor By', hide: true,
                    inputMethod: {
                        type: 'choices',
                        choices: ['Observium', 'Zabbix']
                    }
                },
            ];

            return _inf({
                resource: Organization,
                fields: gen_fields(_f),
                path: '/organization/',
                idField: 'id'
            });
        };

        var org_monitoring_config = function () {
            var monitoringTools = ['observium', 'zabbix'];

            var _f = [
                FieldProvider.customer_field('org', 'Organization'),
                {
                    name: 'switch', description: 'Switch', required: true,
                    inputMethod: {
                        type: 'choices',
                        choices: monitoringTools,
                        default: monitoringTools[0]
                    },
                },
                {
                    name: 'firewall', description: 'Firewall', required: true,
                    inputMethod: {
                        type: 'choices',
                        choices: monitoringTools,
                        default: monitoringTools[0]
                    }
                },
                {
                    name: 'load_balancer', description: 'Load Balancer', required: true,
                    inputMethod: {
                        type: 'choices',
                        choices: monitoringTools,
                        default: monitoringTools[0]
                    }
                },
                {
                    name: 'hypervisor', description: 'Hypervisor', required: true,
                    inputMethod: {
                        type: 'choices',
                        choices: monitoringTools,
                        default: monitoringTools[0]
                    }
                },
                {
                    name: 'baremetal', description: 'Bare Metal Server', required: true,
                    inputMethod: {
                        type: 'choices',
                        choices: monitoringTools,
                        default: monitoringTools[0]
                    }
                },
                {
                    name: 'mac_device', description: 'MAC Devices', required: true,
                    inputMethod: {
                        type: 'choices',
                        choices: monitoringTools,
                        default: monitoringTools[0]
                    }
                },
                {
                    name: 'vm', description: 'Virtual Machines', required: true,
                    inputMethod: {
                        type: 'choices',
                        choices: monitoringTools,
                        default: monitoringTools[0]
                    }
                },
                {
                    name: 'storage', description: 'Storage', required: true,
                    inputMethod: {
                        type: 'choices',
                        choices: monitoringTools,
                        default: monitoringTools[0]
                    }
                },
                {
                    name: 'database', description: 'Databases', required: true, disabled: true,
                    inputMethod: {
                        type: 'choices',
                        choices: monitoringTools,
                        default: monitoringTools[1]
                    }
                },
                {
                    name: 'pdu', description: 'PDU', required: true,
                    inputMethod: {
                        type: 'choices',
                        choices: monitoringTools,
                        default: monitoringTools[0]
                    }
                },
            ];
            return _inf({
                resource: OrgMonitoringConfig,
                fields: gen_fields(_f),
                path: '#/org_monitoring_config',
                idField: 'id'
            });
        };

        var storage_inventory = function () {
            var m2m_choices = function (resourceClass) {
                var result = [];
                resourceClass.query().$promise.then(function (success) {
                    angular.forEach(success.results, function (value, key) {
                        result.push(value);
                    });
                    // Not able to return success.results to choices
                    // return success.results;
                });
                return result;
            };

            var _f = [
                FieldProvider.customer_field('org', 'Organization'),
                {
                    name: 'datacenter', description: 'Datacenter', required: true,
                    opaque: 'stringTransform',
                    // opaque: 'link',
                    subfield: 'name',
                    readArray: ['name'],
                    // uriPrefix: '#/datacenter/',
                    idField: 'id',
                    inputMethod: {
                        type: 'typeahead',
                        invoker: function (val) {
                            return search(DatacenterFast, val);
                        },
                        accessor: 'name'
                    }
                },
                { name: 'label', description: 'Label', required: true },
                { name: 'storage', description: 'Storage in TB', required: true },
                { name: 'storage_type', description: 'Storage Type', required: true },
            ];

            return _inf({
                resource: OrgStorageInventory,
                fields: gen_fields(_f),
                path: '/org_storage/',
                idField: 'id'
            });
        };

        var openStackInstance = function () {
            var _f = [
                { name: 'name', description: 'Name', required: true },
                { name: 'vcpu', description: 'VCPUs', required: true },
                { name: 'memory', description: 'Memory (MB)', required: true },
                { name: 'disk', description: 'Disk (GB)', required: true },
                { name: 'operating_system', description: 'Image', required: true },
                { name: 'ip_address', description: 'IP Address', required: true },
                { name: 'last_known_state', description: 'Status', required: true },
                FieldProvider.customer_field('customer')
            ];
            return _inf({
                resource: OpenStackInstance,
                fields: gen_fields(_f),
                path: '#/openstack_instance',
                idField: 'uuid'
            });
        };

        var hostMonitor = function () {
            var _f = [
                FieldProvider.instance_field,
                { name: 'nagios_display_name', description: 'Nagios Host', required: true },
                {
                    name: 'last_known_state', description: 'Last Known State', required: false,
                    opaque: 'arbitraryLink',
                    func: function (row) {
                        return $filter('nagios_host_state')(row.last_known_state);
                    }
                },
                { name: 'last_known_output', description: 'Last Known Output', required: false },
                {
                    name: 'last_checked', description: 'Last Checked', required: false,
                    opaque: 'arbitraryLink',
                    func: function (row) {
                        return $filter('date')(row.last_checked, 'medium');
                    }
                }
            ];
            return _inf({
                resource: HostMonitor,
                fields: gen_fields(_f),
                path: '/host_monitor/',
                idField: 'id'
            });
        };

        var service_catalogue = function () {

            var org_choices = function () {
                var customers = [];
                OrganizationFast.query().$promise.then(function (success) {
                    angular.forEach(success.results, function (value, key) {
                        customers.push(value);
                    });
                    // Not able to return success.results to choices
                    // return success.results;
                });
                return customers;
            };

            var _f = [
                {
                    name: 'device_type', description: 'Device Type', required: true,
                    inputMethod: {
                        type: 'choices',
                        choices: [
                            'Firewall',
                            'Load Balancer',
                            'Switch',
                            'Hypervisor',
                            'Virtual Machine',
                            'Storage',
                            'Cloud Controller',
                            'BM Server',
                            'Cabinet',
                            'PDU',
                            'Mac Device'
                        ],
                    },
                },
                { name: 'description', description: 'Catalogue Description', required: true },
                { name: 'provider', description: 'Provider' },
                { name: 'support_email', description: 'Support Email' },
                {
                    name: 'customers', description: 'Customer', required: true,
                    opaque: 'multiple',
                    subfield: 'name',
                    readArray: [],
                    idField: 'id',
                    uriPrefix: '#/organization/',
                    inputMethod: {
                        type: 'multiple',
                        choices: org_choices(),
                        // choices: [true, false],
                        displayProp: 'name',
                        idProp: 'id'
                    }
                }
            ];
            return _inf({
                resource: ServiceCatalogue,
                fields: gen_fields(_f),
                path: '/service_catalogue/',
                idField: 'id'
            });
        };

        var customerHostMonitor = function (id) {
            var _f = [
                FieldProvider.instance_field,
                { name: 'nagios_display_name', description: 'Nagios Host', required: true },
                {
                    name: 'last_known_state', description: 'Last Known State', required: false,
                    opaque: 'arbitraryLink',
                    func: function (row) {
                        return $filter('nagios_host_state')(row.last_known_state);
                    }
                },
                { name: 'last_known_output', description: 'Last Known Output', required: false },
                {
                    name: 'last_checked', description: 'Last Checked', required: false,
                    opaque: 'arbitraryLink',
                    func: function (row) {
                        return $filter('date')(row.last_checked, 'medium');
                    }
                }
            ];
            return _inf({
                resource: OrganizationHostMonitor,
                fields: gen_fields(_f),
                path: '/host_monitor/' + id + '/organization/',
                idField: 'id'
            });
        };

        var observium_host = function () {
            var _f = [
                FieldProvider.self_name_field(ObserviumHost, 'hostname'),
                { name: 'location', description: 'Location', required: true },
                { name: 'os', description: 'OS', required: true },
                { name: 'serial', description: 'Serial', required: true },
                { name: 'type', description: 'Type', required: true },
                { name: 'uptime', description: 'Uptime', required: true },
                { name: 'uptime_human', description: 'Uptime (Human)', required: true },
                { name: 'version', description: 'Version', required: true }
            ];
            return _inf({
                resource: ObserviumHost,
                fields: gen_fields(_f),
                path: '/observium_host/',
                idField: 'id'
            });
        };

        var transit_port = function () {
            var _f = [
                FieldProvider.gen_link_field(DataCenter, 'datacenter', 'id'),
                FieldProvider.gen_link_field(Switch, 'switch', 'id'),
                { name: 'interface_name', description: 'Interface Name', required: true }
            ];
            return _inf({
                resource: TransitPort,
                fields: gen_fields(_f),
                path: '/transit_port/',
                idField: 'id'
            });
        };

        var serviceContract = function () {
            var _f = [
                { name: 'number', description: 'Contract Number', required: true },
                { name: 'vendor', description: 'Vendor', required: true },
                { name: 'type', description: 'Type', required: true },
                { name: 'product_number', description: 'Product Number', required: true },
                { name: 'site_id', description: 'Site ID', required: true },
                { name: 'level', description: 'Level', required: true },
                { name: 'start', description: 'Start Date', required: true },
                { name: 'end', description: 'End Date', required: true }
            ];

            return _inf({
                resource: ServiceContract,
                path: '#/service_contract/',
                fields: gen_fields(_f)
            });
        };

        var celeryTask = function () {
            var _f = [
                { name: 'id', description: 'TASK ID' },
                { name: 'task_name', description: 'Task Name' },
                { name: 'state', description: 'State' },
                { name: 'elapsed', description: 'Seconds Elapsed' },
                {
                    name: 'start_time', description: 'Start Time',
                    opaque: 'arbitraryLink',
                    func: function (item) {
                        return $filter('date')(item.start_time, 'medium');
                    }
                },
                {
                    name: 'end_time', description: 'End Time',
                    opaque: 'arbitraryLink',
                    func: function (item) {
                        return $filter('date')(item.end_time, 'medium');
                    }
                }

            ];
            return _inf({
                resource: CeleryTask,
                path: '#/celery_task/',
                fields: gen_fields(_f)
            });
        };

        var celeryWorker = function () {
            var _f = [
                { name: 'name', description: 'Name' },
                { name: 'pid', description: 'PID' }
            ];
            return _inf({
                resource: CeleryWorker,
                path: '#/celery_worker/',
                fields: gen_fields(_f)
            });
        };

        var graphedPort = function () {
            var _f = [
                FieldProvider.gen_link_field(Switch, 'switch', 'id', SwitchFast, ['name']),
                { name: 'interface_name', description: 'Interface Name' },
                FieldProvider.customer_field('organization', 'Organization')
            ];
            return _inf({
                resource: GraphedPort,
                path: '#/graphed_port/',
                fields: gen_fields(_f)
            });
        };

        var tenable = function () {
            //Create choices for m2m field
            var org_choices = function () {
                var customers = [];
                OrganizationFast.query().$promise.then(function (success) {
                    angular.forEach(success.results, function (value, key) {
                        customers.push(value);
                    });
                    // Not able to return success.results to choices
                    // return success.results;
                });
                return customers;
            };

            var _f = [
                { name: 'name', description: 'Name' },
                { name: 'proxy_url', description: 'Proxy Hostname' },
                FieldProvider.proxy_url_field('proxy_fqdn'),
                { name: 'backend_url', description: 'Backend URL' },
                {
                    name: 'customers', description: 'Customer', required: true,
                    opaque: 'multiple',
                    subfield: 'name',
                    readArray: [],
                    idField: 'id',
                    uriPrefix: '#/organization/',
                    inputMethod: {
                        type: 'multiple',
                        choices: org_choices(),
                        // choices: [true, false],
                        displayProp: 'name',
                        idProp: 'id'
                    }
                }
            ];

            return _inf({
                resource: TenableSecurityCenter,
                path: '#/tenable/',
                idField: 'id',
                fields: gen_fields(_f)
            });
        };

        var vcenter = function () {
            //Create choices for m2m field
            var org_choices = function () {
                var customers = [];
                OrganizationFast.query().$promise.then(function (success) {
                    angular.forEach(success.results, function (value, key) {
                        customers.push(value);
                    });
                    // Not able to return success.results to choices
                    // return success.results;
                });
                return customers;
            };

            var _f = [
                { name: 'name', description: 'Name' },
                { name: 'proxy_url', description: 'Proxy Hostname' },
                FieldProvider.proxy_url_field('proxy_fqdn'),
                { name: 'backend_url', description: 'Backend URL' },
                {
                    name: 'customers', description: 'Customer', required: true,
                    opaque: 'multiple',
                    subfield: 'name',
                    readArray: [],
                    idField: 'id',
                    uriPrefix: '#/organization/',
                    inputMethod: {
                        type: 'multiple',
                        choices: org_choices(),
                        // choices: [true, false],
                        displayProp: 'name',
                        idProp: 'id'
                    }
                },
                {
                    name: 'account', description: 'vCenter API', required: true,
                    opaque: 'stringTransform',
                    subfield: 'hostname',
                    readArray: ['hostname'],
                    uriPrefix: '#/vmware-dashboard/',
                    idField: 'uuid',
                    inputMethod: {
                        type: 'typeahead',
                        invoker: function (val) {
                            return search(VMwareVcenter, val);
                        },
                        accessor: 'hostname'
                    }
                },
            ];

            return _inf({
                resource: VcenterProxy,
                path: '#/vmware-vcenter/',
                fields: gen_fields(_f)
            });
        };

        var esxi = function () {
            //Create choices for m2m field
            var org_choices = function () {
                var customers = [];
                OrganizationFast.query().$promise.then(function (success) {
                    angular.forEach(success.results, function (value, key) {
                        customers.push(value);
                    });
                    // Not able to return success.results to choices
                    // return success.results;
                });
                return customers;
            };

            var _f = [
                { name: 'name', description: 'Name' },
                {
                    name: 'server', description: 'Server', required: true,
                    // opaque: 'stringTransform',
                    opaque: 'link',
                    subfield: 'name',
                    readArray: ['name'],
                    uriPrefix: '#/server/',
                    idField: 'uuid',
                    inputMethod: {
                        type: 'typeahead',
                        invoker: function (val) {
                            return search(ServerFast, val);
                        },
                        accessor: 'name'
                    }
                },
                { name: 'proxy_url', description: 'Proxy Hostname' },
                FieldProvider.proxy_url_field('proxy_fqdn'),
                { name: 'backend_url', description: 'Backend URL' },
                {
                    name: 'customers', description: 'Customer', required: true,
                    opaque: 'multiple',
                    subfield: 'name',
                    readArray: [],
                    idField: 'id',
                    uriPrefix: '#/organization/',
                    inputMethod: {
                        type: 'multiple',
                        choices: org_choices(),
                        // choices: [true, false],
                        displayProp: 'name',
                        idProp: 'id'
                    }
                }
            ];

            return _inf({
                resource: EsxiProxy,
                path: '#/vmware-esxi/',
                fields: gen_fields(_f)
            });
        };

        var openstack_proxy = function () {
            //Create choices for m2m field
            var org_choices = function () {
                var customers = [];
                OrganizationFast.query().$promise.then(function (success) {
                    angular.forEach(success.results, function (value, key) {
                        customers.push(value);
                    });
                    // Not able to return success.results to choices
                    // return success.results;
                });
                return customers;
            };

            var _f = [
                { name: 'name', description: 'Name' },
                {
                    name: 'cloud', description: 'Cloud', required: true,
                    // opaque: 'stringTransform',
                    opaque: 'link',
                    subfield: 'name',
                    readArray: ['name'],
                    uriPrefix: '#/cloud/',
                    idField: 'uuid',
                    inputMethod: {
                        type: 'typeahead',
                        invoker: function (val) {
                            return search(PrivateCloudFast, val);
                        },
                        accessor: 'name'
                    }
                },
                { name: 'proxy_url', description: 'Proxy Hostname' },
                FieldProvider.proxy_url_field('proxy_fqdn'),
                { name: 'backend_url', description: 'Backend URL' },
                {
                    name: 'customers', description: 'Customer', required: true,
                    opaque: 'multiple',
                    subfield: 'name',
                    readArray: [],
                    idField: 'id',
                    uriPrefix: '#/organization/',
                    inputMethod: {
                        type: 'multiple',
                        choices: org_choices(),
                        // choices: [true, false],
                        displayProp: 'name',
                        idProp: 'id'
                    }
                }
            ];

            return _inf({
                resource: OpenstackProxy,
                path: '#/openstack-proxy/',
                fields: gen_fields(_f)
            });
        };

        var f5lb = function () {
            //Create choices for m2m field
            var org_choices = function () {
                var customers = [];
                OrganizationFast.query().$promise.then(function (success) {
                    angular.forEach(success.results, function (value, key) {
                        customers.push(value);
                    });
                    // Not able to return success.results to choices
                    // return success.results;
                });
                return customers;
            };

            var _f = [
                { name: 'name', description: 'Name' },
                {
                    name: 'load_balancer', description: 'Load Balancer', required: true,
                    // opaque: 'stringTransform',
                    opaque: 'link',
                    subfield: 'name',
                    readArray: ['name'],
                    uriPrefix: '#/loadbalancer/',
                    idField: 'uuid',
                    inputMethod: {
                        type: 'typeahead',
                        invoker: function (val) {
                            return search(LoadBalancer, val);
                        },
                        accessor: 'name'
                    }
                },
                { name: 'proxy_url', description: 'Proxy Hostname' },
                FieldProvider.proxy_url_field('proxy_fqdn'),
                { name: 'backend_url', description: 'Backend URL' },
                {
                    name: 'customers', description: 'Customer', required: true,
                    opaque: 'multiple',
                    subfield: 'name',
                    readArray: [],
                    idField: 'id',
                    uriPrefix: '#/organization/',
                    inputMethod: {
                        type: 'multiple',
                        choices: org_choices(),
                        // choices: [true, false],
                        displayProp: 'name',
                        idProp: 'id'
                    }
                }
            ];

            return _inf({
                resource: F5LoadBalancer,
                path: '#/f5-lb-proxy/',
                fields: gen_fields(_f)
            });
        };

        var cisco_firewall = function () {
            //Create choices for m2m field
            var org_choices = function () {
                var customers = [];
                OrganizationFast.query().$promise.then(function (success) {
                    angular.forEach(success.results, function (value, key) {
                        customers.push(value);
                    });
                    // Not able to return success.results to choices
                    // return success.results;
                });
                return customers;
            };

            var _f = [
                { name: 'name', description: 'Name' },
                {
                    name: 'firewall', description: 'Firewall', required: true,
                    // opaque: 'stringTransform',
                    opaque: 'link',
                    subfield: 'name',
                    readArray: ['name'],
                    uriPrefix: '#/loadbalancer/',
                    idField: 'uuid',
                    inputMethod: {
                        type: 'typeahead',
                        invoker: function (val) {
                            return search(Firewall, val);
                        },
                        accessor: 'name'
                    }
                },
                { name: 'proxy_url', description: 'Proxy Hostname' },
                FieldProvider.proxy_url_field('proxy_fqdn'),
                { name: 'backend_url', description: 'Backend URL' },
                {
                    name: 'customers', description: 'Customer', required: true,
                    opaque: 'multiple',
                    subfield: 'name',
                    readArray: [],
                    idField: 'id',
                    uriPrefix: '#/organization/',
                    inputMethod: {
                        type: 'multiple',
                        choices: org_choices(),
                        // choices: [true, false],
                        displayProp: 'name',
                        idProp: 'id'
                    }
                }
            ];

            return _inf({
                resource: CiscoFirewallProxy,
                path: '#/cisco-firewall/',
                fields: gen_fields(_f)
            });
        };

        var cisco_switch = function () {
            //Create choices for m2m field
            var org_choices = function () {
                var customers = [];
                OrganizationFast.query().$promise.then(function (success) {
                    angular.forEach(success.results, function (value, key) {
                        customers.push(value);
                    });
                    // Not able to return success.results to choices
                    // return success.results;
                });
                return customers;
            };

            var _f = [
                { name: 'name', description: 'Name' },
                {
                    name: 'switch', description: 'Switch', required: true,
                    // opaque: 'stringTransform',
                    opaque: 'link',
                    subfield: 'name',
                    readArray: ['name'],
                    uriPrefix: '#/switch/',
                    idField: 'uuid',
                    inputMethod: {
                        type: 'typeahead',
                        invoker: function (val) {
                            return search(SwitchFast, val);
                        },
                        accessor: 'name'
                    }
                },
                { name: 'proxy_url', description: 'Proxy Hostname' },
                FieldProvider.proxy_url_field('proxy_fqdn'),
                { name: 'backend_url', description: 'Backend URL' },
                {
                    name: 'customers', description: 'Customer', required: true,
                    opaque: 'multiple',
                    subfield: 'name',
                    readArray: [],
                    idField: 'id',
                    uriPrefix: '#/organization/',
                    inputMethod: {
                        type: 'multiple',
                        choices: org_choices(),
                        // choices: [true, false],
                        displayProp: 'name',
                        idProp: 'id'
                    }
                }
            ];

            return _inf({
                resource: CiscoSwitchProxy,
                path: '#/cisco-switch/',
                fields: gen_fields(_f)
            });
        };

        var citrix = function () {
            //Create choices for m2m field
            var org_choices = function () {
                var customers = [];
                OrganizationFast.query().$promise.then(function (success) {
                    angular.forEach(success.results, function (value, key) {
                        customers.push(value);
                    });
                    // Not able to return success.results to choices
                    // return success.results;
                });
                return customers;
            };

            var _f = [
                { name: 'name', description: 'Name' },
                {
                    name: 'load_balancer', description: 'Load Balancer', required: true,
                    // opaque: 'stringTransform',
                    opaque: 'link',
                    subfield: 'name',
                    readArray: ['name'],
                    uriPrefix: '#/loadbalancer/',
                    idField: 'uuid',
                    inputMethod: {
                        type: 'typeahead',
                        invoker: function (val) {
                            return search(LoadBalancer, val);
                        },
                        accessor: 'name'
                    }
                },
                { name: 'proxy_url', description: 'Proxy Hostname' },
                FieldProvider.proxy_url_field('proxy_fqdn'),
                { name: 'backend_url', description: 'Backend URL' },
                {
                    name: 'customers', description: 'Customer', required: true,
                    opaque: 'multiple',
                    subfield: 'name',
                    readArray: [],
                    idField: 'id',
                    uriPrefix: '#/organization/',
                    inputMethod: {
                        type: 'multiple',
                        choices: org_choices(),
                        // choices: [true, false],
                        displayProp: 'name',
                        idProp: 'id'
                    }
                }
            ];

            return _inf({
                resource: CitrixProxy,
                path: '#/citrix-vpx-device/',
                fields: gen_fields(_f)
            });
        };

        var juniper_switch = function () {
            //Create choices for m2m field
            var org_choices = function () {
                var customers = [];
                OrganizationFast.query().$promise.then(function (success) {
                    angular.forEach(success.results, function (value, key) {
                        customers.push(value);
                    });
                    // Not able to return success.results to choices
                    // return success.results;
                });
                return customers;
            };

            var _f = [
                { name: 'name', description: 'Name' },
                {
                    name: 'switch', description: 'Switch', required: true,
                    // opaque: 'stringTransform',
                    opaque: 'link',
                    subfield: 'name',
                    readArray: ['name'],
                    uriPrefix: '#/switch/',
                    idField: 'uuid',
                    inputMethod: {
                        type: 'typeahead',
                        invoker: function (val) {
                            return search(SwitchFast, val);
                        },
                        accessor: 'name'
                    }
                },
                { name: 'proxy_url', description: 'Proxy Hostname' },
                FieldProvider.proxy_url_field('proxy_fqdn'),
                { name: 'backend_url', description: 'Backend URL' },
                {
                    name: 'customers', description: 'Customer', required: true,
                    opaque: 'multiple',
                    subfield: 'name',
                    readArray: [],
                    idField: 'id',
                    uriPrefix: '#/organization/',
                    inputMethod: {
                        type: 'multiple',
                        choices: org_choices(),
                        // choices: [true, false],
                        displayProp: 'name',
                        idProp: 'id'
                    }
                }
            ];

            return _inf({
                resource: JuniperSwitchProxy,
                path: '#/juniper-switch/',
                fields: gen_fields(_f)
            });
        };

        var juniper_firewall = function () {
            //Create choices for m2m field
            var org_choices = function () {
                var customers = [];
                OrganizationFast.query().$promise.then(function (success) {
                    angular.forEach(success.results, function (value, key) {
                        customers.push(value);
                    });
                    // Not able to return success.results to choices
                    // return success.results;
                });
                return customers;
            };

            var _f = [
                { name: 'name', description: 'Name' },
                {
                    name: 'firewall', description: 'Firewall', required: true,
                    // opaque: 'stringTransform',
                    opaque: 'link',
                    subfield: 'name',
                    readArray: ['name'],
                    uriPrefix: '#/firewall/',
                    idField: 'uuid',
                    inputMethod: {
                        type: 'typeahead',
                        invoker: function (val) {
                            return search(Firewall, val);
                        },
                        accessor: 'name'
                    }
                },
                { name: 'proxy_url', description: 'Proxy Hostname' },
                FieldProvider.proxy_url_field('proxy_fqdn'),
                { name: 'backend_url', description: 'Backend URL' },
                {
                    name: 'customers', description: 'Customer', required: true,
                    opaque: 'multiple',
                    subfield: 'name',
                    readArray: [],
                    idField: 'id',
                    uriPrefix: '#/organization/',
                    inputMethod: {
                        type: 'multiple',
                        choices: org_choices(),
                        // choices: [true, false],
                        displayProp: 'name',
                        idProp: 'id'
                    }
                }
            ];

            return _inf({
                resource: JuniperFirewallProxy,
                path: '#/juniper-firewall/',
                fields: gen_fields(_f)
            });
        };


        var observium_instance = function () {
            var m2m_choices = function (resourceClass) {
                var result = [];
                resourceClass.query().$promise.then(function (success) {
                    angular.forEach(success.results, function (value, key) {
                        result.push(value);
                    });
                    // Not able to return success.results to choices
                    // return success.results;
                });
                return result;
            };


            var _f = [
                { name: 'account_name', description: 'Observium Account Name', required: true },
                { name: 'hostname', description: 'Observium Hostname', required: true },
                { name: 'username', description: 'Observium Username', required: true },
                {
                    name: 'password', description: 'Observium Password', required: true, hide: true,
                    hide_on_edit: true,
                    inputMethod: {
                        type: 'password'
                    }
                },
                {
                    name: 'is_provider', description: 'Is Default ?',
                    inputMethod: {
                        type: 'choices',
                        choices: [false, true]
                    }
                },
                {
                    name: 'customers', description: 'Customers',
                    opaque: 'multiple',
                    subfield: 'name',
                    readArray: [],
                    idField: 'id',
                    inputMethod: {
                        type: 'multiple',
                        choices: m2m_choices(Organization),
                        // choices: [true, false],
                        displayProp: 'name',
                        idProp: 'id'
                    }
                },
            ];

            return _inf({
                resource: ObserviumInstance,
                path: '#/observium/instance/',
                idField: 'id',
                fields: gen_fields(_f)
            });
        };


        var observium_server = function () {
            var _f = [
                {
                    name: 'observium_instance', description: 'Observium Instance', required: true,
                    opaque: 'stringTransform',
                    subfield: 'account_name',
                    readArray: ['account_name'],
                    uriPrefix: '#/observium/instance',
                    idField: 'uuid',
                    inputMethod: {
                        type: 'typeahead',
                        invoker: function (val) {
                            return search(ObserviumInstance, val);
                        },
                        accessor: 'account_name'
                    }
                },
                { name: 'device_id', description: 'Observium Device ID' },
                {
                    name: 'server', description: 'Server', required: true,
                    // opaque: 'stringTransform',
                    opaque: 'link',
                    subfield: 'name',
                    readArray: ['name'],
                    uriPrefix: '#/server/',
                    idField: 'uuid',
                    inputMethod: {
                        type: 'typeahead',
                        invoker: function (val) {
                            return search(ServerFast, val);
                        },
                        accessor: 'display_name'
                    }
                }
            ];

            return _inf({
                resource: ObserviumServer,
                path: '#/observium/server_map/',
                idField: 'id',
                fields: gen_fields(_f)
            });
        };


        var observium_switch = function () {
            var _f = [
                {
                    name: 'observium_instance', description: 'Observium Instance', required: true,
                    opaque: 'stringTransform',
                    subfield: 'account_name',
                    readArray: ['account_name'],
                    uriPrefix: '#/observium/instance',
                    idField: 'uuid',
                    inputMethod: {
                        type: 'typeahead',
                        invoker: function (val) {
                            return search(ObserviumInstance, val);
                        },
                        accessor: 'account_name'
                    }
                },
                { name: 'device_id', description: 'Observium Device ID' },
                {
                    name: 'switch', description: 'Switch', required: true,
                    opaque: 'stringTransform',
                    // opaque: 'link',
                    subfield: 'name',
                    readArray: ['name'],
                    uriPrefix: '#/switch/',
                    idField: 'uuid',
                    inputMethod: {
                        type: 'typeahead',
                        invoker: function (val) {
                            return custom_search(SwitchFast, val, 'is_shared', false);
                        },
                        accessor: 'display_name'
                    }
                }
            ];

            return _inf({
                resource: ObserviumSwitch,
                path: '#/observium/switch_map/',
                idField: 'id',
                fields: gen_fields(_f)
            });
        };


        var observium_firewall = function () {
            var _f = [
                {
                    name: 'observium_instance', description: 'Observium Instance', required: true,
                    opaque: 'stringTransform',
                    subfield: 'account_name',
                    readArray: ['account_name'],
                    uriPrefix: '#/observium/instance',
                    idField: 'uuid',
                    inputMethod: {
                        type: 'typeahead',
                        invoker: function (val) {
                            return search(ObserviumInstance, val);
                        },
                        accessor: 'account_name'
                    }
                },
                { name: 'device_id', description: 'Observium Device ID' },
                {
                    name: 'firewall', description: 'firewall', required: true,
                    opaque: 'stringTransform',
                    // opaque: 'link',
                    another: 'observium_instance',
                    subfield: 'name',
                    readArray: ['name'],
                    uriPrefix: '#/firewall/',
                    idField: 'uuid',
                    inputMethod: {
                        type: 'typeahead',
                        invoker: function (val, obj) {
                            // console.log("Observium Instance :"+angular.toJson(obj));
                            return custom_search(FirewallFast, val, 'is_shared', false);
                        },
                        accessor: 'display_name'
                    }
                }
            ];

            return _inf({
                resource: ObserviumFirewall,
                path: '#/observium/firewall_map/',
                idField: 'id',
                fields: gen_fields(_f)
            });
        };


        var observium_loadbalancer = function () {
            var _f = [
                {
                    name: 'observium_instance', description: 'Observium Instance', required: true,
                    opaque: 'stringTransform',
                    subfield: 'account_name',
                    readArray: ['account_name'],
                    uriPrefix: '#/observium/instance',
                    idField: 'uuid',
                    inputMethod: {
                        type: 'typeahead',
                        invoker: function (val) {
                            return search(ObserviumInstance, val);
                        },
                        accessor: 'account_name'
                    }
                },
                { name: 'device_id', description: 'Observium Device ID' },
                {
                    name: 'load_balancer', description: 'LoadBalancer', required: true,
                    opaque: 'stringTransform',
                    // opaque: 'link',
                    subfield: 'name',
                    readArray: ['name'],
                    uriPrefix: '#/loadbalancer/',
                    idField: 'uuid',
                    inputMethod: {
                        type: 'typeahead',
                        invoker: function (val) {
                            return custom_search(LoadBalancerFast, val, 'is_shared', false);
                        },
                        accessor: 'display_name'
                    }
                }
            ];

            return _inf({
                resource: ObserviumLoadBalancer,
                path: '#/observium/loadbalancer_map/',
                idField: 'id',
                fields: gen_fields(_f)
            });
        };


        var observium_pdu = function () {
            var _f = [
                {
                    name: 'observium_instance', description: 'Observium Instance', required: true,
                    opaque: 'stringTransform',
                    subfield: 'account_name',
                    readArray: ['account_name'],
                    uriPrefix: '#/observium/instance',
                    idField: 'uuid',
                    inputMethod: {
                        type: 'typeahead',
                        invoker: function (val) {
                            return search(ObserviumInstance, val);
                        },
                        accessor: 'account_name'
                    }
                },
                { name: 'device_id', description: 'Observium Device ID' },
                {
                    name: 'pdu', description: 'PDU', required: true,
                    opaque: 'stringTransform',
                    // opaque: 'link',
                    subfield: 'hostname',
                    readArray: ['hostname'],
                    uriPrefix: '#/pdu/',
                    idField: 'uuid',
                    inputMethod: {
                        type: 'typeahead',
                        invoker: function (val) {
                            return search(PDUFast, val);
                        },
                        accessor: 'display_name'
                    }
                }
            ];

            return _inf({
                resource: ObserviumPDU,
                path: '#/observium/pdu_map/',
                idField: 'id',
                fields: gen_fields(_f)
            });
        };

        var observium_aws_instance = function () {
            var _f = [
                {
                    name: 'observium_instance', description: 'Observium Instance', required: true,
                    opaque: 'stringTransform',
                    subfield: 'account_name',
                    readArray: ['account_name'],
                    uriPrefix: '#/observium/instance',
                    idField: 'uuid',
                    inputMethod: {
                        type: 'typeahead',
                        invoker: function (val) {
                            return search(ObserviumInstance, val);
                        },
                        accessor: 'account_name'
                    }
                },
                { name: 'device_id', description: 'Observium Device ID' },
                {
                    name: 'instance', description: 'AWS Instance', required: true,
                    opaque: 'stringTransform',
                    // opaque: 'link',
                    subfield: 'instance_id',
                    readArray: ['instance_id'],
                    // uriPrefix: '#/aws_instance/',
                    idField: 'uuid',
                    inputMethod: {
                        type: 'typeahead',
                        invoker: function (val) {
                            return search(AWSInstanceFast, val);
                        },
                        accessor: 'display_name'
                    }
                }
            ];

            return _inf({
                resource: ObserviumAWSInstance,
                path: '#/observium/aws_instance_map/',
                idField: 'id',
                fields: gen_fields(_f)
            });
        };

        var observium_vmware_vm = function () {
            var _f = [
                {
                    name: 'observium_instance', description: 'Observium Instance', required: true,
                    opaque: 'stringTransform',
                    subfield: 'account_name',
                    readArray: ['account_name'],
                    uriPrefix: '#/observium/instance',
                    idField: 'uuid',
                    inputMethod: {
                        type: 'typeahead',
                        invoker: function (val) {
                            return search(ObserviumInstance, val);
                        },
                        accessor: 'account_name'
                    }
                },
                { name: 'device_id', description: 'Observium Device ID' },
                {
                    name: 'instance', description: 'VMware VirtualMachine', required: true,
                    opaque: 'stringTransform',
                    // opaque: 'link',
                    subfield: 'name',
                    readArray: ['name'],
                    // uriPrefix: '#/vmware_vm/',
                    idField: 'uuid',
                    inputMethod: {
                        type: 'typeahead',
                        invoker: function (val) {
                            return search(VMwareVMFast, val);
                        },
                        accessor: 'display_name'
                    }
                }
            ];

            return _inf({
                resource: ObserviumVMwareVM,
                path: '#/observium/vmware_vm_map/',
                idField: 'id',
                fields: gen_fields(_f)
            });
        };


        var observium_openstack_vm = function () {
            var _f = [
                {
                    name: 'observium_instance', description: 'Observium Instance', required: true,
                    opaque: 'stringTransform',
                    subfield: 'account_name',
                    readArray: ['account_name'],
                    uriPrefix: '#/observium/instance',
                    idField: 'uuid',
                    inputMethod: {
                        type: 'typeahead',
                        invoker: function (val) {
                            return search(ObserviumInstance, val);
                        },
                        accessor: 'account_name'
                    }
                },
                { name: 'device_id', description: 'Observium Device ID' },
                {
                    name: 'instance', description: 'OpenStack VirtualMachine', required: true,
                    opaque: 'stringTransform',
                    // opaque: 'link',
                    subfield: 'name',
                    readArray: ['name'],
                    // uriPrefix: '#/openstack_vm/',
                    idField: 'uuid',
                    inputMethod: {
                        type: 'typeahead',
                        invoker: function (val) {
                            return search(OpenStackVMFast, val);
                        },
                        accessor: 'display_name'
                    }
                }
            ];

            return _inf({
                resource: ObserviumOpenStackVM,
                path: '#/observium/openstack_vm_map/',
                idField: 'id',
                fields: gen_fields(_f)
            });
        };

        var observium_custom_cloud_vm = function () {
            var _f = [
                {
                    name: 'observium_instance', description: 'Observium Instance', required: true,
                    opaque: 'stringTransform',
                    subfield: 'account_name',
                    readArray: ['account_name'],
                    uriPrefix: '#/observium/instance',
                    idField: 'uuid',
                    inputMethod: {
                        type: 'typeahead',
                        invoker: function (val) {
                            return search(ObserviumInstance, val);
                        },
                        accessor: 'account_name'
                    }
                },
                { name: 'device_id', description: 'Observium Device ID' },
                {
                    name: 'instance', description: 'Custom Cloud VirtualMachine', required: true,
                    opaque: 'stringTransform',
                    // opaque: 'link',
                    subfield: 'name',
                    readArray: ['name'],
                    // uriPrefix: '#/openstack_vm/',
                    idField: 'uuid',
                    inputMethod: {
                        type: 'typeahead',
                        invoker: function (val) {
                            return search(VirtualMachine, val);
                        },
                        accessor: 'display_name'
                    }
                }
            ];

            return _inf({
                resource: ObserviumCustomCloudVM,
                path: '#/observium/custom_cloud_vm_map/',
                idField: 'id',
                fields: gen_fields(_f)
            });
        };

        var observium_vcloud_vm = function () {
            var _f = [
                {
                    name: 'observium_instance', description: 'Observium Instance', required: true,
                    opaque: 'stringTransform',
                    subfield: 'account_name',
                    readArray: ['account_name'],
                    uriPrefix: '#/observium/instance',
                    idField: 'uuid',
                    inputMethod: {
                        type: 'typeahead',
                        invoker: function (val) {
                            return search(ObserviumInstance, val);
                        },
                        accessor: 'account_name'
                    }
                },
                { name: 'device_id', description: 'Observium Device ID' },
                {
                    name: 'instance', description: 'Vcloud VirtualMachine', required: true,
                    opaque: 'stringTransform',
                    // opaque: 'link',
                    subfield: 'name',
                    readArray: ['name'],
                    // uriPrefix: '#/vmware_vm/',
                    idField: 'uuid',
                    inputMethod: {
                        type: 'typeahead',
                        invoker: function (val) {
                            return search(VCloudVMFast, val);
                        },
                        accessor: 'display_name'
                    }
                }
            ];

            return _inf({
                resource: ObserviumVCloudVM,
                path: '#/observium/vcloud_vm_map/',
                idField: 'id',
                fields: gen_fields(_f)
            });
        };

        var observium_esxi_vm = function () {
            var _f = [
                {
                    name: 'observium_instance', description: 'Observium Instance', required: true,
                    opaque: 'stringTransform',
                    subfield: 'account_name',
                    readArray: ['account_name'],
                    uriPrefix: '#/observium/instance',
                    idField: 'uuid',
                    inputMethod: {
                        type: 'typeahead',
                        invoker: function (val) {
                            return search(ObserviumInstance, val);
                        },
                        accessor: 'account_name'
                    }
                },
                { name: 'device_id', description: 'Observium Device ID' },
                {
                    name: 'instance', description: 'ESXI VirtualMachine', required: true,
                    opaque: 'stringTransform',
                    // opaque: 'link',
                    subfield: 'name',
                    readArray: ['name'],
                    // uriPrefix: '#/vmware_vm/',
                    idField: 'uuid',
                    inputMethod: {
                        type: 'typeahead',
                        invoker: function (val) {
                            return search(ESXIVMFast, val);
                        },
                        accessor: 'display_name'
                    }
                }
            ];

            return _inf({
                resource: ObserviumESXIVM,
                path: '#/observium/esxi_vm_map/',
                idField: 'id',
                fields: gen_fields(_f)
            });
        };

        var observium_hyperv_vm = function () {
            var _f = [
                {
                    name: 'observium_instance', description: 'Observium Instance', required: true,
                    opaque: 'stringTransform',
                    subfield: 'account_name',
                    readArray: ['account_name'],
                    uriPrefix: '#/observium/instance',
                    idField: 'uuid',
                    inputMethod: {
                        type: 'typeahead',
                        invoker: function (val) {
                            return search(ObserviumInstance, val);
                        },
                        accessor: 'account_name'
                    }
                },
                { name: 'device_id', description: 'Observium Device ID' },
                {
                    name: 'instance', description: 'HyperV VirtualMachine', required: true,
                    opaque: 'stringTransform',
                    // opaque: 'link',
                    subfield: 'vm_name',
                    readArray: ['vm_name'],
                    // uriPrefix: '#/vmware_vm/',
                    idField: 'uuid',
                    inputMethod: {
                        type: 'typeahead',
                        invoker: function (val) {
                            return search(HyperVVMFast, val);
                        },
                        accessor: 'display_name'
                    }
                }
            ];

            return _inf({
                resource: ObserviumHyperVVM,
                path: '#/observium/hyperv_vm_map/',
                idField: 'id',
                fields: gen_fields(_f)
            });
        };

        var observium_proxmox_vm = function () {
            var _f = [
                {
                    name: 'observium_instance', description: 'Observium Instance', required: true,
                    opaque: 'stringTransform',
                    subfield: 'account_name',
                    readArray: ['account_name'],
                    uriPrefix: '#/observium/instance',
                    idField: 'uuid',
                    inputMethod: {
                        type: 'typeahead',
                        invoker: function (val) {
                            return search(ObserviumInstance, val);
                        },
                        accessor: 'account_name'
                    }
                },
                { name: 'device_id', description: 'Observium Device ID' },
                {
                    name: 'instance', description: 'Proxmox VirtualMachine', required: true,
                    opaque: 'stringTransform',
                    // opaque: 'link',
                    subfield: 'name',
                    readArray: ['name'],
                    // uriPrefix: '#/vmware_vm/',
                    idField: 'uuid',
                    inputMethod: {
                        type: 'typeahead',
                        invoker: function (val) {
                            return search(ProxmoxVM, val);
                        },
                        accessor: 'display_name'
                    }
                }
            ];

            return _inf({
                resource: ObserviumProxmoxVM,
                path: '#/observium/proxmox_vm_map/',
                idField: 'id',
                fields: gen_fields(_f)
            });
        };

        var observium_g3kvm_vm = function () {
            var _f = [
                {
                    name: 'observium_instance', description: 'Observium Instance', required: true,
                    opaque: 'stringTransform',
                    subfield: 'account_name',
                    readArray: ['account_name'],
                    uriPrefix: '#/observium/instance',
                    idField: 'uuid',
                    inputMethod: {
                        type: 'typeahead',
                        invoker: function (val) {
                            return search(ObserviumInstance, val);
                        },
                        accessor: 'account_name'
                    }
                },
                { name: 'device_id', description: 'Observium Device ID' },
                {
                    name: 'instance', description: 'G3 KVM VirtualMachine', required: true,
                    opaque: 'stringTransform',
                    // opaque: 'link',
                    subfield: 'name',
                    readArray: ['name'],
                    // uriPrefix: '#/vmware_vm/',
                    idField: 'uuid',
                    inputMethod: {
                        type: 'typeahead',
                        invoker: function (val) {
                            return search(G3KVM, val);
                        },
                        accessor: 'display_name'
                    }
                }
            ];

            return _inf({
                resource: ObserviumG3KVMVM,
                path: '#/observium/g3kvm_vm_map/',
                idField: 'id',
                fields: gen_fields(_f)
            });
        };

        var observium_storage = function () {
            var _f = [
                {
                    name: 'observium_instance', description: 'Observium Instance', required: true,
                    opaque: 'stringTransform',
                    subfield: 'account_name',
                    readArray: ['account_name'],
                    uriPrefix: '#/observium/instance',
                    idField: 'uuid',
                    inputMethod: {
                        type: 'typeahead',
                        invoker: function (val) {
                            return search(ObserviumInstance, val);
                        },
                        accessor: 'account_name'
                    }
                },
                { name: 'device_id', description: 'Observium Device ID' },
                {
                    name: 'storage_device', description: 'Storage', required: true,
                    opaque: 'stringTransform',
                    // opaque: 'link',
                    subfield: 'name',
                    readArray: ['name'],
                    uriPrefix: '#/storagedevice/',
                    idField: 'uuid',
                    inputMethod: {
                        type: 'typeahead',
                        invoker: function (val) {
                            return custom_search(StorageFast, val);
                        },
                        accessor: 'display_name'
                    }
                }
            ];

            return _inf({
                resource: ObserviumStorage,
                path: '#/observium/storage_map/',
                idField: 'id',
                fields: gen_fields(_f)
            });
        };


        var observium_mac_device = function () {
            var _f = [
                {
                    name: 'observium_instance', description: 'Observium Instance', required: true,
                    opaque: 'stringTransform',
                    subfield: 'account_name',
                    readArray: ['account_name'],
                    uriPrefix: '#/observium/instance',
                    idField: 'uuid',
                    inputMethod: {
                        type: 'typeahead',
                        invoker: function (val) {
                            return search(ObserviumInstance, val);
                        },
                        accessor: 'account_name'
                    }
                },
                { name: 'device_id', description: 'Observium Device ID' },
                {
                    name: 'mac_device', description: 'Mac Device', required: true,
                    opaque: 'stringTransform',
                    // opaque: 'link',
                    subfield: 'name',
                    readArray: ['name'],
                    uriPrefix: '#/macdevice/',
                    idField: 'uuid',
                    inputMethod: {
                        type: 'typeahead',
                        invoker: function (val) {
                            return search(MacDeviceFast, val);
                        },
                        accessor: 'display_name'
                    }
                }
            ];

            return _inf({
                resource: ObserviumMacDevice,
                path: '#/observium/macdevice_map/',
                idField: 'id',
                fields: gen_fields(_f)
            });
        };


        var observium_billing = function () {
            var _f = [
                {
                    name: 'observium_instance', description: 'Observium Instance', required: true,
                    opaque: 'stringTransform',
                    subfield: 'account_name',
                    readArray: ['account_name'],
                    uriPrefix: '#/observium/instance',
                    idField: 'uuid',
                    inputMethod: {
                        type: 'typeahead',
                        invoker: function (val) {
                            return search(ObserviumInstance, val);
                        },
                        accessor: 'account_name'
                    }
                },
                { name: 'billing_id', description: 'Observium Bill ID' },
                FieldProvider.customer_field('customer', 'Customer'),
                { name: 'bill_rate', description: 'Bill Rate' },
            ];

            return _inf({
                resource: ObserviumBilling,
                path: '#/observium/billing_map/',
                idField: 'id',
                fields: gen_fields(_f)
            });
        };

        var zabbix_instance = function () {
            var m2m_choices = function (resourceClass) {
                var result = [];
                resourceClass.query().$promise.then(function (success) {
                    angular.forEach(success.results, function (value, key) {
                        result.push(value);
                    });
                });
                return result;
            };


            var _f = [
                { name: 'account_name', description: 'Account Name', required: true },
                { name: 'hostname', description: 'Hostname', required: true },
                { name: 'username', description: 'Username', required: true },
                {
                    name: 'password', description: 'Password', required: true, hide: true,
                    hide_on_edit: true,
                    inputMethod: {
                        type: 'password'
                    }
                },
                // {
                //     name: 'customers', description: 'Customers', required: true,
                //     opaque: 'multiple',
                //     subfield: 'name',
                //     readArray: [],
                //     idField: 'id',
                //     inputMethod: {
                //         type: 'multiple',
                //         choices: m2m_choices(Organization),
                //         displayProp: 'name',
                //         idProp: 'id'
                //     }
                // },
                { name: 'version', description: 'Version', required: true },
            ];

            return _inf({
                resource: ZabbixInstance,
                path: '#/zabbix/instance/',
                idField: 'id',
                fields: gen_fields(_f)
            });
        };

        var zabbix_customer_instance_map = function () {
            var m2m_choices = function (resourceClass) {
                var result = [];
                resourceClass.query().$promise.then(function (success) {
                    angular.forEach(success.results, function (value, key) {
                        result.push(value);
                    });
                });
                return result;
            };

            var _f = [
                FieldProvider.customer_field('customer', 'Customer'),
                FieldProvider.zabbix_instance_field(),
                // FieldProvider.obj_arr_choice_field('zabbix_instance', 'Zabbix Instance', m2m_choices(ZabbixInstance), 'account_name', '#/zabbix/instance/'),
                // {
                //     name: 'account_name', description: 'Instance', required: true,
                //     opaque: 'stringTransform',
                //     subfield: 'zabbix_instance',
                //     readArray: ['account_name'],
                //     uriPrefix: '#/zabbix/instance',
                //     idField: 'id',
                //     inputMethod: {
                //         type: 'typeahead',
                //         invoker: function (val) {
                //             return search(ZabbixInstance, val);
                //         },
                //         accessor: 'account_name'
                //     }
                // },
            ];

            return _inf({
                resource: ZabbixCustomer,
                path: '#/zabbix/zabbix_customers/',
                idField: 'id',
                fields: gen_fields(_f)
            });
        };

        var zabbix_switch_map = function () {
            var m2m_choices = function (resourceClass) {
                var result = [];
                resourceClass.query().$promise.then(function (success) {
                    angular.forEach(success.results, function (value, key) {
                        value.template_name = value.zabbix_instance ? value.zabbix_instance.account_name + " - " + value.template_name : value.template_name;
                        result.push(value);
                    });
                });
                return result;
            };
            var _f = [
                {
                    name: 'zabbix_customer', description: 'Customer/Instance', required: true,
                    opaque: 'stringTransform',
                    subfield: 'customer_zabbix_name',
                    readArray: ['customer_zabbix_name'],
                    uriPrefix: '#/zabbix/zabbix_customers',
                    idField: 'uuid',
                    inputMethod: {
                        type: 'typeahead',
                        invoker: function (val) {
                            return zabbix_instance_search(ZabbixCustomer, val);
                        },
                        accessor: 'customer_zabbix_name'
                    }
                },
                {
                    name: 'switch', description: 'Switch', required: true,
                    opaque: 'stringTransform',
                    subfield: 'name',
                    readArray: ['name'],
                    uriPrefix: '#/switch/',
                    idField: 'uuid',
                    inputMethod: {
                        type: 'typeahead',
                        invoker: function (val) {
                            return custom_search(SwitchFast, val, 'is_shared', false);
                        },
                        accessor: 'display_name'
                    }
                },
                { name: "host_id", description: "Host Id", required: true },
                {
                    name: 'templates', description: 'Templates', hide: true,
                    opaque: 'multiple',
                    subfield: 'template_name',
                    readArray: [],
                    idField: 'template_id',
                    inputMethod: {
                        type: 'multiple',
                        choices: m2m_choices(ZabbixTemplates),
                        displayProp: 'template_name',
                        idProp: 'template_id'
                    }
                },
            ];

            return _inf({
                resource: ZabbixSwitch,
                path: '#/zabbix/switch/',
                idField: 'id',
                fields: gen_fields(_f)
            });
        };

        var zabbix_firewall_map = function () {
            var m2m_choices = function (resourceClass) {
                var result = [];
                resourceClass.query().$promise.then(function (success) {
                    angular.forEach(success.results, function (value, key) {
                        result.push(value);
                    });
                });
                return result;
            };
            var _f = [
                {
                    name: 'zabbix_customer', description: 'Customer/Instance', required: true,
                    opaque: 'stringTransform',
                    subfield: 'customer_zabbix_name',
                    readArray: ['customer_zabbix_name'],
                    uriPrefix: '#/zabbix/zabbix_customers',
                    idField: 'uuid',
                    inputMethod: {
                        type: 'typeahead',
                        invoker: function (val) {
                            return zabbix_instance_search(ZabbixCustomer, val);
                        },
                        accessor: 'customer_zabbix_name'
                    }
                },
                {
                    name: 'firewall', description: 'Firewall', required: true,
                    opaque: 'stringTransform',
                    // opaque: 'link',
                    subfield: 'name',
                    readArray: ['name'],
                    uriPrefix: '#/firewall/',
                    idField: 'uuid',
                    inputMethod: {
                        type: 'typeahead',
                        invoker: function (val) {
                            return custom_search(FirewallFast, val, 'is_shared', false);
                        },
                        accessor: 'display_name'
                    }
                },
                { name: "host_id", description: "Host Id", required: true },
                {
                    name: 'templates', description: 'Templates', hide: true,
                    opaque: 'multiple',
                    subfield: 'template_name',
                    readArray: [],
                    idField: 'template_id',
                    inputMethod: {
                        type: 'multiple',
                        choices: m2m_choices(ZabbixTemplates),
                        displayProp: 'template_name',
                        idProp: 'template_id'
                    }
                },
            ];

            return _inf({
                resource: ZabbixFirewall,
                path: '#/zabbix/firewall/',
                idField: 'id',
                fields: gen_fields(_f)
            });
        };

        var zabbix_lb_map = function () {
            var m2m_choices = function (resourceClass) {
                var result = [];
                resourceClass.query().$promise.then(function (success) {
                    angular.forEach(success.results, function (value, key) {
                        result.push(value);
                    });
                });
                return result;
            };
            var _f = [
                {
                    name: 'zabbix_customer', description: 'Customer/Instance', required: true,
                    opaque: 'stringTransform',
                    subfield: 'customer_zabbix_name',
                    readArray: ['customer_zabbix_name'],
                    uriPrefix: '#/zabbix/zabbix_customers',
                    idField: 'uuid',
                    inputMethod: {
                        type: 'typeahead',
                        invoker: function (val) {
                            return zabbix_instance_search(ZabbixCustomer, val);
                        },
                        accessor: 'customer_zabbix_name'
                    }
                },
                {
                    name: 'loadbalancer', description: 'Loadbalancer', required: true,
                    opaque: 'stringTransform',
                    // opaque: 'link',
                    subfield: 'name',
                    readArray: ['name'],
                    uriPrefix: '#/loadbalancer/',
                    idField: 'uuid',
                    inputMethod: {
                        type: 'typeahead',
                        invoker: function (val) {
                            return custom_search(LoadBalancerFast, val, 'is_shared', false);
                        },
                        accessor: 'display_name'
                    }
                },
                { name: "host_id", description: "Host Id", required: true },
                {
                    name: 'templates', description: 'Templates', hide: true,
                    opaque: 'multiple',
                    subfield: 'template_name',
                    readArray: [],
                    idField: 'template_id',
                    inputMethod: {
                        type: 'multiple',
                        choices: m2m_choices(ZabbixTemplates),
                        displayProp: 'template_name',
                        idProp: 'template_id'
                    }
                },
            ];

            return _inf({
                resource: ZabbixLoadbalancer,
                path: '#/zabbix/loadbalancer/',
                idField: 'id',
                fields: gen_fields(_f)
            });
        };

        var zabbix_server_map = function () {
            var m2m_choices = function (resourceClass) {
                var result = [];
                resourceClass.query().$promise.then(function (success) {
                    angular.forEach(success.results, function (value, key) {
                        result.push(value);
                    });
                });
                return result;
            };
            var _f = [
                {
                    name: 'zabbix_customer', description: 'Customer/Instance', required: true,
                    opaque: 'stringTransform',
                    subfield: 'customer_zabbix_name',
                    readArray: ['customer_zabbix_name'],
                    uriPrefix: '#/zabbix/zabbix_customers',
                    idField: 'uuid',
                    inputMethod: {
                        type: 'typeahead',
                        invoker: function (val) {
                            return zabbix_instance_search(ZabbixCustomer, val);
                        },
                        accessor: 'customer_zabbix_name'
                    }
                },
                {
                    name: 'server', description: 'Server', required: true,
                    // opaque: 'stringTransform',
                    opaque: 'link',
                    subfield: 'name',
                    readArray: ['name'],
                    uriPrefix: '#/server/',
                    idField: 'uuid',
                    inputMethod: {
                        type: 'typeahead',
                        invoker: function (val) {
                            return search(ServerFast, val);
                        },
                        accessor: 'display_name'
                    }
                },
                { name: "host_id", description: "Host Id", required: true },
                {
                    name: 'templates', description: 'Templates', hide: true,
                    opaque: 'multiple',
                    subfield: 'template_name',
                    readArray: [],
                    idField: 'template_id',
                    inputMethod: {
                        type: 'multiple',
                        choices: m2m_choices(ZabbixTemplates),
                        displayProp: 'template_name',
                        idProp: 'template_id'
                    }
                },
            ];

            return _inf({
                resource: ZabbixServer,
                path: '#/zabbix/server/',
                idField: 'id',
                fields: gen_fields(_f)
            });
        };

        var zabbix_database_server = function () {
            var m2m_choices = function (resourceClass) {
                var result = [];
                resourceClass.query().$promise.then(function (success) {
                    angular.forEach(success.results, function (value, key) {
                        result.push(value);
                    });
                });
                return result;
            };
            var _f = [
                {
                    name: 'zabbix_customer', description: 'Customer/Instance', required: true,
                    opaque: 'stringTransform',
                    subfield: 'customer_zabbix_name',
                    readArray: ['customer_zabbix_name'],
                    uriPrefix: '#/zabbix/zabbix_customers',
                    idField: 'uuid',
                    inputMethod: {
                        type: 'typeahead',
                        invoker: function (val) {
                            return zabbix_instance_search(ZabbixCustomer, val);
                        },
                        accessor: 'customer_zabbix_name'
                    }
                },
                {
                    name: 'database_server', description: 'Database Server', required: true,
                    opaque: 'stringTransform',
                    subfield: 'db_instance_name',
                    readArray: ['db_instance_name'],
                    uriPrefix: '#/databaseserver/',
                    idField: 'uuid',
                    inputMethod: {
                        type: 'typeahead',
                        invoker: function (val) {
                            return search(DatabaseServerFast, val);
                        },
                        accessor: 'display_name'
                    }
                },
                { name: "host_id", description: "Host Id", required: true },
                {
                    name: 'templates', description: 'Templates', hide: true,
                    opaque: 'multiple',
                    subfield: 'template_name',
                    readArray: [],
                    idField: 'template_id',
                    inputMethod: {
                        type: 'multiple',
                        choices: m2m_choices(ZabbixTemplates),
                        displayProp: 'template_name',
                        idProp: 'template_id'
                    }
                },
            ];

            return _inf({
                resource: ZabbixDatabaseServer,
                path: '#/zabbix/databaseserver/',
                idField: 'id',
                fields: gen_fields(_f)
            });
        };

        var zabbix_storage = function () {
            var m2m_choices = function (resourceClass) {
                var result = [];
                resourceClass.query().$promise.then(function (success) {
                    angular.forEach(success.results, function (value, key) {
                        result.push(value);
                    });
                });
                return result;
            };
            var _f = [
                {
                    name: 'zabbix_customer', description: 'Customer/Instance', required: true,
                    opaque: 'stringTransform',
                    subfield: 'customer_zabbix_name',
                    readArray: ['customer_zabbix_name'],
                    uriPrefix: '#/zabbix/zabbix_customers',
                    idField: 'uuid',
                    inputMethod: {
                        type: 'typeahead',
                        invoker: function (val) {
                            return zabbix_instance_search(ZabbixCustomer, val);
                        },
                        accessor: 'customer_zabbix_name'
                    }
                },
                {
                    name: 'storagedevice', description: 'Storage', required: true,
                    opaque: 'stringTransform',
                    subfield: 'name',
                    readArray: ['name'],
                    uriPrefix: '#/storagedevice/',
                    idField: 'uuid',
                    inputMethod: {
                        type: 'typeahead',
                        invoker: function (val) {
                            return search(StorageFast, val);
                        },
                        accessor: 'display_name'
                    }
                },
                { name: "host_id", description: "Host Id", required: true },
                {
                    name: 'templates', description: 'Templates', hide: true,
                    opaque: 'multiple',
                    subfield: 'template_name',
                    readArray: [],
                    idField: 'template_id',
                    inputMethod: {
                        type: 'multiple',
                        choices: m2m_choices(ZabbixTemplates),
                        displayProp: 'template_name',
                        idProp: 'template_id'
                    }
                },
            ];
            return _inf({
                resource: ZabbixStorage,
                path: '#/zabbix/storagedevice/',
                idField: 'id',
                fields: gen_fields(_f)
            });
        };

        var zabbix_mac_device = function () {
            var m2m_choices = function (resourceClass) {
                var result = [];
                resourceClass.query().$promise.then(function (success) {
                    angular.forEach(success.results, function (value, key) {
                        result.push(value);
                    });
                });
                return result;
            };
            var _f = [
                {
                    name: 'zabbix_customer', description: 'Customer/Instance', required: true,
                    opaque: 'stringTransform',
                    subfield: 'customer_zabbix_name',
                    readArray: ['customer_zabbix_name'],
                    uriPrefix: '#/zabbix/zabbix_customers',
                    idField: 'uuid',
                    inputMethod: {
                        type: 'typeahead',
                        invoker: function (val) {
                            return zabbix_instance_search(ZabbixCustomer, val);
                        },
                        accessor: 'customer_zabbix_name'
                    }
                },
                {
                    name: 'macdevice', description: 'Mac devices', required: true,
                    opaque: 'stringTransform',
                    subfield: 'name',
                    readArray: ['name'],
                    uriPrefix: '#/macdevice/',
                    idField: 'uuid',
                    inputMethod: {
                        type: 'typeahead',
                        invoker: function (val) {
                            return search(MacDeviceFast, val);
                        },
                        accessor: 'display_name'
                    }
                },
                { name: "host_id", description: "Host Id", required: true },
                {
                    name: 'templates', description: 'Templates', hide: true,
                    opaque: 'multiple',
                    subfield: 'template_name',
                    readArray: [],
                    idField: 'template_id',
                    inputMethod: {
                        type: 'multiple',
                        choices: m2m_choices(ZabbixTemplates),
                        displayProp: 'template_name',
                        idProp: 'template_id'
                    }
                },
            ];
            return _inf({
                resource: ZabbixMacDevice,
                path: '#/zabbix/macdevice/',
                idField: 'id',
                fields: gen_fields(_f)
            });
        };

        var zabbix_PDU = function () {
            var m2m_choices = function (resourceClass) {
                var result = [];
                resourceClass.query().$promise.then(function (success) {
                    angular.forEach(success.results, function (value, key) {
                        result.push(value);
                    });
                });
                return result;
            };
            var _f = [
                {
                    name: 'zabbix_customer', description: 'Customer/Instance', required: true,
                    opaque: 'stringTransform',
                    subfield: 'customer_zabbix_name',
                    readArray: ['customer_zabbix_name'],
                    uriPrefix: '#/zabbix/zabbix_customers',
                    idField: 'uuid',
                    inputMethod: {
                        type: 'typeahead',
                        invoker: function (val) {
                            return zabbix_instance_search(ZabbixCustomer, val);
                        },
                        accessor: 'customer_zabbix_name'
                    }
                },
                {
                    name: 'pdu', description: 'PDU', required: true,
                    opaque: 'stringTransform',
                    subfield: 'hostname',
                    readArray: ['hostname'],
                    uriPrefix: '#/pdu/',
                    idField: 'uuid',
                    inputMethod: {
                        type: 'typeahead',
                        invoker: function (val) {
                            return search(PDUFast, val);
                        },
                        accessor: 'display_name'
                    }
                },
                { name: "host_id", description: "Host Id", required: true },
                {
                    name: 'templates', description: 'Templates', hide: true,
                    opaque: 'multiple',
                    subfield: 'template_name',
                    readArray: [],
                    idField: 'template_id',
                    inputMethod: {
                        type: 'multiple',
                        choices: m2m_choices(ZabbixTemplates),
                        displayProp: 'template_name',
                        idProp: 'template_id'
                    }
                },
            ];
            return _inf({
                resource: ZabbixPDU,
                path: '#/zabbix/pdu/',
                idField: 'id',
                fields: gen_fields(_f)
            });
        };

        var zabbix_vmware_vm = function () {
            var m2m_choices = function (resourceClass) {
                var result = [];
                resourceClass.query().$promise.then(function (success) {
                    angular.forEach(success.results, function (value, key) {
                        result.push(value);
                    });
                });
                return result;
            };
            var _f = [
                {
                    name: 'zabbix_customer', description: 'Customer/Instance', required: true,
                    opaque: 'stringTransform',
                    subfield: 'customer_zabbix_name',
                    readArray: ['customer_zabbix_name'],
                    uriPrefix: '#/zabbix/zabbix_customers',
                    idField: 'uuid',
                    inputMethod: {
                        type: 'typeahead',
                        invoker: function (val) {
                            return zabbix_instance_search(ZabbixCustomer, val);
                        },
                        accessor: 'customer_zabbix_name'
                    }
                },
                {
                    name: 'vmwarevm', description: 'VMware VirtualMachine', required: true,
                    opaque: 'stringTransform',
                    subfield: 'name',
                    readArray: ['name'],
                    idField: 'uuid',
                    inputMethod: {
                        type: 'typeahead',
                        invoker: function (val) {
                            return search(VMwareVMFast, val);
                        },
                        accessor: 'display_name'
                    }
                },
                { name: "host_id", description: "Host Id", required: true },
                {
                    name: 'templates', description: 'Templates', hide: true,
                    opaque: 'multiple',
                    subfield: 'template_name',
                    readArray: [],
                    idField: 'template_id',
                    inputMethod: {
                        type: 'multiple',
                        choices: m2m_choices(ZabbixTemplates),
                        displayProp: 'template_name',
                        idProp: 'template_id'
                    }
                },
            ];
            return _inf({
                resource: ZabbixVMwareVM,
                path: '#/zabbix/vmwarevm/',
                idField: 'id',
                fields: gen_fields(_f)
            });
        };

        var zabbix_vcloud_vm = function () {
            var m2m_choices = function (resourceClass) {
                var result = [];
                resourceClass.query().$promise.then(function (success) {
                    angular.forEach(success.results, function (value, key) {
                        result.push(value);
                    });
                });
                return result;
            };
            var _f = [
                {
                    name: 'zabbix_customer', description: 'Customer/Instance', required: true,
                    opaque: 'stringTransform',
                    subfield: 'customer_zabbix_name',
                    readArray: ['customer_zabbix_name'],
                    uriPrefix: '#/zabbix/zabbix_customers',
                    idField: 'uuid',
                    inputMethod: {
                        type: 'typeahead',
                        invoker: function (val) {
                            return zabbix_instance_search(ZabbixCustomer, val);
                        },
                        accessor: 'customer_zabbix_name'
                    }
                },
                {
                    name: 'vcloudvm', description: 'Vcloud VirtualMachine', required: true,
                    opaque: 'stringTransform',
                    subfield: 'name',
                    readArray: ['name'],
                    idField: 'uuid',
                    inputMethod: {
                        type: 'typeahead',
                        invoker: function (val) {
                            return search(VCloudVMFast, val);
                        },
                        accessor: 'display_name'
                    }
                },
                { name: "host_id", description: "Host Id", required: true },
                {
                    name: 'templates', description: 'Templates', hide: true,
                    opaque: 'multiple',
                    subfield: 'template_name',
                    readArray: [],
                    idField: 'template_id',
                    inputMethod: {
                        type: 'multiple',
                        choices: m2m_choices(ZabbixTemplates),
                        displayProp: 'template_name',
                        idProp: 'template_id'
                    }
                },
            ];
            return _inf({
                resource: ZabbixVCloudVM,
                path: '#/zabbix/vcloudvm/',
                idField: 'id',
                fields: gen_fields(_f)
            });
        };

        var zabbix_esxi_vm = function () {
            var m2m_choices = function (resourceClass) {
                var result = [];
                resourceClass.query().$promise.then(function (success) {
                    angular.forEach(success.results, function (value, key) {
                        result.push(value);
                    });
                });
                return result;
            };
            var _f = [
                {
                    name: 'zabbix_customer', description: 'Customer/Instance', required: true,
                    opaque: 'stringTransform',
                    subfield: 'customer_zabbix_name',
                    readArray: ['customer_zabbix_name'],
                    uriPrefix: '#/zabbix/zabbix_customers',
                    idField: 'uuid',
                    inputMethod: {
                        type: 'typeahead',
                        invoker: function (val) {
                            return zabbix_instance_search(ZabbixCustomer, val);
                        },
                        accessor: 'customer_zabbix_name'
                    }
                },
                {
                    name: 'esxivm', description: 'ESXI VirtualMachine', required: true,
                    opaque: 'stringTransform',
                    subfield: 'name',
                    readArray: ['name'],
                    idField: 'uuid',
                    inputMethod: {
                        type: 'typeahead',
                        invoker: function (val) {
                            return search(ESXIVMFast, val);
                        },
                        accessor: 'display_name'
                    }
                },
                { name: "host_id", description: "Host Id", required: true },
                {
                    name: 'templates', description: 'Templates', hide: true,
                    opaque: 'multiple',
                    subfield: 'template_name',
                    readArray: [],
                    idField: 'template_id',
                    inputMethod: {
                        type: 'multiple',
                        choices: m2m_choices(ZabbixTemplates),
                        displayProp: 'template_name',
                        idProp: 'template_id'
                    }
                },
            ];
            return _inf({
                resource: ZabbixESXIVM,
                path: '#/zabbix/esxivm/',
                idField: 'id',
                fields: gen_fields(_f)
            });
        };

        var zabbix_hyperv_vm = function () {
            var m2m_choices = function (resourceClass) {
                var result = [];
                resourceClass.query().$promise.then(function (success) {
                    angular.forEach(success.results, function (value, key) {
                        result.push(value);
                    });
                });
                return result;
            };
            var _f = [
                {
                    name: 'zabbix_customer', description: 'Customer/Instance', required: true,
                    opaque: 'stringTransform',
                    subfield: 'customer_zabbix_name',
                    readArray: ['customer_zabbix_name'],
                    uriPrefix: '#/zabbix/zabbix_customers',
                    idField: 'uuid',
                    inputMethod: {
                        type: 'typeahead',
                        invoker: function (val) {
                            return zabbix_instance_search(ZabbixCustomer, val);
                        },
                        accessor: 'customer_zabbix_name'
                    }
                },
                {
                    name: 'hypervvm', description: 'Hyper-V VirtualMachine', required: true,
                    opaque: 'stringTransform',
                    subfield: 'name',
                    readArray: ['name'],
                    idField: 'uuid',
                    inputMethod: {
                        type: 'typeahead',
                        invoker: function (val) {
                            return search(HyperVVMFast, val);
                        },
                        accessor: 'display_name'
                    }
                },
                { name: "host_id", description: "Host Id", required: true },
                {
                    name: 'templates', description: 'Templates', hide: true,
                    opaque: 'multiple',
                    subfield: 'template_name',
                    readArray: [],
                    idField: 'template_id',
                    inputMethod: {
                        type: 'multiple',
                        choices: m2m_choices(ZabbixTemplates),
                        displayProp: 'template_name',
                        idProp: 'template_id'
                    }
                },
            ];
            return _inf({
                resource: ZabbixHyperVVM,
                path: '#/zabbix/hypervvm/',
                idField: 'id',
                fields: gen_fields(_f)
            });
        };

        var zabbix_openstack_vm = function () {
            var m2m_choices = function (resourceClass) {
                var result = [];
                resourceClass.query().$promise.then(function (success) {
                    angular.forEach(success.results, function (value, key) {
                        result.push(value);
                    });
                });
                return result;
            };
            var _f = [
                {
                    name: 'zabbix_customer', description: 'Customer/Instance', required: true,
                    opaque: 'stringTransform',
                    subfield: 'customer_zabbix_name',
                    readArray: ['customer_zabbix_name'],
                    uriPrefix: '#/zabbix/zabbix_customers',
                    idField: 'uuid',
                    inputMethod: {
                        type: 'typeahead',
                        invoker: function (val) {
                            return zabbix_instance_search(ZabbixCustomer, val);
                        },
                        accessor: 'customer_zabbix_name'
                    }
                },
                {
                    name: 'openstackvm', description: 'OpenStack VirtualMachine', required: true,
                    opaque: 'stringTransform',
                    subfield: 'name',
                    readArray: ['name'],
                    idField: 'uuid',
                    inputMethod: {
                        type: 'typeahead',
                        invoker: function (val) {
                            return search(OpenStackVMFast, val);
                        },
                        accessor: 'display_name'
                    }
                },
                { name: "host_id", description: "Host Id", required: true },
                {
                    name: 'templates', description: 'Templates', hide: true,
                    opaque: 'multiple',
                    subfield: 'template_name',
                    readArray: [],
                    idField: 'template_id',
                    inputMethod: {
                        type: 'multiple',
                        choices: m2m_choices(ZabbixTemplates),
                        displayProp: 'template_name',
                        idProp: 'template_id'
                    }
                },
            ];
            return _inf({
                resource: ZabbixOpenStackVM,
                path: '#/zabbix/openstackvm/',
                idField: 'id',
                fields: gen_fields(_f)
            });
        };

        var zabbix_custom_vm = function () {
            var m2m_choices = function (resourceClass) {
                var result = [];
                resourceClass.query().$promise.then(function (success) {
                    angular.forEach(success.results, function (value, key) {
                        result.push(value);
                    });
                });
                return result;
            };
            var _f = [
                {
                    name: 'zabbix_customer', description: 'Customer/Instance', required: true,
                    opaque: 'stringTransform',
                    subfield: 'customer_zabbix_name',
                    readArray: ['customer_zabbix_name'],
                    uriPrefix: '#/zabbix/zabbix_customers',
                    idField: 'uuid',
                    inputMethod: {
                        type: 'typeahead',
                        invoker: function (val) {
                            return zabbix_instance_search(ZabbixCustomer, val);
                        },
                        accessor: 'customer_zabbix_name'
                    }
                },
                {
                    name: 'customvm', description: 'Custom VirtualMachine', required: true,
                    opaque: 'stringTransform',
                    subfield: 'name',
                    readArray: ['name'],
                    idField: 'uuid',
                    inputMethod: {
                        type: 'typeahead',
                        invoker: function (val) {
                            return search(CustomCloudVMFast, val);
                        },
                        accessor: 'display_name'
                    }
                },
                { name: "host_id", description: "Host Id", required: true },
                {
                    name: 'templates', description: 'Templates', hide: true,
                    opaque: 'multiple',
                    subfield: 'template_name',
                    readArray: [],
                    idField: 'template_id',
                    inputMethod: {
                        type: 'multiple',
                        choices: m2m_choices(ZabbixTemplates),
                        displayProp: 'template_name',
                        idProp: 'template_id'
                    }
                },
            ];
            return _inf({
                resource: ZabbixCustomVM,
                path: '#/zabbix/customvm/',
                idField: 'id',
                fields: gen_fields(_f)
            });
        };

        var virtualLoadBalancerExt = function () {
            var _dwf = CoreService.dereferenceWrapperFactory;
            var fields = [
                CoreService.fieldFactory('Host Name', _dwf(['vmware_vm', 'config', 'summary', 'guest', 'hostName'])),
                CoreService.fieldFactory('ipAddress', _dwf(['vmware_vm', 'config', 'summary', 'guest', 'ipAddress'])),
                CoreService.fieldFactory('VMware Tools Running', _dwf(['vmware_vm', 'config', 'summary', 'guest', 'toolsStatus'])),
                CoreService.fieldFactory('bootTime', _dwf(['vmware_vm', 'config', 'summary', 'runtime', 'bootTime']))
            ];
            return {
                fields: fields
            };
        };

        var zendeskTicket = function () {
            var _dwf = CoreService.dereferenceWrapperFactory;
            var fields = [
                {
                    name: 'Ticket ID',
                    resolve: function (obj) {
                        return {
                            href: function (obj) {
                                return 'https://unitedlayer.zendesk.com/agent/#/tickets/' + obj.id;
                            },
                            text: function (obj) {
                                return obj.id;
                            }
                        };
                    },
                    opaque: 'link'
                },
                {
                    name: 'Subject',
                    resolve: function (obj) {
                        return obj.subject;
                    }
                },
                {
                    name: 'Customer',
                    resolve: function (obj) {
                        return obj.organization_id;
                    }
                },
                {
                    name: 'Data Center',
                    resolve: function (obj) {
                        return null;
                    }
                },
                {
                    name: 'Status',
                    resolve: function (obj) {
                        return obj.status;
                    }
                },
                {
                    name: 'Priority',
                    resolve: function (obj) {
                        return obj.priority;
                    }
                },
                {
                    name: 'Updated At',
                    resolve: function (obj) {
                        return $filter('date')(obj.updated_at, 'medium');
                    }
                }
            ];
            return {
                fields: fields
            };
        };

        var openstack = function () {
            var _f = [
                { name: 'hostname', description: 'Auth URL', required: true },
                { name: 'username', description: 'Username', required: true },
                {
                    name: 'password', description: 'Password', required: true, hide: true,
                    hide_on_edit: true,
                    inputMethod: {
                        type: 'password'
                    }
                },
                { name: 'project', description: 'Project Name' },
                { name: 'user_domain', description: 'User Domain' },
                { name: 'project_domain', description: 'Project Domain' },
                {
                    name: 'private_cloud', description: 'Cloud', required: true,
                    // opaque: 'stringTransform',
                    opaque: 'link',
                    subfield: 'name',
                    readArray: ['name'],
                    uriPrefix: '#/cloud/',
                    idField: 'uuid',
                    inputMethod: {
                        type: 'typeahead',
                        invoker: function (val) {
                            return search(PrivateCloudFast, val);
                        },
                        accessor: 'name'
                    }
                }
            ];
            return _inf({
                resource: OpenStackController,
                fields: gen_fields(_f),
                path: '#/openstack-dashboard',
                idField: 'id'
            });
        };


        var vmware = function () {
            var _f = [
                { name: 'hostname', description: 'Vcenter Host', required: true },
                { name: 'username', description: 'Username', required: true, hide: true },
                {
                    name: 'password', description: 'Password', required: true, hide: true,
                    hide_on_edit: true,
                    inputMethod: {
                        type: 'password'
                    }
                },
                {
                    name: 'port', description: 'Port',
                    inputMethod: {
                        type: 'number'
                    }
                },
                {
                    name: 'private_cloud', description: 'Cloud', required: true,
                    // opaque: 'stringTransform',
                    opaque: 'link',
                    subfield: 'name',
                    readArray: ['name'],
                    uriPrefix: '#/cloud/',
                    idField: 'uuid',
                    inputMethod: {
                        type: 'typeahead',
                        invoker: function (val) {
                            return search(PrivateCloudFast, val);
                        },
                        accessor: 'name'
                    }
                }
            ];
            return _inf({
                resource: VMwareVcenter,
                fields: gen_fields(_f),
                path: '#/vmware-dashboard',
                idField: 'id'
            });
        };


        var vmware_config = function () {
            var _f = [
                { name: 'network_name', description: 'Network Name', required: true },
                {
                    name: 'network_type', description: 'Platform Type', required: true,
                    inputMethod: {
                        type: 'choices',
                        choices: ['internal', 'routable']
                    }
                },
                { name: 'ip_network_cidr', description: 'IP Network CIDR', required: true },
                { name: 'gateway', description: 'Gateway', required: true },
                { name: 'datacenter_name', description: 'Datacenter Name', required: true },
                { name: 'cluster_name', description: 'Cluster Name', required: true },
                { name: 'datastore_name', description: 'Datastore Name', required: true },
                {
                    name: 'vcenter', description: 'vCenter', required: true,
                    opaque: 'stringTransform',
                    subfield: 'hostname',
                    readArray: ['hostname'],
                    uriPrefix: '#/vmware-dashboard/',
                    idField: 'uuid',
                    inputMethod: {
                        type: 'typeahead',
                        invoker: function (val) {
                            return search(VMwareVcenter, val);
                        },
                        accessor: 'hostname'
                    }
                },
            ];
            return _inf({
                resource: VMwareVcenterConfig,
                fields: gen_fields(_f),
                path: '#/vmware-config',
                idField: 'id'
            });
        };

        var maintenace_schedule = function () {
            var _dwf = CoreService.dereferenceWrapperFactory;

            var _f = [
                { name: 'description', description: 'Description', required: true },
                {
                    name: 'status', description: 'Status', required: true,
                    inputMethod: {
                        type: 'choices',
                        choices: ['Future Plan', 'Ongoing', 'Completed']
                    },
                    opaque: 'arbitraryLink',
                    func: function (row) {
                        if (row.status === "F") {
                            return "Future Plan";
                        }
                        else if (row.status === "O") {
                            return "Ongoing";
                        }
                        else if (row.status === "C") {
                            return "Complete";
                        }
                        else {
                            return row.status;
                        }
                    },
                },
                {
                    name: 'colo_cloud', description: 'Datacenter', required: true,
                    opaque: 'stringTransform',
                    // opaque: 'link',
                    subfield: 'name',
                    readArray: ['name'],
                    // uriPrefix: '#/diskmodel/',
                    idField: 'id',
                    inputMethod: {
                        type: 'typeahead',
                        invoker: function (val) {
                            return search(ColoCloud, val);
                        },
                        accessor: 'display_name'
                    }
                },
                {
                    name: 'start_date',
                    description: 'Start Date',
                    opaque: 'arbitraryLink',
                    func: function (row) {
                        return $filter('date')(row.start_date, 'medium');
                    },
                    inputMethod: {
                        type: 'datetime'
                    }
                },
                {
                    name: 'end_date',
                    description: 'End Date',
                    opaque: 'arbitraryLink',
                    func: function (row) {
                        return $filter('date')(row.end_date, 'medium');
                    },
                    inputMethod: {
                        type: 'datetime'
                    }
                }
            ];
            return _inf({
                resource: MaintenanceSchedule,
                fields: gen_fields(_f),
                path: '#/maintenance-schedules',
                idField: 'id'
            });
        };

        var aws_amis = function (regions) {
            var _f = [
                { name: 'ami_id', description: 'Ami_id', required: true },
                { name: 'description', description: 'Description', required: true },
                {
                    name: 'region', description: 'Region', required: true,
                    inputMethod: {
                        type: 'choices',
                        choices: regions
                    },
                },

            ];
            return _inf({
                resource: AWSAMIS,
                path: '#/aws_amis/',
                idField: 'id',
                fields: gen_fields(_f)
            });
        };

        var switch_port_map = function () {
            var _f = [
                FieldProvider.customer_field('customer', 'Customer'),
                {
                    name: 'switch', description: 'Switch', required: true,
                    opaque: 'stringTransform',
                    // opaque: 'link',
                    subfield: 'name',
                    readArray: ['name'],
                    uriPrefix: '#/switch/',
                    idField: 'uuid',
                    inputMethod: {
                        type: 'typeahead',
                        invoker: function (val) {
                            return custom_search(SwitchFast, val, 'is_shared', true);
                        },
                        accessor: 'display_name'
                    }
                },
                { name: 'ports', description: 'Ports' },
                { name: 'name', description: 'Port Name' },
            ];

            return _inf({
                resource: SwitchPortMap,
                path: '#/observium/switch_map/',
                idField: 'id',
                fields: gen_fields(_f)
            });
        };

        var devOpsScripts = function () {
            var _f = [
                { name: 'name', description: 'Name', required: true },
                { name: 'description', Description: 'Ports', required: true },
                FieldProvider.choice_field('script_type', 'Script type', ['Ansible Playbook', 'Terraform Script', 'Bash Script', 'Python Script', 'Powershell Script']),
            ];
            return _inf({
                resource: SwitchModel,
                fields: gen_fields(_f),
                path: '#/switchmodel',
                idField: 'id'
            });
        };

        return {
            server: server,
            san: san,
            manufacturer: manufacturer,
            server_manufacturer: server_manufacturer,
            mobile_manufacturer: mobile_manufacturer,
            storage_manufacturer: storage_manufacturer,
            pdu_manufacturer: pdu_manufacturer,
            IPv6BlockAllocation: IPv6BlockAllocation,
            publicIPv4Allocation: publicIPv4Allocation,
            public_ipv4_assignment: public_ipv4_assignment,
            vlan: vlan,
            private_cloud: private_cloud,
            colo_cloud: colo_cloud,
            terminalserver: terminalserver,
            customdevice: customdevice,
            cabinet: cabinet,
            virtualMachine: virtualMachine,
            instance: instance,
            organization: organization,
            org_monitoring_config: org_monitoring_config,
            storage_inventory: storage_inventory,
            service_catalogue: service_catalogue,
            sfOpportunity: sfOpportunity,
            invoice: invoice,
            cpu: cpu,
            cage: cage,
            power_circuit: power_circuit,
            cpuModel: cpuModel,
            memory: memory,
            memModel: memModel,
            diskModel: diskModel,
            storageModel: storageModel,
            serverModel: serverModel,
            mobileModel: mobileModel,
            disk: disk,
            nic: nic,
            nicModel: nicModel,
            ipmiModel: ipmiModel,
            moboModel: moboModel,
            motherboard: motherboard,
            switchModel: switchModel,
            loadBalancerModel: loadBalancerModel,
            firewallModel: firewallModel,
            pdu: pdu,
            pduModel: pduModel,
            terminalServerModel: terminalServerModel,
            electricalpanel: electricalpanel,
            electricalcircuit: electricalcircuit,
            os: os,
            product_type: product_type,
            sascontroller_type: sascontroller_type,
            disk_controller_type: disk_controller_type,
            raidcontroller_type: raidcontroller_type,
            chassis_type: chassis_type,
            peripheral_type: peripheral_type,
            cluster_type: cluster_type,
            cloud_type: cloud_type,
            datacenter: datacenter,
            location: location,
            cabinet_type: cabinet_type,
            cabinet_options: cabinet_options,
            circuit_options: circuit_options,
            voltage_type: voltage_type,
            amps_type: amps_type,
            outlet_type: outlet_type,
            sw: networkSwitch,
            firewall: firewall,
            loadBalancer: loadBalancer,
            virtualLoadBalancer: virtualLoadBalancer,
            user: user,
            release: release,
            openStackInstance: openStackInstance,
            hostMonitor: hostMonitor,
            customerHostMonitor: customerHostMonitor,
            observium_host: observium_host,
            transit_port: transit_port,
            serviceContract: serviceContract,
            celeryTask: celeryTask,
            celeryWorker: celeryWorker,
            graphedPort: graphedPort,
            tenable: tenable,
            vcenter: vcenter,
            openstack_proxy: openstack_proxy,
            esxi: esxi,
            f5lb: f5lb,
            cisco_firewall: cisco_firewall,
            cisco_switch: cisco_switch,
            citrix: citrix,
            juniper_switch: juniper_switch,
            juniper_firewall: juniper_firewall,
            observium_instance: observium_instance,
            observium_server: observium_server,
            observium_switch: observium_switch,
            observium_firewall: observium_firewall,
            observium_loadbalancer: observium_loadbalancer,
            observium_pdu: observium_pdu,
            observium_aws_instance: observium_aws_instance,
            observium_vmware_vm: observium_vmware_vm,
            observium_proxmox_vm: observium_proxmox_vm,
            observium_g3kvm_vm: observium_g3kvm_vm,
            observium_openstack_vm: observium_openstack_vm,
            observium_custom_cloud_vm: observium_custom_cloud_vm,
            observium_vcloud_vm: observium_vcloud_vm,
            observium_esxi_vm: observium_esxi_vm,
            observium_hyperv_vm: observium_hyperv_vm,
            observium_storage: observium_storage,
            observium_mac_device: observium_mac_device,
            observium_billing: observium_billing,
            zabbix_instance: zabbix_instance,
            zabbix_customer_instance_map: zabbix_customer_instance_map,
            zabbix_switch_map: zabbix_switch_map,
            zabbix_firewall_map: zabbix_firewall_map,
            zabbix_lb_map: zabbix_lb_map,
            zabbix_server_map: zabbix_server_map,
            zabbix_storage: zabbix_storage,
            zabbix_mac_device: zabbix_mac_device,
            zabbix_database_server: zabbix_database_server,
            zabbix_PDU: zabbix_PDU,
            zabbix_vmware_vm: zabbix_vmware_vm,
            zabbix_vcloud_vm: zabbix_vcloud_vm,
            zabbix_esxi_vm: zabbix_esxi_vm,
            zabbix_hyperv_vm: zabbix_hyperv_vm,
            zabbix_openstack_vm: zabbix_openstack_vm,
            zabbix_custom_vm: zabbix_custom_vm,
            aws_amis: aws_amis,
            switch_port_map: switch_port_map,
            openstack: openstack,
            vmware: vmware,
            vmware_config: vmware_config,
            maintenace_schedule: maintenace_schedule,
            virtualLoadBalancerExt: virtualLoadBalancerExt(),
            zendeskTicket: zendeskTicket,
            open_audit_collector_map: open_audit_collector_map
        };
    }
]);
