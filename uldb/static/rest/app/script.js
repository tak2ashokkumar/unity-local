var app = angular.module('app', ['ngVis', 'mgcrea.ngStrap.dropdown']);

app.controller('MainCtrl', ['$scope', '$location',

    function ($scope) {
        var DIR = 'network_images/';
        var org_nodes = [];
        var edges = [];
        var EDGE_LENGTH_MAIN = 10;
        var EDGE_LENGTH_SUB = 50;
        org_nodes.push({
            id: 1,
            label: 'FIREWALL',
            x: -2,
            y: -550,
            image: DIR + 'firewall_green.png',
            shape: 'image',
            value: "FIREWALL"
        });
        org_nodes.push({
            id: 2,
            label: 'LOAD BALANCER 1',
            x: -150,
            y: -420,
            image: DIR + 'ios-slb-green.png',
            shape: 'image',
            value: "LOAD BALANCER"
        });
        org_nodes.push({
            id: 3,
            label: 'LOAD BALANCER 2',
            x: 150,
            y: -420,
            image: DIR + 'ios-slb-green.png',
            shape: 'image',
            value: "LOAD BALANCER"
        });
        org_nodes.push({
            id: 4,
            label: 'SWITCH 1',
            x: -150,
            y: -310,
            image: DIR + 'gigabit-switch-green.png',
            shape: 'image',
            value: "SWITCH"
        });
        org_nodes.push({
            id: 5,
            label: 'SWITCH 2',
            x: 150,
            y: -310,
            image: DIR + 'gigabit-switch-green.png',
            shape: 'image',
            value: "SWITCH"
        });
        org_nodes.push({
            id: 6,
            label: 'D V SWITCH',
            x: -2,
            y: -142,
            image: DIR + 'gigabit-switch-green.png',
            shape: 'image',
            value: "SWITCH"
        });
        org_nodes.push({
            id: 7,
            label: 'MANAGEMENT SERVER',
            x: -2,
            y: -232,
            image: DIR + 'controller-green.png',
            shape: 'image',
            value: "MANAGEMENT SERVER"
        });
        edges.push({ from: 1, to: 2 });
        edges.push({ from: 1, to: 3 });
        edges.push({ from: 2, to: 4 });
        edges.push({ from: 3, to: 5 });
        edges.push({ from: 4, to: 6 });
        edges.push({ from: 4, to: 7 });
        edges.push({ from: 5, to: 6 });
        edges.push({ from: 5, to: 7 });
        var tempXposition = -780;
        org_nodes.push({
            id: 8,
            label: 'HYPERVISOR',
            size: 150,
            x: -615,
            y: -20,
            image: DIR + 'transparent-image.png',
            shape: 'image',
            value: "HYPERVISOR"
        });
        for (var i = 9; i <= 24; i++) {
            tempXposition = tempXposition + 110;
            org_nodes.push({
                id: i,
                label: '10.0.10.' + (i - 7),
                size: 20,
                x: tempXposition,
                y: -32,
                image: DIR + 'Virtual-machine-green.png',
                shape: 'image',
                value: "VM"
            });
            edges.push({ from: 6, to: i });
        }
        tempXposition = -680;
        for (i = 25; i <= 32; i++) {
            tempXposition = tempXposition + 200;
            if (i % 2 == 0) {
                org_nodes.push({
                    id: i,
                    label: 'OBJECT STORAGE',
                    x: tempXposition,
                    y: 82,
                    image: DIR + 'Storage-blob-green.png',
                    shape: 'image',
                    value: "OBJECT STORAGE"
                });
            } else {
                org_nodes.push({
                    id: i,
                    label: 'VOLUMES',
                    x: tempXposition,
                    y: 82,
                    image: DIR + 'data-base-green.png',
                    shape: 'image',
                    value: "VOLUMES"
                });
            }
        }
        var tempCount = 25;
        for (i = 1; i <= 16; i++) {
            edges.push({ from: i + 8, to: tempCount });
            if (i % 2 == 0)
                tempCount++;
        }
        tempXposition = -620;
        for (i = 1; i <= 12; i++) {
            tempXposition = tempXposition + 130;
            org_nodes.push({
                id: i + 32,
                size: 15,
                x: tempXposition,
                y: 172,
                image: DIR + 'LUN-' + i + '.png',
                shape: 'image',
                value: "LUN"
            });
        }
        edges.push({ from: 25, to: 33 });
        edges.push({ from: 25, to: 34 });
        edges.push({ from: 26, to: 35 });
        edges.push({ from: 27, to: 36 });
        edges.push({ from: 27, to: 37 });
        edges.push({ from: 28, to: 38 });
        edges.push({ from: 29, to: 39 });
        edges.push({ from: 29, to: 40 });
        edges.push({ from: 30, to: 41 });
        edges.push({ from: 31, to: 42 });
        edges.push({ from: 31, to: 43 });
        edges.push({ from: 32, to: 44 });
        org_nodes.push({ id: 45, image: DIR + 'san.png', x: 60, y: 252, shape: 'image', });

        for (i = 33; i <= 44; i++) {
            edges.push({ from: i, to: 45 });

        }
        $scope.options = {
            height: '570',
            width: '100%',
            interaction: {
                navigationButtons: false,
                keyboard: false,
                dragNodes: false,
                dragView: true
            },
            physics: {
                stabilization: false,
                barnesHut: {
                    gravitationalConstant: 0,
                    centralGravity: 0,
                    springConstant: 0
                },

            },
            edges: { smooth: false }
        };

        $scope.data = {
            nodes: org_nodes,
            edges: edges
        };


        var btnCount = true;
        var alarmColor = 'red';
        $scope.updateData = function () {
            if (!btnCount) {
                alarmColor = 'green';
                btnCount = true;
            } else {
                alarmColor = 'red';
                btnCount = false;
            }
            org_nodes[0].image = DIR + 'firewall_' + alarmColor + '.png';
            org_nodes[1].image = DIR + 'ios-slb-' + alarmColor + '.png';
            org_nodes[2].image = DIR + 'ios-slb-' + alarmColor + '.png';
            org_nodes[3].image = DIR + 'gigabit-switch-' + alarmColor + '.png';
            org_nodes[4].image = DIR + 'gigabit-switch-' + alarmColor + '.png';
            org_nodes[5].image = DIR + 'gigabit-switch-' + alarmColor + '.png';
            org_nodes[6].image = DIR + 'controller-' + alarmColor + '.png';
            org_nodes[7].image = DIR + 'transparent-image.png';
            for (var i = 8; i <= 23; i++) {
                org_nodes[i].image = DIR + 'Virtual-machine-' + alarmColor + '.png';
            }
            for (i = 24; i <= 31; i++) {
                if (i % 2 !== 0) {
                    org_nodes[i].image = DIR + 'data-base-' + alarmColor + '.png';
                } else {
                    org_nodes[i].image = DIR + 'Storage-blob-' + alarmColor + '.png';
                }
            }
            $scope.data = {
                nodes: org_nodes,
                edges: edges
            };
        };
        var container = document.getElementById('network');
        var popupMenu = undefined;
        var network = new vis.Network(container, $scope.data, $scope.options);
        $scope.onClick = function (props) {
            if (popupMenu !== undefined) {
                popupMenu.parentNode.removeChild(popupMenu);
                popupMenu = undefined;
            }
        };
        $scope.rightClick = function (props) {
            var selectedData = this.getSelection().nodes;
            container.addEventListener('contextmenu', function (e) {
                if (popupMenu !== undefined) {
                    popupMenu.parentNode.removeChild(popupMenu);
                    popupMenu = undefined;
                }
                if (selectedData.length > 0) {
                    var offsetLeft = container.offsetLeft;
                    var offsetTop = container.offsetTop;

                    popupMenu = document.createElement('div');

                    popupMenu.className = 'popupMenu';
                    var menuContent = dynamicContextMenu(org_nodes[selectedData - 1].value);

                    popupMenu.style.left = e.clientX - offsetLeft + 'px';
                    popupMenu.style.top = e.clientY - offsetTop - 60 + 'px';
                    popupMenu.innerHTML = menuContent;
                    container.appendChild(popupMenu);
                }
                e.preventDefault();

            }, false);
        };
        $scope.events = {
            rangechange: $scope.onRangeChange,
            rangechanged: $scope.onRangeChanged,
            onload: $scope.onLoaded,
            select: $scope.onSelect,
            click: $scope.onClick,
            doubleClick: $scope.onDoubleClick,
            oncontext: $scope.rightClick,
            contextmenu: $scope.rightClick
        };
        function dynamicContextMenu(nodeType) {
            var menu = null;
            var menuDataAry = [];
            switch (nodeType) {
                case "VM":
                    menuDataAry = [{
                        "text": 'Power On',
                        "href": "#PowerOn",
                    }, {
                        "text": "Power Off",
                        "href": "#PowerOff"
                    }, {
                        "text": "Reboot",
                        "href": "#Reboot",
                    }, {
                        "text": "Delete Virtual Machine",
                        "href": "#DeleteVirtualMachine"
                    }, {
                        "text": "Take Snapshot",
                        "href": "#TakeSnapshote"
                    }];
                    break;
                case "HYPERVISOR":
                    menuDataAry = [{
                        "text": 'Create Virtual Machine',
                        "href": "#CreateVirtualMachine",
                    }, {
                        "text": "Modify MetaData of Hypervisor",
                        "href": "#ModifyMetaDataOfHypervisor"
                    }, {
                        "text": "Remove Hypdervisor from Cluster",
                        "href": "#RemoveHypdervisorfromCluster",
                    }, {
                        "text": "Provide CPI|U metric of Hypervisor",
                        "href": "#ProvideCPIUmetricofHypervisor"
                    }];
                    break;
                case "FIREWALL":

                    break;
                case "SWITCH":

                    break;
                case "LOADBALANCER":

                    break;
                case "MANAGEMENT SERVER" :

                    break;

            }
            if (menuDataAry.length > 0) {
                menu = '<ul tabindex="-1" class="dropdown-menu action-button" role="menu" style="top: 94px; left: 40px; display: block; visibility: visible;background-color: #eee;border:1px solid lightgray;">';
                for (var i = 0; i < menuDataAry.length; i++) {
                    menu = menu + '<li role="menuitem" tabindex="-1" style="border-bottom: 1px solid #DEDEDE;"><a href=' + menuDataAry[i].href + '>' + menuDataAry[i].text + '</a></li>';
                }
                menu = menu + '</ul>';
            }

            return menu;
        }

    }]);
