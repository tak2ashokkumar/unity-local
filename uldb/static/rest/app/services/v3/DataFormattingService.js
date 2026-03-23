'use strict';
var app = angular.module('uldb');
app.factory('DataFormattingService', [
    '$http',
    '$q',
    '$filter',
    'AdminApi',
    function ($http,
              $q,
              $filter,
              AdminApi) {

        // *** Need to form this information dynamically based up availablility of data related to various aspects. ***
        // *** AS OF NOW PASSING WE ARE PASSING THE STATIC DATA ***
        var horizantalGraphData = [
            {
                "key": "Good",
                "color": "green",
                "values": [
                    {
                        "label": "Connectivity",
                        "value": 15,
                        "y0": 0,
                        "y": 15,
                        "series": 0,
                        "key": "Good",
                        "size": 15,
                        "y1": 0
                    },
                    {
                        "label": "Alerts",
                        "value": 10,
                        "y0": 0,
                        "y": 10,
                        "series": 0,
                        "key": "Good",
                        "size": 10,
                        "y1": 0
                    }
                ]
            },
            {
                "key": "Warning",
                "color": "orange",
                "values": [
                    {
                        "label": "Connectivity",
                        "value": 8,
                        "y0": 15,
                        "y": 8,
                        "series": 1,
                        "key": "Warning",
                        "size": 8,
                        "y1": 15
                    },
                    {
                        "label": "Alerts",
                        "value": 6,
                        "y0": 10,
                        "y": 6,
                        "series": 1,
                        "key": "Warning",
                        "size": 6,
                        "y1": 10
                    }
                ]
            },
            {
                "key": "Danger",
                "color": "red",
                "values": [
                    {
                        "label": "Connectivity",
                        "value": 3,
                        "y0": 23,
                        "y": 3,
                        "series": 2,
                        "key": "Danger",
                        "size": 3,
                        "y1": 23
                    },
                    {
                        "label": "Alerts",
                        "value": 10,
                        "y0": 16,
                        "y": 10,
                        "series": 2,
                        "key": "Danger",
                        "size": 10,
                        "y1": 16
                    }
                ]
            }
        ];

        // *** Need to form this information dynamically based up availablility of data related to various aspects. ***
        // *** AS OF NOW PASSING WE ARE PASSING THE STATIC DATA ***

        var verticalGraphData = [
            [
                {
                    "key": "Availability (since 16/03/2016)",
                    "values": [
                        {
                            "label": "A",
                            "value": 55,
                            "color": "green"
                        },
                        {
                            "label": "B",
                            "value": 397,
                            "color": "orange"
                        },
                        {
                            "label": "C",
                            "value": 484,
                            "color": "red"
                        }
                    ]
                }
            ],
            [
                {
                    "key": "Availability (since 16/03/2016)",
                    "values": [
                        {
                            "label": "A",
                            "value": 650,
                            "color": "green"
                        },
                        {
                            "label": "B",
                            "value": 155,
                            "color": "orange"
                        },
                        {
                            "label": "C",
                            "value": 664,
                            "color": "red"
                        }
                    ]
                }
            ],
            [
                {
                    "key": "Availability (since 16/03/2016)",
                    "values": [
                        {
                            "label": "A",
                            "value": 311,
                            "color": "green"
                        },
                        {
                            "label": "B",
                            "value": 129,
                            "color": "orange"
                        },
                        {
                            "label": "C",
                            "value": 274,
                            "color": "red"
                        }
                    ]
                }
            ],
            [
                {
                    "key": "Availability (since 16/03/2016)",
                    "values": [
                        {
                            "label": "A",
                            "value": 698,
                            "color": "green"
                        },
                        {
                            "label": "B",
                            "value": 68,
                            "color": "orange"
                        },
                        {
                            "label": "C",
                            "value": 174,
                            "color": "red"
                        }
                    ]
                }
            ],
            [
                {
                    "key": "Availability (since 16/03/2016)",
                    "values": [
                        {
                            "label": "A",
                            "value": 499,
                            "color": "green"
                        },
                        {
                            "label": "B",
                            "value": 119,
                            "color": "orange"
                        },
                        {
                            "label": "C",
                            "value": 410,
                            "color": "red"
                        }
                    ]
                }
            ],
            [
                {
                    "key": "Availability (since 16/03/2016)",
                    "values": [
                        {
                            "label": "A",
                            "value": 365,
                            "color": "green"
                        },
                        {
                            "label": "B",
                            "value": 196,
                            "color": "orange"
                        },
                        {
                            "label": "C",
                            "value": 404,
                            "color": "red"
                        }
                    ]
                }
            ],
            [
                {
                    "key": "Availability (since 16/03/2016)",
                    "values": [
                        {
                            "label": "A",
                            "value": 448,
                            "color": "green"
                        },
                        {
                            "label": "B",
                            "value": 185,
                            "color": "orange"
                        },
                        {
                            "label": "C",
                            "value": 179,
                            "color": "red"
                        }
                    ]
                }
            ]
        ];

        var _create_textfield = function (arr) {
            var field_name = arr[1];
            var text_field = {
                name: arr[1],
                type: arr[0],
                class: "form-control",
                description: arr[2],
                depends: arr[3],
                err_id: field_name + 'err',
                err_msg: field_name + 'Msg'
            };
            if (arr.length == 5) {
                text_field.maxlength = arr[4];
            }
            if (arr.indexOf("required") > -1) {
                text_field.required = true;
            }
            return text_field;
        };
        var _create_passwordfield = function (arr) {
            var field_name = arr[1];
            var text_field = {
                name: arr[1],
                type: arr[0],
                class: "form-control",
                description: arr[2],
                depends: arr[3],
                err_id: field_name + 'err',
                err_msg: field_name + 'Msg'
            };
            if (arr.length == 5) {
                text_field.maxlength = arr[4];
            }
            if (arr.indexOf("required") > -1) {
                text_field.required = true;
            }
            return text_field;
        };
        var _create_hiddenfield = function (arr) {
            var field_name = arr[1];
            var text_field = {
                name: arr[1],
                type: arr[0],
                class: "form-control",
                description: arr[2],
                depends: arr[3],
                err_id: field_name + 'err',
                err_msg: field_name + 'Msg'
            };
            if (arr.indexOf("required") > -1) {
                text_field.required = true;
            }
            return text_field;
        };
        var _create_datefield = function (arr) {
            var field_name = arr[1];
            var text_field = {
                name: arr[1],
                type: arr[0],
                class: "form-control",
                description: arr[2],
                depends: arr[3],
                err_id: field_name + 'err',
                err_msg: field_name + 'Msg'
            };
            if (arr.indexOf("required") > -1) {
                text_field.required = true;
            }
            return text_field;
        };
        var _create_checkbox = function (arr) {
            var field_name = arr[1];
            var checkbox = {
                name: arr[1],
                type: arr[0],
                class: "form-control",
                description: arr[2],
                depends: arr[3],
                err_id: field_name + 'err',
                err_msg: field_name + 'Msg'
            };
            if (arr.indexOf("required") > -1) {
                checkbox.required = true;
            }
            return checkbox;
        };

        var _create_textarea = function (arr) {
            var field_name = arr[1];
            var textarea = {
                name: field_name,
                type: arr[0],
                class: "form-control",
                description: arr[2],
                depends: arr[3],
                err_id: field_name + 'err',
                err_msg: field_name + 'Msg'
            };
            if (arr.indexOf("required") > -1) {
                textarea.required = true;
            }
            return textarea;
        };

        var _create_number = function (arr) {
            var field_name = arr[1];
            var number = {
                name: arr[1],
                type: arr[0],
                class: "form-control",
                description: arr[2],
                depends: arr[3],
                err_id: field_name + 'err',
                err_msg: field_name + 'Msg'
            };
            if (arr.indexOf("required") > -1) {
                number.required = true;
            }
            return number;
        };
        var _get_ram = function () {
            var ram = [];
            for (var count = 512; count < 32768; count = count * 2) {
                ram.push(count);
            }
            return ram;
        };
        var _get_cpu_memory_reservation = function () {
            var listing_cpu_memory_reservation = ["True", "False"];
            return listing_cpu_memory_reservation;
        };
        var _get_memory_level = function () {
            var listing_memory_level = [{ label: "Low", value: "1000000" }, { label: "High", value: "4000000" }, {
                label: "Normal",
                value: "2000000"
            }, { label: "Custom", value: "" }];
            return listing_memory_level;
        };
        var _get_cpu_level = function () {
            var listing_cpu_level = [{ label: "Low", value: "2000" }, { label: "High", value: "8000" }, {
                label: "Normal",
                value: "4000"
            }, { label: "Custom", value: "" }];
            return listing_cpu_level;
        };
        var _create_select = function (arr) {
            var field_name = arr[1];
            var select = {
                name: arr[1],
                type: arr[0],
                class: "form-control",
                options: arr[3],
                description: arr[2],
                depends: arr[4],
                err_id: field_name + 'err',
                err_msg: field_name + 'Msg'
            };
            if (arr.indexOf("required") > -1) {
                select.required = true;
            }
            return select;
        };

        var _create_multiselect = function (arr) {
            var field_name = arr[1];
            var select = {
                name: arr[1],
                type: arr[0],
                class: "form-control",
                options: arr[3],
                description: arr[2],
                depends: arr[4],
                err_id: field_name + 'err',
                err_msg: field_name + 'Msg'
            };
            if (arr.indexOf("required") > -1) {
                select.required = true;
            }
            return select;
        };

        var _create_file = function (arr) {
            var field_name = arr[1];
            var text_field = {
                name: arr[1],
                type: arr[0],
                class: "switched",
                description: arr[2],
                depends: arr[3],
                err_id: field_name + 'err',
                err_msg: field_name + 'Msg'
            };
            if (arr.indexOf("required") > -1) {
                text_field.required = true;
            }
            return text_field;
        };

        var _create_hidden_field = function (type, name, id) {
            var hidden_field = {
                name: name,
                type: type,
                class: "form-control",
                required: true,
                description: id
            };
            return hidden_field;
        };

        var _create_hidden_field = function (type, name, id) {
            var hidden_field = {
                name: name,
                type: type,
                class: "form-control",
                required: true,
                description: id
            };
            return hidden_field;
        };


        var _create_password_field = function (type, name, description) {
            var password_field = {
                name: name,
                type: "password",
                class: "form-control",
                description: description,
                required: true,
                err_id: name + 'err',
                err_msg: name + 'Msg'
            };
            return password_field;

        };

        return {
            formatLocationDetails: function (json_object) {
                var location_name_index;
                angular.forEach(json_object, function (value, key) {
                    angular.forEach(value.info, function (info_value, key) {
                        if (info_value.hasOwnProperty("location_small") && info_value.location_small !== "") {
                            info_value.datacenter = info_value.datacenter + ", " + info_value.location_small;
                            delete info_value.location_small;
                        }
                    });
                    location_name_index = value.headers.indexOf("location_small");
                    value.headers.splice(location_name_index, 1);
                });
                return json_object;
            },

            formatGraphDetails: function (json_object, vgraph_option) {
                angular.forEach(json_object, function (value, key) {
                    angular.forEach(value.info, function (info_value, key) {

                        if (info_value.hasOwnProperty("location_small") && info_value.location_small !== "") {
                            info_value.name = info_value.name + ", " + info_value.location_small;
                            delete info_value.location_small;
                        }
                        info_value.chart_data = horizantalGraphData;
                        if (vgraph_option) {
                            info_value.vchart_data = verticalGraphData;
                        }
                        info_value.test = ["test"];
                    });
                });
                return json_object;
            },

            formatTableData: function (table_data) {
                var table_headers = [];
                if (table_data.hasOwnProperty("data")) {
                    angular.forEach(table_data.data.info[0], function (value, key) {
                        table_headers.push(key);
                    });
                    delete table_data.data.headers;
                    table_data.data.headers = table_headers;
                }
                else {
                    angular.forEach(table_data.info[0], function (value, key) {
                        table_headers.push(key);
                    });
                    delete table_data.headers;
                    table_data.headers = table_headers;
                }
                return table_data;
            },
            formatBooleanTableData: function (table_data) {
                var table_headers = [];
                angular.forEach(table_data, function (value, key) {
                    angular.forEach(value.info, function (info_value, key) {
                        if (info_value.hasOwnProperty("enabled") && info_value.enabled !== "" && info_value.enabled == 1) {
                            info_value.enabled = true;
                        }
                        else if (info_value.hasOwnProperty("enabled") && info_value.enabled !== "" && info_value.enabled == 0) {
                            info_value.enabled = false;
                        }
                    });
                });
                return table_data;
            },
            get_hidden_field: function (type, name, description) {
                return _create_hidden_field(type, name, description);
            },
            get_password_field: function (type, name, description) {
                return _create_password_field(type, name, description);
            },
            get_ram: function () {
                return _get_ram();
            },
            get_cpu_memory_reservation: function () {
                return _get_cpu_memory_reservation();
            },
            get_memory_level: function () {
                return _get_memory_level();
            },
            get_cpu_level: function () {
                return _get_cpu_level();
            },
            create_fields_for_dialog: function (arr) {
                if (arr[0] == "text") {
                    return _create_textfield(arr);
                } else if (arr[0] == "checkbox") {
                    return _create_checkbox(arr);
                } else if (arr[0] == "textarea") {
                    return _create_textarea(arr);
                } else if (arr[0] == "number") {
                    return _create_number(arr);
                } else if (arr[0] == "select") {
                    return _create_select(arr);
                } else if (arr[0] == "multiselect") {
                    return _create_multiselect(arr);
                } else if (arr[0] == "file") {
                    return _create_file(arr);
                } else if (arr[0] == "password") {
                    return _create_passwordfield(arr);
                } else if (arr[0] == "hidden") {
                    return _create_hiddenfield(arr);
                } else if (arr[0] == "date") {
                    return _create_hiddenfield(arr);
                }
            },
            generate_row: function (arr) {
                if (arr[0] == "text") {
                    return _create_textfield(arr);
                } else if (arr[0] == "checkbox") {
                    return _create_checkbox(arr);
                } else if (arr[0] == "textarea") {
                    return _create_textarea(arr);
                } else if (arr[0] == "number") {
                    return _create_number(arr);
                } else if (arr[0] == "select") {
                    return _create_select(arr);
                } else if (arr[0] == "multiselect") {
                    return _create_multiselect(arr);
                } else if (arr[0] == "file") {
                    return _create_file(arr);
                } else if (arr[0] == "password") {
                    return _create_passwordfield(arr);
                } else if (arr[0] == "hidden") {
                    return _create_hiddenfield(arr);
                } else if (arr[0] == "date") {
                    return _create_datefield(arr);
                }
            }
        };

        /* Bindable functions
         -----------------------------------------------*/
        // $scope.endDateBeforeRender = endDateBeforeRender;
        // $scope.endDateOnSetTime = endDateOnSetTime;
        // $scope.startDateBeforeRender = startDateBeforeRender;
        // $scope.startDateOnSetTime = startDateOnSetTime;
        //
        // function startDateOnSetTime() {
        //     $scope.$broadcast('start-date-changed');
        // }
        //
        // function endDateOnSetTime() {
        //     $scope.$broadcast('end-date-changed');
        // }
        //
        // function startDateBeforeRender($dates) {
        //     if ($scope.dateRangeEnd) {
        //         var activeDate = moment($scope.dateRangeEnd);
        //
        //         $dates.filter(function (date) {
        //             return date.localDateValue() >= activeDate.valueOf();
        //         }).forEach(function (date) {
        //             date.selectable = false;
        //         });
        //     }
        // }
        //
        // function endDateBeforeRender($view, $dates) {
        //     if ($scope.dateRangeStart) {
        //         var activeDate = moment($scope.dateRangeStart).subtract(1, $view).add(1, 'minute');
        //
        //         $dates.filter(function (date) {
        //             return date.localDateValue() <= activeDate.valueOf();
        //         }).forEach(function (date) {
        //             date.selectable = false;
        //         });
        //     }
        // }
    }
]);
