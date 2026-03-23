var app = angular.module('uldb');

app.controller('ClientAllDatacenterController', [
    '$scope',
    '$routeParams',
    '$rootScope',
    '$q',
    'ClientDashboardService',
    'DataFormattingService',
    function ($scope,
              $routeParams,
              $rootScope,
              $q,
              ClientDashboardService,
              DataFormattingService) {


        $scope.medal_ticks = ['', '', ''];
        $scope.series = ['Medaljer'];
        $scope.medals_colours = [{ fillColor: ['#008000', '#FFA500', '#FF0000'] }];


        $scope.get_platform_url = function (platform_type, adapter_id, cloud_id) {

            var cloud_type;
            if (platform_type == 'openstack')
                return '#/' + platform_type + '_adapter/' + adapter_id + '/tenant/' + cloud_id + '/cloudview';
            else if (platform_type == 'vmware')
                return '#/' + platform_type + '_adapter/' + adapter_id + '/datacenter/' + cloud_id + '/cloudview';
            else if (platform_type == 'aws')
                return '#/' + platform_type + '_adapter/' + adapter_id + '/cloudview';
            else if (platform_type == 'azure')
                return '#/' + platform_type + '_adapter/' + adapter_id + '/cloudview';


        };

        ClientDashboardService.get_datacenters_data().then(function (result) {
            $scope.datacenternames = DataFormattingService.formatGraphDetails(result);
        });


        $scope.options = {
            chart: {
                type: 'discreteBarChart',
                height: 100,
                width: 120,
                margin: {
                    top: 5,
                    right: 5,
                    bottom: 15,
                    left: 20
                },
                x: function (d) {
                    return d.label;
                },
                y: function (d) {
                    return d.value;
                },
                showValues: true,
                valueFormat: function (d) {
                    return d3.format(',.0f')(d);
                },
                "showXAxis": false,
                "showYAxis": false,
                "showLegend": false,
                "showControls": false
            }
        };

        $scope.horizantalOptions = {
            chart: {
                type: 'multiBarHorizontalChart',
                height: 40,
                width: 170,
                margin: {
                    top: 0,
                    right: 1,
                    bottom: 0,
                    left: 80
                },
                x: function (d) {
                    return d.label;
                },
                y: function (d) {
                    return d.value;
                },
                showValues: true,
                valueFormat: function (d) {
                    return d3.format(',.0f')(d);
                },
                "showXAxis": true,
                "showYAxis": false,
                "showLegend": false,
                "showControls": false,
                "stacked": true,
                "tooltips": false
            }
        };


    }
]);

app.controller('ClientAllPrivateCloudController', [
    '$scope',
    '$routeParams',
    '$rootScope',
    '$q',
    'ClientDashboardService',
    'DataFormattingService',
    function ($scope,
              $routeParams,
              $rootScope,
              $q,
              ClientDashboardService,
              DataFormattingService) {


        $scope.medal_ticks = ['', '', ''];
        $scope.series = ['Medaljer'];
        $scope.medals_colours = [{ fillColor: ['#008000', '#FFA500', '#FF0000'] }];


        $scope.get_platform_url = function (platform_type, adapter_id, cloud_id) {

            var cloud_type;
            if (platform_type == 'openstack')
                return '#/' + platform_type + '_adapter/' + adapter_id + '/tenant/' + cloud_id + '/cloudview';
            else if (platform_type == 'vmware')
                return '#/' + platform_type + '_adapter/' + adapter_id + '/datacenter/' + cloud_id + '/cloudview';
            else if (platform_type == 'aws')
                return '#/' + platform_type + '_adapter/' + adapter_id + '/cloudview';
            else if (platform_type == 'azure')
                return '#/' + platform_type + '_adapter/' + adapter_id + '/cloudview';


        };

        ClientDashboardService.get_private_clouds_data().then(function (result) {
            $scope.private_clouds = DataFormattingService.formatGraphDetails(result, true);
        });

        $scope.getHealthData = function (cloud) {

        };

        $scope.options = {
            chart: {
                type: 'discreteBarChart',
                height: 100,
                width: 120,
                margin: {
                    top: 5,
                    right: 5,
                    bottom: 15,
                    left: 20
                },
                x: function (d) {
                    return d.label;
                },
                y: function (d) {
                    return d.value;
                },
                showValues: true,
                valueFormat: function (d) {
                    return d3.format(',.0f')(d);
                },
                "showXAxis": false,
                "showYAxis": false,
                "showLegend": false,
                "showControls": false
            }
        };

        $scope.horizantalOptions = {
            chart: {
                type: 'multiBarHorizontalChart',
                height: 40,
                width: 170,
                margin: {
                    top: 0,
                    right: 1,
                    bottom: 0,
                    left: 80
                },
                x: function (d) {
                    return d.label;
                },
                y: function (d) {
                    return d.value;
                },
                showValues: true,
                valueFormat: function (d) {
                    return d3.format(',.0f')(d);
                },
                "showXAxis": true,
                "showYAxis": false,
                "showLegend": false,
                "showControls": false,
                "stacked": true,
                "tooltips": false
            }
        };


    }
]);

