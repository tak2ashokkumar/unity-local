var app = angular.module('uldb');
app.factory('OpenstackService', [
    '$timeout',
    '$http',
    'RestService',
    'AdminApi',
    function ($timeout,
              $http,
              RestService,
              AdminApi) {
        return {
            get_keypair_data: function (url) {
                return RestService.get_data(url);
            },
            get_flavor_data: function (url) {
                return RestService.get_data(url);
            },
            get_flavor_access_data: function (url) {
                return RestService.get_data(url);
            },
            get_vm_tenant_data: function (url) {
                return RestService.get_data(url);
            },
            get_volumes_data: function (url) {
                return RestService.get_data(url);
            },
            get_endpoints_data: function (url) {
                return RestService.get_data(url);
            },
            get_tenats_endpoint_data: function (url) {
                return RestService.get_data(url);
            },
            get_credentials_data: function (url) {
                return RestService.get_data(url);
            },
            get_os_hosts_tenant_data: function (url) {
                return RestService.get_data(url);
            },
            get_os_tokens: function (url) {
                return RestService.get_data(url);
            },
            get_service_catalog_data: function (url) {
                return RestService.get_data(url);
            },
            get_regions_data: function (url) {
                return RestService.get_data(url);
            },
            get_hypervisor_data: function (url) {
                return RestService.get_data(url);
            },
            get_host_security_group_data: function (url) {
                return RestService.get_data(url);
            },
            get_availability_zone_data: function (url) {
                return RestService.get_data(url);
            },
            get_instances_data: function (url) {
                return RestService.get_data(url);
            },
            get_image_list_data: function (url) {
                return RestService.get_data(url);
            },
            get_server_ip_data: function (url) {
                return RestService.get_data(url);
            },
            get_subnet_data: function (url) {
                return RestService.get_data(url);
            },
            get_tenantlist_data: function (url) {
                return RestService.get_data(url);
            },
            get_tenantusage_data: function (url) {
                return RestService.get_data(url);
            },
            get_tenants_data: function (url) {
                return RestService.get_data(url);
            },
            get_usage_details: function (url) {
                return RestService.get_data(url);
            },
            get_global_data: function (url) {
                return RestService.get_data(url);
            },
            //Delete Functions
            delete_keypair: function (url) {
                return RestService.delete_data(url);
            },
            delete_flavor: function (url) {
                return RestService.delete_data(url);
            },
            delete_credential: function (url) {
                return RestService.delete_data(url);
            },
            delete_region: function (url) {
                return RestService.delete_data(url);
            },
            delete_general_tenant: function (url) {
                return RestService.delete_data(url);
            },
            delete_image_list: function (url) {
                return RestService.delete_data(url);
            },

        };
    }
]);
