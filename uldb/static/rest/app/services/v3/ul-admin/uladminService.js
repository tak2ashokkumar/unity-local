'use strict';
var app = angular.module('uldb');
app.factory('uladminService', [
    '$http',
    '$q',
    'AdminApi',
    function ($http, $q, AdminApi) {
        return {

            get_datacenter_count: function () {
                return $http.get(AdminApi.dashboard_get_datacenters)
                    .then(function (response) {
                        // console.log("Datacenter Count : "+angular.toJson(response.data))
                        return response.data.count;
                    });
            },
            get_colocation_count: function () {
                // TODO replace the url when the model is prepared
                // return $http.get(AdminApi.dashboard_get_datacenters)
                return $http.get(AdminApi.get_colocation)
                    .then(function (response) {
                        return response.data.count;
                    });
            },
            get_private_cloud_count: function () {
                // TODO replace the url when the model is prepared
                return $http.get(AdminApi.get_private_cloud)
                    .then(function (response) {
                        // return response.data.results.length;
                        // console.log("Private Cloud : "+angular.toJson(response));
                        return response.data.count;
                    });
            },
            get_public_cloud_count: function () {
                // TODO replace the url when the model is prepared
                return $http.get(AdminApi.get_public_cloud)
                    .then(function (response) {
                        // return response.data.results.length;
                        // console.log("Public Cloud : "+angular.toJson(response));
                        return response.data.count;
                    });
            },
            get_markers_async_test: function (delay) {
                if (delay === undefined) {
                    delay = 1000;
                }
                var deferred = $q.defer();

                setTimeout(function () {
                    var iconBase = "/static/img/green_marker.png";
                    var results = [
                        {
                            id: "1",
                            title: "Place A",
                            coords: {
                                latitude: 30,
                                longitude: -89
                            },
                            icon: { url: iconBase, scaledSize: { width: 38, height: 38 } }
                        },
                        {
                            id: "2",
                            title: "Place B",
                            coords: {
                                latitude: 38,
                                longitude: -105
                            },
                            icon: { url: iconBase, scaledSize: { width: 38, height: 38 } }
                        }
                    ];
                    deferred.resolve(results);
                }, delay);

                return deferred.promise;
            },
            get_markers: function () {


                return $http.get(AdminApi.dashboard_get_datacenters)
                    .then(function (response) {
                        // console.log("Map Data : "+angular.toJson(response.data))
                        return response.data.results.filter(function (e, i, arr) {
                            return e.latitude !== null;
                        }).map(function (e, i, arr) {
                            // console.log(e);
                            return {
                                id: e.id,
                                title: e.name,
                                coords: {
                                    latitude: e.latitude,
                                    longitude: e.longitude
                                },

                            };
                        });


                        // angular.forEach(datacenter_list, function (value, key) {
                        //
                        //     var datacenter = {};
                        //     datacenter.id = value.id;
                        //     datacenter.location = value.location;
                        //
                        //     datacenter.coords = {
                        //         latitude: value.latitude,
                        //         longitude: value.longitude
                        //     };
                        //     datacenter.icon = { url: iconBase, scaledSize: { width: 38, height: 38 } }
                        //     datacenter.title = value.datacenter_name;
                        //
                        //     map_markers_list.push(datacenter);
                        // });
                        // // console.log("MAp Markers : "+angular.toJson(map_markers_list));
                        // return map_markers_list;
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
