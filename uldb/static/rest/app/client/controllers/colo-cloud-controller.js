var app = angular.module('uldb');

app.controller('ColoCloudController', [
    '$scope',
    '$state',
    '$rootScope',
    '$stateParams',
    '$timeout',
    '$uibModal',
    '$http',
    '$location',
    'RestService',
    'AlertService2',
    '$window',
    function ($scope, $state, $rootScope, $stateParams, $timeout, $uibModal, $http, $location, RestService, AlertService2, $window) {

        $scope.active_cloud_index = '';
        $scope.active_cloud = {};
        $scope.active_cloud_elem_index = '';
        $scope.active_cloud_elem = {};

        $scope.loader = true;

        $scope.cloud_elems = [
            {
                "name" : "cabinets",
                "fa" : "fa-cube",
                'display_name' : 'Cabinets',
            },
            // {
            //     "name" : "cages",
            //     "fa" : "fa-building-o",
            //     'display_name' : 'Cages',
            // },
            {
                "name" : "pdus",
                "fa" : "fa-plug",
                'display_name' : 'PDUs',
            },
            {
                "name" : "private_clouds",
                "fa" : "fa-cloud",
                'display_name' : 'Private Cloud',
            }
        ];

        $scope.switch_active_cloud = function(cloud, index){
            $scope.loader = true;
            $scope.active_cloud_index = angular.copy(index);
            $scope.active_cloud = angular.copy(cloud);
            $scope.removeCCloudTabsSelection('.elem_active ul', angular.copy($scope.active_cloud_elem_index));
            $scope.get_cloud_elements($scope.active_cloud, $scope.cloud_elems[0], 0);
            $timeout(function(){
                $scope.addClassforTabs('.elem_active ul', 0);
            });
        };

        $scope.get_cloud_elements = function(cloud, elem, index){
            $scope.removeCCloudTabsSelection('.elem_active ul', angular.copy($scope.active_cloud_elem_index));

            if(angular.isUndefined(cloud) || (cloud === null)){
                return;
            }
            $scope.loader = true;
            $scope.active_cloud_elem = angular.copy(elem);
            $scope.active_cloud_elem_index = angular.copy(index);
            switch(index){
                case 0 :
                        $state.go('colo_cloud.cabinets',{'uuidp':cloud.uuid}, {reload : 'colo_cloud.cabinets'});
                        break;
                // case 1 :
                //         $state.go('colo_cloud.cages',{'uuidp':cloud.uuid}, {reload : 'colo_cloud.cages'});
                //         break;
                case 1 :
                        $state.go('colo_cloud.pdus',{'uuidp':cloud.uuid}, {reload : 'colo_cloud.pdus'});
                        break;
                case 2 :
                        $state.go('colo_cloud.pc_cloud',{'uuidp':cloud.uuid}, {reload : 'colo_cloud.pc_cloud'});
                        break;
                default : 
                    console.log('something went wrong !');

            }
            manage_cc_breadcrumbs();
        };

        var manage_cloud_variables = function(cloud_uuid, cloud_elem){
            for(var i = 0; i < $scope.colo_clouds.length; i++){
                if($scope.colo_clouds[i].uuid === cloud_uuid){
                    $scope.active_cloud_index = i;
                    $scope.active_cloud = $scope.colo_clouds[i];
                    break;
                }
            }

            if(cloud_elem === 'cabinet_view'){
                $scope.active_cloud_elem_index = 0;
                $scope.active_cloud_elem = $scope.cloud_elems[0];
                return;
            }

            for(var k = 0; k < $scope.cloud_elems.length; k++){
                if($scope.cloud_elems[k].name === cloud_elem){
                    $scope.active_cloud_elem_index = k;
                    $scope.active_cloud_elem = $scope.cloud_elems[k];
                    break;
                }
            }

        };

        var manage_cc_breadcrumbs = function(){
            var manageBreadcrumbLink = function (breadcrumb) {
                if (breadcrumb.route === 'colo_cloud') {
                    return true;
                }
                return false;
            };

            angular.forEach($rootScope.breadCrumbArray, function (value, key) {
                if (manageBreadcrumbLink(value)) {
                    value.link = value.link.replace('{}',$scope.colo_clouds[0].uuid);
                    $timeout(function () {
                        $rootScope.breadCrumbArray[key] = value;
                    }, 1000);
                }
            });
        };

        $scope.getCabinetVizualizationPermissions = function(){
            console.log('');
            $http({
                method: "GET",
                url: '/customer/uldbusers'
            }).then(function (response) {
                var subscribed_modules = response.data.results[0].subscribed_modules;
                $scope.showCabinet = subscribed_modules.includes("Cabinet Vizualization");
            }).catch(function (error) {
                console.log('error : ', angular.toJson(error));
            });
        }();


        $scope.get_colo_clouds = function(colo_cloud_uuid, cloud_elem){
            $http({
                method: "GET",
                url: '/customer/colo_cloud'
            }).then(function (response) {
                $scope.colo_clouds = response.data.results;
                if(angular.isDefined(colo_cloud_uuid)){
                    manage_cloud_variables(colo_cloud_uuid, cloud_elem);
                }else{
                    $timeout(function(){
                        $scope.active_cloud_index = 0;
                        $scope.active_cloud = $scope.colo_clouds[0];
                        $scope.get_cloud_elements($scope.active_cloud, $scope.cloud_elems[0], 0);
                    }, 1000);
                }
            }).catch(function (error) {
                console.log('error : ', angular.toJson(error));
            });
        };

        $scope.$watch(function () {
            return $location.path();
        }, function (value) {
            var colo_cloud_uuid = '';
            var cloud_elem = value.split('/').pop();
            switch(cloud_elem){
                case 'colo_cloud' : 
                        $scope.get_colo_clouds();
                        break;
                case 'cabinets' : 
                        colo_cloud_uuid = value.split('/').slice(0, -1).pop();
                        if(angular.isUndefined($scope.colo_clouds)){
                            $scope.get_colo_clouds(colo_cloud_uuid, cloud_elem);
                        }
                        break;
                case 'cabinet_view' : 
                        colo_cloud_uuid = value.split('/').slice(0, -1).slice(0, -1).slice(0, -1).pop();
                        if(angular.isUndefined($scope.colo_clouds)){
                            $scope.get_colo_clouds(colo_cloud_uuid, cloud_elem);
                        }
                        break;
                // case 'cages' : 
                //         colo_cloud_uuid = value.split('/').slice(0, -1).pop();
                //         if(angular.isUndefined($scope.colo_clouds)){
                //             $scope.get_colo_clouds(colo_cloud_uuid, cloud_elem);
                //         }
                //         break;
                case 'pdus' : 
                        colo_cloud_uuid = value.split('/').slice(0, -1).pop();
                        if(angular.isUndefined($scope.colo_clouds)){
                            $scope.get_colo_clouds(colo_cloud_uuid, cloud_elem);
                        }
                        break;
                case 'private_clouds' : 
                        colo_cloud_uuid = value.split('/').slice(0, -1).pop();
                        if(angular.isUndefined($scope.colo_clouds)){
                            $scope.get_colo_clouds(colo_cloud_uuid, cloud_elem);
                        }
                        break;  
                default : 
                    var colo_pdu_observium_check =  value.split('/').slice(0, -1).slice(0, -1).pop();
                    if(colo_pdu_observium_check === 'pdu'){
                        colo_cloud_uuid = value.split('/').slice(0, -1).slice(0, -1).slice(0, -1).pop();
                        if(angular.isUndefined($scope.colo_clouds)){
                            $scope.get_colo_clouds(colo_cloud_uuid, 'pdus');
                        }
                    }else if(value.includes('private_clouds')){
                        colo_cloud_uuid = value.split('/').reverse().slice(0, -1).slice(0, -1).pop();
                        if(angular.isUndefined($scope.colo_clouds)){
                            $scope.get_colo_clouds(colo_cloud_uuid, 'private_clouds');
                        }
                    }
            }      
        });


        var modalInstance = null;

        var showmodel = function (templete, controllername) {
            if (modalInstance !== null) {
                modalInstance.dismiss('cancel');
            }
            $scope.loader = false;
            modalInstance = $uibModal.open({
                templateUrl: templete,
                controller: controllername,
                scope: $scope
            });

            modalInstance.result.then(function (selectedItem) {
                $scope.selected = selectedItem;
            }, function () {
                console.log('Modal dismissed at: ' + new Date());
            });
        };

        $scope.cancel = function () {
            modalInstance.dismiss('cancel');
        };

        $scope.close_modal = function(){
            modalInstance.dismiss('cancel');
        };



        $scope.action_enabled = false;
        if ($rootScope.is_user_customer_admin){
            $scope.action_enabled = true;
        }

        $scope.modal_obj = {};
        $scope.add_device = function(index){
            var obj = {};
            obj.method = 'Add';
            obj.index = index;
            $scope.modal_obj  = angular.copy(obj);
            showmodel('static/rest/app/client/templates/modals/manage_datacenter.html');
        };

        $scope.edit_device = function(index){
            var obj = {};
            obj.method = 'Edit';
            obj.index = index;
            obj.name = $scope.colo_clouds[index].name;
            obj.location = $scope.colo_clouds[index].location;

            $scope.modal_obj  = angular.copy(obj);
            showmodel('static/rest/app/client/templates/modals/manage_datacenter.html');
        };

        $scope.delete_device = function(index){
            var obj = {};
            obj.index = index;
            obj.method = 'Delete';
            obj.delete_confirm_msg = "All associated devices will be deleted. Are you sure you want to delete ?";
            $scope.modal_obj  = angular.copy(obj);
            showmodel('static/rest/app/client/templates/modals/delete_cabinet_confirm.html');
        };

        $scope.manage_datacenter_obj = function(){
            var url = '';
            var success_msg = '';
            $scope.name_errmsg = '';
            $scope.location_errmsg = '';
            var stop_execution = false;
            if ($scope.modal_obj.name === undefined) {
                $scope.name_errmsg = "Datacenter Name is required.";
                stop_execution = true;
            }
            if (stop_execution) {
                return;
            }
            $scope.cancel();
            var index = angular.copy($scope.modal_obj.index);
            var params = {'name': $scope.modal_obj.name, 'location': $scope.modal_obj.location};
            if ($scope.modal_obj.method == "Add"){
                url = 'customer/colo_cloud/';
                success_msg = "Datacenter added successfully";
                RestService.send_modal_data(params, url).then(function (result) {
                    if (result.status == 200) {
                        $scope.colo_clouds = result.data;
                        $scope.active_cloud_index = index;
                        AlertService2.success(success_msg);
                        $state.reload();
                    }
                    else {
                        if (result.data.error){
                            AlertService2.danger(result.data.error[0]);
                        }
                        else if (result.data.non_field_errors){
                            AlertService2.danger(result.data.non_field_errors[0]);
                        }
                    }
                    $scope.modal_obj = {};
                });
            }else{
                var active_uuid = $scope.active_cloud.uuid;
                url = 'customer/colo_cloud/' + active_uuid + '/';
                success_msg = "Datacenter updated successfully";
                RestService.update_modal_data(params, url).then(function (result) {
                    if (result.status == 200) {
                        $scope.colo_clouds[index] = result.data;
                        $scope.active_cloud_index = index;
                        AlertService2.success(success_msg);
                        $state.reload();
                    }
                    else {
                        if (result.data.error){
                            AlertService2.danger(result.data.error[0]);
                        }
                        else if (result.data.non_field_errors){
                            AlertService2.danger(result.data.non_field_errors[0]);
                        }
                    }
                    $scope.modal_obj = {};
                });
            }
        };

        $scope.delete_object = function(){
            $scope.cancel();
            var active_uuid = $scope.active_cloud.uuid;
            var url = 'customer/colo_cloud/' + active_uuid + '/';
            RestService.delete_data(url).then(function (result) {
                if (result.status == 200) {
                    $scope.colo_clouds = result.data;
                    var success_msg = "Datacenter deleted successfully";
                    AlertService2.success(success_msg);
                    $scope.switch_active_cloud($scope.colo_clouds[0], 0);
                }
                else {
                    AlertService2.danger(result.data);
                }
                $scope.modal_obj = {};
            });
        };

        $scope.showDetails = function (uuid, type) {
            $scope.uuid = uuid;
            $scope.type = type;
            if (type == "Cabinet") {
                $scope.related = true;
                var controller = 'CabinetDetailController';
            }
            else if (type == "PDU") {
                $scope.related = false;
                $scope.uuid1 = uuid;
                controller = "PDUDetailController";
            }
            else if (type == "Cage") {
                $scope.related = true;
                controller = 'CageDetailController';
            }
            showmodel('static/rest/app/client/templates/colo-details.html', controller);
        };

        $scope.deviceAlertsModal = function(device_type, device){
            $scope.alert_device_name = device_type;
            $scope.device_alerts_popup = device.alerts_data;
            showmodel('static/rest/app/client/templates/modals/device_alert_detail.html');
        };

    }
]);

