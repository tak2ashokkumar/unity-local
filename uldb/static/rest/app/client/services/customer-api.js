/**
 * Created by rt on 9/23/15.
 */

var customer_app = angular.module('customerAPI', ['ngResource']);

// maybe this should be an angular factory...
var DRFQueryFactory = function () {
    var query = function () {
        return {
            method: 'GET',
            cache: false,
            isArray: false
            , transformResponse: function (data, headersGetter) {
                var d = angular.fromJson(data);
                if(d.results){
                    return {
                        results: d.results,
                        count: d.count
                    };
                }
                else{
                    return {
                        results: d,
                    };
                }
            }
        };
    };
    return new query();
};

var registry = [
     { resourceName: 'CustomerServer',         uri: 'servers'}
    ,{ resourceName: 'CustomerBMServer',         uri: 'bm_servers'}
    ,{ resourceName: 'Instance',               uri: 'instance'}
    ,{ resourceName: 'CustomerVirtualMachine', uri: 'virtual_machines'}
    ,{ resourceName: 'CustomerSwitch',         uri: 'switches'}
    ,{ resourceName: 'CustomerLoadBalancer',   uri: 'load_balancers'}
    ,{ resourceName: 'CustomerFirewall',       uri: 'firewalls'}
    ,{ resourceName: 'CustomerHostMonitor',    uri: 'host_monitor'}
    ,{ resourceName: 'CustomerGraphedPort',    uri: 'graphed_port'}
    ,{ resourceName: 'CustomerCabinet',        uri: 'cabinets'}
    ,{ resourceName: 'CustomerPDU',            uri: 'pdus'}
    ,{ resourceName: 'CustomerCage',           uri: 'cages'}
    ,{ resourceName: 'CustomerSAN',            uri: 'sans'}
    ,{ resourceName: 'CustomerOrganization',   uri: 'organization'}
    ,{ resourceName: 'CustomerOrganizationUser',   uri: 'organizationusers'}
    ,{ resourceName: 'CustomerDatacenter',     uri: 'datacenters'}
    ,{ resourceName: 'CustomerPrivateCloud',     uri: 'private_cloud'}
    ,{ resourceName: 'CustomerTicketOrganization',   uri: 'ticketorganization'}
    ,{ resourceName: 'CustomerSalesforceOpportunity',        uri: 'opportunities'}
    ,{ resourceName: 'CustomerInvoice',         uri: 'invoices'}
    ,{ resourceName: 'CustomerOpenStackInstance', uri: 'openstack_instances'}

    ,{ resourceName: 'CustomerVcenter', uri: 'vcenter'}
    ,{ resourceName: 'CustomerEsxi', uri: 'esxi'}
    ,{ resourceName: 'CustomerOpenstack', uri: 'openstack_proxy'}
    ,{ resourceName: 'CustomerF5LB', uri: 'f5loadbalancer'}
    ,{ resourceName: 'CustomerCiscoFirewall', uri: 'cisco_firewall'}
    ,{ resourceName: 'CustomerJuniperFirewall', uri: 'juniper_firewall'}
    ,{ resourceName: 'CustomerCitrix', uri: 'citrix'}
    ,{ resourceName: 'CustomerCiscoSwitch', uri: 'cisco_switch'}
    ,{ resourceName: 'CustomerJuniperSwitch', uri: 'juniper_switch'}
    ,{ resourceName: 'CustomerTenable', uri: 'tenable'}

    ,{ resourceName: 'CustomerMaintenance', uri: 'mschedules'}
    ,{ resourceName: 'CustomerColoCloud', uri: 'colo_cloud'}
];

function expandCustomerUri(uri) {
    return '/customer/' + uri + '/:uuid/';
}

function initRegistry(reg, resolverFunc) {
    reg.forEach(function (e, i, arr) {
        customer_app.factory(e.resourceName, ['$resource',
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

initRegistry(registry, expandCustomerUri);

// registry.forEach(function(e, i, arr) {
//     customer_app.factory(e.resourceName, ['$resource',
//         function ($resource) {
//             return $resource(expandCustomerUri(e.uri), {
//                 uuid: '@uuid'
//             }, {
//                 query: DRFQueryFactory(),
//                 update: { method: 'PUT' }
//             });
//         }
//     ]);
// });

// now that that's done the fast way, let's wrap the registry in a service to make it injectable
customer_app.factory('APIRegistryService', [
    function () {
        var registry = registry;
        return {
            registry: registry
        };
    }
]);

customer_app.factory('DefaultAccess', ['$resource',
    function ($resource) {
         return $resource('/rest/user/get_portal_access/', {});
    }
]);


customer_app.factory('CustomerUserAccount', ['$resource',
    function ($resource) {
        return $resource('/customer/uldbusers/profile/:uuid/', {
            uuid: '@uuid'
        }, {
            query: DRFQueryFactory(),
            update: { method:'PUT' }
        });
    }
]);

customer_app.factory('CustomerUserProfile', ['$resource',
    function ($resource) {
        return $resource('/customer/uldbusers/:uuid/', {
            uuid: '@uuid'
        }, {
            query: DRFQueryFactory(),
            update: { method:'PUT' }
        });
    }
]);

customer_app.factory('CustomerChangePassword', ['$resource',
    function ($resource) {
        return $resource('/customer/uldbusers/:uuid/change_password/', {
            uuid: '@uuid'
        }, {
            query: DRFQueryFactory(),
            update: {
                method: 'PUT'
            }
        });
    }
]);
