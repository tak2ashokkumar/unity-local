var app = angular.module('uldb');
app.controller('DatacenterControllerv3', [
    '$scope',
    '$routeParams',
    '$rootScope',
    '$q',
    'CustomDataService',
    'DataFormattingService',
    function (
        $scope,
        $routeParams,
        $rootScope,
        $q,
        CustomDataService,
        DataFormattingService) {
            $scope.medal_ticks = ['', '', ''];
            $scope.series = ['Medaljer'];
            $scope.medals_colours = [{fillColor:['#008000', '#FFA500', '#FF0000']}];

            $scope.get_platform_url = function (platform_type, adapter_id, cloud_id) {

                    var cloud_type;
                    if (platform_type == 'openstack')
                        return '#/'+platform_type+'_adapter/'+adapter_id+'/tenant/'+cloud_id+'/cloudview';
                    else if(platform_type == 'vmware')
                        return '#/'+platform_type+'_adapter/'+adapter_id+'/datacenter/'+cloud_id+'/cloudview';
                    else if(platform_type == 'aws')
                        return '#/'+platform_type+'_adapter/'+adapter_id+'/cloudview';
                    else if(platform_type == 'azure')
                        return '#/'+platform_type+'_adapter/'+adapter_id+'/cloudview';


            };

            CustomDataService.get_dc_private_clouds($routeParams.id).then(function (result) {
                $scope.private_clouds = DataFormattingService.formatGraphDetails(result, true);
            });

            CustomDataService.get_dc_public_clouds($routeParams.id).then(function (result) {
                $scope.public_clouds = DataFormattingService.formatGraphDetails(result, true);
            });

            CustomDataService.get_dc_colocations($routeParams.id).then(function (result) {
                $scope.colocations = DataFormattingService.formatGraphDetails(result, true);
            });

            CustomDataService.get_datacenter_widgets($routeParams.id).then(function (result) {

                // console.log("Data : "+angular.toJson(result));
                $scope.customer_count = result.data.info.organizations;

                $scope.hypervisor_signed = result.data.info.hypervisor_signed;
                $scope.hypervisor_provisioned = result.data.info.hypervisor_provisioned;

                $scope.vm_signed = result.data.info.vm_signed;
                $scope.vm_provisioned = result.data.info.vm_provisioned;

                //$scope.storage_signed = 10; //Backlog
                //$scope.storage_provisioned = 20; //Backlog
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