app.controller('ColoCloudCabinetController', [
    '$scope',
    '$rootScope',
    '$http',
    '$state',
    '$timeout',
    '$location',
    '$uibModal',
    'CustomerCabinet',
    'AlertService2',
    'RestService',
    'OberviumGraphConfig',
    function ($scope, $rootScope, $http, $state, $timeout, $location, $uibModal, CustomerCabinet, AlertService2, RestService, OberviumGraphConfig) {

        var uuid = $location.path().split('/').slice(0, -1).pop();

        $scope.$parent.loader = true;

        $scope.loading = true;

        $scope.get_cabinet_list = function(){
            $http({
                method: "GET",
                url: '/customer/colo_cloud/' + uuid +'/cabinets'
            }).then(function (response) {
                $scope.cabinets = response.data;
                $scope.$parent.loader = false;
            }).catch(function (error) {
                console.log('error : ', angular.toJson(error));
                $scope.$parent.loader = false;
            });
        };

        $scope.get_cabinet_list();

        $scope.manageByRequest = function(cabinet){
            console.log('manageByRequest');
            $scope.device_type = 'Cabinet';
            $scope.device_name = cabinet.name;
            $scope.description ="Cabinet Name: " + cabinet.name + "\n" +
                "Cabinet Model: " + cabinet.model + "\n" +
                "Cabinet Size : " + cabinet.capacity + "\n" +
                "Available RU: " + cabinet.available_size;
            showmodel('static/rest/app/client/templates/manage_request.html', 'ManageRequestController');
        };

        $scope.show_cabinet_view = false;

        function get_device_type(device_type, device_sub_type){
            switch(device_type){
                case 'pdus':
                        return 'PDU';
                case 'firewalls' :
                        return 'Firewall';
                case 'switches' :
                        return 'Switch';
                case 'load_balancers' :
                        return 'Load Balancer';
                case 'servers' :
                        return 'Server';
                case 'custom_devices' :
                        return 'Other Device';
                case 'panel_devices' :
                        return device_sub_type;
                default :
                        return '';
            }
        }

        $scope.range = function (count) {
            var devices = [];
            for (var i = 0; i < count; i++) {
                devices.push(i);
            }
            return devices;
        };

        var fill_cabinet = function (count, devices_list) {
            for (var i = devices_list.length; i < count; i++) {
                devices_list.push({});
            }
            return devices_list;
        };

        function get_cabinet_devices(cabinet){
            var devices_list = [];
            angular.forEach(angular.copy(cabinet),function(value, key){
                if(angular.isArray(cabinet[key])){
                    angular.forEach(angular.copy(cabinet[key]), function(value1, key1){
                        var obj = {};
                        if(key == 'panel_devices'){
                            obj.device_type = key;
                            obj.device_display_type = cabinet[key][key1]['panel_type_display'];
                        }else{
                            obj.device_type = key;
                            obj.device_display_type = get_device_type(key);
                        }
                        obj.device = cabinet[key][key1];
                        devices_list.push(obj);
                    });
                    delete cabinet[key];
                }
            });
            cabinet.devices_list = [];
            cabinet.devices_list = fill_cabinet(angular.copy(cabinet.capacity), angular.copy(cabinet.devices_list));
            cabinet.vertical_lpdu_list = [{},{}];
            cabinet.vertical_rpdu_list = [{},{}];
            cabinet.all_pdus_list = [];

            var bucket_devices_list = [];
            for(var i = 0; i < devices_list.length; i++){
                if(devices_list[i].device_type == 'pdus'){
                    cabinet.all_pdus_list.push(devices_list[i]);
                    if(devices_list[i].device.pdu_type == 'VERTICAL'){
                        switch(devices_list[i].device.position){
                            case 'C':
                                cabinet.vertical_lpdu_list[0] = devices_list[i];
                                break;
                            case 'A':
                                cabinet.vertical_lpdu_list[1] = devices_list[i];
                                break;
                            case 'B':
                                cabinet.vertical_rpdu_list[0] = devices_list[i];
                                break;
                            case 'D':
                                cabinet.vertical_rpdu_list[1] = devices_list[i];
                                break;
                        }
                    }
                }

                if((devices_list[i].device.position != 0)){
                    cabinet.devices_list[(devices_list[i].device.position - 1)] = devices_list[i];
                    for(var device_size = 0; device_size < devices_list[i].device.size; device_size++){
                        cabinet.devices_list[((devices_list[i].device.position - 1) + device_size)].unit_occupied = true;
                    }
                }else{
                    bucket_devices_list.push(devices_list[i]);
                }
            }

            cabinet.devices_list = cabinet.devices_list.reverse();
            console.log('cabinet.devices_list : ', angular.toJson(cabinet.devices_list));
            var obj_temp = {};
            obj_temp.cabinet = angular.copy(cabinet);
            obj_temp.bucket_devices_list = angular.copy(bucket_devices_list);

            return obj_temp;
        }

        $scope.get_pdu_details = function (pdu) {
            if(!pdu){
                return;
            }
            pdu.observium_details = {};
            $http({
                method: "GET",
                url: '/customer/observium/pdu/' + pdu.device.uuid + '/get_device_data/'
            }).then(function (response) {
                pdu.observium_details = response.data;
                pdu.observium_details.device_data.uptime = $scope.getuptime(response.data);
            }).catch(function (error) {
                // console.log('error is : ', angular.toJson(error));
                pdu.observium_details = null;
            });
        };

        var get_device_observium_obj = function(device_obj, display_name, graph_obj){
            switch(device_obj.device_type){
                case 'servers':
                    switch(display_name){
                        case 'Processor':
                            device_obj.graph_obj[0] = graph_obj;
                            break;
                        case 'Memory':
                            device_obj.graph_obj[1] = graph_obj;
                            break;
                        case 'Storage':
                            device_obj.graph_obj[2] = graph_obj;
                            break;
                        case 'Disk I/O':
                            device_obj.graph_obj[3] = graph_obj;
                            break;
                    }
                    break;
                case 'firewalls':
                    switch(display_name){
                        case 'Processor':
                            device_obj.graph_obj[0] = graph_obj;
                            break;
                        case 'Memory':
                            device_obj.graph_obj[1] = graph_obj;
                            break;
                    }
                    break;
                case 'switches':
                    switch(display_name){
                        case 'Processor':
                            device_obj.graph_obj[0] = graph_obj;
                            break;
                        case 'Power':
                            device_obj.graph_obj[1] = graph_obj;
                            break;
                        case 'Status':
                            device_obj.graph_obj[2] = graph_obj;
                            break;
                        case 'Temperature':
                            device_obj.graph_obj[3] = graph_obj;
                            break;
                    }
                    break;
                case 'load_balancers':
                    switch(display_name){
                        case 'Processor':
                            device_obj.graph_obj[0] = graph_obj;
                            break;
                        case 'Memory':
                            device_obj.graph_obj[1] = graph_obj;
                            break;
                        case 'Status':
                            device_obj.graph_obj[2] = graph_obj;
                            break;
                    }
                    break;
                case 'pdus':
                    switch(display_name){
                        case 'Power':
                            device_obj.graph_obj[0] = graph_obj;
                            break;
                        case 'Voltage':
                            device_obj.graph_obj[1] = graph_obj;
                            break;
                        case 'Current':
                            device_obj.graph_obj[2] = graph_obj;
                            break;
                        case 'Status':
                            device_obj.graph_obj[3] = graph_obj;
                            break;
                    }
                    break;
                default : 
            }
        };

        var get_health_graphs = function (graphconfig, device_obj, view) {
            var params = {
                'graph_type': graphconfig.graphType,
                'height': 180,
                'width': 220,
                'legend':'no'
            };
            $http({
                method: "GET",
                url: '/customer/observium/' + $rootScope.unity_constants.OBSERVIUM_DEVICE_NAMES[device_obj.device_type] + '/' + device_obj.device.uuid + '/get_graph_by_type/',
                params: params,
            }).then(function (response) {
                response.data.displayName = graphconfig.displayName;
                if(view){
                    device_obj.cab_view_graph_obj = [];
                    device_obj.cab_view_graph_obj.push(response.data);
                }else{
                    get_device_observium_obj(device_obj, graphconfig.displayName, response.data);
                }
            }).catch(function (error) {
                // console.log("error for graph data:" + JSON.stringify(error));
            });
        };


        $scope.get_health_overview_data = function (device_obj) {
            device_obj.graph_obj = [];
            var obj_device_obj = OberviumGraphConfig[$rootScope.unity_constants.OBSERVIUM_MAPPING_NAMES[device_obj.device_type]];
            angular.forEach(obj_device_obj.HEALTHGRAPHS.OVERVIEW, function (value, key) {
                var graphObj = {};
                graphObj.displayName = value.DISPLAYNAME;
                graphObj.graphType = value.GRAPHNAME;
                get_health_graphs(graphObj, device_obj);
            });
        };

        var get_sensor_data = function (device) {
            var observium_device_type = angular.copy($rootScope.unity_constants.OBSERVIUM_DEVICE_NAMES[device.device_type]);

            $http({
                method: "GET",
                url: '/customer/observium/' + observium_device_type + '/' + device.device.uuid + '/get_sensor_data'
            }).then(function (response) {
                var device_max_temperature = '';
                var device_max_current = '';
                var sensors = angular.copy(response.data);
                angular.forEach(sensors, function(value, key){
                    if(key == 'temperature'){
                        var temp_sensors = angular.copy(sensors['temperature']);
                        for( var i = 0; i < temp_sensors.length; i++){
                            angular.forEach(temp_sensors[i], function(temp_sensor_values, temp_sensor_name){
                                if(!device_max_temperature || (device_max_temperature == '')){
                                    device_max_temperature = angular.copy(temp_sensor_values.sensor_value);
                                }else{
                                    if(Number(device_max_temperature) < Number(temp_sensor_values.sensor_value)){
                                        device_max_temperature = angular.copy(temp_sensor_values.sensor_value);
                                    }
                                }
                            });
                        }
                    }
                    if((device.device_type == 'pdus') && (key == 'current')){
                        var current_sensors = angular.copy(sensors['current']);
                        for( var i = 0; i < current_sensors.length; i++){
                            angular.forEach(current_sensors[i], function(current_sensor_values, current_sensor_name){
                                if(!device_max_current || (device_max_current == '')){
                                    device_max_current = angular.copy(current_sensor_values.sensor_value);
                                }else{
                                    if(Number(device_max_current) < Number(current_sensor_values.sensor_value)){
                                        device_max_current = angular.copy(current_sensor_values.sensor_value);
                                    }
                                }
                            });
                        }
                    }
                });
                device.device.heat_map_temperature = angular.copy(device_max_temperature);
                switch(true){
                    case (device_max_temperature < 10):
                        device.device.heat_map_state = 'frozen';
                        break;
                    case ((device_max_temperature >= 10) && (device_max_temperature <= 30)):
                        device.device.heat_map_state = 'less';
                        break;
                    case ((device_max_temperature > 30) && (device_max_temperature <= 50)):
                        device.device.heat_map_state = 'normal';
                        break;
                    case ((device_max_temperature > 50) && (device_max_temperature <= 70)):
                        device.device.heat_map_state = 'warning';
                        break;
                    case ((device_max_temperature > 70) && (device_max_temperature <= 90)):
                        device.device.heat_map_state = 'high';
                        break;
                    case (device_max_temperature > 90):
                        device.device.heat_map_state = 'danger';
                        break;
                    default : 
                        device.device.heat_map_state = 'normal';
                }
                device.device.device_current = angular.copy(device_max_current);
            }).catch(function (error) {
                console.log('error in get_sensor_data for ' + observium_device_type +  ' ' + device.device.name + ' is : ', angular.toJson(error));
            });
        };

        $scope.get_uptime_details = function(device){
            var url = '/customer/uptimerobot/' + device.device.uptime_robot_id + '/get_device_uptime_data';
            $http.get(url).then(function (response) {
                device.device.uptimeRobotStatus = response.data;
            }).catch(function (error) {
                AlertService2.danger(error.data);
            });
        };

        var modalInstance;
        $scope.showCabinetView = function (cabinet) {
            $scope.$parent.loader = true;
            $scope.selected_cabinet = angular.copy(cabinet);
            var result = CustomerCabinet.get({uuid: cabinet.uuid});
            result.$promise.then(function (response) {
                var temp_obj = get_cabinet_devices(angular.copy(response));
                $scope.cabinet_details = angular.copy(temp_obj.cabinet);
                for(var i = 0; i < $scope.cabinet_details.devices_list.length; i++){
                    if ($scope.cabinet_details.devices_list[i].device_type == 'custom_devices'){
                        $scope.get_uptime_details($scope.cabinet_details.devices_list[i]);
                    }
                    if($scope.cabinet_details.devices_list[i].device_type && ($scope.cabinet_details.devices_list[i].device_type !== 'pdus' && ($scope.cabinet_details.devices_list[i].device_type != 'custom_devices') && ($scope.cabinet_details.devices_list[i].device_type != 'panel_devices'))){
                        get_sensor_data($scope.cabinet_details.devices_list[i]);
                    }
                }
                $scope.bucket_devices_list = angular.copy(temp_obj.bucket_devices_list);

                for(var i = 0; i < $scope.cabinet_details.all_pdus_list.length; i++){
                    $scope.get_pdu_details($scope.cabinet_details.all_pdus_list[i]);
                    get_sensor_data($scope.cabinet_details.all_pdus_list[i]);
                    var graphObj = {};
                    graphObj.displayName = 'Current';
                    graphObj.graphType = 'device_current';
                    get_health_graphs(graphObj, $scope.cabinet_details.all_pdus_list[i], 'cabview');
                }
                modalInstance = $uibModal.open({
                    templateUrl: '/static/rest/app/client/templates/colo_cloud/cabinet/cabinet-view.html',
                    controller : 'CabinetViewController',
                    windowClass: 'cabinet_view_modal',
                    scope: $scope,
                    size: 'lg cabinet_view_modal_content',
                    backdrop:false,
                    appendTo: angular.element('.right-content')
                });
                modalInstance.result.then(function () {

                });
            });


            result.$promise.catch(function(error){
                $timeout(function() {
                    $scope.$parent.loader = false;
                    AlertService2.danger("Unable to fetch Cabinet Details. Please contact Administrator (support@unityonecloud.com)");
                }, 500);
            });
        };

        $scope.cancel = function () {
            modalInstance.close();
        };

        var modalInstance = null;
        var showmodel = function (templete, controllername) {
            if (modalInstance !== null) {
                modalInstance.dismiss('cancel');
            }
            $scope.loader = false;
            modalInstance = $uibModal.open({
                templateUrl: templete,
                controller: controllername,
                scope: $scope
            });

            modalInstance.result.then(function (selectedItem) {
                $scope.selected = selectedItem;
            }, function () {
                console.log('Modal dismissed at: ' + new Date());
            });
        };

        $scope.panel_modal_obj = {};
        $scope.manage_panel = function(index, cabinet){
            var obj = {};
            obj.method = 'Add';
            obj.cabinet = cabinet;
            $scope.panel_modal_obj  = angular.copy(obj);
            showmodel('manage_panel.html');
        };

        $scope.modal_obj = {};
        $scope.add_cabinet = function(){
            var obj = {};
            obj.method = 'Add';
            $scope.modal_obj  = angular.copy(obj);
            showmodel('manage_cabinets.html');
        };

        $scope.edit_cabinet = function(index, selected){
            console.log('in edit_cabinet  with :', angular.toJson(selected));
            var obj = {};
            obj.method = 'Save';
            obj.index = index;
            obj.name = selected.name;
            obj.model = selected.model;
            obj.size = selected.size;
            obj.uuid = selected.uuid;
            $scope.modal_obj  = angular.copy(obj);
            showmodel('manage_cabinets.html');
        };

        $scope.delete_cabinet = function(index, selected){
            var obj = {};
            obj.index = index;
            obj.method = 'Delete';
            obj.uuid = selected.uuid;
            obj.delete_confirm_msg = "All associated devices will be deleted. Are you sure you want to delete ?";
            $scope.modal_obj  = angular.copy(obj);
            showmodel('static/rest/app/client/templates/modals/delete_cabinet_confirm.html');
        };

        $scope.manage_cabinet_obj = function(){
            $scope.modal_obj.name_errmsg = '';
            $scope.modal_obj.size_errmsg = '';
            var stop_execution = false;
            if ($scope.modal_obj.name === undefined) {
                $scope.modal_obj.name_errmsg = "Cabinet name is required.";
                stop_execution = true;
            }
            if ($scope.modal_obj.model === undefined) {
                $scope.modal_obj.model_errmsg = "Cabinet model is required.";
                stop_execution = true;
            }
            if ($scope.modal_obj.size === undefined) {
                $scope.modal_obj.size_errmsg = "Cabinet size is required.";
                stop_execution = true;
            }
            if (stop_execution) {
                return;
            }

            var active_uuid = $location.path().split('/').slice(0, -1).pop();
            var params = {'name': $scope.modal_obj.name, 'model': $scope.modal_obj.model,
            'size': $scope.modal_obj.size, 'colocloud_set': [$scope.active_cloud]};
            if ($scope.modal_obj.method == "Add"){
                add_cab(params);
            }else{
                edit_cab(params);
            }
        };

        var add_cab = function(params){
            var url = 'customer/cabinets/';
            var success_msg = "Cabinet added successfully";
            RestService.send_modal_data(params, url).then(function (result) {
                if (result.status == 201) {
                    $scope.cabinets.push(result.data);
                    $scope.modal_obj = {};
                    $scope.cancel();
                    AlertService2.success(success_msg);
                }
                else {
                    console.log(result.data);
                    if (result.data.name) {
                        $scope.modal_obj.name_errmsg = result.data.name[0];
                    }
                    if (result.data.size) {
                        $scope.modal_obj.size_errmsg = result.data.size[0];
                    }
                    if (result.data.error){
                        $scope.cancel();
                        AlertService2.danger(result.data.error[0]);
                    }
                }
            });
        };

        var edit_cab = function(params){
            var active_uuid = $scope.modal_obj.uuid;
            var index = angular.copy($scope.modal_obj.index);
            var url = 'customer/cabinets/' + active_uuid + '/';
            var success_msg = "Cabinet updated successfully";
            RestService.update_modal_data(params, url).then(function (result) {
                if (result.status == 200) {
                    $scope.cabinets[index] = result.data;
                    $scope.modal_obj = {};
                    $scope.cancel();
                    AlertService2.success(success_msg);

                }
                else {
                    if (result.data.name) {
                        $scope.modal_obj.name_errmsg = result.data.name[0];
                    }
                    if (result.data.size) {
                        $scope.modal_obj.size_errmsg = result.data.size[0];
                    }
                    if (result.data.error){
                        $scope.cancel();
                        AlertService2.danger(result.data.error[0]);
                    }
                }

            });
        };

        $scope.delete_object = function(){
            $scope.cancel();
            var index= $scope.modal_obj.index;
            var active_uuid = $scope.modal_obj.uuid;
            var url = 'customer/cabinets/' + active_uuid + '/';
            RestService.delete_data(url).then(function (result) {
                if (result.status == 204) {
                    $scope.cabinets.splice(index, 1);
                    var success_msg = "Cabinet deleted successfully";
                    AlertService2.success(success_msg);
                }
                else {
                    AlertService2.danger(result.data);
                }
                $scope.modal_obj = {};
            });
        };

        $scope.manage_panel_obj = function(cabinet){
            $scope.panel_modal_obj.name_errmsg = '';
            $scope.panel_modal_obj.size_errmsg = '';
            $scope.panel_modal_obj.position_errmsg = '';
            $scope.panel_modal_obj.device_type_errmsg = '';
            var stop_execution = false;
            if ($scope.panel_modal_obj.device_type === undefined) {
                $scope.panel_modal_obj.device_type_errmsg = "Panel type is required.";
                stop_execution = true;
            }
            if ($scope.panel_modal_obj.name === undefined) {
                $scope.panel_modal_obj.name_errmsg = "Panel name is required.";
                stop_execution = true;
            }
            if ($scope.panel_modal_obj.position === undefined) {
                $scope.panel_modal_obj.position_errmsg = "Panel position is required.";
                stop_execution = true;
            }
            if ($scope.panel_modal_obj.size === undefined) {
                $scope.panel_modal_obj.size_errmsg = "Panel size is required.";
                stop_execution = true;
            }
            if (stop_execution) {
                return;
            }

            var params = {'name': $scope.panel_modal_obj.name, 'position': $scope.panel_modal_obj.position,
            'size': $scope.panel_modal_obj.size, 'cabinet': cabinet, "panel_type": $scope.panel_modal_obj.device_type};
            add_panel(params);
        };

        var add_panel = function(params){
            var url = 'customer/paneldevices/';
            var success_msg = "Panel added successfully";
            RestService.send_modal_data(params, url).then(function (result) {
                if (result.status == 201) {
                    $scope.panel_modal_obj = {};
                    $scope.cancel();
                    AlertService2.success(success_msg);
                }
                else {
                    console.log(result.data);
                    if (result.data.name) {
                        $scope.panel_modal_obj.name_errmsg = result.data.name[0];
                    }
                    if (result.data.size) {
                        $scope.panel_modal_obj.size_errmsg = result.data.size[0];
                    }
                    if (result.data.position) {
                        $scope.panel_modal_obj.position_errmsg = result.data.position[0];
                    }
                    if (result.data.error){
                        $scope.cancel();
                        AlertService2.danger(result.data.error[0]);
                    }
                }
            });
        };
    }
]);

