var app = angular.module('uldb');

app.controller('CustomerAllTicketController', [ '$scope', function ($scope) {

        $scope.heading = 'All Tickets';
        $scope.loader = true;
        $scope.unity_feedback = false;
    }
]);

app.controller('CustomerChangeTicketController', [ '$scope', function ($scope) {

        $scope.title = {
            singular: 'Change Management',
            plural: 'Change Management'
        };
        $scope.$root.title = $scope.title;

        $scope.heading = 'Change Tickets';
        $scope.ticket_type = 'task';
        $scope.loader = true;
        $scope.unity_feedback = false;

    }
]);

app.controller('CustomerIncidentTicketController', [ '$scope', function ($scope) {

        $scope.title = {
            singular: 'Incident Management',
            plural: 'Incident Management'
        };
        $scope.$root.title = $scope.title;

        $scope.heading = 'Incident Tickets';
        $scope.ticket_type = 'incident';
        $scope.loader = true;
        $scope.unity_feedback = false;

    }
]);

app.controller('CustomerSupportTicketController', [ '$scope', function ($scope) {

        $scope.title = {
            singular: 'Service Request',
            plural: 'Service Requests'
        };
        $scope.$root.title = $scope.title;

        $scope.heading = 'Service requests';
        $scope.ticket_type = 'problem';
        $scope.loader = true;
        $scope.unity_feedback = false;

    }
]);

app.controller('CustomerUnityFeedbackController', [ '$scope', function ($scope) {

        $scope.heading = 'Unity Feedback Tickets';
        $scope.ticket_type = 'problem';
        $scope.unity_feedback =  true;
        $scope.loader = true;

    }
]);

