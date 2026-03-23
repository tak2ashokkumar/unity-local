var app = angular.module('uldb');

app.controller('ClientAlertController', [
    '$scope',
    '$uibModal',
    '$stateParams',
    '$location',
    'SearchService',
    '$http',
    'AlertService2',
    function ($scope,
              $uibModal,
              $stateParams,
              $location,
              SearchService,
              $http,
              AlertService2)
        {
            $scope.tabname = $location.path().split('/').pop();
            $scope.all_alerts_rows = [
                {'name': 'device_name', 'desc': 'Device Name'},
                {'name': 'device_type', 'desc': 'Device Type'},
            ];
        
            $scope.sortkey = '';
            $scope.sort = {
                sortingColumn: '',
                reverse: false
            };

            $scope.getSortingResults = function(sort){
                $scope.sortkey = sort.sortingColumn;
            };

            var getAllFailedAlerts = function(){
                var devices = ['firewall', 'switch', 'load_balancer', 'servers', 'pdu', 'aws', 'vmware', 'openstack', 'custom_vm'];
                $scope.all_alerts = [];
                $scope.totalApiCallsFinished = 0;
                for (var i = 0; i<devices.length; i++){
                    $http({
                        method: "GET",
                        url: '/customer/observium/' + devices[i] + '/get_device_alerts',
                        params: {'alert_type': 'failed'}
                    }).then(function (response) {
                        $scope.totalApiCallsFinished = $scope.totalApiCallsFinished + 1;
                        for (var i = 0; i<response.data.length; i++){
                            $scope.all_alerts.push(response.data[i]);
                            $scope.alerts_loaded = true;
                        }
                        if ($scope.totalApiCallsFinished==9){
                            $scope.alerts_loaded = true;
                        }
                    }).catch(function (error) {
                        $scope.totalApiCallsFinished = $scope.totalApiCallsFinished + 1;
                    });
                }
            };

            if ($scope.tabname==='all_alerts'){
                $scope.alerts_loaded = false;
                getAllFailedAlerts();
            }
            else{
                $scope.alerts_loaded = false;
                $http({
                    method: "GET",
                    url: '/customer/stats/get_observium_alert',
                    params: {type: $scope.tabname},
                }).then(function (response) {
                    $scope.alerts_loaded = true;
                    $scope.firewalls_alert = response.data.firewall;
                    $scope.switches_alert = response.data['switch'];
                    $scope.load_balancers_alert = response.data.load_balancer;
                    $scope.bm_servers_alert = response.data.bm_server;
                    $scope.hypervisors_alert = response.data.hypervisor;
                    $scope.pdus_alert = response.data.pdu;
                    $scope.vms_alert = response.data.vm;
                }).catch(function (error) {
                    $scope.alerts_loaded = true;
                    $scope.firewalls_alert = [];
                    $scope.switches_alert = [];
                    $scope.load_balancers_alert = [];
                    $scope.bm_servers_alert = [];
                    $scope.hypervisors_alert = [];
                    $scope.pdus_alert = [];
                    $scope.vms_alert = [];
                });
            }

            
            $scope.deviceAlertsModal = function(device_name, device){
                $scope.alert_device_name = device_name;
                if(device.alert_data){
                    $scope.device_alerts_popup = device.alert_data;
                }else{
                    $scope.device_alerts_popup = [];
                }
                showModal('static/rest/app/client/templates/modals/device_alert_detail.html');
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
                    scope: $scope,
                });
            };

            $scope.close_modal = function () {
                modalSupport.dismiss('cancel');
            };
        }
]);