import json
import logging
import os
import paramiko
import requests
import shutil
import tarfile
import time
import zipfile

from collections import OrderedDict
from itertools import chain

from django.contrib.contenttypes.models import ContentType
from django.core.mail import EmailMessage
from rest.core.exceptions import BadRequestError

from requests.auth import HTTPBasicAuth
from app.inventory.models import (
    DeviceConfigurationData,
    Firewall,
    LoadBalancer,
    NetworkDevicesGroup,
    Switch,
    SensorAirflowHistory,
    SensorHumidityHistory,
    SensorTemperatureHistory,
    SmartPDUCurrentHistory,
    SmartPDUPowerHistory,
    SmartPDUVoltageHistory,
    SwitchModel,
    FirewallModel,
    LoadBalancerModel
)
from app.organization.models import Organization
from cloud.vmware.models import VMwareVcenter
from integ.monitoring.utils import QuerySetChain, DevicesQuerysets, get_model_obj
from integ.veeam.models import Veeam
from app.common.utils import Device
from app.user2.models import User
from django.urls import reverse
from agent.models import AgentConfig
from django.utils import timezone
from django.contrib.sites.models import Site
from django.conf import settings
from datetime import datetime
from django.utils.dateparse import parse_date

logger = logging.getLogger(__name__)


NETWORK_DEVICES_DEFAULT_FILE_TYPE_MAP = OrderedDict([
    ("cisco_ios", "cfg"),
    ("cisco_ftd", "encrypted package"),
    ("cisco_nxos", "cfg"),
    ("f5_ltm", "ucs"),
    ("fortinet", "conf"),
    ("paloalto_panos", "tgz")
])


NETWORK_DEVICE_CONFIG_TYPE_MAP = OrderedDict([
    ("cisco_ios", "Cisco IOS"),
    ("cisco_ftd", "Cisco Firepower"),
    ("cisco_nxos", "Cisco Nexus"),
    ("f5_ltm", "F5"),
    ("fortinet", "Fortinet"),
    ("paloalto_panos", "Palo Alto")
])


NETWORK_DEVICE_DEFAULT_CREDENTIAL_TYPE_MAP = OrderedDict([
    ("cisco_ios", ["SSH"]),
    ("cisco_ftd", ["API User"]),
    ("cisco_nxos", ["SSH"]),
    ("f5_ltm", ["SSH"]),
    ("fortinet", ["API Token", "API User"]),
    ("paloalto_panos", ["SSH"])
])


SWITCH_MODEL_LIFECYCLE_DATES = {
    "CISCO": {
        "ASR1002-HX": {
            "end_of_life": "2024-09-30",
            "end_of_support": "2030-03-31",
            "end_of_extended_support": "2026-03-31",
            "end_of_security_support": "2028-09-30",
        },
        "NEXUS 9336C-FX2": {
            "end_of_life": None,
            "end_of_support": None,
            "end_of_extended_support": None,
            "end_of_security_support": None,
        },
        "Nexus 93108TC-FX": {
            "end_of_life": "2023-08-01",
            "end_of_support": "2029-07-31",
            "end_of_extended_support": "2029-07-31",
            "end_of_security_support": "2029-07-31",
        },
        "NEXUS 93180YC-FX3": {
            "end_of_life": "2029-07-31",
            "end_of_support": None,
            "end_of_extended_support": None,
            "end_of_security_support": None,
        },
    }
}

