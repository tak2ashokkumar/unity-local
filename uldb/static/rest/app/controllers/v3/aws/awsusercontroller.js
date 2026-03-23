var app = angular.module('uldb');
app.controller('AwsUserController', [
    '$scope',
    '$routeParams',
    '$rootScope',
    '$q',
    '$location',
    'AwsService',
    'TaskService',
    'AdminApi',
    'TableHeaders',
    'RestService',
    'AlertService2',
    '$http',
    function (
        $scope,
        $routeParams,
        $rootScope,
        $q,
        $location,
        AwsService,
        TaskService,
        AdminApi,
        TableHeaders,
        RestService,
        AlertService2,
        $http) {
        $scope.alertService = AlertService2;
        $scope.aws_usergroup_list_headers = TableHeaders.aws_usergroup_list_headers;
        $scope.aws_userdetails_headers = TableHeaders.aws_userdetails_headers;
        $scope.default_error_msg = "Something went wrong, please try again later.";
        $scope.title = {
            plural: "AWS",
            singular: "AWS"
        };
        if ($scope.$parent === $rootScope) $scope.$root.title = $scope.title;
        var account_id= "";
        var region_name= "";
        var user_name= "";
        if ( ($routeParams["account_id"] != undefined && $routeParams["account_id"] != "") && ($routeParams["name"] != undefined && $routeParams["name"] != "") ) {
            account_id = $routeParams["account_id"];
            region_name = $routeParams["name"];
            var url = AdminApi.validate_aws_customer.replace(':account_id', account_id).replace(':regionname', region_name);
            AwsService.validate_aws_customer(url).then(function(result){
                if(result.statusText == "Unauthorized"){
                    AlertService2.addAlert({msg: result.data[0], severity: 'danger'});
                    $location.path("/aws-dashboard/");
                }
            });
            $scope.region_name_float=region_name;
        }
        if ($routeParams["username"] != undefined) {
            user_name = $routeParams["username"];
        }
        if (/aws-user-group/.exec($location.absUrl())) {

            $http({method: "GET",
                url: '/customer/aws/'+account_id+'/region/'+region_name+'/user/'+user_name+'/user_group/'
            }).then(function(result) {
                var obj = {
                    data: null
                };
                if (result.data.hasOwnProperty('celery_task')) {
                    TaskService.processTaskv3(result.data.celery_task.task_id, function (result) {
                    if (result.state == "SUCCESS"){
                        if (!/false,/.exec(result.result)){
                            $scope.user_name_group= user_name;
                                $scope.aws_usergroup_list_content = result.result;
                        } else {
                            AlertService2.addAlert({msg: "Listing User Group Failed", severity: 'danger'});
                        }
                    }
                    }, function (error) {
                        $scope.error = true;
                        $scope.errorMsg = error.error + " " + error.message;
                        AlertService2.addAlert({msg: error.data.result.message[0], severity: 'danger'});
                        $scope.aws_usergroup_list_content = error;
                    });
                }
                else {
                    $scope.aws_usergroup_list_content = result;
                }

            }).catch(function(error) {
                return error;
            });

        } else if (/aws-user-details/.exec($location.absUrl())) {

            $http({method: "GET",
                url: '/customer/aws/'+account_id+'/region/'+region_name+'/user/'+user_name+'/user_details/'
            }).then(function(result) {
                var obj = {
                    data: null
                };
                if (result.data.hasOwnProperty('celery_task')) {
                    TaskService.processTaskv3(result.data.celery_task.task_id, function (result) {
                    if (result.state == "SUCCESS"){
                        if (!/false,/.exec(result.result)){
                            $scope.aws_userdetails_list_content = result.result.data;
                        } else {
                            AlertService2.addAlert({msg: "Listing Users Failed", severity: 'danger'});
                        }
                    }
                    }, function (error) {
                        $scope.error = true;
                        $scope.errorMsg = error.error + " " + error.message;
                        AlertService2.addAlert({msg: error.data.result.message[0], severity: 'danger'});
                        $scope.aws_userdetails_list_content = error;
                    });
                }
                else {
                    $scope.aws_userdetails_list_content = result.data;
                }

            }).catch(function(error) {
                return error;
            });
        }
    }
]);
