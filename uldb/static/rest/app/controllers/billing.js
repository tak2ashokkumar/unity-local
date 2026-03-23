/**
 * Created by rt on 8/31/16.
 */
var app = angular.module('uldb');

app.controller('SalesforceProduct2Controller', [
    '$scope',
    '$http',
    'AlertService2',
    function ($scope, $http, AlertService2) {
        $scope.title = {
            plural: "Salesforce Products",
            singular: "Salesforce Product"
        };

        $scope.model = {
            products: null
        };

        $scope.cols = [
            { name: 'Id' },
            { name: 'Name' },
            { name: 'ProductCode' },
            { name: 'CreatedById' },
            { name: 'IsActive' },
            { name: 'LastModifiedById' },
            { name: 'Description' }
        ];

        $scope.alertService = AlertService2;

        $http.get('/salesforce/products/').then(function (response) {
            $scope.model.products = response.data;
        }).catch(function (error) {
            AlertService2.danger("An error occurred while fetching Products. Please Contact Support.");
            $scope.model.products = [];
            console.log(error.data.message);
        });
    }
]);

app.controller('ServiceContractController', [
    '$scope',
    'ServiceContract',
    'AbstractControllerFactory2',
    'ULDBService2',
    function ($scope, ServiceContract, AbstractControllerFactory2, ULDBService2) {
        $scope.ctrl = AbstractControllerFactory2($scope, ULDBService2.serviceContract());
        $scope.fields = ULDBService2.serviceContract().fields();
    }
]);

app.controller('SalesforceOpportunityController', [
    '$scope',
    'SalesforceOpportunity',
    'AbstractControllerFactory2',
    'ULDBService2',
    function ($scope, SalesforceOpportunity, AbstractControllerFactory2, ULDBService2) {
        $scope.ctrl = AbstractControllerFactory2($scope, ULDBService2.sfOpportunity());
        $scope.fields = ULDBService2.sfOpportunity().fields();
    }
]);

app.controller('SalesforceOpportunityDetailController', [
    '$scope',
    '$http',
    '$routeParams',
    '$uibModal',
    'SalesforceOpportunity',
    'Invoice',
    'InvoiceService',
    'AbstractControllerFactory2',
    'ULDBService2',
    function ($scope, $http, $routeParams, $uibModal, SalesforceOpportunity, Invoice, InvoiceService, AbstractControllerFactory2, ULDBService2) {
        $scope.ctrl = AbstractControllerFactory2($scope, ULDBService2.invoice());
        $scope.fields = ULDBService2.invoice().fields();

        $scope.generateInvoice = function () {
            var modalInstance = $uibModal.open({
                templateUrl: 'invoiceModal.html',
                controller: 'GenerateInvoiceModalController',
                scope: $scope,
                size: 'md'
            });
            modalInstance.result.then(function () {

            });
        };

        $scope.selectInvoice = function (result, $index) {
            $scope.selection.index = $index;
            $scope.selection.selected = result;
        };

        $scope.exportInvoice = function () {
            var invoice = $scope.selection.selected;
            InvoiceService.generatePDF(invoice);
        };

        $scope.oppty = null;
        $scope.invoices = [];

        var oppty_id = $routeParams.id;
        SalesforceOpportunity.get({id: oppty_id}).$promise.then(function (response) {
            $scope.oppty = response;
            response.invoices.forEach(function (e, i, arr) {
                Invoice.get({id: e.id}).$promise.then(function (response) {
                    $scope.invoices.push(response);
                });
            });
        });
    }
]);