app.controller('TicketManagementController', [
    '$scope',
    '$http',
    '$q',
    '$filter',
    '$timeout',
    '$rootScope',
    '$uibModal',
    '$location',
    'ClientDashboardService',
    'TableHeaders',
    'TaskService2',
    'AlertService2',
    function ($scope,
              $http,
              $q,
              $filter,
              $timeout,
              $rootScope,
              $uibModal,
              $location,
              ClientDashboardService,
              TableHeaders,
              TaskService2,
              AlertService2) {


        $scope.tickets_headers = TableHeaders.tickets;
        $scope.page_no = 1;
        $scope.zendesk_page_size = 10;
        $scope.loader = true;
        $scope.tickets = undefined;
        $scope.org_linked_to_zendesk = true;

        $scope.sort = {
            sortingColumn: '',
            reverse: false
        };

        $scope.options = {
            "autoApply":true,
            "maxDate": new Date(),
            locale: {
                format: "D MMM YYYY",
            },
        };

        var getUTCDate = function(input_date){
            console.log('-------');
            console.log('input date in users timezone:::', input_date);
            var output_date = moment.tz(input_date, $rootScope.users_timezone).utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
            console.log('output date in UTC timezone:::', output_date);
            return output_date;
        };

        // Initializing filters data
        $scope.tickets_filter = {};
        $scope.tickets_filter.tickets_date_range = {
            startDate: moment().subtract(2, "weeks"),
            endDate: moment()
        };
        $scope.tickets_filter.status = "open";
        $scope.tickets_filter.display_for = "all_tickets";

        $scope.tickets_filter_copy = angular.copy($scope.tickets_filter);

        var update_tickets = function(page_no, ticket_metrics){
            for(var i = ((page_no*10) - 10); i < (page_no*10); i++){
                if( i < $scope.tickets_data.results.length){
                    $scope.tickets_data.results[i].has_metrics = true;
                    for(var j = 0; j < ticket_metrics.length; j++){
                        if($scope.tickets_data.results[i].id == ticket_metrics[j].id){
                            $scope.tickets_data.results[i].assigned_on = ticket_metrics[j].metric.initially_assigned_at;
                            $scope.tickets_data.results[i].resolved_on = ticket_metrics[j].metric.solved_at;
                            continue;
                        }
                    }
                }else{
                    break;
                }
            }
        };

        var get_ticket_metrics = function(tickets, page_no){
            var tickets_list = [];
            for(var i = 0; i < tickets.length; i++){
                var ticket_obj = {};
                ticket_obj.id = tickets[i].id;
                tickets_list.push(ticket_obj);
            }

            $http({
                method: "POST",
                url: '/customer/ticketorganization/get_ticket_metrics/',
                data: tickets_list,
            }).then(function (response) {
                update_tickets(page_no, response.data.tickets_list);
            }).catch(function (error) {
                console.log('error is : ', angular.toJson(error));
            });
        };

        var get_tickets = function( params ){
            $scope.tickets = undefined;
            $http({
                method: "GET",
                url: '/customer/ticketorganization/get_paginated_tickets_by_type',
                params: params,
            }).then(function (response) {
                if ($scope.page_no == 1) {
                    $scope.tickets_data = angular.copy(response.data);
                }else{
                    $scope.tickets_data.results = $scope.tickets_data.results.concat(response.data.results);
                }
                if(response.data.results.length){
                    get_ticket_metrics(angular.copy(response.data.results), angular.copy($scope.page_no));
                }
                $scope.tickets_filter_copy = angular.copy($scope.tickets_filter);
                $scope.loader = false;
            }).catch(function (error) {
                $scope.loader = false;
                $scope.tickets_data = [];
                console.log('error : ', angular.toJson(error));
                AlertService2.danger(angular.toJson(error));
                $scope.zendeskError = error.data.error;
                $scope.tickets_filter_copy = angular.copy($scope.tickets_filter);
            });
        };

        $scope.getTickets = function (page_no) {
            $scope.loader = true;
            $scope.page_no = page_no;

            var date_range = angular.copy($scope.tickets_filter.tickets_date_range);

            var startDate = date_range.startDate.format('YYYY-MM-DD');
            var endDate = date_range.endDate.set({hour:23,minute:59,second:59,millisecond:0}).format('YYYY-MM-DD HH:mm:ss');

            var start_date = getUTCDate(startDate);
            var end_date = getUTCDate(endDate);

            var params = {
                'page_no': page_no,
                'start_date' : start_date,
                'end_date' : end_date,
                'status' : ($scope.tickets_filter.status == 'all') ? "" : angular.copy($scope.tickets_filter.status),
                'tickets_for' : $scope.tickets_filter.display_for,
            };

            if($scope.ticket_type){
                params['ticket_type'] = angular.copy($scope.ticket_type);
            }

            if (($scope.tickets_filter.searchkey !== undefined) && ($scope.tickets_filter.searchkey !== null) && ($scope.tickets_filter.searchkey !== '')) {
                params['search'] = $scope.tickets_filter.searchkey;
            }
            if (($scope.tickets_filter.priority !== undefined) && ($scope.tickets_filter.priority !== null) && ($scope.tickets_filter.priority !== '')) {
                params['priority'] = angular.copy($scope.tickets_filter.priority);
            }
            if (($scope.sortkey !== undefined) && ($scope.sortkey !== null) && ($scope.sortkey !== '')) {
                params['sort_by'] = $scope.sortkey;
            }

            if($scope.unity_feedback){
                params['unity_feedback'] = true;
            }

            get_tickets(params);
        };
        $scope.getTickets(1);

        $scope.filter_tickets = function(){
            if(angular.equals($scope.tickets_filter,$scope.tickets_filter_copy)){
                AlertService2.danger('Data for selected filters is already displayed');
            }else{
                if(!angular.equals($scope.tickets_filter.tickets_date_range,$scope.tickets_filter_copy.tickets_date_range)){
                    $scope.open_tickets_count = null;
                    $scope.tickets_count_by_status = null;
                    $scope.tickets_count_by_solved_time = null;
                    $timeout(function(){
                        $scope.get_open_tickets_by_priority_data();
                        $scope.get_all_tickets_related_graphs_data();
                    },1000);
                }
                $scope.userZendeskCheck = true;
                $scope.userZendeskCheckMsg = undefined;
                if($scope.tickets_filter.display_for != 'all_tickets'){
                    $scope.userCheck();
                }else{
                    $scope.page_no = 1;
                    $scope.getTickets(angular.copy($scope.page_no));
                }
            }
        };

        $scope.loadMoreResults = function () {
            if (angular.isDefined($scope.tickets_data) && angular.isDefined($scope.tickets_data.count)) {
                var tickets_loaded = $scope.tickets_data.results.length;
                if (( tickets_loaded < $scope.tickets_data.count) && (($scope.page_no * 10) == tickets_loaded)) {
                    $scope.page_no = $scope.page_no + 1;
                    $scope.getTickets(angular.copy($scope.page_no));
                }
            }
        };

        $scope.userCheck = function () {
            $http({
                method: "GET",
                url: '/customer/ticketorganization/check_user_in_zendesk',
            }).then(function (response) {
                if (response.data.status === 'success'){
                    $scope.userZendeskCheck = true;
                    $scope.getTickets(1);
                }
                else if (response.data.status === 'failure'){
                    $scope.tickets_filter_copy = angular.copy($scope.tickets_filter);
                    $scope.userZendeskCheck = false;
                    $scope.userZendeskCheckMsg = response.data.status_message;
                }
            }).catch(function (error) {
            });
        };
        if($scope.ticket_type){
            $scope.userCheck();
        }

        $scope.open_tickets_count = null;
        var draw_open_tickets_by_priority_graph = function (data) {
            var graph_data = angular.copy(data);
            $('#priority-graph-no-tickets-container').html('');
            if (graph_data.length != 0) {
                $scope.priorityTicket = {
                    type: 'doughnutLabels',
                    data: {
                        datasets: [{
                            data: [graph_data.urgent, graph_data.high, graph_data.low, graph_data.normal],
                            backgroundColor: ["#FF5754", "#F0CC53", "#C6C8C7", "#00DF97"]
                        }],
                        labels: ["Urgent", "High", "Low", "Normal",]
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
                var priorityTicketDonut = angular.element("#priority-ticket-donut")[0].getContext("2d");
                window.upDownChart = new Chart(priorityTicketDonut, $scope.priorityTicket);
            }else {
                $('#priority-graph-no-tickets-container').append(
                    '<div class="no-record no-record-warning" style="margin-top:30px">' +
                    '<span class="no-record-text">&nbsp;No open tickets found</span>' +
                    '</div>'
                );
            }
            $scope.open_tickets_count = angular.copy(data);
        };

        $scope.get_open_tickets_by_priority_data = function(){
            $scope.open_tickets_count = null;
            var date_range = angular.copy($scope.tickets_filter.tickets_date_range);

            var startDate = date_range.startDate.format('YYYY-MM-DD');
            var endDate = date_range.endDate.set({hour:23,minute:59,second:59,millisecond:0}).format('YYYY-MM-DD HH:mm:ss');

            var start_date = getUTCDate(startDate);
            var end_date = getUTCDate(endDate);

            var params = {
                'start_date' : start_date,
                'end_date' : end_date,
            };

            if($scope.ticket_type){
                params['ticket_type'] = angular.copy($scope.ticket_type);
            }

            if($scope.unity_feedback){
                params['unity_feedback'] = true;
            }

            $http({
                method: "GET",
                url: '/customer/ticketorganization/get_open_tickets_count_by_priority',
                params: params,
            }).then(function (response) {
                $timeout(function(){
                    draw_open_tickets_by_priority_graph(angular.copy(response.data));
                },1000);
                $scope.org_linked_to_zendesk = true;
            }).catch(function (error) {
                if(error.status == 400){
                    $scope.org_linked_to_zendesk = false;
                }else{
                    $scope.org_linked_to_zendesk = true;
                }
                console.log('error in get_open_tickets_by_priority_data : ', angular.toJson(error));
            });
        };
        $scope.get_open_tickets_by_priority_data();


        var draw_status_tickets_graph = function (data) {
            $('#status-graph-no-tickets-container').html('');
            var graph_data = angular.copy(data);
            if (graph_data.length != 0) {
                $scope.statusTickets = {
                    type: 'doughnutLabels',
                    data: {
                        datasets: [{
                            data: [graph_data.open, graph_data.pending, graph_data.solved, graph_data.closed],
                            backgroundColor: ["#FF5754", "#F0CC53", "#00DF97", "#C6C8C7"]
                        }],
                        labels: ["Open", "Pending", "Solved", "Closed",]
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

                var statusTicketsDonut = angular.element("#status-tickets-donut")[0].getContext("2d");
                window.upDownChart = new Chart(statusTicketsDonut, $scope.statusTickets);
            }
            else {
                $('#status-graph-no-tickets-container').append(
                    '<div class="no-record no-record-warning" style="margin-top:30px">' +
                    '<span class="no-record-text">&nbsp;No tickets found</span>' +
                    '</div>'
                );

            }
            $scope.tickets_count_by_status = angular.copy(data);
            $scope.loader = false;
        };

        var draw_closed_tickets_response_time_graph = function (data) {
            $('#responsetime-graph-no-tickets-container').html('');
            var graph_data = angular.copy(data);
            if (graph_data.length != 0) {
                $scope.ticketsByResponseTime = {
                    type: 'doughnutLabels',
                    data: {
                        datasets: [{
                            data: [graph_data.one_day, graph_data.one_week, graph_data.one_month, graph_data.greaterthan_month],
                            backgroundColor: ["#3F9435", "#00DF97", "#F0CC53", "#FF5754"]
                        }],
                        labels: ["1 Day", "1 Week", "1 Month", "> 1 Month",]
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

                var ticketsResponseTimeDonut = angular.element("#tickets-responsetime-donut")[0].getContext("2d");
                window.upDownChart = new Chart(ticketsResponseTimeDonut, $scope.ticketsByResponseTime);
            }
            else {
                $('#responsetime-graph-no-tickets-container').append(
                    '<div class="no-record no-record-warning" style="margin-top:30px">' +
                    '<span class="no-record-text">&nbsp;No tickets found</span>' +
                    '</div>'
                );
            }
            $scope.tickets_count_by_solved_time = angular.copy(data);
            $scope.loader = false;
        };

        $scope.tickets_count_by_status = null;
        $scope.tickets_count_by_solved_time = null;
        $scope.get_all_tickets_related_graphs_data = function(){
            $scope.tickets_count_by_status = null;
            $scope.tickets_count_by_solved_time = null;
            var date_range = angular.copy($scope.tickets_filter.tickets_date_range);

            var startDate = date_range.startDate.format('YYYY-MM-DD');
            var endDate = date_range.endDate.set({hour:23,minute:59,second:59,millisecond:0}).format('YYYY-MM-DD HH:mm:ss');

            var start_date = getUTCDate(startDate);
            var end_date = getUTCDate(endDate);
            
            var params = {
                'start_date' : start_date,
                'end_date' : end_date,
            };

            if($scope.ticket_type){
                params['ticket_type'] = angular.copy($scope.ticket_type);
            }

            if($scope.unity_feedback){
                params['unity_feedback'] = true;
            }

            $http({
                method: "GET",
                url: '/customer/ticketorganization/get_all_tickets_graph_data',
                params: params,
            }).then(function (response) {
                console.log('get_all_tickets_related_graphs_data task id : ', angular.toJson(response.data.task_id));
                if(response.data.task_id){
                    TaskService2.processTask(response.data.task_id, 500).then(function (task_response) {
                        console.log('get_all_tickets_related_graphs_data task_response : ', angular.toJson(task_response));
                        $timeout(function(){
                            draw_status_tickets_graph(angular.copy(task_response.tickets_count_by_status));
                            draw_closed_tickets_response_time_graph(task_response.closed_tickets_count_by_response_time);
                        },1000);
                    }).catch(function (error) {
                        console.log('error in get_all_tickets_related_graphs_data task : ', angular.toJson(error));
                    });
                }
            }).catch(function (error) {
                console.log('error in get_all_tickets_related_graphs_data : ', angular.toJson(error));
            });
        };
        $scope.get_all_tickets_related_graphs_data();

        $scope.promptRequest = function () {
            var controller = null;
            var template = null;
            if($scope.unity_feedback){
                controller = 'CreateUnityFeedbackController';
                template = 'createRequestModal.html';
            }else if(angular.isUndefined($scope.ticket_type)){
                controller = 'CreateRequestController';
                template = 'static/rest/app/client/templates/modals/create_ticket_modal.html';
            }else{
                controller = 'CreateRequestController';
                template = 'createRequestModal.html';
            }
            var modalInstance = $uibModal.open({
                templateUrl: template,
                scope: $scope,
                size: 'md',
                controller: controller,
            });
            modalInstance.result.then();
        };

        $scope.sortkey = '';
        $scope.getSortingResults = function (sort) {
            if ((sort !== undefined) && (sort !== null) && (sort !== '')) {
                $scope.page_no = 1;
                $scope.sortkey = sort.sortingColumn;
                $scope.getTickets(angular.copy($scope.page_no));
            }
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

                if (chart.ctx.canvas.id == 'priority-ticket-donut') {
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
    }
]);

app.controller('CreateRequestController', [
    '$scope',
    '$uibModalInstance',
    '$http',
    'Upload',
    'TaskService2',
    'AlertService2',
    function ($scope, $uibModalInstance, $http, Upload, TaskService2, AlertService2) {
        var subject_msg = 'Subject is required';
        var desc_msg = 'Description is required';
        var priority_msg = 'Priority is required';

        $scope.attachments = [];
        $scope.uploaded_attachments = [];

        $scope.ticket_priority_list = [
            {long: 'low', short: 'low'},
            {long: 'normal', short: 'normal'},
            {long: 'high', short: 'high'},
            {long: 'urgent', short: 'urgent'},
        ];


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

        $scope.create_ticket = function(request, attachments, type){
            $uibModalInstance.close();
            AlertService2.success("Request to create ticket has been submitted successfully, ", 3000);
            var formdata = new FormData();
            formdata.append('subject', request.subject);
            formdata.append('collaborators', angular.isDefined(request.collaborators) ? request.collaborators.split(',') : []);
            formdata.append('description', request.description);
            formdata.append('type', type);
            formdata.append('priority', request.priority.short);
            for(var i = 0; i < attachments.length; i++){
                formdata.append(attachments[i].name, attachments[i]);
            }
            $http.post("/customer/ticketorganization/create_request/",formdata,
                {
                    headers: {
                        'Content-Type' : undefined
                    },
                    transformRequest: angular.identity,
                }
                ).then(function (response) {
                    TaskService2.processTask(response.data.task_id).then(function (result) {
                       // update the client with the new model
                       AlertService2.success("Ticket created successfully, it will be visible in Unity in few minutes. Our Support team will soon contact you", 3000);
                       setTimeout(function () {
                           $scope.getTickets(1);
                       }, 3000);
                    }).catch(function (error) {
                       console.log(error);
                       AlertService2.danger("Error while creating ticket.");
                    });
            });
        };

        $scope.createRequest = function (request, type) {

            $scope.ticket_subject_errmsg = '';
            $scope.ticket_desc_errmsg = '';
            var stop_execution = false;
            if (request === undefined) {
                $scope.ticket_subject_errmsg = subject_msg;
                $scope.ticket_desc_errmsg = desc_msg;
                $scope.ticket_priority_errmsg = priority_msg;
                return;
            }
            if (request.subject === undefined) {
                $scope.ticket_subject_errmsg = subject_msg;
                stop_execution = true;
            }
            if (request.description === undefined) {
                $scope.ticket_desc_errmsg = desc_msg;
                stop_execution = true;
            }
            if (request.priority === undefined) {
                $scope.ticket_priority_errmsg = priority_msg;
                stop_execution = true;
            }

            if (stop_execution) {
                return;
            }

            $scope.create_ticket(request, $scope.attachments, type);

            // if ($scope.attachments.length > 0) {
            //     for(var i = 0; i < $scope.attachments.length; i++){
            //         $scope.upload_file($scope.attachments[i], request, type)
            //     }
            // }else{
            //     //$scope.create_ticket(request, type);
            // }
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss();
        };
    }
]);

app.controller('CreateUnityFeedbackController', [
    '$scope',
    '$uibModalInstance',
    '$http',
    'TaskService2',
    'AlertService2',
    function ($scope, $uibModalInstance, $http, TaskService2, AlertService2) {
        var subject_msg = 'Subject is required';
        var desc_msg = 'Description is required';
        var priority_msg = 'Priority is required';

        $scope.ticket_priority_list = [
            {long: 'low', short: 'low'},
            {long: 'normal', short: 'normal'},
            {long: 'high', short: 'high'},
            {long: 'urgent', short: 'urgent'},
        ];


        $scope.createRequest = function (request, type) {

            $scope.ticket_subject_errmsg = '';
            $scope.ticket_desc_errmsg = '';
            var stop_execution = false;
            if (request === undefined) {
                $scope.ticket_subject_errmsg = subject_msg;
                $scope.ticket_desc_errmsg = desc_msg;
                $scope.ticket_priority_errmsg = priority_msg;
                return;
            }
            if (request.subject === undefined) {
                $scope.ticket_subject_errmsg = subject_msg;
                stop_execution = true;
            }
            if (request.description === undefined) {
                $scope.ticket_desc_errmsg = desc_msg;
                stop_execution = true;
            }
            if (request.priority === undefined) {
                $scope.ticket_priority_errmsg = priority_msg;
                stop_execution = true;
            }

            if (stop_execution) {
                return;
            }

            $http.post("/customer/ticketorganization/create_unity_problem_request/",
                {
                    subject: request.subject,
                    description: request.description,
                    type: type,
                    system_type: 'Unity',
                    priority: request.priority.short,
                    collaborators: angular.isDefined(request.collaborators) ? request.collaborators.split(',') : []
                }).then(function (response) {
                TaskService2.processTask(response.data.task_id).then(function (result) {
                    // update the client with the new model
                    $uibModalInstance.close(result);
                    AlertService2.success("Ticket submitted successfully, it will be visible in Unity in few minutes. Our Support team will soon contact you", 3000);
                    setTimeout(function () {
                        $scope.getTickets(1);
                    }, 3000);
                }).catch(function (error) {
                    console.log(error);
                    $uibModalInstance.close(error);
                    AlertService2.danger("Error while creating ticket.");
                });
            });
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss();
        };
    }
]);