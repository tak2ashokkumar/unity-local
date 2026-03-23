var app = angular.module('uldb');

app.constant('LEFTNAVITEMS',[
  {
    MENUITEM : 'Public Cloud',
    SUBMENUITEMS : [
        {
          "fa": "fa-cube",
          "href": "#/aws-dashboard",
          "name": "AWS"
        },
        {
          "fa": "fa-desktop",
          "href": "#/azure-dashboard",
          "name": "Azure"
        }
    ]
  },
  {
    MENUITEM : 'Public Cloud',
    SUBMENUITEMS : [
        {
          "fa": "fa-cube",
          "href": "#/aws-dashboard",
          "name": "AWS"
        },
        {
          "fa": "fa-desktop",
          "href": "#/azure-dashboard",
          "name": "Azure"
        }
    ]
  }
]);


/*[
  {
    "submenu": [
      {
        "fa": "fa-map-o",
        "href": "#/dashboard",
        "name": "Dashboard"
      },
      {
        "fa": "fa-heartbeat",
        "href": "#/monitor",
        "name": "System Monitoring"
      },
      {
        "fa": "fa-heartbeat",
        "href": "#/logic_monitor",
        "name": "Infrastructure Monitoring"
      },
      {
        "disabled": true,
        "fa": "fa-credit-card-o",
        "href": "",
        "name": "Database Monitoring"
      },
      {
        "disabled": true,
        "fa": "fa-credit-card-o",
        "href": "",
        "name": "Performance Monitoring"
      },
      {
        "disabled": true,
        "fa": "fa-area-chart",
        "href": "",
        "name": "Network Monitoring"
      },
      {
        "disabled": true,
        "fa": "fa-credit-card-o",
        "href": "",
        "name": "Storage Usage"
      },
      {
        "disabled": true,
        "fa": "fa-credit-card-o",
        "href": "",
        "name": "Load Balancer Usage"
      },
      {
        "disabled": true,
        "fa": "fa-credit-card-o",
        "href": "",
        "name": "Colo Monitoring"
      }
    ],
    "fa": "fa-map-o",
    "title": "UnitedView"
  },
  {
    "submenu": [
      {
        "submenu": [
          {
            "href": "#/cloud/99c63ffa-55f9-46eb-96e4-e021fe5d6089/",
            "name": "Cloud 1"
          },
          {
            "href": "#/cloud/cbf8c921-cbb5-4a20-90ce-3c2ff8a7d2a1/",
            "name": "Cloud 4"
          },
          {
            "href": "#/cloud/dbffb455-e61e-48af-a86f-844e31e20854/",
            "name": "cloud3"
          }
        ],
        "fa": "fa-cloud",
        "href": "#/cloud",
        "name": "Private Cloud",
        "arrow": 3
      },
      {
        "submenu": [
          {
            "fa": "fa-cube",
            "href": "#/aws-dashboard",
            "name": "AWS"
          },
          {
            "fa": "fa-desktop",
            "href": "#/azure-dashboard",
            "name": "Azure"
          }
        ],
        "fa": "fa-rocket",
        "href": "#/cloud",
        "name": "Public Cloud",
        "arrow": true
      },
      {
        "submenu": [
          {
            "fa": "fa-fire",
            "href": "#/firewalls",
            "name": "Firewalls"
          },
          {
            "fa": "fa-sitemap",
            "href": "#/switches",
            "name": "Switches"
          },
          {
            "fa": "fa-balance-scale",
            "href": "#/load_balancers",
            "name": "Load Balancers"
          },
          {
            "fa": "fa-server",
            "href": "#/servers",
            "name": "Hypervisors"
          },
          {
            "fa": "fa-object-group",
            "href": "#/vms",
            "name": "Virtual Machines"
          }
        ],
        "fa": "fa-link",
        "href": "#/billing",
        "name": "Devices",
        "arrow": true
      },
      {
        "submenu": [
          {
            "fa": "fa-cube",
            "href": "#/cabs",
            "name": "Cabinets"
          },
          {
            "fa": "fa-plug",
            "href": "#/pdus",
            "name": "PDUs"
          },
          {
            "fa": "fa-cubes",
            "href": "#/cages",
            "name": "Cages"
          }
        ],
        "fa": "fa-building",
        "href": "#/",
        "name": "Colo",
        "arrow": true
      },
      {
        "submenu": [
          {
            "fa": "fa-cubes",
            "href": "#/unitedconnect",
            "name": "VXCs"
          },
          {
            "fa": "fa-cubes",
            "href": "#/manage_unitedconnect/vxc",
            "name": "Buy VXC"
          }
        ],
        "fa": "fa-train",
        "href": "#/unitedconnect",
        "name": "UnitedConnect",
        "arrow": true
      }
    ],
    "fa": "fa-cloud",
    "title": "UnitedCloud"
  },
  {
    "submenu": [
      {
        "submenu": [
          {
            "disabled": true,
            "fa": "fa-user",
            "href": "#/tenable",
            "name": "Tenable"
          }
        ],
        "fa": "fa-map-o",
        "href": "",
        "name": "Security",
        "arrow": true
      },
      {
        "fa-star": "fa-object-ungroup",
        "disabled": true,
        "href": "",
        "name": "Application-as-a-Service",
        "arrow": true
      },
      {
        "disabled": true,
        "fa": "fa-database",
        "href": "",
        "name": "Database-as-a-Service",
        "arrow": true
      },
      {
        "submenu": [
          {
            "fa": "fa-cube",
            "href": "#/services/terraform",
            "name": "Terraform"
          },
          {
            "glyphicon": "glyphicon glyphicon-export",
            "href": "#/services/vm_migration",
            "name": "VM Migration"
          },
          {
            "glyphicon": "glyphicon glyphicon-saved",
            "href": "#/services/vm_backup",
            "name": "VM Backup"
          },
          {
            "glyphicon": "glyphicon glyphicon-saved",
            "href": "#/services/db_instance",
            "name": "DB Instance"
          },
          {
            "disabled": true,
            "fa": "fa-user",
            "href": "",
            "name": "Patch Management"
          },
          {
            "disabled": true,
            "fa": "fa-user",
            "href": "",
            "name": "Create Snapshot"
          },
          {
            "disabled": true,
            "fa": "fa-user",
            "href": "",
            "name": "FW Configuration Backup"
          },
          {
            "disabled": true,
            "fa": "fa-user",
            "href": "",
            "name": "LB Configuration Backup"
          },
          {
            "disabled": true,
            "fa": "fa-user",
            "href": "",
            "name": "Router/Switch Configuration Backup"
          }
        ],
        "fa": "fa-gears",
        "href": "",
        "name": "DevOps-as-a-Service",
        "arrow": true
      }
    ],
    "fa": "fa-wrench",
    "title": "UnitedServices"
  },
  {
    "submenu": [
      {
        "fa": "fa-columns",
        "href": "#/change_ticket",
        "name": "Change Management"
      },
      {
        "fa": "fa-tags",
        "href": "#/existing_ticket",
        "name": "Incident Management"
      },
      {
        "fa": "fa-question-circle",
        "href": "#/integ/support",
        "name": "Support Request"
      },
      {
        "fa": "fa-calendar",
        "href": "#/maintenance-schedules",
        "name": "Maintenance"
      }
    ],
    "fa": "fa-support",
    "title": "Support"
  },
  {
    "submenu": [
      {
        "disabled": true,
        "fa": "fa-map-o",
        "href": "",
        "name": "Products"
      },
      {
        "fa": "fa-list",
        "href": "#/billing",
        "name": "Billing & Invoicing"
      },
      {
        "fa": "fa-user",
        "href": "#/user",
        "name": "Users & Groups"
      }
    ],
    "fa": "fa-rocket",
    "title": "UnitedSetup"
  }
]*/