/**
 * (C) 2015 UnitedLayer, LLC
 */
var app = angular.module('uldb',
    [
        'ngSanitize',
        'ngAnimate',
        'ui.router',
        'ngRoute',
        'ui.bootstrap',
        'ngMaterial',
        'ui.bootstrap.datetimepicker',
        'ui.dateTimeInput',
        'angularUtils.directives.uiBreadcrumbs',
        'daterangepicker',
        'ngScrollbars',
        'infinite-scroll',
        'btorfs.multiselect',
        'nvd3',
        'chart.js',
        'mwl.calendar',
        'ngFileUpload',
        'ngNotify',
        'dndLists',
        'LocalStorageModule',
        'customerAPI',
        'uldbfilters',
        'cgBusy',
        'rzSlider',
        'angular.vertilize',
        // 'uiGmapgoogle-maps',
    ]);


app.constant('OberviumGraphConfig', {

    'PDU' : {
        'HEALTHGRAPHS' : {
            'OVERVIEW' : [

                {
                    'DISPLAYNAME': 'Status',
                    'GRAPHNAME': 'device_status',
                },
                {
                    'DISPLAYNAME': 'Current',
                    'GRAPHNAME': 'device_current',
                },
                {
                    'DISPLAYNAME': 'Power',
                    'GRAPHNAME': 'device_power',
                },
                {
                    'DISPLAYNAME': 'Voltage',
                    'GRAPHNAME': 'device_voltage',
                }
            ]
        },
        'GRAPHS': {
            'NETSTATS': [
                {
                    'DISPLAYNAME': 'ICMP Statistics',
                    'GRAPHNAME': 'device_netstat_icmp',
                },
                {
                    'DISPLAYNAME': 'ICMP Informational Statistics',
                    'GRAPHNAME': 'device_netstat_icmp_info',
                },
                {
                    'DISPLAYNAME': 'IP Statistics',
                    'GRAPHNAME': 'device_netstat_ip',
                },
                {
                    'DISPLAYNAME': 'IP Fragmentation Statistics',
                    'GRAPHNAME': 'device_netstat_ip_frag',
                },
                {
                    'DISPLAYNAME': 'SNMP Packets',
                    'GRAPHNAME': 'device_netstat_snmp_packets',
                },
                {
                    'DISPLAYNAME': 'SNMP Statistics',
                    'GRAPHNAME': 'device_netstat_snmp_stats',
                },
                {
                    'DISPLAYNAME': 'TCP Established Connections',
                    'GRAPHNAME': 'device_netstat_tcp_currestab',
                },
                {
                    'DISPLAYNAME': 'TCP Segments',
                    'GRAPHNAME': 'device_netstat_tcp_segments',
                },
                {
                    'DISPLAYNAME': 'TCP Statistics',
                    'GRAPHNAME': 'device_netstat_tcp_stats',
                },
                {
                    'DISPLAYNAME': 'UDP Datagrams',
                    'GRAPHNAME': 'device_netstat_udp_datagrams',
                },
                {
                    'DISPLAYNAME': 'UDP Errors',
                    'GRAPHNAME': 'device_netstat_udp_errors',
                }
            ],
            'POLLER': [
                {
                    'DISPLAYNAME': 'Ping Response',
                    'GRAPHNAME': 'device_ping',
                },
                {
                    'DISPLAYNAME': 'SNMP Response',
                    'GRAPHNAME': 'device_ping_snmp',
                },
                {
                    'DISPLAYNAME': 'Poller Duration',
                    'GRAPHNAME': 'device_poller_perf',
                }
            ],
            'SYSTEM': [
                {
                    'DISPLAYNAME': 'Device Uptime',
                    'GRAPHNAME': 'device_uptime',
                }
            ]
        }
    },
    'FIREWALL': {
        'GRAPHS': {
            'FIREWALL': [
                {
                    'DISPLAYNAME': 'Firewall Sessions (IPv4)',
                    'GRAPHNAME': 'device_firewall_sessions_ipv4',
                }
            ],
            'NETSTATS': [
                {
                    'DISPLAYNAME': 'ICMP Statistics',
                    'GRAPHNAME': 'device_netstat_icmp',
                },
                {
                    'DISPLAYNAME': 'ICMP Informational Statistics',
                    'GRAPHNAME': 'device_netstat_icmp_info',
                },
                {
                    'DISPLAYNAME': 'IP Statistics',
                    'GRAPHNAME': 'device_netstat_ip',
                },
                {
                    'DISPLAYNAME': 'IP Fragmentation Statistics',
                    'GRAPHNAME': 'device_netstat_ip_frag',
                },
                {
                    'DISPLAYNAME': 'SNMP Packets',
                    'GRAPHNAME': 'device_netstat_snmp_packets',
                },
                {
                    'DISPLAYNAME': 'SNMP Statistics',
                    'GRAPHNAME': 'device_netstat_snmp_stats',
                },
                {
                    'DISPLAYNAME': 'TCP Established Connections',
                    'GRAPHNAME': 'device_netstat_tcp_currestab',
                },
                {
                    'DISPLAYNAME': 'TCP Segments',
                    'GRAPHNAME': 'device_netstat_tcp_segments',
                },
                {
                    'DISPLAYNAME': 'TCP Statistics',
                    'GRAPHNAME': 'device_netstat_tcp_stats',
                },
                {
                    'DISPLAYNAME': 'UDP Datagrams',
                    'GRAPHNAME': 'device_netstat_udp_datagrams',
                },
                {
                    'DISPLAYNAME': 'UDP Errors',
                    'GRAPHNAME': 'device_netstat_udp_errors',
                }
            ],
            'POLLER': [
                {
                    'DISPLAYNAME': 'Ping Response',
                    'GRAPHNAME': 'device_ping',
                },
                {
                    'DISPLAYNAME': 'SNMP Response',
                    'GRAPHNAME': 'device_ping_snmp',
                },
                {
                    'DISPLAYNAME': 'Poller Duration',
                    'GRAPHNAME': 'device_poller_perf',
                }
            ],
            'FIREWALL_GRAPHS': [
                {
                    'DISPLAYNAME': 'IPSec Tunnel Traffic Volume',
                    'GRAPHNAME': 'device_cipsec_flow_bits',
                },
                {
                    'DISPLAYNAME': 'IPSec Tunnel Traffic Packets',
                    'GRAPHNAME': 'device_cipsec_flow_pkts',
                },
                {
                    'DISPLAYNAME': 'IPSec Tunnel Statistics',
                    'GRAPHNAME': 'device_cipsec_flow_stats',
                },
                {
                    'DISPLAYNAME': 'IPSec Active Tunnels',
                    'GRAPHNAME': 'device_cipsec_flow_tunnels',
                },
                {
                    'DISPLAYNAME': 'Remote Access Sessions',
                    'GRAPHNAME': 'device_cras_sessions',
                },
                {
                    'DISPLAYNAME': 'Firewall Sessions (IPv4)',
                    'GRAPHNAME': 'device_firewall_sessions_ipv4',
                }
            ],
            'SYSTEM': [
                {
                    'DISPLAYNAME': 'Memory Usage',
                    'GRAPHNAME': 'device_mempool',
                },
                {
                    'DISPLAYNAME': 'Processors',
                    'GRAPHNAME': 'device_processor',
                },
                {
                    'DISPLAYNAME': 'Device Uptime',
                    'GRAPHNAME': 'device_uptime',
                }
            ]
        },
        'HEALTHGRAPHS': {
            'OVERVIEW': [
                {
                    'DISPLAYNAME': 'Processor',
                    'GRAPHNAME': 'device_processor',
                },
                {
                    'DISPLAYNAME': 'Memory',
                    'GRAPHNAME': 'device_mempool',
                }
            ]
        },
    },
    'SWITCH': {
        'HEALTHGRAPHS': {
            'OVERVIEW': [
                {
                    'DISPLAYNAME': 'Processor',
                    'GRAPHNAME': 'device_processor',
                },
                {
                    'DISPLAYNAME': 'Status',
                    'GRAPHNAME': 'device_status',
                },
                {
                    'DISPLAYNAME': 'Power',
                    'GRAPHNAME': 'device_power',
                },
                {
                    'DISPLAYNAME': 'Temperature',
                    'GRAPHNAME': 'device_temperature',
                }
            ]
        },
        'GRAPHS': {
            'NETSTATS': [
                {
                    'DISPLAYNAME': 'ICMP Statistics',
                    'GRAPHNAME': 'device_netstat_icmp',
                },
                {
                    'DISPLAYNAME': 'ICMP Informational Statistics',
                    'GRAPHNAME': 'device_netstat_icmp_info',
                },
                {
                    'DISPLAYNAME': 'IP Statistics',
                    'GRAPHNAME': 'device_netstat_ip',
                },
                {
                    'DISPLAYNAME': 'IP Fragmentation Statistics',
                    'GRAPHNAME': 'device_netstat_ip_frag',
                },
                {
                    'DISPLAYNAME': 'SNMP Packets',
                    'GRAPHNAME': 'device_netstat_snmp_packets',
                },
                {
                    'DISPLAYNAME': 'SNMP Statistics',
                    'GRAPHNAME': 'device_netstat_snmp_stats',
                },
                {
                    'DISPLAYNAME': 'TCP Established Connections',
                    'GRAPHNAME': 'device_netstat_tcp_currestab',
                },
                {
                    'DISPLAYNAME': 'TCP Segments',
                    'GRAPHNAME': 'device_netstat_tcp_segments',
                },
                {
                    'DISPLAYNAME': 'TCP Statistics',
                    'GRAPHNAME': 'device_netstat_tcp_stats',
                },
                {
                    'DISPLAYNAME': 'UDP Datagrams',
                    'GRAPHNAME': 'device_netstat_udp_datagrams',
                },
                {
                    'DISPLAYNAME': 'UDP Errors',
                    'GRAPHNAME': 'device_netstat_udp_errors',
                }
            ],
            'POLLER': [
                {
                    'DISPLAYNAME': 'Ping Response',
                    'GRAPHNAME': 'device_ping',
                },
                {
                    'DISPLAYNAME': 'SNMP Response',
                    'GRAPHNAME': 'device_ping_snmp',
                },
                {
                    'DISPLAYNAME': 'Poller Duration',
                    'GRAPHNAME': 'device_poller_perf',
                }
            ],
            'SYSTEM': [
                {
                    'DISPLAYNAME': 'FDB Usage',
                    'GRAPHNAME': 'device_fdb_count',
                },
                {
                    'DISPLAYNAME': 'Processors',
                    'GRAPHNAME': 'device_processor',
                },
                {
                    'DISPLAYNAME': 'Device Uptime',
                    'GRAPHNAME': 'device_uptime',
                }
            ]

        }
    },
    'LOAD_BALANCER': {
        'HEALTHGRAPHS': {
            'OVERVIEW': [
                {
                    'DISPLAYNAME': 'Processor',
                    'GRAPHNAME': 'device_processor',
                },
                {
                    'DISPLAYNAME': 'Memory',
                    'GRAPHNAME': 'device_mempool',
                },
                {
                    'DISPLAYNAME': 'Status',
                    'GRAPHNAME': 'device_status',
                }
            ]
        },
        'GRAPHS': {
            'NETSTATS': [
                {
                    'DISPLAYNAME': 'ICMP Statistics',
                    'GRAPHNAME': 'device_netstat_icmp',
                },
                {
                    'DISPLAYNAME': 'ICMP Informational Statistics',
                    'GRAPHNAME': 'device_netstat_icmp_info',
                },
                {
                    'DISPLAYNAME': 'IP Statistics',
                    'GRAPHNAME': 'device_netstat_ip',
                },
                {
                    'DISPLAYNAME': 'IP Fragmentation Statistics',
                    'GRAPHNAME': 'device_netstat_ip_frag',
                },
                {
                    'DISPLAYNAME': 'SNMP Packets',
                    'GRAPHNAME': 'device_netstat_snmp_packets',
                },
                {
                    'DISPLAYNAME': 'SNMP Statistics',
                    'GRAPHNAME': 'device_netstat_snmp_stats',
                },
                {
                    'DISPLAYNAME': 'TCP Established Connections',
                    'GRAPHNAME': 'device_netstat_tcp_currestab',
                },
                {
                    'DISPLAYNAME': 'TCP Segments',
                    'GRAPHNAME': 'device_netstat_tcp_segments',
                },
                {
                    'DISPLAYNAME': 'TCP Statistics',
                    'GRAPHNAME': 'device_netstat_tcp_stats',
                },
                {
                    'DISPLAYNAME': 'UDP Datagrams',
                    'GRAPHNAME': 'device_netstat_udp_datagrams',
                },
                {
                    'DISPLAYNAME': 'UDP Errors',
                    'GRAPHNAME': 'device_netstat_udp_errors',
                }
            ],
            'POLLER': [
                {
                    'DISPLAYNAME': 'Ping Response',
                    'GRAPHNAME': 'device_ping',
                },
                {
                    'DISPLAYNAME': 'SNMP Response',
                    'GRAPHNAME': 'device_ping_snmp',
                },
                {
                    'DISPLAYNAME': 'Poller Duration',
                    'GRAPHNAME': 'device_poller_perf',
                }
            ],
            'SYSTEM': [
                {
                    'DISPLAYNAME': 'FDB Usage',
                    'GRAPHNAME': 'device_fdb_count',
                },
                {
                    'DISPLAYNAME': 'Memory Usage',
                    'GRAPHNAME': 'device_mempool',
                },
                {
                    'DISPLAYNAME': 'Processors',
                    'GRAPHNAME': 'device_processor',
                },
                {
                    'DISPLAYNAME': 'Device Uptime',
                    'GRAPHNAME': 'device_uptime',
                }
            ]
        }
    },
    'SERVER': {
        'HEALTHGRAPHS': {
            'OVERVIEW': [
                {
                    'DISPLAYNAME': 'Processor',
                    'GRAPHNAME': 'device_processor',
                },
                {
                    'DISPLAYNAME': 'Memory',
                    'GRAPHNAME': 'device_mempool',
                },
                {
                    'DISPLAYNAME': 'Storage',
                    'GRAPHNAME': 'device_storage',
                },
                {
                    'DISPLAYNAME': 'Disk I/O',
                    'GRAPHNAME': 'device_diskio',
                }
            ]
        },
        'GRAPHS': {
            'SYSTEM': [
                {
                    'DISPLAYNAME': 'Running Processes',
                    'GRAPHNAME': 'device_hr_processes',
                },
                {
                    'DISPLAYNAME': 'Users Logged In',
                    'GRAPHNAME': 'device_hr_users',
                },
                {
                    'DISPLAYNAME': 'Memory Usage',
                    'GRAPHNAME': 'device_mempool',
                },
                {
                    'DISPLAYNAME': 'Processors',
                    'GRAPHNAME': 'device_processor',
                },
                {
                    'DISPLAYNAME': 'Filesystem Usage',
                    'GRAPHNAME': 'device_storage',
                },
                {
                    'DISPLAYNAME': 'Context Switches',
                    'GRAPHNAME': 'device_ucd_contexts',
                },
                {
                    'DISPLAYNAME': 'Detailed Processor Utilization',
                    'GRAPHNAME': 'device_ucd_cpu',
                },
                {
                    'DISPLAYNAME': 'System Interrupts',
                    'GRAPHNAME': 'device_ucd_interrupts',
                },
                {
                    'DISPLAYNAME': 'System I/O Activity',
                    'GRAPHNAME': 'device_ucd_io',
                },
                {
                    'DISPLAYNAME': 'Load Averages',
                    'GRAPHNAME': 'device_ucd_load',
                },
                {
                    'DISPLAYNAME': 'Detailed Memory',
                    'GRAPHNAME': 'device_ucd_memory',
                },
                {
                    'DISPLAYNAME': 'Extended Processor Utilization',
                    'GRAPHNAME': 'device_ucd_ss_cpu',
                },
                {
                    'DISPLAYNAME': 'Swap I/O Activity',
                    'GRAPHNAME': 'device_ucd_swap_io',
                },
                {
                    'DISPLAYNAME': 'Device Uptime',
                    'GRAPHNAME': 'device_uptime',
                }
            ],
            'NETSTATS': [
                {
                    'DISPLAYNAME': 'IPv4 Packet Statistics',
                    'GRAPHNAME': 'device_ipsystemstats_ipv4',
                },
                {
                    'DISPLAYNAME': 'IPv4 Fragmentation Statistics',
                    'GRAPHNAME': 'device_ipsystemstats_ipv4_frag',
                },
                {
                    'DISPLAYNAME': 'IPv6 Packet Statistics',
                    'GRAPHNAME': 'device_ipsystemstats_ipv6',
                },
                {
                    'DISPLAYNAME': 'IPv6 Fragmentation Statistics',
                    'GRAPHNAME': 'device_ipsystemstats_ipv6_frag',
                },
                {
                    'DISPLAYNAME': 'ICMP Statistics',
                    'GRAPHNAME': 'device_netstat_icmp',
                },
                {
                    'DISPLAYNAME': 'ICMP Informational Statistics',
                    'GRAPHNAME': 'device_netstat_icmp_info',
                },
                {
                    'DISPLAYNAME': 'IP Statistics',
                    'GRAPHNAME': 'device_netstat_ip',
                },
                {
                    'DISPLAYNAME': 'IP Fragmentation Statistics',
                    'GRAPHNAME': 'device_netstat_ip_frag',
                },
                {
                    'DISPLAYNAME': 'SNMP Packets',
                    'GRAPHNAME': 'device_netstat_snmp_packets',
                },
                {
                    'DISPLAYNAME': 'SNMP Statistics',
                    'GRAPHNAME': 'device_netstat_snmp_stats',
                },
                {
                    'DISPLAYNAME': 'TCP Established Connections',
                    'GRAPHNAME': 'device_netstat_tcp_currestab',
                },
                {
                    'DISPLAYNAME': 'TCP Segments',
                    'GRAPHNAME': 'device_netstat_tcp_segments',
                },
                {
                    'DISPLAYNAME': 'TCP Statistics',
                    'GRAPHNAME': 'device_netstat_tcp_stats',
                },
                {
                    'DISPLAYNAME': 'UDP Datagrams',
                    'GRAPHNAME': 'device_netstat_udp_datagrams',
                },
                {
                    'DISPLAYNAME': 'UDP Errors',
                    'GRAPHNAME': 'device_netstat_udp_errors',
                }
            ],
            'POLLER': [
                {
                    'DISPLAYNAME': 'Ping Response',
                    'GRAPHNAME': 'device_ping',
                },
                {
                    'DISPLAYNAME': 'SNMP Response',
                    'GRAPHNAME': 'device_ping_snmp',
                },
                {
                    'DISPLAYNAME': 'Poller Duration',
                    'GRAPHNAME': 'device_poller_perf',
                }
            ],
        }
    },

    'PORTS' :[
        {
            'DISPLAYNAME' : 'Traffic',
            'GRAPHNAME' : 'port_bits',
        },
        {
            'DISPLAYNAME' : 'Unicast Packets',
            'GRAPHNAME' : 'port_upkts',
        },
        {
            'DISPLAYNAME' : 'Non Unicast Packets',
            'GRAPHNAME' : 'port_nupkts',
        },
        {
            'DISPLAYNAME' : 'Average Packet Size',
            'GRAPHNAME' : 'port_pktsize',
        },
        {
            'DISPLAYNAME' : 'Percent Utilization',
            'GRAPHNAME' : 'port_percent',
        },
        {
            'DISPLAYNAME' : 'Errors',
            'GRAPHNAME' : 'port_errors',
        },
        {
            'DISPLAYNAME' : 'Discards',
            'GRAPHNAME' : 'port_discards',
        }
    ],
    'VM_OVERVIEW': {
        'PROCESSOR': 'device_processor',
        'MEMORY': 'device_ucd_memory'
    }
});