FIREWALL_MODEL_LIFECYCLE_DATES = {
    "Juniper": {
        "SSG-140": {
            "end_of_life": "2018-04-30", 
            "end_of_support": "2022-12-31", 
            "end_of_extended_support": None, 
            "end_of_security_support": None
        },
        "SRX240H2": {
            "end_of_life": "2018-05-30", 
            "end_of_support": "2023-11-30", 
            "end_of_extended_support": None, 
            "end_of_security_support": None
        },
        "SRX1400": {
            "end_of_life": "2017-06-01", 
            "end_of_support": "2022-12-01", 
            "end_of_extended_support": None, 
            "end_of_security_support": None
        },
        "SRX340": {
            "end_of_life": "2024-04-15", 
            "end_of_support": None, 
            "end_of_extended_support": None, 
            "end_of_security_support": None
        },
        "SRX650": {
            "end_of_life": "2015-11-01", 
            "end_of_support": "2021-05-01", 
            "end_of_extended_support": None, 
            "end_of_security_support": None
        },
        "SRX550m": {
            "end_of_life": "2022-09-15", 
            "end_of_support": "2024-11-30", 
            "end_of_extended_support": None, 
            "end_of_security_support": None
        },
        "srx550m": {
            "end_of_life": "2022-09-15", 
            "end_of_support": "2024-11-30", 
            "end_of_extended_support": None, 
            "end_of_security_support": None
        },
        "SRX220H-POE": {
            "end_of_life": "2013-12-10", 
            "end_of_support": "2019-05-10", 
            "end_of_extended_support": None, 
            "end_of_security_support": None
        },
        "SFX220H": {
            "end_of_life": None,
            "end_of_support": None,
            "end_of_extended_support": None,
            "end_of_security_support": None
        },
        "SRX100H": {
            "end_of_life": "2013-12-10",
            "end_of_support": "2019-05-10", 
            "end_of_extended_support": None, 
            "end_of_security_support": None
        },
        "SRX345": {
            "end_of_life": "2021-10-06",
            "end_of_support": None, 
            "end_of_extended_support": None, 
            "end_of_security_support": None
        },
        "SRX220": {
            "end_of_life": "2018-11-30",
            "end_of_support": "2024-11-30", 
            "end_of_extended_support": None, 
            "end_of_security_support": None
        },
        "SRX240": {
            "end_of_life": "2015-11-01", 
            "end_of_support": "2021-05-01", 
            "end_of_extended_support": None, 
            "end_of_security_support": None
        },
        "SRX550": {
            "end_of_life": "2018-05-30", 
            "end_of_support": "2024-11-30", 
            "end_of_extended_support": None, 
            "end_of_security_support": None
        },
        "SRX320": {
            "end_of_life": "2021-07-15", 
            "end_of_support": None, 
            "end_of_extended_support": None, 
            "end_of_security_support": None
        },
        "SRX240H": {
            "end_of_life": "2015-11-01", 
            "end_of_support": "2021-05-01", 
            "end_of_extended_support": None, 
            "end_of_security_support": None
        },
        "SRX210": {
            "end_of_life": "2015-11-01",
            "end_of_support": None,
            "end_of_extended_support": None,
            "end_of_security_support": None
        },
        "SRX220H": {
            "end_of_life": "2013-09-30",
            "end_of_support": "2019-05-10",
            "end_of_extended_support": None,
            "end_of_security_support": None
        },
    },
    "Junper": {
        "SRX320": {
            "end_of_life": "2021-07-15", 
            "end_of_support": None, 
            "end_of_extended_support": None, 
            "end_of_security_support": None
        }
    },
    "Cisco": {
        "Cisco Meraki MX-100": {
            "end_of_life": "2022-02-01", 
            "end_of_support": "2027-02-01", 
            "end_of_extended_support": None, 
            "end_of_security_support": None
        },
        "Catalyst 3750-48PS-S": {
            "end_of_life": "2023-03-07", 
            "end_of_support": "2025-09-30", 
            "end_of_extended_support": None, 
            "end_of_security_support": None
        },
        "ASA5506-X": {
            "end_of_life": "2021-02-01", 
            "end_of_support": "2026-08-31", 
            "end_of_extended_support": None, 
            "end_of_security_support": None
        },
        "ASA5506-K9": {
            "end_of_life": "2021-02-01", 
            "end_of_support": "2026-08-31", 
            "end_of_extended_support": None, 
            "end_of_security_support": None
        },
        "ASA5525-X": {
            "end_of_life": "2022-09-02", 
            "end_of_support": "2025-09-30", 
            "end_of_extended_support": None, 
            "end_of_security_support": None
        },
        "ASA5505": {
            "end_of_life": "2017-02-24", 
            "end_of_support": "2022-08-31", 
            "end_of_extended_support": None, 
            "end_of_security_support": None
        },
        "ASA5585-X 10": {
            "end_of_life": "2017-12-01", 
            "end_of_support": "2023-05-31", 
            "end_of_extended_support": None, 
            "end_of_security_support": None
        },
        "Firepower 2140": {
            "end_of_life": "2024-11-26", 
            "end_of_support": "2030-05-31", 
            "end_of_extended_support": None, 
            "end_of_security_support": "2030-05-31"
        },
        "Firepower 2130": {
            "end_of_life": "2024-11-26", 
            "end_of_support": "2030-05-31", 
            "end_of_extended_support": None, 
            "end_of_security_support": "2030-05-31"
        },
        "Firepower 2120": {
            "end_of_life": "2024-11-26", 
            "end_of_support": "2030-05-31", 
            "end_of_extended_support": None, 
            "end_of_security_support": "2030-05-31"
        },
    },
    "cisco Systems Inc.": {
        "ASA 5585-X 10": {
            "end_of_life": "2017-12-01", 
            "end_of_support": "2023-05-31", 
            "end_of_extended_support": None, 
            "end_of_security_support": None
        }
    },
    "CISCO": {
        "Cisco Meraki MX-100": {
            "end_of_life": "2022-02-01", 
            "end_of_support": "2027-02-01", 
            "end_of_extended_support": None, 
            "end_of_security_support": None
        },
        "CATALYST 3750-48PS-S": {
            "end_of_life": "2023-03-07", 
            "end_of_support": "2025-09-30", 
            "end_of_extended_support": None, 
            "end_of_security_support": None
        },
        "ASA5506-x": {
            "end_of_life": "2021-02-01", 
            "end_of_support": "2026-08-31", 
            "end_of_extended_support": None, 
            "end_of_security_support": None
        },
        "ASA5525X": {
            "end_of_life": "2022-09-02", 
            "end_of_support": "2025-09-30", 
            "end_of_extended_support": None, 
            "end_of_security_support": None
        },
        "ASA5505": {
            "end_of_life": "2017-02-24", 
            "end_of_support": "2022-08-31", 
            "end_of_extended_support": None, 
            "end_of_security_support": None
        },
        "ASA 5506-K9": {
            "end_of_life": "2021-02-01", 
            "end_of_support": "2026-08-31", 
            "end_of_extended_support": None, 
            "end_of_security_support": None
        },
        "Firepower 2140": {
            "end_of_life": "2024-11-26", 
            "end_of_support": "2030-05-31", 
            "end_of_extended_support": None, 
            "end_of_security_support": "2030-05-31"
        },
        "Firepower 2130": {
            "end_of_life": "2024-11-26", 
            "end_of_support": "2030-05-31", 
            "end_of_extended_support": None, 
            "end_of_security_support": "2030-05-31"
        },
        "Firepower 2120": {
            "end_of_life": "2024-11-26", 
            "end_of_support": "2030-05-31", 
            "end_of_extended_support": None, 
            "end_of_security_support": "2030-05-31"
        }
    },
    "Fortinet": {
        "FortiGate 50E": {
            "end_of_life": None, 
            "end_of_support": "2026-11-14", 
            "end_of_extended_support": None, 
            "end_of_security_support": None
        },
        "FortiGate 60E": {
            "end_of_life": None, 
            "end_of_support": "2026-07-15", 
            "end_of_extended_support": None, 
            "end_of_security_support": None
        },
        "FortiGate 100E": {
            "end_of_life": None, 
            "end_of_support": "2026-08-17", 
            "end_of_extended_support": None, 
            "end_of_security_support": None
        },
        "Fortigate 400F": {
            "end_of_life": None, 
            "end_of_support": None,
            "end_of_extended_support": None, 
            "end_of_security_support": None
        },
        "Fortiproxy 400G": {
            "end_of_life": None, 
            "end_of_support": None,
            "end_of_extended_support": None, 
            "end_of_security_support": None
        },
        "FPX400G": {
            "end_of_life": None, 
            "end_of_support": None,
            "end_of_extended_support": None, 
            "end_of_security_support": None
        },
        "FPX_400G": {
            "end_of_life": None, 
            "end_of_support": None,
            "end_of_extended_support": None, 
            "end_of_security_support": None
        },
        "FGT_400F": {
            "end_of_life": None, 
            "end_of_support": None,
            "end_of_extended_support": None, 
            "end_of_security_support": None
        },
    },
    "Palo Alto": {
        "PA-850": {
            "end_of_life": "2024-08-31", 
            "end_of_support": "2029-08-31", 
            "end_of_extended_support": None, 
            "end_of_security_support": None
        },
        "PA-820": {
            "end_of_life": "2024-08-31", 
            "end_of_support": "2029-08-31", 
            "end_of_extended_support": None, 
            "end_of_security_support": None
        },
        "PA-3050": {
            "end_of_life": "2019-10-31", 
            "end_of_support": "2024-10-31", 
            "end_of_extended_support": None, 
            "end_of_security_support": None
        },
        "PaloAlto PA-3050": {
            "end_of_life": "2019-10-31", 
            "end_of_support": "2024-10-31", 
            "end_of_extended_support": None, 
            "end_of_security_support": None
        },
        "PA-2020": {
            "end_of_life": "2015-04-30", 
            "end_of_support": "2020-04-30", 
            "end_of_extended_support": None, 
            "end_of_security_support": None
        },
        "PA-3020": {
            "end_of_life": "2019-10-31", 
            "end_of_support": "2024-10-31", 
            "end_of_extended_support": None, 
            "end_of_security_support": None
        },
        "PA-3250": {
            "end_of_life": "2023-08-31", 
            "end_of_support": "2028-08-31", 
            "end_of_extended_support": None, 
            "end_of_security_support": None
        },
        "PA-3260": {
            "end_of_life": "2023-08-31", 
            "end_of_support": "2028-08-31", 
            "end_of_extended_support": None, 
            "end_of_security_support": None
        }, 
        "PA-3410": {
            "end_of_life": "2019-10-31", 
            "end_of_support": "2024-10-31", 
            "end_of_extended_support": None, 
            "end_of_security_support": None
        },
        "PA3410": {
            "end_of_life": "2019-10-31", 
            "end_of_support": "2024-10-31", 
            "end_of_extended_support": None, 
            "end_of_security_support": None
        },
        "PA-220": {
            "end_of_life": "2023-01-31",
            "end_of_support": "2028-01-31",
            "end_of_extended_support": None,
            "end_of_security_support": None
        },
        "PA-800": {
            "end_of_life": "2024-08-31",
            "end_of_support": "2029-08-31",
            "end_of_extended_support": None,
            "end_of_security_support": None
        },
        "PA-5050": {
            "end_of_life": "2019-01-31",
            "end_of_support": "2024-01-31",
            "end_of_extended_support": None,
            "end_of_security_support": None
        },
    },
    "Paloalto": {
        "PA-850": {
            "end_of_life": "2024-08-31", 
            "end_of_support": "2029-08-31", 
            "end_of_extended_support": None, 
            "end_of_security_support": None
        },
        "PA-820": {
            "end_of_life": "2024-08-31", 
            "end_of_support": "2029-08-31", 
            "end_of_extended_support": None, 
            "end_of_security_support": None
        },
        "PA-2020": {
            "end_of_life": "2015-04-30", 
            "end_of_support": "2020-04-30", 
            "end_of_extended_support": None, 
            "end_of_security_support": None
        },
        "PA-3020": {
            "end_of_life": "2019-10-31", 
            "end_of_support": "2024-10-31", 
            "end_of_extended_support": None, 
            "end_of_security_support": None
        },
        "PA-3260": {
            "end_of_life": "2023-08-31", 
            "end_of_support": "2028-08-31", 
            "end_of_extended_support": None, 
            "end_of_security_support": None
        }
    },
    "Palo Alto Networks": {
        "PA-3410": {
            "end_of_life": "2019-10-31", 
            "end_of_support": "2024-10-31", 
            "end_of_extended_support": None, 
            "end_of_security_support": None
        }
    },
    "Netgear": {
        "ProSafe SRX5308": {
            "end_of_life": None, 
            "end_of_support": None, 
            "end_of_extended_support": None, 
            "end_of_security_support": None
        },
        "Prosafe SRX5308": {
            "end_of_life": None, 
            "end_of_support": None, 
            "end_of_extended_support": None, 
            "end_of_security_support": None
        }
    },
    "VMware, Inc.": {
        "VMware Virtual Platform": {
            "end_of_life": None,
            "end_of_support": None,
            "end_of_extended_support": None,
            "end_of_security_support": None
        }
    },
    "Dell": {
        "NSA 2600": {
            "end_of_life": "2019-03-07",
            "end_of_support": "2024-03-08",
            "end_of_extended_support": None,
            "end_of_security_support": None
        },
        "NSA 3600": {
            "end_of_life": "2021-03-02",
            "end_of_support": "2026-03-03",
            "end_of_extended_support": None,
            "end_of_security_support": None
        },
        "NSA 4600": {
            "end_of_life": "2021-03-02",
            "end_of_support": "2026-03-03",
            "end_of_extended_support": None,
            "end_of_security_support": None
        },
        "NSA 5600": {
            "end_of_life": "2021-03-02",
            "end_of_support": "2026-03-03",
            "end_of_extended_support": None,
            "end_of_security_support": None
        },
        "NSA 6600": {
            "end_of_life": "2021-05-02",
            "end_of_support": "2026-05-03",
            "end_of_extended_support": None,
            "end_of_security_support": None
        },
        "TZ300": {
            "end_of_life": None,
            "end_of_support": None,
            "end_of_extended_support": None,
            "end_of_security_support": None
        },
        "TZ400": {
            "end_of_life": "2022-04-15",
            "end_of_support": "2026-04-16",
            "end_of_extended_support": None,
            "end_of_security_support": None
        },
        "TZ500": {
            "end_of_life": "2022-04-04",
            "end_of_support": "2026-10-01",
            "end_of_extended_support": None,
            "end_of_security_support": None
        },
        "TZ600": {
            "end_of_life": "2022-04-04",
            "end_of_support": "2026-08-08",
            "end_of_extended_support": None,
            "end_of_security_support": None
        }
    },
    "Microsoft": {
        "NT SERVER": {
            "end_of_life": None,
            "end_of_support": None,
            "end_of_extended_support": None,
            "end_of_security_support": None
        }
    },
    "MICROSOFT": {
        "NT SERVER": {
            "end_of_life": None,
            "end_of_support": None,
            "end_of_extended_support": None,
            "end_of_security_support": None
        }
    },
    "Brocade": {
        "Foundry ServerIron-4G": {
            "end_of_life": "2010-01-19",
            "end_of_support": "2015-08-19",
            "end_of_extended_support": None,
            "end_of_security_support": None
        }
    },
    "Supermicro": {
        "X9SCL/X9SCM": {
            "end_of_life": None,
            "end_of_support": None,
            "end_of_extended_support": None,
            "end_of_security_support": None
        }
    },
    "Emerson Network Power": {
        "Avocent Console 1": {
            "end_of_life": "2023-07-31",
            "end_of_support": None,
            "end_of_extended_support": None,
            "end_of_security_support": None
        }
    },
    "Avocent Corporation": {
        "CYCLADES ACS 6048": {
            "end_of_life": "2023-07-31",
            "end_of_support": None,
            "end_of_extended_support": None,
            "end_of_security_support": None
        }
    },
    "AVOCENT CORPORATION": {
        "CYCLADES ACS 6048": {
            "end_of_life": "2023-07-31",
            "end_of_support": None,
            "end_of_extended_support": None,
            "end_of_security_support": None
        }
    }
}

