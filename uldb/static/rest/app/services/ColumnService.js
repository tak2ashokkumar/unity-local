/**
 * Created by rt on 12/3/15.
 */

var app = angular.module('uldb');

app.factory('ColumnService', [
    'SearchService',
    'OrganizationFast',
    'LoadbalancerModel',
    'FirewallModel',
    'CabinetFast',
    'ServerManufacturer',
    function (SearchService, OrganizationFast, LoadbalancerModel, FirewallModel, CabinetFast, ServerManufacturer) {
        var orgSearch = new SearchService(OrganizationFast);
        var cabinetSearch = new SearchService(CabinetFast);

        var loadBalancerModelSearch = new SearchService(LoadbalancerModel);
        var firewallModelSearch = new SearchService(FirewallModel);

        var systemManufacturerSearch = new SearchService(ServerManufacturer);

        var _cols = {
            server: [
                { name: "system_name", description: "system_name", required: true },
                { name: "system_assettag", description: "system_assettag", required: true },
                { name: "system_manufacturer", description: "System Manufacturer", required: true,
                    opaque: 'stringTransform',
                    subfield: "name",
                    read: function (result) {
                        console.log(result.system_manufacturer);
                        if (result.system_manufacturer === undefined) {
                            return '';
                        }
                        return result.system_manufacturer.name;
                    },
                    render: systemManufacturerSearch.search
                },
                { name: "salesforce_id", description: "salesforce_id", required: true },
                {
                    name: "cabinet", description: "cabinet", required: true,
                    opaque: 'stringTransform',
                    subfield: "name",
                    read: function (result) {
                        if (result.cabinet === null || result.cabinet == undefined) {
                            return "";
                        }
                        return result.cabinet.name;
                    },
                    render: cabinetSearch.search
                },
                {
                    name: "customer", description: "Customer", required: true,
                    opaque: "link",
                    subfield: "organization_name",
                    read: function (result) {
                        if (result.customer != null && result.customer.hasOwnProperty("organization_name")) {
                            return {
                                url: "#/org/" + result.customer.id,
                                text: result.customer.organization_name
                            };
                        }
                        return "";
                    },
                    render: orgSearch.search
                },
                { name: "exists_in_database", description: "exists_in_database", required: false },
            ],
            switch: [
                { name: "name", description: "name", required: true },
                {
                    name: "switch_model", description: "switch_model", required: true,
                    opaque: true,
                    subfield: "model",
                    read: function (e) {
                        return e.switch_model;
                    },
                    //render: $scope.getSwitchModels
                },
                { name: "salesforce_id", description: "salesforce_id", required: true },
                {
                    name: "cabinet", description: "cabinet", required: true,
                    opaque: true,
                    subfield: "name",
                    read: function (result) {
                        if (result.cabinet === null) {
                            return "";
                        }
                        return result.cabinet;
                    },
                    //render: $scope.getCabs
                },
                {
                    name: "customer", description: "Customer", required: true,
                    opaque: "link",
                    subfield: "organization_name",
                    read: function (result) {
                        if (result.customer != null && result.customer.hasOwnProperty("organization_name")) {
                            return {
                                url: "#/org/" + result.customer.id,
                                text: result.customer.organization_name
                            };
                        }
                        return "";
                    },
                    render: orgSearch.search
                },
                { name: "serialnumber", description: "serialnumber", required: true },
                { name: "assettag", description: "assettag", required: true },
                { name: "ip_address", description: "ip_address", required: true },
                { name: "exists_in_database", description: "exists_in_database", required: false },

            ],
            pdu: [
                { name: "hostname", description: "hostname", required: true },
                { name: "assettag", description: "assettag", required: true },
                { name: "salesforce_id", description: "salesforce_id", required: true },
            ],
            cabinet: [
                { name: "name", description: "name", required: true },
                { name: "salesforce_id", description: "salesforce_id", required: true },
                {
                    name: "customer", description: "Customer", required: true,
                    opaque: "link",
                    subfield: "organization_name",
                    read: function (result) {
                        if (result.customer != null && result.customer.hasOwnProperty("organization_name")) {
                            return {
                                url: "#/org/" + result.customer.id,
                                text: result.customer.organization_name
                            };
                        }
                        return "";
                    },
                    render: orgSearch.search
                },
            ],
            firewall: [
                {
                    name: "name", description: "Name", required: true,
                    opaque: "link",
                    read: function (result) {
                        return {
                            url: "#/firewall/" + result.id,
                            text: result.name
                        };
                    }
                },
                { name: "serialnumber", description: "Serial number", required: true },
                {
                    name: "firewall_model", description: "Model", required: true,
                    opaque: 'stringTransform',
                    subfield: "model",
                    read: function (result) {
                        if (result.firewall_model === null || result.firewall_model === undefined) {
                            return "";
                        }
                        return result.firewall_model.model;
                    },
                    render: firewallModelSearch.search
                },
                { name: "assettag", description: "Asset Tag", required: true },
                { name: "private_ipaddress", description: "Private IP address", required: true },
                { name: "public_ipaddress", description: "Public IP address", required: true },
                {
                    name: "cabinet", description: "cabinet", required: true,
                    opaque: 'stringTransform',
                    subfield: "name",
                    read: function (result) {
                        if (result.cabinet === null || result.cabinet == undefined) {
                            return "";
                        }
                        return result.cabinet.name;
                    },
                    render: cabinetSearch.search
                },
                {
                    name: "customer", description: "Customer", required: true,
                    opaque: "link",
                    subfield: "organization_name",
                    read: function (result) {
                        if (result.customer != null && result.customer.hasOwnProperty("organization_name")) {
                            return {
                                url: "#/org/" + result.customer.id,
                                text: result.customer.organization_name
                            };
                        }
                        return "";
                    },
                    render: orgSearch.search
                },
                { name: "salesforce_id", description: "salesforce_id", required: true }
            ],
            loadbalancer: [
                { name: "name", description: "name", required: true },
                { name: "assettag", description: "asset Tag", required: true },
                { name: "serialnumber", description: "serial number", required: true },
                { name: "manufacturer", description: "manufacturer", required: true },
                { name: "model_number", description: "model", required: true },
                { name: "cabinet_name", description: "cab", required: true },
                { name: "organization_name", description: "org", required: true },
                { name: "salesforce_id", description: "salesforce_id", required: true },
                { name: "exists_in_database", description: "exists_in_database", required: false },
                {
                    name: "loadbalancer_model", description: "Model", required: true,
                    opaque: true,
                    subfield: "model",
                    render: loadBalancerModelSearch.search
                },
                {
                    name: "customer", description: "Customer", required: true,
                    opaque: true,
                    subfield: "organization_name",
                    read: function (result) {
                        return result.customer.organization_name;
                    },
                    render: orgSearch.search
                }
            ]
        };

        var _salesforce_cols = {
            server: [
                { name: 'system_name', description: 'name', required: true },
                { name: 'system_assettag', description: 'asset tag', required: true },
                { name: 'system_manufacturer_name', description: 'Manufacturer', required: true },
                { name: 'serialnumber', description: 'serialnumber', required: true },
                { name: 'model_number', description: 'model_number', required: true },
                { name: 'cabinet_name', description: 'cabinet_name', required: true },
                { name: 'organization_name', description: 'organization_name', required: true },
                { name: 'salesforce_id', description: 'salesforce_id', required: true },
            ],
            switch: [
                { name: 'name', description: 'name', required: true },
                { name: 'assettag', description: 'asset tag', required: true },
                { name: 'serialnumber', description: 'serialnumber', required: true },
                { name: 'manufacturer', description: 'Manufacturer', required: true },
                { name: 'switch_model', description: 'model_number', required: true },
                { name: 'cabinet_name', description: 'cabinet_name', required: true },
                { name: 'organization_name', description: 'organization_name', required: true },
                { name: 'salesforce_id', description: 'salesforce_id', required: true },
                { name: 'exists_in_database', description: 'exists_in_database', required: true },
            ],
            pdu: [],
            cabinet: [
                { name: 'name', description: 'name', required: true },
                { name: 'exists_in_database', description: 'exists_in_database', required: true },
            ],
            firewall: [
                { name: 'name', description: 'name', required: true },
                { name: 'assettag', description: 'asset tag', required: true },
                { name: 'serialnumber', description: 'serialnumber', required: true },
                { name: 'manufacturer', description: 'Manufacturer', required: true },
                { name: 'model_number', description: 'model_number', required: true },
                { name: 'cabinet_name', description: 'cabinet_name', required: true },
                { name: 'organization_name', description: 'organization_name', required: true },
                { name: 'salesforce_id', description: 'salesforce_id', required: true },
            ],
            loadbalancer: [
                { name: 'name', description: 'name', required: true },
                { name: 'assettag', description: 'asset tag', required: true },
                { name: 'serialnumber', description: 'serialnumber', required: true },
                { name: 'manufacturer', description: 'Manufacturer', required: true },
                { name: 'model_number', description: 'model_number', required: true },
                { name: 'cabinet_name', description: 'cabinet_name', required: true },
                { name: 'organization_name', description: 'organization_name', required: true },
                { name: 'salesforce_id', description: 'salesforce_id', required: true },
            ]
        };

        var getColumns = function (objectClass) {
            return _cols[objectClass];
        };

        var getSalesforceColumns = function (objectClass) {
            return _salesforce_cols[objectClass];
        };

        return {
            column: getColumns,
            salesforceColumns: getSalesforceColumns
        };
    }
]);
