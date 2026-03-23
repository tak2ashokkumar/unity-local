// /**
//  * Created by rt on 10/19/16.
//  */
var rest_app = angular.module('customerAPI');
rest_app.factory('CustomerULDBService', [
    '$filter',
    '$sce',
    'CustomerFieldProvider',
    'CustomerTitleProvider',
    'ServiceFunctionProvider',
    'CustomerHostMonitor',
    'CustomerMaintenance',
    'CustomerDatacenter',
    'CustomerOrganizationUser',
    'CustomerFirewall',
    'CustomerSwitch',
    'CustomerLoadBalancer',
    'CustomerServer',
    'CustomerBMServer',
    'CustomerColoCloud',
    'DataFormattingService',
    // 'ObserviumHost',
    function ($filter,
              $sce,
              CustomerFieldProvider,
              TitleProvider,
              ServiceFunctionProvider,
              HostMonitor,
              CustomerMaintenance,
              CustomerDatacenter,
              CustomerOrganizationUser,
              CustomerFirewall,
              CustomerSwitch,
              CustomerLoadBalancer,
              CustomerServer,
              CustomerBMServer,
              CustomerColoCloud,
              DataFormattingService
              // ObserviumHost,
              ) {
        // begin function

        var search = ServiceFunctionProvider.search;
        var _inf = ServiceFunctionProvider.inner_factory;
        var gen_fields = ServiceFunctionProvider.gen_fields;
        var _filter = ServiceFunctionProvider.filter;

        var hostMonitor = function () {
            var _f = [
                CustomerFieldProvider.instance_field,
                { name: "nagios_display_name", description: "Nagios Host", required: true },
                {
                    name: "last_known_state", description: "Last Known State", required: false,
                    opaque: 'arbitraryLink',
                    func: function (row) {
                        return $filter('nagios_host_state')(row.last_known_state);
                    }
                },
                { name: "last_known_output", description: "Last Known Output", required: false },
                { name: "last_checked", description: "Last Checked", required: false,
                    opaque: 'arbitraryLink',
                    func: function (row) {
                        return $filter('date')(row.last_checked, 'medium');
                    }
                }
            ];
            return _inf({
                resource: HostMonitor,
                fields: gen_fields(_f),
                path: "/host_monitor/",
                idField: 'id'
            });
        };

        var organization_users = function () {
            var _f = [
                {
                    name: "email",
                    description: "Email",
                    required: true,
                    opaque: "stringTransform",
                    readArray: [],
                    uriPrefix: '#/user/',
                    idField: 'uuid'
                },
                { name: "first_name", description: "First Name", required: true },
                { name: "last_name", description: "Last Name", required: true },
                { name: "is_active", description: "Is Active", required: true, ischeck: true, checkvalue: "Active",
                    inputMethod: {
                        type: 'choices',
                        choices: [true, false]
                    }
                },
                { name: "is_staff", description: "Is Staff", required: true, ischeck: true, hide: true, checkvalue: "Staff",
                    inputMethod: {
                        type: 'choices',
                        choices: [true, false]
                    }
                },
//                FieldProvider.instance_field("org", "Organization"),
                { name: "salesforce_id", description: "Salesforce ID",hide: true },
                // {
                //     name: 'timezone',
                //     description: 'Timezone',
                //     required: true,
                //     ischeck: true,
                //     checkvalue: 'Staff',
                //     inputMethod: {
                //         type: 'choices',
                //         choices: DataFormattingService.get_pytz_all_timezone(),
                //     }
                // },
            ];
            return _inf({
                resource: CustomerOrganizationUser,
                fields: gen_fields(_f),
                path: '#/user',
                primaryField: "email",
                idField: 'uuid'
            });
        };

        var maintenace_schedule = function (user_timezone) {
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
                        if(row.status === "F"){
                          return "Future Plan";
                        }
                        else if(row.status === "O"){
                          return "Ongoing";
                        }
                        else if(row.status === "C"){
                          return "Complete";
                        }
                        else{
                          return row.status;
                        }
                    },
                },
                {
                    name: 'colo_cloud', description: 'Datacenter', required: true,
                    opaque: 'stringTransform',
                    is_sort_disabled : true,
                    // opaque: 'link',
                    subfield: 'name',
                    readArray: ['name'],
                    // uriPrefix: '#/diskmodel/',
                    idField: 'id',
                    inputMethod: {
                        type: 'typeahead',
                        invoker: function (val) {
                            return search(CustomerColoCloud, val);
                        },
                        accessor: 'name',
                        parent_item: 'maintenace_schedule'
                    }
                },
                {
                    name: 'start_date',
                    description: 'Start Date',
                    required: true,
                    opaque: 'arbitraryLink',
                    func: function (row) {
                        // return user_timezone($filter('date')(row.start_date, 'medium'))
                        return $filter('unityDate')(row.start_date, user_timezone);
                    },
                    inputMethod: {
                        type: 'datetime'
                    }
                },
                {
                    name: 'end_date',
                    description: 'End Date',
                    required: true,
                    opaque: 'arbitraryLink',
                    func: function (row) {
                        return $filter('unityDate')(row.end_date, user_timezone);
                        // return user_timezone($filter('date')(row.end_date, 'medium'))
                    },
                    inputMethod: {
                        type: 'datetime'
                    }
                }
            ];
            return _inf({
                resource: CustomerMaintenance,
                fields: gen_fields(_f),
                path: '#/maintenance-schedules',
                primaryField: "description",
                idField: 'uuid'
            });
        };


        var firewalls = function () {
            var _f = [
                {
                    name: 'name',
                    description: 'Name',
                    required: true,
                    opaque: 'stringTransform',
                    uriPrefix: '#/firewalls/',
                    idField: 'uuid',
                    readArray: [],
                    func: function (result) {
                        return '#/firewalls/{id}'.fmt(result);
                    }
                },
                { name: "device_status", description: "Device Status", required: true, is_sort_disabled : true },
                { name: "model", description: "Model", required: true, is_sort_disabled : true },
                {
                    name: 'type',
                    description: 'Type',
                    opaque: 'arbitraryLink',
                    func: function (result) {
                        if (result.juniper_firewall || result.cisco_firewall){
                            if(result.juniper_firewall.length != 0 ){
                                return "Juniper";
                            }
                            else if(result.cisco_firewall.length != 0 ){
                                return "Cisco";
                            }
                            else{
                                return "N/A";
                            }
                            
                        }
                        return "N/A";
                    }
                },
                {
                    name: 'management_ip',
                    description: 'Management IP',
                    opaque: 'arbitraryLink',
                    is_sort_disabled : true,
                    func: function (result) {
                        if (result.management_ip !== null) {
                            return result.management_ip;
                        }
                        return "N/A";
                    }
                },
                // {
                //     name: 'status',
                //     description: 'Manage Status',
                //     opaque: 'arbitraryLink',
                //     func: function (result) {
                //         if (result.juniper_firewall || result.cisco_firewall){
                //            return "Manageable";
                //         }
                //         return "Not Configured";
                //     }
                // },
                
                //  {
                //     name: 'type',
                //     description: 'Type',
                //     opaque: 'arbitraryLink',
                //     func: function (result) {

                //         if (result.juniper_firewall){
                //             if(result.juniper_firewall.length != 0 ){
                //                 return '<a class="fa fa-external-link" title="Manage in New Tab (Juniper)" href="'+result.juniper_firewall[0].proxy_fqdn+'" target="_blank">';
                //             }
                            
                //         }
                //         else if (result.juniper_switch){
                //             if(result.juniper_switch.length != 0 ){
                //                 return "Juniper";
                //             }
                            
                //         }
                //         if (result.cisco_firewall){
                //             if(result.cisco_firewall.length != 0 ){
                //                 var external_link = '<a class="fa fa-external-link" title="Manage in New Tab (Cisco)" href="'+result.cisco_firewall[0].proxy_fqdn+'" target="_blank" />';
                //                 var internal_link = '<a class="fa fa-external-link" title="Manage in New Tab (Cisco)" href="#/cisco-firewall/'+result.cisco_firewall[0].uuid+'" />';
                //                 return $sce.trustAsHtml(external_link + internal_link);
                //             }
                            
                //         }
                //         else if (result.cisco_switch){
                //             if(result.cisco_switch.length != 0 ){
                //                 return "Cisco";
                //             }
                //         }
                //         else if(result.f5lb_proxy){
                //             if(result.f5lb_proxy.length !=0){
                //                 return "F5 Load Balancer";
                //             }
                //         }
                //         else if(result.netscaler_proxy){
                //             if(result.netscaler_proxy.length !=0){
                //                 return "Netscaler";
                //             }
                //         }
                //         return "N/A";
                //     }
                // },
            ];
            return _inf({
                resource: CustomerFirewall,
                fields: gen_fields(_f),
                path: '#/firewalls',
                idField: 'uuid'
            });
        };


        var switches = function () {
            var _f = [
                {
                    name: 'name',
                    description: 'Name',
                    required: true,
                    opaque: 'stringTransform',
                    uriPrefix: '#/switches/',
                    idField: 'uuid',
                    readArray: [],
                    func: function (result) {
                        return '#/switches/{id}'.fmt(result);
                    }
                },
                { name: "device_status", description: "Device Status", required: true, is_sort_disabled : true },
                { name: "model", description: "Model", required: true, is_sort_disabled : true },
                {
                    name: 'type',
                    description: 'Type',
                    opaque: 'arbitraryLink',
                    func: function (result) {
                        if (result.juniper_switch || result.cisco_switch){
                            if(result.juniper_switch.length != 0 ){
                                return "Juniper";
                            }
                            else if(result.cisco_switch.length != 0 ){
                                return "Cisco";
                            }
                            else{
                                return "N/A";
                            }
                            
                        }
                        return "N/A";
                    }
                },
                { name: 'management_ip',
                    description: 'Management IP',
                    opaque: 'arbitraryLink',
                    is_sort_disabled : true,
                    func: function (result) {
                        if (result.management_ip !== null) {
                            return result.management_ip;
                        }
                        return "N/A";
                    }
                },
                // {
                //     name: 'status',
                //     description: 'Manage Status',
                //     opaque: 'arbitraryLink',
                //     func: function (result) {
                //         if (result.juniper_switch || result.cisco_switch){
                //            return "Manageable";
                //         }
                //         return "Not Configured";
                //     }
                // },
            ];
            return _inf({
                resource: CustomerSwitch,
                fields: gen_fields(_f),
                path: '#/switches',
                idField: 'uuid'
            });
        };


        var load_balancers = function () {
            var _f = [
                {
                    name: 'name',
                    description: 'Name',
                    required: true,
                    opaque: 'stringTransform',
                    uriPrefix: '#/load_balancers/',
                    idField: 'uuid',
                    readArray: [],
                    func: function (result) {
                        return '#/load_balancers/{id}'.fmt(result);
                    }
                },
                { name: "device_status", description: "Device Status", required: true, is_sort_disabled : true },
                { name: "model", description: "Model", required: true, is_sort_disabled : true },
                {
                    name: 'type',
                    description: 'Type',
                    opaque: 'arbitraryLink',
                    func: function (result) {
                        if (result.netscaler_proxy || result.f5lb_proxy){
                            if(result.netscaler_proxy.length != 0 ){
                                return "Netscaler";
                            }
                            else if(result.f5lb_proxy.length != 0 ){
                                return "F5 LoadBalancer";
                            }
                            else{
                                return "N/A";
                            }
                            
                        }
                        return "N/A";
                    }
                },
                { name: 'management_ip',
                    description: 'Management IP',
                    opaque: 'arbitraryLink',
                    is_sort_disabled : true,
                    func: function (result) {
                        if (result.management_ip !== null) {
                            return result.management_ip;
                        }
                        return "N/A";
                    }
                },
                // {
                //     name: 'status',
                //     description: 'Manage Status',
                //     opaque: 'arbitraryLink',
                //     func: function (result) {
                //         if (result.netscaler_proxy || result.f5lb_proxy){
                //            return "Manageable";
                //         }
                //         return "Not Configured";
                //     }
                // },
            ];
            return _inf({
                resource: CustomerLoadBalancer,
                fields: gen_fields(_f),
                path: '#/load_balancers',
                idField: 'uuid'
            });
        };


        var servers = function () {
            var _f = [
                 {
                    name: 'name',
                    description: 'Name',
                    required: true,
                    opaque: 'stringTransform',
                    uriPrefix: '#/servers/',
                    idField: 'id',
                    readArray: [],
                    func: function (result) {
                        return '#/servers/{id}'.fmt(result);
                    }
                },
                { name: "device_status", description: "Device Status", required: true, is_sort_disabled : true },
                {
                    name: "instance", description: "System Type", required: true,
                    opaque: 'stringTransform',
                    subfield: "instance_type",
                    readArray: ['instance_type'],
                    read: function (result) {
                        if (result.instance !== null) {

                            if (result.instance.instance_type !== null){
                                return result.instance.instance_type;
                            }
                        }
                        return "N/A";
                    }
                },
                {
                    name: "instance", description: "Virtualization Type", required: true,
                    opaque: 'stringTransform',
                    subfield: "virtualization_type",
                    readArray: ['virtualization_type'],
                    read: function (result) {
                        if (result.instance !== null) {

                            if (result.instance.virtualization_type !== null){
                                return result.instance.virtualization_type;
                            }
                        }
                        return "N/A";
                    }
                },
                {
                    name: 'instance',
                    description: 'OS',
                    opaque: 'arbitraryLink',
                    is_sort_disabled : true,
                    func: function (result) {
                        if (result.instance !== null) {

                            if (result.instance.os !== null){
                                return result.instance.os.full_name;
                            }
                        }
                        return "N/A";
                    }
                },
                {
                    name: 'private_cloud',
                    description: 'Cloud',
                    opaque: 'arbitraryLink',
                    is_sort_disabled : true,
                    func: function (result) {
                        if (result.private_cloud !== null) {

                            return result.private_cloud.name;
                        }
                        return "N/A";
                    }
                }
            ];
            return _inf({
                resource: CustomerServer,
                fields: gen_fields(_f),
                path: '#/servers',
                idField: 'uuid'
            });
        };

        //
        // var observium_host = function () {
        //     var _f = [
        //         FieldProvider.self_name_field(ObserviumHost, 'hostname'),
        //         { name: "location", description: "Location", required: true },
        //         { name: "os", description: "OS", required: true },
        //         { name: "serial", description: "Serial", required: true },
        //         { name: "type", description: "Type", required: true },
        //         { name: "uptime", description: "Uptime", required: true },
        //         { name: "uptime_human", description: "Uptime (Human)", required: true },
        //         { name: "version", description: "Version", required: true }
        //     ];
        //     return _inf({
        //         resource: ObserviumHost,
        //         fields: gen_fields(_f),
        //         path: "/observium_host/",
        //         idField: 'id'
        //     });
        // };


        return {
            hostMonitor: hostMonitor,
            maintenace_schedule: maintenace_schedule,
            organization_users: organization_users,
            firewalls: firewalls,
            switches: switches,
            load_balancers: load_balancers,
            servers: servers,
            // observium_host: observium_host,
        };
    }
]);

rest_app.factory('ProxyDetailControllerService', function ($q, $rootScope, $http) {
    return {
        updateActivityLog: function(instance_id, device_type){
            console.log("device_type : " + device_type);
            var url = '/customer/' + device_type + '/' + instance_id + '/update_activity_log/';
            $http({
                method: "POST",
                url: url
            }).then(function (response) {
                console.log("Updated activity log successfully");
            }).catch(function (error) {
                console.log("Error while updating activity log: " + angular.toJson(error));
            });
        }
    };
});