app.controller('CabinetViewController', [
    '$scope',
    '$rootScope',
    '$state',
    '$http',
    '$timeout',
    '$uibModal',
    'AlertService2',
    'OberviumGraphConfig',
    'preloader',
    '$window',
    function ($scope, $rootScope, $state, $http, $timeout, $uibModal, AlertService2, OberviumGraphConfig, preloader, $window) {

        $scope.loading = false;
        $scope.show_heat_map_layer = true;
        $scope.isImagesLoaded = false;
        var modalSupport = null;

        $scope.imageLocations = [
            ( "static/images/cabinets/blank_panel.png?v=2&cache=" + ( new Date() ).getTime() ),
            ( "static/images/cabinets/cable_organiser.jpg?v=2&cache=" + ( new Date() ).getTime() ),
            ( "static/images/cabinets/patch_panel.png?v=2&cache=" + ( new Date() ).getTime() ),
            ( "static/images/cabinets/server.png?v=2&cache=" + ( new Date() ).getTime() ),
            ( "static/images/cabinets/Firewalls-Cabinete.png?v=2&cache=" + ( new Date() ).getTime() ),
            ( "static/images/cabinets/switch.png?v=2&cache=" + ( new Date() ).getTime() ),
            ( "static/images/cabinets/PDU.png?v=2&cache=" + ( new Date() ).getTime() ),
            ( "static/images/cabinets/Load-Balancers-Cabinete-back.png?v=2&cache=" + ( new Date() ).getTime() ),
            ( "static/images/cabinets/other_device.png?v=2&cache=" + ( new Date() ).getTime() ),
            ( "static/images/cabinets/server.png?v=2&cache=" + ( new Date() ).getTime() ),
        ];


        $scope.get_bm_server_controller_power_stats = function (device) {

            if (device.bmc_type == "IPMI" || device.bmc_type == "DRAC"){
                device.controller_message = device.bmc_type + ' Stats';
                device.power_on = null;
                device.action_support = null;
                device.action_message = 'Start Server';
                $http({
                    method: "GET",
                    url: '/customer/bm_servers/'+ device.uuid + '/power_status/',
                }).then(function (response) {
                    var response_power_str = response.data;
                    response_power_str = response_power_str.split('\n');
                    if(response_power_str[0] === 'Chassis Power is on'){
                        return true;
                    }else{
                        return false;
                    }
                }).catch(function (error) {
                    return false;
                });
            }
            else{
                return false;
            }
        };

        $scope.close_confirm = function(){
            modalSupport.dismiss('cancel');
        };

        $scope.blinker_message = 'Click here to blink the server in datacenter.';
        $scope.blink_bm_server = function(device){
            
            console.log("Blink bm : "+angular.toJson(device));
            $scope.ipmi_username = device.username;
            $scope.selected = device;

            modalSupport = $uibModal.open({
                template: '<div class="modal-content">' +
                    '<div class="modal-header">' +
                    '<button type="button" class="close" data-dismiss="modal" ng-click="close_confirm()" aria-hidden="true">&times;</button>' +
                    '<h4 class="modal-title">&nbsp; Bare Metal Server</h4>' +
                    '</div>' +
                    '<div class="modal-body">Are you sure you want to continue with this action?</div>' +
                    '<div class="modal-footer modal-button">' +
                    '<button class="btn btn-cancel" type="button" ng-click="close_confirm()">No</button>' +
                    '<button class="btn btn-default" type="submit" ng-click="showIPMIAuthModal()">Yes</button>' +
                    '</div>' +
                    '</div>',
                scope: $scope,
            });

            modalSupport.result.then(function (selectedItem) {
                $scope.selected = selectedItem;
            }, function () {
            });

            $scope.showIPMIAuthModal = function(){
                $scope.close_confirm();
                modalSupport = $uibModal.open({
                    templateUrl: 'static/rest/app/templates/snippets/ipmi_auth_modal.html',
                    scope: $scope,
                    size: 'md'
                });
            };

            $scope.confirm_action = function(ipmi_username, ipmi_password){

                $scope.ipmiUsernameErr = false;
                $scope.ipmiUsernameErrMsg = null;
                $scope.ipmiPasswordErr = false;
                $scope.ipmiPasswordErrMsg = null;

                if (ipmi_username==null || ipmi_username==''){
                    $scope.ipmiUsernameErr = true;
                    $scope.ipmiUsernameErrMsg = '(Username is mandatory)';
                    return 0;
                }
                if (ipmi_password==null || ipmi_password==''){
                    $scope.ipmiPasswordErr = true;
                    $scope.ipmiPasswordErrMsg = '(Password is mandatory)';
                    return 0;
                }
                $scope.close_confirm();
                $scope.loader = true;
                $http({
                    method: "POST",
                    data: {
                        'ipmi_username': ipmi_username,
                        'ipmi_password': ipmi_password
                    },
                    url: '/customer/bm_servers/'+ device.bm_server.uuid + '/check_password/',
                }).then(function (response) {
                    // console.log("Password validated Successfully");
                    $scope.ipmiBlinkServer();
                }).catch(function (error){
                    $scope.loader = false;
                    AlertService2.danger("Invalid Credential.");
                });
            };

            $scope.ipmiBlinkServer = function(){
                var msg = "";
                $http({
                    method: "POST",
                    url: '/customer/bm_servers/'+ device.bm_server.uuid + '/blink/',
                }).then(function (response) {
                    var response_power_str = response.data;
                    response_power_str = response_power_str.split('\n');
                    msg = "Blinking <b>" + device.name + "</b> Successfully! Please contact datacenter technician to verify.";
                    $scope.loader = false;
                    AlertService2.success(msg);
                    $(".blink_me").addClass("blinker_class");
                    $timeout(function(){
                        $(".blink_me").removeClass("blinker_class");
                    }, 30000);
                }).catch(function (error) {
                    $scope.loader = false;
                    AlertService2.error("Something went wrong !... Please try again later");
                });
            };
            
        };

        preloader.preloadImages( $scope.imageLocations ).then(
            function handleResolve( imageLocations ) {
                $scope.isImagesLoaded = true;
                $timeout(function(){
                 $scope.$parent.$parent.loader = false;
                }, 500);
            },
            function handleReject( imageLocation ) {
                $scope.isImagesLoaded = true;
                $timeout(function(){
                 $scope.$parent.$parent.loader = false;
                }, 500);
            }
        );

        function get_device_match_type(device_type){
            switch(device_type){
                case 'firewalls' :
                        return 'firewall';
                case 'switches' :
                        return 'switch';
                case 'load_balancers' :
                        return 'loadbalancer';
                case 'servers' :
                        return 'server';
                case 'custom_devices' :
                        return 'otherdevice';
                default :
                        return '';
            }
        }

        var get_sockets_conn_to_devices = function(pdu){
            $http({
                method: "GET",
                url: '/customer/pdu_socket_mappings/?pdu_id='+ pdu.device.id,
            }).then(function (response) {
                for(var i = 0; i < response.data.data.length; i++){
                    var device_obj = response.data.data[i];
                    var cabinet_devices = $scope.cabinet_details.devices_list;
                    var all_devices = cabinet_devices.concat($scope.bucket_devices_list);
                    for(var j = 0; j < all_devices.length; j++){
                        var cab_device_obj = all_devices[j];
                        if(!cab_device_obj.device){
                            continue;
                        }else{
                            if(!cab_device_obj.device.pdu_sockets){
                                cab_device_obj.device.pdu_sockets = [];
                            }
                            if(device_obj.device_type == get_device_match_type(cab_device_obj.device_type)){
                                if(device_obj.uuid == cab_device_obj.device.uuid){
                                    var obj = {};
                                    obj.pdu_id = pdu.device.id;
                                    obj.socket_number = device_obj.socket_number;
                                    obj.pdu_type = pdu.device.pdu_type;
                                    cab_device_obj.device.pdu_sockets.push(angular.copy(obj));
                                }
                            }else{
                                continue;
                            }
                        }
                    }
                }
            }).catch(function (error) {
                console.log("error in getting pdu connection sockets : " + JSON.stringify(error));
            });
        };

        for(var i = 0; i < $scope.cabinet_details.all_pdus_list.length; i++){
            get_sockets_conn_to_devices($scope.cabinet_details.all_pdus_list[i]);
        }

        $scope.view_mode = true;
        $scope.edit_mode = false;
        $scope.show_observium_stats = false;
        $scope.show_temp = false;

        $scope.toggle_view_mode = function(){
            $scope.show_observium_stats = false;
            $scope.view_mode = !$scope.view_mode;
            $scope.edit_mode = !$scope.edit_mode;
        };

        var update_device_position = function(device){
            var url = 'customer/cabinets/' + $scope.selected_cabinet.uuid +'/update_cabinet_device_position/';

            $http({
                method: "POST",
                url: url,
                data : device
            }).then(function (response) {
            }).catch(function (error) {
                console.log('error : ', angular.toJson(error));
            });
        };

        $scope.dndStartCallback = function(index, device){
            console.log('in dndStartCallback index : ', index);
            $scope.device_source = 'cabinet';
            $scope.source_index = angular.copy(index);
            $scope.deselect_device(device);
        };

        $scope.dragoverCallback = function() {
            console.log('in dragoverCallback : ');
            return true;
        };

        $scope.dropCallback = function(index, device) {
            console.log('in dropCallback index : ', index);
            console.log('in dropCallback device : ', angular.toJson(device));
            if(!device.device || (index == -1)){
                return false;
            }

            if(($scope.device_source == 'lpdu') || ($scope.device_source == 'rpdu') || ((device.device_type == 'pdus') && (device.device.pdu_type == 'VERTICAL'))){
                AlertService2.danger("Vertical PDU's cannot be placed inside a Cabinet");
                return false;
            }

            if(($scope.temp_device_target == 'lpdu') || ($scope.temp_device_target == 'rpdu')){
                $scope.temp_device_target = undefined;
                return false;
            }

            var unit_occupied = false;
            for(var unit_index = index; unit_index > (index - device.device.size); unit_index--){
                if(!$scope.cabinet_details.devices_list[unit_index]){
                    console.log('avoiding device placing because device going out of cabinet capacity');
                    return false;
                }
                if($scope.cabinet_details.devices_list[unit_index].unit_occupied){
                    unit_occupied = true;
                    break;
                }
            }

            if(unit_occupied){
                return false;
            }else{
                $scope.device_target = 'cabinet';
                $scope.target_index = angular.copy(index);
                return device;
            }
        };

        $scope.deviceInsertCallback = function(drop_effect, index, device){
            console.log('in deviceInsertCallback : ');
            if($scope.device_source == 'cabinet'){
                $scope.cabinet_details.devices_list.splice((index + 1),1);
            }else{
                $scope.cabinet_details.devices_list.splice((index + 1),1);
            }
        };

        $scope.dndMovedCallback = function(index, device){
            console.log('in dndMovedCallback index : ', index);
            if($scope.device_source == 'cabinet'){
                if($scope.device_target == 'cabinet'){
                    if($scope.target_index > index){
                        $scope.cabinet_details.devices_list[index] = {};
                    }else if($scope.target_index < index){
                        $scope.cabinet_details.devices_list[index-1] = {};
                    }
                }else{
                    $scope.cabinet_details.devices_list[index] = {};
                }
            }
        };

        $scope.dndCompleteCallback = function(drop_effect, index, device){
            console.log('in dndCompleteCallback with drop_effect : ', angular.copy(drop_effect));
            console.log('$scope.target_index : ', $scope.target_index);

            if((drop_effect !== 'move')){
                return ;
            }

            for(var source_index = angular.copy($scope.source_index); source_index > ($scope.source_index - device.device.size); source_index--){
                $scope.cabinet_details.devices_list[source_index].unit_occupied = false;
            }

            if(($scope.device_source == 'cabinet') && ($scope.device_target == 'cabinet')){
                for(var target_index = angular.copy($scope.target_index); target_index > ($scope.target_index - device.device.size); target_index--){
                    $scope.cabinet_details.devices_list[target_index].unit_occupied = true;
                }
            }

            if($scope.device_target == 'cabinet'){
                device.device.position = angular.copy($scope.cabinet_details.capacity) - $scope.target_index;
            }else if($scope.device_target == 'lpdu'){
                if($scope.lpdu_target_index == 0){
                    device.device.position = 'C';
                }else if($scope.lpdu_target_index == 1){
                    device.device.position = 'A';
                }

                if($scope.cabinet_details.vertical_lpdu_list.length > 2){
                    $scope.cabinet_details.vertical_lpdu_list.splice(($scope.lpdu_target_index + 1), 1);
                }
            }else if($scope.device_target == 'rpdu'){
                if($scope.rpdu_target_index == 0){
                    device.device.position = 'B';
                }else if($scope.rpdu_target_index == 1){
                    device.device.position = 'D';
                }

                if($scope.cabinet_details.vertical_rpdu_list.length > 2){
                    $scope.cabinet_details.vertical_rpdu_list.splice(($scope.rpdu_target_index + 1), 1);
                }
            }else{
                device.device.position = 0;
                $scope.cabinet_details.available_size = Number($scope.cabinet_details.available_size) + Number(angular.copy(device.device.size));
            }
            update_device_position(device);
        };


        $scope.bucketDNDStartCallback = function(index, device){
            console.log('in bucketDNDStartCallback index : ', index);
            $scope.device_source = 'bucket';
            $scope.bucket_source_index = angular.copy(index);
        };

        $scope.bucketDragoverCallback = function() {
            console.log('in bucketDragoverCallback with : ');
            return true;
        };

        $scope.bucketDropCallback = function(index, device) {
            console.log('in bucketDropCallback index : ', index);
            if(!device.device){
                return false;
            }

            if($scope.device_source == 'bucket'){
                return false;
            }else{
                $scope.device_target = 'bucket';
                $scope.bucket_target_index = angular.copy(index);
                return device;
            }
        };

        $scope.bucketInsertCallback = function(drop_effect, index, device){
            console.log('in bucketDropCallback index : ', index);
        };

        $scope.bucketDNDMovedCallback = function(index, device){
            console.log('in bucketDNDMovedCallback index : ', index);
            $scope.bucket_devices_list.splice(index, 1);
        };

        $scope.bucketDNDCompleteCallback = function(drop_effect, index, device){
            console.log('in bucketDNDCompleteCallback device : ', angular.toJson($scope.device_target));
            if((($scope.device_target !== 'cabinet') && ($scope.device_target !== 'lpdu') && ($scope.device_target !== 'rpdu')) || (drop_effect !== 'move')){
                return ;
            }

            if($scope.device_target == 'cabinet'){

                for(var target_index = angular.copy($scope.target_index); target_index > ($scope.target_index - device.device.size); target_index--){
                    $scope.cabinet_details.devices_list[target_index].unit_occupied = true;
                }

                device.device.position = angular.copy($scope.cabinet_details.capacity) - $scope.target_index;
                update_device_position(device);
                $scope.cabinet_details.available_size = Number($scope.cabinet_details.available_size) - Number(device.device.size);
            }else if($scope.device_target == 'rpdu'){
                if($scope.rpdu_target_index == 0){
                    device.device.position = 'B';
                }else if($scope.rpdu_target_index == 1){
                    device.device.position = 'D';
                }
                $scope.cabinet_details.vertical_rpdu_list[$scope.rpdu_target_index].unit_occupied = true;
                update_device_position(device);
                if($scope.cabinet_details.vertical_rpdu_list.length > 2){
                    $scope.cabinet_details.vertical_rpdu_list.splice(($scope.rpdu_target_index + 1), 1);
                }
            }else if($scope.device_target == 'lpdu'){
                if($scope.lpdu_target_index == 0){
                    device.device.position = 'C';
                }else if($scope.lpdu_target_index == 1){
                    device.device.position = 'A';
                }
                $scope.cabinet_details.vertical_lpdu_list[$scope.lpdu_target_index].unit_occupied = true;
                update_device_position(device);
                if($scope.cabinet_details.vertical_lpdu_list.length > 2){
                    $scope.cabinet_details.vertical_lpdu_list.splice(($scope.lpdu_target_index + 1), 1);
                }
            }
        };


        $scope.VLPDUDragStartCallback = function(index, device){
            console.log('in VLPDUDragStartCallback index : ', index);
            $scope.device_source = 'lpdu';
            $scope.lpdu_source_index = angular.copy(index);
        };

        $scope.VLPDUDragoverCallback = function() {
            console.log('in VLPDUDragoverCallback with : ');
            return true;
        };

        $scope.VLPDUDropCallback = function(index, device) {
            console.log('in VLPDUDropCallback index : ', index);
            if(!device.device || (device.device_type != 'pdus') ||(index > 1)){
                return false;
            }

            $scope.temp_device_target = 'lpdu';
            if((($scope.device_source == 'lpdu') && ($scope.lpdu_source_index == index)) || ($scope.cabinet_details.vertical_lpdu_list[index].unit_occupied)) {
                return false;
            }else{
                if((device.device_type == 'pdus') && (device.device.pdu_type == 'HORIZONTAL')){
                    $scope.device_source = undefined;
                    $scope.device_target = undefined;
                    AlertService2.danger("Horizontal PDU's cannot be placed in vertical slots");
                    return false;
                }
                $scope.device_target = 'lpdu';
                $scope.lpdu_target_index = angular.copy(index);
                return device;
            }
        };

        $scope.VLPDUInsertCallback = function(drop_effect, index, device){
            console.log('in VLPDUInsertCallback index : ', index);
        };

        $scope.VLPDUMovedCallback = function(index, device){
            console.log('in VLPDUMovedCallback index : ', index);
            $scope.cabinet_details.vertical_lpdu_list[index] = {};
        };

        $scope.VLPDUDragCompleteCallback = function(drop_effect, index, device){
            console.log('in VLPDUDragCompleteCallback device : ', angular.toJson($scope.device_target));
            if(drop_effect !== 'move'){
                return ;
            }

            if($scope.device_target == 'cabinet'){
                $scope.cabinet_details.devices_list[$scope.target_index].unit_occupied = true;
                $scope.cabinet_details.devices_list[($scope.target_index + 1)].unit_occupied = true;

                device.device.position = $scope.target_index + 1;
                $scope.cabinet_details.available_size = Number($scope.cabinet_details.available_size) - Number(angular.copy(device.device.size));
                update_device_position(device);
            }else if($scope.device_target == 'rpdu'){
                if($scope.rpdu_target_index == 0){
                    device.device.position = 'B';
                }else if($scope.rpdu_target_index == 1){
                    device.device.position = 'D';
                }
                $scope.cabinet_details.vertical_rpdu_list[$scope.rpdu_target_index].unit_occupied = true;
                update_device_position(device);
                if($scope.cabinet_details.vertical_rpdu_list.length > 2){
                    $scope.cabinet_details.vertical_rpdu_list.splice(($scope.rpdu_target_index + 1), 1);
                }
            }else if($scope.device_target == 'lpdu'){

                if($scope.lpdu_target_index == 0){
                    device.device.position = 'C';
                }else if($scope.lpdu_target_index == 1){
                    device.device.position = 'A';
                }
                $scope.cabinet_details.vertical_lpdu_list[$scope.lpdu_target_index].unit_occupied = true;
                update_device_position(device);
                if($scope.cabinet_details.vertical_lpdu_list.length > 2){
                    $scope.cabinet_details.vertical_lpdu_list.splice(($scope.lpdu_target_index + 1), 1);
                }
            }else{
                device.device.position = 0;
                update_device_position(device);
            }
            $scope.cabinet_details.vertical_lpdu_list[$scope.lpdu_source_index].unit_occupied = false;   
        };

        $scope.VRPDUDragStartCallback = function(index, device){
            console.log('in VRPDUDragStartCallback index : ', index);
            $scope.device_source = 'rpdu';
            $scope.rpdu_source_index = angular.copy(index);
        };

        $scope.VRPDUDragoverCallback = function() {
            console.log('in VRPDUDragoverCallback with : ');
            return true;
        };

        $scope.VRPDUDropCallback = function(index, device) {
            console.log('in VRPDUDropCallback index : ', index);
            if(!device.device || (device.device_type != 'pdus') ||(index > 1)){
                return false;
            }
            $scope.temp_device_target = 'rpdu';
            if((($scope.device_source == 'rpdu') && ($scope.rpdu_source_index == index)) || ($scope.cabinet_details.vertical_rpdu_list[index].unit_occupied)) {
                return false;
            }else{
                if((device.device_type == 'pdus') && (device.device.pdu_type == 'HORIZONTAL')){
                    $scope.device_source = undefined;
                    $scope.device_target = undefined;
                    AlertService2.danger("Horizontal PDU's cannot be placed in vertical slots");
                    return false;
                }
                $scope.device_target = 'rpdu';
                $scope.rpdu_target_index = angular.copy(index);
                return device;
            }
        };

        $scope.VRPDUInsertCallback = function(drop_effect, index, device){
            console.log('in VRPDUInsertCallback index : ', index);
        };

        $scope.VRPDUMovedCallback = function(index, device){
            console.log('in VRPDUMovedCallback index : ', index);
            $scope.cabinet_details.vertical_rpdu_list[index] = {};
        };

        $scope.VRPDUDragCompleteCallback = function(drop_effect, index, device){
            console.log('in VRPDUDragCompleteCallback device : ', angular.toJson($scope.device_target));
            if(drop_effect !== 'move'){
                return ;
            }

            if($scope.device_target == 'cabinet'){
                $scope.cabinet_details.devices_list[$scope.target_index].unit_occupied = true;
                $scope.cabinet_details.devices_list[($scope.target_index + 1)].unit_occupied = true;

                device.device.position = $scope.target_index + 1;
                $scope.cabinet_details.available_size = Number($scope.cabinet_details.available_size) - Number(angular.copy(device.device.size));
            }else if($scope.device_target == 'rpdu'){
                if($scope.rpdu_target_index == 0){
                    device.device.position = 'B';
                }else if($scope.rpdu_target_index == 1){
                    device.device.position = 'D';
                }
                $scope.cabinet_details.vertical_rpdu_list[$scope.rpdu_target_index].unit_occupied = true;
                update_device_position(device);
                if($scope.cabinet_details.vertical_rpdu_list.length > 2){
                    $scope.cabinet_details.vertical_rpdu_list.splice(($scope.rpdu_target_index + 1), 1);
                }
            }else if($scope.device_target == 'lpdu'){
                if($scope.lpdu_target_index == 0){
                    device.device.position = 'C';
                }else if($scope.lpdu_target_index == 1){
                    device.device.position = 'A';
                }
                $scope.cabinet_details.vertical_lpdu_list[$scope.lpdu_target_index].unit_occupied = true;
                update_device_position(device);
                if($scope.cabinet_details.vertical_lpdu_list.length > 2){
                    $scope.cabinet_details.vertical_lpdu_list.splice(($scope.lpdu_target_index + 1), 1);
                }
            }else{
                device.device.position = 0;
                update_device_position(device);
            }
            $scope.cabinet_details.vertical_rpdu_list[$scope.rpdu_source_index].unit_occupied = false;
        };

        $scope.get_observium_stats = function (device) {
            if(!device.device){
                return;
            }

            // console.log('device : ', angular.toJson(device));
            if(device.device_type == 'panel_devices'){
                console.log('device : ', angular.toJson(device));
            } else if ((device.device_type == 'custom_devices') && !device.device.uptimeRobotStatus){
                $scope.get_uptime_details(device);
            }else{
                $scope.get_health_overview_data(device);
            }
            $scope.device_selected_to_monitor = device;
        };

        $scope.show_cabinet_details = function(){
            $scope.device_selected_to_monitor = undefined;
            $scope.device_selected = undefined;
            if($scope.device_selected_by_click){
                delete $scope.device_selected_by_click.selected_by_click;
                $scope.deselect_device($scope.device_selected_by_click);
            }
        };

        $scope.device_selected = undefined;
        $scope.select_device_details = function(device){
            if(!device.device){
                $scope.device_selected = undefined;
                return;
            }
            // console.log('device sockets connected is : ', angular.toJson(device.device.pdu_sockets));
            $scope.device_selected = angular.copy(device);

            if(device.device.pdu_sockets){
                for(var i = 0; i < device.device.pdu_sockets.length; i++){
                    var ele = $('#pdu-'+ device.device.pdu_sockets[i].pdu_id + (device.device.pdu_sockets[i].socket_number -1));
                    ele.addClass('highlight_socket');
                    if(device.device.pdu_sockets[i].pdu_type == 'HORIZONTAL'){
                        ele.attr('src', 'static/images/cabinets/hpdu_selected_socket.png');
                    }else{
                        ele.attr('src', 'static/images/cabinets/pdu_selected_socket.png');
                    }
                    ele.attr('data-placement', 'top');
                    ele.attr('title', device.device.pdu_sockets[i].socket_number);
                    ele.tooltip({
                        trigger : ''
                    });
                    ele.tooltip('show');
                }
            }
        };

        $scope.deselect_device = function(device){
            if(!device.device || !device.device.pdu_sockets){
                return;
            }

            if(device.selected_by_click){
                return;
            }

            for(var i = 0; i < device.device.pdu_sockets.length; i++){
                var ele = $('#pdu-'+ device.device.pdu_sockets[i].pdu_id + (device.device.pdu_sockets[i].socket_number -1));
                ele.removeClass('highlight_socket');
                if(device.device.pdu_sockets[i].pdu_type == 'HORIZONTAL'){
                    ele.attr('src', 'static/images/cabinets/hpdu_single_socket.png');
                }else{
                    ele.attr('src', 'static/images/cabinets/single_socket.png');
                }
                ele.tooltip("hide");
                ele.removeAttr("title");
                ele.removeAttr("data-placement");
            }
        };

        $scope.device_selected_by_click = null;
        $scope.clicked_on_device = function(device){
            if(!device.device || !device.device.pdu_sockets){
                $scope.device_selected_by_click = undefined;
                return;
            }

            if($scope.device_selected_by_click){
                if(device.device.uuid == $scope.device_selected_by_click.device.uuid){
                    return;
                }else{
                    // console.log('removing selected_by_click to : ', $scope.device_selected_by_click.device.name);
                    delete $scope.device_selected_by_click.selected_by_click;
                    $scope.deselect_device($scope.device_selected_by_click);
                }
            }
            device.selected_by_click = true;
            $scope.select_device_details(angular.copy(device));
            $scope.device_selected_by_click = device;
        };

        $scope.get_class = function(device, socket_index){
            if($scope.device_selected && $scope.device_selected.device && $scope.device_selected.device.pdu_sockets){
                for(var i = 0; i < $scope.device_selected.device.pdu_sockets.length; i++){
                    var pdu_socket = angular.copy($scope.device_selected.device.pdu_sockets[i]);
                    if((device.device.id == pdu_socket.pdu_id) && (socket_index == pdu_socket.socket_number)){
                        return true;
                    }
                }
            }
            return false;
        };

        $scope.openSSHPanel = function(device){
            if(!device.device.management_ip){
                return;
            }
            var url = '/vm-console-client#/' + device.device_type + '/webconsole/' + device.device.uuid + '/';
            $window.open(url, '_blank');
        };

        $scope.manage_heatmap_layer = function(show_heat_map_layer){
            $scope.show_heat_map_layer = angular.copy(show_heat_map_layer);
            console.log('show_heat_map_layer : ', $scope.show_heat_map_layer);

        };
    }
]);

app.controller('ColoCloudCageController', [
    '$scope',
    '$rootScope',
    '$http',
    '$location',
    function ($scope, $rootScope, $http, $location) {
        console.log('in CageController');
        var uuid = $location.path().split('/').slice(0, -1).pop();

        $scope.get_cage_list = function(){
            $http({
                method: "GET",
                url: '/customer/colo_cloud/' + uuid +'/cages'
            }).then(function (response) {
                $scope.cages = response.data;
                $scope.$parent.loader = false;
            }).catch(function (error) {
                console.log('error : ', angular.toJson(error));
                $scope.$parent.loader = false;
            });
        };

        $scope.get_cage_list();
    }
]);

