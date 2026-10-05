# severity
from collections import OrderedDict


INFORMATION = 1
WARNING = 2
CRITICAL = 3

OTEL_SEVERITY_MAP = {
    'DEBUG': INFORMATION,
    'INFO': INFORMATION,
    'INFORMATION': INFORMATION,
    'WARNING': WARNING,
    'WARN': WARNING,
    'ERROR': CRITICAL,
    'CRITICAL': CRITICAL,
    'FATAL': CRITICAL,
}

OTEL_STATUS_MAP={
    "Healthy":1,
    "Critical":0,
    "Unknown":-1
}

SEVERITY_MAPPING = {
    3: 0,
    2: -1,
    1: 1,
}
STATUS_MAPPING = {
    0: "Critical",
    -1: "Unknown",
    1: "Healthy",
}


FUNNEL_DATA_CACHE = {
    "7_day": {
        "carts": 45882, 
        "orders": 7178, 
        "sessions": 298279
    },
    "13_day": {
        "carts": 32960, 
        "orders": 5087, 
        "sessions": 214042
    },
    "16_day": {
        "carts": 27596, 
        "orders": 4332, 
        "sessions": 179956
    },
    "12_day": {
        "carts": 35018, 
        "orders": 5509, 
        "sessions": 226615
    },
    "11_day": {
        "carts": 37415, 
        "orders": 5850, 
        "sessions": 242665
    },
    "24_day": {
        "carts": 11707, 
        "orders": 1832, 
        "sessions": 79569
    },
    "10_day": {
        "carts": 40071, 
        "orders": 6298, 
        "sessions": 259180
    },
    "9_day": {
        "carts": 42036, 
        "orders": 6601, 
        "sessions": 272464
    },
    "14_day": {
        "carts": 31101, 
        "orders": 4820, 
        "sessions": 202055
    },
    "3_day": {
        "carts": 53647, 
        "orders": 8338, 
        "sessions": 348805
    },
    "22_day": {
        "carts": 15888, 
        "orders": 2416, 
        "sessions": 105568
    },
    "26_day": {
        "carts": 6965, 
        "orders": 1042, 
        "sessions": 47018
    },
    "23_day": {
        "carts": 13608, 
        "orders": 2140, 
        "sessions": 92434
    },
    "27_day": {
        "carts": 5001, 
        "orders": 768, 
        "sessions": 34741
    },
    "4_day": {
        "carts": 51578, 
        "orders": 8009, 
        "sessions": 335364
    },
    "30_day": {
        "carts": 52, 
        "orders": 1, 
        "sessions": 241
    },
    "8_day": {
        "carts": 43868, 
        "orders": 6908, 
        "sessions": 285695
    },
    "5_day": {
        "carts": 49431, 
        "orders": 7680, 
        "sessions": 321561
    },
    "1_day": {
        "carts": 56782, 
        "orders": 8972, 
        "sessions": 370451
    },
    "19_day": {
        "carts": 21258, 
        "orders": 3213, 
        "sessions": 141931
    },
    "25_day": {
        "carts": 9172, 
        "orders": 1396, 
        "sessions": 62969
    },
    "15_day": {
        "carts": 29404, 
        "orders": 4568, 
        "sessions": 190653
    },
    "2_day": {
        "carts": 55233, 
        "orders": 8708, 
        "sessions": 359416
    },
    "20_day": {
        "carts": 19256, 
        "orders": 2978, 
        "sessions": 130239
    },
    "18_day": {
        "carts": 23480, 
        "orders": 3574, 
        "sessions": 155728
    },
    "28_day": {
        "carts": 3069, 
        "orders": 511, 
        "sessions": 22879
    },
    "21_day": {
        "carts": 17423, 
        "orders": 2717, 
        "sessions": 118212
    },
    "6_day": {
        "carts": 47668, 
        "orders": 7415, 
        "sessions": 310366
    },
    "29_day": {
        "carts": 1404, 
        "orders": 270, 
        "sessions": 11272
    },
    "17_day": {
        "carts": 25907, 
        "orders": 4041, 
        "sessions": 169105
    }
}


RETURNING_CUSTOMER_BY_CATEGORY = {
    "7_day": {
        "Gadgets": 869, 
        "Binoculars": 602, 
        "Books": 481, 
        "Apparel": 827, 
        "Posters": 393, 
        "Star Maps": 904, 
        "Telescopes": 900
    }, 
    "13_day": {
        "Gadgets": 687, 
        "Binoculars": 434, 
        "Books": 271, 
        "Apparel": 651, 
        "Posters": 250, 
        "Star Maps": 621, 
        "Telescopes": 630
    }, 
    "16_day": {
        "Gadgets": 541, 
        "Binoculars": 388, 
        "Books": 242, 
        "Apparel": 540, 
        "Posters": 229, 
        "Star Maps": 543, 
        "Telescopes": 541
    }, 
    "12_day": {
        "Binoculars": 470, 
        "Gadgets": 697, 
        "Books": 319, 
        "Apparel": 688, 
        "Posters": 272, 
        "Star Maps": 678, 
        "Telescopes": 711
    }, 
    "11_day": {
        "Gadgets": 706, 
        "Binoculars": 521, 
        "Books": 343, 
        "Apparel": 740, 
        "Posters": 297, 
        "Star Maps": 709, 
        "Telescopes": 746
    }, 
    "24_day": {
        "Binoculars": 218, 
        "Gadgets": 221, 
        "Books": 106, 
        "Apparel": 210, 
        "Posters": 79, 
        "Star Maps": 211, 
        "Telescopes": 223
    }, 
    "10_day": {
        "Gadgets": 776, 
        "Binoculars": 539, 
        "Books": 413, 
        "Apparel": 796, 
        "Posters": 303, 
        "Star Maps": 741, 
        "Telescopes": 791
    }, 
    "9_day": {
        "Gadgets": 841, 
        "Binoculars": 557, 
        "Books": 442, 
        "Apparel": 804, 
        "Posters": 360, 
        "Star Maps": 777, 
        "Telescopes": 799
    }, 
    "14_day": {
        "Gadgets": 650, 
        "Binoculars": 434, 
        "Books": 261, 
        "Apparel": 591, 
        "Posters": 232, 
        "Star Maps": 603, 
        "Telescopes": 584
    }, 
    "3_day": {
        "Gadgets": 964, 
        "Binoculars": 723, 
        "Books": 587, 
        "Apparel": 929, 
        "Posters": 436, 
        "Star Maps": 1078, 
        "Telescopes": 1073
    }, 
    "22_day": {
        "Binoculars": 257, 
        "Gadgets": 289, 
        "Books": 127, 
        "Apparel": 289, 
        "Posters": 106, 
        "Star Maps": 302, 
        "Telescopes": 317
    }, 
    "26_day": {
        "Binoculars": 80, 
        "Gadgets": 144, 
        "Books": 68, 
        "Apparel": 121, 
        "Posters": 51, 
        "Star Maps": 108, 
        "Telescopes": 143
    }, 
    "23_day": {
        "Gadgets": 262, 
        "Binoculars": 226, 
        "Books": 127, 
        "Apparel": 269, 
        "Posters": 106, 
        "Star Maps": 228, 
        "Telescopes": 269
    }, 
    "27_day": {
        "Binoculars": 69, 
        "Gadgets": 100, 
        "Books": 57, 
        "Apparel": 90, 
        "Posters": 51, 
        "Star Maps": 84, 
        "Telescopes": 69
    }, 
    "4_day": {
        "Binoculars": 682, 
        "Gadgets": 963, 
        "Books": 547, 
        "Apparel": 906, 
        "Posters": 419, 
        "Star Maps": 1024, 
        "Telescopes": 1011
    }, 
    "30_day": {
        "Gadgets": 1
    }, 
    "8_day": {
        "Binoculars": 602, 
        "Gadgets": 845, 
        "Books": 478, 
        "Apparel": 813, 
        "Posters": 380, 
        "Star Maps": 833, 
        "Telescopes": 835
    }, 
    "5_day": {
        "Binoculars": 638, 
        "Gadgets": 940, 
        "Books": 524, 
        "Apparel": 895, 
        "Posters": 414, 
        "Star Maps": 948, 
        "Telescopes": 971
    }, 
    "1_day": {
        "Gadgets": 1046, 
        "Binoculars": 749, 
        "Books": 616, 
        "Apparel": 961, 
        "Posters": 454, 
        "Star Maps": 1173, 
        "Telescopes": 1232
    }, 
    "19_day": {
        "Gadgets": 370, 
        "Binoculars": 289, 
        "Books": 200, 
        "Apparel": 389, 
        "Posters": 177, 
        "Star Maps": 402, 
        "Telescopes": 425
    }, 
    "25_day": {
        "Binoculars": 156, 
        "Gadgets": 164, 
        "Books": 92, 
        "Apparel": 158, 
        "Posters": 51, 
        "Star Maps": 152, 
        "Telescopes": 194
    }, 
    "15_day": {
        "Binoculars": 428, 
        "Gadgets": 541, 
        "Books": 253, 
        "Apparel": 576, 
        "Posters": 232, 
        "Star Maps": 589, 
        "Telescopes": 566
    }, 
    "2_day": {
        "Gadgets": 1032, 
        "Binoculars": 736, 
        "Books": 608, 
        "Apparel": 941, 
        "Posters": 436, 
        "Star Maps": 1111, 
        "Telescopes": 1190
    }, 
    "20_day": {
        "Gadgets": 331, 
        "Binoculars": 289, 
        "Books": 187, 
        "Apparel": 359, 
        "Posters": 155, 
        "Star Maps": 377, 
        "Telescopes": 381
    }, 
    "18_day": {
        "Gadgets": 437, 
        "Binoculars": 339, 
        "Books": 205, 
        "Apparel": 428, 
        "Posters": 192, 
        "Star Maps": 432, 
        "Telescopes": 476
    }, 
    "28_day": {
        "Gadgets": 82, 
        "Binoculars": 52, 
        "Books": 22, 
        "Apparel": 52, 
        "Posters": 41, 
        "Star Maps": 62, 
        "Telescopes": 29
    }, 
    "21_day": {
        "Gadgets": 311, 
        "Binoculars": 271, 
        "Books": 170, 
        "Apparel": 343, 
        "Posters": 122, 
        "Star Maps": 341, 
        "Telescopes": 333
    }, 
    "6_day": {
        "Gadgets": 877, 
        "Binoculars": 619, 
        "Books": 524, 
        "Apparel": 833, 
        "Posters": 414, 
        "Star Maps": 939, 
        "Telescopes": 940
    }, 
    "29_day": {
        "Gadgets": 63, 
        "Binoculars": 4, 
        "Books": 22, 
        "Apparel": 45, 
        "Posters": 28, 
        "Star Maps": 13, 
        "Telescopes": 6
    }, 
    "17_day": {
        "Gadgets": 507, 
        "Binoculars": 386, 
        "Books": 219, 
        "Apparel": 511, 
        "Posters": 223, 
        "Star Maps": 491, 
        "Telescopes": 498
    }
}


AVG_ABANDON_RATE = {
    "7_day": {
        "Gadgets": "84.5%", 
        "Binoculars": "82.2%", 
        "Books": "85.6%", 
        "Apparel": "85.3%", 
        "Posters": "84.7%", 
        "Star Maps": "83.2%", 
        "Telescopes": "84.4%"
    }, 
    "13_day": {
        "Gadgets": "84.5%", 
        "Binoculars": "81.4%", 
        "Books": "87.1%", 
        "Apparel": "84.9%", 
        "Posters": "86.7%", 
        "Star Maps": "81.9%", 
        "Telescopes": "85.1%"
    }, 
    "16_day": {
        "Gadgets": "84.3%", 
        "Binoculars": "80.9%", 
        "Books": "87.1%", 
        "Apparel": "84.2%", 
        "Posters": "85.3%", 
        "Star Maps": "81.3%", 
        "Telescopes": "85.0%"
    }, 
    "12_day": {
        "Binoculars": "82.2%", 
        "Gadgets": "84.5%", 
        "Books": "85.9%", 
        "Apparel": "85.1%", 
        "Posters": "86.6%", 
        "Star Maps": "81.8%", 
        "Telescopes": "84.4%"
    }, 
    "11_day": {
        "Gadgets": "84.8%", 
        "Binoculars": "81.6%", 
        "Books": "86.2%", 
        "Apparel": "85.1%", 
        "Posters": "86.9%", 
        "Star Maps": "82.3%", 
        "Telescopes": "84.2%"
    }, 
    "24_day": {
        "Binoculars": "82.1%", 
        "Gadgets": "85.9%", 
        "Books": "90.5%", 
        "Apparel": "81.9%", 
        "Posters": "84.6%", 
        "Star Maps": "80.4%", 
        "Telescopes": "86.5%"
    }, 
    "10_day": {
        "Gadgets": "84.9%", 
        "Binoculars": "81.9%", 
        "Books": "85.0%", 
        "Apparel": "85.2%", 
        "Posters": "86.5%", 
        "Star Maps": "82.4%", 
        "Telescopes": "84.0%"
    }, 
    "9_day": {
        "Gadgets": "84.9%", 
        "Binoculars": "81.9%", 
        "Books": "85.5%", 
        "Apparel": "85.1%", 
        "Posters": "85.2%", 
        "Star Maps": "82.7%", 
        "Telescopes": "84.1%"
    }, 
    "14_day": {
        "Gadgets": "84.2%", 
        "Binoculars": "81.4%", 
        "Books": "87.5%", 
        "Apparel": "84.8%", 
        "Posters": "85.7%", 
        "Star Maps": "81.7%", 
        "Telescopes": "85.3%"
    }, 
    "3_day": {
        "Gadgets": "84.8%", 
        "Binoculars": "82.1%", 
        "Books": "85.7%", 
        "Apparel": "85.5%", 
        "Posters": "84.7%", 
        "Star Maps": "83.4%", 
        "Telescopes": "84.6%"
    }, 
    "22_day": {
        "Binoculars": "83.6%", 
        "Gadgets": "85.1%", 
        "Books": "88.7%", 
        "Apparel": "83.7%", 
        "Posters": "86.1%", 
        "Star Maps": "81.4%", 
        "Telescopes": "85.4%"
    }, 
    "26_day": {
        "Binoculars": "86.2%", 
        "Gadgets": "84.0%", 
        "Books": "90.9%", 
        "Apparel": "80.9%", 
        "Posters": "84.6%", 
        "Star Maps": "80.6%", 
        "Telescopes": "87.3%"
    }, 
    "23_day": {
        "Gadgets": "84.5%", 
        "Binoculars": "82.1%", 
        "Books": "88.7%", 
        "Apparel": "83.3%", 
        "Posters": "86.1%", 
        "Star Maps": "80.6%", 
        "Telescopes": "86.3%"
    }, 
    "27_day": {
        "Binoculars": "85.5%", 
        "Gadgets": "84.4%", 
        "Books": "90.8%", 
        "Apparel": "80.2%", 
        "Posters": "84.6%", 
        "Star Maps": "78.3%", 
        "Telescopes": "86.6%"
    }, 
    "4_day": {
        "Binoculars": "82.0%", 
        "Gadgets": "84.7%", 
        "Books": "85.9%", 
        "Apparel": "85.2%", 
        "Posters": "84.6%", 
        "Star Maps": "83.6%", 
        "Telescopes": "84.7%"
    }, 
    "30_day": {
        "Gadgets": "94.6%"
    }, 
    "8_day": {
        "Binoculars": "82.2%", 
        "Gadgets": "84.9%", 
        "Books": "85.3%", 
        "Apparel": "85.3%", 
        "Posters": "85.2%", 
        "Star Maps": "82.6%", 
        "Telescopes": "83.9%"
    }, 
    "5_day": {
        "Binoculars": "82.0%", 
        "Gadgets": "84.8%", 
        "Books": "85.6%", 
        "Apparel": "85.3%", 
        "Posters": "84.7%", 
        "Star Maps": "83.6%", 
        "Telescopes": "84.3%"
    }, 
    "1_day": {
        "Gadgets": "83.7%", 
        "Binoculars": "82.0%", 
        "Books": "84.8%", 
        "Apparel": "85.5%", 
        "Posters": "84.8%", 
        "Star Maps": "83.3%", 
        "Telescopes": "83.5%"
    }, 
    "19_day": {
        "Gadgets": "84.8%", 
        "Binoculars": "83.1%", 
        "Books": "87.1%", 
        "Apparel": "84.1%", 
        "Posters": "86.1%", 
        "Star Maps": "83.0%", 
        "Telescopes": "85.9%"
    }, 
    "25_day": {
        "Binoculars": "84.2%", 
        "Gadgets": "86.0%", 
        "Books": "90.3%", 
        "Apparel": "82.6%", 
        "Posters": "84.6%", 
        "Star Maps": "79.5%", 
        "Telescopes": "86.0%"
    }, 
    "15_day": {
        "Binoculars": "81.2%", 
        "Gadgets": "84.3%", 
        "Books": "87.4%", 
        "Apparel": "84.9%", 
        "Posters": "85.7%", 
        "Star Maps": "81.6%", 
        "Telescopes": "85.2%"
    }, 
    "2_day": {
        "Gadgets": "84.0%", 
        "Binoculars": "82.2%", 
        "Books": "84.7%", 
        "Apparel": "85.4%", 
        "Posters": "84.7%", 
        "Star Maps": "83.4%", 
        "Telescopes": "83.7%"
    }, 
    "20_day": {
        "Gadgets": "84.1%", 
        "Binoculars": "83.1%", 
        "Books": "86.5%", 
        "Apparel": "83.5%", 
        "Posters": "86.4%", 
        "Star Maps": "82.4%", 
        "Telescopes": "85.6%"
    }, 
    "18_day": {
        "Gadgets": "84.3%", 
        "Binoculars": "81.7%", 
        "Books": "87.6%", 
        "Apparel": "83.9%", 
        "Posters": "86.1%", 
        "Star Maps": "83.3%", 
        "Telescopes": "85.2%"
    }, 
    "28_day": {
        "Gadgets": "84.3%", 
        "Binoculars": "83.4%", 
        "Books": "88.0%", 
        "Apparel": "77.4%", 
        "Posters": "82.6%", 
        "Star Maps": "77.3%", 
        "Telescopes": "89.1%"
    }, 
    "21_day": {
        "Gadgets": "85.2%", 
        "Binoculars": "83.3%", 
        "Books": "87.0%", 
        "Apparel": "82.8%", 
        "Posters": "87.1%", 
        "Star Maps": "81.7%", 
        "Telescopes": "85.6%"
    }, 
    "6_day": {
        "Gadgets": "84.7%", 
        "Binoculars": "82.3%", 
        "Books": "85.6%", 
        "Apparel": "85.4%", 
        "Posters": "84.7%", 
        "Star Maps": "83.5%", 
        "Telescopes": "84.4%"
    }, 
    "29_day": {
        "Gadgets": "82.1%", 
        "Binoculars": "87.3%", 
        "Books": "88.0%", 
        "Apparel": "75.5%", 
        "Posters": "81.2%", 
        "Star Maps": "65.1%", 
        "Telescopes": "77.6%"
    }, 
    "17_day": {
        "Gadgets": "83.9%", 
        "Binoculars": "80.9%", 
        "Books": "87.5%", 
        "Apparel": "84.1%", 
        "Posters": "85.4%", 
        "Star Maps": "82.7%", 
        "Telescopes": "85.2%"
    }
}


CATEGORY_BY_PRODUCT = {
    "7_day": {
        "Binoculars": 17659, 
        "Gadgets": 53140, 
        "Books": 35736, 
        "Apparel": 43212, 
        "Posters": 26072, 
        "Star Maps": 34915, 
        "Telescopes": 19990
    }, 
    "13_day": {
        "Binoculars": 12565, 
        "Gadgets": 42205, 
        "Books": 21818, 
        "Apparel": 33494, 
        "Posters": 16682, 
        "Star Maps": 24311, 
        "Telescopes": 14000
    }, 
    "16_day": {
        "Binoculars": 11262, 
        "Gadgets": 32774, 
        "Books": 20016, 
        "Apparel": 28120, 
        "Posters": 14594, 
        "Star Maps": 21397, 
        "Telescopes": 11806
    }, 
    "12_day": {
        "Binoculars": 13793, 
        "Gadgets": 42797, 
        "Books": 23224, 
        "Apparel": 34922, 
        "Posters": 18155, 
        "Star Maps": 25237, 
        "Telescopes": 15278
    }, 
    "11_day": {
        "Binoculars": 14865, 
        "Gadgets": 43967, 
        "Books": 25295, 
        "Apparel": 38761, 
        "Posters": 20143, 
        "Star Maps": 26853, 
        "Telescopes": 16228
    }, 
    "24_day": {
        "Binoculars": 6779, 
        "Gadgets": 13663, 
        "Books": 9720, 
        "Apparel": 11819, 
        "Posters": 5063, 
        "Star Maps": 9049, 
        "Telescopes": 5481
    }, 
    "10_day": {
        "Binoculars": 15604, 
        "Gadgets": 48053, 
        "Books": 28662, 
        "Apparel": 40952, 
        "Posters": 20651, 
        "Star Maps": 28564, 
        "Telescopes": 17366
    }, 
    "9_day": {
        "Binoculars": 15816, 
        "Gadgets": 51234, 
        "Books": 31180, 
        "Apparel": 41337, 
        "Posters": 24318, 
        "Star Maps": 29899, 
        "Telescopes": 17726
    }, 
    "14_day": {
        "Binoculars": 12565, 
        "Gadgets": 39183, 
        "Books": 21347, 
        "Apparel": 30718, 
        "Posters": 14986, 
        "Star Maps": 23560, 
        "Telescopes": 13125
    }, 
    "3_day": {
        "Binoculars": 22107, 
        "Gadgets": 59818, 
        "Books": 42503, 
        "Apparel": 48757, 
        "Posters": 28756, 
        "Star Maps": 41636, 
        "Telescopes": 24484
    }, 
    "22_day": {
        "Binoculars": 8172, 
        "Gadgets": 17411, 
        "Books": 11494, 
        "Apparel": 16265, 
        "Posters": 7040, 
        "Star Maps": 12185, 
        "Telescopes": 7822
    }, 
    "26_day": {
        "Binoculars": 3307, 
        "Gadgets": 8907, 
        "Books": 6740, 
        "Apparel": 6746, 
        "Posters": 3102, 
        "Star Maps": 5080, 
        "Telescopes": 3311
    }, 
    "23_day": {
        "Binoculars": 7155, 
        "Gadgets": 15503, 
        "Books": 11494, 
        "Apparel": 14893, 
        "Posters": 7040, 
        "Star Maps": 9664, 
        "Telescopes": 6490
    }, 
    "27_day": {
        "Binoculars": 2793, 
        "Gadgets": 6896, 
        "Books": 5992, 
        "Apparel": 4390, 
        "Posters": 3102, 
        "Star Maps": 3666, 
        "Telescopes": 1795
    }, 
    "4_day": {
        "Binoculars": 20487, 
        "Gadgets": 59628, 
        "Books": 40377, 
        "Apparel": 47556, 
        "Posters": 28247, 
        "Star Maps": 39529, 
        "Telescopes": 23139
    }, 
    "30_day": {
        "Gadgets": 334
    }, 
    "8_day": {
        "Binoculars": 17659, 
        "Gadgets": 51678, 
        "Books": 35177, 
        "Apparel": 42293, 
        "Posters": 25462, 
        "Star Maps": 31845, 
        "Telescopes": 18287
    }, 
    "5_day": {
        "Binoculars": 18722, 
        "Gadgets": 58244, 
        "Books": 38060, 
        "Apparel": 46603, 
        "Posters": 27580, 
        "Star Maps": 37291, 
        "Telescopes": 21976
    }, 
    "1_day": {
        "Binoculars": 22619, 
        "Gadgets": 62928, 
        "Books": 44271, 
        "Apparel": 50616, 
        "Posters": 29640, 
        "Star Maps": 45461, 
        "Telescopes": 26758
    }, 
    "19_day": {
        "Binoculars": 9291, 
        "Gadgets": 23459, 
        "Books": 15998, 
        "Apparel": 22026, 
        "Posters": 11592, 
        "Star Maps": 16737, 
        "Telescopes": 10063
    }, 
    "25_day": {
        "Binoculars": 5364, 
        "Gadgets": 10395, 
        "Books": 8544, 
        "Apparel": 8814, 
        "Posters": 3102, 
        "Star Maps": 6565, 
        "Telescopes": 4791
    }, 
    "15_day": {
        "Binoculars": 12326, 
        "Gadgets": 32774, 
        "Books": 20787, 
        "Apparel": 30056, 
        "Posters": 14986, 
        "Star Maps": 22989, 
        "Telescopes": 12474
    }, 
    "2_day": {
        "Binoculars": 22343, 
        "Gadgets": 62218, 
        "Books": 43733, 
        "Apparel": 49209, 
        "Posters": 28756, 
        "Star Maps": 43050, 
        "Telescopes": 25838
    }, 
    "20_day": {
        "Binoculars": 9291, 
        "Gadgets": 20230, 
        "Books": 14944, 
        "Apparel": 19710, 
        "Posters": 10564, 
        "Star Maps": 15550, 
        "Telescopes": 9163
    }, 
    "18_day": {
        "Binoculars": 10252, 
        "Gadgets": 27326, 
        "Books": 16888, 
        "Apparel": 23564, 
        "Posters": 12049, 
        "Star Maps": 17884, 
        "Telescopes": 11147
    }, 
    "28_day": {
        "Binoculars": 2119, 
        "Gadgets": 6096, 
        "Books": 2014, 
        "Apparel": 2793, 
        "Posters": 2693, 
        "Star Maps": 2713, 
        "Telescopes": 894
    }, 
    "21_day": {
        "Binoculars": 8731, 
        "Gadgets": 19041, 
        "Books": 13512, 
        "Apparel": 18685, 
        "Posters": 8715, 
        "Star Maps": 13605, 
        "Telescopes": 8390
    }, 
    "6_day": {
        "Binoculars": 18211, 
        "Gadgets": 54255, 
        "Books": 38060, 
        "Apparel": 43589, 
        "Posters": 27580, 
        "Star Maps": 36561, 
        "Telescopes": 21153
    }, 
    "29_day": {
        "Binoculars": 282, 
        "Gadgets": 4392, 
        "Books": 2014, 
        "Apparel": 2420, 
        "Posters": 1512, 
        "Star Maps": 524, 
        "Telescopes": 192
    }, 
    "17_day": {
        "Binoculars": 11092, 
        "Gadgets": 30441, 
        "Books": 17799, 
        "Apparel": 26625, 
        "Posters": 13721, 
        "Star Maps": 19494, 
        "Telescopes": 11358
    }
}


TRAFFIC_SOURCE_BY_PERCENTAGE = {
    "7_day": {
        "organic": "42.315%", 
        "paid_search": "21.338%", 
        "social": "16.275%", 
        "email": "11.031%", 
        "referral": "9.042%"
    }, 
    "13_day": {
        "organic": "42.054%", 
        "paid_search": "22.983%", 
        "social": "16.626%", 
        "email": "9.291%", 
        "referral": "9.046%"
    }, 
    "16_day": {
        "organic": "41.543%", 
        "paid_search": "21.958%", 
        "social": "16.617%", 
        "email": "10.089%", 
        "referral": "9.792%"
    }, 
    "12_day": {
        "organic": "42.725%", 
        "paid_search": "21.940%", 
        "social": "16.166%", 
        "email": "10.162%", 
        "referral": "9.007%"
    }, 
    "11_day": {
        "organic": "43.764%", 
        "paid_search": "21.444%", 
        "social": "15.755%", 
        "email": "10.066%", 
        "referral": "8.972%"
    }, 
    "24_day": {
        "organic": "42.069%", 
        "paid_search": "24.828%", 
        "social": "13.793%", 
        "referral": "10.345%", 
        "email": "8.966%"
    }, 
    "10_day": {
        "organic": "43.659%", 
        "paid_search": "20.998%", 
        "social": "16.216%", 
        "email": "9.979%", 
        "referral": "9.148%"
    }, 
    "9_day": {
        "organic": "42.970%", 
        "paid_search": "21.386%", 
        "social": "16.040%", 
        "email": "10.693%", 
        "referral": "8.911%"
    }, 
    "14_day": {
        "organic": "41.039%", 
        "paid_search": "23.117%", 
        "social": "17.143%", 
        "email": "9.610%", 
        "referral": "9.091%"
    }, 
    "3_day": {
        "organic": "43.297%", 
        "paid_search": "19.723%", 
        "social": "16.641%", 
        "email": "10.940%", 
        "referral": "9.399%"
    }, 
    "22_day": {
        "organic": "40.933%", 
        "paid_search": "23.316%", 
        "social": "17.098%", 
        "email": "10.363%", 
        "referral": "8.290%"
    }, 
    "26_day": {
        "organic": "41.237%", 
        "paid_search": "22.680%", 
        "social": "13.402%", 
        "referral": "12.371%", 
        "email": "10.309%"
    }, 
    "23_day": {
        "organic": "40.237%", 
        "paid_search": "24.260%", 
        "social": "15.385%", 
        "email": "11.243%", 
        "referral": "8.876%"
    }, 
    "27_day": {
        "organic": "45.205%", 
        "paid_search": "20.548%", 
        "social": "15.068%", 
        "email": "10.959%", 
        "referral": "8.219%"
    }, 
    "4_day": {
        "organic": "43.040%", 
        "paid_search": "20.000%", 
        "social": "16.320%", 
        "email": "11.200%", 
        "referral": "9.440%"
    }, 
    "30_day": {
        "organic": "100.000%"
    }, 
    "8_day": {
        "organic": "42.344%", 
        "paid_search": "21.361%", 
        "social": "16.257%", 
        "email": "10.964%", 
        "referral": "9.074%"
    }, 
    "5_day": {
        "organic": "42.596%", 
        "paid_search": "20.632%", 
        "social": "16.473%", 
        "email": "10.982%", 
        "referral": "9.318%"
    }, 
    "1_day": {
        "organic": "43.185%", 
        "paid_search": "19.512%", 
        "social": "16.930%", 
        "email": "11.191%", 
        "referral": "9.182%"
    }, 
    "19_day": {
        "organic": "41.132%", 
        "paid_search": "23.396%", 
        "social": "16.226%", 
        "email": "10.189%", 
        "referral": "9.057%"
    }, 
    "25_day": {
        "organic": "43.802%", 
        "paid_search": "23.140%", 
        "social": "12.397%", 
        "referral": "10.744%", 
        "email": "9.917%"
    }, 
    "15_day": {
        "organic": "40.997%", 
        "paid_search": "22.992%", 
        "social": "17.175%", 
        "referral": "9.418%", 
        "email": "9.418%"
    }, 
    "2_day": {
        "organic": "43.239%", 
        "paid_search": "19.465%", 
        "social": "16.790%", 
        "email": "11.293%", 
        "referral": "9.212%"
    }, 
    "20_day": {
        "organic": "41.079%", 
        "paid_search": "23.237%", 
        "social": "16.598%", 
        "email": "9.959%", 
        "referral": "9.129%"
    }, 
    "18_day": {
        "organic": "41.869%", 
        "paid_search": "22.491%", 
        "social": "16.609%", 
        "email": "9.689%", 
        "referral": "9.343%"
    }, 
    "28_day": {
        "organic": "44.898%", 
        "paid_search": "22.449%", 
        "email": "12.245%", 
        "social": "12.245%", 
        "referral": "8.163%"
    }, 
    "21_day": {
        "organic": "40.553%", 
        "paid_search": "22.581%", 
        "social": "17.051%", 
        "email": "10.599%", 
        "referral": "9.217%"
    }, 
    "6_day": {
        "organic": "42.288%", 
        "paid_search": "21.144%", 
        "social": "16.464%", 
        "email": "10.919%", 
        "referral": "9.185%"
    }, 
    "29_day": {
        "organic": "40.000%", 
        "paid_search": "24.000%", 
        "email": "16.000%", 
        "social": "12.000%", 
        "referral": "8.000%"
    }, 
    "17_day": {
        "organic": "40.895%", 
        "paid_search": "22.364%", 
        "social": "16.933%", 
        "email": "10.224%", 
        "referral": "9.585%"
    }
}