app.controller('ClientAllPublicCloudController', [
    '$scope',
    '$routeParams',
    '$rootScope',
    '$q',
    'ClientDashboardService',
    'DataFormattingService',
    function ($scope,
              $routeParams,
              $rootScope,
              $q,
              ClientDashboardService,
              DataFormattingService) {


        $scope.medal_ticks = ['', '', ''];
        $scope.series = ['Medaljer'];
        $scope.medals_colours = [{ fillColor: ['#008000', '#FFA500', '#FF0000'] }];


        $scope.get_platform_url = function (platform_type, adapter_id, cloud_id) {

            var cloud_type;
            if (platform_type == 'openstack')
                return '#/' + platform_type + '_adapter/' + adapter_id + '/tenant/' + cloud_id + '/cloudview';
            else if (platform_type == 'vmware')
                return '#/' + platform_type + '_adapter/' + adapter_id + '/datacenter/' + cloud_id + '/cloudview';
            else if (platform_type == 'aws')
                return '#/' + platform_type + '_adapter/' + adapter_id + '/cloudview';
            else if (platform_type == 'azure')
                return '#/' + platform_type + '_adapter/' + adapter_id + '/cloudview';


        };

        ClientDashboardService.get_public_clouds_data().then(function (result) {
            $scope.public_clouds = DataFormattingService.formatGraphDetails(result, true);
        });


        $scope.options = {
            chart: {
                type: 'discreteBarChart',
                height: 100,
                width: 120,
                margin: {
                    top: 5,
                    right: 5,
                    bottom: 15,
                    left: 20
                },
                x: function (d) {
                    return d.label;
                },
                y: function (d) {
                    return d.value;
                },
                showValues: true,
                valueFormat: function (d) {
                    return d3.format(',.0f')(d);
                },
                "showXAxis": false,
                "showYAxis": false,
                "showLegend": false,
                "showControls": false
            }
        };

        $scope.horizantalOptions = {
            chart: {
                type: 'multiBarHorizontalChart',
                height: 40,
                width: 170,
                margin: {
                    top: 0,
                    right: 1,
                    bottom: 0,
                    left: 80
                },
                x: function (d) {
                    return d.label;
                },
                y: function (d) {
                    return d.value;
                },
                showValues: true,
                valueFormat: function (d) {
                    return d3.format(',.0f')(d);
                },
                "showXAxis": true,
                "showYAxis": false,
                "showLegend": false,
                "showControls": false,
                "stacked": true,
                "tooltips": false
            }
        };


    }
]);

