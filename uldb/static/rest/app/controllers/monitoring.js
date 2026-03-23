var app = angular.module('uldb');

app.controller('TicketController', [
    '$scope',
    '$http',
    'Organization',
    'TaskService',
    function ($scope,
              $http,
              Organization,
              TaskService) {
        $scope.clearErrors = function () {
            $scope.error = false;
            $scope.errorMsg = '';
        };
        $scope.clearErrors();

        $scope.org = null;
        $scope.requests = [];

        $scope.getOrgs = function (val) {
            return Organization.get({ 'search': val }).$promise.then(function (response) {
                return response;
            });
        };

        $scope.getTickets = function (org) {
            $http.get(org.url + 'get_tickets/').then(function (response) {
                $scope.org = org;
                TaskService.processTask(response.data.task_id, function (result) {
                    $scope.requests = result.requests; //updates everything
                }, function (error) {
                    $scope.error = true;
                    $scope.errorMsg = error.error + ' ' + error.message;
                });
            });
        };

        $scope.createTicketOrg = function (org) {
            $http.post(org.url + 'setup/').then(function (response) {
                TaskService.processTask(response.data.task_id, function (result) {
                    // update the client with the new model
                    $scope.org = result; //updates everything
                }, function (error) {
                    $scope.error = true;
                    $scope.errorMsg = error.error + ' ' + error.message;
                });
            });
        };

        $scope.createRequest = function (request) {
            $http.post($scope.org.url + 'create_request/',
                { 'subject': request.subject, 'description': request.description }).then(function (response) {
                    TaskService.processTask(response.data.task_id, function (result) {
                        // update the client with the new model
                        $scope.requests.push(result.request); //updates everything
                    }, function (error) {
                        $scope.error = true;
                        $scope.errorMsg = error.error + ' ' + error.message;
                    });
                }
            );
        };

        $scope.expandRequest = function (request) {
            $http.get($scope.org.url + 'get_comments/', { 'params': { 'ticket_id': request.id } }).then(function (response) {
                $scope.request = request;
                TaskService.processTask(response.data.task_id, function (result) {
                    $scope.comments = result.comments; //updates everything
                }, function (error) {
                    $scope.error = true;
                    $scope.errorMsg = error.error + ' ' + error.message;
                });
            });
        };
    }
]);

app.controller('TicketDetailController', [
    '$scope',
    '$http',
    function ($scope, $http) {
        $scope.postComment = function (comment) {
            $http.post($scope.org.url + 'post_comment/', {
                'ticket_id': $scope.request.id,
                'body': comment
            }).then(function (response) {
            });
        };
    }
]);