REVENUE_BY_TOP_CATEGORY = {
    "7_day": {
        "Telescopes": 88921.8, 
        "Star Maps": 87931.58, 
        "Gadgets": 82693.86, 
        "Apparel": 79456.87, 
        "Binoculars": 56733.1, 
        "Books": 47250.98, 
        "Posters": 36395.93
    }, 
    "13_day": {
        "Gadgets": 65432.96, 
        "Apparel": 62305.47, 
        "Telescopes": 60273.25, 
        "Star Maps": 56810.19, 
        "Binoculars": 42205.47, 
        "Books": 26068.73, 
        "Posters": 23274.42
    }, 
    "16_day": {
        "Apparel": 52813.07, 
        "Telescopes": 51436.58, 
        "Gadgets": 50945.37, 
        "Star Maps": 49363.82, 
        "Binoculars": 37376.49, 
        "Books": 22898.29, 
        "Posters": 20980.08
    }, 
    "12_day": {
        "Telescopes": 69284.25, 
        "Gadgets": 66470.21, 
        "Apparel": 66078.49, 
        "Star Maps": 63969.43, 
        "Binoculars": 45532.72, 
        "Books": 31359.83, 
        "Posters": 25746.38
    }, 
    "11_day": {
        "Telescopes": 72875.86, 
        "Apparel": 71421.85, 
        "Star Maps": 67793.47, 
        "Gadgets": 67443.18, 
        "Binoculars": 50013.85, 
        "Books": 33843.26, 
        "Posters": 27542.28
    }, 
    "24_day": {
        "Binoculars": 21301.11, 
        "Gadgets": 21068.44, 
        "Star Maps": 20779.19, 
        "Apparel": 20447.29, 
        "Telescopes": 20315.27, 
        "Books": 10255.97, 
        "Posters": 8674.39
    }, 
    "10_day": {
        "Telescopes": 77826.54, 
        "Apparel": 76303.08, 
        "Gadgets": 73999.03, 
        "Star Maps": 71332.19, 
        "Binoculars": 51439.6, 
        "Books": 40162.09, 
        "Posters": 28197.33
    }, 
    "9_day": {
        "Gadgets": 80836.12, 
        "Telescopes": 78559.14, 
        "Apparel": 77390.46, 
        "Star Maps": 74757.91, 
        "Binoculars": 52561.6, 
        "Books": 42820.63, 
        "Posters": 33829.87
    }, 
    "14_day": {
        "Gadgets": 61454.63, 
        "Apparel": 57359.56, 
        "Telescopes": 55773.0, 
        "Star Maps": 55213.79, 
        "Binoculars": 42205.47, 
        "Books": 24622.88, 
        "Posters": 21321.28
    }, 
    "3_day": {
        "Telescopes": 105705.38, 
        "Star Maps": 103020.48, 
        "Gadgets": 91541.12, 
        "Apparel": 89073.56, 
        "Binoculars": 68411.44, 
        "Books": 57050.26, 
        "Posters": 41204.96
    }, 
    "22_day": {
        "Star Maps": 28836.09, 
        "Telescopes": 28591.7, 
        "Apparel": 27196.42, 
        "Gadgets": 26421.32, 
        "Binoculars": 24327.84, 
        "Books": 11969.91, 
        "Posters": 11459.01
    }, 
    "26_day": {
        "Gadgets": 13523.39, 
        "Apparel": 12506.35, 
        "Telescopes": 11985.31, 
        "Star Maps": 10782.57, 
        "Binoculars": 8931.02, 
        "Books": 7320.92, 
        "Posters": 6293.05
    }, 
    "23_day": {
        "Apparel": 25563.06, 
        "Telescopes": 24417.58, 
        "Gadgets": 24137.71, 
        "Binoculars": 21909.78, 
        "Star Maps": 21901.83, 
        "Books": 11969.91, 
        "Posters": 11459.01
    }, 
    "27_day": {
        "Apparel": 9286.32, 
        "Gadgets": 9217.19, 
        "Star Maps": 8229.54, 
        "Binoculars": 7726.56, 
        "Telescopes": 6813.4, 
        "Posters": 6293.05, 
        "Books": 5886.9
    }, 
    "4_day": {
        "Telescopes": 100394.93, 
        "Star Maps": 98753.16, 
        "Gadgets": 91394.98, 
        "Apparel": 87035.67, 
        "Binoculars": 64731.24, 
        "Books": 53404.08, 
        "Posters": 39347.6
    }, 
    "30_day": {
        "Gadgets": 71.44
    }, 
    "8_day": {
        "Telescopes": 82906.25, 
        "Gadgets": 81104.32, 
        "Star Maps": 80010.96, 
        "Apparel": 78234.52, 
        "Binoculars": 56733.1, 
        "Books": 47091.77, 
        "Posters": 35140.07
    }, 
    "5_day": {
        "Telescopes": 95892.08, 
        "Star Maps": 92374.78, 
        "Gadgets": 89582.87, 
        "Apparel": 85699.68, 
        "Binoculars": 60020.22, 
        "Books": 50885.02, 
        "Posters": 38681.6
    }, 
    "1_day": {
        "Telescopes": 120567.05, 
        "Star Maps": 113439.41, 
        "Gadgets": 98860.4, 
        "Apparel": 93055.53, 
        "Binoculars": 70224.52, 
        "Books": 59425.04, 
        "Posters": 42765.72
    }, 
    "19_day": {
        "Telescopes": 39469.23, 
        "Star Maps": 37499.16, 
        "Apparel": 36648.61, 
        "Gadgets": 33427.61, 
        "Binoculars": 27744.14, 
        "Books": 18647.69, 
        "Posters": 17035.15
    }, 
    "25_day": {
        "Telescopes": 17173.49, 
        "Apparel": 15701.76, 
        "Gadgets": 15697.76, 
        "Binoculars": 15488.83, 
        "Star Maps": 15147.7, 
        "Books": 9266.45, 
        "Posters": 6293.05
    }, 
    "15_day": {
        "Apparel": 56097.37, 
        "Telescopes": 53972.99, 
        "Star Maps": 53777.39, 
        "Gadgets": 50945.37, 
        "Binoculars": 41836.29, 
        "Books": 23650.35, 
        "Posters": 21321.28
    }, 
    "2_day": {
        "Telescopes": 116889.57, 
        "Star Maps": 107183.78, 
        "Gadgets": 97834.31, 
        "Apparel": 90376.44, 
        "Binoculars": 69480.93, 
        "Books": 58861.16, 
        "Posters": 41204.96
    }, 
    "20_day": {
        "Star Maps": 35917.61, 
        "Telescopes": 34866.6, 
        "Apparel": 33981.73, 
        "Gadgets": 29812.5, 
        "Binoculars": 27744.14, 
        "Books": 17383.08, 
        "Posters": 15275.42
    }, 
    "18_day": {
        "Telescopes": 44754.23, 
        "Gadgets": 40716.17, 
        "Apparel": 40190.1, 
        "Star Maps": 40189.22, 
        "Binoculars": 31722.76, 
        "Books": 19228.85, 
        "Posters": 18359.28
    }, 
    "28_day": {
        "Gadgets": 7750.07, 
        "Star Maps": 6132.14, 
        "Binoculars": 6038.99, 
        "Posters": 4985.37, 
        "Apparel": 4861.3, 
        "Telescopes": 2656.77, 
        "Books": 1835.27
    }, 
    "21_day": {
        "Apparel": 32516.13, 
        "Star Maps": 32473.87, 
        "Telescopes": 30048.28, 
        "Gadgets": 27999.92, 
        "Binoculars": 25804.24, 
        "Books": 15760.67, 
        "Posters": 13167.53
    }, 
    "6_day": {
        "Telescopes": 93262.5, 
        "Star Maps": 91250.66, 
        "Gadgets": 83282.86, 
        "Apparel": 79785.31, 
        "Binoculars": 58170.28, 
        "Books": 50885.02, 
        "Posters": 38681.6
    }, 
    "29_day": {
        "Gadgets": 5731.45, 
        "Apparel": 4290.4, 
        "Posters": 3166.01, 
        "Books": 1835.27, 
        "Star Maps": 1245.94, 
        "Telescopes": 645.92, 
        "Binoculars": 615.24
    }, 
    "17_day": {
        "Apparel": 48842.4, 
        "Gadgets": 47990.98, 
        "Telescopes": 46420.51, 
        "Star Maps": 45359.34, 
        "Binoculars": 37090.49, 
        "Books": 20655.65, 
        "Posters": 20566.8
    }
}


REVENUE_BY_TRAFFIC_SOURCE = {
    "7_day": {
        "paid_search": 104715.01, 
        "referral": 47039.77, 
        "organic": 186876.97, 
        "email": 58848.17, 
        "social": 81904.2
    }, 
    "13_day": {
        "paid_search": 75940.34, 
        "referral": 34430.94, 
        "organic": 130466.58, 
        "email": 35572.45, 
        "social": 59960.18
    }, 
    "16_day": {
        "paid_search": 59201.72, 
        "referral": 31121.37, 
        "organic": 111996.11, 
        "email": 33265.77, 
        "social": 50228.73
    }, 
    "12_day": {
        "paid_search": 77171.86, 
        "referral": 35922.19, 
        "organic": 147372.35, 
        "email": 43669.59, 
        "social": 64305.32
    }, 
    "11_day": {
        "paid_search": 78891.22, 
        "referral": 38145.63, 
        "organic": 161315.83, 
        "email": 45236.43, 
        "social": 67344.64
    }, 
    "24_day": {
        "paid_search": 31210.41, 
        "referral": 12037.16, 
        "organic": 48980.99, 
        "email": 12090.5, 
        "social": 18522.6
    }, 
    "10_day": {
        "paid_search": 85835.05, 
        "referral": 42954.69, 
        "organic": 169531.71, 
        "email": 46718.52, 
        "social": 74219.89
    }, 
    "9_day": {
        "paid_search": 93301.2, 
        "referral": 43358.94, 
        "organic": 175242.58, 
        "email": 53316.35, 
        "social": 75536.66
    }, 
    "14_day": {
        "paid_search": 70752.31, 
        "referral": 32916.9, 
        "organic": 121853.74, 
        "email": 34923.28, 
        "social": 57504.38
    }, 
    "3_day": {
        "paid_search": 114591.22, 
        "referral": 55831.21, 
        "organic": 226777.8, 
        "email": 64885.02, 
        "social": 93921.95
    }, 
    "22_day": {
        "paid_search": 36917.9, 
        "referral": 12673.08, 
        "organic": 63441.73, 
        "email": 16457.61, 
        "social": 29311.97
    }, 
    "26_day": {
        "paid_search": 15246.91, 
        "referral": 8431.19, 
        "organic": 29852.85, 
        "email": 7562.44, 
        "social": 10249.22
    }, 
    "23_day": {
        "paid_search": 34358.99, 
        "referral": 12037.16, 
        "organic": 55204.69, 
        "email": 15796.29, 
        "social": 23961.75
    }, 
    "27_day": {
        "paid_search": 9202.37, 
        "referral": 3951.55, 
        "organic": 24488.53, 
        "email": 7044.78, 
        "social": 8765.73
    }, 
    "4_day": {
        "paid_search": 111217.62, 
        "referral": 54165.47, 
        "organic": 216209.69, 
        "email": 64588.17, 
        "social": 88880.71
    }, 
    "30_day": {
        "organic": 71.44
    }, 
    "8_day": {
        "paid_search": 99282.57, 
        "referral": 45689.12, 
        "organic": 178961.88, 
        "email": 57432.86, 
        "social": 79854.56
    }, 
    "5_day": {
        "paid_search": 108935.52, 
        "referral": 51231.91, 
        "organic": 203875.91, 
        "email": 62034.33, 
        "social": 87058.58
    }, 
    "1_day": {
        "paid_search": 121256.66, 
        "referral": 57376.07, 
        "organic": 245236.65, 
        "email": 71424.2, 
        "social": 103044.09
    }, 
    "19_day": {
        "paid_search": 47333.06, 
        "referral": 22274.0, 
        "organic": 84176.37, 
        "email": 21218.9, 
        "social": 35469.26
    }, 
    "25_day": {
        "paid_search": 20406.59, 
        "referral": 10638.07, 
        "organic": 40656.74, 
        "email": 11100.98, 
        "social": 11966.66
    }, 
    "15_day": {
        "paid_search": 65256.75, 
        "referral": 32280.15, 
        "organic": 116413.28, 
        "email": 33265.77, 
        "social": 54385.09
    }, 
    "2_day": {
        "paid_search": 116391.74, 
        "referral": 56120.74, 
        "organic": 238501.09, 
        "email": 70574.33, 
        "social": 100243.25
    }, 
    "20_day": {
        "paid_search": 43371.33, 
        "referral": 20074.4, 
        "organic": 79006.32, 
        "email": 19121.54, 
        "social": 33407.49
    }, 
    "18_day": {
        "paid_search": 48845.76, 
        "referral": 25546.04, 
        "organic": 96027.8, 
        "email": 22668.66, 
        "social": 42072.35
    }, 
    "28_day": {
        "paid_search": 5968.95, 
        "referral": 2381.55, 
        "organic": 17710.09, 
        "email": 3867.8, 
        "social": 4331.52
    }, 
    "21_day": {
        "paid_search": 39309.34, 
        "referral": 17269.26, 
        "organic": 71065.23, 
        "email": 18792.19, 
        "social": 31334.62
    }, 
    "6_day": {
        "paid_search": 107002.03, 
        "referral": 48789.75, 
        "organic": 194933.14, 
        "email": 60384.21, 
        "social": 84209.1
    }, 
    "29_day": {
        "paid_search": 2824.5, 
        "referral": 1886.18, 
        "organic": 8086.3, 
        "email": 2898.94, 
        "social": 1834.31
    }, 
    "17_day": {
        "paid_search": 54966.51, 
        "referral": 29567.17, 
        "organic": 101979.49, 
        "email": 31701.05, 
        "social": 48711.95
    }
}


TOTAL_ORDERS_PER_MONTH = {
    "7_day": {
        "Sep-2026": 6667, 
        "Oct-2026": 511
    }, 
    "13_day": {
        "Sep-2026": 4576, 
        "Oct-2026": 511
    }, 
    "16_day": {
        "Sep-2026": 3821, 
        "Oct-2026": 511
    }, 
    "12_day": {
        "Sep-2026": 4998, 
        "Oct-2026": 511
    }, 
    "11_day": {
        "Sep-2026": 5339, 
        "Oct-2026": 511
    }, 
    "24_day": {
        "Sep-2026": 1321, 
        "Oct-2026": 511
    }, 
    "10_day": {
        "Sep-2026": 5787, 
        "Oct-2026": 511
    }, 
    "9_day": {
        "Sep-2026": 6090, 
        "Oct-2026": 511
    }, 
    "14_day": {
        "Sep-2026": 4309, 
        "Oct-2026": 511
    }, 
    "3_day": {
        "Sep-2026": 7827, 
        "Oct-2026": 511
    }, 
    "22_day": {
        "Sep-2026": 1905, 
        "Oct-2026": 511
    }, 
    "26_day": {
        "Sep-2026": 531, 
        "Oct-2026": 511
    }, 
    "23_day": {
        "Sep-2026": 1629, 
        "Oct-2026": 511
    }, 
    "27_day": {
        "Sep-2026": 257, 
        "Oct-2026": 511
    }, 
    "4_day": {
        "Sep-2026": 7498, 
        "Oct-2026": 511
    }, 
    "30_day": {
        "Oct-2026": 1
    }, 
    "8_day": {
        "Sep-2026": 6397, 
        "Oct-2026": 511
    }, 
    "5_day": {
        "Sep-2026": 7169, 
        "Oct-2026": 511
    }, 
    "1_day": {
        "Sep-2026": 8461, 
        "Oct-2026": 511
    }, 
    "19_day": {
        "Sep-2026": 2702, 
        "Oct-2026": 511
    }, 
    "25_day": {
        "Sep-2026": 885, 
        "Oct-2026": 511
    }, 
    "15_day": {
        "Sep-2026": 4057, 
        "Oct-2026": 511
    }, 
    "2_day": {
        "Sep-2026": 8197, 
        "Oct-2026": 511
    }, 
    "20_day": {
        "Sep-2026": 2467, 
        "Oct-2026": 511
    }, 
    "18_day": {
        "Sep-2026": 3063, 
        "Oct-2026": 511
    }, 
    "28_day": {
        "Oct-2026": 511
    }, 
    "21_day": {
        "Sep-2026": 2206, 
        "Oct-2026": 511
    }, 
    "6_day": {
        "Sep-2026": 6904, 
        "Oct-2026": 511
    }, 
    "29_day": {
        "Oct-2026": 270
    }, 
    "17_day": {
        "Sep-2026": 3530, 
        "Oct-2026": 511
    }
}


CONVERSION_RATE_PER_MONTH = {
    "7_day": {
        "Sep-2026": "11.861%", 
        "Oct-2026": "1.092%"
    }, 
    "13_day": {
        "Sep-2026": "8.438%", 
        "Oct-2026": "1.092%"
    }, 
    "16_day": {
        "Sep-2026": "6.839%", 
        "Oct-2026": "1.092%"
    }, 
    "12_day": {
        "Sep-2026": "9.177%", 
        "Oct-2026": "1.092%"
    }, 
    "11_day": {
        "Sep-2026": "9.667%", 
        "Oct-2026": "1.092%"
    }, 
    "24_day": {
        "Sep-2026": "2.211%", 
        "Oct-2026": "1.092%"
    }, 
    "10_day": {
        "Sep-2026": "10.306%", 
        "Oct-2026": "1.092%"
    }, 
    "9_day": {
        "Sep-2026": "10.840%", 
        "Oct-2026": "1.092%"
    }, 
    "14_day": {
        "Sep-2026": "7.919%", 
        "Oct-2026": "1.092%"
    }, 
    "3_day": {
        "Sep-2026": "13.975%", 
        "Oct-2026": "1.092%"
    }, 
    "22_day": {
        "Sep-2026": "3.252%", 
        "Oct-2026": "1.092%"
    }, 
    "26_day": {
        "Sep-2026": "1.043%", 
        "Oct-2026": "1.092%"
    }, 
    "23_day": {
        "Sep-2026": "2.755%", 
        "Oct-2026": "1.092%"
    }, 
    "27_day": {
        "Sep-2026": "0.506%", 
        "Oct-2026": "1.092%"
    }, 
    "4_day": {
        "Sep-2026": "13.405%", 
        "Oct-2026": "1.092%"
    }, 
    "30_day": {
        "Oct-2026": "0.004%"
    }, 
    "8_day": {
        "Sep-2026": "11.369%", 
        "Oct-2026": "1.092%"
    }, 
    "5_day": {
        "Sep-2026": "12.867%", 
        "Oct-2026": "1.092%"
    }, 
    "1_day": {
        "Sep-2026": "15.372%", 
        "Oct-2026": "1.092%"
    }, 
    "19_day": {
        "Sep-2026": "4.776%", 
        "Oct-2026": "1.092%"
    }, 
    "25_day": {
        "Sep-2026": "1.563%", 
        "Oct-2026": "1.092%"
    }, 
    "15_day": {
        "Sep-2026": "7.372%", 
        "Oct-2026": "1.092%"
    }, 
    "2_day": {
        "Sep-2026": "14.787%", 
        "Oct-2026": "1.092%"
    }, 
    "20_day": {
        "Sep-2026": "4.310%", 
        "Oct-2026": "1.092%"
    }, 
    "18_day": {
        "Sep-2026": "5.392%", 
        "Oct-2026": "1.092%"
    }, 
    "28_day": {
        "Oct-2026": "1.092%"
    }, 
    "21_day": {
        "Sep-2026": "3.804%", 
        "Oct-2026": "1.092%"
    }, 
    "6_day": {
        "Sep-2026": "12.309%", 
        "Oct-2026": "1.092%"
    }, 
    "29_day": {
        "Oct-2026": "0.598%"
    }, 
    "17_day": {
        "Sep-2026": "6.188%", 
        "Oct-2026": "1.092%"
    }
}


NEW_VS_RETURNING_CUSTOMERS = {
    "7_day": {
        "new_customers": [
            {
                "sum": 528.0, 
                "period": "2026-W37"
            }, 
            {
                "sum": 713.0, 
                "period": "2026-W38"
            }, 
            {
                "sum": 634.0, 
                "period": "2026-W39"
            }, 
            {
                "sum": 327.0, 
                "period": "2026-W40"
            }
        ], 
        "returning_customers": [
            {
                "sum": 1141.0, 
                "period": "2026-W37"
            }, 
            {
                "sum": 1583.0, 
                "period": "2026-W38"
            }, 
            {
                "sum": 1537.0, 
                "period": "2026-W39"
            }, 
            {
                "sum": 715.0, 
                "period": "2026-W40"
            }
        ], 
        "grouping": "week"
    }, 
    "13_day": {
        "new_customers": [
            {
                "sum": 582.0, 
                "period": "2026-W38"
            }, 
            {
                "sum": 634.0, 
                "period": "2026-W39"
            }, 
            {
                "sum": 327.0, 
                "period": "2026-W40"
            }
        ], 
        "returning_customers": [
            {
                "sum": 1292.0, 
                "period": "2026-W38"
            }, 
            {
                "sum": 1537.0, 
                "period": "2026-W39"
            }, 
            {
                "sum": 715.0, 
                "period": "2026-W40"
            }
        ], 
        "grouping": "week"
    }, 
    "16_day": {
        "new_customers": [
            {
                "sum": 347.0, 
                "period": "2026-W38"
            }, 
            {
                "sum": 634.0, 
                "period": "2026-W39"
            }, 
            {
                "sum": 327.0, 
                "period": "2026-W40"
            }
        ], 
        "returning_customers": [
            {
                "sum": 772.0, 
                "period": "2026-W38"
            }, 
            {
                "sum": 1537.0, 
                "period": "2026-W39"
            }, 
            {
                "sum": 715.0, 
                "period": "2026-W40"
            }
        ], 
        "grouping": "week"
    }, 
    "12_day": {
        "new_customers": [
            {
                "sum": 713.0, 
                "period": "2026-W38"
            }, 
            {
                "sum": 634.0, 
                "period": "2026-W39"
            }, 
            {
                "sum": 327.0, 
                "period": "2026-W40"
            }
        ], 
        "returning_customers": [
            {
                "sum": 1583.0, 
                "period": "2026-W38"
            }, 
            {
                "sum": 1537.0, 
                "period": "2026-W39"
            }, 
            {
                "sum": 715.0, 
                "period": "2026-W40"
            }
        ], 
        "grouping": "week"
    }, 
    "11_day": {
        "new_customers": [
            {
                "sum": 114.0, 
                "period": "2026-W37"
            }, 
            {
                "sum": 713.0, 
                "period": "2026-W38"
            }, 
            {
                "sum": 634.0, 
                "period": "2026-W39"
            }
        ], 
        "returning_customers": [
            {
                "sum": 227.0, 
                "period": "2026-W37"
            }, 
            {
                "sum": 1583.0, 
                "period": "2026-W38"
            }, 
            {
                "sum": 1537.0, 
                "period": "2026-W39"
            }
        ], 
        "grouping": "week"
    }, 
    "24_day": {
        "new_customers": [
            {
                "sum": 135.0, 
                "period": "2026-09-27"
            }, 
            {
                "sum": 102.0, 
                "period": "2026-09-28"
            }, 
            {
                "sum": 79.0, 
                "period": "2026-09-29"
            }, 
            {
                "sum": 77.0, 
                "period": "2026-09-30"
            }, 
            {
                "sum": 82.0, 
                "period": "2026-10-01"
            }, 
            {
                "sum": 89.0, 
                "period": "2026-10-02"
            }, 
            {
                "sum": 0.0, 
                "period": "2026-10-03"
            }
        ], 
        "returning_customers": [
            {
                "sum": 301.0, 
                "period": "2026-09-27"
            }, 
            {
                "sum": 252.0, 
                "period": "2026-09-28"
            }, 
            {
                "sum": 195.0, 
                "period": "2026-09-29"
            }, 
            {
                "sum": 180.0, 
                "period": "2026-09-30"
            }, 
            {
                "sum": 159.0, 
                "period": "2026-10-01"
            }, 
            {
                "sum": 180.0, 
                "period": "2026-10-02"
            }, 
            {
                "sum": 1.0, 
                "period": "2026-10-03"
            }
        ], 
        "grouping": "day"
    }, 
    "10_day": {
        "new_customers": [
            {
                "sum": 265.0, 
                "period": "2026-W37"
            }, 
            {
                "sum": 713.0, 
                "period": "2026-W38"
            }, 
            {
                "sum": 634.0, 
                "period": "2026-W39"
            }
        ], 
        "returning_customers": [
            {
                "sum": 524.0, 
                "period": "2026-W37"
            }, 
            {
                "sum": 1583.0, 
                "period": "2026-W38"
            }, 
            {
                "sum": 1537.0, 
                "period": "2026-W39"
            }
        ], 
        "grouping": "week"
    }, 
    "9_day": {
        "new_customers": [
            {
                "sum": 347.0, 
                "period": "2026-W37"
            }, 
            {
                "sum": 713.0, 
                "period": "2026-W38"
            }, 
            {
                "sum": 634.0, 
                "period": "2026-W39"
            }, 
            {
                "sum": 327.0, 
                "period": "2026-W40"
            }
        ], 
        "returning_customers": [
            {
                "sum": 745.0, 
                "period": "2026-W37"
            }, 
            {
                "sum": 1583.0, 
                "period": "2026-W38"
            }, 
            {
                "sum": 1537.0, 
                "period": "2026-W39"
            }, 
            {
                "sum": 715.0, 
                "period": "2026-W40"
            }
        ], 
        "grouping": "week"
    }, 
    "14_day": {
        "new_customers": [
            {
                "sum": 504.0, 
                "period": "2026-W38"
            }, 
            {
                "sum": 634.0, 
                "period": "2026-W39"
            }, 
            {
                "sum": 327.0, 
                "period": "2026-W40"
            }
        ], 
        "returning_customers": [
            {
                "sum": 1103.0, 
                "period": "2026-W38"
            }, 
            {
                "sum": 1537.0, 
                "period": "2026-W39"
            }, 
            {
                "sum": 715.0, 
                "period": "2026-W40"
            }
        ], 
        "grouping": "week"
    }, 
    "3_day": {
        "new_customers": [
            {
                "sum": 198.0, 
                "period": "2026-W36"
            }, 
            {
                "sum": 676.0, 
                "period": "2026-W37"
            }, 
            {
                "sum": 713.0, 
                "period": "2026-W38"
            }, 
            {
                "sum": 634.0, 
                "period": "2026-W39"
            }
        ], 
        "returning_customers": [
            {
                "sum": 460.0, 
                "period": "2026-W36"
            }, 
            {
                "sum": 1495.0, 
                "period": "2026-W37"
            }, 
            {
                "sum": 1583.0, 
                "period": "2026-W38"
            }, 
            {
                "sum": 1537.0, 
                "period": "2026-W39"
            }
        ], 
        "grouping": "week"
    }, 
    "22_day": {
        "new_customers": [
            {
                "sum": 402.0, 
                "period": "2026-W39"
            }, 
            {
                "sum": 327.0, 
                "period": "2026-W40"
            }
        ], 
        "returning_customers": [
            {
                "sum": 972.0, 
                "period": "2026-W39"
            }, 
            {
                "sum": 715.0, 
                "period": "2026-W40"
            }
        ], 
        "grouping": "week"
    }, 
    "26_day": {
        "new_customers": [
            {
                "sum": 79.0, 
                "period": "2026-09-29"
            }, 
            {
                "sum": 77.0, 
                "period": "2026-09-30"
            }, 
            {
                "sum": 82.0, 
                "period": "2026-10-01"
            }, 
            {
                "sum": 89.0, 
                "period": "2026-10-02"
            }, 
            {
                "sum": 0.0, 
                "period": "2026-10-03"
            }
        ], 
        "returning_customers": [
            {
                "sum": 195.0, 
                "period": "2026-09-29"
            }, 
            {
                "sum": 180.0, 
                "period": "2026-09-30"
            }, 
            {
                "sum": 159.0, 
                "period": "2026-10-01"
            }, 
            {
                "sum": 180.0, 
                "period": "2026-10-02"
            }, 
            {
                "sum": 1.0, 
                "period": "2026-10-03"
            }
        ], 
        "grouping": "day"
    }, 
    "23_day": {
        "new_customers": [
            {
                "sum": 89.0, 
                "period": "2026-09-26"
            }, 
            {
                "sum": 135.0, 
                "period": "2026-09-27"
            }, 
            {
                "sum": 102.0, 
                "period": "2026-09-28"
            }, 
            {
                "sum": 79.0, 
                "period": "2026-09-29"
            }, 
            {
                "sum": 77.0, 
                "period": "2026-09-30"
            }, 
            {
                "sum": 82.0, 
                "period": "2026-10-01"
            }, 
            {
                "sum": 89.0, 
                "period": "2026-10-02"
            }, 
            {
                "sum": 0.0, 
                "period": "2026-10-03"
            }
        ], 
        "returning_customers": [
            {
                "sum": 219.0, 
                "period": "2026-09-26"
            }, 
            {
                "sum": 301.0, 
                "period": "2026-09-27"
            }, 
            {
                "sum": 252.0, 
                "period": "2026-09-28"
            }, 
            {
                "sum": 195.0, 
                "period": "2026-09-29"
            }, 
            {
                "sum": 180.0, 
                "period": "2026-09-30"
            }, 
            {
                "sum": 159.0, 
                "period": "2026-10-01"
            }, 
            {
                "sum": 180.0, 
                "period": "2026-10-02"
            }, 
            {
                "sum": 1.0, 
                "period": "2026-10-03"
            }
        ], 
        "grouping": "day"
    }, 
    "27_day": {
        "new_customers": [
            {
                "sum": 77.0, 
                "period": "2026-09-30"
            }, 
            {
                "sum": 82.0, 
                "period": "2026-10-01"
            }, 
            {
                "sum": 89.0, 
                "period": "2026-10-02"
            }, 
            {
                "sum": 0.0, 
                "period": "2026-10-03"
            }
        ], 
        "returning_customers": [
            {
                "sum": 180.0, 
                "period": "2026-09-30"
            }, 
            {
                "sum": 159.0, 
                "period": "2026-10-01"
            }, 
            {
                "sum": 180.0, 
                "period": "2026-10-02"
            }, 
            {
                "sum": 1.0, 
                "period": "2026-10-03"
            }
        ], 
        "grouping": "day"
    }, 
    "4_day": {
        "new_customers": [
            {
                "sum": 107.0, 
                "period": "2026-W36"
            }, 
            {
                "sum": 676.0, 
                "period": "2026-W37"
            }, 
            {
                "sum": 713.0, 
                "period": "2026-W38"
            }, 
            {
                "sum": 634.0, 
                "period": "2026-W39"
            }
        ], 
        "returning_customers": [
            {
                "sum": 222.0, 
                "period": "2026-W36"
            }, 
            {
                "sum": 1495.0, 
                "period": "2026-W37"
            }, 
            {
                "sum": 1583.0, 
                "period": "2026-W38"
            }, 
            {
                "sum": 1537.0, 
                "period": "2026-W39"
            }
        ], 
        "grouping": "week"
    }, 
    "30_day": {
        "new_customers": [
            {
                "sum": 0.0, 
                "period": "2026-10-03"
            }
        ], 
        "returning_customers": [
            {
                "sum": 1.0, 
                "period": "2026-10-03"
            }
        ], 
        "grouping": "day"
    }, 
    "8_day": {
        "new_customers": [
            {
                "sum": 448.0, 
                "period": "2026-W37"
            }, 
            {
                "sum": 713.0, 
                "period": "2026-W38"
            }, 
            {
                "sum": 634.0, 
                "period": "2026-W39"
            }, 
            {
                "sum": 327.0, 
                "period": "2026-W40"
            }
        ], 
        "returning_customers": [
            {
                "sum": 951.0, 
                "period": "2026-W37"
            }, 
            {
                "sum": 1583.0, 
                "period": "2026-W38"
            }, 
            {
                "sum": 1537.0, 
                "period": "2026-W39"
            }, 
            {
                "sum": 715.0, 
                "period": "2026-W40"
            }
        ], 
        "grouping": "week"
    }, 
    "5_day": {
        "new_customers": [
            {
                "sum": 676.0, 
                "period": "2026-W37"
            }, 
            {
                "sum": 713.0, 
                "period": "2026-W38"
            }, 
            {
                "sum": 634.0, 
                "period": "2026-W39"
            }, 
            {
                "sum": 327.0, 
                "period": "2026-W40"
            }
        ], 
        "returning_customers": [
            {
                "sum": 1495.0, 
                "period": "2026-W37"
            }, 
            {
                "sum": 1583.0, 
                "period": "2026-W38"
            }, 
            {
                "sum": 1537.0, 
                "period": "2026-W39"
            }, 
            {
                "sum": 715.0, 
                "period": "2026-W40"
            }
        ], 
        "grouping": "week"
    }, 
    "1_day": {
        "new_customers": [
            {
                "sum": 391.0, 
                "period": "2026-W36"
            }, 
            {
                "sum": 676.0, 
                "period": "2026-W37"
            }, 
            {
                "sum": 713.0, 
                "period": "2026-W38"
            }, 
            {
                "sum": 634.0, 
                "period": "2026-W39"
            }, 
            {
                "sum": 327.0, 
                "period": "2026-W40"
            }
        ], 
        "returning_customers": [
            {
                "sum": 901.0, 
                "period": "2026-W36"
            }, 
            {
                "sum": 1495.0, 
                "period": "2026-W37"
            }, 
            {
                "sum": 1583.0, 
                "period": "2026-W38"
            }, 
            {
                "sum": 1537.0, 
                "period": "2026-W39"
            }, 
            {
                "sum": 715.0, 
                "period": "2026-W40"
            }
        ], 
        "grouping": "week"
    }, 
    "19_day": {
        "new_customers": [
            {
                "sum": 634.0, 
                "period": "2026-W39"
            }, 
            {
                "sum": 327.0, 
                "period": "2026-W40"
            }
        ], 
        "returning_customers": [
            {
                "sum": 1537.0, 
                "period": "2026-W39"
            }, 
            {
                "sum": 715.0, 
                "period": "2026-W40"
            }
        ], 
        "grouping": "week"
    }, 
    "25_day": {
        "new_customers": [
            {
                "sum": 102.0, 
                "period": "2026-09-28"
            }, 
            {
                "sum": 79.0, 
                "period": "2026-09-29"
            }, 
            {
                "sum": 77.0, 
                "period": "2026-09-30"
            }, 
            {
                "sum": 82.0, 
                "period": "2026-10-01"
            }, 
            {
                "sum": 89.0, 
                "period": "2026-10-02"
            }, 
            {
                "sum": 0.0, 
                "period": "2026-10-03"
            }
        ], 
        "returning_customers": [
            {
                "sum": 252.0, 
                "period": "2026-09-28"
            }, 
            {
                "sum": 195.0, 
                "period": "2026-09-29"
            }, 
            {
                "sum": 180.0, 
                "period": "2026-09-30"
            }, 
            {
                "sum": 159.0, 
                "period": "2026-10-01"
            }, 
            {
                "sum": 180.0, 
                "period": "2026-10-02"
            }, 
            {
                "sum": 1.0, 
                "period": "2026-10-03"
            }
        ], 
        "grouping": "day"
    }, 
    "15_day": {
        "new_customers": [
            {
                "sum": 422.0, 
                "period": "2026-W38"
            }, 
            {
                "sum": 634.0, 
                "period": "2026-W39"
            }, 
            {
                "sum": 327.0, 
                "period": "2026-W40"
            }
        ], 
        "returning_customers": [
            {
                "sum": 933.0, 
                "period": "2026-W38"
            }, 
            {
                "sum": 1537.0, 
                "period": "2026-W39"
            }, 
            {
                "sum": 715.0, 
                "period": "2026-W40"
            }
        ], 
        "grouping": "week"
    }, 
    "2_day": {
        "new_customers": [
            {
                "sum": 304.0, 
                "period": "2026-W36"
            }, 
            {
                "sum": 676.0, 
                "period": "2026-W37"
            }, 
            {
                "sum": 713.0, 
                "period": "2026-W38"
            }, 
            {
                "sum": 634.0, 
                "period": "2026-W39"
            }, 
            {
                "sum": 327.0, 
                "period": "2026-W40"
            }
        ], 
        "returning_customers": [
            {
                "sum": 724.0, 
                "period": "2026-W36"
            }, 
            {
                "sum": 1495.0, 
                "period": "2026-W37"
            }, 
            {
                "sum": 1583.0, 
                "period": "2026-W38"
            }, 
            {
                "sum": 1537.0, 
                "period": "2026-W39"
            }, 
            {
                "sum": 715.0, 
                "period": "2026-W40"
            }
        ], 
        "grouping": "week"
    }, 
    "20_day": {
        "new_customers": [
            {
                "sum": 572.0, 
                "period": "2026-W39"
            }, 
            {
                "sum": 327.0, 
                "period": "2026-W40"
            }
        ], 
        "returning_customers": [
            {
                "sum": 1364.0, 
                "period": "2026-W39"
            }, 
            {
                "sum": 715.0, 
                "period": "2026-W40"
            }
        ], 
        "grouping": "week"
    }, 
    "18_day": {
        "new_customers": [
            {
                "sum": 104.0, 
                "period": "2026-W38"
            }, 
            {
                "sum": 634.0, 
                "period": "2026-W39"
            }
        ], 
        "returning_customers": [
            {
                "sum": 257.0, 
                "period": "2026-W38"
            }, 
            {
                "sum": 1537.0, 
                "period": "2026-W39"
            }
        ], 
        "grouping": "week"
    }, 
    "28_day": {
        "new_customers": [
            {
                "sum": 82.0, 
                "period": "2026-10-01"
            }, 
            {
                "sum": 89.0, 
                "period": "2026-10-02"
            }, 
            {
                "sum": 0.0, 
                "period": "2026-10-03"
            }
        ], 
        "returning_customers": [
            {
                "sum": 159.0, 
                "period": "2026-10-01"
            }, 
            {
                "sum": 180.0, 
                "period": "2026-10-02"
            }, 
            {
                "sum": 1.0, 
                "period": "2026-10-03"
            }
        ], 
        "grouping": "day"
    }, 
    "21_day": {
        "new_customers": [
            {
                "sum": 499.0, 
                "period": "2026-W39"
            }, 
            {
                "sum": 327.0, 
                "period": "2026-W40"
            }
        ], 
        "returning_customers": [
            {
                "sum": 1176.0, 
                "period": "2026-W39"
            }, 
            {
                "sum": 715.0, 
                "period": "2026-W40"
            }
        ], 
        "grouping": "week"
    }, 
    "6_day": {
        "new_customers": [
            {
                "sum": 595.0, 
                "period": "2026-W37"
            }, 
            {
                "sum": 713.0, 
                "period": "2026-W38"
            }, 
            {
                "sum": 634.0, 
                "period": "2026-W39"
            }, 
            {
                "sum": 327.0, 
                "period": "2026-W40"
            }
        ], 
        "returning_customers": [
            {
                "sum": 1311.0, 
                "period": "2026-W37"
            }, 
            {
                "sum": 1583.0, 
                "period": "2026-W38"
            }, 
            {
                "sum": 1537.0, 
                "period": "2026-W39"
            }, 
            {
                "sum": 715.0, 
                "period": "2026-W40"
            }
        ], 
        "grouping": "week"
    }, 
    "29_day": {
        "new_customers": [
            {
                "sum": 89.0, 
                "period": "2026-10-02"
            }, 
            {
                "sum": 0.0, 
                "period": "2026-10-03"
            }
        ], 
        "returning_customers": [
            {
                "sum": 180.0, 
                "period": "2026-10-02"
            }, 
            {
                "sum": 1.0, 
                "period": "2026-10-03"
            }
        ], 
        "grouping": "day"
    }, 
    "17_day": {
        "new_customers": [
            {
                "sum": 245.0, 
                "period": "2026-W38"
            }, 
            {
                "sum": 634.0, 
                "period": "2026-W39"
            }
        ], 
        "returning_customers": [
            {
                "sum": 583.0, 
                "period": "2026-W38"
            }, 
            {
                "sum": 1537.0, 
                "period": "2026-W39"
            }
        ], 
        "grouping": "week"
    }
}


