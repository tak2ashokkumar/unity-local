var app = angular.module('uldb');

app.controller('MonitoredHostController', [
    '$scope',
    '$http',
    '$interval',
    'CustomerHostMonitor',
    'AbstractControllerFactory',
    'TaskService2',
    'AlertService2',
    function ($scope, $http, $interval, CustomerHostMonitor,
              AbstractControllerFactory, TaskService2, AlertService2) {
        $scope.resourceClass = CustomerHostMonitor;

        $scope.title = {
            plural: "Monitored Hosts",
            singular: "Monitored Host"
        };
        $scope.pageSize = 9000;
        $scope.ctrl = new AbstractControllerFactory($scope.resourceClass, $scope, "instance");
        $scope.rows = [
            {
                name: "instance", description: "Instance", required: true,
                opaque: true,
                read: function (e) {
                    return e.instance.hostname;
                }
            }
        ];

        $scope.scan = function (selected, index) {
            $http.get(selected.url + 'scan/').then(function (response) {
                // task is contained in key 'task_id' from data
                TaskService2.processTask(response.data.task_id).then(function (success) {
                    // update the view
                    selected.state = success[0] == 0 ? 'OK' : 'CRITICAL';
                    selected.state_description = success[1];
                    //AlertService2.success("scan: " + success);
                }).catch(function (error) {
                    console.log(error);
                    AlertService2.danger(error);
                });
            }).catch(function (error) {
                // error invoking task
                console.log(error);
            });
        };

        $scope.services = {};
        $scope.selectHook = function (result, index) {
            $http.get(result.url + 'service_checks/').then(function (response) {
                angular.extend($scope.services, response.data);
                // $scope.selection.selected.last_status = response.data.last_status;
            });
        };

        var timers = [];
        //
        //$scope.p.then(function () {
        //    $scope.model.results.forEach(function (e, i, arr) {
        //        $scope.scan(e, i);
        //        timers.push(
        //            $interval(function () {
        //                $scope.scan(e, i);
        //            }, 60000)
        //        );
        //    });
        //});

        $scope.$on('$destroy', function () {
            timers.forEach(function (timer, i, arr) {
                $interval.cancel(timer);
            });
        });

        $scope.widget1_opts = {
            chart: {
                type: 'pieChart',
                height: 300,
                x: function (d) {
                    return d.label;
                },
                y: function (d) {
                    return d.value;
                },
                showLabels: true,
                showLegend: false,
                transitionDuration: 500,
                padAngle: 0.0,
                donut: true
            }
        };
        var up = {label: "Up", value: 0, color: 'rgba(39,155,108,.7)'};
        var down = {label: "Down", value: 0};
        var pending = {label: "Pending", value: 0};
        var unreachable = {label: "Unreachable", value: 0};
        $scope.widget1_data = [up, down, pending, unreachable];
        var state_mapping = {
            2: up,
            1: pending,
            4: down,
            8: unreachable
        };
        $scope.p.then(function () {
            $scope.model.results.forEach(function (e, i, arr) {
                var state = e.last_known_state;
                if (state < 0 || state > 8) {
                    state = 8;
                }
                state_mapping[state].value++;
            });
        });
        //    {
        //        "label": "Warning",
        //        "value": 3
        //    },
        //    {
        //        "label": "Healthy",
        //        "value": 28
        //    },
        //    {
        //        "label": "Critical",
        //        "value": 1
        //    }
        //];

    }
]);

