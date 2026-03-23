var app = angular.module('uldb');

app.controller('SalesforceController', [
    '$scope',
    '$http',
    '$q',
    '$uibModal',
    'Server',
    'Switch',
    'PDU',
    'Cabinet',
    'LoadBalancer',
    'Firewall',
    'SwitchModelFast',
    'CabinetFast',
    'SearchService',
    'AlertService2',
    'OrganizationFast',
    'Organization',
    'ColumnService',
    function ($scope,
              $http,
              $q,
              $uibModal,
              Server,
              Switch,
              PDU,
              Cabinet,
              LoadBalancer,
              Firewall,
              SwitchModelFast,
              CabinetFast,
              SearchService,
              AlertService2,
              OrganizationFast,
              Organization,
              ColumnService) {
        $scope.switchmodels = [];

        var orgSearch = new SearchService(OrganizationFast);
        $scope.getOrgs = orgSearch.search;


        SwitchModelFast.query({ page_size: 9000 }).$promise.then(function (success) {
            $scope.switchmodels.push.apply($scope.switchmodels, success.results);
        }).catch(function (error) {
            console.log(error);
        });
        $scope.alertService = AlertService2;
        $scope.cabinets = [];
        CabinetFast.query({ page_size: 9000 }).$promise.then(function (success) {
            $scope.cabinets.push.apply($scope.cabinets, success.results);
        }).catch(function (error) {
            console.log(error);
        });
        var cabSearch = new SearchService(CabinetFast);
        $scope.getCabs = cabSearch.search;
        var switchModelSearch = new SearchService(SwitchModelFast);
        $scope.getSwitchModels = switchModelSearch.search;

        $scope.results = [];
        $scope.rows = [];

        var switch_rows = ColumnService.column('switch');
        var server_rows = ColumnService.column('server');
        var pdu_rows = ColumnService.column('pdu');
        var cabinet_rows = ColumnService.column('cabinet');

        $scope.loadServers = function () {
            $http.get('/salesforce/servers').then(function (success) {
                $scope.results = success.data;
                $scope.errorAuditing = false;

                $scope.rows = server_rows;
                $scope.endpoint = '/rest/server/import_from_salesforce/';
            }).catch(function (error) {
                console.log(error);
            });
        };

        $scope.loadSwitches = function () {
            $http.get("/salesforce/switches").then(function (success) {
                $scope.results = success.data;
                $scope.errorAuditing = false;
                $scope.rows = switch_rows;
                $scope.endpoint = "/rest/switch/";
            }).catch(function (error) {
                console.log(error);
            });
        };

        $scope.loadPdus = function () {
            $http.get("/salesforce/pdus/").then(function (success) {
                $scope.results = success.data;
                $scope.errorAuditing = false;
                $scope.rows = pdu_rows;
                $scope.endpoint = "/rest/pdu/";
            }).catch(function (error) {
                console.log(error);
            });
        };

        $scope.salesforceErrors = function (key) {
            $http.get("/salesforce/errors/").then(function (response) {
                $scope.results = response.data[key];
                $scope.errorAuditing = true;
                if (key === 'servers') {
                    $scope.rows = server_rows;
                    $scope.subfield = "server_name";
                    $scope.endpoint = "/rest/server/";
                } else if (key === 'switches') {
                    $scope.rows = switch_rows;
                    $scope.subfield = "name";
                    $scope.endpoint = "/rest/switch/";
                } else if (key === 'pdus') {
                    $scope.rows = pdu_rows;
                    $scope.subfield = "name";
                    $scope.endpoint = "/rest/pdu/";
                } else if (key === 'cabinets') {
                    $scope.rows = cabinet_rows;
                    $scope.subfield = "name";
                    $scope.endpoint = "/rest/cabinet/";
                }
            });
        };

        $scope.counts = function () {
            $scope.countsCalculated = true;
            var thingsToCount = [
                {
                    name: "servers",
                    resource: Server,
                    uldb_count: null,
                    sf_count: 0
                },
                {
                    name: "switches",
                    resource: Switch,
                    uldb_count: null,
                    sf_count: 0
                },
                {
                    name: "pdus",
                    resource: PDU,
                    uldb_count: null,
                    sf_count: 0
                }
            ];

            var sf_counts = $http.get("/salesforce/counts/");
            console.log(sf_counts);

            $scope.countTable = thingsToCount.map(function (e, i, arr) {
                e.resource.query().$promise.then(function (response) {
                    e.uldb_count = response.count;
                    e.sf_count = sf_counts.then(function (response) {
                        e.sf_count = response.data[e.name];
                    });
                });
                return e;
            });
        };

        var updateServers = function (orgs) {
            var sf_servers = {};
            var sf = $http.get("/salesforce/servers").then(function (response) {
                response.data.forEach(function (e, i, arr) {
                    sf_servers[e.system_name] = e;
                });
            });

            var orgs = {};
            var django = Organization.query({ page_size: 9000 }).$promise.then(function (response) {
                response.results.forEach(function (e, i, arr) {
                    orgs[e.organization_name] = e;
                });
            });

            $q.all([sf, django]).then(function () {
                var updated = [];
                var promises = [];
                var curr_servers = null;
                Server.query({ page_size: 9000 }).$promise.then(function (response) {
                    curr_servers = response.results;
                    curr_servers.forEach(function (e, i, r) {
                        if (e.system_name in sf_servers) {
                            e.salesforce_id = sf_servers[e.system_name].salesforce_id;
                            var org_name = sf_servers[e.system_name].organization_name;
                            if (org_name in orgs) {
                                e.customer = orgs[org_name].url;
                            } else {
                                e.customer = orgs['UnitedLayer'].url;
                            }
                            promises.push(Server.update(e).$promise.then(function (response) {
                                console.log(response);
                                updated.push(e);
                            }));
                        }
                    });
                    $q.all(promises).then(function () {
                        AlertService2.success("updated: " + updated.length + " servers");
                    });
                });
            });
        };


        var updateCabinets = function (orgs) {
            var sf_servers = {};
            var sf = $http.get("/salesforce/servers").then(function (response) {
                response.data.forEach(function (e, i, arr) {
                    sf_servers[e.system_name] = e;
                });
            });
            var django = Organization.query({ page_size: 9000 }).$promise.then(function (response) {
                response.results.forEach(function (e, i, arr) {
                    orgs[e.organization_name] = e;
                });
            });

            $q.all([sf, django]).then(function () {
                var updated = [];
                var promises = [];
                var curr_servers = null;
                Server.query({ page_size: 9000 }).$promise.then(function (response) {
                    curr_servers = response.results;
                    curr_servers.forEach(function (e, i, r) {
                        if (e.system_name in sf_servers) {
                            e.salesforce_id = sf_servers[e.system_name].salesforce_id;
                            var org_name = sf_servers[e.system_name].organization_name;
                            if (org_name in orgs) {
                                e.customer = orgs[org_name].url;
                            } else {
                                e.customer = orgs['UnitedLayer'].url;
                            }
                            promises.push(Server.update(e).$promise.then(function (response) {
                                console.log(response);
                                updated.push(e);
                            }));
                        }
                    });
                    $q.all(promises).then(function () {
                        AlertService2.success("updated: " + updated.length + " servers");
                    });
                });
            });
        };

        $scope.updateSfid = function (key) {
            var orgs = {};
            var django = Organization.query({ page_size: 9000 }).$promise.then(function (response) {
                response.results.forEach(function (e, i, arr) {
                    orgs[e.organization_name] = e;
                });
            });

            if (key == 'servers') {
                return updateServers(orgs);
            } else if (key == 'cabinets') {
                return updateCabinets(orgs);
            }
        };

        $scope.bulkImport = function (key) {
            $http.post("/rest/" + key + "/bulk_import_from_salesforce/").then(function (response) {
                console.log(response);
            });
        };

        $scope.fixId = function (result, idx) {
            $http.post($scope.endpoint + result.id + "/fix_salesforce_id/").then(function (response) {
                console.log(response);
                AlertService2.success("altered " + result[$scope.subfield] + "'s sfid to: " + response.data.salesforce_id);
                $scope.results.splice(idx, 1);
            });
        };

        $scope.add = function (obj, idx) {
            $http.post($scope.endpoint, obj).then(function (success) {
                console.log(success);
                $scope.results.splice(idx, 1);
            }).catch(function (error) {
                console.log(error);
            });
        };

        $scope.resourceClass = Switch;
        $scope.review = function (obj, idx) {
            // open a modal and allow the user to correct certain fields
            $scope.modal = {
                templateUrl: 'salesforceModal.html',
                scope: $scope,
                size: 'md',
                controller: 'SalesforceSwitchModal'
            };
            $scope.method = 'Add';

            $scope.obj = JSON.parse(JSON.stringify(obj));
            // update object with details from the database
            $scope.obj.cabinet = $scope.cabinets.find(function (e, i, arr) {
                return e.name == obj.cabinet;
            });
            $scope.obj.switch_model = $scope.switchmodels.find(function (e, i, arr) {
                return e.model = obj.switch_model;
            });
            var modalInstance = $uibModal.open($scope.modal);
            modalInstance.result.then();
        };
    }
]);