app.controller('NetworkingGraphController', [
    '$scope',
    '$http',
    '$resource',
    '$filter',
    'Switch',
    'SwitchMonitor',
    'MonitoredSwitchPort',
    'Organization',
    'GraphedPort',
    'TaskService',
    'AbstractControllerFactory',
    'TaskService2',
    'AlertService2',
    'SearchService',
    'BreadCrumbService',
    '$uibModal',
    function ($scope, $http, $resource, $filter, Switch, SwitchMonitor, MonitoredSwitchPort, Organization, GraphedPort, TaskService, AbstractControllerFactory, TaskService2, AlertService2, SearchService, BreadCrumbService, $uibModal) {
        $scope.sm = new SwitchMonitor();
        $scope.debug_graph = {};

        $scope.data = {};

        $scope.graphed_ports = [];

        $scope.bread = BreadCrumbService;

        $scope.$on('$destroy', function () {
            $scope.bread.pushIfTop({ name: 'Network Graph', url: '#/integ/net/graph/' }, $scope);
        });

        $scope.getOrgs = function (val) {
            return Organization.get({ 'search': val }).$promise.then(function (response) {
                return response.results;
            });
        };

        $scope.loadPorts = function (val) {
            //$scope.graphed_ports = GraphedPort.get({'organization_id': val.id});
            GraphedPort.get({ 'organization_id': val.id }).$promise.then(function (response) {
                $scope.graphed_ports = response.results;
                /*response.results.forEach(function (v) {
                 $scope.graphed_ports.push(v);
                 });*/
            });
        };
        var processResult = function (result) {
            $scope.debug_graph = result;
            $scope.data = [
                {
                    key: 'Inbound Traffic',
                    color: '#ff7f0e',
                    values: result['inbound_traffic']
                },
                {
                    key: 'Outbound Traffic',
                    //color: '#7777ff',
                    color: '#18bc9c',
                    values: result['outbound_traffic']
                },
                {
                    key: '95th Percentile',
                    color: '#47A3FF',
                    values: result['outbound_traffic'].map(function (e, i, arr) {
                        return [e[0], result['percentile']];
                    })
                }
            ];
        };

        $scope.getGraph = function (port, val) {
            $http.get(port.url + 'raw_data/', { params: { 'scale': val } }).then(function (response) {
                if (response.data.cached_result !== undefined) {
                    // handles short circuit case
                    processResult(response.data.result.result);
                } else {
                    // else, it's a real task, so wait on it
                    TaskService.processTask(response.data.task_id, function (result) {
                        processResult(result);
                        $scope.options.title.text = port.port_name;
                    });
                }
            });
        };

        $scope.getGraph2 = function (port, val) {
            $http.get(port.url + 'raw_data/', { params: { 'scale': val } }).then(function (response) {
                if (response.data.cached_result !== undefined) {
                    // handles short circuit case
                    processResult(response.data.result.result);
                } else {
                    // else, it's a real task, so wait on it
                    TaskService.processTask(response.data.task_id, function (result) {
                        processResult(result);
                        $scope.options.title.text = port.port_name;
                    });
                }
            });
        };

        $scope.getSwitches = function (val) {
            return Switch.get({ 'search': val }).$promise.then(function (response) {
                return response.results;
            });
        };

        $scope.link = function (sw) {
            $scope.sm.switch = sw.url;
            $scope.sm.$save().then(function (result) {
                sw.switchmonitor = result.url;
            }).then(function () {

            });
        };

        $scope.render_graph = function () {
            $http.get($scope.switch.switchmonitor + 'scan/').then(function (response) {
                TaskService.processTask(response.data.task_id, function (result) {
                    $scope.graph = result;
                });
            });
        };

        $scope.options = {
            chart: {
                type: 'lineWithFocusChart',
                height: 450,
                isArea: function (val) {
                    return val.key !== undefined && val.key != '95th Percentile';
                },
                margin: {
                    top: 20,
                    right: 20,
                    bottom: 40,
                    left: 100
                },
                x: function (d) {
                    return d[0] * 1000;
                },
                y: function (d) {
                    return d[1];
                },
                useInteractiveGuideline: true,
                dispatch: {
                    stateChange: function (e) {
                        //console.log("stateChange");
                    },
                    changeState: function (e) {
                        //console.log("changeState");
                    },
                    tooltipShow: function (e) {
                        //console.log("tooltipShow");
                    },
                    tooltipHide: function (e) {
                        //console.log("tooltipHide");
                    }
                },
                xAxis: {
                    //axisLabel: 'Datetime',
                    tickFormat: function (d) {
                        return d3.time.format('%Y-%m-%d %I:%M%p')(new Date(d));
                    },
                    axisLabelDistance: 30,
                    showMaxMin: false,
                    ticks: 5
                },

                yAxis: {
                    axisLabel: 'bits per second (bps)',
                    tickFormat: function (d) {
                        return d3.format('.4s')(d);
                    },
                    axisLabelDistance: 30,
                    showMaxMin: false
                },
                x2Axis: {
                    tickFormat: function (d) {
                        return d3.time.format('%Y-%m-%d %I:%M%p')(new Date(d));
                    },
                    axisLabelDistance: 30,
                    showMaxMin: false,
                    ticks: 5
                },
                y2Axis: {
                    //    axisLabel: 'bits per second (bps)',
                    tickFormat: function (d) {
                        return d3.format('.02f')(d);
                    },
                    axisLabelDistance: 30,
                    showMaxMin: false
                },
                callback: function (chart) {
                    //console.log("!!! lineChart callback !!!");
                }
            },
            title: {
                enable: true,
                text: 'Title for Line Chart'
            }

        };
    }
]);