LOADBALANCER_MODEL_LIFECYCLE_DATES = {
    "Brocade": {
        "ServerIron 4G": {
            "end_of_life": "2010-01-19",
            "end_of_support": "2015-08-19",
            "end_of_extended_support": None,
            "end_of_security_support": None,
        },
        "Foundry ServerIron 4G": {
            "end_of_life": "2010-01-19",
            "end_of_support": "2015-08-19",
            "end_of_extended_support": None,
            "end_of_security_support": None,
        },
        "serveriron4g": {
            "end_of_life": "2010-01-19",
            "end_of_support": "2015-08-19",
            "end_of_extended_support": None,
            "end_of_security_support": None,
        },
        "serveriron 4g": {
            "end_of_life": "2010-01-19",
            "end_of_support": "2015-08-19",
            "end_of_extended_support": None,
            "end_of_security_support": None,
        },
    },
    "Foundry": {
        "ServerIron ADX 1000": {
            "end_of_life": "2022-02-28",
            "end_of_support": "2022-02-28",
            "end_of_extended_support": None,
            "end_of_security_support": None,
        },
        "Brocade Serverlron ADX 1000": {
            "end_of_life": "2022-02-28",
            "end_of_support": "2022-02-28",
            "end_of_extended_support": None,
            "end_of_security_support": None,
        },
        "ServerIron ADX 4000": {
            "end_of_life": "2021-07-06",
            "end_of_support": "2021-07-06",
            "end_of_extended_support": None,
            "end_of_security_support": None,
        },
        "Brocade Serverlron ADX 4000": {
            "end_of_life": "2021-07-06",
            "end_of_support": "2021-07-06",
            "end_of_extended_support": None,
            "end_of_security_support": None,
        },
        "ServerIron ADX 10000": {
            "end_of_life": "2021-07-06",
            "end_of_support": "2021-07-06",
            "end_of_extended_support": None,
            "end_of_security_support": None,
        },
        "Brocade Serverlron ADX 10000": {
            "end_of_life": "2021-07-06",
            "end_of_support": "2021-07-06",
            "end_of_extended_support": None,
            "end_of_security_support": None,
        },
    },
    "Citrix": {
        "NetScaler VPX": {
            "end_of_life": "2023-03-05",
            "end_of_support": "2023-05-30",
            "end_of_extended_support": None,
            "end_of_security_support": None,
        },
        "Netscaler VPX": {
            "end_of_life": "2023-03-05",
            "end_of_support": "2023-05-30",
            "end_of_extended_support": None,
            "end_of_security_support": None,
        },
    },
    "Juniper": {
        "SRX240H2": {
            "end_of_life": "2017-12-31",
            "end_of_support": "2022-12-31",
            "end_of_extended_support": None,
            "end_of_security_support": None,
        },
    },
    "F5 Networks": {
        "i2600": {
            "end_of_life": "2024-01-01",
            "end_of_support": "2031-01-01",
            "end_of_extended_support": None,
            "end_of_security_support": None,
        },
        "i2800": {
            "end_of_life": None,
            "end_of_support": "2031-01-01",
            "end_of_extended_support": None,
            "end_of_security_support": None,
        },
        "i4600": {
            "end_of_life": "2024-01-01",
            "end_of_support": "2031-01-01",
            "end_of_extended_support": None,
            "end_of_security_support": None,
        },
        "i4800": {
            "end_of_sale": "2024-01-01",
            "end_of_life": "2031-01-01",
            "end_of_extended_support": None,
            "end_of_security_support": None,
        },
        "i5600": {
            "end_of_life": "2024-01-01",
            "end_of_support": "2031-01-01",
            "end_of_extended_support": None,
            "end_of_security_support": None,
        },
        "i15600/i15600-N": {
            "end_of_life": "2024-01-01",
            "end_of_support": "2031-01-01",
            "end_of_extended_support": None,
            "end_of_security_support": None,
        },
        "i5800": {
            "end_of_life": "2024-01-01",
            "end_of_support": "2031-01-01",
            "end_of_extended_support": None,
            "end_of_security_support": None,
        },
        "i15800/i15800-N": {
            "end_of_life": "2024-01-01",
            "end_of_support": "2031-01-01",
            "end_of_extended_support": None,
            "end_of_security_support": None,
        },
        "i7600": {
            "end_of_life": "2031-01-01",
            "end_of_support": "2031-01-01",
            "end_of_extended_support": None,
            "end_of_security_support": None,
        },
        "i7800": {
            "end_of_life": "2024-01-01",
            "end_of_support": "2031-01-01",
            "end_of_extended_support": None,
            "end_of_security_support": None,
        },
        "i10600": {
            "end_of_life": "2031-01-01",
            "end_of_support": "2031-01-01",
            "end_of_extended_support": None,
            "end_of_security_support": None,
        },
        "i10800": {
            "end_of_life": "2021-07-31",
            "end_of_support": "2021-07-31",
            "end_of_extended_support": None,
            "end_of_security_support": None,
        },
        "i11600": {
            "end_of_life": "2031-01-01",
            "end_of_support": "2031-01-01",
            "end_of_extended_support": None,
            "end_of_security_support": None,
        },
        "i11800": {
            "end_of_life": "2031-01-01",
            "end_of_support": "2031-01-01",
            "end_of_extended_support": None,
            "end_of_security_support": None,
        },
        "i11400-DS": {
            "end_of_life": "2024-10-01",
            "end_of_support": "2031-10-01",
            "end_of_extended_support": None,
            "end_of_security_support": None,
        },
        "i11600-DS": {
            "end_of_life": "2031-10-01",
            "end_of_support": "2031-10-01",
            "end_of_extended_support": None,
            "end_of_security_support": None,
        },
        "11600-DS": {
            "end_of_life": "2031-10-01",
            "end_of_support": "2031-10-01",
            "end_of_extended_support": None,
            "end_of_security_support": None,
        },
        "i11800-DS": {
            "end_of_life": "2031-10-01",
            "end_of_support": "2031-10-01",
            "end_of_extended_support": None,
            "end_of_security_support": None,
        },
        "i5820-DF": {
            "end_of_life": "2026-01-01",
            "end_of_support": "2029-01-01",
            "end_of_extended_support": None,
            "end_of_security_support": None,
        },
        "10350v/10350v-N/10350v-F": {
            "end_of_life": "2024-04-01",
            "end_of_support": "2031-04-01",
            "end_of_extended_support": None,
            "end_of_security_support": None,
        },
        "F5-BIG-LTM-2000S": {
            "end_of_life": "2018-04-01",
            "end_of_support": "2025-04-01",
            "end_of_extended_support": None,
            "end_of_security_support": None,
        },
    },
    "BIG-IP": {
        "BIG-IP i2600": {
            "end_of_life": "2031-01-01",
            "end_of_support": "2024-01-01",
            "end_of_extended_support": None,
            "end_of_security_support": None,
        },
    },
    "CISCO": {
        "CATALYST 3750-48PS-S": {
            "end_of_life": "2023-03-07",
            "end_of_support": "2025-09-30",
            "end_of_extended_support": None,
            "end_of_security_support": None,
        },
    },
    "Supermicro": {
        "X9SCL/X9SCM": {
            "end_of_life": None,
            "end_of_support": None,
            "end_of_extended_support": None,
            "end_of_security_support": None,
        },
    },
    "F5 LABS, INC.": {
        "BIG-IP I4600": {
            "end_of_life": "2031-01-01",
            "end_of_support": "2027-10-01",
            "end_of_extended_support": None,
            "end_of_security_support": None,
        },
    },
}


