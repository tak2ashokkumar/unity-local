var app = angular.module('uldb');
app.controller('NetworksController', ['$scope', '$rootScope', '$q', '$parse',
    function ($scope, $rootScope, $q, $parse) {

        /* This is working module which is not fully developed which supposed to be automated. There is a lot of room to improve
         and we need to update this script covering other requirements to set edges and hypervisor automatically along with modifying
         the data retrieval mechanism via JSON files. As of now same script implemented statically is present here partially
         where only positioning node elements automated.
         - Sandeep
         */
        var DIR = '/static/img/vsjs/network-double/';
        var vms = [];
        var obvs = [];
        var luns = [];
        var org_nodes = [];
        var edges = [];
        var total_nodes_count = 0;
        var y_diff = 130;
        var node_gap = 75;
        var level_0 = -550;
        var node_levels = {};
        var random_values = [];
        for (var i = 0; i <= 40; i++) {
            random_values.push(Math.round((Math.random())));
        }

        var levelling_rules = {
            "firewall": 0, "load_balancers": 1,
            "switches": 2, "mangement_servers": 3,
            "dv_switches": 4, "virtual_machines": 5,
            "obvs": 6, "luns": 7, "sans": 8
        };

        for (i = 9; i <= 24; i++) {

            if (random_values[i] == 0) {
                vms.push({
                    id: i,
                    label: '10.0.10.' + (i - 7),
                    size: 20,
                    image: DIR + 'Virtual-machine-red.png',
                    shape: 'image',
                    value: "VM"
                });
            }
            else {
                vms.push({
                    id: i,
                    label: '10.0.10.' + (i - 7),
                    size: 20,
                    image: DIR + 'Virtual-machine-green.png',
                    shape: 'image',
                    value: "VM"
                });
            }


        }
        for (var i = 25; i <= 32; i++) {
            if (i % 2 == 0) {
                if (random_values[i] == 0) {
                    obvs.push({
                        id: i,
                        label: 'OBJECT STORAGE',
                        image: DIR + 'Storage-blob-red.png',
                        shape: 'image',
                        value: "OBJECT STORAGE"
                    });
                }
                else {
                    obvs.push({
                        id: i,
                        label: 'OBJECT STORAGE',
                        image: DIR + 'Storage-blob-green.png',
                        shape: 'image',
                        value: "OBJECT STORAGE"
                    });
                }
            }
            else {
                if (random_values[i] == 0) {
                    obvs.push({ id: i, label: 'VOLUMES', image: DIR + 'data-base-red.png', shape: 'image', value: "VOLUMES" });
                }
                else {
                    obvs.push({ id: i, label: 'VOLUMES', image: DIR + 'data-base-green.png', shape: 'image', value: "VOLUMES" });
                }

            }
        }
        for (var i = 1; i <= 12; i++) {
            luns.push({ id: i + 32, size: 15, image: DIR + 'LUN-' + i + '.png', shape: 'image', value: "LUN" });
        }
        var json_data = {
            "load_balancers": [
                { id: 2, label: 'LOAD BALANCER 1', image: DIR + 'ios-slb-red.png', shape: 'image', value: "LOAD BALANCER" },
                { id: 3, label: 'LOAD BALANCER 2', image: DIR + 'ios-slb-green.png', shape: 'image', value: "LOAD BALANCER" }
            ],
            "dv_switches": [{ id: 6, label: 'D V SWITCH', image: DIR + 'gigabit-switch-green.png', shape: 'image', value: "SWITCH" }],
            "mangement_servers": [{
                id: 7,
                label: 'MANAGEMENT SERVER',
                image: DIR + 'controller-green.png',
                shape: 'image',
                value: "MANAGEMENT SERVER"
            }],
            "switches": [
                { id: 4, label: 'SWITCH 1', image: DIR + 'gigabit-switch-green.png', shape: 'image', value: "SWITCH" },
                { id: 5, label: 'SWITCH 2', image: DIR + 'gigabit-switch-green.png', shape: 'image', value: "SWITCH" }
            ],
            "firewall": [{ id: 1, label: 'FIREWALL', image: DIR + 'firewall_green.png', shape: 'image', value: "FIREWALL" },
            ],
            "virtual_machines": vms,
            "sans": [{ id: 45, image: DIR + 'san.png', shape: 'image' }],
            "obvs": obvs,
            "luns": luns
        };


        angular.forEach(json_data, function (value, key) {
            total_nodes_count += value.length;
        });


        for (i = 0; i <= total_nodes_count; i++) {
            if (i === 0) {
                node_levels[i] = level_0;
            }
            else {
                node_levels[i] = node_levels[i - 1] + y_diff;
            }
        }


        function place_nodes(nodes, level) {
            if (nodes.length > 1) {
                angular.forEach(nodes, function (value, index) {
                    if (index % 2 === 0) {
                        var xv = (index + 2) * node_gap;
                        value.x = xv * (-1);
                        value.y = node_levels[level];
                        org_nodes.push(value);
                    }
                    else {
                        var xv = (index + 1) * node_gap;
                        value.x = xv;
                        value.y = node_levels[level];
                        org_nodes.push(value);
                    }
                });
            }
            else {
                nodes[0].x = 0;
                nodes[0].y = node_levels[level];
                org_nodes.push(nodes[0]);
            }
        }


        angular.forEach(json_data, function (value, key) {
            if (key == "firewall") {
                place_nodes(value, levelling_rules[key]);
            }
            if (key == "load_balancers") {
                place_nodes(value, levelling_rules[key]);
            }
            if (key == "switches") {
                place_nodes(value, levelling_rules[key]);
            }
            if (key == "dv_switches") {
                place_nodes(value, levelling_rules[key]);
            }
            if (key == "mangement_servers") {
                place_nodes(value, levelling_rules[key]);
            }
            if (key == "virtual_machines") {
                place_nodes(value, levelling_rules[key]);
            }
            if (key == "obvs") {
                place_nodes(value, levelling_rules[key]);
            }
            if (key == "luns") {
                place_nodes(value, levelling_rules[key]);
            }
            if (key == "sans") {
                place_nodes(value, levelling_rules[key]);
            }
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
        //org_nodes.push({id: 8,label: 'HYPERVISOR',size:150, x:-615,y:-20,image: DIR + 'transparent-image.png', shape:'image',value:"HYPERVISOR" });
        for (var i = 9; i <= 24; i++) {
            tempXposition = tempXposition + 110;
            edges.push({ from: 6, to: i });
        }
        tempXposition = -680;
        var tempCount = 25;
        for (var i = 1; i <= 16; i++) {
            edges.push({ from: i + 8, to: tempCount });
            if (i % 2 == 0)
                tempCount++;
        }
        tempXposition = -620;

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

        for (var i = 33; i <= 44; i++) {
            edges.push({ from: i, to: 45 });
        }

        $scope.options = {
            height: '800',
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
                if (i % 2 != 0) {
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

        $scope.onSelect = function (items) {
            // debugger;
            alert('select');
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
                    },
                        {
                            "text": "Power Off",
                            "href": "#PowerOff"
                        },
                        {
                            "text": "Reboot",
                            "href": "#Reboot",
                        }, {
                            "text": "Delete Virtual Machine",
                            "href": "#DeleteVirtualMachine"
                        },
                        {
                            "text": "Take Snapshot",
                            "href": "#TakeSnapshote"
                        }];
                    break;
                case "HYPERVISOR":
                    menuDataAry = [{
                        "text": 'Create Virtual Machine',
                        "href": "#CreateVirtualMachine",
                    },
                        {
                            "text": "Modify MetaData of Hypervisor",
                            "href": "#ModifyMetaDataOfHypervisor"
                        },
                        {
                            "text": "Remove Hypdervisor from Cluster",
                            "href": "#RemoveHypdervisorfromCluster",
                        },
                        {
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

        function showTooltip(nodeID) {
            var customTooltip = null;

            customTooltip = "<div class='panel panel-success' style='margin-bottom:0px'>" + +"<div class='panel-body' style='height: 145px; padding-top: 0px; padding-bottom: 0px'>" +
                "<table class='table' style='border: none; margin-bottom:1px'>" +
                "<tr>" +
                "<td>ID</td>" +
                "<td>" + org_nodes[nodeID - 1].id + "</td>" +

                "</tr>" +
                "<tr>" +
                "<td>label</td>" +
                "<td>" + org_nodes[nodeID - 1].label + "</td>" +

                "</tr>" +
                "<tr>" +
                "<td>shape</td>" +
                "<td>" + org_nodes[nodeID - 1].shape + "</td>" +

                "</tr>" +
                "</table>" +
                "</div>" +
                "</div>";
            return customTooltip;
        }
    }
]);