app.controller('ColoCloudPDUController', [
    '$scope',
    '$rootScope',
    '$http',
    '$state',
    '$timeout',
    '$location',
    '$uibModal',
    'AlertService2',
    'TaskService2',
    function ($scope, $rootScope, $http, $state, $timeout, $location, $uibModal, AlertService2, TaskService2) {
        console.log('in ColoCloudPDUController');
        var uuid = $location.path().split('/').slice(0, -1).pop();
        var modalSupport = null;

        $scope.get_pdu_list = function(){
            $http({
                method: "GET",
                url: '/customer/colo_cloud/' + uuid +'/pdus'
            }).then(function (response) {
                $scope.pdus = response.data;
                $scope.$parent.loader = false;
            }).catch(function (error) {
                console.log('error : ', angular.toJson(error));
                $scope.$parent.loader = false;
            });
        };

        $scope.get_pdu_list();

        $scope.get_pdu_details = function (pdu) {
            pdu.observium_details = {};
            $http({
                method: "GET",
                url: '/customer/observium/pdu/' + pdu.uuid + '/get_device_data/'
            }).then(function (response) {
                console.log('');
                pdu.observium_details = response.data;
                pdu.observium_details.device_data.uptime = $scope.getuptime(response.data);
            }).catch(function (error) {
                pdu.observium_details = null;
            });
        };

        $scope.recyclePDUCredentailsModal = function(pdu){
            $scope.pdu = pdu;
            $scope.pduUsernameErrMsg = '';
            $scope.pduPasswordErrMsg = '';
            modalSupport = $uibModal.open({
                templateUrl: 'recyclePDUCredentails.html',
                scope: $scope,
            });
        };

        $scope.pduTaskService = function(pdu_uuid, username, password, ip_address){
            $http({
                method: "POST",
                url: '/customer/pdus/' + pdu_uuid + '/recycle_pdu/',
                data: {'username': username, 'password': password, 'ip_address': ip_address}
            }).then(function (response) {
                if (response.data.hasOwnProperty('task_id')) {
                    TaskService2.processTask(response.data.task_id, 500).then(function (result) {
                        if (result.status) {
                             AlertService2.success(result.data);
                             $scope.pdu.recycling= false;
                        }
                        else{
                            AlertService2.danger(result.data);
                            $scope.pdu.recycling= false;
                        }
                    }).catch(function (error) {
                        AlertService2.danger(error);
                        $scope.pdu.recycling=false;
                    });
                } 
            }).catch(function (error) {
                AlertService2.danger(error);
                $scope.pdu.recycled= true;
            });
        };

        $scope.recyclePDU = function(username, password){
            $scope.pduUsernameErrMsg = '';
            $scope.pduPasswordErrMsg = '';
            if (username=='' || username == undefined){
                $scope.pduUsernameErrMsg = 'Username is mandatory';
                return;
            }
            else if (password=='' || password == undefined){
                $scope.pduPasswordErrMsg = 'Password is mandatory';
                return;
            }
            $scope.pdu.recycling = true;

            $http({
                method: "POST",
                url: '/customer/pdus/' + $scope.pdu.uuid + '/check_auth_pdu/',
                data: {'username': username, 'password': password, 'ip_address': $scope.pdu.ip_address}
            }).then(function (response) {
                
                $scope.close();
                AlertService2.success('Please wait this will take few minitues.');
                $scope.pduTaskService($scope.pdu.uuid, username, password, $scope.pdu.ip_address);
                
            }).catch(function (error) {
                $scope.pduErrMsg = error.data;
                $scope.pdu.recycling = false;
                // AlertService2.danger(error);
            });

        };

        $scope.popoverobj = {
            templateUrl: 'device_observium_stats.html',
        };

        $scope.show_observium_details = function (pdu) {
            $scope.pdu_details = pdu.observium_details;
        };

        $scope.show_observium_stats = function (pdu_id) {
            $state.go('colo_cloud.pdu', {uuidp: uuid, uuidc:pdu_id}, {reload: false});
            $timeout(function () {
                $scope.addClassforTabs('.actonecls ul', 1);
            }, 1000);
        };
        
        $scope.update_mappings = function(){
            var data = {};
            data['pdu'] = $scope.pdu;
            data['device_mappings'] = $scope.socketDeviceMappings;

            $http({
                method: "POST",
                url: '/customer/pdu_socket_mappings/update_mappings/',
                data: data,
            }).then(function (response) {
                AlertService2.success('Socket mappings updated successfully');
            }).catch(function (error) {
                AlertService2.danger('Something went wrong, please try again');
            });
            $scope.close();
        };

        $scope.get_pdu_mappings = function(){
            $http({
                method: "GET",
                url: '/customer/pdu_socket_mappings/?pdu_id=' + $scope.pdu.id,
                data: {'pdu': $scope.pdu},
            }).then(function (response) {
                $scope.socketMappings = response.data.data;
                
                for (var i = 1; i <= $scope.pdu.sockets; i++) {
                    var d = {};
                    $scope.socketDeviceMappings[i-1] = {};
                    $scope.socketDeviceMappings[i-1]['socket_number'] = i;
                    if ($scope.socketMappings.length==0){
                        $scope.socketDeviceMappings[i-1]['selected_device'] = {};
                    }
                    else{
                        for (var j=0; j<$scope.socketMappings.length; j++){
                            if (i==$scope.socketMappings[j].socket_number){
                                $scope.socketMappings[j]['readable_name'] = $scope.socketMappings[j]['device_type'] + ' - ' + $scope.socketMappings[j]['name'];
                                $scope.socketDeviceMappings[i-1]['selected_device'] = $scope.socketMappings[j];
                                break;
                            }
                            else{
                                $scope.socketDeviceMappings[i-1]['selected_device'] = {};
                            }
                        }
                    }
                }
            });
        };

        $scope.getCabinetDevices = function(){
            $http({
                method: "GET",
                url: '/customer/cabinets/' + $scope.pdu.cabinet.uuid + '/'
            }).then(function (response) {
                $scope.cabinetdetails = response.data;
                $scope.availableDevices = [];

                var constructListOfDevices = function(obj, device_type){
                    var d = {};
                    d['device_type'] = device_type;
                    d['name'] = obj.name;
                    d['uuid'] = obj.uuid;
                    d['id'] = obj.id;
                    d['readable_name'] = d['device_type'] + ' - ' + d['name'];
                    return d;
                };

                for(var i=0; i<$scope.cabinetdetails.firewalls.length; i++){
                    $scope.availableDevices.push(constructListOfDevices($scope.cabinetdetails.firewalls[i], 'firewall'));
                }

                for(var i=0; i<$scope.cabinetdetails.switches.length; i++){
                    $scope.availableDevices.push(constructListOfDevices($scope.cabinetdetails.switches[i], 'switch'));
                }

                for(var i=0; i<$scope.cabinetdetails.servers.length; i++){
                    $scope.availableDevices.push(constructListOfDevices($scope.cabinetdetails.servers[i], 'server'));
                }

                for(var i=0; i<$scope.cabinetdetails.load_balancers.length; i++){
                    $scope.availableDevices.push(constructListOfDevices($scope.cabinetdetails.load_balancers[i], 'loadbalancer'));
                }
                for(var i=0; i<$scope.cabinetdetails.custom_devices.length; i++){
                    $scope.availableDevices.push(constructListOfDevices($scope.cabinetdetails.custom_devices[i], 'otherdevice'));
                }
                $scope.availableDevices.push({'readable_name': 'Empty slot'});
                
            }).catch(function (error) {
                AlertService2.danger('Something went wrong, please try again');
            });
        };

        $scope.configureSocketMappings = function(pdu){
            $scope.pdu = pdu;
            $scope.socketDeviceMappings = [];
            $scope.getCabinetDevices();
            $scope.get_pdu_mappings();

            modalSupport = $uibModal.open({
                templateUrl: 'static/rest/app/templates/snippets/pdu_socket_mappings.html',
                scope: $scope,
            });
        };
        $scope.close = function(){
            $scope.pduErrMsg = "";
            modalSupport.dismiss('cancel');
        };

        $scope.manageByRequest = function(pdu){
            $scope.device_type = 'PDU';
            $scope.device_name = pdu.name;
            $scope.description ="PDU Name: " + pdu.name + "\n" +
                "PDU Type: " + pdu.pdu_type + "\n" +
                "Number of Sockets: " + pdu.sockets + "\n" +
                "PDU Size: " + pdu.size;
            modalSupport = $uibModal.open({
                templateUrl: 'static/rest/app/client/templates/manage_request.html',
                controller: 'ManageRequestController',
                scope: $scope,
            });
            // showModal('static/rest/app/client/templates/manage_request.html', 'ManageRequestController');
        };
    }
]);

app.controller('PCController', [
    '$scope',
    '$rootScope',
    '$http',
    '$state',
    '$timeout',
    '$location',
    '$uibModal',
    'AlertService2',
    'RestService',
    'ValidationService',
    'CustomerPrivateCloud',
    'AbstractControllerFactory2',
    'private_cloud_details',
    function ($scope, $rootScope, $http, $state, $timeout, $location, $uibModal, AlertService2, RestService, ValidationService, CustomerPrivateCloud, AbstractControllerFactory2, private_cloud_details) {
        console.log('in PCControllerwith private_cloud_details : ');

        $scope.loader = true;

        if(private_cloud_details == null){
            return;
        }

        $scope.private_clouds = angular.copy(private_cloud_details.results);

        $scope.active_pc_index = '';
        $scope.active_pc = {};
        $scope.active_pc_elem_index = {index:null};
        $scope.active_pc_elem = {};

        $scope.active_cloud_index = '';
        $scope.active_cloud = {};
        $scope.active_cloud_elem_index = '';
        $scope.active_cloud_elem = {};

        // Customer Admin check
        $scope.action_enabled = false;
        if ($rootScope.is_user_customer_admin){
            $scope.action_enabled = true;
        }

        $scope.pc_types = ['OpenStack', 'VMware', 'Custom', 'vCloud Director'];
        var pc_rows = [];

        var modalInstance = null;
        var showmodel = function (templete, controllername) {
            if (modalInstance !== null) {
                modalInstance.dismiss('cancel');
            }
            $scope.loader = false;
            modalInstance = $uibModal.open({
                templateUrl: templete,
                controller: controllername,
                scope: $scope
            });

            modalInstance.result.then(function (selectedItem) {
                $scope.selected = selectedItem;
            }, function () {
                console.log('Modal dismissed at: ' + new Date());
            });
        };

        $scope.cancel = function () {
            modalInstance.close();
        };

        var getDatacenters = function(){
            $http({
                method: "GET",
                url: '/customer/colo_cloud'
            }).then(function (response) {
                $scope.datacenters = response.data.results;
            }).catch(function (error) {
            });
        };

        $scope.getCloudDetails = function(url, cloud){
            $http({
                method: "GET",
                url: url
            }).then(function (response) {
                if (response.data){
                    $scope.modal_obj.hostname = response.data.hostname;
                    $scope.modal_obj.username = response.data.username;
                    $scope.modal_obj.password = response.data.password;
                    if (cloud.platform_type == 'OpenStack'){
                        $scope.modal_obj.project = response.data.project;
                        $scope.modal_obj.user_domain = response.data.user_domain;
                        $scope.modal_obj.project_domain = response.data.project_domain;
                    }
                    if (cloud.platform_type == 'vCloud Director'){
                        $scope.modal_obj.hostname = response.data.endpoint;
                        $scope.modal_obj.vcloud_org = response.data.vcloud_org;
                    }
                }
            }).catch(function (error) {
            });
        };

        $scope.setvcloudOrg = function(){
            if ($scope.modal_obj.platform_type == 'vCloud Director'){
                var parser = document.createElement('a');
                parser.href = $scope.modal_obj.hostname;
                if (parser.search.length == 0){
                    var org_name = parser.pathname.split('/');
                    org_name = org_name.filter(Boolean);
                    $scope.modal_obj.vcloud_org = org_name[org_name.length - 1];
                }
                else if (parser.search.length != 0){
                    $scope.modal_obj.vcloud_org = parser.search.split(':')[1].split('&')[0];
                }
                else{
                    $scope.modal_obj.vcloud_org = null;
                }
                console.log('vcloudorg', $scope.modal_obj.vcloud_org);
            }
        };

        // CRUD operation code for Private Cloud
        $scope.add_pc = function(index){
            getDatacenters();
            $scope.modal_obj = {};
            $scope.modal_obj.method = 'Add';
            $scope.modal_obj.index = index;
            showmodel('static/rest/app/client/templates/modals/manage_pc.html');
        };

        $scope.change_password = function(new_password, confirm_password){
            $scope.new_password_err = '';
            $scope.confirm_password_err = '';
            
            if ((new_password == '') || (new_password == undefined)){
                $scope.new_password_err = 'This field is required.';
                return;
            }
            if ((confirm_password== '') || (confirm_password == undefined)){
                $scope.confirm_password_err = 'This field is required.';
                return;
            }
            if ((new_password !== confirm_password)){
                $scope.confirm_password_err = 'Passwords did not match';
                return;
            }

            if ($scope.cloud.platform_type == 'Custom'){
                return;
            }
            else if ($scope.cloud.platform_type == 'OpenStack'){
                var url = 'customer/openstack_controllers/' + $scope.cloud.uuid + '/change_password/';
            }
            else if ($scope.cloud.platform_type == 'VMware'){
                var url = 'customer/customer_vcenters/' + $scope.cloud.uuid + '/change_password/';
            }
            else if ($scope.cloud.platform_type == 'vCloud Director'){
                var url = 'customer/vclouds/instance/' + $scope.cloud.uuid + '/change_password/';
            }

            $scope.cancel();
            $scope.loader = true;
            var data = {'cloud': $scope.cloud, 'new_password': new_password};
            RestService.send_modal_data(data, url).then(function (result) {
                if (result.status == 400){
                    AlertService2.danger(result.data.data);
                }
                if (result.status ==200){
                    AlertService2.success(result.data.data);
                }
                $scope.loader = false;
            });
        }; 

        $scope.changePasswordModal = function(cloud){
            $scope.cloud = cloud;
            $scope.new_password_err = '';
            $scope.confirm_password_err = '';
            showmodel('changePassword.html');
        };

        $scope.update_pc = function(cloud){
            console.log('cloud', cloud);
            $scope.modal_obj = {};
            getDatacenters();
            $scope.modal_obj.name = cloud.name;
            $scope.modal_obj.platform_type = cloud.platform_type;
            $scope.modal_obj.colocation_cloud = cloud.colocation_cloud;
            $scope.modal_obj.method = 'Save';

            if (cloud.platform_type == 'Custom'){
                showmodel('static/rest/app/client/templates/modals/manage_pc.html');    
                return;
            }

            if (cloud.platform_type == 'OpenStack'){
                var url = 'customer/openstack_controllers/' + cloud.uuid + '/';
            }
            else if (cloud.platform_type == 'VMware'){
                var url = 'customer/customer_vcenters/' + cloud.uuid + '/';
            }
            else if (cloud.platform_type == 'vCloud Director'){
                var url = 'customer/vclouds/instance/' + cloud.uuid + '/';
            }
            $scope.getCloudDetails(url, cloud);
            showmodel('static/rest/app/client/templates/modals/manage_pc.html');
        };

        $scope.delete_pc = function(){
            $scope.modal_obj = {};
            $scope.modal_obj.delete_confirm_msg = "All associated devices will be deleted. Are you sure you want to delete ?";
            showmodel('static/rest/app/client/templates/modals/delete_cabinet_confirm.html');
        };

        $scope.manage_pc_obj = function(){
            var pc_rows = [];
            pc_rows.push({"name": "platform_type", "description": "Cloud type", "required": true});
            pc_rows.push({"name": "name" ,"description": "Name", "required": true});
            pc_rows.push({"name": "colocation_cloud", "description": "Datacenter", "required": true});

            if (($scope.modal_obj.platform_type == 'OpenStack')){
                pc_rows.push({"name": "hostname", "description": "Hostname", "required": true});
                pc_rows.push({"name": "username", "description": "Username", "required": true});
                // pc_rows.push({"name": "password", "description": "Password", "required": true});
                pc_rows.push({"name": "project", "description": "Project", "required": true});
                pc_rows.push({"name": "user_domain", "description": "User Domain", "required": true});
                pc_rows.push({"name": "project_domain", "description": "Project Domain", "required": true});
            }
            if ($scope.modal_obj.platform_type == 'VMware'){
                pc_rows.push({"name": "hostname", "description": "Hostname", "required": true});
                pc_rows.push({"name": "username", "description": "Username", "required": true});
                // pc_rows.push({"name": "password", "description": "Password", "required": true});
            }
            if ($scope.modal_obj.platform_type == 'vCloud Director'){
                pc_rows.push({"name": "hostname", "description": "Hostname", "required": true});
                pc_rows.push({"name": "username", "description": "Username", "required": true});
                // pc_rows.push({"name": "password", "description": "Password", "required": true});
                pc_rows.push({"name": "vcloud_org", "description": "Organization", "required": true});
            }
            if ((($scope.modal_obj.platform_type == 'vCloud Director') ||
                ($scope.modal_obj.platform_type == 'VMware') ||
                ($scope.modal_obj.platform_type == 'OpenStack')) && 
                ($scope.modal_obj.method=='Add')){
                
                pc_rows.push({"name": "password", "description": "Password", "required": true});
            }
            if ($scope.modal_obj.platform_type == 'Custom'){
                pc_rows.push({"name": "platform_type", "description": "Cloud type", "required": true});
                pc_rows.push({"name": "name" ,"description": "Name", "required": true});
                pc_rows.push({"name": "colocation_cloud", "description": "Datacenter", "required": true});
            }

            var valid = ValidationService.validate_data($scope.modal_obj, pc_rows);
            if (!valid.is_validated) {
                return valid;
            }

            if ($scope.modal_obj.method=='Add'){
                var url = 'customer/private_cloud/';
                $scope.cancel();
                $scope.loader = true;
                RestService.send_modal_data($scope.modal_obj, url).then(function (result) {
                    console.log('result', result);
                    if (result.status == 400){
                        if (result.data.non_field_errors){
                            AlertService2.danger(result.data.non_field_errors[0]);
                        }
                        else{
                            AlertService2.danger(result.data);
                        }
                    }
                    if (result.status ==200){
                        AlertService2.success('Private Cloud added successfully');
                        $scope.private_clouds = result.data;
                        $scope.active_cloud_index = $scope.modal_obj.index;
                        $state.reload();
                    }
                    $scope.loader = false;
                });
            }

            if ($scope.modal_obj.method=='Save'){
                var url = 'customer/private_cloud/' + $scope.active_cloud.uuid + '/';
                $scope.cancel();
                $scope.loader = true;
                RestService.update_modal_data($scope.modal_obj, url).then(function (result) {
                    if (result.status == 400){
                        if (result.data.non_field_errors){
                            AlertService2.danger(result.data.non_field_errors[0]);
                        }
                        else{
                            AlertService2.danger(result.data);
                        }
                    }
                    if (result.status ==200){
                        AlertService2.success('Private Cloud updated successfully');
                        $scope.private_clouds[$scope.modal_obj.index] = result.data;
                        $scope.active_cloud_index = $scope.modal_obj.index;
                        $state.reload();
                    }
                    $scope.loader = false;
                });
            }
        };

        $scope.delete_object = function(){
            var url = 'customer/private_cloud/' + $scope.active_cloud.uuid + '/';
            $scope.cancel();
            $scope.loader = true;
            RestService.delete_data(url).then(function (result) {
                var success_msg = "Private Cloud deleted successfully";
                $scope.private_clouds = result.data;
                AlertService2.success(success_msg);
                $scope.loader = false;
                $scope.switch_active_cloud($scope.private_clouds[0], 0);
            });
        };

        $scope.switch_active_cloud = function(cloud, index){
            $scope.loader = true;
            $scope.active_cloud_index = angular.copy(index);
            $scope.active_cloud = angular.copy(cloud);
            $scope.get_pc_elements($scope.active_cloud, $scope.pc_elems[0], 0);
        };

        $scope.pc_elems = [
            {
                "name" : "summary",
                "fa" : "fa-clipboard",
                'display_name' : 'Summary',
            },
            {
                "name" : "all_devices",
                "fa" : "fa-tasks",
                'display_name' : 'All Devices',
            },
            {
                "name" : "hypervisors",
                "fa" : "fa-server",
                'display_name' : 'Hypervisors',
            },
            {
                "name" : "bm_servers",
                "fa" : "fa-laptop",
                'display_name' : 'Bare Metal Servers',
            },
            {
                "name" : "virtual_machines",
                "fa" : "fa-object-group",
                'display_name' : 'Virtual Machines',
            },
            {
                "name" : "switches",
                "fa" : "fa-sitemap",
                'display_name' : 'Switches',
            },
            {
                "name" : "firewalls",
                "fa" : "fa-fire",
                'display_name' : 'Firewalls',
            },
            {
                "name" : "load_balancers",
                "fa" : "fa-balance-scale",
                'display_name' : 'Load Balancers',
            },
            {
                "name" : "other_devices",
                "fa" : "fa-sliders",
                'display_name' : 'Other Devices',
            }
        ];


        var manage_pc_variables = function(pc_uuid, pc_elem){

            for(var i = 0; i < $scope.private_clouds.length; i++){
                if($scope.private_clouds[i].uuid === pc_uuid){
                    $scope.active_cloud_index = i;
                    $scope.active_cloud = $scope.private_clouds[i];
                    break;
                }
            }

            for(var k = 0; k < $scope.pc_elems.length; k++){
                if($scope.pc_elems[k].name === pc_elem){
                    $scope.active_pc_elem = $scope.pc_elems[k];
                    $scope.active_pc_elem_index.index = k;
                    break;
                }
            }

        };

        $scope.get_pc_elements = function(cloud, elem, index){
            console.log('in get_pc_elements with index : ', index);
            $scope.loader = true;
            $scope.active_pc_elem = angular.copy(elem);
            $scope.active_pc_elem_index.index = angular.copy(index);
            switch(index){
                case 0 :
                        $state.go('pc_cloud.summary',{'uuidc':cloud.uuid}, {reload : 'pc_cloud.summary'});
                        break;
                case 1 :
                        $state.go('pc_cloud.all_devices',{'uuidc':cloud.uuid}, {reload : 'pc_cloud.all_devices'});
                        break;
                case 2 :
                        $state.go('pc_cloud.hypervisors',{'uuidc':cloud.uuid}, {reload : 'pc_cloud.hypervisors'});
                        break;
                case 3 :
                        $state.go('pc_cloud.bm_servers',{'uuidc':cloud.uuid}, {reload : 'pc_cloud.bm_servers'});
                        break;
                case 4 :
                        $state.go('pc_cloud.virtual_machines',{'uuidc':cloud.uuid}, {reload : 'pc_cloud.virtual_machines'});
                        break;
                case 5 :
                        $state.go('pc_cloud.switches',{'uuidc':cloud.uuid}, {reload : 'pc_cloud.switches'});
                        break;
                case 6 :
                        $state.go('pc_cloud.firewalls',{'uuidc':cloud.uuid}, {reload : 'pc_cloud.firewalls'});
                        break;
                case 7 :
                        $state.go('pc_cloud.load_balancers',{'uuidc':cloud.uuid}, {reload : 'pc_cloud.load_balancers'});
                        break;
                case 8 :
                        $state.go('pc_cloud.other_devices',{'uuidc':cloud.uuid}, {reload : 'pc_cloud.other_devices'});
                        break;
                default : 
                    console.log('something went wrong !');

            }
        };

        $scope.$watch(function () {
            return $location.path();
        }, function (value) {
            var pc_elem = value.split('/').pop();
            var pc_uuid;

            // console.log('current state : ', angular.toJson($state.current))
            console.log('PC ID=============================> : '+value.split('/').slice(0, -1).pop());
            switch(pc_elem){
                case 'pc_clouds' : 
                        console.log('in $location, get_pc_elements');
                        if($scope.private_clouds.length > 0){
                            $scope.get_pc_elements($scope.private_clouds[0],$scope.pc_elems[0],0);
                        }
                        break;
                case 'summary' :
                        pc_uuid = value.split('/').slice(0, -1).pop();
                        manage_pc_variables(pc_uuid, pc_elem);
                        break;
                case 'hypervisors' : 
                        pc_uuid = value.split('/').slice(0, -1).pop();
                        manage_pc_variables(pc_uuid, pc_elem);  
                        break;
                case 'bm_servers' :
                        pc_uuid = value.split('/').slice(0, -1).pop();
                        manage_pc_variables(pc_uuid, pc_elem);
                        break;
                case 'virtual_machines' : 
                        pc_uuid = value.split('/').slice(0, -1).pop();
                        manage_pc_variables(pc_uuid, pc_elem);
                        break;
                case 'switches' : 
                        pc_uuid = value.split('/').slice(0, -1).pop();
                        manage_pc_variables(pc_uuid, pc_elem);
                        break;
                case 'firewalls' : 
                        pc_uuid = value.split('/').slice(0, -1).pop();
                        manage_pc_variables(pc_uuid, pc_elem);
                        break;
                case 'load_balancers' : 
                        pc_uuid = value.split('/').slice(0, -1).pop();
                        manage_pc_variables(pc_uuid, pc_elem);
                        break;
                case 'other_devices' : 
                        pc_uuid = value.split('/').slice(0, -1).pop();
                        manage_pc_variables(pc_uuid, pc_elem);
                        break;
                case 'all_devices' : 
                        pc_uuid = value.split('/').slice(0, -1).pop();
                        manage_pc_variables(pc_uuid, pc_elem);
                        break;
                default:
                    console.log('');
            }          
        });

        var getDeviceName = function(device_name){
            var obj = {};
            switch(device_name){
                case 'hypervisor' :
                    obj.device_name = 'Hypervisor Statistics';
                    obj.device_api_name = 'servers';
                    return obj;
                case 'bm_server' :
                    obj.device_name = 'Bare Metal Server Statistics';
                    obj.device_api_name = 'servers';
                    return obj;
                case 'vmware' :
                    obj.device_name = 'VMware Virtual Machine Statistics';
                    obj.device_api_name = 'vmware';
                    return obj;
                case 'vcloud' :
                    obj.device_name = 'vCloud Virtual Machine Statistics';
                    obj.device_api_name = 'vcloud';
                    return obj;
                case 'openstack' :
                    obj.device_name = 'Openstack Virtual Machine Statistics';
                    obj.device_api_name = 'openstack';
                    return obj;
                case 'custom_vm' :
                    obj.device_name = 'Custom Virtual Machine Statistics';
                    obj.device_api_name = 'custom_vm';
                    return obj;
                case 'firewall' :
                    obj.device_name = 'Firewall Statistics';
                    obj.device_api_name = 'firewall';
                    return obj;
                case 'load_balancer' :
                    obj.device_name = 'LoadBalancer Statistics';
                    obj.device_api_name = 'load_balancer';
                    return obj; 
                case 'switch' :
                    obj.device_name = 'Switch Statistics';
                    obj.device_api_name = 'switch';
                    return obj; 
                default : 
                    console.log('something went wrong');
            }
        };


        $scope.popoverobj = {
            templateUrl: 'devicedetailstemplate.html',
        };

        $scope.get_observium_details = function (device_name, device) {
            var device_obj = getDeviceName(device_name);
            device.observium_details = {};
            device.message = device_obj.device_name;
            $http({
                method: "GET",
                url: '/customer/observium/'+ device_obj.device_api_name + '/' + device.uuid + '/get_device_data/'
            }).then(function (response) {
                device.observium_details = response.data;
                device.observium_details.device_data.uptime = $scope.getuptime(response.data);
            }).catch(function (error) {
                device.observium_details = null;
                device.message = $rootScope.monitoring_not_enabled_msg;
            });
        };

        $scope.show_observium_details = function (device) {
            $scope.device_details = device.observium_details;
            console.log('$scope.device_details : ', angular.toJson($scope.device_details));
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

            modalSupport.result.then(function (selectedItem) {
                $scope.selected = selectedItem;
            }, function () {
                console.log('Modal dismissed at: ' + new Date());
            });
        };

        $scope.close_modal = function(){
            modalSupport.dismiss('cancel');
        };

        $scope.show_vm_details = function(vm){
            $scope.vm_details = vm;
            if(vm.cloud.platform_type === 'OpenStack'){
                showModal('static/rest/app/client/templates/modals/openstack_vm_details.html');
            }else {
                showModal('static/rest/app/client/templates/modals/vmware_vm_details.html');
            }
        };
    }
]);