SOFTWARE_SERVER_LIFECYCLE_DATES = {
    "BFE": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "BrokerInfrastructure": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "COMSysApp": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "CSFalconService": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "CertPropSvc": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "CoreMessagingRegistrar": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "CryptSvc": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "DFSR": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "DHCPServer": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "DPS": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "DcomLaunch": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "Dfs": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "Dhcp": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "DiagTrack": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "Dnscache": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "DsSvc": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "EFS": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "EventLog": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "EventSystem": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "FontCache": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "IKEEXT": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "KeyIso": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "LSM": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "LanmanServer": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "LanmanWorkstation": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "MDCoreSvc": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "MSDTC": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "MSMQ": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "MSSQL$TESTINSTANZNAME": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "MSSQLSERVER": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "ManageEngine UEMS - Agent": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "ManageEngine Unified Endpoint Security - Agent": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},

    "MpsSvc": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "NcbService": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "Netlogon": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "Netman": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "NfsClnt": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "NlaSvc": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "PatrolAgent": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "PcaSvc": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "PlugPlay": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "PolicyAgent": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "Power": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "ProfSvc": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "RpcEptMapper": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "RpcSs": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "SENS": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "SQLBrowser": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "SQLSERVERAGENT": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "SQLTELEMETRY": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "SQLTELEMETRY$TESTINSTANZNAME": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "SQLWriter": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "SSDPSRV": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "SamSs": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "Schedule": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "SessionEnv": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "ShellHWDetection": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "SplunkForwarder": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "Spooler": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "StateRepository": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "Tenable Nessus Agent": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "TermService": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "Themes": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "TimeBrokerSvc": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "TrkWks": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "TrustedInstaller": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "UALSVC": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "UmRdpService": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "UserManager": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "VGAuthService": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "VM3DService": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "VMTools": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "W32Time": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "WSearch": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "Wcmsvc": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "WdNisSvc": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "WinDefend": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "WinHttpAutoProxySvc": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "WinRM": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "Winmgmt": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "WpnService": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "containerd": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "corosync": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "cups": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "docker": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "ersupext": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "esiCore": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "falcon-sensor": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "fwupd": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "gpsvc": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "iphlpsvc": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "k3s": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "libvirtd": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "lmhosts": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "nessusagent": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "netprofm": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "nsi": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},

    "postgresql": {"end_of_life": "2017-11-09", "end_of_support": "2017-11-09", "end_of_extended_support": None, "end_of_security_support": None},
    "postfix": {"end_of_life": "2017-02-28", "end_of_support": "2017-02-28", "end_of_extended_support": None, "end_of_security_support": None},
    "veeamdeployment": {"end_of_life": None, "end_of_support": "2027-02-01", "end_of_extended_support": None, "end_of_security_support": None},
    "veeamtransport": {"end_of_life": None, "end_of_support": "2027-02-01", "end_of_extended_support": None, "end_of_security_support": None},
    "opsramp-agent": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "opsramp-shield": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "pacemaker": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "smphost": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "snmptrapfmt": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "ssh": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "sshd": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "telegraf": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "tiledatamodelsvc": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "udisks2": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "vds": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "venv-salt-minion": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "vmtoolsd": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "wmiApSrv": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "wudfsvc": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "xrdp": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None},
    "xrdp-sesman": {"end_of_life": None, "end_of_support": None, "end_of_extended_support": None, "end_of_security_support": None}
}


class CacheDevicesStatusQuerySetChain(QuerySetChain):
    """
    This class inherits from QuerySetChain which chains
    multiple subquerysets of different models.
    """

    def __init__(self, *subquerysets):
        self.querysets = subquerysets
        self._count = None


class CacheDevicesStatusQuerySet(DevicesQuerysets, object):
    """
    This class inherits from DevicesQuerysets and creates
    a queryset of all the devices

    Method 'get_queryset_chain' returns a chain
    of all the querysets to the calling object.
    """
    def __init__(self, request_user):
        super(CacheDevicesStatusQuerySet, self).__init__(request_user)
        self._devices = [
            self._switches,
            self._firewalls,
            self._load_balancers,
            self._server,
            self._bm_server,
            self._storage,
            self._pdu,
            self._vmware,
            self._esxi,
            self._vcloud,
            self._hyperv,
            self._open_stack,
            self._mac,
            self._custom_vm,
            self._database_servers,
            self._dockers,
            self._azure_resources,
            self._smart_pdus,
            self._sensors,
            self._rfid_readers
        ]

    @property
    def get_queryset_chain(self):
        self._combined_queryset = CacheDevicesStatusQuerySetChain(*self.devices_array)
        return self._combined_queryset

    @property
    def devices_array(self):
        return self._devices


def get_app_endpoint(feature=None):
    domain = Site.objects.get_current().domain
    if 'http' not in domain:
        domain = 'https://' + domain
    if domain[-1] != '/':
        domain += '/'
    subdomain = 'rest' + reverse('unity_discovery:device_status')
    if feature:
        if feature == 'discovery':
            subdomain = 'discovery'
    # endpoint = urljoin(domain, subdomain)
    return domain, subdomain


def post_device_details_to_collector(devices_qs, request_user=None, list_device_type=None):
    data = {'common_collector': {'device_details': {}}}
    data['common_collector']['user_id'] = str(request_user.id) if request_user else None
    domain, subdomain = get_app_endpoint()
    for device_obj in devices_qs:
        mgmt_ip = getattr(device_obj, 'management_ip', None)
        ip = getattr(device_obj, 'ip_address', None)
        if mgmt_ip or ip:
            mgmt_ip = mgmt_ip if mgmt_ip else ip
            d_id = device_obj.id
            d_type = device_obj.__class__.__name__
            key = d_type + '-' + str(d_id)
            if hasattr(device_obj, 'collector') and device_obj.collector:
                if str(device_obj.collector.id) not in data:
                    data[str(device_obj.collector.id)] = {'device_details': {}}
                device_data = {key: {"id": str(d_id), "type": d_type, "ip": mgmt_ip}}
                if device_obj.DEVICE_TYPE in [Device.veeam, 'VMware']:
                    device_data['telnet'] = True
                data[str(device_obj.collector.id)]['device_details'].update(device_data)
            else:
                device_data = {key: {"id": str(d_id), "type": d_type, "ip": mgmt_ip}}
                if device_obj.DEVICE_TYPE in [Device.veeam, 'VMware']:
                    device_data[key]['telnet'] = True
                data['common_collector']['device_details'].update(device_data)
    if data['common_collector']['device_details']:
        many = ['Switch', 'Firewall', 'LoadBalancer']
        foreign = ['Server', 'StorageDevice', 'PDU', 'MacDevice', 'VirtualMachine', 'Veeam']
        cloud = ['VmwareVmMigration', 'VCloudVirtualMachines', 'OpenStackVmMigration']
        device_class = devices_qs[0].__class__.__name__
        org = None
        if device_class in many:
            org = devices_qs[0].customers.all().first()
        elif device_class in foreign:
            org = devices_qs[0].customer
        elif device_class in cloud:
            org = devices_qs[0].cloud.customer
        elif device_class == 'HypervVM':
            org = devices_qs[0].cluster.private_cloud.customer
        elif device_class == 'DockerManagerAccount':
            org = devices_qs[0].customer
        elif device_class == 'AzureResource':
            org = devices_qs[0].account.customer
        elif device_class == 'VMwareVcenter':
            org = devices_qs[0].customer
        if org:
            data['common_collector']['org'] = str(org.id)
            data['common_collector']['end_point'] = subdomain
            data['common_collector']['domain'] = domain
            data['common_collector']['prod_env'] = not settings.DEBUG
            agent = org.agents.all().first()
            agent_ip = getattr(agent, 'ip_address', None)
            if agent:
                data['common_collector']['collector_ip'] = agent_ip
                data['common_collector']['collector_uuid'] = str(agent.uuid)
                data['common_collector'] = json.dumps(data['common_collector'])
                collector_request_task(agent, data['common_collector'])
                logger.info("^" * 100)
                logger.info("Data of {} devices of device type {} posted to collector : {}".format(str(len(devices_qs)),
                                                                                                   str(list_device_type),
                                                                                                   str(agent_ip)))
                logger.info("^" * 100)
            else:
                logger.error("Failed to submit task, collector not found for the organization - ", org.name)
    data.pop('common_collector')
    for collector_id in data.keys():
        agent = AgentConfig.objects.get(id=int(collector_id))
        agent_ip = getattr(agent, 'ip_address', None)
        data[collector_id]['org'] = str(agent.customer.id)
        data[collector_id]['end_point'] = subdomain
        data[collector_id]['domain'] = domain
        data[collector_id]['collector_ip'] = agent_ip
        data[collector_id]['collector_uuid'] = str(agent.uuid)
        data[collector_id]["user_id"] = str(request_user.id)
        collector_request_task(agent, json.dumps(data[collector_id]))
        logger.info("^" * 100)
        logger.info("Data of {} devices of device type {} posted to collector : {}".format(str(len(devices_qs)),
                                                                                           str(list_device_type),
                                                                                           str(agent_ip)))
        logger.info("^" * 100)