app.controller('ClientAllColocationController', [
    '$scope',
    '$routeParams',
    '$rootScope',
    '$q',
    'ClientDashboardService',
    'DataFormattingService',
    function ($scope,
              $routeParams,
              $rootScope,
              $q,
              ClientDashboardService,
              DataFormattingService) {


        $scope.medal_ticks = ['', '', ''];
        $scope.series = ['Medaljer'];
        $scope.medals_colours = [{ fillColor: ['#008000', '#FFA500', '#FF0000'] }];


        $scope.get_platform_url = function (platform_type, adapter_id, cloud_id) {

            var cloud_type;
            if (platform_type == 'openstack')
                return '#/' + platform_type + '_adapter/' + adapter_id + '/tenant/' + cloud_id + '/cloudview';
            else if (platform_type == 'vmware')
                return '#/' + platform_type + '_adapter/' + adapter_id + '/datacenter/' + cloud_id + '/cloudview';
            else if (platform_type == 'aws')
                return '#/' + platform_type + '_adapter/' + adapter_id + '/cloudview';
            else if (platform_type == 'azure')
                return '#/' + platform_type + '_adapter/' + adapter_id + '/cloudview';

        };

        ClientDashboardService.get_colocations_data().then(function (result) {
            $scope.colocations = DataFormattingService.formatGraphDetails(result, true);
        });

        $scope.options = {
            chart: {
                type: 'discreteBarChart',
                height: 100,
                width: 120,
                margin: {
                    top: 5,
                    right: 5,
                    bottom: 15,
                    left: 20
                },
                x: function (d) {
                    return d.label;
                },
                y: function (d) {
                    return d.value;
                },
                showValues: true,
                valueFormat: function (d) {
                    return d3.format(',.0f')(d);
                },
                "showXAxis": false,
                "showYAxis": false,
                "showLegend": false,
                "showControls": false
            }
        };

        $scope.horizantalOptions = {
            chart: {
                type: 'multiBarHorizontalChart',
                height: 40,
                width: 170,
                margin: {
                    top: 0,
                    right: 1,
                    bottom: 0,
                    left: 80
                },
                x: function (d) {
                    return d.label;
                },
                y: function (d) {
                    return d.value;
                },
                showValues: true,
                valueFormat: function (d) {
                    return d3.format(',.0f')(d);
                },
                "showXAxis": true,
                "showYAxis": false,
                "showLegend": false,
                "showControls": false,
                "stacked": true,
                "tooltips": false
            }
        };


    }
]);

