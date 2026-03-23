/**
 * Created by rt on 9/29/16.
 */
var app = angular.module('uldb');

app.controller('CustomerBillingController2', [
    '$scope',
    'CustomerInvoice',
    'CustomerSalesforceOpportunity',
    'InvoiceService',
    function ($scope, CustomerInvoice, CustomerSalesforceOpportunity, InvoiceService) {
        $scope.invoices = [];

        $scope.selectedInvoice = {
            selected: null,
            index: null
        };

        $scope.selectedOppty = {
            selected: null,
            index: null
        };

        $scope.selectInvoice = function (result, $index) {
            $scope.selectedInvoice.index = $index;
            $scope.selectedInvoice.selected = result;
        };

        $scope.selectOppty = function (result, $index) {
            $scope.selectedOppty.index = $index;
            $scope.selectedOppty.selected = result;
            $scope.invoices = $scope.selectedOppty.selected.invoices;
            if ($scope.invoices.length) {
                $scope.selectInvoice($scope.invoices[0], 0);
            }
            else {
                $scope.selectInvoice(null, null);
            }
        };

        $scope.exportInvoice = function () {
            var invoice = $scope.selectedInvoice.selected;
            InvoiceService.generatePDF(invoice);
        };

        CustomerSalesforceOpportunity.query().$promise.then(function (response) {
            $scope.opptys = response.results;
        });
        $scope.title = {
            singular: 'Billing',
            plural: 'Billing'
        };

        $scope.$root.title = $scope.title;
    }
]);
