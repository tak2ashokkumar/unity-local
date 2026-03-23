var app = angular.module('uldb');
app.controller('AzureController', [
    '$scope',
    '$routeParams',
    '$rootScope',
    '$q',
    '$window',
    '$location',
    '$filter',
    '$timeout',
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
        $routeParams,
        $rootScope,
        $q,
        $window,
        $location,
        $filter,
        $timeout,
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

        var load_dashboard = function load_dashboard(){
            $scope.$on('$destroy', function () {
                $scope.bread.pushIfTop({ name: "Azure ", url: '#/azure' }, $scope);
            });
            AzureService.get_azure_content_data().then(function (result) {

                $scope.azure_content = result;
                $scope.azure_content.actions = [
                    {"name": "View Resource Group ", "button": "View_resource"},
                    {"name": "Edit", "button": "Edit"},
                    {"name": "Delete", "button": "Delete"},
                ];

                $scope.azure_content_rows = [
					DataFormattingService.generate_row(["text", "account_name", "Account Name", "required"]),
                    DataFormattingService.generate_row(["select", "customer", "Customer",$scope.customers,"required"]),
                    DataFormattingService.generate_row(["text", "location", "Location","required"]),
                    DataFormattingService.generate_row(["text", "user_name", "User Name","required"]),
                    DataFormattingService.generate_row(["text", "secret_key", "Password","required"]),
                    DataFormattingService.generate_row(["text", "subscription_id", "Subscription ID","required"]),
                ];
            });
        };
        load_dashboard();

        $scope.azure_account_add = function (params) {

            var customer = params.customer;
            delete params.customer;
            params.customer = customer.short;
            var valid = ValidationService.validate_data(params, $scope.azure_account_rows);

            if(!valid.is_validated) {

                return valid;
            }
            delete params.is_validated;

            var url = ClientApi.azure_account;

            RestService.send_modal_data(params,url).then(function (result) {


                if (result.status == 201){
                    AlertService2.addAlert({msg: "Account Added Successfully", severity: 'success'});
                    $scope.azure_content="";
                    load_dashboard();
                }
                else{
                    load_dashboard();
                    AlertService2.addAlert({msg: result.statusText, severity: 'danger'});
                }
            });
            var response_obj = {"success":"Added Successfuly"};
            return response_obj;
        };



        //TODO bring location list here
        var region_list = [
            {short:"eu-west-1",long:"EU (Ireland)"},
            {short:"ap-southeast-1",long:"Asia Pacific (Singapore)"},
            {short:"ap-southeast-2",long:"Asia Pacific (Sydney)"},
			{short:"ap-south-1",long:"Asia Pacific (Mumbai)"},
            {short:"eu-central-1",long:"EU (Frankfurt)"},
            {short:"ap-northeast-1",long:"Asia Pacific (Tokyo)"},
            {short:"ap-northeast-2",long:"Asia Pacific (Seoul)"},
            {short:"us-east-1",long:"US East (N. Virginia)"},
            {short:"sa-east-1",long:"South America (São Paulo)"},
            {short:"us-west-1",long:"US West (N. California)"},
            {short:"us-west-2",long:"US West (Oregon)"}
        ];

        var get_aws_template = function (name) {
            return ClientApi.create_modal.replace(":name", name);
        };


        $scope.aws_add_region_modaldata = {
                "title": "Add Region",
                "page": get_aws_template('aws-add-region')
        };

        $scope.azure_content_modeldata = {
                "title": "Add Azure Account",
                "page": "/static/rest/app/templates/v3/azure/create_account.html"
        };

        $scope.azure_delete_modal = {
                "title": "Delete Azure Account",
                "alertMsg": "Are you Sure you want to delete?"
        };

        $scope.redirect_resource_group =function redirect_resource_group(params){

            window.location = '#azure/resource_group';
        };

       // $scope.redirect_cust = function (redirect_url) {
       //     window.location = '#/customer-dashboard/' + redirect_url;
       // };


        $scope.azure_edit = function (params) {
            var valid = ValidationService.validate_data(params, $scope.azure_account_rows);
            if(!valid.is_validated) {
                return valid;
            }
            delete params.is_validated;


            var customer = params.customer;
            delete params.customer;
            params.customer = customer.short;


            var url = ClientApi.azure_edit.replace(":account_id", params.id);

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
                    AlertService2.addAlert({msg: result.data[0], severity: 'danger'});
                }
            });
            var response_obj = {"success":"Updated Successfuly"};
            return response_obj;
        };



    }
]);