app.constant('UnityConstants', {

    monitoring_not_enabled_msg : 'Monitoring not Enabled',
    OBSERVIUM_DEVICE_NAMES : {
        servers : 'servers',
        pdus : 'pdu',
        firewalls : 'firewall',
        switches : 'switch',
        load_balancers : 'load_balancer',
    },
    OBSERVIUM_MAPPING_NAMES : {
        servers : 'SERVER',
        pdus : 'PDU',
        firewalls : 'FIREWALL',
        switches : 'SWITCH',
        load_balancers : 'LOAD_BALANCER',
    },

    ul_details : {
        emial : 'support@unitedlayer.com',
        contact_number : '888-853-7733',
        firewall_manufacturer : 'Juniper',
        firewall_model : 'SRX240H2',
        firewall_version : '12.1X46-D35.1',
        ip_address : '209.X.X.X',
        hosts : 'Will be shared in private by our support team.'
    }

});


var $stateProviderRef = null;
var $urlRouterProviderRef = null;

app.factory('httpInterceptor', function ($q, $rootScope, $log, $location, $window, localStorageService) {

    var numLoadings = 0;

    return {
        request: function (config) {
            numLoadings++;
            $rootScope.$broadcast("loader_show");
            return config || $q.when(config);

        },
        response: function (response) {
            if ((--numLoadings) === 0) {
                $rootScope.$broadcast("loader_hide");
            }
            return response || $q.when(response);

        },
        responseError: function (response) {
            if ((response.status === 401) || (response.status === 403)) {
                var path = angular.copy($location.path());
                localStorageService.clearAll();
                $window.location.href = '/account/login/?next=/main#' + path;
            }

            if (!(--numLoadings)) {
                $rootScope.$broadcast("loader_hide");
            }
            return $q.reject(response);
        }
    };
});

app.config(function ($httpProvider) {
    $httpProvider.interceptors.push('httpInterceptor');
});

// app.factory(function ($httpProvider) {
//   $httpProvider.interceptors.push(function($q, $rootScope) {
//     return {
//       'request': function(config) {
//           $rootScope.$broadcast('http:request:start');
//           return config;
//        },
//        'response': function(response) {
//           $rootScope.$broadcast('http:request:end');
//           return $q.reject(response);
//        }
//      };
//    });
//  });

app.run(['$trace', '$rootScope', '$location', '$window', '$state', '$transitions', 'localStorageService', 'ngNotify', 'AlertService2', 'OberviumGraphConfig', 'UnityConstants', function ($trace, $rootScope, $location, $window, $state, $transitions, localStorageService, ngNotify, AlertService2, OberviumGraphConfig, UnityConstants) {

    $rootScope.angular = angular;
    $rootScope.alertService = AlertService2;
    $rootScope.OberviumGraphConfig = OberviumGraphConfig;

    $rootScope.configObject = {};
    $rootScope.configObject.paginate = true;
    $rootScope.configObject.page_size = 10;

    $rootScope.disable_action = false;
    $rootScope.disable_action_btn = false;
    $rootScope.displaythirdleveltabs = false;

    //$trace.enable('TRANSITION');

    $rootScope.$stateProviderRef = $stateProviderRef;
    $rootScope.$urlRouterProviderRef = $urlRouterProviderRef;

    $transitions.onStart({}, function ($transitions) {
        $rootScope.view_mode = undefined;
        console.log('state start');
        $rootScope.fromState = angular.copy($transitions.$from());
        $rootScope.toState = angular.copy($transitions.$to());
    });

    var getStateName = function (stateParams, targetState) {
        var locationPath = $location.path();
        var currentUrl = '#' + locationPath;
        var stateArray = targetState.name.split('.');
        var urlArray = locationPath.split('/');
        urlArray.shift();
        if (targetState.navigable.data && (targetState.navigable.data.href.search("{}") !== -1)) {
            if ((stateArray[0] === 'private_cloud')) {
                for (var i = 0; i < stateArray.length; i++) {
                    if (i === 1) {
                        for (var j = 0; j < $rootScope.privateClouldObj.submenu.length; j++) {
                            if (urlArray[i] === $rootScope.privateClouldObj.submenu[j].uuid) {
                                if ((stateArray[1] === $rootScope.privateClouldObj.submenu[j].name) && stateArray[2] === urlArray[2]) {
                                    stateArray[i] = angular.lowercase($rootScope.privateClouldObj.submenu[j].name.replace(/[\s]/g, ''));
                                } else {
                                    stateArray[i] = angular.lowercase($rootScope.privateClouldObj.submenu[j].name.replace(/[\s]/g, ''));
                                }
                            }
                        }
                    } else {
                        stateArray[i] = urlArray[i];
                    }
                }
            }
            // else if((stateArray[0] === 'private_cloud')){

            // }
        } else {
            /*console.log('in else of getStateName with currentUrl as : ', currentUrl);
             console.log('in else of getStateName with target as : ', targetState.navigable.data.href);
             console.log('in else of getStateName with stateArray as : ', angular.toJson(stateArray));
             console.log('in else of getStateName with urlArray as : ', angular.toJson(urlArray));*/
            /*if(!angular.equals(currentUrl,targetState.navigable.data.href)){
             for(var i = 0; i < stateArray.length; i++){
             stateArray[i] = urlArray[i];
             }
             }*/
        }
        var stateName = '';
        for (var i = 0; i < stateArray.length; i++) {
            if (i === 0) {
                stateName = stateArray[i];
            } else {
                stateName = stateName.concat('.').concat(stateArray[i]);
            }
        }
        console.log('stateName : ', stateName);
        return stateName;
    };

    $transitions.onSuccess({}, function ($transitions) {
        $("html, body").animate({scrollTop: 0}, 'slow');
        var title = '';
        var params = $transitions.params();
        var toState = $transitions.$to();
        var toStateName = getStateName(params, toState);
        if (toStateName !== null) {
            $state.go(toStateName, $transitions.params(), {reload: false});
            $rootScope.toState.name = toStateName;
        }
        $rootScope.getSubmenuObjects();
        if (angular.isDefined(toState.data)) {
            if (toState.data.hasOwnProperty('title')) {
                title = toState.data.title;
            }
        }
        $rootScope.header = "Unity";
        // if($rootScope.banner_active){
        //     ngNotify.dismiss();
        // }
        $rootScope.banner_active = false;
        return false;
    });

    $rootScope.monitoring_not_enabled_msg = UnityConstants.monitoring_not_enabled_msg;
    $rootScope.unity_constants = UnityConstants;

    $rootScope.$on('$locationChangeSuccess', function(event) {
        // console.log('************locationChangeSuccess********************');
        if (!$window.ga)
            return;
        $window.ga('send', 'pageview', { page: $location.path() });
    });
    
}]);

var resolveTemplate = function (templateName) {
    return '/static/rest/app/client/templates/' + templateName + '.html';
};

var resolveAzureTemplate = function (templateName) {
    return '/static/rest/app/client/templates/cloud/azure/' + templateName + '.html';
};

var resolveGCPTemplate = function (templateName) {
    return '/static/rest/app/client/templates/gcp/' + templateName + '.html';
};