def collector_request_task(agent, data):
    from .tasks import poll_device_status
    poll_device_status.delay(agent.id, data)


def get_status_via_collector(org_id_list=None, collector=None, request_user=None):
    if org_id_list:
        orgs = Organization.objects.filter(id__in=org_id_list)
    else:
        orgs = [o for o in Organization.objects.all() if o.agents.all()]
    domain, subdomain = get_app_endpoint()
    for org in orgs:
        try:
            devices_qs = CacheDevicesStatusQuerySet(request_user=request_user)
            all_devices = devices_qs.get_queryset_chain
            vmware_qs = VMwareVcenter.objects.filter(private_cloud__customer=org)
            all_devices = list(chain(all_devices, vmware_qs))
            veeam_qs = Veeam.objects.filter(customer=org)
            all_devices = list(chain(all_devices, veeam_qs))
            data = dict(common_collector=dict(device_details=dict()))
            for q in all_devices:
                mgmt_ip = q.management_ip if q.management_ip not in [None, ''] else None
                ip = q.ip_address if hasattr(q, 'ip_address') and q.ip_address not in [None, ''] else None
                if mgmt_ip or ip:
                    mgmt_ip = mgmt_ip if mgmt_ip else ip
                    key = q.__class__.__name__ + '-' + str(q.id)
                    if hasattr(q, 'collector') and q.collector:
                        if str(q.collector.id) not in data:
                            data[str(q.collector.id)] = {'device_details': {}}
                        data[str(q.collector.id)]['device_details'].update(
                            {key: {"id": str(q.id), "type": q.__class__.__name__, "ip": mgmt_ip}})
                    else:
                        data['common_collector']['device_details'].update(
                            {key: {"id": str(q.id), "type": q.__class__.__name__, "ip": mgmt_ip}})
            common_collector = data.pop('common_collector')
            if len(data.keys()) >= 1:
                if collector and collector.id in data.keys():
                    agent = collector
                    data[collector.id]['org'] = str(org.id)
                    data[collector.id]['end_point'] = subdomain
                    data[collector.id]['domain'] = domain
                    data[collector.id]['prod_env'] = not settings.DEBUG
                    data[collector.id]['collector_ip'] = agent.ip_address
                    data[collector.id]['collector_uuid'] = str(agent.uuid)
                    data[collector.id]['user_id'] = str(request_user.id) if request_user else None
                    collector_request(agent, json.dumps(data[collector.id]))
                else:
                    for collector_id in data.keys():
                        agent = AgentConfig.objects.get(id=int(collector_id))
                        data[collector_id]['org'] = str(org.id)
                        data[collector_id]['end_point'] = subdomain
                        data[collector_id]['domain'] = domain
                        data[collector_id]['prod_env'] = not settings.DEBUG
                        data[collector_id]['collector_ip'] = agent.ip_address
                        data[collector_id]['collector_uuid'] = str(agent.uuid)
                        data[collector_id]['user_id'] = str(request_user.id) if request_user else None
                        collector_request(agent, json.dumps(data[collector_id]))
            if common_collector['device_details']:
                common_collector['org'] = str(org.id)
                common_collector['end_point'] = subdomain
                common_collector['domain'] = domain
                common_collector['prod_env'] = not settings.DEBUG
                agent = org.agents.all().first() if not collector else collector
                if agent:
                    common_collector['collector_ip'] = agent.ip_address
                    common_collector['collector_uuid'] = str(agent.uuid)
                    common_collector['user_id'] = str(request_user.id) if request_user else None
                    common_collector = json.dumps(common_collector)
                    collector_request(agent, common_collector)
                else:
                    error = "Failed to submit task, Collector not found for the organization - %s" % org.name
                    logger.error(error)
        except Exception as e:
            logger.error(e)
            continue


def collector_request(agent, data):
    post_url = 'https://{ip_address}/discovery/device_status/'.format(
        ip_address=getattr(agent, 'ip_address', None)
    )
    agent.post_to_collector(post_url, data)


def clean_collector_status_data(agent):
    post_url = 'https://{ip_address}/discovery/device_status/remove_devices/'.format(
        ip_address=getattr(agent, 'ip_address', None)
    )
    response = agent.post_to_collector(post_url, data=None)
    return response


def poll_status_from_monitoring():
    users_list = User.objects.all()

    for user in users_list:
        devices_qs = CacheDevicesStatusQuerySet(
            request_user=user
        )
        qs = devices_qs.get_queryset_chain

        for item in qs:
            status = None
            if hasattr(item, 'DEVICE_TYPE') and item.DEVICE_TYPE == Device.bms:
                item = item.server
            monitor_by = item.monitor_by
            if monitor_by.get('zabbix') and item.zabbix:
                status = item.zabbix.running_status()
            elif monitor_by.get('observium') and item.observium:
                status = item.observium.observium_status()
            if status is not None:
                status = str(status)
            watch_obj = item.watch
            watch_obj.status = status
            watch_obj.status_updated_on = timezone.now()
            watch_obj.save()