NEW_CUSTOMERS_DATA = OrderedDict([
    ('1_day', OrderedDict([
        ('grouping', 'week'),
        ('new_customers', [
            {'range': 'Week 1', 'total': 676},
            {'range': 'Week 2', 'total': 713},
            {'range': 'Week 3', 'total': 634},
            {'range': 'Week 4', 'total': 327},
            {'range': 'Week 5', 'total': 0},
        ]),
    ])),
    ('2_day', OrderedDict([
        ('grouping', 'week'),
        ('new_customers', [
            {'range': 'Week 1', 'total': 676},
            {'range': 'Week 2', 'total': 713},
            {'range': 'Week 3', 'total': 634},
            {'range': 'Week 4', 'total': 327},
            {'range': 'Week 5', 'total': 0},
        ]),
    ])),
    ('3_day', OrderedDict([
        ('grouping', 'week'),
        ('new_customers', [
            {'range': 'Week 1', 'total': 676},
            {'range': 'Week 2', 'total': 713},
            {'range': 'Week 3', 'total': 634},
            {'range': 'Week 4', 'total': 327},
            {'range': 'Week 5', 'total': 0},
        ]),
    ])),
    ('4_day', OrderedDict([
        ('grouping', 'week'),
        ('new_customers', [
            {'range': 'Week 1', 'total': 676},
            {'range': 'Week 2', 'total': 713},
            {'range': 'Week 3', 'total': 634},
            {'range': 'Week 4', 'total': 327},
            {'range': 'Week 5', 'total': 0},
        ]),
    ])),
    ('5_day', OrderedDict([
        ('grouping', 'week'),
        ('new_customers', [
            {'range': 'Week 1', 'total': 676},
            {'range': 'Week 2', 'total': 713},
            {'range': 'Week 3', 'total': 634},
            {'range': 'Week 4', 'total': 327},
            {'range': 'Week 5', 'total': 0},
        ]),
    ])),
    ('6_day', OrderedDict([
        ('grouping', 'week'),
        ('new_customers', [
            {'range': 'Week 1', 'total': 713},
            {'range': 'Week 2', 'total': 634},
            {'range': 'Week 3', 'total': 327},
            {'range': 'Week 4', 'total': 0},
            {'range': 'Week 5', 'total': 0},
        ]),
    ])),
    ('7_day', OrderedDict([
        ('grouping', 'week'),
        ('new_customers', [
            {'range': 'Week 1', 'total': 713},
            {'range': 'Week 2', 'total': 634},
            {'range': 'Week 3', 'total': 327},
            {'range': 'Week 4', 'total': 0},
            {'range': 'Week 5', 'total': 0},
        ]),
    ])),
    ('8_day', OrderedDict([
        ('grouping', 'week'),
        ('new_customers', [
            {'range': 'Week 1', 'total': 713},
            {'range': 'Week 2', 'total': 634},
            {'range': 'Week 3', 'total': 327},
            {'range': 'Week 4', 'total': 0},
            {'range': 'Week 5', 'total': 0},
        ]),
    ])),
    ('9_day', OrderedDict([
        ('grouping', 'week'),
        ('new_customers', [
            {'range': 'Week 1', 'total': 713},
            {'range': 'Week 2', 'total': 634},
            {'range': 'Week 3', 'total': 327},
            {'range': 'Week 4', 'total': 0},
            {'range': 'Week 5', 'total': 0},
        ]),
    ])),
    ('10_day', OrderedDict([
        ('grouping', 'week'),
        ('new_customers', [
            {'range': 'Week 1', 'total': 713},
            {'range': 'Week 2', 'total': 634},
            {'range': 'Week 3', 'total': 327},
            {'range': 'Week 4', 'total': 0},
            {'range': 'Week 5', 'total': 0},
        ]),
    ])),
    ('11_day', OrderedDict([
        ('grouping', 'week'),
        ('new_customers', [
            {'range': 'Week 1', 'total': 713},
            {'range': 'Week 2', 'total': 634},
            {'range': 'Week 3', 'total': 327},
            {'range': 'Week 4', 'total': 0},
            {'range': 'Week 5', 'total': 0},
        ]),
    ])),
    ('12_day', OrderedDict([
        ('grouping', 'week'),
        ('new_customers', [
            {'range': 'Week 1', 'total': 713},
            {'range': 'Week 2', 'total': 634},
            {'range': 'Week 3', 'total': 327},
            {'range': 'Week 4', 'total': 0},
            {'range': 'Week 5', 'total': 0},
        ]),
    ])),
    ('13_day', OrderedDict([
        ('grouping', 'week'),
        ('new_customers', [
            {'range': 'Week 1', 'total': 634},
            {'range': 'Week 2', 'total': 327},
            {'range': 'Week 3', 'total': 0},
            {'range': 'Week 4', 'total': 0},
            {'range': 'Week 5', 'total': 0},
        ]),
    ])),
    ('14_day', OrderedDict([
        ('grouping', 'week'),
        ('new_customers', [
            {'range': 'Week 1', 'total': 634},
            {'range': 'Week 2', 'total': 327},
            {'range': 'Week 3', 'total': 0},
            {'range': 'Week 4', 'total': 0},
            {'range': 'Week 5', 'total': 0},
        ]),
    ])),
    ('15_day', OrderedDict([
        ('grouping', 'week'),
        ('new_customers', [
            {'range': 'Week 1', 'total': 634},
            {'range': 'Week 2', 'total': 327},
            {'range': 'Week 3', 'total': 0},
            {'range': 'Week 4', 'total': 0},
            {'range': 'Week 5', 'total': 0},
        ]),
    ])),
    ('16_day', OrderedDict([
        ('grouping', 'week'),
        ('new_customers', [
            {'range': 'Week 1', 'total': 634},
            {'range': 'Week 2', 'total': 327},
            {'range': 'Week 3', 'total': 0},
            {'range': 'Week 4', 'total': 0},
            {'range': 'Week 5', 'total': 0},
        ]),
    ])),
    ('17_day', OrderedDict([
        ('grouping', 'week'),
        ('new_customers', [
            {'range': 'Week 1', 'total': 634},
            {'range': 'Week 2', 'total': 327},
            {'range': 'Week 3', 'total': 0},
            {'range': 'Week 4', 'total': 0},
            {'range': 'Week 5', 'total': 0},
        ]),
    ])),
    ('18_day', OrderedDict([
        ('grouping', 'week'),
        ('new_customers', [
            {'range': 'Week 1', 'total': 634},
            {'range': 'Week 2', 'total': 327},
            {'range': 'Week 3', 'total': 0},
            {'range': 'Week 4', 'total': 0},
            {'range': 'Week 5', 'total': 0},
        ]),
    ])),
    ('19_day', OrderedDict([
        ('grouping', 'week'),
        ('new_customers', [
            {'range': 'Week 1', 'total': 634},
            {'range': 'Week 2', 'total': 327},
            {'range': 'Week 3', 'total': 0},
            {'range': 'Week 4', 'total': 0},
            {'range': 'Week 5', 'total': 0},
        ]),
    ])),
    ('20_day', OrderedDict([
        ('grouping', 'week'),
        ('new_customers', [
            {'range': 'Week 1', 'total': 327},
            {'range': 'Week 2', 'total': 0},
            {'range': 'Week 3', 'total': 0},
            {'range': 'Week 4', 'total': 0},
            {'range': 'Week 5', 'total': 0},
        ]),
    ])),
    ('21_day', OrderedDict([
        ('grouping', 'week'),
        ('new_customers', [
            {'range': 'Week 1', 'total': 327},
            {'range': 'Week 2', 'total': 0},
            {'range': 'Week 3', 'total': 0},
            {'range': 'Week 4', 'total': 0},
            {'range': 'Week 5', 'total': 0},
        ]),
    ])),
    ('22_day', OrderedDict([
        ('grouping', 'week'),
        ('new_customers', [
            {'range': 'Week 1', 'total': 327},
            {'range': 'Week 2', 'total': 0},
            {'range': 'Week 3', 'total': 0},
            {'range': 'Week 4', 'total': 0},
            {'range': 'Week 5', 'total': 0},
        ]),
    ])),
    ('23_day', OrderedDict([
        ('grouping', 'week'),
        ('new_customers', [
            {'range': 'Week 1', 'total': 327},
            {'range': 'Week 2', 'total': 0},
            {'range': 'Week 3', 'total': 0},
            {'range': 'Week 4', 'total': 0},
            {'range': 'Week 5', 'total': 0},
        ]),
    ])),
    ('24_day', OrderedDict([
        ('grouping', 'week'),
        ('new_customers', [
            {'range': 'Week 1', 'total': 327},
            {'range': 'Week 2', 'total': 0},
            {'range': 'Week 3', 'total': 0},
            {'range': 'Week 4', 'total': 0},
            {'range': 'Week 5', 'total': 0},
        ]),
    ])),
    ('25_day', OrderedDict([
        ('grouping', 'week'),
        ('new_customers', [
            {'range': 'Week 1', 'total': 327},
            {'range': 'Week 2', 'total': 0},
            {'range': 'Week 3', 'total': 0},
            {'range': 'Week 4', 'total': 0},
            {'range': 'Week 5', 'total': 0},
        ]),
    ])),
    ('26_day', OrderedDict([
        ('grouping', 'week'),
        ('new_customers', [
            {'range': 'Week 1', 'total': 327},
            {'range': 'Week 2', 'total': 0},
            {'range': 'Week 3', 'total': 0},
            {'range': 'Week 4', 'total': 0},
            {'range': 'Week 5', 'total': 0},
        ]),
    ])),
    ('27_day', OrderedDict([
        ('grouping', 'week'),
        ('new_customers', [
            {'range': 'Week 1', 'total': 0},
            {'range': 'Week 2', 'total': 0},
            {'range': 'Week 3', 'total': 0},
            {'range': 'Week 4', 'total': 0},
            {'range': 'Week 5', 'total': 0},
        ]),
    ])),
    ('28_day', OrderedDict([
        ('grouping', 'week'),
        ('new_customers', [
            {'range': 'Week 1', 'total': 0},
            {'range': 'Week 2', 'total': 0},
            {'range': 'Week 3', 'total': 0},
            {'range': 'Week 4', 'total': 0},
            {'range': 'Week 5', 'total': 0},
        ]),
    ])),
    ('29_day', OrderedDict([
        ('grouping', 'week'),
        ('new_customers', [
            {'range': 'Week 1', 'total': 0},
            {'range': 'Week 2', 'total': 0},
            {'range': 'Week 3', 'total': 0},
            {'range': 'Week 4', 'total': 0},
            {'range': 'Week 5', 'total': 0},
        ]),
    ])),
])


OPERATIONAL_ANOMALY_KPIS_DATA = OrderedDict([
    ('1_day', OrderedDict([
        ('grouping', 'week'),
        ('revenue_usd', [
            {'sum': 85201.42, 'period': '2026-W36'},
            {'sum': 144694.94, 'period': '2026-W37'},
            {'sum': 157969.72, 'period': '2026-W38'},
            {'sum': 139128.98, 'period': '2026-W39'},
            {'sum': 71342.61, 'period': '2026-W40'}
        ]),
        ('revenue_24h_ma', [
            {'sum': 80951.21, 'period': '2026-W36'},
            {'sum': 143124.91, 'period': '2026-W37'},
            {'sum': 157126.6, 'period': '2026-W38'},
            {'sum': 139871.95, 'period': '2026-W39'},
            {'sum': 76722.27, 'period': '2026-W40'}
        ])
    ])),
    ('2_day', OrderedDict([
        ('grouping', 'week'),
        ('revenue_usd', [
            {'sum': 68694.9, 'period': '2026-W36'},
            {'sum': 144694.94, 'period': '2026-W37'},
            {'sum': 157969.72, 'period': '2026-W38'},
            {'sum': 139128.98, 'period': '2026-W39'},
            {'sum': 71342.61, 'period': '2026-W40'}
        ]),
        ('revenue_24h_ma', [
            {'sum': 65641.27, 'period': '2026-W36'},
            {'sum': 143124.91, 'period': '2026-W37'},
            {'sum': 157126.6, 'period': '2026-W38'},
            {'sum': 139871.95, 'period': '2026-W39'},
            {'sum': 76722.27, 'period': '2026-W40'}
        ])
    ])),
    ('3_day', OrderedDict([
        ('grouping', 'week'),
        ('revenue_usd', [
            {'sum': 42870.95, 'period': '2026-W36'},
            {'sum': 144694.94, 'period': '2026-W37'},
            {'sum': 157969.72, 'period': '2026-W38'},
            {'sum': 139128.98, 'period': '2026-W39'},
            {'sum': 71342.61, 'period': '2026-W40'}
        ]),
        ('revenue_24h_ma', [
            {'sum': 45067.73, 'period': '2026-W36'},
            {'sum': 143124.91, 'period': '2026-W37'},
            {'sum': 157126.6, 'period': '2026-W38'},
            {'sum': 139871.95, 'period': '2026-W39'},
            {'sum': 76722.27, 'period': '2026-W40'}
        ])
    ])),
    ('4_day', OrderedDict([
        ('grouping', 'week'),
        ('revenue_usd', [
            {'sum': 21925.41, 'period': '2026-W36'},
            {'sum': 144694.94, 'period': '2026-W37'},
            {'sum': 157969.72, 'period': '2026-W38'},
            {'sum': 139128.98, 'period': '2026-W39'},
            {'sum': 71342.61, 'period': '2026-W40'}
        ]),
        ('revenue_24h_ma', [
            {'sum': 22344.89, 'period': '2026-W36'},
            {'sum': 143124.91, 'period': '2026-W37'},
            {'sum': 157126.6, 'period': '2026-W38'},
            {'sum': 139871.95, 'period': '2026-W39'},
            {'sum': 76722.27, 'period': '2026-W40'}
        ])
    ])),
    ('5_day', OrderedDict([
        ('grouping', 'week'),
        ('revenue_usd', [
            {'sum': 144694.94, 'period': '2026-W37'},
            {'sum': 157969.72, 'period': '2026-W38'},
            {'sum': 139128.98, 'period': '2026-W39'},
            {'sum': 71342.61, 'period': '2026-W40'}
        ]),
        ('revenue_24h_ma', [
            {'sum': 143124.91, 'period': '2026-W37'},
            {'sum': 157126.6, 'period': '2026-W38'},
            {'sum': 139871.95, 'period': '2026-W39'},
            {'sum': 76722.27, 'period': '2026-W40'}
        ])
    ])),
    ('6_day', OrderedDict([
        ('grouping', 'week'),
        ('revenue_usd', [
            {'sum': 126876.92, 'period': '2026-W37'},
            {'sum': 157969.72, 'period': '2026-W38'},
            {'sum': 139128.98, 'period': '2026-W39'},
            {'sum': 71342.61, 'period': '2026-W40'}
        ]),
        ('revenue_24h_ma', [
            {'sum': 122777.02, 'period': '2026-W37'},
            {'sum': 157126.6, 'period': '2026-W38'},
            {'sum': 139871.95, 'period': '2026-W39'},
            {'sum': 76722.27, 'period': '2026-W40'}
        ])
    ])),
    ('7_day', OrderedDict([
        ('grouping', 'week'),
        ('revenue_usd', [
            {'sum': 110942.81, 'period': '2026-W37'},
            {'sum': 157969.72, 'period': '2026-W38'},
            {'sum': 139128.98, 'period': '2026-W39'},
            {'sum': 71342.61, 'period': '2026-W40'}
        ]),
        ('revenue_24h_ma', [
            {'sum': 106064.84, 'period': '2026-W37'},
            {'sum': 157126.6, 'period': '2026-W38'},
            {'sum': 139871.95, 'period': '2026-W39'},
            {'sum': 76722.27, 'period': '2026-W40'}
        ])
    ])),
    ('8_day', OrderedDict([
        ('grouping', 'week'),
        ('revenue_usd', [
            {'sum': 92779.68, 'period': '2026-W37'},
            {'sum': 157969.72, 'period': '2026-W38'},
            {'sum': 139128.98, 'period': '2026-W39'},
            {'sum': 71342.61, 'period': '2026-W40'}
        ]),
        ('revenue_24h_ma', [
            {'sum': 89425.69, 'period': '2026-W37'},
            {'sum': 157126.6, 'period': '2026-W38'},
            {'sum': 139871.95, 'period': '2026-W39'},
            {'sum': 76722.27, 'period': '2026-W40'}
        ])
    ])),
    ('9_day', OrderedDict([
        ('grouping', 'week'),
        ('revenue_usd', [
            {'sum': 72314.42, 'period': '2026-W37'},
            {'sum': 157969.72, 'period': '2026-W38'},
            {'sum': 139128.98, 'period': '2026-W39'},
            {'sum': 71342.61, 'period': '2026-W40'}
        ]),
        ('revenue_24h_ma', [
            {'sum': 70454.61, 'period': '2026-W37'},
            {'sum': 157126.6, 'period': '2026-W38'},
            {'sum': 139871.95, 'period': '2026-W39'},
            {'sum': 76722.27, 'period': '2026-W40'}
        ])
    ])),
    ('10_day', OrderedDict([
        ('grouping', 'week'),
        ('revenue_usd', [
            {'sum': 50818.55, 'period': '2026-W37'},
            {'sum': 157969.72, 'period': '2026-W38'},
            {'sum': 139128.98, 'period': '2026-W39'},
            {'sum': 71342.61, 'period': '2026-W40'}
        ]),
        ('revenue_24h_ma', [
            {'sum': 48989.15, 'period': '2026-W37'},
            {'sum': 157126.6, 'period': '2026-W38'},
            {'sum': 139871.95, 'period': '2026-W39'},
            {'sum': 76722.27, 'period': '2026-W40'}
        ])
    ])),
    ('11_day', OrderedDict([
        ('grouping', 'week'),
        ('revenue_usd', [
            {'sum': 22492.44, 'period': '2026-W37'},
            {'sum': 157969.72, 'period': '2026-W38'},
            {'sum': 139128.98, 'period': '2026-W39'},
            {'sum': 71342.61, 'period': '2026-W40'}
        ]),
        ('revenue_24h_ma', [
            {'sum': 24456.08, 'period': '2026-W37'},
            {'sum': 157126.6, 'period': '2026-W38'},
            {'sum': 139871.95, 'period': '2026-W39'},
            {'sum': 76722.27, 'period': '2026-W40'}
        ])
    ])),
    ('12_day', OrderedDict([
        ('grouping', 'week'),
        ('revenue_usd', [
            {'sum': 157969.72, 'period': '2026-W38'},
            {'sum': 139128.98, 'period': '2026-W39'},
            {'sum': 71342.61, 'period': '2026-W40'}
        ]),
        ('revenue_24h_ma', [
            {'sum': 157126.6, 'period': '2026-W38'},
            {'sum': 139871.95, 'period': '2026-W39'},
            {'sum': 76722.27, 'period': '2026-W40'}
        ])
    ])),
    ('13_day', OrderedDict([
        ('grouping', 'week'),
        ('revenue_usd', [
            {'sum': 125898.9, 'period': '2026-W38'},
            {'sum': 139128.98, 'period': '2026-W39'},
            {'sum': 71342.61, 'period': '2026-W40'}
        ]),
        ('revenue_24h_ma', [
            {'sum': 132638.46, 'period': '2026-W38'},
            {'sum': 139871.95, 'period': '2026-W39'},
            {'sum': 76722.27, 'period': '2026-W40'}
        ])
    ])),
    ('14_day', OrderedDict([
        ('grouping', 'week'),
        ('revenue_usd', [
            {'sum': 107479.02, 'period': '2026-W38'},
            {'sum': 139128.98, 'period': '2026-W39'},
            {'sum': 71342.61, 'period': '2026-W40'}
        ]),
        ('revenue_24h_ma', [
            {'sum': 103678.7, 'period': '2026-W38'},
            {'sum': 139871.95, 'period': '2026-W39'},
            {'sum': 76722.27, 'period': '2026-W40'}
        ])
    ])),
    ('15_day', OrderedDict([
        ('grouping', 'week'),
        ('revenue_usd', [
            {'sum': 91129.45, 'period': '2026-W38'},
            {'sum': 139128.98, 'period': '2026-W39'},
            {'sum': 71342.61, 'period': '2026-W40'}
        ]),
        ('revenue_24h_ma', [
            {'sum': 84870.63, 'period': '2026-W38'},
            {'sum': 139871.95, 'period': '2026-W39'},
            {'sum': 76722.27, 'period': '2026-W40'}
        ])
    ])),
    ('16_day', OrderedDict([
        ('grouping', 'week'),
        ('revenue_usd', [
            {'sum': 75342.11, 'period': '2026-W38'},
            {'sum': 139128.98, 'period': '2026-W39'},
            {'sum': 71342.61, 'period': '2026-W40'}
        ]),
        ('revenue_24h_ma', [
            {'sum': 69703.14, 'period': '2026-W38'},
            {'sum': 139871.95, 'period': '2026-W39'},
            {'sum': 76722.27, 'period': '2026-W40'}
        ])
    ])),
    ('17_day', OrderedDict([
        ('grouping', 'week'),
        ('revenue_usd', [
            {'sum': 56454.58, 'period': '2026-W38'},
            {'sum': 139128.98, 'period': '2026-W39'},
            {'sum': 71342.61, 'period': '2026-W40'}
        ]),
        ('revenue_24h_ma', [
            {'sum': 51889.36, 'period': '2026-W38'},
            {'sum': 139871.95, 'period': '2026-W39'},
            {'sum': 76722.27, 'period': '2026-W40'}
        ])
    ])),
    ('18_day', OrderedDict([
        ('grouping', 'week'),
        ('revenue_usd', [
            {'sum': 24689.02, 'period': '2026-W38'},
            {'sum': 139128.98, 'period': '2026-W39'},
            {'sum': 71342.61, 'period': '2026-W40'}
        ]),
        ('revenue_24h_ma', [
            {'sum': 27766.69, 'period': '2026-W38'},
            {'sum': 139871.95, 'period': '2026-W39'},
            {'sum': 76722.27, 'period': '2026-W40'}
        ])
    ])),
    ('19_day', OrderedDict([
        ('grouping', 'week'),
        ('revenue_usd', [
            {'sum': 139128.98, 'period': '2026-W39'},
            {'sum': 71342.61, 'period': '2026-W40'}
        ]),
        ('revenue_24h_ma', [
            {'sum': 139871.95, 'period': '2026-W39'},
            {'sum': 76722.27, 'period': '2026-W40'}
        ])
    ])),
    ('20_day', OrderedDict([
        ('grouping', 'week'),
        ('revenue_usd', [
            {'sum': 123638.47, 'period': '2026-W39'},
            {'sum': 71342.61, 'period': '2026-W40'}
        ]),
        ('revenue_24h_ma', [
            {'sum': 118245.39, 'period': '2026-W39'},
            {'sum': 76722.27, 'period': '2026-W40'}
        ])
    ])),
    ('21_day', OrderedDict([
        ('grouping', 'week'),
        ('revenue_usd', [
            {'sum': 106428.03, 'period': '2026-W39'},
            {'sum': 71342.61, 'period': '2026-W40'}
        ]),
        ('revenue_24h_ma', [
            {'sum': 102227.57, 'period': '2026-W39'},
            {'sum': 76722.27, 'period': '2026-W40'}
        ])
    ])),
    ('22_day', OrderedDict([
        ('grouping', 'week'),
        ('revenue_usd', [
            {'sum': 87459.68, 'period': '2026-W39'},
            {'sum': 71342.61, 'period': '2026-W40'}
        ]),
        ('revenue_24h_ma', [
            {'sum': 84439.46, 'period': '2026-W39'},
            {'sum': 76722.27, 'period': '2026-W40'}
        ])
    ])),
    ('23_day', OrderedDict([
        ('grouping', 'week'),
        ('revenue_usd', [
            {'sum': 70016.27, 'period': '2026-W39'},
            {'sum': 71342.61, 'period': '2026-W40'}
        ]),
        ('revenue_24h_ma', [
            {'sum': 65519.94, 'period': '2026-W39'},
            {'sum': 76722.27, 'period': '2026-W40'}
        ])
    ])),
    ('24_day', OrderedDict([
        ('grouping', 'week'),
        ('revenue_usd', [
            {'sum': 51499.05, 'period': '2026-W39'},
            {'sum': 71342.61, 'period': '2026-W40'}
        ]),
        ('revenue_24h_ma', [
            {'sum': 47951.59, 'period': '2026-W39'},
            {'sum': 76722.27, 'period': '2026-W40'}
        ])
    ])),
    ('25_day', OrderedDict([
        ('grouping', 'week'),
        ('revenue_usd', [
            {'sum': 23426.43, 'period': '2026-W39'},
            {'sum': 71342.61, 'period': '2026-W40'}
        ]),
        ('revenue_24h_ma', [
            {'sum': 24950.0, 'period': '2026-W39'},
            {'sum': 76722.27, 'period': '2026-W40'}
        ])
    ])),
    ('26_day', OrderedDict([
        ('grouping', 'week'),
        ('revenue_usd', [
            {'sum': 71342.61, 'period': '2026-W40'}
        ]),
        ('revenue_24h_ma', [
            {'sum': 76722.27, 'period': '2026-W40'}
        ])
    ])),
    ('27_day', OrderedDict([
        ('grouping', 'week'),
        ('revenue_usd', [
            {'sum': 53452.96, 'period': '2026-W40'}
        ]),
        ('revenue_24h_ma', [
            {'sum': 55225.17, 'period': '2026-W40'}
        ])
    ])),
    ('28_day', OrderedDict([
        ('grouping', 'week'),
        ('revenue_usd', [
            {'sum': 34259.91, 'period': '2026-W40'}
        ]),
        ('revenue_24h_ma', [
            {'sum': 36235.77, 'period': '2026-W40'}
        ])
    ])),
    ('29_day', OrderedDict([
        ('grouping', 'week'),
        ('revenue_usd', [
            {'sum': 17530.23, 'period': '2026-W40'}
        ]),
        ('revenue_24h_ma', [
            {'sum': 18148.03, 'period': '2026-W40'}
        ])
    ]))
])


def get_severity_value(severity_name):
    return OTEL_SEVERITY_MAP.get(severity_name.upper(), INFORMATION)

METRIC_TIME_SERIES = {
    "7_day": {
        "users": 869, 
        "avg_response_time": 602, 
        "error_rate": 481, 
        "payment_failure_rate": 827, 
        "payment_gateway_latency": 393
         
        
    }, 
    "13_day": {
        "users": 687, 
        "avg_response_time": 434, 
        "error_rate": 271, 
        "payment_failure_rate": 651, 
        "payment_gateway_latency": 250
    }, 
    "16_day": {
        "users": 541, 
        "avg_response_time": 388, 
        "error_rate": 242, 
        "payment_failure_rate": 540, 
        "payment_gateway_latency": 229
    }, 
    "12_day": {
        "avg_response_time": 470, 
        "users": 697, 
        "error_rate": 319, 
        "payment_failure_rate": 688, 
        "payment_gateway_latency": 272
    }, 
    "11_day": {
        "users": 706, 
        "avg_response_time": 521, 
        "error_rate": 343, 
        "payment_failure_rate": 740, 
        "payment_gateway_latency": 297
    }, 
    "24_day": {
        "avg_response_time": 218, 
        "users": 221, 
        "error_rate": 106, 
        "payment_failure_rate": 210, 
        "payment_gateway_latency": 7
    }, 
    "10_day": {
        "users": 776, 
        "avg_response_time": 539, 
        "error_rate": 413, 
        "payment_failure_rate": 796, 
        "payment_gateway_latency": 303
    }, 
    "9_day": {
        "users": 841, 
        "avg_response_time": 557, 
        "error_rate": 442, 
        "payment_failure_rate": 804, 
        "payment_gateway_latency": 360
    }, 
    "14_day": {
        "users": 650, 
        "avg_response_time": 434, 
        "error_rate": 261, 
        "payment_failure_rate": 591, 
        "payment_gateway_latency": 232
    }, 
    "3_day": {
        "users": 964, 
        "avg_response_time": 723, 
        "error_rate": 587, 
        "payment_failure_rate": 929, 
        "payment_gateway_latency": 436
    }, 
    "22_day": {
        "avg_response_time": 257, 
        "users": 289, 
        "error_rate": 127, 
        "payment_failure_rate": 289, 
        "payment_gateway_latency": 106
    }, 
    "26_day": {
        "avg_response_time": 80, 
        "users": 144, 
        "error_rate": 68, 
        "payment_failure_rate": 121, 
        "payment_gateway_latency": 51
    }, 
    "23_day": {
        "users": 262, 
        "avg_response_time": 226, 
        "error_rate": 127, 
        "payment_failure_rate": 269, 
        "payment_gateway_latency": 106
    }, 
    "27_day": {
        "avg_response_time": 69, 
        "users": 100, 
        "error_rate": 57, 
        "payment_failure_rate": 90, 
        "payment_gateway_latency": 51
    }, 
    "4_day": {
        "avg_response_time": 682, 
        "users": 963, 
        "error_rate": 547, 
        "payment_failure_rate": 906, 
        "payment_gateway_latency": 419
    }, 
    "30_day": {
        "users": 1
    }, 
    "8_day": {
        "avg_response_time": 602, 
        "users": 845, 
        "error_rate": 478, 
        "payment_failure_rate": 813, 
        "payment_gateway_latency": 380
    }, 
    "5_day": {
        "avg_response_time": 638, 
        "users": 940, 
        "error_rate": 524, 
        "payment_failure_rate": 895, 
        "payment_gateway_latency": 414
    }, 
    "1_day": {
        "users": 1046, 
        "avg_response_time": 749, 
        "error_rate": 616, 
        "payment_failure_rate": 961, 
        "payment_gateway_latency": 454
    }, 
    "19_day": {
        "users": 370, 
        "avg_response_time": 289, 
        "error_rate": 200, 
        "payment_failure_rate": 389, 
        "payment_gateway_latency": 177
    }, 
    "25_day": {
        "avg_response_time": 156, 
        "users": 164, 
        "error_rate": 92, 
        "payment_failure_rate": 158, 
        "payment_gateway_latency": 51
    }, 
    "15_day": {
        "avg_response_time": 428, 
        "users": 541, 
        "error_rate": 253, 
        "payment_failure_rate": 576, 
        "payment_gateway_latency": 232
    }, 
    "2_day": {
        "users": 1032, 
        "avg_response_time": 736, 
        "error_rate": 608, 
        "payment_failure_rate": 941, 
        "payment_gateway_latency": 436
    }, 
    "20_day": {
        "users": 331, 
        "avg_response_time": 289, 
        "error_rate": 187, 
        "payment_failure_rate": 359, 
        "payment_gateway_latency": 155
    }, 
    "18_day": {
        "users": 437, 
        "avg_response_time": 339, 
        "error_rate": 205, 
        "payment_failure_rate": 428, 
        "payment_gateway_latency": 192
    }, 
    "28_day": {
        "users": 82, 
        "avg_response_time": 52, 
        "error_rate": 22, 
        "payment_failure_rate": 52, 
        "payment_gateway_latency": 41
    }, 
    "21_day": {
        "users": 311, 
        "avg_response_time": 271, 
        "error_rate": 170, 
        "payment_failure_rate": 343, 
        "payment_gateway_latency": 122
    }, 
    "6_day": {
        "users": 877, 
        "avg_response_time": 619, 
        "error_rate": 524, 
        "payment_failure_rate": 833, 
        "payment_gateway_latency": 414
    }, 
    "29_day": {
        "users": 63, 
        "avg_response_time": 4, 
        "error_rate": 22, 
        "payment_failure_rate": 45, 
        "payment_gateway_latency": 28
    }, 
    "17_day": {
        "users": 507, 
        "avg_response_time": 386, 
        "error_rate": 219, 
        "payment_failure_rate": 511, 
        "payment_gateway_latency": 223
    }
}

## STATIC DATA FOR EASY TRADE REMOVE LATER

FUNNEL_DATA_CACHE_EASYTRADE = {
    "7_day": {
        "order_submitted": 45882, 
        "order_executed": 7178, 
        "sessions": 298279
    },
    "13_day": {
        "order_submitted": 32960, 
        "order_executed": 5087, 
        "sessions": 214042
    },
    "16_day": {
        "order_submitted": 27596, 
        "order_executed": 4332, 
        "sessions": 179956
    },
    "12_day": {
        "order_submitted": 35018, 
        "order_executed": 5509, 
        "sessions": 226615
    },
    "11_day": {
        "order_submitted": 37415, 
        "order_executed": 5850, 
        "sessions": 242665
    },
    "24_day": {
        "order_submitted": 11707, 
        "order_executed": 1832, 
        "sessions": 79569
    },
    "10_day": {
        "order_submitted": 40071, 
        "order_executed": 6298, 
        "sessions": 259180
    },
    "9_day": {
        "order_submitted": 42036, 
        "order_executed": 6601, 
        "sessions": 272464
    },
    "14_day": {
        "order_submitted": 31101, 
        "order_executed": 4820, 
        "sessions": 202055
    },
    "3_day": {
        "order_submitted": 53647, 
        "order_executed": 8338, 
        "sessions": 348805
    },
    "22_day": {
        "order_submitted": 15888, 
        "order_executed": 2416, 
        "sessions": 105568
    },
    "26_day": {
        "order_submitted": 6965, 
        "order_executed": 1042, 
        "sessions": 47018
    },
    "23_day": {
        "order_submitted": 13608, 
        "order_executed": 2140, 
        "sessions": 92434
    },
    "27_day": {
        "order_submitted": 5001, 
        "order_executed": 768, 
        "sessions": 34741
    },
    "4_day": {
        "order_submitted": 51578, 
        "order_executed": 8009, 
        "sessions": 335364
    },
    "30_day": {
        "order_submitted": 52, 
        "order_executed": 1, 
        "sessions": 241
    },
    "8_day": {
        "order_submitted": 43868, 
        "order_executed": 6908, 
        "sessions": 285695
    },
    "5_day": {
        "order_submitted": 49431, 
        "order_executed": 7680, 
        "sessions": 321561
    },
    "1_day": {
        "order_submitted": 56782, 
        "order_executed": 8972, 
        "sessions": 370451
    },
    "19_day": {
        "order_submitted": 21258, 
        "order_executed": 3213, 
        "sessions": 141931
    },
    "25_day": {
        "order_submitted": 9172, 
        "order_executed": 1396, 
        "sessions": 62969
    },
    "15_day": {
        "order_submitted": 29404, 
        "order_executed": 4568, 
        "sessions": 190653
    },
    "2_day": {
        "order_submitted": 55233, 
        "order_executed": 8708, 
        "sessions": 359416
    },
    "20_day": {
        "order_submitted": 19256, 
        "order_executed": 2978, 
        "sessions": 130239
    },
    "18_day": {
        "order_submitted": 23480, 
        "order_executed": 3574, 
        "sessions": 155728
    },
    "28_day": {
        "order_submitted": 3069, 
        "order_executed": 511, 
        "sessions": 22879
    },
    "21_day": {
        "order_submitted": 17423, 
        "order_executed": 2717, 
        "sessions": 118212
    },
    "6_day": {
        "order_submitted": 47668, 
        "order_executed": 7415, 
        "sessions": 310366
    },
    "29_day": {
        "order_submitted": 1404, 
        "order_executed": 270, 
        "sessions": 11272
    },
    "17_day": {
        "order_submitted": 25907, 
        "order_executed": 4041, 
        "sessions": 169105
    }
}