app.config(function ($stateProvider, $urlRouterProvider, $injector) {

    $stateProvider
        .state('account', {
            url: '/account',
            templateUrl: resolveTemplate('account'),
            controller: 'CustomerAccountController',
            data: {
                href: '#/account',
                displayName: 'Profile Settings',
            }
        })

        .state('two_factor_auth', {
            url: '/two_factor_authentication',
            templateUrl: resolveTemplate('two_factor_auth'),
            controller: 'TwoFactorAuthController',
            data: {
                href: '#/two_factor_authentication',
                displayName: 'Two Factor Authentication',
            }
        })

        .state('dashboard', {
            url: '/dashboard',
            templateUrl: resolveTemplate('client-dashboard'),
            controller: 'ClientDashboardController',
            data: {
                mainMenuItem: 'UnityView',
                href: '#/dashboard',
                displayName: 'Dashboard',
            }
        })

        .state('home', {
            url: '/unity',
            templateUrl: resolveTemplate('landing_page'),
            controller: 'CustomerLandingPageController',
            data: {
                href: '#/unity',
                displayName: 'Welcome to Unity',
            }
        })

        .state('about', {
            url: '/unity/:uuidp',
            templateUrl: resolveTemplate('landing_page'),
            controller: 'CustomerLandingPageController',
            data: {
                href: '#/unity/:uuidp',
                displayName: 'Welcome to Unity',
            }
        })

        .state('noc-1', {
            url: '/noc-1',
            templateUrl: resolveTemplate('noc-1'),
            controller: 'CustomerNocController',
            data: {
                href: '#/noc-1',
                displayName: 'NOC view',
            }
        })

        .state('noc-2', {
            url: '/noc-2',
            templateUrl: resolveTemplate('noc-2'),
            controller: 'CustomerNocController',
            data: {
                href: '#/noc-2',
                displayName: 'NOC view',
            }
        })

        .state('noc-3', {
            url: '/noc-3',
            templateUrl: resolveTemplate('noc-3'),
            controller: 'CustomerNocController',
            data: {
                href: '#/noc-3',
                displayName: 'NOC view',
            }
        })

        .state('noc-4', {
            url: '/noc-4',
            templateUrl: resolveTemplate('noc-4'),
            controller: 'CustomerNocController',
            data: {
                href: '#/noc-4',
                displayName: 'NOC view',
            }
        })
        .state('noc-5', {
            url: '/noc-5',
            templateUrl: resolveTemplate('noc-5'),
            controller: 'CustomerNocController',
            data: {
                href: '#/noc-5',
                displayName: 'NOC view',
            }
        })
        .state('td-1', {
            url: '/td-1',
            templateUrl: resolveTemplate('td-1'),
            controller: 'CustomerTDController',
            data: {
                href: '#/td-1',
                displayName: 'Test Dashboard view',
            }
        })
        // .state('moniter', {
        //     url:'/monitor',
        //     templateUrl: resolveTemplate('lm-widget'),
        //     controller: 'LMWidgetController',

        // New monitoring states 
        .state('infrastructure_monitoring', {
            url: '/infrastructure_monitoring',
            abstract: true,
            templateUrl: resolveTemplate('submenu2'),
            controller: 'UserSubMenuController',
            data: {
                mainMenuItem: 'UnityView',
                href: '#/infrastructure_monitoring/devices',
                displayName: 'Monitoring',
                index: 0
            }
        })

        .state('infrastructure_monitoring.devices', {
            url: '/devices',
            templateUrl: resolveTemplate('devices_list'),
            controller: 'DevicesDashboardController',
            data: {
                mainMenuItem: 'UnityView',
                href: '#/infrastructure_monitoring/devices',
                displayName: 'Devices',
                tabLinkName: 'Devices'
            }
        })

        .state('infrastructure_monitoring.system', {
            url: '/system',
            // templateUrl: resolveTemplate('lm-widget'),
            templateUrl: resolveTemplate('system-monitoring'),
            // controller: 'LMWidgetController',
            controller: 'SystemMonitoringController',
            data: {
                // mainMenuItem: 'UnityView',
                href: '#/infrastructure_monitoring/system',
                displayName: 'System',
                tabLinkName: 'system'
            }
        })

        .state('infrastructure_monitoring.storage', {
            url: '/storage',
            templateUrl: resolveTemplate('storage-monitoring'),
            controller: 'StorageMonitoringController',
            data: {
                // mainMenuItem: 'UnityView',
                href: '#/infrastructure_monitoring/storage',
                displayName: 'Storage',
                tabLinkName: 'storage'
            }
        })

        .state('infrastructure_monitoring.database_monitoring', {
            url: '/database_monitoring',
            templateUrl: resolveTemplate('coming-soon'),
            controller: 'ComingsoonController',
            data: {
                // mainMenuItem: 'UnityView',
                href: '#/infrastructure_monitoring/database',
                displayName: 'Database',
                tabLinkName: 'database_monitoring'
            }
        })

        .state('infrastructure_monitoring.performance', {
            url: '/performance',
            templateUrl: resolveTemplate('coming-soon'),
            controller: 'ComingsoonController',
            data: {
                // mainMenuItem: 'UnityView',
                href: '#/infrastructure_monitoring/performance',
                displayName: 'Performance',
                tabLinkName: 'performance'
            }
        })

        .state('infrastructure_monitoring.network', {
            url: '/network',
            templateUrl: resolveTemplate('coming-soon'),
            controller: 'ComingsoonController',
            data: {
                // mainMenuItem: 'UnityView',
                href: '#/infrastructure_monitoring/network',
                displayName: 'Network',
                tabLinkName: 'network'
            }
        })

        .state('infrastructure_monitoring.datacenter', {
            url: '/datacenter',
            templateUrl: resolveTemplate('colo-monitoring'),
            controller: 'ColoMonitoringController',
            data: {
                // mainMenuItem: 'UnityView',
                href: '#/infrastructure_monitoring/datacenter',
                displayName: 'Datacenter',
                tabLinkName: 'Datacenter'
            }
        })

        .state('storage_usage', {
            url: '/storage_usage',
            templateUrl: resolveTemplate('coming-soon'),
            controller: 'ComingsoonController',
            data: {
                mainMenuItem: 'UnityView',
                href: '#/storage_usage',
                displayName: 'Storage Usage',
            }
        })

        .state('loadbalancer_usage', {
            url: '/loadbalancer_usage',
            templateUrl: resolveTemplate('coming-soon'),
            controller: 'ComingsoonController',
            data: {
                mainMenuItem: 'UnityView',
                href: '#/loadbalancer_usage',
                displayName: 'Load Balancer Usage',
            }
        })

        // .state('colo_monitoring', {
        //     url:'/colo_monitoring',
        //     templateUrl: resolveTemplate('coming-soon'),
        //     controller: 'ComingsoonController',
        //     data: {
        //         mainMenuItem: 'UnityView',
        //         href : '#/colo_monitoring',
        //         displayName: 'Colo Monitoring',
        //     }
        // })

        .state('activity_logs', {
            url: '/activity/logs',
            templateUrl: resolveTemplate('activity_log'),
            controller: 'ClientAuditLogController',
            data: {
                title: 'Activity Logs',
                mainMenuItem: 'UnityView',
                href: '#/activity/logs',
                displayName: 'Activity Logs'
            }
        })
        // Global alerts
        .state('global_alerts', {
            url: '/global_alerts',
            abstract: true,
            templateUrl: resolveTemplate('submenu'),
            controller: 'UserSubMenuController',
            data: {
                mainMenuItem: 'UnityView',
                href: '#/global_alerts/all_alerts',
                displayName: 'Alerts',
                index: 0
            }
        })
        .state('global_alerts.all_alerts', {
            url: '/all_alerts',
            templateUrl: resolveTemplate('global_alerts'),
            controller: 'ClientAlertController',
            data: {
                href: '#/global_alerts/all_alerts',
                displayName: 'All Alerts',
                tabLinkName: 'All alerts'
            }
        })
        .state('global_alerts.firewalls', {
            url: '/firewalls',
            templateUrl: resolveTemplate('global_alerts'),
            controller: 'ClientAlertController',
            data: {
                href: '#/global_alerts/firewalls',
                displayName: 'Firewalls',
                tabLinkName: 'firewalls'
            }
        })

        .state('global_alerts.switches', {
            url: '/switches',
            templateUrl: resolveTemplate('global_alerts'),
            controller: 'ClientAlertController',
            data: {
                href: '#/global_alerts/switches',
                displayName: 'Switches',
                tabLinkName: 'switches'
            }
        })

        .state('global_alerts.loadbalancers', {
            url: '/loadbalancers',
            templateUrl: resolveTemplate('global_alerts'),
            controller: 'ClientAlertController',
            data: {
                href: '#/global_alerts/loadbalancers',
                displayName: 'Load Balancers',
                tabLinkName: 'loadbalancers'
            }
        })

        .state('global_alerts.bm_servers', {
            url: '/bm_servers',
            templateUrl: resolveTemplate('global_alerts'),
            controller: 'ClientAlertController',
            data: {
                href: '#/global_alerts/bm_servers',
                displayName: 'Bare Metal Servers',
                tabLinkName: 'bm_servers'
            }
        })

        .state('global_alerts.hypervisors', {
            url: '/hypervisors',
            templateUrl: resolveTemplate('global_alerts'),
            controller: 'ClientAlertController',
            data: {
                href: '#/global_alerts/hypervisors',
                displayName: 'Hypervisors',
                tabLinkName: 'hypervisors'
            }
        })

        .state('global_alerts.pdus', {
            url: '/pdus',
            templateUrl: resolveTemplate('global_alerts'),
            controller: 'ClientAlertController',
            data: {
                href: '#/global_alerts/pdus',
                displayName: 'PDUs',
                tabLinkName: 'pdus'
            }
        })

        .state('global_alerts.vms', {
            url: '/vms',
            templateUrl: resolveTemplate('global_alerts'),
            controller: 'ClientAlertController',
            data: {
                href: '#/global_alerts/vms',
                displayName: 'Virtual Machines',
                tabLinkName: 'vms'
            }
        })

        //  United Cloud State Config

        .state('private_cloud', {
            url: '/private_cloud',
            abstract: true,
            templateUrl: resolveTemplate('submenu'),
            controller: 'UserSubMenuController',
            data: {
                mainMenuItem: 'UnityCloud',
                href: '#/private_cloud/{}/summary',
                displayName: 'Private Cloud',
                index: 0,
                index1: 0
            }
        })
        .state('private_cloud_empty', {
            url: '/private_cloud/empty',
            templateUrl: resolveTemplate('private-cloud-not-configured'),
            controller: 'CloudNotConfiguredController',
            data: {
                mainMenuItem: 'UnityCloud',
                href: '#/private_cloud/empty',
                displayName: 'Private Cloud'
            }
        })

        .state('vmware-vcenter-proxy-details', {
            url: '/vmware-vcenter/:uuid/',
            templateUrl: resolveTemplate('customer-proxy-detail'),
            controller: 'CustomerVcenterProxyDetailController',
        })

        .state('public_cloud', {
            url: '/public_cloud',
            abstract: true,
            templateUrl: resolveTemplate('submenu'),
            controller: 'UserSubMenuController',
            data: {
                mainMenuItem: 'UnityCloud',
                href: '#/public_cloud/aws-dashboard',
                displayName: 'Public Cloud',
                index: 0
            }
        })
        .state('public_cloud.aws-dashboard', {
            url: '/aws-dashboard',
            templateUrl: resolveTemplate('aws/aws_dashboard'),
            controller: 'CustomerAwsDashboardController',
            data: {
                href: '#/public_cloud/aws-dashboard',
                displayName: 'AWS Dashboard'
            }
        })
        .state('public_cloud.aws-account-region-inventory', {
            url: '/aws/:uuidp/aws-region/:uuidc',
            templateUrl: '/static/rest/app/client/templates/aws/aws_list_all.html',
            controller: 'CustomerAwsController',
            data: {
                href: '#/public_cloud/aws/:uuidp/aws-region/:uuidc',
                displayName: 'AWS Account Region Inventory'
            }
        })

        .state('public_cloud.aws-account-region-vms', {
            url: '/aws/:uuidp/aws-region/:uuidc/virtual-machines',
            templateUrl: '/static/rest/app/client/templates/aws/aws_virtual_machines.html',
            controller: 'CustomerAwsController',
            data: {
                href: '#/public_cloud/aws/:uuidp/aws-region/:uuidc/virtual-machines',
                displayName: 'AWS Account Region Virtual Machines'
            }
        })

        .state('public_cloud.aws-account-region-vm', {
            url: '/aws/:uuidp/aws-region/:uuidc/virtual-machine/:uuidq',
            templateUrl: resolveTemplate('observium/aws/awsmenu'),
            controller: 'AWSMenuController',
            data: {
                href: '#/public_cloud/aws/:uuidp/aws-region/:uuidc',
                displayName: 'AWS Account Region Virtual Machines'
            }
        })

        .state('public_cloud.aws-account-region-vm.overview', {
            url: '/overview',
            templateUrl: resolveTemplate('observium/aws/awsoverview'),
            controller: 'AWSOverviewController',
            data: {
                href: '#/aws/:uuidp/aws-region/:uuidc/virtual-machines/:uuidq/overview',
                displayName: 'AWS Overview'
            }
        })

        .state('public_cloud.aws-account-region-vm.graphs', {
            url: '/graphs',
            templateUrl: resolveTemplate('observium/aws/awsgraphs'),
            controller: 'AWSGraphController',
            data: {
                href: '#/aws/:uuidp/aws-region/:uuidc/virtual-machines/:uuidq/graphs',
                displayName: 'AWS Graphs'
            }
        })

        .state('public_cloud.aws-account-region-vm.healthstats', {
            url: '/healthstats',
            templateUrl: resolveTemplate('observium/aws/awshealthstats'),
            controller: 'AWSHealthStatsController',
            data: {
                href: '#/aws/:uuidp/aws-region/:uuidc/virtual-machines/:uuidq/healthstats',
                displayName: 'AWS Health Statistics'
            }
        })

        .state('public_cloud.aws-account-region-vm.ports', {
            url: '/ports',
            templateUrl: resolveTemplate('observium/aws/awsports'),
            controller: 'AWSPortsController',
            data: {
                href: '#/aws/:uuidp/aws-region/:uuidc/virtual-machines/:uuidq/ports',
                displayName: 'AWS Ports'
            }
        })

        .state('public_cloud.aws-account-region-vm.logs', {
            url: '/logs',
            templateUrl: resolveTemplate('observium/aws/awslogs'),
            controller: 'AWSLogsController',
            data: {
                href: '#/aws/:uuidp/aws-region/:uuidc/virtual-machines/:uuidq/graphs',
                displayName: 'AWS Logs'
            }
        })

        .state('public_cloud.aws-account-region-vm.alerts', {
            url: '/alerts',
            templateUrl: resolveTemplate('observium/aws/awsalerts'),
            controller: 'AWSAlertsController',
            data: {
                href: '#/aws/:uuidp/aws-region/:uuidc/virtual-machines/:uuidq/alerts',
                displayName: 'AWS Alerts'
            }
        })
        .state('public_cloud.azure-dashboard', {
            url: '/azure-dashboard',
            templateUrl: resolveAzureTemplate('home'),
            controller: 'AzureDashboardController',
            data: {
                href: '#/public_cloud/azure-dashboard',
                displayName: 'Azure Dashboard'
            }
        })
        .state('public_cloud.azure-account-resource_group', {
            url: '/azure/:uuidc/resource_group',
            templateUrl: resolveAzureTemplate('resource_group_list'),
            controller: 'AzureResourceGroupController',
            data: {
                href: '#/public_cloud/azure/:uuidc/resource_group',
                displayName: 'Azure Resource Group List'
            }
        })

        .state('public_cloud.gcp-dashboard', {
            url: '/gcp-dashboard',
            templateUrl: resolveGCPTemplate('gcp-dashboard'),
            controller: 'GCPDashboardController',
            data: {
                href: '#/public_cloud/gcp-dashboard',
                displayName: 'GCP Dashboard'
            }
        })

        .state('public_cloud.inventory', {
            url: '/inventory/:uuidp',
            templateUrl: resolveGCPTemplate('gcp-inventory'),
            controller: 'GCPInventoryController',
            data: {
                href: '#/public_cloud/inventory',
                displayName: 'Google Cloud',
                index: 2
            }
        })

        .state('public_cloud.inventory.virtual-machines', {
            url: '/virtual-machines',
            templateUrl: resolveGCPTemplate('gcp-virtual-machines'),
            controller: 'GCPVirtualMachinesController',
            data: {
                href: '#/public_cloud/inventory/:uuidp/virtual-machines',
                displayName: 'Virtual Machines'
            }
        })
        .state('public_cloud.inventory.snapshots', {
            url: '/snapshots',
            templateUrl: resolveGCPTemplate('gcp-snapshots'),
            controller: 'GCPSnapshotsController',
            data: {
                href: '#/public_cloud/inventory/:uuidp/snapshots',
                displayName: 'Snapshots'
            }
        })

        .state('azure-resource_group', {
            url: '/azure/resource_group',
            templateUrl: resolveAzureTemplate('resource_group_list'),
            controller: 'AzureResourceGroupController'
        })
        .state('azure-resource_group-resources', {
            url: '/azure/:account_id/resource_group/:resource_id/resources',
            templateUrl: resolveAzureTemplate('resource_group_list'),
            controller: 'AzureResourcesController'
        })

        .state('colo_cloud', {
            url: '/colo_cloud',
            templateUrl: resolveTemplate('colo_cloud/colo_cloud'),
            controller: 'ColoCloudController',
            data: {
                mainMenuItem: 'UnityCloud',
                href: '#/colo_cloud/{}/cabinets',
                displayName: 'Datacenter'
            }
        })
        .state('colo_cloud.cabinets', {
            url: '/:uuidp/cabinets',
            templateUrl: resolveTemplate('colo_cloud/cabinet/cabinets'),
            controller: 'ColoCloudCabinetController',
            data: {
                mainMenuItem: 'UnityCloud',
                href: '#/colo_cloud/{}/cabinets',
                displayName: 'Cabinets',
                index: 0
            }
        })
        .state('colo_cloud.cabinet_view', {
            url: '/:uuidp/cabinet/:uuidc/cabinet_view',
            templateUrl: resolveTemplate('colo_cloud/cabinet/cabinet-view'),
            controller: 'CabinetViewController',
            data: {
                mainMenuItem: 'UnityCloud',
                href: '#/colo_cloud/{}/cabinet/{}/view',
                displayName: 'Cabinet View',
                index: 0
            }
        })
        .state('colo_cloud.cages', {
            url: '/:uuidp/cages',
            templateUrl: resolveTemplate('colo_cloud/cages'),
            controller: 'ColoCloudCageController',
            data: {
                mainMenuItem: 'UnityCloud',
                href: '#/colo_cloud/{}/cages',
                displayName: 'Cages',
                index: 0
            }
        })
        .state('colo_cloud.pdus', {
            url: '/:uuidp/pdus',
            templateUrl: resolveTemplate('colo_cloud/pdu'),
            controller: 'ColoCloudPDUController',
            data: {
                mainMenuItem: 'UnityCloud',
                href: '#/colo_cloud/{}/pdus',
                displayName: 'PDUs',
                index: 0
            }
        })
        .state('colo_cloud.pdu', {
            url: '/:uuidp/pdu/:uuidc',
            templateUrl: resolveTemplate('observium/pdu/pdumenu'),
            controller: 'ColoCloudPDUMenuController',
            data: {
                href: '#/colo/pdus',
                displayName: 'PDUs',
                index: 1
            }
        })

        .state('colo_cloud.pdu.overview', {
            url: '/overview',
            templateUrl: resolveTemplate('observium/pdu/pduoverview'),
            controller: 'PDUOverviewController',
            data: {
                href: '#/colo/pdu/:uuidp/overview',
                displayName: 'PDU Overview'
            }
        })

        .state('colo_cloud.pdu.graphs', {
            url: '/graphs',
            templateUrl: resolveTemplate('observium/pdu/pdugraphs'),
            controller: 'PDUGraphController',
            data: {
                href: '#/colo/pdu/:uuidp/graphs',
                displayName: 'PDU Graphs'
            }
        })

        .state('colo_cloud.pdu.healthstats', {
            url: '/healthstats',
            templateUrl: resolveTemplate('observium/pdu/pduhealthstats'),
            controller: 'PDUHealthStatsController',
            data: {
                href: '#/colo/pdu/:uuidp/healthstats',
                displayName: 'PDU Health Statistics'
            }
        })

        .state('colo_cloud.pdu.ports', {
            url: '/ports',
            templateUrl: resolveTemplate('observium/pdu/pduports'),
            controller: 'PDUPortsController',
            data: {
                href: '#/colo/pdu/:uuidp/ports',
                displayName: 'PDU Ports'
            }
        })

        .state('colo_cloud.pdu.logs', {
            url: '/logs',
            templateUrl: resolveTemplate('observium/pdu/pdulogs'),
            controller: 'PDULogsController',
            data: {
                href: '#/colo/pdu/:uuidp/graphs',
                displayName: 'PDU Logs'
            }
        })

        .state('colo_cloud.pdu.alerts', {
            url: '/alerts',
            templateUrl: resolveTemplate('observium/pdu/pdualerts'),
            controller: 'PDUAlertsController',
            data: {
                href: '#/colo/pdu/:uuidp/alerts',
                displayName: 'PDU Alerts'
            }
        })

        .state('colo_cloud.pc_cloud', {
            url: '/:uuidp/private_clouds',
            templateUrl: resolveTemplate('colo_cloud/private_cloud'),
            controller: 'ColoCloudPCController',
            resolve : {
                colo_cloud_uuid : function($location, $stateParams){
                    return $stateParams.uuidp;
                },
                private_cloud_details : function(colo_cloud_uuid, $http){
                    return $http({
                                method: "GET",
                                url: '/customer/colo_cloud/' + colo_cloud_uuid +'/private_clouds'
                    }).then(function (response) {
                        return response.data;
                    }).catch(function (error) {
                        return null;
                    });
                }
            },
            data: {
                mainMenuItem: 'UnityCloud',
                href: '#/colo_cloud/{}/private_clouds',
                displayName: 'Private Cloud',
                index: 0
            }
        })

        .state('colo_cloud.pc_cloud.summary', {
            url: '/:uuidc/summary',
            templateUrl: resolveTemplate('private_cloud/summary'),
            controller: 'ColoCloudPCSummaryController',
            data: {
                mainMenuItem: 'UnityCloud',
                href: '#/colo_cloud/{}/private_clouds/{}/summary',
                displayName: 'Summary',
                index: 0
            }
        })

        .state('colo_cloud.pc_cloud.hypervisors', {
            url: '/:uuidc/hypervisors',
            templateUrl: resolveTemplate('private_cloud/hypervisors'),
            // controller: 'ColoCloudPCHypervisorsController',
            controller: 'ServerController',
            data: {
                mainMenuItem: 'UnityCloud',
                href: '#/colo_cloud/{}/private_clouds/{}/hypervisors',
                displayName: 'Hypervisors',
                index: 0
            }
        })

        .state('colo_cloud.pc_cloud.hypervisor', {
            url: '/:uuidc/hypervisor/:uuidcc',
            templateUrl: resolveTemplate('observium/hypervisor/hypervisormenu'),
            controller: 'ColoCloudPCServerMenuController',
            data: {
                mainMenuItem: 'UnityCloud',
                href: '#/colo_cloud/{}/private_clouds/{}/hypervisors',
                displayName: 'Hypervisors',
                index: 1
            }
        })

        .state('colo_cloud.pc_cloud.hypervisor.overview', {
            url: '/overview',
            templateUrl: resolveTemplate('observium/hypervisor/hypervisoroverview'),
            controller: 'ServerOverviewController',
            data: {
                href: '#/colo_cloud/{}/private_clouds/{}/hypervisor/{}/overview',
                displayName: 'Server Overview'
            }
        })

        .state('colo_cloud.pc_cloud.hypervisor.graphs', {
            url: '/graphs',
            templateUrl: resolveTemplate('observium/hypervisor/hypervisorgraphs'),
            controller: 'ServerGraphController',
            data: {
                href: '#/colo_cloud/{}/private_clouds/{}/hypervisor/{}/graphs',
                displayName: 'Server Graphs'
            }
        })

        .state('colo_cloud.pc_cloud.hypervisor.healthstats', {
            url: '/healthstats',
            templateUrl: resolveTemplate('observium/hypervisor/hypervisorhealthstats'),
            controller: 'ServerHealthStatsController',
            data: {
                href: '#/colo_cloud/{}/private_clouds/{}/hypervisor/{}/healthstats',
                displayName: 'Server Health Statistics'
            }
        })

        .state('colo_cloud.pc_cloud.hypervisor.ports', {
            url: '/ports',
            templateUrl: resolveTemplate('observium/hypervisor/hypervisorports'),
            controller: 'ServerPortsController',
            data: {
                href: '#/colo_cloud/{}/private_clouds/{}/hypervisor/{}/ports',
                displayName: 'Server Ports'
            }
        })

        .state('colo_cloud.pc_cloud.hypervisor.logs', {
            url: '/logs',
            templateUrl: resolveTemplate('observium/hypervisor/hypervisorlogs'),
            controller: 'ServerLogsController',
            data: {
                href: '#/colo_cloud/{}/private_clouds/{}/hypervisor/{}/graphs',
                displayName: 'Server Logs'
            }
        })

        .state('colo_cloud.pc_cloud.hypervisor.alerts', {
            url: '/alerts',
            templateUrl: resolveTemplate('observium/hypervisor/hypervisoralerts'),
            controller: 'ServerAlertsController',
            data: {
                href: '#/colo_cloud/{}/private_clouds/{}/hypervisor/{}/alerts',
                displayName: 'Server Alerts'
            }
        })

        .state('colo_cloud.pc_cloud.bm_servers', {
            url: '/:uuidc/bm_servers',
            templateUrl: resolveTemplate('private_cloud/bm_servers'),
            controller: 'CustomerBMServerController',
            data: {
                href: '#/colo_cloud/{}/private_clouds/{}/bm_servers',
                displayName: 'Bare Metal Servers',
                index : 0
            }
        })

        // BM server IPMI for Colo Cloud
        .state('colo_cloud.pc_cloud.bm_server_ipmi', {
            url: '/:uuidc/bm_server/:uuidcc/ipmi',
            templateUrl: resolveTemplate('ipmi/bare_metal/bare_metal_ipmi_menu'),
            controller: 'BareMetalIPMIColoCloudMenuController',
            data: {
                href: '#/colo_cloud/{}/private_clouds/{}/bm_servers',
                displayName: 'Bare Metal Servers',
                index : 6
            }
        })
        .state('colo_cloud.pc_cloud.bm_server_ipmi.stats', {
            url: '/stats',
            templateUrl: resolveTemplate('ipmi/bare_metal/bare_metal_ipmi_stats'),
            controller: 'BareMetalIPMIStatsController',
            data: {
                href: '#/colo_cloud/{}/private_clouds/{}/bm_server/:uuidcc/ipmi/stats',
                displayName: 'IPMI Stats'
            }
        })
        .state('colo_cloud.pc_cloud.bm_server_ipmi.console', {
            url: '/console',
            templateUrl: resolveTemplate('ipmi/bare_metal/bare_metal_ipmi_console'),
            controller: 'BareMetalIPMIConsoleController',
            data: {
                href: '#/colo_cloud/{}/private_clouds/{}/bm_server/:uuidcc/ipmi/console',
                displayName: 'Console'
            }
        })
        // BM server DRAC for Colo Cloud
        .state('colo_cloud.pc_cloud.bm_server_drac', {
            url: '/:uuidc/bm_server/:uuidcc/drac',
            templateUrl: resolveTemplate('ipmi/bare_metal/bare_metal_ipmi_menu'),
            controller: 'BareMetalDRACColoCloudMenuController',
            data: {
                href: '#/colo_cloud/{}/private_clouds/{}/bm_servers',
                displayName: 'Bare Metal Servers',
                index : 6
            }
        })
        .state('colo_cloud.pc_cloud.bm_server_drac.stats', {
            url: '/stats',
            templateUrl: resolveTemplate('ipmi/bare_metal/bare_metal_ipmi_stats'),
            controller: 'BareMetalIPMIStatsController',
            data: {
                href: '#/colo_cloud/{}/private_clouds/{}/bm_server/:uuidcc/drac/stats',
                displayName: 'DRAC Stats'
            }
        })
        .state('colo_cloud.pc_cloud.bm_server_drac.console', {
            url: '/console',
            templateUrl: resolveTemplate('ipmi/bare_metal/bare_metal_ipmi_console'),
            controller: 'BareMetalIPMIConsoleController',
            data: {
                href: '#/colo_cloud/{}/private_clouds/{}/bm_server/:uuidcc/drac/console',
                displayName: 'Console'
            }
        })

        .state('colo_cloud.pc_cloud.virtual_machines', {
            url: '/:uuidc/virtual_machines',
            templateUrl: resolveTemplate('private_cloud/virtual_machines'),
            controller: 'ColoCloudPCVMController',
            data: {
                mainMenuItem: 'UnityCloud',
                href: '#/colo_cloud/{}/private_clouds/{}/virtual_machines',
                displayName: 'virtual_machines',
                index: 0
            }
        })

        .state('colo_cloud.pc_cloud.virtual_machine', {
            url: '/:uuidc/virtual_machine/:uuidcc',
            templateUrl: resolveTemplate('observium/virtual_machines/vmmenu'),
            controller: 'ColoCloudPCVMMenuController',
            data: {
                mainMenuItem: 'UnityCloud',
                href: '#/colo_cloud/{}/private_clouds/{}/virtual_machines',
                displayName: 'VMs',
                index: 1
            }
        })

        .state('colo_cloud.pc_cloud.virtual_machine.overview', {
            url: '/overview',
            templateUrl: resolveTemplate('observium/virtual_machines/vmoverview'),
            controller: 'VMOverviewController',
            data: {
                href: '#/colo_cloud/{}/private_clouds/{}/virtual_machine/{}/overview',
                displayName: 'VM Overview'
            }
        })

        .state('colo_cloud.pc_cloud.virtual_machine.graphs', {
            url: '/graphs',
            templateUrl: resolveTemplate('observium/virtual_machines/vmgraphs'),
            controller: 'VMGraphController',
            data: {
                href: '#/colo_cloud/{}/private_clouds/{}/virtual_machine/{}/graphs',
                displayName: 'VM Graphs'
            }
        })

        .state('colo_cloud.pc_cloud.virtual_machine.healthstats', {
            url: '/healthstats',
            templateUrl: resolveTemplate('observium/virtual_machines/vmhealthstats'),
            controller: 'VMHealthStatsController',
            data: {
                href: '#/colo_cloud/{}/private_clouds/{}/virtual_machine/{}/healthstats',
                displayName: 'VM Health Statistics'
            }
        })

        .state('colo_cloud.pc_cloud.virtual_machine.ports', {
            url: '/ports',
            templateUrl: resolveTemplate('observium/virtual_machines/vmports'),
            controller: 'VMPortsController',
            data: {
                href: '#/colo_cloud/{}/private_clouds/{}/virtual_machine/{}/ports',
                displayName: 'VM Ports'
            }
        })

        .state('colo_cloud.pc_cloud.virtual_machine.logs', {
            url: '/logs',
            templateUrl: resolveTemplate('observium/virtual_machines/vmlogs'),
            controller: 'VMLogsController',
            data: {
                href: '#/colo_cloud/{}/private_clouds/{}/virtual_machine/{}/logs',
                displayName: 'VM Logs'
            }
        })

        .state('colo_cloud.pc_cloud.virtual_machine.alerts', {
            url: '/alerts',
            templateUrl: resolveTemplate('observium/virtual_machines/vmalerts'),
            controller: 'VMAlertsController',
            data: {
                href: '#/colo_cloud/{}/private_clouds/{}/virtual_machine/{}/alerts',
                displayName: 'VM Alerts'
            }
        })

        .state('colo_cloud.pc_cloud.switches', {
            url: '/:uuidc/switches',
            templateUrl: resolveTemplate('private_cloud/switches'),
            // controller: 'ColoCloudPCSwitchesController',
            controller: 'SwitchController',
            data: {
                mainMenuItem: 'UnityCloud',
                href: '#/colo_cloud/{}/private_clouds/{}/switches',
                displayName: 'Switches',
                index: 0
            }
        })

        .state('colo_cloud.pc_cloud.switch', {
            url: '/:uuidc/switch/:uuidcc',
            templateUrl: resolveTemplate('observium/switch/switchmenu'),
            controller: 'ColoCloudPCSwitchMenuController',
            data: {
                mainMenuItem: 'UnityCloud',
                href: '#/colo_cloud/{}/private_clouds/{}/switches',
                displayName: 'Switches',
                index: 1
            }
        })

        .state('colo_cloud.pc_cloud.switch.overview', {
            url: '/overview',
            templateUrl: resolveTemplate('observium/switch/switchoverview'),
            controller: 'SwitchOverviewController',
            data: {
                href: '#/colo_cloud/{}/private_clouds/{}/switch/{}/overview',
                displayName: 'Switch Overview'
            }
        })

        .state('colo_cloud.pc_cloud.switch.graphs', {
            url: '/graphs',
            templateUrl: resolveTemplate('observium/switch/switchgraphs'),
            controller: 'SwitchGraphController',
            data: {
                href: '#/colo_cloud/{}/private_clouds/{}/switch/{}/graphs',
                displayName: 'Switch Graphs'
            }
        })

        .state('colo_cloud.pc_cloud.switch.healthstats', {
            url: '/healthstats',
            templateUrl: resolveTemplate('observium/switch/switchhealthstats'),
            controller: 'SwitchHealthStatsController',
            data: {
                href: '#/colo_cloud/{}/private_clouds/{}/switch/{}/healthstats',
                displayName: 'Switch Health Statistics'
            }
        })

        .state('colo_cloud.pc_cloud.switch.ports', {
            url: '/ports',
            templateUrl: resolveTemplate('observium/switch/switchports'),
            controller: 'SwitchPortsController',
            data: {
                href: '#/colo_cloud/{}/private_clouds/{}/switch/{}/ports',
                displayName: 'Switch Ports'
            }
        })

        .state('colo_cloud.pc_cloud.switch.logs', {
            url: '/logs',
            templateUrl: resolveTemplate('observium/switch/switchlogs'),
            controller: 'SwitchLogsController',
            data: {
                href: '#/colo_cloud/{}/private_clouds/{}/switch/{}/logs',
                displayName: 'Switch Logs'
            }
        })

        .state('colo_cloud.pc_cloud.switch.alerts', {
            url: '/alerts',
            templateUrl: resolveTemplate('observium/switch/switchalerts'),
            controller: 'SwitchAlertsController',
            data: {
                href: '#/colo_cloud/{}/private_clouds/{}/switch/{}/alerts',
                displayName: 'Switch Alerts'
            }
        })

        .state('colo_cloud.pc_cloud.firewalls', {
            url: '/:uuidc/firewalls',
            templateUrl: resolveTemplate('private_cloud/firewalls'),
            // controller: 'ColoCloudPCFirewallsController',
            controller: 'FirewallController',
            data: {
                mainMenuItem: 'UnityCloud',
                href: '#/colo_cloud/{}/private_clouds/{}/firewalls',
                displayName: 'Firewalls',
                index: 0
            }
        })

        .state('colo_cloud.pc_cloud.firewall', {
            url: '/:uuidc/firewall/:uuidcc',
            templateUrl: resolveTemplate('observium/firewall/firewallmenu'),
            controller: 'ColoCloudPCFirewallMenuController',
            data: {
                mainMenuItem: 'UnityCloud',
                href: '#/colo_cloud/{}/private_clouds/{}/firewalls',
                displayName: 'Firewalls',
                index: 1
            }
        })

        .state('colo_cloud.pc_cloud.firewall.overview', {
            url: '/overview',
            templateUrl: resolveTemplate('observium/firewall/firewalloverview'),
            controller: 'FirewallOverviewController',
            data: {
                href: '#/colo_cloud/{}/private_clouds/{}/firewall/{}/overview',
                displayName: 'Firewall Overview'
            }
        })

        .state('colo_cloud.pc_cloud.firewall.graphs', {
            url: '/graphs',
            templateUrl: resolveTemplate('observium/firewall/firewallgraphs'),
            controller: 'FirewallGraphController',
            data: {
                href: '#/colo_cloud/{}/private_clouds/{}/firewall/{}/graphs',
                displayName: 'Firewall Graphs'
            }
        })

        .state('colo_cloud.pc_cloud.firewall.healthstats', {
            url: '/healthstats',
            templateUrl: resolveTemplate('observium/firewall/firewallhealthstats'),
            controller: 'FirewallHealthStatsController',
            data: {
                href: '#/colo_cloud/{}/private_clouds/{}/firewall/{}/healthstats',
                displayName: 'Firewall Health Statistics'
            }
        })

        .state('colo_cloud.pc_cloud.firewall.ports', {
            url: '/ports',
            templateUrl: resolveTemplate('observium/firewall/firewallports'),
            controller: 'FirewallPortsController',
            data: {
                href: '#/colo_cloud/{}/private_clouds/{}/firewall/{}/ports',
                displayName: 'Firewall Ports'
            }
        })

        .state('colo_cloud.pc_cloud.firewall.logs', {
            url: '/logs',
            templateUrl: resolveTemplate('observium/firewall/firewalllogs'),
            controller: 'FirewallLogsController',
            data: {
                href: '#/colo_cloud/{}/private_clouds/{}/firewall/{}/logs',
                displayName: 'Firewall Logs'
            }
        })

        .state('colo_cloud.pc_cloud.firewall.alerts', {
            url: '/alerts',
            templateUrl: resolveTemplate('observium/firewall/firewallalerts'),
            controller: 'FirewallAlertsController',
            data: {
                href: '#/colo_cloud/{}/private_clouds/{}/firewall/{}/alerts',
                displayName: 'Firewall Alerts'
            }
        })

        .state('colo_cloud.pc_cloud.load_balancers', {
            url: '/:uuidc/load_balancers',
            templateUrl: resolveTemplate('private_cloud/load_balancers'),
            // controller: 'ColoCloudPCLBsController',
            controller: 'LoadBalancerController',
            data: {
                mainMenuItem: 'UnityCloud',
                href: '#/colo_cloud/{}/private_clouds/{}/load_balancers',
                displayName: 'Load Balancers',
                index: 0
            }
        })

        .state('colo_cloud.pc_cloud.load_balancer', {
            url: '/:uuidc/load_balancer/:uuidcc',
            templateUrl: resolveTemplate('observium/load_balancer/load_balancer_menu'),
            controller: 'ColoCloudPCLoadBalancerMenuController',
            data: {
                mainMenuItem: 'UnityCloud',
                href: '#/colo_cloud/{}/private_clouds/{}/load_balancers',
                displayName: 'Load Balancers',
                index: 1
            }
        })

        .state('colo_cloud.pc_cloud.load_balancer.overview', {
            url: '/overview',
            templateUrl: resolveTemplate('observium/load_balancer/load_balancer_overview'),
            controller: 'LoadBalancerOverviewController',
            data: {
                href: '#/colo_cloud/{}/private_clouds/{}/load_balancer/{}/overview',
                displayName: 'Load Balancer Overview'
            }
        })

        .state('colo_cloud.pc_cloud.load_balancer.graphs', {
            url: '/graphs',
            templateUrl: resolveTemplate('observium/load_balancer/load_balancer_graphs'),
            controller: 'LoadBalancerGraphController',
            data: {
                href: '#/colo_cloud/{}/private_clouds/{}/load_balancer/{}/graphs',
                displayName: 'Load Balancer Graphs'
            }
        })

        .state('colo_cloud.pc_cloud.load_balancer.healthstats', {
            url: '/healthstats',
            templateUrl: resolveTemplate('observium/load_balancer/load_balancer_healthstats'),
            controller: 'LoadBalancerHealthStatsController',
            data: {
                href: '#/colo_cloud/{}/private_clouds/{}/load_balancer/{}/healthstats',
                displayName: 'Load Balancer Health Statistics'
            }
        })

        .state('colo_cloud.pc_cloud.load_balancer.ports', {
            url: '/ports',
            templateUrl: resolveTemplate('observium/load_balancer/load_balancer_ports'),
            controller: 'LoadBalancerPortsController',
            data: {
                href: '#/colo_cloud/{}/private_clouds/{}/load_balancer/{}/ports',
                displayName: 'Load Balancer Ports'
            }
        })

        .state('colo_cloud.pc_cloud.load_balancer.logs', {
            url: '/logs',
            templateUrl: resolveTemplate('observium/load_balancer/load_balancer_logs'),
            controller: 'LoadBalancerLogsController',
            data: {
                href: '#/colo_cloud/{}/private_clouds/{}/load_balancer/{}/logs',
                displayName: 'Load Balancer Logs'
            }
        })

        .state('colo_cloud.pc_cloud.load_balancer.alerts', {
            url: '/alerts',
            templateUrl: resolveTemplate('observium/load_balancer/load_balancer_alerts'),
            controller: 'LoadBalancerAlertsController',
            data: {
                href: '#/colo_cloud/{}/private_clouds/{}/load_balancer/{}/alerts',
                displayName: 'Load Balancer Alerts'
            }
        })

        .state('colo_cloud.pc_cloud.other_devices', {
            url: '/:uuidc/other_devices',
            templateUrl: resolveTemplate('custom_devices'),
            controller: 'ColoCloudPCCustomDevicesController',
            data: {
                mainMenuItem: 'UnityCloud',
                href: '#/colo_cloud/{}/private_clouds/{}/other_devices',
                displayName: 'Other Devices',
                index: 0
            }
        })

        .state('colo_cloud.pc_cloud.all_devices', {
            url: '/:uuidc/all_devices',
            templateUrl: resolveTemplate('partials/devices_overview'),
            controller: 'ColoCloudPCAllDevicesController',
            data: {
                mainMenuItem: 'UnityCloud',
                href: '#/colo_cloud/{}/private_clouds/{}/all_devices',
                displayName: 'All Devices',
                index: 0
            }
        })

        //Private Cloud  New States - Non Dynamic - Begins
        .state('pc_cloud', {
            url: '/pc_clouds',
            templateUrl: resolveTemplate('cloud/pc_cloud'),
            controller: 'PCController',
            resolve : {
                private_cloud_details : function($http){
                    return $http({
                                method: "GET",
                                url: '/customer/private_cloud_fast/'
                    }).then(function (response) {
                        return response.data;
                    }).catch(function (error) {
                        return null;
                    });
                }
            },
            data: {
                mainMenuItem: 'UnityCloud',
                href: '#/pc_clouds',
                displayName: 'Private Cloud',
                index: 0
            }
        })
        .state('pc_cloud.summary', {
            url: '/:uuidc/summary',
            templateUrl: resolveTemplate('private_cloud/summary'),
            controller: 'ColoCloudPCSummaryController',
            data: {
                mainMenuItem: 'UnityCloud',
                href: '#/pc_clouds/{}/summary',
                displayName: 'Summary',
                index: 0
            }
        })

        .state('pc_cloud.hypervisors', {
            url: '/:uuidc/hypervisors',
            templateUrl: resolveTemplate('private_cloud/hypervisors'),
            // controller: 'ColoCloudPCHypervisorsController',
            controller: 'ServerController',
            data: {
                mainMenuItem: 'UnityCloud',
                href: '#/pc_clouds/{}/hypervisors',
                displayName: 'Hypervisors',
                index: 0
            }
        })

        .state('pc_cloud.hypervisor', {
            url: '/:uuidc/hypervisor/:uuidcc',
            templateUrl: resolveTemplate('observium/hypervisor/hypervisormenu'),
            controller: 'PrivateCloudServerMenuController',
            data: {
                mainMenuItem: 'UnityCloud',
                href: '#/pc_clouds/{}/hypervisors',
                displayName: 'Hypervisors',
                index: 1
            }
        })

        .state('pc_cloud.hypervisor.overview', {
            url: '/overview',
            templateUrl: resolveTemplate('observium/hypervisor/hypervisoroverview'),
            controller: 'ServerOverviewController',
            data: {
                href: '#/pc_clouds/{}/hypervisor/{}/overview',
                displayName: 'Server Overview'
            }
        })

        .state('pc_cloud.hypervisor.graphs', {
            url: '/graphs',
            templateUrl: resolveTemplate('observium/hypervisor/hypervisorgraphs'),
            controller: 'ServerGraphController',
            data: {
                href: '#/pc_clouds/{}/hypervisor/{}/graphs',
                displayName: 'Server Graphs'
            }
        })

        .state('pc_cloud.hypervisor.healthstats', {
            url: '/healthstats',
            templateUrl: resolveTemplate('observium/hypervisor/hypervisorhealthstats'),
            controller: 'ServerHealthStatsController',
            data: {
                href: '#/pc_clouds/{}/hypervisor/{}/healthstats',
                displayName: 'Server Health Statistics'
            }
        })

        .state('pc_cloud.hypervisor.ports', {
            url: '/ports',
            templateUrl: resolveTemplate('observium/hypervisor/hypervisorports'),
            controller: 'ServerPortsController',
            data: {
                href: '#/pc_clouds/{}/hypervisor/{}/ports',
                displayName: 'Server Ports'
            }
        })

        .state('pc_cloud.hypervisor.logs', {
            url: '/logs',
            templateUrl: resolveTemplate('observium/hypervisor/hypervisorlogs'),
            controller: 'ServerLogsController',
            data: {
                href: '#/pc_clouds/{}/hypervisor/{}/graphs',
                displayName: 'Server Logs'
            }
        })

        .state('pc_cloud.hypervisor.alerts', {
            url: '/alerts',
            templateUrl: resolveTemplate('observium/hypervisor/hypervisoralerts'),
            controller: 'ServerAlertsController',
            data: {
                href: '#/pc_clouds/{}/hypervisor/{}/alerts',
                displayName: 'Server Alerts'
            }
        })

        .state('pc_cloud.bm_servers', {
            url: '/:uuidc/bm_servers',
            templateUrl: resolveTemplate('private_cloud/bm_servers'),
            controller: 'CustomerBMServerController',
            data: {
                href: '#/pc_clouds/{}/bm_servers',
                displayName: 'Bare Metal Servers',
                index : 0
            }
        })

        // BM server IPMI for Colo Cloud
        .state('pc_cloud.bm_server_ipmi', {
            url: '/:uuidc/bm_server/:uuidcc/ipmi',
            templateUrl: resolveTemplate('ipmi/bare_metal/bare_metal_ipmi_menu'),
            controller: 'BareMetalIPMIPCCloudMenuController',
            data: {
                href: '#/pc_clouds/{}/bm_servers',
                displayName: 'Bare Metal Servers',
                index : 6
            }
        })
        .state('pc_cloud.bm_server_ipmi.stats', {
            url: '/stats',
            templateUrl: resolveTemplate('ipmi/bare_metal/bare_metal_ipmi_stats'),
            controller: 'BareMetalIPMIStatsController',
            data: {
                href: '#/pc_clouds/{}/bm_server/:uuidcc/ipmi/stats',
                displayName: 'IPMI Stats'
            }
        })
        .state('pc_cloud.bm_server_ipmi.console', {
            url: '/console',
            templateUrl: resolveTemplate('ipmi/bare_metal/bare_metal_ipmi_console'),
            controller: 'BareMetalIPMIConsoleController',
            data: {
                href: '#/pc_clouds/{}/bm_server/:uuidcc/ipmi/console',
                displayName: 'Console'
            }
        })
        // BM server DRAC for Colo Cloud
        .state('pc_cloud.bm_server_drac', {
            url: '/:uuidc/bm_server/:uuidcc/drac',
            templateUrl: resolveTemplate('ipmi/bare_metal/bare_metal_ipmi_menu'),
            controller: 'BareMetalDRACPCCloudMenuController',
            data: {
                href: '#/pc_clouds/{}/bm_servers',
                displayName: 'Bare Metal Servers',
                index : 6
            }
        })
        .state('pc_cloud.bm_server_drac.stats', {
            url: '/stats',
            templateUrl: resolveTemplate('ipmi/bare_metal/bare_metal_ipmi_stats'),
            controller: 'BareMetalIPMIStatsController',
            data: {
                href: '#/pc_clouds/{}/bm_server/:uuidcc/drac/stats',
                displayName: 'DRAC Stats'
            }
        })
        .state('pc_cloud.bm_server_drac.console', {
            url: '/console',
            templateUrl: resolveTemplate('ipmi/bare_metal/bare_metal_ipmi_console'),
            controller: 'BareMetalIPMIConsoleController',
            data: {
                href: '#/pc_clouds/{}/bm_server/:uuidcc/drac/console',
                displayName: 'Console'
            }
        })

        .state('pc_cloud.virtual_machines', {
            url: '/:uuidc/virtual_machines',
            templateUrl: resolveTemplate('private_cloud/virtual_machines'),
            controller: 'ColoCloudPCVMController',
            data: {
                mainMenuItem: 'UnityCloud',
                href: '#/pc_clouds/{}/virtual_machines',
                displayName: 'virtual_machines',
                index: 0
            }
        })

        .state('pc_cloud.virtual_machine', {
            url: '/:uuidc/virtual_machine/:uuidcc',
            templateUrl: resolveTemplate('observium/virtual_machines/vmmenu'),
            controller: 'PrivateCloudVMMenuController',
            data: {
                mainMenuItem: 'UnityCloud',
                href: '#/pc_clouds/{}/virtual_machines',
                displayName: 'VMs',
                index: 1
            }
        })

        .state('pc_cloud.virtual_machine.overview', {
            url: '/overview',
            templateUrl: resolveTemplate('observium/virtual_machines/vmoverview'),
            controller: 'VMOverviewController',
            data: {
                href: '#/pc_clouds/{}/virtual_machine/{}/overview',
                displayName: 'VM Overview'
            }
        })

        .state('pc_cloud.virtual_machine.graphs', {
            url: '/graphs',
            templateUrl: resolveTemplate('observium/virtual_machines/vmgraphs'),
            controller: 'VMGraphController',
            data: {
                href: '#/pc_clouds/{}/virtual_machine/{}/graphs',
                displayName: 'VM Graphs'
            }
        })

        .state('pc_cloud.virtual_machine.healthstats', {
            url: '/healthstats',
            templateUrl: resolveTemplate('observium/virtual_machines/vmhealthstats'),
            controller: 'VMHealthStatsController',
            data: {
                href: '#/pc_clouds/{}/virtual_machine/{}/healthstats',
                displayName: 'VM Health Statistics'
            }
        })

        .state('pc_cloud.virtual_machine.ports', {
            url: '/ports',
            templateUrl: resolveTemplate('observium/virtual_machines/vmports'),
            controller: 'VMPortsController',
            data: {
                href: '#/pc_clouds/{}/virtual_machine/{}/ports',
                displayName: 'VM Ports'
            }
        })

        .state('pc_cloud.virtual_machine.logs', {
            url: '/logs',
            templateUrl: resolveTemplate('observium/virtual_machines/vmlogs'),
            controller: 'VMLogsController',
            data: {
                href: '#/pc_clouds/{}/virtual_machine/{}/logs',
                displayName: 'VM Logs'
            }
        })

        .state('pc_cloud.virtual_machine.alerts', {
            url: '/alerts',
            templateUrl: resolveTemplate('observium/virtual_machines/vmalerts'),
            controller: 'VMAlertsController',
            data: {
                href: '#/pc_clouds/{}/virtual_machine/{}/alerts',
                displayName: 'VM Alerts'
            }
        })

        .state('pc_cloud.switches', {
            url: '/:uuidc/switches',
            templateUrl: resolveTemplate('private_cloud/switches'),
            // controller: 'ColoCloudPCSwitchesController',
            controller: 'SwitchController',
            data: {
                mainMenuItem: 'UnityCloud',
                href: '#/pc_clouds/{}/switches',
                displayName: 'Switches',
                index: 0
            }
        })

        .state('pc_cloud.switch', {
            url: '/:uuidc/switch/:uuidcc',
            templateUrl: resolveTemplate('observium/switch/switchmenu'),
            controller: 'PrivateCloudSwitchMenuController',
            data: {
                mainMenuItem: 'UnityCloud',
                href: '#/pc_clouds/{}/switches',
                displayName: 'Switches',
                index: 1
            }
        })

        .state('pc_cloud.switch.overview', {
            url: '/overview',
            templateUrl: resolveTemplate('observium/switch/switchoverview'),
            controller: 'SwitchOverviewController',
            data: {
                href: '#/pc_clouds/{}/switch/{}/overview',
                displayName: 'Switch Overview'
            }
        })

        .state('pc_cloud.switch.graphs', {
            url: '/graphs',
            templateUrl: resolveTemplate('observium/switch/switchgraphs'),
            controller: 'SwitchGraphController',
            data: {
                href: '#/pc_clouds/{}/switch/{}/graphs',
                displayName: 'Switch Graphs'
            }
        })

        .state('pc_cloud.switch.healthstats', {
            url: '/healthstats',
            templateUrl: resolveTemplate('observium/switch/switchhealthstats'),
            controller: 'SwitchHealthStatsController',
            data: {
                href: '#/pc_clouds/{}/switch/{}/healthstats',
                displayName: 'Switch Health Statistics'
            }
        })

        .state('pc_cloud.switch.ports', {
            url: '/ports',
            templateUrl: resolveTemplate('observium/switch/switchports'),
            controller: 'SwitchPortsController',
            data: {
                href: '#/pc_clouds/{}/switch/{}/ports',
                displayName: 'Switch Ports'
            }
        })

        .state('pc_cloud.switch.logs', {
            url: '/logs',
            templateUrl: resolveTemplate('observium/switch/switchlogs'),
            controller: 'SwitchLogsController',
            data: {
                href: '#/pc_clouds/{}/switch/{}/logs',
                displayName: 'Switch Logs'
            }
        })

        .state('pc_cloud.switch.alerts', {
            url: '/alerts',
            templateUrl: resolveTemplate('observium/switch/switchalerts'),
            controller: 'SwitchAlertsController',
            data: {
                href: '#/pc_clouds/{}/switch/{}/alerts',
                displayName: 'Switch Alerts'
            }
        })

        .state('pc_cloud.firewalls', {
            url: '/:uuidc/firewalls',
            templateUrl: resolveTemplate('private_cloud/firewalls'),
            // controller: 'ColoCloudPCFirewadellsController',
            controller: 'FirewallController',
            data: {
                mainMenuItem: 'UnityCloud',
                href: '#/pc_clouds/{}/firewalls',
                displayName: 'Firewalls',
                index: 0
            }
        })

        .state('pc_cloud.firewall', {
            url: '/:uuidc/firewall/:uuidcc',
            templateUrl: resolveTemplate('observium/firewall/firewallmenu'),
            controller: 'PrivateCloudFirewallMenuController',
            data: {
                mainMenuItem: 'UnityCloud',
                href: '#/pc_clouds/{}/firewalls',
                displayName: 'Firewalls',
                index: 1
            }
        })

        .state('pc_cloud.firewall.overview', {
            url: '/overview',
            templateUrl: resolveTemplate('observium/firewall/firewalloverview'),
            controller: 'FirewallOverviewController',
            data: {
                href: '#/pc_clouds/{}/firewall/{}/overview',
                displayName: 'Firewall Overview'
            }
        })

        .state('pc_cloud.firewall.graphs', {
            url: '/graphs',
            templateUrl: resolveTemplate('observium/firewall/firewallgraphs'),
            controller: 'FirewallGraphController',
            data: {
                href: '#/pc_clouds/{}/firewall/{}/graphs',
                displayName: 'Firewall Graphs'
            }
        })

        .state('pc_cloud.firewall.healthstats', {
            url: '/healthstats',
            templateUrl: resolveTemplate('observium/firewall/firewallhealthstats'),
            controller: 'FirewallHealthStatsController',
            data: {
                href: '#/pc_clouds/{}/firewall/{}/healthstats',
                displayName: 'Firewall Health Statistics'
            }
        })

        .state('pc_cloud.firewall.ports', {
            url: '/ports',
            templateUrl: resolveTemplate('observium/firewall/firewallports'),
            controller: 'FirewallPortsController',
            data: {
                href: '#/pc_clouds/{}/firewall/{}/ports',
                displayName: 'Firewall Ports'
            }
        })

        .state('pc_cloud.firewall.logs', {
            url: '/logs',
            templateUrl: resolveTemplate('observium/firewall/firewalllogs'),
            controller: 'FirewallLogsController',
            data: {
                href: '#/pc_clouds/{}/firewall/{}/logs',
                displayName: 'Firewall Logs'
            }
        })

        .state('pc_cloud.firewall.alerts', {
            url: '/alerts',
            templateUrl: resolveTemplate('observium/firewall/firewallalerts'),
            controller: 'FirewallAlertsController',
            data: {
                href: '#/pc_clouds/{}/firewall/{}/alerts',
                displayName: 'Firewall Alerts'
            }
        })

        .state('pc_cloud.load_balancers', {
            url: '/:uuidc/load_balancers',
            templateUrl: resolveTemplate('private_cloud/load_balancers'),
            // controller: 'ColoCloudPCLBsController',
            controller: 'LoadBalancerController',
            data: {
                mainMenuItem: 'UnityCloud',
                href: '#/pc_clouds/{}/load_balancers',
                displayName: 'Load Balancers',
                index: 0
            }
        })

        .state('pc_cloud.load_balancer', {
            url: '/:uuidc/load_balancer/:uuidcc',
            templateUrl: resolveTemplate('observium/load_balancer/load_balancer_menu'),
            controller: 'PrivateCloudLoadBalancerMenuController',
            data: {
                mainMenuItem: 'UnityCloud',
                href: '#/pc_clouds/{}/load_balancers',
                displayName: 'Load Balancers',
                index: 1
            }
        })

        .state('pc_cloud.load_balancer.overview', {
            url: '/overview',
            templateUrl: resolveTemplate('observium/load_balancer/load_balancer_overview'),
            controller: 'LoadBalancerOverviewController',
            data: {
                href: '#/pc_clouds/{}/load_balancer/{}/overview',
                displayName: 'Load Balancer Overview'
            }
        })

        .state('pc_cloud.load_balancer.graphs', {
            url: '/graphs',
            templateUrl: resolveTemplate('observium/load_balancer/load_balancer_graphs'),
            controller: 'LoadBalancerGraphController',
            data: {
                href: '#/pc_clouds/{}/load_balancer/{}/graphs',
                displayName: 'Load Balancer Graphs'
            }
        })

        .state('pc_cloud.load_balancer.healthstats', {
            url: '/healthstats',
            templateUrl: resolveTemplate('observium/load_balancer/load_balancer_healthstats'),
            controller: 'LoadBalancerHealthStatsController',
            data: {
                href: '#/pc_clouds/{}/load_balancer/{}/healthstats',
                displayName: 'Load Balancer Health Statistics'
            }
        })

        .state('pc_cloud.load_balancer.ports', {
            url: '/ports',
            templateUrl: resolveTemplate('observium/load_balancer/load_balancer_ports'),
            controller: 'LoadBalancerPortsController',
            data: {
                href: '#/pc_clouds/{}/load_balancer/{}/ports',
                displayName: 'Load Balancer Ports'
            }
        })

        .state('pc_cloud.load_balancer.logs', {
            url: '/logs',
            templateUrl: resolveTemplate('observium/load_balancer/load_balancer_logs'),
            controller: 'LoadBalancerLogsController',
            data: {
                href: '#/pc_clouds/{}/load_balancer/{}/logs',
                displayName: 'Load Balancer Logs'
            }
        })

        .state('pc_cloud.load_balancer.alerts', {
            url: '/alerts',
            templateUrl: resolveTemplate('observium/load_balancer/load_balancer_alerts'),
            controller: 'LoadBalancerAlertsController',
            data: {
                href: '#/pc_clouds/{}/load_balancer/{}/alerts',
                displayName: 'Load Balancer Alerts'
            }
        })

        .state('pc_cloud.other_devices', {
            url: '/:uuidc/other_devices',
            templateUrl: resolveTemplate('custom_devices'),
            controller: 'ColoCloudPCCustomDevicesController',
            data: {
                mainMenuItem: 'UnityCloud',
                href: '#/pc_clouds/{}/other_devices',
                displayName: 'Other Devices',
                index: 0
            }
        })

        .state('pc_cloud.all_devices', {
            url: '/:uuidc/all_devices',
            templateUrl: resolveTemplate('partials/devices_overview'),
            controller: 'ColoCloudPCAllDevicesController',
            data: {
                mainMenuItem: 'UnityCloud',
                href: '#/pc_clouds/{}/all_devices',
                displayName: 'All Devices',
                index: 0
            }
        })
        //Private Cloud  New States - Ends





        .state('devices', {
            url: '/devices',
            abstract: true,
            templateUrl: resolveTemplate('submenu'),
            controller: 'UserSubMenuController',
            data: {
                mainMenuItem: 'UnityCloud',
                href: '#/devices/firewalls',
                displayName: 'Devices',
                index: 0
            }
        })
        .state('devices.firewalls', {
            url: '/firewalls',
            // templateUrl: resolveTemplate('generic-tab'),
            templateUrl: resolveTemplate('private_cloud/firewalls'),
            controller: 'FirewallController',
            data: {
                href: '#/devices/firewalls',
                displayName: 'Firewalls',
                tabLinkName: 'firewalls'
            }
        })

        // firewalls Observium
        .state('devices.firewall', {
            url: '/firewall/:uuidp',
            templateUrl: resolveTemplate('observium/firewall/firewallmenu'),
            controller: 'FirewallMenuController',
            data: {
                href: '#/devices/firewalls',
                displayName: 'Firewalls',
                index: 0
            }
        })

        .state('devices.firewall.overview', {
            url: '/overview',
            templateUrl: resolveTemplate('observium/firewall/firewalloverview'),
            controller: 'FirewallOverviewController',
            data: {
                href: '#/devices/firewall/:uuidp/overview',
                displayName: 'Firewall Overview'
            }
        })

        .state('devices.firewall.graphs', {
            url: '/graphs',
            templateUrl: resolveTemplate('observium/firewall/firewallgraphs'),
            controller: 'FirewallGraphController',
            data: {
                href: '#/devices/firewall/:uuidp/graphs',
                displayName: 'Firewall Graphs'
            }
        })

        .state('devices.firewall.healthstats', {
            url: '/healthstats',
            templateUrl: resolveTemplate('observium/firewall/firewallhealthstats'),
            controller: 'FirewallHealthStatsController',
            data: {
                href: '#/devices/firewall/:uuidp/healthstats',
                displayName: 'Firewall Health Statistics'
            }
        })

        .state('devices.firewall.ports', {
            url: '/ports',
            templateUrl: resolveTemplate('observium/firewall/firewallports'),
            controller: 'FirewallPortsController',
            data: {
                href: '#/devices/firewall/:uuidp/ports',
                displayName: 'Firewall Ports'
            }
        })

        .state('devices.firewall.logs', {
            url: '/logs',
            templateUrl: resolveTemplate('observium/firewall/firewalllogs'),
            controller: 'FirewallLogsController',
            data: {
                href: '#/devices/firewall/:uuidp/graphs',
                displayName: 'Firewall Logs'
            }
        })

        .state('devices.firewall.alerts', {
            url: '/alerts',
            templateUrl: resolveTemplate('observium/firewall/firewallalerts'),
            controller: 'FirewallAlertsController',
            data: {
                href: '#/devices/firewall/:uuidp/alerts',
                displayName: 'Firewall Alerts'
            }
        })

        .state('firewall-webconsole', {
            url: '/firewalls/webconsole/:uuid/',
            templateUrl: resolveTemplate('vmware-webconsole'),
            controller: 'CustomerFirewallWebConsoleController'
        })

        .state('devices.switches', {
            url: '/switches',
            // templateUrl: resolveTemplate('generic-tab'),
            templateUrl: resolveTemplate('private_cloud/switches'),
            controller: 'SwitchController',
            data: {
                href: '#/devices/switches',
                displayName: 'Switches',
                tabLinkName: 'switches'
            }
        })

        // switches Observium
        .state('devices.switch', {
            url: '/switch/:uuidp',
            templateUrl: resolveTemplate('observium/switch/switchmenu'),
            controller: 'SwitchMenuController',
            data: {
                href: '#/devices/switches',
                displayName: 'switches',
                index: 0
            }
        })
        .state('devices.switch.overview', {
            url: '/overview',
            templateUrl: resolveTemplate('observium/switch/switchoverview'),
            controller: 'SwitchOverviewController',
            data: {
                href: '#/devices/switch/:uuidp/overview',
                displayName: 'Switch Overview'
            }
        })
        .state('devices.switch.graphs', {
            url: '/graphs',
            templateUrl: resolveTemplate('observium/switch/switchgraphs'),
            controller: 'SwitchGraphController',
            data: {
                href: '#/devices/switch/:uuidp/graphs',
                displayName: 'Switch Graphs'
            }
        })
        .state('devices.switch.healthstats', {
            url: '/healthstats',
            templateUrl: resolveTemplate('observium/switch/switchhealthstats'),
            controller: 'SwitchHealthStatsController',
            data: {
                href: '#/devices/switch/:uuidp/healthstats',
                displayName: 'Switch Health Statistics'
            }
        })
        .state('devices.switch.ports', {
            url: '/ports',
            templateUrl: resolveTemplate('observium/switch/switchports'),
            controller: 'SwitchPortsController',
            data: {
                href: '#/devices/switch/:uuidp/ports',
                displayName: 'Switch Ports'
            }
        })
        .state('devices.switch.logs', {
            url: '/logs',
            templateUrl: resolveTemplate('observium/switch/switchlogs'),
            controller: 'SwitchLogsController',
            data: {
                href: '#/devices/switch/:uuidp/graphs',
                displayName: 'Switch Logs'
            }
        })
        .state('devices.switch.alerts', {
            url: '/alerts',
            templateUrl: resolveTemplate('observium/switch/switchalerts'),
            controller: 'SwitchAlertsController',
            data: {
                href: '#/devices/switch/:uuidp/alerts',
                displayName: 'Switch Alerts'
            }
        })
        .state('switch-webconsole', {
            url: '/switches/webconsole/:uuid/',
            templateUrl: resolveTemplate('vmware-webconsole'),
            controller: 'CustomerSwitchWebConsoleController'
        })

        .state('devices.load_balancers', {
            url: '/load_balancers',
            // templateUrl: resolveTemplate('generic-tab'),
            templateUrl: resolveTemplate('private_cloud/load_balancers'),
            controller: 'LoadBalancerController',
            data: {
                href: '#/devices/load_balancers',
                displayName: 'Load Balancers'
            }
        })

        // load_balancers observium
        .state('devices.load_balancer', {
            url: '/load_balancer/:uuidp',
            templateUrl: resolveTemplate('observium/load_balancer/load_balancer_menu'),
            controller: "LoadBalancerMenuController",
            data: {
                href: '#/devices/load_balancers',
                displayName: 'Load Balancers',
                index: 0
            }
        })
        .state('devices.load_balancer.overview', {
            url: '/overview',
            templateUrl: resolveTemplate('observium/load_balancer/load_balancer_overview'),
            controller: 'LoadBalancerOverviewController',
            data: {
                href: '#/devices/load_balancer/:uuidp/overview',
                displayName: 'Load Balancer Overview'
            }
        })
        .state('devices.load_balancer.graphs', {
            url: '/graphs',
            templateUrl: resolveTemplate('observium/load_balancer/load_balancer_graphs'),
            controller: 'LoadBalancerGraphController',
            data: {
                href: '#/devices/load_balancer/:uuidp/graphs',
                displayName: 'Load Balancer Graphs'
            }
        })
        .state('devices.load_balancer.healthstats', {
            url: '/healthstats',
            templateUrl: resolveTemplate('observium/load_balancer/load_balancer_healthstats'),
            controller: 'LoadBalancerHealthStatsController',
            data: {
                href: '#/devices/load_balancer/:uuidp/graphs',
                displayName: 'Load Balancer Healthstats'
            }
        })
        .state('devices.load_balancer.ports', {
            url: '/ports',
            templateUrl: resolveTemplate('observium/load_balancer/load_balancer_ports'),
            controller: 'LoadBalancerPortsController',
            data: {
                href: '#/devices/load_balancer/:uuidp/ports',
                displayName: 'Load Balancers Ports'
            }
        })
        .state('devices.load_balancer.logs', {
            url: '/logs',
            templateUrl: resolveTemplate('observium/load_balancer/load_balancer_logs'),
            controller: 'LoadBalancerLogsController',
            data: {
                href: '#/devices/load_balancer/:uuidp/graphs',
                displayName: 'Load Balancer Logs'
            }
        })
        .state('devices.load_balancer.alerts', {
            url: '/alerts',
            templateUrl: resolveTemplate('observium/load_balancer/load_balancer_alerts'),
            controller: 'LoadBalancerAlertsController',
            data: {
                href: '#/devices/load_balancer/:uuidp/alerts',
                displayName: 'Load Balancer Alerts'
            }
        })
        .state('load_balancers-webconsole', {
            url: '/load_balancers/webconsole/:uuid/',
            templateUrl: resolveTemplate('vmware-webconsole'),
            controller: 'CustomerLoadBalancerWebConsoleController'
        })

        .state('devices.servers', {
            url: '/servers',
            // templateUrl: resolveTemplate('generic-tab'),
            templateUrl: resolveTemplate('private_cloud/hypervisors'),
            controller: 'ServerController',
            data: {
                href: '#/devices/servers',
                displayName: 'Hypervisors',
                index : 3
            }
        })
        .state('servers-webconsole', {
            url: '/servers/webconsole/:uuid/',
            templateUrl: resolveTemplate('vmware-webconsole'),
            controller: 'CustomerServerWebConsoleController'
        })


        // Hypervisors observium
        .state('devices.server', {
            url: '/server/:uuidp',
            templateUrl: resolveTemplate('observium/hypervisor/hypervisormenu'),
            controller: 'ServerMenuController',
            data: {
                href: '#/devices/servers',
                displayName: 'Hypervisors',
                index : 3
            }
        })
        .state('devices.server.overview', {
            url: '/overview',
            templateUrl: resolveTemplate('observium/hypervisor/hypervisoroverview'),
            controller: 'ServerOverviewController',
            data: {
                href: '#/devices/server/:uuidp/overview',
                displayName: 'Server Overview'
            }
        })
        .state('devices.server.graphs', {
            url: '/graphs',
            templateUrl: resolveTemplate('observium/hypervisor/hypervisorgraphs'),
            controller: 'ServerGraphController',
            data: {
                href: '#/devices/server/:uuidp/graphs',
                displayName: 'Server Graphs'
            }
        })
        .state('devices.server.healthstats', {
            url: '/healthstats',
            templateUrl: resolveTemplate('observium/hypervisor/hypervisorhealthstats'),
            controller: 'ServerHealthStatsController',
            data: {
                href: '#/devices/server/:uuidp/healthstats',
                displayName: 'Server Health Statistics'
            }
        })
        .state('devices.server.ports', {
            url: '/ports',
            templateUrl: resolveTemplate('observium/hypervisor/hypervisorports'),
            controller: 'ServerPortsController',
            data: {
                href: '#/devices/server/:uuidp/ports',
                displayName: 'Server Ports'
            }
        })
        .state('devices.server.logs', {
            url: '/logs',
            templateUrl: resolveTemplate('observium/hypervisor/hypervisorlogs'),
            controller: 'ServerLogsController',
            data: {
                href: '#/devices/server/:uuidp/graphs',
                displayName: 'Server Logs'
            }
        })
        .state('devices.server.alerts', {
            url: '/alerts',
            templateUrl: resolveTemplate('observium/hypervisor/hypervisoralerts'),
            controller: 'ServerAlertsController',
            data: {
                href: '#/devices/server/:uuidp/alerts',
                displayName: 'Server Alerts'
            }
        })

        .state('devices.vms', {
            url: '/vms',
            abstract: true,
            templateUrl: resolveTemplate('virtual-machines'),
            controller: 'CustomerVirtualMachineController',
            data: {
                href: '#/devices/vms/allvms',
                displayName: 'Virtual Machines',
                index: 4,
                index1: 0
            }
        })
        .state('devices.vms.allvms', {
            url: '/:uuidc',
            templateUrl: resolveTemplate('virtual-machines'),
            controller: 'CustomerVirtualMachineController',
            data: {
                href: '#/devices/vms/allvms',
                displayName: 'All VMs'
            }
        })
        .state('devices.vms.openstackvms', {
            url: '/:uuidc',
            templateUrl: resolveTemplate('virtual-machines'),
            controller: 'CustomerVirtualMachineController',
            data: {
                href: '#/devices/vms/openstackvms',
                displayName: 'OpenStack VMs'
            }
        })

        // openstack vms observium.
        .state('devices.vms.openstackvm', {
            url: '/openstackvm/:uuidq',
            templateUrl: resolveTemplate('observium/virtual_machines/openstack/openstackmenu'),
            controller: 'OpenstackMenuController',
            data: {
                href: '#/devices/vms/openstackvms',
                displayName: 'OpenStack VMs',
                index: 4,
                index1: 2
            }
        })
        .state('devices.vms.openstackvm.overview', {
            url: '/overview',
            templateUrl: resolveTemplate('observium/virtual_machines/openstack/openstackoverview'),
            controller: 'OpenstackOverviewController',
            data: {
                href: '#/devices/vms/openstackvm/:uuidq/overview',
                displayName: 'VM Overview'
            }
        })
        .state('devices.vms.openstackvm.graphs', {
            url: '/graphs',
            templateUrl: resolveTemplate('observium/virtual_machines/openstack/openstackgraphs'),
            controller: 'OpenstackGraphController',
            data: {
                href: '#/devices/vms/openstackvm/:uuidq/graphs',
                displayName: 'VM Graphs'
            }
        })
        .state('devices.vms.openstackvm.healthstats', {
            url: '/healthstats',
            templateUrl: resolveTemplate('observium/virtual_machines/openstack/openstackhealthstats'),
            controller: 'OpenstackHealthStatsController',
            data: {
                href: '#/devices/vms/openstackvm/:uuidq/healthstats',
                displayName: 'VM Health Statistics'
            }
        })
        .state('devices.vms.openstackvm.ports', {
            url: '/ports',
            templateUrl: resolveTemplate('observium/virtual_machines/openstack/openstackports'),
            controller: 'OpenstackPortsController',
            data: {
                href: '#/devices/vms/openstackvm/:uuidq/ports',
                displayName: 'VM Ports'
            }
        })
        .state('devices.vms.openstackvm.logs', {
            url: '/logs',
            templateUrl: resolveTemplate('observium/virtual_machines/openstack/openstacklogs'),
            controller: 'OpenstackLogsController',
            data: {
                href: '#/devices/vms/openstackvm/:uuidq/graphs',
                displayName: 'VM Logs'
            }
        })
        .state('devices.vms.openstackvm.alerts', {
            url: '/alerts',
            templateUrl: resolveTemplate('observium/virtual_machines/openstack/openstackalerts'),
            controller: 'OpenstackAlertsController',
            data: {
                href: '#/devices/vms/openstackvm/:uuidq/alerts',
                displayName: 'VM Alerts'
            }
        })

        .state('devices.vms.vmwarevms', {
            url: '/:uuidc',
            templateUrl: resolveTemplate('virtual-machines'),
            controller: 'CustomerVirtualMachineController',
            data: {
                href: '#/devices/vms/vmwarevms',
                displayName: 'VMware VMs'
            }
        })

        .state('devices.vms.vmwarevm', {
            url: '/vmwarevm/:uuidq',
            templateUrl: resolveTemplate('observium/virtual_machines/vmware/vmwaremenu'),
            controller: 'VMWareMenuController',
            data: {
                href: '#/devices/vms/vmwarevms',
                displayName: 'VMware VMs',
                index: 4,
                index1: 1
            }
        })
        .state('devices.vms.vmwarevm.overview', {
            url: '/overview',
            templateUrl: resolveTemplate('observium/virtual_machines/vmware/vmwareoverview'),
            controller: 'VMWareOverviewController',
            data: {
                href: '#/devices/vms/vmwarevm/:uuidq/overview',
                displayName: 'VM Overview'
            }
        })
        .state('devices.vms.vmwarevm.graphs', {
            url: '/graphs',
            templateUrl: resolveTemplate('observium/virtual_machines/vmware/vmwaregraphs'),
            controller: 'VMWareGraphController',
            data: {
                href: '#/devices/vms/vmwarevm/:uuidq/graphs',
                displayName: 'VM Graphs'
            }
        })
        .state('devices.vms.vmwarevm.healthstats', {
            url: '/healthstats',
            templateUrl: resolveTemplate('observium/virtual_machines/vmware/vmwarehealthstats'),
            controller: 'VMWareHealthStatsController',
            data: {
                href: '#/devices/vms/vmwarevm/:uuidq/healthstats',
                displayName: 'VM Health Statistics'
            }
        })
        .state('devices.vms.vmwarevm.ports', {
            url: '/ports',
            templateUrl: resolveTemplate('observium/virtual_machines/vmware/vmwareports'),
            controller: 'VMWarePortsController',
            data: {
                href: '#/devices/vms/vmwarevm/:uuidq/ports',
                displayName: 'VM Ports'
            }
        })
        .state('devices.vms.vmwarevm.logs', {
            url: '/logs',
            templateUrl: resolveTemplate('observium/virtual_machines/vmware/vmwarelogs'),
            controller: 'VMWareLogsController',
            data: {
                href: '#/devices/vms/vmwarevm/:uuidq/graphs',
                displayName: 'VM Logs'
            }
        })
        .state('devices.vms.vmwarevm.alerts', {
            url: '/alerts',
            templateUrl: resolveTemplate('observium/virtual_machines/vmware/vmwarealerts'),
            controller: 'VMWareAlertsController',
            data: {
                href: '#/devices/vms/vmwarevm/:uuidq/alerts',
                displayName: 'VM Alerts'
            }
        })


        .state('devices.vms.vcloudvms', {
            url: '/:uuidc',
            templateUrl: resolveTemplate('virtual-machines'),
            controller: 'CustomerVirtualMachineController',
            data: {
                href: '#/devices/vms/vcloudvms',
                displayName: 'VCloud VMs'
            }
        })

        .state('devices.vms.vcloudvm', {
            url: '/vcloudvm/:uuidq',
            templateUrl: resolveTemplate('observium/virtual_machines/vcloud/vcloudmenu'),
            controller: 'VCloudMenuController',
            data: {
                href: '#/devices/vms/vcloudvms',
                displayName: 'VCloud VMs',
                index: 4,
                index1: 1
            }
        })
        .state('devices.vms.vcloudvm.overview', {
            url: '/overview',
            templateUrl: resolveTemplate('observium/virtual_machines/vcloud/vcloudoverview'),
            controller: 'VCloudOverviewController',
            data: {
                href: '#/devices/vms/vcloudvm/:uuidq/overview',
                displayName: 'VM Overview'
            }
        })
        .state('devices.vms.vcloudvm.graphs', {
            url: '/graphs',
            templateUrl: resolveTemplate('observium/virtual_machines/vcloud/vcloudgraphs'),
            controller: 'VCloudGraphController',
            data: {
                href: '#/devices/vms/vcloudvm/:uuidq/graphs',
                displayName: 'VM Graphs'
            }
        })
        .state('devices.vms.vcloudvm.healthstats', {
            url: '/healthstats',
            templateUrl: resolveTemplate('observium/virtual_machines/vcloud/vcloudhealthstats'),
            controller: 'VCloudHealthStatsController',
            data: {
                href: '#/devices/vms/vcloudvm/:uuidq/healthstats',
                displayName: 'VM Health Statistics'
            }
        })
        .state('devices.vms.vcloudvm.ports', {
            url: '/ports',
            templateUrl: resolveTemplate('observium/virtual_machines/vcloud/vcloudports'),
            controller: 'VCloudPortsController',
            data: {
                href: '#/devices/vms/vcloudvm/:uuidq/ports',
                displayName: 'VM Ports'
            }
        })
        .state('devices.vms.vcloudvm.logs', {
            url: '/logs',
            templateUrl: resolveTemplate('observium/virtual_machines/vcloud/vcloudlogs'),
            controller: 'VCloudLogsController',
            data: {
                href: '#/devices/vms/vcloudvm/:uuidq/graphs',
                displayName: 'VM Logs'
            }
        })
        .state('devices.vms.vcloudvm.alerts', {
            url: '/alerts',
            templateUrl: resolveTemplate('observium/virtual_machines/vcloud/vcloudalerts'),
            controller: 'VCloudAlertsController',
            data: {
                href: '#/devices/vms/vcloudvm/:uuidq/alerts',
                displayName: 'VM Alerts'
            }
        })


        .state('devices.vms.awsvms', {
            url: '/:uuidc',
            templateUrl: resolveTemplate('virtual-machines'),
            controller: 'CustomerVirtualMachineController',
            data: {
                href: '#/devices/vms/awsvms',
                displayName: 'AWS VMs'
            }
        })
        .state('devices.vms.azurevms', {
            url: '/:uuidc',
            templateUrl: resolveTemplate('virtual-machines'),
            controller: 'CustomerVirtualMachineController',
            data: {
                href: '#/devices/vms/azurevms',
                displayName: 'Azure VMs'
            }
        })
        .state('devices.cloud_controllers', {
            url: '/cloud_controllers',
            templateUrl: resolveTemplate('cloud_controllers'),
            controller: 'CustomerCloudControllersController',
            data: {
                href: '#/devices/cloud_controllers',
                displayName: 'Cloud Controllers'
            }
        })
        .state('devices.bm_servers', {
            url: '/bm_servers',
            templateUrl: resolveTemplate('private_cloud/bm_servers'),
            controller: 'CustomerBMServerController',
            data: {
                href: '#/devices/bm_servers',
                displayName: 'Bare Metal Servers',
                index : 6
            }
        })

        // BM server IPMI
        .state('devices.bm_server_ipmi', {
            url: '/bm_server/:uuidp/ipmi',
            templateUrl: resolveTemplate('ipmi/bare_metal/bare_metal_ipmi_menu'),
            controller: 'BareMetalIPMIMenuController',
            data: {
                href: '#/devices/bm_servers',
                displayName: 'Bare Metal Servers',
                index : 6
            }
        })
        .state('devices.bm_server_ipmi.stats', {
            url: '/stats',
            templateUrl: resolveTemplate('ipmi/bare_metal/bare_metal_ipmi_stats'),
            controller: 'BareMetalIPMIStatsController',
            data: {
                href: '#/devices/bm_server/:uuidp/ipmi/stats',
                displayName: 'IPMI Stats'
            }
        })
        .state('devices.bm_server_ipmi.console', {
            url: '/console',
            templateUrl: resolveTemplate('ipmi/bare_metal/bare_metal_ipmi_console'),
            controller: 'BareMetalIPMIConsoleController',
            data: {
                href: '#/devices/bm_server/:uuidp/ipmi/console',
                displayName: 'Console'
            }
        })
        // BM server DRAC
        .state('devices.bm_server_drac', {
            url: '/bm_server/:uuidp/drac',
            templateUrl: resolveTemplate('ipmi/bare_metal/bare_metal_ipmi_menu'),
            controller: 'BareMetalDRACMenuController',
            data: {
                href: '#/devices/bm_servers',
                displayName: 'Bare Metal Servers',
                index : 6
            }
        })
        .state('devices.bm_server_drac.stats', {
            url: '/stats',
            templateUrl: resolveTemplate('ipmi/bare_metal/bare_metal_ipmi_stats'),
            controller: 'BareMetalIPMIStatsController',
            data: {
                href: '#/devices/bm_server/:uuidp/drac/stats',
                displayName: 'DRAC Stats'
            }
        })
        .state('devices.bm_server_drac.console', {
            url: '/console',
            templateUrl: resolveTemplate('ipmi/bare_metal/bare_metal_ipmi_console'),
            controller: 'BareMetalIPMIConsoleController',
            data: {
                href: '#/devices/bm_server/:uuidp/drac/console',
                displayName: 'Console'
            }
        })

        .state('devices.other_devices', {
            url: '/other_devices',
            templateUrl: resolveTemplate('custom_devices'),
            controller: 'CustomerCustomDevicesController',
            data: {
                href: '#/devices/other_devices',
                displayName: 'Other Devices',
                index : 6
            }
        })
        // .state('vm-details', {
        //     url:'/vms/:uuid/',
        //     templateUrl: resolveTemplate('generic-detail4'),
        //     controller: 'VirtualMachineDetailController'
        // })


        .state('colo', {
            url: '/colo',
            abstract: true,
            templateUrl: resolveTemplate('submenu'),
            controller: 'UserSubMenuController',
            data: {
                mainMenuItem: 'UnityCloud',
                href: '#/colo/cabs',
                displayName: 'Colo',
                index: 0
            }
        })
        .state('colo.cabs', {
            url: '/cabs',
            templateUrl: resolveTemplate('colo'),
            controller: 'CabinetController',
            data: {
                href: '#/colo/cabs',
                displayName: 'Cabinets'
            }
        })
        .state('colo.cabinetview', {
            url: '/cabinet/:uuidp/view',
            templateUrl: resolveTemplate('cabinet-view'),
            controller: 'CabinetViewController',
            data: {
                href: '#/colo/cabs',
                displayName: 'Cabinets'
            }
        })
        .state('colo.pdus', {
            url: '/pdus',
            templateUrl: resolveTemplate('colo'),
            controller: 'PDUController',
            data: {
                href: '#/colo/pdus',
                displayName: 'PDUs'
            }
        })
        .state('colo.pdu', {
            url: '/pdu/:uuidp',
            templateUrl: resolveTemplate('observium/pdu/pdumenu'),
            controller: 'PDUMenuController',
            data: {
                href: '#/colo/pdus',
                displayName: 'PDUs',
                index: 1
            }
        })

        .state('colo.pdu.overview', {
            url: '/overview',
            templateUrl: resolveTemplate('observium/pdu/pduoverview'),
            controller: 'PDUOverviewController',
            data: {
                href: '#/colo/pdu/:uuidp/overview',
                displayName: 'PDU Overview'
            }
        })

        .state('colo.pdu.graphs', {
            url: '/graphs',
            templateUrl: resolveTemplate('observium/pdu/pdugraphs'),
            controller: 'PDUGraphController',
            data: {
                href: '#/colo/pdu/:uuidp/graphs',
                displayName: 'PDU Graphs'
            }
        })

        .state('colo.pdu.healthstats', {
            url: '/healthstats',
            templateUrl: resolveTemplate('observium/pdu/pduhealthstats'),
            controller: 'PDUHealthStatsController',
            data: {
                href: '#/colo/pdu/:uuidp/healthstats',
                displayName: 'PDU Health Statistics'
            }
        })

        .state('colo.pdu.ports', {
            url: '/ports',
            templateUrl: resolveTemplate('observium/pdu/pduports'),
            controller: 'PDUPortsController',
            data: {
                href: '#/colo/pdu/:uuidp/ports',
                displayName: 'PDU Ports'
            }
        })

        .state('colo.pdu.logs', {
            url: '/logs',
            templateUrl: resolveTemplate('observium/pdu/pdulogs'),
            controller: 'PDULogsController',
            data: {
                href: '#/colo/pdu/:uuidp/graphs',
                displayName: 'PDU Logs'
            }
        })

        .state('colo.pdu.alerts', {
            url: '/alerts',
            templateUrl: resolveTemplate('observium/pdu/pdualerts'),
            controller: 'PDUAlertsController',
            data: {
                href: '#/colo/pdu/:uuidp/alerts',
                displayName: 'PDU Alerts'
            }
        })

        .state('colo.cages', {
            url: '/cages',
            templateUrl: resolveTemplate('colo'),
            controller: 'CageController',
            data: {
                href: '#/colo/cages',
                displayName: 'Cages'
            }
        })

//         .state('unitedconnect', {
//             url: '/vxcs',
// //            templateUrl: '/static/rest/app/client/templates/united_connect.html',
//             templateUrl: '/static/rest/app/client/templates/united_connect_temp.html',
//             controller: 'ClientUnitedConnectController',
//             data: {
//                 mainMenuItem: 'UnityCloud',
//                 href: '#/vxcs',
//                 displayName: 'United Connect'
//             }
//         })


        .state('unityconnect', {
            url: '/unityconnect',
            abstract: true,
            templateUrl: resolveTemplate('submenu2'),
            controller: 'UserSubMenuController',
            data: {
                mainMenuItem: 'UnityCloud',
                href: '#/unityconnect/bandwidth',
                displayName: 'UnityConnect',
                index: 0
            }
        })

        .state('unityconnect.bandwidth_billing', {
            url: '/billing',
            templateUrl: resolveTemplate('observium/bandwidth/bandwidth_billing'),
            controller: 'ClientBandwidthBillingController',
            data: {
                mainMenuItem: 'UnityCloud',
                href: '#/bandwidth',
                displayName: 'Bandwidth Billing'
            }
        })

        .state('unityconnect.network_bandwidth', {
            url: '/bandwidth',
            templateUrl: resolveTemplate('observium/bandwidth/bandwidth_ports'),
            controller: 'ClientNetworkBandwidthController',
            data: {
                mainMenuItem: 'UnityCloud',
                href: '#/bandwidth',
                displayName: 'Network Bandwidth'
            }
        })

        .state('unityconnect.bandwidth_graphs', {
            url: '/:uuidb/:uuidc/graphs',
            templateUrl: resolveTemplate('observium/bandwidth/bandwidth_graphs'),
            controller: 'ClientNetworkBandwidthGraphController',
            data: {
                mainMenuItem: 'UnityCloud',
                href: '#/unityconnect/:uuidb/graphs',
                displayName: 'Graphs'
            }
        })

        .state('unityconnect.vxc', {
            url: '/vxcs',
            templateUrl: '/static/rest/app/client/templates/united_connect_temp.html',
            controller: 'ClientUnitedConnectController',
            data: {
                mainMenuItem: 'UnityCloud',
                href: '#/vxcs',
                displayName: 'VXC'
            }
        })

        //  United Services State Config
        .state('security', {
            url: '/services/security',
            templateUrl: resolveTemplate('coming-soon'),
            controller: 'ComingsoonController',
            data: {
                mainMenuItem: 'UnityServices',
                href: '#/services/security',
                displayName: 'Security-as-a-Service'
            }
        })

        .state('application_as_service', {
            url: '/services/application',
            templateUrl: resolveTemplate('coming-soon'),
            controller: 'ComingsoonController',
            data: {
                mainMenuItem: 'UnityServices',
                href: '#/services/application',
                displayName: 'Application-as-a-Service'
            }
        })

        .state('database_as_service', {
            url: '/services/database',
            templateUrl: resolveTemplate('coming-soon'),
            controller: 'ComingsoonController',
            data: {
                mainMenuItem: 'UnityServices',
                href: '#/services/database',
                displayName: 'Database-as-a-Service'
            }
        })


//        .state('services', {
//            url: '/services',
//            templateUrl: resolveTemplate('submenu'),
//            controller: 'UserSubMenuController',
//            data: {
//                mainMenuItem: 'UnityServices',
//                href: '#/services/devops_controllers',
//                displayName: 'DevOps-as-a-Service',
//                index: 0
//            }
//        })
        .state('devops_controllers', {
            url: '/devops_controllers',
            templateUrl: resolveTemplate('devops_controllers/devops-controllers-view'),
            controller: 'CustomerDevOpsMgmtController',
            data: {
                mainMenuItem: 'UnityServices',
                title: 'DevOps Controllers',
                href: '#/devops_controllers',
                displayName: 'DevOps Controllers'
            }
        })
        .state('devops_controllers.console', {
            url: '/console',
            templateUrl: resolveTemplate('devops_controllers/devops-console'),
            controller: 'CustomerWebConsoleController',
            data: {
                mainMenuItem: 'UnityServices',
                title: 'console',
                href: '#/devops_controllers',
                displayName: 'DevOps Controllers'
            }
        })
        .state('terraform', {
            url: '/terraform',
            templateUrl: resolveTemplate('terraform'),
            controller: 'CustomerTerraformController',
            data: {
                title: 'Terraform',
                href: '#/services/terraform',
                displayName: 'Terraform'
            }
        })
        .state('vm_migration', {
            url: '/vm_migration',
            templateUrl: resolveTemplate('vm-migration'),
            controller: 'CustomerVmMigrationController',
            data: {
                mainMenuItem: 'UnityServices',
                title: 'VM Migration',
                href: '#/vm_migration',
                displayName: 'VM Migration'
            }
        })
        .state('vm_backup', {
            url: '/vm_backup',
            templateUrl: resolveTemplate('vm-backup'),
            controller: 'CustomerVmBackupController',
            data: {
                mainMenuItem: 'UnityServices',
                title: 'VM Backup',
                href: '#/vm_backup',
                displayName: 'VM Backup'
            }
        })
        .state('db_instance', {
            url: '/db_instance',
            templateUrl: resolveTemplate('db-instance'),
            controller: 'CustomerDBInstanceController',
            data: {
                title: 'DB Instance',
                href: '#/services/db_instance',
                displayName: 'DB Instance'
            }
        })


        // Deployment Engine
        .state('engines', {
            url: '/engines',
            templateUrl: resolveTemplate('submenu'),
            controller: 'UserSubMenuController',
            data: {
                mainMenuItem: 'UnitedServices',
                href: '#/engines/deployment-engine',
                displayName: 'DevOps-as-a-Service',
                index: 0
            }
        })
        .state('engines.deployment-engine', {
            url: '/deployment-engine',
            templateUrl: resolveTemplate('deployment/deployment-engine'),
            controller: 'CustomerDeploymentEngineController',
            data: {
                title: 'Deployment Engine',
                href: '#/engines/deployment-engine',
                displayName: 'Engine'
            }
        })
        .state('engines.all-deployments', {
            url: '/all-deployments',
            templateUrl: resolveTemplate('deployment/deployments'),
            controller: 'CustomerAllDeploymentController',
            data: {
                title: 'Deployments',
                href: '#/engines/all-deployments',
                displayName: 'Deployments'
            }
        })

        //  United Support State Config
        .state('ticket_mgmt', {
            url: '/ticket_management',
            abstract: true,
            templateUrl: resolveTemplate('submenu'),
            controller: 'UserSubMenuController',
            data: {
                mainMenuItem: 'Support',
                href: '#/ticket_management/all_tickets',
                displayName: 'Ticket Management',
                index: 0
            }
        })

        .state('ticket_mgmt.all_tickets', {
            url: '/all_tickets',
            templateUrl: resolveTemplate('all_tickets'),
            controller: 'CustomerAllTicketController',
            data: {
                href: '#/ticket_management/all_tickets',
                displayName: 'All Tickets',
            }
        })

        .state('ticket_mgmt.change_tickets', {
            url: '/change_tickets',
            templateUrl: resolveTemplate('change_ticket'),
            controller: 'CustomerChangeTicketController',
            data: {
                href: '#/ticket_management/change_tickets',
                displayName: 'Change Tickets',
            }
        })

        .state('ticket_mgmt.existing_tickets', {
            url: '/existing_tickets',
            templateUrl: resolveTemplate('existing_tickets'),
            controller: 'CustomerIncidentTicketController',
            data: {
                href: '#/ticket_management/existing_tickets',
                displayName: 'Incident Management',
            }
        })

        .state('ticket_mgmt.support_tickets', {
            url: '/support_tickets',
            templateUrl: resolveTemplate('zendesk'),
            controller: 'CustomerSupportTicketController',
            data: {
                href: '#/ticket_management/support_tickets',
                displayName: 'Service Request',
            }
        })

        .state('unity_feedback', {
            url: '/unity_feedback',
            templateUrl: resolveTemplate('unity_feedback'),
            controller: 'CustomerUnityFeedbackController',
            data: {
                mainMenuItem: 'Support',
                href: '#/unity_feedback',
                displayName: 'Unity Feedback Tickets',
            }
        })
        .state('zendesk-ticket-details', {
            url: '/zendesk/ticket/:ticket_id',
            templateUrl: resolveTemplate('ticket-detail'),
            controller: 'CustomerTicketDetailController',
            data: {
                mainMenuItem: 'Support',
                href: '#/zendesk/ticket/:ticket_id',
                displayName: 'Ticket Detail'
            }
        })
        .state('service_requests', {
            url: '/service_requests',
            templateUrl: resolveTemplate('coming-soon'),
            controller: 'ComingsoonController',
            data: {
                mainMenuItem: 'Support',
                href: '#/service_requests',
                displayName: 'Service Requests'
            }
        })
        .state('maintenance-schedules', {
            url: '/maintenance-schedules',
            templateUrl: resolveTemplate('maintenance_schedules'),
            controller: 'ClientMaintenanceController2',
            data: {
                mainMenuItem: 'Support',
                href: '#/maintenance-schedules',
                displayName: 'Maintenance Schedules'
            }
        })
        .state('unitydocs', {
            url: '/unitydocs',
            abstract: true,
            templateUrl: resolveTemplate('submenu'),
            controller: 'UserSubMenuController',
            data: {
                mainMenuItem: 'Support',
                href: '#/unitydocs/userguide',
                displayName: 'Unity Docs',
                index: 0
            }
        })
        .state('unitydocs.userguide', {
            url: '/userguide',
            templateUrl: resolveTemplate('user-guide'),
            controller: 'UserGuideController',
            data: {
                href: '#/unitydocs/userguide',
                displayName: 'User Guide',
                tabLinkName: 'userguide'
            }
        })
        .state('unitydocs.releases', {
            url: '/releases',
            abstract: true,
            controller: 'UserReleaseController',
            data: {
                href: '#/unitydocs/releases',
                displayName: 'Releases',
                tabLinkName: 'releases',
            }
        })
        .state('unitydocs.releases.current', {
            url: '/current',
            templateUrl: resolveTemplate('releases'),
            controller: 'UserReleaseController',
            data: {
                href: '#/unitydocs/releases/current',
                displayName: 'Current Release',
                tabLinkName: 'releases'
            }
        })
        .state('unitydocs.releases.releaselist', {
            url: '/list',
            templateUrl: resolveTemplate('releases-list'),
            controller: 'UserReleaseController',
            data: {
                href: '#/unitydocs/releases/list',
                displayName: 'Previous Releases',
                tabLinkName: 'Releases List'
            }
        })


        //  United Setup State Config
        .state('userList', {
            url: '/user',
            templateUrl: resolveTemplate('user_list'),
            controller: 'ClientUserController',
            data: {
                mainMenuItem: 'UnitySetup',
                href: '#/user',
                displayName: 'Users & Groups'
            }
        })

        .state('inventory_onboard', {
            url: '/inventory_onboard',
            templateUrl: resolveTemplate('assets_onboarding/assets_onboard'),
            controller: 'InventoryOnboardController',
            data: {
                mainMenuItem: 'UnitySetup',
                href: '#/inventory_onboard',
                displayName: 'Onboarding'
            }
        })

        .state('cost_calculator', {
            url: '/cost_calculator',
            templateUrl: resolveTemplate('cost_calculator'),
            controller: 'CostCalculatorController',
            data: {
                mainMenuItem: 'UnitySetup',
                href: '#/cost_calculator',
                displayName: 'Cost Calculator'
            }
        })

        .state('pagenotfound', {
            url: '/notfound',
            templateUrl: 'static/rest/app/templates/404.html'
        })



        //old states


        .state('org', {
            url: '/org',
            templateUrl: resolveTemplate('org'),
            controller: 'OrgController'
        })

        .state('server-details', {
            url: '/servers/:uuid',
            templateUrl: resolveTemplate('generic-detail4'),
            controller: 'ServerDetailController'
        })
        .state('instance', {
            url: '/instance',
            templateUrl: resolveTemplate('generic'),
            controller: 'ServerController'
        })
        .state('instance-details', {
            url: '/instance/:uuid',
            templateUrl: resolveTemplate('generic-detail3'),
            controller: 'InstanceDetailController'
        })
        .state('sans', {
            url: '/sans',
            templateUrl: resolveTemplate('generic'),
            controller: 'SANController'
        })
        .state('san-details', {
            url: '/sans/:uuid',
            templateUrl: resolveTemplate('generic-detail3'),
            controller: 'SANDetailController'
        })

        .state('openstack_instances', {
            url: '/openstack_instances',
            templateUrl: resolveTemplate('generic'),
            controller: 'CustomerOpenStackInstanceController'
        })
        .state('integ-health', {
            url: '/integ/health',
            templateUrl: resolveTemplate('health'),
            controller: 'MonitoredHostController'
        })
        .state('integ-net', {
            url: '/integ/net',
            templateUrl: resolveTemplate('networkutil'),
            controller: 'CustomerNetworkingController'
        })


        .state('switch-details', {
            url: '/switches/:uuid/',
            templateUrl: resolveTemplate('generic-detail4'),
            controller: 'SwitchDetailController'
        })

        .state('load_balancer-details', {
            url: '/load_balancers/:uuid/',
            templateUrl: resolveTemplate('generic-detail4'),
            controller: 'LoadBalancerDetailController'
        })

        .state('firewall-details', {
            url: '/firewalls/:uuid/',
            templateUrl: resolveTemplate('generic-detail4'),
            controller: 'FirewallDetailController'
        })

        // .state('newdashboard', {
        //     url:'/newdashboard',
        //     templateUrl: resolveTemplate('client-dashboard'),
        //     controller: 'ClientDashboardController'
        // })
        .state('datacenter', {
            url: '/datacenter/:id',
            templateUrl: resolveTemplate('datacenter'),
            controller: 'ClientDatacenterController'
        })
        .state('datacenter-all', {
            url: '/datacenter-all',
            templateUrl: resolveTemplate('datacenter-all'),
            controller: 'ClientAllDatacenterController',
            data: {title: 'Data Centers'}
        })
        .state('private-clouds-all', {
            url: '/private-clouds-all',
            templateUrl: resolveTemplate('private-cloud-all'),
            controller: 'ClientAllPrivateCloudController',
            data: {title: 'Private Clouds'}
        })
        .state('public-clouds-all', {
            url: '/public-clouds-all',
            templateUrl: resolveTemplate('public-cloud-all'),
            controller: 'ClientAllPublicCloudController',
            data: {title: 'Public Clouds'}
        })
        .state('colocations-all', {
            url: '/colocations-all',
            templateUrl: resolveTemplate('colocations-all'),
            controller: 'ClientAllColocationController',
            data: {title: 'Colocations'}
        })

        //Azure customer Interfaces-------------------------------------------------------------

        //TODO this will not be required


        //Client Management Interfaces

        .state('vmware-vcenter', {
            url: '/vmware-vcenter',
            templateUrl: resolveTemplate('generic_proxy'),
            controller: 'CustomerVmwareVcenterController'
        })

        .state('vmware-esxi', {
            url: '/vmware-esxi',
            templateUrl: resolveTemplate('generic_proxy'),
            controller: 'CustomerVmwareEsxiController'
        })
        .state('vmware-esxi-proxy-details', {
            url: '/vmware-esxi/:uuid/',
            templateUrl: resolveTemplate('customer-proxy-detail'),
            controller: 'CustomerVmwareEsxiProxyDetailController'
        })
        .state('openstack-proxy', {
            url: '/openstack-proxy',
            templateUrl: resolveTemplate('generic_proxy'),
            controller: 'CustomerOpenStackProxyController'
        })
        .state('openstack-proxy-details', {
            url: '/openstack-proxy/:uuid/',
            templateUrl: resolveTemplate('customer-proxy-detail'),
            controller: 'CustomerOpenStackProxyDetailController'
        })
        .state('f5-lb-proxy', {
            url: '/f5-lb-proxy',
            templateUrl: resolveTemplate('generic_proxy'),
            controller: 'CustomerF5LoadBalancerProxyController'
        })
        .state('f5-lb-proxy-details', {
            url: '/f5-lb-proxy/:uuid/',
            templateUrl: resolveTemplate('customer-proxy-detail'),
            controller: 'CustomerF5LoadBalancerProxyDetailController'
        })
        .state('cisco-firewall', {
            url: '/cisco-firewall',
            templateUrl: resolveTemplate('generic_proxy'),
            controller: 'CustomerCiscoFirewallProxyController'
        })
        .state('cisco-firewall-details', {
            url: '/cisco-firewall/:uuid/',
            templateUrl: resolveTemplate('customer-proxy-detail'),
            controller: 'CustomerCiscoFirewallDetailController'
        })
        .state('juniper-firewall', {
            url: '/juniper-firewall',
            templateUrl: resolveTemplate('generic_proxy'),
            controller: 'CustomerJuniperFirewallProxyController'
        })
        .state('citrix-vpx-device', {
            url: '/citrix-vpx-device',
            templateUrl: resolveTemplate('generic_proxy'),
            controller: 'CustomerCitrixVPXDeviceProxyController'
        })
        .state('citrix-vpx-device-details', {
            url: '/citrix-vpx-device/:uuid/',
            templateUrl: resolveTemplate('customer-proxy-detail'),
            controller: 'CustomerCitrixVPXDeviceProxyDetailController'
        })
        .state('cisco-switch', {
            url: '/cisco-switch',
            templateUrl: resolveTemplate('generic_proxy'),
            controller: 'CustomerCiscoSwitchProxyController'
        })
        .state('cisco-switch-details', {
            url: '/cisco-switch/:uuid/',
            templateUrl: resolveTemplate('customer-proxy-detail'),
            controller: 'CustomerCiscoSwitchDetailController'
        })
        .state('juniper-switch', {
            url: '/juniper-switch',
            templateUrl: resolveTemplate('generic_proxy'),
            controller: 'CustomerJuniperSwitchProxyController'
        })
        .state('juniper-switch-details', {
            url: '/juniper-switch/:uuid/',
            templateUrl: resolveTemplate('customer-proxy-detail'),
            controller: 'CustomerJuniperSwitchDetailController'
        })
        .state('tenable', {
            url: '/tenable',
            templateUrl: resolveTemplate('generic_proxy'),
            controller: 'CustomerTenableProxyController'
        })
        .state('tenable-proxy-details', {
            url: '/tenable/:uuid/',
            templateUrl: resolveTemplate('customer-proxy-detail'),
            controller: 'CustomerTenableProxyDetailController'
        })

        .state('vmware-webconsole', {
            url: '/vmware-vm/webconsole/:uuid/',
            templateUrl: resolveTemplate('vmware-webconsole'),
            controller: 'CustomerVmwareWebConsoleController'
        })
        .state('vcloud-webconsole', {
            url: '/vcloud-vm/webconsole/:uuid/',
            templateUrl: resolveTemplate('vmware-webconsole'),
            controller: 'CustomerVCloudWebConsoleController'
        })
        .state('baremetal-webconsole', {
            url: '/baremetal/webconsole/:uuid/',
            templateUrl: resolveTemplate('bmserver-webconsole'),
            controller: 'CustomerBMWebConsoleController'
        })
        .state('vmware-wmks-console', {
            url: '/vmware-wmks-vm/webconsole/:uuid/',
            templateUrl: resolveTemplate('vmware-wmks-console'),
            controller: 'CustomerVmwareWmksConsoleController'
        })
        .state('vmware-wmks-console-iframe', {
            url: '/vmware-wmks-vm/webconsole/iframe/:uuid/',
            templateUrl: resolveTemplate('vmware-wmks-console'),
            controller: 'CustomerVmwareWmksConsoleController'
        })
        .state('openstack-webconsole', {
            url: '/openstack-vm/webconsole/:uuid/',
            templateUrl: resolveTemplate('vmware-webconsole'),
            controller: 'CustomerOpenStackWebConsoleController'
        })
        .state('custom-cloud-webconsole', {
            url: '/custom-vm/webconsole/:uuid/',
            templateUrl: resolveTemplate('vmware-webconsole'),
            controller: 'CustomerCustomCloudWebConsoleController'
        })
        .state('openstack-webconsole-iframe', {
            url: '/openstack-vm/webconsole/iframe/:uuid/',
            templateUrl: resolveTemplate('vmware-webconsole'),
            controller: 'CustomerOpenStackWebConsoleController'
        })
        .state('devops-console', {
            url: '/webconsole/:uuid/',
            templateUrl: resolveTemplate('devops_controllers/devops_console'),
            controller: 'CustomerWebConsoleController'
        })
        .state('user-details', {
            url: '/user/:id/',
            templateUrl: '/static/rest/app/templates/user_detail.html',
            controller: 'ClientUserDetailController'
        })


        // UnityServices

        .state('terraform-service-details', {
            url: '/services/terraform/:uuid/',
            templateUrl: resolveTemplate('terraform-webconsole'),
            controller: 'CustomerTerraformWebConsoleController',
            data: {
                title: 'Terraform Web Console',
                displayName: 'Terraform Web Console',
                href: '#/service/terraform/{}/'
            }
        })

        .state('terraform-service-iframe-details', {
            url: '/services/terraform/iframe/:uuid/',
            templateUrl: resolveTemplate('terraform-webconsole'),
            controller: 'CustomerTerraformWebConsoleController',
            data: {
                title: 'Terraform Web Console',
                displayName: 'Terraform Web Console',
                href: '#/service/terraform/iframe/{}/'
            }
        })



        // AWS Module Routes

        // .state('aws-dashboard', {
        //     url:'/aws-dashboard',
        //     templateUrl: '/static/rest/app/client/templates/aws/aws_dashboard.html',
        //     controller: 'CustomerAwsDashboardController',
        // })
        // .state('aws-account-aws-region', {
        //     url:'/aws/:account_id/aws-region/:name',
        //     templateUrl: '/static/rest/app/client/templates/aws/aws_list_all.html',
        //     controller: 'CustomerAwsController',
        // })
        // .state('aws-account-aws-region-virtual-machines', {
        //     url:'/aws/:account_id/aws-region/:name/virtual-machines',
        //     templateUrl: '/static/rest/app/client/templates/aws/aws_virtual_machines.html',
        //     controller: 'CustomerAwsController',
        // })

        .state('aws-account-aws-region-create-image-forinstance', {
            url: '/aws/:account_id/aws-region/:name/createimage/:instanceid',
            templateUrl: '/static/rest/app/client/templates/partials/create_aws_image.html',
            controller: 'CustomerAwsImageController',
        })
        .state('aws-account-aws-region-attach-instance-forinstance', {
            url: '/aws/:account_id/aws-region/:name/attachinstance/:instanceid',
            templateUrl: '/static/rest/app/client/templates/aws/attach_autoscaling_group.html',
            controller: 'CustomerAwsAttachAutoscalingGroupController',
        })
        .state('aws-account-aws-region-attach-interface-forinstance', {
            url: '/aws/:account_id/aws-region/:name/attachinterface/:instanceid',
            templateUrl: '/static/rest/app/client/templates/aws/attach_network_interface.html',
            controller: 'CustomerAwsAttachInterfaceController',
        })
        .state('aws-account-aws-region-snapshot', {
            url: '/aws/:account_id/aws-region/:name/snapshot/:snapshotid',
            templateUrl: '/static/rest/app/client/templates/aws/copy_snapshot.html',
            controller: 'CustomerAwsSnapshotController',
        });

    $stateProviderRef = $stateProvider;
    $urlRouterProviderRef = $urlRouterProvider;

    $urlRouterProvider.otherwise('/unity');
});

app.config([
    '$resourceProvider',
    function ($resourceProvider) {
        $resourceProvider.defaults.stripTrailingSlashes = false;
    }
]);

app.config([
    'localStorageServiceProvider',
    function (localStorageServiceProvider) {
        localStorageServiceProvider
            .setStorageCookieDomain('unitedlayer.com')
            .setStorageCookie(1);
    }
]);

// app.config(function (uiGmapGoogleMapApiProvider) {
//     uiGmapGoogleMapApiProvider.configure({
//         //    key: 'your api key',
//         v: '3.20', //defaults to latest 3.X anyhow
//         libraries: 'weather,geometry,visualization'
//     });
// });