app.controller('SalesforceImportOpportunityController', [
    '$scope',
    '$http',
    '$uibModal',
    'Organization',
    'SalesforceOpportunity',
    'SearchService',
    'AlertService2',
    'FixtureService',
    function ($scope,
              $http,
              $uibModal,
              Organization,
              SalesforceOpportunity,
              SearchService,
              AlertService2,
              FixtureService) {
        $scope.alertService = AlertService2;
        $scope.model = {};

        $http.get('/salesforce/opportunities/').then(function (response) {
            // response.data
            $scope.model.opportunities = response.data;
            // AlertService2.success("fetched opportunities");
        }).catch(function (error) {
            AlertService2.danger("Error occurred while fetching Opportunities. Please contact Support");
            $scope.model.opportunities = [];
        });

        var unity_opportunities = [];
        SalesforceOpportunity.query().$promise.then(function (response) {
            unity_opportunities = response.results;
        });

        var orgSearch = new SearchService(Organization);
        $scope.getOrgs = orgSearch.search;
        var link_mapping = {};

        Organization.query().$promise.then(function (response) {
            response.results.forEach(function (e, i, arr) {
                if (e.salesforce_id !== null) {
                    link_mapping[e.salesforce_id] = e;
                }
            });
        });

        $scope.title = {
            singular: "Opportunity",
            plural: "Opportunities"
        };
        $scope.$root.title = $scope.title;
        $scope.sel = {};

        var inLinkMapping = function (oppty) {
            return (link_mapping.hasOwnProperty(oppty.AccountId));
        };

        var inUnityOpptys = function (oppty) {
            var exists = false;
            unity_opportunities.forEach(function (e, i, arr) {
                if (e.sfid == oppty.Id) {
                    exists = true;
                }
            });
            return exists;
        };

        var inSync = function (oppty) {
            var imported = inUnityOpptys(oppty);
            var linked = oppty.Unity_Linked__c;
            return imported && linked || !imported && !linked;
        };

        $scope.setOppty = function (oppty) {
            $scope.sel['oppty'] = oppty;
            $scope.sel['linked'] = inLinkMapping(oppty);
            $scope.sel['imported'] = inUnityOpptys(oppty);
            $scope.sel['org'] = link_mapping[oppty.AccountId];
            $scope.sel['synced'] = inSync(oppty);
        };

        $scope.linkAccount = function (oppty) {

            var modalInstance = $uibModal.open({
                templateUrl: 'salesforceLinkerModal.html',
                controller: 'SalesforceAccountLinkerModal',
                scope: $scope,
                size: 'md',
                resolve: {
                    salesforceId: function () {
                        return oppty.AccountId;
                    },
                    linkMapping: function () {
                        return link_mapping;
                    }
                }
            });
            modalInstance.result.then(function () {
                $scope.setOppty(oppty);
            });
        };

        $scope.unlinkAccount = function (oppty) {
            var uuid = link_mapping[oppty.AccountId];
            var sfid = oppty.AccountId;
            var org = Organization.get({uuid:uuid}).$promise.then(function (response) {
                if (response.results.length > 0) {
                    var obj = response.results[0];
                    obj.salesforce_id = null;
                    Organization.update(obj).$promise.then(function (response) {
                        delete link_mapping[sfid];
                        AlertService2.success("Unlinked " + sfid);
                        $scope.setOppty(oppty);
                    });
                }
            });
        };

        $scope.import = function (sel) {
            var oppty = sel.oppty;
            console.log(oppty);
            var sf_oppty = new SalesforceOpportunity({
                sfid: oppty.Id,
                customer: sel.org,
                account_name: oppty.Account.Name,
                email: oppty.Email__c,
                name: oppty.Name,
                owner_name: oppty.Owner.Name,
                stage_name: oppty.StageName,
                mrc: oppty.Monthly_Charges__c,
                nrc: oppty.NRR__c,
                committed_delivery_date: oppty.Committed_Delivery_Date__c,
                opportunity_line_items: oppty.OpportunityLineItems.records
            });
            sf_oppty.$save().then(function (response) {
                unity_opportunities.push(sf_oppty);
                sel['imported'] = inUnityOpptys(oppty);
                AlertService2.success("Opportunity imported");
                return $http.put('/salesforce/link_opportunity/', {'id': oppty.Id});
            }).then(function (response) {
                console.log(response);
            }).catch (function (error) {
                if (!inLinkMapping(oppty)) {
                    AlertService2.danger("Link Opportunity to Unity account before importing");
                }
                else {
                    AlertService2.danger("Import unsuccessful");
                }
                console.log(error);
            });
        };
    }
]);

app.controller('SalesforceAccountLinkerModal', [
    '$scope',
    '$uibModalInstance',
    'AlertService2',
    'salesforceId',
    'linkMapping',
    'Organization',
    function ($scope, $uibModalInstance, AlertService2, salesforceId, linkMapping, Organization) {
        $scope.salesforceId = salesforceId;

        $scope.link = function (obj) {
            // Sets the salesforce ID of an Organization to the one presented by the opportunity.
            obj['salesforce_id'] = $scope.salesforceId;
            console.log(obj);
            Organization.update(obj).$promise.then(function (response) {
                linkMapping[salesforceId] = response.uuid;
                $uibModalInstance.close();
                AlertService2.success("Linked " + obj['salesforce_id']);
            }).catch(function (error) {
                AlertService2.danger(error);
                $scope.cancel();
            });
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }
]);


app.controller('GenerateInvoiceModalController', [
    '$scope',
    '$uibModalInstance',
    'SalesforceOpportunity',
    'Invoice',
    'AlertService2',
    'SearchService',
    function ($scope,
              $uibModalInstance,
              SalesforceOpportunity,
              Invoice,
              AlertService2,
              SearchService) {
        //var sfOpptySearch = new SearchService(SalesforceOpportunity);
        //$scope.getOpptys = sfOpptySearch.search;
        $scope.generate = function (oppty, month, year) {
            var invoice = new Invoice({
                opportunity: oppty,
                billing_month: month,
                billing_year: year
            });
            invoice.$save().then(function (response) {
                AlertService2.success("added invoice!");
                // console.log(response);
                // console.log($scope.assets.invoices);
                // update parent list...
                console.log(response);
                if ($scope.assets) {
                    $scope.assets.invoices.push(response);
                }
                $scope.invoices.push(response);
                $uibModalInstance.close();
            });
        };
        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }
]);