# EASYTRADE STATIC DATA

SESSIONS = OrderedDict([
    ('1_day', OrderedDict([
        ('grouping', 'week'),
        ("sessions", [
            {'range': 'Week 1', 'total': 8769},
            {'range': 'Week 2', 'total': 9049},
            {'range': 'Week 3', 'total': 9169},
            {'range': 'Week 4', 'total': 8363},
            {'range': 'Week 5', 'total': 7411},
        ]),
    ])),
    ('2_day', OrderedDict([
        ('grouping', 'week'),
        ("sessions", [
            {'range': 'Week 1', 'total': 8769},
            {'range': 'Week 2', 'total': 9049},
            {'range': 'Week 3', 'total': 9169},
            {'range': 'Week 4', 'total': 8363},
            {'range': 'Week 5', 'total': 7411},
        ]),
    ])),
    ('3_day', OrderedDict([
        ('grouping', 'week'),
        ("sessions", [
            {'range': 'Week 1', 'total': 8769},
            {'range': 'Week 2', 'total': 9049},
            {'range': 'Week 3', 'total': 9169},
            {'range': 'Week 4', 'total': 8363},
            {'range': 'Week 5', 'total': 7411},
        ]),
    ])),
    ('4_day', OrderedDict([
        ('grouping', 'week'),
        ("sessions", [
            {'range': 'Week 1', 'total': 8769},
            {'range': 'Week 2', 'total': 9049},
            {'range': 'Week 3', 'total': 9169},
            {'range': 'Week 4', 'total': 8363},
            {'range': 'Week 5', 'total': 7411},
        ]),
    ])),
    ('5_day', OrderedDict([
        ('grouping', 'week'),
        ("sessions", [
            {'range': 'Week 1', 'total': 8769},
            {'range': 'Week 2', 'total': 9049},
            {'range': 'Week 3', 'total': 9169},
            {'range': 'Week 4', 'total': 8363},
            {'range': 'Week 5', 'total': 7411},
        ]),
    ])),
    ('6_day', OrderedDict([
        ('grouping', 'week'),
        ("sessions", [
            {'range': 'Week 1', 'total': 9049},
            {'range': 'Week 2', 'total': 9169},
            {'range': 'Week 3', 'total': 8363},
            {'range': 'Week 4', 'total': 7411},
            {'range': 'Week 5', 'total': 7018},
        ]),
    ])),
    ('7_day', OrderedDict([
        ('grouping', 'week'),
        ("sessions", [
            {'range': 'Week 1', 'total': 9049},
            {'range': 'Week 2', 'total': 9169},
            {'range': 'Week 3', 'total': 8363},
            {'range': 'Week 4', 'total': 7411},
            {'range': 'Week 5', 'total': 7018},
        ]),
    ])),
    ('8_day', OrderedDict([
        ('grouping', 'week'),
        ("sessions", [
            {'range': 'Week 1', 'total': 9049},
            {'range': 'Week 2', 'total': 9169},
            {'range': 'Week 3', 'total': 8363},
            {'range': 'Week 4', 'total': 7411},
            {'range': 'Week 5', 'total': 7018},
        ]),
    ])),
    ('9_day', OrderedDict([
        ('grouping', 'week'),
        ("sessions", [
            {'range': 'Week 1', 'total': 9049},
            {'range': 'Week 2', 'total': 9169},
            {'range': 'Week 3', 'total': 8363},
            {'range': 'Week 4', 'total': 7411},
            {'range': 'Week 5', 'total': 7018},
        ]),
    ])),
    ('10_day', OrderedDict([
        ('grouping', 'week'),
        ("sessions", [
            {'range': 'Week 1', 'total': 9049},
            {'range': 'Week 2', 'total': 9169},
            {'range': 'Week 3', 'total': 8363},
            {'range': 'Week 4', 'total': 7411},
            {'range': 'Week 5', 'total': 7018},
        ]),
    ])),
    ('11_day', OrderedDict([
        ('grouping', 'week'),
        ("sessions", [
            {'range': 'Week 1', 'total': 9049},
            {'range': 'Week 2', 'total': 9169},
            {'range': 'Week 3', 'total': 8363},
            {'range': 'Week 4', 'total': 7411},
            {'range': 'Week 5', 'total': 7018},
        ]),
    ])),
    ('12_day', OrderedDict([
        ('grouping', 'week'),
        ("sessions", [
            {'range': 'Week 1', 'total': 9049},
            {'range': 'Week 2', 'total': 9169},
            {'range': 'Week 3', 'total': 8363},
            {'range': 'Week 4', 'total': 7411},
            {'range': 'Week 5', 'total': 7018},
        ]),
    ])),
    ('13_day', OrderedDict([
        ('grouping', 'week'),
        ("sessions", [
            {'range': 'Week 1', 'total': 9169},
            {'range': 'Week 2', 'total': 8363},
            {'range': 'Week 3', 'total': 7411},
            {'range': 'Week 4', 'total': 7018},
            {'range': 'Week 5', 'total': 7744},
        ]),
    ])),
    ('14_day', OrderedDict([
        ('grouping', 'week'),
        ("sessions", [
            {'range': 'Week 1', 'total': 9169},
            {'range': 'Week 2', 'total': 8363},
            {'range': 'Week 3', 'total': 7411},
            {'range': 'Week 4', 'total': 7018},
            {'range': 'Week 5', 'total': 7744},
        ]),
    ])),
    ('15_day', OrderedDict([
        ('grouping', 'week'),
        ("sessions", [
            {'range': 'Week 1', 'total': 9169},
            {'range': 'Week 2', 'total': 8363},
            {'range': 'Week 3', 'total': 7411},
            {'range': 'Week 4', 'total': 7018},
            {'range': 'Week 5', 'total': 7744},
        ]),
    ])),
    ('16_day', OrderedDict([
        ('grouping', 'week'),
        ("sessions", [
            {'range': 'Week 1', 'total': 9169},
            {'range': 'Week 2', 'total': 8363},
            {'range': 'Week 3', 'total': 7411},
            {'range': 'Week 4', 'total': 7018},
            {'range': 'Week 5', 'total': 7744},
        ]),
    ])),
    ('17_day', OrderedDict([
        ('grouping', 'week'),
        ("sessions", [
            {'range': 'Week 1', 'total': 9169},
            {'range': 'Week 2', 'total': 8363},
            {'range': 'Week 3', 'total': 7411},
            {'range': 'Week 4', 'total': 7018},
            {'range': 'Week 5', 'total': 7744},
        ]),
    ])),
    ('18_day', OrderedDict([
        ('grouping', 'week'),
        ("sessions", [
            {'range': 'Week 1', 'total': 9169},
            {'range': 'Week 2', 'total': 8363},
            {'range': 'Week 3', 'total': 7411},
            {'range': 'Week 4', 'total': 7018},
            {'range': 'Week 5', 'total': 7744},
        ]),
    ])),
    ('19_day', OrderedDict([
        ('grouping', 'week'),
        ("sessions", [
            {'range': 'Week 1', 'total': 9169},
            {'range': 'Week 2', 'total': 8363},
            {'range': 'Week 3', 'total': 7411},
            {'range': 'Week 4', 'total': 7018},
            {'range': 'Week 5', 'total': 7744},
        ]),
    ])),
    ('20_day', OrderedDict([
        ('grouping', 'week'),
        ("sessions", [
            {'range': 'Week 1', 'total': 8363},
            {'range': 'Week 2', 'total': 7411},
            {'range': 'Week 3', 'total': 7018},
            {'range': 'Week 4', 'total': 7744},
            {'range': 'Week 5', 'total': 8325},
        ]),
    ])),
    ('21_day', OrderedDict([
        ('grouping', 'week'),
        ("sessions", [
            {'range': 'Week 1', 'total': 8363},
            {'range': 'Week 2', 'total': 7411},
            {'range': 'Week 3', 'total': 7018},
            {'range': 'Week 4', 'total': 7744},
            {'range': 'Week 5', 'total': 8325},
        ]),
    ])),
    ('22_day', OrderedDict([
        ('grouping', 'week'),
        ("sessions", [
            {'range': 'Week 1', 'total': 8363},
            {'range': 'Week 2', 'total': 7411},
            {'range': 'Week 3', 'total': 7018},
            {'range': 'Week 4', 'total': 7744},
            {'range': 'Week 5', 'total': 8325},
        ]),
    ])),
    ('23_day', OrderedDict([
        ('grouping', 'week'),
        ("sessions", [
            {'range': 'Week 1', 'total': 8363},
            {'range': 'Week 2', 'total': 7411},
            {'range': 'Week 3', 'total': 7018},
            {'range': 'Week 4', 'total': 7744},
            {'range': 'Week 5', 'total': 8325},
        ]),
    ])),
    ('24_day', OrderedDict([
        ('grouping', 'week'),
        ("sessions", [
            {'range': 'Week 1', 'total': 8363},
            {'range': 'Week 2', 'total': 7411},
            {'range': 'Week 3', 'total': 7018},
            {'range': 'Week 4', 'total': 7744},
            {'range': 'Week 5', 'total': 8325},
        ]),
    ])),
    ('25_day', OrderedDict([
        ('grouping', 'week'),
        ("sessions", [
            {'range': 'Week 1', 'total': 8363},
            {'range': 'Week 2', 'total': 7411},
            {'range': 'Week 3', 'total': 7018},
            {'range': 'Week 4', 'total': 7744},
            {'range': 'Week 5', 'total': 8325},
        ]),
    ])),
    ('26_day', OrderedDict([
        ('grouping', 'week'),
        ("sessions", [
            {'range': 'Week 1', 'total': 8363},
            {'range': 'Week 2', 'total': 7411},
            {'range': 'Week 3', 'total': 7018},
            {'range': 'Week 4', 'total': 7744},
            {'range': 'Week 5', 'total': 8325},
        ]),
    ])),
    ('27_day', OrderedDict([
        ('grouping', 'week'),
        ("sessions", [
            {'range': 'Week 1', 'total': 7411},
            {'range': 'Week 2', 'total': 7018},
            {'range': 'Week 3', 'total': 7744},
            {'range': 'Week 4', 'total': 8325},
            {'range': 'Week 5', 'total': 7314},
        ]),
    ])),
    ('28_day', OrderedDict([
        ('grouping', 'week'),
        ("sessions", [
            {'range': 'Week 1', 'total': 7411},
            {'range': 'Week 2', 'total': 7018},
            {'range': 'Week 3', 'total': 7744},
            {'range': 'Week 4', 'total': 8325},
            {'range': 'Week 5', 'total': 7314},
        ]),
    ])),
    ('29_day', OrderedDict([
        ('grouping', 'week'),
        ("sessions", [
            {'range': 'Week 1', 'total': 7411},
            {'range': 'Week 2', 'total': 7018},
            {'range': 'Week 3', 'total': 7744},
            {'range': 'Week 4', 'total': 8325},
            {'range': 'Week 5', 'total': 7314},
        ]),
    ])),
])


NEW_USERS = OrderedDict([
    ('1_day', OrderedDict([
        ('grouping', 'week'),
        ("new_users", [
            {'range': 'Week 1', 'total': 63},
            {'range': 'Week 2', 'total': 96},
            {'range': 'Week 3', 'total': 96},
            {'range': 'Week 4', 'total': 78},
            {'range': 'Week 5', 'total': 67},
        ]),
    ])),
    ('2_day', OrderedDict([
        ('grouping', 'week'),
        ("new_users", [
            {'range': 'Week 1', 'total': 63},
            {'range': 'Week 2', 'total': 96},
            {'range': 'Week 3', 'total': 96},
            {'range': 'Week 4', 'total': 78},
            {'range': 'Week 5', 'total': 67},
        ]),
    ])),
    ('3_day', OrderedDict([
        ('grouping', 'week'),
        ("new_users", [
            {'range': 'Week 1', 'total': 63},
            {'range': 'Week 2', 'total': 96},
            {'range': 'Week 3', 'total': 96},
            {'range': 'Week 4', 'total': 78},
            {'range': 'Week 5', 'total': 67},
        ]),
    ])),
    ('4_day', OrderedDict([
        ('grouping', 'week'),
        ("new_users", [
            {'range': 'Week 1', 'total': 63},
            {'range': 'Week 2', 'total': 96},
            {'range': 'Week 3', 'total': 96},
            {'range': 'Week 4', 'total': 78},
            {'range': 'Week 5', 'total': 67},
        ]),
    ])),
    ('5_day', OrderedDict([
        ('grouping', 'week'),
        ("new_users", [
            {'range': 'Week 1', 'total': 63},
            {'range': 'Week 2', 'total': 96},
            {'range': 'Week 3', 'total': 96},
            {'range': 'Week 4', 'total': 78},
            {'range': 'Week 5', 'total': 67},
        ]),
    ])),
    ('6_day', OrderedDict([
        ('grouping', 'week'),
        ("new_users", [
            {'range': 'Week 1', 'total': 96},
            {'range': 'Week 2', 'total': 96},
            {'range': 'Week 3', 'total': 78},
            {'range': 'Week 4', 'total': 67},
            {'range': 'Week 5', 'total': 47},
        ]),
    ])),
    ('7_day', OrderedDict([
        ('grouping', 'week'),
        ("new_users", [
            {'range': 'Week 1', 'total': 96},
            {'range': 'Week 2', 'total': 96},
            {'range': 'Week 3', 'total': 78},
            {'range': 'Week 4', 'total': 67},
            {'range': 'Week 5', 'total': 47},
        ]),
    ])),
    ('8_day', OrderedDict([
        ('grouping', 'week'),
        ("new_users", [
            {'range': 'Week 1', 'total': 96},
            {'range': 'Week 2', 'total': 96},
            {'range': 'Week 3', 'total': 78},
            {'range': 'Week 4', 'total': 67},
            {'range': 'Week 5', 'total': 47},
        ]),
    ])),
    ('9_day', OrderedDict([
        ('grouping', 'week'),
        ("new_users", [
            {'range': 'Week 1', 'total': 96},
            {'range': 'Week 2', 'total': 96},
            {'range': 'Week 3', 'total': 78},
            {'range': 'Week 4', 'total': 67},
            {'range': 'Week 5', 'total': 47},
        ]),
    ])),
    ('10_day', OrderedDict([
        ('grouping', 'week'),
        ("new_users", [
            {'range': 'Week 1', 'total': 96},
            {'range': 'Week 2', 'total': 96},
            {'range': 'Week 3', 'total': 78},
            {'range': 'Week 4', 'total': 67},
            {'range': 'Week 5', 'total': 47},
        ]),
    ])),
    ('11_day', OrderedDict([
        ('grouping', 'week'),
        ("new_users", [
            {'range': 'Week 1', 'total': 96},
            {'range': 'Week 2', 'total': 96},
            {'range': 'Week 3', 'total': 78},
            {'range': 'Week 4', 'total': 67},
            {'range': 'Week 5', 'total': 47},
        ]),
    ])),
    ('12_day', OrderedDict([
        ('grouping', 'week'),
        ("new_users", [
            {'range': 'Week 1', 'total': 96},
            {'range': 'Week 2', 'total': 96},
            {'range': 'Week 3', 'total': 78},
            {'range': 'Week 4', 'total': 67},
            {'range': 'Week 5', 'total': 47},
        ]),
    ])),
    ('13_day', OrderedDict([
        ('grouping', 'week'),
        ("new_users", [
            {'range': 'Week 1', 'total': 96},
            {'range': 'Week 2', 'total': 78},
            {'range': 'Week 3', 'total': 67},
            {'range': 'Week 4', 'total': 47},
            {'range': 'Week 5', 'total': 28},
        ]),
    ])),
    ('14_day', OrderedDict([
        ('grouping', 'week'),
        ("new_users", [
            {'range': 'Week 1', 'total': 96},
            {'range': 'Week 2', 'total': 78},
            {'range': 'Week 3', 'total': 67},
            {'range': 'Week 4', 'total': 47},
            {'range': 'Week 5', 'total': 28},
        ]),
    ])),
    ('15_day', OrderedDict([
        ('grouping', 'week'),
        ("new_users", [
            {'range': 'Week 1', 'total': 96},
            {'range': 'Week 2', 'total': 78},
            {'range': 'Week 3', 'total': 67},
            {'range': 'Week 4', 'total': 47},
            {'range': 'Week 5', 'total': 28},
        ]),
    ])),
    ('16_day', OrderedDict([
        ('grouping', 'week'),
        ("new_users", [
            {'range': 'Week 1', 'total': 96},
            {'range': 'Week 2', 'total': 78},
            {'range': 'Week 3', 'total': 67},
            {'range': 'Week 4', 'total': 47},
            {'range': 'Week 5', 'total': 28},
        ]),
    ])),
    ('17_day', OrderedDict([
        ('grouping', 'week'),
        ("new_users", [
            {'range': 'Week 1', 'total': 96},
            {'range': 'Week 2', 'total': 78},
            {'range': 'Week 3', 'total': 67},
            {'range': 'Week 4', 'total': 47},
            {'range': 'Week 5', 'total': 28},
        ]),
    ])),
    ('18_day', OrderedDict([
        ('grouping', 'week'),
        ("new_users", [
            {'range': 'Week 1', 'total': 96},
            {'range': 'Week 2', 'total': 78},
            {'range': 'Week 3', 'total': 67},
            {'range': 'Week 4', 'total': 47},
            {'range': 'Week 5', 'total': 28},
        ]),
    ])),
    ('19_day', OrderedDict([
        ('grouping', 'week'),
        ("new_users", [
            {'range': 'Week 1', 'total': 96},
            {'range': 'Week 2', 'total': 78},
            {'range': 'Week 3', 'total': 67},
            {'range': 'Week 4', 'total': 47},
            {'range': 'Week 5', 'total': 28},
        ]),
    ])),
    ('20_day', OrderedDict([
        ('grouping', 'week'),
        ("new_users", [
            {'range': 'Week 1', 'total': 78},
            {'range': 'Week 2', 'total': 67},
            {'range': 'Week 3', 'total': 47},
            {'range': 'Week 4', 'total': 28},
            {'range': 'Week 5', 'total': 23},
        ]),
    ])),
    ('21_day', OrderedDict([
        ('grouping', 'week'),
        ("new_users", [
            {'range': 'Week 1', 'total': 78},
            {'range': 'Week 2', 'total': 67},
            {'range': 'Week 3', 'total': 47},
            {'range': 'Week 4', 'total': 28},
            {'range': 'Week 5', 'total': 23},
        ]),
    ])),
    ('22_day', OrderedDict([
        ('grouping', 'week'),
        ("new_users", [
            {'range': 'Week 1', 'total': 78},
            {'range': 'Week 2', 'total': 67},
            {'range': 'Week 3', 'total': 47},
            {'range': 'Week 4', 'total': 28},
            {'range': 'Week 5', 'total': 23},
        ]),
    ])),
    ('23_day', OrderedDict([
        ('grouping', 'week'),
        ("new_users", [
            {'range': 'Week 1', 'total': 78},
            {'range': 'Week 2', 'total': 67},
            {'range': 'Week 3', 'total': 47},
            {'range': 'Week 4', 'total': 28},
            {'range': 'Week 5', 'total': 23},
        ]),
    ])),
    ('24_day', OrderedDict([
        ('grouping', 'week'),
        ("new_users", [
            {'range': 'Week 1', 'total': 78},
            {'range': 'Week 2', 'total': 67},
            {'range': 'Week 3', 'total': 47},
            {'range': 'Week 4', 'total': 28},
            {'range': 'Week 5', 'total': 23},
        ]),
    ])),
    ('25_day', OrderedDict([
        ('grouping', 'week'),
        ("new_users", [
            {'range': 'Week 1', 'total': 78},
            {'range': 'Week 2', 'total': 67},
            {'range': 'Week 3', 'total': 47},
            {'range': 'Week 4', 'total': 28},
            {'range': 'Week 5', 'total': 23},
        ]),
    ])),
    ('26_day', OrderedDict([
        ('grouping', 'week'),
        ("new_users", [
            {'range': 'Week 1', 'total': 78},
            {'range': 'Week 2', 'total': 67},
            {'range': 'Week 3', 'total': 47},
            {'range': 'Week 4', 'total': 28},
            {'range': 'Week 5', 'total': 23},
        ]),
    ])),
    ('27_day', OrderedDict([
        ('grouping', 'week'),
        ("new_users", [
            {'range': 'Week 1', 'total': 67},
            {'range': 'Week 2', 'total': 47},
            {'range': 'Week 3', 'total': 28},
            {'range': 'Week 4', 'total': 23},
            {'range': 'Week 5', 'total': 6},
        ]),
    ])),
    ('28_day', OrderedDict([
        ('grouping', 'week'),
        ("new_users", [
            {'range': 'Week 1', 'total': 67},
            {'range': 'Week 2', 'total': 47},
            {'range': 'Week 3', 'total': 28},
            {'range': 'Week 4', 'total': 23},
            {'range': 'Week 5', 'total': 6},
        ]),
    ])),
    ('29_day', OrderedDict([
        ('grouping', 'week'),
        ("new_users", [
            {'range': 'Week 1', 'total': 67},
            {'range': 'Week 2', 'total': 47},
            {'range': 'Week 3', 'total': 28},
            {'range': 'Week 4', 'total': 23},
            {'range': 'Week 5', 'total': 6},
        ]),
    ])),
])


ORDER_SUCCESS_RATE = OrderedDict([
    ('1_day', OrderedDict([
        ('grouping', 'week'),
        ("order_success_rate", [
            {'range': 'Week 1', 'total': 0.9417},
            {'range': 'Week 2', 'total': 0.9436},
            {'range': 'Week 3', 'total': 0.9439},
            {'range': 'Week 4', 'total': 0.9443},
            {'range': 'Week 5', 'total': 0.9434},
        ]),
    ])),
    ('2_day', OrderedDict([
        ('grouping', 'week'),
        ("order_success_rate", [
            {'range': 'Week 1', 'total': 0.9417},
            {'range': 'Week 2', 'total': 0.9436},
            {'range': 'Week 3', 'total': 0.9439},
            {'range': 'Week 4', 'total': 0.9443},
            {'range': 'Week 5', 'total': 0.9434},
        ]),
    ])),
    ('3_day', OrderedDict([
        ('grouping', 'week'),
        ("order_success_rate", [
            {'range': 'Week 1', 'total': 0.9417},
            {'range': 'Week 2', 'total': 0.9436},
            {'range': 'Week 3', 'total': 0.9439},
            {'range': 'Week 4', 'total': 0.9443},
            {'range': 'Week 5', 'total': 0.9434},
        ]),
    ])),
    ('4_day', OrderedDict([
        ('grouping', 'week'),
        ("order_success_rate", [
            {'range': 'Week 1', 'total': 0.9417},
            {'range': 'Week 2', 'total': 0.9436},
            {'range': 'Week 3', 'total': 0.9439},
            {'range': 'Week 4', 'total': 0.9443},
            {'range': 'Week 5', 'total': 0.9434},
        ]),
    ])),
    ('5_day', OrderedDict([
        ('grouping', 'week'),
        ("order_success_rate", [
            {'range': 'Week 1', 'total': 0.9417},
            {'range': 'Week 2', 'total': 0.9436},
            {'range': 'Week 3', 'total': 0.9439},
            {'range': 'Week 4', 'total': 0.9443},
            {'range': 'Week 5', 'total': 0.9434},
        ]),
    ])),
    ('6_day', OrderedDict([
        ('grouping', 'week'),
        ("order_success_rate", [
            {'range': 'Week 1', 'total': 0.9436},
            {'range': 'Week 2', 'total': 0.9439},
            {'range': 'Week 3', 'total': 0.9443},
            {'range': 'Week 4', 'total': 0.9434},
            {'range': 'Week 5', 'total': 0.9459},
        ]),
    ])),
    ('7_day', OrderedDict([
        ('grouping', 'week'),
        ("order_success_rate", [
            {'range': 'Week 1', 'total': 0.9436},
            {'range': 'Week 2', 'total': 0.9439},
            {'range': 'Week 3', 'total': 0.9443},
            {'range': 'Week 4', 'total': 0.9434},
            {'range': 'Week 5', 'total': 0.9459},
        ]),
    ])),
    ('8_day', OrderedDict([
        ('grouping', 'week'),
        ("order_success_rate", [
            {'range': 'Week 1', 'total': 0.9436},
            {'range': 'Week 2', 'total': 0.9439},
            {'range': 'Week 3', 'total': 0.9443},
            {'range': 'Week 4', 'total': 0.9434},
            {'range': 'Week 5', 'total': 0.9459},
        ]),
    ])),
    ('9_day', OrderedDict([
        ('grouping', 'week'),
        ("order_success_rate", [
            {'range': 'Week 1', 'total': 0.9436},
            {'range': 'Week 2', 'total': 0.9439},
            {'range': 'Week 3', 'total': 0.9443},
            {'range': 'Week 4', 'total': 0.9434},
            {'range': 'Week 5', 'total': 0.9459},
        ]),
    ])),
    ('10_day', OrderedDict([
        ('grouping', 'week'),
        ("order_success_rate", [
            {'range': 'Week 1', 'total': 0.9436},
            {'range': 'Week 2', 'total': 0.9439},
            {'range': 'Week 3', 'total': 0.9443},
            {'range': 'Week 4', 'total': 0.9434},
            {'range': 'Week 5', 'total': 0.9459},
        ]),
    ])),
    ('11_day', OrderedDict([
        ('grouping', 'week'),
        ("order_success_rate", [
            {'range': 'Week 1', 'total': 0.9436},
            {'range': 'Week 2', 'total': 0.9439},
            {'range': 'Week 3', 'total': 0.9443},
            {'range': 'Week 4', 'total': 0.9434},
            {'range': 'Week 5', 'total': 0.9459},
        ]),
    ])),
    ('12_day', OrderedDict([
        ('grouping', 'week'),
        ("order_success_rate", [
            {'range': 'Week 1', 'total': 0.9436},
            {'range': 'Week 2', 'total': 0.9439},
            {'range': 'Week 3', 'total': 0.9443},
            {'range': 'Week 4', 'total': 0.9434},
            {'range': 'Week 5', 'total': 0.9459},
        ]),
    ])),
    ('13_day', OrderedDict([
        ('grouping', 'week'),
        ("order_success_rate", [
            {'range': 'Week 1', 'total': 0.9439},
            {'range': 'Week 2', 'total': 0.9443},
            {'range': 'Week 3', 'total': 0.9434},
            {'range': 'Week 4', 'total': 0.9459},
            {'range': 'Week 5', 'total': 0.9441},
        ]),
    ])),
    ('14_day', OrderedDict([
        ('grouping', 'week'),
        ("order_success_rate", [
            {'range': 'Week 1', 'total': 0.9439},
            {'range': 'Week 2', 'total': 0.9443},
            {'range': 'Week 3', 'total': 0.9434},
            {'range': 'Week 4', 'total': 0.9459},
            {'range': 'Week 5', 'total': 0.9441},
        ]),
    ])),
    ('15_day', OrderedDict([
        ('grouping', 'week'),
        ("order_success_rate", [
            {'range': 'Week 1', 'total': 0.9439},
            {'range': 'Week 2', 'total': 0.9443},
            {'range': 'Week 3', 'total': 0.9434},
            {'range': 'Week 4', 'total': 0.9459},
            {'range': 'Week 5', 'total': 0.9441},
        ]),
    ])),
    ('16_day', OrderedDict([
        ('grouping', 'week'),
        ("order_success_rate", [
            {'range': 'Week 1', 'total': 0.9439},
            {'range': 'Week 2', 'total': 0.9443},
            {'range': 'Week 3', 'total': 0.9434},
            {'range': 'Week 4', 'total': 0.9459},
            {'range': 'Week 5', 'total': 0.9441},
        ]),
    ])),
    ('17_day', OrderedDict([
        ('grouping', 'week'),
        ("order_success_rate", [
            {'range': 'Week 1', 'total': 0.9439},
            {'range': 'Week 2', 'total': 0.9443},
            {'range': 'Week 3', 'total': 0.9434},
            {'range': 'Week 4', 'total': 0.9459},
            {'range': 'Week 5', 'total': 0.9441},
        ]),
    ])),
    ('18_day', OrderedDict([
        ('grouping', 'week'),
        ("order_success_rate", [
            {'range': 'Week 1', 'total': 0.9439},
            {'range': 'Week 2', 'total': 0.9443},
            {'range': 'Week 3', 'total': 0.9434},
            {'range': 'Week 4', 'total': 0.9459},
            {'range': 'Week 5', 'total': 0.9441},
        ]),
    ])),
    ('19_day', OrderedDict([
        ('grouping', 'week'),
        ("order_success_rate", [
            {'range': 'Week 1', 'total': 0.9439},
            {'range': 'Week 2', 'total': 0.9443},
            {'range': 'Week 3', 'total': 0.9434},
            {'range': 'Week 4', 'total': 0.9459},
            {'range': 'Week 5', 'total': 0.9441},
        ]),
    ])),
    ('20_day', OrderedDict([
        ('grouping', 'week'),
        ("order_success_rate", [
            {'range': 'Week 1', 'total': 0.9443},
            {'range': 'Week 2', 'total': 0.9434},
            {'range': 'Week 3', 'total': 0.9459},
            {'range': 'Week 4', 'total': 0.9441},
            {'range': 'Week 5', 'total': 0.9468},
        ]),
    ])),
    ('21_day', OrderedDict([
        ('grouping', 'week'),
        ("order_success_rate", [
            {'range': 'Week 1', 'total': 0.9443},
            {'range': 'Week 2', 'total': 0.9434},
            {'range': 'Week 3', 'total': 0.9459},
            {'range': 'Week 4', 'total': 0.9441},
            {'range': 'Week 5', 'total': 0.9468},
        ]),
    ])),
    ('22_day', OrderedDict([
        ('grouping', 'week'),
        ("order_success_rate", [
            {'range': 'Week 1', 'total': 0.9443},
            {'range': 'Week 2', 'total': 0.9434},
            {'range': 'Week 3', 'total': 0.9459},
            {'range': 'Week 4', 'total': 0.9441},
            {'range': 'Week 5', 'total': 0.9468},
        ]),
    ])),
    ('23_day', OrderedDict([
        ('grouping', 'week'),
        ("order_success_rate", [
            {'range': 'Week 1', 'total': 0.9443},
            {'range': 'Week 2', 'total': 0.9434},
            {'range': 'Week 3', 'total': 0.9459},
            {'range': 'Week 4', 'total': 0.9441},
            {'range': 'Week 5', 'total': 0.9468},
        ]),
    ])),
    ('24_day', OrderedDict([
        ('grouping', 'week'),
        ("order_success_rate", [
            {'range': 'Week 1', 'total': 0.9443},
            {'range': 'Week 2', 'total': 0.9434},
            {'range': 'Week 3', 'total': 0.9459},
            {'range': 'Week 4', 'total': 0.9441},
            {'range': 'Week 5', 'total': 0.9468},
        ]),
    ])),
    ('25_day', OrderedDict([
        ('grouping', 'week'),
        ("order_success_rate", [
            {'range': 'Week 1', 'total': 0.9443},
            {'range': 'Week 2', 'total': 0.9434},
            {'range': 'Week 3', 'total': 0.9459},
            {'range': 'Week 4', 'total': 0.9441},
            {'range': 'Week 5', 'total': 0.9468},
        ]),
    ])),
    ('26_day', OrderedDict([
        ('grouping', 'week'),
        ("order_success_rate", [
            {'range': 'Week 1', 'total': 0.9443},
            {'range': 'Week 2', 'total': 0.9434},
            {'range': 'Week 3', 'total': 0.9459},
            {'range': 'Week 4', 'total': 0.9441},
            {'range': 'Week 5', 'total': 0.9468},
        ]),
    ])),
    ('27_day', OrderedDict([
        ('grouping', 'week'),
        ("order_success_rate", [
            {'range': 'Week 1', 'total': 0.9434},
            {'range': 'Week 2', 'total': 0.9459},
            {'range': 'Week 3', 'total': 0.9441},
            {'range': 'Week 4', 'total': 0.9468},
            {'range': 'Week 5', 'total': 0.9484},
        ]),
    ])),
    ('28_day', OrderedDict([
        ('grouping', 'week'),
        ("order_success_rate", [
            {'range': 'Week 1', 'total': 0.9434},
            {'range': 'Week 2', 'total': 0.9459},
            {'range': 'Week 3', 'total': 0.9441},
            {'range': 'Week 4', 'total': 0.9468},
            {'range': 'Week 5', 'total': 0.9484},
        ]),
    ])),
    ('29_day', OrderedDict([
        ('grouping', 'week'),
        ("order_success_rate", [
            {'range': 'Week 1', 'total': 0.9434},
            {'range': 'Week 2', 'total': 0.9459},
            {'range': 'Week 3', 'total': 0.9441},
            {'range': 'Week 4', 'total': 0.9468},
            {'range': 'Week 5', 'total': 0.9484},
        ]),
    ])),
])


