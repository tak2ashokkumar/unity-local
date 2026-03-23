var app = angular.module('uldb');

app.controller('AllDevicesController', [
    '$scope',
    '$rootScope',
    '$state',
    '$timeout',
    '$http',
    '$uibModal',
    'TaskService3',
    '$stateParams',
    'AlertService2',
    function ($scope, $rootScope, $state, $timeout, $http, $uibModal, TaskService3, $stateParams, AlertService2) {

        console.log('in AllDevicesController');


        $scope.get_firewalls = function () {
            $http.get('/customer/firewalls/', {params: {'page': 1, 'page_size': 0, 'uuid': id}}).then(function (response) {
                $scope.firewalls = response.data;
                $scope.firewalls_loaded = true;
            }).catch(function(){
                $scope.firewalls_loaded = true;
            });
        };

        $scope.get_load_balancers = function () {
            $http.get('/customer/load_balancers/', {params: {'page': 1, 'page_size': 0, 'uuid': id}}).then(function (response) {
                $scope.load_balancers = response.data;
                $scope.load_balancers_loaded = true;
            }).catch(function(){
                $scope.load_balancers_loaded = true;
            });
        };

        $scope.get_switches = function () {
            $http.get('/customer/switches/', {params: {'page': 1, 'page_size': 0, 'uuid': id}}).then(function (response) {
                $scope.switches = response.data;
                $scope.switches_loaded = true;
            }).catch(function(){
                $scope.switches_loaded = true;
            });
        };

        $scope.get_hypervisors = function () {
            $http.get('/customer/servers/',{params: {'page': 1, 'page_size': 0, 'uuid': id}}).then(function (response) {
                $scope.hypervisors = response.data;
                // console.log('in hypervisors : ', angular.toJson(response.data));
                $scope.hypervisors_loaded = true;
            }).catch(function(){
                $scope.hypervisors_loaded = true;
            });
        };

        $scope.get_baremetals = function () {
            $http.get('/customer/bm_servers/',{params: {'page': 1, 'page_size': 0, 'uuid': id}}).then(function (response) {
                $scope.baremetals = response.data;
                $scope.baremetals_loaded = true;
            }).catch(function(){
                $scope.baremetals_loaded = true;
            });
        };

        $scope.get_other_devices = function () {
            $http.get('/customer/customdevices/', {params: {'page': 1, 'page_size': 0,'uuid': id}}).then(function (response) {
                $scope.custom_devices = response.data;
                $scope.custom_devices_loaded = true;
                console.log("$scope.other_devices : ", angular.toJson($scope.custom_devices));
            }).catch(function(){
                $scope.custom_devices_loaded = true;
            });
        };

        var get_vmware_vms = function (id) {
            $http({
                url: '/rest/vmware/migrate/',
                params: {'page': 1, 'page_size': 0, 'cloud_id': id},
                method: 'GET',
            }).then(function (response) {
                $scope.virtual_machines = angular.copy(response.data);
                $timeout(function(){
                   $scope.virtual_machines_loaded = true;
                },1000);
            }).catch(function (error) {
                AlertService2.danger("Error while fetching Virtual machines");
                $timeout(function(){
                   $scope.virtual_machines_loaded = true;
                },1000);
            });
        };

        var get_vcloud_vms = function (id) {
            $http({
                url: '/customer/vclouds/virtual_machines/',
                params: {'page': 1, 'page_size': 0, 'cloud_id': id},
                method: 'GET',
            }).then(function (response) {
                $scope.virtual_machines = angular.copy(response.data);
                $timeout(function(){
                   $scope.virtual_machines_loaded = true;
                },1000);
            }).catch(function (error) {
                AlertService2.danger("Error while fetching Virtual machines");
                $timeout(function(){
                   $scope.virtual_machines_loaded = true;
                },1000);
            });
        };

        var get_openstack_vms = function (id) {
            $http({
                url: '/rest/openstack/migration/',
                params: {'page': 1, 'page_size': 0, 'cloud_id': id},
                method: 'GET',
            }).then(function (response) {
                $scope.virtual_machines = angular.copy(response.data);
                $timeout(function(){
                   $scope.virtual_machines_loaded = true;
                },1000);
            }).catch(function (error) {
                AlertService2.danger("Error while fetching Virtual machines");
                $timeout(function(){
                   $scope.virtual_machines_loaded = true;
                },1000);
            });
        };

        var get_custom_cloud_vms = function (id) {
            $http({
                url: '/rest/customer/virtual_machines/',
                params: {'page': 1, 'page_size': 0, 'cloud_id': id},
                method: 'GET',
            }).then(function (response) {
                $scope.virtual_machines = angular.copy(response.data);
                $timeout(function(){
                   $scope.virtual_machines_loaded = true;
                },1000);
            }).catch(function (error) {
                AlertService2.danger("Error while fetching Virtual machines");
                $timeout(function(){
                   $scope.virtual_machines_loaded = true;
                },1000);
            });
        };

        $scope.get_vm_types = function(){
            $http.get('/customer/private_cloud_fast/' + id + '/').then(function (response) {
                $scope.cloud_platform_type = response.data.platform_type;
                $scope.virtual_machines_loaded = false;
                switch ($scope.cloud_platform_type) {
                    case 'VMware' :
                        get_vmware_vms(id);
                        break;
                    case 'vCloud Director' :
                        get_vcloud_vms(id);
                        break;
                    case 'OpenStack' :
                        get_openstack_vms(id);
                        break;
                    case 'Custom' :
                        get_custom_cloud_vms(id);
                        break;
                    default :
                        $scope.showNotification('No Records !!', 'danger');
                        break;
                }
                $scope.get_other_devices();
                $scope.get_hypervisors();
                $scope.get_switches();
                $scope.get_load_balancers();
                $scope.get_firewalls();
                $scope.get_baremetals();

            }).catch(function(){
                $scope.get_other_devices();
                $scope.get_hypervisors();
                $scope.get_switches();
                $scope.get_load_balancers();
                $scope.get_firewalls();
                $scope.get_baremetals();
            });
        };
        
        var state = $state.current.name.split('.')[0];
        console.log('state : ', state);
        console.log('$stateParams : ', angular.toJson($stateParams));
        var id = '';
        if(state === 'private_cloud'){
            id = $stateParams.uuidp;
        }else if(state === 'pc_cloud'){
            id = $stateParams.uuidc;
        }
        else if(state === 'colo_cloud'){
            id = $stateParams.uuidc;
        }

        $scope.get_vm_types();
        $http({
            url: '/customer/private_cloud/' + id + '/update_alerts_count/',
            method: 'GET',
        }).then(function (response) {
            TaskService3.processTask(response.data.task_id, 500).then(function (result) {
                $scope.get_vm_types();
            }).catch(function (error) {
                console.log("Alert count update celery task failed");
            });
        }).catch(function (error) {
            console.log("Error while fetching Virtual machines");
        });

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

        $scope.deviceAlertsModal = function(device_type, device_alerts){
            $scope.alert_device_name = device_type;
            $scope.device_alerts_popup = device_alerts;
            showModal('static/rest/app/client/templates/modals/device_alert_detail.html');
        };

        var get_device_alerts = function (url, device, device_type) {
            $http({
                method: "GET",
                url: url,
            }).then(function (response) {
                device.failed_alerts = response.data;
                device.failed_alerts_count = response.data.length();
                $scope.deviceAlertsModal(device_type, device.failed_alerts);
            }).catch(function (error) {
                device.failed_alerts = {};
                $scope.deviceAlertsModal(device_type, device.failed_alerts);
            });
        };

        $scope.getDeviceAlerts = function(device_type, device_id, device){
            var status_url = '/?alert_type=failed';
            var device_alerts_url = 'customer/observium/' + device_type + '/' + device_id + '/get_alert_data' + status_url;
            get_device_alerts(device_alerts_url, device, device_type);
        };

        $scope.show_device_stats = function(device_id, device_type){

            localStorage.removeItem('vm_platform_type');
            localStorage.removeItem('platform_type');
            var cloud_name = $state.current.name.split('.').slice(1, -1)[0];
            localStorage.setItem('isAllDevicesStats', true);

            var target_state = '';

            switch(device_type){
                case 'vmwarevm': 
                    if(state === 'private_cloud'){
                        localStorage.setItem('vm_platform_type', 'VMware');
                        target_state = 'private_cloud.'+ cloud_name + '.virtual_machine';
                        $state.go(target_state, {uuidp: id, uuidc:device_id}, {reload: false});
                    }else if(state === 'pc_cloud'){
                        localStorage.setItem('platform_type', 'vmware');
                        $state.go('pc_cloud.virtual_machine', {uuidc: id, uuidcc: device_id}, {reload: false});
                    }
                    else if(state === 'colo_cloud'){
                        localStorage.setItem('platform_type', 'vmware');
                        $state.go('colo_cloud.pc_cloud.virtual_machine', {uuidc: id, uuidcc: device_id}, {reload: false});
                    }
                    break;
                case 'vcloudvm': 
                    if(state === 'private_cloud'){
                        localStorage.setItem('vm_platform_type', 'vcloud');
                        target_state = 'private_cloud.'+ cloud_name + '.virtual_machine';
                        $state.go(target_state, {uuidp: id, uuidc:device_id}, {reload: false});
                    }else if(state === 'pc_cloud'){
                        localStorage.setItem('platform_type', 'vcloud');
                        $state.go('pc_cloud.virtual_machine', {uuidc: id, uuidcc: device_id}, {reload: false});
                    }
                    else if(state === 'colo_cloud'){
                        localStorage.setItem('platform_type', 'vcloud');
                        $state.go('colo_cloud.pc_cloud.virtual_machine', {uuidc: id, uuidcc: device_id}, {reload: false});
                    }
                    break;
                case 'openstackvm': 
                    if(state === 'private_cloud'){
                        localStorage.setItem('vm_platform_type', 'Openstack');
                        target_state = 'private_cloud.'+ cloud_name + '.virtual_machine';
                        $state.go(target_state, {uuidp: id, uuidc:device_id}, {reload: false});
                    }else if(state === 'pc_cloud'){
                        localStorage.setItem('platform_type', 'openstack');
                        $state.go('pc_cloud.virtual_machine', {uuidc: id, uuidcc: device_id}, {reload: false});
                    }
                    else if(state === 'colo_cloud'){
                        localStorage.setItem('platform_type', 'openstack');
                        $state.go('colo_cloud.pc_cloud.virtual_machine', {uuidc: id, uuidcc: device_id}, {reload: false});
                    }
                    break;
                case 'customvm':
                    if(state === 'private_cloud'){
                        localStorage.removeItem('vm_platform_type'); 
                        target_state = 'private_cloud.'+ cloud_name + '.virtual_machine';
                        $state.go(target_state, {uuidp: id, uuidc:device_id}, {reload: false});
                    }else if(state === 'pc_cloud'){
                        localStorage.removeItem('platform_type');
                        $state.go('pc_cloud.virtual_machine', {uuidc: id, uuidcc: device_id}, {reload: false});
                    }
                    else if(state === 'colo_cloud'){
                        localStorage.removeItem('platform_type');
                        $state.go('colo_cloud.pc_cloud.virtual_machine', {uuidc: id, uuidcc: device_id}, {reload: false});
                    }
                    break;
                default :
                    if(state === 'private_cloud'){
                        target_state = 'private_cloud.' + cloud_name + '.' + device_type;
                        $state.go(target_state, {uuidp: id, uuidc:device_id}, {reload: false});
                    }else if(state === 'pc_cloud'){
                        target_state = 'pc_cloud.' + device_type;
                        $state.go(target_state, {uuidc: id, uuidcc: device_id}, {reload: false});
                    }
                    else if(state === 'colo_cloud'){
                        target_state = 'colo_cloud.pc_cloud.' + device_type;
                        $state.go(target_state, {uuidc: id, uuidcc: device_id}, {reload: false});
                    }

            }
        };
    }
]);


