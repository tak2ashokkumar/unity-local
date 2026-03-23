/**
 * (C) 2013-2017 UnitedLayer, LLC
 */

// 'use strict';
var app = angular.module('uldb',
    [
        'uldbapi',
        'uldbfilters',
        'ngSanitize',
        'ngRoute',
        'ui.bootstrap',
        'nvd3',
        'ui.bootstrap.datetimepicker',
        'ui.dateTimeInput',
        // 'uiGmapgoogle-maps',
        'formatFilters',
        'chart.js',
        'ngTagsInput',
        'customFilter',
        'floatThead',
        'ngFileUpload',
        'daterangepicker',
        'btorfs.multiselect',
        'ngAnimate',
        'ngMaterial',
        'ngNotify',
        'infinite-scroll',
        'datatables',
        'datatables.bootstrap',
        'angularjs-dropdown-multiselect',
        'cgBusy',
    ]);


var resolveTemplate = function (templateName) {
    return '/static/rest/app/templates/' + templateName + '.html';
};

app.config([
    '$routeProvider',
    function ($routeProvider) {
        $routeProvider
            // .when('/dashboard', {
            //     templateUrl: resolveTemplate('dashboard'),
            //     controller: 'DashboardController'
            // })
            .when('/', {
                templateUrl: '/static/rest/app/templates/v3/ul-admin/dashboard.html',
                controller: 'UladminController'
            })
            .when('/example', {
                templateUrl: resolveTemplate('example'),
                controller: 'ExampleController',
                title: 'Example'
            })
            .when('/example_data', {
                templateUrl: resolveTemplate('example_data'),
                controller: 'ExampleDataController',
                title: 'Example Data'
            })
            .when('/account', {
                templateUrl: resolveTemplate('settings'),
                controller: 'AccountController',
                title: 'Accounts'
            })
            .when('/servers', {
                templateUrl: resolveTemplate('servers'),
                controller: 'ServersController',
                reloadOnSearch: false,
                title: 'Servers'
            })
            .when('/servers/:id/', {
                templateUrl: resolveTemplate('server-details'),
                controller: 'ServerDetailController',
                title: 'Servers'
            })
            .when('/instance/:id/', {
                templateUrl: resolveTemplate('instance-detail'),
                controller: 'InstanceDetailController'
            })
            .when('/cpumodel/:id/', {
                templateUrl: resolveTemplate('cpumodel-detail'),
                controller: 'CPUmodelDetailController'
            })
            .when('/sans', {
                templateUrl: resolveTemplate('servers'),
                controller: 'SANController',
                reloadOnSearch: false,
                title: 'SANs'
            })
            .when('/switch', {
                // templateUrl: resolveTemplate('master_list'),
                templateUrl: resolveTemplate('master_list_tab'), //Temporary until demo
                controller: 'SwitchController',
                title: 'Switches'
            })
            .when('/switch/:id/', {
                templateUrl: resolveTemplate('switch-detail'),
                controller: 'SwitchDetailController'
            })
            .when('/org/:id/', {
                templateUrl: resolveTemplate('organization_detail'),
                controller: 'OrganizationDetailController'
            })
            .when('/organization', {
                templateUrl: resolveTemplate('org_list'),
                controller: 'OrganizationController',
                title: 'Organizations'
            })
            .when('/organization/:id/', {
                templateUrl: resolveTemplate('organization_detail'),
                controller: 'OrganizationDetailController',
                reloadOnSearch: false
            })
            .when('/loadbalancer', {
                // templateUrl: resolveTemplate('master_list'),
                templateUrl: resolveTemplate('master_list_tab'), //Temporary until demo
                controller: 'LoadBalancerController',
                title: 'Load Balancers'
            })
            .when('/loadbalancer/:id/', {
                templateUrl: resolveTemplate('loadbalancer-detail'),
                controller: 'LoadBalancerDetailController'
            })
            .when('/virtual_load_balancer', {
                templateUrl: resolveTemplate('master_list_tab'),
                controller: 'VirtualLoadBalancerController',
                title: 'Virtual Load Balancers'
            })
            .when('/firewall', {
                // templateUrl: resolveTemplate('master_list'),
                templateUrl: resolveTemplate('master_list_tab'), //Temporary until demo
                controller: 'FirewallController',
                title: 'Firewalls'
            })
            .when('/firewall/:id/', {
                templateUrl: resolveTemplate('firewall-detail'),
                controller: 'FirewallDetailController'
            })
            .when('/customdevice', {
                templateUrl: resolveTemplate('master_list'),
                controller: 'CustomDeviceController',
                title: 'Custom Devices'
            })
            .when('/pdu', {
                templateUrl: resolveTemplate('master_list'),
                controller: 'PDUController',
                title: 'PDUs'
            })
            .when('/cage', {
                templateUrl: resolveTemplate('master_list'),
                controller: 'CageController',
                title: 'Cages'
            })
            .when('/powercircuit', {
                templateUrl: resolveTemplate('master_list'),
                controller: 'PowerCircuitController',
                title: 'Power Circuits'
            })
            .when('/colo_cloud', {
                templateUrl: resolveTemplate('master_list'),
                controller: 'ColoCloudController',
                title: 'Colocation Cloud'
            })
            .when('/terminalserver', {
                templateUrl: resolveTemplate('master_list'),
                controller: 'TerminalServerController',
                title: 'Terminal Servers'
            })
            .when('/terminalservermodel', {
                templateUrl: resolveTemplate('master_list'),
                controller: 'TerminalServerModelController',
                title: 'Terminal Server Models'
            })
            .when('/openstack_instance', {
                templateUrl: resolveTemplate('openstack_instance'),
                controller: 'OpenStackInstanceController',
                title: 'OpenStack Instances'
            })
            .when('/vm', {
                // templateUrl: resolveTemplate('virtual-machines'), //hypervisor json data issue -#632
                templateUrl: resolveTemplate('master_list'),
                controller: 'VirtualMachineController',
                reloadOnSearch: false,
                title: 'Virtual Machines'
            })
            .when('/vm/:id/', {
                templateUrl: resolveTemplate('virtualserver-detail'),
                controller: 'VirtualMachineDetailController'
            })
            .when('/virtualserver_add', {
                templateUrl: '/static/rest/app/templates/virtualserver_add.html',
                controller: 'VirtualServerAddController'
            })
            .when('/virtualserver_edit', {
                templateUrl: '/static/rest/app/templates/virtualserver_edit.html',
                controller: 'VirtualServerEditController'
            })
            .when('/virtualservers/connection_add/:id/', {
                templateUrl: resolveTemplate('vserver_connection_add'),
                controller: 'VServerConnectionAddController'
            })
            .when('/virtualservers/connection_edit/:id/', {
                templateUrl: resolveTemplate('vserver_connection_edit'),
                controller: 'VServerConnectionEditController'
            })
            .when('/virtualdatacenter', {
                templateUrl: '/static/rest/app/templates/virtualdatacenter.html',
                controller: 'VirtualDataCenterController',
                reloadOnSearch: false
            })
            .when('/virtualdatacenter/:id/', {
                templateUrl: resolveTemplate('vdc-details'),
                controller: 'VDCDetailController'
            })
            .when('/vdc_add', {
                templateUrl: '/static/rest/app/templates/vdc_add.html',
                controller: 'VDCAddController'
            })
            .when('/vdc_edit', {
                templateUrl: '/static/rest/app/templates/vdc_edit.html',
                controller: 'VDCEditController'
            })
            .when('/vcenterserver', {
                templateUrl: resolveTemplate('generic'),
                controller: 'VCenterController'
            })
            .when('/cabinet', {
                templateUrl: resolveTemplate('master_list'),
                controller: 'CabinetController',
                title: 'Cabinets'
            })
            .when('/cabinet/:id/', {
                templateUrl: resolveTemplate('cabinet-detail'),
                controller: 'CabinetDetailController'
            })
            .when('/cabinet_add', {
                templateUrl: '/static/rest/app/templates/cabinet_add.html',
                controller: 'CabinetAddController'
            })
            .when('/cabinet_edit', {
                templateUrl: '/static/rest/app/templates/cabinet_edit.html',
                controller: 'CabinetEditController'
            })
            .when('/system_add', {
                templateUrl: '/static/rest/app/templates/system_add.html',
                controller: 'SystemAddController'
            })
            .when('/system_edit', {
                templateUrl: '/static/rest/app/templates/system_edit.html',
                controller: 'SystemEditController'
            })
            .when('/component_add', {
                templateUrl: '/static/rest/app/templates/component_add.html',
                controller: 'ComponentAddController'
            })
            .when('/component_edit', {
                templateUrl: '/static/rest/app/templates/component_edit.html',
                controller: 'ComponentEditController'
            })
            .when('/server_add', {
                templateUrl: '/static/rest/app/templates/server_add.html',
                controller: 'ServerAddController'
            })
            .when('/server_edit', {
                templateUrl: '/static/rest/app/templates/server_edit.html',
                controller: 'ServerEditController'
            })
            .when('/server/vserver_details/:id/', {
                templateUrl: '/static/rest/app/templates/associate_vserver_details.html',
                controller: 'AssociateVServerDetailController'
            })
            .when('/connection_add', {
                templateUrl: '/static/rest/app/templates/connection_add.html',
                controller: 'ConnectionAddController'
            })
            .when('/connection_edit', {
                templateUrl: '/static/rest/app/templates/connection_edit.html',
                controller: 'ConnectionEditController'
            })
            .when('/integ/health', {
                templateUrl: '/static/rest/app/templates/monitor/nagios.html',
                controller: 'NagiosController',
                title: 'Nagios',
                reloadOnSearch: false
            })
            .when('/integ/net', {
                templateUrl: '/static/rest/app/templates/monitor/network.html',
                controller: 'NetworkingController',
                title: 'Networking',
                reloadOnSearch: false
            })
            .when('/integ/support', {
                templateUrl: resolveTemplate('support/zendesk'),
                controller: 'ZendeskController',
                title: 'Zendesk Integration'
            })
            // .when('/ticket', {
            //     templateUrl: '/static/rest/app/templates/ticket2.html',
            //     controller: 'TicketController',
            //     title: 'Ticket'
            // })
            .when('/admin_tickets', {
                templateUrl: '/static/rest/app/templates/support/admin_tickets.html',
                controller: 'TicketsController2',
                title: 'Ticket'
            })
            .when('/tickets', {
                templateUrl: '/static/rest/app/templates/support/ticket3.html',
                controller: 'TicketsController2',
                title: 'Ticket'
            })

            .when('/unity_feedback', {
                templateUrl: '/static/rest/app/templates/support/unity_feedback_tickets.html',
                controller: 'TicketsController2',
                title: 'Ticket'
            })

            .when('/change_ticket', {
                templateUrl: '/static/rest/app/templates/changeticket.html',
                controller: 'TicketsController2',
            })
            .when('/existing_ticket', {
                templateUrl: '/static/rest/app/templates/existingtickets.html',
                controller: 'TicketsController2',
            })
            .when('/zendesk_manage', {
                templateUrl: resolveTemplate('support/zendesk'),
                controller: 'ZendeskController',
                title: 'Zendesk Integration'
            })
            .when('/integ/celery_monitor', {
                templateUrl: '/static/rest/app/templates/monitor/celery.html',
                controller: 'CeleryMonitorController',
                title: 'Celery'
            })
            // Release Management
            .when('/release', {
                templateUrl: resolveTemplate('master_list'),
                controller: 'ReleaseNotesController',
                title: 'Release Management'
            })
            .when('/observium_host/:id/', {
                templateUrl: resolveTemplate('monitor/observium_detail'),
                controller: 'ObserviumDetailController'
            })
            .when('/transit_port/', {
                templateUrl: resolveTemplate('master_list'),
                controller: 'TransitPortController'
            })

            // IPv4
            .when('/ipv4_public/allocations', {
                templateUrl: resolveTemplate('public_ipv4_alloc'),
                controller: 'IPv4AllocationController',
                title: 'IPv4 Allocations'
            })
            .when('/ipv4_public/assignments', {
                templateUrl: resolveTemplate('public_ipv4'),
                controller: 'IPv4AssignmentController',
                title: 'IPv4 Assignments'
            })
            .when('/ipv4_public/assignments/:ipBlock', {
                templateUrl: resolveTemplate('ipam/ipv4assignment_detail'),
                controller: 'IPv4AssignmentDetailController'
            })

            // IPv4 Private
            .when('/ipv4_private/allocations', {
                templateUrl: resolveTemplate('ipam/ipv4alloc_private'),
                controller: 'PrivateIPv4AllocationController',
                title: 'Private IPv4 Allocations'
            })
            .when('/ipv4_private/assignments', {
                templateUrl: resolveTemplate('ipam/ipv4assign_private'),
                controller: 'PrivateIPv4AssignmentController',
                title: 'Private IPv4 Assignments'
            })
            .when('/ipv4_private/assignments/:ipBlock', {
                templateUrl: resolveTemplate('ipam/ipv4assignment_detail_private'),
                controller: 'PrivateIPv4AssignmentDetailController'
            })

            // IPv6
            .when('/ipv6alloc', {
                templateUrl: resolveTemplate('ipam/ipv6alloc'),
                controller: 'IPv6ConfigController',
                title: 'IPv6 Allocations'
            })
            .when('/ipv6loc', {
                templateUrl: resolveTemplate('generic'),
                controller: 'IPv6LocationController',
                title: 'IPv6 Locations'
            })
            .when('/ipv6assign', {
                templateUrl: resolveTemplate('ipam/ipv6assign'),
                controller: 'IPv6AssignmentController',
                title: 'IPv6 Assignments'
            })
            .when('/ipv6assign/:id/', {
                templateUrl: resolveTemplate('ipam/ipv6assign'),
                controller: 'IPv6RegionAssignmentController',
                title: 'IPv6 Regions'
            })
            .when('/ipv6interface/:id/', {
                templateUrl: resolveTemplate('ipam/ipv6interface'),
                controller: 'IPv6InterfaceController',
                title: 'IPv6 Interfaces'
            })
            .when('/ipv6blocks', {
                // templateUrl: resolveTemplate('ipam/ipv6blocks'),
                templateUrl: resolveTemplate('master_list'),
                // controller: 'IPv6BlockController',
                controller: 'IPv6BlockAllocationController',
                title: 'IPv6 Blocks'
            })
            .when('/vlan', {
                templateUrl: resolveTemplate('servers'),
                controller: 'VlanController',
                title: 'VLANs'
            })

            // Salesforce
            .when('/salesforce', {
                templateUrl: resolveTemplate('salesforce/salesforce'),
                controller: 'SalesforceController'
            })
            .when('/salesforce/completeness/', {
                templateUrl: resolveTemplate('salesforce/completeness'),
                controller: 'SalesforceCompletenessController'
            })

            // Server Components
            .when('/chassis', {
                templateUrl: resolveTemplate('generic'),
                controller: 'ChassisController',
                title: 'Chassis'
            })
            .when('/motherboard', {
                templateUrl: resolveTemplate('master_list'),
                controller: 'MotherboardController',
                title: 'Motherboards'
            })
            .when('/motherboard/:id', {
                templateUrl: resolveTemplate('generic-detail'),
                controller: 'MotherboardDetailController',
                title: 'Motherboard Detail'
            })
            .when('/cpu', {
                templateUrl: resolveTemplate('master_list'),
                controller: 'CPUController',
                title: 'CPUs'
            })
            .when('/memory', {
                templateUrl: resolveTemplate('master_list'),
                controller: 'MemoryController',
                title: 'Memory'
            })
            .when('/nic', {
                templateUrl: resolveTemplate('master_list'),
                controller: 'NICController',
                title: 'NICs'
            })
            .when('/ipmi', {
                templateUrl: resolveTemplate('generic'),
                controller: 'IPMIController',
                title: 'IPMI Modules'
            })
            .when('/disk', {
                templateUrl: resolveTemplate('master_list'),
                controller: 'DiskController',
                title: 'Disks'
            })

            // Types
            .when('/cputype', {
                templateUrl: resolveTemplate('master_list'),
                controller: 'CPUTypeController',
                title: 'CPU Models'
            })
            .when('/memorytype', {
                templateUrl: resolveTemplate('master_list'),
                controller: 'MemoryModelController',
                title: 'Memory Models'
            })
            .when('/disktype', {
                templateUrl: resolveTemplate('master_list'),
                controller: 'DiskTypeController',
                title: 'Disk Models'
            })
            .when('/nictype', {
                templateUrl: resolveTemplate('master_list'),
                controller: 'NICTypeController',
                title: 'NIC Models'
            })
            .when('/ipmi_model', {
                templateUrl: resolveTemplate('master_list'),
                controller: 'IPMIModelController',
                title: 'IPMI Models'
            })
            .when('/server_model', {
                templateUrl: resolveTemplate('master_list'),
                controller: 'ServerModelController',
                title: 'Server Models'
            })
            .when('/mobile_model', {
                templateUrl: resolveTemplate('master_list'),
                controller: 'MobileDeviceModelController',
                title: 'Mobile Models'
            })
            .when('/mobile_manufacturers', {
                templateUrl: resolveTemplate('master_list'),
                controller: 'MobileDeviceManufacturerController',
                title: 'Mobile Manufacturers'
            })
            .when('/storage_model', {
                templateUrl: resolveTemplate('master_list'),
                controller: 'StorageModelController',
                title: 'Storage Models'
            })
            .when('/system_manufacturers', {
                templateUrl: resolveTemplate('master_list'),
                controller: 'SystemManufacturerController',
                title: 'System Manufacturers'
            })
            .when('/storage_manufacturers', {
                templateUrl: resolveTemplate('master_list'),
                controller: 'StorageManufacturerController',
                title: 'Storage Manufacturers'
            })
            .when('/pdu_manufacturers', {
                templateUrl: resolveTemplate('master_list'),
                controller: 'PDUManufacturerController',
                title: 'PDU Manufacturers'
            })
            .when('/manufacturers', {
                templateUrl: resolveTemplate('master_list'),
                controller: 'ManufacturerController',
                title: 'Manufacturers'
            })
            .when('/manufacturers/:id/', {
                templateUrl: resolveTemplate('manufacturer-detail'),
                controller: 'ManufacturerDetailController',
                title: 'Manufacturers Detail'
            })
            .when('/switchmodel', {
                templateUrl: resolveTemplate('master_list'),
                controller: 'SwitchModelController',
                title: 'Switch Models'
            })
            .when('/switchmodel/:id/', {
                templateUrl: resolveTemplate('switch-model-detail'),
                controller: 'SwitchModelDetailController'
            })
            .when('/systemtype', {
                templateUrl: resolveTemplate('generic'),
                controller: 'SystemTypesController',
                title: 'System Types'
            })
            .when('/servertype', {
                templateUrl: resolveTemplate('generic'),
                controller: 'ServerTypesController',
                title: 'Server Types'
            })
            .when('/cabinettype', {
                templateUrl: resolveTemplate('master_list'),
                controller: 'CabinetTypesController',
                title: 'Cabinet Types'
            })
            .when('/cabinetoption', {
                templateUrl: resolveTemplate('master_list'),
                controller: 'CabinetOptionsController'
            })
            .when('/circuitoption', {
                templateUrl: resolveTemplate('master_list'),
                controller: 'CircuitOptionsController'
            })
            .when('/cpusockettype', {
                templateUrl: resolveTemplate('generic'),
                controller: 'CPUSocketTypesController',
                title: 'CPU Socket Types'
            })
            .when('/ipmi_model', {
                templateUrl: resolveTemplate('master_list'),
                controller: 'IPMIModelController',
                title: 'IPMI Module Models'
            })
            .when('/ampstype', {
                templateUrl: resolveTemplate('master_list'),
                controller: 'AMPSTypesController',
                title: 'Amperage Ratings'
            })
            .when('/outlettype', {
                templateUrl: resolveTemplate('master_list'),
                controller: 'OutletTypesController',
                title: 'Electrical Outlet Types'
            })
            .when('/peripheraltype', {
                templateUrl: resolveTemplate('master_list'),
                controller: 'PeripheralTypesController',
                title: 'Peripheral Types'
            })
            .when('/clustertype', {
                templateUrl: resolveTemplate('master_list'),
                controller: 'ClusterTypesController'
            })
            .when('/sascontrollertype', {
                templateUrl: resolveTemplate('master_list'),
                controller: 'SASControllerTypesController',
                title: 'SAS Controller Models'
            })
            .when('/voltagetype', {
                templateUrl: resolveTemplate('master_list'),
                controller: 'VoltageTypesController'
            })
            .when('/vlanpooltype', {
                templateUrl: resolveTemplate('generic'),
                controller: 'VLANPoolTypesController'
            })
            .when('/loadbalancermodel', {
                templateUrl: resolveTemplate('master_list'),
                controller: 'LoadBalancerModelController',
                title: 'Load Balancer Models'
            })
            .when('/loadbalancermodel/:id', {
                templateUrl: resolveTemplate('loadbalancer-detail'),
                controller: 'LoadBalancerModelDetailController'
            })
            .when('/firewallmodel', {
                templateUrl: resolveTemplate('master_list'),
                controller: 'FirewallModelController'
            })
            .when('/firewallmodel/:id/', {
                templateUrl: resolveTemplate('firewall-detail'),
                controller: 'FirewallModelDetailController'
            })
            .when('/pdumodel', {
                templateUrl: resolveTemplate('master_list'),
                controller: 'PDUModelController'
            })
            .when('/electricalpanel', {
                templateUrl: resolveTemplate('master_list'),
                controller: 'ElectricalPanelController'
            })
            .when('/electricalcircuit', {
                templateUrl: resolveTemplate('master_list'),
                controller: 'ElectricalCircuitController'
            })
            .when('/datacenter', {
                templateUrl: resolveTemplate('master_list'),
                controller: 'DatacenterController',
                title: 'Data Centers'
            })
            .when('/location', {
                templateUrl: resolveTemplate('master_list'),
                controller: 'LocationController',
                title: 'Locations'
            })
            .when('/location/:id/', {
                templateUrl: resolveTemplate('location-detail'),
                controller: 'LocationDetailController'
            })
            .when('/orgtype', {
                templateUrl: resolveTemplate('generic'),
                controller: 'OrgTypeController'
            })
            .when('/customertype', {
                templateUrl: resolveTemplate('generic'),
                controller: 'CustomerTypeController'
            })
            .when('/os', {
                templateUrl: resolveTemplate('master_list'),
                controller: 'OperatingSystemController',
                title: 'Operating Systems'
            })
            .when('/producttype', {
                templateUrl: resolveTemplate('master_list'),
                controller: 'ProductTypesController'
            })
            .when('/cloudtype', {
                templateUrl: resolveTemplate('master_list'),
                controller: 'CloudTypeController'
            })
            .when('/diskcontrollertype', {
                templateUrl: resolveTemplate('master_list'),
                controller: 'DiskControllerTypeController'
            })
            .when('/raidcontrollertype', {
                templateUrl: resolveTemplate('master_list'),
                controller: 'RAIDControllerTypeController'
            })
            .when('/chassistype', {
                templateUrl: resolveTemplate('master_list'),
                controller: 'ChassisTypeController'
            })
            .when('/motherboardmodel', {
                templateUrl: resolveTemplate('master_list'),
                controller: 'MotherboardModelController'
            })
            .when('/orgsummary', {
                templateUrl: resolveTemplate('orgsummary'),
                controller: 'OrganizationSummaryController'
            })
            .when('/user', {
                templateUrl: resolveTemplate('user_list'),
                controller: 'UserController',
                title: 'Users'
            })
            .when('/user/:id/', {
                templateUrl: resolveTemplate('user_detail'),
                controller: 'UserDetailController'
            })
            .when('/storage_management', {
                templateUrl: resolveTemplate('storage_inventory'),
                controller: 'StorageManagementController',
                title: 'Storage Records'
            })
            .when('/group', {
                templateUrl: resolveTemplate('generic'),
                controller: 'GroupController',
                title: 'Groups'
            })
            .when('/import2', {
                templateUrl: resolveTemplate('import2'),
                controller: 'ImporterController',
                title: 'Importer'
            })
            .when('/hijack', {
                templateUrl: resolveTemplate('hijack'),
                controller: 'HijackController',
                title: 'Impersonate User'
            })

            // Salesforce/Billing integration
            .when('/sf_product2', {
                templateUrl: resolveTemplate('salesforce/product2'),
                controller: 'SalesforceProduct2Controller'
            })
            .when('/sf_opportunity', {
                templateUrl: resolveTemplate('salesforce/opportunities'),
                controller: 'SalesforceOpportunityController'
            })
            .when('/sf_opportunity/:id/', {
                templateUrl: resolveTemplate('salesforce/invoices'),
                controller: 'SalesforceOpportunityDetailController'
            })
            .when('/sf_import_oppty', {
                templateUrl: resolveTemplate('salesforce/import_opportunities'),
                controller: 'SalesforceImportOpportunityController'
            })
            .when('/service_contract', {
                templateUrl: resolveTemplate('master_list'),
                controller: 'ServiceContractController'
            })
            // private cloud integration
            .when('/cloud', {
                templateUrl: resolveTemplate('cloud/private_cloud2'),
                controller: 'PrivateCloudController2'
            })
            .when('/cloud/:id/', {
                templateUrl: resolveTemplate('cloud/private_cloud_detail'),
                controller: 'PrivateCloudDetailController',
                reloadOnSearch: false
            })
            .when('/cloud-vm-list/:id', {
                templateUrl: resolveTemplate('cloud/private_cloud_vms'),
                controller: 'CloudVirtualMachineController'
            })
            .when('/vmware-vm/webconsole/:uuid/', {
                templateUrl: resolveTemplate('vmware-webconsole'),
                controller: 'VmwareWebConsoleController'
            })
            .when('/vmware-vm/webconsole/iframe/:uuid/', {
                templateUrl: resolveTemplate('vmware-webconsole'),
                controller: 'VmwareWebConsoleController'
            })
            .when('/openstack-vm/webconsole/:uuid/', {
                templateUrl: resolveTemplate('vmware-webconsole'),
                controller: 'OpenStackWebConsoleController'
            })
            .when('/openstack-vm/webconsole/iframe/:uuid/', {
                templateUrl: resolveTemplate('vmware-webconsole'),
                controller: 'OpenStackWebConsoleController'
            })

            .when('/vmware-wmks-vm/webconsole/:uuid/', {
                templateUrl: resolveTemplate('vmware-wmks-console'),
                controller: 'VmwareWmksConsoleController'
            })
            .when('/vmware-wmks-vm/webconsole/iframe/:uuid/', {
                templateUrl: resolveTemplate('vmware-wmks-console'),
                controller: 'VmwareWmksConsoleController'
            })



            .when('/tenable', {
                templateUrl: resolveTemplate('tenable/tenable_list'),
                controller: 'TenableController',
                title: 'Tenable SecurityCenter'
            })

            .when('/services/devops-scripts', {
                templateUrl: resolveTemplate('dev-ops/scripts'),
                controller: 'DevOpsScriptsController',
                title: 'DEVOPS Scripts'
            })
            .when('/services/terraform', {
                templateUrl: resolveTemplate('terraform'),
                controller: 'TerraformController',
                title: 'Terraform'
            })
            .when('/services/terraform/:uuid/', {
                templateUrl: resolveTemplate('terraform-webconsole'),
                controller: 'TerraformWebConsoleController',
                title: 'Terraform Web Console'
            })
            .when('/services/terraform/iframe/:uuid/', {
                templateUrl: resolveTemplate('terraform-webconsole'),
                controller: 'TerraformWebConsoleController',
                title: 'Terraform Web Console'
            })

            .when('/services/vm_migration', {
                templateUrl: resolveTemplate('vm-migration'),
                controller: 'VmMigrationController',
                title: 'VM Migration'
            })
            .when('/services/vm_backup', {
                templateUrl: resolveTemplate('vm-backup'),
                controller: 'VmBackupController',
                title: 'VM Backup'
            })
            .when('/services/db_instance', {
                templateUrl: resolveTemplate('db-instance'),
                controller: 'DBInstanceController',
                title: 'DB Instance'
            })

            .when('/discovery/open_audit', {
                templateUrl: resolveTemplate('collector-mapping'),
                controller: 'OrganizationCollectorMapController',
                title: 'Collector Mapping'
            })

            .when('/monitoring/configure', {
                templateUrl: resolveTemplate('monitor/configuration'),
                controller: 'OrgMonitoringConfigController',
                title: 'Monitoring Configuration'
            })

            .when('/observium/instance', {
                templateUrl: resolveTemplate('monitor/observium'),
                controller: 'ObserviumInstanceController',
                title: 'Observium - API Account'
            })
            .when('/observium/device_map', {
                templateUrl: resolveTemplate('monitor/observium'),
                controller: 'ObserviumDeviceMapController',
                title: 'Observium - Device Mapping'
            })
            .when('/observium/switch_map', {
                templateUrl: resolveTemplate('monitor/observium'),
                controller: 'ObserviumSwitchMapController',
                title: 'Observium - Switch Mapping'
            })
            .when('/observium/firewall_map', {
                templateUrl: resolveTemplate('monitor/observium'),
                controller: 'ObserviumFirewallMapController',
                title: 'Observium - Firewall Mapping'
            })
            .when('/observium/loadbalancer_map', {
                templateUrl: resolveTemplate('monitor/observium'),
                controller: 'ObserviumLoadBalancerMapController',
                title: 'Observium - LoadBalancer Mapping'
            })
            .when('/observium/server_map', {
                templateUrl: resolveTemplate('monitor/observium'),
                controller: 'ObserviumServerMapController',
                title: 'Observium - Server Mapping'
            })
            .when('/observium/vmware_vm_map', {
                templateUrl: resolveTemplate('monitor/observium'),
                controller: 'ObserviumVMwareVMMapController',
                title: 'Observium - VMware VM Mapping'
            })
            .when('/observium/openstack_vm_map', {
                templateUrl: resolveTemplate('monitor/observium'),
                controller: 'ObserviumOpenStackVMMapController',
                title: 'Observium - OpenStack VM Mapping'
            })
            .when('/observium/vcloud_vm_map', {
                templateUrl: resolveTemplate('monitor/observium'),
                controller: 'ObserviumVCloudVMMapController',
                title: 'Observium - vCloud VM Mapping'
            })
            .when('/observium/esxi_vm_map', {
                templateUrl: resolveTemplate('monitor/observium'),
                controller: 'ObserviumESXIVMMapController',
                title: 'Observium - ESXI VM Mapping'
            })
            .when('/observium/hyperv_vm_map', {
                templateUrl: resolveTemplate('monitor/observium'),
                controller: 'ObserviumHyperVVMMapController',
                title: 'Observium - Hyper-V VM Mapping'
            })
            .when('/observium/custom_cloud_vm_map', {
                templateUrl: resolveTemplate('monitor/observium'),
                controller: 'ObserviumCustomCloudVMMapController',
                title: 'Observium - Custom Cloud VM Mapping'
            })
            .when('/observium/proxmox_vm_map', {
                templateUrl: resolveTemplate('monitor/observium'),
                controller: 'ObserviumProxmoxVMMapController',
                title: 'Observium - Proxmox VM Mapping'
            })
            .when('/observium/g3kvm_vm_map', {
                templateUrl: resolveTemplate('monitor/observium'),
                controller: 'ObserviumG3KVMVMMapController',
                title: 'Observium - G3 KVM VM Mapping'
            })
            .when('/observium/aws_instance_map', {
                templateUrl: resolveTemplate('monitor/observium'),
                controller: 'ObserviumAWSInstanceMapController',
                title: 'Observium - AWS Instance Mapping'
            })
            .when('/observium/storage_map', {
                templateUrl: resolveTemplate('monitor/observium'),
                controller: 'ObserviumStorageMapController',
                title: 'Observium - Storage Mapping'
            })
            .when('/observium/macdevice_map', {
                templateUrl: resolveTemplate('monitor/observium'),
                controller: 'ObserviumMacDeviceMapController',
                title: 'Observium - Mac Device Mapping'
            })
            .when('/observium/pdu_map', {
                templateUrl: resolveTemplate('monitor/observium'),
                controller: 'ObserviumPDUMapController',
                title: 'Observium - PDU Mapping'
            })

            .when('/observium/billing_map', {
                templateUrl: resolveTemplate('monitor/observium'),
                controller: 'ObserviumBillingMapController',
                title: 'Observium Bill Mapping'
            })

            .when('/observium/switch_ports', {
                templateUrl: resolveTemplate('monitor/observium'),
                controller: 'SwitchPortMapController',
                title: 'Observium - Switch Port Mapping'
            })


            .when('/zabbix/instance', {
                templateUrl: resolveTemplate('monitor/zabbix'),
                controller: 'ZabbixInstanceController',
                title: 'Zabbix - API Account'
            })
            .when('/zabbix/customer_instance_map', {
                templateUrl: resolveTemplate('monitor/zabbix'),
                controller: 'ZabbixInstanceCustomerMapController',
                title: 'Zabbix - Instance to Customer MAP'
            })
            .when('/zabbix/template_definition', {
                templateUrl: resolveTemplate('monitor/zabbix_template_definition'),
                controller: 'ZabbixTemplateDefinitionController',
                title: 'Zabbix - Template Definition'
            })
            .when('/zabbix/template_mapping', {
                templateUrl: resolveTemplate('monitor/zabbix_template_mapping'),
                controller: 'ZabbixTemplateMappingController',
                title: 'Zabbix - Template Mapping'
            })
            .when('/zabbix/device_map', {
                templateUrl: resolveTemplate('monitor/zabbix_device_map'),
                controller: 'ZabbixDeviceMapController',
                title: 'Zabbix - Device Mapping'
            })
            .when('/zabbix/agent_details', {
                templateUrl: resolveTemplate('monitor/zabbix_agent_details'),
                controller: 'ZabbixAgentDetailsController',
                title: 'Zabbix - Agent Details'
            })

            .when('/aiops/sources', {
                templateUrl: resolveTemplate('aiops/sources'),
                controller: 'AIOPSSourceController',
                title: 'Sources'
            })

            .when('/101010', {
                templateUrl: resolveTemplate('tools'),
                controller: 'MiscToolsController',
                title: 'Developer Tools'
            })
            .when('/proxy-cookies-1', {
                templateUrl: resolveTemplate('proxy-cookies'),
                controller: 'ProxyCookiesController',
                title: 'Proxy Cookies'
            })
            .when('/activity/logs', {
                templateUrl: resolveTemplate('activity_log'),
                controller: 'AdminAuditLogController',
                title: 'Activity Logs'
            })

            .when('/cloud_setup/private_cloud', {
                templateUrl: resolveTemplate('master_list'),
                controller: 'PrivateCloudController2',
                title: 'Private Clouds'
            })

            //

            /*------------------------------------ V3 ROUTES ----------------------------------------------*/
            //General Routes

            .when('/dashboard', {
                templateUrl: '/static/rest/app/templates/v3/ul-admin/dashboard.html',
                controller: 'UladminController',
                title: 'Unity',
                reloadOnSearch: false
            })
            .when('/datacenter/:id', {
                templateUrl: '/static/rest/app/templates/v3/ul-admin/datacenter.html',
                controller: 'DatacenterControllerv3'
            })


            .when('/datacenter-all', {
                templateUrl: '/static/rest/app/templates/v3/ul-admin/datacenter-all.html',
                controller: 'AllDatacenterController'
            })
            .when('/private-clouds-all', {
                templateUrl: '/static/rest/app/templates/v3/ul-admin/private-cloud-all.html',
                controller: 'AllPrivateCloudController'
            })
            .when('/public-clouds-all', {
                templateUrl: '/static/rest/app/templates/v3/ul-admin/public-cloud-all.html',
                controller: 'AllPublicCloudController'
            })
            .when('/colocations-all', {
                templateUrl: '/static/rest/app/templates/v3/ul-admin/colocations-all.html',
                controller: 'AllColocationController'
            })


            .when('/datacenter-customer/:id', {
                templateUrl: '/static/rest/app/templates/v3/ul-admin/datacenter-all.html',
                controller: 'CustomerDatacenterController'
            })
            .when('/private-clouds-customer/:id', {
                templateUrl: '/static/rest/app/templates/v3/ul-admin/private-cloud-all.html',
                controller: 'CustomerPrivateCloudController'
            })
            .when('/public-clouds-customer/:id', {
                templateUrl: '/static/rest/app/templates/v3/ul-admin/public-cloud-all.html',
                controller: 'CustomerPublicCloudController'
            })
            .when('/colocations-customer/:id', {
                templateUrl: '/static/rest/app/templates/v3/ul-admin/colocations-all.html',
                controller: 'CustomerColocationController'
            })


            .when('/networks', {
                templateUrl: '/static/rest/app/templates/v3/networks.html',
                controller: 'NetworksController'
            })
            .when('/unitedconnect', {
                templateUrl: '/static/rest/app/templates/v3/united_connect.html',
                controller: 'UnitedConnectController'
            })
            .when('/manage_unitedconnect', {
                templateUrl: '/static/rest/app/templates/v3/megaport.html',
                controller: 'MegaportController'
            })
            .when('/manage_unitedconnect/vxc', {
                templateUrl: '/static/rest/app/templates/v3/buy_vxc.html',
                controller: 'MegaportController'
            })
            .when('/customer-dashboard/:id', {
                templateUrl: '/static/rest/app/templates/v3/ul-admin/customer_dashboard.html',
                controller: 'CustomerDasboardController'
            })
            .when('/maintenance-schedules', {
                templateUrl: resolveTemplate('master_list'),
                controller: 'MaintenanceScheduleController'
            })


            //Openstack Module Routes
            .when('/openstack-dashboard', {
                templateUrl: resolveTemplate('master_list'),
                controller: 'OpenStackDashboardController',
                title: 'OpenStack'
            })

            .when('/openstack_view/:adapter_id', {
                templateUrl: '/static/rest/app/templates/v3/openstack/openstack.html',
                controller: 'OpenstackController'
            })
            .when('/openstack_adapter/:osa_id/tenant/:tenant_id/cloudview', {
                templateUrl: '/static/rest/app/templates/v3/networks.html',
                controller: 'NetworksController'
            })
            .when('/nova', {
                templateUrl: '/static/rest/app/templates/v3/openstack/nova.html',
                controller: 'NovaController'
            })
            .when('/openstack/:adapter_id/server/:serverid', {
                templateUrl: '/static/rest/app/templates/v3/openstack/openstack_serverip.html',
                controller: 'OpenstackServerController'
            })
            .when('/openstack/:adapter_id/usage_details/:tenant_id', {
                templateUrl: '/static/rest/app/templates/v3/openstack/tenants.html',
                controller: 'OpenstackTenantsController'
            })
            .when('/openstack/:adapter_id/tokens/:tenant_id', {
                templateUrl: '/static/rest/app/templates/v3/openstack/tenants.html',
                controller: 'OpenstackTenantsController'
            })
            .when('/openstack/:adapter_id/security_groups/:tenant_id', {
                templateUrl: '/static/rest/app/templates/v3/openstack/tenants.html',
                controller: 'OpenstackTenantsController'
            })
            .when('/openstack/:adapter_id/flavor/:flavor_id/flavoraccess', {
                templateUrl: '/static/rest/app/templates/v3/openstack/tenants.html',
                controller: 'OpenstackTenantsController'
            })
            .when('/openstack/:adapter_id/list_keypairs/:tenant_id', {
                templateUrl: '/static/rest/app/templates/v3/openstack/tenants.html',
                controller: 'OpenstackTenantsController'
            })
            .when('/openstack/:adapter_id/hypervisor/:hypervisor_id', {
                templateUrl: '/static/rest/app/templates/v3/openstack/tenants.html',
                controller: 'OpenstackTenantsController'
            })
            .when('/openstack/:adapter_id/list_flavors/:tenant_id', {
                templateUrl: '/static/rest/app/templates/v3/openstack/tenants.html',
                controller: 'OpenstackTenantsController'
            })
            .when('/openstack/:adapter_id/list_vms/:hypervisor_id', {
                templateUrl: '/static/rest/app/templates/v3/openstack/tenants.html',
                controller: 'OpenstackTenantsController'
            })
            .when('/openstack/:adapter_id/list_images/:tenant_id', {
                templateUrl: '/static/rest/app/templates/v3/openstack/tenants.html',
                controller: 'OpenstackTenantsController'
            })
            // AWS Module Routes

            .when('/aws-dashboard', {
                templateUrl: '/static/rest/app/templates/v3/aws/aws_dashboard.html',
                controller: 'AwsDashboardController'
            })
            .when('/aws/:account_id/aws-region/:name', {
                templateUrl: '/static/rest/app/templates/v3/aws/aws_list_all.html',
                controller: 'AwsController'
            })
            .when('/aws/:account_id/aws-region/:name/virtual-machines', {
                templateUrl: '/static/rest/app/templates/v3/aws/aws_virtual_machines.html',
                controller: 'AwsController'
            })
            .when('/aws/:account_id/aws-region/:name/user/:username/aws-user-group', {
                templateUrl: '/static/rest/app/templates/v3/aws/aws_user_group.html',
                controller: 'AwsUserController'
            })
            .when('/aws/:account_id/aws-region/:name/user/:username/aws-user-details', {
                templateUrl: '/static/rest/app/templates/v3/aws/aws_user_details.html',
                controller: 'AwsUserController'
            })
            .when('/aws/:account_id/aws-region/:name', {
                templateUrl: '/static/rest/app/templates/v3/aws/aws_list_all.html',
                controller: 'AwsController'
            })
            .when('/aws/:account_id/aws-region/:name/instance-details/:instanceid', {
                templateUrl: '/static/rest/app/templates/v3/aws/aws_instance_detail.html',
                controller: 'AwsController'
            })
            .when('/aws/:account_id/aws-region/:name/showentities/', {
                templateUrl: '/static/rest/app/templates/v3/aws/aws_entities.html',
                controller: 'AwsController'
            })
            .when('/aws/:account_id/aws-region/:name/createimage/:instanceid', {
                templateUrl: '/static/rest/app/templates/v3/partials/create_aws_image.html',
                controller: 'AwsImageController'
            })
            .when('/aws/:account_id/aws-region/:name/attachinstance/:instanceid', {
                templateUrl: '/static/rest/app/templates/v3/aws/attach_autoscaling_group.html',
                controller: 'AwsAttachAutoscalingGroupController'
            })
            .when('/aws/:account_id/aws-region/:name/attachinterface/:instanceid', {
                templateUrl: '/static/rest/app/templates/v3/aws/attach_network_interface.html',
                controller: 'AwsAttachInterfaceController'
            })
            .when('/aws/:account_id/aws-region/:name/snapshot/:snapshotid', {
                templateUrl: '/static/rest/app/templates/v3/aws/copy_snapshot.html',
                controller: 'AwsSnapshotController'
            })
            .when('/aws_amis', {
                templateUrl: '/static/rest/app/templates/v3/aws/aws_amis.html',
                controller: 'AWSAmisController',
                title: 'AWS AMIs'
            })
            .when('/device_reports', {
                templateUrl: '/static/rest/app/templates/v3/device_reports.html',
                controller: 'DeviceReportsController',
                title: 'Device Reports'
            })
            .when('/service_catalogue', {
                templateUrl: '/static/rest/app/templates/v3/service_catalogue.html',
                controller: 'ServiceCataloguesController',
                title: 'Service Catalogues'
            })


            //Azure Interfaces
            .when('/azure-dashboard', {
                templateUrl: '/static/rest/app/templates/v3/azure/home.html',
                controller: 'AzureDashboardController'
            })
            .when('/azure/:account_id/resource_group', {
                templateUrl: '/static/rest/app/templates/v3/azure/resource_group_list.html',
                controller: 'AzureResourceGroupController'
            })
            .when('/azure/:account_id/resource_group/:resource_id/resources', {
                templateUrl: '/static/rest/app/templates/v3/azure/resource_group_list.html',
                controller: 'AzureResourcesController'
            })
            .when('/azure/resource_group', {
                templateUrl: '/static/rest/app/templates/v3/azure/resource_group_list.html',
                controller: 'AzureResourceGroupController'
            })

            // Managemet Interfaces
            // .when('/vmware-dashboard', {
            //     templateUrl: '/static/rest/app/templates/v3/vmware/vmware-dashboard.html',
            //     controller: 'vmwareController'
            // })
            .when('/vmware-dashboard', {
                templateUrl: resolveTemplate('master_list'),
                controller: 'VMwareDashboardController',
                title: 'VMware'
            })
            .when('/vmware-config', {
                templateUrl: resolveTemplate('master_list'),
                controller: 'VMwareVcenterConfigController',
                title: 'VMware Vcenter Config'
            })

            .when('/vmware-vcenter', {
                templateUrl: resolveTemplate('v3/vmware/vcenter_list'),
                controller: 'VcenterProxyController',
                title: 'Vcenter Management Interface'
            })
            .when('/vmware-esxi', {
                templateUrl: resolveTemplate('v3/vmware/esxi_list'),
                controller: 'EsxiProxyController',
                title: 'ESXi Management Interface'
            })
            .when('/openstack-proxy', {
                templateUrl: resolveTemplate('v3/openstack/openstack_list'),
                controller: 'OpenstackProxyController2',
                title: 'Openstack Management Interface'
            })
            .when('/f5-lb-proxy', {
                templateUrl: resolveTemplate('v3/networking/f5lb_list'),
                controller: 'F5LoadBalancerProxyController2',
                title: 'F5 Load Balancer Management Interface'
            })
            .when('/citrix-vpx-device', {
                templateUrl: resolveTemplate('v3/networking/citrix_list'),
                controller: 'CitrixVPXProxyController',
                title: 'Citrix Netscaler Management Interface'
            })
            .when('/cisco-firewall', {
                templateUrl: resolveTemplate('v3/networking/cisco_list'),
                controller: 'CiscoFirewallProxyController',
                title: 'Cisco (Firewall) Management Interface'
            })
            .when('/juniper-firewall', {
                templateUrl: resolveTemplate('v3/networking/cisco_list'),
                controller: 'JuniperFirewallProxyController',
                title: 'Juniper (Firewall) Management Interface'
            })
            .when('/juniper-switch', {
                templateUrl: resolveTemplate('v3/networking/juniper_list'),
                controller: 'JuniperSwitchProxyController2',
                title: 'Juniper (Switch) Management Interface'
            })
            .when('/cisco-switch', {
                templateUrl: resolveTemplate('v3/networking/juniper_list'),
                controller: 'CiscoSwitchProxyController',
                title: 'Cisco (Switch) Management Interface'
            })


            .when('/vmware-vcenter/:uuid/', {
                templateUrl: '/static/rest/app/templates/v3/proxy-detail.html',
                controller: 'VcenterProxyDetailController'
            })
            .when('/vmware-esxi/:uuid/', {
                templateUrl: '/static/rest/app/templates/v3/proxy-detail.html',
                controller: 'VmwareEsxiProxyDetailController'
            })
            .when('/openstack-proxy/:uuid/', {
                templateUrl: '/static/rest/app/templates/v3/proxy-detail.html',
                controller: 'OpenStackProxyDetailController'
            })
            .when('/f5-lb-proxy/:uuid/', {
                templateUrl: '/static/rest/app/templates/v3/proxy-detail.html',
                controller: 'F5LoadBalancerProxyDetailController'
            })
            .when('/cisco-proxy/:uuid/', {
                templateUrl: '/static/rest/app/templates/v3/proxy-detail.html',
                controller: 'CiscoProxyDetailController'
            })
            .when('/citrix-vpx-device/:uuid/', {
                templateUrl: '/static/rest/app/templates/v3/proxy-detail.html',
                controller: 'CitrixVPXDeviceProxyDetailController'
            })
            .when('/juniper-switch/:uuid/', {
                templateUrl: '/static/rest/app/templates/v3/proxy-detail.html',
                controller: 'JuniperSwitchProxyDetailController'
            })


            //Vmware Routes
            .when('/vmware/:id/:vcenter_name', {
                templateUrl: '/static/rest/app/templates/v3/vmware/vmware_view.html',
                controller: 'vmwareviewController'
            })
            .when('/vmware_view_detail/:id/:key/:vm_id', {
                templateUrl: '/static/rest/app/templates/v3/vmware/vmware_view_detail.html',
                controller: 'vmwareviewdetailController'
            })
            .when('/vmware_adapter/:vma_id/datacenter/:datacenter_id/cloudview', {
                templateUrl: '/static/rest/app/templates/v3/networks.html',
                controller: 'NetworksController'
            })
            .when('/aws_adapter/:aws_id/cloudview', {
                templateUrl: '/static/rest/app/templates/v3/networks.html',
                controller: 'NetworksController'
            })
            .when('/azure_adapter/:azure_id/cloudview', {
                templateUrl: '/static/rest/app/templates/v3/networks.html',
                controller: 'NetworksController'
            })
            // .otherwise({
            //     templateUrl: resolveTemplate('generic'),
            //     controller: 'OrganizationController'
            // })
            .otherwise({
                templateUrl: '/static/rest/app/templates/404.html',
                title: 'Page Not Found'
            })
            ;
    }
]);

