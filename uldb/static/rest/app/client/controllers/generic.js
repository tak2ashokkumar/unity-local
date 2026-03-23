var app = angular.module('uldb');

app.controller('DashboardController', [
    '$scope',
    '$rootScope',
    '$http',
    'CustomerServer',
    'TaskService',
    'AlertService2',
    'BreadCrumbService',
    function ($scope, $rootScope, $http, CustomerServer, TaskService, AlertService2, BreadCrumbService) {
        $scope.pageSize = 10;
        $scope.alertService = AlertService2;

        $scope.bread = BreadCrumbService;
        $scope.$on('$destroy', function () {
            $scope.bread.pushIfTop({name: "Dashboard", url: '#/'}, $scope);
        });
        $scope.$root.title = {
            singular: 'Dashboard',
            plural: 'Dashboard'
        };

        $scope.hosts_opts = {
            chart: {
                type: 'pieChart',
                height: 250,
                x: function (d) {
                    return d.label;
                },
                y: function (d) {
                    return d.value;
                },
                margin: {
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0
                },
                //showLabels: true,
                transitionDuration: 500,
                padAngle: 0.0,
                //donut: true,
                showLegend: false
            }
        };

        var vms = {label: 'VMs', value: 0, color: '#00BCD4'};
        var servers = {label: 'Servers', value: 0, color: '#d9edf7'};
        var sans = {label: 'SANs', value: 0, color: '#fcf8e3'};

        var up = {label: 'Up', value: 0, color: 'rgba(39,155,108,.7)'};
        var warn = {label: 'Warn', value: 0, color: '#fcf8e3'};
        var down = {label: 'Down', value: 0, color: '#f2dede'};
        var unknown = {label: 'Unknown', value: 0};

        var serviceUp = {label: 'Up', value: 0, color: '#00BCD4'};
        var serviceWarn = {label: 'Warning', value: 0, color: 'orangered'};
        var serviceCrit = {label: 'Critical', value: 0, color: 'red'};
        var serviceUnknown = {label: 'Unknown', value: 0, color: 'aliceblue'};

        var vcpu = {label: 'VCPUs', value: 0, color: '#03A9F4'};
        var vmem = {label: 'RAM (GiB)', value: 0, color: 'rgba(39,155,108,.7)'};

        $scope.hosts_data = [vms, servers, sans];
        $scope.alerts_data = [up, warn, down, unknown];
        $scope.service_data = [serviceUp, serviceWarn, serviceCrit, serviceUnknown];
        $scope.compute_data = [vcpu, vmem];

        var p = $http.get('/customer/stats/ ').then(function (response) {
            var d = response.data;
            vms.value = d.counts.vms;
            servers.value = d.counts.servers;
            sans.value = d.counts.sans;

            up.value = d.alerts.hosts_up;
            warn.value = d.alerts.hosts_warn;
            down.value = d.alerts.hosts_down;
            unknown.value = d.alerts.hosts_unknown;

            serviceUp.value = d.services.ok;
            serviceWarn.value = d.services.warning;
            serviceCrit.value = d.services.critical;
            serviceUnknown.value = d.services.unknown;

            vcpu.value = d.compute.vcpus;
            vmem.value = d.compute.vram;
        });

    }
]);

app.controller('CustomerAccountController', [
    '$scope',
    '$rootScope',
    '$http',
    '$state',
    '$window',
    '$uibModal',
    'AlertService2',
    function ($scope, $rootScope, $http, $state, $window, $uibModal, AlertService2) {
        $scope.title = {
            plural: 'Account', // Logged-in user can only view his/her own account anyway.
            singular: 'Account'
        };
        $scope.request = {};
        $scope.roles = []; //To be modified when we integrate role based access

        if ($scope.$parent === $rootScope) $scope.$root.title = $scope.title;
        $scope.alertService = AlertService2;
        // Get controller data (not currently a $resource).
        $http.get('/customer/uldbusers').then(function (response) {
            $scope.user = response.data.results[0];
            $scope.user_timezone = response.data.results[0].timezone;
            $rootScope.users_timezone = $scope.user_timezone;
        });


        $http.get('/customer/tickets/user_status').then(function (response) {
            $scope.zendesk_status = response.data;
        }).catch(function (error) {
            //console.log(error);
            $scope.zendesk_status = error.data;
        });

        $scope.show_two_factor = false;
        // Redirects user to account setup.
        $scope.manageTwoFactor = function () {
            //$window.location.href = "/account/two_factor/";
            $state.go('two_factor_auth',null,{reload : false});
        };

        $scope.changePassword = function () {
            var modalInstance = $uibModal.open({
                templateUrl: 'changePassword.html',
                controller: 'CustomerChangePasswordModalController',
                scope: $scope,
                size: 'md'
            });
            modalInstance.result.then();
        };

        $scope.changeTimezone = function () {
            var modalInstance = $uibModal.open({
                templateUrl: 'changeTimezone.html',
                controller: 'CustomerChangeTimezoneModalController',
                scope: $scope,
                size: 'md'
            });
            modalInstance.result.then();

            $scope.reload_account_data = function () {
                $http.get('/customer/uldbusers').then(function (response) {
                    $scope.user = response.data.results[0];
                    $scope.user_timezone = response.data.results[0].timezone;
                });

            };
        };
    }
]);

app.controller('TwoFactorAuthController', [
    '$scope',
    '$http',
    function ($scope, $http) {
        console.log('in two factor auth controller');
    }
]);

