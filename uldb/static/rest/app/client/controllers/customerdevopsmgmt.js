var app = angular.module('uldb');

app.controller('CustomerDevOpsMgmtController', [
    '$scope',
    '$rootScope',
    '$http',
    '$uibModal',
    '$window',
    'AlertService2',
    function ($scope, $rootScope, $http, $uibModal, $window, AlertService2) {
        $scope.devices = {};
        $scope.loader = true;

        $scope.sortkey = '';

        $scope.sort = {
            sortingColumn: '',
            reverse: false
        };

        $scope.getSortingResults = function(sort){
            $scope.sortkey = sort.sortingColumn;
        };

        var getDevOpsControllers = function(){
            $http.get("/customer/devops_controllers/").then(function (response) {
                $scope.devices = response.data;
                $scope.loader = false;
            }).catch(function (error) {
               console.log('error : ', angular.toJson(error));
               $scope.loader = false;
            });
        };
        getDevOpsControllers();

        var modalRef = null;
        var showModal = function (template, controller, modal_size) {
            if (modalRef) {
                modalRef.dismiss('cancel');
            }
            modalRef = $uibModal.open({
                templateUrl: template,
                controller: controller,
                scope: $scope,
                size: modal_size,
                backdrop: 'static'
            });
        };

        $scope.close_modal = function(){
            $scope.access_failed = false;
            modalRef.dismiss('cancel');
        };

        $scope.cancel = function(){
            $scope.access_failed = false;
            modalRef.dismiss('cancel');
        };

        $scope.device = {};
        $scope.add_device_form = {};
        $scope.addDevice = function(device_type){
            $scope.device = {};
            $scope.device.device_type = device_type;
            $scope.device.platform_type = 'Linux';
            $scope.device.operation = 'Add';
            showModal('static/rest/app/client/templates/modals/devopes-device-mgmt.html');
        };

        var addDeviceDetails = function(device, form){
            $scope.loader = true;
            $http.post("/customer/devops_controllers/", device).then(function (response) {
                $scope.devices.results.push(response.data);
                $scope.devices.count += 1;
                $scope.loader = false;
                $scope.close_modal();
                AlertService2.success("Server created successfully.");
            }).catch(function (error) {
               console.log('error : ', angular.toJson(error));
               if(error.data && error.data.device_name){
                form.device_name.$setValidity("unique", false);
                form.device_name.$setPristine();
               }else{
                    form.device_name.$setValidity("unique", true);
                    $scope.close_modal();
                    AlertService2.danger("Error in creating Server. Please contact Administrator (support@unityonecloud.com)");
               }
               $scope.loader = false;
            });
        };

        $scope.updateDevice = function(device, index){
            console.log('device : ', angular.toJson(device));
            $scope.selected_device = device;
            $scope.selected_device_index = index;
            $scope.device = {};
            $scope.device.device_type = device.device_type;
            $scope.device.platform_type = device.platform_type;
            $scope.device.device_name = device.device_name;
            $scope.device.os = device.os;
            $scope.device.ip_address = device.ip_address;
            $scope.device.port = device.port;
            $scope.device.uuid = device.uuid;
            $scope.device.operation = 'Update';
            showModal('static/rest/app/client/templates/modals/devopes-device-mgmt.html');

        };

        var updateDeviceDetails = function(device, form){
            console.log('device : ', angular.toJson(device));
            var uuid = angular.copy(device.uuid);
            delete device.uuid;
            var url = '/customer/devops_controllers/' + uuid + '/';
            $http.put(url, device).then(function (response) {
                $scope.devices.results[$scope.selected_device_index] = response.data;
                $scope.close_modal();
                AlertService2.success("Server updated successfully.");
            }).catch(function (error) {
               console.log('error : ', angular.toJson(error));
               $scope.close_modal();
               AlertService2.danger("Error in updating Server. Please contact Administrator (support@unityonecloud.com)");
            });
        };

        $scope.manageDeviceDetails = function(device, form){
            if(form.$invalid && (form.$error.required || form.$error.pattern)){
                return;
            }
            if(device.operation == 'Add'){
                addDeviceDetails(device, form);
            }else{
                updateDeviceDetails(device, form);
            }
        };

        $scope.deleteDevice = function(device, index){
            $scope.device_selected = device;
            $scope.selected_device_index = index;
            showModal('static/rest/app/client/templates/modals/delete_confirm_modal.html');
        };

        $scope.delete_object = function(){
            var url = '/customer/devops_controllers/' + $scope.device_selected.uuid + '/';
            $http.delete(url).then(function (response) {
                $scope.devices.results.splice($scope.selected_device_index, 1);
                $scope.devices.count -= 1;
                $scope.close_modal();
                AlertService2.success("Server deleted successfully.");
            }).catch(function (error) {
               console.log('error : ', angular.toJson(error));
               $scope.close_modal();
               AlertService2.danger("Error in deleting Server. Please contact Administrator (support@unityonecloud.com)");
            });
        };

        $scope.manageInNewTab = function(device){
            var url = '';
            if(device.platform_type == 'Windows'){
                url = '/rdp?ip=' + device.ip_address + '&domain=unitedlayer.com';
            }else{
                var device_details = {};
                device_details.device_name = device.device_name;
                device_details.ip_address = device.ip_address;
                device_details.port = device.port;
                localStorage.setItem('device_details', angular.toJson(device_details));
                url = '/vm-console-client#/webconsole/'+ device.uuid + '/';
            }
            $window.open(url, '_blank');
        };

        $scope.manageByRequest = function(device){
            $scope.device_type = 'Server';
            $scope.device_name = device.device_name;
            $scope.description ="Device Name: " + device.device_name + "\n" +
                "Operating System: " + device.os + "\n" +
                "IP Address: " + device.ip_address + "\n" +
                "Port: " + device.port;
            showModal('static/rest/app/client/templates/manage_request.html', 'ManageRequestController');
        };

        var modalInstance;
        $scope.manageInSameTab = function(device){
            $scope.device = {};
            $scope.device.device_name = device.device_name;
            $scope.device.uuid = device.uuid;
            $scope.device.ip_address = device.ip_address;
            $scope.device.port = device.port;
            showModal('static/rest/app/client/templates/modals/console_access_check.html');
        };

        var manageTerminalData = function(){
            var device_details = {};
            device_details.device_name = $scope.device.device_name;
            device_details.uuid = $scope.device.uuid;
            device_details.hostname = $scope.device.ip_address;
            device_details.port = $scope.device.port;
            device_details.username = $scope.device.username;
            device_details.password = $scope.device.password;

            localStorage.setItem('terminal_details', angular.toJson(device_details));
             $scope.initializeFloatingTerminal();
        };

        $scope.access_failed = false;
        $scope.checkUserAccess = function(){
            var url = '/customer/devops_controllers/' + $scope.device.uuid + '/check_auth/';
            $scope.device.host = $scope.device.ip_address;
            $http.post(url, $scope.device).then(function (response) {
                $scope.access_failed = false;
                $scope.cancel();
                manageTerminalData();
            }).catch(function (error) {
                $scope.access_failed = true;
                console.log('auth failed : ', error);
            });
        };



    }
]);