app.controller('SalesforceCompletenessController', [
    '$scope',
    '$http',
    '$uibModal',

    'SearchService',
    'ColumnService',
    'OrganizationFast',

    'Server',
    'Switch',
    'PDU',
    'Cabinet',
    'LoadBalancer',
    'Firewall',

    'FirewallModel',
    'CabinetFast',
    'ServerManufacturer',
    'SwitchModel',
    function ($scope, $http, $uibModal,
              SearchService, ColumnService, OrganizationFast,
              Server, Switch, PDU, Cabinet, LoadBalancer, Firewall,
              FirewallModel, CabinetFast, ServerManufacturer, SwitchModel) {
        var orgSearch = new SearchService(OrganizationFast);
        $scope.getOrgs = orgSearch.search;

        $scope.completeness = function (obj) {
            // probably should move these into a service
            var thingsToCount = [
                {
                    name: "servers",
                    resource: Server,
                    uldb_count: null,
                    sf_count: null
                },
                {
                    name: "switches",
                    resource: Switch,
                    uldb_count: null,
                    sf_count: null
                },
                {
                    name: "pdus",
                    resource: PDU,
                    uldb_count: null,
                    sf_count: null
                },
                {
                    name: "cabinets",
                    resource: Cabinet,
                    uldb_count: null,
                    sf_count: null
                },
                {
                    name: "loadbalancers",
                    resource: LoadBalancer,
                    uldb_count: null,
                    sf_count: null
                },
                {
                    name: "firewalls",
                    resource: Firewall,
                    uldb_count: null,
                    sf_count: null
                }
            ];

            var django = $http.get("/rest/org/" + obj.id + "/completeness/");
            var sf = $http.get("/salesforce/organization_salesforce_counts/?org=" + obj.organization_name);

            $scope.orgCountTable = thingsToCount.map(function (e, i, arr) {
                django.then(function (response) {
                    if (e.name in response.data) {
                        e.uldb_count = response.data[e.name];
                    }
                });
                sf.then(function (response) {
                    if (e.name in response.data) {
                        e.sf_count = response.data[e.name];
                    }
                });
                return e;
            });

        };

        $scope.select = function (result, index) {
            $scope.selection = {
                result: result,
                index: index
            };
        };

        $scope.inventoryDiff = function (inventoryType, org) {
            var sfUri = "/salesforce/" + inventoryType.name + "/";
            switch (inventoryType.name) {
                case 'servers':
                    $scope.rows = ColumnService.column('server');
                    $scope.salesforceRows = ColumnService.salesforceColumns('server');
                    $scope.endpoint = "/rest/server/";
                    $scope.resourceClass = Server;
                    break;
                case 'switches':
                    $scope.rows = ColumnService.column('switch');
                    $scope.salesforceRows = ColumnService.salesforceColumns('switch');
                    $scope.resourceClass = Switch;
                    break;
                case 'pdus':
                    $scope.rows = ColumnService.column('pdu');
                    $scope.salesforceRows = ColumnService.salesforceColumns('pdu');
                    $scope.resourceClass = PDU;
                    break;
                case 'cabinets':
                    $scope.rows = ColumnService.column('cabinet');
                    $scope.salesforceRows = ColumnService.salesforceColumns('cabinet');
                    $scope.resourceClass = Cabinet;
                    break;
                case 'loadbalancers':
                    $scope.rows = ColumnService.column('loadbalancer');
                    $scope.salesforceRows = ColumnService.salesforceColumns('loadbalancer');
                    $scope.resourceClass = LoadBalancer;
                    break;
                case 'firewalls':
                    $scope.rows = ColumnService.column('firewall');
                    $scope.salesforceRows = ColumnService.salesforceColumns('firewall');
                    $scope.resourceClass = Firewall;
                    break;
                default:
                    break;
            }
            $scope.uldbOnly = [];
            $scope.salesforceOnly = [];
            $scope.both = [];
            var sfid_registry = {};
            var django = $http.get("/rest/org/" + org.id + "/get_related/", { params: { related_type: inventoryType.name } });
            var sf = $http.get(sfUri, { params: { org: org.organization_name } });
            django.then(function (response) {
                $scope.uldbOnly = response.data;
                $scope.uldbOnly.forEach(function (e, i, arr) {
                    if ('salesforce_id' in e) {
                        sfid_registry[e.salesforce_id] = i;
                    }
                });
                console.log(sfid_registry);
            }).then(sf.then(function (response) {
                var salesforceOnly = response.data;
                salesforceOnly.forEach(function (e, i, arr) {
                    if (e.salesforce_id in sfid_registry) {
                        $scope.both.push(e);
                        $scope.uldbOnly.splice($scope.uldbOnly.findIndex(function (ee, i, arr) {
                            return 'salesforce_id' in ee && ee.salesforce_id == e.salesforce_id;
                        }), 1);
                    } else {
                        $scope.salesforceOnly.push(e);
                    }
                });
            }));

            $scope.diffed = true;
        };

        $scope.review = function (obj, idx) {
            // open a modal and allow the user to correct certain fields
            $scope.select(obj, idx);
            $scope.modal = {
                templateUrl: 'salesforceModal.html',
                scope: $scope,
                size: 'md',
                controller: 'SalesforceImportModal'
            };
            $scope.method = 'Add';
            $scope.reviewed_idx = idx;

            $scope.obj = JSON.parse(JSON.stringify(obj));
            console.log($scope.resourceClass);
            switch ($scope.resourceClass.reflect.resourceName) {
                case 'Server':
                    var orgs = OrganizationFast.query({ search: $scope.obj.organization_name });
                    orgs.$promise.then(function (response) {
                        if (response.results.length > 0) {
                            $scope.obj.customer = response.results[0];
                        }
                    });
                    var cab = CabinetFast.query({ search: $scope.obj.cabinet_name });
                    cab.$promise.then(function (response) {
                        if (response.results.length > 0) {
                            $scope.obj.cabinet = response.results[0];
                        }
                    });
                    var manufacturers = ServerManufacturer.query({ search: $scope.obj.system_manufacturer_name });
                    manufacturers.$promise.then(function (response) {
                        if (response.results.length > 0) {
                            $scope.obj.system_manufacturer = response.results[0];
                        }
                    });
                    break;
                case 'Switch':
                    var orgs = OrganizationFast.query({ search: $scope.obj.organization_name });
                    orgs.$promise.then(function (response) {
                        if (response.results.length > 0) {
                            $scope.obj.customer = response.results[0];
                        }
                    });
                    var model = SwitchModel.query({ search: $scope.obj.switch_model });
                    model.$promise.then(function (response) {
                        console.log(response);
                        if (response.results.length > 0) {
                            $scope.obj.switch_model = response.results[0];
                        }
                    });
                    var cab = CabinetFast.query({ search: $scope.obj.cabinet_name });
                    cab.$promise.then(function (response) {
                        if (response.results.length > 0) {
                            console.log(response);
                            $scope.obj.cabinet = response.results[0];
                        }
                    });
                    break;
                case 'Firewall':
                    // needs customer, model, cabinet
                    var orgs = OrganizationFast.query({ search: $scope.obj.organization_name });
                    var model = FirewallModel.query({ search: $scope.obj.model_number });
                    var cab = CabinetFast.query({ search: $scope.obj.cabinet_name });
                    orgs.$promise.then(function (response) {
                        if (response.results.length > 0) {
                            $scope.obj.customer = response.results[0];
                        }
                    });
                    model.$promise.then(function (response) {
                        if (response.results.length > 0) {
                            $scope.obj.firewall_model = response.results[0];
                        }
                    });
                    cab.$promise.then(function (response) {
                        if (response.results.length > 0) {
                            console.log(response);
                            $scope.obj.cabinet = response.results[0];
                        }
                    });
                    break;
                default:
                    console.log('default');
                    break;
            }
            var modalInstance = $uibModal.open($scope.modal);
            modalInstance.result.then();
        };

        $scope.match = function (obj, idx) {
            $scope.select(obj, idx);
            $scope.modal = {
                templateUrl: 'updateExisting.html',
                scope: $scope,
                size: 'lg',
                controller: 'SalesforceImportModal'
            };
            $scope.method = 'Edit';
            $scope.matchingObj = JSON.parse(JSON.stringify(obj));

            $scope.resourceClass.query({ search: obj.name }).$promise.then(function (response) {
                if (response.results.length > 0) {
                    $scope.obj = response.results[0];
                }
            });

            var modalInstance = $uibModal.open($scope.modal);
            modalInstance.result.then();
        };

        $scope.unassign = function (obj, idx) {
            console.log(obj);
            obj.customer = null;
            console.log($scope.resourceClass.reflect.resourceName);
            $scope.resourceClass.update(obj);
        };
    }
]);

