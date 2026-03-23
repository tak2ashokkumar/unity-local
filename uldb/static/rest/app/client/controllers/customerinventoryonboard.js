var app = angular.module('uldb');

app.controller('InventoryOnboardController', [
    '$scope',
    '$rootScope',
    '$state',
    '$timeout',
    '$http',
    '$document',
    '$uibModal',
    '$stateParams',
    'TaskService2',
    'AlertService2',
    '$httpParamSerializer',
    function ($scope, $rootScope, $state, $timeout, $http, $document, $uibModal, $stateParams, TaskService2, AlertService2, $httpParamSerializer) {

        console.log('in InventoryOnboardController');

        $scope.loader = false;

        $scope.vcenterMsg = 'Please update vcenter passwords';
        $scope.fetch_vcenters = function(){
            $http.get("/customer/customer_vcenters/").then(function (response) {
                $scope.vcenters = response.data.results;
                if ($scope.vcenters.length==0){
                    $scope.vcenterMsg = 'No VMware Vcenters found';
                }
            }).catch(function (error) {
             console.log('error : ', angular.toJson(error));
         });
        };

        $scope.update_vcenter = function(){
            for (var i=0; i<$scope.vcenters.length;i++){
                if (($scope.vcenters[i].password == undefined) || ($scope.vcenters[i].password == '')){
                    $scope.vcenters[i].update_response_message = 'Please enter password';
                    $scope.vcenters[i].update_response_result = false;
                    return;
                }
            }

            var data = {"data": $scope.vcenters};
            $scope.loading_response = true;
            $http.post("/customer/customer_vcenters/verify_and_update_vcenters/", data).then(function (response) {
                for (var i=0; i<$scope.vcenters.length;i++){
                    if (response.data.errors){
                        if ($scope.vcenters[i].id in response.data.errors){
                            $scope.vcenters[i].update_response_message = response.data.errors[$scope.vcenters[i].id];
                            $scope.vcenters[i].update_response_result = false;
                        }
                    }
                    if (response.data.success){
                        if ($scope.vcenters[i].id in response.data.success){
                            $scope.vcenters[i].update_response_message = response.data.success[$scope.vcenters[i].id];
                            $scope.vcenters[i].update_response_result = true;
                        }
                    }
                }
                $scope.loading_response = false;
            }).catch(function (error) {
                $scope.close();
                AlertService2.error(error);
            });
        };

        $scope.update_vcenter_credentials = function(){
            var modalInstance = $uibModal.open({
                templateUrl: 'static/rest/app/client/templates/assets_onboarding/update_vcenter_credentials.html',
                scope: $scope,
                size: 'lg',
            });
            modalInstance.result.then();
            $scope.close = function(){
                modalInstance.close();
            };
        };

        var get_status_details = function(){
            $http.get("/customer/organization/").then(function (response) {
                console.log('response : ', angular.toJson(response.data.results[0]));
                $scope.user_obj = response.data.results[0];
                $scope.loader = false;
            }).catch(function (error) {
             console.log('error : ', angular.toJson(error));
             AlertService2.danger("Problem ocurred in fetching onboarding status. Please try again later.");
         });
        };

        var get_onboarding_file = function(){
            $http.get("/customer/excel_onboard/").then(function (response) {
                console.log('response : ', angular.toJson(response.data));
                $scope.onboarding_file = response.data.file_path;
            }).catch(function (error) {
             console.log('error : ', angular.toJson(error));
             AlertService2.danger("Problem ocurred in fetching onboarding status. Please try again later.");
         });
        };
        get_status_details();
        get_onboarding_file();

        $scope.active_step_no = '';

        var modal_instance = null;
        var showmodel = function (templete, size, controllername) {
            // if (modal_instance !== null) {
            //     modal_instance.dismiss('cancel');
            // }

            modal_instance = $uibModal.open({
                templateUrl: templete,
                scope: $scope,
                size : size,
            });

            modal_instance.result.then(function (selectedItem) {
                $scope.selected = selectedItem;
            }, function () {
                console.log('Modal dismissed at: ' + new Date());
            });
        };

        $scope.close_modal = function () {
            modal_instance.dismiss('cancel');
        };

        $scope.connectivityRequest = function(){
            $scope.close_modal();
            showmodel('static/rest/app/client/templates/assets_onboarding/connectivity_request.html', 'lg conn_req_modal');
        };

        $scope.show_connection_page = function(){
            if(($scope.user_obj.onb_status.vpn_req) || ($scope.user_obj.vpn_status)){
                showmodel('static/rest/app/client/templates/assets_onboarding/connectivity_status.html');
            }else{
                $scope.get_all_agents();
                showmodel('static/rest/app/client/templates/assets_onboarding/connectivity_request.html', 'lg conn_req_modal');
            }
            $timeout(function(){
                $scope.active_step_no = 1;
            },100);
        };

        $scope.conn_req = {};
        $scope.conn_req.auth_method = 'Pre-Shared Secret';
        $scope.conn_req.pre_shared_secret = 'Will be shared in private by our support team.';
        $scope.conn_req.ike_encryption_algorithm = 'AES-256';
        $scope.conn_req.ike_security_lifetime = '86400 secs';
        $scope.conn_req.ike_hash_algorithm = 'SHA';
        $scope.conn_req.ipsec_encryption_algorithm = 'AES-256';
        $scope.conn_req.ipsec_hash_algorithm = 'SHA';
        $scope.conn_req.ipsec_security_protocol = 'ESP';
        $scope.create_connectivity_request = function(conn_request){

            console.log('conn_request : ', angular.toJson(conn_request));

            $scope.email_errmsg = '';
            $scope.contact_number_errmsg = '';

            var stop_execution = false;

            if (conn_request.cust_email === undefined || (conn_request.cust_email === '')) {
                $scope.email_errmsg = 'required';
                stop_execution = true;
            }
            if (conn_request.cust_contact_number === undefined || ((conn_request.cust_contact_number === ''))) {
                $scope.contact_number_errmsg = 'required';
                stop_execution = true;
            }

            var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            if (!re.test(conn_request.cust_email)) {
                $scope.email_errmsg = 'Enter a valid email address';
                stop_execution = true;
            }

            var re = /^\d+$/;
            if (!re.test(conn_request.cust_contact_number)) {
                $scope.contact_number_errmsg = 'Enter a valid mobile number';
                stop_execution = true;
            }

            if (stop_execution) {
                return;
            }


            $scope.description = '###- VPN CONNECTIVITY DETAILS -###\n' +
            "===================================\n" +
            '\n ##- Contact Info -##\n' +
            "Requester: " + $rootScope.userEmail + "\n" +
            "Email: " + ((conn_request.cust_email == undefined) ? 'Not Available' : conn_request.cust_email) + "\n" +
            "Contact Number : " + ((conn_request.cust_contact_number == undefined) ? 'Not Available' : conn_request.cust_contact_number) + "\n" +

            "===================================\n" +
            '\n ##- Firewall Info -##\n' +
            "Manufacturer : " + ((conn_request.manufacturer == undefined) ? 'Not Available' : conn_request.manufacturer) + "\n" +
            "Model : " + ((conn_request.model == undefined) ? 'Not Available' : conn_request.model) + "\n" +
            "Version : " + ((conn_request.version == undefined) ? 'Not Available' : conn_request.version) + "\n" +

            "===================================\n" +
            '\n ##- IP addressing  -##\n' +
            "Peer IP Adresses: " + ((conn_request.peer_ip_address == undefined) ? 'Not Available' : conn_request.peer_ip_address) + "\n" +

            "===================================\n" +
            '\n ##- Inside Hosts or Subnets  -##\n' +
            "Hosts or Subnets : " + ((conn_request.subnets == undefined) ? 'Not Available' : conn_request.subnets) + "\n" +

            "===================================\n" +
            '\n ##- Settings  -##\n' +
            "Authentication Method : " + ((conn_request.auth_method == undefined) ? 'Not Available' : conn_request.auth_method) + "\n" +
            "DH Group Identifier : " + ((conn_request.dh_group_identifier == undefined) ? 'Not Available' : conn_request.dh_group_identifier) + "\n" +
            "IKE Encryption Algorithm : " + ((conn_request.ike_encryption_algorithm == undefined) ? 'Not Available' : conn_request.ike_encryption_algorithm) + "\n" +
            "IKE Security Lifetime : " + ((conn_request.ike_security_lifetime == undefined) ? 'Not Available' : conn_request.ike_security_lifetime) + "\n" +
            "IKE Hash Algorithm : " + ((conn_request.ike_hash_algorithm == undefined) ? 'Not Available' : conn_request.ike_hash_algorithm) + "\n" +
            "IPSEC Encryption Algorithm : " + ((conn_request.ipsec_encryption_algorithm == undefined) ? 'Not Available' : conn_request.ipsec_encryption_algorithm) + "\n" +
            "IPSEC Security Lifetime ( range - 460 secs to 28,800 secs) : " + ((conn_request.ipsec_security_lifetime == undefined) ? 'Not Available' : conn_request.ipsec_security_lifetime) + "\n" +
            "IPSEC Hash Algorithm : " + ((conn_request.ipsec_hash_algorithm == undefined) ? 'Not Available' : conn_request.ipsec_hash_algorithm) + "\n" +
            "IPSEC Security Protocol : " + ((conn_request.ipsec_security_protocol == undefined) ? 'Not Available' : conn_request.ipsec_security_protocol) + "\n" ;
            "===================================\n";

            // console.log('conn_request : ', angular.toJson($scope.description));

            var subject = "Request for VPN Connectivity";
            var formdata = {'subject': subject, 'description': $scope.description, 'system_type': 'Unity'};

            var createVpnTicket = function(){
                $http.post("/customer/ticketorganization/create_unity_vpn_ticket/",formdata).then(function (response) {
                    $scope.close_modal();
                    $scope.loader = true;
                    TaskService2.processTask(response.data.task_id).then(function (result) {
                       // update the client with the new model
                       $scope.loader = false;
                       get_status_details();
                       AlertService2.success("Ticket submitted successfully. Our Support team will contact you soon.", 3000);
                   }).catch(function (error) {
                     console.log(error);
                     $scope.loader = false;
                     $scope.close_modal();
                     get_status_details();
                     AlertService2.danger("Error while creating VPN.");
                 });
               });
            };

            $http.get("/customer/ticketorganization/check_user_in_zendesk/").then(function (response) {
                if (response.data.status=='success'){
                    createVpnTicket();
                }
                if (response.data.status=='failure'){
                    AlertService2.danger(response.data.status_message + ', please contact support.');
                    $scope.close_modal();
                }
            }).catch(function (error) {
                AlertService2.danger('Something went wrong, Please try again');
            });
        };

        $scope.show_add_devices_page = function(){
            $scope.fetch_vcenters();
            $scope.add_device_modal = showmodel('static/rest/app/client/templates/assets_onboarding/upload_devices.html', 'lg');
            $timeout(function(){
                $scope.active_step_no = 2;
            },100);
        };


        $scope.file = {};

        $scope.inventory_onboard_form = {};
        var upload_doc = function(attachment){
            $scope.loader = true;
            $scope.close_modal();
            var formdata = new FormData();
            formdata.append('onboarding_file', attachment);

            $http.post("customer/excel_onboard/",formdata,
            {
                headers: {
                    'Content-Type' : undefined
                },
                transformRequest: angular.identity,
            }).then(function (response) {
                get_onboarding_file();
                get_status_details();
                AlertService2.success("All the assets have been successfully added.");
            }).catch(function (error) {
                get_status_details();
                get_onboarding_file();
                    // $scope.close_modal();
                    AlertService2.danger("Error occured while adding devices. Please check the excel file for details.");
                    console.log('error : ', angular.toJson(error));
                });
        };


        $scope.createOnboardRequest = function(file){
            console.log('$scope.file : ',file);
            upload_doc(file);
        };

        $scope.cloud_type = "";
        $scope.show_monitoring_configure_page = function(){
            if($scope.user_obj.onb_status.monitoring_error){
                $http.get("/customer/observium/activate_monitoring/observium_unmapped_devices").then(function (response) {
                    console.log('response : ', angular.toJson(response.data));
                    $scope.monit_failed_devices = angular.copy(response.data);
                }).catch(function (error) {
                 console.log(error);
             });
            }
            $scope.cloud_type_list = ['VMware vCenter', 'VMware vCloud', 'OpenStack'];
            showmodel('static/rest/app/client/templates/assets_onboarding/activate_monitoring.html');
            $timeout(function(){
                $scope.active_step_no = 3;
            },100);
        };

        $scope.activate_monitoring = function(){
            console.log("act");
            $http.get("/customer/observium/activate_monitoring/").then(function (response) {
                get_status_details();
                AlertService2.info("Activate monitoring is initiated. Please check status after some time.");
                $scope.close_modal();
                TaskService2.processTask(response.data.task_id, 100).then(function (result) {
                    get_status_details();
                    if(result.length){
                        $http.get("/customer/observium/activate_monitoring/observium_unmapped_devices").then(function (response) {
                            console.log('response : ', angular.toJson(response.data));
                            $scope.monit_failed_devices = angular.copy(response.data);
                        }).catch(function (error) {
                         console.log(error);
                     });
                        $timeout(function(){
                            AlertService2.danger("Error while activating monitoring. Please contact support@unityonecloud.com");
                        }, 1000);
                    }else{
                        AlertService2.success("Monitoring for all the devices activeted successfully", 3000);
                    }
                }).catch(function (error) {
                    get_status_details();
                    console.log(error);
                    AlertService2.danger("Error while activating monitoring");
                });
            }).catch(function (error) {
             console.log(error);
             AlertService2.danger("Error while activate monitoring. Please contact support@unityonecloud.com");
             get_status_details();
         });

        };

        $scope.show_proxy_configure_page = function(){
            showmodel('static/rest/app/client/templates/assets_onboarding/proxy_config.html');
            $timeout(function(){
                $scope.active_step_no = 4;
            },100);
        };

        $scope.activate_mgmt_console = function(){
            $scope.close_modal();
            $scope.loader=true;
            // AlertService2.info("Activate management is initiated. Please check status after some time.");
            $http.get("/customer/activate_mgmt_access/").then(function (response) {
                $scope.loader = false;
                get_status_details();
                $scope.close_modal();
                AlertService2.success("Enabled management access for your account. :)");
            }).catch(function (error) {
             get_status_details();
             console.log(error);
             $scope.loader = false;
             $scope.close_modal();
             AlertService2.danger("Error while activate managmenet access. Please contact support@unityonecloud.com");
         });

        };

        $scope.update_vms = function(attachment, cloud_type){
            $scope.loader = true;
            $scope.close_modal();
            var formdata = new FormData();
            formdata.append('vm_file', attachment);

            $http.post("customer/enable_vm_monitoring/?cloud_type="+cloud_type,formdata,
            {
                headers: {
                    'Content-Type' : undefined
                },
                transformRequest: angular.identity,
            }).then(function (response) {
                get_onboarding_file();
                get_status_details();
                AlertService2.success("Monitoring parameters added successfully");
            }).catch(function (error) {
                get_status_details();
                    // $scope.close_modal();
                    AlertService2.danger("Error occured while adding monitoring parameters.");
                    console.log('error : ', angular.toJson(error));
                });
        };

        $scope.newScan = function(val){
            $scope.newScanRequest = val;
            $scope.inet_address_error = '';
            if(val){
                $timeout(function() {
                    document.network_scan_form.network_cidr.focus();
                },0);
            }
        };

        var checkHostsInScanResults = function(){
            for(var i=0; i<$scope.scanData.length;i++){
                if($scope.scanData[i].scan_results){
                    if (!JSON.parse($scope.scanData[i].scan_results).length){
                        $scope.scanData[i].noHostsFound = true;
                    }
                }
            }
        };

        $scope.getOrgScans = function(){
            console.log('in getOrgScans');
            $scope.results_loaded = false;
            $http.get("/customer/network_scan/?page_size=0").then(function (response) {
                $scope.scanData = response.data;
                checkHostsInScanResults();
                $scope.results_loaded = true;
            }).catch(function (error) {
             AlertService2.danger("Failed to load Network scan results");
             $scope.results_loaded = true;
         });
        };

        $scope.scanNetwork = function(inet, uuid){
            console.log('in scanNetwork', uuid, inet);
            $scope.inet_address_error = '';

            var re = /^([0-9]{1,3}\.){3}[0-9]{1,3}(\/([0-9]|[1-2][0-9]|3[0-2]))?$/;

            if ((inet == undefined) || (inet == '')){
                $scope.inet_address_error = 'This field is required';
                return;
            }
            else if(!re.test(inet)) {
                $scope.inet_address_error = 'This is not a valid CIDR address';
                return;
            }

            $scope.newScan(false);
            if (uuid){
                var method = 'put';
                var data = {};
                var url = "/customer/network_scan/"+ uuid + "/";
            }
            else{
                var method = 'post';
                var data ={"inet": inet};
                var url = "/customer/network_scan/";
            }
            $http({'method': method, 'url': url, 'data': data}).then(function (response) {
                $scope.scanData = response.data;
                checkHostsInScanResults();
            }).catch(function (error) {
             AlertService2.danger("Network scanning failed.");
         });
        };

        var modalInstance;
        $scope.deleteNetwork = function(index, network){
            var obj = {};
            obj.index = index;
            obj.method = 'Delete';
            obj.uuid = network.uuid;
            obj.delete_confirm_msg = "Are you sure you want to delete ?";
            $scope.modal_obj  = angular.copy(obj);

            modalInstance = $uibModal.open({
                templateUrl: 'static/rest/app/client/templates/modals/delete_cabinet_confirm.html',
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

        $scope.delete_object = function(){
            var url = '/customer/network_scan/' + $scope.modal_obj.uuid;
            $http.delete(url).then(function(data){
                $scope.scanData.splice($scope.modal_obj.index, 1);
                $scope.cancel();
            }).catch(function(error){
                $scope.cancel();
            });
        };

        $scope.scanData = [
        ];


        $scope.agentConfigData = [];
        $scope.get_all_agents = function(){
            $http.get("/customer/agent/config/?page_size=0").then(function (response) {
                $scope.agentConfigData = response.data;
                console.log("Agent config data : "+angular.toJson($scope.agentConfigData));
            }).catch(function (error) {
                AlertService2.danger("Agent fetching failed.");
            });

        };

        $scope.get_all_agents();

        $scope.name_error = '';
        $scope.ip_address_error = '';
        $scope.ssh_username_error = '';
        $scope.ssh_password_error = '';

        $scope.addAgentForm = function(){

            var modalInstance = $uibModal.open({
                templateUrl: 'static/rest/app/client/templates/assets_onboarding/add_agent.html',
                scope: $scope,
                size: 'lg',
            });
            modalInstance.result.then();
            $scope.close = function(){
                modalInstance.close();
            };

        };

        $scope.addAgent = function(data){
            console.log("Add Agent : "+angular.toJson(data));
            var required_err_msg = 'This field is required';
            if(data == undefined){
                $scope.name_error = required_err_msg;
                $scope.ip_address_error = required_err_msg;
                $scope.ssh_username_error = required_err_msg;
                $scope.ssh_password_error = required_err_msg;
            }

            if ((data.name == undefined) || (data.name == '')){
                $scope.name_error = required_err_msg;
                return;
            }
            if ((data.ip_address == undefined) || (data.ip_address == '')){
                $scope.ip_address_error = required_err_msg;
                return;
            }
            if ((data.ssh_username == undefined) || (data.ssh_username == '')){
                $scope.ssh_username_error = required_err_msg;
                return;
            }
            if ((data.ssh_password == undefined) || (data.ssh_password == '')){
                $scope.ssh_password_error = required_err_msg;
                return;
            }

            $scope.close();
            $scope.close_modal();

            AlertService2.success("Agent Installation is in progress.");
            $http.post("/customer/agent/config/", data).then(function (response) {
                $scope.agentConfigData = response.data.results;
                console.log("Agent config data : "+angular.toJson($scope.agentConfigData));
                AlertService2.success("Agent Installation is complete.");
            }).catch(function (error) {
                console.log("Error : "+angular.toJson(error));
                if(error.status == 400){
                    $scope.error_msg = '';
                    if(typeof error.data == 'string'){
                        $scope.error_msg = error.data;
                    }
                    else{
                        angular.forEach(error.data, function(value, key) {
                            // console.log(key, value);
                            $scope.error_msg = $scope.error_msg + key + "->"+ value[0]+"\n";
                        });
                    }
                    
                    AlertService2.danger("Agent Installation failed. Following Issues : "+$scope.error_msg  );    
                }
                
            });
            $scope.get_all_agents();

        };

        $scope.deleteAgent = function(index, data){
            if (window.confirm("Are you sure want to delete this agent ?")) {
                var url = '/customer/agent/config/' + data.uuid;
                $http.delete(url).then(function(data){
                    $scope.agentConfigData.splice(index, 1);
                    AlertService2.success("Agent deletion is in progress.");
                }).catch(function(error){
                    AlertService2.danger("Agent deletion failed.");
                });
            }

        };

    }
]);
