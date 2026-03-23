var app = angular.module('uldb');

app.controller('ConnectionEditController', [
    '$scope',
    'Server',
    '$http',
    'SystemPowerSupplyPort',
    'URLService',
    '$filter',
    '$location',
    function ($scope, Server, $http, SystemPowerSupplyPort, URLService, $filter, $location) {

        $scope.connection = new Server();

        $scope.PS_Ports = [];
        $scope.ETH_details = [];
        $scope.ipmi = [];

        $scope.connection.PDUDetails = [];
        $scope.connection.ETHDetails = [];
        $scope.connection.IPMIDetails = [];

        $scope.pdu_det = [{}];
        $scope.eth_det = [{}];

        $scope.MACAdded = [{}];
        $scope.IPAdded = [{}];

        $scope.PSAdded = [{}];
        $scope.ETHAdded = [{}];

        $scope.bridgemodediv = false;
        $scope.etherror = false;
        $scope.MACerror = false;
        $scope.hideETH = false;
        $scope.hidePDU = false;
        $scope.ethrequireerror = false;
        $scope.pdurequireerror = false;
        $scope.pduaddederror = false;
        $scope.ethaddederror = false;

        $scope.showAddPDU = true;
        $scope.showUpdatePDU = false;

        $scope.showAddETH = true;
        $scope.showUpdateETH = false;

        $scope.HideVLANdiv = true;
        $scope.ETHAvailable = true;
        $scope.ETHNotAvailable = true;

        $scope.showPS = false;

        $scope.showETH = false;

        var connectionURL = URLService.GetSetURL("");

        $scope.system = null;

        $scope.customer = null;

        $scope.instance = null;

        $scope.motherboard = null;

        $scope.ipmi_url = null;

        $scope.system = connectionURL;

        $scope.MACAdded = [{ name: 'mac', value: '00:00:00:00:00:00' }];
        $scope.IPAdded = [{ name: 'ip', value: '0.0.0.0' }];
        $scope.VLANAdded = [{ name: 'vlan', value: '0' }];

        $http.get(connectionURL + "get_customer_details/").then(function (result) {

            $scope.customer = result.data.customer;
        });

        /** Get system details ***/

        $http.get($scope.system + "get_system/").then(function (result) {

            $scope.system = result.data.system;
        });

        if (window.con_edit_instance != "") {
            $scope.instance = window.con_edit_instance;
        }

        if (window.con_edit_mb != "") {
            $scope.motherboard = window.con_edit_mb;
        }

        $http.get(connectionURL + "get_num_of_nics/").then(function (result) {

                window.total_nics = result.data.total_nics;

            }, function (error) {

                $scope.ETHAvailable = true;
                $scope.ETHNotAvailable = false;
            }
        );

        /*** load cabinet list ***/

        $http.get(connectionURL + "connection_edit/").then(function (result) {

            $scope.cabinets = result.data.cabinets;
            $scope.connection.cabinet = result.data.system.cabinet;
            $scope.GetAssociate(result.data.system.cabinet, result);

            if (result.data.system_pdu_maps.length > 0) {

                var pdu_ps_ports = {};
                var pdu = {};
                var system_port = {};
                var ps_ports = {};
                var eth_det = {};
                var switchdet = {};
                var interfacedet = {};
                var pdu_port_number;
                var switch_port_number;
                var vlan_name = "";
                var vlan_number = "";
                var vlan_pool_name = "";
                var vlan_pool_id = "";

                window.system_port_added = result.data.system_pdu_maps;

                if (result.data.ipmi_attributes) {

                    $scope.ipmi.ip_address = result.data.ipmi_attributes[0].ip_address;
                    $scope.ipmi.ipmi_user = result.data.ipmi_attributes[0].ipmi_user;
                    $scope.ipmi.ipmi_password = null;
                    $scope.ipmi.mac_address = result.data.ipmi_attributes[0].mac_address;
                    $scope.ipmi_url = result.data.ipmi_attributes[0].url;
                }
                else {

                    $scope.ipmi.ip_address = "";
                    $scope.ipmi.ipmi_user = "";
                    $scope.ipmi.ipmi_password = null;
                    $scope.ipmi.mac_address = "";
                }

                if (window.total_nics > 0) {

                    $scope.showETH = true;

                    var eth = [{
                        interface_name: 'eth0',
                        nic_macaddress: '',
                        mac_id: 'mac0',
                        management_interface: false,
                        bridge_mode: false,
                        nic_ipaddress: '',
                        ip_id: 'ip0',
                        default_gateway: '',
                        pxeinterface: false,
                        switch: '',
                        switch_port_number: '',
                        sw_port_id: 'sw0',
                        vlan_name: '',
                        vlan_number: '',
                        vlan_id: 'vlan0',
                        vlan_pool_name: '',
                        vlan_pool: '',
                        customer: $scope.customer,
                        system: $scope.system,
                        instance: $scope.instance
                    }];


                    var count = 0;

                    for (var i = 0; i <= window.total_nics - 2; i++) {
                        count = i + 1;
                        eth.push({
                            interface_name: 'eth' + count,
                            nic_macaddress: '',
                            mac_id: 'mac' + count,
                            management_interface: false,
                            bridge_mode: false,
                            nic_ipaddress: '',
                            ip_id: 'ip' + count,
                            default_gateway: '',
                            pxeinterface: false,
                            switch: '',
                            switch_port_number: '',
                            sw_port_id: 'sw' + count,
                            vlan_name: '',
                            vlan_number: '',
                            vlan_id: 'vlan' + count,
                            vlan_pool_name: '',
                            vlan_pool: '',
                            customer: $scope.customer,
                            system: $scope.system,
                            instance: $scope.instance
                        });

                    }

                    $scope.eth_det = eth;
                }


                for (var count = 0; count <= result.data.icds.length - 1; count++) {

                    for (var sw = 0; sw <= result.data.system_switch_maps.length - 1; sw++) {

                        if (result.data.icds[count].interface_name == result.data.system_switch_maps[sw].interface_name) {
                            switchdet = {};
                            switch_port_number = "";
                            switchdet = result.data.system_switch_maps[sw].related.switch;
                            switch_port_number = result.data.system_switch_maps[sw].switch_port_number;

                            if (result.data.swport_vlan_map) {

                                vlan_number = "";
                                vlan_pool_id = "";

                                for (var vcount = 0; vcount <= result.data.swport_vlan_map.length - 1; vcount++) {
                                    if (result.data.swport_vlan_map[vcount].related.switch_port.port_number == switch_port_number) {

                                        vlan_name = "";

                                        vlan_pool_name = "";

                                        vlan_name = result.data.swport_vlan_map[vcount].related.vlan.vlan_name;

                                        vlan_number += result.data.swport_vlan_map[vcount].related.vlan.vlan_number.toString() + ",";


                                        vlan_pool_name = result.data.swport_vlan_map[vcount].related.vlan.related.vlan_pool.pool_name;
                                        window.vlan_pool_name = result.data.swport_vlan_map[vcount].related.vlan.related.vlan_pool.pool_name;
                                        vlan_pool_id = result.data.swport_vlan_map[vcount].related.vlan.vlan_pool;
                                        window.vlan_pool_id = result.data.swport_vlan_map[vcount].related.vlan.vlan_pool;
                                    }
                                }
                            }
                        }
                    }


                    for (var et = 0; et <= $scope.eth_det.length - 1; et++) {

                        if ($scope.eth_det[et].interface_name == result.data.icds[count].interface_name) {
                            $scope.eth_det[et].bridge_mode = result.data.icds[count].bridge_mode;
                            $scope.eth_det[et].management_interface = result.data.icds[count].management_interface;
                            $scope.eth_det[et].nic_ipaddress = result.data.icds[count].nic_ipaddress;
                            $scope.eth_det[et].nic_macaddress = result.data.icds[count].nic_macaddress;
                            $scope.eth_det[et].pxeinterface = result.data.icds[count].pxeinterface;
                            $scope.eth_det[et].switch = switchdet;
                            $scope.eth_det[et].switch_port_number = switch_port_number;
                            $scope.eth_det[et].vlan_name = vlan_name;
                            $scope.eth_det[et].vlan_number = vlan_number;

                            var curmac = { name: 'mac' + et, value: result.data.icds[count].nic_macaddress };
                            var curip = { name: 'ip' + et, value: result.data.icds[count].nic_ipaddress };
                            var curvlan = { name: 'vlan' + et, value: vlan_number };

                            $scope.MACAdded.push(curmac);
                            $scope.IPAdded.push(curip);
                            $scope.VLANAdded.push(curvlan);
                        }
                    }

                    for (var et = 0; et <= $scope.eth_det.length - 1; et++) {

                        if ($scope.eth_det[et].interface_name == result.data.icds[count].interface_name) {

                            var dataObj = {
                                switch: $scope.eth_det[et].switch.url,
                                port_number: $scope.eth_det[et].switch_port_number
                            };

                            $scope.getvlan(dataObj, count);
                            break;
                        }
                    }

                }
            }


        });


        $scope.getvlan = function (dataObj, count) {
            $http.post(connectionURL + "get_vlan_details/", dataObj).then(function (response) {

                $scope.eth_det[count].vlan_pool_name = response.data.vlanpools[0].pool_name;
                $scope.eth_det[count].vlan_pool = response.data.vlanpools[0];
            });
        };

        $scope.editSavedPSPorts = function (ps, index) {
            window.ps_row_index = index;
            $scope.showAddPDU = false;
            $scope.showUpdatePDU = true;
            $scope.pdu_det = [];
            var pdu_ps_ports = {};

            pdu_ps_ports = { 'pdu_port_number': ps.pdu_port_number, 'pdu': ps.pdu, 'system_port': ps.system_port };
            $scope.pdu_det.push(pdu_ps_ports);


        };

        $scope.editSavedETH = function (eth, index) {
            window.eth_row_index = index;
            $scope.showAddETH = false;
            $scope.showUpdateETH = true;
            $scope.eth_det = [];
            $scope.eth_det.push({
                'interface_name': eth.interface_name,
                'nic_macaddress': eth.nic_macaddress,
                'management_interface': eth.management_interface,
                'bridgemode': eth.bridgemode,
                'nic_ipaddress': eth.nic_ipaddress,
                'default_gateway': eth.default_gateway,
                'pxeinterface': eth.pxeinterface,
                'switch': eth.switch,
                'switch_port_number': eth.switch_port_number,
                'vlan_name': eth.vlan_name,
                'vlan_number': eth.vlan_number
            });

            if (eth.vlan_name) {
                $scope.HideVLANdiv = false;
            }
            else {
                $scope.HideVLANdiv = true;
            }

            if (eth.bridgemode) {
                $scope.bridgemodediv = true;
            }
            else {
                $scope.bridgemodediv = false;
            }


        };

        $scope.UpdatePDU = function (ps) {
            $scope.hidePDU = false;
            $scope.PS_Ports.splice(window.ps_row_index, 1);
            $scope.connection.PDUDetails.splice(window.ps_row_index, 1);
            $scope.SaveSinglePDU(ps, "Edit");
            $scope.showAddPDU = true;
            $scope.showUpdatePDU = false;
        };

        $scope.UpdateETH = function (eth) {

            if (eth.nic_macaddress) {
                var mac_idx = $scope.MACAdded.indexOf(eth.nic_macaddress);
                $scope.MACAdded.splice(mac_idx, 1);
            }

            if (eth.nic_ipaddress) {
                var ip_idx = $scope.IPAdded.indexOf(eth.nic_ipaddress);
                $scope.IPAdded.splice(ip_idx, 1);
            }

            $scope.hideETH = false;

            $scope.ETH_details.splice(window.eth_row_index, 1);
            $scope.connection.ETHDetails.splice(window.eth_row_index, 1);

            $scope.SaveSingleETH(eth, "Edit");

            $scope.showAddETH = true;
            $scope.showUpdateETH = false;
        };

        /*** get cabinet associated switch and pdu ***/

        $scope.GetAssociate = function (cabinet, results) {

            $http.get(cabinet.url + "/get_associated_switch_and_pdu/").then(function (result) {

                    $scope.switch = result.data.switches;
                    $scope.pspdu = result.data.pdus;
                    $scope.cabpdu = result.data.pdus;

                    if (result.data.pdus && result.data.pdus.length > 0) {
                        SystemPowerSupplyPort.get().$promise.then(function (response) {

                            $scope.showPS = true;
                            $scope.systemport = response.results;
                            for (i = 0; i <= response.results.length - 1; i++) {
                                if (i == 0) {

                                    var ps = [{
                                        'system_port_name': response.results[i].name,
                                        'system_port': response.results[i],
                                        'pdu': '',
                                        'pdu_port_number': '',
                                        'system': $scope.system
                                    }];
                                }
                                else {
                                    ps.push({
                                        'system_port_name': response.results[i].name,
                                        'system_port': response.results[i],
                                        'pdu': '',
                                        'pdu_port_number': '',
                                        'system': $scope.system
                                    });
                                }
                            }
                            $scope.PS_Ports = ps;

                            if (results && results != "") {

                                if (results.data.system_pdu_maps.length > 0) {
                                    for (var i = 0; i <= $scope.PS_Ports.length - 1; i++) {
                                        for (var j = 0; j <= results.data.system_pdu_maps.length - 1; j++) {
                                            if ($scope.PS_Ports[i].system_port.name == results.data.system_pdu_maps[j].related.system_port.name) {
                                                var pdu_port_number = results.data.system_pdu_maps[j].pdu_port_number;
                                                var pdu = results.data.system_pdu_maps[j].related.pdu;
                                                var system_port = results.data.system_pdu_maps[j].related.system_port;

                                                $scope.PS_Ports[i].pdu = pdu;
                                                $scope.PS_Ports[i].pdu_port_number = pdu_port_number;
                                            }
                                        }
                                    }
                                }
                            }
                        });


                    }

                }, function (error) {
                    $scope.switch = [];
                    $scope.pspdulist = [];
                    $scope.cabpdu = [];
                    $scope.systemport = [];
                }
            );
        };

        $scope.GetVLANDetails = function (ETHswitch, switchportno) {

            if (ETHswitch && ETHswitch.url && switchportno && switchportno != "") {
                var dataObj = {
                    switch: ETHswitch.url,
                    port_number: switchportno
                };

                $http.post(connectionURL + "get_vlan_details/", dataObj).then(function (response) {

                    $scope.HideVLANdiv = false;
                    $scope.vlan_pool_name = response.data.vlanpools[0].pool_name;
                    window.vlan_pool_name = response.data.vlanpools[0].pool_name;
                    $scope.vlan_pool_id = response.data.vlanpools[0].url;
                    window.vlan_pool_id = response.data.vlanpools[0].url;
                    $scope.availvlan = response.data.vlanpools[0].avail_vlans;
                });
            }
        };


        /*** Push PDU power supply details into table ***/

        $scope.SaveSinglePDU = function (pdu, pdufrom) {
            if (pdu) {
                var sys_port_idx = -1;
                var sys_pdu_idx = -1;
                var validated = true;

                if (pdufrom == "Add") {
                    for (var i = 0; i <= $scope.connection.PDUDetails.length - 1; i++) {
                        if ($scope.connection.PDUDetails[i].system_port == pdu.system_port.url) {
                            $scope.pduaddederror = true;
                            validated = false;
                        }
                    }
                }

                if (pdu.system_port && pdu.pdu && validated) {
                    $scope.pduaddederror = false;
                    $scope.connection.PDUDetails.push({
                        'system_port': pdu.system_port.url,
                        'pdu': pdu.pdu.url,
                        'pdu_port_number': pdu.pdu_port_number,
                        'system': $scope.system
                    });
                    sys_port_idx = $scope.systemport.indexOf(pdu.system_port);
                    //sys_pdu_idx =  $scope.pspdulist.indexOf(pdu.pdu);

                    if (sys_port_idx > -1) {
                        $scope.systemport.splice(sys_port_idx, 1);
                    }

                    /*if(sys_pdu_idx > -1)
                     {
                     $scope.pspdulist.splice(sys_pdu_idx, 1);
                     }*/

                    if ($scope.systemport.length == 0) {
                        $scope.hidePDU = true;
                    }
                    else {
                        $scope.hidePDU = false;
                    }

                    $scope.PS_Ports.push(pdu);
                    $scope.pdu_det = [{}];
                }

            }
        };

        /*** push ETH details to table ***/

        $scope.SaveSingleETH = function (eth, ethfrom) {
            if (eth) {

                var validated = true;

                if (ethfrom == "Add") {
                    for (var i = 0; i <= $scope.connection.ETHDetails.length - 1; i++) {
                        if ($scope.connection.ETHDetails[i].interface_name == eth.interface_name.name) {
                            $scope.ethaddederror = true;
                            validated = false;
                        }
                    }
                }

                if (validated) {
                    $scope.ethaddederror = false;
                    if (eth.interface_name && eth.nic_macaddress && eth.switch && eth.switch_port_number) {

                        var bridge_mode = false;
                        var management_interface = false;
                        var nic_ipaddress = "";
                        var nic_macaddress = "";
                        var pxeinterface = false;
                        var vlan_name = "";
                        var vlan_number = "";
                        var vlan_pool_name = "";
                        var vlan_pool_id = "";
                        var brmodevalidated = true;
                        var MACValidated = true;
                        var IPValidated = true;

                        var eth_idx = -1;
                        var mac_idx = -1;
                        var ip_idx = -1;

                        if (eth.bridgemode) {
                            bridge_mode = eth.bridgemode;
                        }

                        if (eth.management_interface) {
                            management_interface = eth.management_interface;
                        }

                        if (eth.nic_ipaddress) {
                            nic_ipaddress = eth.nic_ipaddress;
                        }

                        if (eth.nic_macaddress) {
                            nic_macaddress = eth.nic_macaddress;

                        }

                        if (eth.pxeinterface) {
                            pxeinterface = eth.pxeinterface;
                        }

                        if (eth.vlan_name) {
                            vlan_name = eth.vlan_name;
                        }

                        if (eth.vlan_number) {
                            vlan_number = eth.vlan_number.toString();
                        }

                        if (eth.vlan_pool_name) {
                            vlan_pool_name = eth.vlan_pool_name;
                        }

                        if (eth.vlan_pool_id) {
                            vlan_pool_id = eth.vlan_pool_id;
                        }

                        if (bridge_mode == false && nic_ipaddress == "") {
                            brmodevalidated = false;
                        }


                        if (brmodevalidated) {


                            mac_idx = $scope.MACAdded.indexOf(nic_macaddress);

                            if (mac_idx <= 0) {
                                $scope.MACerror = false;

                                MACValidated = true;
                            }
                            else {
                                $scope.MACerror = true;
                                MACValidated = false;
                            }

                            if (nic_ipaddress != "") {

                                ip_idx = $scope.IPAdded.indexOf(nic_ipaddress);

                                if (ip_idx <= 0) {
                                    $scope.IPerror = false;

                                    IPValidated = true;
                                }
                                else {
                                    $scope.IPerror = true;
                                    IPValidated = false;
                                }
                            }


                            if (MACValidated && IPValidated) {

                                $scope.MACAdded.push(nic_macaddress);

                                if (nic_ipaddress != "") {
                                    $scope.IPAdded.push(nic_ipaddress);
                                }
                                eth_idx = $scope.Ethernet.indexOf(eth.interface_name);

                                $scope.ETH_details.push(eth);

                                if (vlan_number && vlan_number != "") {
                                    vlan_pool_name = window.vlan_pool_name;
                                    vlan_pool_id = window.vlan_pool_id;
                                }
                                else {
                                    vlan_pool_name = "";
                                    vlan_pool_id = "";
                                }

                                $scope.connection.ETHDetails.push({
                                    'interface_name': eth.interface_name.name,
                                    // 'nic_macaddress':eth.nic_macaddress,
                                    'management_interface': management_interface,
                                    'bridge_mode': bridge_mode,
                                    'nic_ipaddress': nic_ipaddress,
                                    'nic_macaddress': nic_macaddress,
                                    'pxeinterface': pxeinterface,
                                    'switch': eth.switch.url,
                                    'switch_port_number': eth.switch_port_number,
                                    'vlan_name': vlan_name,
                                    'vlan_number': vlan_number.toString(),
                                    'vlan_pool_name': vlan_pool_name,
                                    'vlan_pool': vlan_pool_id,
                                    'system': $scope.system,
                                    'instance': $scope.instance,
                                    'customer': $scope.customer
                                });

                                //window.vlan_pool_name = "";
                                //window.vlan_pool_id = "";

                                $scope.HideVLANdiv = true;

                                if (eth_idx > -1) {
                                    $scope.Ethernet.splice(eth_idx, 1);
                                }


                                if ($scope.Ethernet.length == 0) {
                                    $scope.hideETH = true;
                                }
                                else {
                                    $scope.hideETH = false;
                                }

                                $scope.eth_det = [{}];
                                $scope.bridgemodediv = false;
                                $scope.etherror = false;


                            }
                        }
                        else {
                            $scope.etherror = true;
                        }
                    }
                    else {
                        $scope.etherror = true;
                    }
                }
                else {
                    $scope.ethaddederror = true;
                }

            }
        };

        /*** enable briddge mode ***/

        $scope.EnableBridgeMode = function () {
            $scope.bridgemodediv = !($scope.bridgemodediv);
        };

        /*** remove ***/

        $scope.removeSavedPSPorts = function (pdu) {
            $scope.hidePDU = false;
            //$scope.systemport.push(pdu.system_port);
            //$scope.pspdulist.push(pdu.pdu);
            var idx = $scope.PS_Ports.indexOf(pdu);
            $scope.PS_Ports.splice(idx, 1);
            $scope.connection.PDUDetails.splice(idx, 1);
        };

        $scope.removeSavedETH = function (eth) {

            if (eth.nic_macaddress) {
                var mac_idx = $scope.MACAdded.indexOf(eth.nic_macaddress);
                $scope.MACAdded.splice(mac_idx, 1);
            }

            if (eth.nic_ipaddress) {
                var ip_idx = $scope.IPAdded.indexOf(eth.nic_ipaddress);
                $scope.IPAdded.splice(ip_idx, 1);
            }

            $scope.hideETH = false;

            //$scope.Ethernet.push(eth.interface_name);

            var idx = $scope.ETH_details.indexOf(eth);
            $scope.ETH_details.splice(idx, 1);
            $scope.connection.ETHDetails.splice(idx, 1);
        };

        /*** cancel connection add ***/

        $scope.CancelConnectionAdd = function () {
            $location.path("/servers");
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


        $scope.DestroyValMsg = function (event) {
            $(event.target).tooltip('destroy');
            return true;

        };

        $scope.ClearValidation = function () {
            $scope.ipmiaddrMsg = "";
            $scope.ipmiuserMsg = "";
            $scope.ipmipwdMsg = "";
            $scope.cabMsg = "";
            $scope.pdurequireerror = false;
            $scope.ethrequireerror = false;
        };

        /*** save connection details ***/

        $scope.SaveConnectionAdd = function () {


            var convalidated = true;
            var ipmivalidated = true;

            for (var i = 0; i <= $scope.eth_det.length - 1; i++) {

                if ($scope.eth_det[i].nic_macaddress != "" && $scope.eth_det[i].switch != "" && $scope.eth_det[i].port_number != "") {
                    $scope.eth_det[i].mac_id = undefined;
                    $scope.eth_det[i].ip_id = undefined;
                    $scope.eth_det[i].vlan_id = undefined;
                    $scope.eth_det[i].sw_port_id = undefined;

                    $scope.connection.ETHDetails.push($scope.eth_det[i]);
                }
            }

            for (var j = 0; j <= $scope.PS_Ports.length - 1; j++) {

                if ($scope.PS_Ports[j].pdu.url != "" && $scope.PS_Ports[j].pdu_port_number != "") {
                    $scope.PS_Ports[j].system_port_name = undefined;

                    $scope.connection.PDUDetails.push($scope.PS_Ports[j]);
                }
            }


            if ($scope.ipmi.ip_address || $scope.ipmi.ipmi_user || $scope.ipmi.ipmi_password || $scope.ipmi.mac_address) {

                if ($scope.ipmi && $scope.ipmi.ip_address) {
                    $scope.ipmiaddrerr = false;
                    if (convalidated)
                        convalidated = true;
                    if (ipmivalidated)
                        ipmivalidated = true;

                }
                else {
                    $scope.ipmiaddrerr = true;
                    convalidated = false;
                    ipmivalidated = false;
                    $scope.ipmiaddrMsg = "This field is required";
                }

                if ($scope.ipmi && $scope.ipmi.ipmi_user) {
                    $scope.ipmiuserrerr = false;
                    if (convalidated)
                        convalidated = true;
                    if (ipmivalidated)
                        ipmivalidated = true;
                }
                else {
                    $scope.ipmiuserrerr = true;
                    convalidated = false;
                    ipmivalidated = false;
                    $scope.ipmiuserMsg = "This field is required";
                }

                /*if($scope.ipmi && $scope.ipmi.ipmi_password)
                 {
                 $scope.ipmipwdrerr = false;
                 if(convalidated)
                 convalidated = true;
                 if(ipmivalidated)
                 ipmivalidated = true;
                 }
                 else
                 {
                 $scope.ipmipwdrerr = true;
                 convalidated = false;
                 ipmivalidated = false;
                 $scope.ipmipwdMsg ="This field is required";
                 }*/


                if (ipmivalidated) {
                    if ($scope.ipmi.ip_address && $scope.ipmi.ipmi_user) {
                        if ($scope.ipmi.mac_address) {
                            $scope.connection.IPMIDetails.push({
                                'url': $scope.ipmi_url,
                                'ip_address': $scope.ipmi.ip_address,
                                'ipmi_user': $scope.ipmi.ipmi_user,
                                'ipmi_password': $scope.ipmi.ipmi_password,
                                'mac_address': $scope.ipmi.mac_address,
                                'motherboard': $scope.motherboard
                            });
                        }
                        else {
                            $scope.connection.IPMIDetails.push({
                                'url': $scope.ipmi_url,
                                'ip_address': $scope.ipmi.ip_address,
                                'ipmi_user': $scope.ipmi.ipmi_user,
                                'ipmi_password': $scope.ipmi.ipmi_password,
                                'motherboard': $scope.motherboard
                            });
                        }
                    }
                }
            }


            if ($scope.connection && $scope.connection.cabinet) {
                $scope.caberr = false;
                if (convalidated)
                    convalidated = true;
            }
            else {
                $scope.caberr = true;
                convalidated = false;
                $scope.cabMsg = "This field is required";
            }


            if (convalidated) {
                if ($scope.connection && $scope.connection.ETHDetails.length == 0) {
                    $scope.connection.ETHDetails = undefined;
                }

                if ($scope.connection && $scope.connection.PDUDetails.length == 0) {
                    $scope.connection.PDUDetails = undefined;
                }

                if ($scope.connection && $scope.connection.IPMIDetails.length == 0) {
                    $scope.connection.IPMIDetails = undefined;
                }

                if (window.con_edit_instance != "") {
                    window.con_edit_instance = "";
                }

                if (window.con_edit_mb != "") {
                    window.con_edit_mb = "";
                }

                window.total_nics = 0;

                $http.post(connectionURL + "connection_edit/", { 'connection_edit': $scope.connection }).then(function (response) {
                        $location.path("/servers/").search({ param: "Server Connection [" + window.con_edit_sys_name + "] Updated" });
                    }
                );
            }
        };

    }
]);