app.controller('InstanceListController', [
    '$scope',
    '$http',
    '$interval',
    'HostMonitor',
    'InstanceFast',
    'InstanceByOrg',
    'Organization',
    'AbstractControllerFactory',
    'TaskService2',
    'AlertService2',
    'SearchService',
    'HostMonitorService',
    'BreadCrumbService',
    '$uibModal',
    function ($scope,
              $http,
              $interval,
              HostMonitor,
              InstanceFast,
              InstanceByOrg,
              Organization,
              AbstractControllerFactory,
              TaskService2,
              AlertService2,
              SearchService,
              HostMonitorService,
              BreadCrumbService,
              $uibModal) {

        $scope.resourceClass = HostMonitor;
        $scope.ctrl = new AbstractControllerFactory($scope.resourceClass, $scope, 'remote_hostname');

        $scope.bread = BreadCrumbService;

        $scope.$on('$destroy', function () {
            $scope.bread.pushIfTop({ name: 'Monitored Hosts', url: '#/integ/health/' }, $scope);
        });

        var InstanceSearch = new SearchService(InstanceFast);
        $scope.getInstance = InstanceSearch.search;

        $scope.rows = [

            {
                name: 'instance', description: 'Instance', required: true,
                opaque: true,
                subfield: 'name',
                searchby: true,
                read: function (result) {
                    if (result.instance === null) {
                        return '';
                    }
                    return result.instance.name;
                },
                render: $scope.getInstance
            },
            { name: 'remote_hostname', description: 'Icinga Hostname', required: true },
            { name: 'ip_address', description: 'IP Address', required: true },
        ];

        $scope.title = {
            plural: 'Monitored Hosts',
            singular: 'Monitored Host'
        };

        $scope.hm = function () {
            return HostMonitorService.getHostState($scope.instance.id);
        };

        $scope.host_services = function () {
            return HostMonitorService.getHostServices($scope.instance.id);
        };

        $scope.scan = function (selected, index) {
            $http.get(selected.url + 'scan/').then(function (response) {
                // task is contained in key 'task_id' from data
                TaskService2.processTask(response.data.task_id).then(function (success) {
                    // update the view
                    selected.state = success[0] == 0 ? 'OK' : 'CRITICAL';
                    selected.state_description = success[1];
                    //AlertService2.success("scan: " + success);
                }).catch(function (error) {
                    AlertService2.danger(error);
                });
            }).catch(function (error) {
                // error invoking task
            });
        };

        var timers = [];

        $scope.p.then(function () {
            $scope.model.results.forEach(function (e, i, arr) {
                $scope.scan(e, i);
                timers.push(
                    $interval(function () {
                        $scope.scan(e, i);
                    }, 60000)
                );
            });
        });

        $scope.$on('$destroy', function () {
            timers.forEach(function (timer, i, arr) {
                $interval.cancel(timer);
            });
        });


        $scope.scanServices = function (selected, index) {

            $http.get(selected.url + 'scan_services/').then(function (response) {
                HostMonitorService.processTask(response.data.task_id, function (result) {
                    return HostMonitorService.setHostServices($scope.instance.id, result);
                });
            }).then(function (error) {
                // error invoking task
            });
        };

        $scope.removeCheck = function (selected, index) {
            window.deletename = selected.remote_hostname;
            $http.delete(selected.url).then(function (response) {

                // since we're only showing instances with monitors, delete from parent as well
                $scope.model.results.splice($scope.model.results.indexOf(index), 1);
                AlertService2.danger('Deleted ' + window.deletename);
                window.deletename = '';
            });
        };

        $scope.verify = function (selected, index) {

            $http.post(selected.url + 'verify/').then(function (response) {
                TaskService2.processTask(response.data.task_id).then(function (success) {
                    //$scope.instance.related_monitor.verified = true;
                    selected.state = success[0] == 0 ? 'OK' : 'CRITICAL';
                    selected.state_description = success[1];
                }, function (error) {
                });
            });
        };

        $scope.getOrgs = function (val) {
            return Organization.get({ 'search': val }).$promise.then(function (response) {
                return response.results;
            });
        };


    }
]);

