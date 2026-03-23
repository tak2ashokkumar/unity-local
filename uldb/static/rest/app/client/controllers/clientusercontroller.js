var app = angular.module('uldb');

app.controller('ClientUserController', [
    '$http',
    '$scope',
    '$rootScope',
    '$location',
    '$uibModal',
    'AbstractControllerFactory2',
    'AlertService2',
    'TaskService2',
    'CustomerULDBService',
    function ($http, $scope, $rootScope, $location, $uibModal, AbstractControllerFactory2, AlertService2, TaskService2, CustomerULDBService) {
        // $http.get('http://httpbin.org/delay/3');
        $scope.ctrl = AbstractControllerFactory2($scope, CustomerULDBService.organization_users(), $rootScope.configObject);

        $scope.title = {
            singular: 'User',
            plural: 'Users'
        };
        $scope.searchKeyword = '';

        $scope.can_delete = false;
        $scope.disable_actions = false;
        $scope.disable_action_btn = false;
        $scope.disable_edit = true;
        $scope.toState = 'Activate';

        if (!$rootScope.is_user_customer_admin){
            $scope.disable_action_btn = true;
            $scope.can_delete = false;
            $scope.disable_actions = true;
            $scope.disbaleTooltipMsg = 'Add user option is only available to Administrators.';
        }
        $scope.rows = [
            {name: "is_active", description: "Is Active", required: true, ischeck: true, checkvalue: "Active"},
            {name: "is_staff", description: "Is Staff", required: true, ischeck: true, checkvalue: "Staff"},
            {name: "first_name", description: "First Name", required: true},
            {name: "last_name", description: "Last Name", required: true},
            {name: "salesforce_id", description: "Salesforce ID", required: false},
            {
                name: "org", description: "Organization", required: true,
                opaque: true,
                subfield: "name",
                read: function (result) {
                    if (result.org && result.org.name) {
                        return result.org.name;
                    }
                    else if (result.org !== null) {
                        return result.org;
                    }
                    else {
                        return "";
                    }
                },
                edit: function (result) {
                    if (!('url' in result)) {
                        return null;
                    }
                    return $scope.customers.find(function (e, i, arr) {
                        return e.id == result.id;
                    });
                },
                render: $scope.getOrgs
            },
        ];

        $scope.loadPageData = function () {
            if (angular.isDefined($scope.model.currentPage) && angular.isDefined($scope.model.count) && angular.isDefined($rootScope.configObject.page_size)) {
                if (($scope.model.currentPage * $rootScope.configObject.page_size) < $scope.model.count) {
                    $scope.model.currentPage = $scope.model.currentPage + 1;
                    $scope.pageChanged();
                }
            }
        };

        $scope.activate_deactivate_user = true;
        $scope.reset_password_option = true;

        $scope.changeUserPasswordConfirmation = function(result) {
            $scope.confirmationMessage = "This action will disable the old password." +
                                         " A link for setting a new password will be sent to the user's registered email address." +
                                         " Are you sure to continue?";

            modalInstance = $uibModal.open({
                templateUrl: 'statusChangeConfirmation.html',
                scope: $scope,
                size: 'md'
            });
            $scope.confirm = function() {
                $scope.reset_password(result);
                $scope.cancel();
            };
        };

        $scope.changeUserStateConfirmation = function(result, index) {
            if(result.is_active === true){
                $scope.toState = 'Deactivate';
            }
            else {
                $scope.toState = 'Activate';
            }
            $scope.confirmationMessage = "Are you sure to " + $scope.toState + " this user?";
            modalInstance = $uibModal.open({
                templateUrl: 'statusChangeConfirmation.html',
                scope: $scope,
                size: 'md'
            });
            $scope.confirm = function() {
                $scope.manage_user(result, index);
                $scope.cancel();
            };
        };

        $scope.reset_password = function(result){
            var data = result;
            $scope.loader = true;
            $http.post('/customer/uldbusers/send_password_reset_link/', data).then(function (response) {
                console.log("response" + angular.toJson(response.data));
                result.password_reset_link_pending = true;
                AlertService2.success("Password reset link sent successfully.");
                $scope.loader = false;
            }).catch(function (error) {
                AlertService2.danger(error.message);
                $scope.loader = false;
            });
        };

        $scope.manage_user = function(result, index){
            var active = true;
            if(result.is_active === true){
                active = false;
            }
            var data = angular.extend({}, result, {is_active: active});
            $http.put(result.url, data).then(function (response) {
                console.log("response" + angular.toJson(response.data));
                result.is_active = response.data.is_active;
                AlertService2.success("Updated User successfully");
            }).catch(function (error) {
                AlertService2.danger(error.message);
            });
        };

        var modalInstance = {};
        $scope.userObj = {};

        $scope.invokeCreateUserRequestModel = function () {
            modalInstance = $uibModal.open({
                templateUrl: 'userCreateRequest.html',
                scope: $scope,
                size: 'md'
            });
            modalInstance.result.then(function (result) {
                console.log('result : ', angular.toJson(result));
            });
        };

        $scope.cancel = function () {
            modalInstance.dismiss('cancel');
        };

        $scope.createRequest = function () {
            $scope.request = {};
            $scope.request.subject = '[Unity]  Request to Create User';

            $scope.request.description = (
                'Support Team,' +
                '\n \n Request you to create user in Unity for following details :' +
                '\n Email : ' + $scope.userObj.email +
                '\n First Name : ' + $scope.userObj.firstname +
                '\n Last Name : ' + $scope.userObj.lastname +
                '\n Administrator? : ' + $scope.userObj.is_customer_admin +
                "\n \n ===============\n" +
                $rootScope.userEmail + "\n" +
                $location.absUrl() + "\n" +
                navigator.userAgent + "\n" +
                new Date().toString() + "\n" +
                "===============\n"

            );


            $http.post("/customer/ticketorganization/create_unity_problem_request/",
                {subject: $scope.request.subject, description: $scope.request.description}).then(function (response) {
                TaskService2.processTask(response.data.task_id).then(function (result) {
                    modalInstance.close(result);
                    AlertService2.success("New User request accepted. Unity Support will contact you soon.");
                }).catch(function (error) {
                    modalInstance.close(error);
                    AlertService2.danger("Error while creating ticket.");
                });
            });
        };

        $scope.checkUserDetails = function () {
            var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            console.log('email : ', re.test($scope.userObj.email));
            if (!re.test($scope.userObj.email)) {
                $scope.userObj.email_err_msg = 'Enter a valid email address';
                return;
            }
            $scope.createRequest();
        };
    }
]);