app.controller('CustomerChangePasswordModalController', [
    '$scope',
    '$http',
    '$uibModalInstance',
    'AlertService2',
    function ($scope, $http, $uibModalInstance, AlertService2) {
        $scope.request.pass1 = '';
        $scope.request.pass2 = '';
        $scope.request.old_pass = '';
        $scope.error = '';
        $scope.err = false;
        $scope.check = function (onErrorOnly) {
            var minPwLength = 8;
            if (onErrorOnly) {
                if (!($scope.error)) {
                    return;
                }
            }
            if ($scope.request.hasOwnProperty('pass1')) {
                if ($scope.request.pass1.length < minPwLength) {
                    $scope.err = true;
                    $scope.error = "New password must be at least " + minPwLength + " characters long.";
                }
                else if ($scope.request.hasOwnProperty('pass2')) {
                    if ($scope.request.pass1 !== $scope.request.pass2) {
                        $scope.err = true;
                        $scope.error = "New password values must match.";
                    }
                    else {
                        $scope.err = false;
                        $scope.error = '';
                    }
                }
            }

            return !$scope.err;
        };

        var fields_complete = function () {
            return ($scope.request.hasOwnProperty('pass1')
            && $scope.request.hasOwnProperty('pass2')
            && $scope.request.hasOwnProperty('old_pass'));
        };

        $scope.change = function () {
            if (fields_complete()){
                if ($scope.check()) {
                    $http.post('/customer/uldbusers/change_own_password/', $scope.request).then(function (response) {
                        AlertService2.success("Password changed successfully. You will be redirected to the login page to authenticate with the new password.");
                        $uibModalInstance.close();
                        $scope.logout();
                    }).catch(function (error) {
                        AlertService2.danger(error.data);
                        $uibModalInstance.dismiss(error.data);
                    });
                }
            }
            else{
                $scope.err = true;
                $scope.error = 'Please fill all the required fields';
                return;
            }
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }
]);

app.controller('CustomerChangeTimezoneModalController', [
    '$scope',
    '$window',
    '$http',
    '$uibModalInstance',
    'AlertService2',
    'DataFormattingService',
    '$location',
    function ($scope, $window, $http, $uibModalInstance, AlertService2, DataFormattingService, $location) {

        $scope.request = {};

        var fields_complete = function (request) {
            if (request === undefined) {
                $scope.timezone_list_errmsg = 'This Field is Required';
                return false;
            }
            else {
                return true;
            }

        };
        $scope.request.timezone = $scope.user_timezone;

        $scope.change_timezone = function (request, uuid) {

            if (fields_complete(request)) {
                request.uuid = uuid;
                var url = '/customer/uldbusers/change_own_timezone/';
                $http.post(url, request).then(function (response) {
                    AlertService2.success("Timezone changed successfully.");
                    $uibModalInstance.close();
                    $window.location.reload();
                }).catch(function (error) {
                    AlertService2.danger('Error while updating the timezone.');
                    $uibModalInstance.dismiss(error.data);
                });
            }
        };


        $scope.timezone_list = DataFormattingService.get_pytz_all_timezone();

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }
]);

app.controller('OrgController', [
    '$scope',
    '$http',
    '$rootScope',
    function ($scope, $http, $rootScope) {
        $scope.org = null;
        $scope.title = {
            plural: 'Organization Management',
            singular: 'Organization Management'
        };
        if ($scope.$parent === $rootScope) $scope.$root.title = $scope.title;

        $scope.cols = [
            {name: 'Address', field: 'address1'},
            {name: 'Address #2', field: 'address2'},
            {name: 'City', field: 'city'},
            {name: 'State', field: 'state'},
            {name: 'Postal Code', field: 'postal_code'},
            {name: 'Country', field: 'country'}
        ];

        $scope.transformAccessTypes = function (accessTypes) {
            return accessTypes.map(function (e, i, arr) {
                return e.name;
            }).join();
        };

        $http.get('/customer/organization/get_details/').then(function (response) {
            $scope.org = response.data;
        }).catch(function (error) {

        });
    }
]);

app.controller('ServerController', [
    '$scope',
    '$state',
    '$stateParams',
    '$http',
    '$uibModal',
    'AlertService2',
    'AbstractControllerFactory2',
    'CustomerULDBService',
    '$rootScope',
    'ProxyDetailControllerService',
    'DeviceManageRequestFactory',
    function ($scope, $state, $stateParams, $http, $uibModal, AlertService2, AbstractControllerFactory2, CustomerULDBService, $rootScope, ProxyDetailControllerService, DeviceManageRequestFactory) {

        console.log('in ServerController');
        $scope.page_no = 1;
        $scope.model = {};
        $scope.searchkey = '';
        $scope.sortkey = '';

        $scope.sort = {
            sortingColumn: '',
            reverse: false
        };

        $scope.device_url = "servers"; 
        $scope.device_type = "Hypervisors";
        var url = "/customer/servers/";
        var params = {'page': $scope.page_no};
        var id = angular.copy($stateParams.uuidc);

        $scope.ctrl = DeviceManageRequestFactory($scope);
        $scope.loaded = false;
        $rootScope.showConsole = false;

        $scope.updateActivityLog = function (index, instance_id, device_type) {
            ProxyDetailControllerService.updateActivityLog(instance_id, device_type);
        };

        var getDeviceName = function(device_name){
            var obj = {};
            switch(device_name){
                case 'servers' :
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
                case 'openstack' :
                    obj.device_name = 'Openstack Virtual Machine Statistics';
                    obj.device_api_name = 'openstack';
                    return obj;
                case 'custom_vm' :
                    obj.device_name = 'Custom Virtual Machine Statistics';
                    obj.device_api_name = 'custom_vm';
                    return obj;
                case 'firewalls' :
                    obj.device_name = 'Firewall Statistics';
                    obj.device_api_name = 'firewall';
                    return obj;
                case 'load_balancers' :
                    obj.device_name = 'LoadBalancer Statistics';
                    obj.device_api_name = 'load_balancer';
                    return obj; 
                case 'switches' :
                    obj.device_name = 'Switch Statistics';
                    obj.device_api_name = 'switch';
                    return obj; 
                default : 
                    console.log('something went wrong');
            }
        };

        $scope.getSortingResults = function(sort){
            if((sort !== undefined) && (sort !== null) && (sort !== '')){
                $scope.page_no = 1;
                $scope.sortkey = sort.sortingColumn;
                $scope.get_device_data(1);
            }
        };

        $scope.getSearchResults = function(){
            $scope.page_no = 1;
            $scope.get_device_data(1);
        };

        $scope.get_device_data = function (page) {

            params = {'page': page};

            if($state.$current.name != 'devices.servers'){
                params['uuid'] = id;
            }

            if(($scope.sortkey !== undefined) && ($scope.sortkey !== null) && ($scope.sortkey !== '')){
                params['ordering'] = $scope.sortkey;
            }

            if(($scope.searchkey !== undefined) && ($scope.searchkey !== null) && ($scope.searchkey !== '')){
                params['search'] = $scope.searchkey;
            }

            $http.get(url, {params:params}).then(function (response) {
                // $scope.model = response.data;
                if(page === 1)
                    $scope.model = response.data;
                else{
                    $scope.model.count = response.data.count;
                    $scope.model.results = $scope.model.results.concat(response.data.results);
                }
            }).catch(function (error) {
                if(page === 1)
                    $scope.model.results = [];
                AlertService2.danger("Unable to fetch data. Please contact Adminstrator.");
                console.log(error);
            });
        };

        $scope.get_device_data($scope.page_no);

        $scope.loadMoreResults = function() {
            if(angular.isDefined($scope.model.count) && angular.isDefined($rootScope.configObject.page_size)){
                var hypervisors_loaded = $scope.model.results.length;
                if (( hypervisors_loaded < $scope.model.count) && (($scope.page_no * $rootScope.configObject.page_size) == hypervisors_loaded)) {
                    $scope.page_no = $scope.page_no + 1;
                    $scope.get_device_data(angular.copy($scope.page_no));
                }
            }
        };

        $scope.show_device_statistics = function(device_id){
             localStorage.removeItem('isBareMetalStats');
             if($state.$current.name == 'devices.servers'){
                $state.go('devices.server', {uuidp: device_id}, {reload: false});
             }
             else if($state.$current.name == 'pc_cloud.hypervisors'){
                $state.go('pc_cloud.hypervisor', {uuidc: id, uuidcc: device_id}, {reload: false});
             }
             else{
                $state.go('colo_cloud.pc_cloud.hypervisor', {uuidc: id, uuidcc: device_id}, {reload: false});
             }
        };

        $scope.get_observium_details = function (device_name, device) {
            var device_obj = getDeviceName(device_name);
            if (device_obj.device_api_name === ('openstack' || 'custom_vm')){
                device.uuid = device.instance_id;
            }
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
        };


        $scope.updateActivityLog = function (index, instance_id, device_type) {
            ProxyDetailControllerService.updateActivityLog(instance_id, device_type);
        };

        $scope.proxySameTab = function (index, row_uuid, device_type, proxy_url) {
            $scope.updateActivityLog(index, row_uuid, device_type);
            $scope.showProxy = true;
            $scope.proxy_url = proxy_url;
        };

        $scope.ConsoleSameTab = function (index, instance_id) {
            $http({
                method: "GET",
                url: url + instance_id
            }).then(function (response) {

                $scope.loader = false;
                $scope.device_name = response.data.name;

                if (response.data.management_ip) {
                    $scope.request = {
                        hostname: response.data.management_ip,
                        port: 2122,
                    };
                }
                else {
                    $scope.disableAccess = true;
                }

                $rootScope.showConsole = false;
                $scope.endpoint = url + instance_id + '/check_auth/';
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

        $scope.close_console = function () {
            $scope.updateTitle();
            $rootScope.showConsole = false;
            $scope.showProxy = false;
        };
        $scope.updateTitle = function () {
            $rootScope.header = "";
            $scope.title = {
                plural: "Unity",
                singular: "Unity"
            };
            if ($scope.$parent == $scope.$root) $scope.$root.title = $scope.title;
        };
    }
]);

app.controller('CustomerBMServerController', [
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
        $scope.page_no = 1;
        $scope.page_size = 10;
        var id = angular.copy($stateParams.uuidc);
        var params = {
            'page': $scope.page_no,
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
            $scope.page_no = 1;
            var params = {
                'page': $scope.page_no,
                'ordering': sort.sortingColumn,
                'search': $scope.searchKeyword
            };
            $scope.get_device_data(params);
        };

        $scope.getSearchResults = function (sk) {
            $scope.searchKeyword = sk;
            $scope.page_no = 1;
            var params = {
                'page': $scope.page_no,
                'search': $scope.searchKeyword,
                'ordering': $scope.sortingColumn
            };
            $scope.get_device_data(params);
        };

        $scope.paging_active = true;

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

        $scope.get_device_data = function(params){
            var url = '/customer/bm_servers/';
             if($state.$current.name != 'devices.firewalls'){
                params['uuid'] = id;
            }
            $http.get(url, {'params': params}).then(function (response) {
                if ($scope.page_no===1){
                    $scope.bm_server_result = response.data;
                    console.log("==="+angular.toJson($scope.bm_server_result));
                }else{
                    for (var i=0; i<response.data.results.length; i++){
                        $scope.bm_server_result.results.push(response.data.results[i]);
                    }
                }
                $scope.loader = false;
            }).catch(function(error){
                console.log('error : ', angular.toJson(error));
                $scope.loader = false;
            });
        };
        $scope.get_device_data(params);

        $scope.show_server_statistics = function (device_id) {
            // console.log("Show server statistics......")
            localStorage.setItem('isBareMetalStats', true);
            // $state.go('devices.server', {uuidp: device_id}, {reload: false});
            if($state.$current.name == 'devices.bm_servers'){
                $state.go('devices.server', {uuidp: device_id}, {reload: false});
             }
            else if($state.$current.name == 'pc_cloud.bm_servers'){
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
                    var response_power_str = response.data;
                    response_power_str = response_power_str.split('\n');
                    if(response_power_str[0] === 'Chassis Power is on'){
                        device.power_on = true;
                        device.action_support = 'power_off';
                        device.action_message = 'Stop Server';
                        device.controller_message = device.bmc_type + ' Stats';
                    }else{
                        device.controller_message = 'Server Powered off';
                        device.power_on = false;
                        device.action_support = 'power_on';
                        device.action_message = 'Start Server';
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

        $scope.close_confirm = function(){
            modalSupport.dismiss('cancel');
        };

        $scope.manage_bmserver_actions = function(device){
            
            $scope.selected = device;
            console.log("device: " + angular.toJson(device));
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
                    AlertService2.error("Something went wrong !... Please try again later");
                });
            };
            
        };

        $scope.blinker_message = 'Click here to blink the server in datacenter.';
        $scope.blink_bmserver = function(device){
            
            $scope.selected = device;

            $scope.ipmi_username = device.bm_controller.username;
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
                    url: '/customer/bm_servers/'+ device.uuid + '/check_password/',
                }).then(function (response) {
                    console.log("Password validated Successfully");
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
                    url: '/customer/bm_servers/'+ device.uuid + '/blink/',
                }).then(function (response) {
                    var response_power_str = response.data;
                    response_power_str = response_power_str.split('\n');
                    msg = "Blinking <b>" + device.server.name + "</b> Successfully! Please contact datacenter technician to verify.";
                    $scope.loader = false;
                    AlertService2.success(msg);
                }).catch(function (error) {
                    $scope.loader = false;
                    AlertService2.error("Something went wrong !... Please try again later");
                });
            };
            
        };

        $scope.show_controller_statistics = function(device_id, bmc_type){
            console.log("Inside Show controller stats..................");
            if($state.$current.name == 'devices.bm_servers'){
                if (bmc_type == "IPMI"){
                    $state.go('devices.bm_server_ipmi', {uuidp: device_id}, {reload: false});
                }
                else{
                    $state.go('devices.bm_server_drac', {uuidp: device_id}, {reload: false});
                }
             }
            else if($state.$current.name == 'pc_cloud.bm_servers'){
                if (bmc_type == "IPMI"){
                    $state.go('pc_cloud.bm_server_ipmi', {uuidc: $stateParams.uuidc, uuidcc: device_id}, {reload: false});
                }
                else{
                    $state.go('pc_cloud.bm_server_drac', {uuidc: $stateParams.uuidc, uuidcc: device_id}, {reload: false});
                }
            }
            else{
                console.log("Inside colo cloud controller stats..................");
                if (bmc_type == "IPMI"){
                    $state.go('colo_cloud.pc_cloud.bm_server_ipmi', {uuidc: $stateParams.uuidc, uuidcc: device_id}, {reload: false});
                }
                else{
                    $state.go('colo_cloud.pc_cloud.bm_server_drac', {uuidc: $stateParams.uuidc, uuidcc: device_id}, {reload: false});
                }
            }

            
        };

        $scope.show_full_details = function(server){
            $scope.bm_details = angular.copy(server);
            showModal('baremetal_full_details.html');
        };

        $scope.cancel = function(){
            modalSupport.dismiss('cancel');
        };

        $scope.loadPageData = function () {
            var bm_servers_loaded = $scope.bm_server_result.results.length;
            if (( bm_servers_loaded < $scope.bm_server_result.count) && (($scope.page_no *  $scope.page_size) == bm_servers_loaded)) {
                $scope.page_no = $scope.page_no + 1;
                var params = {
                    'page': $scope.page_no,
                    'page_size': $scope.page_size,
                };
                $scope.get_device_data(angular.copy(params));
            }
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

app.controller('CustomerCustomDevicesController', [
    '$scope',
    '$http',
    '$state',
    '$location',
    '$uibModal',
    '$rootScope',
    '$stateParams',
    'AlertService2',
    function ($scope, $http, $state, $location, $uibModal, $rootScope, $stateParams, AlertService2) {

        console.log('in CustomerCustomDevicesController');
        $scope.loader = true;

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

        $scope.customdevicedetailspopoverobj = {
            templateUrl: 'customdevicedetailstemplate.html',
        };
        $scope.show_uptime_details = function(device){
            $scope.device_details = device.details; 
        };

        $scope.loadPageData = function () {
            var params = {
                'ordering': $scope.sortingColumn,
                'page': $scope.page + 1,
                'page_size': $scope.page_size,
                'search': $scope.searchKeyword,
            };
            if (($scope.page * $scope.page_size) < $scope.totalCustomDevices) {
                $scope.page = $scope.page + 1;
                $scope.getCustomDevices(params);
            }
        };

        $scope.page = 1;
        $scope.page_size = 10;
        var params = {
            'page': $scope.page,
            'page_size': $scope.page_size,
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
                'search': $scope.searchKeyword
            };
            $scope.getCustomDevices(params);
        };

        $scope.getSearchResults = function (sk) {
            $scope.searchKeyword = sk;
            $scope.page = 1;
            var params = {
                'search': $scope.searchKeyword,
                'page': $scope.page,
                'ordering': $scope.sortingColumn
            };
            $scope.getCustomDevices(params);
        };
        

        $scope.getCustomDevices = function(params){
            var url = '/customer/customdevices/';
            $http.get(url, {'params': params}).then(function (response) {
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
        $scope.getCustomDevices(params);

        $scope.get_uptime_details = function(device){
            if (device.details===undefined){
                $scope.loader = true;
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
    }
]);

app.controller('showDetailController', [
    '$scope',
    'AlertService2',
    '$uibModal',
    '$uibModalInstance',
    function ($scope, AlertService2, $uibModal, $uibModalInstance) {
        $scope.cancel = function () {
            $uibModalInstance.close();
        };

    }
]);

app.controller('SANController', [
    '$scope',
    '$rootScope',
    'CustomerSAN',
    'AlertService2',
    'SearchService',
    'AbstractControllerFactory',
    function ($scope, $rootScope, CustomerSAN, AlertService2, SearchService, AbstractControllerFactory) {
        $scope.title = {
            plural: 'SANs',
            singular: 'SAN'
        };
        $scope.resourceClass = CustomerSAN;
        // $scope.breadCrumb = { name: "SANs", url: "#/sans" };
        $scope.ctrl = new AbstractControllerFactory($scope.resourceClass, $scope, "name");
        $scope.p.then(function () {
            $scope.loaded = true;
        });

        $scope.rows = [
            {
                name: "name", description: "Name", required: true,
                opaque: 'link',
                read: function (result) {
                    return {
                        url: "#/sans/" + result.uuid,
                        innerText: result.name
                    };
                }
            },
            // { name: "cpus", description: "CPUs", required: true },
            // {
            //     name: "memory", description: "Memory", required: true,
            //     opaque: 'stringTransform',
            //     read: function (result) {
            //         return result.memory + " GB";
            //     }
            // },
            // {
            //     name: "storage", description: "Storage", required: true,
            //     opaque: 'stringTransform',
            //     read: function (result) {
            //         return result.disk + " GB";
            //     }
            // },
            {
                name: "type", description: "System Type", required: true,
                opaque: 'stringTransform',
                subfield: "instance_type",
                read: function (result) {
                    if (result.instance !== null) {
                        return result.instance.instance_type;
                    }
                    return "None";
                }
            },
            {name: "last_known_state", description: "Status", required: true}
        ];
    }
]);

app.controller('CustomerVirtualMachineController', [
    '$scope',
    '$http',
    '$state',
    '$uibModal',
    '$location',
    '$rootScope',
    '$stateParams',
    '$timeout',
    'CustomerVirtualMachine',
    'TaskService',
    'TaskService2',
    'AlertService2',
    'SearchService',
    'AbstractControllerFactory',
    'CustomerOpenStackInstance',
    'ClientApi',
    'RestService',
    'DataFormattingService',
    'ValidationService',
    'AwsService',
    'TableHeaders',
    function ($scope,
              $http,
              $state,
              $uibModal,
              $location,
              $rootScope,
              $stateParams,
              $timeout,
              CustomerVirtualMachine,
              TaskService,
              TaskService2,
              AlertService2,
              SearchService,
              AbstractControllerFactory,
              CustomerOpenStackInstance,
              ClientApi,
              RestService,
              DataFormattingService,
              ValidationService,
              AwsService,
              TableHeaders) {

        var manageAllVms = function (params) {

            $scope.all_vm_rows = [
                {name: 'name', description: "Name", required: true},
                {name: 'os', description: "OS Name", required: true},
                {name: 'cloud_type', description: "Cloud Type", required: true},
                {name: 'cloud_name', description: "Cloud Name", required: true},
                {name: 'last_known_state', description: "Power State", required: true},
               // { name: 'cloud_name', description: "Cloud Name", required: true },
            ];

            $http({
                method: "GET",
                url: '/customer/virtual_machines/get_vm/',
                params: params
            }).then(function (result) {
                if (result.data.hasOwnProperty('task_id')) {
                    TaskService2.processTask(result.data.task_id, 500).then(function (response) {
                        $scope.all_vms_results = response;
                        $scope.model_count = response.count;
                        $scope.all_vms_loaded = true;
                    }).catch(function (error) {
                        AlertService2.danger('Error in loading All Vms');
                        $scope.all_vms_results = [];
                        $scope.all_vms_loaded = true;
                    });
                }
                else {
                    $scope.all_vms_results = result.data;
                    $scope.model_count = result.data.count;
                    $scope.all_vms_loaded = true;
                }

            }).catch(function (error) {
                $scope.all_vms_results = [];
                $scope.all_vms_loaded = true;
                AlertService2.danger('Error in loading all Vms');
                return error;
            });
        };

        var manageOpenstackVms = function () {
            $scope.openstack_loaded = false;
            $scope.openstack_result = undefined;
            $scope.openstack_rows = [
                {name: 'name', description: "Name", required: true},
                {name: 'power_status', description: "Power Status", required: true, is_sort_disabled: true},
                // {name: 'os_id', description: "ID", required: true},
                // {name: 'vcpu', description: "vCPUs", required: true},
                // {name: 'memory', description: "Memory (MB)", required: true},
                // {name: 'disk', description: "Disk (GB)", required: true},
                {name: 'operating_system', description: "Image", required: true},
                {name: 'management_ip', description: "Management IP", required: true},
                // {name: 'ip_address', description: "IP Address", required: true},
                // {name: 'last_known_state', description: "Power State", required: true}
            ];
            var resourceClass = CustomerOpenStackInstance;
            $http({
                method: "GET",
                url: '/rest/v3/vm_backup/get_vm_list/'
            }).then(function (response) {
                if (response.data.hasOwnProperty('task_id')) {
                    TaskService2.processTask(response.data.task_id, 500).then(function (result) {
                        if (result) {
                            $http({
                                url: '/rest/openstack/migration/',
                                params: {
                                    'page': 1,
                                    'page_size': 10
                                },
                                method: 'GET'
                            }).then(function (response) {
                                $scope.openstack_result = response.data.results;
                                $scope.openstack_loaded = true;
                                $scope.model_count = response.data.count;
                            });
                        }
                        angular.forEach(result, function (value, key) {
                            if (value.data == false) {
                                AlertService2.danger(value.message);
                                $scope.openstack_loaded = true;
                                // AlertService2.danger(value.message);
                            }
                        });
                    }).catch(function (error) {
                        AlertService2.danger('Error in loading Openstack Vms');
                        $scope.openstack_result = [];
                        $scope.openstack_loaded = true;
                    });
                }
                else {
                    $scope.openstack_result = response.results;
                    $scope.openstack_loaded = true;
                    $scope.model_count = response.data.count;
                }
            });
        };

        var manageVmwareVms = function () {
            $scope.vmware_loaded = false;
            $scope.vmware_result = undefined;
            $scope.vmware_rows = [
                {name: 'name', description: "Name", required: true},
                {name: 'power_status', description: "Power Status", required: true, is_sort_disabled: true},
                {name: 'os_name', description: "Operating System", required: true},
                // {name: 'host_name', description: "Host Name", required: true},
                // {name: 'cpu_core', description: "CPU Cores", required: true},
                // {name: 'vcpus', description: "vCPUs", required: true},
                // {name: 'guest_memory', description: "Memory", required: true},
                {name: 'management_ip', description: "Management IP", required: true},
                // {name: 'state', description: "Power State", required: true}
            ];
            $http({
                method: "GET",
                url: '/rest/vmware/migrate/virtual_machines/'
            }).then(function (response) {
                if (response.data.hasOwnProperty('task_id')) {
                    TaskService2.processTask(response.data.task_id, 500).then(function (result) {
                        if (result) {
                            $http({
                                url: '/rest/vmware/migrate/',
                                params: {
                                    'page': 1,
                                    'page_size': 10
                                },
                                method: 'GET'
                            }).then(function (response) {
                                $scope.vmware_result = response.data.results;
                                $scope.model_count = response.data.count;
                                $scope.vmware_loaded = true;
                                $scope.page = 1;
                            });
                        }
                        angular.forEach(result, function (value, key) {
                            if (value.data == false) {
                                AlertService2.danger(value.message);
                                $scope.vmware_loaded = true;
                                // AlertService2.danger(value.message);
                            }
                        });
                    }).catch(function (error) {
                        AlertService2.danger('Error in loading Vmware Vms');
                        $scope.vmware_result = [];
                        $scope.vmware_loaded = true;
                    });
                }
                else {
                    $scope.vmware_result = response.data;
                    $scope.model_count = response.data.count;
                    $scope.vmware_loaded = true;
                }
            }).catch(function (error) {
                $scope.vmware_result = [];
                $scope.vmware_loaded = true;
                AlertService2.danger('Error in loading Vmware Vms');
                return error;
            });
        };

        var manageVcloudVms = function () {
            $scope.vcloud_loaded = false;
            $scope.vcloud_result = undefined;
            $scope.vcloud_rows = [
                {name: 'name', description: "Name", required: true},
                {name: 'power_state', description: "Power Status", required: true, is_sort_disabled: true},
                {name: 'guest_os', description: "Operating System", required: true},
                // {name: 'host_name', description: "Host Name", required: true},
                // {name: 'cpu_core', description: "CPU Cores", required: true},
                // {name: 'vcpus', description: "vCPUs", required: true},
                // {name: 'guest_memory', description: "Memory", required: true},
                {name: 'management_ip', description: "Management IP", required: true},
                // {name: 'state', description: "Power State", required: true}
            ];
            $http({
                method: "GET",
                url: '/customer/vclouds/virtual_machines/sync_vms/'
            }).then(function (response) {
                if (response.data.hasOwnProperty('task_id')) {
                    TaskService2.processTask(response.data.task_id, 500).then(function (result) {
                        if (result) {
                            $http({
                                url: '/customer/vclouds/virtual_machines/',
                                params: {
                                    'page': 1,
                                    'page_size': 10
                                },
                                method: 'GET'
                            }).then(function (response) {
                                $scope.vcloud_result = response.data.results;
                                $scope.model_count = response.data.count;
                                $scope.vcloud_loaded = true;
                                $scope.page = 1;
                            });
                        }
                        angular.forEach(result, function (value, key) {
                            if (value.data == false) {
                                AlertService2.danger(value.message);
                                $scope.vcloud_loaded = true;
                                // AlertService2.danger(value.message);
                            }
                        });
                    }).catch(function (error) {
                        AlertService2.danger('Error in loading Vmware Vms');
                        $scope.vcloud_result = [];
                        $scope.vcloud_loaded = true;
                    });
                }
                else {
                    $scope.vcloud_result = response.data;
                    $scope.model_count = response.data.count;
                    $scope.vcloud_loaded = true;
                }
            }).catch(function (error) {
                $scope.vcloud_result = [];
                $scope.vcloud_loaded = true;
                AlertService2.danger('Error in loading Vmware Vms');
                return error;
            });
        };

        var manageAwsVms = function (params) {
            $scope.aws_loaded = false;
            $scope.aws_rows = [
                {name: 'InstanceId', description: "Instance ID", required: true},
                {name: 'power_status', description: "Power Status", required: true, is_sort_disabled: true},
                {name: 'InstanceType', description: "Instance Type", required: true},
                {name: 'PublicIp', description: "Public IP", required: true},
                {name: 'AvailabilityZone', description: "Availability Zone", required: true},
                // {name: 'InstanceState', description: "Power State", required: true},
                {name: 'LaunchTime', description: "Launch Time", required: true}
            ];

            $scope.aws_create_image_rows = [
                DataFormattingService.generate_row(["text", "instance_id", "Instance Id", "required"]),
                DataFormattingService.generate_row(["text", "name", "Image Name", "required"]),
                DataFormattingService.generate_row(["text", "description", "Image Description", "required"]),
                DataFormattingService.generate_row(["checkbox", "no_reboot"])
            ];

            $scope.aws_attachinstance_rows = [
                DataFormattingService.generate_row(["select", "group", "Auto Scaling Group", ["sg1", "sg2"], "required"])
            ];

            $scope.aws_attachinterface_rows = [
                DataFormattingService.generate_row(["select", "network_interface_id", "Network Interface", ["sg1", "sg2"], "required"]),
                DataFormattingService.generate_row(["number", "device_index", "Device Index", "required"]),
            ];

            $scope.aws_attachloadbalancer_rows = [
                DataFormattingService.generate_row(["select", "load_balancer", "Load Balancer", ["lb1", "lb2"], "required"]),
            ];

            $scope.aws_attachinstance_dropdowns = {};

            var get_aws_template = function (name) {
                return ClientApi.create_modal.replace(":name", name);
            };

            $scope.aws_create_image_modaldata = {
                "title": "Create Image",
                "page": get_aws_template('create_aws_image')
            };

            $scope.aws_actions = [
                {"name": "Start", "button": "awspoweron"},
                {"name": "Stop", "button": "awspoweroff"},
                {"name": "Disabled", "button": "awsdisabled"},
                {"name": "Terminate", "button": "awsterminate"},
                {"name": "Create Image", "button": "createimage"},
                {"name": "Clone", "button": "cloneinstance"},
                {"name": "Attach Autoscaling Group", "button": "attachinstance"},
                {"name": "Attach Network Interface", "button": "attachinterface"},
                {"name": "Attach Load Balancer", "button": "attachloadbalancer"},
                {
                    "name": "Details",
                    "button": "showinstancedetails",

                },
                {"name": "Monitoring Dashboard", "button": "observiumdetails"},
                {"name": "Manage by creating support ticket", "button": "manage_support"}
            ];

            $scope.showPopUp = function(){
                modalInstance = '';
                modalInstance = $uibModal.open({
                    templateUrl: '/static/rest/app/client/templates/partials/aws_vms_management_options.html',
                    scope: $scope,
                    size: 'md'
                });
            };

            $scope.cancel = function () {
                modalInstance.close();
            };

            var modalInstance = '';
            var showDetailsmodel = function (templete, controllername) {
                $scope.loader = false;
                modalInstance = $uibModal.open({
                    templateUrl: templete,
                    controller: controllername,
                    scope: $scope,
                });

                modalInstance.result.then(function (selectedItem) {
                    console.log('Modal dismissed with: ', selectedItem);
                    $scope.selected = selectedItem;
                }, function () {
                    console.log('Modal dismissed with no selection');
                });
            };

            $scope.openModal = function (method, optional) {
                if ((method == "awspoweron") || (method == "awspoweroff") || (method == "awsterminate")) {
                    $scope.showStopStartTerminateModal = true;
                    $scope.showImageModal = false;
                    $scope.showCloneInstanceModal = false;
                    $scope.showAsgModal = false;
                    $scope.showAttachNetworkInterfaceModal = false;
                    $scope.showAttachLoadBalancerModal = false;

                    $scope.showPopUp();

                    $scope.toggle = function(){
                        $scope.aws_result = null;
                        if (method === 'awspoweron'){
                            var url = ClientApi.aws_poweron.replace(":account_id", optional.account_id).replace(":regionname", optional.region).replace(":instanceid", optional.InstanceId);
                            var successMsg = "Started " + optional.InstanceId + " Successfully";
                            var errorMsg = "Starting " + optional.InstanceId + " Failed. Please try again later.";
                        }
                        
                        if (method === 'awspoweroff'){
                            var url = ClientApi.aws_poweroff.replace(":account_id", optional.account_id).replace(":regionname", optional.region).replace(":instanceid", optional.InstanceId);
                            var successMsg = "Stopped " + optional.InstanceId + " Successfully";
                            var errorMsg = "Stopping " + optional.InstanceId  + " Failed. Please try again later.";
                        }

                        if (method === 'awsterminate'){
                            var url = ClientApi.aws_terminate.replace(":account_id", optional.account_id).replace(":regionname", optional.region).replace(":instanceid", optional.InstanceId);
                            var successMsg = "Terminated " + optional.InstanceId + " Successfully";
                            var errorMsg = "Terminating " + optional.InstanceId + " Failed. Please try again later.";
                        }
                        var params = '';
                        $scope.cancel();
                        RestService.send_modal_data(params, url).then(function (result) {
                            TaskService.processTaskv3(result.data.celery_task.task_id, function (result) {
                                if (result.state == "SUCCESS") {
                                    if (!/false,/.exec(result.result)) {
                                        AlertService2.addAlert({
                                            msg: successMsg,
                                            severity: 'success'
                                        });
                                        $scope.get_aws_vms();
                                    } else {
                                        AlertService2.addAlert({
                                            msg: "Starting " + optional.InstanceId + " Failed. Please try again later.",
                                            severity: 'danger'
                                        });
                                    }
                                }
                            }, function (error) {
                                AlertService2.addAlert({
                                    msg: "Starting " + optional.InstanceId + " Failed. Please try again later.",
                                    severity: 'danger'
                                });
                            });
                        });
                    };
                } 

                else if (method == "createimage") {
                    $scope.showImageModal = true;
                    $scope.showStopStartTerminateModal = false;
                    $scope.showCloneInstanceModal = false;
                    $scope.showAsgModal = false;
                    $scope.showAttachNetworkInterfaceModal = false;
                    $scope.showAttachLoadBalancerModal = false;

                    $scope.obj = {};
                    $scope.obj.instance_id = optional.InstanceId;

                    $scope.showPopUp();

                    $scope.aws_image_add = function (params) {
                        var temp = $scope.aws_result;
                        $scope.aws_result = null;
                        
                        var valid = ValidationService.validate_data(params, $scope.aws_create_image_rows);
                        if (!valid.is_validated) {
                            $scope.loader = false;
                            return valid;
                        }
                        var url = ClientApi.add_aws_image.replace(":account_id", optional.account_id).replace(":name", optional.region).replace(":instance_id", optional.InstanceId);
                        $scope.cancel();
                        RestService.send_modal_data(params, url).then(function (result) {
                            TaskService.processTaskv3(result.data.celery_task.task_id, function (result) {
                                if (result.state == "SUCCESS") {
                                    $scope.loader = false;
                                    if (!/false,/.exec(result.result)) {
                                        AlertService2.success("Image Added Successfully");
                                    } else {
                                        AlertService2.danger("Image Addition Failed. Please try again later.");
                                    }
                                    $scope.aws_result = temp;
                                }
                            }, function (error) {
                                $scope.error = true;
                                $scope.loader = false;
                                $scope.errorMsg = error.error + " " + error.message;
                                AlertService2.danger("Image Addition Failed. Please try again later.");
                            });
                        });
                        var response_obj = {"success": "Added Successfuly"};
                        return response_obj;
                    };}

                // else if (method == "cloneinstance") {}

                else if (method == "attachinstance") {
                    $scope.showAsgModal = true;
                    $scope.showStopStartTerminateModal = false;
                    $scope.showCloneInstanceModal = false;
                    $scope.showImageModal = false;
                    $scope.showAttachNetworkInterfaceModal = false;
                    $scope.showAttachLoadBalancerModal = false;

                    $scope.showPopUp();
                    var url = ClientApi.get_asg_list_data.replace(":account_id", optional.account_id).replace(":name", optional.region).replace(":instance_id", optional.InstanceId);
                    RestService.get_data(url).then(function (result) {
                        if (result.status == 200) {
                            $scope.aws_attachinstance_dropdowns.autoscaling_group = result.data.data;
                        }
                    });
 
                    $scope.attach_autoscaling_group = function (params) {
                        var temp = $scope.aws_result;
                        $scope.aws_result = null;

                        var valid = ValidationService.validate_data(params, $scope.aws_attachinstance_rows);
                        if (!valid.is_validated) {
                            $scope.loader = false;
                            return valid;
                        }
                        delete params.is_validated;
                        var url = ClientApi.attach_autoscaling_group.replace(":account_id", optional.account_id).replace(":name", optional.region_name).replace(":instance_id", optional.InstanceId);
                        $scope.cancel();
                        RestService.send_modal_data(params, url).then(function (result) {
                            TaskService.processTaskv3(result.data.celery_task.task_id, function (result) {
                                if (result.state == "SUCCESS") {
                                    $scope.loader = false;
                                    if (!/false,/.exec(result.result)) {
                                        AlertService2.success("Attached Successfully");
                                    } else {
                                        AlertService2.danger("Attach Failed. Please try again later.");
                                    }
                                    $scope.aws_result = temp;
                                }
                            }, function (error) {
                                $scope.error = true;
                                $scope.errorMsg = error.error + " " + error.message;
                                AlertService2.danger("Attach Failed. Please try again later.");
                            });
                        });
                        var response_obj = {"success": "Added Successfuly"};
                        return response_obj;
                    };}                

                else if (method == "attachinterface") {
                    $scope.showAttachNetworkInterfaceModal = true;
                    $scope.showStopStartTerminateModal = false;
                    $scope.showAsgModal = false;
                    $scope.showCloneInstanceModal = false;
                    $scope.showImageModal = false;
                    $scope.showAttachLoadBalancerModal = false;

                    $scope.aws_attachinterface_dropdowns = {};
                    $scope.aws_attachinterface_dropdowns.instance_id = optional.InstanceId;
                    $scope.showPopUp();

                    var url = ClientApi.get_network_interface_list.replace(":account_id", optional.account_id).replace(":name", optional.region).replace(":instance_id", optional.InstanceId);
                    RestService.get_data(url).then(function (result) {
                        if (result.status == 200) {
                            $scope.aws_attachinterface_dropdowns.network_interface_list = result.data.data;
                        }
                    });


                    $scope.attach_network_interface = function (params) {
                        var temp = $scope.aws_result;
                        $scope.aws_result = null;

                        var valid = ValidationService.validate_data(params, $scope.aws_attachinterface_rows);
                        if (!valid.is_validated) {
                            $scope.loader = false;
                            return valid;
                        }
                        delete params.is_validated;
                        var url = ClientApi.attach_network_interface.replace(":account_id", optional.account_id).replace(":name", optional.region).replace(":instance_id", optional.InstanceId);
                        $scope.cancel();
                        RestService.send_modal_data(params, url).then(function (result) {
                            TaskService.processTaskv3(result.data.celery_task.task_id, function (result) {
                                if (result.state == "SUCCESS") {
                                    $scope.loader = false;
                                    if (!/false,/.exec(result.result)) {
                                        AlertService2.success("Attached Successfully");
                                    } else {
                                        AlertService2.danger("Attach Failed. Please try again later.");
                                    }
                                    $scope.aws_result = temp;
                                }
                            }, function (error) {
                                $scope.error = true;
                                $scope.loader = false;
                                $scope.errorMsg = error.error + " " + error.message;
                                AlertService2.danger("Attach Failed. Please try again later.");
                            });
                        });
                        var response_obj = {"success": "Added Successfuly"};
                        return response_obj;
                    };}

                else if (method == "attachloadbalancer") {
                    $scope.showAttachLoadBalancerModal = true;
                    $scope.showStopStartTerminateModal = false;
                    $scope.showAttachNetworkInterfaceModal = false;
                    $scope.showAsgModal = false;
                    $scope.showCloneInstanceModal = false;
                    $scope.showImageModal = false;


                    $scope.aws_attachloadbalancer_dropdowns = {};

                    var url = ClientApi.get_loadbalancer_list.replace(":account_id", optional.account_id).replace(":name", optional.region).replace(":instance_id", optional.InstanceId);
                    RestService.get_data(url).then(function (result) {
                        if (result.status == 200) {
                            console.log("result", result);
                            $scope.aws_attachloadbalancer_dropdowns.loadbalancer_list = result.data.data;
                        }
                    });

                    $scope.showPopUp();

                    $scope.attach_loadbalancer = function (params) {
                        var temp = $scope.aws_result;
                        $scope.aws_result = null;
                        var valid = ValidationService.validate_data(params, $scope.aws_attachloadbalancer_rows);
                        if (!valid.is_validated) {
                            $scope.loader = false;
                            return valid;
                        }
                        delete params.is_validated;
                        var url = ClientApi.attach_loadbalancer.replace(":account_id", optional.account_id).replace(":name", optional.region).replace(":instance_id", optional.InstanceId);
                        $scope.cancel();
                        RestService.send_modal_data(params, url).then(function (result) {
                            TaskService.processTaskv3(result.data.celery_task.task_id, function (result) {
                                if (result.state == "SUCCESS") {
                                    $scope.loader = false;
                                    if (!/false,/.exec(result.result)) {
                                        AlertService2.success("Attached Successfully");
                                    } else {
                                        AlertService2.danger("Attach Failed. Please try again later.");
                                    }
                                    $scope.aws_result = temp;
                                }
                            }, function (error) {
                                $scope.error = true;
                                $scope.loader = false;
                                $scope.errorMsg = error.error + " " + error.message;
                                AlertService2.danger("Attach Failed. Please try again later.");
                            });
                        });
                        var response_obj = {"success": "Added Successfuly"};
                        return response_obj;
                    };} 

                else if (method == "showinstancedetails") {
                    var temp = $scope.aws_result;
                    $scope.aws_result = null;
                    $scope.aws_instance_details_headers = TableHeaders.aws_instance_details_headers;
                    $http({
                        method: "GET",
                        url: '/customer/aws/' + optional.account_id + '/region/' + optional.region + '/instance/' + optional.InstanceId + '/instance_detail/'
                    }).then(function (result) {
                        var obj = {
                            data: null
                        };
                        if (result.data.hasOwnProperty('celery_task')) {
                            TaskService.processTaskv3(result.data.celery_task.task_id, function (result) {
                                if (result.state == "SUCCESS") {
                                    if (!/false,/.exec(result.result)) {
                                        $scope.aws_instance_details_list_content = result.result.data[0];
                                        showDetailsmodel('static/rest/app/client/templates/aws/aws_instance_detail.html');
                                        $scope.aws_result = temp;
                                    }
                                    else {
                                        $scope.loader = false;
                                        AlertService2.addAlert({msg: result.data.result.message[0], severity: 'danger'});
                                    }
                                }
                            }, function (error) {
                                $scope.error = true;
                                $scope.errorMsg = error.error + " " + error.message;
                                AlertService2.addAlert({msg: error.data.result.message[0], severity: 'danger'});
                                $scope.aws_instance_details_list_content = error;
                            });
                        }
                        else {
                            $scope.aws_instance_details_list_content = result.data[0];
                        }

                    }).catch(function (error) {
                        $scope.loader = false;
                        return error;
                    });
                    $scope.cancel = function(){
                        modalInstance.close();
                    };
                }
            };

            $scope.get_observium_details = function (instance) {
                instance.observium_details = {};
                instance.message = 'Show Firewall Statistics';
                $http({
                    method: "GET",
                    url: '/customer/observium/aws/' + instance.uuid + '/get_device_data/'
                }).then(function (response) {
                    instance.observium_details = response.data;
                    instance.observium_details.device_data.uptime = $scope.getuptime(response.data);
                }).catch(function (error) {
                    instance.observium_details = null;
                    instance.message = 'Not Configured';
                });
            };

            $scope.instance_details = {};
            $scope.show_observium_details = function (instance) {
                console.log(' in show_observium_details with : ', angular.toJson(instance));
                $scope.instance_details = instance.observium_details;
            };

            $scope.show_awsvm_statistics = function (aws_vm) {
                if ($state.current.name == 'public_cloud.aws-account-region-inventory') {
                    localStorage.setItem('isInstanceStats', true);
                } else if ($state.current.name == 'public_cloud.aws-account-region-vms') {
                    localStorage.removeItem('isInstanceStats');
                }
                $state.go('public_cloud.aws-account-region-vm', {
                    uuidp: aws_vm.account_id,
                    uuidc: aws_vm.region,
                    uuidq: aws_vm.uuid
                }, {reload: false});
                $timeout(function () {
                    $scope.addClassforTabs('.actonecls ul', 0);
                }, 1000);
            };

            $scope.manage_request = function (region, instance_id) {
                var temp = $scope.aws_result;
                $scope.aws_result = null;
                $scope.device_type = "AWS Instance";
                $scope.device_name = instance_id;
                $scope.description = 
                    "Region: " + region + "\n" +
                    "Instance ID: " + instance_id;
                showModal('static/rest/app/client/templates/manage_request.html', 'ManageRequestController');
                $scope.aws_result = temp;
            };

            $scope.get_aws_vms = function(){
                $scope.aws_result = null;
                $http({
                    method: "GET",
                    url: '/customer/aws/virtual_machines/',
                    params: params
                }).then(function (response) {
                    if (response.data.hasOwnProperty('celery_task')) {
                        TaskService2.processTask(response.data.celery_task.task_id, 500).then(function (result) {
                            $scope.aws_result = result;
                            for (var i=0; i<$scope.aws_result.length; i++){
                                $scope.get_observium_details($scope.aws_result[i]);
                            }
                            $scope.aws_loaded = true;
                        }).catch(function (error) {
                            AlertService2.danger('Error in loading AWS Vms');
                            $scope.aws_result = [];
                            $scope.aws_loaded = true;
                        });
                    }
                    else {
                        $scope.aws_result = response.data;
                        $scope.aws_loaded = true;
                    }
                }).catch(function (error) {
                    AlertService2.danger('Error in loading AWS Vms');
                    $scope.aws_result = [];
                    $scope.aws_loaded = true;
                    return error;
                });
            };
            $scope.get_aws_vms();
        };

        $scope.azurePowerToggle = function(action, params){
            console.log('action', action);
            console.log('params', params);
            
            if (action=='azurepoweroff'){
                var msg = "Request to power off " + params.name + " is submitted.";
                $scope.power_state = 'powerOff';
            }
            if (action=='azurepoweron'){
                var msg = "Request to power on " + params.name + " is submitted.";
                $scope.power_state = 'start';
            }
            var post_data = { "vm_name": params.name, 'resource_group': params.resource_group, 'power_state' :  $scope.power_state};
            AlertService2.success(msg);
            $scope.cancel();
            $http({
                method: "POST",
                url: '/customer/azure/' + params.account_id + '/virtual_machines/toggle_power_state/',
                data: post_data,
            }).then(function (result) {

                if (result.data.hasOwnProperty('task_id')) {
                    TaskService.processTaskv3(result.data.task_id, function (result) {
                        $scope.loader = false;
                        if (result.result.success) {
                            AlertService2.success(result.result.success);
                            for(var i = 0; i < $scope.azure_result.length; i++){
                                if($scope.azure_result[i].name == params.name){
                                    if(result.result.success == 'VM Powered Off Successfully')
                                        $scope.azure_result[i].power_state = 'VM stopped';
                                    else
                                        $scope.azure_result[i].power_state = 'VM running';
                                }
                            }
                        }
                        else {
                            AlertService2.danger('Error ::' + result.result.error);
                        }
                    }, function (error) {
                        $scope.loader = false;
                    });
                }
                else{
                    $scope.loader = false;
                    console.log('result : ', angular.toJson(result));
                }

            }).catch(function (error) {
                $scope.loader = false;
                console.log('error : ', angular.toJson(error));
            });

        };

        $scope.deleteAzureVM = function (params) {
            console.log('pms', params);
            var url = ClientApi.azure_virtual_machine_delete.replace(":account_id", params.account_id);
            var post_data = { "vm_name": params.name, 'resource_group': params.resource_group };
            AlertService2.success("Delete request for Virtual machine " + params.name + " is submitted.");
            $scope.loader = true;
            $scope.cancel();
            $http({
                method: "POST",
                url: url,
                data: post_data,
            }).then(function (result) {
                if (result.data.hasOwnProperty('task_id')) {
                    TaskService.processTaskv3(result.data.task_id, function (result) {
                        $scope.loader = false;
                        if (result.state == "SUCCESS") {
                            $scope.loader = false;
                            AlertService2.success(result.result.success);
                            for(var i = 0; i < $scope.azure_result.length; i++){
                                if($scope.azure_result[i].name == params.name){
                                    delete $scope.azure_result[i];
                                }
                            }
                        }
                        else {
                            AlertService2.danger({ msg: result, severity: 'error' });
                        }
                    }, function (error) {
                        $scope.loader = false;
                    });
                }else {
                    $scope.loader = false;
                }

            }).catch(function (error) {
                $scope.loader = false;
            });
        };

        $scope.confirmationCheck = function (params, action) {
            var modalInstance = null;
            if (action) {
                $scope.action = action;
            }
            else{
                $scope.action = {'name': 'delete'};
            }
            $scope.azureVM = params;

            modalInstance = $uibModal.open({
                templateUrl: 'confirmationCheck.html',
                scope: $scope,
                size: 'md'
            });
            $scope.cancel = function () {
                modalInstance.close();
            };
            $scope.confirm = function(params, action) {
                if (action) {
                    $scope.azurePowerToggle(action, params);
                }
                else {
                    $scope.deleteAzureVM(params);
                }
            };

        };

        var manageAzureVms = function (params) {
            $scope.azure_loaded = false;
            $scope.azure_rows = [
                {name: 'name', description: "Name", required: true},
                {name: 'type', description: "Type", required: true},
                {name: 'location', description: "Location", required: true},
                {name: 'resource_group', description: "Resource", required: true},
                // {name: 'power_state', description: "Power State", required: true},
                {name: 'availability_set', description: "Availability Set", required: true},
            ];
            $scope.azure_actions = [
                {"name": "Start", "button": "azurepoweron"},
                {"name": "Stop", "button": "azurepoweroff"},
                {"name": "Delete", "button": "azuredelete"}
            ];
            $http({
                method: "GET",
                url: '/customer/azure/virtual_machines/',
                params: params
            }).then(function (result) {
                $scope.azure_result = result.data;
                $scope.azure_loaded = true;
                $scope.azure_count = result.data.count;
            }).catch(function (error) {
                AlertService2.danger('Error in loading Azure Vms');
                $scope.azure_loaded = true;
                $scope.azure_result = [];
                return error;
            });
        };

        $scope.vmware_data = function (params) {
            $scope.vmware_loaded = false;
            $http({
                url: '/rest/vmware/migrate/',
                params: params,
                method: 'GET'
            }).then(function (response) {
                if ($scope.page > 1) {
                    $scope.vmware_result.push.apply($scope.vmware_result, response.data.results);
                }
                else {
                    $scope.vmware_result = response.data.results;
                }
                $scope.vmware_loaded = true;
                $scope.model_count = response.data.count;
            });
        };

        $scope.openstack_data = function (params) {
            $scope.openstack_loaded = false;
            $http({
                url: '/rest/openstack/migration/',
                params: params,
                method: 'GET'
            }).then(function (response) {
                if ($scope.page > 1) {
                    $scope.openstack_result.push.apply($scope.openstack_result, response.data.results);
                }
                else {
                    $scope.openstack_result = response.data.results;
                }
                $scope.model_count = response.data.count;
                $scope.openstack_loaded = true;
            });
        };

        var manageVMs = function () {
            switch ($scope.vmtype) {
                case 'allvms' :
                    manageAllVms();
                    break;
                case 'openstackvms' :
                    manageOpenstackVms();
                    break;
                case 'vmwarevms' :
                    manageVmwareVms();
                    break;
                case 'vcloudvms' :
                    manageVcloudVms();
                    break;
                case 'awsvms' :
                    manageAwsVms();
                    break;
                case 'azurevms' :
                    manageAzureVms();
                    break;
            }
        };

        $scope.powerStatusToggle = function (index, instance_id, vm_poweron_state, cloud_type, cloud_id) {
            $scope.power_loader = false;
            $scope.cloud_type = cloud_type;
            if (vm_poweron_state === "ACTIVE" || vm_poweron_state === "poweredOn" || vm_poweron_state === "POWERED_ON") {
                $scope.vm_power_state = 'POWER OFF';
            }
            else {
                $scope.vm_power_state = 'POWER ON';
            }

            var modalInstance;
            modalInstance = $uibModal.open({
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
                    $scope.vmware_auth_modal = "Please provide vCloud Director credentials to " + $scope.vm_power_state +" this VM.";
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
                    $scope.vmware_result[index].powerStateLoading = true;
                    if (vm_poweron_state === "poweredOn") {
                        var url = '/rest/vmware/migrate/power_off/';
                        var msg_alert = 'VM Powered Off';
                    } else {
                        var url = '/rest/vmware/migrate/power_on/';
                        var msg_alert = 'VM Powered On';
                    }
                } 
                 else if (cloud_type === "vCloud Director") {
                    if (vm_poweron_state === "POWERED_ON") {
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
                    if (vm_poweron_state === "ACTIVE") {
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
                        'cloud_uuid': cloud_id,
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
                                // AlertService2.success(msg_alert);
                                if (cloud_type === "VMware") {
                                    $scope.vmware_result[index] = result.success;
                                    $scope.vmware_result[index].powerStateLoading = false;
                                }
                                else if (cloud_type === "vCloud Director") {
                                    $scope.vcloud_result[index] = result.success;
                                    $scope.vcloud_result[index].powerStateLoading = false;
                                }
                                else if(cloud_type === "OpenStack"){
                                    $scope.openstack_result[index] = result.success;
                                    $scope.openstack_result[index].powerStateLoading = false;
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
                    $scope.openstack_result[index].powerStateLoading = false;
                    AlertService2.success(msg_alert);
                    $scope.openstack_result[index] = response.data;
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

        var modalSupport = null;
        var showModal = function(template, controller){
            if(modalSupport !== null){
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
            showModal('static/rest/app/client/templates/manage_request.html', 'ManageRequestController');
        };

        $scope.vmConsoleSameTab = function (index, instance_id, cloud_type) {
            console.log("Cloud type : ", cloud_type);
            if (cloud_type === 'VMware') {
                $http({
                    method: "GET",
                    url: '/customer/vmware_vms/' + instance_id + '/get_vm_details/'
                }).then(function (response) {

                    $scope.loader = false;
                    $scope.device_name = response.data.vm_name;

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

                    $rootScope.showConsole = false;
                    $scope.endpoint = "/rest/vmware_vms/" + instance_id + "/check_auth/";
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
            }
            else if (cloud_type === 'vCloud Director') {
                $http({
                    method: "GET",
                    url: '/customer/vclouds/virtual_machines/' + instance_id + '/get_vm_details/'
                }).then(function (response) {

                    $scope.loader = false;
                    $scope.device_name = response.data.vm_name;

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

                    $rootScope.showConsole = false;
                    $scope.endpoint = "/customer/vclouds/virtual_machines/" + instance_id + "/check_auth/";
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
            }
            else if (cloud_type === 'OpenStack') {
                $http({
                    method: "GET",
                    url: '/rest/openstack/migration/' + instance_id + '/details/'
                }).then(function (response) {

                    $scope.loader = false;
                    $scope.device_name = response.data.vm_name;

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
            }
        };


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

        var manageVMsPaginationData = function (params) {
            switch ($scope.vmtype) {
                case 'allvms' :
                    manageAllVms(params);
                    break;
                case 'openstackvms' :
                    $scope.openstack_data(params);
                    break;
                case 'vmwarevms' :
                    $scope.vmware_data(params);
                    break;
            }
        };

        $scope.loadPageData = function () {
            var params = {
                'page': $scope.page + 1,
                'page_size': 10,
                'ordering': $scope.sortingColumn,
                'search': $scope.searchKeyword
            };
            if (($scope.page * params.page_size) < $scope.model_count) {
                $scope.page = $scope.page + 1;
                manageVMsPaginationData(params);
            }
        };

        $scope.getSearchResults = function (sk) {
            $scope.searchKeyword = sk;
            $scope.page = 1;
            if (sk.length == 0) {
                var params = {
                    'page': $scope.page,
                    'page_size': 10,
                    'ordering': $scope.sortingColumn
                };
            }
            else {
                params = {
                    'page': $scope.page,
                    'page_size': 10,
                    'search': sk,
                    'ordering': $scope.sortingColumn
                };
            }
            // $scope.model_count = 0;
            // $scope.model_results = [];
            manageVMsPaginationData(params);
        };

        $scope.getSortingResults = function (sort) {
            $scope.sortingColumn = sort.sortingColumn;
            $scope.page = 1;
            var params = {
                'page': $scope.page,
                'page_size': 10,
                'ordering': sort.sortingColumn,
                'search': $scope.searchKeyword
            };
            manageVMsPaginationData(params);
        };

        $scope.$watch(function () {
            return $location.path();
        }, function (value) {
            $scope.vmtype = value.split('/').pop();
            var urlend = value.split('/').slice(0, -1).pop();
            var urlend1 = value.split('/').slice(0, -1).slice(0, -1).pop();
            if ((urlend === 'openstackvm') || (urlend1 === 'openstackvm')) {
                $scope.is_observium_enabled = true;
            } else if ((urlend === 'vmwarevm') || (urlend1 === 'vmwarevm')) {
                $scope.is_observium_enabled = true;
            } else if ((urlend === 'vcloudvm') || (urlend1 === 'vcloudvm')) {
                $scope.is_observium_enabled = true;
            }
            else {
                $scope.is_observium_enabled = false;
            }


            $scope.model_count = 0;
            $scope.page = 1;
            $scope.searchKeyword = '';
            $scope.sortingColumn = '';
            manageVMs();
        });


        $scope.get_observium_details = function (device) {
            device.observium_details = {};
            device.message = 'Device Statistics';
            $http({
                method: "GET",
                url: '/customer/observium/openstack/' + device.uuid + '/get_device_data/'
            }).then(function (response) {
                device.observium_details = response.data;
                device.observium_details.device_data.uptime = $scope.getuptime(response.data);
            }).catch(function (error) {
                device.observium_details = null;
                device.message = $rootScope.monitoring_not_enabled_msg;
            });
        };

        $scope.show_device_statistics = function (device_id) {
            $state.go('devices.vms.openstackvm', {uuidq: device_id}, {reload: false});
        };

        $scope.show_observium_stats = false;
        $scope.show_observium_details = function (device) {
            $scope.show_observium_stats = true;
            $scope.device_details = device.observium_details;
        };

        $scope.get_vmware_observium_details = function (device) {
            device.observium_details = {};
            device.message = 'Device Statistics';
            $http({
                method: "GET",
                url: '/customer/observium/vmware/' + device.uuid + '/get_device_data/'
            }).then(function (response) {
                device.observium_details = response.data;
                device.observium_details.device_data.uptime = $scope.getuptime(response.data);
            }).catch(function (error) {
                device.observium_details = null;
                device.message = $rootScope.monitoring_not_enabled_msg;
            });
        };

        $scope.get_vcloud_observium_details = function (device) {
            device.observium_details = {};
            device.message = 'Device Statistics';
            $http({
                method: "GET",
                url: '/customer/observium/vcloud/' + device.uuid + '/get_device_data/'
            }).then(function (response) {
                device.observium_details = response.data;
                device.observium_details.device_data.uptime = $scope.getuptime(response.data);
            }).catch(function (error) {
                device.observium_details = null;
                device.message = $rootScope.monitoring_not_enabled_msg;
            });
        };

        $scope.show_vmware_device_statistics = function (device_id) {
            $state.go('devices.vms.vmwarevm', {uuidq: device_id}, {reload: false});
        };

        $scope.show_vcloud_device_statistics = function (device_id) {
            $state.go('devices.vms.vcloudvm', {uuidq: device_id}, {reload: false});
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

        $scope.show_vm_details = function(vm){
            console.log('vm : ', angular.toJson(vm));
            $scope.vm_details = vm;
            if(vm.cloud.platform_type === 'OpenStack'){
                showModal('static/rest/app/client/templates/modals/openstack_vm_details.html');
            }else {
                showModal('static/rest/app/client/templates/modals/vmware_vm_details.html');
            }
        };

        $scope.show_aws_vm_details = function(vm){
            console.log('vm : ', angular.toJson(vm));
            $scope.vm_details = vm;
            showModal('static/rest/app/client/templates/modals/aws_vm_details.html');   
        };

        $scope.close_modal = function(){
            modalSupport.dismiss('cancel');
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

app.controller('TotalController', [
    '$scope',
    function ($scope) {

    }
]);

app.controller('SwitchController', [
    '$scope',
    '$state',
    '$stateParams',
    '$http',
    '$uibModal',
    'AlertService2',
    'AbstractControllerFactory2',
    'CustomerULDBService',
    '$rootScope',
    'ProxyDetailControllerService',
    'DeviceManageRequestFactory',
    function ($scope, $state, $stateParams, $http, $uibModal, AlertService2, AbstractControllerFactory2, CustomerULDBService, $rootScope, ProxyDetailControllerService, DeviceManageRequestFactory) {

        console.log('in SwitchController');

        $scope.page_no = 1;
        $scope.model = {};
        $scope.searchkey = '';
        $scope.sortkey = '';

        $scope.sort = {
            sortingColumn: '',
            reverse: false
        };

        $scope.device_url = "switches"; 
        $scope.device_type = "Switches";
        var url = "/customer/switches/";
        var params = {'page': $scope.page_no};
        var id = angular.copy($stateParams.uuidc);

        $scope.ctrl = DeviceManageRequestFactory($scope);
        $scope.loaded = false;
        $rootScope.showConsole = false;

        $scope.updateActivityLog = function (index, instance_id, device_type) {
            ProxyDetailControllerService.updateActivityLog(instance_id, device_type);
        };

        var getDeviceName = function(device_name){
            var obj = {};
            switch(device_name){
                case 'servers' :
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
                case 'openstack' :
                    obj.device_name = 'Openstack Virtual Machine Statistics';
                    obj.device_api_name = 'openstack';
                    return obj;
                case 'custom_vm' :
                    obj.device_name = 'Custom Virtual Machine Statistics';
                    obj.device_api_name = 'custom_vm';
                    return obj;
                case 'firewalls' :
                    obj.device_name = 'Firewall Statistics';
                    obj.device_api_name = 'firewall';
                    return obj;
                case 'load_balancers' :
                    obj.device_name = 'LoadBalancer Statistics';
                    obj.device_api_name = 'load_balancer';
                    return obj; 
                case 'switches' :
                    obj.device_name = 'Switch Statistics';
                    obj.device_api_name = 'switch';
                    return obj; 
                default : 
                    console.log('something went wrong');
            }
        };

        $scope.getSortingResults = function(sort){
            if((sort !== undefined) && (sort !== null) && (sort !== '')){
                $scope.page_no = 1;
                $scope.sortkey = sort.sortingColumn;
                $scope.get_device_data(1);
            }
        };

        $scope.getSearchResults = function(){
            $scope.page_no = 1;
            $scope.get_device_data(1);
        };

        $scope.get_device_data = function (page) {

            params = {'page': page};

            if($state.$current.name != 'devices.switches'){
                params['uuid'] = id;
            }

            if(($scope.sortkey !== undefined) && ($scope.sortkey !== null) && ($scope.sortkey !== '')){
                params['ordering'] = $scope.sortkey;
            }

            if(($scope.searchkey !== undefined) && ($scope.searchkey !== null) && ($scope.searchkey !== '')){
                params['search'] = $scope.searchkey;
            }

            $http.get(url, {params:params}).then(function (response) {
                // $scope.model = response.data;
                if(page === 1)
                    $scope.model = response.data;
                else{
                    $scope.model.count = response.data.count;
                    $scope.model.results = $scope.model.results.concat(response.data.results);
                }
            }).catch(function (error) {
                if(page === 1)
                    $scope.model.results = [];
                AlertService2.danger("Unable to fetch data. Please contact Adminstrator.");
                console.log(error);
            });
        };

        $scope.get_device_data($scope.page_no);

        $scope.loadMoreResults = function() {
            if(angular.isDefined($scope.model.count) && angular.isDefined($rootScope.configObject.page_size)){
                var switches_loaded = $scope.model.results.length;
                if (( switches_loaded < $scope.model.count) && (($scope.page_no * $rootScope.configObject.page_size) == switches_loaded)) {
                    $scope.page_no = $scope.page_no + 1;
                    $scope.get_device_data(angular.copy($scope.page_no));
                }
            }
        };

        $scope.show_device_statistics = function(device_id){
             if($state.$current.name == 'devices.switches'){
                $state.go('devices.switch', {uuidp: device_id}, {reload: false});
             }
             else if($state.$current.name == 'pc_cloud.switches'){
                $state.go('pc_cloud.switch', {uuidc: id, uuidcc: device_id}, {reload: false});
             }
             else{
                $state.go('colo_cloud.pc_cloud.switch', {uuidc: id, uuidcc: device_id}, {reload: false});
             }
        };

        $scope.get_observium_details = function (device_name, device) {
            var device_obj = getDeviceName(device_name);
            if (device_obj.device_api_name === ('openstack' || 'custom_vm')){
                device.uuid = device.instance_id;
            }
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
        };


        $scope.updateActivityLog = function (index, instance_id, device_type) {
            ProxyDetailControllerService.updateActivityLog(instance_id, device_type);
        };

        $scope.proxySameTab = function (index, row_uuid, device_type, proxy_url) {
            $scope.updateActivityLog(index, row_uuid, device_type);
            $scope.showProxy = true;
            $scope.proxy_url = proxy_url;
        };

        $scope.ConsoleSameTab = function (index, instance_id) {
            $http({
                method: "GET",
                url: url + instance_id
            }).then(function (response) {

                $scope.loader = false;
                $scope.device_name = response.data.name;

                if (response.data.management_ip) {
                    $scope.request = {
                        hostname: response.data.management_ip,
                        port: 2122,
                    };
                }
                else {
                    $scope.disableAccess = true;
                }

                $rootScope.showConsole = false;
                $scope.endpoint = url + instance_id + '/check_auth/';
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

        $scope.close_console = function () {
            $scope.updateTitle();
            $rootScope.showConsole = false;
            $scope.showProxy = false;
        };
        $scope.updateTitle = function () {
            $rootScope.header = "";
            $scope.title = {
                plural: "Unity",
                singular: "Unity"
            };
            if ($scope.$parent == $scope.$root) $scope.$root.title = $scope.title;
        };
    }
]);

app.controller('LoadBalancerController', [
    '$scope',
    '$state',
    '$stateParams',
    '$http',
    '$uibModal',
    'AlertService2',
    'AbstractControllerFactory2',
    'CustomerULDBService',
    '$rootScope',
    'ProxyDetailControllerService',
    'DeviceManageRequestFactory',
    function ($scope, $state, $stateParams, $http, $uibModal, AlertService2, AbstractControllerFactory2, CustomerULDBService, $rootScope, ProxyDetailControllerService, DeviceManageRequestFactory) {

        console.log('in LoadBalancerController');

        $scope.page_no = 1;
        $scope.model = {};
        $scope.searchkey = '';
        $scope.sortkey = '';

        $scope.sort = {
            sortingColumn: '',
            reverse: false
        };

        $scope.device_url = "load_balancers"; 
        $scope.device_type = "Load Balancers";
        var url = "/customer/load_balancers/";
        var params = {'page': $scope.page_no};
        var id = angular.copy($stateParams.uuidc);

        $scope.ctrl = DeviceManageRequestFactory($scope);
        $scope.loaded = false;
        $rootScope.showConsole = false;

        $scope.updateActivityLog = function (index, instance_id, device_type) {
            ProxyDetailControllerService.updateActivityLog(instance_id, device_type);
        };

        var getDeviceName = function(device_name){
            var obj = {};
            switch(device_name){
                case 'servers' :
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
                case 'openstack' :
                    obj.device_name = 'Openstack Virtual Machine Statistics';
                    obj.device_api_name = 'openstack';
                    return obj;
                case 'custom_vm' :
                    obj.device_name = 'Custom Virtual Machine Statistics';
                    obj.device_api_name = 'custom_vm';
                    return obj;
                case 'firewalls' :
                    obj.device_name = 'Firewall Statistics';
                    obj.device_api_name = 'firewall';
                    return obj;
                case 'load_balancers' :
                    obj.device_name = 'LoadBalancer Statistics';
                    obj.device_api_name = 'load_balancer';
                    return obj; 
                case 'switches' :
                    obj.device_name = 'Switch Statistics';
                    obj.device_api_name = 'switch';
                    return obj; 
                default : 
                    console.log('something went wrong');
            }
        };

        $scope.getSortingResults = function(sort){
            if((sort !== undefined) && (sort !== null) && (sort !== '')){
                $scope.page_no = 1;
                $scope.sortkey = sort.sortingColumn;
                $scope.get_device_data(1);
            }
        };

        $scope.getSearchResults = function(){
            $scope.page_no = 1;
            $scope.get_device_data(1);
        };

        $scope.get_device_data = function (page) {

            params = {'page': page};

            if($state.$current.name != 'devices.load_balancers'){
                params['uuid'] = id;
            }

            if(($scope.sortkey !== undefined) && ($scope.sortkey !== null) && ($scope.sortkey !== '')){
                params['ordering'] = $scope.sortkey;
            }

            if(($scope.searchkey !== undefined) && ($scope.searchkey !== null) && ($scope.searchkey !== '')){
                params['search'] = $scope.searchkey;
            }

            $http.get(url, {params:params}).then(function (response) {
                // $scope.model = response.data;
                if(page === 1)
                    $scope.model = response.data;
                else{
                    $scope.model.count = response.data.count;
                    $scope.model.results = $scope.model.results.concat(response.data.results);
                }
            }).catch(function (error) {
                if(page === 1)
                    $scope.model.results = [];
                AlertService2.danger("Unable to fetch data. Please contact Adminstrator.");
                console.log(error);
            });
        };

        $scope.get_device_data($scope.page_no);

        $scope.loadMoreResults = function() {
            if(angular.isDefined($scope.model.count) && angular.isDefined($rootScope.configObject.page_size)){
                var lbs_loaded = $scope.model.results.length;
                if (( lbs_loaded < $scope.model.count) && (($scope.page_no * $rootScope.configObject.page_size) == lbs_loaded)) {
                    $scope.page_no = $scope.page_no + 1;
                    $scope.get_device_data(angular.copy($scope.page_no));
                }
            }
        };

        $scope.show_device_statistics = function(device_id){
             if($state.$current.name == 'devices.load_balancers'){
                $state.go('devices.load_balancer', {uuidp: device_id}, {reload: false});
             }
             else if($state.$current.name == 'pc_cloud.load_balancers'){
                $state.go('pc_cloud.load_balancer', {uuidc: id, uuidcc: device_id}, {reload: false});
             }
             else{
                $state.go('colo_cloud.pc_cloud.load_balancer', {uuidc: id, uuidcc: device_id}, {reload: false});
             }
        };

        $scope.get_observium_details = function (device_name, device) {
            var device_obj = getDeviceName(device_name);
            if (device_obj.device_api_name === ('openstack' || 'custom_vm')){
                device.uuid = device.instance_id;
            }
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
        };


        $scope.updateActivityLog = function (index, instance_id, device_type) {
            ProxyDetailControllerService.updateActivityLog(instance_id, device_type);
        };

        $scope.proxySameTab = function (index, row_uuid, device_type, proxy_url) {
            $scope.updateActivityLog(index, row_uuid, device_type);
            $scope.showProxy = true;
            $scope.proxy_url = proxy_url;
        };

        $scope.ConsoleSameTab = function (index, instance_id) {
            $http({
                method: "GET",
                url: url + instance_id
            }).then(function (response) {

                $scope.loader = false;
                $scope.device_name = response.data.name;

                if (response.data.management_ip) {
                    $scope.request = {
                        hostname: response.data.management_ip,
                        port: 2122,
                    };
                }
                else {
                    $scope.disableAccess = true;
                }

                $rootScope.showConsole = false;
                $scope.endpoint = url + instance_id + '/check_auth/';
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

        $scope.close_console = function () {
            $scope.updateTitle();
            $rootScope.showConsole = false;
            $scope.showProxy = false;
        };
        $scope.updateTitle = function () {
            $rootScope.header = "";
            $scope.title = {
                plural: "Unity",
                singular: "Unity"
            };
            if ($scope.$parent == $scope.$root) $scope.$root.title = $scope.title;
        };
    }
]);

app.controller('FirewallController', [
    '$scope',
    '$state',
    '$stateParams',
    '$http',
    '$uibModal',
    'AbstractModelServiceFactory',
    'AlertService2',
    'AbstractControllerFactory2',
    'CustomerULDBService',
    '$rootScope',
    'ProxyDetailControllerService',
    'DeviceManageRequestFactory',
    function ($scope, $state, $stateParams, $http, $uibModal, AbstractModelServiceFactory, AlertService2, AbstractControllerFactory2, CustomerULDBService, $rootScope, ProxyDetailControllerService, DeviceManageRequestFactory) {

        console.log('in FirewallController');

        $scope.page_no = 1;
        $scope.model = {};
        $scope.searchkey = '';
        $scope.sortkey = '';

        $scope.sort = {
            sortingColumn: '',
            reverse: false
        };

        $scope.device_url = "firewalls"; 
        $scope.device_type = "Firewalls";
        var url = "/customer/firewalls/";
        var params = {'page': $scope.page_no};
        var id = angular.copy($stateParams.uuidc);

        $scope.ctrl = DeviceManageRequestFactory($scope);
        $scope.loaded = false;
        $rootScope.showConsole = false;

        $scope.updateActivityLog = function (index, instance_id, device_type) {
            ProxyDetailControllerService.updateActivityLog(instance_id, device_type);
        };

        var getDeviceName = function(device_name){
            var obj = {};
            switch(device_name){
                case 'servers' :
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
                case 'openstack' :
                    obj.device_name = 'Openstack Virtual Machine Statistics';
                    obj.device_api_name = 'openstack';
                    return obj;
                case 'custom_vm' :
                    obj.device_name = 'Custom Virtual Machine Statistics';
                    obj.device_api_name = 'custom_vm';
                    return obj;
                case 'firewalls' :
                    obj.device_name = 'Firewall Statistics';
                    obj.device_api_name = 'firewall';
                    return obj;
                case 'load_balancers' :
                    obj.device_name = 'LoadBalancer Statistics';
                    obj.device_api_name = 'load_balancer';
                    return obj; 
                case 'switches' :
                    obj.device_name = 'Switch Statistics';
                    obj.device_api_name = 'switch';
                    return obj; 
                default : 
                    console.log('something went wrong');
            }
        };

        $scope.getSortingResults = function(sort){
            if((sort !== undefined) && (sort !== null) && (sort !== '')){
                $scope.page_no = 1;
                $scope.sortkey = sort.sortingColumn;
                $scope.get_device_data(1);
            }
        };

        $scope.getSearchResults = function(){
            $scope.page_no = 1;
            $scope.get_device_data(1);
        };

        $scope.get_device_data = function (page) {

            params = {'page': page};

            if($state.$current.name != 'devices.firewalls'){
                params['uuid'] = id;
            }

            if(($scope.sortkey !== undefined) && ($scope.sortkey !== null) && ($scope.sortkey !== '')){
                params['ordering'] = $scope.sortkey;
            }

            if(($scope.searchkey !== undefined) && ($scope.searchkey !== null) && ($scope.searchkey !== '')){
                params['search'] = $scope.searchkey;
            }

            $http.get(url, {params:params}).then(function (response) {
                // $scope.model = response.data;
                if(page === 1)
                    $scope.model = response.data;
                else{
                    $scope.model.count = response.data.count;
                    $scope.model.results = $scope.model.results.concat(response.data.results);
                }
            }).catch(function (error) {
                if(page === 1)
                    $scope.model.results = [];
                AlertService2.danger("Unable to fetch data. Please contact Adminstrator.");
                console.log(error);
            });
        };

        $scope.get_device_data($scope.page_no);

        $scope.loadMoreResults = function() {
            if(angular.isDefined($scope.model.count) && angular.isDefined($rootScope.configObject.page_size)){
                var firewalls_loaded = $scope.model.results.length;
                if (( firewalls_loaded < $scope.model.count) && (($scope.page_no * $rootScope.configObject.page_size) == firewalls_loaded)) {
                    $scope.page_no = $scope.page_no + 1;
                    $scope.get_device_data(angular.copy($scope.page_no));
                }
            }
        };

        $scope.show_device_statistics = function(device_id){
             if($state.$current.name == 'devices.firewalls'){
                $state.go('devices.firewall', {uuidp: device_id}, {reload: false});
             }
             else if($state.$current.name == 'pc_cloud.firewalls'){
                $state.go('pc_cloud.firewall', {uuidc: id, uuidcc: device_id}, {reload: false});
             }
             else{
                $state.go('colo_cloud.pc_cloud.firewall', {uuidc: id, uuidcc: device_id}, {reload: false});
             }
        };

        $scope.get_observium_details = function (device_name, device) {
            var device_obj = getDeviceName(device_name);
            if (device_obj.device_api_name === ('openstack' || 'custom_vm')){
                device.uuid = device.instance_id;
            }
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
        };


        $scope.updateActivityLog = function (index, instance_id, device_type) {
            ProxyDetailControllerService.updateActivityLog(instance_id, device_type);
        };

        $scope.proxySameTab = function (index, row_uuid, device_type, proxy_url) {
            $scope.updateActivityLog(index, row_uuid, device_type);
            $scope.showProxy = true;
            $scope.proxy_url = proxy_url;
        };

        $scope.ConsoleSameTab = function (index, instance_id) {
            $http({
                method: "GET",
                url: url + instance_id
            }).then(function (response) {

                $scope.loader = false;
                $scope.device_name = response.data.name;

                if (response.data.management_ip) {
                    $scope.request = {
                        hostname: response.data.management_ip,
                        port: 2122,
                    };
                }
                else {
                    $scope.disableAccess = true;
                }

                $rootScope.showConsole = false;
                $scope.endpoint = url + instance_id + '/check_auth/';
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

        $scope.close_console = function () {
            $scope.updateTitle();
            $rootScope.showConsole = false;
            $scope.showProxy = false;
        };
        $scope.updateTitle = function () {
            $rootScope.header = "";
            $scope.title = {
                plural: "Unity",
                singular: "Unity"
            };
            if ($scope.$parent == $scope.$root) $scope.$root.title = $scope.title;
        };
    }
]);


app.controller('CabinetController', [
    '$scope',
    '$rootScope',
    '$state',
    '$timeout',
    'CustomerCabinet',
    '$uibModal',
    'AbstractControllerFactory2',
    function ($scope, $rootScope, $state, $timeout, CustomerCabinet, $uibModal, AbstractControllerFactory2) {
        $scope.ctrl = AbstractControllerFactory2($scope, CustomerCabinet, $rootScope.configObject);

        $scope.title = {
            singular: 'Cabinet',
            plural: 'Cabinets'
        };
        $scope.device_type = 'cabinet';

        $scope.disable_action = false;
        $scope.disable_action_btn = true;

        $scope.showDetails = function (uuid, type) {
            $scope.uuid = uuid;
            $scope.type = type;
            if (type == "Cabinet") {
                $scope.related = true;
                var controller = 'CabinetDetailController';
            }
            else if (type == "PDU") {
                $scope.related = false;
                controller = "PDUDetailController";
            }
            else if (type == "Cage") {
                $scope.related = true;
                controller = 'CageDetailController';
            }
            showmodel('static/rest/app/client/templates/colo-details.html', controller);
        };

        $scope.rows = [
            {
                name: "name", description: "Name", required: true,
                opaque: 'link',
                read: function (result) {
                    return {
                        uuid: result.uuid,
                        type: "Cabinet",
                        innerText: result.name
                    };
                }
            },
            {name: "model", description: "Model", required: true, is_sort_disabled: true},
            {
                name: "datacenter", description: "Data Center",
                opaque: 'stringTransform',
                is_sort_disabled: true,
                read: function (result) {
                    return result.datacenter.name;
                }
            }
        ];

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

        $scope.loadPageData = function () {
            if (angular.isDefined($scope.model.currentPage) && angular.isDefined($scope.model.count) && angular.isDefined($rootScope.configObject.page_size)) {
                if (($scope.model.currentPage * $rootScope.configObject.page_size) < $scope.model.count) {
                    $scope.model.currentPage = $scope.model.currentPage + 1;
                    $scope.reloadPage();
                }
            }
        };

        $scope.showCabinetView = function (cabinet) {
            $state.go('colo.cabinetview', {uuidp: cabinet.uuid}, {reload: false});
            $timeout(function () {
                $scope.addClassforTabs('.actonecls ul', 0);
            }, 1000);
        };
    }
]);

app.controller('PDUController', [
    '$scope',
    '$state',
    '$rootScope',
    '$timeout',
    '$http',
    'CustomerPDU',
    '$uibModal',
    'AbstractControllerFactory2',
    function ($scope, $state, $rootScope, $timeout, $http, CustomerPDU, $uibModal, AbstractControllerFactory2) {
        $scope.ctrl = AbstractControllerFactory2($scope, CustomerPDU, $rootScope.configObject);
        $scope.device_type = 'pdu';
        $scope.title = {
            singular: 'PDU',
            plural: "PDUs"
        };

        $scope.popoverobj = {
            content: 'Hello, World!',
            templateUrl: 'pdudetailstemplate.html',
            title: 'Title'
        };

        $scope.disable_action = false;
        $scope.disable_action_btn = true;

        $scope.rows = [
            {
                name: "name", description: "Name",
                opaque: 'link',
                read: function (result) {
                    $scope.uuid = result.uuid;
                    return {
                        uuid: result.uuid,
                        type: "PDU",
                        innerText: result.name
                    };
                }
            },
            {name: "ip_address", description: "IP Address"},
            {name: "pdu_model", description: "Model", is_sort_disabled: true},
            {
                name: "cabinet", description: "Cabinet",
                opaque: 'stringTransform',
                is_sort_disabled: true,
                read: function (result) {
                    return result.cabinet.name;
                }
            }
        ];

        $scope.cancel = function () {
            modalInstance.dismiss('cancel');
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

        $scope.show_health_statistics = function (pdu_id) {
            $state.go('colo.pdu', {uuidp: pdu_id}, {reload: false});
            $timeout(function () {
                $scope.addClassforTabs('.actonecls ul', 1);
            }, 1000);
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

        $scope.loadPageData = function () {
            if (angular.isDefined($scope.model.currentPage) && angular.isDefined($scope.model.count) && angular.isDefined($rootScope.configObject.page_size)) {
                if (($scope.model.currentPage * $rootScope.configObject.page_size) < $scope.model.count) {
                    $scope.model.currentPage = $scope.model.currentPage + 1;
                    $scope.reloadPage();
                }
            }
        };

        $scope.get_pdu_details = function (pdu) {
            pdu.observium_details = {};
            $http({
                method: "GET",
                url: '/customer/observium/pdu/' + pdu.uuid + '/get_device_data/'
            }).then(function (response) {
                pdu.observium_details = response.data;
                pdu.observium_details.device_data.uptime = $scope.getuptime(response.data);
            }).catch(function (error) {
                pdu.observium_details = null;
            });
        };

        $scope.show_observium_details = function (pdu) {
            $scope.pdu_details = pdu.observium_details;
        };

    }
]);

app.controller('CageController', [
    '$scope',
    '$rootScope',
    'CustomerCage',
    '$uibModal',
    'AbstractControllerFactory2',
    function ($scope, $rootScope, CustomerCage, $uibModal, AbstractControllerFactory2) {
        $scope.ctrl = AbstractControllerFactory2($scope, CustomerCage, $rootScope.configObject);

        $scope.title = {
            singular: 'Cage',
            plural: 'Cages'
        };
        $scope.device_type = 'cage';

        $scope.disable_action = true;
        $scope.disable_action_btn = true;

        $scope.rows = [
            {
                name: "name", description: "Name", required: true,
                opaque: 'link',
                read: function (result) {
                    return {
                        uuid: result.uuid,
                        type: "Cage",
                        innerText: result.name
                    };
                }
            },
            {
                name: "datacenter", description: "Data Center",
                opaque: 'stringTransform',
                is_sort_disabled: true,
                read: function (result) {
                    if (result.datacenter != undefined) {
                        return result.datacenter.name;
                    }
                }
            }
        ];

        $scope.showDetails = function (uuid, type) {
            $scope.uuid = uuid;
            $scope.type = type;
            if (type == "Cabinet") {
                $scope.related = true;
                var controller = 'CabinetDetailController';
            }
            else if (type == "PDU") {
                $scope.related = false;
                controller = "PDUDetailController";
            }
            else if (type == "Cage") {
                $scope.related = true;
                controller = 'CageDetailController';
            }
            showmodel('static/rest/app/client/templates/colo-details.html', controller);
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
                scope: $scope,
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

        $scope.loadPageData = function () {
            if (angular.isDefined($scope.model.currentPage) && angular.isDefined($scope.model.count) && angular.isDefined($rootScope.configObject.page_size)) {
                if (($scope.model.currentPage * $rootScope.configObject.page_size) < $scope.model.count) {
                    $scope.model.currentPage = $scope.model.currentPage + 1;
                    $scope.reloadPage();
                }
            }
        };
    }
]);

app.controller('UserSettingController', [
    '$scope',
    '$routeParams',
    '$location',
    'CustomerUserAccount',
    'CustomerUserProfile',
    'AlertService',
    '$uibModal',
    'BreadCrumbService',
    function ($scope, $routeParams, $location, CustomerUserAccount, CustomerUserProfile, AlertService, $uibModal, BreadCrumbService) {

        var resourceClass = CustomerUserAccount;

        $scope.showmessage = false;

        if (window.savechanges && window.savechanges != "") {

            $scope.showmessage = true;
            $scope.alertMsg = window.savechanges;
            window.savechanges = "";
        }
        else {
            $scope.showmessage = false;
            window.savechanges = "";
        }

        $scope.closeAlert = function () {
            $scope.showmessage = false;
        };

        $scope.bread = BreadCrumbService;

        $scope.chgpwd = false;

        $scope.old_password = "";

        $scope.$on('$destroy', function () {
            $scope.bread.pushIfTop({name: "User Account", url: '#/account/'}, $scope);
        });

        resourceClass.get().$promise.then(function (response) {

            $scope.orgprofileresult = response.customer;
            $scope.accessresult = response.user_accesslist;
            if (response.last_login) {
                $scope.recentactivityresult = {last_login: response.last_login};
            }

        });

        CustomerUserProfile.get().$promise.then(function (response) {
            $scope.userid = response.results[0].uuid;
            window.pwduserid = response.results[0].uuid;
        });

        $scope.orgprofilecols = [
            {name: 'organization_name', description: 'Name', required: true},
            {name: 'address1', description: 'Address1', required: true},
            {name: 'address2', description: 'Address2', required: true},
            {name: 'city', description: 'City', required: true},
            {name: 'state', description: 'State', required: true},
            {name: 'domain', description: 'Domain', required: true},
            {name: 'phone', description: 'Contact', required: true},
            {name: 'email', description: 'Email', required: true}
        ];

        $scope.recentactivitycols = [
            {name: 'last_login', description: 'Last Login', required: true}
        ];

        $scope.changePassword = function () {

            var modalInstance = $uibModal.open({
                templateUrl: '/static/rest/app/templates/modal/changepwdmodal.html',
                controller: 'ChangeUserPasswordModalController',
                scope: $scope,
                size: 'md'
            });
            modalInstance.result.then();

        };
    }
]);

app.controller('ChangeUserPasswordModalController', [
    '$scope',
    '$routeParams',
    '$location',
    'CustomerChangePassword',
    'AlertService2',
    '$uibModal',
    '$uibModalInstance',
    function ($scope, $routeParams, $location, CustomerChangePassword, AlertService2, $uibModal, $uibModalInstance) {

        $scope.pwd = new CustomerChangePassword();

        $scope.servererror = false;

        $scope.ClearValidation = function () {
            $scope.oldpwdMsg = "";
            $scope.newpwd1Msg = "";
            $scope.newpwd2Msg = "";
            $scope.msg = "";
        };


        $scope.changepwd = function () {

            var pwdvalidated = true;

            $scope.pwd.uuid = window.pwduserid;

            if ($scope.pwd.old_password) {
                $scope.oldpwderr = false;
                if (pwdvalidated)
                    pwdvalidated = true;
            }
            else {
                $scope.oldpwderr = true;
                pwdvalidated = false;
                $scope.oldpwdMsg = "This field is required";
            }

            if ($scope.pwd.new_password1) {
                $scope.newpwd1err = false;
                if (pwdvalidated)
                    pwdvalidated = true;
            }
            else {
                $scope.newpwd1err = true;
                pwdvalidated = false;
                $scope.newpwd1Msg = "This field is required";
            }

            if ($scope.pwd.new_password2) {
                $scope.newpwd2err = false;
                if (pwdvalidated)
                    pwdvalidated = true;
            }
            else {
                $scope.newpwd2err = true;
                pwdvalidated = false;
                $scope.newpwd2Msg = "This field is required";
            }

            if ($scope.pwd.new_password1 && $scope.pwd.new_password2) {
                if ($scope.pwd.new_password1 == $scope.pwd.new_password2) {
                    $scope.newpwd2err = false;
                    if (pwdvalidated)
                        pwdvalidated = true;
                }
                else {
                    $scope.newpwd2err = true;
                    pwdvalidated = false;
                    $scope.newpwd2Msg = "Both new passwords must be same";
                }
            }


            if (pwdvalidated) {

                $scope.pwd.$save().then(function (result) {

                    var pwdvalidated = false;

                    if (result.detail) {
                        window.savechanges = result.detail;
                        $uibModalInstance.close();
                        $location.path("/setting/");
                    }

                    if (result.Error) {

                        $scope.oldpwderr = true;
                        $scope.oldpwdMsg = result.Error;
                    }


                });
            }

        };

        $scope.cancelpwd = function () {
            $uibModalInstance.close();
        };

    }
]);

app.controller('UserMenuController', [
    '$scope',
    '$state',
    '$rootScope',
    '$transitions',
    '$http',
    '$sce',
    'ngNotify',
    '$window',
    '$filter',
    '$timeout',
    '$urlRouter',
    '$location',
    '$uibModal',
    'localStorageService',
    'AlertService2',
    function ($scope, $state, $rootScope, $transitions, $http, $sce, ngNotify, $window, $filter, $timeout, $urlRouter, $location, $uibModal, localStorageService, AlertService2) {

        $scope.oneAtATime = true;
        $scope.open = [];
        $scope.toggleMinimized = true;

        $rootScope.selectedSubMenuItem = {};
        $rootScope.selectedSecondlevelMenuItem = {};
        $rootScope.selectedThirdlevelMenuItem = {};
        $rootScope.selectedFourthlevelMenuItem = {};

        angular.element('#content-area').sidebar();

        var checkObjExists = function (objArray, Obj, level) {
            if(objArray){
                if (level === 1) {
                    for (var i = 0; i < objArray.length; i++) {
                        for (var j = 0; j < objArray[i].submenu.length; j++) {
                            if (Obj === objArray[i].submenu[j].state) {
                                return objArray[i].submenu[j];
                            }
                        }
                    }
                } else {
                    for (var i = 0; i < objArray.length; i++) {
                        if (Obj === objArray[i].state) {
                            return objArray[i];
                        }
                    }
                }
            }
            
            return null;
        };

        var getStateName = function (statelistArr, level) {
            switch (level) {
                case 1 :
                    return statelistArr[0];
                case 2 :
                    return statelistArr[0] + '.' + statelistArr[1];
                case 3 :
                    return statelistArr[0] + '.' + statelistArr[1] + '.' + statelistArr[2];
                case 4 :
                    return statelistArr[0] + '.' + statelistArr[1] + '.' + statelistArr[2] + '.' + statelistArr[3];
            }
        };

        $rootScope.getSubmenuObjects = function () {
            var statelist = $rootScope.toState.name.split('.');
            var selectedSubMenuItem = checkObjExists($rootScope.menuItems, getStateName(statelist, 1), 1);
            if (selectedSubMenuItem !== null) {
                $rootScope.selectedSubMenuItem = angular.copy(selectedSubMenuItem);
                if (angular.isDefined(selectedSubMenuItem.submenu)) {
                    var selectedSecondlevelMenuItem = checkObjExists(selectedSubMenuItem.submenu, getStateName(statelist, 2));
                    if (selectedSecondlevelMenuItem !== null) {
                        $rootScope.selectedSecondlevelMenuItem = selectedSecondlevelMenuItem;
                        if (angular.isDefined(selectedSecondlevelMenuItem.submenu)) {
                            var selectedThirdlevelMenuItem = checkObjExists(selectedSecondlevelMenuItem.submenu, getStateName(statelist, 3));
                            if (selectedThirdlevelMenuItem !== null) {
                                $rootScope.selectedThirdlevelMenuItem = selectedThirdlevelMenuItem;
                                if (angular.isDefined(selectedThirdlevelMenuItem.submenu)) {
                                    var selectedFourthlevelMenuItem = checkObjExists(selectedThirdlevelMenuItem.submenu, getStateName(statelist, 4));
                                    if (selectedFourthlevelMenuItem !== null) {
                                        $rootScope.selectedFourthlevelMenuItem = selectedFourthlevelMenuItem;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        };

        $scope.getUrlParams = function (url, level) {
            switch (level) {
                case 1 :
                    var params = url.split('/').pop();
                    if (angular.copy(params) === '') {
                        params = url.split('/').slice(0, -1).pop();
                    }
                    break;
                case 2 :
                    params = {};
                    params.first = url.split('/').pop();
                    if (angular.copy(params.first) === '') {
                        params.first = url.split('/').slice(0, -1).pop();
                        params.second = url.split('/').slice(0, -1).slice(0, -1).pop();
                    } else {
                        params.second = url.split('/').slice(0, -1).pop();
                    }
                    break;
                case 3 :
                    params = {};
                    params.first = url.split('/').pop();
                    if (angular.copy(params.first) === '') {
                        params.first = url.split('/').slice(0, -1).pop();
                        params.second = url.split('/').slice(0, -1).slice(0, -1).pop();
                        params.third = url.split('/').slice(0, -1).slice(0, -1).slice(0, -1).pop();
                    } else {
                        params.second = url.split('/').slice(0, -1).pop();
                        params.third = url.split('/').slice(0, -1).slice(0, -1).pop();
                    }
                    break;
                default :
                    console.log('something went wrong');
            }
            return params;
        };

        $scope.setRootMenu = function (menuobj) {
            $rootScope.menuItems = angular.copy(menuobj);
            $rootScope.privateClouldObj = checkObjExists($rootScope.menuItems, 'private_cloud', 1);
            // console.log('private cloud obj : ', angular.toJson($rootScope.privateClouldObj));
            if ($rootScope.privateClouldObj !== null) {
                for (var i = 0; i < $rootScope.privateClouldObj.submenu.length; i++) {
                    var state = {
                        name: $rootScope.privateClouldObj.submenu[i].state,
                        url: '/:uuidp',
                        templateUrl: '/static/rest/app/client/templates/cloud/private_cloud_detail.html',
                        controller: 'CustomerPrivateCloudDetailController',
                        data: {
                            displayName: $rootScope.privateClouldObj.submenu[i].name,
                            index: i,
                            index1: 0
                        }
                    };
                    $rootScope.$stateProviderRef.state(state.name, state);

                    for (var j = 0; j < $rootScope.privateClouldObj.submenu[i].submenu.length; j++) {
                        var childstate = {
                            name: $rootScope.privateClouldObj.submenu[i].submenu[j].state,
                            url: '/:uuidc',
                            templateUrl: '/static/rest/app/client/templates/cloud/private_cloud_detail.html',
                            controller: 'CustomerPrivateCloudDetailController',
                            data: {
                                displayName: $rootScope.privateClouldObj.submenu[i].submenu[j].name
                            }
                        };
                        $rootScope.$stateProviderRef.state(childstate.name, childstate);
                    }

                    for (var j = 0; j < $rootScope.privateClouldObj.submenu[i].submenu_observium.length; j++) {
                        var childstate = {
                            name: $rootScope.privateClouldObj.submenu[i].submenu_observium[j].state,
                            url: $rootScope.privateClouldObj.submenu[i].submenu_observium[j].url,
                            templateUrl: $rootScope.privateClouldObj.submenu[i].submenu_observium[j].template,
                            controller: $rootScope.privateClouldObj.submenu[i].submenu_observium[j].controller,
                            data: {
                                displayName: $rootScope.privateClouldObj.submenu[i].submenu_observium[j].name,
                                index: 0,
                                index1: $rootScope.privateClouldObj.submenu[i].submenu_observium[j].index1
                            }
                        };
                        $rootScope.$stateProviderRef.state(childstate.name, childstate);

                        for (var k = 0; k < $rootScope.privateClouldObj.submenu[i].submenu_observium[j].submenu.length; k++) {
                            var subchildstate = {
                                name: $rootScope.privateClouldObj.submenu[i].submenu_observium[j].submenu[k].state,
                                url: $rootScope.privateClouldObj.submenu[i].submenu_observium[j].submenu[k].url,
                                templateUrl: $rootScope.privateClouldObj.submenu[i].submenu_observium[j].submenu[k].template,
                                controller: $rootScope.privateClouldObj.submenu[i].submenu_observium[j].submenu[k].controller,
                                data: {
                                    displayName: $rootScope.privateClouldObj.submenu[i].submenu_observium[j].submenu[k].name,
                                    index: 0,
                                    index1: $rootScope.privateClouldObj.submenu[i].submenu_observium[j].submenu[k].index1
                                }
                            };
                            $rootScope.$stateProviderRef.state(subchildstate.name, subchildstate);
                        }
                    }
                }
            }

            $urlRouter.sync();
            $urlRouter.listen();
        };

        $scope.addClassforTabs = function (tabclass, index) {
            $timeout(function () {
                angular.element(tabclass).children('li').eq(index).addClass("active");
            }, 0);
        };

        $scope.removeClassforTabs = function (tabclass, index) {
            var cond = ((tabclass === '.actonecls ul') && (index !== $rootScope.secondLevelActiveIndex)) ||
                ((tabclass === '.acttwocls ul') && (index !== $rootScope.thirdLevelActiveIndex));

            if (cond) {
                angular.element(tabclass).children('li').eq(index).removeClass("active");
            }
        };

        $scope.removeCCloudTabsSelection = function (tabclass, index) {
            console.log('index : ', index);
            console.log(angular.element(tabclass).children('li').eq(index));
            angular.element(tabclass).children('li').eq(index).removeClass("active");
        };

        $scope.stateParamsObject = function (submenuitem, level, index1, index2, index3) {
            var uuidparamobj = {};
            switch (level) {
                case 1 :
                    uuidparamobj['uuidc'] = null;
                    return uuidparamobj;
                case 2 :
                    uuidparamobj['uuidc'] = submenuitem.submenu[index1].uuid;
                    return uuidparamobj;
                case 3 :
                    if (angular.isDefined(submenuitem.submenu[index1].uuid)) {
                        uuidparamobj['uuidp'] = submenuitem.submenu[index1].uuid;
                    }
                    uuidparamobj['uuidc'] = submenuitem.submenu[index1].submenu[index2].uuid;
                    return uuidparamobj;
                case 4 :
                    if (angular.isDefined(submenuitem.submenu[index1].uuid)) {
                        uuidparamobj['uuidrp'] = submenuitem.submenu[index1].uuid;
                    }
                    if (angular.isDefined(submenuitem.submenu[index1].submenu[index2].uuid)) {
                        uuidparamobj['uuidp'] = submenuitem.submenu[index1].submenu[index2].uuid;
                    }
                    uuidparamobj['uuidc'] = submenuitem.submenu[index1].submenu[index2].submenu[index3].uuid;
                    return uuidparamobj;
                default :
                    console('Something went wrong in switch case of getUUIDObject()');
            }
        };

        var manageFourthLevelSubmenu = function (submenuitem) {
            $rootScope.selectedSecondlevelMenuItem = angular.copy(submenuitem.submenu[0]);
            $rootScope.selectedThirdlevelMenuItem = angular.copy(submenuitem.submenu[0].submenu[0]);
            $rootScope.selectedFourthlevelMenuItem = angular.copy(submenuitem.submenu[0].submenu[0].submenu[0]);
        };

        var manageThirdLevelSubmenu = function (submenuitem) {
            $rootScope.selectedSecondlevelMenuItem = angular.copy(submenuitem.submenu[0]);
            $rootScope.selectedThirdlevelMenuItem = angular.copy(submenuitem.submenu[0].submenu[0]);
        };

        var manageSecondLevelSubmenu = function (submenuitem) {
            $rootScope.selectedSecondlevelMenuItem = angular.copy(submenuitem.submenu[0]);
        };

        $scope.selectMenuItem = function (submenuitem) {
            if (angular.isDefined(submenuitem.submenu) && (submenuitem.submenu.length === 0)) {
                return;
            } else if (!angular.equals($rootScope.selectedSubMenuItem, submenuitem)) {
                $rootScope.selectedSubMenuItem = angular.copy(submenuitem);
            }

            if (angular.isDefined($rootScope.selectedSubMenuItem.submenu) && angular.isDefined($rootScope.selectedSubMenuItem.submenu[0].submenu) && angular.isDefined($rootScope.selectedSubMenuItem.submenu[0].submenu[0].submenu)) {
                manageFourthLevelSubmenu($rootScope.selectedSubMenuItem);
            } else if (angular.isDefined($rootScope.selectedSubMenuItem.submenu) && angular.isDefined($rootScope.selectedSubMenuItem.submenu[0].submenu)) {
                manageThirdLevelSubmenu($rootScope.selectedSubMenuItem);
            } else if (angular.isDefined($rootScope.selectedSubMenuItem.submenu)) {
                manageSecondLevelSubmenu($rootScope.selectedSubMenuItem);
            } else {
                console.log('clicked item dont have any submenu. So loading page directly');
            }
            $rootScope.secondLevelActiveIndex = 0;
            $rootScope.thirdLevelActiveIndex = 0;
            $timeout(function () {
                $scope.addClassforTabs('.actonecls ul', 0);
            }, 1000);
        };

        // overriding defaults per scrollbar
        $scope.scrollbarConfig = {
            theme: 'light-3',
            scrollInertia: 500,
            autoHideScrollbar: false,
            setHeight: '90%',
            axis: 'y',
            advanced: {
                updateOnContentResize: true
            },
            scrollButtons: {
                scrollAmount: 'auto', // scroll amount when button pressed
                enable: true // enable scrolling buttons by default
            }
        };

        $scope.containsInArray = function (arr, elem) {
            var i = angular.copy(arr.length);
            while (i--) {
                if (arr[i] === elem) {
                    return true;
                }
            }
            return false;
        };

        $scope.toggle = function () {
            $scope.open = [];
            var toggleMinimized = $scope.containsInArray(angular.element('#content-area')["0"].classList, 'minimized');
            if (toggleMinimized) {
                angular.element('#arrow').removeClass('fa fa-chevron-right').addClass('fa fa-chevron-left');
                $timeout(function () {
                    $scope.toggleMinimized = true;
                }, 100);
            } else {
                angular.element('#arrow').removeClass('fa fa-chevron-left').addClass('fa fa-chevron-right');
                $scope.toggleMinimized = false;
            }
        };


        $scope.iconClick = function () {
            var leftbarMinimized = $scope.containsInArray(angular.element('#content-area')["0"].classList, 'minimized');
            if (leftbarMinimized) {
                angular.element('#content-area').removeClass('minimized');
                angular.element('#arrow').removeClass('fa fa-chevron-right').addClass('fa fa-chevron-left');
                $timeout(function () {
                    $scope.toggleMinimized = true;
                }, 100);
            }
        };

        $scope.logout = function () {
            $http.post('logout/').then(function (response) {
                localStorageService.clearAll();
                $window.location.href = "/";
            });
        };

        $scope.stop_impersonation = function () {
            $http.post('/hijack/release-hijack/').then(function (response) {
                $window.location.href = "/";
            }).catch(function (error) {
                console.log(error);
            });
        };


        $scope.limitText = function (text, limit) {
            return $filter('limitTo')(text, limit);
        };

        $scope.getParamsObject = function (searchKey, currentPage, pageSize, sortKey) {
            var urlObj = {};
            if (pageSize !== undefined) {
                if ((sortKey !== undefined) && (sortKey !== null) && (sortKey !== '')) {
                    urlObj.ordering = sortKey;
                }
                urlObj.page = currentPage;
                urlObj.page_size = pageSize;
                if ((searchKey !== undefined) && (searchKey !== null) && (searchKey !== '')) {
                    urlObj.search = searchKey;
                }
            }
            return urlObj;
        };

        $rootScope.getActiveTabSelection = function (breadcrumb) {
            $timeout(function () {
                $rootScope.getSubmenuObjects();
                //console.log('in getActiveTabSelection with : ', angular.toJson(breadcrumb));
                if (angular.isDefined(breadcrumb.index) && (breadcrumb.index !== null)) {
                    $rootScope.secondLevelActiveIndex = breadcrumb.index;
                    $scope.addClassforTabs('.actonecls ul', breadcrumb.index);
                }
                if (angular.isDefined(breadcrumb.index1) && (breadcrumb.index1 !== null)) {
                    var oldindex = angular.copy($rootScope.thirdLevelActiveIndex);
                    $rootScope.thirdLevelActiveIndex = breadcrumb.index1;
                    $scope.removeClassforTabs('.acttwocls ul', oldindex);
                    $scope.addClassforTabs('.acttwocls ul', breadcrumb.index1);
                }
            }, 1000);
        };

        $scope.setLoggedInUser = function (user_email, is_user_customer_admin, enable_welcome_page, send_agreement_email, users_timezone) {

              
            console.log('Analytics Log ----------------------------> ',user_email);
            $window.ga('set', 'userId', user_email); // Set the user ID using signed-in user_id.
            $window.ga('send', 'pageview', { page: $location.path() });

            $rootScope.userEmail = user_email;
            $rootScope.is_user_customer_admin = is_user_customer_admin;
            $rootScope.enableWelcomePage = enable_welcome_page;
            $rootScope.users_timezone = users_timezone;
            console.log('$rootScope.is_user_customer_admin : ', $rootScope.is_user_customer_admin);
        };

        $scope.getUserTimeZone = function () {
            var gmt_offset = 'GMT' + moment.tz(new Date, $rootScope.users_timezone).format('Z');
            var tz = moment().tz($rootScope.users_timezone).zoneAbbr();
            $rootScope.user_timezone = gmt_offset + ' ' + '(' + tz + ')';
        };

        $scope.help_mail_popup = function () {
            var modalInstance = $uibModal.open({
                templateUrl: '/static/rest/app/client/templates/help_mail_modal.html',
                windowClass: 'report_issue_modal',
                scope: $scope,
                size: 'md',
                controller: 'HelpMailController'
            });
            modalInstance.result.then();
        };

        $scope.getuptime = function (pdu_details) {
            if (pdu_details.device_data.status == 0) {
                var currenttime = new Date();
                var lastrebootedtime = new Date(Number(pdu_details.device_data.last_rebooted) * 1000);
                var totaltime = (currenttime - lastrebootedtime) / 1000;
                var downtime = parseInt(totaltime - pdu_details.device_data.uptime);
                return downtime;
            } else {
                return pdu_details.device_data.uptime;
            }
        };

        $scope.trustSrc = function (src) {
            console.log($sce.trustAsResourceUrl(src));
            return $sce.trustAsResourceUrl(src);
        };
    }
]);

app.controller('HelpMailController', [
    '$scope',
    '$uibModalInstance',
    '$http',
    '$location',
    '$rootScope',
    '$httpParamSerializer',
    'TaskService2',
    'AlertService2',
    function ($scope, $uibModalInstance, $http, $location, $rootScope, $httpParamSerializer, TaskService2, AlertService2) {
        var subject_msg = 'Subject is required';
        var desc_msg = 'Description is required';
        var priority_msg = 'Priority is required';

        $scope.ticket_priority_list = [
            {long: 'low', short: 'low'},
            {long: 'normal', short: 'normal'},
            {long: 'high', short: 'high'},
            {long: 'urgent', short: 'urgent'},
        ];

        function get_display_name(element) {
            return element.displayName;
        }
        var path = $rootScope.breadCrumbArray.map(get_display_name);
        var subject_path = path.join('->');
        $scope.request = {};
        $scope.request.subject = '[Unity] Issue with ' + subject_path + ' Screen';

        $scope.description = 
            $rootScope.userEmail + "\n" +
            $location.absUrl() + "\n" +
            navigator.userAgent + "\n" +
            moment.tz(new Date(), $rootScope.users_timezone).format('YYYY-MM-DD HH:mm:ss');
        

        $scope.encoded_subject = encodeURIComponent(
            $scope.request.subject
        );
        $scope.encoded_description = encodeURIComponent(
            $scope.request.description
        );
        $scope.email_to_link = (
            "mailto:support@unityonecloud.com?subject="
            + $scope.encoded_subject + "&body=" +
            $scope.encoded_description
        );

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


        $scope.create_ticket = function(request, attachments){
            $uibModalInstance.close();
            AlertService2.success('Thank you for your feedback. The progress can be tracked under Unity Feedback section in support tab');
            var formdata = new FormData();
            formdata.append('subject', request.subject);
            if(request.collaborators){
                formdata.append('collaborators', request.collaborators.split(','));
            }else{
                formdata.append('collaborators', []);
            }
            formdata.append('priority', 'normal');
            formdata.append('description', request.description.concat('\n\n' + $scope.description));
            formdata.append('system_type', 'Unity');
            for(var i = 0; i < attachments.length; i++){
                formdata.append(attachments[i].name, attachments[i]);
            }
            $http.post("/customer/ticketorganization/create_unity_problem_request/",formdata,
                {
                    headers: {
                        'Content-Type' : undefined
                    },
                    transformRequest: angular.identity,
                }
                ).then(function (response) {
                    TaskService2.processTask(response.data.task_id).then(function (result) {
                       // update the client with the new model
                       
                       AlertService2.success("Ticket submitted successfully, it will be visible in Unity in few minutes. Our Support team will soon contact you", 3000);
                    }).catch(function (error) {
                       console.log(error);
                       $uibModalInstance.close(error);
                       AlertService2.danger("Error while creating ticket.");
                    });
            });
        };

        $scope.createRequest = function (request) {
            $scope.ticket_subject_errmsg = '';
            $scope.ticket_desc_errmsg = '';
            $scope.priority_errmsg = '';
            $scope.email_errmsg = '';
            var stop_execution = false;
            if (request === undefined) {
                $scope.ticket_subject_errmsg = subject_msg;
                $scope.ticket_desc_errmsg = desc_msg;
                return;
            }
            if (request.subject === undefined) {
                $scope.ticket_subject_errmsg = subject_msg;
                stop_execution = true;
            }

            if ((request.collaborators != undefined) && (request.collaborators != '')){
                var addresses = request.collaborators.split(";");
                var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                for (var i=0; i<addresses.length;i++){
                    if (!re.test(addresses[i].trim())) {
                        $scope.email_errmsg = 'Enter a valid email address';
                        stop_execution = true;
                    }
                }
            }
            if (request.priority === undefined) {
                $scope.priority_errmsg = priority_msg;
                stop_execution = true;
            }
            if (request.description === undefined) {
                $scope.ticket_desc_errmsg = desc_msg;
                stop_execution = true;
            }
            if (stop_execution) {
                return;
            }

            $scope.create_ticket(angular.copy(request), $scope.attachments);
            
            // $http.post("/customer/ticketorganization/create_unity_problem_request/",
            //     {subject: request.subject, description: request.description, system_type: 'Unity'}).then(function (response) {
            //     TaskService2.processTask(response.data.task_id).then(function (result) {
            //         $uibModalInstance.close(result);
            //         AlertService2.success("Ticket submitted successfully.Our Support team  will soon contact you.");
            //     }).catch(function (error) {
            //         console.log(error);
            //         $uibModalInstance.close(error);
            //         AlertService2.danger("Error while creating ticket.");
            //     });
            // });
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss();
        };
    }
]);

app.controller('UserSubMenuController', [
    '$scope',
    '$state',
    '$transitions',
    '$rootScope',
    '$http',
    '$window',
    '$filter',
    '$timeout',
    '$compile',
    '$location',
    function ($scope, $state, $transitions, $rootScope, $http, $window, $filter, $timeout, $compile, $location) {

        var pathArray;
        var itemHrefArray;

        $scope.getSecondLevelActiveIndex = function (secondLevelItem) {
            for (var i = 0; i < secondLevelItem.length; i++) {
                pathArray = $location.path().split('/');
                pathArray.shift();
                itemHrefArray = secondLevelItem[i].href.split('/');
                itemHrefArray.shift();
                if ((pathArray[0] === itemHrefArray[0]) && (pathArray[1] === itemHrefArray[1])) {
                    $rootScope.secondLevelActiveIndex = i;
                } else if ($scope.containsInArray(itemHrefArray, 'azure-dashboard') && $scope.containsInArray(pathArray, 'azure') 
                    && $scope.containsInArray(pathArray, 'resource_group')) {
                    $rootScope.secondLevelActiveIndex = i;
                } else if ($scope.containsInArray(pathArray, 'pdu') && $scope.containsInArray(itemHrefArray, 'pdus')) {
                    $rootScope.secondLevelActiveIndex = i;
                }else if ($scope.containsInArray(itemHrefArray, 'gcp-dashboard') && $scope.containsInArray(pathArray, 'inventory') 
                    && ($scope.containsInArray(pathArray, 'virtual-machines') || ($scope.containsInArray(pathArray, 'snapshots')))) {
                    $rootScope.secondLevelActiveIndex = i;
                }
            }
        };

        $scope.getThirdLevelActiveIndex = function (thirdLevelItem) {
            $scope.removeClassforTabs('.acttwocls ul', angular.copy($rootScope.thirdLevelActiveIndex));
            for (var i = 0; i < thirdLevelItem.length; i++) {
                pathArray = $location.path().split('/');
                pathArray.shift();
                itemHrefArray = thirdLevelItem[i].href.split('/');
                itemHrefArray.shift();
                if (angular.equals(itemHrefArray, pathArray)) {
                    $rootScope.thirdLevelActiveIndex = i;
                }
            }
        };

        // $rootScope.myPromise = $http.get('http://httpbin.org/delay/3');
        $rootScope.myPromise = null;

        $scope.getSecondlevelMenuItemUrl = function (item, index) {
            $rootScope.selectedSecondlevelMenuItem = angular.copy(item);
            $rootScope.secondLevelActiveIndex = angular.copy(index);
            if (angular.isDefined(item.submenu) && angular.isDefined(item.submenu[0].submenu)) {
                console.log('clicked item has two levels of submenu');
                $rootScope.selectedThirdlevelMenuItem = angular.copy(item.submenu[0]);
                $rootScope.selectedFourthlevelMenuItem = angular.copy(item.submenu[0].submenu[0]);
                $state.go(item.submenu[0].submenu[0].state, $scope.stateParamsObject($rootScope.selectedSubMenuItem, 4, index, 0, 0));
            } else if (angular.isDefined(item.submenu)) {
                console.log('clicked item has one level of submenu');
                $rootScope.selectedThirdlevelMenuItem = angular.copy(item.submenu[0]);
                $rootScope.thirdLevelActiveIndex = 0;
                $state.go(item.submenu[0].state, $scope.stateParamsObject($rootScope.selectedSubMenuItem, 3, index, 0));
                $timeout(function () {
                    $scope.addClassforTabs('.acttwocls ul', 0);
                }, 1500);
            } else {
                console.log('clicked item dont have any submenu. So loading page directly');
                $state.go(item.state, $scope.stateParamsObject($rootScope.selectedSubMenuItem, 2, index));
            }
            $timeout(function () {
                $scope.addClassforTabs('.actonecls ul', index);
            }, 1000);
        };

        $scope.getThirdlevelMenuItemUrl = function (item, index) {
            var removecls = angular.copy($rootScope.thirdLevelActiveIndex);
            $rootScope.selectedThirdlevelMenuItem = angular.copy(item);
            //$scope.removeClassforTabs('.acttwocls ul', removecls);
            $rootScope.thirdLevelActiveIndex = angular.copy(index);
            if (angular.isDefined(item.submenu)) {
                console.log('clicked item has one level of submenu');
                $rootScope.selectedFourthlevelMenuItem = angular.copy(item.submenu[0]);
                $rootScope.selectedFourthlevelMenuItemIndex = 0;
                $state.go(item.submenu[0].state, $scope.stateParamsObject($rootScope.selectedSubMenuItem, 4, $rootScope.secondLevelActiveIndex, index, 0));
            } else {
                console.log('clicked item dont have any submenu. So loading page directly');
                $state.go(item.state, $scope.stateParamsObject($rootScope.selectedSubMenuItem, 3, $rootScope.secondLevelActiveIndex, index));
            }
            $timeout(function () {
                console.log('removing class for old tab');
                $scope.removeClassforTabs('.acttwocls ul', angular.copy(removecls));
                $scope.addClassforTabs('.actonecls ul', $rootScope.secondLevelActiveIndex);
            }, 1000);
        };

        $scope.getFourthlevelMenuItemUrl = function (item, index) {
            console.log('clicked item dont have any submenu. So loading page directly');
            $rootScope.selectedFourthlevelMenuItem = angular.copy(item);
            $state.go(item.state, $scope.stateParamsObject($rootScope.selectedSubMenuItem, 4, $rootScope.secondLevelActiveIndex, $rootScope.thirdLevelActiveIndex, index));
        };

        $scope.popoverobj = {
            templateUrl: 'devicedetailstemplate.html',
        };
    }
]);

app.controller('CustomerOpenStackInstanceController', [
    '$scope',
    '$rootScope',
    'CustomerOpenStackInstance',
    'AlertService2',
    'SearchService',
    'AbstractControllerFactory',
    function ($scope, $rootScope, CustomerOpenStackInstance, AlertService2, SearchService, AbstractControllerFactory) {
        $scope.title = {
            plural: 'OpenStack Instances',
            singular: 'OpenStack Instance'
        };
        $scope.resourceClass = CustomerOpenStackInstance;
        // $scope.breadCrumb = { name: "OpenStack Instances", url: '#/openstack_instances' };
        $scope.ctrl = new AbstractControllerFactory($scope.resourceClass, $scope, 'name');
        $scope.p.then(function () {
            $scope.loaded = true;
        });

        $scope.rows = [
            {name: 'name', description: "Name", required: true},
            {name: 'os_id', description: "ID", required: true},
            {name: 'vcpu', description: "vCPUs", required: true},
            {name: 'memory', description: "Memory (MB)", required: true},
            {name: 'disk', description: "Disk (GB)", required: true},
            {name: 'operating_system', description: "Image", required: true},
            {name: 'ip_address', description: "IP Address", required: true},
            {name: 'last_known_state', description: "Status", required: true}
        ];
    }
]);

app.controller('ClientMaintenanceController2', [
    '$scope',
    '$rootScope',
    '$http',
    '$uibModal',
    'AlertService2',
    'CustomerULDBService',
    function ($scope, $rootScope, $http, $uibModal, AlertService2, CustomerULDBService) {
        $scope.sort = {
            sortingColumn: '',
            reverse: false
        };
        $scope.searchKeyword = '';
        $scope.sortingColumn = '';
        $scope.page = 1;

        var setDatesInUTCTimeZone = function(){
            var browser_timezone = moment.tz.guess();

            var selected_start_date = moment.tz($scope.mschedule.start_date, browser_timezone).format('YYYY-MM-DD HH:mm:ss');
            $scope.mschedule.start_date = moment.tz(selected_start_date, $rootScope.users_timezone).utc().format();

            var selected_end_date = moment.tz($scope.mschedule.end_date, browser_timezone).format('YYYY-MM-DD HH:mm:ss');
            $scope.mschedule.end_date = moment.tz(selected_end_date, $rootScope.users_timezone).utc().format();
        };

        var setDatesInUserTimeZone = function(){
            $scope.mschedule.start_date = moment.tz($scope.mschedule.start_date, $rootScope.users_timezone).format('YYYY-MM-DD HH:mm:ss');
            $scope.mschedule.end_date = moment.tz($scope.mschedule.end_date, $rootScope.users_timezone).format('YYYY-MM-DD HH:mm:ss');
        };

        $scope.loadMoreResults = function () {
            var params = {
                'page': $scope.page + 1,
                'page_size': 10,
                'ordering': $scope.sortingColumn,
                'search': $scope.searchKeyword,
            };
            if (($scope.page * 10) < $scope.model_count) {
                $scope.page = $scope.page + 1;
                getMaintenanceSchedules(params);
            }
        };

        $scope.getSearchResults = function (sk) {
            $scope.searchKeyword = sk;
            $scope.page = 1;
            var params = {
                'page': $scope.page,
                'page_size': 10,
                'search': sk,
                'ordering': $scope.sortingColumn
            };
            getMaintenanceSchedules(params);
        };

        $scope.getSortingResults = function (sort) {
            $scope.sortingColumn = sort.sortingColumn;
            $scope.page = 1;
            var params = {
                'page': $scope.page,
                'page_size': 10,
                'ordering': sort.sortingColumn,
                'search': $scope.searchKeyword
            };
            getMaintenanceSchedules(params);
        };

        $scope.getDatacenters = function(keyword){
            var url = "/customer/colo_cloud/?search=" + keyword;
            $http.get(url).then(function (response) {
                $scope.data_centers = response.data.results;
            }).catch(function (error) {
                AlertService2.danger('Something went wrong, please try again later.');
            });
        };

        var modalInstance = null;
        var showEditModal = function(templateUrl){
            modalInstance = $uibModal.open({
                templateUrl: templateUrl,
                scope: $scope,
                size: 'lg',
            });
            modalInstance.result.then();
        };

        $scope.cancel = function(){
            modalInstance.dismiss('cancel');
        };

        $scope.onSubmit = function(){
            if ($scope.mschedule.method=='add'){
                setDatesInUTCTimeZone();
                $scope.mschedulesAdd();
            }
            if ($scope.mschedule.method=='edit'){
                setDatesInUTCTimeZone();
                $scope.mschedulesEdit($scope.mschedule);
            }
        };

        $scope.manageMS = function(method, row, index){
            if (row !== undefined) {
                $scope.uuid = row.uuid;
            }
            if (index !== undefined){
                $scope.index = index;
            }
            if (method=='Delete'){
                showEditModal('deleteConfirm.html');
                return;
            }
            if (method=='Edit'){
                $scope.mschedule = JSON.parse(JSON.stringify(row));
                setDatesInUserTimeZone();
                $scope.mschedule.method = 'edit';
            }
            if (method=='Add'){
                $scope.mschedule = {};
                $scope.mschedule.method = 'add';
            }
            setErrorMsgs({});
            showEditModal('editMaintenanceSchedule.html');
        };

        var getMaintenanceSchedules = function(params){
            var url = '/customer/mschedules/';
            $http({url: url, params: params, method: 'GET'}).then(function (response) {
                if ($scope.page > 1) {
                    $scope.mschedules.results.push.apply($scope.mschedules.results, response.data.results);
                }
                else{
                    $scope.mschedules = response.data;
                    $scope.model_count = response.data.count;
                    $scope.loader = false;
                }
            }).catch(function (error) {
                AlertService2.danger('Something went wrong, please try again later.');
            });
        };
        getMaintenanceSchedules({});

        var setErrorMsgs = function(data){
            if(data.end_date){
                $scope.end_date_err = data.end_date[0];
            }
            else{
                 $scope.end_date_err = null;
            }
            if(data.colo_cloud){
                $scope.colo_cloud_err = data.colo_cloud[0];
            }
            else{
                 $scope.colo_cloud_err = null;
            }
        };
        $scope.mschedulesAdd = function(){
            var url = "/customer/mschedules/";
            var data = $scope.mschedule;
            $http.post(url, data).then(function (response) {
                $scope.cancel();
                AlertService2.success('Added ' + $scope.mschedule.description + ' successfully');
                getMaintenanceSchedules({});
            }).catch(function (error) {
                setErrorMsgs(error.data);
            });
        };

        $scope.mschedulesEdit = function(params){
            var url = "/customer/mschedules/" + $scope.uuid + '/';
            $http.put(url, params).then(function (response) {
                $scope.cancel();
                AlertService2.success('Updated ' + $scope.mschedule.description + ' successfully');
                $scope.mschedules.results[$scope.index] = response.data;
                setDatesInUserTimeZone();
            }).catch(function (error) {
                console.log('e', error);
                setErrorMsgs(error.data);
            });
        };

        $scope.mschedulesDelete = function(){
            var url = "/customer/mschedules/" + $scope.uuid + '/';
            $http.delete(url).then(function (response) {
                $scope.cancel();
                AlertService2.success('Deleted successfully');
                getMaintenanceSchedules({});
            }).catch(function (error) {
                AlertService2.success('Something went wrong, please try again later.');
            });
        };
    }
]);

app.controller('CustomerLandingPageController', [
    '$scope',
    '$state',
    '$rootScope',
    '$stateParams',
    '$location',
    '$http',
    '$uibModal',
    '$timeout',
    'AlertService2',
    function ($scope, $state, $rootScope, $stateParams, $location, $http, $uibModal, $timeout, AlertService2) {

        $scope.show_onboard_status = false;


        console.log('$rootScope.send_agreement_email : ', $rootScope.send_agreement_email);

        var display_onboard_status = function(obj){
            var onb_status = obj.onb_status;
            if(!obj.vpn_status || !onb_status.excel_end || !onb_status.monitoring_end || !onb_status.manage_end){
                $scope.show_onboard_status = true;
            }
        };

        var get_status_details = function(){
            $http.get("/customer/organization/").then(function (response) {
                display_onboard_status(angular.copy(response.data.results[0]));
                $scope.onboarding_details = response.data.results[0];
                console.log('$scope.onboarding_details : ', angular.toJson($scope.onboarding_details));
                $scope.loader = false;
            }).catch(function (error) {
               console.log('error : ', angular.toJson(error));
               AlertService2.danger("Problem ocurred in fetching onboarding status. Please try again later.");
            });
        };

        var show_eula_modal = function(){
            var modalInstance = $uibModal.open({
                templateUrl: 'static/rest/app/client/templates/modals/eula.html',
                scope: $scope,
                size: 'lg',
            });
            modalInstance.result.then();
            $scope.close = function(){
                modalInstance.close();
            };
        };

        if (!$rootScope.enableWelcomePage && angular.isUndefined($stateParams.uuidp)) {
            $location.url('/dashboard');
        } else {
            $scope.enable_welcome_page = angular.copy($rootScope.enableWelcomePage);
            get_status_details();
        }

        $scope.changeWelcomePage = function () {
            var params = {
                enable_welcome_page: $scope.enable_welcome_page
            };
            $http.post('/customer/uldbusers/set_welcome_page/', params).then(function (response) {
                $rootScope.enableWelcomePage = response.data.enable_landing_page;
            }).catch(function (error) {
                $scope.enable_welcome_page = !$scope.enable_welcome_page;
                AlertService2.danger('Something went wrong.... Please try again later');
            });
        };

        $scope.show_onboard_page = function(){
            if($rootScope.is_user_customer_admin){
                $state.go('inventory_onboard', null, {reload : true});
            }else{
                return;
            }
        };
    }
]);

app.controller('UserGuideController', [
    '$scope',
    '$state',
    '$rootScope',
    '$stateParams',
    '$location',
    '$http',
    function ($scope, $state, $rootScope, $stateParams, $location, $http) {

        console.log('UserGuideController');

        var url_additional = "&pid=explorer&efh=false&a=v&chrome=false&embedded=true";

    }
]);

app.controller('UserReleaseController', [
    '$scope',
    '$state',
    '$rootScope',
    '$stateParams',
    '$location',
    '$http',
    '$sce',
    function ($scope, $state, $rootScope, $stateParams, $location, $http, $sce) {

        // Active release content
        var url_additional = "&pid=explorer&efh=false&a=v&chrome=false&embedded=true";

        var getCurrentRelease = function () {
            $http.get('/rest/release/active_release/').then(function (response) {
                if (response.data.length > 0) {
                    var active_url = response.data[0].file_url + url_additional;
                    $scope.active_release_url = $sce.trustAsResourceUrl(active_url);
                } else {
                    $scope.active_release_url = [];
                }
            }).catch(function (error) {
                $scope.active_release_url = [];
                console.log('Something went wrong.... Please try again later');
            });
        };

        // Previous release content
        $scope.release_list_content = true;

        var getReleaseList = function () {
            $http.get('/rest/release/previous_release/').then(function (response) {
                if (response.data.length > 0) {
                    $scope.release_list = response.data;
                }
                else {
                    $scope.release_list = [];
                }
            }).catch(function (error) {
                $scope.release_list = [];
                console.log('Something went wrong.... Please try again later');
            });
        };

        $scope.show_release_content = function (url) {
            url = url + url_additional;
            $scope.active_file_url = $sce.trustAsResourceUrl(url);
            $scope.release_list_content = false;
            $scope.release_content = true;
        };

        var tabname;
        $scope.$watch(function () {
            return $location.path();
        }, function (value) {
            tabname = value.split('/').pop();
            if (tabname === 'current') {
                getCurrentRelease();
            } else if (tabname === 'list') {
                getReleaseList();
            }
        });

        $scope.cancel = function () {
            $scope.release_list_content = true;
            $scope.release_content = false;
        };
    }
]);

app.controller('ProductsDetailsController', [
    '$scope',
    '$state',
    '$rootScope',
    '$stateParams',
    '$location',
    '$http',
    function ($scope, $state, $rootScope, $stateParams, $location, $http) {

        //console.log('ProductsDetailsController');

    }
]);

app.controller('CloudNotConfiguredController', [
    '$scope',
    '$location',
    function ($scope, $location) {

        $scope.$watch(function () {
            return $location.path();
        }, function (value) {
            $scope.title = 'Private Cloud';
        });
    }
]);

app.controller('ComingsoonController', [
    '$scope',
    '$location',
    function ($scope, $location) {

        // $scope.title = '';

        $scope.$watch(function () {
            return $location.path();
        }, function (value) {
            var pagename = value.split('/').pop();
            switch (pagename) {
                case 'billing' :
                    $scope.title = 'Billing & Invoicing';
                    break;
                case 'service_requests' :
                    $scope.title = 'Service Requests';
                    break;
                case 'application' :
                    $scope.title = 'Application-as-a-Service';
                    break;
                case 'database' :
                    $scope.title = 'Database-as-a-Service';
                    break;
                // case 'database_monitoring' : 
                //       $scope.title = 'Database Monitoring';
                //       break;
                // case 'performance_monitoring' : 
                //       $scope.title = 'Performance Monitoring';
                //       break;
                // case 'network_monitoring' : 
                //       $scope.title = 'Network Monitoring';
                //       break;
                case 'storage_usage' :
                    $scope.title = 'Storage Usage';
                    break;
                case 'loadbalancer_usage' :
                    $scope.title = 'Load Balancer Usage';
                    break;
                case 'products' :
                    $scope.title = 'Products';
                    break;
                case 'security' :
                    $scope.title = 'Security-as-a-Service';
                    break;
                // case 'colo_monitoring' :
                //       $scope.title = 'Colo Monitoring';
                //       break;
                // default : 
                //     $scope.title = pagename.charAt(0).toUpperCase() + pagename.slice(1);
            }

        });
    }
]);

app.controller('CustomerCloudControllersController', [
    '$scope',
    '$rootScope',
    '$routeParams',
    '$location',
    '$uibModal',
    '$http',
    '$window',
    'ProxyDetailControllerService',
    '$httpParamSerializer',
    'AlertService2',
    function ($scope, $rootScope, $routeParams, $location, $uibModal, $http, $window, ProxyDetailControllerService, $httpParamSerializer, AlertService2) {

        $scope.page_no = 1;
        $scope.model = {};
        $scope.searchkey = '';
        $scope.sortkey = '';

        $scope.sort = {
            sortingColumn: '',
            reverse: false
        };

        $scope.update_activity_log_entry = function (cloud) {
            console.log("inside new tab openstack");
            var instance_id = '';
            var device_type = '';
            if (cloud.platform_type == "VMware") {
                device_type = 'vcenter';
                if (cloud.vcenter_proxy.length > 0){
                    instance_id = cloud.vcenter_proxy[0].uuid;
                }
            }
            else if (cloud.platform_type == "OpenStack") {
                device_type = 'openstack_proxy';
                if (cloud.openstack_proxy.length > 0){
                    instance_id = cloud.openstack_proxy[0].uuid;
                }
            }
            if (instance_id){
                ProxyDetailControllerService.updateActivityLog(instance_id, device_type);
            }
        };

        $scope.get_cloud_proxy_link = function(cloud){
            if (cloud.platform_type == "VMware"){
                if (cloud.vcenter_proxy.length > 0) {
                    cloud.proxy_platform_link = "#/vmware-vcenter/"+ cloud.uuid + "/";
                    cloud.proxy_link_cloud = cloud.proxy.proxy_fqdn;
                }
            }
            else if (cloud.platform_type == "OpenStack"){
                if (cloud.openstack_proxy.length > 0) {
                    cloud.proxy_platform_link = "#/openstack-proxy/"+ cloud.uuid + "/";
                    cloud.proxy_link_cloud = cloud.proxy.proxy_fqdn;
                }
            }
 
        };

        $scope.getSortingResults = function (sort) {
            if ((sort !== undefined) && (sort !== null) && (sort !== '')) {
                $scope.page_no = 1;
                $scope.sortkey = sort.sortingColumn;
                $scope.get_client_private_cloud_controllers(1);
            }
        };

        $scope.getSearchResults = function () {
            $scope.page_no = 1;
            $scope.get_client_private_cloud_controllers(1);
        };
        var modalInstance = '';
        var showModal = function (template, controller) {
            modalInstance = $uibModal.open({
                templateUrl: template,
                controller: controller,
                scope: $scope,
            });

            modalInstance.result.then(function (selectedItem) {
                $scope.selected = selectedItem;
            }, function () {
            });
        };

        $scope.manage_request_cloud = function (result) {
            $scope.device_type = "Private Cloud";
            $scope.device_name = result.name;
            $scope.description = 
                "Device Name: " + $scope.device_name + "\n" +
                "Virtualization Platform: " + result.platform_type;
            showModal('static/rest/app/client/templates/manage_request.html', 'ManageRequestController');
        };


        $scope.get_client_private_cloud_controllers = function (page) {

            var params = {
                'page': page
            };

            if (($scope.sortkey !== undefined) && ($scope.sortkey !== null) && ($scope.sortkey !== '')) {
                params['ordering'] = $scope.sortkey;
            }
            if (($scope.searchkey !== undefined) && ($scope.searchkey !== null) && ($scope.searchkey !== '')) {
                console.log('search key isDefined');
                params['search'] = $scope.searchkey;
            }
            var serialized_params = $httpParamSerializer(params);
            var url = '/customer/private_cloud/?' + serialized_params;
            $http.get(url).then(function (response) {
                // $scope.model = response.data;
                if (page === 1)
                    $scope.cloud_controllers = response.data;
                else {
                    $scope.cloud_controllers.count = response.data.count;
                    $scope.cloud_controllers.results = $scope.cloud_controllers.results.concat(response.data.results);
                }
            }).catch(function (error) {
                $scope.cloud_controllers.results = [];
                AlertService2.danger("Unable to fetch activity logs. Please contact Adminstrator.");
                console.log(error);
            });
        };

        $scope.get_client_private_cloud_controllers(1);

        $scope.loadMoreResults = function () {
            if (angular.isDefined($scope.model.count) && angular.isDefined($rootScope.configObject.page_size)) {
                if (($scope.page_no * $rootScope.configObject.page_size) < $scope.model.count) {
                    $scope.page_no = $scope.page_no + 1;
                    $scope.get_client_private_cloud_controllers($scope.page_no);
                }
            }
        };
    }
]);

app.controller('CustomerNocController', [
    '$scope',
    '$state',
    '$rootScope',
    '$stateParams',
    '$location',
    '$http',
    '$timeout',
    'AlertService2',
    function ($scope, $state, $rootScope, $stateParams, $location, $http, $timeout, AlertService2) {
 
        /// var element = angular.element(document.querySelector(".header-band-lg"));

        // element.hide()

        $timeout(function(){
            $scope.toggleMinimized = true;
            $scope.toggle();
            document.querySelector('#sidebarClick').click();
        });
        
    }
]);

app.controller('CustomerTDController', [
    '$scope',
    '$state',
    '$rootScope',
    '$stateParams',
    '$location',
    '$http',
    '$timeout',
    'AlertService2',
    function ($scope, $state, $rootScope, $stateParams, $location, $http, $timeout, AlertService2) {
 
        console.log('in DevicesDashboardController');

        var obj = {};
        var dashboards = [];
        dashboards.push(obj);
        $scope.dashboards = angular.copy(dashboards);

        $scope.groups = [];
        $http.get('/customer/bm_servers/').then(function (response) {
            var devices = [];
            for(var i = 0; i < 3; i++){
                console.log('i : ', i);
                devices.push(response.data.results[i]); 
            }
            var group_obj = {};
            group_obj.name = 'Group 1';
            group_obj.devices = angular.copy(devices);
            $scope.groups.push(group_obj);

            devices = [];

            for(var i = 3; i < 5; i++){
                console.log('i : ', i);
                devices.push(response.data.results[i]);
            }
            var group_obj_one = {};
            group_obj_one.name = 'Group 2';
            group_obj_one.devices = angular.copy(devices);
            $scope.groups.push(group_obj_one);

            devices = [];

            for(var i = 5; i < response.data.results.length; i++){
                console.log('i : ', i);
                devices.push(response.data.results[i]);
            }
            var group_obj_two = {};
            group_obj_two.name = 'Group 3';
            group_obj_two.devices = angular.copy(devices);
            $scope.groups.push(group_obj_two);


            console.log('$scope.groups : ', angular.toJson($scope.groups));
        });

        $scope.view_mode = true;

        $scope.toggle_mode = function(){
            $scope.view_mode = !$scope.view_mode;
            console.log('$scope.view_mode : ', $scope.view_mode);
        };

        $scope.logEvent = function(message) {
            console.log(message);
        };

        $scope.logListEvent = function(action, index, external, type) {
            var message = external ? 'External ' : '';
            message += type + ' element was ' + action + ' position ' + index;
            console.log(message);
        };

        $scope.dragoverCallback = function(index, external, type, callback) {
            $scope.logListEvent('dragged over', index, external, type);
            // Invoke callback to origin for container types.
            if (type == 'container' && !external) {
                console.log('Container being dragged contains ' + callback() + ' items');
            }
            return index < 10; // Disallow dropping in the third row.
        };

        $scope.dropCallback = function(index, device, external, type) {
            $scope.logListEvent('dropped at', index, external, type);
            // Return false here to cancel drop. Return true if you insert the item yourself.
            return device;
        };


        $scope.groupDropCallback = function(index, item, external, type){
            console.log('in groupDropCallback');
            return item;
        };

        $scope.groupDragoverCallback = function(index, external, type, callback){
            console.log('in groupDragoverCallback');
            return true;
        };
        
    }
]);