app.controller('NagiosController', [
    '$scope',
    '$http',
    '$filter',
    '$location',
    '$routeParams',
    'AbstractControllerFactory2',
    'ULDBService2',
    'GraphingService',
    'NagiosService',
    'AlertService2',
    function ($scope,
              $http,
              $filter,
              $location,
              $routeParams,
              AbstractControllerFactory2,
              ULDBService2,
              GraphingService,
              NagiosService,
              AlertService2) {
        $scope.ctrl = AbstractControllerFactory2($scope, ULDBService2.hostMonitor());

        //  TAB CONTROL FUNCTIONALITY  todo: factor out into service? or directive?
        $scope.tabs = [
            { name: 'Current', url: 'currentNagiosData.html' },
            { name: 'Historical', url: 'historicalNagiosData.html' },
            { name: 'Monitored Host List', url: 'linkedNagiosData.html' }
        ];

        $scope.intervals = {};
        // select the tab based on param
        $scope.activeTab = 0;
        var tab = $routeParams.t;
        if (tab) {
            $scope.tabs.forEach(function (e, i, arr) {
                if (e.name === tab) {
                    $scope.activeTab = i;
                }
            });
        }
        $scope.redirectTab = function (idx) {
            $location.path($scope.tabs[idx].url);
            // window.dispatchEvent(new Event('resize'));  // fixes charts in data
        };
        //  END TAB CONTROL FUNCTIONALITY

        NagiosService.hostHistory().then(function (data) {
            $scope.host_history_data = data;
        });

        NagiosService.serviceHistory().then(function (data) {
            $scope.service_history_data = data;
        });

        $scope.service_data = [];
        $scope.host_data = [];
        NagiosService.stats().then(function (data) {
            $scope.service_data = data.service_data;
            $scope.service_data_problems_only = angular.copy(data.service_data);
            $scope.service_data_problems_only.forEach(function (e, i, arr) {
                if (e.label === 'SERVICE_OK') {
                    arr.splice(i, 1);
                }
            });
            $scope.host_data = data.host_data;
            $scope.host_data_problems_only = angular.copy(data.host_data);
            $scope.host_data_problems_only.forEach(function (e, i, arr) {
                if (e.label === 'HOST_UP') {
                    arr.splice(i, 1);
                }
            });
        });

        NagiosService.problemHosts().then(function (data) {
            $scope.problem_hosts = data;
        });
        NagiosService.problemServices().then(function (data) {
            $scope.problem_services = data;
        });

    }
]);

app.controller('ObserviumDetailController', [
    '$scope',
    '$routeParams',
    'ObserviumHost',
    'ULDBService2',
    function ($scope, $routeParams, ObserviumHost, ULDBService2) {
        ObserviumHost.get({ id: $routeParams.id }).$promise.then(function (response) {
            $scope.result = response;
            $scope.interfaces = response['interfaces'];
        });
        $scope.cols = ULDBService2.observium_host().fields();
        $scope.interface_fields = [
            'administrative_state',
            'index',
            'name',
            'duplex',
            'mtu',
            'ulid',
            'alias',
            'operational_state',
            'speed',
            'description'
        ];
    }
]);

app.controller('NagiosModalController', [
    '$scope',
    '$uibModalInstance',
    'HostMonitor',
    'AlertService2',
    function ($scope, $uibModalInstance, HostMonitor, AlertService2) {
        $scope.addObj = function (obj) {
            // make new object
            var host_monitor = new HostMonitor();

            // set a few things
            host_monitor.instance = obj.instance;
            // host_monitor.remote_hostname = obj.remote_hostname.display_name;
            host_monitor.nagios_display_name = obj.nagios_display_name;

            // save
            host_monitor.$save().then(function (response) {
                $scope.reloadPage();
            }).catch(function (error) {
                AlertService2.danger(error);
            }).finally(function () {
                $uibModalInstance.close();
            });
        };

        $scope.editObj = function (obj, index) {
            HostMonitor.update(obj).$promise.then(function (response) {
                angular.extend($scope.model.results[index], response.result);
                AlertService2.success('Edited ' + obj.nagios_display_name);
                $uibModalInstance.close();
            }).catch(function (error) {
                AlertService2.danger(error);
                $uibModalInstance.close();
            });
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }
]);