def process_device_configurations(device, device_content_type, customer, bulk, executed_by=None):
    backup_uuids = []
    credential = device.ncm_credentials
    device_collector = device.collector
    device_data = {
        "device_type": device.config_device_type,
        "device_ip": device.management_ip,
        "username": credential.username,
        "password": credential.password,
        "enable_password": device.enable_mode_password if device.enable_mode_password else "",
        "rest_api_port": credential.port if credential.port else 443,
        "port": 22,
        "org_name": customer.name
    }
    if not device_collector:
        device.is_in_progress = False
        device.save()
        msg = "Collector Not Present for device {}({}).".format(device.name, device.management_ip)
        if bulk:
            logger.error(msg)
            return {
                "device_name": device.name,
                "device_config_type": device.config_device_type,
                "device_type": device.DEVICE_TYPE,
                "device_ip": device.management_ip,
                "uuid": device.uuid,
                "error": msg
            }
        raise BadRequestError(msg)
    agent_ip_address = device_collector.ip_address
    agent_username = device_collector.ssh_username
    agent_password = device_collector.ssh_password
    agent_ssh_port = device_collector.ssh_port
    device_data["ssh_ip_address"] = agent_ip_address
    device_data["ssh_username"] = agent_username
    device_data["ssh_password"] = agent_password
    if device.config_device_type == "fortinet":  # Currently supported for only Fortinet/Fortigate
        device_data["encrypted_password"] = device.default_encryption_password
        if credential.connection_type == "API Token":
            device_data["api_token"] = credential.api_token
    config_file_type = NETWORK_DEVICES_DEFAULT_FILE_TYPE_MAP.get(device.config_device_type, None)
    if not config_file_type:
        device.is_in_progress = False
        device.save()
        msg = "No Supported File Type Present for device {}({}).".format(device.name, device.management_ip)
        if bulk:
            logger.error(msg)
            return {
                "device_name": device.name,
                "device_config_type": device.config_device_type,
                "device_type": device.DEVICE_TYPE,
                "device_ip": device.management_ip,
                "uuid": device.uuid,
                "error": msg
            }
        raise BadRequestError(msg)
    applicable_credential_types = NETWORK_DEVICE_DEFAULT_CREDENTIAL_TYPE_MAP[device.config_device_type]
    if credential.connection_type not in applicable_credential_types:
        device.is_in_progress = False
        device.save()
        msg = "Credential Type - {} is not allowed for device {}({}).".format(
            credential.connection_type,
            device.name,
            device.management_ip
        )
        if bulk:
            logger.error(msg)
            return {
                "device_name": device.name,
                "device_config_type": device.config_device_type,
                "device_type": device.DEVICE_TYPE,
                "device_ip": device.management_ip,
                "uuid": device.uuid,
                "error": msg
            }
        raise BadRequestError(msg)
    device_data["config_file_type"] = config_file_type
    headers = device.collector.get_auth_token_headers()
    test_connection_url = "https://" + device.collector.ip_address + "/discovery/test_connection/"
    response = requests.post(
        test_connection_url,
        data=json.dumps(device_data),
        headers=headers,
        verify=False,
        timeout=120
    )
    if response.status_code != 200:
        device.is_in_progress = False
        device.save()
        msg = "Failed to establish connection for device {}({}).".format(device.name, device.management_ip)
        if bulk:
            logger.error(msg)
            return {
                "device_name": device.name,
                "device_config_type": device.config_device_type,
                "device_type": device.DEVICE_TYPE,
                "device_ip": device.management_ip,
                "uuid": device.uuid,
                "error": msg
            }
        raise BadRequestError(msg)

    configurations = DeviceConfigurationData.objects.filter(
        device_type=device.DEVICE_TYPE,
        device_id=device.id,
        customer=customer
    )

    if (
        not configurations.filter(is_startup_config=True) and
        device.config_device_type not in ["cisco_ftd", "f5_ltm", "fortinet", "paloalto_panos"]
    ):
        # Currently supported for cisco ios and cisco nxos devices
        startup_config_url = "https://" + device.collector.ip_address + "/discovery/device_startup_config/"
        startup_config_instance = DeviceConfigurationData.objects.create(
            content_type=device_content_type,
            device_type=device.DEVICE_TYPE,
            device_id=device.id,
            is_startup_config=True,
            executed_by=executed_by,
            customer=customer
        )
        device_data["uuid"] = str(startup_config_instance.uuid)
        response = requests.post(
            startup_config_url,
            data=json.dumps(device_data),
            headers=headers,
            verify=False,
            timeout=600
        )
        if response.status_code != 200:
            startup_config_instance.delete()
            device.is_in_progress = False
            device.save()
            logger.error(str(response.text))
            msg = "Failed to fetch startup configuration for device {}({}).".format(device.name, device.management_ip)
            if bulk:
                logger.error(msg)
                return {
                    "device_name": device.name,
                    "device_config_type": device.config_device_type,
                    "device_type": device.DEVICE_TYPE,
                    "device_ip": device.management_ip,
                    "uuid": device.uuid,
                    "error": msg
                }
            raise BadRequestError(msg)
        startup_config_path = response.json()["data"]
        try:
            file_dir = os.path.join(
                settings.MEDIA_ROOT,
                "configurations",
                customer.name,
                "{}-{}".format(device.DEVICE_TYPE, device.uuid)
            )
            if not os.path.exists(file_dir):
                os.makedirs(file_dir)
            file_path = os.path.join(file_dir, os.path.basename(startup_config_path))
            ssh = paramiko.SSHClient()
            ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            ssh.connect(
                agent_ip_address,
                port=agent_ssh_port,
                username=agent_username,
                password=agent_password
            )
            sftp = ssh.open_sftp()
            sftp.get(startup_config_path, file_path)
            sftp.remove(startup_config_path)
            sftp.close()
            ssh.close()
            startup_config_instance.config_file = file_path
            startup_config_instance.save()
        except Exception as e:
            logger.error("Error while getting startup config: {}".format(e))
            device.is_in_progress = False
            device.save()
            startup_config_instance.delete()
            msg = "Failed to get startup configuration for device {}({}).".format(device.name, device.management_ip)
            if bulk:
                logger.error(msg)
                return {
                    "device_name": device.name,
                    "device_config_type": device.config_device_type,
                    "device_type": device.DEVICE_TYPE,
                    "device_ip": device.management_ip,
                    "uuid": device.uuid,
                    "error": msg
                }
            raise BadRequestError(msg)
        else:
            backup_uuids.append(str(startup_config_instance.uuid))

    # Currently cisco ftd, cisco ios, cisco nxos, fortinet, f5_ltm and paloalto_panos are supported
    running_config_url = "https://" + device.collector.ip_address + "/discovery/device_running_config/"
    file_password = device.default_encryption_password if device.config_device_type == "fortinet" else None
    running_config_instance = DeviceConfigurationData.objects.create(
        content_type=device_content_type,
        device_type=device.DEVICE_TYPE,
        device_id=device.id,
        file_password=file_password,
        executed_by=executed_by,
        customer=customer
    )
    device_data["uuid"] = str(running_config_instance.uuid)
    response = requests.post(
        running_config_url,
        data=json.dumps(device_data),
        headers=headers,
        verify=False,
        timeout=600
    )
    if response.status_code != 200:
        device.is_in_progress = False
        device.save()
        running_config_instance.delete()
        logger.error(str(response.text))
        msg = "Failed to fetch running configuration for device {}({}).".format(device.name, device.management_ip)
        if bulk:
            logger.error(msg)
            return {
                "device_name": device.name,
                "device_config_type": device.config_device_type,
                "device_type": device.DEVICE_TYPE,
                "device_ip": device.management_ip,
                "uuid": device.uuid,
                "error": msg
            }
        raise BadRequestError(msg)
    running_config_task_id = response.json()["task_id"]
    task_url = "https://" + device.collector.ip_address + "/discovery/task/{}/".format(running_config_task_id)
    while True:
        response = requests.get(
            task_url,
            headers=headers,
            verify=False,
            timeout=60
        )
        if response.status_code == 200:
            task_result = response.json()
            if task_result.get("state") in ["SUCCESS", "PENDING", "STARTED", "FAILURE"]:
                if task_result.get("state") == "SUCCESS":
                    running_config_path = task_result.get("result")
                    break
                elif task_result.get("state") == "FAILURE":
                    result = task_result.get("result")
                    device.is_in_progress = False
                    device.save()
                    running_config_instance.delete()
                    logger.error(result)
                    msg = "Failed to fetch running configuration for device {}({}).".format(device.name, device.management_ip)
                    if bulk:
                        logger.error(msg)
                        return {
                            "device_name": device.name,
                            "device_config_type": device.config_device_type,
                            "device_type": device.DEVICE_TYPE,
                            "device_ip": device.management_ip,
                            "uuid": device.uuid,
                            "error": msg
                        }
                    raise BadRequestError(msg)
        time.sleep(10)
    try:
        file_dir = os.path.join(
            settings.MEDIA_ROOT,
            "configurations",
            customer.name,
            "{}-{}".format(device.DEVICE_TYPE, device.uuid)
        )
        if not os.path.exists(file_dir):
            os.makedirs(file_dir)
        file_path = os.path.join(file_dir, os.path.basename(running_config_path))
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        ssh.connect(
            agent_ip_address,
            port=agent_ssh_port,
            username=agent_username,
            password=agent_password
        )
        sftp = ssh.open_sftp()
        sftp.get(running_config_path, file_path)
        sftp.remove(running_config_path)
        sftp.close()
        ssh.close()
        if device.config_device_type in ["cisco_ftd", "f5_ltm", "paloalto_panos"]:
            # Perform Extraction from .ucs/.tgz/.zip Archive for showing the conf file
            extracted_dir = file_dir + "/extracted-{}".format(running_config_instance.uuid)
            if not os.path.exists(extracted_dir):
                os.makedirs(extracted_dir)
            if device.config_device_type == "cisco_ftd":
                with zipfile.ZipFile(file_path, "r") as zip_ref:
                    zip_ref.extractall(extracted_dir)
            else:
                with tarfile.open(file_path, "r:gz") as tar:
                    tar.extractall(path=extracted_dir)
        running_config_instance.config_file = file_path
        running_config_instance.save()
    except Exception as e:
        logger.error("Error while getting running config: {}".format(e))
        device.is_in_progress = False
        device.save()
        running_config_instance.delete()
        msg = "Failed to get running configuration for device {}({}).".format(device.name, device.management_ip)
        if bulk:
            logger.error(msg)
            return {
                "device_name": device.name,
                "device_config_type": device.config_device_type,
                "device_type": device.DEVICE_TYPE,
                "device_ip": device.management_ip,
                "uuid": device.uuid,
                "error": msg
            }
        raise BadRequestError(msg)
    else:
        backup_uuids.append(str(running_config_instance.uuid))
        if not configurations.filter(is_golden_config=True):
            # Save the running config as the golden config if not present
            running_config_instance.is_golden_config = True
            running_config_instance.save()
        device.is_ncm_enabled = True
        device.is_in_progress = False
        device.save()
    device_data = {
        "device_config_type": device.config_device_type,
        "device_ip": device.management_ip,
        "device_type": device.DEVICE_TYPE,
        "uuid": device.uuid,
        "device_name": device.name,
        "backups": backup_uuids
    }
    return device_data


