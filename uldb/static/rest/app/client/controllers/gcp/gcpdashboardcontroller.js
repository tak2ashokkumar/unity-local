var app = angular.module('uldb');
app.controller('GCPDashboardController', [
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
    'GCPService',
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
        GCPService,
        TaskService,
        ClientApi,
        TableHeaders,
        DataFormattingService,
        RestService,
        AlertService2,
        ValidationService,
        SearchService) {



        $scope.default_error_msg = "Something went wrong, please try again later.";
        $scope.title = {
            plural: "GCP",
            singular: "GCP"
        };


        $scope.obj = {};

        var load_dashboard = function load_dashboard(){
            $scope.$on('$destroy', function () {
                BreadCrumbService.pushIfTop({ name: "GCP ", url: '#/gcp-dasboard' }, $scope);
            });

            $http({
                method: "GET",
                url: '/customer/gcp/account'
            }).then(function (result) {

                console.log("Result ===> "+angular.toJson(result.data.results));
                $scope.gcp_content = result.data.results;
                $scope.gcp_content.actions = [
                    {"name": "View Resource Group", "link": "/gcp/"},
                    {"name": "Edit", "button": "Edit"},
                    {"name": "Delete", "button": "Delete"},
                    {"name": "Change Password", "button": "change_password"}
                ];

                $scope.gcp_content_rows = [
                    DataFormattingService.generate_row(["text", "name", "Account Name", "required"]),
                    DataFormattingService.generate_row(["text", "email", "Email","required"]),
                    DataFormattingService.generate_row(["textarea", "service_account_info", "Service Account Info","required"]),
                ];

                $scope.gcp_edit_rows = [
                    DataFormattingService.generate_row(["text", "name", "Account Name", "required"]),
                    DataFormattingService.generate_row(["text", "email", "Email","required"]),
                    DataFormattingService.generate_row(["textarea", "service_account_info", "Service Account Info (optional)"]),
                ];

            });
        };
        load_dashboard();


        $scope.show_inventory = function(args) {
            $state.go('public_cloud.inventory.virtual-machines',{'uuidp' : args.uuid}, {reload : false});
            $timeout(function(){
                $rootScope.secondLevelActiveIndex = 2;
                $scope.addClassforTabs('.actonecls ul', 2);
            },1000);
        };

        $scope.gcp_account_add = function (params) {
            var error_json = {};
            var valid = ValidationService.validate_data(params, $scope.gcp_content_rows);
            console.log("Valid==>"+valid);
            if(!valid.is_validated) {
                $scope.addRGErrors = params;
                return valid;
            }
            delete params.is_validated;
            var formdata = new FormData();
            formdata.append('name', params.name);
            formdata.append('email', params.email);
            formdata.append('service_account_info', params.service_account_info);

            $http.post('/customer/gcp/account/',formdata, {
                headers: {
                    'Content-Type' : undefined
                },
                transformRequest: angular.identity,
            }).then(function (result) {
                AlertService2.success("Account Added Successfully");
                $scope.gcp_content="";
                load_dashboard();
                $scope.cancel();
            }).catch(function(error){
                // $scope.addRGErrors = error.data;
                angular.forEach(error.data, function (msg, key) {
                    error_json[key + "err"] = true;
                    error_json[key + "Msg"] = msg[0];
                });
                $scope.addRGErrors = error_json;
                return valid;
                // AlertService2.danger(error.data);
             });
        };

        $scope.add_account_model = function(){
            $scope.obj = {};
            $scope.modeldata = {};
            $scope.method = 'Add';
            $scope.modeldata.title = 'Add Google Cloud Account';
            $scope.rows = $scope.gcp_content_rows;
            $scope.addRGErrors = null;
            $scope.showModal = !$scope.showModal;
        };

        $scope.cancel = function (method) {
            $scope.showModal = !$scope.showModal;
        };

        $scope.add = function () {
            console.log('in add with : ', angular.toJson($scope.obj));
            $scope.gcp_account_add(angular.copy($scope.obj));
        };

        $scope.gcp_edit = function (params) {
            var error_json = {};
            var valid = ValidationService.validate_data(params, $scope.gcp_edit_rows);
            if(!valid.is_validated) {
                $scope.addRGErrors = params;
                return valid;
            }
            delete params.is_validated;
            var url = '/customer/gcp/account/'+params.uuid+'/';
            $scope.loader = true;
            var formdata = new FormData();
            formdata.append('name', params.name);
            formdata.append('email', params.email);
            console.log("form data==>"+angular.toJson(params));   
            if(params.service_account_info != undefined)
            {
                console.log("Yes Service account");
                formdata.append('service_account_info', params.service_account_info);
            }

            $http.put(url,formdata, {
                headers: {
                    'Content-Type' : undefined
                },
                transformRequest: angular.identity,
            }).then(function (result) {
                if (result.status == 200){
                    $scope.gcp_content="";
                    load_dashboard();
                    $scope.cancel();
                    $scope.loader = false;
                    AlertService2.success("Account Updated Successfully");
                }
                else{
                    $scope.loader = false;
                    load_dashboard();
                    console.log('result : ', angular.toJson(result));
                    AlertService2.addAlert({msg: result.data, severity: 'error'});
                }
            }).catch(function(error){
                angular.forEach(error.data, function (msg, key) {
                    error_json[key + "err"] = true;
                    error_json[key + "Msg"] = msg[0];
                });
                $scope.addRGErrors = error_json;
                return valid;
            });
        };

        $scope.edit_account_model = function(account){
            $scope.obj = {};
            $scope.modeldata = {};
            $scope.obj = angular.copy(account);
            $scope.modeldata.title = 'Edit Google Cloud Account';
            $scope.method = 'Edit';
            $scope.rows = $scope.gcp_edit_rows;
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
            $scope.gcp_edit(angular.copy($scope.obj));
        };

        $scope.delete_account_model = function(account){
            $scope.obj = {};
            $scope.obj.id = account.uuid;
            $scope.method = 'Delete';
            $scope.deleteconfirm = angular.copy($scope.gcp_delete_modal);

            $scope.showDeleteConfirm = !$scope.showDeleteConfirm;
        };

        $scope.cancel_delete = function (method) {
            $scope.showDeleteConfirm = !$scope.showDeleteConfirm;
        };

        $scope.gcp_delete = function (params) {
            $http({
                method: "DELETE",
                url: '/customer/gcp/account/'+params.id+'/'
            }).then(function (result) {
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
            $scope.gcp_delete(angular.copy($scope.obj));
        };

        $scope.change_password_model = function(account){
            $scope.gcp_vm_errors = null;
            $scope.rows1 = $scope.gcp_change_password_row;
            $scope.method = 'change_password';
            $scope.obj = {};
            $scope.obj.id = account.id;
            $scope.showModal1 = !$scope.showModal1;
        };

        $scope.cancel1 = function () {
                $scope.showModal1 = !$scope.showModal1;
        };

        $scope.gcp_change_password = function (params) {
            var valid = ValidationService.validate_data(params, $scope.gcp_change_password_row);
            if(!valid.is_validated) {
                $scope.gcp_vm_errors = params;
                return valid;
            }
            if(params.secret_key != params.secret_key_confirm){
                valid.is_validated = false;
                valid.secret_key_confirmerr = true;
                valid.secret_key_confirmMsg  = 'Passwords do not match.';
                return valid;
            }
            delete params.is_validated;

            $http.post('/customer/gcp/change_password/', params).
            then(function (response) {
                AlertService2.success(response.data);
            })
            .catch(function (error) {
                AlertService2.danger("Error occured while updating password. "+ JSON.stringify(error.data));
            });
        };

        $scope.add1 = function () {
            $scope.gcp_change_password(angular.copy($scope.obj));
        };

        var get_aws_template = function (name) {
            return ClientApi.create_modal.replace(":name", name);
        };

        $scope.aws_add_region_modaldata = {
                "title": "Add Region",
                "page": get_aws_template('aws-add-region')
        };
        $scope.gcp_content_modeldata = {
                "title": "Google Cloud Account",
                "page": "/static/rest/app/client/templates/gcp/create_gcp_account.html"
        };
        $scope.gcp_content_change_password = {
                "title": "Change password",
                "page": "/static/rest/app/client/templates/gcp/create_vm_gcp.html"
        };
        $scope.gcp_delete_modal = {
                "title": "Delete Google Cloud Account",
                "alertMsg": "Are you Sure you want to delete?"
        };

        $scope.redirect_resource_group =function (params){
            window.location = '#gcp/resource_group';
        };
    }
]);