CONVERSION_RATE_EASYTRADE = OrderedDict([
    ('1_day', OrderedDict([
        ('grouping', 'week'),
        ("conversion_rate", [
            {'range': 'Week 1', 'total': 0.4931},
            {'range': 'Week 2', 'total': 0.5053},
            {'range': 'Week 3', 'total': 0.5010},
            {'range': 'Week 4', 'total': 0.5034},
            {'range': 'Week 5', 'total': 0.5039},
        ]),
    ])),
    ('2_day', OrderedDict([
        ('grouping', 'week'),
        ("conversion_rate", [
            {'range': 'Week 1', 'total': 0.4931},
            {'range': 'Week 2', 'total': 0.5053},
            {'range': 'Week 3', 'total': 0.5010},
            {'range': 'Week 4', 'total': 0.5034},
            {'range': 'Week 5', 'total': 0.5039},
        ]),
    ])),
    ('3_day', OrderedDict([
        ('grouping', 'week'),
        ("conversion_rate", [
            {'range': 'Week 1', 'total': 0.4931},
            {'range': 'Week 2', 'total': 0.5053},
            {'range': 'Week 3', 'total': 0.5010},
            {'range': 'Week 4', 'total': 0.5034},
            {'range': 'Week 5', 'total': 0.5039},
        ]),
    ])),
    ('4_day', OrderedDict([
        ('grouping', 'week'),
        ("conversion_rate", [
            {'range': 'Week 1', 'total': 0.4931},
            {'range': 'Week 2', 'total': 0.5053},
            {'range': 'Week 3', 'total': 0.5010},
            {'range': 'Week 4', 'total': 0.5034},
            {'range': 'Week 5', 'total': 0.5039},
        ]),
    ])),
    ('5_day', OrderedDict([
        ('grouping', 'week'),
        ("conversion_rate", [
            {'range': 'Week 1', 'total': 0.4931},
            {'range': 'Week 2', 'total': 0.5053},
            {'range': 'Week 3', 'total': 0.5010},
            {'range': 'Week 4', 'total': 0.5034},
            {'range': 'Week 5', 'total': 0.5039},
        ]),
    ])),
    ('6_day', OrderedDict([
        ('grouping', 'week'),
        ("conversion_rate", [
            {'range': 'Week 1', 'total': 0.5053},
            {'range': 'Week 2', 'total': 0.5010},
            {'range': 'Week 3', 'total': 0.5034},
            {'range': 'Week 4', 'total': 0.5039},
            {'range': 'Week 5', 'total': 0.5027},
        ]),
    ])),
    ('7_day', OrderedDict([
        ('grouping', 'week'),
        ("conversion_rate", [
            {'range': 'Week 1', 'total': 0.5053},
            {'range': 'Week 2', 'total': 0.5010},
            {'range': 'Week 3', 'total': 0.5034},
            {'range': 'Week 4', 'total': 0.5039},
            {'range': 'Week 5', 'total': 0.5027},
        ]),
    ])),
    ('8_day', OrderedDict([
        ('grouping', 'week'),
        ("conversion_rate", [
            {'range': 'Week 1', 'total': 0.5053},
            {'range': 'Week 2', 'total': 0.5010},
            {'range': 'Week 3', 'total': 0.5034},
            {'range': 'Week 4', 'total': 0.5039},
            {'range': 'Week 5', 'total': 0.5027},
        ]),
    ])),
    ('9_day', OrderedDict([
        ('grouping', 'week'),
        ("conversion_rate", [
            {'range': 'Week 1', 'total': 0.5053},
            {'range': 'Week 2', 'total': 0.5010},
            {'range': 'Week 3', 'total': 0.5034},
            {'range': 'Week 4', 'total': 0.5039},
            {'range': 'Week 5', 'total': 0.5027},
        ]),
    ])),
    ('10_day', OrderedDict([
        ('grouping', 'week'),
        ("conversion_rate", [
            {'range': 'Week 1', 'total': 0.5053},
            {'range': 'Week 2', 'total': 0.5010},
            {'range': 'Week 3', 'total': 0.5034},
            {'range': 'Week 4', 'total': 0.5039},
            {'range': 'Week 5', 'total': 0.5027},
        ]),
    ])),
    ('11_day', OrderedDict([
        ('grouping', 'week'),
        ("conversion_rate", [
            {'range': 'Week 1', 'total': 0.5053},
            {'range': 'Week 2', 'total': 0.5010},
            {'range': 'Week 3', 'total': 0.5034},
            {'range': 'Week 4', 'total': 0.5039},
            {'range': 'Week 5', 'total': 0.5027},
        ]),
    ])),
    ('12_day', OrderedDict([
        ('grouping', 'week'),
        ("conversion_rate", [
            {'range': 'Week 1', 'total': 0.5053},
            {'range': 'Week 2', 'total': 0.5010},
            {'range': 'Week 3', 'total': 0.5034},
            {'range': 'Week 4', 'total': 0.5039},
            {'range': 'Week 5', 'total': 0.5027},
        ]),
    ])),
    ('13_day', OrderedDict([
        ('grouping', 'week'),
        ("conversion_rate", [
            {'range': 'Week 1', 'total': 0.5010},
            {'range': 'Week 2', 'total': 0.5034},
            {'range': 'Week 3', 'total': 0.5039},
            {'range': 'Week 4', 'total': 0.5027},
            {'range': 'Week 5', 'total': 0.5055},
        ]),
    ])),
    ('14_day', OrderedDict([
        ('grouping', 'week'),
        ("conversion_rate", [
            {'range': 'Week 1', 'total': 0.5010},
            {'range': 'Week 2', 'total': 0.5034},
            {'range': 'Week 3', 'total': 0.5039},
            {'range': 'Week 4', 'total': 0.5027},
            {'range': 'Week 5', 'total': 0.5055},
        ]),
    ])),
    ('15_day', OrderedDict([
        ('grouping', 'week'),
        ("conversion_rate", [
            {'range': 'Week 1', 'total': 0.5010},
            {'range': 'Week 2', 'total': 0.5034},
            {'range': 'Week 3', 'total': 0.5039},
            {'range': 'Week 4', 'total': 0.5027},
            {'range': 'Week 5', 'total': 0.5055},
        ]),
    ])),
    ('16_day', OrderedDict([
        ('grouping', 'week'),
        ("conversion_rate", [
            {'range': 'Week 1', 'total': 0.5010},
            {'range': 'Week 2', 'total': 0.5034},
            {'range': 'Week 3', 'total': 0.5039},
            {'range': 'Week 4', 'total': 0.5027},
            {'range': 'Week 5', 'total': 0.5055},
        ]),
    ])),
    ('17_day', OrderedDict([
        ('grouping', 'week'),
        ("conversion_rate", [
            {'range': 'Week 1', 'total': 0.5010},
            {'range': 'Week 2', 'total': 0.5034},
            {'range': 'Week 3', 'total': 0.5039},
            {'range': 'Week 4', 'total': 0.5027},
            {'range': 'Week 5', 'total': 0.5055},
        ]),
    ])),
    ('18_day', OrderedDict([
        ('grouping', 'week'),
        ("conversion_rate", [
            {'range': 'Week 1', 'total': 0.5010},
            {'range': 'Week 2', 'total': 0.5034},
            {'range': 'Week 3', 'total': 0.5039},
            {'range': 'Week 4', 'total': 0.5027},
            {'range': 'Week 5', 'total': 0.5055},
        ]),
    ])),
    ('19_day', OrderedDict([
        ('grouping', 'week'),
        ("conversion_rate", [
            {'range': 'Week 1', 'total': 0.5010},
            {'range': 'Week 2', 'total': 0.5034},
            {'range': 'Week 3', 'total': 0.5039},
            {'range': 'Week 4', 'total': 0.5027},
            {'range': 'Week 5', 'total': 0.5055},
        ]),
    ])),
    ('20_day', OrderedDict([
        ('grouping', 'week'),
        ("conversion_rate", [
            {'range': 'Week 1', 'total': 0.5034},
            {'range': 'Week 2', 'total': 0.5039},
            {'range': 'Week 3', 'total': 0.5027},
            {'range': 'Week 4', 'total': 0.5055},
            {'range': 'Week 5', 'total': 0.5037},
        ]),
    ])),
    ('21_day', OrderedDict([
        ('grouping', 'week'),
        ("conversion_rate", [
            {'range': 'Week 1', 'total': 0.5034},
            {'range': 'Week 2', 'total': 0.5039},
            {'range': 'Week 3', 'total': 0.5027},
            {'range': 'Week 4', 'total': 0.5055},
            {'range': 'Week 5', 'total': 0.5037},
        ]),
    ])),
    ('22_day', OrderedDict([
        ('grouping', 'week'),
        ("conversion_rate", [
            {'range': 'Week 1', 'total': 0.5034},
            {'range': 'Week 2', 'total': 0.5039},
            {'range': 'Week 3', 'total': 0.5027},
            {'range': 'Week 4', 'total': 0.5055},
            {'range': 'Week 5', 'total': 0.5037},
        ]),
    ])),
    ('23_day', OrderedDict([
        ('grouping', 'week'),
        ("conversion_rate", [
            {'range': 'Week 1', 'total': 0.5034},
            {'range': 'Week 2', 'total': 0.5039},
            {'range': 'Week 3', 'total': 0.5027},
            {'range': 'Week 4', 'total': 0.5055},
            {'range': 'Week 5', 'total': 0.5037},
        ]),
    ])),
    ('24_day', OrderedDict([
        ('grouping', 'week'),
        ("conversion_rate", [
            {'range': 'Week 1', 'total': 0.5034},
            {'range': 'Week 2', 'total': 0.5039},
            {'range': 'Week 3', 'total': 0.5027},
            {'range': 'Week 4', 'total': 0.5055},
            {'range': 'Week 5', 'total': 0.5037},
        ]),
    ])),
    ('25_day', OrderedDict([
        ('grouping', 'week'),
        ("conversion_rate", [
            {'range': 'Week 1', 'total': 0.5034},
            {'range': 'Week 2', 'total': 0.5039},
            {'range': 'Week 3', 'total': 0.5027},
            {'range': 'Week 4', 'total': 0.5055},
            {'range': 'Week 5', 'total': 0.5037},
        ]),
    ])),
    ('26_day', OrderedDict([
        ('grouping', 'week'),
        ("conversion_rate", [
            {'range': 'Week 1', 'total': 0.5034},
            {'range': 'Week 2', 'total': 0.5039},
            {'range': 'Week 3', 'total': 0.5027},
            {'range': 'Week 4', 'total': 0.5055},
            {'range': 'Week 5', 'total': 0.5037},
        ]),
    ])),
    ('27_day', OrderedDict([
        ('grouping', 'week'),
        ("conversion_rate", [
            {'range': 'Week 1', 'total': 0.5039},
            {'range': 'Week 2', 'total': 0.5027},
            {'range': 'Week 3', 'total': 0.5055},
            {'range': 'Week 4', 'total': 0.5037},
            {'range': 'Week 5', 'total': 0.5039},
        ]),
    ])),
    ('28_day', OrderedDict([
        ('grouping', 'week'),
        ("conversion_rate", [
            {'range': 'Week 1', 'total': 0.5039},
            {'range': 'Week 2', 'total': 0.5027},
            {'range': 'Week 3', 'total': 0.5055},
            {'range': 'Week 4', 'total': 0.5037},
            {'range': 'Week 5', 'total': 0.5039},
        ]),
    ])),
    ('29_day', OrderedDict([
        ('grouping', 'week'),
        ("conversion_rate", [
            {'range': 'Week 1', 'total': 0.5039},
            {'range': 'Week 2', 'total': 0.5027},
            {'range': 'Week 3', 'total': 0.5055},
            {'range': 'Week 4', 'total': 0.5037},
            {'range': 'Week 5', 'total': 0.5039},
        ]),
    ])),
])



ORDER_PLACED_EASYTRADE = OrderedDict([
    ('1_day', OrderedDict([
        ('grouping', 'week'),
        ("order_placed", [
            {'range': 'Week 1', 'total': 5868},
            {'range': 'Week 2', 'total': 6041},
            {'range': 'Week 3', 'total': 6231},
            {'range': 'Week 4', 'total': 5992},
            {'range': 'Week 5', 'total': 5560},
        ]),
    ])),
    ('2_day', OrderedDict([
        ('grouping', 'week'),
        ("order_placed", [
            {'range': 'Week 1', 'total': 5868},
            {'range': 'Week 2', 'total': 6041},
            {'range': 'Week 3', 'total': 6231},
            {'range': 'Week 4', 'total': 5992},
            {'range': 'Week 5', 'total': 5560},
        ]),
    ])),
    ('3_day', OrderedDict([
        ('grouping', 'week'),
        ("order_placed", [
            {'range': 'Week 1', 'total': 5868},
            {'range': 'Week 2', 'total': 6041},
            {'range': 'Week 3', 'total': 6231},
            {'range': 'Week 4', 'total': 5992},
            {'range': 'Week 5', 'total': 5560},
        ]),
    ])),
    ('4_day', OrderedDict([
        ('grouping', 'week'),
        ("order_placed", [
            {'range': 'Week 1', 'total': 5868},
            {'range': 'Week 2', 'total': 6041},
            {'range': 'Week 3', 'total': 6231},
            {'range': 'Week 4', 'total': 5992},
            {'range': 'Week 5', 'total': 5560},
        ]),
    ])),
    ('5_day', OrderedDict([
        ('grouping', 'week'),
        ("order_placed", [
            {'range': 'Week 1', 'total': 5868},
            {'range': 'Week 2', 'total': 6041},
            {'range': 'Week 3', 'total': 6231},
            {'range': 'Week 4', 'total': 5992},
            {'range': 'Week 5', 'total': 5560},
        ]),
    ])),
    ('6_day', OrderedDict([
        ('grouping', 'week'),
        ("order_placed", [
            {'range': 'Week 1', 'total': 6041},
            {'range': 'Week 2', 'total': 6231},
            {'range': 'Week 3', 'total': 5992},
            {'range': 'Week 4', 'total': 5560},
            {'range': 'Week 5', 'total': 5511},
        ]),
    ])),
    ('7_day', OrderedDict([
        ('grouping', 'week'),
        ("order_placed", [
            {'range': 'Week 1', 'total': 6041},
            {'range': 'Week 2', 'total': 6231},
            {'range': 'Week 3', 'total': 5992},
            {'range': 'Week 4', 'total': 5560},
            {'range': 'Week 5', 'total': 5511},
        ]),
    ])),
    ('8_day', OrderedDict([
        ('grouping', 'week'),
        ("order_placed", [
            {'range': 'Week 1', 'total': 6041},
            {'range': 'Week 2', 'total': 6231},
            {'range': 'Week 3', 'total': 5992},
            {'range': 'Week 4', 'total': 5560},
            {'range': 'Week 5', 'total': 5511},
        ]),
    ])),
    ('9_day', OrderedDict([
        ('grouping', 'week'),
        ("order_placed", [
            {'range': 'Week 1', 'total': 6041},
            {'range': 'Week 2', 'total': 6231},
            {'range': 'Week 3', 'total': 5992},
            {'range': 'Week 4', 'total': 5560},
            {'range': 'Week 5', 'total': 5511},
        ]),
    ])),
    ('10_day', OrderedDict([
        ('grouping', 'week'),
        ("order_placed", [
            {'range': 'Week 1', 'total': 6041},
            {'range': 'Week 2', 'total': 6231},
            {'range': 'Week 3', 'total': 5992},
            {'range': 'Week 4', 'total': 5560},
            {'range': 'Week 5', 'total': 5511},
        ]),
    ])),
    ('11_day', OrderedDict([
        ('grouping', 'week'),
        ("order_placed", [
            {'range': 'Week 1', 'total': 6041},
            {'range': 'Week 2', 'total': 6231},
            {'range': 'Week 3', 'total': 5992},
            {'range': 'Week 4', 'total': 5560},
            {'range': 'Week 5', 'total': 5511},
        ]),
    ])),
    ('12_day', OrderedDict([
        ('grouping', 'week'),
        ("order_placed", [
            {'range': 'Week 1', 'total': 6041},
            {'range': 'Week 2', 'total': 6231},
            {'range': 'Week 3', 'total': 5992},
            {'range': 'Week 4', 'total': 5560},
            {'range': 'Week 5', 'total': 5511},
        ]),
    ])),
    ('13_day', OrderedDict([
        ('grouping', 'week'),
        ("order_placed", [
            {'range': 'Week 1', 'total': 6231},
            {'range': 'Week 2', 'total': 5992},
            {'range': 'Week 3', 'total': 5560},
            {'range': 'Week 4', 'total': 5511},
            {'range': 'Week 5', 'total': 5628},
        ]),
    ])),
    ('14_day', OrderedDict([
        ('grouping', 'week'),
        ("order_placed", [
            {'range': 'Week 1', 'total': 6231},
            {'range': 'Week 2', 'total': 5992},
            {'range': 'Week 3', 'total': 5560},
            {'range': 'Week 4', 'total': 5511},
            {'range': 'Week 5', 'total': 5628},
        ]),
    ])),
    ('15_day', OrderedDict([
        ('grouping', 'week'),
        ("order_placed", [
            {'range': 'Week 1', 'total': 6231},
            {'range': 'Week 2', 'total': 5992},
            {'range': 'Week 3', 'total': 5560},
            {'range': 'Week 4', 'total': 5511},
            {'range': 'Week 5', 'total': 5628},
        ]),
    ])),
    ('16_day', OrderedDict([
        ('grouping', 'week'),
        ("order_placed", [
            {'range': 'Week 1', 'total': 6231},
            {'range': 'Week 2', 'total': 5992},
            {'range': 'Week 3', 'total': 5560},
            {'range': 'Week 4', 'total': 5511},
            {'range': 'Week 5', 'total': 5628},
        ]),
    ])),
    ('17_day', OrderedDict([
        ('grouping', 'week'),
        ("order_placed", [
            {'range': 'Week 1', 'total': 6231},
            {'range': 'Week 2', 'total': 5992},
            {'range': 'Week 3', 'total': 5560},
            {'range': 'Week 4', 'total': 5511},
            {'range': 'Week 5', 'total': 5628},
        ]),
    ])),
    ('18_day', OrderedDict([
        ('grouping', 'week'),
        ("order_placed", [
            {'range': 'Week 1', 'total': 6231},
            {'range': 'Week 2', 'total': 5992},
            {'range': 'Week 3', 'total': 5560},
            {'range': 'Week 4', 'total': 5511},
            {'range': 'Week 5', 'total': 5628},
        ]),
    ])),
    ('19_day', OrderedDict([
        ('grouping', 'week'),
        ("order_placed", [
            {'range': 'Week 1', 'total': 6231},
            {'range': 'Week 2', 'total': 5992},
            {'range': 'Week 3', 'total': 5560},
            {'range': 'Week 4', 'total': 5511},
            {'range': 'Week 5', 'total': 5628},
        ]),
    ])),
    ('20_day', OrderedDict([
        ('grouping', 'week'),
        ("order_placed", [
            {'range': 'Week 1', 'total': 5992},
            {'range': 'Week 2', 'total': 5560},
            {'range': 'Week 3', 'total': 5511},
            {'range': 'Week 4', 'total': 5628},
            {'range': 'Week 5', 'total': 5982},
        ]),
    ])),
    ('21_day', OrderedDict([
        ('grouping', 'week'),
        ("order_placed", [
            {'range': 'Week 1', 'total': 5992},
            {'range': 'Week 2', 'total': 5560},
            {'range': 'Week 3', 'total': 5511},
            {'range': 'Week 4', 'total': 5628},
            {'range': 'Week 5', 'total': 5982},
        ]),
    ])),
    ('22_day', OrderedDict([
        ('grouping', 'week'),
        ("order_placed", [
            {'range': 'Week 1', 'total': 5992},
            {'range': 'Week 2', 'total': 5560},
            {'range': 'Week 3', 'total': 5511},
            {'range': 'Week 4', 'total': 5628},
            {'range': 'Week 5', 'total': 5982},
        ]),
    ])),
    ('23_day', OrderedDict([
        ('grouping', 'week'),
        ("order_placed", [
            {'range': 'Week 1', 'total': 5992},
            {'range': 'Week 2', 'total': 5560},
            {'range': 'Week 3', 'total': 5511},
            {'range': 'Week 4', 'total': 5628},
            {'range': 'Week 5', 'total': 5982},
        ]),
    ])),
    ('24_day', OrderedDict([
        ('grouping', 'week'),
        ("order_placed", [
            {'range': 'Week 1', 'total': 5992},
            {'range': 'Week 2', 'total': 5560},
            {'range': 'Week 3', 'total': 5511},
            {'range': 'Week 4', 'total': 5628},
            {'range': 'Week 5', 'total': 5982},
        ]),
    ])),
    ('25_day', OrderedDict([
        ('grouping', 'week'),
        ("order_placed", [
            {'range': 'Week 1', 'total': 5992},
            {'range': 'Week 2', 'total': 5560},
            {'range': 'Week 3', 'total': 5511},
            {'range': 'Week 4', 'total': 5628},
            {'range': 'Week 5', 'total': 5982},
        ]),
    ])),
    ('26_day', OrderedDict([
        ('grouping', 'week'),
        ("order_placed", [
            {'range': 'Week 1', 'total': 5992},
            {'range': 'Week 2', 'total': 5560},
            {'range': 'Week 3', 'total': 5511},
            {'range': 'Week 4', 'total': 5628},
            {'range': 'Week 5', 'total': 5982},
        ]),
    ])),
    ('27_day', OrderedDict([
        ('grouping', 'week'),
        ("order_placed", [
            {'range': 'Week 1', 'total': 5560},
            {'range': 'Week 2', 'total': 5511},
            {'range': 'Week 3', 'total': 5628},
            {'range': 'Week 4', 'total': 5982},
            {'range': 'Week 5', 'total': 5949},
        ]),
    ])),
    ('28_day', OrderedDict([
        ('grouping', 'week'),
        ("order_placed", [
            {'range': 'Week 1', 'total': 5560},
            {'range': 'Week 2', 'total': 5511},
            {'range': 'Week 3', 'total': 5628},
            {'range': 'Week 4', 'total': 5982},
            {'range': 'Week 5', 'total': 5949},
        ]),
    ])),
    ('29_day', OrderedDict([
        ('grouping', 'week'),
        ("order_placed", [
            {'range': 'Week 1', 'total': 5560},
            {'range': 'Week 2', 'total': 5511},
            {'range': 'Week 3', 'total': 5628},
            {'range': 'Week 4', 'total': 5982},
            {'range': 'Week 5', 'total': 5949},
        ]),
    ])),
])


ACTIVE_USERS_VS_EVENTS_EASYTRADE = {
    "1_day": {
        "active_users": [
            {"sum": 13, "period": "2025-W44"},
            {"sum": 354, "period": "2025-W45"}, 
            {"sum": 355, "period": "2025-W46"},
            {"sum": 347, "period": "2025-W47"},
            {"sum": 281, "period": "2025-W48"},
            {"sum": 284, "period": "2025-W49"},
            {"sum": 61, "period": "2026-W01"}
        ],
        "events": [
            {"sum": 56, "period": "2025-W44"},
            {"sum": 240, "period": "2025-W45"},
            {"sum": 305, "period": "2025-W46"},
            {"sum": 289, "period": "2025-W47"},
            {"sum": 555, "period": "2025-W48"},
            {"sum": 482, "period": "2025-W49"},
            {"sum": 671, "period": "2026-W01"}
        ],
        "grouping": "week"
    },
    "7_day": {
        "active_users": [
            {"sum": 367, "period": "2025-W45"},
            {"sum": 709, "period": "2025-W46"},
            {"sum": 702, "period": "2025-W47"},
            {"sum": 625, "period": "2025-W48"},
            {"sum": 565, "period": "2025-W49"},
            {"sum": 345, "period": "2025-W50"},
            {"sum": 61, "period": "2026-W01"}
        ],
        "events": [
            {"sum": 296, "period": "2025-W45"},
            {"sum": 594, "period": "2025-W46"},
            {"sum": 594, "period": "2025-W47"},
            {"sum": 1040, "period": "2025-W48"},
            {"sum": 1037, "period": "2025-W49"},
            {"sum": 482, "period": "2025-W50"},
            {"sum": 671, "period": "2026-W01"}
        ],
        "grouping": "week"
    },
    "14_day": {
        "active_users": [
            {"sum": 721, "period": "2025-W46"},
            {"sum": 1411, "period": "2025-W47"},
            {"sum": 1327, "period": "2025-W48"},
            {"sum": 1290, "period": "2025-W49"},
            {"sum": 910, "period": "2025-W50"},
            {"sum": 406, "period": "2026-W01"}
        ],
        "events": [
            {"sum": 890, "period": "2025-W46"},
            {"sum": 1188, "period": "2025-W47"},
            {"sum": 1595, "period": "2025-W48"},
            {"sum": 2077, "period": "2025-W49"},
            {"sum": 1519, "period": "2025-W50"},
            {"sum": 1153, "period": "2026-W01"}
        ],
        "grouping": "week"
    },
    "21_day": {
        "active_users": [
            {"sum": 1076, "period": "2025-W47"},
            {"sum": 1738, "period": "2025-W48"},
            {"sum": 1871, "period": "2025-W49"},
            {"sum": 1606, "period": "2025-W50"},
            {"sum": 971, "period": "2026-W01"}
        ],
        "events": [
            {"sum": 1483, "period": "2025-W47"},
            {"sum": 2178, "period": "2025-W48"},
            {"sum": 3222, "period": "2025-W49"},
            {"sum": 2535, "period": "2025-W50"},
            {"sum": 1824, "period": "2026-W01"}
        ],
        "grouping": "week"
    },
    "28_day": {
        "active_users": [
            {"sum": 1423, "period": "2025-W48"},
            {"sum": 2162, "period": "2025-W49"},
            {"sum": 2327, "period": "2025-W50"},
            {"sum": 2032, "period": "2026-W01"}
        ],
        "events": [
            {"sum": 2043, "period": "2025-W48"},
            {"sum": 3799, "period": "2025-W49"},
            {"sum": 3954, "period": "2025-W50"},
            {"sum": 3025, "period": "2026-W01"}
        ],
        "grouping": "week"
    },
    "2_day": {
        "active_users": [
            {"sum": 13, "period": "2025-W44"},
            {"sum": 367, "period": "2025-W45"},
            {"sum": 709, "period": "2025-W46"},
            {"sum": 702, "period": "2025-W47"},
            {"sum": 625, "period": "2025-W48"},
            {"sum": 565, "period": "2025-W49"},
            {"sum": 345, "period": "2025-W50"},
            {"sum": 61, "period": "2026-W01"}
        ],
        "events": [
            {"sum": 56, "period": "2025-W44"},
            {"sum": 296, "period": "2025-W45"},
            {"sum": 594, "period": "2025-W46"},
            {"sum": 594, "period": "2025-W47"},
            {"sum": 1040, "period": "2025-W48"},
            {"sum": 1037, "period": "2025-W49"},
            {"sum": 482, "period": "2025-W50"},
            {"sum": 671, "period": "2026-W01"}
        ],
        "grouping": "week"
    },
    "3_day": {
        "active_users": [
            {"sum": 13, "period": "2025-W44"},
            {"sum": 367, "period": "2025-W45"},
            {"sum": 709, "period": "2025-W46"},
            {"sum": 702, "period": "2025-W47"},
            {"sum": 625, "period": "2025-W48"},
            {"sum": 565, "period": "2025-W49"},
            {"sum": 345, "period": "2025-W50"},
            {"sum": 61, "period": "2026-W01"}
        ],
        "events": [
            {"sum": 56, "period": "2025-W44"},
            {"sum": 296, "period": "2025-W45"},
            {"sum": 594, "period": "2025-W46"},
            {"sum": 594, "period": "2025-W47"},
            {"sum": 1040, "period": "2025-W48"},
            {"sum": 1037, "period": "2025-W49"},
            {"sum": 482, "period": "2025-W50"},
            {"sum": 671, "period": "2026-W01"}
        ],
        "grouping": "week"
    },
    "4_day": {
        "active_users": [
            {"sum": 13, "period": "2025-W44"},
            {"sum": 367, "period": "2025-W45"},
            {"sum": 709, "period": "2025-W46"},
            {"sum": 702, "period": "2025-W47"},
            {"sum": 625, "period": "2025-W48"},
            {"sum": 565, "period": "2025-W49"},
            {"sum": 345, "period": "2025-W50"},
            {"sum": 61, "period": "2026-W01"}
        ],
        "events": [
            {"sum": 56, "period": "2025-W44"},
            {"sum": 296, "period": "2025-W45"},
            {"sum": 594, "period": "2025-W46"},
            {"sum": 594, "period": "2025-W47"},
            {"sum": 1040, "period": "2025-W48"},
            {"sum": 1037, "period": "2025-W49"},
            {"sum": 482, "period": "2025-W50"},
            {"sum": 671, "period": "2026-W01"}
        ],
        "grouping": "week"
    },
    "5_day": {
        "active_users": [
            {"sum": 13, "period": "2025-W44"},
            {"sum": 367, "period": "2025-W45"},
            {"sum": 709, "period": "2025-W46"},
            {"sum": 702, "period": "2025-W47"},
            {"sum": 625, "period": "2025-W48"},
            {"sum": 565, "period": "2025-W49"},
            {"sum": 345, "period": "2025-W50"},
            {"sum": 61, "period": "2026-W01"}
        ],
        "events": [
            {"sum": 56, "period": "2025-W44"},
            {"sum": 296, "period": "2025-W45"},
            {"sum": 594, "period": "2025-W46"},
            {"sum": 594, "period": "2025-W47"},
            {"sum": 1040, "period": "2025-W48"},
            {"sum": 1037, "period": "2025-W49"},
            {"sum": 482, "period": "2025-W50"},
            {"sum": 671, "period": "2026-W01"}
        ],
        "grouping": "week"
    },
    "6_day": {
        "active_users": [
            {"sum": 367, "period": "2025-W45"},
            {"sum": 709, "period": "2025-W46"},
            {"sum": 702, "period": "2025-W47"},
            {"sum": 625, "period": "2025-W48"},
            {"sum": 565, "period": "2025-W49"},
            {"sum": 345, "period": "2025-W50"},
            {"sum": 61, "period": "2026-W01"}
        ],
        "events": [
            {"sum": 296, "period": "2025-W45"},
            {"sum": 594, "period": "2025-W46"},
            {"sum": 594, "period": "2025-W47"},
            {"sum": 1040, "period": "2025-W48"},
            {"sum": 1037, "period": "2025-W49"},
            {"sum": 482, "period": "2025-W50"},
            {"sum": 671, "period": "2026-W01"}
        ],
        "grouping": "week"
    },
    "8_day": {
        "active_users": [
            {"sum": 367, "period": "2025-W45"},
            {"sum": 709, "period": "2025-W46"},
            {"sum": 702, "period": "2025-W47"},
            {"sum": 625, "period": "2025-W48"},
            {"sum": 565, "period": "2025-W49"},
            {"sum": 345, "period": "2025-W50"},
            {"sum": 61, "period": "2026-W01"}
        ],
        "events": [
            {"sum": 296, "period": "2025-W45"},
            {"sum": 594, "period": "2025-W46"},
            {"sum": 594, "period": "2025-W47"},
            {"sum": 1040, "period": "2025-W48"},
            {"sum": 1037, "period": "2025-W49"},
            {"sum": 482, "period": "2025-W50"},
            {"sum": 671, "period": "2026-W01"}
        ],
        "grouping": "week"
    },
    "9_day": {
        "active_users": [
            {"sum": 367, "period": "2025-W45"},
            {"sum": 709, "period": "2025-W46"},
            {"sum": 702, "period": "2025-W47"},
            {"sum": 625, "period": "2025-W48"},
            {"sum": 565, "period": "2025-W49"},
            {"sum": 345, "period": "2025-W50"},
            {"sum": 61, "period": "2026-W01"}
        ],
        "events": [
            {"sum": 296, "period": "2025-W45"},
            {"sum": 594, "period": "2025-W46"},
            {"sum": 594, "period": "2025-W47"},
            {"sum": 1040, "period": "2025-W48"},
            {"sum": 1037, "period": "2025-W49"},
            {"sum": 482, "period": "2025-W50"},
            {"sum": 671, "period": "2026-W01"}
        ],
        "grouping": "week"
    },
    "10_day": {
        "active_users": [
            {"sum": 367, "period": "2025-W45"},
            {"sum": 709, "period": "2025-W46"},
            {"sum": 702, "period": "2025-W47"},
            {"sum": 625, "period": "2025-W48"},
            {"sum": 565, "period": "2025-W49"},
            {"sum": 345, "period": "2025-W50"},
            {"sum": 61, "period": "2026-W01"}
        ],
        "events": [
            {"sum": 296, "period": "2025-W45"},
            {"sum": 594, "period": "2025-W46"},
            {"sum": 594, "period": "2025-W47"},
            {"sum": 1040, "period": "2025-W48"},
            {"sum": 1037, "period": "2025-W49"},
            {"sum": 482, "period": "2025-W50"},
            {"sum": 671, "period": "2026-W01"}
        ],
        "grouping": "week"
    },
    "11_day": {
        "active_users": [
            {"sum": 367, "period": "2025-W45"},
            {"sum": 709, "period": "2025-W46"},
            {"sum": 702, "period": "2025-W47"},
            {"sum": 625, "period": "2025-W48"},
            {"sum": 565, "period": "2025-W49"},
            {"sum": 345, "period": "2025-W50"},
            {"sum": 61, "period": "2026-W01"}
        ],
        "events": [
            {"sum": 296, "period": "2025-W45"},
            {"sum": 594, "period": "2025-W46"},
            {"sum": 594, "period": "2025-W47"},
            {"sum": 1040, "period": "2025-W48"},
            {"sum": 1037, "period": "2025-W49"},
            {"sum": 482, "period": "2025-W50"},
            {"sum": 671, "period": "2026-W01"}
        ],
        "grouping": "week"
    },
    "12_day": {
        "active_users": [
            {"sum": 367, "period": "2025-W45"},
            {"sum": 709, "period": "2025-W46"},
            {"sum": 702, "period": "2025-W47"},
            {"sum": 625, "period": "2025-W48"},
            {"sum": 565, "period": "2025-W49"},
            {"sum": 345, "period": "2025-W50"},
            {"sum": 61, "period": "2026-W01"}
        ],
        "events": [
            {"sum": 296, "period": "2025-W45"},
            {"sum": 594, "period": "2025-W46"},
            {"sum": 594, "period": "2025-W47"},
            {"sum": 1040, "period": "2025-W48"},
            {"sum": 1037, "period": "2025-W49"},
            {"sum": 482, "period": "2025-W50"},
            {"sum": 671, "period": "2026-W01"}
        ],
        "grouping": "week"
    },
    "13_day": {
        "active_users": [
            {"sum": 709, "period": "2025-W46"},
            {"sum": 1411, "period": "2025-W47"},
            {"sum": 1327, "period": "2025-W48"},
            {"sum": 1290, "period": "2025-W49"},
            {"sum": 910, "period": "2025-W50"},
            {"sum": 406, "period": "2026-W01"}
        ],
        "events": [
            {"sum": 594, "period": "2025-W46"},
            {"sum": 1188, "period": "2025-W47"},
            {"sum": 1595, "period": "2025-W48"},
            {"sum": 2077, "period": "2025-W49"},
            {"sum": 1519, "period": "2025-W50"},
            {"sum": 1153, "period": "2026-W01"}
        ],
        "grouping": "week"
    },
    "15_day": {
        "active_users": [
            {"sum": 709, "period": "2025-W46"},
            {"sum": 1411, "period": "2025-W47"},
            {"sum": 1327, "period": "2025-W48"},
            {"sum": 1290, "period": "2025-W49"},
            {"sum": 910, "period": "2025-W50"},
            {"sum": 406, "period": "2026-W01"}
        ],
        "events": [
            {"sum": 594, "period": "2025-W46"},
            {"sum": 1188, "period": "2025-W47"},
            {"sum": 1595, "period": "2025-W48"},
            {"sum": 2077, "period": "2025-W49"},
            {"sum": 1519, "period": "2025-W50"},
            {"sum": 1153, "period": "2026-W01"}
        ],
        "grouping": "week"
    },
    "16_day": {
        "active_users": [
            {"sum": 709, "period": "2025-W46"},
            {"sum": 1411, "period": "2025-W47"},
            {"sum": 1327, "period": "2025-W48"},
            {"sum": 1290, "period": "2025-W49"},
            {"sum": 910, "period": "2025-W50"},
            {"sum": 406, "period": "2026-W01"}
        ],
        "events": [
            {"sum": 594, "period": "2025-W46"},
            {"sum": 1188, "period": "2025-W47"},
            {"sum": 1595, "period": "2025-W48"},
            {"sum": 2077, "period": "2025-W49"},
            {"sum": 1519, "period": "2025-W50"},
            {"sum": 1153, "period": "2026-W01"}
        ],
        "grouping": "week"
    },
    "17_day": {
        "active_users": [
            {"sum": 709, "period": "2025-W46"},
            {"sum": 1411, "period": "2025-W47"},
            {"sum": 1327, "period": "2025-W48"},
            {"sum": 1290, "period": "2025-W49"},
            {"sum": 910, "period": "2025-W50"},
            {"sum": 406, "period": "2026-W01"}
        ],
        "events": [
            {"sum": 594, "period": "2025-W46"},
            {"sum": 1188, "period": "2025-W47"},
            {"sum": 1595, "period": "2025-W48"},
            {"sum": 2077, "period": "2025-W49"},
            {"sum": 1519, "period": "2025-W50"},
            {"sum": 1153, "period": "2026-W01"}
        ],
        "grouping": "week"
    },
    "18_day": {
        "active_users": [
            {"sum": 709, "period": "2025-W46"},
            {"sum": 1411, "period": "2025-W47"},
            {"sum": 1327, "period": "2025-W48"},
            {"sum": 1290, "period": "2025-W49"},
            {"sum": 910, "period": "2025-W50"},
            {"sum": 406, "period": "2026-W01"}
        ],
        "events": [
            {"sum": 594, "period": "2025-W46"},
            {"sum": 1188, "period": "2025-W47"},
            {"sum": 1595, "period": "2025-W48"},
            {"sum": 2077, "period": "2025-W49"},
            {"sum": 1519, "period": "2025-W50"},
            {"sum": 1153, "period": "2026-W01"}
        ],
        "grouping": "week"
    },
    "19_day": {
        "active_users": [
            {"sum": 709, "period": "2025-W46"},
            {"sum": 1411, "period": "2025-W47"},
            {"sum": 1327, "period": "2025-W48"},
            {"sum": 1290, "period": "2025-W49"},
            {"sum": 910, "period": "2025-W50"},
            {"sum": 406, "period": "2026-W01"}
        ],
        "events": [
            {"sum": 594, "period": "2025-W46"},
            {"sum": 1188, "period": "2025-W47"},
            {"sum": 1595, "period": "2025-W48"},
            {"sum": 2077, "period": "2025-W49"},
            {"sum": 1519, "period": "2025-W50"},
            {"sum": 1153, "period": "2026-W01"}
        ],
        "grouping": "week"
    },
    "20_day": {
        "active_users": [
            {"sum": 1411, "period": "2025-W47"},
            {"sum": 1738, "period": "2025-W48"},
            {"sum": 1871, "period": "2025-W49"},
            {"sum": 1606, "period": "2025-W50"},
            {"sum": 971, "period": "2026-W01"}
        ],
        "events": [
            {"sum": 1188, "period": "2025-W47"},
            {"sum": 2178, "period": "2025-W48"},
            {"sum": 3222, "period": "2025-W49"},
            {"sum": 2535, "period": "2025-W50"},
            {"sum": 1824, "period": "2026-W01"}
        ],
        "grouping": "week"
    },
    "22_day": {
        "active_users": [
            {"sum": 1411, "period": "2025-W47"},
            {"sum": 1738, "period": "2025-W48"},
            {"sum": 1871, "period": "2025-W49"},
            {"sum": 1606, "period": "2025-W50"},
            {"sum": 971, "period": "2026-W01"}
        ],
        "events": [
            {"sum": 1188, "period": "2025-W47"},
            {"sum": 2178, "period": "2025-W48"},
            {"sum": 3222, "period": "2025-W49"},
            {"sum": 2535, "period": "2025-W50"},
            {"sum": 1824, "period": "2026-W01"}
        ],
        "grouping": "week"
    },
    "23_day": {
        "active_users": [
            {"sum": 1411, "period": "2025-W47"},
            {"sum": 1738, "period": "2025-W48"},
            {"sum": 1871, "period": "2025-W49"},
            {"sum": 1606, "period": "2025-W50"},
            {"sum": 971, "period": "2026-W01"}
        ],
        "events": [
            {"sum": 1188, "period": "2025-W47"},
            {"sum": 2178, "period": "2025-W48"},
            {"sum": 3222, "period": "2025-W49"},
            {"sum": 2535, "period": "2025-W50"},
            {"sum": 1824, "period": "2026-W01"}
        ],
        "grouping": "week"
    },
    "24_day": {
        "active_users": [
            {"sum": 1411, "period": "2025-W47"},
            {"sum": 1738, "period": "2025-W48"},
            {"sum": 1871, "period": "2025-W49"},
            {"sum": 1606, "period": "2025-W50"},
            {"sum": 971, "period": "2026-W01"}
        ],
        "events": [
            {"sum": 1188, "period": "2025-W47"},
            {"sum": 2178, "period": "2025-W48"},
            {"sum": 3222, "period": "2025-W49"},
            {"sum": 2535, "period": "2025-W50"},
            {"sum": 1824, "period": "2026-W01"}
        ],
        "grouping": "week"
    },
    "25_day": {
        "active_users": [
            {"sum": 1411, "period": "2025-W47"},
            {"sum": 1738, "period": "2025-W48"},
            {"sum": 1871, "period": "2025-W49"},
            {"sum": 1606, "period": "2025-W50"},
            {"sum": 971, "period": "2026-W01"}
        ],
        "events": [
            {"sum": 1188, "period": "2025-W47"},
            {"sum": 2178, "period": "2025-W48"},
            {"sum": 3222, "period": "2025-W49"},
            {"sum": 2535, "period": "2025-W50"},
            {"sum": 1824, "period": "2026-W01"}
        ],
        "grouping": "week"
    },
    "26_day": {
        "active_users": [
            {"sum": 1411, "period": "2025-W47"},
            {"sum": 1738, "period": "2025-W48"},
            {"sum": 1871, "period": "2025-W49"},
            {"sum": 1606, "period": "2025-W50"},
            {"sum": 971, "period": "2026-W01"}
        ],
        "events": [
            {"sum": 1188, "period": "2025-W47"},
            {"sum": 2178, "period": "2025-W48"},
            {"sum": 3222, "period": "2025-W49"},
            {"sum": 2535, "period": "2025-W50"},
            {"sum": 1824, "period": "2026-W01"}
        ],
        "grouping": "week"
    },
    "27_day": {
        "active_users": [
            {"sum": 1738, "period": "2025-W48"},
            {"sum": 2162, "period": "2025-W49"},
            {"sum": 2327, "period": "2025-W50"},
            {"sum": 2032, "period": "2026-W01"}
        ],
        "events": [
            {"sum": 2178, "period": "2025-W48"},
            {"sum": 3799, "period": "2025-W49"},
            {"sum": 3954, "period": "2025-W50"},
            {"sum": 3025, "period": "2026-W01"}
        ],
        "grouping": "week"
    },
    "28_day": {
        "active_users": [
            {"sum": 1738, "period": "2025-W48"},
            {"sum": 2162, "period": "2025-W49"},
            {"sum": 2327, "period": "2025-W50"},
            {"sum": 2032, "period": "2026-W01"}
        ],
        "events": [
            {"sum": 2178, "period": "2025-W48"},
            {"sum": 3799, "period": "2025-W49"},
            {"sum": 3954, "period": "2025-W50"},
            {"sum": 3025, "period": "2026-W01"}
        ],
        "grouping": "week"
    },
    "29_day": {
        "active_users": [
            {"sum": 1738, "period": "2025-W48"},
            {"sum": 2162, "period": "2025-W49"},
            {"sum": 2327, "period": "2025-W50"},
            {"sum": 2032, "period": "2026-W01"}
        ],
        "events": [
            {"sum": 2178, "period": "2025-W48"},
            {"sum": 3799, "period": "2025-W49"},
            {"sum": 3954, "period": "2025-W50"},
            {"sum": 3025, "period": "2026-W01"}
        ],
        "grouping": "week"
    },
    "30_day": {
        "active_users": [
            {"sum": 1738, "period": "2025-W48"},
            {"sum": 2162, "period": "2025-W49"},
            {"sum": 2327, "period": "2025-W50"},
            {"sum": 2032, "period": "2026-W01"}
        ],
        "events": [
            {"sum": 2178, "period": "2025-W48"},
            {"sum": 3799, "period": "2025-W49"},
            {"sum": 3954, "period": "2025-W50"},
            {"sum": 3025, "period": "2026-W01"}
        ],
        "grouping": "week"
    }
}