app.controller('DevicesDashboardController', [
    '$scope',
    '$rootScope',
    '$state',
    '$timeout',
    '$http',
    '$uibModal',
    '$stateParams',
    'AlertService2',
    function ($scope, $rootScope, $state, $timeout, $http, $uibModal, $stateParams, AlertService2) {

        console.log('in DevicesDashboardController');

        $scope.loader = true;

        var obj = {};
        var dashboards = [];
        dashboards.push(obj);
        $scope.dashboards = angular.copy(dashboards);

        $rootScope.view_mode = true;
        $scope.group_position_changing = false;

        $rootScope.toggle_mode = function(){
            $rootScope.view_mode = !$rootScope.view_mode;
        };

        $scope.getuptime = function (device_details) {
            if (device_details.status == 0) {
                var downtime = 0;
                if (device_details.device_category == 'customdevice'){
                    downtime = device_details.downtime;
                }
                else{
                    var currenttime = new Date();
                    var lastrebootedtime = new Date(Number(device_details.last_rebooted) * 1000);
                    var totaltime = (currenttime - lastrebootedtime) / 1000;
                    downtime = parseInt(totaltime - device_details.uptime);
                }
                return downtime;

            } 
            else if(device_details.status == 1) {
                return device_details.uptime;
            }
            else{
                return undefined;
            }
        };

        $scope.groups = [];

        $scope.get_all_groups = function(){
            $http({
                method: "GET",
                url: '/customer/dash_group/',
            }).then(function (response) {
                $scope.groups = response.data.results;
                if($scope.groups.length > 0){
                    $rootScope.view_mode = true;
                }else{
                    $rootScope.view_mode = undefined;
                }
                $scope.loader = false;
            }).catch(function (error) {
                console.log('error : ', angular.toJson(error));
                $scope.loader = false;
            });
        };
        $scope.get_all_groups();


        $scope.ERROR_MESSAGE = "Unable to monitor this device"; // Constant, do not change without consent
        $scope.ERROR_VALUE = "N/A"; // Constant, do not change without consent

        $scope.get_devices_for_group = function(group, next_url){
            if($scope.group_position_changing){
                return ;
            }
            var url = '';
            group.loading = true;
            if(!group.devices){
                group.devices = [];
            }
            if(next_url){
                url = next_url;
            }else{
                url = 'customer/dash_device/?group_uuid=' + group.uuid + '&page_size=' + 6;
            }
            $http({
                method: "GET",
                url: url
            }).then(function (response) {
                group.devices = group.devices.concat(response.data.results);
                if(response.data.next){
                    $scope.get_devices_for_group(group, response.data.next);
                }else{
                     group.loading = false;
                }
            }).catch(function (error) {
                console.log('error : ', angular.toJson(error));
            });
        };

        $scope.get_device_icon = function(device_category){
            // console.log('device.device_category : ', angular.toJson(device_category))
            switch(device_category){
                case 'firewall' :
                        return 'fa fa-fire red';
                case 'load_balancer' :
                        return 'fa fa-balance-scale brown';
                case 'switch' :
                        return 'fa fa-sitemap green';
                case 'servers' :
                        return 'fa fa-server yellow';
                case 'vmware' :
                        return 'vmware_vm.svg';
                case 'vcloud' :
                        return 'vmware_vm.svg';
                case 'openstack' :
                        return 'fa fa-object-group blue';
                case 'custom_vm' :
                        return 'fa fa-object-group blue';
                case 'customdevice' :
                        return 'fa fa-sliders neonyellow';
            }
        };

        $scope.get_device_type = function(device_category){
            switch(device_category){
                case 'firewall' :
                        return 'firewall';
                case 'load_balancer' :
                        return 'load balancer';
                case 'switch' :
                        return 'switch';
                case 'servers' :
                        return 'server';
                case 'vmware' :
                        return 'vmware vm';
                case 'vcloud' :
                        return 'vcloud vm';
                case 'openstack' :
                        return 'openstack vm';
                case 'custom_vm' :
                        return 'custom vm';
                case 'customdevice' :
                        return 'custom device';
            }
        };

        var modalSupport = null;
        var showModal = function (template, controller, size) {
            if (modalSupport !== null) {
                modalSupport.dismiss('cancel');
            }
            $scope.loader = false;
            modalSupport = $uibModal.open({
                templateUrl: template,
                controller: controller,
                scope: $scope,
                size : size
            });

            modalSupport.result.then(function (selectedItem) {
                $scope.selected = selectedItem;
            }, function () {
            });
        };

        $scope.cancel = function(){
            modalSupport.dismiss('cancel');
        };

        $scope.group = {};
        $scope.add_new_group_model = function(){
            $scope.method = 'add_group';
            $scope.group = {};
            showModal('add_group_modal.html');
        };

        $scope.add_new_group = function(group){
            $scope.loader = true;
            // console.log('in add_new_group with : ', angular.toJson(group));
            $http({
                method: "POST",
                url: '/customer/dash_group/',
                data : group
            }).then(function (response) {
                if($scope.groups.length == 0){
                    $rootScope.view_mode = true;
                }
                $scope.loader = false;
                $scope.groups.push(response.data);
                // console.log('succes : ', angular.toJson(response));
            }).catch(function (error) {
                $scope.loader = false;
                console.log('error : ', angular.toJson(error));
            });
            $scope.cancel();
        };

        $scope.edit_group_modal = function(index, group){
            console.log('group : ', angular.toJson(group));
            $scope.method = 'edit_group';
            $scope.group = angular.copy(group);
            $scope.group_edit_index = angular.copy(index);
            showModal('add_group_modal.html');
        };

        $scope.update_group = function(group){
            $scope.loader = true;
            // console.log('in add_new_group with : ', angular.toJson(group));
            $http({
                method: "PUT",
                url: '/customer/dash_group/'+ group.uuid + '/',
                data : group
            }).then(function (response) {
                $scope.loader = false;
                $scope.groups[$scope.group_edit_index].name = angular.copy(response.data.name);
                $scope.groups[$scope.group_edit_index].desc = angular.copy(response.data.desc);
                console.log('succes : ', angular.toJson(response));
                console.log('$scope.groups : ', angular.toJson($scope.groups));
            }).catch(function (error) {
                $scope.loader = false;
                console.log('error : ', angular.toJson(error));
            });
            $scope.cancel();
        };

        $scope.manage_group_data = function(group){
            if($scope.method === 'add_group'){
                $scope.add_new_group(group);
            }else if($scope.method === 'edit_group'){
                $scope.update_group(group);
            }
        };

        $scope.new_device = {};
        $scope.add_device_modal = function(group){
            // console.log('in add_device_modal with group : ', angular.toJson(group));
            $scope.new_device = {};
            $scope.new_device.group = angular.copy(group);
            showModal('add_device_modal.html', null, 'xs add_device_modal');
        };

        var get_device_key_type = function(device_category){
            switch(device_category){
                case 'servers' :
                        return 'server';
                case 'vmware' :
                        return 'instance';
                case 'vcloud' :
                        return 'instance';
                case 'openstack' :
                        return 'instance';
                case 'custom_vm' :
                        return 'instance';
                default :
                    return device_category;
            }
        };

        var is_device_exists = function(existing_devices, new_device){
            for(var j = 0; j < existing_devices.length; j++){
                if(existing_devices[j].device_uuid == new_device.uuid){
                    return true;
                }
            }
            return false;
        };


        $scope.devices_loading = false;
        $scope.get_devices_by_category = function(new_device){

            new_device.device_selected = '';
            new_device.devices_by_category = undefined;
            var url = '';
            $scope.devices_loading = true;
            if (new_device.device_category == 'customdevice') {
                url = 'customer/customdevices/?page_size=0';
            }
            else{
                url = 'customer/observium/' + new_device.device_category + '/?page_size=0';
            }
            $http({
                method: "GET",
                url: url,
            }).then(function (response) {
                var temp_device_array = [];
                for(var i = 0; i < response.data.length; i++){
                    if (new_device.device_category == 'customdevice'){
                        var device_exists = is_device_exists(new_device.group.devices, response.data[i]);
                    }
                    else{
                        var category = get_device_key_type(new_device.device_category);
                        var device_exists = is_device_exists(new_device.group.devices, response.data[i][category]);
                    }
                    if(!device_exists){
                        var temp_data = {};
                        if((new_device.device_category == 'vmware') 
                            || (new_device.device_category == 'vcloud') 
                                || (new_device.device_category == 'openstack') 
                                    || (new_device.device_category == 'custom_vm')){
                            temp_data = angular.copy(response.data[i]['instance']);
                        }else if((new_device.device_category == 'servers')){
                            temp_data = angular.copy(response.data[i]['server']);
                        }else if((new_device.device_category == 'customdevice')){
                            temp_data = angular.copy(response.data[i]);
                        }
                        else{
                            temp_data = angular.copy(response.data[i][new_device.device_category]);
                        }

                        temp_data.device_id = response.data[i]['id'];
                        temp_device_array.push(temp_data);
                    }
                new_device.devices_by_category = angular.copy(temp_device_array);
                }

                $scope.devices_loading = false;
                // console.log('new_device.devices_by_category : ', angular.toJson(new_device.devices_by_category));
            }).catch(function (error) {
                console.log('error : ', angular.toJson(error));
            });
        };

        var check_obj_exists = function(devices_arr, device_selected){
            for(var i = 0; i < devices_arr.length; i++){
                if(devices_arr[i].uuid == device_selected.uuid){
                    return i;
                }
            }
            return -1;
        };

        // $scope.selected_devices = [];
        $scope.toggleSelectedDevices = function(device){
            var device_selected = angular.copy(device);
            if(device_selected.checked){
                delete device_selected.checked;
                $scope.selected_devices.push(device_selected);
            }else{
                delete device_selected.checked;
                var exist_index = check_obj_exists(angular.copy($scope.selected_devices),device_selected);
                if(exist_index !== -1){
                    $scope.selected_devices.splice(exist_index,1);
                }
            }
           // console.log('$scope.selected_devices : ', angular.toJson($scope.selected_devices));
        };

        var get_device_category = function(category){
            switch(category){
                case 'firewall' :
                        return 'observiumfirewall';
                case 'load_balancer' :
                        return 'observiumloadbalancer';
                case 'switch' :
                        return 'observiumswitch';
                case 'servers' :
                        return 'observiumserver';
                case 'vmware' :
                        return 'observiumvmwarevm';
                case 'vcloud' :
                        return 'observiumvcloudvm';
                case 'openstack' :
                        return 'observiumopenstackvm';
                case 'custom_vm' :
                        return 'observiumcustomcloudvm';
                case 'customdevice' :
                        return 'customdevice';
            }
        };

        $scope.add_device = function(new_device){
            var devices = [];
            angular.forEach(new_device.selected_devices, function (value, key) {
                devices.push(value.device_id);
            });
            
            console.log("Devices ===>"+angular.toJson(new_device));

            $scope.loader = true;
            var obj = {};
            obj.group_uuid = new_device.group.uuid; /// group uuid
            obj.device_category = get_device_category(new_device.device_category); // device category
            obj.devices_selected  = devices; // selected devices id
            $http({
                method: "POST",
                url: '/customer/dash_device/add_device/',
                data : obj
            }).then(function (response) {
                $scope.loader = false;
                for(var i = 0; i < $scope.groups.length; i++){
                    if($scope.groups[i].uuid == new_device.group.uuid){
                        angular.forEach(response.data, function (value, key) {
                            $scope.groups[i].devices.push(value);
                        });
                    }
                }
                console.log('succes : ', angular.toJson(response));
            }).catch(function (error) {
                $scope.loader = false;
                console.log('error : ', angular.toJson(error));
            });
            $scope.cancel();
        };

        $scope.delete_group_modal = function(index,group_selected){
            $scope.deleteconfirm = {};
            $scope.method = 'delete_group';
            $scope.group_deleting_index = angular.copy(index);
            $scope.group_selected_for_delete = angular.copy(group_selected);
            $scope.deleteconfirm.title = 'Delete Group';
            $scope.deleteconfirm.alertMsg = 'Are you sure you want to delete?';
            $scope.show_delete_confirm_modal = !$scope.show_delete_confirm_modal;
        };

        $scope.delete_group = function(){
            console.log('deleting group : ', angular.toJson($scope.group_selected_for_delete));
            $http({
                method: "DELETE",
                url: '/customer/dash_group/' + $scope.group_selected_for_delete.uuid,
            }).then(function (response) {
                $scope.loader = false;
                $scope.groups.splice($scope.group_deleting_index, 1);
                if($scope.groups.length == 0){
                    $rootScope.view_mode = undefined;
                }
                console.log('succes : ', angular.toJson(response));
            }).catch(function (error) {
                $scope.loader = false;
                console.log('error : ', angular.toJson(error));
            });
        };

        $scope.delete_device_modal = function(index, group, device_selected, group_index){
            $scope.deleteconfirm = {};
            $scope.method = 'delete_device';
            $scope.group_index = angular.copy(group_index);
            $scope.device_index = angular.copy(index);
            $scope.device_selected_for_delete = angular.copy(device_selected);
            $scope.group = angular.copy(group);
            $scope.deleteconfirm.title = 'Delete Device';
            $scope.deleteconfirm.alertMsg = 'Are you sure you want to delete?';
            $scope.show_delete_confirm_modal = !$scope.show_delete_confirm_modal;
        };

        $scope.delete_device = function(){
            $http({
                method: "DELETE",
                url: '/customer/dash_device/' + $scope.device_selected_for_delete.uuid + '?group_uuid='+$scope.group.uuid,
            }).then(function (response) {
                $scope.loader = false;
                $scope.groups[$scope.group_index].devices.splice($scope.device_index,1);
                // console.log('succes : ', angular.toJson(response));
            }).catch(function (error) {
                $scope.loader = false;
                console.log('error : ', angular.toJson(error));
            });
        };

        $scope.delete = function(){
            if($scope.method === 'delete_group'){
                $scope.delete_group();
            }else{
                $scope.delete_device();
            }
            $scope.show_delete_confirm_modal = !$scope.show_delete_confirm_modal;
        };
        
        $scope.cancel_delete = function(){
            $scope.show_delete_confirm_modal = !$scope.show_delete_confirm_modal;
        };

        $scope.dndStartCallback = function(index, item, source_group){
            console.log('in dndStartCallback');
            // console.log('index : ', angular.toJson(index));
            // console.log('item : ', angular.toJson(item));
            // console.log('group : ', angular.toJson(source_group));
            $scope.source_group = angular.copy(source_group);
        };

        $scope.dragoverCallback = function() {
            return true;
        };

        $scope.dropCallback = function(index, item, target_group) {
            for(var i = 0; i < target_group.devices.length; i++){
                if(target_group.devices[i].device_uuid == item.device_uuid){
                    var msg = "Device <b>" + item.device_name + "</b>  already exists in Group <b>" + target_group.name;
                    AlertService2.danger(msg);
                    return false;
                }
            }
            // console.log('in dropCallback');
            // console.log('index : ', angular.toJson(index));
            // console.log('item : ', angular.toJson(item));
            // console.log('group : ', angular.toJson(target_group));
            return item;
        };

        $scope.deviceInsertCallback = function(drop_effect, index, device, target_group){
            if(drop_effect === 'move'){
                $scope.target_device_index = angular.copy(index);
                $scope.target_device = angular.copy(device);
                $scope.target_group = angular.copy(target_group);
            } 
        };

        $scope.dndCompleteCallback = function(drop_effect, index, device, source_group){
            // console.log('in dndCompleteCallback');
            if(drop_effect !== 'move'){
                return;
            } 

            var dnd_list = [];
            var obj = {};
            if($scope.target_group.uuid === source_group.uuid){
                obj[source_group.name] = angular.copy(source_group);
            }else{
                var obj = {};
                obj[source_group.name] = angular.copy(source_group);
                obj[$scope.target_group.name] = angular.copy($scope.target_group);
            }
            dnd_list.push(obj);

            // console.log('dnd_list : ', angular.toJson(dnd_list));

            $http({
                method: "POST",
                url: '/customer/dash_device/update_device_data/',
                data : dnd_list
            }).then(function (response) {
                // console.log('succes : ', angular.toJson(response));
            }).catch(function (error) {
                console.log('error : ', angular.toJson(error));
            });

        };

        $scope.groupDragStartCallback = function(index, group){
            $scope.group_position_changing = true;
        };

        $scope.groupDragoverCallback = function(index, external, type, callback){
            console.log('in groupDragoverCallback');
            return true;
        };

        $scope.groupDropCallback = function(index, item, external, type){
            console.log('in groupDropCallback');
            return item;
        };

        $scope.groupInsertCallback = function(drop_effect, index, item, target_group){
            console.log('in groupInsertCallback with drop_effect : ', drop_effect);
            if(drop_effect !== 'move'){
                $scope.group_position_changing = false;
                return;
            } 
            
            console.log('index : ', index);
            console.log('item : ', angular.toJson(item));
            console.log('target_group : ', angular.toJson(target_group));
            
        };

        $scope.groupDNDCompleteCallback = function(drop_effect, index, source_group){
            console.log('in groupDNDCompleteCallback with drop_effect : ', drop_effect);
            if(drop_effect !== 'move'){
                $scope.group_position_changing = false;
                return;
            } 
            console.log('index : ', index);
            // console.log('source_group : ', angular.toJson(source_group));
            // console.log('groups : ', angular.toJson($scope.groups.length));
            
            var goup_list = [];
            angular.forEach($scope.groups, function (value, key) {
                goup_list.push(value.uuid);
            });

            // console.log("Value : "+goup_list)

            $http({
                method: "POST",
                url: '/customer/dash_group/update_group_data/',
                data : goup_list
            }).then(function (response) {
                // console.log('succes : ', angular.toJson(response));
            }).catch(function (error) {
                console.log('error : ', angular.toJson(error));
            });
        };

        $scope.show_device_stats = function(device){
            console.log('device : ', angular.toJson(device));
            var view_mode = angular.copy($rootScope.view_mode);
            if(!view_mode){
                return;
            }
            switch(device.device_category){
                case 'switch': 
                    $state.go('devices.switch', {uuidp: device.device_uuid}, {reload: false});
                    break;
                case 'firewall': 
                    $state.go('devices.firewall', {uuidp: device.device_uuid}, {reload: false});
                    break;
                case 'load_balancer': 
                    $state.go('devices.load_balancer', {uuidp: device.device_uuid}, {reload: false});
                    break;
                case 'servers': 
                    $state.go('devices.server', {uuidp: device.device_uuid}, {reload: false});
                    break;
                case 'vmware': 
                    $state.go('devices.vms.vmwarevm', {uuidq: device.device_uuid}, {reload: false});
                    break;
                case 'vcloud': 
                    $state.go('devices.vms.vcloudvm', {uuidq: device.device_uuid}, {reload: false});
                    break;
                case 'openstack': 
                    $state.go('devices.vms.openstackvm', {uuidq: device.device_uuid}, {reload: false});
                    break;
                case 'custom_vm':
                    console.log("custom_vm we don't have entry in Asset inventory. So when we  introduce that in Asset Inventory, we have to give link from here");
                    break;
                default :
                    console.log('something went wrong !');
            }
        };

        $scope.logEvent = function(message) {
            console.log(message);
        };

        $scope.logListEvent = function(action, index, external, type) {
            var message = external ? 'External ' : '';
            message += type + ' element was ' + action + ' position ' + index;
            console.log(message);
        };
    }
]);