app.controller('ColoCloudPCController', [
    '$scope',
    '$rootScope',
    '$http',
    '$state',
    '$timeout',
    '$location',
    '$uibModal',
    'RestService',
    'AlertService2',
    'ValidationService',
    'colo_cloud_uuid',
    'CustomerPrivateCloud',
    'AbstractControllerFactory2',
    'private_cloud_details',
    function ($scope, $rootScope, $http, $state, $timeout, $location, $uibModal, RestService, AlertService2, ValidationService, colo_cloud_uuid, CustomerPrivateCloud, AbstractControllerFactory2, private_cloud_details) {
        console.log('in ColoCloudPCControllerwith private_cloud_details : ', angular.toJson(private_cloud_details));

        $scope.loader = true;

        if(private_cloud_details == null){
            return;
        }

        $scope.colo_cloud_uuid = angular.copy(colo_cloud_uuid);
        $scope.private_clouds = angular.copy(private_cloud_details);

        $scope.active_pc_index = '';
        $scope.active_pc = {};
        $scope.active_pc_elem_index = {index: null};
        $scope.active_pc_elem = {};
        $scope.pc_types = ['OpenStack', 'VMware', 'Custom', 'vCloud Director'];

        $scope.ctrl = AbstractControllerFactory2($scope, CustomerPrivateCloud, $rootScope.configObject);

        $scope.pc_elems = [
            {
                "name" : "summary",
                "fa" : "fa-clipboard",
                'display_name' : 'Summary',
            },
            {
                "name" : "all_devices",
                "fa" : "fa-tasks",
                'display_name' : 'All Devices',
            },
            {
                "name" : "hypervisors",
                "fa" : "fa-server",
                'display_name' : 'Hypervisors',
            },
            {
                "name" : "bm_servers",
                "fa" : "fa-laptop",
                'display_name' : 'Bare Metal Servers',
            },
            {
                "name" : "virtual_machines",
                "fa" : "fa-object-group",
                'display_name' : 'Virtual Machines',
            },
            {
                "name" : "switches",
                "fa" : "fa-sitemap",
                'display_name' : 'Switches',
            },
            {
                "name" : "firewalls",
                "fa" : "fa-fire",
                'display_name' : 'Firewalls',
            },
            {
                "name" : "load_balancers",
                "fa" : "fa-balance-scale",
                'display_name' : 'Load Balancers',
            },
            {
                "name" : "other_devices",
                "fa" : "fa-sliders",
                'display_name' : 'Other Devices',
            }
        ];

        $scope.switch_active_pc = function(cloud, index){
            console.log('in switch_active_pc');
            // $scope.loader = true;
            $scope.active_pc_index = angular.copy(index);
            $scope.active_pc = angular.copy(cloud);
            $scope.get_pc_elements($scope.active_pc, $scope.pc_elems[0], 0);
        };

        var manage_pc_variables = function(pc_uuid, pc_elem){
            for(var i = 0; i < $scope.private_clouds.length; i++){
                if($scope.private_clouds[i].uuid === pc_uuid){
                    $scope.active_pc_index = i;
                    $scope.active_pc = $scope.private_clouds[i];
                    break;
                }
            }

            for(var k = 0; k < $scope.pc_elems.length; k++){
                if($scope.pc_elems[k].name === pc_elem){
                    $scope.active_pc_elem_index.index = k;
                    $scope.active_pc_elem = $scope.pc_elems[k];
                    break;
                }
            }

        };

        $scope.get_pc_elements = function(cloud, elem, index){
            console.log('in get_pc_elements with index : ', index);
            $scope.loader = true;
            $scope.active_pc_elem = angular.copy(elem);
            $scope.active_pc_elem_index.index = angular.copy(index);
            switch(index){
                case 0 :
                        console.log('moving to summary page');
                        $state.go('colo_cloud.pc_cloud.summary',{'uuidc':cloud.uuid}, {reload : 'colo_cloud.pc_cloud.summary'});
                        break;
                case 1 :
                        $state.go('colo_cloud.pc_cloud.all_devices',{'uuidc':cloud.uuid}, {reload : 'colo_cloud.pc_cloud.all_devices'});
                        break;
                case 2 :
                        $state.go('colo_cloud.pc_cloud.hypervisors',{'uuidc':cloud.uuid}, {reload : 'colo_cloud.pc_cloud.hypervisors'});
                        break;
                case 3 :
                        $state.go('colo_cloud.pc_cloud.bm_servers',{'uuidc':cloud.uuid}, {reload : 'colo_cloud.pc_cloud.bm_servers'});
                        break;
                case 4 :
                        $state.go('colo_cloud.pc_cloud.virtual_machines',{'uuidc':cloud.uuid}, {reload : 'colo_cloud.pc_cloud.virtual_machines'});
                        break;
                case 5 :
                        $state.go('colo_cloud.pc_cloud.switches',{'uuidc':cloud.uuid}, {reload : 'colo_cloud.pc_cloud.switches'});
                        break;
                case 6 :
                        $state.go('colo_cloud.pc_cloud.firewalls',{'uuidc':cloud.uuid}, {reload : 'colo_cloud.pc_cloud.firewalls'});
                        break;
                case 7 :
                        $state.go('colo_cloud.pc_cloud.load_balancers',{'uuidc':cloud.uuid}, {reload : 'colo_cloud.pc_cloud.load_balancers'});
                        break;
                case 8 :
                        $state.go('colo_cloud.pc_cloud.other_devices',{'uuidc':cloud.uuid}, {reload : 'colo_cloud.pc_cloud.other_devices'});
                        break;
                default : 
                    console.log('something went wrong !');

            }
        };

        $scope.$watch(function () {
            return $location.path();
        }, function (value) {
            var pc_elem = value.split('/').pop();
            var pc_uuid;
            if(angular.isUndefined($scope.colo_clouds)){
                $scope.get_colo_clouds(colo_cloud_uuid, 'private_clouds');
            }

            // console.log('current state : ', angular.toJson($state.current))
            switch(pc_elem){
                case 'private_clouds' : 
                        console.log('in $location, get_pc_elements');
                        if($scope.private_clouds.length > 0){
                            $scope.get_pc_elements($scope.private_clouds[0],$scope.pc_elems[0],0);
                        }
                        break;
                case 'summary' :
                        pc_uuid = value.split('/').slice(0, -1).pop();
                        manage_pc_variables(pc_uuid, pc_elem);
                        break;
                case 'hypervisors' : 
                        pc_uuid = value.split('/').slice(0, -1).pop();
                        manage_pc_variables(pc_uuid, pc_elem);  
                        break;
                case 'bm_servers' :
                        pc_uuid = value.split('/').slice(0, -1).pop();
                        manage_pc_variables(pc_uuid, pc_elem);
                        break;
                case 'virtual_machines' : 
                        pc_uuid = value.split('/').slice(0, -1).pop();
                        manage_pc_variables(pc_uuid, pc_elem);
                        break;
                case 'switches' : 
                        pc_uuid = value.split('/').slice(0, -1).pop();
                        manage_pc_variables(pc_uuid, pc_elem);
                        break;
                case 'firewalls' : 
                        pc_uuid = value.split('/').slice(0, -1).pop();
                        manage_pc_variables(pc_uuid, pc_elem);
                        break;
                case 'load_balancers' : 
                        pc_uuid = value.split('/').slice(0, -1).pop();
                        manage_pc_variables(pc_uuid, pc_elem);
                        break;
                case 'other_devices' : 
                        pc_uuid = value.split('/').slice(0, -1).pop();
                        manage_pc_variables(pc_uuid, pc_elem);
                        break;
                case 'all_devices' : 
                        pc_uuid = value.split('/').slice(0, -1).pop();
                        manage_pc_variables(pc_uuid, pc_elem);
                        break;
                default:
                    console.log('');
            }          
        });

        var getDeviceName = function(device_name){
            var obj = {};
            switch(device_name){
                case 'hypervisor' :
                    obj.device_name = 'Hypervisor Statistics';
                    obj.device_api_name = 'servers';
                    return obj;
                case 'bm_server' :
                    obj.device_name = 'Bare Metal Server Statistics';
                    obj.device_api_name = 'servers';
                    return obj;
                case 'vmware' :
                    obj.device_name = 'VMware Virtual Machine Statistics';
                    obj.device_api_name = 'vmware';
                    return obj;
                case 'vcloud' :
                    obj.device_name = 'vCloud Virtual Machine Statistics';
                    obj.device_api_name = 'vcloud';
                    return obj;
                case 'openstack' :
                    obj.device_name = 'Openstack Virtual Machine Statistics';
                    obj.device_api_name = 'openstack';
                    return obj;
                case 'custom_vm' :
                    obj.device_name = 'Custom Virtual Machine Statistics';
                    obj.device_api_name = 'custom_vm';
                    return obj;
                case 'firewall' :
                    obj.device_name = 'Firewall Statistics';
                    obj.device_api_name = 'firewall';
                    return obj;
                case 'load_balancer' :
                    obj.device_name = 'LoadBalancer Statistics';
                    obj.device_api_name = 'load_balancer';
                    return obj; 
                case 'switch' :
                    obj.device_name = 'Switch Statistics';
                    obj.device_api_name = 'switch';
                    return obj; 
                default : 
                    console.log('something went wrong');
            }
        };


        $scope.popoverobj = {
            templateUrl: 'devicedetailstemplate.html',
        };

        $scope.get_observium_details = function (device_name, device) {
            var device_obj = getDeviceName(device_name);
            device.observium_details = {};
            device.message = device_obj.device_name;
            console.log("In Colo Cloud Observium details...");
            $http({
                method: "GET",
                url: '/customer/observium/'+ device_obj.device_api_name + '/' + device.uuid + '/get_device_data/'
            }).then(function (response) {
                device.observium_details = response.data;
                device.observium_details.device_data.uptime = $scope.getuptime(response.data);
            }).catch(function (error) {
                device.observium_details = null;
                device.message = $rootScope.monitoring_not_enabled_msg;
            });
        };

        $scope.show_observium_details = function (device) {
            $scope.device_details = device.observium_details;
            console.log('$scope.device_details : ', angular.toJson($scope.device_details));
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

            modalSupport.result.then(function (selectedItem) {
                $scope.selected = selectedItem;
            }, function () {
                console.log('Modal dismissed at: ' + new Date());
            });
        };

        $scope.close_modal = function(){
            modalSupport.dismiss('cancel');
        };
        $scope.cancel = function(){$scope.close_modal();};

        $scope.show_vm_details = function(vm){
            $scope.vm_details = vm;
            if(vm.cloud.platform_type === 'OpenStack'){
                showModal('static/rest/app/client/templates/modals/openstack_vm_details.html');
            }else {
                showModal('static/rest/app/client/templates/modals/vmware_vm_details.html');
            }
        };        

        var getDatacenters = function(colo_cloud_uuid){
            $http({
                method: "GET",
                url: '/customer/colo_cloud'
            }).then(function (response) {
                $scope.datacenters = response.data.results;
                if (colo_cloud_uuid) {
                    angular.forEach($scope.datacenters, function (value, key) {
                        if (value.uuid == colo_cloud_uuid) {
                            $scope.modal_obj.colocation_cloud = value;
                        }
                    });
                }
            }).catch(function (error) {
            });
        };

        $scope.getCloudDetails = function(url, cloud){
            $http({
                method: "GET",
                url: url
            }).then(function (response) {
                if (response.data){
                    $scope.modal_obj.hostname = response.data.hostname;
                    $scope.modal_obj.username = response.data.username;
                    $scope.modal_obj.password = response.data.password;
                    if (cloud.platform_type == 'OpenStack'){
                        $scope.modal_obj.project = response.data.project;
                        $scope.modal_obj.user_domain = response.data.user_domain;
                        $scope.modal_obj.project_domain = response.data.project_domain;
                    }
                    if (cloud.platform_type == 'vCloud Director'){
                        $scope.modal_obj.hostname = response.data.endpoint;
                        $scope.modal_obj.vcloud_org = response.data.vcloud_org;
                    }
                }
            }).catch(function (error) {
            });
        };

        $scope.setvcloudOrg = function(){
            if ($scope.modal_obj.platform_type == 'vCloud Director'){
                var parser = document.createElement('a');
                parser.href = $scope.modal_obj.hostname;
                if (parser.search.length == 0){
                    var org_name = parser.pathname.split('/');
                    org_name = org_name.filter(Boolean);
                    $scope.modal_obj.vcloud_org = org_name[org_name.length - 1];
                }
                else if (parser.search.length != 0){
                    $scope.modal_obj.vcloud_org = parser.search.split(':')[1].split('&')[0];
                }
                else{
                    $scope.modal_obj.vcloud_org = null;
                }
                console.log('vcloudorg', $scope.modal_obj.vcloud_org);
            }
        };

        $scope.add_pc = function(index){
            getDatacenters($scope.colo_cloud_uuid);
            $scope.modal_obj = {};
            $scope.modal_obj.method = 'Add';
            $scope.modal_obj.index = index;
            $scope.modal_obj.datacenter = true;
            showModal('static/rest/app/client/templates/modals/manage_pc.html');
        };

        $scope.change_password = function(new_password, confirm_password){
            $scope.new_password_err = '';
            $scope.confirm_password_err = '';
            
            if ((new_password == '') || (new_password == undefined)){
                $scope.new_password_err = 'This field is required.';
                return;
            }
            if ((confirm_password== '') || (confirm_password == undefined)){
                $scope.confirm_password_err = 'This field is required.';
                return;
            }
            if ((new_password !== confirm_password)){
                $scope.confirm_password_err = 'Passwords did not match';
                return;
            }

            if ($scope.cloud.platform_type == 'Custom'){
                return;
            }
            else if ($scope.cloud.platform_type == 'OpenStack'){
                var url = 'customer/openstack_controllers/' + $scope.cloud.uuid + '/change_password/';
            }
            else if ($scope.cloud.platform_type == 'VMware'){
                var url = 'customer/customer_vcenters/' + $scope.cloud.uuid + '/change_password/';
            }
            else if ($scope.cloud.platform_type == 'vCloud Director'){
                var url = 'customer/vclouds/instance/' + $scope.cloud.uuid + '/change_password/';
            }

            $scope.cancel();
            $scope.loader = true;
            var data = {'cloud': $scope.cloud, 'new_password': new_password};
            RestService.send_modal_data(data, url).then(function (result) {
                if (result.status == 400){
                    AlertService2.danger(result.data.data);
                }
                if (result.status ==200){
                    AlertService2.success(result.data.data);
                }
                $scope.loader = false;
            });
        }; 

        $scope.changePasswordModal = function(cloud){
            $scope.cloud = cloud;
            showModal('changePassword.html');
        };
        
        $scope.update_pc = function(cloud){
            console.log('cloud', cloud);
            $scope.modal_obj = {};
            getDatacenters();
            $scope.modal_obj.name = cloud.name;
            $scope.modal_obj.platform_type = cloud.platform_type;
            $scope.modal_obj.colocation_cloud = cloud.colocation_cloud;
            $scope.modal_obj.method = 'Save';

            if (cloud.platform_type == 'Custom'){
                showModal('static/rest/app/client/templates/modals/manage_pc.html');    
                return;
            }

            if (cloud.platform_type == 'OpenStack'){
                var url = 'customer/openstack_controllers/' + cloud.uuid + '/';
            }
            else if (cloud.platform_type == 'VMware'){
                var url = 'customer/customer_vcenters/' + cloud.uuid + '/';
            }
            else if (cloud.platform_type == 'vCloud Director'){
                var url = 'customer/vclouds/instance/' + cloud.uuid + '/';
            }
            $scope.getCloudDetails(url, cloud);
            showModal('static/rest/app/client/templates/modals/manage_pc.html');
        };

        $scope.getColoPrivateClouds = function(){
            $http({
                method: "GET",
                url: '/customer/colo_cloud/' + $scope.colo_cloud_uuid +'/private_clouds'
            }).then(function (response) {
                $scope.private_clouds = response.data;
                if ($scope.private_clouds.length>0){
                    $scope.switch_active_pc($scope.private_clouds[0], 0);
                }
            }).catch(function (error) {
                return null;
            });
        };

        $scope.manage_pc_obj = function(){
            var pc_rows = [];
            pc_rows.push({"name": "platform_type", "description": "Cloud type", "required": true});
            pc_rows.push({"name": "name" ,"description": "Name", "required": true});
            pc_rows.push({"name": "colocation_cloud", "description": "Datacenter", "required": true});

            if (($scope.modal_obj.platform_type == 'OpenStack')){
                pc_rows.push({"name": "hostname", "description": "Hostname", "required": true});
                pc_rows.push({"name": "username", "description": "Username", "required": true});
                // pc_rows.push({"name": "password", "description": "Password", "required": true});
                pc_rows.push({"name": "project", "description": "Project", "required": true});
                pc_rows.push({"name": "user_domain", "description": "User Domain", "required": true});
                pc_rows.push({"name": "project_domain", "description": "Project Domain", "required": true});
            }
            if ($scope.modal_obj.platform_type == 'VMware'){
                pc_rows.push({"name": "hostname", "description": "Hostname", "required": true});
                pc_rows.push({"name": "username", "description": "Username", "required": true});
                // pc_rows.push({"name": "password", "description": "Password", "required": true});
            }
            if ($scope.modal_obj.platform_type == 'vCloud Director'){
                pc_rows.push({"name": "hostname", "description": "Hostname", "required": true});
                pc_rows.push({"name": "username", "description": "Username", "required": true});
                // pc_rows.push({"name": "password", "description": "Password", "required": true});
                pc_rows.push({"name": "vcloud_org", "description": "Organization", "required": true});
            }

            if ((($scope.modal_obj.platform_type == 'vCloud Director') ||
                ($scope.modal_obj.platform_type == 'VMware') ||
                ($scope.modal_obj.platform_type == 'OpenStack')) && 
                ($scope.modal_obj.method=='Add')){
                
                pc_rows.push({"name": "password", "description": "Password", "required": true});
            }

            if ($scope.modal_obj.platform_type == 'Custom'){
                pc_rows.push({"name": "platform_type", "description": "Cloud type", "required": true});
                pc_rows.push({"name": "name" ,"description": "Name", "required": true});
                pc_rows.push({"name": "colocation_cloud", "description": "Datacenter", "required": true});
            }

            var valid = ValidationService.validate_data($scope.modal_obj, pc_rows);
            if (!valid.is_validated) {
                return valid;
            }

            if ($scope.modal_obj.method=='Add'){
                var url = 'customer/private_cloud/';
                $scope.cancel();
                $scope.loader = true;
                RestService.send_modal_data($scope.modal_obj, url).then(function (result) {
                    console.log('result', result);
                    if (result.status == 400){
                        if (result.data.non_field_errors){
                            AlertService2.danger(result.data.non_field_errors[0]);
                        }
                        else{
                            AlertService2.danger(result.data);
                        }
                    }
                    if (result.status ==200){
                        AlertService2.success('Private Cloud added successfully');
                        $scope.private_clouds = result.data;
                        $scope.active_cloud_index = $scope.modal_obj.index;
                        $state.reload();
                    }
                    $scope.loader = false;
                });
            }

            if ($scope.modal_obj.method=='Save'){
                var url = 'customer/private_cloud/' + $scope.active_pc.uuid + '/';
                $scope.cancel();
                $scope.loader = true;
                RestService.update_modal_data($scope.modal_obj, url).then(function (result) {
                    if (result.status == 400){
                        if (result.data.non_field_errors){
                            AlertService2.danger(result.data.non_field_errors[0]);
                        }
                        else{
                            AlertService2.danger(result.data);
                        }
                    }
                    if (result.status ==200){
                        AlertService2.success('Private Cloud updated successfully');
                        $scope.getColoPrivateClouds();
                    }
                    $scope.loader = false;
                });
            }
        };

        $scope.delete_pc = function(){
            $scope.modal_obj = {};
            $scope.modal_obj.delete_confirm_msg = "All associated devices will be deleted. Are you sure you want to delete ?";
            showModal('static/rest/app/client/templates/modals/delete_cabinet_confirm.html');
        };

        $scope.delete_object = function(){
            var url = 'customer/private_cloud/' + $scope.active_pc.uuid + '/';
            $scope.cancel();
            RestService.delete_data(url).then(function (result) {
                var success_msg = "Private Cloud deleted successfully";
                $scope.private_clouds.splice($scope.active_pc_index, 1);
                AlertService2.success(success_msg);
                if ($scope.private_clouds.length>0){
                    $scope.switch_active_pc($scope.private_clouds[0], 0);
                }
            });
        };
    }
]);