SUM_ORDERS_SUBMITTED_EASYTRADE = {
    "1_day": {
        "direct": "47.719%", 
        "organic": "21.141%", 
        "paid_search": "16.069%", 
        "referral": "10.500%", 
        "social": "5.271%", 
        "email": "5.151%"
    }, 
    "2_day": {
        "direct": "47.719%", 
        "organic": "21.141%", 
        "paid_search": "16.069%", 
        "referral": "10.500%", 
        "social": "5.271%", 
        "email": "5.151%"
    }, 
    "3_day": {
        "direct": "47.719%", 
        "organic": "21.141%", 
        "paid_search": "16.069%", 
        "referral": "10.500%", 
        "social": "5.271%", 
        "email": "5.151%"
    }, 
    "4_day": {
        "direct": "47.719%", 
        "organic": "21.141%", 
        "paid_search": "16.069%", 
        "referral": "10.500%", 
        "social": "5.271%", 
        "email": "5.151%"
    }, 
    "5_day": {
        "direct": "47.719%", 
        "organic": "21.141%", 
        "paid_search": "16.069%", 
        "referral": "10.500%", 
        "social": "5.271%", 
        "email": "5.151%"
    }, 
    "6_day": {
        "direct": "47.719%", 
        "organic": "21.141%", 
        "paid_search": "16.069%", 
        "referral": "10.500%", 
        "social": "5.271%", 
        "email": "5.151%"
    }, 
    "7_day": {
        "direct": "47.719%", 
        "organic": "21.141%", 
        "paid_search": "16.069%", 
        "referral": "10.500%", 
        "social": "5.271%", 
        "email": "5.151%"
    }, 
    "8_day": {
        "direct": "47.719%", 
        "organic": "21.141%", 
        "paid_search": "16.069%", 
        "referral": "10.500%", 
        "social": "5.271%", 
        "email": "5.151%"
    }, 
    "9_day": {
        "direct": "47.719%", 
        "organic": "21.141%", 
        "paid_search": "16.069%", 
        "referral": "10.500%", 
        "social": "5.271%", 
        "email": "5.151%"
    }, 
    "10_day": {
        "direct": "47.719%", 
        "organic": "21.141%", 
        "paid_search": "16.069%", 
        "referral": "10.500%", 
        "social": "5.271%", 
        "email": "5.151%"
    }, 
    "11_day": {
        "direct": "47.719%", 
        "organic": "21.141%", 
        "paid_search": "16.069%", 
        "referral": "10.500%", 
        "social": "5.271%", 
        "email": "5.151%"
    }, 
    "12_day": {
        "direct": "47.719%", 
        "organic": "21.141%", 
        "paid_search": "16.069%", 
        "referral": "10.500%", 
        "social": "5.271%", 
        "email": "5.151%"
    }, 
    "13_day": {
        "direct": "47.719%", 
        "organic": "21.141%", 
        "paid_search": "16.069%", 
        "referral": "10.500%", 
        "social": "5.271%", 
        "email": "5.151%"
    }, 
    "14_day": {
        "direct": "47.719%", 
        "organic": "21.141%", 
        "paid_search": "16.069%", 
        "referral": "10.500%", 
        "social": "5.271%", 
        "email": "5.151%"
    }, 
    "15_day": {
        "direct": "47.719%", 
        "organic": "21.141%", 
        "paid_search": "16.069%", 
        "referral": "10.500%", 
        "social": "5.271%", 
        "email": "5.151%"
    }, 
    "16_day": {
        "direct": "47.719%", 
        "organic": "21.141%", 
        "paid_search": "16.069%", 
        "referral": "10.500%", 
        "social": "5.271%", 
        "email": "5.151%"
    }, 
    "17_day": {
        "direct": "47.719%", 
        "organic": "21.141%", 
        "paid_search": "16.069%", 
        "referral": "10.500%", 
        "social": "5.271%", 
        "email": "5.151%"
    }, 
    "18_day": {
        "direct": "47.719%", 
        "organic": "21.141%", 
        "paid_search": "16.069%", 
        "referral": "10.500%", 
        "social": "5.271%", 
        "email": "5.151%"
    }, 
    "19_day": {
        "direct": "47.719%", 
        "organic": "21.141%", 
        "paid_search": "16.069%", 
        "referral": "10.500%", 
        "social": "5.271%", 
        "email": "5.151%"
    }, 
    "20_day": {
        "direct": "47.719%", 
        "organic": "21.141%", 
        "paid_search": "16.069%", 
        "referral": "10.500%", 
        "social": "5.271%", 
        "email": "5.151%"
    }, 
    "21_day": {
        "direct": "47.719%", 
        "organic": "21.141%", 
        "paid_search": "16.069%", 
        "referral": "10.500%", 
        "social": "5.271%", 
        "email": "5.151%"
    }, 
    "22_day": {
        "direct": "47.719%", 
        "organic": "21.141%", 
        "paid_search": "16.069%", 
        "referral": "10.500%", 
        "social": "5.271%", 
        "email": "5.151%"
    }, 
    "23_day": {
        "direct": "47.719%", 
        "organic": "21.141%", 
        "paid_search": "16.069%", 
        "referral": "10.500%", 
        "social": "5.271%", 
        "email": "5.151%"
    }, 
    "24_day": {
        "direct": "47.719%", 
        "organic": "21.141%", 
        "paid_search": "16.069%", 
        "referral": "10.500%", 
        "social": "5.271%", 
        "email": "5.151%"
    }, 
    "25_day": {
        "direct": "47.719%", 
        "organic": "21.141%", 
        "paid_search": "16.069%", 
        "referral": "10.500%", 
        "social": "5.271%", 
        "email": "5.151%"
    }, 
    "26_day": {
        "direct": "47.719%", 
        "organic": "21.141%", 
        "paid_search": "16.069%", 
        "referral": "10.500%", 
        "social": "5.271%", 
        "email": "5.151%"
    }, 
    "27_day": {
        "direct": "47.719%", 
        "organic": "21.141%", 
        "paid_search": "16.069%", 
        "referral": "10.500%", 
        "social": "5.271%", 
        "email": "5.151%"
    }, 
    "28_day": {
        "direct": "47.719%", 
        "organic": "21.141%", 
        "paid_search": "16.069%", 
        "referral": "10.500%", 
        "social": "5.271%", 
        "email": "5.151%"
    }, 
    "29_day": {
        "direct": "47.719%", 
        "organic": "21.141%", 
        "paid_search": "16.069%", 
        "referral": "10.500%", 
        "social": "5.271%", 
        "email": "5.151%"
    }, 
    "30_day": {
        "direct": "47.719%", 
        "organic": "21.141%", 
        "paid_search": "16.069%", 
        "referral": "10.500%", 
        "social": "5.271%", 
        "email": "5.151%"
    }
}


SUM_ORDERS_EXECUTED_REGION_EASYTRADE = {
    "1_day": {
        "us": "12.496%", 
        "ca": "12.111%", 
        "mx": "12.202%", 
        "nl": "4.207%", 
        "se": "4.160%", 
        "es": "4.145%", 
        "it": "4.094%", 
        "fr": "4.069%", 
        "gb": "4.004%", 
        "de": "3.917%", 
        "jp": "3.263%", 
        "sg": "3.230%", 
        "in": "3.195%", 
        "au": "3.209%", 
        "hk": "3.166%"
    }, 
    "2_day": {
        "us": "12.496%", 
        "ca": "12.111%", 
        "mx": "12.202%", 
        "nl": "4.207%", 
        "se": "4.160%", 
        "es": "4.145%", 
        "it": "4.094%", 
        "fr": "4.069%", 
        "gb": "4.004%", 
        "de": "3.917%", 
        "jp": "3.263%", 
        "sg": "3.230%", 
        "in": "3.195%", 
        "au": "3.209%", 
        "hk": "3.166%"
    }, 
    "3_day": {
        "us": "12.496%", 
        "ca": "12.111%", 
        "mx": "12.202%", 
        "nl": "4.207%", 
        "se": "4.160%", 
        "es": "4.145%", 
        "it": "4.094%", 
        "fr": "4.069%", 
        "gb": "4.004%", 
        "de": "3.917%", 
        "jp": "3.263%", 
        "sg": "3.230%", 
        "in": "3.195%", 
        "au": "3.209%", 
        "hk": "3.166%"
    }, 
    "4_day": {
        "us": "12.496%", 
        "ca": "12.111%", 
        "mx": "12.202%", 
        "nl": "4.207%", 
        "se": "4.160%", 
        "es": "4.145%", 
        "it": "4.094%", 
        "fr": "4.069%", 
        "gb": "4.004%", 
        "de": "3.917%", 
        "jp": "3.263%", 
        "sg": "3.230%", 
        "in": "3.195%", 
        "au": "3.209%", 
        "hk": "3.166%"
    }, 
    "5_day": {
        "us": "12.496%", 
        "ca": "12.111%", 
        "mx": "12.202%", 
        "nl": "4.207%", 
        "se": "4.160%", 
        "es": "4.145%", 
        "it": "4.094%", 
        "fr": "4.069%", 
        "gb": "4.004%", 
        "de": "3.917%", 
        "jp": "3.263%", 
        "sg": "3.230%", 
        "in": "3.195%", 
        "au": "3.209%", 
        "hk": "3.166%"
    }, 
    "6_day": {
        "us": "12.496%", 
        "ca": "12.111%", 
        "mx": "12.202%", 
        "nl": "4.207%", 
        "se": "4.160%", 
        "es": "4.145%", 
        "it": "4.094%", 
        "fr": "4.069%", 
        "gb": "4.004%", 
        "de": "3.917%", 
        "jp": "3.263%", 
        "sg": "3.230%", 
        "in": "3.195%", 
        "au": "3.209%", 
        "hk": "3.166%"
    }, 
    "7_day": {
        "us": "12.496%", 
        "ca": "12.111%", 
        "mx": "12.202%", 
        "nl": "4.207%", 
        "se": "4.160%", 
        "es": "4.145%", 
        "it": "4.094%", 
        "fr": "4.069%", 
        "gb": "4.004%", 
        "de": "3.917%", 
        "jp": "3.263%", 
        "sg": "3.230%", 
        "in": "3.195%", 
        "au": "3.209%", 
        "hk": "3.166%"
    }, 
    "8_day": {
        "us": "12.496%", 
        "ca": "12.111%", 
        "mx": "12.202%", 
        "nl": "4.207%", 
        "se": "4.160%", 
        "es": "4.145%", 
        "it": "4.094%", 
        "fr": "4.069%", 
        "gb": "4.004%", 
        "de": "3.917%", 
        "jp": "3.263%", 
        "sg": "3.230%", 
        "in": "3.195%", 
        "au": "3.209%", 
        "hk": "3.166%"
    }, 
    "9_day": {
        "us": "12.496%", 
        "ca": "12.111%", 
        "mx": "12.202%", 
        "nl": "4.207%", 
        "se": "4.160%", 
        "es": "4.145%", 
        "it": "4.094%", 
        "fr": "4.069%", 
        "gb": "4.004%", 
        "de": "3.917%", 
        "jp": "3.263%", 
        "sg": "3.230%", 
        "in": "3.195%", 
        "au": "3.209%", 
        "hk": "3.166%"
    }, 
    "10_day": {
        "us": "12.496%", 
        "ca": "12.111%", 
        "mx": "12.202%", 
        "nl": "4.207%", 
        "se": "4.160%", 
        "es": "4.145%", 
        "it": "4.094%", 
        "fr": "4.069%", 
        "gb": "4.004%", 
        "de": "3.917%", 
        "jp": "3.263%", 
        "sg": "3.230%", 
        "in": "3.195%", 
        "au": "3.209%", 
        "hk": "3.166%"
    }, 
    "11_day": {
        "us": "12.496%", 
        "ca": "12.111%", 
        "mx": "12.202%", 
        "nl": "4.207%", 
        "se": "4.160%", 
        "es": "4.145%", 
        "it": "4.094%", 
        "fr": "4.069%", 
        "gb": "4.004%", 
        "de": "3.917%", 
        "jp": "3.263%", 
        "sg": "3.230%", 
        "in": "3.195%", 
        "au": "3.209%", 
        "hk": "3.166%"
    }, 
    "12_day": {
        "us": "12.496%", 
        "ca": "12.111%", 
        "mx": "12.202%", 
        "nl": "4.207%", 
        "se": "4.160%", 
        "es": "4.145%", 
        "it": "4.094%", 
        "fr": "4.069%", 
        "gb": "4.004%", 
        "de": "3.917%", 
        "jp": "3.263%", 
        "sg": "3.230%", 
        "in": "3.195%", 
        "au": "3.209%", 
        "hk": "3.166%"
    }, 
    "13_day": {
        "us": "12.496%", 
        "ca": "12.111%", 
        "mx": "12.202%", 
        "nl": "4.207%", 
        "se": "4.160%", 
        "es": "4.145%", 
        "it": "4.094%", 
        "fr": "4.069%", 
        "gb": "4.004%", 
        "de": "3.917%", 
        "jp": "3.263%", 
        "sg": "3.230%", 
        "in": "3.195%", 
        "au": "3.209%", 
        "hk": "3.166%"
    }, 
    "14_day": {
        "us": "12.496%", 
        "ca": "12.111%", 
        "mx": "12.202%", 
        "nl": "4.207%", 
        "se": "4.160%", 
        "es": "4.145%", 
        "it": "4.094%", 
        "fr": "4.069%", 
        "gb": "4.004%", 
        "de": "3.917%", 
        "jp": "3.263%", 
        "sg": "3.230%", 
        "in": "3.195%", 
        "au": "3.209%", 
        "hk": "3.166%"
    }, 
    "15_day": {
        "us": "12.496%", 
        "ca": "12.111%", 
        "mx": "12.202%", 
        "nl": "4.207%", 
        "se": "4.160%", 
        "es": "4.145%", 
        "it": "4.094%", 
        "fr": "4.069%", 
        "gb": "4.004%", 
        "de": "3.917%", 
        "jp": "3.263%", 
        "sg": "3.230%", 
        "in": "3.195%", 
        "au": "3.209%", 
        "hk": "3.166%"
    }, 
    "16_day": {
        "us": "12.496%", 
        "ca": "12.111%", 
        "mx": "12.202%", 
        "nl": "4.207%", 
        "se": "4.160%", 
        "es": "4.145%", 
        "it": "4.094%", 
        "fr": "4.069%", 
        "gb": "4.004%", 
        "de": "3.917%", 
        "jp": "3.263%", 
        "sg": "3.230%", 
        "in": "3.195%", 
        "au": "3.209%", 
        "hk": "3.166%"
    }, 
    "17_day": {
        "us": "12.496%", 
        "ca": "12.111%", 
        "mx": "12.202%", 
        "nl": "4.207%", 
        "se": "4.160%", 
        "es": "4.145%", 
        "it": "4.094%", 
        "fr": "4.069%", 
        "gb": "4.004%", 
        "de": "3.917%", 
        "jp": "3.263%", 
        "sg": "3.230%", 
        "in": "3.195%", 
        "au": "3.209%", 
        "hk": "3.166%"
    }, 
    "18_day": {
        "us": "12.496%", 
        "ca": "12.111%", 
        "mx": "12.202%", 
        "nl": "4.207%", 
        "se": "4.160%", 
        "es": "4.145%", 
        "it": "4.094%", 
        "fr": "4.069%", 
        "gb": "4.004%", 
        "de": "3.917%", 
        "jp": "3.263%", 
        "sg": "3.230%", 
        "in": "3.195%", 
        "au": "3.209%", 
        "hk": "3.166%"
    }, 
    "19_day": {
        "us": "12.496%", 
        "ca": "12.111%", 
        "mx": "12.202%", 
        "nl": "4.207%", 
        "se": "4.160%", 
        "es": "4.145%", 
        "it": "4.094%", 
        "fr": "4.069%", 
        "gb": "4.004%", 
        "de": "3.917%", 
        "jp": "3.263%", 
        "sg": "3.230%", 
        "in": "3.195%", 
        "au": "3.209%", 
        "hk": "3.166%"
    }, 
    "20_day": {
        "us": "12.496%", 
        "ca": "12.111%", 
        "mx": "12.202%", 
        "nl": "4.207%", 
        "se": "4.160%", 
        "es": "4.145%", 
        "it": "4.094%", 
        "fr": "4.069%", 
        "gb": "4.004%", 
        "de": "3.917%", 
        "jp": "3.263%", 
        "sg": "3.230%", 
        "in": "3.195%", 
        "au": "3.209%", 
        "hk": "3.166%"
    }, 
    "21_day": {
        "us": "12.496%", 
        "ca": "12.111%", 
        "mx": "12.202%", 
        "nl": "4.207%", 
        "se": "4.160%", 
        "es": "4.145%", 
        "it": "4.094%", 
        "fr": "4.069%", 
        "gb": "4.004%", 
        "de": "3.917%", 
        "jp": "3.263%", 
        "sg": "3.230%", 
        "in": "3.195%", 
        "au": "3.209%", 
        "hk": "3.166%"
    }, 
    "22_day": {
        "us": "12.496%", 
        "ca": "12.111%", 
        "mx": "12.202%", 
        "nl": "4.207%", 
        "se": "4.160%", 
        "es": "4.145%", 
        "it": "4.094%", 
        "fr": "4.069%", 
        "gb": "4.004%", 
        "de": "3.917%", 
        "jp": "3.263%", 
        "sg": "3.230%", 
        "in": "3.195%", 
        "au": "3.209%", 
        "hk": "3.166%"
    }, 
    "23_day": {
        "us": "12.496%", 
        "ca": "12.111%", 
        "mx": "12.202%", 
        "nl": "4.207%", 
        "se": "4.160%", 
        "es": "4.145%", 
        "it": "4.094%", 
        "fr": "4.069%", 
        "gb": "4.004%", 
        "de": "3.917%", 
        "jp": "3.263%", 
        "sg": "3.230%", 
        "in": "3.195%", 
        "au": "3.209%", 
        "hk": "3.166%"
    }, 
    "24_day": {
        "us": "12.496%", 
        "ca": "12.111%", 
        "mx": "12.202%", 
        "nl": "4.207%", 
        "se": "4.160%", 
        "es": "4.145%", 
        "it": "4.094%", 
        "fr": "4.069%", 
        "gb": "4.004%", 
        "de": "3.917%", 
        "jp": "3.263%", 
        "sg": "3.230%", 
        "in": "3.195%", 
        "au": "3.209%", 
        "hk": "3.166%"
    }, 
    "25_day": {
        "us": "12.496%", 
        "ca": "12.111%", 
        "mx": "12.202%", 
        "nl": "4.207%", 
        "se": "4.160%", 
        "es": "4.145%", 
        "it": "4.094%", 
        "fr": "4.069%", 
        "gb": "4.004%", 
        "de": "3.917%", 
        "jp": "3.263%", 
        "sg": "3.230%", 
        "in": "3.195%", 
        "au": "3.209%", 
        "hk": "3.166%"
    }, 
    "26_day": {
        "us": "12.496%", 
        "ca": "12.111%", 
        "mx": "12.202%", 
        "nl": "4.207%", 
        "se": "4.160%", 
        "es": "4.145%", 
        "it": "4.094%", 
        "fr": "4.069%", 
        "gb": "4.004%", 
        "de": "3.917%", 
        "jp": "3.263%", 
        "sg": "3.230%", 
        "in": "3.195%", 
        "au": "3.209%", 
        "hk": "3.166%"
    }, 
    "27_day": {
        "us": "12.496%", 
        "ca": "12.111%", 
        "mx": "12.202%", 
        "nl": "4.207%", 
        "se": "4.160%", 
        "es": "4.145%", 
        "it": "4.094%", 
        "fr": "4.069%", 
        "gb": "4.004%", 
        "de": "3.917%", 
        "jp": "3.263%", 
        "sg": "3.230%", 
        "in": "3.195%", 
        "au": "3.209%", 
        "hk": "3.166%"
    }, 
    "28_day": {
        "us": "12.496%", 
        "ca": "12.111%", 
        "mx": "12.202%", 
        "nl": "4.207%", 
        "se": "4.160%", 
        "es": "4.145%", 
        "it": "4.094%", 
        "fr": "4.069%", 
        "gb": "4.004%", 
        "de": "3.917%", 
        "jp": "3.263%", 
        "sg": "3.230%", 
        "in": "3.195%", 
        "au": "3.209%", 
        "hk": "3.166%"
    }, 
    "29_day": {
        "us": "12.496%", 
        "ca": "12.111%", 
        "mx": "12.202%", 
        "nl": "4.207%", 
        "se": "4.160%", 
        "es": "4.145%", 
        "it": "4.094%", 
        "fr": "4.069%", 
        "gb": "4.004%", 
        "de": "3.917%", 
        "jp": "3.263%", 
        "sg": "3.230%", 
        "in": "3.195%", 
        "au": "3.209%", 
        "hk": "3.166%"
    }, 
    "30_day": {
        "us": "12.496%", 
        "ca": "12.111%", 
        "mx": "12.202%", 
        "nl": "4.207%", 
        "se": "4.160%", 
        "es": "4.145%", 
        "it": "4.094%", 
        "fr": "4.069%", 
        "gb": "4.004%", 
        "de": "3.917%", 
        "jp": "3.263%", 
        "sg": "3.230%", 
        "in": "3.195%", 
        "au": "3.209%", 
        "hk": "3.166%"
    }
}

UNIQUE_CUSTOMERS_EASYTRADE = OrderedDict([
    ('1_day', OrderedDict([
        ('grouping', 'week'),
        ("unique_customers", [
            {'range': 'Week 1', 'total': 5868},
            {'range': 'Week 2', 'total': 6041},
            {'range': 'Week 3', 'total': 6231},
            {'range': 'Week 4', 'total': 5992},
            {'range': 'Week 5', 'total': 5560},
        ]),
    ])),
    ('2_day', OrderedDict([ 
        ('grouping', 'week'),
        ("unique_customers", [
            {'range': 'Week 1', 'total': 5868},
            {'range': 'Week 2', 'total': 6041},
            {'range': 'Week 3', 'total': 6231},
            {'range': 'Week 4', 'total': 5992},
            {'range': 'Week 5', 'total': 5560},
        ]),
    ])),
    ('3_day', OrderedDict([
        ('grouping', 'week'),
        ("unique_customers", [
            {'range': 'Week 1', 'total': 5868},
            {'range': 'Week 2', 'total': 6041},
            {'range': 'Week 3', 'total': 6231},
            {'range': 'Week 4', 'total': 5992},
            {'range': 'Week 5', 'total': 5560},
        ]),
    ])),
    ('4_day', OrderedDict([
        ('grouping', 'week'),
        ("unique_customers", [
            {'range': 'Week 1', 'total': 5868},
            {'range': 'Week 2', 'total': 6041},
            {'range': 'Week 3', 'total': 6231},
            {'range': 'Week 4', 'total': 5992},
            {'range': 'Week 5', 'total': 5560},
        ]),
    ])),
    ('5_day', OrderedDict([
        ('grouping', 'week'),
        ("unique_customers", [
            {'range': 'Week 1', 'total': 5868},
            {'range': 'Week 2', 'total': 6041},
            {'range': 'Week 3', 'total': 6231},
            {'range': 'Week 4', 'total': 5992},
            {'range': 'Week 5', 'total': 5560},
        ]),
    ])),
    ('6_day', OrderedDict([
        ('grouping', 'week'),
        ("unique_customers", [
            {'range': 'Week 1', 'total': 6041},
            {'range': 'Week 2', 'total': 6231},
            {'range': 'Week 3', 'total': 5992},
            {'range': 'Week 4', 'total': 5560},
            {'range': 'Week 5', 'total': 5511},
        ]),
    ])),
    ('7_day', OrderedDict([
        ('grouping', 'week'),
        ("unique_customers", [
            {'range': 'Week 1', 'total': 6041},
            {'range': 'Week 2', 'total': 6231},
            {'range': 'Week 3', 'total': 5992},
            {'range': 'Week 4', 'total': 5560},
            {'range': 'Week 5', 'total': 5511},
        ]),
    ])),
    ('8_day', OrderedDict([
        ('grouping', 'week'),
        ("unique_customers", [
            {'range': 'Week 1', 'total': 6041},
            {'range': 'Week 2', 'total': 6231},
            {'range': 'Week 3', 'total': 5992},
            {'range': 'Week 4', 'total': 5560},
            {'range': 'Week 5', 'total': 5511},
        ]),
    ])),
    ('9_day', OrderedDict([
        ('grouping', 'week'),
        ("unique_customers", [
            {'range': 'Week 1', 'total': 6041},
            {'range': 'Week 2', 'total': 6231},
            {'range': 'Week 3', 'total': 5992},
            {'range': 'Week 4', 'total': 5560},
            {'range': 'Week 5', 'total': 5511},
        ]),
    ])),
    ('10_day', OrderedDict([
        ('grouping', 'week'),
        ("unique_customers", [
            {'range': 'Week 1', 'total': 6041},
            {'range': 'Week 2', 'total': 6231},
            {'range': 'Week 3', 'total': 5992},
            {'range': 'Week 4', 'total': 5560},
            {'range': 'Week 5', 'total': 5511},
        ]),
    ])),
    ('11_day', OrderedDict([
        ('grouping', 'week'),
        ("unique_customers", [
            {'range': 'Week 1', 'total': 6041},
            {'range': 'Week 2', 'total': 6231},
            {'range': 'Week 3', 'total': 5992},
            {'range': 'Week 4', 'total': 5560},
            {'range': 'Week 5', 'total': 5511},
        ]),
    ])),
    ('12_day', OrderedDict([
        ('grouping', 'week'),
        ("unique_customers", [
            {'range': 'Week 1', 'total': 6041},
            {'range': 'Week 2', 'total': 6231},
            {'range': 'Week 3', 'total': 5992},
            {'range': 'Week 4', 'total': 5560},
            {'range': 'Week 5', 'total': 5511},
        ]),
    ])),
    ('13_day', OrderedDict([
        ('grouping', 'week'),
        ("unique_customers", [
            {'range': 'Week 1', 'total': 6231},
            {'range': 'Week 2', 'total': 5992},
            {'range': 'Week 3', 'total': 5560},
            {'range': 'Week 4', 'total': 5511},
            {'range': 'Week 5', 'total': 5628},
        ]),
    ])),
    ('14_day', OrderedDict([
        ('grouping', 'week'),
        ("unique_customers", [
            {'range': 'Week 1', 'total': 6231},
            {'range': 'Week 2', 'total': 5992},
            {'range': 'Week 3', 'total': 5560},
            {'range': 'Week 4', 'total': 5511},
            {'range': 'Week 5', 'total': 5628},
        ]),
    ])),
    ('15_day', OrderedDict([
        ('grouping', 'week'),
        ("unique_customers", [
            {'range': 'Week 1', 'total': 6231},
            {'range': 'Week 2', 'total': 5992},
            {'range': 'Week 3', 'total': 5560},
            {'range': 'Week 4', 'total': 5511},
            {'range': 'Week 5', 'total': 5628},
        ]),
    ])),
    ('16_day', OrderedDict([
        ('grouping', 'week'),
        ("unique_customers", [
            {'range': 'Week 1', 'total': 6231},
            {'range': 'Week 2', 'total': 5992},
            {'range': 'Week 3', 'total': 5560},
            {'range': 'Week 4', 'total': 5511},
            {'range': 'Week 5', 'total': 5628},
        ]),
    ])),
    ('17_day', OrderedDict([
        ('grouping', 'week'),
        ("unique_customers", [
            {'range': 'Week 1', 'total': 6231},
            {'range': 'Week 2', 'total': 5992},
            {'range': 'Week 3', 'total': 5560},
            {'range': 'Week 4', 'total': 5511},
            {'range': 'Week 5', 'total': 5628},
        ]),
    ])),
    ('18_day', OrderedDict([
        ('grouping', 'week'),
        ("unique_customers", [
            {'range': 'Week 1', 'total': 6231},
            {'range': 'Week 2', 'total': 5992},
            {'range': 'Week 3', 'total': 5560},
            {'range': 'Week 4', 'total': 5511},
            {'range': 'Week 5', 'total': 5628},
        ]),
    ])),
    ('19_day', OrderedDict([
        ('grouping', 'week'),
        ("unique_customers", [
            {'range': 'Week 1', 'total': 6231},
            {'range': 'Week 2', 'total': 5992},
            {'range': 'Week 3', 'total': 5560},
            {'range': 'Week 4', 'total': 5511},
            {'range': 'Week 5', 'total': 5628},
        ]),
    ])),
    ('20_day', OrderedDict([
        ('grouping', 'week'),
        ("unique_customers", [
            {'range': 'Week 1', 'total': 5992},
            {'range': 'Week 2', 'total': 5560},
            {'range': 'Week 3', 'total': 5511},
            {'range': 'Week 4', 'total': 5628},
            {'range': 'Week 5', 'total': 5982},
        ]),
    ])),
    ('21_day', OrderedDict([
        ('grouping', 'week'),
        ("unique_customers", [
            {'range': 'Week 1', 'total': 5992},
            {'range': 'Week 2', 'total': 5560},
            {'range': 'Week 3', 'total': 5511},
            {'range': 'Week 4', 'total': 5628},
            {'range': 'Week 5', 'total': 5982},
        ]),
    ])),
    ('22_day', OrderedDict([
        ('grouping', 'week'),
        ("unique_customers", [
            {'range': 'Week 1', 'total': 5992},
            {'range': 'Week 2', 'total': 5560},
            {'range': 'Week 3', 'total': 5511},
            {'range': 'Week 4', 'total': 5628},
            {'range': 'Week 5', 'total': 5982},
        ]),
    ])),
    ('23_day', OrderedDict([
        ('grouping', 'week'),
        ("unique_customers", [
            {'range': 'Week 1', 'total': 5992},
            {'range': 'Week 2', 'total': 5560},
            {'range': 'Week 3', 'total': 5511},
            {'range': 'Week 4', 'total': 5628},
            {'range': 'Week 5', 'total': 5982},
        ]),
    ])),
    ('24_day', OrderedDict([
        ('grouping', 'week'),
        ("unique_customers", [
            {'range': 'Week 1', 'total': 5992},
            {'range': 'Week 2', 'total': 5560},
            {'range': 'Week 3', 'total': 5511},
            {'range': 'Week 4', 'total': 5628},
            {'range': 'Week 5', 'total': 5982},
        ]),
    ])),
    ('25_day', OrderedDict([
        ('grouping', 'week'),
        ("unique_customers", [
            {'range': 'Week 1', 'total': 5992},
            {'range': 'Week 2', 'total': 5560},
            {'range': 'Week 3', 'total': 5511},
            {'range': 'Week 4', 'total': 5628},
            {'range': 'Week 5', 'total': 5982},
        ]),
    ])),
    ('26_day', OrderedDict([
        ('grouping', 'week'),
        ("unique_customers", [
            {'range': 'Week 1', 'total': 5992},
            {'range': 'Week 2', 'total': 5560},
            {'range': 'Week 3', 'total': 5511},
            {'range': 'Week 4', 'total': 5628},
            {'range': 'Week 5', 'total': 5982},
        ]),
    ])),
    ('27_day', OrderedDict([
        ('grouping', 'week'),
        ("unique_customers", [
            {'range': 'Week 1', 'total': 5560},
            {'range': 'Week 2', 'total': 5511},
            {'range': 'Week 3', 'total': 5628},
            {'range': 'Week 4', 'total': 5982},
            {'range': 'Week 5', 'total': 5949},
        ]),
    ])),
    ('28_day', OrderedDict([
        ('grouping', 'week'),
        ("unique_customers", [
            {'range': 'Week 1', 'total': 5560},
            {'range': 'Week 2', 'total': 5511},
            {'range': 'Week 3', 'total': 5628},
            {'range': 'Week 4', 'total': 5982},
            {'range': 'Week 5', 'total': 5949},
        ]),
    ])),
    ('29_day', OrderedDict([
        ('grouping', 'week'),
        ("unique_customers", [
            {'range': 'Week 1', 'total': 5560},
            {'range': 'Week 2', 'total': 5511},
            {'range': 'Week 3', 'total': 5628},
            {'range': 'Week 4', 'total': 5982},
            {'range': 'Week 5', 'total': 5949},
        ]),
    ])),
])