app.controller('CustomerNetworkingController', [
    '$scope',
    '$http',
    'CustomerGraphedPort',
    'AbstractControllerFactory',
    'TaskService2',
    'AlertService2',
    'GraphingService',
    'localStorageService',
    function ($scope, $http, CustomerGraphedPort, AbstractControllerFactory,
              TaskService2, AlertService2, GraphingService, localStorageService) {
        $scope.resourceClass = CustomerGraphedPort;
        $scope.title = {
            plural: "Networking Utilization",
            singular: this.plural
        };
        if ($scope.$parent === $scope.$root) {
            $scope.pageSize = 5;
        }
        $scope.ctrl = new AbstractControllerFactory($scope.resourceClass, $scope, "interface_name");

        $scope.graph = function (port, val) {
            GraphingService.graph(port, val).then(function (success) {
                $scope.data = GraphingService.processResult(success);
            });
        };
        $scope.data = null;
        $scope.graphHeight = 500;
        $scope.options = GraphingService.getOptions($scope.graphHeight);
        $scope.currentName = null;

        $scope.setHeight = function (height) {
            $scope.options.chart.height = height;
            if (height < $scope.graphHeight) {
                $scope.options.chart.type = 'lineChart';
                $scope.options.chart.xAxis.ticks = 3;
            }
        };

        $scope.interval = 'month';
        $scope.set_interval = function (interval) {
            $scope.interval = interval;
            $scope.graph($scope.selection.selected, $scope.interval);
        };

        $scope.selectHook = function (result) {
            //$scope.setHeight(200);
            $scope.currentName = result.switch_name + " " + result.interface_name;
            //$scope.graph(result, 'day');
            $scope.graph(result, $scope.interval);
        };

        $scope.unselectHook = function () {
            //$scope.currentName = null;
        };
        //$scope.unselectHook = function() {
        //    AlertService2.danger("help!");
        //};


        $scope.rows = [
            {name: "switch_name", description: "Switch"},
            {name: "interface_name", description: "Interface"}
        ];

        $scope.p.then(function () {
            $scope.setHeight(490);
            $scope.select($scope.model.results[0], 0);
        });

        $scope.day_opts = {
            chart: {
                type: 'multiBarHorizontalChart',
                x: function (d) {
                    return d.label;
                },
                y: function (d) {
                    return d.value;
                },
                height: 432,
                margin: {
                    left: 200,

                },
                showControls: false,
                "showValues": true,
                "duration": 500,
                "xAxis": {
                    "showMaxMin": false
                },
                "yAxis": {
                    "axisLabel": "Values"
                },
                showLegend: true,
                legendPosition: "right"
            }
        };


        $scope.stats = {
            day: [{key: "Percentile", color: "#03A9F4", values: []}],
            week: [{key: "Percentile", color: "#03A9F4", values: []}],
            month: [{key: "Percentile", color: "#03A9F4", values: []}],
            year: [{key: "Percentile", color: "#03A9F4", values: []}]
        };


        //$scope.stats_day = $scope.stats.day;
        //$scope.stats_day = [{key: "Percentile", color:"pink", values: [{label:"hi", value: 50}] }];
        //$scope.stats_week = $scope.stats.week;
        //$scope.stats_month = $scope.stats.month;
        //$scope.stats_year = $scope.stats.year;
        //
        if (localStorageService.get("stats") === null) {
            $http.get('/customer/network_stats/').then(function (response) {
                for (var key in $scope.stats) {
                    for (var intf in response.data[key]) {
                        var res = {label: intf, value: response.data[key][intf].total.percentile};
                        $scope.stats[key][0].values.push(res);
                    }
                }
                localStorageService.set("stats_date", Date.now());
                localStorageService.set("stats", $scope.stats);
            });
        } else {
            $scope.stats = localStorageService.get("stats");
        }
        //$scope.resourceClass =
    }
]);