app.controller('CustomerWebConsoleController', [
    '$scope',
    '$stateParams',
    '$http',
    '$uibModal',
    'UserOrgLogoService',
    '$window',
    function ($scope, $stateParams, $http, $uibModal, UserOrgLogoService, $window) {
        $scope.device = {};
        $scope.loader = false;

        UserOrgLogoService.get_org_logo().then(function (result) {
            $scope.user_org_logo = result.data.logo;
        });
        $scope.device = JSON.parse(localStorage.getItem('device_details'));
        var modalInstance;
        modalInstance = $uibModal.open({
            templateUrl: 'static/rest/app/client/templates/modals/console_access_check.html',
            scope: $scope,
            size: 'md',
            backdrop: 'static'
        });

        $scope.cancel = function () {
            modalInstance.dismiss();
            goBack();
        };

        function goBack(){
            localStorage.removeItem('device_details');
            var win = window.open("","_self"); /* url = “” or “about:blank”; target=”_self” */
            win.close();
        }

        $scope.access_failed = false;
        $scope.checkUserAccess = function(form){
            var url = '/customer/devops_controllers/' + $stateParams.uuid + '/check_auth/';
            $scope.device.host = $scope.device.ip_address;
            $http.post(url, $scope.device).then(function (response) {
                $scope.access_failed = false;
                modalInstance.dismiss();
                InitializeTerminal();
            }).catch(function (error) {
                console.log('auth failed : ', error);
                $scope.access_failed = true;
            });
        };

        var options = {
            host: $scope.device.ip_address,
            port: $scope.device.port,
        };

        // WSSHClient Initialization
        function WSSHClient() {
            WSSHClientInitialization();
        }

        function WSSHClientInitialization() {
            WSSHClient.prototype._generateEndpoint = function () {
                if (window.location.protocol == 'https:') {
                    var protocol = 'wss://';
                } else {
                    var protocol = 'ws://';
                }
                var endpoint = protocol + $window.location.host + "/vmterminal/" + $stateParams.uuid + '/';
                // var endpoint = protocol +'192.168.56.112:8080'+"/vmterminal/"+ $stateParams.uuid +'/';
                return endpoint;
            };

            WSSHClient.prototype.connect = function (options) {
                /*global MozWebSocket this._connection:true*/
                /*eslint no-undef: "error"*/
                var endpoint = this._generateEndpoint();

                if (window.WebSocket) {
                    this._connection = new WebSocket(endpoint);
                }
                else if (window.MozWebSocket) {
                    this._connection = MozWebSocket(endpoint);
                }
                else {
                    options.onError('WebSocket Not Supported');
                    return;
                }

                this._connection.onopen = function () {
                    options.onConnect();
                };

                this._connection.onmessage = function (evt) {
                    var data = evt.data.toString();
                    options.onData(data);
                };


                this._connection.onclose = function (evt) {
                    options.onClose();
                };
            };

            WSSHClient.prototype.send = function (data) {
                this._connection.send(JSON.stringify(data));
            };

            WSSHClient.prototype.sendInitData = function (options) {
                var data = {
                    hostname: options.host,
                    port: options.port,
                    username: options.username,
                    password: options.password,
                    rows: options.rows,
                    cols: options.cols
                };
                console.log("Sending :"+JSON.stringify({"tp": "init", "data": data}));
                this._connection.send(JSON.stringify({"tp": "init", "data": data}));
            };

            WSSHClient.prototype.sendClientData = function (data) {
                this._connection.send(JSON.stringify({"tp": "client", "data": data}));
            };
        }

        function InitializeTerminal(){
            /*global Terminal term:true*/
            /*eslint no-undef: "error"*/
            var terminalContainer = document.getElementById('terminal-container');
            var term = new Terminal({screenKeys: true, useStyle: true, cursorBlink: true});
            term.open(terminalContainer);

            var parentElementStyle = window.getComputedStyle(term.element.parentElement),
                parentElementHeight = parseInt(parentElementStyle.getPropertyValue('height')),
                parentElementWidth = Math.max(0, parseInt(parentElementStyle.getPropertyValue('width')) - 17),
                elementStyle = window.getComputedStyle(term.element),
                elementPaddingVer = parseInt(elementStyle.getPropertyValue('padding-top')) + parseInt(elementStyle.getPropertyValue('padding-bottom')),
                elementPaddingHor = parseInt(elementStyle.getPropertyValue('padding-right')) + parseInt(elementStyle.getPropertyValue('padding-left')),
                availableHeight = parentElementHeight - elementPaddingVer,
                availableWidth = parentElementWidth - elementPaddingHor,
                container = term.rowContainer,
                subjectRow = term.rowContainer.firstElementChild,
                contentBuffer = subjectRow.innerHTML,
                characterHeight,
                rows,
                characterWidth,
                cols,
                geometry;

            subjectRow.style.display = 'inline';
            subjectRow.innerHTML = 'W'; // Common character for measuring width, although on monospace
            characterWidth = subjectRow.getBoundingClientRect().width;
            subjectRow.style.display = ''; // Revert style before calculating height, since they differ.
            characterHeight = subjectRow.getBoundingClientRect().height;
            subjectRow.innerHTML = contentBuffer;

            rows = parseInt(availableHeight / characterHeight) - 1;
            cols = parseInt(availableWidth / characterWidth);

            term.resize(cols, rows);
            angular.extend(options, {rows: rows, cols: cols, username: $scope.device.username, password: $scope.device.password});
            openTerminal(term);
        }

        function openTerminal(term) {

            var client = new WSSHClient();

            term.on('data', function (data) {
                client.sendClientData(data);
            });

            term.on('paste', function (data) {
                client.sendClientData(data);
            });


            $('.terminal').detach().appendTo('#terminal-container');
            term.write('Connecting...');
            client.connect({
                onError: function (error) {
                    term.write('Error: ' + error + '\r\n');
                    console.debug('error happened');
                },
                onConnect: function () {
                    client.sendInitData(options);
                    console.debug('connection established');
                    term.write('\r\n');
                    term.focus();
                },
                onClose: function () {
                    term.write("\rconnection closed");
                    console.debug('connection reset by peer');
                },
                onData: function (data) {
                    term.write(data);
                    console.debug('get data:' + data);
                }
            });
        }

    }
]);