app.controller('ColoCloudPCSummaryController', [
    '$scope',
    '$rootScope',
    '$state',
    '$http',
    '$stateParams', 
    '$location',
    'AlertService2',
    'NagiosService',
    'ProxyDetailControllerService',
    'CustomerPrivateCloud',
    'AbstractControllerFactory2',
    function ($scope, $rootScope, $state, $http, $stateParams, $location, AlertService2, NagiosService, ProxyDetailControllerService, CustomerPrivateCloud, AbstractControllerFactory2) {
        console.log('in ColoCloudPCSummaryController with $stateParams : ', angular.toJson($stateParams));

        var resourceClass = CustomerPrivateCloud;
        $scope.ctrl = AbstractControllerFactory2($scope, CustomerPrivateCloud, $rootScope.configObject);
        $scope.data_availabe = true;
        var id = angular.copy($stateParams.uuidc);
        $scope.colo_cloud_id = angular.copy($stateParams.uuidp);

        $rootScope.showConsole = false;

        $scope.update_activity_log_entry = function (cloud) {
            var instance_id = '';
            var device_type = '';
            if (cloud.platform_type == "VMware") {
                device_type = 'private_cloud';
                if (cloud.proxy.proxy_fqdn){
                    instance_id = cloud.uuid;
                }
            }
            else if (cloud.platform_type == "OpenStack") {
                device_type = 'private_cloud';
                if (cloud.proxy.proxy_fqdn){
                    instance_id = cloud.uuid;
                }
            }
            if (instance_id){
                ProxyDetailControllerService.updateActivityLog(instance_id, device_type);
            }
        };

        $scope.get_cloud_proxy_link = function(cloud){
            console.log("proxy platform link", $scope.proxy_platform_link);
            if (cloud.platform_type == "VMware"){
                if (cloud.proxy.proxy_fqdn) {
                    $scope.proxy_platform_link = "#/vmware-vcenter/"+ cloud.uuid + "/";
                    $scope.proxy_link_cloud = cloud.proxy.proxy_fqdn;
                }

                console.log("proxy platform link", $scope.proxy_platform_link);
            }
            else if (cloud.platform_type == "OpenStack"){
                if (cloud.proxy.proxy_fqdn) {
                    $scope.proxy_platform_link = "#/openstack-proxy/"+ cloud.uuid + "/";
                    $scope.proxy_link_cloud = cloud.proxy.proxy_fqdn;
                }
            }
        };

        var get_vmware_vcpu_stats = function(response){
            $scope.vcpus_used = response.data.total_cpus_allocated;
            $scope.vcpus_total = response.data.total_num_cores;
            var vcpus_free = ($scope.vcpus_total - $scope.vcpus_used);
            $scope.vcpus_available = (vcpus_free < 0 ? 0 : vcpus_free);
            $scope.vcpus_percent = Math.round(($scope.vcpus_used * 100) / $scope.vcpus_total);
        };

        var get_vmware_memory_stats = function(response){
            $scope.memory_used = Math.round(response.data.total_memory_allocated / 1000);
            $scope.memory_total = Math.round(response.data.static_memory_capacity); // IN GB
            // console.log("MEMORY TOTAL==================>"+$scope.memory_total)
            var memory_free = Math.round($scope.memory_total - $scope.memory_used);
            $scope.memory_available = (memory_free < 0 ? 0 : memory_free);
            $scope.memory_percent = Math.round(($scope.memory_used * 100) / $scope.memory_total);
        };

        var get_vmware_storage_stats = function(response){
            $scope.storage_used = Math.round((response.data.disk_capacity - response.data.free_disk_space) / (1000 * 1000 * 1000)) + response.data.bm_servers_storage;
            $scope.storage_total = Math.round(response.data.static_disk_capacity) * 1000; // IN GB
            // console.log("STORAGE TOTAL==================>"+$scope.storage_total)
            var storage_free = ($scope.storage_total - $scope.storage_used);
            $scope.storage_available = (storage_free < 0 ? 0 : storage_free);
            $scope.storage_percent = Math.round(($scope.storage_used * 100) / $scope.storage_total);
        };

        var manangeVMwareSummary = function (response) {
            $scope.hypervisors = true;
            if (response.proxy.proxy_fqdn) {
                $scope.proxy_platform_link = "#/vmware-vcenter/"+ response.uuid + "/";
                $scope.proxy_link_cloud = response.proxy.proxy_fqdn;
            }
            var usage_data = $http.get('/customer/private_cloud/' + id + '/usage_data/');
            usage_data.then(function (response) {
                $scope.overview_data = response.data;

                get_vmware_vcpu_stats(response);
                get_vmware_memory_stats(response);
                get_vmware_storage_stats(response);

                $scope.vcpu_bar = ($scope.vcpus_percent < 65) ? "success" : ((65 < $scope.vcpus_percent) ? (($scope.vcpus_percent < 85) ? "warning" : "danger") : "danger");
                $scope.memory_bar = ($scope.memory_percent < 65) ? "success" : ((65 < $scope.memory_percent) ? (($scope.memory_percent < 85) ? "warning" : "danger") : "danger");
                $scope.storage_bar = ($scope.storage_percent < 65) ? "success" : ((65 < $scope.storage_percent) ? (($scope.storage_percent < 85) ? "warning" : "danger") : "danger");

                $scope.loader = false;

            }).catch(function (error, status) {
                AlertService2.danger("Unable to fetch VMware statistcs. Please contact Administrator (support@unityonecloud.com)");
                $scope.data_availabe = false;
                $scope.loader = false;
            });
        };

        var manangeVCloudSummary = function (response) {
            var usage_stats = $http.get('/customer/private_cloud/' + id + '/usage_stats/');
            usage_stats.then(function (response) {
    //                $scope.vm_summary_count = response.data.vms;
                $scope.vcpus_percent = response.data.vcpu_utilization;
                $scope.memory_percent = response.data.ram_utilization;
                $scope.storage_percent = response.data.disk_utilization;

                $scope.vcpus_total = response.data.allocated_vcpu;
                $scope.vcpus_available = response.data.available_vcpu;
                $scope.vcpus_used = response.data.configured_vcpu;

                $scope.memory_total = response.data.allocated_ram;
                $scope.memory_available = response.data.available_ram;
                $scope.memory_used = response.data.configured_ram;

                $scope.storage_total = response.data.allocated_storage_disk;
                $scope.storage_available = response.data.available_storage_disk;
                $scope.storage_used = response.data.configured_storage_disk;

                $scope.vcpu_bar = ($scope.vcpus_percent < 65) ? "success" : ((65 < $scope.vcpus_percent) ? (($scope.vcpus_percent < 85) ? "warning" : "danger") : "danger");
                $scope.memory_bar = ($scope.memory_percent < 65) ? "success" : ((65 < $scope.memory_percent) ? (($scope.memory_percent < 85) ? "warning" : "danger") : "danger");
                $scope.storage_bar = ($scope.storage_percent < 65) ? "success" : ((65 < $scope.storage_percent) ? (($scope.storage_percent < 85) ? "warning" : "danger") : "danger");

                $scope.loader = false;

            }).catch(function (error, status) {
                AlertService2.danger("Unable to fetch VCloud statistcs. Please contact Administrator (support@unityonecloud.com)");
                $scope.data_availabe = false;
                $scope.loader = false;
            });
        };

        var get_openstack_vcpu_stats = function(response){
            $scope.vcpus_used = response.data.vcpus_used;
            $scope.vcpus_total = response.data.vcpus;
            var vcpus_free = ($scope.vcpus_total - $scope.vcpus_used);
            $scope.vcpus_available = (vcpus_free < 0 ? 0 : vcpus_free);
            var vcpus_percent = ($scope.vcpus_used * 100) / $scope.vcpus_total;
            $scope.vcpus_percent = (vcpus_percent > 100 ? 100 : vcpus_percent);
        };

        var get_openstack_memory_stats = function(response){
            $scope.memory_used = Math.round(response.data.memory_mb_used / 1000);
            $scope.memory_total = Math.round(response.data.static_memory_capacity); // IN GB
            var memory_free = Math.round($scope.memory_total - $scope.memory_used);
            $scope.memory_available = (memory_free < 0 ? 0 : memory_free);
            var memory_percent = Math.round(($scope.memory_used * 100) / $scope.memory_total);
            $scope.memory_percent = (memory_percent > 100 ? 100 : memory_percent);
        };

        var get_openstack_storage_stats = function(response){
            $scope.storage_used = response.data.local_gb_used;
            $scope.storage_total = response.data.static_disk_capacity * 1000; // IN GB
            var storage_free = ($scope.storage_total - $scope.storage_used);
            $scope.storage_available = (storage_free < 0 ? 0 : storage_free);
            var storage_percent = Math.round(($scope.storage_used * 100) / $scope.storage_total);
            $scope.storage_percent = (storage_percent > 100 ? 100 : storage_percent);
        };

        var manangeOpenStackSummary = function (response) {
            $scope.hypervisors = true;
            if (response.proxy.proxy_fqdn) {
                $scope.proxy_platform_link = "#/openstack-proxy/"+ response.uuid + "/";
                $scope.proxy_link_cloud = response.proxy.proxy_fqdn;
            }
            var usage_data = $http.get('/customer/private_cloud/' + id + '/usage_data/');
            usage_data.then(function (response) {
                $scope.hypervisors = false;
                
                get_openstack_vcpu_stats(response);
                get_openstack_memory_stats(response);
                get_openstack_storage_stats(response);

                $scope.vcpu_bar = ($scope.vcpus_percent < 65) ? "success" : ((65 < $scope.vcpus_percent) ? (($scope.vcpus_percent < 85) ? "warning" : "danger") : "danger");
                $scope.memory_bar = ($scope.memory_percent < 65) ? "success" : ((65 < $scope.memory_percent) ? (($scope.memory_percent < 85) ? "warning" : "danger") : "danger");
                $scope.storage_bar = ($scope.storage_percent < 65) ? "success" : ((65 < $scope.storage_percent) ? (($scope.storage_percent < 85) ? "warning" : "danger") : "danger");

                $scope.loader = false;
            }).catch(function (error, status) {
                AlertService2.danger("Unable to fetch OpenStack statistcs. Please contact Administrator (support@unityonecloud.com)");
                $scope.data_availabe = false;
                $scope.loader = false;
            });
        };

        var manageHypervisorsSummary = function (response) {
            $scope.hyperV = true;
            $scope.hypervisors = false;
            $scope.loader = false;
        };


        var get_vms_count = function (id, platform_type) {
            if (platform_type == 'VMware') {
                var url = '/rest/vmware/migrate/';
            }
            else if (platform_type == 'vCloud Director') {
                var url = '/customer/vclouds/virtual_machines/';
            }
            else if (platform_type == 'Openstack') {
                var url = '/rest/openstack/migration/';
            }
            else {
                var url = '/rest/customer/virtual_machines/';
            }
            var params = {
                'cloud_id': id,
                'platform_type': platform_type
            };
            $http({
                url: url,
                params: params,
                method: 'GET',
            }).then(function (response) {
                $scope.vm_summary_count = response.data.count;
            });
        };

        var manageSummayData = function () {
            console.log('in manageSummayData');
            resourceClass.get({uuid: id}).$promise.then(function (response) {
                $scope.cloud = response;
                $scope.platform_type = response.platform_type;
                $scope.shared_switches = response.switch.filter(function (obj) {
                    return obj.is_shared;
                });
                $scope.shared_firewalls = response.firewall.filter(function (obj) {
                    return obj.is_shared;
                });
                $scope.shared_load_balancers = response.load_balancer.filter(function (obj) {
                    return obj.is_shared;
                });

                if (response.platform_type === "VMware") {
                    get_vms_count(id, 'VMware');
                    manangeVMwareSummary(response);
                } else if (response.platform_type === "OpenStack") {
                    get_vms_count(id, 'Openstack');
                    manangeOpenStackSummary(response);
                } else if (response.platform_type === "Custom") {
                    get_vms_count(id, 'Custom');
                    $scope.loader = false;
                } else if (response.platform_type === "vCloud Director") {
                    get_vms_count(id, 'vCloud Director');
                    manangeVCloudSummary(response);
                } else {
                    $scope.data_availabe = false;
                    manageHypervisorsSummary(response);
                }
                var stats_promise = $http.get('/customer/private_cloud/' + response.uuid + '/health_stats/');
                stats_promise.then(function (response) {
                    var data = NagiosService.parseStats(response);
                    $scope.host_data = data.host_data;
                    $scope.service_data = data.service_data;
                });

                var getCustomDevicesCount = function(){
                    $http.get('/customer/customdevices/', {params: {'uuid': id}}).then(function (response) {
                        $scope.customDevicesCount = response.data.count;
                    });
                }();
            });
        };
        manageSummayData();


        $scope.manage_request_cloud = function (result) {
            $scope.device_type = "Private Cloud";
            $scope.device_name = result.name;
            $scope.description = 
                "Device Name: " + $scope.device_name + "\n" +
                "Virtualization Platform: " + result.platform_type;
            $scope.ctrl.showModal('static/rest/app/client/templates/manage_request.html', 'ManageRequestController');
        };

    }
]);

app.controller('ColoCloudPCHypervisorsController', [
    '$scope',
    '$rootScope',
    '$http',
    '$state',
    '$stateParams',
    'CustomerULDBService',
    'AbstractControllerFactory2',
    'ProxyDetailControllerService',
    function ($scope, $rootScope, $http, $state, $stateParams, CustomerULDBService, AbstractControllerFactory2, ProxyDetailControllerService) {

        $scope.updateActivityLog = function (index, instance_id, device_type) {
            ProxyDetailControllerService.updateActivityLog(instance_id, device_type);
        };

        var id = angular.copy($stateParams.uuidc);

        $scope.hypervisors = true;
        $scope.hypervisors_loaded = false;
        $rootScope.showConsole = false;

        var manageHypervisorsData = function () {
            if ($scope.hypervisors) {
                $http.get('/customer/servers/?page_size=0').then(function (response) {
                    $scope.esxiData = [];
                    angular.forEach(response.data, function (value, key) {
                        if (value.private_cloud) {
                            if (value.private_cloud.uuid == id) {
                                $scope.esxiData.push(value);
                            }
                        }
                    });
                    $scope.$parent.loader = false;
                    $scope.hypervisors_loaded = true;
                });
            } else {
                $scope.$parent.loader = false;
                $scope.hypervisors_loaded = true;
            }
        };

        $scope.ctrl = AbstractControllerFactory2($scope, CustomerULDBService.servers(), $rootScope.configObject);

        $scope.manage_request_hypervisor = function (device_name, device_type, result) {
            $scope.device_type = device_type;
            $scope.device_name = device_name;

            if (result.private_cloud === null) {
                var cloud_name = 'N/A';
            }
            else {
                cloud_name = result.private_cloud.name;
            }
            $scope.description = '\n \n ##- Please type your description above this line -##\n' +
                "===============\n" +
                "Device Type: " + device_type + "\n" +
                "Device Name: " + device_name + "\n" +
                "System Type: " + result.instance.instance_type + "\n" +
                "Virtualization Type: " + result.instance.virtualization_type + "\n" +
                "OS Name: " + result.instance.os.full_name + "\n" +
                "Cloud Name: " + cloud_name + "\n" +
                "===============\n";
            $scope.ctrl.showModal('static/rest/app/client/templates/manage_request.html', 'ManageRequestController');
        };

        manageHypervisorsData();

        $scope.show_device_statistics = function(device_id){
            console.log('device_id : ', angular.toJson(device_id));
            $state.go('colo_cloud.pc_cloud.hypervisor', {uuidc: id, uuidcc: device_id}, {reload: false});
        };
    }
]);

