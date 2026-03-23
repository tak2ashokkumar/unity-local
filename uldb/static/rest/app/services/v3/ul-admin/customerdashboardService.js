'use strict';
var app = angular.module('uldb');
app.factory('CustomerDashboardService', [
    '$http',
    '$q',
    'AdminApi',
    function ($http, $q, AdminApi) {

        var getJsonfilePath = function (name) {
            return AdminApi.custom_data_url.replace(':filename', name);
        };

        var _retrieve_data = function (path) {
            return $http({
                method: "GET",
                url: path
            }).then(function (result) {
                var obj = { data: null };
                obj.data = result.data;
                return obj;
            }).catch(function (error) {
                // console.log("Error================>"+error);
            });
        };

        var _retrieve_data_url = function (path) {
            return $http({
                method: "GET",
                url: path
            }).then(function (result) {
                var obj = { data: null };
                obj.data = { info: null };
                obj.data.info = result.data.results;
                return obj;
            }).catch(function (error) {
                // console.log("Error================>"+error);
            });
        };

        var _retrieve_tickets = function (path) {
            return $http({
                method: "GET",
                url: path
            }).then(function (response) {
                return response.data;
            }).catch(function (error) {
                // console.log("Error================>"+error);
            });
        };

        return {

            get_ms_data: function (customer_id) {
                return _retrieve_data_url('/rest/v3/schedules/' + customer_id + '/impact/');
            },

            get_alerts_data: function () {
                return _retrieve_data(getJsonfilePath('alerts_data'));
            },
            get_tickets_data: function (customer_id) {
                return _retrieve_tickets('/rest/v3/zendesk_tickets/' + customer_id + '/customer_tickets/');
            },
            get_org_data: function (org_id) {
                return _retrieve_tickets('/rest/v3/zendesk_tickets/' + org_id + '/get_org_name/');
            },
            get_datacenters_data: function (customer_id) {
                // return _retrieve_data(getJsonfilePath('datacenters'));
                return _retrieve_data_url('/rest/datacenter/' + customer_id + '/get_customer_datacenters/');
            },


            get_datacenter_count: function (customer_id) {
                return $http.get('/rest/datacenter/' + customer_id + '/get_customer_datacenters/')
                    .then(function (response) {
                        // console.log("Datacenter Count : "+angular.toJson(response.data))
                        return response.data.count;
                    });
            },
            get_colocation_count: function (customer_id) {
                // TODO replace the url when the model is prepared
                // return $http.get(AdminApi.dashboard_get_datacenters)
                return $http.get('/rest/cabinet/' + customer_id + '/get_customer_colocations/')
                    .then(function (response) {
                        // return response.data.results.length;
                        // console.log("Collocation Count : "+angular.toJson(response.data))
                        return response.data.count;
                    });
            },
            get_private_cloud_count: function (customer_id) {
                // TODO replace the url when the model is prepared
                return $http.get('/rest/v3/private_cloud/' + customer_id + '/get_customer_private_clouds/')
                    .then(function (response) {
                        // return response.data.results.length;
                        // console.log("Private Cloud : "+angular.toJson(response));
                        return response.data.count;
                    });
            },
            get_public_cloud_count: function (customer_id) {
                // TODO replace the url when the model is prepared
                return $http.get('/rest/v3/public_cloud/' + customer_id + '/get_customer_public_clouds/')
                    .then(function (response) {
                        // return response.data.results.length;
                        // console.log("Public Cloud : "+angular.toJson(response));
                        return response.data.count;
                    });
            },
            get_markers: function generate_map_markers(customer_id) {
                var iconBase = "/static/img/green_marker.png";
                var datacenter_list = [];
                var map_markers_list = [];
                return $http.get('/rest/datacenter/' + customer_id + '/get_customer_datacenters/')
                    .then(function (response) {

                        datacenter_list = response.data.results;
                        angular.forEach(datacenter_list, function (value, key) {
                            var datacenter = {};
                            datacenter.id = value.id;
                            datacenter.location = value.location;
                            datacenter.coords = {
                                latitude: value.latitude,
                                longitude: value.longitude
                            };
                            datacenter.title = value.name;
                            map_markers_list.push(datacenter);
                        });
                        // console.log("MAp Markers : "+angular.toJson(map_markers_list));
                        return map_markers_list;
                    });
            },
            get_map_data: function generate_map_data() {
                var connections = [[
                    { latitude: 30, longitude: -89 },
                    { latitude: 37, longitude: -122 }
                ],
                    [
                        { latitude: 32, longitude: -89 },
                        { latitude: 39, longitude: -122 }
                    ]
                ];
                var map_settings = {
                    id: Math.floor((Math.random() * 6) + 1),
                    stroke_config: { color: '#6060FB', weight: 3 },
                    editable: true,
                    draggable: true,
                    geodesic: true,
                    visible: true,
                    clickable: true,
                    icon_settings: [{
                        //Use or uncomment this if any arrow representation on the line is required on maps.
                        icon: {
                            path: google.maps.SymbolPath.BACKWARD_OPEN_ARROW
                        },
                        offset: '25px',
                        repeat: '50px'
                    }]
                };

                var map_data = [
                    {
                        id: map_settings.id,
                        path: connections[0],
                        stroke: map_settings.stroke_config,
                        editable: map_settings.editable,
                        draggable: map_settings.draggable,
                        geodesic: map_settings.gedesic,
                        visible: map_settings.visible,
                        clickable: map_settings.clickable,
                        icons: map_settings.icon_settings,
                        events: {
                            tilesloaded: function (map, eventName, originalEventArgs) {
                                // console.log("Map loaded");
                                //map is trueley ready then this callback is hit
                            },
                            click: function (event) {
                                alert("Clicked 2!");
                                var new_map = event.getMap();
                                var contentString = '<div id="content">' +
                                    '<div id="siteNotice">' +
                                    '</div>' +
                                    '<h2 id="firstHeading" class="firstHeading">Info</h2>' +
                                    '<div id="bodyContent">' +
                                    '<p>Connection 2 is clicked!</p>' +
                                    '</div>' +
                                    '</div>';
                                var infowindow = new google.maps.InfoWindow({
                                    content: contentString
                                });
                                //infowindow.setPosition(event.latLngs);
                                infowindow.open(new_map);
                            }
                        }
                    },
                    {
                        id: map_settings.id,
                        path: connections[1],
                        stroke: map_settings.stroke_config,
                        editable: map_settings.editable,
                        draggable: map_settings.draggable,
                        geodesic: map_settings.gedesic,
                        visible: map_settings.visible,
                        clickable: map_settings.clickable,
                        icons: map_settings.icon_settings,
                        events: {
                            click: function (event) {
                                alert("Clicked 2!");
                                var new_map = event.getMap();
                                var contentString = '<div id="content">' +
                                    '<div id="siteNotice">' +
                                    '</div>' +
                                    '<h2 id="firstHeading" class="firstHeading">Info</h2>' +
                                    '<div id="bodyContent">' +
                                    '<p>Connection 2 is clicked!</p>' +
                                    '</div>' +
                                    '</div>';
                                var infowindow = new google.maps.InfoWindow({
                                    content: contentString
                                });
                                //infowindow.setPosition(event.latLngs);
                                infowindow.open(new_map);
                            }
                        }
                    }
                ];
                return map_data;
            }
        };

    }
]);
