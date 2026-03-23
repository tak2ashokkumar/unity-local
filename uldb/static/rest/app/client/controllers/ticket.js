/**
 * Created by rt on 1/29/16.
 */
var app = angular.module('uldb');

app.controller('ManageRequestController', [
    '$scope',
    '$uibModalInstance',
    '$http',
    'TaskService2',
    'AlertService2',
    function ($scope, $uibModalInstance, $http, TaskService2, AlertService2) {
        var subject_msg = 'Subject is required';
        var desc_msg = 'Description is required';
        var priority_msg = 'Priority is required';
        $scope.request = {};
        $scope.ticket_priority_list = [{long: 'low', short: 'low'},
            {long: 'normal', short: 'normal'},
            {long: 'high', short: 'high'},
            {long: 'urgent', short: 'urgent'},

        ];
        $scope.request.subject = " Manage request for " + $scope.device_type + " - " + $scope.device_name;
        $scope.request.description = $scope.description;

        $scope.createRequest = function (request, type) {
            $scope.ticket_subject_errmsg = '';
            $scope.ticket_desc_errmsg = '';
            $scope.ticket_priority_errmsg = '';
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
            if (request.description_text === undefined) {
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

            $http.post("/customer/ticketorganization/create_request/",
                {
                    subject: request.subject, 
                    description: request.description_text.concat(request.description),
                    type: type,
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

app.controller('VXCRequestController', [
    '$scope',
    '$rootScope',
    '$uibModalInstance',
    '$http',
    'TaskService2',
    'RestService',
    'AlertService2',
    function ($scope, $rootScope, $uibModalInstance, $http, TaskService2, RestService, AlertService2) {
        var subject_msg = 'Subject is required';
        var desc_msg = 'Description is required';
        $scope.request = {};
        $scope.request.connection_type_list = {
            'Private': 'Private',
            'AWS': 'AWS',
            'Azure': 'Azure'
        };

        $scope.request.description = '\n \n ##- Please type your description above this line -##\n' +
            "===============\n" +
            "User Email: " + $rootScope.userEmail + "\n" +
            "===============\n";

        $scope.change_subject = function () {
            $scope.request.description = '\n \n ##- Please type your description above this line -##\n' +
                "===============\n" +
                "User Email: " + $rootScope.userEmail + "\n" +
                "Connection Type: " + $scope.request.connection_type + "\n" +
                "===============\n";
            if ($scope.request.connection_type == "Private") {
                $scope.request.subject = "UnitedConnect: Request for Private VXC";

            }
            else if ($scope.request.connection_type == "AWS") {
                $scope.request.subject = "UnitedConnect: Request for AWS VXC";
            }
            else if ($scope.request.connection_type == "Azure") {
                $scope.request.subject = "UnitedConnect: Request for Azure VXC";
            }
        };

        $scope.createRequest = function (request, type) {
            $scope.ticket_subject_errmsg = '';
            $scope.ticket_desc_errmsg = '';
            var stop_execution = false;
            if (request === undefined) {
                $scope.ticket_subject_errmsg = subject_msg;
                $scope.ticket_desc_errmsg = desc_msg;
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
            if (stop_execution) {
                return;
            }
            $uibModalInstance.close();
            $scope.loader = true;
            $http.post("/customer/ticketorganization/create_request/",
                {subject: request.subject, description: request.description, type: type}).then(function (response) {
                TaskService2.processTask(response.data.task_id).then(function (result) {
                    var params = {'ticket_id': result.request.id, 'connection_type': $scope.request.connection_type};
                    RestService.send_modal_data(params, '/rest/ticketvxc/').then(function (result) {
                        if (result.status == 201) {
                            $scope.getVxcTickets();
                        }
                    });
                    AlertService2.success("Ticket submitted successfully, it will be visible in Unity in few minutes. Our Support team will soon contact you", 3000);
                    $scope.loader = false;
                }).catch(function (error) {
                    console.log(error);
                    $scope.loader = false;
                    AlertService2.danger("Error while creating ticket.");
                });
            });
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss();
        };
    }
]);


app.controller('CustomerTicketDetailController', [
    '$scope',
    '$uibModal',
    'CustomerTicketOrganization',
    '$http',
    '$timeout',
    'TaskService',
    'TaskService2',
    '$routeParams',
    'AlertService2',
    '$stateParams',
    function ($scope, $uibModal, CustomerTicketOrganization, $http, $timeout, TaskService, TaskService2, $routeParams, AlertService2, $stateParams) {
        $scope.clearErrors = function () {
            $scope.error = false;
            $scope.errorMsg = "";
        };
        $scope.clearErrors();
        $scope.requests = [];
        $scope.loader = true;


        $scope.title = {
            singular: 'Customer Support',
            plural: 'Customer Support'
        };
        $scope.zendeskRequestUrlBase = "https://unitedlayer.zendesk.com/hc/en-us/requests/";
        $scope.$root.title = $scope.title;

        $scope.ticket_priority_list = [
            {long: 'low', short: 'low'},
            {long: 'normal', short: 'normal'},
            {long: 'high', short: 'high'},
            {long: 'urgent', short: 'urgent'},
            {long: 'N/A', short: 'N/A'},
        ];

        var rebuild_users = function (users) {
            $scope.users = users.reduce(function (p, e, i, arr) {
                p[e.id] = e;
                return p;
            }, {});
        };

        $scope.selection = {
            request: null,
            index: null
        };


        $scope.userIsAdmin = function (author_id) {
            return $scope.users[author_id].agent === true;
        };


        $scope.ticket_priority = '';
        $scope.getTickets = function () {
            //$http.get(org.url + "get_tickets/").then(function (response) {
            $scope.loader = true;
            return $http.get("/customer/ticketorganization/get_tickets_data/", {"params": {"ticket_id": $stateParams.ticket_id}}).then(function (response) {
                //    console.log(response);
                TaskService2.processTask(response.data.task_id).then(function (result) {
                    $scope.requests = result.request;  //updates everything

                    if ($scope.requests === undefined) {
                        AlertService2.danger(result.error);
                        $scope.loader = false;
                        return;    
                    }

                    if (typeof $scope.requests.via.channel !== 'undefined') {
                        if ($scope.requests.via.channel == 'api') {
                            $scope.requests.via.channel = 'Unity Portal';
                        }
                    }

                    switch ($scope.requests.priority) {
                        case 'low' :
                            $scope.ticket_priority = angular.copy($scope.requests.priority);
                            break;
                        case 'normal' :
                            $scope.ticket_priority = angular.copy($scope.requests.priority);
                            break;
                        case 'high' :
                            $scope.ticket_priority = angular.copy($scope.requests.priority);
                            break;
                        case 'urgent' :
                            $scope.ticket_priority = angular.copy($scope.requests.priority);
                            break;
                        default :
                            $scope.ticket_priority = $scope.ticket_priority_list[4].short;
                    }

                    $scope.ticket_priority_old = angular.copy($scope.ticket_priority);
                    rebuild_users(result.users);
                    $scope.expandRequest($scope.requests, 0);

                }).catch(function (error) {

                    $scope.loader = false;
                    var message = "Error while getting ticket data.";
                    if (error.message !== undefined) {
                        message = error.message[0];
                    }
                    AlertService2.danger(message);
                    $scope.error = true;
                    $scope.errorMsg = error.error + " " + error.message;
                });
            });
        };
        $scope.getTickets();

        $scope.currentPost = {
            body: null
        };

        $scope.isExpanded = function (request) {
            return request === $scope.selection.request;
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

        $scope.change_priority_req = function (request) {
            console.log('request : ', angular.toJson(request));
            if ((request === undefined) || (request.short == 'N/A')) {
                return;
            }
            console.log('$scope.ticket_priority : ', request);

            var modalInstance = $uibModal.open({
                templateUrl: 'changePriorityConfirm.html',
                scope: $scope,
                size: 'sm',
                controller: 'changePriorityController'
            });
            modalInstance.result.then(function (selectedItem) {
                console.log('selectedItem : ', angular.toJson(selectedItem));
            }, function (dismissItem) {
                console.log('dismissItem : ', angular.toJson(dismissItem));
                $scope.ticket_priority = angular.copy($scope.ticket_priority_old);
                $timeout(function(){
                    console.log('before apply');
                    $scope.$apply();
                },1000);
            });
        };

        $scope.createRequest = function (request) {
            $http.post($scope.org.url + "create_request/",
                {'subject': request.subject, 'description': request.description}).then(function (response) {
                TaskService.processTask(response.data.task_id, function (result) {
                    // update the client with the new model
                    $scope.requests.push(result.request); //updates everything
                }, function (error) {
                    $scope.error = true;
                    $scope.errorMsg = error.error + " " + error.message;
                });
            });
        };

        $scope.expandRequest = function (request, index) {
            $scope.loader_b = true;
            $scope.selection.request = request;
            $scope.selection.index = index;
            $http.get("/customer/ticketorganization/get_comments_data/", {"params": {"ticket_id": $stateParams.ticket_id}}).then(function (response) {
                $scope.request = request;
                TaskService.processTask(response.data.task_id, function (result) {
                    $scope.comments = result.comments; //updates everything
                    rebuild_users(result.users);
                    $scope.commentsCount = result.count;
                    $scope.loader = false;
                }, function (error) {
                    AlertService2.danger("Error while getting ticket comment data.");
                    $scope.error = true;
                    $scope.errorMsg = error.error + " " + error.message;
                    $scope.loader = false;
                });
            });
        };
        
        $scope.postComment = function (comment) {
            $scope.loader = true;
            $http.post("/customer/ticketorganization/post_comment/",
                {'ticket_id': $scope.request.id, 'body': comment}).then(function (response) {
                TaskService2.processTask(response.data.task_id).then(function (response) {
                    $scope.expandRequest($scope.selection.request, $scope.selection.index);
                    // clear frontend
                    $scope.currentPost.body = null;
                }).catch(function (error) {
                    $scope.loader = false;
                    AlertService2.danger("Error while posting ticket comment.");
                    console.log(error);
                });
            });
        };
    }
]);


app.controller('changePriorityController', [
    '$scope',
    '$uibModalInstance',
    '$http',
    'TaskService2',
    'AlertService2',
    function ($scope, $uibModalInstance, $http, TaskService2, AlertService2) {

        $scope.change_priority = function () {
            console.log('$scope.ticket_priority : ', angular.toJson($scope.ticket_priority));
            console.log('$scope.ticket_priority_old : ', angular.toJson($scope.ticket_priority_old));
            if (angular.equals($scope.ticket_priority,$scope.ticket_priority_old)) {
                AlertService2.danger("Old priority and new priority are same.Cannot proceed with this request.");
                $scope.cancel();
                return;
            }
            $uibModalInstance.close('close');
            $scope.loader = true;
            $http.post("/customer/ticketorganization/change_priority/",
                {'ticket_id': $scope.request.id, 'priority': angular.copy($scope.ticket_priority)}).then(function (response) {
                TaskService2.processTask(response.data.task_id).then(function (response) {
                    $scope.getTickets();
                }).catch(function (error) {
                    $scope.loader = false;
                    $scope.ticket_priority = angular.copy($scope.ticket_priority_old);
                    AlertService2.danger("Error while changing ticket priority.");
                    console.log(error);
                });
            });
        };


        $scope.cancel = function () {
            $uibModalInstance.dismiss('revert');
        };


    }
]);
