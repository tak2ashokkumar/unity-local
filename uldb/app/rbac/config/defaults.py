# -*- coding: utf-8 -*-
from __future__ import unicode_literals

modules_permissions = {
    "UnitySetup": ["View UnitySetup", "Manage UnitySetup"],
    "Dashboard": ["View Dashboard", "Manage Dashboard"],
    "Onboarding": ["View Onboarding", "Manage Onboarding", "Discovery Admin"],
    "UnityCollector": ["View UnityCollector", "Manage UnityCollector", "Register UnityCollector"],
    "Monitoring": ["View Monitoring", "Manage Monitoring"],
    "Activity Log": ["View Activity Log", "Download Activity Log"],
    "Network Topology": ["View Network Topology"],
    "Private Cloud": ["View Private Cloud", "Manage Private Cloud", "Remote Management"],
    "Public Cloud": ["View Public Cloud", "Manage Public Cloud", "Remote Management"],
    "Datacenter": ["View Datacenter", "Manage Datacenter", "Remote Management"],
    "Services": ["View Services", "Manage Services"],
    "UnityConnect": ["View UnityConnect", "Manage UnityConnect"],
    "AIML Event Management": ["View AIML Event Management", "Manage AIML Event Management"],
    "DevOps Automation": [
        "View DevOps Automation", "Manage DevOps Automation", "View Tasks", "Manage Tasks",
        "Execute Tasks", "View Workflow", "Manage Workflow", "Execute Workflow", "View Scripts", "Manage Scripts"
    ],
    "Service Catalog": ["View Service Catalog", "Manage Service Catalog", "Order Catalog"],
    "Sustainability": ["View Sustainability"],
    "Cost Analysis": ["View Cost Analysis", "Manage Cost Analysis", "Cost Calculator", "Cloud Overview"],
    "Unity Report": ["View Unity Report", "Manage Unity Report"],
    "Ticket Management": ["View Tickets", "Manage Tickets"],
    "Maintenance": ["View Maintenance", "Manage Maintenance"],
    "User Management": ["View Users", "Manage Users", "Create Users"],
    "Notifications": ["View Notifications", "Manage Notifications"],
    "Credentials": ["View Credentials", "Manage Credentials"],
    "Integrations": ["View Integrations", "Manage Integrations", "Add Integrations", "Sync Integrations"],
    "Network Configuration": ["View Network Configuration", "Manage Network Configuration"],
    "Connections": ["View Connections", "Manage Connections"],
    "Custom Attributes": ["View Custom Attributes", "Manage Custom Attributes"],
    "Cost Plan": ["View Cost Plan", "Manage Cost Plan"],
    "Budget": ["View Budget", "Manage Budget"],
    "Business Services": ["View Business Services", "Manage Business Services"],
    "Policy": ["View Policy", "Manage Policy"],
    "FinOps": ["View FinOps", "Manage FinOps"]
}


set_default_data = {
    "Administrator Permission Set": {
        "description": "All Permissions for Administrator Role",
        "is_active": True,
        "is_default": True
    },
    "Dashboard Permission Set": {
        "description": "Dashboard Permissions for Dashboard User Role",
        "is_active": True,
        "is_default": True
    },
    "Global Read-Only Permission Set": {
        "description": "View-only Permissions for Global Read-Only Role",
        "is_active": True,
        "is_default": True
    },
    "Administrator": {
        "description": "Administrator Role",
        "is_active": True,
        "is_default": True
    },
    "Dashboard user": {
        "description": "Dashboard User Role",
        "is_active": True,
        "is_default": True
    },
    "Global Read-Only": {
        "description": "Global Read-Only Role",
        "is_active": True,
        "is_default": True
    }
}
