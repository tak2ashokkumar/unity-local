var app = angular.module('uldb');
app.controller('ZendeskIncidentTicketController', [
    '$scope',
    '$http',
    '$q',
    '$filter',
    '$rootScope',
    'CustomDataService',
    '$uibModal',
    'TableHeaders',
    'TicketOrg',
    function ($scope,
              $http,
              $q,
              $filter,
              $rootScope,
              CustomDataService,
              $uibModal,
              TableHeaders,
              TicketOrg) {

        var ticket_org = [];
        var ticket_data = {};
        $scope.tickets_headers = TableHeaders.tickets;
        TicketOrg.query().$promise.then(function (success) {
            angular.forEach(success.results, function (value, key) {
                ticket_data[value.remote_id] = value.organization.name;
                ticket_org.push(ticket_data);
            });
        }).catch(function (error) {
            console.log(error);
        });

        $scope.tickets_headers = TableHeaders.tickets;
        $scope.load_tickets = function (results) {

            var tickets_data = [];
            angular.forEach(results, function (value, key) {

                var ticket_json = {};
                ticket_json.ticket_id = '' + value.id.toString() + ' ';
                ticket_json.type = value.type;
                ticket_json.subject = value.subject;
                var organization = ticket_org[0][value.organization_id];
                if (organization) {
                    ticket_json.customer = ticket_org[0][value.organization_id];
                }
                else {
                    ticket_json.customer = 'N/A';
                }
                angular.forEach(value.custom_fields, function (v, k) {
                    if (v.id == 32509407) {
                        if (v.value != null && v.value != '') {
                            ticket_json.datacenter = v.value.toUpperCase();
                        }
                        else {
                            ticket_json.datacenter = 'N/A';
                        }

                    }
                });

                ticket_json.status = value.status;
                if (value.priority == null) {
                    ticket_json.priority = 'N/A';
                }
                else {
                    ticket_json.priority = value.priority;
                }

                ticket_json.last_updated = $filter('date')(value.updated_at, 'medium');
                tickets_data.push(ticket_json);

            });
            return tickets_data;
        };

        $scope.promptRequest = function () {
            var modalInstance = $uibModal.open({
                templateUrl: 'createRequestModal.html',
                scope: $scope,
                size: 'md',
                controller: 'CreateRequestController'
            });
            modalInstance.result.then();
        };

        CustomDataService.get_incident_tickets().then(function (result) {
            var obj = { data: null };
            obj.data = { info: null };

            var tickets_data = [];
            var tickets = [];

            if (result.result.results) {
                tickets = $scope.load_tickets(result.result.results);
            }
            else {
                tickets = $scope.load_tickets(result.result.tickets);
            }

            var incident_tickets = [];
            angular.forEach(tickets, function (value, key) {
                if (value.type === 'incident') {
                    incident_tickets.push(value);
                }
            });

            obj.data.info = incident_tickets;
            // obj.data.info = tickets;
            $scope.tickets_content = obj;
        });

    }
]);

app.controller('ZendeskChangeTicketController', [
    '$scope',
    '$http',
    '$q',
    '$filter',
    '$rootScope',
    'CustomDataService',
    '$uibModal',
    'TableHeaders',
    'TicketOrg',
    function ($scope,
              $http,
              $q,
              $filter,
              $rootScope,
              CustomDataService,
              $uibModal,
              TableHeaders,
              TicketOrg) {
        var ticket_org = [];
        var ticket_data = {};
        $scope.tickets_headers = TableHeaders.tickets;
        TicketOrg.query().$promise.then(function (success) {
            angular.forEach(success.results, function (value, key) {
                ticket_data[value.remote_id] = value.organization.name;
                ticket_org.push(ticket_data);
            });
        }).catch(function (error) {
            console.log(error);
        });

        $scope.tickets_headers = TableHeaders.tickets;
        $scope.load_tickets = function (results) {

            var tickets_data = [];
            angular.forEach(results, function (value, key) {

                var ticket_json = {};
                ticket_json.ticket_id = '' + value.id.toString() + ' ';
                ticket_json.type = value.type;
                ticket_json.subject = value.subject;
                var organization = ticket_org[0][value.organization_id];
                if (organization) {
                    ticket_json.customer = ticket_org[0][value.organization_id];
                }
                else {
                    ticket_json.customer = 'N/A';
                }
                angular.forEach(value.custom_fields, function (v, k) {
                    if (v.id === 32509407) {  // why is this hardcoded
                        if (v.value != null && v.value != '') {
                            ticket_json.datacenter = v.value.toUpperCase();
                        }
                        else {
                            ticket_json.datacenter = 'N/A';
                        }

                    }
                });

                ticket_json.status = value.status;
                if (value.priority == null) {
                    ticket_json.priority = 'N/A';
                }
                else {
                    ticket_json.priority = value.priority;
                }

                ticket_json.last_updated = $filter('date')(value.updated_at, 'medium');
                tickets_data.push(ticket_json);

            });
            return tickets_data;
        };

        $scope.promptRequest = function () {
            var modalInstance = $uibModal.open({
                templateUrl: 'createRequestModal.html',
                scope: $scope,
                size: 'md',
                controller: 'CreateRequestController'
            });
            modalInstance.result.then();
        };

        CustomDataService.get_change_tickets().then(function (result) {
            var obj = { data: null };
            obj.data = { info: null };

            var tickets_data = [];
            var tickets = [];

            if (result.result.results) {
                tickets = $scope.load_tickets(result.result.results);
            }
            else {
                tickets = $scope.load_tickets(result.result.tickets);
            }


            var change_tickets = [];
            angular.forEach(tickets, function (value, key) {
                if (value.type != "incident") {
                    change_tickets.push(value);
                }
            });
            obj.data.info = change_tickets;
            // obj.data.info = tickets;
            $scope.tickets_content = obj;
        });

    }
]);