APPLICATION_RESP_EASYTRADE = OrderedDict([
    ('1_day', OrderedDict([
        ('grouping', 'week'),
        ("application_resp", [
            {'range': 'Week 1', 'total': 353},
            {'range': 'Week 2', 'total': 355},
            {'range': 'Week 3', 'total': 356},
            {'range': 'Week 4', 'total': 355},
            {'range': 'Week 5', 'total': 354},
        ]),
    ])),
    ('2_day', OrderedDict([
        ('grouping', 'week'),
        ("application_resp", [
            {'range': 'Week 1', 'total': 353},
            {'range': 'Week 2', 'total': 355},
            {'range': 'Week 3', 'total': 356},
            {'range': 'Week 4', 'total': 355},
            {'range': 'Week 5', 'total': 354},
        ]),
    ])),
    ('3_day', OrderedDict([
        ('grouping', 'week'),
        ("application_resp", [
            {'range': 'Week 1', 'total': 353},
            {'range': 'Week 2', 'total': 355},
            {'range': 'Week 3', 'total': 356},
            {'range': 'Week 4', 'total': 355},
            {'range': 'Week 5', 'total': 354},
        ]),
    ])),
    ('4_day', OrderedDict([
        ('grouping', 'week'),
        ("application_resp", [
            {'range': 'Week 1', 'total': 353},
            {'range': 'Week 2', 'total': 355},
            {'range': 'Week 3', 'total': 356},
            {'range': 'Week 4', 'total': 355},
            {'range': 'Week 5', 'total': 354},
        ]),
    ])),
    ('5_day', OrderedDict([
        ('grouping', 'week'),
        ("application_resp", [
            {'range': 'Week 1', 'total': 353},
            {'range': 'Week 2', 'total': 355},
            {'range': 'Week 3', 'total': 356},
            {'range': 'Week 4', 'total': 355},
            {'range': 'Week 5', 'total': 354},
        ]),
    ])),
    ('6_day', OrderedDict([
        ('grouping', 'week'),
        ("application_resp", [
            {'range': 'Week 1', 'total': 355},
            {'range': 'Week 2', 'total': 356},
            {'range': 'Week 3', 'total': 355},
            {'range': 'Week 4', 'total': 354},
            {'range': 'Week 5', 'total': 355},
        ]),
    ])),
    ('7_day', OrderedDict([
        ('grouping', 'week'),
        ("application_resp", [
            {'range': 'Week 1', 'total': 355},
            {'range': 'Week 2', 'total': 356},
            {'range': 'Week 3', 'total': 355},
            {'range': 'Week 4', 'total': 354},
            {'range': 'Week 5', 'total': 355},
        ]),
    ])),
    ('8_day', OrderedDict([
        ('grouping', 'week'),
        ("application_resp", [
            {'range': 'Week 1', 'total': 355},
            {'range': 'Week 2', 'total': 356},
            {'range': 'Week 3', 'total': 355},
            {'range': 'Week 4', 'total': 354},
            {'range': 'Week 5', 'total': 355},
        ]),
    ])),
    ('9_day', OrderedDict([
        ('grouping', 'week'),
        ("application_resp", [
            {'range': 'Week 1', 'total': 355},
            {'range': 'Week 2', 'total': 356},
            {'range': 'Week 3', 'total': 355},
            {'range': 'Week 4', 'total': 354},
            {'range': 'Week 5', 'total': 355},
        ]),
    ])),
    ('10_day', OrderedDict([
        ('grouping', 'week'),
        ("application_resp", [
            {'range': 'Week 1', 'total': 355},
            {'range': 'Week 2', 'total': 356},
            {'range': 'Week 3', 'total': 355},
            {'range': 'Week 4', 'total': 354},
            {'range': 'Week 5', 'total': 355},
        ]),
    ])),
    ('11_day', OrderedDict([
        ('grouping', 'week'),
        ("application_resp", [
            {'range': 'Week 1', 'total': 355},
            {'range': 'Week 2', 'total': 356},
            {'range': 'Week 3', 'total': 355},
            {'range': 'Week 4', 'total': 354},
            {'range': 'Week 5', 'total': 355},
        ]),
    ])),
    ('12_day', OrderedDict([
        ('grouping', 'week'),
        ("application_resp", [
            {'range': 'Week 1', 'total': 355},
            {'range': 'Week 2', 'total': 356},
            {'range': 'Week 3', 'total': 355},
            {'range': 'Week 4', 'total': 354},
            {'range': 'Week 5', 'total': 355},
        ]),
    ])),
    ('13_day', OrderedDict([
        ('grouping', 'week'),
        ("application_resp", [
            {'range': 'Week 1', 'total': 356},
            {'range': 'Week 2', 'total': 355},
            {'range': 'Week 3', 'total': 354},
            {'range': 'Week 4', 'total': 355},
            {'range': 'Week 5', 'total': 355},
        ]),
    ])),
    ('14_day', OrderedDict([
        ('grouping', 'week'),
        ("application_resp", [
            {'range': 'Week 1', 'total': 356},
            {'range': 'Week 2', 'total': 355},
            {'range': 'Week 3', 'total': 354},
            {'range': 'Week 4', 'total': 355},
            {'range': 'Week 5', 'total': 355},
        ]),
    ])),
    ('15_day', OrderedDict([
        ('grouping', 'week'),
        ("application_resp", [
            {'range': 'Week 1', 'total': 356},
            {'range': 'Week 2', 'total': 355},
            {'range': 'Week 3', 'total': 354},
            {'range': 'Week 4', 'total': 355},
            {'range': 'Week 5', 'total': 355},
        ]),
    ])),
    ('16_day', OrderedDict([
        ('grouping', 'week'),
        ("application_resp", [
            {'range': 'Week 1', 'total': 356},
            {'range': 'Week 2', 'total': 355},
            {'range': 'Week 3', 'total': 354},
            {'range': 'Week 4', 'total': 355},
            {'range': 'Week 5', 'total': 355},
        ]),
    ])),
    ('17_day', OrderedDict([
        ('grouping', 'week'),
        ("application_resp", [
            {'range': 'Week 1', 'total': 356},
            {'range': 'Week 2', 'total': 355},
            {'range': 'Week 3', 'total': 354},
            {'range': 'Week 4', 'total': 355},
            {'range': 'Week 5', 'total': 355},
        ]),
    ])),
    ('18_day', OrderedDict([
        ('grouping', 'week'),
        ("application_resp", [
            {'range': 'Week 1', 'total': 356},
            {'range': 'Week 2', 'total': 355},
            {'range': 'Week 3', 'total': 354},
            {'range': 'Week 4', 'total': 355},
            {'range': 'Week 5', 'total': 355},
        ]),
    ])),
    ('19_day', OrderedDict([
        ('grouping', 'week'),
        ("application_resp", [
            {'range': 'Week 1', 'total': 356},
            {'range': 'Week 2', 'total': 355},
            {'range': 'Week 3', 'total': 354},
            {'range': 'Week 4', 'total': 355},
            {'range': 'Week 5', 'total': 355},
        ]),
    ])),
    ('20_day', OrderedDict([
        ('grouping', 'week'),
        ("application_resp", [
            {'range': 'Week 1', 'total': 355},
            {'range': 'Week 2', 'total': 354},
            {'range': 'Week 3', 'total': 355},
            {'range': 'Week 4', 'total': 355},
            {'range': 'Week 5', 'total': 354},
        ]),
    ])),
    ('21_day', OrderedDict([
        ('grouping', 'week'),
        ("application_resp", [
            {'range': 'Week 1', 'total': 355},
            {'range': 'Week 2', 'total': 354},
            {'range': 'Week 3', 'total': 355},
            {'range': 'Week 4', 'total': 355},
            {'range': 'Week 5', 'total': 354},
        ]),
    ])),
    ('22_day', OrderedDict([
        ('grouping', 'week'),
        ("application_resp", [
            {'range': 'Week 1', 'total': 355},
            {'range': 'Week 2', 'total': 354},
            {'range': 'Week 3', 'total': 355},
            {'range': 'Week 4', 'total': 355},
            {'range': 'Week 5', 'total': 354},
        ]),
    ])),
    ('23_day', OrderedDict([
        ('grouping', 'week'),
        ("application_resp", [
            {'range': 'Week 1', 'total': 355},
            {'range': 'Week 2', 'total': 354},
            {'range': 'Week 3', 'total': 355},
            {'range': 'Week 4', 'total': 355},
            {'range': 'Week 5', 'total': 354},
        ]),
    ])),
    ('24_day', OrderedDict([
        ('grouping', 'week'),
        ("application_resp", [
            {'range': 'Week 1', 'total': 355},
            {'range': 'Week 2', 'total': 354},
            {'range': 'Week 3', 'total': 355},
            {'range': 'Week 4', 'total': 355},
            {'range': 'Week 5', 'total': 354},
        ]),
    ])),
    ('25_day', OrderedDict([
        ('grouping', 'week'),
        ("application_resp", [
            {'range': 'Week 1', 'total': 355},
            {'range': 'Week 2', 'total': 354},
            {'range': 'Week 3', 'total': 355},
            {'range': 'Week 4', 'total': 355},
            {'range': 'Week 5', 'total': 354},
        ]),
    ])),
    ('26_day', OrderedDict([
        ('grouping', 'week'),
        ("application_resp", [
            {'range': 'Week 1', 'total': 355},
            {'range': 'Week 2', 'total': 354},
            {'range': 'Week 3', 'total': 355},
            {'range': 'Week 4', 'total': 355},
            {'range': 'Week 5', 'total': 354},
        ]),
    ])),
    ('27_day', OrderedDict([
        ('grouping', 'week'),
        ("application_resp", [
            {'range': 'Week 1', 'total': 354},
            {'range': 'Week 2', 'total': 355},
            {'range': 'Week 3', 'total': 355},
            {'range': 'Week 4', 'total': 354},
            {'range': 'Week 5', 'total': 354},
        ]),
    ])),
    ('28_day', OrderedDict([
        ('grouping', 'week'),
        ("application_resp", [
            {'range': 'Week 1', 'total': 354},
            {'range': 'Week 2', 'total': 355},
            {'range': 'Week 3', 'total': 355},
            {'range': 'Week 4', 'total': 354},
            {'range': 'Week 5', 'total': 354},
        ]),
    ])),
    ('29_day', OrderedDict([
        ('grouping', 'week'),
        ("application_resp", [
            {'range': 'Week 1', 'total': 354},
            {'range': 'Week 2', 'total': 355},
            {'range': 'Week 3', 'total': 355},
            {'range': 'Week 4', 'total': 354},
            {'range': 'Week 5', 'total': 354},
        ]),
    ])),
])


ERROR_RATE_EASYTRADE = OrderedDict([
    ('1_day', OrderedDict([
        ('grouping', 'week'),
        ("error_rate", [
            {'range': 'Week 1', 'total': 0.0643},
            {'range': 'Week 2', 'total': 0.0650},
            {'range': 'Week 3', 'total': 0.0627},
            {'range': 'Week 4', 'total': 0.0688},
            {'range': 'Week 5', 'total': 0.0668},
        ]),
    ])),
    ('2_day', OrderedDict([
        ('grouping', 'week'),
        ("error_rate", [
            {'range': 'Week 1', 'total': 0.0643},
            {'range': 'Week 2', 'total': 0.0650},
            {'range': 'Week 3', 'total': 0.0627},
            {'range': 'Week 4', 'total': 0.0688},
            {'range': 'Week 5', 'total': 0.0668},
        ]),
    ])),
    ('3_day', OrderedDict([
        ('grouping', 'week'),
        ("error_rate", [
            {'range': 'Week 1', 'total': 0.0643},
            {'range': 'Week 2', 'total': 0.0650},
            {'range': 'Week 3', 'total': 0.0627},
            {'range': 'Week 4', 'total': 0.0688},
            {'range': 'Week 5', 'total': 0.0668},
        ]),
    ])),
    ('4_day', OrderedDict([
        ('grouping', 'week'),
        ("error_rate", [
            {'range': 'Week 1', 'total': 0.0643},
            {'range': 'Week 2', 'total': 0.0650},
            {'range': 'Week 3', 'total': 0.0627},
            {'range': 'Week 4', 'total': 0.0688},
            {'range': 'Week 5', 'total': 0.0668},
        ]),
    ])),
    ('5_day', OrderedDict([
        ('grouping', 'week'),
        ("error_rate", [
            {'range': 'Week 1', 'total': 0.0643},
            {'range': 'Week 2', 'total': 0.0650},
            {'range': 'Week 3', 'total': 0.0627},
            {'range': 'Week 4', 'total': 0.0688},
            {'range': 'Week 5', 'total': 0.0668},
        ]),
    ])),
    ('6_day', OrderedDict([
        ('grouping', 'week'),
        ("error_rate", [
            {'range': 'Week 1', 'total': 0.0650},
            {'range': 'Week 2', 'total': 0.0627},
            {'range': 'Week 3', 'total': 0.0688},
            {'range': 'Week 4', 'total': 0.0668},
            {'range': 'Week 5', 'total': 0.0678},
        ]),
    ])),
    ('7_day', OrderedDict([
        ('grouping', 'week'),
        ("error_rate", [
            {'range': 'Week 1', 'total': 0.0650},
            {'range': 'Week 2', 'total': 0.0627},
            {'range': 'Week 3', 'total': 0.0688},
            {'range': 'Week 4', 'total': 0.0668},
            {'range': 'Week 5', 'total': 0.0678},
        ]),
    ])),
    ('8_day', OrderedDict([
        ('grouping', 'week'),
        ("error_rate", [
            {'range': 'Week 1', 'total': 0.0650},
            {'range': 'Week 2', 'total': 0.0627},
            {'range': 'Week 3', 'total': 0.0688},
            {'range': 'Week 4', 'total': 0.0668},
            {'range': 'Week 5', 'total': 0.0678},
        ]),
    ])),
    ('9_day', OrderedDict([
        ('grouping', 'week'),
        ("error_rate", [
            {'range': 'Week 1', 'total': 0.0650},
            {'range': 'Week 2', 'total': 0.0627},
            {'range': 'Week 3', 'total': 0.0688},
            {'range': 'Week 4', 'total': 0.0668},
            {'range': 'Week 5', 'total': 0.0678},
        ]),
    ])),
    ('10_day', OrderedDict([
        ('grouping', 'week'),
        ("error_rate", [
            {'range': 'Week 1', 'total': 0.0650},
            {'range': 'Week 2', 'total': 0.0627},
            {'range': 'Week 3', 'total': 0.0688},
            {'range': 'Week 4', 'total': 0.0668},
            {'range': 'Week 5', 'total': 0.0678},
        ]),
    ])),
    ('11_day', OrderedDict([
        ('grouping', 'week'),
        ("error_rate", [
            {'range': 'Week 1', 'total': 0.0650},
            {'range': 'Week 2', 'total': 0.0627},
            {'range': 'Week 3', 'total': 0.0688},
            {'range': 'Week 4', 'total': 0.0668},
            {'range': 'Week 5', 'total': 0.0678},
        ]),
    ])),
    ('12_day', OrderedDict([
        ('grouping', 'week'),
        ("error_rate", [
            {'range': 'Week 1', 'total': 0.0650},
            {'range': 'Week 2', 'total': 0.0627},
            {'range': 'Week 3', 'total': 0.0688},
            {'range': 'Week 4', 'total': 0.0668},
            {'range': 'Week 5', 'total': 0.0678},
        ]),
    ])),
    ('13_day', OrderedDict([
        ('grouping', 'week'),
        ("error_rate", [
            {'range': 'Week 1', 'total': 0.0627},
            {'range': 'Week 2', 'total': 0.0688},
            {'range': 'Week 3', 'total': 0.0668},
            {'range': 'Week 4', 'total': 0.0678},
            {'range': 'Week 5', 'total': 0.0658},
        ]),
    ])),
    ('14_day', OrderedDict([
        ('grouping', 'week'),
        ("error_rate", [
            {'range': 'Week 1', 'total': 0.0627},
            {'range': 'Week 2', 'total': 0.0688},
            {'range': 'Week 3', 'total': 0.0668},
            {'range': 'Week 4', 'total': 0.0678},
            {'range': 'Week 5', 'total': 0.0658},
        ]),
    ])),
    ('15_day', OrderedDict([
        ('grouping', 'week'),
        ("error_rate", [
            {'range': 'Week 1', 'total': 0.0627},
            {'range': 'Week 2', 'total': 0.0688},
            {'range': 'Week 3', 'total': 0.0668},
            {'range': 'Week 4', 'total': 0.0678},
            {'range': 'Week 5', 'total': 0.0658},
        ]),
    ])),
    ('16_day', OrderedDict([
        ('grouping', 'week'),
        ("error_rate", [
            {'range': 'Week 1', 'total': 0.0627},
            {'range': 'Week 2', 'total': 0.0688},
            {'range': 'Week 3', 'total': 0.0668},
            {'range': 'Week 4', 'total': 0.0678},
            {'range': 'Week 5', 'total': 0.0658},
        ]),
    ])),
    ('17_day', OrderedDict([
        ('grouping', 'week'),
        ("error_rate", [
            {'range': 'Week 1', 'total': 0.0627},
            {'range': 'Week 2', 'total': 0.0688},
            {'range': 'Week 3', 'total': 0.0668},
            {'range': 'Week 4', 'total': 0.0678},
            {'range': 'Week 5', 'total': 0.0658},
        ]),
    ])),
    ('18_day', OrderedDict([
        ('grouping', 'week'),
        ("error_rate", [
            {'range': 'Week 1', 'total': 0.0627},
            {'range': 'Week 2', 'total': 0.0688},
            {'range': 'Week 3', 'total': 0.0668},
            {'range': 'Week 4', 'total': 0.0678},
            {'range': 'Week 5', 'total': 0.0658},
        ]),
    ])),
    ('19_day', OrderedDict([
        ('grouping', 'week'),
        ("error_rate", [
            {'range': 'Week 1', 'total': 0.0627},
            {'range': 'Week 2', 'total': 0.0688},
            {'range': 'Week 3', 'total': 0.0668},
            {'range': 'Week 4', 'total': 0.0678},
            {'range': 'Week 5', 'total': 0.0658},
        ]),
    ])),
    ('20_day', OrderedDict([
        ('grouping', 'week'),
        ("error_rate", [
            {'range': 'Week 1', 'total': 0.0688},
            {'range': 'Week 2', 'total': 0.0668},
            {'range': 'Week 3', 'total': 0.0678},
            {'range': 'Week 4', 'total': 0.0658},
            {'range': 'Week 5', 'total': 0.0658},
        ]),
    ])),
    ('21_day', OrderedDict([
        ('grouping', 'week'),
        ("error_rate", [
            {'range': 'Week 1', 'total': 0.0688},
            {'range': 'Week 2', 'total': 0.0668},
            {'range': 'Week 3', 'total': 0.0678},
            {'range': 'Week 4', 'total': 0.0658},
            {'range': 'Week 5', 'total': 0.0658},
        ]),
    ])),
    ('22_day', OrderedDict([
        ('grouping', 'week'),
        ("error_rate", [
            {'range': 'Week 1', 'total': 0.0688},
            {'range': 'Week 2', 'total': 0.0668},
            {'range': 'Week 3', 'total': 0.0678},
            {'range': 'Week 4', 'total': 0.0658},
            {'range': 'Week 5', 'total': 0.0658},
        ]),
    ])),
    ('23_day', OrderedDict([
        ('grouping', 'week'),
        ("error_rate", [
            {'range': 'Week 1', 'total': 0.0688},
            {'range': 'Week 2', 'total': 0.0668},
            {'range': 'Week 3', 'total': 0.0678},
            {'range': 'Week 4', 'total': 0.0658},
            {'range': 'Week 5', 'total': 0.0658},
        ]),
    ])),
    ('24_day', OrderedDict([
        ('grouping', 'week'),
        ("error_rate", [
            {'range': 'Week 1', 'total': 0.0688},
            {'range': 'Week 2', 'total': 0.0668},
            {'range': 'Week 3', 'total': 0.0678},
            {'range': 'Week 4', 'total': 0.0658},
            {'range': 'Week 5', 'total': 0.0658},
        ]),
    ])),
    ('25_day', OrderedDict([
        ('grouping', 'week'),
        ("error_rate", [
            {'range': 'Week 1', 'total': 0.0688},
            {'range': 'Week 2', 'total': 0.0668},
            {'range': 'Week 3', 'total': 0.0678},
            {'range': 'Week 4', 'total': 0.0658},
            {'range': 'Week 5', 'total': 0.0658},
        ]),
    ])),
    ('26_day', OrderedDict([
        ('grouping', 'week'),
        ("error_rate", [
            {'range': 'Week 1', 'total': 0.0688},
            {'range': 'Week 2', 'total': 0.0668},
            {'range': 'Week 3', 'total': 0.0678},
            {'range': 'Week 4', 'total': 0.0658},
            {'range': 'Week 5', 'total': 0.0658},
        ]),
    ])),
    ('27_day', OrderedDict([
        ('grouping', 'week'),
        ("error_rate", [
            {'range': 'Week 1', 'total': 0.0668},
            {'range': 'Week 2', 'total': 0.0678},
            {'range': 'Week 3', 'total': 0.0658},
            {'range': 'Week 4', 'total': 0.0658},
            {'range': 'Week 5', 'total': 0.0645},
        ]),
    ])),
    ('28_day', OrderedDict([
        ('grouping', 'week'),
        ("error_rate", [
            {'range': 'Week 1', 'total': 0.0668},
            {'range': 'Week 2', 'total': 0.0678},
            {'range': 'Week 3', 'total': 0.0658},
            {'range': 'Week 4', 'total': 0.0658},
            {'range': 'Week 5', 'total': 0.0645},
        ]),
    ])),
    ('29_day', OrderedDict([
        ('grouping', 'week'),
        ("error_rate", [
            {'range': 'Week 1', 'total': 0.0668},
            {'range': 'Week 2', 'total': 0.0678},
            {'range': 'Week 3', 'total': 0.0658},
            {'range': 'Week 4', 'total': 0.0658},
            {'range': 'Week 5', 'total': 0.0645},
        ]),
    ])),
])


FAILURE_RATE_EASYTRADE = OrderedDict([
    ('1_day', OrderedDict([
        ('grouping', 'week'),
        ("failure_rate", [
            {'range': 'Week 1', 'total': 0.8749},
            {'range': 'Week 2', 'total': 0.8735},
            {'range': 'Week 3', 'total': 0.8726},
            {'range': 'Week 4', 'total': 0.8736},
            {'range': 'Week 5', 'total': 0.8726},
        ]),
    ])),
    ('2_day', OrderedDict([
        ('grouping', 'week'),
        ("failure_rate", [
            {'range': 'Week 1', 'total': 0.8749},
            {'range': 'Week 2', 'total': 0.8735},
            {'range': 'Week 3', 'total': 0.8726},
            {'range': 'Week 4', 'total': 0.8736},
            {'range': 'Week 5', 'total': 0.8726},
        ]),
    ])),
    ('3_day', OrderedDict([
        ('grouping', 'week'),
        ("failure_rate", [
            {'range': 'Week 1', 'total': 0.8749},
            {'range': 'Week 2', 'total': 0.8735},
            {'range': 'Week 3', 'total': 0.8726},
            {'range': 'Week 4', 'total': 0.8736},
            {'range': 'Week 5', 'total': 0.8726},
        ]),
    ])),
    ('4_day', OrderedDict([
        ('grouping', 'week'),
        ("failure_rate", [
            {'range': 'Week 1', 'total': 0.8749},
            {'range': 'Week 2', 'total': 0.8735},
            {'range': 'Week 3', 'total': 0.8726},
            {'range': 'Week 4', 'total': 0.8736},
            {'range': 'Week 5', 'total': 0.8726},
        ]),
    ])),
    ('5_day', OrderedDict([
        ('grouping', 'week'),
        ("failure_rate", [
            {'range': 'Week 1', 'total': 0.8749},
            {'range': 'Week 2', 'total': 0.8735},
            {'range': 'Week 3', 'total': 0.8726},
            {'range': 'Week 4', 'total': 0.8736},
            {'range': 'Week 5', 'total': 0.8726},
        ]),
    ])),
    ('6_day', OrderedDict([
        ('grouping', 'week'),
        ("failure_rate", [
            {'range': 'Week 1', 'total': 0.8735},
            {'range': 'Week 2', 'total': 0.8726},
            {'range': 'Week 3', 'total': 0.8736},
            {'range': 'Week 4', 'total': 0.8726},
            {'range': 'Week 5', 'total': 0.8724},
        ]),
    ])),
    ('7_day', OrderedDict([
        ('grouping', 'week'),
        ("failure_rate", [
            {'range': 'Week 1', 'total': 0.8735},
            {'range': 'Week 2', 'total': 0.8726},
            {'range': 'Week 3', 'total': 0.8736},
            {'range': 'Week 4', 'total': 0.8726},
            {'range': 'Week 5', 'total': 0.8724},
        ]),
    ])),
    ('8_day', OrderedDict([
        ('grouping', 'week'),
        ("failure_rate", [
            {'range': 'Week 1', 'total': 0.8735},
            {'range': 'Week 2', 'total': 0.8726},
            {'range': 'Week 3', 'total': 0.8736},
            {'range': 'Week 4', 'total': 0.8726},
            {'range': 'Week 5', 'total': 0.8724},
        ]),
    ])),
    ('9_day', OrderedDict([
        ('grouping', 'week'),
        ("failure_rate", [
            {'range': 'Week 1', 'total': 0.8735},
            {'range': 'Week 2', 'total': 0.8726},
            {'range': 'Week 3', 'total': 0.8736},
            {'range': 'Week 4', 'total': 0.8726},
            {'range': 'Week 5', 'total': 0.8724},
        ]),
    ])),
    ('10_day', OrderedDict([
        ('grouping', 'week'),
        ("failure_rate", [
            {'range': 'Week 1', 'total': 0.8735},
            {'range': 'Week 2', 'total': 0.8726},
            {'range': 'Week 3', 'total': 0.8736},
            {'range': 'Week 4', 'total': 0.8726},
            {'range': 'Week 5', 'total': 0.8724},
        ]),
    ])),
    ('11_day', OrderedDict([
        ('grouping', 'week'),
        ("failure_rate", [
            {'range': 'Week 1', 'total': 0.8735},
            {'range': 'Week 2', 'total': 0.8726},
            {'range': 'Week 3', 'total': 0.8736},
            {'range': 'Week 4', 'total': 0.8726},
            {'range': 'Week 5', 'total': 0.8724},
        ]),
    ])),
    ('12_day', OrderedDict([
        ('grouping', 'week'),
        ("failure_rate", [
            {'range': 'Week 1', 'total': 0.8735},
            {'range': 'Week 2', 'total': 0.8726},
            {'range': 'Week 3', 'total': 0.8736},
            {'range': 'Week 4', 'total': 0.8726},
            {'range': 'Week 5', 'total': 0.8724},
        ]),
    ])),
    ('13_day', OrderedDict([
        ('grouping', 'week'),
        ("failure_rate", [
            {'range': 'Week 1', 'total': 0.8726},
            {'range': 'Week 2', 'total': 0.8736},
            {'range': 'Week 3', 'total': 0.8726},
            {'range': 'Week 4', 'total': 0.8724},
            {'range': 'Week 5', 'total': 0.8733},
        ]),
    ])),
    ('14_day', OrderedDict([
        ('grouping', 'week'),
        ("failure_rate", [
            {'range': 'Week 1', 'total': 0.8726},
            {'range': 'Week 2', 'total': 0.8736},
            {'range': 'Week 3', 'total': 0.8726},
            {'range': 'Week 4', 'total': 0.8724},
            {'range': 'Week 5', 'total': 0.8733},
        ]),
    ])),
    ('15_day', OrderedDict([
        ('grouping', 'week'),
        ("failure_rate", [
            {'range': 'Week 1', 'total': 0.8726},
            {'range': 'Week 2', 'total': 0.8736},
            {'range': 'Week 3', 'total': 0.8726},
            {'range': 'Week 4', 'total': 0.8724},
            {'range': 'Week 5', 'total': 0.8733},
        ]),
    ])),
    ('16_day', OrderedDict([
        ('grouping', 'week'),
        ("failure_rate", [
            {'range': 'Week 1', 'total': 0.8726},
            {'range': 'Week 2', 'total': 0.8736},
            {'range': 'Week 3', 'total': 0.8726},
            {'range': 'Week 4', 'total': 0.8724},
            {'range': 'Week 5', 'total': 0.8733},
        ]),
    ])),
    ('17_day', OrderedDict([
        ('grouping', 'week'),
        ("failure_rate", [
            {'range': 'Week 1', 'total': 0.8726},
            {'range': 'Week 2', 'total': 0.8736},
            {'range': 'Week 3', 'total': 0.8726},
            {'range': 'Week 4', 'total': 0.8724},
            {'range': 'Week 5', 'total': 0.8733},
        ]),
    ])),
    ('18_day', OrderedDict([
        ('grouping', 'week'),
        ("failure_rate", [
            {'range': 'Week 1', 'total': 0.8726},
            {'range': 'Week 2', 'total': 0.8736},
            {'range': 'Week 3', 'total': 0.8726},
            {'range': 'Week 4', 'total': 0.8724},
            {'range': 'Week 5', 'total': 0.8733},
        ]),
    ])),
    ('19_day', OrderedDict([
        ('grouping', 'week'),
        ("failure_rate", [
            {'range': 'Week 1', 'total': 0.8726},
            {'range': 'Week 2', 'total': 0.8736},
            {'range': 'Week 3', 'total': 0.8726},
            {'range': 'Week 4', 'total': 0.8724},
            {'range': 'Week 5', 'total': 0.8733},
        ]),
    ])),
    ('20_day', OrderedDict([
        ('grouping', 'week'),
        ("failure_rate", [
            {'range': 'Week 1', 'total': 0.8736},
            {'range': 'Week 2', 'total': 0.8726},
            {'range': 'Week 3', 'total': 0.8724},
            {'range': 'Week 4', 'total': 0.8733},
            {'range': 'Week 5', 'total': 0.8734},
        ]),
    ])),
    ('21_day', OrderedDict([
        ('grouping', 'week'),
        ("failure_rate", [
            {'range': 'Week 1', 'total': 0.8736},
            {'range': 'Week 2', 'total': 0.8726},
            {'range': 'Week 3', 'total': 0.8724},
            {'range': 'Week 4', 'total': 0.8733},
            {'range': 'Week 5', 'total': 0.8734},
        ]),
    ])),
    ('22_day', OrderedDict([
        ('grouping', 'week'),
        ("failure_rate", [
            {'range': 'Week 1', 'total': 0.8736},
            {'range': 'Week 2', 'total': 0.8726},
            {'range': 'Week 3', 'total': 0.8724},
            {'range': 'Week 4', 'total': 0.8733},
            {'range': 'Week 5', 'total': 0.8734},
        ]),
    ])),
    ('23_day', OrderedDict([
        ('grouping', 'week'),
        ("failure_rate", [
            {'range': 'Week 1', 'total': 0.8736},
            {'range': 'Week 2', 'total': 0.8726},
            {'range': 'Week 3', 'total': 0.8724},
            {'range': 'Week 4', 'total': 0.8733},
            {'range': 'Week 5', 'total': 0.8734},
        ]),
    ])),
    ('24_day', OrderedDict([
        ('grouping', 'week'),
        ("failure_rate", [
            {'range': 'Week 1', 'total': 0.8736},
            {'range': 'Week 2', 'total': 0.8726},
            {'range': 'Week 3', 'total': 0.8724},
            {'range': 'Week 4', 'total': 0.8733},
            {'range': 'Week 5', 'total': 0.8734},
        ]),
    ])),
    ('25_day', OrderedDict([
        ('grouping', 'week'),
        ("failure_rate", [
            {'range': 'Week 1', 'total': 0.8736},
            {'range': 'Week 2', 'total': 0.8726},
            {'range': 'Week 3', 'total': 0.8724},
            {'range': 'Week 4', 'total': 0.8733},
            {'range': 'Week 5', 'total': 0.8734},
        ]),
    ])),
    ('26_day', OrderedDict([
        ('grouping', 'week'),
        ("failure_rate", [
            {'range': 'Week 1', 'total': 0.8736},
            {'range': 'Week 2', 'total': 0.8726},
            {'range': 'Week 3', 'total': 0.8724},
            {'range': 'Week 4', 'total': 0.8733},
            {'range': 'Week 5', 'total': 0.8734},
        ]),
    ])),
    ('27_day', OrderedDict([
        ('grouping', 'week'),
        ("failure_rate", [
            {'range': 'Week 1', 'total': 0.8726},
            {'range': 'Week 2', 'total': 0.8724},
            {'range': 'Week 3', 'total': 0.8733},
            {'range': 'Week 4', 'total': 0.8734},
            {'range': 'Week 5', 'total': 0.8725},
        ]),
    ])),
    ('28_day', OrderedDict([
        ('grouping', 'week'),
        ("failure_rate", [
            {'range': 'Week 1', 'total': 0.8726},
            {'range': 'Week 2', 'total': 0.8724},
            {'range': 'Week 3', 'total': 0.8733},
            {'range': 'Week 4', 'total': 0.8734},
            {'range': 'Week 5', 'total': 0.8725},
        ]),
    ])),
    ('29_day', OrderedDict([
        ('grouping', 'week'),
        ("failure_rate", [
            {'range': 'Week 1', 'total': 0.8726},
            {'range': 'Week 2', 'total': 0.8724},
            {'range': 'Week 3', 'total': 0.8733},
            {'range': 'Week 4', 'total': 0.8734},
            {'range': 'Week 5', 'total': 0.8725},
        ]),
    ])),
])