def create_or_update_network_configurations(uuid):
    network_devices_group = NetworkDevicesGroup.objects.get(uuid=uuid)
    processed_devices_data = []

    firewalls = network_devices_group.firewalls.all()
    if firewalls:
        fw_content_type = ContentType.objects.get_for_model(Firewall)
        for firewall in firewalls:
            processed_fw_data = process_device_configurations(
                device=firewall,
                device_content_type=fw_content_type,
                customer=network_devices_group.customer,
                bulk=True
            )
            if processed_fw_data:
                processed_devices_data.append(processed_fw_data)

    load_balancers = network_devices_group.load_balancers.all()
    if load_balancers:
        lb_content_type = ContentType.objects.get_for_model(LoadBalancer)
        for load_balancer in load_balancers:
            processed_lb_data = process_device_configurations(
                device=load_balancer,
                device_content_type=lb_content_type,
                customer=network_devices_group.customer,
                bulk=True
            )
            if processed_lb_data:
                processed_devices_data.append(processed_lb_data)

    switches = network_devices_group.switches.all()
    if switches:
        sw_content_type = ContentType.objects.get_for_model(Switch)
        for switch in switches:
            processed_sw_data = process_device_configurations(
                device=switch,
                device_content_type=sw_content_type,
                customer=network_devices_group.customer,
                bulk=True
            )
            if processed_sw_data:
                processed_devices_data.append(processed_sw_data)
    return processed_devices_data


def send_device_sync_email_notification(group, devices_data, result_status):
    group_users_emails = list(group.email_notify_groups.all().values_list("rbac_users__email", flat=True))
    user_email_list = list(group.email_notify_users.all().values_list("email", flat=True))
    email_list = list(set(user_email_list + group_users_emails))
    html_data = ""
    has_devices_failed = False
    has_devices_passed = False
    for device in devices_data:
        device_backup_status = "Success"
        if "error" in device:
            device_backup_status = "Failed"
        device_type = "Load Balancer" if device["device_type"] == "load_balancer" else device["device_type"].title()
        device_config_type = NETWORK_DEVICE_CONFIG_TYPE_MAP[device["device_config_type"]]
        device_backup_status_color = "green" if device_backup_status == "Success" else "red"
        html_data += """
            <tr style="text-align: center;">
                <td>{}</td>
                <td>{}</td>
                <td>{}</td>
                <td>{}</td>
                <td style="color: {};">{}</td>
            </tr>
        """.format(
            device["device_name"],
            device["device_ip"],
            device_type,
            device_config_type,
            device_backup_status_color,
            device_backup_status
        )
        if result_status.lower() == "failed":
            if "error" in device:
                has_devices_failed = True
            else:
                has_devices_passed = True
    if result_status.lower() == "success":
        bg_color = "c2eddb"
        backup_state = "was successful"
        backup_title = "Completed Successfully"
    else:
        if has_devices_failed and has_devices_passed:
            bg_color = "ffc400"
            backup_state = "was partially successful"
            backup_title = "Completed Partially"
        else:
            bg_color = "d45d5d"
            backup_state = "failed"
            backup_title = "Failed"
    email_content = """
        <!DOCTYPE html>
            <html>
                <head></head>
                <body>
                    <div style="max-width: 100%; width: 600px; margin: 0 auto;border-spacing: 0px;">
                        <div style="float: left; width: 100%; text-align: center;background-color: #{};border-radius: 10px;">
                            <p style="font-family: Lucida Sans; text-align: center;margin-top: 10px; margin-bottom:0px;font-size: 18px;color: #050505;font-weight: bold;">Backup Sync {}</p>
                            <p style="font-family: Lucida Sans; text-align: center;font-size: 14px;color: #111111; margin-bottom: 20px; margin-top: 10px;">Network Devices Group <strong>{}</strong> Sync {}.</p>
                        </div>
                        <table border="1" cellpadding="5" cellspacing="0" style="width: 100%; border-collapse: collapse; font-family: Lucida Sans; margin-top: 20px;">
                            <tr>
                                <th>Device Name</th>
                                <th>Device IP</th>
                                <th>Device Type</th>
                                <th>Device Config Type</th>
                                <th>Backup Status</th>
                            </tr>
                            {}
                        </table>
                    </div>
                </body>
            </html>
    """.format(bg_color, backup_title, group.name, backup_state, html_data)
    email_subject = "UnityOne Network Device Group {} Backup {}.".format(group.name, backup_state)
    email = EmailMessage(
        email_subject,
        email_content,
        settings.DEFAULT_FROM_EMAIL,
        email_list
    )
    email.content_subtype = "html"
    sent = email.send()
    logger.info("Email notification successfully sent.")


def delete_device_configurations(org_id, device_type, device_uuid, config_uuid, file_path, config_device_type):
    extracted_path = None
    if config_uuid and config_device_type in ["cisco_ftd", "f5_ltm", "paloalto_panos"]:
        customer = Organization.objects.get(id=org_id)
        dev_path = os.path.join(
            settings.MEDIA_ROOT,
            "configurations",
            customer.name,
            "{}-{}".format(device_type, device_uuid)
        )
        extracted_path = os.path.join(dev_path, "extracted-{}/".format(config_uuid))
    if file_path:
        if os.path.exists(file_path) and not os.path.isdir(file_path):
            os.remove(file_path)
        elif os.path.exists(file_path) and os.path.isdir(file_path):
            shutil.rmtree(file_path)

    if extracted_path:
        if os.path.exists(extracted_path) and not os.path.isdir(extracted_path):
            os.remove(extracted_path)
        elif os.path.exists(extracted_path) and os.path.isdir(extracted_path):
            shutil.rmtree(extracted_path)


def sync_latest_iot_device_data(uuid, device_type, data_type):
    history_model_map = {
        "airflow": SensorAirflowHistory,
        "humidity": SensorHumidityHistory,
        "temperature": SensorTemperatureHistory,
        "current": SmartPDUCurrentHistory,
        "power": SmartPDUPowerHistory,
        "voltage": SmartPDUVoltageHistory
    }
    unit_value_map = {
        "airflow": "CFM",
        "humidity": "%",
        "temperature": "C",
        "current": "A",
        "power": "W",
        "voltage": "V"
    }
    device_model = get_model_obj(device_type)
    iot_device = device_model.objects.get(uuid=uuid)
    if not iot_device.collector or not iot_device.collector.ip_address or not iot_device.model or not iot_device.model.manufacturer:
        return False
    headers = iot_device.collector.get_auth_token_headers()
    data_url = "https://{}/discovery/{}/".format(iot_device.collector.ip_address, data_type)
    snmp_creds = []
    if hasattr(iot_device, "credentials_m2m"):
        creds_qs = iot_device.credentials_m2m.filter(connection_type__in=["SNMPv1", "SNMPv2", "SNMPv3"])
        for cred in creds_qs:
            if cred.connection_type in ["SNMPv1", "SNMPv2"]:
                snmp_creds.append({
                    "cstring": cred.snmp_community,
                    "version": cred.connection_type
                })
            elif cred.connection_type == "SNMPv3":
                snmp_creds.append({
                    "version": cred.connection_type,
                    "security_level": cred.snmp_authlevel,
                    "security_username": cred.snmp_authname,
                    "auth_protocol": cred.snmp_authalgo,
                    "auth_password": cred.snmp_authpass,
                    "privacy_protocol": cred.snmp_cryptoalgo,
                    "privacy_password": cred.snmp_cryptopass
                })
    if not snmp_creds:
        from rest.customer.utils import get_snmp_creds
        snmp_creds = get_snmp_creds(iot_device.customer)
    data = {
        "snmp_cred": snmp_creds,
        "hostname": iot_device.name,
        "manufacturer": iot_device.model.manufacturer.name,
        "model": iot_device.model.name,
        "ip_address": iot_device.ip_address,
        "unique_id": str(uuid)
    }
    response = requests.post(
        data_url,
        data=json.dumps(data),
        headers=headers,
        verify=False,
        timeout=600
    )
    if response.status_code == 200:
        response_json = response.json()
        latest_avg_value = response_json["value"]
    else:
        latest_avg_value = 0
    historymodel = history_model_map[data_type]
    if device_type == "sensor":
        latest_history = historymodel.objects.filter(sensor=iot_device).order_by("-recorded_at").first()
    else:
        latest_history = historymodel.objects.filter(smart_pdu=iot_device).order_by("-recorded_at").first()
    now = timezone.now().replace(second=0, microsecond=0)
    if (
        latest_history and
        latest_history.recorded_at.year == now.year and
        latest_history.recorded_at.month == now.month and
        latest_history.recorded_at.day == now.day and
        latest_history.recorded_at.hour == now.hour
    ):
        return False
    history_instance = historymodel.objects.create(
        value=latest_avg_value,
        unit=unit_value_map[data_type],
        **({"sensor": iot_device} if device_type == "sensor" else {"smart_pdu": iot_device})
    )
    history_instance.recorded_at = now
    history_instance.save()
    logger.debug("{} Record Created for {} - {}".format(data_type.title(), iot_device.name, uuid))


