'use strict';
var app = angular.module('uldb');
app.factory('CustomDataService', [
    '$http',
    '$q',
    'AdminApi',
    function ($http,
              $q,
              AdminApi) {
        var getJsonfilePath = function (name) {
            return AdminApi.custom_data_url.replace(':filename', name);
        };
        var _post_data = function save_modal_data(params, url) {
            $http({
                method: "POST",
                url: url,
                data: params
            }).then(function (response) {
                return response;
            }).catch(function (error) {
                return error;
            });
        };
        var _retrieve_dropdowns = function (path) {
            return $http({
                method: "GET",
                url: path
            }).then(function (result) {
                var obj = { data: null };
                obj.data = result.data;
                // console.log(obj.data);
                return obj.data;
            }).catch(function (error) {
                console.log(error);
            });
        };
        var _retrieve_data = function (path) {
            return $http({
                method: "GET",
                url: path
            }).then(function (result) {
                var obj = { data: null };
                obj.data = result.data;
                return obj;
            }).catch(function (error) {
                // console.log("Error================>"+error);
            });
        };
        var _retrieve_data_url = function (path) {
            return $http({
                method: "GET",
                url: path
            }).then(function (result) {
                var obj = { data: null };
                obj.data = { info: null };
                obj.data.info = result.data.results;
                return obj;
            }).catch(function (error) {
                // console.log("Error================>"+error);
            });
        };
        var _retrieve_tickets = function (path) {
            return $http({
                method: "GET",
                url: path
            }).then(function (response) {
                return response.data;
            }).catch(function (error) {
                // console.log("Error================>"+error);
            });
        };

        var _get_pytz_all_timezone = function () {
            return ['Africa/Abidjan', 'Africa/Accra', 'Africa/Addis_Ababa', 'Africa/Algiers', 'Africa/Asmara', 'Africa/Bamako', 'Africa/Bangui', 'Africa/Banjul', 'Africa/Bissau', 'Africa/Blantyre', 'Africa/Brazzaville', 'Africa/Bujumbura', 'Africa/Cairo', 'Africa/Casablanca', 'Africa/Ceuta', 'Africa/Conakry', 'Africa/Dakar', 'Africa/Dar_es_Salaam', 'Africa/Djibouti', 'Africa/Douala', 'Africa/El_Aaiun', 'Africa/Freetown', 'Africa/Gaborone', 'Africa/Harare', 'Africa/Johannesburg', 'Africa/Juba', 'Africa/Kampala', 'Africa/Khartoum', 'Africa/Kigali', 'Africa/Kinshasa', 'Africa/Lagos', 'Africa/Libreville', 'Africa/Lome', 'Africa/Luanda', 'Africa/Lubumbashi', 'Africa/Lusaka', 'Africa/Malabo', 'Africa/Maputo', 'Africa/Maseru', 'Africa/Mbabane', 'Africa/Mogadishu', 'Africa/Monrovia', 'Africa/Nairobi', 'Africa/Ndjamena', 'Africa/Niamey', 'Africa/Nouakchott', 'Africa/Ouagadougou', 'Africa/Porto-Novo', 'Africa/Sao_Tome', 'Africa/Tripoli', 'Africa/Tunis', 'Africa/Windhoek', 'America/Adak', 'America/Anchorage', 'America/Anguilla', 'America/Antigua', 'America/Araguaina', 'America/Argentina/Buenos_Aires', 'America/Argentina/Catamarca', 'America/Argentina/Cordoba', 'America/Argentina/Jujuy', 'America/Argentina/La_Rioja', 'America/Argentina/Mendoza', 'America/Argentina/Rio_Gallegos', 'America/Argentina/Salta', 'America/Argentina/San_Juan', 'America/Argentina/San_Luis', 'America/Argentina/Tucuman', 'America/Argentina/Ushuaia', 'America/Aruba', 'America/Asuncion', 'America/Atikokan', 'America/Bahia', 'America/Bahia_Banderas', 'America/Barbados', 'America/Belem', 'America/Belize', 'America/Blanc-Sablon', 'America/Boa_Vista', 'America/Bogota', 'America/Boise', 'America/Cambridge_Bay', 'America/Campo_Grande', 'America/Cancun', 'America/Caracas', 'America/Cayenne', 'America/Cayman', 'America/Chicago', 'America/Chihuahua', 'America/Costa_Rica', 'America/Creston', 'America/Cuiaba', 'America/Curacao', 'America/Danmarkshavn', 'America/Dawson', 'America/Dawson_Creek', 'America/Denver', 'America/Detroit', 'America/Dominica', 'America/Edmonton', 'America/Eirunepe', 'America/El_Salvador', 'America/Fort_Nelson', 'America/Fortaleza', 'America/Glace_Bay', 'America/Godthab', 'America/Goose_Bay', 'America/Grand_Turk', 'America/Grenada', 'America/Guadeloupe', 'America/Guatemala', 'America/Guayaquil', 'America/Guyana', 'America/Halifax', 'America/Havana', 'America/Hermosillo', 'America/Indiana/Indianapolis', 'America/Indiana/Knox', 'America/Indiana/Marengo', 'America/Indiana/Petersburg', 'America/Indiana/Tell_City', 'America/Indiana/Vevay', 'America/Indiana/Vincennes', 'America/Indiana/Winamac', 'America/Inuvik', 'America/Iqaluit', 'America/Jamaica', 'America/Juneau', 'America/Kentucky/Louisville', 'America/Kentucky/Monticello', 'America/Kralendijk', 'America/La_Paz', 'America/Lima', 'America/Los_Angeles', 'America/Lower_Princes', 'America/Maceio', 'America/Managua', 'America/Manaus', 'America/Marigot', 'America/Martinique', 'America/Matamoros', 'America/Mazatlan', 'America/Menominee', 'America/Merida', 'America/Metlakatla', 'America/Mexico_City', 'America/Miquelon', 'America/Moncton', 'America/Monterrey', 'America/Montevideo', 'America/Montserrat', 'America/Nassau', 'America/New_York', 'America/Nipigon', 'America/Nome', 'America/Noronha', 'America/North_Dakota/Beulah', 'America/North_Dakota/Center', 'America/North_Dakota/New_Salem', 'America/Ojinaga', 'America/Panama', 'America/Pangnirtung', 'America/Paramaribo', 'America/Phoenix', 'America/Port-au-Prince', 'America/Port_of_Spain', 'America/Porto_Velho', 'America/Puerto_Rico', 'America/Punta_Arenas', 'America/Rainy_River', 'America/Rankin_Inlet', 'America/Recife', 'America/Regina', 'America/Resolute', 'America/Rio_Branco', 'America/Santarem', 'America/Santiago', 'America/Santo_Domingo', 'America/Sao_Paulo', 'America/Scoresbysund', 'America/Sitka', 'America/St_Barthelemy', 'America/St_Johns', 'America/St_Kitts', 'America/St_Lucia', 'America/St_Thomas', 'America/St_Vincent', 'America/Swift_Current', 'America/Tegucigalpa', 'America/Thule', 'America/Thunder_Bay', 'America/Tijuana', 'America/Toronto', 'America/Tortola', 'America/Vancouver', 'America/Whitehorse', 'America/Winnipeg', 'America/Yakutat', 'America/Yellowknife', 'Antarctica/Casey', 'Antarctica/Davis', 'Antarctica/DumontDUrville', 'Antarctica/Macquarie', 'Antarctica/Mawson', 'Antarctica/McMurdo', 'Antarctica/Palmer', 'Antarctica/Rothera', 'Antarctica/Syowa', 'Antarctica/Troll', 'Antarctica/Vostok', 'Arctic/Longyearbyen', 'Asia/Aden', 'Asia/Almaty', 'Asia/Amman', 'Asia/Anadyr', 'Asia/Aqtau', 'Asia/Aqtobe', 'Asia/Ashgabat', 'Asia/Atyrau', 'Asia/Baghdad', 'Asia/Bahrain', 'Asia/Baku', 'Asia/Bangkok', 'Asia/Barnaul', 'Asia/Beirut', 'Asia/Bishkek', 'Asia/Brunei', 'Asia/Chita', 'Asia/Choibalsan', 'Asia/Colombo', 'Asia/Damascus', 'Asia/Dhaka', 'Asia/Dili', 'Asia/Dubai', 'Asia/Dushanbe', 'Asia/Famagusta', 'Asia/Gaza', 'Asia/Hebron', 'Asia/Ho_Chi_Minh', 'Asia/Hong_Kong', 'Asia/Hovd', 'Asia/Irkutsk', 'Asia/Jakarta', 'Asia/Jayapura', 'Asia/Jerusalem', 'Asia/Kabul', 'Asia/Kamchatka', 'Asia/Karachi', 'Asia/Kathmandu', 'Asia/Khandyga', 'Asia/Kolkata', 'Asia/Krasnoyarsk', 'Asia/Kuala_Lumpur', 'Asia/Kuching', 'Asia/Kuwait', 'Asia/Macau', 'Asia/Magadan', 'Asia/Makassar', 'Asia/Manila', 'Asia/Muscat', 'Asia/Nicosia', 'Asia/Novokuznetsk', 'Asia/Novosibirsk', 'Asia/Omsk', 'Asia/Oral', 'Asia/Phnom_Penh', 'Asia/Pontianak', 'Asia/Pyongyang', 'Asia/Qatar', 'Asia/Qyzylorda', 'Asia/Riyadh', 'Asia/Sakhalin', 'Asia/Samarkand', 'Asia/Seoul', 'Asia/Shanghai', 'Asia/Singapore', 'Asia/Srednekolymsk', 'Asia/Taipei', 'Asia/Tashkent', 'Asia/Tbilisi', 'Asia/Tehran', 'Asia/Thimphu', 'Asia/Tokyo', 'Asia/Tomsk', 'Asia/Ulaanbaatar', 'Asia/Urumqi', 'Asia/Ust-Nera', 'Asia/Vientiane', 'Asia/Vladivostok', 'Asia/Yakutsk', 'Asia/Yangon', 'Asia/Yekaterinburg', 'Asia/Yerevan', 'Atlantic/Azores', 'Atlantic/Bermuda', 'Atlantic/Canary', 'Atlantic/Cape_Verde', 'Atlantic/Faroe', 'Atlantic/Madeira', 'Atlantic/Reykjavik', 'Atlantic/South_Georgia', 'Atlantic/St_Helena', 'Atlantic/Stanley', 'Australia/Adelaide', 'Australia/Brisbane', 'Australia/Broken_Hill', 'Australia/Currie', 'Australia/Darwin', 'Australia/Eucla', 'Australia/Hobart', 'Australia/Lindeman', 'Australia/Lord_Howe', 'Australia/Melbourne', 'Australia/Perth', 'Australia/Sydney', 'Canada/Atlantic', 'Canada/Central', 'Canada/Eastern', 'Canada/Mountain', 'Canada/Newfoundland', 'Canada/Pacific', 'Europe/Amsterdam', 'Europe/Andorra', 'Europe/Astrakhan', 'Europe/Athens', 'Europe/Belgrade', 'Europe/Berlin', 'Europe/Bratislava', 'Europe/Brussels', 'Europe/Bucharest', 'Europe/Budapest', 'Europe/Busingen', 'Europe/Chisinau', 'Europe/Copenhagen', 'Europe/Dublin', 'Europe/Gibraltar', 'Europe/Guernsey', 'Europe/Helsinki', 'Europe/Isle_of_Man', 'Europe/Istanbul', 'Europe/Jersey', 'Europe/Kaliningrad', 'Europe/Kiev', 'Europe/Kirov', 'Europe/Lisbon', 'Europe/Ljubljana', 'Europe/London', 'Europe/Luxembourg', 'Europe/Madrid', 'Europe/Malta', 'Europe/Mariehamn', 'Europe/Minsk', 'Europe/Monaco', 'Europe/Moscow', 'Europe/Oslo', 'Europe/Paris', 'Europe/Podgorica', 'Europe/Prague', 'Europe/Riga', 'Europe/Rome', 'Europe/Samara', 'Europe/San_Marino', 'Europe/Sarajevo', 'Europe/Saratov', 'Europe/Simferopol', 'Europe/Skopje', 'Europe/Sofia', 'Europe/Stockholm', 'Europe/Tallinn', 'Europe/Tirane', 'Europe/Ulyanovsk', 'Europe/Uzhgorod', 'Europe/Vaduz', 'Europe/Vatican', 'Europe/Vienna', 'Europe/Vilnius', 'Europe/Volgograd', 'Europe/Warsaw', 'Europe/Zagreb', 'Europe/Zaporozhye', 'Europe/Zurich', 'GMT', 'Indian/Antananarivo', 'Indian/Chagos', 'Indian/Christmas', 'Indian/Cocos', 'Indian/Comoro', 'Indian/Kerguelen', 'Indian/Mahe', 'Indian/Maldives', 'Indian/Mauritius', 'Indian/Mayotte', 'Indian/Reunion', 'Pacific/Apia', 'Pacific/Auckland', 'Pacific/Bougainville', 'Pacific/Chatham', 'Pacific/Chuuk', 'Pacific/Easter', 'Pacific/Efate', 'Pacific/Enderbury', 'Pacific/Fakaofo', 'Pacific/Fiji', 'Pacific/Funafuti', 'Pacific/Galapagos', 'Pacific/Gambier', 'Pacific/Guadalcanal', 'Pacific/Guam', 'Pacific/Honolulu', 'Pacific/Kiritimati', 'Pacific/Kosrae', 'Pacific/Kwajalein', 'Pacific/Majuro', 'Pacific/Marquesas', 'Pacific/Midway', 'Pacific/Nauru', 'Pacific/Niue', 'Pacific/Norfolk', 'Pacific/Noumea', 'Pacific/Pago_Pago', 'Pacific/Palau', 'Pacific/Pitcairn', 'Pacific/Pohnpei', 'Pacific/Port_Moresby', 'Pacific/Rarotonga', 'Pacific/Saipan', 'Pacific/Tahiti', 'Pacific/Tarawa', 'Pacific/Tongatapu', 'Pacific/Wake', 'Pacific/Wallis', 'US/Alaska', 'US/Arizona', 'US/Central', 'US/Eastern', 'US/Hawaii', 'US/Mountain', 'US/Pacific', 'UTC'];
        };

        // function get_org_data(org_id){
        //     return $http.get('/rest/v3/zendesk_tickets/'+org_id+'/get_org_name/');
        // };
        return {
            //UL Admin Dashboard page
            get_ms_data: function () {
                // return _retrieve_data(getJsonfilePath('ms_data'));
                return _retrieve_data_url(AdminApi.get_mschedules_url);
            },
            get_alerts_data: function () {
                return _retrieve_data(getJsonfilePath('alerts_data'));
            },
            get_tickets_data: function () {
                return _retrieve_tickets('/rest/v3/zendesk_tickets/');
            },
            get_incident_tickets: function () {
                return _retrieve_tickets('/rest/v3/zendesk_tickets/incident/');
            },
            get_change_tickets: function () {
                return _retrieve_tickets('/rest/v3/zendesk_tickets/change/');
            },
            get_org_data: function (org_id) {
                return _retrieve_tickets('/rest/v3/zendesk_tickets/' + org_id + '/get_org_name/');
            },
            get_datacenters_data: function () {
                // return _retrieve_data(getJsonfilePath('datacenters'));
                return _retrieve_data_url(AdminApi.dashboard_get_datacenters);
            },
            get_CustomersWidgetorizantal_data: function () {
                return _retrieve_data(getJsonfilePath('customers_widget_horizontal_data'));
            },

            get_dataCentersHorizantal_data: function () {
                return _retrieve_data(getJsonfilePath('data_centers_horizontal_data'));
            },

            get_pinned_organization_data: function () {
                return _retrieve_data_url(AdminApi.dashboard_get_pinned_customers);
            },


            //Datacenter Specific Private & Public clouds and Colos
            get_dc_private_clouds: function (datacenter_id) {
                // return _retrieve_data(getJsonfilePath('datacenter_private_clouds'));
                return _retrieve_data_url('/rest/v3/private_cloud/' + datacenter_id + '/get_datacenter_private_clouds/');
            },
            get_dc_public_clouds: function (datacenter_id) {
                // return _retrieve_data(getJsonfilePath('datacenter_public_clouds'));
                return _retrieve_data_url('/rest/v3/public_cloud/' + datacenter_id + '/get_datacenter_public_clouds/');
            },
            get_dc_colocations: function (datacenter_id) {
                // return _retrieve_data(getJsonfilePath('datacenter_colocations'));
                return _retrieve_data_url('/rest/cabinet/' + datacenter_id + '/get_datacenter_colocations/');
            },

            get_datacenter_widgets: function (datacenter_id) {
                return _retrieve_data_url('/rest/datacenter/' + datacenter_id + '/get_datacenters_widgets/');
            },


            //Customer Specific Datacenters, Private & Public clouds and Colos
            get_customer_private_clouds: function (customer_id) {
                // return _retrieve_data(getJsonfilePath('datacenter_private_clouds'));
                return _retrieve_data_url('/rest/v3/private_cloud/' + customer_id + '/get_customer_private_clouds/');
            },
            get_customer_public_clouds: function (customer_id) {
                // return _retrieve_data(getJsonfilePath('datacenter_public_clouds'));
                return _retrieve_data_url('/rest/v3/public_cloud/' + customer_id + '/get_customer_public_clouds/');
            },
            get_customer_colocations: function (customer_id) {
                // return _retrieve_data(getJsonfilePath('datacenter_colocations'));
                return _retrieve_data_url('/rest/cabinet/' + customer_id + '/get_customer_colocations/');
            },

            get_customer_datacenter: function (customer_id) {
                return _retrieve_data_url('/rest/datacenter/' + customer_id + '/get_customer_datacenters/');
            },

            //Datacenter, Private Clouds, Public Clouds and Colo Page Data

            get_private_clouds_data: function () {
                // return _retrieve_data(getJsonfilePath('datacenter_private_clouds'));
                return _retrieve_data_url('/rest/v3/private_cloud/');
            },
            get_public_clouds_data: function () {
                // return _retrieve_data(getJsonfilePath('datacenter_public_clouds'));
                return _retrieve_data_url('/rest/v3/public_cloud/');
            },
            get_colocations_data: function () {
                // return _retrieve_data(getJsonfilePath('datacenter_colocations'));
                return _retrieve_data_url('/rest/cabinet/get_colocations/');
            },


            get_PubicCloudHorizantal_data: function () {
                return _retrieve_data(getJsonfilePath('publiccloudhorizontaldata'));
            },
            get_PrivateCloudHorizantal_data: function () {
                return _retrieve_data(getJsonfilePath('privatecloudhorizontaldata'));
            },
            get_ColocationsHorizantal_data: function () {
                return _retrieve_data(getJsonfilePath('colocationshorizontaldata'));
            },

            //AWS page


            get_aws_dashboard_content_data: function () {
                return _retrieve_data(AdminApi.get_aws_dashboard);
            },
            get_aws_list_region_data: function (param) {
                return _retrieve_data(AdminApi.get_list_region);
            },
            get_aws_list_user_data: function (account_id, regionname) {
                return _retrieve_data(AdminApi.get_user_list.replace(":account_id", account_id).replace(":regionname", regionname));
            },
            get_aws_list_instance_data: function (account_id, regionname) {
                return _retrieve_data(AdminApi.get_instance_list.replace(":account_id", account_id).replace(":regionname", regionname));
            },

            //VMware Page
            get_vm_servers_data: function () {
                return _retrieve_data(getJsonfilePath('vm_servers_data'));
            },
            get_vm_licenses_data: function () {
                return _retrieve_data(getJsonfilePath('vm_licenses_data'));
            },
            //},
            get_aws_list_available_volumes_data: function (account_id, regionname) {
                return _retrieve_data(AdminApi.get_avail_volume.replace(":account_id", account_id).replace(":regionname", regionname));
            },
            get_aws_list_usergroup_data: function (account_id, regionname, username) {
                return _retrieve_data(AdminApi.get_user_group.replace(":account_id", account_id).replace(":regionname", regionname).replace(":username", username));
            },
            get_aws_list_userdetails_data: function (account_id, regionname, username) {
                return _retrieve_data(AdminApi.get_user_detail.replace(":account_id", account_id).replace(":regionname", regionname).replace(":username", username));
            },
            get_aws_entities: function (account_id, regionname, arn) {

                //return _post_data('{"arn":"'+arn+'"}',AdminApi.get_entities.replace(":account_id",account_id).replace(":regionname", regionname));
            },
            get_aws_poweron: function (account_id, regionname, instanceid) {
                //return _post_data('',AdminApi.aws_poweron.replace(":account_id",account_id).replace(":regionname", regionname).replace(":instanceid", instanceid));
            },
            get_aws_poweroff: function (account_id, regionname, instanceid) {
                return _post_data('', AdminApi.aws_poweroff.replace(":account_id", account_id).replace(":regionname", regionname).replace(":instanceid", instanceid));
            },
            get_aws_terminate: function (account_id, regionname, instanceid) {
                return _post_data('', AdminApi.aws_terminate.replace(":account_id", account_id).replace(":regionname", regionname).replace(":instanceid", instanceid));
            },
            get_aws_instance_details: function (account_id, regionname, instanceid) {
                return _retrieve_data(AdminApi.aws_instance_detail.replace(":account_id", account_id).replace(":regionname", regionname).replace(":instanceid", instanceid));
            },
            get_aws_list_policy_data: function (account_id, regionname) {
                return _retrieve_data(AdminApi.aws_list_policy.replace(":account_id", account_id).replace(":regionname", regionname));
            },
            get_aws_list_snapshot_data: function (account_id, regionname) {
                return _retrieve_data(AdminApi.aws_snapshot_list.replace(":account_id", account_id).replace(":regionname", regionname));
            },
            get_aws_list_loadbalancer_data: function (account_id, regionname) {
                return _retrieve_data(AdminApi.aws_load_balancer.replace(":account_id", account_id).replace(":regionname", regionname));
            },
            get_aws_list_volume_data: function (account_id, regionname) {
                return _retrieve_data(AdminApi.aws_list_volume.replace(":account_id", account_id).replace(":regionname", regionname));
            },
            get_aws_list_asg_data: function (account_id, regionname) {
                return _retrieve_data(AdminApi.aws_list_asg.replace(":account_id", account_id).replace(":regionname", regionname));
            },
            get_aws_list_netinter_data: function (account_id, regionname) {
                return _retrieve_data(AdminApi.aws_list_netinter.replace(":account_id", account_id).replace(":regionname", regionname));
            },
            /*get_instance_type: function(url){
             return _retrieve_data(getJsonfilePath('instancetype'));
             },

             get_image_id: function(){
             return _retrieve_data(getJsonfilePath('imageid'));
             }*/
            //},

            get_aws_customers_data: function () {
                return _retrieve_data(getJsonfilePath('aws_customers_data'));
            },
            get_aws_network_data: function () {
                return _retrieve_data(getJsonfilePath('aws_network_data'));
            },
            get_aws_datacenters_data: function () {
                return _retrieve_data(getJsonfilePath('aws_datacenters_data'));
            },
            get_aws_datastores_data: function () {
                return _retrieve_data(getJsonfilePath('aws_datastores_data'));
            },
            get_aws_hosts_data: function () {
                return _retrieve_data(getJsonfilePath('aws_hosts_data'));
            },
            get_aws_managementservers_data: function () {
                return _retrieve_data(getJsonfilePath('aws_managementservers_data'));
            },
            get_aws_virtualmachines_data: function () {
                return _retrieve_data(getJsonfilePath('aws_virtualmachines_data'));
            },

            //aws create instance for default and custom parameters
            get_subnet_and_availability_zone: function (path) {
                return _retrieve_data(path);
            },

            //Vmware view page
            get_vm_vcenters_data: function () {
                return _retrieve_data(getJsonfilePath('vmware_vcenter'));
            },
            get_vmware_clusters: function () {
                return _retrieve_data(getJsonfilePath('vmware_clusters'));
            },
            get_vmware_datacenter: function () {
                return _retrieve_data(getJsonfilePath('vmware_datacenters'));
            },
            get_vmware_datastores: function () {
                return _retrieve_data(getJsonfilePath('vmware_datastores'));
            },
            get_vmware_hypervisors: function () {
                return _retrieve_data(getJsonfilePath('vmware_hosts'));
            },
            get_vmware_virtualmachines: function () {
                return _retrieve_data(getJsonfilePath('vmware_virtual_machines'));
            },
            get_vmware_vswitches: function () {
                return _retrieve_data(getJsonfilePath('vmware_vswitches'));
            },
            get_vmware_customers: function () {
                return _retrieve_data(getJsonfilePath('vmware_customers'));
            },
            get_vm_tags_data: function () {
                return _retrieve_data(getJsonfilePath('vm_tags_data'));
            },

            //Openstack Pages
            get_endpoints_data: function () {
                return _retrieve_data(getJsonfilePath('endpoints_data'));
            },
            get_endpoints_tenant_data: function () {
                return _retrieve_data(getJsonfilePath('endpoints_tenant_data'));
            },
            get_vm_tenant_data: function () {
                return _retrieve_data(getJsonfilePath('vm_tenant_data'));
            },
            get_os_hosts_tenant_data: function () {
                return _retrieve_data(getJsonfilePath('os_hosts_tenant_data'));
            },
            get_hypervisor_data: function () {
                return _retrieve_data(getJsonfilePath('list_hypervisors'));
            },
            get_tenant_data: function () {
                return _retrieve_data(getJsonfilePath('list_tenant'));
            },
            get_flavor_data: function () {
                return _retrieve_data(getJsonfilePath('create_flavor'));
            },
            get_service_catalog_data: function () {
                return _retrieve_data(AdminApi.getCatalogServiceData);
            },
            get_subnet_data: function () {
                return _retrieve_data(AdminApi.getSubnetData);
            },
            get_credentials_data: function () {
                return _retrieve_data(AdminApi.getCredentialsData);
            },
            get_keypair_data: function () {
                return _retrieve_data(AdminApi.getKeypairData);
            },
            get_tenant_network_data: function () {
                return _retrieve_data(AdminApi.getTenantNetworkData);
            },
            get_tenant_images_data: function () {
                return _retrieve_data(AdminApi.getTenantImagesData);
            },
            get_tenant_volumes_data: function () {
                return _retrieve_data(AdminApi.getTenantVolumesData);
            },
            get_host_security_group_data: function () {
                return _retrieve_data(AdminApi.getHostSecurityGroupData);
            },
            get_server_ip_data: function () {
                return _retrieve_data(AdminApi.getServerIPData);
            },
            get_regions_data: function () {
                return _retrieve_data(AdminApi.getRegionsData);
            },
            get_availability_zone_data: function () {
                return _retrieve_data(AdminApi.getavailabilityzoneData);
            },
            //for dropdowns
            get_pytz_all_timezone: function(){
                return _get_pytz_all_timezone();
            },
            get_dropdowns: function (url) {
                var values = _retrieve_dropdowns(url);
                //console.log("dropdown");
                //console.log(values.$$state);
                //var values = {"info":[{"auto_scaling_group":"awseb"},{"auto_scaling_group":"cdssd"}]};
                /*	var dropdown_options = [];
                 var get_key;
                 var i = 0;
                 get_key = values.info[0];
                 angular.forEach(values.info, function(value, key) {
                 dropdown_options[i] = value[get_key];
                 i++;
                 }, dropdown_options);
                 return dropdown_options;*/
            },
            //FOR POST REQUESTS
            send_modal_data: function (params, url) {
                return _post_data(params, url);
            }
        };
    }
]);
