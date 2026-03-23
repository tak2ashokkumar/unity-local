'use strict';
var app = angular.module('uldb');
app.factory('AwsService', [
    '$timeout',
    '$http',
    'RestService',
    'AdminApi',
    function ($timeout,
              $http,
              RestService,
              AdminApi) {
        var getJsonfilePath = function (name) {
            return AdminApi.custom_data_url.replace(':filename', name);
        };
        return {
            validate_aws_customer: function (url) {
                return RestService.get_data(url);
            },
            get_aws_dashboard_content_data: function () {
                return RestService.get_data(AdminApi.get_aws_dashboard);
            },
            get_aws_list_user_data: function (account_id, regionname) {
                return RestService.get_data(AdminApi.get_user_list.replace(":account_id", account_id).replace(":regionname", regionname));
            },
            get_aws_list_instance_data: function (account_id, regionname) {
                return RestService.get_data(AdminApi.get_instance_list.replace(":account_id", account_id).replace(":regionname", regionname));
            },
            get_aws_list_available_volumes_data: function (account_id, regionname) {
                return RestService.get_data(AdminApi.get_avail_volume.replace(":account_id", account_id).replace(":regionname", regionname));
            },
            get_aws_list_usergroup_data: function (account_id, regionname, username) {
                return RestService.get_data(AdminApi.get_user_group.replace(":account_id", account_id).replace(":regionname", regionname).replace(":username", username));
            },
            get_aws_list_userdetails_data: function (account_id, regionname, username) {
                return RestService.get_data(AdminApi.get_user_detail.replace(":account_id", account_id).replace(":regionname", regionname).replace(":username", username));
            },
            get_aws_instance_details: function (account_id, regionname, instanceid) {
                return RestService.get_data(AdminApi.aws_instance_detail.replace(":account_id", account_id).replace(":regionname", regionname).replace(":instanceid", instanceid));
            },
            get_aws_list_policy_data: function (account_id, regionname) {
                return RestService.get_data(AdminApi.aws_list_policy.replace(":account_id", account_id).replace(":regionname", regionname));
            },
            get_aws_list_snapshot_data: function (account_id, regionname) {
                return RestService.get_data(AdminApi.aws_snapshot_list.replace(":account_id", account_id).replace(":regionname", regionname));
            },
            get_aws_list_loadbalancer_data: function (account_id, regionname) {
                return RestService.get_data(AdminApi.aws_load_balancer.replace(":account_id", account_id).replace(":regionname", regionname));
            },
            get_aws_list_volume_data: function (account_id, regionname) {
                return RestService.get_data(AdminApi.aws_list_volume.replace(":account_id", account_id).replace(":regionname", regionname));
            },
            get_aws_list_asg_data: function (account_id, regionname) {
                return RestService.get_data(AdminApi.aws_list_asg.replace(":account_id", account_id).replace(":regionname", regionname));
            },
            get_aws_list_netinter_data: function (account_id, regionname) {
                return RestService.get_data(AdminApi.aws_list_netinter.replace(":account_id", account_id).replace(":regionname", regionname));
            },
            get_subnet_and_availability_zone: function (account_id, regionname) {
                return RestService.get_data(AdminApi.get_subnet_availability_zone_data.replace(":account_id", account_id).replace(":name", regionname));
            },
            get_instance_type: function (params) {
                return RestService.get_data(getJsonfilePath(params));
            },
            get_aws_list_secgroup_data: function (account_id, regionname) {
                return RestService.get_data(AdminApi.get_aws_list_secgroup_data.replace(":account_id", account_id).replace(":name", regionname));
            },
            aws_request_validation:function(request){

                var error_message = {};
                var required_message = ' field is required';
                //console.log(request);
                if (request === undefined){
                    error_message['aws_account_list_errmsg'] = 'Aws Account'+required_message;
                    error_message['aws_bucket_list_errmsg'] = 'Bucket'+required_message;
                    error_message['aws_region_list_errmsg'] = 'Region'+required_message;
                    return error_message;
                }
                if (request.aws_account_list === undefined){
                    error_message['aws_account_list_errmsg']= 'Aws Account'+required_message;

                }
                if (request.aws_region_list === undefined){
                    error_message['aws_region_list_errmsg']  = 'Region'+required_message;

                }
                if (request.aws_bucket_list === undefined){
                    error_message['aws_bucket_list_errmsg'] = 'Bucket'+required_message;

                }
                return error_message;
            }
        };
    }
]);
