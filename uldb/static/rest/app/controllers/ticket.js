var app = angular.module('uldb');

app.controller('TicketController', [
    '$scope',
    'Organization',
    '$http',
    'TaskService',
    function ($scope, Organization, $http, TaskService) {
        //$scope.error = false;
        //$scope.errorMsg = "";

        $scope.clearErrors = function () {
            $scope.error = false;
            $scope.errorMsg = "";
        };
        $scope.clearErrors();

        $scope.org = null;
        $scope.requests = [];

        // http://uldb/org/?search=val
        $scope.getOrgs = function (val) {
            return Organization.query({'search': val}).$promise.then(function (response) {
                return response;
            });
        };

        $scope.getTickets = function (org) {
            $http.get(org.url + "get_tickets/").then(function (response) {
                $scope.org = org;
                TaskService.processTask(response.data.task_id, function (result) {
                    $scope.requests = result.requests; //updates everything
                }, function (error) {
                    $scope.error = true;
                    $scope.errorMsg = error.error + " " + error.message;
                });
            });
        };

        $scope.createTicketOrg = function (org) {
            $http.post(org.url + "setup/").then(function (response) {
                TaskService.processTask(response.data.task_id, function (result) {
                    // update the client with the new model
                    $scope.org = result; //updates everything
                }, function (error) {
                    $scope.error = true;
                    $scope.errorMsg = error.error + " " + error.message;
                });
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

        $scope.expandRequest = function (request) {
            $http.get($scope.org.url + "get_comments/", {"params": {"ticket_id": request.id}}).then(function (response) {
                $scope.request = request;
                TaskService.processTask(response.data.task_id, function (result) {
                    $scope.comments = result.comments; //updates everything
                }, function (error) {
                    $scope.error = true;
                    $scope.errorMsg = error.error + " " + error.message;
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
            $http.post($scope.org.url + "post_comment/", {
                'ticket_id': $scope.request.id,
                'body': comment
            }).then(function (response) {
                console.log("posted a comment");
            });
        };
    }
]);


app.controller('TicketsController2', [
    '$scope',
    '$uibModal',
    'OrganizationFast',
    'ZendeskOrganization',
    '$http',
    'TaskService',
    'TaskService2',
    function ($scope, $uibModal, OrganizationFast, ZendeskOrganization, $http, TaskService, TaskService2) {
        
        $scope.sort_by = '-updated_at';
        $scope.page_no = 1;
        $scope.pageSize = 10;
        $scope.org = null;
        $scope.system_type=null;
        $scope.ticket_type=null;

        $scope.clearErrors = function () {
            $scope.error = false;
            $scope.errorMsg = "";
        };

        $scope.selection = {
            request: null,
            index: null
        };

        var rebuild_users = function (users) {
            $scope.users = users.reduce(function (p, e, i, arr) {
                p[e.id] = e;
                return p;
            }, {});
        };


        $scope.clearErrors();

        $scope.title = {
            singular: 'Customer Support',
            plural: 'Customer Support'
        };
        $scope.zendeskRequestUrlBase = "https://unitedlayer.zendesk.com/hc/en-us/requests/";
        $scope.$root.title = $scope.title;
        $scope.loader = false;

        $scope.setTicketType = function(ticket_type){
            $scope.ticket_type = ticket_type;
        };

        $scope.setSystemType = function(system_type){
            $scope.system_type = system_type;
        };

        $scope.getOrgs = function (val) {   
            return OrganizationFast.query({'search': val}).$promise.then(function (response) {
                return response.results;
            });
        };

        $scope.adminOrg = function(){
            $scope.loader = true;
            $http.get("/customer/organization/").then(function (response) {
                $scope.org = response.data.results[0];
                $scope.loader = false;
                $scope.getTickets($scope.org);
            },function (error) {
                $scope.loader = false;
                $scope.errorMsg = error.data;
            });
        };

        $scope.loadTicketsByType = function(){
            $scope.getTickets($scope.org);
        };

        $scope.getTickets = function (org) {
            $scope.request = null;
            $scope.comments = null;
            $scope.errorMsg = undefined;
            $scope.requests = [];
            $scope.loader = true;
            
            var params = {'org_id': org.id, 'sort_by': $scope.sort_by, 'page_no': $scope.page_no, 'ticket_type': $scope.ticket_type, 'system_type': $scope.system_type};
            $http.get("/rest/zendesk_ticket/org_tickets/", {"params":params}).then(function (response) {
                $scope.requests = response.data.result.results;
                $scope.requestCount = response.data.result.count;
                if ($scope.requests.length>0){
                    $scope.expandRequest($scope.requests[0], 0);    
                }
                if ($scope.requests.length===0){
                    $scope.errorMsg = 'No records found';    
                }

                $scope.setPagination();
                $scope.firstRecord = $scope.recordFirst;
                $scope.lastRecord = $scope.recordLast;
                $scope.loader = false;
            },function (error) {
                $scope.loader = false;
                $scope.errorMsg = error.data;
            });
        };

        $scope.setPageCounters = function(){
            if ($scope.requestCount<=($scope.pageSize*$scope.page_no)){
                $scope.recordLast = $scope.requestCount;
            }
            if ($scope.requestCount>=($scope.pageSize*$scope.page_no)){
                $scope.recordLast = $scope.recordFirst + ($scope.pageSize-1);
            }
        };

        $scope.prevPage = function () {
            console.log("prevPage");
            $scope.page_no = $scope.page_no - 1;
            $scope.getTickets($scope.org);
            $scope.recordFirst = $scope.recordFirst - $scope.pageSize;
            $scope.setPageCounters();
        };
    
        $scope.nextPage = function () {
            console.log("nextPage");
            $scope.page_no = $scope.page_no + 1;
            $scope.getTickets($scope.org);
            $scope.recordFirst = $scope.recordLast + 1;
            $scope.setPageCounters();
        };

        
        $scope.setPagination = function () {
            if ($scope.requests.length>0){
                if ($scope.page_no==1){
                    $scope.recordFirst = 1;
                    $scope.setPageCounters();
                    $scope.disablePrev = true;
                }
                if ($scope.page_no>1){
                    $scope.disablePrev = false;
                }
                if ($scope.requestCount<=($scope.pageSize*$scope.page_no)){
                    $scope.disableNext = true;
                }

                if ($scope.requestCount>=($scope.pageSize*$scope.page_no)){
                    $scope.disableNext = false;
                }
            }
        };

        $scope.currentPost = {
            body: null
        };

        $scope.promptRequest = function(){
            var modalInstance = $uibModal.open({
                templateUrl: 'createRequestModal.html',
                scope: $scope,
                size: 'md',
                controller: 'CreateRequestController'
            });
            modalInstance.result.then();
        };

        $scope.expandRequest = function (request, index) {
            $scope.selection.request = request;
            $scope.selection.index = index;
            $scope.loader = true;
            $http.get("/rest/zendesk_ticket/get_comments/", {"params": {"ticket_id": request.id}}).then(function (response) {
                $scope.request = request;
                TaskService.processTask(response.data.task_id, function (result) {
                    $scope.comments = result.comments; //updates everything
                    rebuild_users(result.users);
                    $scope.loader = false;
                }, function (error) {
                    $scope.error = true;
                    $scope.errorMsg = error.error + " " + error.message;
                    $scope.loader = false;
                });
            });
        };

        $scope.postComment = function (comment) {
            $scope.loader = true;
            $http.post("/rest/zendesk_ticket/post_comment/",
                {'ticket_id': $scope.request.id, 'body': comment}).then(function (response) {
                console.log("posted a comment");
                TaskService2.processTask(response.data.task_id).then(function (response) {
                    console.log(response);
                    $scope.expandRequest($scope.selection.request, $scope.selection.index);
                    $scope.loader = false;
                    // clear frontend
                    $scope.currentPost.body = null;
                }).catch(function (error) {
                    console.log(error);
                    $scope.loader = false;
                });
            });
        };
    }
]);

app.controller('TicketsDetailController2', [
    '$scope',
    '$http',
    function ($scope, $http) {
        $scope.postComment = function (comment) {
            $http.post($scope.org.url + "post_comment/", {
                'ticket_id': $scope.request.id,
                'body': comment
            }).then(function (response) {
                console.log("posted a comment");
            });
        };
    }
]);

/*
 * Admin Zendesk controller
 *
 * Used for linking ULDB organizations to Zendesk
 */
app.controller('ZendeskController', [
    '$scope',
    '$http',
    '$uibModal',
    'TicketOrg',
    'TicketUser',
    'AlertService2',
    'SearchService',
    'OrganizationFast',
    function ($scope, $http, $uibModal, TicketOrg, TicketUser, AlertService2, SearchService, OrganizationFast) {
        $scope.list_organizations = function () {
            var ticket_orgs = TicketOrg.query();
            ticket_orgs.$promise.then(function (response) {
                $scope.zendeskOrganizations = response.results;
            }).catch(function (error) {
                AlertService2.danger(error);
            });
        };
        $scope.list_organizations();
        var orgSearch = new SearchService(OrganizationFast);
        $scope.getOrgs = orgSearch.search;

        $scope.selected = {
            selection: null,
            index: null
        };

        $scope.selectedUser = {
            user: null,
            index: null
        };

        $scope.selectOrg = function (org, index) {
            $scope.selected.selection = org;
            $scope.selected.index = index;
        };

        $scope.isSelected = function (org) {
            return $scope.selected.selection === org;
        };

        $scope.show_delete_confirmation = function (zendesk_org) {
            $scope.zendesk_org = zendesk_org;
            var modalInstance = $uibModal.open({
                templateUrl: 'delete_confirmation_modal.html',
                scope: $scope,
                size: 'md',
                controller: 'TicketDeleteModalController'
            });
            modalInstance.result.then();
        };
        $scope.linkOrg = function () {
            $scope.org = '';
            $scope.zendesk_id = '';
            var modalInstance = $uibModal.open({
                templateUrl: 'ticketModal.html',
                scope: $scope,
                size: 'md',
                controller: 'TicketModalController'
            });
            modalInstance.result.then();
        };

        $scope.edit_linking = function (selected_org) {
            $scope.selected_org = selected_org;
            $scope.org = selected_org.organization;
            $scope.zendesk_id = selected_org.remote_id;
            var modalInstance = $uibModal.open({
                templateUrl: 'ticketModal.html',
                scope: $scope,
                size: 'md',
                controller: 'TicketEditModalController'
            });
            modalInstance.result.then();
        };

        $scope.linkUser = function (user, index) {
            $scope.selectedUser.user = user;
            $scope.selectedUser.index = index;
            var modalInstance = $uibModal.open({
                templateUrl: 'linkUserModal.html',
                scope: $scope,
                size: 'md',
                controller: 'LinkTicketUserController'
            });
            modalInstance.result.then();
        };

        $scope.unlinkUser = function (user, index) {
            // no modal necessary, send DELETE!! kill kill kill
            $http.delete(user.ticket_user.url).then(function (response) {
                // set the client side user to null
                user.ticket_user = null;
            }).catch(function (error) {
                AlertService2.danger(error);
            });
        };
    }
]);


app.controller('TicketModalController', [
    '$scope',
    '$uibModalInstance',
    'TicketOrg',
    'AlertService2',
    function ($scope, $uibModalInstance, TicketOrg, AlertService2) {
        $scope.save = function (org, zendesk_id) {
            // upsert new TicketOrg object
            var ticketOrg = new TicketOrg({remote_id: zendesk_id, organization: org});
            ticketOrg.$save().then(function (response) {
                $scope.zendeskOrganizations.push(response);
                AlertService2.success("Linked " + response.organization.name + " to " + response.remote_id);
            });
            $uibModalInstance.close();
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss();
        };
    }
]);

app.controller('TicketEditModalController', [
    '$scope',
    '$uibModalInstance',
    'TicketOrg',
    'AlertService2',
    function ($scope, $uibModalInstance, TicketOrg, AlertService2) {
        $scope.save = function (org, zendesk_id) {
            $scope.entry = TicketOrg.get({id: $scope.selected_org.id}, function () {
                $scope.entry.organization = org;
                $scope.entry.remote_id = zendesk_id;
                $scope.entry.$update(function (response) {
                    //updated in the backend
                    $scope.list_organizations();
                    AlertService2.success("Updated " + response.organization.name);
                });
            });
            $uibModalInstance.close();
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss();
        };
    }
]);

app.controller('TicketDeleteModalController', [
    '$scope',
    '$uibModalInstance',
    'TicketOrg',
    'AlertService2',
    function ($scope, $uibModalInstance, TicketOrg, AlertService2) {

        $scope.delete_organization = function () {
            console.log('inside delete');
            // var ticketOrg = TicketOrg({remote_id: zendesk_id, organization: org});
            $scope.entry = TicketOrg.get({id: $scope.zendesk_org.id}, function () {
                // $scope.entry is fetched from server and is an instance of Entry
                var index = $scope.zendeskOrganizations.indexOf($scope.zendesk_org);
                $scope.entry.$delete().then(function (response) {
                    //gone forever!
                    $scope.zendeskOrganizations.splice(index, 1);
                    AlertService2.success("Deleted " + response.organization.name);
                    $uibModalInstance.dismiss();
                });
            });
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss();
        };
    }
]);


app.controller('LinkTicketUserController', [
    '$scope',
    '$uibModalInstance',
    'TicketUser',
    'AlertService2',
    function ($scope, $uibModalInstance, TicketUser, AlertService2) {
        $scope.linkZendeskUser = function (remote_id) {
            console.log(remote_id);
            // create object with remote id
            var ticketUser = new TicketUser({remote_id: remote_id, user: $scope.selectedUser.user});
            ticketUser.$save().then(function (response) {
                console.log(response);
                $scope.selectedUser.user.ticket_user = {
                    url: response.url,
                    id: response.id,
                    remote_id: response.remote_id
                };
            });
            $uibModalInstance.close();
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss();
        };
    }
]);

app.controller('CreateRequestController', [
    '$scope',
    '$uibModalInstance',
    '$http',
    'TaskService2',
    'AlertService2',
    function ($scope, $uibModalInstance, $http, TaskService2, AlertService2) {
        $scope.create_request = {'subject': null, 'description': null, 'priority': null};

        $scope.createRequest = function (request) {
            if (request.subject==null || request.subject==''){
                $scope.createRequestError = 'Subject is mandatory';
                return 0;
            }
            if (request.priority == null || request.priority == ''){
                $scope.createRequestError = 'Priority is mandatory';
                return 0;
            }
            if (request.description==null || request.description==''){
                $scope.createRequestError = 'Description is mandatory';
                return 0;
            }

            $scope.loader = true;

            $http.post('/rest/zendesk_ticket/create_request/',
                {subject: request.subject, description: request.description, priority: request.priority, type: $scope.ticket_type}).then(function (response) {
                TaskService2.processTask(response.data.task_id).then(function (result) {
                    // update the client with the new model
                    $scope.loader = false;
                    $scope.requests[0] = result.request;
                    AlertService2.success("Ticket successfully created.");
                    $scope.expandRequest($scope.requests[0], 0);
                    $uibModalInstance.close(result);
                }).catch(function (error) {
                    $scope.loader = false;
                    console.log(error);
                    $uibModalInstance.close(error);
                });
            });
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss();
        };
    }
]);