app.controller('SystemMonitoringController',[
    '$scope',
    '$state',
    '$stateParams',
    '$timeout',
    '$http',
    '$location',
    'OberviumGraphConfig',
    function($scope, $state, $stateParams, $timeout, $http, $location, OberviumGraphConfig){

        $scope.loader = true;
        $scope.graph_select_obj = {};
        $scope.selected_graphs = [];

        var get_device_abs_names = function(results){
            for(var i = 0; i < results.length; i++){
                for( var j = 0; j < results[i].widget_data.length; j++){
                    results[i].widget_data[j].data.device_abs_name = results[i].widget_data[j].data.device_type + '-' + results[i].widget_data[j].data.device_name;
                }
            }
        };


        var get_devices_data = function(){
            $http({
                method: "GET",
                url: '/customer/monitor_widget',
            }).then(function (response) {
                $scope.device_data_copy = angular.copy(response.data);
                get_device_abs_names(response.data.results);
                $scope.device_data = response.data;
                $timeout(function(){
                    $scope.loader = false;
                },100);
            }).catch(function (error) {
                $scope.error_details = error;
                $scope.loader = false;
            });
        };
        get_devices_data();


        var get_device_name = function(device_name){
            switch(device_name){
                case 'Hypervisor' :
                    return 'servers';
                case 'BMServer' :
                    return 'servers';
                case 'Switch' :
                    return 'switch';
                case 'LoadBalancer' :
                    return 'load_balancer';
                case 'Firewall' :
                    return 'firewall'; 
                default : 
                    console.log('something went wrong');
            }
        };

        var get_graphs = function (widget_attr,graph_type,widget) {
            var params = {
                'graph_type': graph_type,
                'height': 100,
                'width': 228,
                'legend' : 'no',
            };
            $http({
                method: "GET",
                url: '/customer/observium/'+ get_device_name(widget.data.device_type) + '/' + widget.data.device_id + '/get_graph_by_type/',
                params: params
            }).then(function (response) {
                widget[widget_attr] = response.data;
            }).catch(function (error) {
                widget[widget_attr] = error;
            });
        };

        var get_graph_type_by_device = function(device){
            switch(device.device_type){
                case 'Hypervisor' :
                    return 'SERVER';
                case 'BMServer' :
                    return 'SERVER';
                case 'Switch' :
                    return 'SWITCH';
                case 'Firewall' :
                    return 'FIREWALL';
                case 'LoadBalancer' :
                    return 'LOAD_BALANCER';
            }
        };

        var get_graph_type_arr_by_device = function(device){
            var graphs_type_arr = [];
            var graph_obj = OberviumGraphConfig[get_graph_type_by_device(device)];
            angular.forEach(graph_obj, function (value, keyout) {
                angular.forEach(graph_obj[keyout], function (value, keyin) {
                    graphs_type_arr = graphs_type_arr.concat(graph_obj[keyout][keyin]);
                });
            });
            return graphs_type_arr;
        };

        var get_selected_device = function(device){
            return device.device_abs_name;
        };

        var get_selected_first_graph = function(widget){
            for(var i = 0; i < widget.graph_type_arr.length; i++){
                if(widget.graph_type_arr[i].DISPLAYNAME === widget.selected_first_graph){
                    return widget.graph_type_arr[i].GRAPHNAME;
                }
            }
        };

        var get_selected_second_graph = function(widget){
            for(var i = 0; i < widget.graph_type_arr.length; i++){
                if(widget.graph_type_arr[i].DISPLAYNAME === widget.selected_second_graph){
                    return widget.graph_type_arr[i].GRAPHNAME;
                }
            }
        };

        $scope.update_widget = function(widget){
            widget.graph_type_arr = get_graph_type_arr_by_device(widget.data);
            widget.selected_device = get_selected_device(widget.data);
            widget.selected_first_graph = angular.copy(widget.data.graph1);
            widget.selected_first_graph_url = get_selected_first_graph(widget);
            widget.selected_second_graph = angular.copy(widget.data.graph2);
            widget.selected_second_graph_url = get_selected_second_graph(widget);
            get_graphs('first_graph', angular.copy(widget.selected_first_graph_url), widget);
            get_graphs('second_graph', angular.copy(widget.selected_second_graph_url), widget);
            return widget;
        };

        var upadte_device_position = function (position, changed_widget) {

            var changed_widget_obj = {};
            changed_widget_obj.position = changed_widget.position;
            changed_widget_obj.data = changed_widget.data;

            var params = {
                'position': position,
                'widget_data': changed_widget_obj,
            };
            $http({
                method: "POST",
                url: '/customer/monitor_widget/update_device/',
                data: params
            }).then(function (response) {
                console.log('response : ', angular.toJson(response.data));
            }).catch(function (error) {
                console.log('error : ', angular.toJson(error));
            });
        };

        var get_changed_to_widget = function(device_abs_name){
            var widget_data = $scope.device_data.results[0].widget_data;
            for(var i = 0; i < widget_data.length ; i++){
                if(widget_data[i].data.device_abs_name ===  device_abs_name) {
                    return widget_data[i];
                }
            }
        };

        $scope.set_selected_device = function(widget){
            var initial_widget = angular.copy(widget);
            var widget_initial_position = angular.copy(widget.position);
            var req_widget = get_changed_to_widget(angular.copy(widget.selected_device));

            upadte_device_position(angular.copy(widget_initial_position),angular.copy(req_widget));

            initial_widget.selected_device = initial_widget.data.device_abs_name;
            initial_widget.position = req_widget.position;
            var req_widget_position = angular.copy(req_widget.position);
            req_widget.position = angular.copy(widget_initial_position);

            $scope.device_data.results[0].widget_data[widget_initial_position - 1] = angular.copy(req_widget);
            $scope.device_data.results[0].widget_data[req_widget_position - 1] = angular.copy(initial_widget);
        };

        var upadte_graph = function (position, graph_changed, graph_changed_to) {
            var params = {
                'position': position,
                'key': graph_changed,
                'value': graph_changed_to
            };
            $http({
                method: "POST",
                url: '/customer/monitor_widget/update_graph/',
                data: params
            }).then(function (response) {

            }).catch(function (error) {

            });
        };

        $scope.set_first_graph_for_device = function(widget){
            widget.selected_first_graph_url = get_selected_first_graph(widget);
            get_graphs('first_graph', angular.copy(widget.selected_first_graph_url), widget);
            upadte_graph(widget.position,'graph1',widget.selected_first_graph);
            widget.data.graph1 = widget.selected_first_graph;
        };

        $scope.set_second_graph_for_device = function(widget){
            widget.selected_second_graph_url = get_selected_second_graph(widget);
            get_graphs('second_graph', angular.copy(widget.selected_second_graph_url), widget);
            upadte_graph(widget.position,'graph2',widget.selected_second_graph);
            widget.data.graph2 = widget.selected_second_graph;
        };

        $scope.show_observium_page = function(widget){
            localStorage.removeItem('isBareMetalStats');
            switch(angular.copy(widget.data.device_type)){
                case 'Hypervisor' :
                    $state.go('devices.server', {uuidp: widget.data.device_id}, {reload: false});
                    break;
                case 'BMServer' :
                    localStorage.setItem('isBareMetalStats', true);
                    $state.go('devices.server', {uuidp: widget.data.device_id}, {reload: false});
                    break;
                case 'Switch' :
                    $state.go('devices.switch', {uuidp: widget.data.device_id}, {reload: false});
                    break;
                case 'LoadBalancer' :
                    $state.go('devices.load_balancer', {uuidp: widget.data.device_id}, {reload: false});
                    break;
                case 'Firewall' :
                    $state.go('devices.firewall', {uuidp: widget.data.device_id}, {reload: false});
                    break;
                default : 
                    console.log('something went wrong');
            }
        };

    }
]);