app.controller('ColoCloudPCVMController', [
    '$scope',
    '$rootScope',
    '$http',
    '$state',
    '$uibModal',
    '$stateParams',
    'TaskService2',
    'AlertService2',
    'CustomerPrivateCloud',
    'AbstractControllerFactory2',
    function ($scope, $rootScope, $http, $state, $uibModal, $stateParams, TaskService2, AlertService2, CustomerPrivateCloud, AbstractControllerFactory2) {
        console.log('in ColoCloudPCVMController');

        $scope.ctrl = AbstractControllerFactory2($scope, CustomerPrivateCloud, $rootScope.configObject);

        $rootScope.showConsole = false;
        var id = angular.copy($stateParams.uuidc);

        $scope.sort = {
            sortingColumn: '',
            reverse: false
        };
        $scope.title = {
            plural: "Virtual Machines",
            singular: "Virtual Machine"
        };
        $scope.disable_action = true;
        $scope.disable_action_btn = true;
        $scope.searchKeyword = '';
        $scope.page = 1;

        $scope.setVmwarePowerState = function () {
            angular.forEach($scope.vmware_result, function (value, key) {
                if (value.state == "poweredOn") {
                    value.power = true;
                } else {
                    value.power = false;
                }
            });
        };


        $scope.setVCloudPowerState = function () {
            angular.forEach($scope.vcloud_result, function (value, key) {
                if (value.power_state == "POWERED_ON") {
                    value.power = true;
                } else {
                    value.power = false;
                }
            });
        };


        $scope.setOpenStackPowerState = function () {
            angular.forEach($scope.openstack_result, function (value, key) {
                if (value.last_known_state == "ACTIVE") {
                    value.power = true;
                } else {
                    value.power = false;
                }
            });
        };

        var defineVMwareformElements = function () {
            $scope.vmware_rows = [
                {name: 'name', description: "Name", required: true},
                {name: 'power_status', description: "Power Status", required: true, is_sort_disabled: true},
                {name: 'os_name', description: "Operating System", required: true},
                {name: 'management_ip', description: "Management IP", required: true},
            ];
        };

        var defineVCloudformElements = function () {
            $scope.vcloud_rows = [
                {name: 'name', description: "Name", required: true},
                {name: 'power_state', description: "Power Status", required: true, is_sort_disabled: true},
                {name: 'guest_os', description: "Operating System", required: true},
                {name: 'management_ip', description: "Management IP", required: true},
            ];
        };

        var defineOpenStackformElements = function () {
            $scope.openstack_rows = [
                {name: 'name', description: "Name", required: true},
                {name: 'power_status', description: "Power Status", required: true, is_sort_disabled: true},
                {name: 'operating_system', description: "Image", required: true},
                {name: 'management_ip', description: "Management IP", required: true},
            ];
        };

        var manangeVMwareVms = function (response, id) {
            $scope.uuid = id;
            $http({
                url: '/rest/vmware/migrate/virtual_machines/',
                method: 'GET',
                params: {
                    cloud_id: $scope.uuid,
                },
            }).then(function (response) {
                if (response.data.hasOwnProperty('task_id')) {
                    TaskService2.processTask(response.data.task_id, 500).then(function (result) {
                        if (result) {
                            $http({
                                url: '/rest/vmware/migrate/',
                                params: {'page': 1, 'page_size': 10, 'cloud_id': $scope.uuid},
                                method: 'GET',
                            }).then(function (response) {
                                $scope.vmware_result = response.data.results;
                                $scope.model_results = $scope.vmware_result;
                                $scope.model_count = response.data.count;
                                $scope.platform_type = 'VMware';
                                $scope.vmware_loaded = true;
                                $scope.setVmwarePowerState();
                            });
                        }

                    }).catch(function (error) {
                        AlertService2.danger("Error while fetching VMware virtual machines:");
                        $scope.vmware_result = [];
                        $scope.vmware_loaded = true;
                    });
                } else {
                    $scope.vmware_result = response.data;
                    $scope.vmware_loaded = true;
                    $scope.platform_type = response.data.platform_type;
                    $scope.setVmwarePowerState();
                }
            });
            defineVMwareformElements();
        };

        var manangeVCloudVms = function (response, id) {
            $scope.uuid = id;
            $http({
                url: '/customer/vclouds/virtual_machines/sync_vms/',
                method: 'GET',
                params: {
                    cloud_id: $scope.uuid,
                },
            }).then(function (response) {
                if (response.data.hasOwnProperty('task_id')) {
                    TaskService2.processTask(response.data.task_id, 500).then(function (result) {
                        if (result) {
                            $http({
                                url: '/customer/vclouds/virtual_machines/',
                                params: {'page': 1, 'page_size': 10, 'cloud_id': $scope.uuid},
                                method: 'GET',
                            }).then(function (response) {
                                $scope.vcloud_result = response.data.results;
                                $scope.model_results = $scope.vcloud_result;
                                $scope.model_count = response.data.count;
                                $scope.platform_type = 'vCloud Director';
                                $scope.vcloud_loaded = true;
                                $scope.setVCloudPowerState();
                            });
                        }

                    }).catch(function (error) {
                        AlertService2.danger("Error while fetching VCloud virtual machines:");
                        $scope.vcloud_result = [];
                        $scope.vcloud_loaded = true;
                    });
                } else {
                    $scope.vcloud_result = response.data;
                    $scope.vcloud_loaded = true;
                    $scope.platform_type = response.data.platform_type;
                    $scope.setVCloudPowerState();
                }
            });
            defineVCloudformElements();
        };


        $scope.get_gcp_observium_details = function (device) {
            device.observium_details = {};
            device.message = 'Device Statistics';
            $http({
                method: "GET",
                url: '/customer/observium/gcp/' + device.uuid + '/get_device_data/'
            }).then(function (response) {
                device.observium_details = response.data;
                device.observium_details.device_data.uptime = $scope.getuptime(response.data);
            }).catch(function (error) {
                device.observium_details = null;
                device.message = $rootScope.monitoring_not_enabled_msg;
            });
        };

        var manangeOpenStackVms = function (response, id) {
            $scope.openstack_loaded = false;
            $scope.uuid = id;
            $http({
                url: '/rest/openstack/migration/' + id + '/virtual_machines/',
                method: 'GET',
            }).then(function (response) {
                if (response.data.hasOwnProperty('task_id')) {
                    TaskService2.processTask(response.data.task_id, 500).then(function (result) {
                        if (result) {
                            $http({
                                url: '/rest/openstack/migration/',
                                params: {'page': 1, 'page_size': 10, 'cloud_id': $scope.uuid},
                                method: 'GET',
                            }).then(function (response) {
                                $scope.openstack_result = response.data.results;
                                console.log('$scope.openstack_result : ', angular.toJson($scope.openstack_result));
                                $scope.openstack_loaded = true;
                                $scope.platform_type = 'Openstack';
                                $scope.model_results = $scope.openstack_result;
                                $scope.model_count = response.data.count;
                                $scope.setOpenStackPowerState();
                            });
                        }
                    }).catch(function (error) {
                        AlertService2.danger("Error while fetching OpenStack virtual machines");
                        $scope.openstack_result = [];
                        $scope.openstack_loaded = true;
                    });
                } else {
                    $scope.openstack_result = response.data;
                    console.log('$scope.openstack_result : ', angular.toJson($scope.openstack_result));
                    $scope.openstack_loaded = true;
                    $scope.platform_type = response.data.platform_type;
                    $scope.setOpenStackPowerState();
                }
            });
            defineOpenStackformElements();
        };

        var manageCustomCloudVMs = function (response, id) {
            $scope.uuid = id;
            $http({
                url: '/rest/customer/virtual_machines/',
                params: {'page': 1, 'page_size': 10, 'cloud_id': $scope.uuid},
                method: 'GET',
            }).then(function (response) {
                $scope.custom_cloud_result = response.data.results;
                $scope.custom_cloud_loaded = true;
                $scope.platform_type = 'Custom';
                $scope.model_results = $scope.custom_cloud_result;
                $scope.model_count = response.data.count;
            }).catch(function (error) {
                AlertService2.danger("Error while fetching OpenStack virtual machines");
                $scope.custom_cloud_result = [];
                $scope.custom_cloud_loaded = true;
            });
        };

        $scope.get_cloud_vms = function (id, params) {
            $http.get('/customer/private_cloud_fast/' + id + '/').then(function (response) {
                $scope.cloud_type = response.data.platform_type;
                console.log("Cloud type :"+$scope.cloud_type);
                switch ($scope.cloud_type) {
                    case 'VMware' :
                        $scope.vmware_loaded = false;
                        $scope.vmware_result = undefined;
                        $scope.model_results = [];
                        $scope.model_count = 0;
                        manangeVMwareVms(response, id);
                        break;

                    case 'vCloud Director' :
                        $scope.vcloud_loaded = false;
                        $scope.vcloud_result = undefined;
                        $scope.model_results = [];
                        $scope.model_count = 0;
                        manangeVCloudVms(response, id);
                        break;

                    case 'OpenStack' :
                        $scope.openstack_loaded = false;
                        $scope.openstack_result = undefined;
                        $scope.model_results = [];
                        $scope.model_count = 0;
                        manangeOpenStackVms(response, id);
                        break;

                    case 'Custom' :
                        $scope.custom_cloud_loaded = false;
                        $scope.custom_cloud_result = undefined;
                        $scope.model_results = [];
                        $scope.model_count = 0;
                        manageCustomCloudVMs(response, id);
                        break;
                    default :
                        $scope.hyperV_result = [];
                        $scope.loader = false;
                        $scope.showNotification('No Records !!', 'danger');
                        $scope.model_results = [];
                        $scope.model_count = 0;
                        break;
                }
            });
        };

        var manageVirtualMachinesData = function () {
            $scope.loader = true;
            $scope.get_cloud_vms(id);
            $scope.loader = false;
        };

        manageVirtualMachinesData();

        $scope.get_vms = function (params) {
            $scope.pagination_results_loaded = false;
            if ($scope.platform_type == 'VMware') {
                var url = '/rest/vmware/migrate/';
            }else if ($scope.platform_type == 'vCloud Director') {
                var url = '/customer/vclouds/virtual_machines/';
            }else if ($scope.platform_type == 'Openstack') {
                var url = '/rest/openstack/migration/';
            }else {
                var url = '/rest/customer/virtual_machines/';
            }
            $http({
                url: url,
                params: params,
                method: 'GET',
            }).then(function (response) {
                if ($scope.page > 1) {
                    if ($scope.platform_type == 'VMware') {
                        $scope.vmware_result.push.apply($scope.vmware_result, response.data.results);
                        $scope.model_results = $scope.vmware_result;
                        $scope.model_count = response.data.count;
                        $scope.setVmwarePowerState();
                    }
                    else if ($scope.platform_type == 'vCloud Director') {
                        $scope.vcloud_result.push.apply($scope.vcloud_result, response.data.results);
                        $scope.model_results = $scope.vcloud_result;
                        $scope.model_count = response.data.count;
                        $scope.setVCloudPowerState();
                    }
                    else if($scope.platform_type == 'Openstack'){
                        $scope.openstack_result.push.apply($scope.openstack_result, response.data.results);
                        $scope.model_results = $scope.openstack_result;
                        $scope.model_count = response.data.count;
                        $scope.setOpenStackPowerState();
                    }
                    else {
                        $scope.custom_cloud_result.push.apply($scope.custom_cloud_result, response.data.results);
                        $scope.model_results = $scope.custom_cloud_result;
                        $scope.model_count = response.data.count;
                    }
                }
                else {
                    if ($scope.platform_type == 'VMware') {
                        $scope.vmware_result = response.data.results;
                        $scope.model_results = $scope.vmware_result;
                        $scope.model_count = response.data.count;
                        $scope.setVmwarePowerState();
                    }
                    else if ($scope.platform_type == 'vCloud Director') {
                        $scope.vcloud_result = response.data.results;
                        $scope.model_results = $scope.vcloud_result;
                        $scope.model_count = response.data.count;
                        $scope.setVCloudPowerState();
                    }else if($scope.platform_type == 'Openstack'){
                        $scope.openstack_result = response.data.results;
                        $scope.model_results = $scope.openstack_result;
                        $scope.model_count = response.data.count;
                        $scope.setOpenStackPowerState();
                    }
                    else {
                        console.log("Else block");
                    }
                }
                $scope.pagination_results_loaded = true;
            });
        };

        $scope.loadPageData = function () {
            var params = {
                'page': $scope.page + 1,
                'page_size': 10,
                'ordering': $scope.sortingColumn,
                'search': $scope.searchKeyword,
                'cloud_id': id
            };
            if (($scope.page * 10) < $scope.model_count) {
                $scope.page = $scope.page + 1;
                $scope.get_vms(params);
            }
        };

        $scope.getSearchResults = function (sk) {
            $scope.searchKeyword = sk;
            $scope.page = 1;
            if (sk.length == 0) {
                var params = {
                    'cloud_id': $scope.uuid,
                    'page': 1,
                    'page_size': 10,
                    'ordering': $scope.sortingColumn
                };
            }
            else {
                var params = {
                    'cloud_id': $scope.uuid,
                    'page': 1,
                    'page_size': 10,
                    'search': sk,
                    'ordering': $scope.sortingColumn
                };
            }
            $scope.get_vms(params);
        };
        $scope.getSortingResults = function (sort) {
            $scope.sortingColumn = sort.sortingColumn;
            $scope.page = 1;
            var params = {
                'cloud_id': $scope.uuid,
                'page': $scope.page,
                'page_size': 10,
                'ordering': sort.sortingColumn,
                'search': $scope.searchKeyword
            };
            $scope.get_vms(params);
        };

        var vm_console_sametab_vmware = function(uuid){
            $http({
                    method: "GET",
                    url: '/customer/vmware_vms/' + uuid + '/get_vm_details/'
                }).then(function (response) {

                    $scope.loader = false;
                    $scope.virtual_machine = response.data.vm_name;

                    if (response.data.ip_address) {
                        $scope.request = {
                            hostname: response.data.ip_address,
                            port: 2122,
                            // username: "root",
                            // password: ""
                        };
                    }else {
                        $scope.disableAccess = true;
                    }

                    $rootScope.showConsole = false;
                    $scope.endpoint = "/rest/vmware_vms/" + uuid + "/check_auth/";
                    var modalInstance = $uibModal.open({
                        templateUrl: 'vmAuthentcicate.html',
                        scope: $scope,
                        size: 'md',
                        controller: 'VMAuthController',
                        keyboard: false
                    });
                    modalInstance.result.then();

                }).catch(function (error) {
                    return error;
                });
        };

        var vm_console_sametab_vcloud = function(uuid){
            $http({
                    method: "GET",
                    url: '/customer/vclouds/virtual_machines/' + uuid + '/get_vm_details/'
                }).then(function (response) {

                    $scope.loader = false;
                    $scope.virtual_machine = response.data.vm_name;

                    if (response.data.ip_address) {
                        $scope.request = {
                            hostname: response.data.ip_address,
                            port: 2122,
                            // username: "root",
                            // password: ""
                        };
                    }else {
                        $scope.disableAccess = true;
                    }

                    $rootScope.showConsole = false;
                    $scope.endpoint = "/customer/vclouds/virtual_machines/" + uuid + "/check_auth/";
                    var modalInstance = $uibModal.open({
                        templateUrl: 'vmAuthentcicate.html',
                        scope: $scope,
                        size: 'md',
                        controller: 'VMAuthController',
                        keyboard: false
                    });
                    modalInstance.result.then();

                }).catch(function (error) {
                    return error;
                });
        };

        var vm_console_sametab_openstack = function(instance_id){
            $http({
                    method: "GET",
                    url: '/rest/openstack/migration/' + instance_id + '/details/'
                }).then(function (response) {

                    $scope.loader = false;
                    $scope.virtual_machine = response.data.vm_name;

                    if (response.data.ip_address) {
                        $scope.request = {
                            hostname: response.data.ip_address,
                            port: 2122,
                            // username: "root",
                            // password: ""
                        };
                    }
                    else {
                        $scope.disableAccess = true;
                    }

                    $scope.endpoint = "/rest/openstack/migration/" + instance_id + "/check_auth/";
                    var modalInstance = $uibModal.open({
                        templateUrl: 'vmAuthentcicate.html',
                        scope: $scope,
                        size: 'md',
                        controller: 'VMAuthController',
                        // backdrop  : 'static',
                        keyboard: false
                    });
                    modalInstance.result.then();

                }).catch(function (error) {
                    return error;
                });
        };

        var vm_console_sametab_custom = function(uuid){
            $http({
                    method: "GET",
                    url: '/rest/customer/virtual_machines/' + uuid + '/'
                }).then(function (response) {

                    $scope.loader = false;
                    $scope.virtual_machine = response.data.name;

                    if (response.data.management_ip) {
                        $scope.request = {
                            hostname: response.data.management_ip,
                            port: 2122,
                            // username: "root",
                            // password: ""
                        };
                    }
                    else {
                        $scope.disableAccess = true;
                    }

                    $scope.endpoint = "/rest/customer/virtual_machines/" + uuid + "/check_auth/";
                    var modalInstance = $uibModal.open({
                        templateUrl: 'vmAuthentcicate.html',
                        scope: $scope,
                        size: 'md',
                        controller: 'VMAuthController',
                        // backdrop  : 'static',
                        keyboard: false
                    });
                    modalInstance.result.then();

                }).catch(function (error) {
                    return error;
                });
        };

        $scope.vmConsoleSameTab = function (index, uuid, cloud_type) {

            switch(cloud_type){
                case 'VMware' :
                        vm_console_sametab_vmware(uuid);
                        break;
                 case 'vCloud Director' :
                        vm_console_sametab_vcloud(uuid);
                        break;
                case 'OpenStack' :
                        vm_console_sametab_openstack(uuid);
                        break;
                case 'Custom' :
                        vm_console_sametab_custom(uuid);
                        break;
                default :
                        console.log('something went wrong');

            }
        };

        $scope.powerStatusToggle = function (index, instance_id, vm_poweron_state, cloud_type) {
            $scope.power_loader = false;
            if (vm_poweron_state === true) {
                $scope.vm_power_state = 'POWER OFF';
            }
            else {
                $scope.vm_power_state = 'POWER ON';
            }

            var modalInstance;
            modalInstance= $uibModal.open({
                templateUrl: 'static/rest/app/templates/snippets/confirmation_modal.html',
                scope: $scope,
                size: 'md'
            });
            $scope.cancel = function () {
                modalInstance.close();
            };

            $scope.showVMWareAuthModal = function(){
                if (cloud_type == "VMware"){
                    $scope.vmware_auth_modal = "Please provide Vcenter credentials to " + $scope.vm_power_state +" this VM.";
                }
                else if (cloud_type == "vCloud Director"){
                    $scope.vmware_auth_modal = "Please provide vcloud credentials to " + $scope.vm_power_state +" this VM.";
                }
                else if (cloud_type == "OpenStack"){
                    $scope.vmware_auth_modal = "Please provide Openstack Controller credentials to " + $scope.vm_power_state +" this VM.";
                }
                $scope.cancel();
                modalInstance = $uibModal.open({
                    templateUrl: 'static/rest/app/templates/snippets/vmware_auth_modal.html',
                    scope: $scope,
                    size: 'md'
                });
            };

            $scope.powerToggle = function (vcenter_username, vcenter_password) {
                $scope.vcenterUsernameErr = false;
                $scope.vcenterUsernameErrMsg = null;
                $scope.vcenterPasswordErr = false;
                $scope.vcenterPasswordErrMsg = null;

                if (vcenter_username==null || vcenter_username==''){
                    $scope.vcenterUsernameErr = true;
                    $scope.vcenterUsernameErrMsg = '(Username is mandatory)';
                    return 0;
                }
                if (vcenter_password==null || vcenter_password==''){
                    $scope.vcenterPasswordErr = true;
                    $scope.vcenterPasswordErrMsg = '(Password is mandatory)';
                    return 0;
                }
                if (cloud_type === "VMware") {
                    if (vm_poweron_state === true) {
                        var url = '/rest/vmware/migrate/power_off/';
                        var msg_alert = 'VM Powered Off';
                    } else {
                        var url = '/rest/vmware/migrate/power_on/';
                        var msg_alert = 'VM Powered On';
                    }
                    $scope.vmware_result[index].powerStateLoading = true;
                } 
                else if (cloud_type === "vCloud Director") {
                    if (vm_poweron_state === true) {
                        var url = '/customer/vclouds/virtual_machines/power_off/';
                        var msg_alert = 'VM Powered Off';
                    } else {
                        var url = '/customer/vclouds/virtual_machines/power_on/';
                        var msg_alert = 'VM Powered On';
                    }
                    $scope.vcloud_result[index].powerStateLoading = true;
                }
                else if (cloud_type === "OpenStack") {
                    $scope.openstack_result[index].powerStateLoading = true;
                    if (vm_poweron_state === true) {
                        var url = '/rest/openstack/migration/power_off/';
                        var msg_alert = 'VM Powered Off';
                    } else {
                        var url = '/rest/openstack/migration/power_on/';
                        var msg_alert = 'VM Powered On';
                    }
                    $scope.loader = true;
                } else {
                    AlertService2.warning("VM not found!");
                    return;
                }
                $scope.cancel();
                return $http({
                    url: url,
                    data: {
                        'vm_id': instance_id,
                        'cloud_uuid': id,
                        'username': vcenter_username,
                        'password': vcenter_password
                    },
                    method: 'POST'
                }).then(function (response) {
                if (response.data.hasOwnProperty('task_id')) {
                    AlertService2.success('Request has been submitted. It will take few mins to complete.');
                    TaskService2.processTask(response.data.task_id, 500).then(function (result) {
                        if (result) {
                            if (result.error){
                                console.log("Error : ", result.error);
                                if (cloud_type === "VMware") {
                                    $scope.vmware_result[index].powerStateLoading = false;
                                }
                                else if (cloud_type === "vCloud Director") {
                                    $scope.vcloud_result[index].powerStateLoading = false;
                                }
                                else if(cloud_type === "OpenStack"){
                                    $scope.openstack_result[index].powerStateLoading = false;
                                }
                                AlertService2.danger(result.error);
                            }
                            if (result.success){
                                AlertService2.success(msg_alert);
                                // $scope.vmware_result[index] = result.success;
                                if (cloud_type === "VMware") {
                                    $scope.vmware_result[index] = result.success;
                                    $scope.vmware_result[index].powerStateLoading = false;
                                    $scope.setVmwarePowerState();
                                }
                                else if (cloud_type === "vCloud Director") {
                                    $scope.vcloud_result[index] = result.success;
                                    $scope.vcloud_result[index].powerStateLoading = false;
                                    $scope.setVCloudPowerState();
                                }
                                else if(cloud_type === "OpenStack"){
                                    $scope.openstack_result[index] = result.success;
                                    $scope.openstack_result[index].powerStateLoading = false;
                                    $scope.setOpenStackPowerState();
                                }
                                
                            }
                        }
                        
                    }).catch(function (error) {
                        AlertService2.danger("Server Error");
                        if (cloud_type === "VMware") {
                            $scope.vmware_result[index].powerStateLoading = false;
                        }
                        else if (cloud_type === "vCloud Director") {
                            $scope.vcloud_result[index].powerStateLoading = false;
                        }
                        else if(cloud_type === "OpenStack"){
                            $scope.openstack_result[index].powerStateLoading = false;
                        }
                    });
                } else {
                    AlertService2.success(msg_alert);
                    $scope.openstack_result[index] = response.data;
                    $scope.openstack_result[index].powerStateLoading = false;
                    $scope.setOpenStackPowerState();
                    $scope.loader = false;
                }
                }).catch(function (response) {
                    AlertService2.danger(response.data);
                    if (cloud_type === "VMware") {
                        $scope.vmware_result[index].powerStateLoading = false;
                    }
                    else if (cloud_type === "vCloud Director") {
                        $scope.vcloud_result[index].powerStateLoading = false;
                    }
                    else if(cloud_type === "OpenStack"){
                        $scope.openstack_result[index].powerStateLoading = false;
                    }
                    modalInstance.close();
                    $scope.loader = false;
                });
            };
        };

        $scope.manage_request_vm = function (device_name, device_type, result) {
            $scope.device_type = device_type;
            $scope.device_name = device_name;
            $scope.description = 
                "Device Type: " + device_type + "\n" +
                "Device Name: " + device_name + "\n" +
                "Operating System: " + result.os_name + "\n" +
                "Host Name: " + result.host_name + "\n" +
                "Management IP: " + result.management_ip + "\n" +
                "Power State: " + result.state;
            $scope.ctrl.showModal('static/rest/app/client/templates/manage_request.html', 'ManageRequestController');
        };

        $scope.manage_request_custom_vm = function (device_name, device_type, result) {
            $scope.device_type = device_type;
            $scope.device_name = device_name;
            $scope.description = 
                "Device Type: " + device_type + "\n" +
                "Device Name: " + device_name + "\n" +
                "Operating System: " + result.os.name + "\n" +
                "Management IP: " + result.management_ip;
            $scope.ctrl.showModal('static/rest/app/client/templates/manage_request.html', 'ManageRequestController');
        };

        $scope.show_device_statistics = function(device_id, platform_type){
            localStorage.setItem('platform_type', platform_type);
            if($state.$current.name == 'pc_cloud.virtual_machines'){
                $state.go('pc_cloud.virtual_machine', {uuidc: id, uuidcc: device_id}, {reload: false});
             }
             else{
                $state.go('colo_cloud.pc_cloud.virtual_machine', {uuidc: id, uuidcc: device_id}, {reload: false});
             }
            
        };

        $scope.updateTitle = function () {
            $rootScope.header = "";
            $scope.title = {
                plural: "Unity",
                singular: "Unity"
            };
            if ($scope.$parent == $scope.$root) $scope.$root.title = $scope.title;
        };
        
        $scope.closeVM = function () {
            console.log("Closing VM........");
            $scope.updateTitle();
            $rootScope.showConsole = false;
        };
    }
]);