app.controller('ClientUserDetailController', [
    '$scope',
    '$routeParams',
    '$http',
    'CustomerOrganization',
    'AlertService2',
    '$uibModal',
    '$location',
    'BreadCrumbService',
    'SearchService',
    'User',
    function ($scope, $routeParams, $http, CustomerOrganization, AlertService2, $uibModal,
              $location, BreadCrumbService, SearchService, User) {
        $scope.alertService = AlertService2;
        $scope.getOrgs = new SearchService(CustomerOrganization).search;
        var resourceClass = CustomerOrganization;
        var id = $routeParams.id;
        $scope.bread = BreadCrumbService;
        $scope.$on('$destroy', function () {
            $scope.bread.pushIfTop({name: "User Detail", url: '#/user/' + id}, $scope);
        });

        var fetched = resourceClass.get({id: id}).$promise;

        fetched.then(function (response) {
            $scope.result = response;
            $http.get($scope.result.url + "get_audit_data/").then(function (response) {
                $scope.audit_data = response.data;
            });
        });

        // AccessType.query().$promise.then(function (response) {
        //     $scope.accessTypes = response.results;
        // }).catch(function (error) {
        //     AlertService2.danger(error);
        // });


        $scope.getLastInvite = function () {
            if ('result' in $scope) {
                var invs = $scope.result.invitations.length;
                if (invs > 0) {
                    return $scope.result.invitations[invs - 1];
                }
            }
            return null;
        };

        $scope.checkPending = function () {
            // Check each item to see if there's still an invitation waiting.
            if ('result' in $scope) {
                return $scope.result.invitations.find(function (e, i, arr) {
                    return e.pending === true;
                });
            }
        };

        $scope.sendEmailInvitation = function (user) {
            $http.post(user.url + "send_email_invitation/").then(function (response) {
                AlertService2.success("Invitation email sent to " + user.email);
                $scope.result.invitations = response.data.invitations;
            }).catch(function (error) {
                AlertService2.danger("Could not send email.  Check server logs for more details.");
            });
        };

        $scope.changeAccess = function () {
            $scope.obj = angular.copy($scope.result);
            var modalInstance = $uibModal.open({
                templateUrl: 'userAccessControl.html',
                controller: 'UserAccessControlModal',
                scope: $scope,
                size: 'md'
            });
            modalInstance.result.then();
        };

        $scope.changeDetails = function () {
            $scope.obj = angular.copy($scope.result);
            var modalInstance = $uibModal.open({
                templateUrl: 'userDetails.html',
                controller: 'UserAccessControlModal',
                scope: $scope,
                size: 'md'
            });
            modalInstance.result.then();
        };

        $scope.deleteUser = function (user) {
            return $http.delete(user.url).then(function (response) {
                AlertService2.success("Deleted " + user.email);
                $location.path("/user");
            }).catch(function (response) {
                AlertService2.danger("Could not delete " + user.email);
            });
        };

        var user_active = function (is_active) {
            return User.update(angular.extend({}, $scope.result, {is_active: is_active})).$promise.then(function (response) {
                console.log(response);
                angular.extend($scope.result, response);
            }).catch(function (error) {
                AlertService2.danger(error);
            });
        };

        $scope.disableUser = function () {
            return user_active(false);
        };

        $scope.enableUser = function () {
            return user_active(true);
        };

        $scope.rescindInvitation = function (invite) {
            $http.post(invite.url + 'rescind/').then(function (response) {
                angular.extend(invite, response.data);
                AlertService2.success("Updated invitation.");
            });
        };
    }
]);
