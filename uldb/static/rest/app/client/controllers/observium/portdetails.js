var app = angular.module('uldb');

app.controller('PortDetailsController', [
    '$scope',
    '$state',
    '$stateParams',
    '$timeout',
    '$http',
    '$location',
    'OberviumGraphConfig',
    function ($scope, $state, $stateParams, $timeout, $http, $location, OberviumGraphConfig) {
        $scope.pdu_graph_data = [];
        $scope.show_pdu_graphs = false;
        $scope.show_pdu_alerts = false;

        $scope.submenutabs = [
            {
            'tabname' : 'Graphs',
            'name' : 'graphs'
            },
            {
            'tabname' : 'Alerts',
            'name' : 'alerts'
            }
        ];

        var get_port_graphs = function(graphconfig,graphnameconfig){
            var params = {
                'graph_type': graphconfig.graphType,
                'observium_id': $scope.selectedPort.port_id
            };

            $http({
                method: "GET",
                url: '/customer/observium/pdu/'+$scope.pdu_id+'/get_graph_set_by_observium_id/',
                params: params,
            }).then(function (response) {
                graphconfig.graphDetails = response.data;
                $scope.pdu_graph_data.push(graphconfig);
                if(angular.equals($scope.pdu_graph_data.length,graphnameconfig.length)){
                    $scope.setLoader(false);
                }
            }).catch(function (error) {
                $scope.error_details = error;
                $scope.pdu_details = {};
                $scope.setLoader(false);
            });
        };

        var get_port_alerts_data = function(){
            // console.log('$scope.$parent.selectedPort.port_id : ', $scope.$parent.selectedPort.port_id);

            var params = {
                'entity_id': $scope.$parent.selectedPort.port_id,
                'entity_type': 'port'
            };

            $http({
                method: "GET",
                url: '/customer/observium/pdu/'+$scope.pdu_id+'/get_alert_data_by_entity/',
                params: params,
            }).then(function (response) {
                $scope.pdu_port_alerts = response.data;
                $scope.setLoader(false);
            }).catch(function (error) {
                $scope.error_details = error;
                $scope.pdu_port_alerts = {};
                $scope.setLoader(false);
            });
        };

        var get_ports_graph_data = function(){
            angular.forEach(angular.copy(OberviumGraphConfig.PORTS), function(value, key){
                var graphObj = {};
                graphObj.displayName = value.DISPLAYNAME;
                graphObj.graphType = value.GRAPHNAME;
                get_port_graphs(graphObj,angular.copy(OberviumGraphConfig.PORTS));
            });
        };

        $scope.getGraphSubtabsData = function(subtab){
            $scope.pdu_graph_data = [];
            $scope.setLoader(true);
            $scope.$parent.showDetailsView = false;
            switch(subtab.name) {
                case 'graphs' :
                    $scope.setActiveSubTab(0);
                    $scope.show_pdu_graphs = true;
                    $scope.show_pdu_alerts = false;
                    get_ports_graph_data();
                    break;
                case 'alerts' :
                    $scope.setActiveSubTab(1);
                    $scope.show_pdu_graphs = false;
                    $scope.show_pdu_alerts = true;
                    get_port_alerts_data();
                    break;
                default:
            }
        };

        $scope.getDetailedGraphView = function(pdu_graph_obj){
            $scope.setLoader(true);
            $scope.$parent.selectedGraphObj = angular.copy(pdu_graph_obj);
            $scope.$parent.showDetailsView = true;

            var params = {
                'graph_type': pdu_graph_obj.graphType,
                'from_date' : new Date(Date.parse(pdu_graph_obj.from_date)).getTime()/1000,
                'to_date' : new Date(Date.parse(pdu_graph_obj.to_date)).getTime()/1000,
                'observium_id': $scope.selectedPort.port_id,
            };
            
            $http({
                method: "GET",
                url: '/customer/observium/pdu/'+$scope.pdu_id+'/get_graph_by_observium_id/',
                params: params,
            }).then(function (response) {
                $scope.$parent.selectedGraphObj.graphDetails = response.data;
                console.log($scope.selectedGraphObj);
                console.log($scope.selectedGraphObj.graphDetails);
                $scope.setLoader(false);
            }).catch(function (error) {
                $scope.error_details = error;
                $scope.selectedGraphObj.graphDetails = {};
                $scope.setLoader(false);
            });
        };

        $scope.$parent.graphDateObj = {};
        $scope.$parent.getGraphforDefaultDateRange = function(pdu_graph_obj){
            $scope.$parent.graphDateObj = pdu_graph_obj;
            $scope.$parent.graphDateObj.from_date = new Date(Date.now() - 86400000);
            $scope.$parent.graphDateObj.to_date = new Date();
            $scope.getDetailedGraphView($scope.graphDateObj);
        };

        $scope.$parent.getGraphforUpdatedDateRange = function(){
            var graph_obj = angular.copy($scope.selectedGraphObj);
            graph_obj.from_date = $scope.graphDateObj.from_date;
            graph_obj.to_date = $scope.graphDateObj.to_date;
            $scope.getDetailedGraphView(graph_obj);
        };
        //$scope.getGraphSubtabsData(angular.copy($scope.submenutabs[0]));
    }
]);