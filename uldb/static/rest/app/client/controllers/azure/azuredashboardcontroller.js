var app = angular.module('uldb');
app.controller('AzureDashboardController', [
    '$scope',
    '$rootScope',
    '$state',
    '$q',
    '$window',
    '$location',
    '$filter',
    '$timeout',
    '$http',
    'BreadCrumbService',
    'ClientDashboardService',
    'AzureService',
    'TaskService',
    'ClientApi',
    'TableHeaders',
    'DataFormattingService',
    'RestService',
    'AlertService2',
    'ValidationService',
    'SearchService',
    function (
        $scope,
        $rootScope,
        $state,
        $q,
        $window,
        $location,
        $filter,
        $timeout,
        $http,
        BreadCrumbService,
        ClientDashboardService,
        AzureService,
        TaskService,
        ClientApi,
        TableHeaders,
        DataFormattingService,
        RestService,
        AlertService2,
        ValidationService,
        SearchService) {
        $scope.alertService = AlertService2;
        $scope.azure_customer_headers = TableHeaders.azure_customer_headers;

        $scope.default_error_msg = "Something went wrong, please try again later.";
        $scope.title = {
            plural: "Azure",
            singular: "Azure"
        };
        $scope.bread = BreadCrumbService;

        var location_list = [];
        $scope.customers = [];

        $scope.obj = {};

        var load_dashboard = function load_dashboard(){
            $scope.$on('$destroy', function () {
                $scope.bread.pushIfTop({ name: "Azure ", url: '#/azure' }, $scope);
            });

            AzureService.get_azure_content_data().then(function (result) {
                $scope.azure_content = result;
                $scope.azure_content.actions = [
                    {"name": "View Resource Group", "link": "/azure/"},
                    {"name": "Edit", "button": "Edit"},
                    {"name": "Delete", "button": "Delete"},
                    {"name": "Change Password", "button": "change_password"}
                ];

                $scope.azure_content_rows = [
                    DataFormattingService.generate_row(["text", "account_name", "Account Name", "required"]),
                    DataFormattingService.generate_row(["text", "user_name", "User Name","required"]),
                    DataFormattingService.generate_row(["password", "secret_key", "Password","required"]),
                    DataFormattingService.generate_row(["text", "subscription_id", "Subscription ID","required"]),
                ];

                $scope.azure_change_password_row = [
                    DataFormattingService.generate_row(["password", "secret_key", "Password", "required"]),
                    DataFormattingService.generate_row(["password", "secret_key_confirm", "Confirm Password", "required"]),
                ];

            });
        };
        load_dashboard();

        $scope.list_resource_grps = function(args) {
            $state.go('public_cloud.azure-account-resource_group',{'uuidc' : args.id}, {reload : false});
            $timeout(function(){
                $rootScope.secondLevelActiveIndex = 1;
                $scope.addClassforTabs('.actonecls ul', 1);
            },1000);
        };

        $scope.azure_account_add = function (params) {
            var valid = ValidationService.validate_data(params, $scope.azure_content_rows);
            if(!valid.is_validated) {
                $scope.addRGErrors = params;
                return valid;
            }
            delete params.is_validated;
            var url = ClientApi.azure_account;

            var formdata = new FormData();
            formdata.append('account_name', params.account_name);
            formdata.append('user_name', params.user_name);
            formdata.append('secret_key', params.secret_key);
            formdata.append('subscription_id', params.subscription_id);

            $http.post(url,formdata, {
                headers: {
                    'Content-Type' : undefined
                },
                transformRequest: angular.identity,
            }).then(function (result) {
                AlertService2.success("Account Added Successfully");
                $scope.azure_content="";
                load_dashboard();
            }).catch(function(error){
                AlertService2.danger(error.data);
             });
            $scope.cancel();
        };

        $scope.add_account_model = function(){
            $scope.obj = {};
            $scope.method = 'Add';
            $scope.rows = $scope.azure_content_rows;
            $scope.addRGErrors = null;
            $scope.showModal = !$scope.showModal;
        };

        $scope.cancel = function (method) {
            $scope.showModal = !$scope.showModal;
        };

        $scope.add = function () {
            console.log('in add with : ', angular.toJson($scope.obj));
            $scope.azure_account_add(angular.copy($scope.obj));
        };

        $scope.azure_edit = function (params) {
            var valid = ValidationService.validate_data(params, $scope.azure_content_rows);
            if(!valid.is_validated) {
                if (!(valid.secret_keyMsg != undefined)){
                    return valid;
                }
            }
            delete params.is_validated;
            var url = ClientApi.azure_edit.replace(":account_id", params.id);
            $scope.loader = true;
            var formdata = new FormData();
            formdata.append('account_name', params.account_name);
            formdata.append('user_name', params.user_name);
            // formdata.append('secret_key', params.secret_key);
            formdata.append('subscription_id', params.subscription_id);
            $http.put(url,formdata, {
                headers: {
                    'Content-Type' : undefined
                },
                transformRequest: angular.identity,
            }).then(function (result) {
                if (result.status == 200){
                    $scope.loader = false;
                    AlertService2.addAlert({msg: "Account updated Successfully", severity: 'success'});
                    $scope.azure_content="";
                    load_dashboard();
                }
                else{
                    $scope.loader = false;
                    load_dashboard();
                    console.log('result : ', angular.toJson(result));
                    AlertService2.addAlert({msg: result.data, severity: 'error'});
                }
            }).catch(function(error){
                $scope.loader = false;
                console.log('error : ', angular.toJson(error));
                if(error.data.account_name){
                    AlertService2.addAlert({msg: error.data.account_name, severity: 'error'});
                }else if(error.data.user_name){
                    AlertService2.addAlert({msg: error.data.user_name, severity: 'error'});
                }else {
                    AlertService2.addAlert({msg: error.data.subscription_id, severity: 'error'});
                }
            });
            $scope.cancel();
        };

        $scope.edit_account_model = function(account){
            $scope.obj = {};
            $scope.obj = angular.copy(account);
            $scope.method = 'Edit';
            $scope.rows = $scope.azure_content_rows;
            $scope.showModal = !$scope.showModal;
        };

        $scope.edit = function () {
            if(!$scope.obj.account_name){
                $scope.obj.account_name = '';
            }
            if(!$scope.obj.user_name){
                $scope.obj.user_name = '';
            }
            if(!$scope.obj.subscription_id){
                $scope.obj.subscription_id = '';
            }
            $scope.azure_edit(angular.copy($scope.obj));
        };

        $scope.delete_account_model = function(account){
            $scope.obj = {};
            $scope.obj.id = account.id;
            $scope.method = 'Delete';
            $scope.deleteconfirm = angular.copy($scope.azure_delete_modal);

            $scope.showDeleteConfirm = !$scope.showDeleteConfirm;
        };

        $scope.cancel_delete = function (method) {
            $scope.showDeleteConfirm = !$scope.showDeleteConfirm;
        };

        $scope.azure_delete = function (params) {
            var url = ClientApi.azure_delete.replace(":account_id", params.id);
            RestService.delete_data(url).then(function (result) {
                if (result.data == "Deleted Successfully"){
                    AlertService2.addAlert({msg: "Account Deleted Successfully", severity: 'success'});
                    $scope.mschedules_content="";
                    load_dashboard();
                }
                else{
                    load_dashboard();
                    AlertService2.addAlert({msg: result.data[0], severity: 'error'});
                }
            });
            $scope.cancel_delete();
        };

        $scope.delete = function () {
            $scope.azure_delete(angular.copy($scope.obj));
        };

        $scope.change_password_model = function(account){
            $scope.azure_vm_errors = null;
            $scope.rows1 = $scope.azure_change_password_row;
            $scope.method = 'change_password';
            $scope.obj = {};
            $scope.obj.id = account.id;
            $scope.showModal1 = !$scope.showModal1;
        };

        $scope.cancel1 = function () {
                $scope.showModal1 = !$scope.showModal1;
        };

        $scope.azure_change_password = function (params) {
            var valid = ValidationService.validate_data(params, $scope.azure_change_password_row);
            if(!valid.is_validated) {
                $scope.azure_vm_errors = params;
                return valid;
            }
            if(params.secret_key != params.secret_key_confirm){
                valid.is_validated = false;
                valid.secret_key_confirmerr = true;
                valid.secret_key_confirmMsg  = 'Passwords do not match.';
                return valid;
            }
            delete params.is_validated;

            $http.post('/customer/azure/change_password/', params).
            then(function (response) {
                AlertService2.success(response.data);
            })
            .catch(function (error) {
                AlertService2.danger("Error occured while updating password. "+ JSON.stringify(error.data));
            });
        };

        $scope.add1 = function () {
            $scope.azure_change_password(angular.copy($scope.obj));
        };

        var get_aws_template = function (name) {
            return ClientApi.create_modal.replace(":name", name);
        };

        $scope.aws_add_region_modaldata = {
                "title": "Add Region",
                "page": get_aws_template('aws-add-region')
        };
        $scope.azure_content_modeldata = {
                "title": "Azure Account",
                "page": "/static/rest/app/templates/v3/azure/create_account.html"
        };
        $scope.azure_content_change_password = {
                "title": "Change password",
                "page": "/static/rest/app/templates/v3/azure/create_vm.html"
        };
        $scope.azure_delete_modal = {
                "title": "Delete Azure Account",
                "alertMsg": "Are you Sure you want to delete?"
        };

        $scope.redirect_resource_group =function (params){
            window.location = '#azure/resource_group';
        };
    }
]);