app.controller('StorageMonitoringController', [
    '$scope',
    '$q',
    '$state',
    '$stateParams',
    '$timeout',
    '$http',
    '$location',
    'OberviumGraphConfig',
    'AlertService2',
    function ($scope, $q, $state, $stateParams, $timeout, $http, $location, OberviumGraphConfig, AlertService2) {
        console.log('in StorageMonitoringController 1');

        $scope.loader = true;
        $scope.overall_storage_allocation = 0;
        $scope.getting_overall_storage = false;
        $scope.private_storage_utilization = 0;
        $scope.overall_storage_utilization = 0;

        var get_overall_storage = function(){
            $scope.getting_overall_storage = true;
            $http.get('/customer/organization/').then(function(response){
                $scope.overall_storage_allocation = response.data.results[0].storage;
            }).catch(function(error){
                console.log('error : ', angular.toJson(error));
            });
        };

        var get_bm_servers_data = function(){
            $http.get('/customer/bm_servers/').then(function (response) {
                $scope.baremetal_details = {};
                $scope.baremetal_details.storage_allocated = 0;
                $scope.baremetal_details.storage_utilized = 0;
                $scope.baremetal_details.results = [];
                for(var i = 0; i < response.data.results.length; i++){
                    var bm_server = response.data.results[i].server;
                    if(bm_server.private_cloud === null){
                        $scope.baremetal_details.results.push(response.data.results[i]);
                        if(bm_server.capacity_gb){
                            bm_server.capacity_gb = bm_server.capacity_gb / 1024;
                            $scope.baremetal_details.storage_allocated = $scope.baremetal_details.storage_allocated + bm_server.capacity_gb;
                            $scope.baremetal_details.storage_utilized = $scope.baremetal_details.storage_utilized + bm_server.capacity_gb;
                            $scope.overall_storage_utilization = $scope.overall_storage_utilization + $scope.baremetal_details.storage_utilized;
                        }
                    }

                }

                if ($scope.getting_overall_storage == false){
                    $scope.overall_storage_allocation = $scope.overall_storage_allocation + $scope.baremetal_details.storage_allocated;
                }

                if(($scope.baremetal_details.results.length === 0) && ($scope.private_clouds.length === 0)){
                    $scope.loader = false;
                }
            }).catch(function(error){
                console.log('error : ', angular.toJson(error));
            });
        };

        $scope.get_cloud_bm_servers = function(cloud){
            $http.get('/customer/bm_servers/get_cloud_bm_servers/?cloud_id=' + cloud.uuid).then(function(response){
                cloud.bm_servers = response.data;
                cloud.bm_servers.utilization = 0;
                angular.forEach(response.data, function(key, value){
                    if(key.server.capacity_gb){
                        cloud.bm_servers.utilization += Number(key.server.capacity_gb);
                    }
                });
            }).catch(function(error){
                console.log('error : ', angular.toJson(error));
            });
            storage_statistics(cloud);
        };

        var get_private_clouds_data = function(){
            $http.get('/customer/private_cloud_fast/').then(function(response){
                $scope.private_clouds = angular.copy(response.data.results);
                var exists = true;
                for(var i = 0; i < response.data.results.length; i++){
                    if(!response.data.results[i].storage){
                        exists = false;
                        break;
                    }
                    else{
                        if(!$scope.getting_overall_storage){
                            // if (response.data.results[i].colocloud_set.length==0 ){
                                $scope.overall_storage_allocation = $scope.overall_storage_allocation + Number(response.data.results[i].storage);
                            // }
                        }
                    }
                }

                if(!exists){
                    get_overall_storage();
                }
                get_bm_servers_data();
            }).catch(function(error){
                console.log('error : ', angular.toJson(error));
            });
        };
        get_private_clouds_data();

        $scope.count = 0;
        var storage_statistics = function (cloud) {
            var bm_servers_utilization_tb = 0;
            $scope.usage_data = $http.get('/customer/private_cloud/' + cloud.uuid + '/usage_data/');
            $scope.usage_data.then(function (response) {
                if (cloud.platform_type == "VMware") {
                    cloud.utilization = (response.data.disk_capacity - response.data.free_disk_space) / (1024 * 1024 * 1024 * 1024);
                    bm_servers_utilization_tb = cloud.bm_servers.utilization / 1024;
                    $scope.private_storage_utilization = $scope.private_storage_utilization + cloud.utilization + bm_servers_utilization_tb;
                }else if (cloud.platform_type == "OpenStack") {
                    cloud.utilization = response.data.local_gb_used / 1024;
                    bm_servers_utilization_tb = cloud.bm_servers.utilization / 1024;
                    $scope.private_storage_utilization = $scope.private_storage_utilization + cloud.utilization + bm_servers_utilization_tb;
                }else if (cloud.platform_type == "Custom") {
                    cloud.utilization = null;
                }
                $scope.count = $scope.count + 1;
            }).catch(function (error, status) {
                AlertService2.danger("Unable to fetch " + cloud.platform_type + " statistcs. Please contact Administrator (support@unityonecloud.com)");
                cloud.utilization = null;
                $scope.count = $scope.count + 1;
            });
        };

        $scope.draw_storage_utilization_graph = function () {
            if ($scope.baremetal_details){
                $scope.overall_storage_utilization = $scope.private_storage_utilization + $scope.baremetal_details.storage_utilized;
            }
            else{
                $scope.overall_storage_utilization = $scope.private_storage_utilization;   
            }
            var remaining_storage = 0;
            if($scope.overall_storage_allocation && $scope.overall_storage_utilization){
                remaining_storage = $scope.overall_storage_allocation - $scope.overall_storage_utilization;
            }
            $scope.storage_graph = {
                type: 'doughnutLabels',
                data: {
                    datasets: [{
                        data: [$scope.overall_storage_utilization, remaining_storage],
                        backgroundColor: ["#00DF97", "#C6C8C7"]
                    }],
                    labels: ["Utilized", "Remaining"]
                },
                options: {
                    rotation: 1.0 * Math.PI,
                    circumference: 2 * Math.PI,
                    responsive: true,
                    legend: {
                        display: false,
                    },
                    animation: {
                        animateScale: true,
                        animateRotate: true
                    }
                }
            };
            var priorityTicketDonut = document.getElementById("storage-monitor-donut").getContext("2d");
            window.upDownChart = new Chart(priorityTicketDonut, $scope.storage_graph);
        };

        // doughnut
        Chart.defaults.doughnutLabels = Chart.helpers.clone(Chart.defaults.doughnut);
        var helpers = Chart.helpers;
        var defaults = Chart.defaults;

        Chart.controllers.doughnutLabels = Chart.controllers.doughnut.extend({
            updateElement: function (arc, index, reset) {
                var _this = this;
                var chart = _this.chart,
                    chartArea = chart.chartArea,
                    opts = chart.options,
                    animationOpts = opts.animation,
                    arcOpts = opts.elements.arc,
                    centerX = (chartArea.left + chartArea.right) / 2,
                    centerY = (chartArea.top + chartArea.bottom) / 2,
                    startAngle = opts.rotation, // non reset case handled later
                    endAngle = opts.rotation, // non reset case handled later
                    dataset = _this.getDataset(),
                    circumference = reset && animationOpts.animateRotate ? 0 : arc.hidden ? 0 : _this.calculateCircumference(dataset.data[index]) * (opts.circumference / (2.0 * Math.PI)),
                    innerRadius = reset && animationOpts.animateScale ? 0 : _this.innerRadius,
                    outerRadius = reset && animationOpts.animateScale ? 0 : _this.outerRadius,
                    custom = arc.custom || {},
                    valueAtIndexOrDefault = helpers.getValueAtIndexOrDefault;

                if (chart.ctx.canvas.id == 'storage-monitor-donut') {
                    $scope.donutRadius = 10;

                } else {
                    $scope.donutRadius = 10;
                }
                helpers.extend(arc, {
                    // Utility
                    _datasetIndex: _this.index,
                    _index: index,
                    // Desired view properties
                    _model: {
                        x: centerX + chart.offsetX,
                        y: centerY + chart.offsetY,
                        startAngle: startAngle,
                        endAngle: endAngle,
                        circumference: circumference,
                        outerRadius: outerRadius,
                        innerRadius: innerRadius + $scope.donutRadius,
                        label: valueAtIndexOrDefault(dataset.label, index, chart.data.labels[index])
                    },

                    draw: function () {
                        var ctx = this._chart.ctx,
                            vm = this._view,
                            sA = vm.startAngle,
                            eA = vm.endAngle,
                            opts = this._chart.config.options;

                        $timeout(function () {
                            opts.defaultFontSize = 10;
                            opts.defaultFontStyle = 'bold';
                            opts.defaultColor = '#fff';
                        }, 0);

                        var labelPos = this.tooltipPosition();
                        var segmentLabel = dataset.data[index];

                        ctx.beginPath();
                        ctx.arc(vm.x, vm.y, vm.outerRadius, sA, eA);
                        ctx.arc(vm.x, vm.y, vm.innerRadius, eA, sA, true);

                        ctx.closePath();
                        ctx.strokeStyle = vm.borderColor;
                        ctx.lineWidth = vm.borderWidth;

                        ctx.fillStyle = vm.backgroundColor;

                        ctx.fill();
                        ctx.lineJoin = 'bevel';

                        if (vm.borderWidth) {
                            ctx.stroke();
                        }

                        if (vm.circumference > 0.0015) { // Trying to hide label when it doesn't fit in segment
                            ctx.beginPath();
                            opts.defaultFontSize = 12;
                            opts.defaultFontStyle = 'normal';
                            opts.defaultFontFamily = 'Open Sans, sans-serif';
                            ctx.font = helpers.fontString(opts.defaultFontSize, opts.defaultFontStyle, opts.defaultFontFamily);
                            ctx.fillStyle = "#190707";
                            ctx.textBaseline = "top";
                            ctx.textAlign = "center";

                            // Round percentage in a way that it always adds up to 100%
                            ctx.fillStyle = "#ffffff";

                            ctx.fillText(segmentLabel.toFixed(0), labelPos.x + 1, labelPos.y - 5);

                        }
                        //display in the center the total sum of all segments

                    }
                });

                var model = arc._model;
                model.backgroundColor = custom.backgroundColor ? custom.backgroundColor : valueAtIndexOrDefault(dataset.backgroundColor, index, arcOpts.backgroundColor);
                model.hoverBackgroundColor = custom.hoverBackgroundColor ? custom.hoverBackgroundColor : valueAtIndexOrDefault(dataset.hoverBackgroundColor, index, arcOpts.hoverBackgroundColor);
                model.borderWidth = custom.borderWidth ? custom.borderWidth : valueAtIndexOrDefault(dataset.borderWidth, index, arcOpts.borderWidth);
                model.borderColor = custom.borderColor ? custom.borderColor : valueAtIndexOrDefault(dataset.borderColor, index, arcOpts.borderColor);

                // Set correct angles if not resetting
                if (!reset || !animationOpts.animateRotate) {
                    if (index === 0) {
                        model.startAngle = opts.rotation;
                    } else {
                        model.startAngle = _this.getMeta().data[index - 1]._model.endAngle;
                    }
                    model.endAngle = model.startAngle + model.circumference;

                }
                arc.pivot();
            }
        });

        $scope.$watch("count", function(newValue, oldValue){
            // if ($scope.private_clouds){
            //     $scope.draw_storage_utilization_graph();
            // }
            
            if($scope.private_clouds && (newValue === $scope.private_clouds.length)){
                $scope.loader = false;
                $scope.draw_storage_utilization_graph();
            }
        }, true);
    }
]);