app.config([
    '$resourceProvider',
    function ($resourceProvider) {
        $resourceProvider.defaults.stripTrailingSlashes = false;
    }
]);

// app.config([
//     'uiGmapGoogleMapApiProvider',
//     function (uiGmapGoogleMapApiProvider) {
//         uiGmapGoogleMapApiProvider.configure({
//             //    key: 'your api key',
//             v: '3.20', //defaults to latest 3.X anyhow
//             libraries: 'weather,geometry,visualization'
//         });
//     }
// ]);

app.config([
    '$httpProvider',
    function ($httpProvider) {
        $httpProvider.interceptors.push('redirectionProvider');
    }
]);

app.config([
    '$mdThemingProvider',
    function ($mdThemingProvider) {
        // $mdThemingProvider
        //     .theme('default')
        //     .primaryPalette('blue')
        //     .accentPalette('teal')
        //     .warnPalette('red')
        //     .backgroundPalette('grey');
        // $mdThemingProvider.alwaysWatchTheme(true);
        // $mdThemingProvider
        //     .registerStyles(
        //         '.md-toast.md-default-theme .md-toast-content, md-toast .md-toast-content{background-color:#419641;border-color:#3e8f3e}'
        //     );
    }
]);

app.provider('redirectionProvider', function () {
    var anonymousRoot = '/';

    this.$get = [
        '$q',
        '$window',
        function ($q, $window) {
            var root = anonymousRoot;
            //noinspection JSUnusedGlobalSymbols
            return {
                responseError: function (rejection) {
                    if (rejection.status === 403) {
                        $window.location.href = root;
                    }
                    return $q.reject(rejection);
                }
            };

        }
    ];
});

app.config([
    '$provide',
    function ($provide) {
        $provide.decorator('$exceptionHandler', [
            '$delegate',
            '$log',
            function ($delegate, $log) {
                return function (exception, cause) {

                    // throw exception;
                    // if (exception.hasOwnProperty('selenium')) {
                    $delegate(exception, cause);
                    // console.error(exception);
                    // } else {
                    //     exception['selenium'] = true;
                    //
                    // }
                };
            }
        ]);
    }
]);

app.run([
    '$rootScope',
    'AlertService2',
    function ($rootScope, AlertService2) {
        $rootScope.$on('$routeChangeSuccess', function (angularEvent, current, previous) {
            var title = '';
            if (angular.isDefined(current.$$route)) {
                if (angular.isDefined(current) && current.$$route.hasOwnProperty('title')) {
                    title = current.$$route.title;
                }
            }
            $rootScope.title = {
                plural: title
            };
        });

        $rootScope.alertService = AlertService2;
    }
]);
