var app = angular.module('uldb');
app.controller('AwsDashboardController', [
    '$scope',
    '$routeParams',
    '$rootScope',
    '$q',
    '$window',
    '$location',
    '$filter',
    '$timeout',
    'BreadCrumbService',
    'CustomDataService',
    'AwsService',
    'TaskService',
    'AdminApi',
    'AbstractControllerFactoryV3',
    'TableHeaders',
    'DataFormattingService',
    'RestService',
    'AlertService2',
    'ValidationService',
    'OrganizationFast',
    'UserFast',
    'SearchService',
    '$http',
    function ($scope,
              $routeParams,
              $rootScope,
              $q,
              $window,
              $location,
              $filter,
              $timeout,
              BreadCrumbService,
              CustomDataService,
              AwsService,
              TaskService,
              AdminApi,
              AbstractControllerFactoryV3,
              TableHeaders,
              DataFormattingService,
              RestService,
              AlertService2,
              ValidationService,
              OrganizationFast,
              UserFast,
              SearchService,
              $http) {
        $scope.alertService = AlertService2;
        $scope.aws_account_headers = TableHeaders.aws_account_headers;
        $scope.default_error_msg = "Something went wrong, please try again later.";
        $scope.title = {
            plural: "AWS",
            singular: "AWS"
        };
        $scope.bread = BreadCrumbService;
        if ($scope.$parent === $rootScope) $scope.$root.title = $scope.title;
        $scope.customers = [];
        OrganizationFast.query({ page_size: 9000 }).$promise.then(function (success) {
            $scope.customers.push.apply($scope.customers, success.results);
        }).catch(function (error) {
            console.log(error);
        });

        $scope.users = [];
        UserFast.query({ page_size: 9000 }).$promise.then(function (success) {
            $scope.users.push.apply($scope.users, success.results);
        }).catch(function (error) {
            console.log(error);
        });

        var account_id = "";
        var region_name = "";

        var region_list = [
            { short: "eu-west-1", long: "EU (Ireland)" },
            { short: "ap-southeast-1", long: "Asia Pacific (Singapore)" },
            { short: "ap-southeast-2", long: "Asia Pacific (Sydney)" },
            { short: "ap-south-1", long: "Asia Pacific (Mumbai)" },
            { short: "eu-central-1", long: "EU (Frankfurt)" },
            { short: "ap-northeast-1", long: "Asia Pacific (Tokyo)" },
            { short: "ap-northeast-2", long: "Asia Pacific (Seoul)" },
            { short: "us-east-1", long: "US East (N. Virginia)" },
            { short: "sa-east-1", long: "South America (São Paulo)" },
            { short: "us-west-1", long: "US West (N. California)" },
            { short: "us-west-2", long: "US West (Oregon)" }
        ];
        var searchService = new SearchService(UserFast);
        $scope.getUsers = searchService.search;
        $scope.listall = function (args) {
            if (args.selected_region != undefined) {
                angular.forEach(region_list, function (value, key) {
                    if (value.long == args.selected_region) {
                        args.selected_region = value.short;
                    }
                });
                var url = AdminApi.validate_aws_customer.replace(':account_id', args.id).replace(':regionname', args.selected_region);
                AwsService.validate_aws_customer(url).then(function (result) {
                    if (result.data.data.status == true) {
                        $location.path("/aws/" + args.id + "/aws-region/" + args.selected_region);
                    } else {
                        AlertService2.addAlert({ msg: result.data.data.message, severity: 'danger' });
                    }
                });
            } else {
                AlertService2.addAlert({ msg: "Please Select a Region", severity: 'danger' });
            }
        };
        $scope.listvms = function (args) {
            if (args.selected_region != undefined) {
                angular.forEach(region_list, function (value, key) {
                    if (value.long == args.selected_region) {
                        args.selected_region = value.short;
                    }
                });
                var url = AdminApi.validate_aws_customer.replace(':account_id', args.id).replace(':regionname', args.selected_region);
                AwsService.validate_aws_customer(url).then(function (result) {
                    if (result.data.data.status == true) {
                        $location.path("/aws/" + args.id + "/aws-region/" + args.selected_region + "/virtual-machines");
                    } else {
                        AlertService2.addAlert({ msg: result.data.data.message, severity: 'danger' });
                    }
                });
            } else {
                AlertService2.addAlert({ msg: "Please Select a Region", severity: 'danger' });
            }
        };
        var get_aws_template = function (name) {
            return AdminApi.create_modal.replace(":name", name);
        };
        var load_dashboard = function load_dashboard() {
            $scope.$on('$destroy', function () {
                $scope.bread.pushIfTop({ name: "AWS Dashboard", url: '#/aws-dashboard' }, $scope);
            });
            AwsService.get_aws_dashboard_content_data().then(function (result) {
                angular.forEach(result.data, function (value, key) {
                    angular.forEach(value.region, function (value1, key1) {
                        angular.forEach(region_list, function (value2, key2) {
                            if (value2.short == value1) {
                                result.data[key].region[key1] = value2.long;
                            }
                        });
                    });
                });
                // console.log("Result AWS"+angular.toJson(result))
                $scope.aws_dashboard_content = result;
                $scope.aws_dashboard_content.actions = [
                    { "name": "Show Inventory", "link": "/aws/" },
                    { "name": "Virtual Machines", "link": "/aws/" },
                    { "name": "Add Region", "button": "addregion" },
                    { "name": "Delete Account", "button": "delete" },
                    { "name": "Edit Account", "button": "Edit" },
                    { "name": "Change API Keys", "button": "change_password" }

                ];
                $scope.aws_dashboard_content_rows = [
                    {
                        name: "user", description: "User", required: true, err_id: "usererr", err_msg: "userMsg",
                        type: "text",
                        opaque: true,
                        rendermethod: "users",
                        subfield: "customer_name",
                        render: $scope.getUsers
                    },
//                  DataFormattingService.generate_row(["text", "aws_user", "Name", "required"]),
                    DataFormattingService.generate_row(["text", "email", "Email"]),
                    DataFormattingService.generate_row(["text", "access_key", "Access Key", "required"]),
                    DataFormattingService.generate_row(["text", "secret_key", "Secret Key", "required"]),
                    DataFormattingService.generate_row(["select", "region", "Region", region_list, "required"])
                ];

                $scope.aws_dashboard_edit_rows = [
                    {
                        name: "user", description: "User", required: true, err_id: "usererr", err_msg: "userMsg",
                        type: "text",
                        opaque: true,
                        rendermethod: "users",
                        subfield: "customer_name",
                        render: $scope.getUsers
                    },
                    DataFormattingService.generate_row(["text", "email", "Email"]),
                    DataFormattingService.generate_row(["select", "region", "Region", region_list, "required"])
                ];

                $scope.aws_change_password_row = [
                    DataFormattingService.generate_row(["text", "access_key", "Access Key","required"]),
                    DataFormattingService.generate_row(["password", "secret_key", "Secret Key", "required"]),
                ];

                $scope.aws_add_region_rows = [
                    DataFormattingService.generate_row(["text", "customer", "Customer", "required"]),
                    DataFormattingService.generate_row(["select", "region", "Region", region_list, "required"])
                ];
            });
        };


        load_dashboard();

        $scope.aws_dashboard_add = function (params) {
            var valid = ValidationService.validate_data(params, $scope.aws_dashboard_content_rows);
            if (!valid.is_validated) {
                return valid;
            }
            delete params.is_validated;
            var url = AdminApi.get_aws_dashboard;
            var region = params.region;
            delete params.region;
            params.region = region.short;
            RestService.send_modal_data(params, url).then(function (result) {
                if (result.data.data == "Saved Successfully") {

                    AlertService2.addAlert({ msg: "Account Added Successfully", severity: 'success' });
                    $scope.aws_dashboard_content = "";
                    load_dashboard();

                }
                else {
                    load_dashboard();
                    AlertService2.addAlert({ msg: result.data.data, severity: 'danger' });
                }
            });
            var response_obj = { "success": "Added Successfuly" };
            return response_obj;
        };
        $scope.aws_add_region = function (params) {
            // console.log("Params Add region : "+angular.toJson(params));
            var valid = ValidationService.validate_data(params, $scope.aws_add_region_rows);
            if (!valid.is_validated) {
                return valid;
            }
            var region = params.region;
            delete params.region;
            params.region = region.short;
            var url = AdminApi.add_aws_region.replace(":account_id", params.id);
            RestService.send_modal_data(params, url).then(function (result) {
                if (result.data.data == "Region Added") {

                    AlertService2.addAlert({ msg: "Region Added Successfully", severity: 'success' });
                    $scope.aws_dashboard_content = "";
                    load_dashboard();

                }
                else {
                    load_dashboard();
                    AlertService2.addAlert({ msg: result.data.data, severity: 'danger' });
                }
            });
            var response_obj = { "success": "Added Successfuly" };
            return response_obj;
        };

        $scope.aws_edit = function (params) {
            var valid = ValidationService.validate_data(params, $scope.aws_dashboard_edit_rows);
            if(!valid.is_validated) {
                return valid;
            }
            delete params.is_validated;
            params.region = params.region.short;
            var url = AdminApi.edit_aws_region.replace(":account_id", params.id);
            RestService.update_modal_data(params,url).then(function (result) {
                if (result.status == 200){
                    AlertService2.addAlert({msg: "Account updated Successfully", severity: 'success'});
                    $scope.azure_content="";
                    load_dashboard();
                }
                else{
                    load_dashboard();
                    AlertService2.addAlert({msg: result.data[0], severity: 'danger'});
                }
            });
            var response_obj = {"success":"Updated Successfuly"};
            return response_obj;
        };

        $scope.aws_change_password = function(params){

            var valid = ValidationService.validate_data(params, $scope.aws_change_password_row);
            if(!valid.is_validated) {
                return valid;
            }
            delete params.is_validated;


            var url = AdminApi.aws_change_password.replace(":account_id", params.id);

            $http.post(url, params).
            then(function (response) {
                if (response.status == 200){
                    AlertService2.success(response.data);
                }
                else{
                    AlertService2.danger(response.data);
                }

            })
            .catch(function (error) {
                AlertService2.danger(JSON.stringify(error.data));
                return {};
            });


            var response_obj = { "success": "Updated Successfuly" };
            return response_obj;
        };


        $scope.aws_account_delete = function (params) {

            console.log("Params : " + angular.toJson(params));

            var url = AdminApi.delete_aws_acccount.replace(":account_id", params.id);

            RestService.delete_data(url).then(function (result) {
                if (result.status == 204) {

                    AlertService2.addAlert({ msg: "Account updated Successfully", severity: 'success' });
                    $scope.mschedules_content = "";
                    load_dashboard();

                }
                else {

                    load_dashboard();
                    AlertService2.addAlert({ msg: result.data[0], severity: 'danger' });
                }
            });
            var response_obj = { "success": "Updated Successfuly" };
            return response_obj;
        };


        $scope.aws_change_password_modeldata = {
                "title": "Change API Keys",
                "page": "/static/rest/app/templates/v3/aws/change_password.html"
        };

        $scope.aws_dashboard_content_modeldata = {
            "title": "Add Account",
            "page": "/static/rest/app/templates/v3/aws/aws_roles_create.html"
        };

        $scope.aws_add_region_modaldata = {
            "title": "Add Region",
            "page": get_aws_template('aws-add-region')
        };


        $scope.account_delete_modal = {
            "title": "Delete AWS Account",
            "alertMsg": "Are you Sure you want to delete?"
        };

        //Testing new Modal-Start
        // var load_modal = function load_modal(callback, urls, modal_title, rows, idField, template_Url) {
        //     $scope.callback = callback;
        //     $scope.resourceClass = urls;
        //     $scope.modal_title = modal_title;
        //     $scope.rows = rows;
        //     $scope.ctrl = new AbstractControllerFactoryV3($scope.resourceClass, $scope, idField, template_Url);
        // };
        
        var createimage_modal = function createimage_modal(params) {
            $scope.obj.instance_id = params.rowdata.instance_id;
            var url = AdminApi.add_aws_image.replace(":account_id", params.account_id).replace(":name", params.region_name).replace(":instance_id", params.instance_id);
            var urls = { create: url };
            var rows = $scope.aws_create_image_rows;
            // load_modal(load_listinstance, urls, "Image", rows, "modal", get_aws_template('create_aws_image'));
            $scope.ctrl.add();
        };

        $scope.aws_list_click = function (params) {
            $scope.obj = {};
            $scope.row_params = params;
            if (params.callback == "INSTANCES") {
                if (params.method == 'Add') {
                    var url = AdminApi.launch_instance.replace(":account_id", account_id).replace(":name", region_name);
                    var urls = { create: url };
                    var rows = $scope.aws_create_instance_rows;
                    // load_modal(load_listinstance, urls, "Instance", rows, "modal", get_aws_template('create-instance'));
                    $scope.ctrl.add();
                } else if (params.method == 'Edit') {
                    var url = AdminApi.launch_instance.replace(":account_id", account_id).replace(":name", region_name);
                    var urls = { edit_post: url };
                    var rows = $scope.aws_create_instance_rows;
                    // load_modal(load_listinstance, urls, "Instance", rows, "modal", get_aws_template('create-instance'));
                    $scope.ctrl.edit();
                }
            } else if (params.callback == "createimage") {
                createimage_modal(params);
            }
        };
        //Testing new Modal-End
    }
]);
