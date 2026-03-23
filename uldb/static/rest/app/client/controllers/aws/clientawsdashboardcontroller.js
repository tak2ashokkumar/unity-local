var app = angular.module('uldb');
app.controller('CustomerAwsDashboardController', [
    '$scope',
    '$rootScope',
    '$state',
    '$q',
    '$location',
    '$filter',
    '$http',
    '$timeout',
    '$uibModal',
    'ClientDashboardService',
    'AwsService',
    'TaskService',
    'ClientApi',
    'TableHeaders',
    'DataFormattingService',
    'RestService',
    'ValidationService',
    'SearchService',
    'AlertService2',
    function ($scope,
              $rootScope,
              $state,
              $q,
              $location,
              $filter,
              $http,
              $timeout,
              $uibModal,
              ClientDashboardService,
              AwsService,
              TaskService,
              ClientApi,
              TableHeaders,
              DataFormattingService,
              RestService,
              ValidationService,
              SearchService,
              AlertService2) {

        $rootScope.displaythirdleveltabs = false;
        $scope.aws_account_headers = TableHeaders.aws_account_headers;
        // $scope.default_error_msg = "Something went wrong, please try again later.";
        $scope.title = {
            plural: "AWS",
            singular: "AWS"
        };
        // if ($scope.$parent === $rootScope) $scope.$root.title = $scope.title;

        var region_list = [
            {short: "us-east-1", long: "US East (N. Virginia)"},
            {short: "us-west-1", long: "US West (N. California)"},
            {short: "us-west-2", long: "US West (Oregon)"},
            {short: "eu-west-1", long: "EU (Ireland)"},
            {short: "eu-central-1", long: "EU (Frankfurt)"},
            {short: "ap-southeast-1", long: "Asia Pacific (Singapore)"},
            {short: "ap-southeast-2", long: "Asia Pacific (Sydney)"},
            {short: "ap-northeast-2", long: "Asia Pacific (Seoul)"},
            {short: "ap-northeast-1", long: "Asia Pacific (Tokyo)"},
            {short: "ap-south-1", long: "Asia Pacific (Mumbai)"},
            {short: "sa-east-1", long: "South America (São Paulo)"}
        ];

        $scope.listall = function (args) {
            if (args.selected_region != undefined) {
                angular.forEach(region_list, function (value, key) {
                    if (value.long == args.selected_region) {
                        args.selected_region = value.short;
                    }
                });
                var url = ClientApi.validate_aws_customer.replace(':account_id', args.id).replace(':regionname', args.selected_region);
                AwsService.validate_aws_customer(url).then(function (result) {
                    if (result.data.data.status == true) {
                        $state.go('public_cloud.aws-account-region-inventory', {
                            'uuidp': args.id,
                            'uuidc': args.selected_region
                        });
                        $timeout(function () {
                            $scope.addClassforTabs('.actonecls ul', 0);
                        }, 1000);
                    } else {
                        AlertService2.danger(result.data.data.message);
                    }
                });
            } else {
                AlertService2.danger('Please Select a Region');
            }
        };

        $scope.listvms = function (args) {
            if (args.selected_region != undefined) {
                angular.forEach(region_list, function (value, key) {
                    if (value.long == args.selected_region) {
                        args.selected_region = value.short;
                    }
                });
                var url = ClientApi.validate_aws_customer.replace(':account_id', args.id).replace(':regionname', args.selected_region);
                AwsService.validate_aws_customer(url).then(function (result) {
                    if (result.data.data.status == true) {
                        $state.go('public_cloud.aws-account-region-vms', {
                            'uuidp': args.id,
                            'uuidc': args.selected_region
                        });
                        $timeout(function () {
                            $scope.addClassforTabs('.actonecls ul', 0);
                        }, 1000);
                    } else {
                        AlertService2.danger(result.data.data.message);
                    }
                });
            } else {
                AlertService2.danger('Please Select a Region');
            }
        };

        var get_aws_template = function (name) {
            return ClientApi.create_modal.replace(":name", name);
        };

        var load_dashboard = function () {
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
                $scope.aws_dashboard_content = result;
                $scope.aws_dashboard_content.actions = [
                    {"name": "Show Inventory", "link": "/aws/"},
                    {"name": "Virtual Machines", "link": "/aws/"},
                    {"name": "Add Region", "button": "addregion"},
                    {"name": "Edit", "button": "Edit"},
                    {"name": "Change API Keys", "button": "change_password"},
                    {"name": "Delete Account", "button": "delete"}
                ];
                $scope.aws_dashboard_content_rows = [
                    DataFormattingService.generate_row(["text", "account_name", "Account Name", "required"]),
                    DataFormattingService.generate_row(["text", "access_key", "Access Key", "required"]),
                    DataFormattingService.generate_row(["password", "secret_key", "Secret Key", "required"]),
                    DataFormattingService.generate_row(["select", "region", "Region", region_list, "required"])
                ];
                $scope.aws_dashboard_edit_rows = [
                    DataFormattingService.generate_row(["text", "account_name", "Account Name", "required"]),
                    DataFormattingService.generate_row(["select", "region", "Region", region_list, "required"])
                ];
                $scope.aws_add_region_rows = [
                    // DataFormattingService.generate_row(["text", "customer", "Customer","required"]),
                    DataFormattingService.generate_row(["select", "region", "Region", region_list, "required"])
                ];
                $scope.aws_change_password_row = [
                    DataFormattingService.generate_row(["text", "access_key", "Access Key", "required"]),
                    DataFormattingService.generate_row(["password", "secret_key", "Secret Key", "required"]),
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
            var url = ClientApi.get_aws_dashboard;
            var region = params.region;
            delete params.region;
            params.region = region.short;
            RestService.send_modal_data(params, url).then(function (result) {
                if (result.data.data == "Saved Successfully") {
                    AlertService2.success('Account Added Successfully');
                    $scope.aws_dashboard_content = "";
                    load_dashboard();
                }
                else {
                    load_dashboard();
                    AlertService2.danger(result.data.data);
                }
            }).catch(function (error) {
                AlertService2.danger(error.message);
            });
            var response_obj = {"success": "Added Successfuly"};
            return response_obj;
        };

        $scope.aws_add_region = function (params) {
            var valid = ValidationService.validate_data(params, $scope.aws_add_region_rows);
            if (!valid.is_validated) {
                return valid;
            }
            var region = params.region;
            delete params.region;
            params.region = region.short;
            var url = ClientApi.add_aws_region.replace(":account_id", params.id);
            RestService.send_modal_data(params, url).then(function (result) {
                if (result.data.data == "Region Added") {
                    AlertService2.success('Region Added Successfully');
                    $scope.aws_dashboard_content = "";
                    load_dashboard();
                }
                else {
                    load_dashboard();
                    AlertService2.danger(result.data.data);
                }
            });
            var response_obj = {"success": "Added Successfuly"};
            return response_obj;
        };

        $scope.aws_edit = function (params) {
            var valid = ValidationService.validate_data(params, $scope.aws_dashboard_edit_rows);
            if (!valid.is_validated) {
                return valid;
            }
            delete params.is_validated;
            params.region = params.region.short;
            var url = ClientApi.edit_aws_acccount.replace(":account_id", params.id);
            RestService.update_modal_data(params, url).then(function (result) {
                if (result.status == 200) {
                    AlertService2.success('Account updated Successfully');
                    $scope.azure_content = "";
                    load_dashboard();
                }
                else {
                    load_dashboard();
                    AlertService2.danger(result.data[0]);
                }
            });
            var response_obj = {"success": "Updated Successfuly"};
            return response_obj;
        };

        var modalSupport = null;
        var showModal = function (template, controller) {
            if (modalSupport !== null) {
                modalSupport.dismiss('cancel');
            }
            $scope.loader = false;
            modalSupport = $uibModal.open({
                templateUrl: template,
                controller: controller,
                scope: $scope
            });

            modalSupport.result.then(function (selectedItem) {
                $scope.selected = selectedItem;
            }, function () {
                console.log('Modal dismissed at: ' + new Date());
            });
        };


        $scope.manage_request = function (awsaccount) {
            $scope.device_type = "AWS account";
            $scope.device_name = awsaccount;
            $scope.description =
                "AWS Account: " + awsaccount;
            showModal('static/rest/app/client/templates/manage_request.html', 'ManageRequestController');

        };

        $scope.aws_change_password = function (params) {
            var valid = ValidationService.validate_data(params, $scope.aws_change_password_row);
            if (!valid.is_validated) {
                return valid;
            }
            delete params.is_validated;

            $http.post('/customer/aws/change_password/', params).then(function (response) {
                if (response.status == 200) {
                    AlertService2.success(response.data);
                }
                else {
                    AlertService2.danger(response.data);
                }

            })
                .catch(function (error) {
                    AlertService2.danger(JSON.stringify(error.data));
                    return {};
                });

            return {"success": "updated"};
        };

        $scope.aws_account_delete = function (params) {
            var url = ClientApi.delete_aws_acccount.replace(":account_id", params.id);

            RestService.delete_data(url).then(function (result) {
                if (result.status == 204) {
                    AlertService2.success('Account updated Successfully');
                    $scope.mschedules_content = "";
                    load_dashboard();
                }
                else {
                    load_dashboard();
                    AlertService2.danger(result.data[0]);
                }
            });
            var response_obj = {"success": "Updated Successfuly"};
            return response_obj;
        };

        $scope.aws_dashboard_content_modeldata = {
            "title": "AWS Account",
            "page": "/static/rest/app/templates/v3/aws/aws_roles_create.html"
        };
        $scope.aws_add_region_modaldata = {
            "title": "Add Region",
            "page": get_aws_template('aws-add-region')
        };
        $scope.aws_content_change_password = {
            "title": "Change API Keys",
            "page": "/static/rest/app/templates/v3/aws/change_password.html"
        };
        $scope.account_delete_modal = {
            "title": "Delete AWS Account",
            "alertMsg": "Are you Sure you want to delete?"
        };


        $scope.obj = {};
        $scope.show_create_instance_modal = false;
        $scope.show_add_region_modal = false;
        $scope.show_change_password_modal = false;
        $scope.show_delete_confirm_modal = false;

        $scope.cancel = function (method) {
            $scope.show_create_instance_modal = !$scope.show_create_instance_modal;
        };

        $scope.cancel1 = function () {
            $scope.show_add_region_modal = !$scope.show_add_region_modal;
        };

        $scope.cancel2 = function () {
            $scope.show_change_password_modal = !$scope.show_change_password_modal;
        };

        $scope.cancel_delete = function (method) {
            $scope.show_delete_confirm_modal = !$scope.show_delete_confirm_modal;
        };

        $scope.add = function () {
            $scope.obj = $scope.aws_dashboard_add(angular.copy($scope.obj));
            if ($scope.obj.hasOwnProperty("success")) {
                $scope.cancel();
            }
        };

        $scope.add_account_model = function () {
            $scope.method = 'Add';
            $scope.modeldata = angular.copy($scope.aws_dashboard_content_modeldata);
            $scope.rows = angular.copy($scope.aws_dashboard_content_rows);

            $scope.show_create_instance_modal = !$scope.show_create_instance_modal;
        };

        $scope.edit_account_model = function (aws_account) {
            $scope.method = 'Edit';
            $scope.modeldata = angular.copy($scope.aws_dashboard_content_modeldata);
            $scope.rows = angular.copy($scope.aws_dashboard_content_rows);

            $scope.obj = {};
            $scope.obj.aws_user = aws_account.aws_user;
            $scope.obj.account_name = aws_account.account_name;
            $scope.obj.user = aws_account.user;
            $scope.obj.id = aws_account.id;
            $scope.show_create_instance_modal = !$scope.show_create_instance_modal;
        };

        $scope.add_region_model = function (aws_account) {
            $scope.modeldata1 = angular.copy($scope.aws_add_region_modaldata);
            $scope.rows1 = angular.copy($scope.aws_add_region_rows);
            $scope.method = 'Add';
            aws_account.method = "addregion";

            $scope.obj = {};
            $scope.obj.id = aws_account.id;
            $scope.obj.customer = angular.copy(aws_account.customer);
            $scope.obj.aws_user = angular.copy(aws_account.aws_user);
            $scope.show_add_region_modal = !$scope.show_add_region_modal;
        };

        $scope.change_password_model = function (aws_account) {
            $scope.method = 'change_password';
            $scope.rows2 = angular.copy($scope.aws_change_password_row);
            $scope.modeldata2 = angular.copy($scope.aws_content_change_password);

            $scope.obj = {};
            $scope.obj.access_key = aws_account.access_key;
            $scope.obj.id = aws_account.id;
            $scope.show_change_password_modal = !$scope.show_change_password_modal;
        };

        $scope.delete_account_modal = function (aws_account) {
            $scope.method = 'delete';
            $scope.deleteconfirm = angular.copy($scope.account_delete_modal);

            $scope.obj = {};
            $scope.obj.id = aws_account.id;
            $scope.show_delete_confirm_modal = !$scope.show_delete_confirm_modal;
        };

        $scope.add1 = function (data) {
            switch ($scope.method) {
                case 'Add':
                    $scope.obj = $scope.aws_add_region(angular.copy($scope.obj));
                    if ($scope.obj.hasOwnProperty("success")) {
                        $scope.cancel1();
                    }
                    break;
                default :
                    console.log('something went wrong : please try again later.....');
            }
        };

        $scope.add2 = function (data) {
            switch ($scope.method) {
                case 'change_password':
                    $scope.obj = $scope.aws_change_password(angular.copy($scope.obj));
                    if ($scope.obj.hasOwnProperty("success")) {
                        $scope.cancel2();
                    }
                    break;
                default :
                    console.log('something went wrong : please try again later.....');
            }
        };

        $scope.edit = function () {
            $scope.obj = $scope.aws_edit(angular.copy($scope.obj));
            if ($scope.obj.hasOwnProperty("success")) {
                $scope.cancel();
            }
        };

        $scope.delete = function () {
            $scope.obj = $scope.aws_account_delete(angular.copy($scope.obj));
            if ($scope.obj.hasOwnProperty("success")) {
                $scope.cancel_delete();
            }
        };

    }
]);