app.controller('SalesforceSwitchModal', [
    '$scope',
    '$uibModalInstance',
    'AbstractModalFactory',
    function ($scope, $uibModalInstance, AbstractModalFactory) {
        var modal = new AbstractModalFactory($scope.resourceClass, $scope, $uibModalInstance, "name");
        $scope.add = modal.add;
        $scope.edit = modal.edit;
        $scope.cancel = modal.cancel;
    }
]);

app.controller('SalesforceImportModal', [
    '$scope',
    '$http',
    '$uibModalInstance',
    'AbstractModalFactory',
    function ($scope, $http, $uibModalInstance, AbstractModalFactory) {
        var modal = new AbstractModalFactory($scope.resourceClass, $scope, $uibModalInstance, "name");
        $scope.add = function (obj, index) {
            var resource = new $scope.resourceClass(obj);
            var promise = resource.$save().then(function (response) {
                if (response.customer.organization_name === obj.customer.organization_name) {
                    // remove from the salesforceOnly list
                    $scope.salesforceOnly.splice(index, 1);
                    $scope.both.push(response);
                }
            });
            $uibModalInstance.close();
            return promise;
        };
        $scope.edit = function (obj, index) {
            $scope.resourceClass.update(obj).$promise.then(function (response) {
                console.log(response);
                if (response.customer.organization_name === obj.customer.organization_name) {
                    // remove from the salesforceOnly list
                    $scope.salesforceOnly.splice(index, 1);
                    $scope.both.push(response);
                }
                $uibModalInstance.close();
            });
        };
        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }
]);
