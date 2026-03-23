var app = angular.module('uldb');

app.controller('CostCalculatorController', [
    '$scope',
    '$http',
    'AlertService2',
    'AWSDropDowns',
    function ($scope,
      $http,
      AlertService2,
      AWSDropDowns){

        $scope.clouds = [
        {
            'name' : 'AWS'
        },
        {
            'name' : 'AZURE'
        },
        {
            'name' : 'GCP'
        }
        ];

        $scope.aws_dropdowns = angular.copy(AWSDropDowns);
        $scope.cpu_slider_options = {
            floor: 1,
            ceil: 96,
            showTicksValues: 9
        };
        $scope.ram_slider_options = {
            floor: 1,
            ceil: 768,
            showTicksValues: 86
        };
        $scope.filter_criteria = {};
        $scope.cost_filters = {};

        var initialSetup = function(){
            $scope.filter_criteria = {};
            $scope.cost_filters = {};
            $scope.filter_criteria.cpu_minValue = 1;
            $scope.filter_criteria.cpu_maxValue = 4;
            $scope.filter_criteria.ram_minValue = 1;
            $scope.filter_criteria.ram_maxValue = 10;

            $scope.cost_filters = angular.copy($scope.filter_criteria);
        };
        initialSetup();

        $scope.search_result = [];
        $scope.show_clouds =  false;
        $scope.getInstances = function(){
            $scope.page = 1;
            $scope.selected_instances = [];
            getAWSdropdowns();
        };

        var getAWSdropdowns = function(){
            if(!$scope.filter_criteria.aws){
                $scope.filter_criteria.aws = {};
                $scope.filter_criteria.aws.region = AWSDropDowns.REGIONS[0].name;
                $scope.filter_criteria.aws.bandwidth = AWSDropDowns.NWBANDWIDTHS[2];
                $scope.filter_criteria.aws.storage_type = AWSDropDowns.STORAGETYPES[0].code;

                $scope.cost_filters.aws = angular.copy($scope.filter_criteria.aws);
            }else{
                $scope.filter_criteria.aws = angular.copy($scope.cost_filters.aws);
            }

            $scope.getStoareRates();
            $scope.getSearchResults();
            $scope.show_clouds = true;
        };

        $scope.storate_rates = {};
        $scope.getStoareRates = function(storage_type){
            $scope.storate_rates = {};
            var params = {};
            params.region = angular.copy($scope.cost_filters.aws.region);
            if(storage_type){
                params.storage_type = angular.copy(storage_type);
            }else{
                params.storage_type = angular.copy($scope.cost_filters.aws.storage_type);
            }

            $http.get('customer/ebs_storage_pricing/', { params: params }).then(function(result){
                // console.log('storage rates : ', angular.toJson(result.data));
                $scope.storate_rates = angular.copy(result.data);
            }).catch(function(error){
                $scope.page += 1;
                console.log('error : ', angular.toJson(error));
            });
        };

        $scope.page = 1;
        $scope.getSearchResults = function(isDropdownChanged){
            if(isDropdownChanged){
                $scope.page = 1;
            }
            var params = {};
            params.cpu_start = angular.copy($scope.cost_filters.cpu_minValue);
            params.cpu_end = angular.copy($scope.cost_filters.cpu_maxValue);
            params.ram_start = angular.copy($scope.cost_filters.ram_minValue);
            params.ram_end = angular.copy($scope.cost_filters.ram_maxValue);
            params.nw_performance = angular.copy($scope.cost_filters.aws.bandwidth);
            params.region = angular.copy($scope.cost_filters.aws.region);
            params.page = angular.copy($scope.page);

            $http.get('rest/aws_pricing/', { params: params }).then(function(result){

                for(var i = 0; i < result.data.results.length; i++){
                    result.data.results[i].instance_total_bill = $scope.cost_filters.instances_number * result.data.results[i].rate * 24 * 30;
                }

                if($scope.page == 1){
                    $scope.instances = angular.copy(result.data);
                }else{
                    for(var i = 0; i < result.data.results.length; i++){
                        $scope.instances.results.push(result.data.results[i]);
                    }
                }

                if(result.data.next){
                    $scope.page += 1;
                    $scope.getSearchResults();
                }
            }).catch(function(error){
                $scope.page += 1;
                console.log('error : ', angular.toJson(error));
            });
        };

        $scope.selected_instances = [];
        $scope.final_selected_instances = [];
        $scope.selectInstance = function(instance, cloud){
            instance.cloud_name = cloud.name;
            instance.instances_number = angular.copy($scope.cost_filters.instances_number);
            instance.storage = angular.copy($scope.cost_filters.storage);
            instance.cpu = instance.cpu.toString();
            instance.storage_total_bill = instance.instances_number * instance.storage * $scope.storate_rates.rate;
            if($scope.cost_filters.aws.storage_type == 'Provisioned IOPS'){
                instance.storage_total_bill += $scope.cost_filters.aws.iops_amount * AWSDropDowns.IOPSRATE[$scope.cost_filters.aws.region];
            }

            var existsAt = -1;
            $scope.selected_instances.filter(function(element, index) {
                if(element.cloud_name == cloud.name){
                    existsAt = index;
                }
            });
            if(existsAt == -1){
                $scope.selected_instances.push(angular.copy(instance));
            }else{
                $scope.selected_instances[existsAt] = angular.copy(instance);
            }
        };

        $scope.getActiveInstance = function(instance, cloud){
            for(var i = 0; i < $scope.selected_instances.length; i++){
                if((instance.uuid == $scope.selected_instances[i].uuid) && (instance.cloud_name == cloud.name)){
                    return 'active';
                }
            }
            return '';
        };

        $scope.cost_cal_main_form = {};
        $scope.reset = function(form){
            // $scope.filter_criteria.aws = angular.copy($scope.cost_filters.aws);
            // $scope.cost_filters = angular.copy($scope.filter_criteria);
            $scope.page = 1;
            // $scope.getSearchResults();
            // $scope.getStoareRates();
            form.$setPristine();

            $scope.final_selected_instances = $scope.final_selected_instances.concat(angular.copy($scope.selected_instances));
        };

        $scope.isComparing = false;
        $scope.compare = function(val){
            if(!val){
                $scope.show_clouds =  false;
                initialSetup();
                $scope.page = 1;
                $scope.storate_rates = {};
                $scope.selected_instances = [];
                $scope.final_selected_instances = [];
                $scope.isComparing =  val;
            }else{
                var isChanged = !angular.equals($scope.final_selected_instances, $scope.selected_instances);
                if(isChanged){
                    $scope.final_selected_instances = $scope.final_selected_instances.concat(angular.copy($scope.selected_instances));
                }

                if($scope.final_selected_instances.length == 0){
                    AlertService2.danger("No instances selected to Compare");
                }else{
                    $scope.isComparing =  val;
                    $scope.selected_instances = [];
                }
            }
        };

        $scope.getTotalAmount = function(array){
            var obj = {};
            obj.sum = 0;
            obj.instances = 0;
            // var sum = 0;
            for(var i = 0; i < array.length; i++){
                obj.sum = obj.sum + array[i].instance_total_bill + array[i].storage_total_bill;
                obj.instances = obj.instances + array[i].instances_number;
            }
            return obj;
        };

    }
    ]);