app.controller('FloatingTerminalMgmtController',[
    '$scope',
    '$document',
    '$timeout',
    '$window',
    function($scope, $document, $timeout, $window){
        $scope.terminalName = 'Terminal';
        var options = {};
        var term = new Terminal({screenKeys: true, useStyle: true, cursorBlink: true});

        $scope.openNav = function() {
            $("#terminalnav").height(250);
            $("#terminalnav").resizable({
                handles: "n",
                minHeight: 150,
                maxHeight: ($( window ).height() - 70),
                autoHide: true
            });
        };

        $scope.closeNav = function() {
            $("#terminalnav").resizable("destroy");
            $('#floating-terminal').html('');
            $("#terminalnav").height(0);
            $("#terminalnav").css('top', '');
        };

        $scope.maximize = function() {
            $("#terminalnav").css('top', '');
            $("#terminalnav").height($( window ).height() - 70);
            $timeout(function() {
                term.fit();
            }, 0);
        };

        $scope.minimize = function() {
            $("#terminalnav").css('top', '');
            $("#terminalnav").height(250);
            $timeout(function() {
                term.fit();
            }, 0);
        };

         // WSSHClient Initialization
        function WSSHClient() {
            WSSHClientInitialization();
        }

        function WSSHClientInitialization() {
            WSSHClient.prototype._generateEndpoint = function () {
                if (window.location.protocol == 'https:') {
                    var protocol = 'wss://';
                } else {
                    var protocol = 'ws://';
                }
                var endpoint = protocol + $window.location.host + "/vmterminal/" + options.uuid + '/';
                // var endpoint = protocol + '192.168.56.112:8080'+ "/vmterminal/" + options.uuid + '/';
                return endpoint;
            };

            WSSHClient.prototype.connect = function (options) {
                var endpoint = this._generateEndpoint();

                if (window.WebSocket) {
                    this._connection = new WebSocket(endpoint);
                }
                else if (window.MozWebSocket) {
                    this._connection = MozWebSocket(endpoint);
                }
                else {
                    options.onError('WebSocket Not Supported');
                    return;
                }

                this._connection.onopen = function () {
                    options.onConnect();
                };

                this._connection.onmessage = function (evt) {
                    var data = evt.data.toString();
                    options.onData(data);
                };


                this._connection.onclose = function (evt) {
                    options.onClose();
                };
            };

            WSSHClient.prototype.send = function (data) {
                this._connection.send(JSON.stringify(data));
            };

            WSSHClient.prototype.sendInitData = function (options) {
                var data = {
                    hostname: options.hostname,
                    port: options.port,
                    username: options.username,
                    password: options.password,
                    rows: options.rows,
                    cols: options.cols
                };
                console.log("Sending :"+JSON.stringify({"tp": "init", "data": data}));
                this._connection.send(JSON.stringify({"tp": "init", "data": data}));
            };

            WSSHClient.prototype.sendClientData = function (data) {
                this._connection.send(JSON.stringify({"tp": "client", "data": data}));
            };
        }

        $scope.initializeFloatingTerminal = function(){
            $('#floating-terminal').html('');
            options = JSON.parse(localStorage.getItem('terminal_details'));
            var terminalContainer = document.getElementById('floating-terminal');
            // term = new Terminal({screenKeys: true, useStyle: true, cursorBlink: true});
            term.open(terminalContainer);
            $scope.openNav();
            term.write('Connecting...');

            var parentElementStyle = window.getComputedStyle(term.element.parentElement),
                parentElementHeight = parseInt(parentElementStyle.getPropertyValue('height')),
                parentElementWidth = Math.max(0, parseInt(parentElementStyle.getPropertyValue('width')) - 17),
                elementStyle = window.getComputedStyle(term.element),
                elementPaddingVer = parseInt(elementStyle.getPropertyValue('padding-top')) + parseInt(elementStyle.getPropertyValue('padding-bottom')),
                elementPaddingHor = parseInt(elementStyle.getPropertyValue('padding-right')) + parseInt(elementStyle.getPropertyValue('padding-left')),
                availableHeight = parentElementHeight - elementPaddingVer,
                availableWidth = parentElementWidth - elementPaddingHor,
                container = term.rowContainer,
                subjectRow = term.rowContainer.firstElementChild,
                contentBuffer = subjectRow.innerHTML,
                characterHeight,
                rows,
                characterWidth,
                cols,
                geometry;
            subjectRow.style.display = 'inline';
            subjectRow.innerHTML = 'W'; // Common character for measuring width, although on monospace
            characterWidth = subjectRow.getBoundingClientRect().width;
            subjectRow.style.display = ''; // Revert style before calculating height, since they differ.
            characterHeight = subjectRow.getBoundingClientRect().height;
            subjectRow.innerHTML = contentBuffer;

            rows = parseInt(availableHeight / characterHeight) - 1;
            cols = parseInt(availableWidth / characterWidth);

            term.resize(cols, rows);
            angular.extend(options, {rows: rows, cols: cols});
            // term.write('Hello from \x1B[1;3;31mxterm.js\x1B[0m $');
            openTerminal(term);
        };

        function openTerminal(term) {

            var client = new WSSHClient();

            term.on('data', function (data) {
                client.sendClientData(data);
            });

            term.on('paste', function (data) {
                client.sendClientData(data);
            });

            $('.terminal').detach().appendTo('#floating-terminal');
            client.connect({
                onError: function (error) {
                    term.write('Error: ' + error + '\r\n');
                    console.debug('error happened');
                },
                onConnect: function () {
                    client.sendInitData(options);
                    console.debug('connection established');

                    term.write('\r\n');
                    term.focus();
                },
                onClose: function () {
                    term.write("\rconnection closed");
                    console.debug('connection reset by peer');
                },
                onData: function (data) {
                    term.write(data);
                    console.debug('get data:' + data);
                }
            });
        }
    }
]);