LATENCY_EASYTRADE = OrderedDict([
    ('1_day', OrderedDict([
        ('grouping', 'week'),
        ("latency", [
            {'range': 'Week 1', 'total': 604},
            {'range': 'Week 2', 'total': 610},
            {'range': 'Week 3', 'total': 607},
            {'range': 'Week 4', 'total': 607},
            {'range': 'Week 5', 'total': 602},
        ]),
    ])),
    ('2_day', OrderedDict([
        ('grouping', 'week'),
        ("latency", [
            {'range': 'Week 1', 'total': 604},
            {'range': 'Week 2', 'total': 610},
            {'range': 'Week 3', 'total': 607},
            {'range': 'Week 4', 'total': 607},
            {'range': 'Week 5', 'total': 602},
        ]),
    ])),
    ('3_day', OrderedDict([
        ('grouping', 'week'),
        ("latency", [
            {'range': 'Week 1', 'total': 604},
            {'range': 'Week 2', 'total': 610},
            {'range': 'Week 3', 'total': 607},
            {'range': 'Week 4', 'total': 607},
            {'range': 'Week 5', 'total': 602},
        ]),
    ])),
    ('4_day', OrderedDict([
        ('grouping', 'week'),
        ("latency", [
            {'range': 'Week 1', 'total': 604},
            {'range': 'Week 2', 'total': 610},
            {'range': 'Week 3', 'total': 607},
            {'range': 'Week 4', 'total': 607},
            {'range': 'Week 5', 'total': 602},
        ]),
    ])),
    ('5_day', OrderedDict([
        ('grouping', 'week'),
        ("latency", [
            {'range': 'Week 1', 'total': 604},
            {'range': 'Week 2', 'total': 610},
            {'range': 'Week 3', 'total': 607},
            {'range': 'Week 4', 'total': 607},
            {'range': 'Week 5', 'total': 602},
        ]),
    ])),
    ('6_day', OrderedDict([
        ('grouping', 'week'),
        ("latency", [
            {'range': 'Week 1', 'total': 610},
            {'range': 'Week 2', 'total': 607},
            {'range': 'Week 3', 'total': 607},
            {'range': 'Week 4', 'total': 602},
            {'range': 'Week 5', 'total': 604},
        ]),
    ])),
    ('7_day', OrderedDict([
        ('grouping', 'week'),
        ("latency", [
            {'range': 'Week 1', 'total': 610},
            {'range': 'Week 2', 'total': 607},
            {'range': 'Week 3', 'total': 607},
            {'range': 'Week 4', 'total': 602},
            {'range': 'Week 5', 'total': 604},
        ]),
    ])),
    ('8_day', OrderedDict([
        ('grouping', 'week'),
        ("latency", [
            {'range': 'Week 1', 'total': 610},
            {'range': 'Week 2', 'total': 607},
            {'range': 'Week 3', 'total': 607},
            {'range': 'Week 4', 'total': 602},
            {'range': 'Week 5', 'total': 604},
        ]),
    ])),
    ('9_day', OrderedDict([
        ('grouping', 'week'),
        ("latency", [
            {'range': 'Week 1', 'total': 610},
            {'range': 'Week 2', 'total': 607},
            {'range': 'Week 3', 'total': 607},
            {'range': 'Week 4', 'total': 602},
            {'range': 'Week 5', 'total': 604},
        ]),
    ])),
    ('10_day', OrderedDict([
        ('grouping', 'week'),
        ("latency", [
            {'range': 'Week 1', 'total': 610},
            {'range': 'Week 2', 'total': 607},
            {'range': 'Week 3', 'total': 607},
            {'range': 'Week 4', 'total': 602},
            {'range': 'Week 5', 'total': 604},
        ]),
    ])),
    ('11_day', OrderedDict([
        ('grouping', 'week'),
        ("latency", [
            {'range': 'Week 1', 'total': 610},
            {'range': 'Week 2', 'total': 607},
            {'range': 'Week 3', 'total': 607},
            {'range': 'Week 4', 'total': 602},
            {'range': 'Week 5', 'total': 604},
        ]),
    ])),
    ('12_day', OrderedDict([
        ('grouping', 'week'),
        ("latency", [
            {'range': 'Week 1', 'total': 610},
            {'range': 'Week 2', 'total': 607},
            {'range': 'Week 3', 'total': 607},
            {'range': 'Week 4', 'total': 602},
            {'range': 'Week 5', 'total': 604},
        ]),
    ])),
    ('13_day', OrderedDict([
        ('grouping', 'week'),
        ("latency", [
            {'range': 'Week 1', 'total': 607},
            {'range': 'Week 2', 'total': 607},
            {'range': 'Week 3', 'total': 602},
            {'range': 'Week 4', 'total': 604},
            {'range': 'Week 5', 'total': 606},
        ]),
    ])),
    ('14_day', OrderedDict([
        ('grouping', 'week'),
        ("latency", [
            {'range': 'Week 1', 'total': 607},
            {'range': 'Week 2', 'total': 607},
            {'range': 'Week 3', 'total': 602},
            {'range': 'Week 4', 'total': 604},
            {'range': 'Week 5', 'total': 606},
        ]),
    ])),
    ('15_day', OrderedDict([
        ('grouping', 'week'),
        ("latency", [
            {'range': 'Week 1', 'total': 607},
            {'range': 'Week 2', 'total': 607},
            {'range': 'Week 3', 'total': 602},
            {'range': 'Week 4', 'total': 604},
            {'range': 'Week 5', 'total': 606},
        ]),
    ])),
    ('16_day', OrderedDict([
        ('grouping', 'week'),
        ("latency", [
            {'range': 'Week 1', 'total': 607},
            {'range': 'Week 2', 'total': 607},
            {'range': 'Week 3', 'total': 602},
            {'range': 'Week 4', 'total': 604},
            {'range': 'Week 5', 'total': 606},
        ]),
    ])),
    ('17_day', OrderedDict([
        ('grouping', 'week'),
        ("latency", [
            {'range': 'Week 1', 'total': 607},
            {'range': 'Week 2', 'total': 607},
            {'range': 'Week 3', 'total': 602},
            {'range': 'Week 4', 'total': 604},
            {'range': 'Week 5', 'total': 606},
        ]),
    ])),
    ('18_day', OrderedDict([
        ('grouping', 'week'),
        ("latency", [
            {'range': 'Week 1', 'total': 607},
            {'range': 'Week 2', 'total': 607},
            {'range': 'Week 3', 'total': 602},
            {'range': 'Week 4', 'total': 604},
            {'range': 'Week 5', 'total': 606},
        ]),
    ])),
    ('19_day', OrderedDict([
        ('grouping', 'week'),
        ("latency", [
            {'range': 'Week 1', 'total': 607},
            {'range': 'Week 2', 'total': 607},
            {'range': 'Week 3', 'total': 602},
            {'range': 'Week 4', 'total': 604},
            {'range': 'Week 5', 'total': 606},
        ]),
    ])),
    ('20_day', OrderedDict([
        ('grouping', 'week'),
        ("latency", [
            {'range': 'Week 1', 'total': 607},
            {'range': 'Week 2', 'total': 602},
            {'range': 'Week 3', 'total': 604},
            {'range': 'Week 4', 'total': 606},
            {'range': 'Week 5', 'total': 604},
        ]),
    ])),
    ('21_day', OrderedDict([
        ('grouping', 'week'),
        ("latency", [
            {'range': 'Week 1', 'total': 607},
            {'range': 'Week 2', 'total': 602},
            {'range': 'Week 3', 'total': 604},
            {'range': 'Week 4', 'total': 606},
            {'range': 'Week 5', 'total': 604},
        ]),
    ])),
    ('22_day', OrderedDict([
        ('grouping', 'week'),
        ("latency", [
            {'range': 'Week 1', 'total': 607},
            {'range': 'Week 2', 'total': 602},
            {'range': 'Week 3', 'total': 604},
            {'range': 'Week 4', 'total': 606},
            {'range': 'Week 5', 'total': 604},
        ]),
    ])),
    ('23_day', OrderedDict([
        ('grouping', 'week'),
        ("latency", [
            {'range': 'Week 1', 'total': 607},
            {'range': 'Week 2', 'total': 602},
            {'range': 'Week 3', 'total': 604},
            {'range': 'Week 4', 'total': 606},
            {'range': 'Week 5', 'total': 604},
        ]),
    ])),
    ('24_day', OrderedDict([
        ('grouping', 'week'),
        ("latency", [
            {'range': 'Week 1', 'total': 607},
            {'range': 'Week 2', 'total': 602},
            {'range': 'Week 3', 'total': 604},
            {'range': 'Week 4', 'total': 606},
            {'range': 'Week 5', 'total': 604},
        ]),
    ])),
    ('25_day', OrderedDict([
        ('grouping', 'week'),
        ("latency", [
            {'range': 'Week 1', 'total': 607},
            {'range': 'Week 2', 'total': 602},
            {'range': 'Week 3', 'total': 604},
            {'range': 'Week 4', 'total': 606},
            {'range': 'Week 5', 'total': 604},
        ]),
    ])),
    ('26_day', OrderedDict([
        ('grouping', 'week'),
        ("latency", [
            {'range': 'Week 1', 'total': 607},
            {'range': 'Week 2', 'total': 602},
            {'range': 'Week 3', 'total': 604},
            {'range': 'Week 4', 'total': 606},
            {'range': 'Week 5', 'total': 604},
        ]),
    ])),
    ('27_day', OrderedDict([
        ('grouping', 'week'),
        ("latency", [
            {'range': 'Week 1', 'total': 602},
            {'range': 'Week 2', 'total': 604},
            {'range': 'Week 3', 'total': 606},
            {'range': 'Week 4', 'total': 604},
            {'range': 'Week 5', 'total': 603},
        ]),
    ])),
    ('28_day', OrderedDict([
        ('grouping', 'week'),
        ("latency", [
            {'range': 'Week 1', 'total': 602},
            {'range': 'Week 2', 'total': 604},
            {'range': 'Week 3', 'total': 606},
            {'range': 'Week 4', 'total': 604},
            {'range': 'Week 5', 'total': 603},
        ]),
    ])),
    ('29_day', OrderedDict([
        ('grouping', 'week'),
        ("latency", [
            {'range': 'Week 1', 'total': 602},
            {'range': 'Week 2', 'total': 604},
            {'range': 'Week 3', 'total': 606},
            {'range': 'Week 4', 'total': 604},
            {'range': 'Week 5', 'total': 603},
        ]),
    ])),
])

REVENUE_BY_MARKETING_SOURCE_EASYTRADE = {
    "1_day": {
        "direct": "59.040%", 
        "organic": "22.591%", 
        "paid_search": "10.824%", 
        "email": "8.630%", 
        "social": "5.036%", 
        "referral": "3.670%"
    }, 
    "2_day": {
        "direct": "59.040%", 
        "organic": "22.591%", 
        "paid_search": "10.824%", 
        "email": "8.630%", 
        "social": "5.036%", 
        "referral": "3.670%"
    }, 
    "3_day": {
        "direct": "59.040%", 
        "organic": "22.591%", 
        "paid_search": "10.824%", 
        "email": "8.630%", 
        "social": "5.036%", 
        "referral": "3.670%"
    }, 
    "4_day": {
        "direct": "59.040%", 
        "organic": "22.591%", 
        "paid_search": "10.824%", 
        "email": "8.630%", 
        "social": "5.036%", 
        "referral": "3.670%"
    }, 
    "5_day": {
        "direct": "59.040%", 
        "organic": "22.591%", 
        "paid_search": "10.824%", 
        "email": "8.630%", 
        "social": "5.036%", 
        "referral": "3.670%"
    }, 
    "6_day": {
        "direct": "59.040%", 
        "organic": "22.591%", 
        "paid_search": "10.824%", 
        "email": "8.630%", 
        "social": "5.036%", 
        "referral": "3.670%"
    }, 
    "7_day": {
        "direct": "59.040%", 
        "organic": "22.591%", 
        "paid_search": "10.824%", 
        "email": "8.630%", 
        "social": "5.036%", 
        "referral": "3.670%"
    }, 
    "8_day": {
        "direct": "59.040%", 
        "organic": "22.591%", 
        "paid_search": "10.824%", 
        "email": "8.630%", 
        "social": "5.036%", 
        "referral": "3.670%"
    }, 
    "9_day": {
        "direct": "59.040%", 
        "organic": "22.591%", 
        "paid_search": "10.824%", 
        "email": "8.630%", 
        "social": "5.036%", 
        "referral": "3.670%"
    }, 
    "10_day": {
        "direct": "59.040%", 
        "organic": "22.591%", 
        "paid_search": "10.824%", 
        "email": "8.630%", 
        "social": "5.036%", 
        "referral": "3.670%"
    }, 
    "11_day": {
        "direct": "59.040%", 
        "organic": "22.591%", 
        "paid_search": "10.824%", 
        "email": "8.630%", 
        "social": "5.036%", 
        "referral": "3.670%"
    }, 
    "12_day": {
        "direct": "59.040%", 
        "organic": "22.591%", 
        "paid_search": "10.824%", 
        "email": "8.630%", 
        "social": "5.036%", 
        "referral": "3.670%"
    }, 
    "13_day": {
        "direct": "59.040%", 
        "organic": "22.591%", 
        "paid_search": "10.824%", 
        "email": "8.630%", 
        "social": "5.036%", 
        "referral": "3.670%"
    }, 
    "14_day": {
        "direct": "59.040%", 
        "organic": "22.591%", 
        "paid_search": "10.824%", 
        "email": "8.630%", 
        "social": "5.036%", 
        "referral": "3.670%"
    }, 
    "15_day": {
        "direct": "59.040%", 
        "organic": "22.591%", 
        "paid_search": "10.824%", 
        "email": "8.630%", 
        "social": "5.036%", 
        "referral": "3.670%"
    }, 
    "16_day": {
        "direct": "59.040%", 
        "organic": "22.591%", 
        "paid_search": "10.824%", 
        "email": "8.630%", 
        "social": "5.036%", 
        "referral": "3.670%"
    }, 
    "17_day": {
        "direct": "59.040%", 
        "organic": "22.591%", 
        "paid_search": "10.824%", 
        "email": "8.630%", 
        "social": "5.036%", 
        "referral": "3.670%"
    }, 
    "18_day": {
        "direct": "59.040%", 
        "organic": "22.591%", 
        "paid_search": "10.824%", 
        "email": "8.630%", 
        "social": "5.036%", 
        "referral": "3.670%"
    }, 
    "19_day": {
        "direct": "59.040%", 
        "organic": "22.591%", 
        "paid_search": "10.824%", 
        "email": "8.630%", 
        "social": "5.036%", 
        "referral": "3.670%"
    }, 
    "20_day": {
        "direct": "59.040%", 
        "organic": "22.591%", 
        "paid_search": "10.824%", 
        "email": "8.630%", 
        "social": "5.036%", 
        "referral": "3.670%"
    }, 
    "21_day": {
        "direct": "59.040%", 
        "organic": "22.591%", 
        "paid_search": "10.824%", 
        "email": "8.630%", 
        "social": "5.036%", 
        "referral": "3.670%"
    }, 
    "22_day": {
        "direct": "59.040%", 
        "organic": "22.591%", 
        "paid_search": "10.824%", 
        "email": "8.630%", 
        "social": "5.036%", 
        "referral": "3.670%"
    }, 
    "23_day": {
        "direct": "59.040%", 
        "organic": "22.591%", 
        "paid_search": "10.824%", 
        "email": "8.630%", 
        "social": "5.036%", 
        "referral": "3.670%"
    }, 
    "24_day": {
        "direct": "59.040%", 
        "organic": "22.591%", 
        "paid_search": "10.824%", 
        "email": "8.630%", 
        "social": "5.036%", 
        "referral": "3.670%"
    }, 
    "25_day": {
        "direct": "59.040%", 
        "organic": "22.591%", 
        "paid_search": "10.824%", 
        "email": "8.630%", 
        "social": "5.036%", 
        "referral": "3.670%"
    }, 
    "26_day": {
        "direct": "59.040%", 
        "organic": "22.591%", 
        "paid_search": "10.824%", 
        "email": "8.630%", 
        "social": "5.036%", 
        "referral": "3.670%"
    }, 
    "27_day": {
        "direct": "59.040%", 
        "organic": "22.591%", 
        "paid_search": "10.824%", 
        "email": "8.630%", 
        "social": "5.036%", 
        "referral": "3.670%"
    }, 
    "28_day": {
        "direct": "59.040%", 
        "organic": "22.591%", 
        "paid_search": "10.824%", 
        "email": "8.630%", 
        "social": "5.036%", 
        "referral": "3.670%"
    }, 
    "29_day": {
        "direct": "59.040%", 
        "organic": "22.591%", 
        "paid_search": "10.824%", 
        "email": "8.630%", 
        "social": "5.036%", 
        "referral": "3.670%"
    }, 
    "30_day": {
        "direct": "59.040%", 
        "organic": "22.591%", 
        "paid_search": "10.824%", 
        "email": "8.630%", 
        "social": "5.036%", 
        "referral": "3.670%"
    }
}

REVENUE_BY_REGION_EASYTRADE = {
    "1_day": {
        "eu": "39.457%", 
        "apac": "24.875%", 
        "mx": "14.699%", 
        "jp": "13.423%", 
        "fr": "10.409%", 
        "se": "6.920%"
    }, 
    "2_day": {
        "eu": "39.457%", 
        "apac": "24.875%", 
        "mx": "14.699%", 
        "jp": "13.423%", 
        "fr": "10.409%", 
        "se": "6.920%"
    }, 
    "3_day": {
        "eu": "39.457%", 
        "apac": "24.875%", 
        "mx": "14.699%", 
        "jp": "13.423%", 
        "fr": "10.409%", 
        "se": "6.920%"
    }, 
    "4_day": {
        "eu": "39.457%", 
        "apac": "24.875%", 
        "mx": "14.699%", 
        "jp": "13.423%", 
        "fr": "10.409%", 
        "se": "6.920%"
    }, 
    "5_day": {
        "eu": "39.457%", 
        "apac": "24.875%", 
        "mx": "14.699%", 
        "jp": "13.423%", 
        "fr": "10.409%", 
        "se": "6.920%"
    }, 
    "6_day": {
        "eu": "39.457%", 
        "apac": "24.875%", 
        "mx": "14.699%", 
        "jp": "13.423%", 
        "fr": "10.409%", 
        "se": "6.920%"
    }, 
    "7_day": {
        "eu": "39.457%", 
        "apac": "24.875%", 
        "mx": "14.699%", 
        "jp": "13.423%", 
        "fr": "10.409%", 
        "se": "6.920%"
    }, 
    "8_day": {
        "eu": "39.457%", 
        "apac": "24.875%", 
        "mx": "14.699%", 
        "jp": "13.423%", 
        "fr": "10.409%", 
        "se": "6.920%"
    }, 
    "9_day": {
        "eu": "39.457%", 
        "apac": "24.875%", 
        "mx": "14.699%", 
        "jp": "13.423%", 
        "fr": "10.409%", 
        "se": "6.920%"
    }, 
    "10_day": {
        "eu": "39.457%", 
        "apac": "24.875%", 
        "mx": "14.699%", 
        "jp": "13.423%", 
        "fr": "10.409%", 
        "se": "6.920%"
    }, 
    "11_day": {
        "eu": "39.457%", 
        "apac": "24.875%", 
        "mx": "14.699%", 
        "jp": "13.423%", 
        "fr": "10.409%", 
        "se": "6.920%"
    }, 
    "12_day": {
        "eu": "39.457%", 
        "apac": "24.875%", 
        "mx": "14.699%", 
        "jp": "13.423%", 
        "fr": "10.409%", 
        "se": "6.920%"
    }, 
    "13_day": {
        "eu": "39.457%", 
        "apac": "24.875%", 
        "mx": "14.699%", 
        "jp": "13.423%", 
        "fr": "10.409%", 
        "se": "6.920%"
    }, 
    "14_day": {
        "eu": "39.457%", 
        "apac": "24.875%", 
        "mx": "14.699%", 
        "jp": "13.423%", 
        "fr": "10.409%", 
        "se": "6.920%"
    }, 
    "15_day": {
        "eu": "39.457%", 
        "apac": "24.875%", 
        "mx": "14.699%", 
        "jp": "13.423%", 
        "fr": "10.409%", 
        "se": "6.920%"
    }, 
    "16_day": {
        "eu": "39.457%", 
        "apac": "24.875%", 
        "mx": "14.699%", 
        "jp": "13.423%", 
        "fr": "10.409%", 
        "se": "6.920%"
    }, 
    "17_day": {
        "eu": "39.457%", 
        "apac": "24.875%", 
        "mx": "14.699%", 
        "jp": "13.423%", 
        "fr": "10.409%", 
        "se": "6.920%"
    }, 
    "18_day": {
        "eu": "39.457%", 
        "apac": "24.875%", 
        "mx": "14.699%", 
        "jp": "13.423%", 
        "fr": "10.409%", 
        "se": "6.920%"
    }, 
    "19_day": {
        "eu": "39.457%", 
        "apac": "24.875%", 
        "mx": "14.699%", 
        "jp": "13.423%", 
        "fr": "10.409%", 
        "se": "6.920%"
    }, 
    "20_day": {
        "eu": "39.457%", 
        "apac": "24.875%", 
        "mx": "14.699%", 
        "jp": "13.423%", 
        "fr": "10.409%", 
        "se": "6.920%"
    }, 
    "21_day": {
        "eu": "39.457%", 
        "apac": "24.875%", 
        "mx": "14.699%", 
        "jp": "13.423%", 
        "fr": "10.409%", 
        "se": "6.920%"
    }, 
    "22_day": {
        "eu": "39.457%", 
        "apac": "24.875%", 
        "mx": "14.699%", 
        "jp": "13.423%", 
        "fr": "10.409%", 
        "se": "6.920%"
    }, 
    "23_day": {
        "eu": "39.457%", 
        "apac": "24.875%", 
        "mx": "14.699%", 
        "jp": "13.423%", 
        "fr": "10.409%", 
        "se": "6.920%"
    }, 
    "24_day": {
        "eu": "39.457%", 
        "apac": "24.875%", 
        "mx": "14.699%", 
        "jp": "13.423%", 
        "fr": "10.409%", 
        "se": "6.920%"
    }, 
    "25_day": {
        "eu": "39.457%", 
        "apac": "24.875%", 
        "mx": "14.699%", 
        "jp": "13.423%", 
        "fr": "10.409%", 
        "se": "6.920%"
    }, 
    "26_day": {
        "eu": "39.457%", 
        "apac": "24.875%", 
        "mx": "14.699%", 
        "jp": "13.423%", 
        "fr": "10.409%", 
        "se": "6.920%"
    }, 
    "27_day": {
        "eu": "39.457%", 
        "apac": "24.875%", 
        "mx": "14.699%", 
        "jp": "13.423%", 
        "fr": "10.409%", 
        "se": "6.920%"
    }, 
    "28_day": {
        "eu": "39.457%", 
        "apac": "24.875%", 
        "mx": "14.699%", 
        "jp": "13.423%", 
        "fr": "10.409%", 
        "se": "6.920%"
    }, 
    "29_day": {
        "eu": "39.457%", 
        "apac": "24.875%", 
        "mx": "14.699%", 
        "jp": "13.423%", 
        "fr": "10.409%", 
        "se": "6.920%"
    }, 
    "30_day": {
        "eu": "39.457%", 
        "apac": "24.875%", 
        "mx": "14.699%", 
        "jp": "13.423%", 
        "fr": "10.409%", 
        "se": "6.920%"
    }
}

KPIS_USD_EASYTRADE = OrderedDict([
    ('1_day', OrderedDict([
        ('grouping', 'week'),
        ("order_placed", [
            {'range': 'Week 1', 'total': 64867.70},
            {'range': 'Week 2', 'total': 78062.52},
            {'range': 'Week 3', 'total': 81771.83},
            {'range': 'Week 4', 'total': 77095.97},
            {'range': 'Week 5', 'total': 72612.50},
        ]),
    ])),
    ('2_day', OrderedDict([
        ('grouping', 'week'),
        ("order_placed", [
            {'range': 'Week 1', 'total': 64867.70},
            {'range': 'Week 2', 'total': 78062.52},
            {'range': 'Week 3', 'total': 81771.83},
            {'range': 'Week 4', 'total': 77095.97},
            {'range': 'Week 5', 'total': 72612.50},
        ]),
    ])),
    ('3_day', OrderedDict([
        ('grouping', 'week'),
        ("order_placed", [
            {'range': 'Week 1', 'total': 64867.70},
            {'range': 'Week 2', 'total': 78062.52},
            {'range': 'Week 3', 'total': 81771.83},
            {'range': 'Week 4', 'total': 77095.97},
            {'range': 'Week 5', 'total': 72612.50},
        ]),
    ])),
    ('4_day', OrderedDict([
        ('grouping', 'week'),
        ("order_placed", [
            {'range': 'Week 1', 'total': 64867.70},
            {'range': 'Week 2', 'total': 78062.52},
            {'range': 'Week 3', 'total': 81771.83},
            {'range': 'Week 4', 'total': 77095.97},
            {'range': 'Week 5', 'total': 72612.50},
        ]),
    ])),
    ('5_day', OrderedDict([
        ('grouping', 'week'),
        ("order_placed", [
            {'range': 'Week 1', 'total': 64867.70},
            {'range': 'Week 2', 'total': 78062.52},
            {'range': 'Week 3', 'total': 81771.83},
            {'range': 'Week 4', 'total': 77095.97},
            {'range': 'Week 5', 'total': 72612.50},
        ]),
    ])),
    ('6_day', OrderedDict([
        ('grouping', 'week'),
        ("order_placed", [
            {'range': 'Week 1', 'total': 78062.52},
            {'range': 'Week 2', 'total': 81771.83},
            {'range': 'Week 3', 'total': 77095.97},
            {'range': 'Week 4', 'total': 72612.50},
            {'range': 'Week 5', 'total': 73498.01},
        ]),
    ])),
    ('7_day', OrderedDict([
        ('grouping', 'week'),
        ("order_placed", [
            {'range': 'Week 1', 'total': 78062.52},
            {'range': 'Week 2', 'total': 81771.83},
            {'range': 'Week 3', 'total': 77095.97},
            {'range': 'Week 4', 'total': 72612.50},
            {'range': 'Week 5', 'total': 73498.01},
        ]),
    ])),
    ('8_day', OrderedDict([
        ('grouping', 'week'),
        ("order_placed", [
            {'range': 'Week 1', 'total': 78062.52},
            {'range': 'Week 2', 'total': 81771.83},
            {'range': 'Week 3', 'total': 77095.97},
            {'range': 'Week 4', 'total': 72612.50},
            {'range': 'Week 5', 'total': 73498.01},
        ]),
    ])),
    ('9_day', OrderedDict([
        ('grouping', 'week'),
        ("order_placed", [
            {'range': 'Week 1', 'total': 78062.52},
            {'range': 'Week 2', 'total': 81771.83},
            {'range': 'Week 3', 'total': 77095.97},
            {'range': 'Week 4', 'total': 72612.50},
            {'range': 'Week 5', 'total': 73498.01},
        ]),
    ])),
    ('10_day', OrderedDict([
        ('grouping', 'week'),
        ("order_placed", [
            {'range': 'Week 1', 'total': 78062.52},
            {'range': 'Week 2', 'total': 81771.83},
            {'range': 'Week 3', 'total': 77095.97},
            {'range': 'Week 4', 'total': 72612.50},
            {'range': 'Week 5', 'total': 73498.01},
        ]),
    ])),
    ('11_day', OrderedDict([
        ('grouping', 'week'),
        ("order_placed", [
            {'range': 'Week 1', 'total': 78062.52},
            {'range': 'Week 2', 'total': 81771.83},
            {'range': 'Week 3', 'total': 77095.97},
            {'range': 'Week 4', 'total': 72612.50},
            {'range': 'Week 5', 'total': 73498.01},
        ]),
    ])),
    ('12_day', OrderedDict([
        ('grouping', 'week'),
        ("order_placed", [
            {'range': 'Week 1', 'total': 78062.52},
            {'range': 'Week 2', 'total': 81771.83},
            {'range': 'Week 3', 'total': 77095.97},
            {'range': 'Week 4', 'total': 72612.50},
            {'range': 'Week 5', 'total': 73498.01},
        ]),
    ])),
    ('13_day', OrderedDict([
        ('grouping', 'week'),
        ("order_placed", [
            {'range': 'Week 1', 'total': 81771.83},
            {'range': 'Week 2', 'total': 77095.97},
            {'range': 'Week 3', 'total': 72612.50},
            {'range': 'Week 4', 'total': 73498.01},
            {'range': 'Week 5', 'total': 80157.67},
        ]),
    ])),
    ('14_day', OrderedDict([
        ('grouping', 'week'),
        ("order_placed", [
            {'range': 'Week 1', 'total': 81771.83},
            {'range': 'Week 2', 'total': 77095.97},
            {'range': 'Week 3', 'total': 72612.50},
            {'range': 'Week 4', 'total': 73498.01},
            {'range': 'Week 5', 'total': 80157.67},
        ]),
    ])),
    ('15_day', OrderedDict([
        ('grouping', 'week'),
        ("order_placed", [
            {'range': 'Week 1', 'total': 81771.83},
            {'range': 'Week 2', 'total': 77095.97},
            {'range': 'Week 3', 'total': 72612.50},
            {'range': 'Week 4', 'total': 73498.01},
            {'range': 'Week 5', 'total': 80157.67},
        ]),
    ])),
    ('16_day', OrderedDict([
        ('grouping', 'week'),
        ("order_placed", [
            {'range': 'Week 1', 'total': 81771.83},
            {'range': 'Week 2', 'total': 77095.97},
            {'range': 'Week 3', 'total': 72612.50},
            {'range': 'Week 4', 'total': 73498.01},
            {'range': 'Week 5', 'total': 80157.67},
        ]),
    ])),
    ('17_day', OrderedDict([
        ('grouping', 'week'),
        ("order_placed", [
            {'range': 'Week 1', 'total': 81771.83},
            {'range': 'Week 2', 'total': 77095.97},
            {'range': 'Week 3', 'total': 72612.50},
            {'range': 'Week 4', 'total': 73498.01},
            {'range': 'Week 5', 'total': 80157.67},
        ]),
    ])),
    ('18_day', OrderedDict([
        ('grouping', 'week'),
        ("order_placed", [
            {'range': 'Week 1', 'total': 81771.83},
            {'range': 'Week 2', 'total': 77095.97},
            {'range': 'Week 3', 'total': 72612.50},
            {'range': 'Week 4', 'total': 73498.01},
            {'range': 'Week 5', 'total': 80157.67},
        ]),
    ])),
    ('19_day', OrderedDict([
        ('grouping', 'week'),
        ("order_placed", [
            {'range': 'Week 1', 'total': 81771.83},
            {'range': 'Week 2', 'total': 77095.97},
            {'range': 'Week 3', 'total': 72612.50},
            {'range': 'Week 4', 'total': 73498.01},
            {'range': 'Week 5', 'total': 80157.67},
        ]),
    ])),
    ('20_day', OrderedDict([
        ('grouping', 'week'),
        ("order_placed", [
            {'range': 'Week 1', 'total': 77095.97},
            {'range': 'Week 2', 'total': 72612.50},
            {'range': 'Week 3', 'total': 73498.01},
            {'range': 'Week 4', 'total': 80157.67},
            {'range': 'Week 5', 'total': 80579.15},
        ]),
    ])),
    ('21_day', OrderedDict([
        ('grouping', 'week'),
        ("order_placed", [
            {'range': 'Week 1', 'total': 77095.97},
            {'range': 'Week 2', 'total': 72612.50},
            {'range': 'Week 3', 'total': 73498.01},
            {'range': 'Week 4', 'total': 80157.67},
            {'range': 'Week 5', 'total': 80579.15},
        ]),
    ])),
    ('22_day', OrderedDict([
        ('grouping', 'week'),
        ("order_placed", [
            {'range': 'Week 1', 'total': 77095.97},
            {'range': 'Week 2', 'total': 72612.50},
            {'range': 'Week 3', 'total': 73498.01},
            {'range': 'Week 4', 'total': 80157.67},
            {'range': 'Week 5', 'total': 80579.15},
        ]),
    ])),
    ('23_day', OrderedDict([
        ('grouping', 'week'),
        ("order_placed", [
            {'range': 'Week 1', 'total': 77095.97},
            {'range': 'Week 2', 'total': 72612.50},
            {'range': 'Week 3', 'total': 73498.01},
            {'range': 'Week 4', 'total': 80157.67},
            {'range': 'Week 5', 'total': 80579.15},
        ]),
    ])),
    ('24_day', OrderedDict([
        ('grouping', 'week'),
        ("order_placed", [
            {'range': 'Week 1', 'total': 77095.97},
            {'range': 'Week 2', 'total': 72612.50},
            {'range': 'Week 3', 'total': 73498.01},
            {'range': 'Week 4', 'total': 80157.67},
            {'range': 'Week 5', 'total': 80579.15},
        ]),
    ])),
    ('25_day', OrderedDict([
        ('grouping', 'week'),
        ("order_placed", [
            {'range': 'Week 1', 'total': 77095.97},
            {'range': 'Week 2', 'total': 72612.50},
            {'range': 'Week 3', 'total': 73498.01},
            {'range': 'Week 4', 'total': 80157.67},
            {'range': 'Week 5', 'total': 80579.15},
        ]),
    ])),
    ('26_day', OrderedDict([
        ('grouping', 'week'),
        ("order_placed", [
            {'range': 'Week 1', 'total': 77095.97},
            {'range': 'Week 2', 'total': 72612.50},
            {'range': 'Week 3', 'total': 73498.01},
            {'range': 'Week 4', 'total': 80157.67},
            {'range': 'Week 5', 'total': 80579.15},
        ]),
    ])),
    ('27_day', OrderedDict([
        ('grouping', 'week'),
        ("order_placed", [
            {'range': 'Week 1', 'total': 72612.50},
            {'range': 'Week 2', 'total': 73498.01},
            {'range': 'Week 3', 'total': 80157.67},
            {'range': 'Week 4', 'total': 80579.15},
            {'range': 'Week 5', 'total': 78505.98},
        ]),
    ])),
    ('28_day', OrderedDict([
        ('grouping', 'week'),
        ("order_placed", [
            {'range': 'Week 1', 'total': 72612.50},
            {'range': 'Week 2', 'total': 73498.01},
            {'range': 'Week 3', 'total': 80157.67},
            {'range': 'Week 4', 'total': 80579.15},
            {'range': 'Week 5', 'total': 78505.98},
        ]),
    ])),
    ('29_day', OrderedDict([
        ('grouping', 'week'),
        ("order_placed", [
            {'range': 'Week 1', 'total': 72612.50},
            {'range': 'Week 2', 'total': 73498.01},
            {'range': 'Week 3', 'total': 80157.67},
            {'range': 'Week 4', 'total': 80579.15},
            {'range': 'Week 5', 'total': 78505.98},
        ]),
    ])),
])



