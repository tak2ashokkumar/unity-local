var app = angular.module('uldb');

app.controller('CustomerDeploymentEngineController', [
    '$scope',
    '$routeParams',
    '$uibModal',
    '$http',
    'TaskService',
    'TaskService2',
    'AlertService2',
    '$window',
    '$uibModalInstance',
    function ($scope, $routeParams, $uibModal, $http, TaskService, TaskService2, AlertService2,  $window, $uibModalInstance) {


        $scope.request = {};

        // Run Deployment Engines 
        $scope.deployment_headers = [
            {key:'deployment_type',title: ' Type', is_sort_disabled : true},
            {key:'cloud_type', title: 'Cloud Type', is_sort_disabled : true},
            {key:'cloud_name',title: 'Cloud/Account Name',},
            {key:'status',title: 'Status',},
            {key:'created_at',title: 'Created On',},
        ],

        $scope.getDeploymentStatus = function(){

            $http({
                method: "GET",
                url: '/customer/devops/engine/?page_size=5&sort_by=created_at'
            }).then(function (response) {
                $scope.deployments = response.data.results;
            }).catch(function (error) {
                console.log(error);
            });
        };

        $scope.getDeploymentStatus();

        /* -------- AWS API -------------*/
        $scope.aws_accounts = [];
        $scope.getAWSAccounts = function(){

            $http({
                method: "GET",
                url: '/customer/aws/'
            }).then(function (response) {
                $scope.aws_accounts = response.data.results;
                console.log(angular.toJson($scope.aws_accounts));
            }).catch(function (error) {
                console.log(error);
            });
        };

        $scope.getAWSAccounts();



        $scope.regions = [
            {region_code: "us-east-1", region_name: "US East (N. Virginia)"},
            {region_code: "us-west-1", region_name: "US West (N. California)"},
            {region_code: "us-west-2", region_name: "US West (Oregon)"},
            {region_code: "eu-west-1", region_name: "EU (Ireland)"},
            {region_code: "eu-central-1", region_name: "EU (Frankfurt)"},
            {region_code: "ap-southeast-1", region_name: "Asia Pacific (Singapore)"},
            {region_code: "ap-southeast-2", region_name: "Asia Pacific (Sydney)"},
            {region_code: "ap-northeast-2", region_name: "Asia Pacific (Seoul)"},
            {region_code: "ap-northeast-1", region_name: "Asia Pacific (Tokyo)"},
            {region_code: "ap-south-1", region_name: "Asia Pacific (Mumbai)"},
            {region_code: "sa-east-1", region_name: "South America (São Paulo)"}
        ];


        $scope.instance_types = [
            "t1.micro", "m1.small", "m1.medium", "m1.large",
            "m1.xlarge", "m3.medium", "m3.large", "m3.xlarge",
            "m3.2xlarge", "c1.medium", "c1.xlarge", "m2.xlarge",
            "m2.2xlarge", "m2.4xlarge", "cr1.8xlarge", "hi1.4xlarge",
            "hs1.8xlarge", "cc1.4xlarge", "cg1.4xlarge", "cc2.8xlarge",
            "g2.2xlarge", "c3.large", "c3.xlarge", "c3.2xlarge", "c3.4xlarge",
            "c3.8xlarge", "i2.xlarge", "i2.2xlarge", "i2.4xlarge", "i2.8xlarge",
            "t2.micro", "t2.small", "t2.medium"
        ];

        $scope.getImages = function(account_id, region){

            $http({
                method: "GET",
                url: '/customer/aws/' + account_id + '/images_list/',
                params: {
                    'region': region,
                    'search': "RHEL-7.4_HVM" //Hardcoded to REH temporarly
                }
            }).then(function (result) {
                var obj = {
                    data: null
                };
                if (result.data.hasOwnProperty('celery_task')) {
                    TaskService.processTaskv3(result.data.celery_task.task_id, function (result) {
                        if (result.state == "SUCCESS") {
                            $scope.images_list = result.result.data.Images;

                        }
                    }, function (error) {

                    });
                }

            
            }).catch(function (error) {
                return error;
            });

        };



        $scope.getVPCs = function(account_id, region){

            $http({
                method: "GET",
                url: '/customer/aws/' + account_id + '/vpc_list/',
                params: {'region': region}
            }).then(function (result) {
                var obj = {
                    data: null
                };
                if (result.data.hasOwnProperty('celery_task')) {
                    TaskService.processTaskv3(result.data.celery_task.task_id, function (result) {
                        if (result.state == "SUCCESS") {
                            console.log("VPCs : "+angular.toJson(result.result.data.Vpcs));
                            $scope.vpc_list = result.result.data.Vpcs;

                        }
                    }, function (error) {

                    });
                }

            
            }).catch(function (error) {
                return error;
            });
        };


        $scope.getKeyPairs = function (account_id, region) {
            $http({
                method: "GET",
                url: '/customer/aws/' + account_id + '/keypair_detail/',
                params: {'region': region}
            }).then(function (result) {
                var obj = {
                    data: null
                };
                if (result.data.hasOwnProperty('celery_task')) {
                    TaskService.processTaskv3(result.data.celery_task.task_id, function (result) {
                        if (result.state == "SUCCESS") {
                            $scope.key_pair_list = result.result.data.KeyPairs;

                        }
                    }, function (error) {

                    });
                }

            }).catch(function (error) {
                return error;
            });

        };
        

        $scope.clearSelections = function(request){

            $scope.images_list = [];
            $scope.vpc_list = [];
            $scope.subnets_list = [];
            $scope.key_pair_list = [];

        };


        $scope.loadRegionSpecificEntities = function(aws_account, region){

            $scope.clearSelections();

            $scope.getImages(aws_account.id, region);
            $scope.getVPCs(aws_account.id, region);
            $scope.getKeyPairs(aws_account.id, region);

        };

        $scope.loadVPCEntities = function(aws_account, region, vpc_id){

           $scope.getSubnets(aws_account, region, vpc_id);
           $scope.getSecurityGroups(aws_account, region, vpc_id);

        };


        $scope.getSecurityGroups = function(aws_account, region, vpc_id){

            console.log("Region ::::::::",region);

            if(aws_account)
                $http({
                    method: "GET",
                    url: '/customer/aws/' + aws_account.id + '/vpc_security_group_list/',
                    params: {
                        'region': region,
                        'vpc_id': vpc_id
                    }
                }).then(function (result) {
                    var obj = {
                        data: null
                    };
                    if (result.data.hasOwnProperty('celery_task')) {
                        TaskService.processTaskv3(result.data.celery_task.task_id, function (result) {
                            if (result.state == "SUCCESS") {
                                $scope.security_group_list = result.result.data.SecurityGroups;

                            }
                        }, function (error) {

                        });
                    }

                
                }).catch(function (error) {
                    return error;
                });
        };

        $scope.getSubnets = function(aws_account, region, vpc_id){

            if(aws_account)
                $http({
                    method: "GET",
                    url: '/customer/aws/' + aws_account.id + '/subnets_list/',
                    params: {
                        'region': region,
                        'vpc_id': vpc_id
                    }
                }).then(function (result) {
                    var obj = {
                        data: null
                    };
                    if (result.data.hasOwnProperty('celery_task')) {
                        TaskService.processTaskv3(result.data.celery_task.task_id, function (result) {
                            if (result.state == "SUCCESS") {
                                $scope.subnets_list = result.result.data.Subnets;

                            }
                        }, function (error) {

                        });
                    }

                
                }).catch(function (error) {
                    return error;
                });
        };


        $scope.attachments = [];
        $scope.uploaded_attachments = [];

        var check_for_exists = function(file){
            for(var i = 0; i < $scope.attachments.length; i++){
                if($scope.attachments[i].name === file.name){
                    return true;
                }
            }
            return false;
        };

        $scope.uploadFiles = function(files){
            if($scope.attachments.length === 0){
                $scope.attachments = files;
            }else{
                for(var i = 0; i < files.length; i++){
                    if(!check_for_exists(files[i])){
                        $scope.attachments.push(files[i]);
                    }
                }
            }
        };

        $scope.remove_attachment = function(index, file){
            $scope.attachments.splice(index, 1);
        };

        $scope.deploy = function(request){
            // $scope.close_modal();

            console.log("request :"+angular.toJson(request));

            var formdata = new FormData();

            formdata.append('deployment_type', $scope.deployEngineType);
            formdata.append('cloud_type', $scope.cloudType);
            formdata.append('cloud_name',request.aws_account.account_name);
            formdata.append('cloud_id', request.aws_account.id);

            angular.forEach(request, function (value, key) {
                console.log(key, value);
                formdata.append(key, value);
            });

            console.log("Form Data --------> :"+formdata);
            console.log("Attachment length :"+$scope.attachments.length);

            if($scope.attachments.length == 0){
                console.log("Attachment length 0 ");
                $scope.pem_err_msg = "Please upload .pem file!";
                return;
            }
            else{
                for(var i = 0; i < $scope.attachments.length; i++){
                    formdata.append('pem_key_file', $scope.attachments[i]);
                }

            }
            
            $http.post("/customer/devops/engine/",formdata,
                {
                    headers: {
                        'Content-Type' : undefined
                    },
                    transformRequest: angular.identity,
                }
                ).then(function (response) {
                    $scope.close_modal();
                    AlertService2.success("Deployment is in progress, progress will be updated.", 3000);
                    $window.location.reload();
                    TaskService2.processTask(response.data.task_id).then(function (result) {
                       // update the client with the new model
                       AlertService2.success("Deployment successful.", 3000);
                    }).catch(function (error) {
                       console.log(error);
                       $uibModalInstance.close(error);
                       AlertService2.danger("Error while creating ticket.");
                    });
            });
        };

         /* -------- AWS API -------------*/



        $scope.deployEngine = function(engine_type){

            $scope.deployEngineType = engine_type;

            console.log("Engine Type : ", $scope.deployEngineType);

            showModal('selectCloud.html');

        };


        $scope.invokeDeploymentForm = function(cloud_type){

            $scope.cloudType = cloud_type;

            console.log("Cloud Type : ", $scope.cloudType);

            showModal('inputFormSAP.html');

        };

        $scope.test_var = 'test';

        var modalSupport = null;
        var showModal = function (template) {
            if (modalSupport !== null) {
                modalSupport.dismiss('cancel');
            }
            $scope.loader = false;
            modalSupport = $uibModal.open({
                templateUrl: template,
                scope: $scope,
            });
        };

        $scope.close_modal = function () {
            modalSupport.dismiss('cancel');
        };
    
    }
]);

app.controller('CustomerAllDeploymentController', [
    '$scope',
    '$routeParams',
    '$uibModal',
    '$http',
    'TaskService',
    'AlertService2',
    '$window',
    function ($scope, $routeParams, $uibModal, $http, TaskService, AlertService2, $window) {


        $scope.request = {};

        // Run Deployment Engines 
        $scope.deployment_headers = [
            {key:'deployment_type',title: 'Deployment Type', is_sort_disabled : true},
            {key:'cloud_type', title: 'Cloud Type', is_sort_disabled : true},
            {key:'cloud_name',title: 'Cloud/Account Name',},
            {key:'status',title: 'Status',},
            {key:'created_at',title: 'Created On',},
        ],

        $scope.getDeploymentStatus = function(){

            $http({
                method: "GET",
                url: '/customer/devops/engine/'
            }).then(function (response) {
                $scope.deployments = response.data.results;
            }).catch(function (error) {
                console.log(error);
            });
        };

        $scope.getDeploymentStatus();
    
    }
]);