app.controller('ClientAuditLogController', [
    '$scope',
    '$rootScope',
    '$routeParams',
    '$location',
    '$uibModal',
    '$http',
    '$window',
    '$httpParamSerializer',
    'AlertService2',
    function ($scope, $rootScope, $routeParams, $location, $uibModal, $http, $window, $httpParamSerializer, AlertService2) {

        $scope.datePicker = {};
        $scope.page_no = 1;
        $scope.model = {};
        $scope.searchkey = '';
        $scope.sortkey = '';

        $scope.sort = {
            sortingColumn: '',
            reverse: false
        };

        $scope.date = {
            startDate: moment().subtract(12, "days"),
            endDate: moment()
        };

        $scope.getSortingResults = function(sort){
            if((sort !== undefined) && (sort !== null) && (sort !== '')){
                $scope.page_no = 1;
                $scope.sortkey = sort.sortingColumn;
                $scope.get_client_activity_logs(1);
            }
        };

        $scope.getSearchResults = function(){
            $scope.page_no = 1;
            $scope.get_client_activity_logs(1);
        };


        $scope.get_client_activity_logs = function (page) {
            var date_range = $scope.date;

            var startDate = date_range.startDate.format('YYYY-MM-DD');
            var end_date = date_range.endDate.set({hour:23,minute:59,second:59,millisecond:0});
            var endDate = end_date.format('YYYY-MM-DD HH:mm:ss');

            console.log('start date in users timezone:::', startDate);
            console.log('end date in users timezone:::', endDate);

            var start_date = moment.tz(startDate, $rootScope.users_timezone).utc().format();
            end_date = moment.tz(endDate, $rootScope.users_timezone).utc().format();

            console.log('start date in UTC timezone:::', start_date);
            console.log('end date in UTC timezone:::', end_date);

            var params = {
                'start_date': start_date,
                'end_date': end_date,
                'page': page
            };

            if(($scope.sortkey !== undefined) && ($scope.sortkey !== null) && ($scope.sortkey !== '')){
                params['ordering'] = $scope.sortkey;
            }
            if(($scope.searchkey !== undefined) && ($scope.searchkey !== null) && ($scope.searchkey !== '')){
                console.log('search key isDefined');
                params['search'] = $scope.searchkey;
            }
            var serialized_params = $httpParamSerializer(params);
            var url = '/rest/activity_logs/?'+serialized_params;

            var download_params = {
                'start_date': start_date,
                'end_date': end_date,
            };
            var serializedParamsForDownload = $httpParamSerializer(download_params);
            $scope.downloadUrl = '/rest/activity_logs/download/?'+ serializedParamsForDownload;

            $http.get(url).then(function (response) {
                // $scope.model = response.data;
                if(page === 1)
                    $scope.model = response.data;
                else{
                    $scope.model.count = response.data.count;
                    $scope.model.results = $scope.model.results.concat(response.data.results);
                }
            }).catch(function (error) {
                $scope.model.results = [];
                AlertService2.danger("Unable to fetch activity logs. Please contact Adminstrator.");
                console.log(error);
            });
        };

        $scope.options = {
            "autoApply":true,
            "maxDate": new Date(),
            locale: {
                format: "D MMM YYYY",
            },
            eventHandlers: {
                'apply.daterangepicker': function(ev, picker){
                    $scope.get_client_activity_logs(1);
                },
            }
        };

        $scope.changes_modal = function(result,action){
            var changes = JSON.parse(result.changes);
            console.log('changes : ', angular.toJson(changes));
            //changes = JSON.stringify(changes, undefined, 4);
            var modalInstance = $uibModal.open({
                //template: '<pre style="margin-bottom: 0px;"><code>' + changes + '</code></pre>',
                templateUrl: 'activityLogChanges.html',
                scope: $scope,
                size: 'md',
                controller: 'activityLogChangesController'
            });
            $scope.logObject = angular.copy(result);
            $scope.logObject.changes = changes;
            $scope.action = action;
            $scope.changes_log_keys = Object.keys(changes);
            console.log('object keys : ', $scope.changes_log_keys);
            $scope.changes_log = changes;
            modalInstance.result.then();
        };

        $scope.get_client_activity_logs(1);

        $scope.loadMoreResults = function() {
            console.log('Triggered load more');
            if(angular.isDefined($scope.model.count) && angular.isDefined($rootScope.configObject.page_size)){
                if(($scope.page_no * $rootScope.configObject.page_size) < $scope.model.count ){
                    $scope.page_no = $scope.page_no + 1;
                    $scope.get_client_activity_logs($scope.page_no);
                }
            }
        };

        $scope.change_action_to_text = function(result){
            result.changes_json = JSON.parse(result.changes);

            // if (result.changes_json.hasOwnProperty("state")){
            //     if (result.changes_json.state[1] == 'poweredOff'){
            //         return 'POWER OFF'
            //     }
            //     if (result.changes_json.state[1] == 'poweredOn'){
            //         return 'POWER ON'
            //     }
            // }
            // if (result.changes_json.hasOwnProperty("status")){
            //     if (result.changes_json.status[1] == 'poweredOff'){
            //         return 'POWER OFF'
            //     }
            //     if (result.changes_json.status[1] == 'poweredOn'){
            //         return 'POWER ON'
            //     }
            // }
            // if (result.changes_json.hasOwnProperty("last_known_state")){
            //     if (result.changes_json.last_known_state[1] == 'SHUTOFF'){
            //         return 'POWER OFF'

            //     }
            //     if (result.changes_json.last_known_state[1] == 'ACTIVE'){
            //         return 'POWER ON'
            //     }
            // }
            // if (result.changes_json.hasOwnProperty("migration_status")){
            //     return "Migration: " + result.changes_json.migration_status[1];
            // }
            // if (result.changes_json.hasOwnProperty("backup_status")){
            //     return "Backup: " + result.changes_json.backup_status[1];
            // }
            // if (result.changes_json.hasOwnProperty("last_login")){
            //     return 'Login';
            // }
            // if (result.changes_json.hasOwnProperty("action")){
            //     return result.changes_json.action[0];
            // }
        };
    }
]);


app.controller('activityLogChangesController', [
    '$scope',
    '$uibModalInstance',
    '$http',
    '$stateParams',
    'AlertService2',
    'TaskService2',
    function ($scope, $uibModalInstance, $http, $stateParams, AlertService2, TaskService2) {
        $scope.cancel = function () {
            $uibModalInstance.dismiss();
        };

    }
]);
