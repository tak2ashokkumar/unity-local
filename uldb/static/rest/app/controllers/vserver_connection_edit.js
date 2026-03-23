var app = angular.module('uldb');

app.controller('VServerConnectionEditController', [
    '$scope',
    'VirtualServer',
    '$http',
    'URLService',
    '$filter',
    '$location',
    function ($scope, VirtualServer, $http, URLService, $filter, $location) {

        $scope.connection = new VirtualServer();

        var connectionURL = URLService.GetSetURL("");

        $scope.MACAdded = [{ name: 'mac', value: '00:00:00:00:00:00' }];
        $scope.IPAdded = [{ name: 'ip', value: '0.0.0.0' }];
        $scope.VLANAdded = [{ name: 'vlan', value: '0' }];

        $scope.vserver_connection = [];

        /*** Get basic details of virtual server ***/

        $http.get(connectionURL + "connection_edit/").then(function (result) {

            var total_nics = 0;
            total_nics = result.data.virtualsystem.ethports;
            window.con_sys_name = result.data.virtualsystem.name;

            var res_nic_macaddress = "";
            var res_nic_ipaddress = "";
            var res_default_gateway = "";
            var res_vlan_tag = "";

            if (total_nics > 0) {

                for (var rescount = 0; rescount <= result.data.icds.length - 1; rescount++) {
                    if (result.data.icds[rescount].interface_name == 'eth0') {
                        res_nic_macaddress = "";
                        res_nic_ipaddress = "";
                        res_default_gateway = "";
                        res_vlan_tag = "";

                        res_nic_macaddress = result.data.icds[rescount].nic_macaddress;
                        res_nic_ipaddress = result.data.icds[rescount].nic_ipaddress;
                        res_default_gateway = result.data.icds[rescount].default_gateway;
                        res_vlan_tag = result.data.icds[rescount].vlan_tag;

                        var curmac = { name: 'mac0', value: res_nic_macaddress };
                        $scope.MACAdded.push(curmac);

                        var curip = { name: 'ip0', value: res_nic_ipaddress };
                        $scope.IPAdded.push(curip);

                        var curvlan = { name: 'vlan0', value: res_vlan_tag };
                        $scope.VLANAdded.push(curvlan);
                    }
                }


                var eth = [{
                    interface_name: 'eth0',
                    nic_macaddress: res_nic_macaddress,
                    mac_id: 'mac0',
                    nic_ipaddress: res_nic_ipaddress,
                    ip_id: 'ip0',
                    default_gateway: res_default_gateway,
                    vlan_tag: res_vlan_tag,
                    vlan_id: 'vlan0',
                    customer: result.data.virtualsystem.related.customer,
                    system: result.data.virtualsystem.system,
                    instance: result.data.virtualsystem.related.instance
                }];
                var count = 0;
                res_nic_macaddress = "";
                res_nic_ipaddress = "";
                res_default_gateway = "";
                res_vlan_tag = "";


                for (var i = 0; i <= total_nics - 2; i++) {

                    count = i + 1;

                    for (rescount = 0; rescount <= result.data.icds.length - 1; rescount++) {
                        var ethname = 'eth' + count;
                        if (result.data.icds[rescount].interface_name == ethname) {
                            res_nic_macaddress = "";
                            res_nic_ipaddress = "";
                            res_default_gateway = "";
                            res_vlan_tag = "";

                            res_nic_macaddress = result.data.icds[rescount].nic_macaddress;
                            res_nic_ipaddress = result.data.icds[rescount].nic_ipaddress;
                            res_default_gateway = result.data.icds[rescount].default_gateway;
                            res_vlan_tag = result.data.icds[rescount].vlan_tag;

                            curmac = { name: 'mac' + count, value: res_nic_macaddress };
                            $scope.MACAdded.push(curmac);

                            curip = { name: 'ip' + count, value: res_nic_ipaddress };
                            $scope.IPAdded.push(curip);

                            curvlan = { name: 'vlan' + count, value: res_vlan_tag };
                            $scope.VLANAdded.push(curvlan);

                            break;
                        }
                        else {
                            res_nic_macaddress = "";
                            res_nic_ipaddress = "";
                            res_default_gateway = "";
                            res_vlan_tag = "";
                        }


                    }
                    eth.push({
                        interface_name: 'eth' + count,
                        nic_macaddress: res_nic_macaddress,
                        mac_id: 'mac' + count,
                        nic_ipaddress: res_nic_ipaddress,
                        ip_id: 'ip' + count,
                        default_gateway: res_default_gateway,
                        vlan_tag: res_vlan_tag,
                        vlan_id: 'vlan' + count,
                        customer: result.data.virtualsystem.related.customer,
                        system: result.data.virtualsystem.system,
                        instance: result.data.virtualsystem.related.instance
                    });

                }

                $scope.eth_det = eth;
            }
        });

        /*** on click cancel button ***/

        $scope.CancelVConnectionEdit = function () {
            $location.path('/virtualservers/');
        };

        /*** validate IP address  ***/

        $scope.ValidateIP = function (event) {
            var ipadded = false;
            var ipavail = false;

            $(event.target).tooltip('destroy');

            if ($(event.target).val() != "") {
                $(event.target).tooltip('destroy');

                var pattern = /\b(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/;
                if ($(event.target).val().split(".").length > 4) {


                    $(event.target).focus();
                    $(event.target).tooltip({
                        title: 'Invalid IP address'
                    });
                    $(event.target).tooltip('show');

                    return false;
                }
                else if (!pattern.test($(event.target).val())) {
                    $(event.target).tooltip({
                        title: 'Invalid IP address'
                    });

                    $(event.target).focus();
                    $(event.target).tooltip('show');

                    return false;
                }
                else {

                    $(event.target).tooltip('destroy');
                    for (var i = 0; i <= $scope.IPAdded.length - 1; i++) {
                        if ($scope.IPAdded[i].name == event.target.id && $scope.IPAdded[i].value == event.target.value) {
                            ipadded = true;
                        }

                    }

                    if (ipadded == false) {
                        for (var i = 0; i <= $scope.IPAdded.length - 1; i++) {
                            if ($scope.IPAdded[i].value == event.target.value) {
                                ipavail = true;
                            }

                        }
                    }

                    if (ipavail == false && ipadded == false) {
                        var curip = { name: event.target.id, value: event.target.value };
                        $scope.IPAdded.push(curip);
                        $(event.target).tooltip('destroy');
                        return true;
                    }
                    else if (ipadded) {
                        $(event.target).tooltip('destroy');
                        return true;
                    }
                    else {
                        $(event.target).tooltip('destroy');
                        $(event.target).tooltip({
                            title: 'IP address already added'
                        });

                        $(event.target).focus();
                        $(event.target).tooltip('show');
                        return false;
                    }
                }
            }
        };

        /*** validate Default gateway IP address  ***/

        $scope.ValidateDefGwy = function (event) {
            $(event.target).tooltip('destroy');

            if ($(event.target).val() != "") {
                var pattern = /\b(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/;
                if ($(event.target).val().split(".").length > 4) {


                    $(event.target).focus();
                    $(event.target).tooltip({
                        title: 'Invalid IP address'
                    });
                    $(event.target).tooltip('show');

                    return false;
                }
                else if (!pattern.test($(event.target).val())) {
                    $(event.target).tooltip({
                        title: 'Invalid IP address'
                    });

                    $(event.target).focus();
                    $(event.target).tooltip('show');

                    return false;
                }
                else {

                    $(event.target).tooltip('destroy');
                    return true;
                }
            }
        };


        /***** Function to validate mac address ******/

        $scope.validateMAC = function (event) {
            var macadded = false;
            var macavail = false;

            if ($(event.target).val() != "") {
                var splcharlength = '';
                var value = $(event.target).val().toUpperCase();

                $(event.target).tooltip('destroy');

                splcharlength = value.match(/:/g);

                if (!splcharlength)
                    splcharlength = value.match(/-/g);

                if (splcharlength && splcharlength.length == 5) {
                    var regex = /^([0-9A-F]{2}[:-]){5}([0-9A-F]{2})$/;
                    if (!regex.test(value)) {
                        $(event.target).focus();
                        $(event.target).tooltip({
                            title: 'Invalid MAC address'
                        });
                        $(event.target).tooltip('show');
                        return false;
                    }
                    else {
                        $(event.target).tooltip('destroy');

                        for (var i = 0; i <= $scope.MACAdded.length - 1; i++) {
                            if ($scope.MACAdded[i].name == event.target.id && $scope.MACAdded[i].value == event.target.value) {
                                macadded = true;
                            }

                        }

                        if (macadded == false) {
                            for (var i = 0; i <= $scope.MACAdded.length - 1; i++) {
                                if ($scope.MACAdded[i].value == event.target.value) {
                                    macavail = true;
                                }

                            }
                        }

                        if (macavail == false && macadded == false) {
                            var curmac = { name: event.target.id, value: event.target.value };
                            $scope.MACAdded.push(curmac);
                            $(event.target).tooltip('destroy');
                            return true;
                        }
                        else if (macadded) {
                            $(event.target).tooltip('destroy');
                            return true;
                        }
                        else {
                            $(event.target).tooltip('destroy');
                            $(event.target).tooltip({
                                title: 'MAC address already added'
                            });

                            $(event.target).focus();
                            $(event.target).tooltip('show');
                            return false;

                        }
                    }
                }
                else {
                    $(event.target).tooltip({
                        title: 'Invalid MAC address'
                    });

                    $(event.target).focus();
                    $(event.target).tooltip('show');
                    return false;
                }


            }
        };

        /*** validate vlan ***/

        $scope.validatevlan = function (event) {

            var vlanadded = false;
            var vlanavail = false;

            if ($(event.target).val() != "") {
                $(event.target).tooltip('destroy');

                for (var i = 0; i <= $scope.VLANAdded.length - 1; i++) {
                    if ($scope.VLANAdded[i].name == event.target.id && $scope.VLANAdded[i].value == event.target.value) {
                        vlanadded = true;
                    }

                }

                if (vlanadded == false) {
                    for (var i = 0; i <= $scope.VLANAdded.length - 1; i++) {
                        if ($scope.VLANAdded[i].value == event.target.value) {
                            vlanavail = true;
                        }

                    }
                }

                if (vlanavail == false && vlanadded == false) {
                    var curvlan = { name: event.target.id, value: event.target.value };
                    $scope.VLANAdded.push(curvlan);
                    $(event.target).tooltip('destroy');
                    return true;
                }
                else if (vlanadded) {
                    $(event.target).tooltip('destroy');
                    return true;
                }
                else {
                    $(event.target).tooltip('destroy');
                    $(event.target).tooltip({
                        title: 'VLAN already added'
                    });

                    $(event.target).focus();
                    $(event.target).tooltip('show');
                    return false;
                }
            }
            else {
                $(event.target).tooltip('destroy');
                return true;
            }

        };

        /*** on hover destroy the tooltip ***/

        $scope.DestroyValMsg = function (event) {
            $(event.target).tooltip('destroy');
            return true;

        };

        /*** on save the connection details ***/

        $scope.SaveVConnectionEdit = function () {

            for (var i = 0; i <= $scope.eth_det.length - 1; i++) {
                if ($scope.eth_det[i].nic_macaddress != "" && $scope.eth_det[i].nic_ipaddress != "") {
                    $scope.eth_det[i].mac_id = undefined;
                    $scope.eth_det[i].ip_id = undefined;
                    $scope.eth_det[i].vlan_id = undefined;
                    $scope.vserver_connection.push($scope.eth_det[i]);
                }
            }

            if ($scope.vserver_connection.length > 0) {
                $http.post(connectionURL + "connection_edit/", { 'connection_edit': $scope.vserver_connection }).then(function (response) {
                    $location.path("/virtualservers/").search({ param: "Server Connection [" + window.con_sys_name + "] updated successfully" });
                });
            }
        };


    }]);



