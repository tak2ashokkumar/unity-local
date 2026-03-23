'use strict';
var app = angular.module('uldb');
app.factory('DataFormattingService', [
    '$http',
    '$q',
    '$filter',
    'ClientApi',
    function ($http,
              $q,
              $filter,
              ClientApi) {

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

        var _get_pytz_all_timezone = function () {
            return ['Africa/Abidjan', 'Africa/Accra', 'Africa/Addis_Ababa', 'Africa/Algiers', 'Africa/Asmara', 'Africa/Bamako', 'Africa/Bangui', 'Africa/Banjul', 'Africa/Bissau', 'Africa/Blantyre', 'Africa/Brazzaville', 'Africa/Bujumbura', 'Africa/Cairo', 'Africa/Casablanca', 'Africa/Ceuta', 'Africa/Conakry', 'Africa/Dakar', 'Africa/Dar_es_Salaam', 'Africa/Djibouti', 'Africa/Douala', 'Africa/El_Aaiun', 'Africa/Freetown', 'Africa/Gaborone', 'Africa/Harare', 'Africa/Johannesburg', 'Africa/Juba', 'Africa/Kampala', 'Africa/Khartoum', 'Africa/Kigali', 'Africa/Kinshasa', 'Africa/Lagos', 'Africa/Libreville', 'Africa/Lome', 'Africa/Luanda', 'Africa/Lubumbashi', 'Africa/Lusaka', 'Africa/Malabo', 'Africa/Maputo', 'Africa/Maseru', 'Africa/Mbabane', 'Africa/Mogadishu', 'Africa/Monrovia', 'Africa/Nairobi', 'Africa/Ndjamena', 'Africa/Niamey', 'Africa/Nouakchott', 'Africa/Ouagadougou', 'Africa/Porto-Novo', 'Africa/Sao_Tome', 'Africa/Tripoli', 'Africa/Tunis', 'Africa/Windhoek', 'America/Adak', 'America/Anchorage', 'America/Anguilla', 'America/Antigua', 'America/Araguaina', 'America/Argentina/Buenos_Aires', 'America/Argentina/Catamarca', 'America/Argentina/Cordoba', 'America/Argentina/Jujuy', 'America/Argentina/La_Rioja', 'America/Argentina/Mendoza', 'America/Argentina/Rio_Gallegos', 'America/Argentina/Salta', 'America/Argentina/San_Juan', 'America/Argentina/San_Luis', 'America/Argentina/Tucuman', 'America/Argentina/Ushuaia', 'America/Aruba', 'America/Asuncion', 'America/Atikokan', 'America/Bahia', 'America/Bahia_Banderas', 'America/Barbados', 'America/Belem', 'America/Belize', 'America/Blanc-Sablon', 'America/Boa_Vista', 'America/Bogota', 'America/Boise', 'America/Cambridge_Bay', 'America/Campo_Grande', 'America/Cancun', 'America/Caracas', 'America/Cayenne', 'America/Cayman', 'America/Chicago', 'America/Chihuahua', 'America/Costa_Rica', 'America/Creston', 'America/Cuiaba', 'America/Curacao', 'America/Danmarkshavn', 'America/Dawson', 'America/Dawson_Creek', 'America/Denver', 'America/Detroit', 'America/Dominica', 'America/Edmonton', 'America/Eirunepe', 'America/El_Salvador', 'America/Fort_Nelson', 'America/Fortaleza', 'America/Glace_Bay', 'America/Godthab', 'America/Goose_Bay', 'America/Grand_Turk', 'America/Grenada', 'America/Guadeloupe', 'America/Guatemala', 'America/Guayaquil', 'America/Guyana', 'America/Halifax', 'America/Havana', 'America/Hermosillo', 'America/Indiana/Indianapolis', 'America/Indiana/Knox', 'America/Indiana/Marengo', 'America/Indiana/Petersburg', 'America/Indiana/Tell_City', 'America/Indiana/Vevay', 'America/Indiana/Vincennes', 'America/Indiana/Winamac', 'America/Inuvik', 'America/Iqaluit', 'America/Jamaica', 'America/Juneau', 'America/Kentucky/Louisville', 'America/Kentucky/Monticello', 'America/Kralendijk', 'America/La_Paz', 'America/Lima', 'America/Los_Angeles', 'America/Lower_Princes', 'America/Maceio', 'America/Managua', 'America/Manaus', 'America/Marigot', 'America/Martinique', 'America/Matamoros', 'America/Mazatlan', 'America/Menominee', 'America/Merida', 'America/Metlakatla', 'America/Mexico_City', 'America/Miquelon', 'America/Moncton', 'America/Monterrey', 'America/Montevideo', 'America/Montserrat', 'America/Nassau', 'America/New_York', 'America/Nipigon', 'America/Nome', 'America/Noronha', 'America/North_Dakota/Beulah', 'America/North_Dakota/Center', 'America/North_Dakota/New_Salem', 'America/Ojinaga', 'America/Panama', 'America/Pangnirtung', 'America/Paramaribo', 'America/Phoenix', 'America/Port-au-Prince', 'America/Port_of_Spain', 'America/Porto_Velho', 'America/Puerto_Rico', 'America/Punta_Arenas', 'America/Rainy_River', 'America/Rankin_Inlet', 'America/Recife', 'America/Regina', 'America/Resolute', 'America/Rio_Branco', 'America/Santarem', 'America/Santiago', 'America/Santo_Domingo', 'America/Sao_Paulo', 'America/Scoresbysund', 'America/Sitka', 'America/St_Barthelemy', 'America/St_Johns', 'America/St_Kitts', 'America/St_Lucia', 'America/St_Thomas', 'America/St_Vincent', 'America/Swift_Current', 'America/Tegucigalpa', 'America/Thule', 'America/Thunder_Bay', 'America/Tijuana', 'America/Toronto', 'America/Tortola', 'America/Vancouver', 'America/Whitehorse', 'America/Winnipeg', 'America/Yakutat', 'America/Yellowknife', 'Antarctica/Casey', 'Antarctica/Davis', 'Antarctica/DumontDUrville', 'Antarctica/Macquarie', 'Antarctica/Mawson', 'Antarctica/McMurdo', 'Antarctica/Palmer', 'Antarctica/Rothera', 'Antarctica/Syowa', 'Antarctica/Troll', 'Antarctica/Vostok', 'Arctic/Longyearbyen', 'Asia/Aden', 'Asia/Almaty', 'Asia/Amman', 'Asia/Anadyr', 'Asia/Aqtau', 'Asia/Aqtobe', 'Asia/Ashgabat', 'Asia/Atyrau', 'Asia/Baghdad', 'Asia/Bahrain', 'Asia/Baku', 'Asia/Bangkok', 'Asia/Barnaul', 'Asia/Beirut', 'Asia/Bishkek', 'Asia/Brunei', 'Asia/Chita', 'Asia/Choibalsan', 'Asia/Colombo', 'Asia/Damascus', 'Asia/Dhaka', 'Asia/Dili', 'Asia/Dubai', 'Asia/Dushanbe', 'Asia/Famagusta', 'Asia/Gaza', 'Asia/Hebron', 'Asia/Ho_Chi_Minh', 'Asia/Hong_Kong', 'Asia/Hovd', 'Asia/Irkutsk', 'Asia/Jakarta', 'Asia/Jayapura', 'Asia/Jerusalem', 'Asia/Kabul', 'Asia/Kamchatka', 'Asia/Karachi', 'Asia/Kathmandu', 'Asia/Khandyga', 'Asia/Kolkata', 'Asia/Krasnoyarsk', 'Asia/Kuala_Lumpur', 'Asia/Kuching', 'Asia/Kuwait', 'Asia/Macau', 'Asia/Magadan', 'Asia/Makassar', 'Asia/Manila', 'Asia/Muscat', 'Asia/Nicosia', 'Asia/Novokuznetsk', 'Asia/Novosibirsk', 'Asia/Omsk', 'Asia/Oral', 'Asia/Phnom_Penh', 'Asia/Pontianak', 'Asia/Pyongyang', 'Asia/Qatar', 'Asia/Qyzylorda', 'Asia/Riyadh', 'Asia/Sakhalin', 'Asia/Samarkand', 'Asia/Seoul', 'Asia/Shanghai', 'Asia/Singapore', 'Asia/Srednekolymsk', 'Asia/Taipei', 'Asia/Tashkent', 'Asia/Tbilisi', 'Asia/Tehran', 'Asia/Thimphu', 'Asia/Tokyo', 'Asia/Tomsk', 'Asia/Ulaanbaatar', 'Asia/Urumqi', 'Asia/Ust-Nera', 'Asia/Vientiane', 'Asia/Vladivostok', 'Asia/Yakutsk', 'Asia/Yangon', 'Asia/Yekaterinburg', 'Asia/Yerevan', 'Atlantic/Azores', 'Atlantic/Bermuda', 'Atlantic/Canary', 'Atlantic/Cape_Verde', 'Atlantic/Faroe', 'Atlantic/Madeira', 'Atlantic/Reykjavik', 'Atlantic/South_Georgia', 'Atlantic/St_Helena', 'Atlantic/Stanley', 'Australia/Adelaide', 'Australia/Brisbane', 'Australia/Broken_Hill', 'Australia/Currie', 'Australia/Darwin', 'Australia/Eucla', 'Australia/Hobart', 'Australia/Lindeman', 'Australia/Lord_Howe', 'Australia/Melbourne', 'Australia/Perth', 'Australia/Sydney', 'Canada/Atlantic', 'Canada/Central', 'Canada/Eastern', 'Canada/Mountain', 'Canada/Newfoundland', 'Canada/Pacific', 'Europe/Amsterdam', 'Europe/Andorra', 'Europe/Astrakhan', 'Europe/Athens', 'Europe/Belgrade', 'Europe/Berlin', 'Europe/Bratislava', 'Europe/Brussels', 'Europe/Bucharest', 'Europe/Budapest', 'Europe/Busingen', 'Europe/Chisinau', 'Europe/Copenhagen', 'Europe/Dublin', 'Europe/Gibraltar', 'Europe/Guernsey', 'Europe/Helsinki', 'Europe/Isle_of_Man', 'Europe/Istanbul', 'Europe/Jersey', 'Europe/Kaliningrad', 'Europe/Kiev', 'Europe/Kirov', 'Europe/Lisbon', 'Europe/Ljubljana', 'Europe/London', 'Europe/Luxembourg', 'Europe/Madrid', 'Europe/Malta', 'Europe/Mariehamn', 'Europe/Minsk', 'Europe/Monaco', 'Europe/Moscow', 'Europe/Oslo', 'Europe/Paris', 'Europe/Podgorica', 'Europe/Prague', 'Europe/Riga', 'Europe/Rome', 'Europe/Samara', 'Europe/San_Marino', 'Europe/Sarajevo', 'Europe/Saratov', 'Europe/Simferopol', 'Europe/Skopje', 'Europe/Sofia', 'Europe/Stockholm', 'Europe/Tallinn', 'Europe/Tirane', 'Europe/Ulyanovsk', 'Europe/Uzhgorod', 'Europe/Vaduz', 'Europe/Vatican', 'Europe/Vienna', 'Europe/Vilnius', 'Europe/Volgograd', 'Europe/Warsaw', 'Europe/Zagreb', 'Europe/Zaporozhye', 'Europe/Zurich', 'GMT', 'Indian/Antananarivo', 'Indian/Chagos', 'Indian/Christmas', 'Indian/Cocos', 'Indian/Comoro', 'Indian/Kerguelen', 'Indian/Mahe', 'Indian/Maldives', 'Indian/Mauritius', 'Indian/Mayotte', 'Indian/Reunion', 'Pacific/Apia', 'Pacific/Auckland', 'Pacific/Bougainville', 'Pacific/Chatham', 'Pacific/Chuuk', 'Pacific/Easter', 'Pacific/Efate', 'Pacific/Enderbury', 'Pacific/Fakaofo', 'Pacific/Fiji', 'Pacific/Funafuti', 'Pacific/Galapagos', 'Pacific/Gambier', 'Pacific/Guadalcanal', 'Pacific/Guam', 'Pacific/Honolulu', 'Pacific/Kiritimati', 'Pacific/Kosrae', 'Pacific/Kwajalein', 'Pacific/Majuro', 'Pacific/Marquesas', 'Pacific/Midway', 'Pacific/Nauru', 'Pacific/Niue', 'Pacific/Norfolk', 'Pacific/Noumea', 'Pacific/Pago_Pago', 'Pacific/Palau', 'Pacific/Pitcairn', 'Pacific/Pohnpei', 'Pacific/Port_Moresby', 'Pacific/Rarotonga', 'Pacific/Saipan', 'Pacific/Tahiti', 'Pacific/Tarawa', 'Pacific/Tongatapu', 'Pacific/Wake', 'Pacific/Wallis', 'US/Alaska', 'US/Arizona', 'US/Central', 'US/Eastern', 'US/Hawaii', 'US/Mountain', 'US/Pacific', 'UTC'];
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
                        // console.log("info_value:"+ JSON.stringify(info_value));
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
            get_pytz_all_timezone: function(){
                return _get_pytz_all_timezone();
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

        // Move to controllers - Currently being unused

        // $scope.endDateBeforeRender = endDateBeforeRender;
        // $scope.endDateOnSetTime = endDateOnSetTime;
        // $scope.startDateBeforeRender = startDateBeforeRender;
        // $scope.startDateOnSetTime = startDateOnSetTime;

        // function startDateOnSetTime() {
        //     $scope.$broadcast('start-date-changed');
        // }

        // function endDateOnSetTime() {
        //     $scope.$broadcast('end-date-changed');
        // }

        // function startDateBeforeRender($dates) {
        //     if ($scope.dateRangeEnd) {
        //         var activeDate = moment($scope.dateRangeEnd);

        //         $dates.filter(function (date) {
        //             return date.localDateValue() >= activeDate.valueOf();
        //         }).forEach(function (date) {
        //             date.selectable = false;
        //         });
        //     }
        // }

        // function endDateBeforeRender($view, $dates) {
        //     if ($scope.dateRangeStart) {
        //         var activeDate = moment($scope.dateRangeStart).subtract(1, $view).add(1, 'minute');

        //         $dates.filter(function (date) {
        //             return date.localDateValue() <= activeDate.valueOf();
        //         }).forEach(function (date) {
        //             date.selectable = false;
        //         });
        //     }
        // }


    }
]);