app.controller('ColoMonitoringController', [
    '$scope',
    '$state',
    '$stateParams',
    '$timeout',
    '$http',
    '$location',
    'OberviumGraphConfig',
    function ($scope, $state, $stateParams, $timeout, $http, $location, OberviumGraphConfig) {
        $scope.loader = true;
        $scope.pdu_list = [];
        var counter = 0;
        var pduGraphsToShow = ['Current', 'Voltage'];

        var sortGraphsByType = function(){
            for (var i=0; i<$scope.pdu_list.length; i++){
                $scope.pdu_list[i].pdu.graph_obj.sort(function(a, b){
                    var keyA=a.displayName.toLowerCase(), keyB=b.displayName.toLowerCase();
                    if (keyA < keyB) {
                        return -1;
                    }
                    if (keyA > keyB){
                        return 1;
                    }
                    return 0;
                });
            }
        };

        var get_health_graphs = function (graphconfig, pdu) {
            var params = {
                'graph_type': graphconfig.graphType,
                'height': 150,
                'width': 228
            };
            $http({
                method: "GET",
                url: '/customer/observium/pdu/' + pdu.uuid + '/get_graph_by_type/',
                params: params,
            }).then(function (response) {
                console.log('response : ', angular.toJson(response));
                counter = counter + 1;
                response.data.displayName = graphconfig.displayName;
                pdu.graph_obj.push(response.data);
                if (counter == ((pduGraphsToShow.length) * $scope.pdu_list.length)) {
                    sortGraphsByType();
                    $scope.loader = false;
                }
            }).catch(function (error) {
                console.log("error for graph data:" + JSON.stringify(error));
                $scope.loader = false;
            });
        };

        var get_health_overview_data = function (pdu) {
            pdu.graph_obj = [];
            angular.forEach(OberviumGraphConfig.PDU.HEALTHGRAPHS.OVERVIEW, function (value, key) {
                if (value.DISPLAYNAME == 'Current' || value.DISPLAYNAME == 'Voltage'){
                    var graphObj = {};
                    graphObj.displayName = value.DISPLAYNAME;
                    graphObj.graphType = value.GRAPHNAME;
                    get_health_graphs(graphObj, pdu);
                }
            });
        };

        $scope.get_pdu_list = function () {
            $http({
                method: "GET",
                url: '/customer/observium/pdu/',
            }).then(function (response) {
                var pdu_graph_data = [];
                $scope.pdu_list = response.data.results;
                if($scope.pdu_list.length === 0){
                    $scope.loader = false;
                }
                angular.forEach($scope.pdu_list, function (value, key) {
                    get_health_overview_data(value.pdu);
                });
            }).catch(function (error) {
                $scope.loader = false;
            });

        };
        $scope.get_pdu_list();
    }
]);