app.constant('AWSDropDowns', {

    REGIONS: [
    {
        'name': 'US West (N. California)',
        'code': 'us-west-1',
    },
    {
        'name': 'US West (Oregon)',
        'code': 'us-west-2',
    },
    {
        'name': 'US East (N. Virginia)',
        'code': 'us-east-1',
    },
    {
        'name': 'US East (Ohio)',
        'code': 'us-east-2',
    },
    {
        'name': 'Canada (Central)',
        'code': 'ca-central-1',
    },
    {
        'name': 'EU (Frankfurt)',
        'code': 'eu-central-1',
    },
    {
        'name': 'EU (Ireland)',
        'code': 'eu-west-1',
    },
    {
        'name': 'EU (London)',
        'code': 'eu-west-2',
    },
    {
        'name': 'EU (Paris)',
        'code': 'eu-west-3',
    },
    {
        'name': 'EU (Stockholm)',
        'code': 'eu-north-1',
    },
    {
        'name': 'Asia Pacific (Hong Kong)',
        'code': 'ap-east-1',
    },
    {
        'name': 'Asia Pacific (Tokyo)',
        'code': 'ap-northeast-1',
    },
    {
        'name': 'Asia Pacific (Seoul)',
        'code': 'ap-northeast-2',
    },
    {
        'name': 'Asia Pacific (Osaka-Local)',
        'code': 'ap-northeast-3',
    },
    {
        'name': 'Asia Pacific (Singapore)',
        'code': 'ap-southeast-1',
    },
    {
        'name': 'Asia Pacific (Sydney)',
        'code': 'ap-southeast-2',
    },
    {
        'name': 'Asia Pacific (Mumbai)',
        'code': 'ap-south-1',
    },
    {
        'name': 'Middle East (Bahrain)',
        'code': 'me-south-1',
    },
    {
        'name': 'South America (São Paulo)',
        'code': 'sa-east-1',
    },
    {
        'name': 'AWS GovCloud (US-East)',
        'code': '',
    },
    {
        'name': 'AWS GovCloud (US)',
        'code': '',
    }
    ],
    STORAGETYPES: [
        {
            'name': 'General Purpose SSD Volumes',
            'code': 'General Purpose'
        },
        {
            'name': 'Provisioned IOPS SSD Volumes',
            'code': 'Provisioned IOPS'
        },
        {
            'name': 'Throughput Optimized HDD Volumes',
            'code': 'Throughput Optimized HDD'
        },
        {
            'name': 'Cold HDD Volumes',
            'code': 'Cold HDD'
        }
    ],
    NWBANDWIDTHS: [
        'Very Low',
        'Low',
        'Low to Moderate',
        'Moderate',
        'High',
        'Up to 10 Gigabit',
        '10 Gigabit',
        '12 Gigabit',
        '20 Gigabit',
        'Up to 25 Gigabit',
        '25 Gigabit',
        '50 Gigabit',
        '100 Gigabit',
    ],
    IOPSRATE: {
        'Middle East (Bahrain)': 0.0792,
        'US East (Ohio)': 0.065,
        'South America (Sao Paulo)': 0.091,
        'Asia Pacific (Osaka-Local)': 0.074,
        'Asia Pacific (Seoul)': 0.0666,
        'Asia Pacific (Singapore)': 0.072,
        'US East (N. Virginia)': 0.065,
        'Asia Pacific (Sydney)': 0.072,
        'Asia Pacific (Hong Kong)': 0.0792,
        'Asia Pacific (Mumbai)': 0.068,
        'EU (Paris)': 0.076,
        'EU (London)': 0.076,
        'US West (N. California)': 0.072,
        'EU (Frankfurt)': 0.078,
        'US West (Oregon)': 0.065,
        'EU (Stockholm)': 0.0684,
        'EU (Ireland)': 0.072,
        'Asia Pacific (Tokyo)': 0.074,
        'Canada (Central)': 0.072
    }

});