app.controller('ColoCloudPCSwitchesController', [
    '$scope',
    '$rootScope',
    '$http',
    '$state',
    '$stateParams',
    'ProxyDetailControllerService',
    function ($scope, $rootScope, $http, $state, $stateParams, ProxyDetailControllerService) {

        $scope.updateActivityLog = function (index, instance_id, device_type) {
            ProxyDetailControllerService.updateActivityLog(instance_id, device_type);
        };
        var id = angular.copy($stateParams.uuidc);

        $scope.switches = true;
        $scope.switches_loaded = false;
        $rootScope.showConsole = false;

        var manageSwitchesData = function () {
            if ($scope.switches) {
                $http.get('/customer/switches/', {params: {'uuid': id}}).then(function (response) {
                    $scope.switchesData = response.data.results;
                    $scope.loader = false;
                    $scope.switches_loaded = true;
                });
            }else {
                $scope.loader = false;
                $scope.switches_loaded = true;
            }
        };

        manageSwitchesData();

        $scope.show_device_statistics = function(device_id){
            console.log('device_id : ', angular.toJson(device_id));
            $state.go('colo_cloud.pc_cloud.switch', {uuidc: id, uuidcc: device_id}, {reload: false});
        };
    }
]);

app.controller('ColoCloudPCFirewallsController', [
    '$scope',
    '$rootScope',
    '$http',
    '$state',
    '$stateParams',
    'ProxyDetailControllerService',
    function ($scope, $rootScope, $http, $state, $stateParams, ProxyDetailControllerService) {

        console.log('in ColoCloudPCFirewallsController');
        $scope.updateActivityLog = function (index, instance_id, device_type) {
            ProxyDetailControllerService.updateActivityLog(instance_id, device_type);
        };

        var id = angular.copy($stateParams.uuidc);

        $scope.firewalls = true;
        $scope.firewalls_loaded = false;
        $rootScope.showConsole = false;

        var manageFirewallsData = function () {
            if ($scope.firewalls) {
                $http.get('/customer/firewalls/', {params: {'uuid': id}}).then(function (response) {
                    $scope.firewallsData = response.data.results;
                    $scope.$parent.loader = false;
                    $scope.firewalls_loaded = true;
                });
            } else {
                $scope.$parent.loader = false;
                $scope.firewalls_loaded = true;
            }
        };

        manageFirewallsData();

        $scope.show_device_statistics = function(device_id){
            console.log('device_id : ', angular.toJson(device_id));
            $state.go('colo_cloud.pc_cloud.firewall', {uuidc: id, uuidcc: device_id}, {reload: false});
        };
    }
]);

app.controller('ColoCloudPCLBsController', [
    '$scope',
    '$rootScope',
    '$http',
    '$state',
    '$stateParams',
    'ProxyDetailControllerService',
    function ($scope, $rootScope, $http, $state, $stateParams, ProxyDetailControllerService) {

        console.log('in ColoCloudPCLBsController');
        $scope.updateActivityLog = function (index, instance_id, device_type) {
            ProxyDetailControllerService.updateActivityLog(instance_id, device_type);
        };

        var id = angular.copy($stateParams.uuidc);

        $scope.load_balancers = true;
        $scope.load_balancers_loaded = false;
        $rootScope.showConsole = false;

        var manageLoadBalancersData = function () {
            console.log('$scope.load_balancers : ', $scope.load_balancers);
            if ($scope.load_balancers) {
                $http.get('/customer/load_balancers/', {params: {'uuid': id}}).then(function (response) {
                    $scope.loadBalancersData = response.data.results;
                    $scope.loader = false;
                    $scope.load_balancers_loaded = true;
                });
            } else {
                $scope.loader = false;
                $scope.load_balancers_loaded = true;
            }
        };

        manageLoadBalancersData();

        $scope.show_device_statistics = function(device_id){
            console.log('device_id : ', angular.toJson(device_id));
            $state.go('colo_cloud.pc_cloud.load_balancer', {uuidc: id, uuidcc: device_id}, {reload: false});
        };
    }
]);

app.controller('ColoCloudPCCustomDevicesController', [
    '$scope',
    '$rootScope',
    '$http',
    '$state',
    '$stateParams',
    '$uibModal',
    'AlertService2',
    function ($scope, $rootScope, $http, $state, $stateParams, $uibModal, AlertService2) {

        console.log('in ColoCloudPCCustomDevicesController');

        $scope.page = 1;
        $scope.page_size = 10;
        $scope.searchkey = '';
        $scope.sortkey = '';

        $scope.sort = {
            sortingColumn: '',
            reverse: false
        };

        $scope.loadPageData = function () {
            var params = {
                'uuid': id,
                'ordering': $scope.sortingColumn,
                'page': $scope.page + 1,
                'page_size': $scope.page_size,
                'search': $scope.searchKeyword,
            };
            if (($scope.page * $scope.page_size) < $scope.totalCustomDevices) {
                $scope.page = $scope.page + 1;
                manageCustomDevicesData(params);
            }
        };

        $scope.getSortingResults = function (sort) {
            $scope.sortingColumn = sort.sortingColumn;
            $scope.sortkey = sort.sortingColumn;
            $scope.page = 1;
            var params = {
                'uuid': id,
                'page': $scope.page,
                'ordering': sort.sortingColumn,
                'search': $scope.searchKeyword
            };
            manageCustomDevicesData(params);
        };

        $scope.getSearchResults = function (sk) {
            $scope.searchKeyword = sk;
            $scope.page = 1;
            var params = {
                'uuid': id,
                'page': $scope.page,
                'search': $scope.searchKeyword,
                'ordering': $scope.sortingColumn
            };
            manageCustomDevicesData(params);
        };

        var id = angular.copy($stateParams.uuidc);
        $rootScope.showConsole = false;

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
        $scope.close_modal = function(){
            modalSupport.dismiss('cancel');
        };

        var manageCustomDevicesData = function (params) {
            $scope.loader = true;
            $http.get('/customer/customdevices/', {'params': params}).then(function (response) {
                $scope.totalCustomDevices = response.data.count;
                if ($scope.page===1){
                    $scope.custom_devices_result = response.data.results;
                }
                else{
                    for (var i=0; i<response.data.results.length; i++){
                        $scope.custom_devices_result.push(response.data.results[i]);   
                    }
                }
                if ($scope.custom_devices_result.length>0){
                    for (var i=0; i<$scope.custom_devices_result.length; i++){
                        $scope.get_uptime_details($scope.custom_devices_result[i]);
                    }
                }
                $scope.loader = false;
            });
        };

        $scope.customdevicedetailspopoverobj = {
            templateUrl: 'customdevicedetailstemplate.html',
        };

        $scope.get_uptime_details = function(device){
            if (device.details===undefined){
                var url = '/customer/uptimerobot/' + device.uptime_robot_id + '/get_device_uptime_data';
                $http.get(url).then(function (response) {
                    device.details = response.data;
                }).catch(function (error) {
                    AlertService2.danger(error.data);
                });
            }
        };
        $scope.show_uptime_details = function(device){
            $scope.device_details = device.details; 
        };
        $scope.show_customdevice_details = function(device){
            $scope.customdevice = device; 
            showModal('static/rest/app/client/templates/modals/customdevice_detail.html');
        };
        manageCustomDevicesData({'uuid': id});
    }
]);

app.controller('ColoCloudPCAllDevicesController', [
    '$scope',
    '$rootScope',
    '$http',
    '$state',
    '$stateParams',
    '$uibModal',
    'AlertService2',
    function ($scope, $rootScope, $http, $state, $stateParams, $uibModal, AlertService2) {

        console.log('in ColoCloudPCAllDevicesController with : ', $stateParams);

        // Please refer static/rest/app/client/templates/partials/devices_overview.html
        // It is refering AllDevicesController, consider making changes there
        // This contoller has nothing important

        $scope.tabname = 'all_devices';

        var id = angular.copy($stateParams.uuidc);
        var manageCustomDevicesData = function () {
            $scope.loader = true;
            $http.get('/customer/customdevices/', {params: {'uuid': id}}).then(function (response) {
                $scope.totalCustomDevices = response.data.count;
                $scope.custom_devices_result = response.data.results;

                if ($scope.custom_devices_result.length>0){
                    for (var i=0; i<$scope.custom_devices_result.length; i++){
                        $scope.get_uptime_details($scope.custom_devices_result[i]);
                    }
                }

                $scope.loader = false;
            });
        };

        $scope.customdevicedetailspopoverobj = {
            templateUrl: 'customdevicedetailstemplate.html',
        };

        $scope.get_uptime_details = function(device){
            var url = '/customer/uptimerobot/' + device.uptime_robot_id + '/get_device_uptime_data';
            $http.get(url).then(function (response) {
                device.details = response.data;
            }).catch(function (error) {
                AlertService2.danger(error.data);
            });
        };

        $scope.show_uptime_details = function(device){
            $scope.device_details = device.details;
        };

        $scope.show_observium_details = function(device){
            $scope.device_details = device.observium_details ? device.observium_details : null;
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
        $scope.close_modal = function(){
            modalSupport.dismiss('cancel');
        };
        $scope.show_customdevice_details = function(device){
            $scope.customdevice = device; 
            showModal('static/rest/app/client/templates/modals/customdevice_detail.html');
        };
        manageCustomDevicesData();

    }
]);

app.controller('CustomerColoCloudBMServerController', [
    '$scope',
    '$http',
    '$state',
    '$location',
    '$uibModal',
    '$rootScope',
    '$stateParams',
    'AlertService2',
    function ($scope, $http, $state, $location, $uibModal, $rootScope, $stateParams, AlertService2) {

        $scope.loader = true;
        $scope.page = 1;
        $scope.page_size = 10;
        var params = {
            'page': $scope.page,
            'page_size': $scope.page_size,
            'uuid': $stateParams.uuidc
        };

        $scope.searchkey = '';
        $scope.sortkey = '';

        $scope.sort = {
            sortingColumn: '',
            reverse: false
        };

        $scope.getSortingResults = function (sort) {
            $scope.sortingColumn = sort.sortingColumn;
            $scope.sortkey = sort.sortingColumn;
            $scope.page = 1;
            var params = {
                'page': $scope.page,
                'ordering': sort.sortingColumn,
                'search': $scope.searchKeyword,
                'uuid': $stateParams.uuidc
            };
            get_bm_servers(params);
        };

        $scope.getSearchResults = function (sk) {
            $scope.searchKeyword = sk;
            $scope.page = 1;
            var params = {
                'page': $scope.page,
                'search': $scope.searchKeyword,
                'ordering': $scope.sortingColumn,
                'uuid': $stateParams.uuidc
            };
            get_bm_servers(params);
        };

        $scope.bm_server_rows = [
            {
                name: "name", description: "Server"
            },
            {
                name: "power_status", description: "Power Status", is_sort_disabled: true
            },
            {
                name: "os", description: "Operating System", is_sort_disabled: true
            },
            {
                name: "management_ip", description: "Management IP", is_sort_disabled: true
            },
        ];

        var get_bm_servers = function(params){
            var url = '/customer/bm_servers/';
            $http.get(url, {'params': params}).then(function (response) {
                if ($scope.page===1){
                    $scope.bm_server_result = {};
                    $scope.bm_server_result = response.data;
                }else{
                    for (var i=0; i<response.data.length; i++){
                        $scope.bm_server_result.results.push(response.data[i]);
                    }
                }
                $scope.loader = false;
            }).catch(function(error){
                console.log('error : ', angular.toJson(error));
                $scope.loader = false;
            });
        };
        get_bm_servers(params);

        // $scope.loadPageData = function () {
        //     console.log('in loadPageData');
        //     var params = {
        //         'page': $scope.page + 1,
        //         'page_size': $scope.page_size,
        //     };
        //     if (($scope.page * $scope.page_size) < $scope.bm_server_result.count) {
        //         $scope.page = $scope.page + 1;
        //         get_bm_servers(params);
        //     }
        // };

        // $http.get('/customer/bm_servers/').then(function (response) {
        //     $scope.bm_server_result = {}
        //     $scope.bm_server_result.results = []
        //     angular.forEach(response.data.results, function (value, key) {
        //         if (value.server.private_cloud) {
        //             if (value.server.private_cloud.uuid == $stateParams.uuidc) {
        //                 $scope.bm_server_result.results.push(value);
        //             }
        //         }
        //     });
        //     $scope.loader = false;
        // });

        $scope.show_server_statistics = function (device_id) {
            localStorage.setItem('isBareMetalStats', true);
            if($state.$current.name == 'pc_cloud.bm_servers'){
                $state.go('pc_cloud.hypervisor', {uuidc: $stateParams.uuidc, uuidcc: device_id}, {reload: false});
            }
            else{
                $state.go('colo_cloud.pc_cloud.hypervisor', {uuidc: $stateParams.uuidc, uuidcc: device_id}, {reload: false});
            }
        };

        // Mange by creating support request
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

            modalSupport.result.then(function (selectedItem) {
                $scope.selected = selectedItem;
            }, function () {
            });
        };

        $scope.manage_request = function (name, bm_server) {
            $scope.device_type = "Bare Metal Server";
            $scope.device_name = name;
            $scope.description = 
                "Bare Metal Server: " + name + "\n" +
                "Management IP: " + bm_server.management_ip;
            showModal('static/rest/app/client/templates/manage_request.html', 'ManageRequestController');

        };

        $scope.get_bm_server_controller_power_stats = function (device) {
            if (device.bmc_type == "IPMI" || device.bmc_type == "DRAC"){
                device.controller_message = device.bmc_type + ' Stats';
                device.power_on = null;
                device.action_support = null;
                device.action_message = 'Start Server';
                $http({
                    method: "GET",
                    url: '/customer/bm_servers/'+ device.uuid + '/power_status/',
                }).then(function (response) {
                    console.log("Response from IPmi Sanatan:" + angular.toJson(response.data));
                    var response_power_str = response.data;
                    response_power_str = response_power_str.split('\n');
                    if(response_power_str[0] === 'Chassis Power is on'){
                        device.power_on = true;
                        device.action_support = 'power_off';
                        device.action_message = 'Stop Server';
                        device.controller_message = device.bmc_type + ' Stats';
                    }else if(response_power_str[0] === 'Chassis Power is off'){
                        device.controller_message = 'Server Powered off';
                        device.power_on = false;
                        device.action_support = 'power_on';
                        device.action_message = 'Start Server';
                    }
                    else{
                        device.action_support = null;
                        device.action_message = 'Device not Configured with IPMI/DRAC';
                        device.controller_message = 'Device not Configured with IPMI/DRAC';
                    }
                }).catch(function (error) {
                    device.action_support = null;
                    device.action_message = 'Device not Configured with IPMI/DRAC';
                    device.controller_message = 'Device not Configured with IPMI/DRAC';
                });
            }
            else{
                device.action_support = null;
                device.action_message = 'Device not Configured with IPMI/DRAC';
                device.controller_message = 'Device not Configured with IPMI/DRAC';
            }
        };

        $scope.manage_bmserver_actions = function(device){
            $scope.selected = device;
            $scope.close_confirm = function(){
                modalSupport.dismiss('cancel');
            };

            if(device.power_on == true){
                $scope.bm_server_power_state = "Power Off";
            }
            else{
                $scope.bm_server_power_state = "Power On";
            }
            $scope.ipmi_username = device.bm_controller.username;
            modalSupport = $uibModal.open({
                template: '<div class="modal-content">' +
                    '<div class="modal-header">' +
                    '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' +
                    '<h4 class="modal-title">&nbsp; Bare Metal Server</h4>' +
                    '</div>' +
                    '<div class="modal-body">Are you sure you want to continue with this action?</div>' +
                    '<div class="modal-footer modal-button">' +
                    '<button class="btn btn-cancel" type="button" ng-click="close_confirm()">No</button>' +
                    '<button class="btn btn-default" type="submit" ng-click="showIPMIAuthModal()">Yes</button>' +
                    '</div>' +
                    '</div>',
                scope: $scope,
            });

            modalSupport.result.then(function (selectedItem) {
                $scope.selected = selectedItem;
            }, function () {
            });

            $scope.showIPMIAuthModal = function(){
                $scope.close_confirm();
                modalSupport = $uibModal.open({
                    templateUrl: 'static/rest/app/templates/snippets/ipmi_auth_modal.html',
                    scope: $scope,
                    size: 'md'
                });
            };
            $scope.confirm_action = function(ipmi_username, ipmi_password){

                $scope.ipmiUsernameErr = false;
                $scope.ipmiUsernameErrMsg = null;
                $scope.ipmiPasswordErr = false;
                $scope.ipmiPasswordErrMsg = null;

                if (ipmi_username==null || ipmi_username==''){
                    $scope.ipmiUsernameErr = true;
                    $scope.ipmiUsernameErrMsg = '(Username is mandatory)';
                    return 0;
                }
                if (ipmi_password==null || ipmi_password==''){
                    $scope.ipmiPasswordErr = true;
                    $scope.ipmiPasswordErrMsg = '(Password is mandatory)';
                    return 0;
                }
                $scope.close_confirm();
                $scope.loader = true;
                $http({
                    method: "POST",
                    data: {
                        'ipmi_username': ipmi_username,
                        'ipmi_password': ipmi_password
                    },
                    url: '/customer/bm_servers/'+ device.uuid + '/check_password/',
                }).then(function (response) {
                    console.log("Password validated Successfully");
                    $scope.ipmiPowerToggle();
                }).catch(function (error){
                    $scope.loader = false;
                    AlertService2.danger("Invalid Credential.");
                });
            };

            $scope.ipmiPowerToggle = function(){
                var msg = "";
                $http({
                    method: "POST",
                    url: '/customer/bm_servers/'+ device.uuid + '/' + device.action_support + '/',
                }).then(function (response) {
                    var response_power_str = response.data;
                    response_power_str = response_power_str.split('\n');
                    if(response_power_str[0] === 'Chassis Power Control: Up/On'){
                        device.power_on = true;
                        device.action_support = 'power_off';
                        device.action_message = 'Stop Server';
                        device.controller_message = device.bmc_type + ' Stats';
                        msg = "Started <b>" + device.server.name + "</b> Successfully";

                    }else{
                        device.power_on = false;
                        device.action_support = 'power_on';
                        device.action_message = 'Start Server';
                        device.controller_message = 'Server Powered off';
                        msg = "Stopped <b>" + device.server.name + "</b> Successfully";
                    }
                    $scope.loader = false;
                    AlertService2.success(msg);
                }).catch(function (error) {
                    $scope.loader = false;
                    AlertService2.success("Something went wrong !... Please try again later");
                });
            };
        };

        $scope.show_controller_statistics = function(device_id, bmc_type){
            if (bmc_type == "IPMI"){
                $state.go('colo_cloud.pc_cloud.bm_server_ipmi', {uuidc: $stateParams.uuidc, uuidcc: device_id}, {reload: false});
            }
            else{
                $state.go('colo_cloud.pc_cloud.bm_server_drac', {uuidc: $stateParams.uuidc, uuidcc: device_id}, {reload: false});
            }
        };

        $scope.show_full_details = function(server){
            $scope.bm_details = angular.copy(server);
            showModal('baremetal_full_details.html');
        };

        $scope.cancel = function(){
            modalSupport.dismiss('cancel');
        };

        $scope.get_observium_details = function (device_type, device) {
            device.observium_details = {};
            device.message = 'Bare Metal Statistics';
            $http({
                method: "GET",
                url: '/customer/observium/servers/' + device.uuid + '/get_device_data/'
            }).then(function (response) {
                device.observium_details = response.data;
                device.observium_details.device_data.uptime = $scope.getuptime(response.data);
            }).catch(function (error) {
                device.observium_details = null;
                device.message = $rootScope.monitoring_not_enabled_msg;
            });
        };

        $scope.show_observium_details = function (device) {
            $scope.device_details = device.observium_details;
        };

        // For Xterm Access
        $scope.xtermConsoleSameTab = function (index, instance_id) {
            $scope.loader = true;
            $http({
                method: "GET",
                url: '/customer/bm_servers/' + instance_id
            }).then(function (response) {

                $scope.loader = false;
                $scope.device_name = response.data.server.name;

                if (response.data.management_ip) {
                    $scope.request = {
                        hostname: response.data.management_ip,
                        port: parseInt(response.data.port),
                    };
                }
                else {
                    $scope.disableAccess = true;
                }

                $rootScope.showConsole = false;
                $scope.endpoint = "/customer/bm_servers/" + instance_id + "/check_auth/";
                var modalInstance = $uibModal.open({
                    templateUrl: 'xtermAuthenticate.html',
                    scope: $scope,
                    size: 'md',
                    controller: 'VMAuthController',
                    keyboard: false
                });
                modalInstance.result.then();

            }).catch(function (error) {
                return error;
            });
        };

        $scope.updateTitle = function () {
            $rootScope.header = "";
            $scope.title = {
                plural: "Unity",
                singular: "Unity"
            };
            if ($scope.$parent == $scope.$root) $scope.$root.title = $scope.title;
        };

        $scope.$root.title = $scope.title;

        $scope.closeVM = function () {
            console.log("Closing VM........");
            $scope.updateTitle();
            $rootScope.showConsole = false;
        };
    }
]);