def delete_device_configurations(device_model):
    to_delete = []
    path_empty = []
    not_deleted = []
    devices = device_model.objects.filter(is_ncm_enabled=True)
    for dev_obj in devices:
        customer = dev_obj.customers.first()
        configs = DeviceConfigurationData.objects.filter(
            device_type=dev_obj.DEVICE_TYPE,
            device_id=dev_obj.id,
            customer=customer,
            is_startup_config=False,
            is_golden_config= False
        ).order_by('-created_at')
        to_delete_configs = configs[15:]
        for config in to_delete_configs:
            dir_path = config.config_file
            if not dir_path:
                path_empty.append(config.uuid)
                continue
            extracted_path = None
            if dev_obj.config_device_type in ['cisco_ftd', 'f5_ltm', 'paloalto_panos']:
                dev_path = os.path.join(
                    settings.MEDIA_ROOT,
                    'configurations',
                    customer.name,
                    '{}-{}'.format(dev_obj.DEVICE_TYPE, dev_obj.uuid)
                )
                extracted_path = dev_path + '/extracted-{}/'.format(config.uuid)
            try:
                if os.path.exists(dir_path) and not os.path.isdir(dir_path):
                    os.remove(dir_path)
                    to_delete.append(config.uuid)
                elif os.path.exists(dir_path) and os.path.isdir(dir_path):
                    shutil.rmtree(dir_path)
                    to_delete.append(config.uuid)
                else:
                    not_deleted.append(config.uuid)
                if extracted_path:
                    if os.path.exists(extracted_path) and not os.path.isdir(extracted_path):
                        os.remove(extracted_path)
                        if config.uuid not in to_delete:
                            to_delete.append(config.uuid)
                    elif os.path.exists(extracted_path) and os.path.isdir(extracted_path):
                        shutil.rmtree(extracted_path)
                        if config.uuid not in to_delete:
                            to_delete.append(config.uuid)
                    else:
                        if config.uuid not in not_deleted:
                            not_deleted.append(config.uuid)
            except Exception as e:
                logger.error("Error Occurred While Deleting: {}".format(str(e)))
    if to_delete:
        DeviceConfigurationData.objects.filter(uuid__in=to_delete).delete()
    if not_deleted:
        DeviceConfigurationData.objects.filter(uuid__in=not_deleted).delete()
    if path_empty:
        DeviceConfigurationData.objects.filter(uuid__in=path_empty).delete()
    logger.debug("Completed")

def update_load_balancer_lifecycle_dates():
    for load_balancer_model in LoadBalancerModel.objects.all():
        if not load_balancer_model.manufacturer or not load_balancer_model.manufacturer.name or not load_balancer_model.name:
            continue
        manufacturer_name = load_balancer_model.manufacturer.name
        model_name = load_balancer_model.name
 
        manufacturer_lifecycle = LOADBALANCER_MODEL_LIFECYCLE_DATES.get(manufacturer_name)
        if manufacturer_lifecycle:
            model_lifecycle = manufacturer_lifecycle.get(model_name)
            if model_lifecycle:
                end_of_life = model_lifecycle.get("end_of_life")
                end_of_service = model_lifecycle.get("end_of_support")
                end_of_extended_support = model_lifecycle.get("end_of_extended_support")
                end_of_security_support = model_lifecycle.get("end_of_security_support")
                if end_of_life:
                    load_balancer_model.end_of_life = parse_date(end_of_life)
                if end_of_service:
                    load_balancer_model.end_of_service = parse_date(end_of_service)
                if end_of_extended_support:
                    load_balancer_model.end_of_extended_support = parse_date(end_of_extended_support)
                if end_of_security_support:
                    load_balancer_model.end_of_security_support = parse_date(end_of_security_support)
                load_balancer_model.save()
 
 
def update_firewall_lifecycle_dates():
    for firewall_model in FirewallModel.objects.all():
        if not firewall_model.manufacturer or not firewall_model.manufacturer.name or not firewall_model.name:
            continue
        manufacturer_name = firewall_model.manufacturer.name
        model_name = firewall_model.name
 
        manufacturer_lifecycle = FIREWALL_MODEL_LIFECYCLE_DATES.get(manufacturer_name)
        if manufacturer_lifecycle:
            model_lifecycle = manufacturer_lifecycle.get(model_name)
            if model_lifecycle:
                end_of_life = model_lifecycle.get("end_of_life")
                end_of_service = model_lifecycle.get("end_of_support")
                end_of_extended_support = model_lifecycle.get("end_of_extended_support")
                end_of_security_support = model_lifecycle.get("end_of_security_support")
                if end_of_life:
                    firewall_model.end_of_life = parse_date(end_of_life)
                if end_of_service:
                    firewall_model.end_of_service = parse_date(end_of_service)
                if end_of_extended_support:
                    firewall_model.end_of_extended_support = parse_date(end_of_extended_support)
                if end_of_security_support:
                    firewall_model.end_of_security_support = parse_date(end_of_security_support)
                firewall_model.save()
 
 
def update_switch_lifecycle_dates():
    for switch_model in SwitchModel.objects.all():
        if not switch_model.manufacturer or not switch_model.manufacturer.name or not switch_model.name:
            continue
        manufacturer_name = switch_model.manufacturer.name
        model_name = switch_model.name
 
        manufacturer_lifecycle = SWITCH_MODEL_LIFECYCLE_DATES.get(manufacturer_name)
        if manufacturer_lifecycle:
            model_lifecycle = manufacturer_lifecycle.get(model_name)
            if model_lifecycle:
                end_of_life = model_lifecycle.get("end_of_life")
                end_of_service = model_lifecycle.get("end_of_support")
                end_of_extended_support = model_lifecycle.get("end_of_extended_support")
                end_of_security_support = model_lifecycle.get("end_of_security_support")
                if end_of_life:
                    switch_model.end_of_life = parse_date(end_of_life)
                if end_of_service:
                    switch_model.end_of_service = parse_date(end_of_service)
                if end_of_extended_support:
                    switch_model.end_of_extended_support = parse_date(end_of_extended_support)
                if end_of_security_support:
                    switch_model.end_of_security_support = parse_date(end_of_security_support)
                switch_model.save()


def update_software_server_lifecycle_dates():
    from unity_discovery.models import DeviceSoftwareServer
    for software_server in  DeviceSoftwareServer.objects.all():
        software_server_name = software_server.name
        if not software_server_name:
            continue
        software_server_lifecycle = SOFTWARE_SERVER_LIFECYCLE_DATES.get(software_server_name)
        if software_server_lifecycle:
            end_of_life = software_server_lifecycle.get("end_of_life")
            end_of_service = software_server_lifecycle.get("end_of_support")
            end_of_extended_support = software_server_lifecycle.get("end_of_extended_support")
            end_of_security_support = software_server_lifecycle.get("end_of_security_support")
            if end_of_life:
                software_server.end_of_life = parse_date(end_of_life)
            if end_of_service:
                software_server.end_of_service = parse_date(end_of_service)
            if end_of_extended_support:
                software_server.end_of_extended_support = parse_date(end_of_extended_support)
            if end_of_security_support:
                software_server.end_of_security_support = parse_date(end_of_security_support)
            software_server.save()

