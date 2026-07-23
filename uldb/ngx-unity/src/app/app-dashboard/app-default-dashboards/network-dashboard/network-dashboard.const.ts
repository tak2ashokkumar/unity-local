import {
    NetworkAlertEventsView,
    NetworkAverageTemperatureBySensorTypeResponse,
    NetworkAutoRemediationSummary,
    NetworkDashboardFiltersResponse,
    NetworkDeviceAvailabilityItem,
    NetworkEnvironmentalHealthSummaryItem,
    NetworkEnvironmentalHealthSummaryTableResponse,
    NetworkFanHealthByDeviceResponse,
    NetworkInterfaceHealthMetricItem,
    NetworkOverview,
    NetworkPowerSupplyStatusDistributionResponse,
    NetworkPerformanceWorkloadInsightItem,
    NetworkTopDevicesByHotspotTemperatureResponse,
    NetworkTopBandwidthUsageResponse,
    NetworkTopConversationMetricResponse,
    NetworkTopConversationsTableResponse
} from './network-dashboard.type';


export const NETWORK_DASHBOARD_FILTERS_RESPONSE: NetworkDashboardFiltersResponse = {
    datacenters: [
        {
            id: 301,
            uuid: 'dc909583-c6cc-4dba-aadf-899df20f50fe',
            name: 'DC1',
            location: 'San Francisco, CA, USA'
        },
        {
            id: 302,
            uuid: '9cbde93f-26e9-4185-ae8e-83e016caa808',
            name: 'DC2',
            location: 'Sydney NSW, Australia'
        },
        {
            id: 304,
            uuid: '6340900a-d401-4895-a8d2-993ac60f953e',
            name: 'DC3-Fin',
            location: 'Finland'
        },
        {
            id: 464,
            uuid: 'a6d76e20-175d-4b34-9189-fbcb0972f684',
            name: 'DC4-Test',
            location: 'San Francisco, CA 94128, USA'
        },
        {
            id: 467,
            uuid: 'abd483ee-5644-41c0-8838-ffcd5baa1641',
            name: 'DC5-Demo',
            location: 'San Francisco, CA 94128, USA'
        }
    ],
    time_range: ['last_month', 'last_week', 'last_24_hours', 'last_90_days']
};

export const NETWORK_OVERVIEW: NetworkOverview = {
    "device_availability": {
        "percentage": 96.1,
        "online": 1198,
        "total": 1247
    },
    "discovered_devices": 934,
    "monitored_devices": 897,
    "device_types": [
        {
            "type": "Switch",
            "count": 29,
            "normal": 16,
            "critical": 8,
            "unknown": 5
        },
        {
            "type": "Firewall",
            "count": 14,
            "normal": 8,
            "critical": 6,
            "unknown": 0
        },
        {
            "type": "Load Balancer",
            "count": 10,
            "normal": 8,
            "critical": 2,
            "unknown": 0
        },
        {
            "type": "PDU",
            "count": 12,
            "normal": 8,
            "critical": 2,
            "unknown": 2
        }
    ]
};

export const NETWORK_TOP_BITS_RECEIVED: NetworkTopConversationMetricResponse = {
    count: 10,
    time_range: '30_days',
    data: [
        { id: '1', name: 'alpha-server-01', device_type: 'Switch', interface: 'Gi1', interface_index: '1', bits_received_bps: 450000, bits_received: { value: 450, unit: 'K' } },
        { id: '2', name: 'database-mainway-11', device_type: 'Switch', interface: 'Gi2', interface_index: '2', bits_received_bps: 390000, bits_received: { value: 390, unit: 'K' } },
        { id: '3', name: 'gamma-database-07', device_type: 'Firewall', interface: 'Gi3', interface_index: '3', bits_received_bps: 350000, bits_received: { value: 350, unit: 'K' } },
        { id: '4', name: 'delta-application-03', device_type: 'Switch', interface: 'Gi4', interface_index: '4', bits_received_bps: 320000, bits_received: { value: 320, unit: 'K' } },
        { id: '5', name: 'epsilon-router-05', device_type: 'Load Balancer', interface: 'Gi5', interface_index: '5', bits_received_bps: 290000, bits_received: { value: 290, unit: 'K' } }
    ]
};

export const NETWORK_TOP_BITS_SENT: NetworkTopConversationMetricResponse = {
    count: 10,
    time_range: '30_days',
    data: [
        { id: '1', name: 'alpha-server-01', device_type: 'Switch', interface: 'Gi1', interface_index: '1', bits_sent_bps: 420000, bits_sent: { value: 420, unit: 'K' } },
        { id: '2', name: 'database-mainway-11', device_type: 'Switch', interface: 'Gi2', interface_index: '2', bits_sent_bps: 310000, bits_sent: { value: 310, unit: 'K' } },
        { id: '3', name: 'gamma-database-07', device_type: 'Firewall', interface: 'Gi3', interface_index: '3', bits_sent_bps: 300000, bits_sent: { value: 300, unit: 'K' } },
        { id: '4', name: 'delta-application-03', device_type: 'Switch', interface: 'Gi4', interface_index: '4', bits_sent_bps: 280000, bits_sent: { value: 280, unit: 'K' } },
        { id: '5', name: 'theta-api-04', device_type: 'Load Balancer', interface: 'Gi5', interface_index: '5', bits_sent_bps: 200000, bits_sent: { value: 200, unit: 'K' } }
    ]
};

export const NETWORK_TOP_BANDWIDTH_USAGE: NetworkTopBandwidthUsageResponse = {
    count: 10,
    time_range: '30_days',
    data: [
        { id: '1', name: 'alpha-server-01', device_type: 'Switch', interface: 'Gi1', interface_index: '1', bits_received: { value: 182.7, unit: 'M' }, bits_sent: { value: 87.2, unit: 'M' }, speed: { value: 200, unit: 'Mbps' }, bandwidth_usage: 91.35 },
        { id: '2', name: 'database-mainway-11', device_type: 'Switch', interface: 'Gi2', interface_index: '2', bits_received: { value: 150.1, unit: 'M' }, bits_sent: { value: 63.4, unit: 'M' }, speed: { value: 200, unit: 'Mbps' }, bandwidth_usage: 75 },
        { id: '3', name: 'gamma-database-07', device_type: 'Firewall', interface: 'Gi3', interface_index: '3', bits_received: { value: 124, unit: 'M' }, bits_sent: { value: 40, unit: 'M' }, speed: { value: 200, unit: 'Mbps' }, bandwidth_usage: 62 },
        { id: '4', name: 'delta-application-03', device_type: 'Switch', interface: 'Gi4', interface_index: '4', bits_received: { value: 96, unit: 'M' }, bits_sent: { value: 22, unit: 'M' }, speed: { value: 200, unit: 'Mbps' }, bandwidth_usage: 51 },
        { id: '5', name: 'epsilon-router-05', device_type: 'Load Balancer', interface: 'Gi5', interface_index: '5', bits_received: { value: 48, unit: 'M' }, bits_sent: { value: 18, unit: 'M' }, speed: { value: 200, unit: 'Mbps' }, bandwidth_usage: 35 }
    ]
};

export const NETWORK_TOP_10_CONVERSATIONS_TABLE: NetworkTopConversationsTableResponse = {
    count: 10,
    time_range: '30_days',
    data: [
        {
            id: '91460024-eeb8-475e-962f-b600a1543275',
            name: 'alpha-server-01',
            device_type: 'Switch',
            interface: 'Gi1 (MGMT-interface)',
            interface_index: '1',
            bits_received_bps: 600000.0,
            bits_sent_bps: 450000.0,
            speed_bps: 2100000000.0,
            bits_received: {
                value: 600.0,
                unit: 'K'
            },
            bits_sent: {
                value: 450.0,
                unit: 'K'
            },
            interface_type: 'Ethernet (CSMA/CD)',
            operational_status: 'Up',
            speed: {
                value: 2.1,
                unit: 'Gbps'
            },
            bandwidth_usage: 0.03
        }
    ]
};

export const NETWORK_PERFORMANCE_WORKLOAD_INSIGHTS: NetworkPerformanceWorkloadInsightItem[] = [
    {
        device_name: 'Dev 1',
        cpu_utilization_percent: 96,
        memory_utilization_percent: 88,
        interface_traffic_in_mbps: 250,
        interface_traffic_out_mbps: 230
    },
    {
        device_name: 'Dev 2',
        cpu_utilization_percent: 92,
        memory_utilization_percent: 85,
        interface_traffic_in_mbps: 220,
        interface_traffic_out_mbps: 210
    },
    {
        device_name: 'Dev 3',
        cpu_utilization_percent: 85,
        memory_utilization_percent: 80,
        interface_traffic_in_mbps: 180,
        interface_traffic_out_mbps: 170
    },
    {
        device_name: 'Dev 4',
        cpu_utilization_percent: 78,
        memory_utilization_percent: 74,
        interface_traffic_in_mbps: 160,
        interface_traffic_out_mbps: 150
    },
    {
        device_name: 'Dev 5',
        cpu_utilization_percent: 72,
        memory_utilization_percent: 68,
        interface_traffic_in_mbps: 140,
        interface_traffic_out_mbps: 120
    },
    {
        device_name: 'Dev 6',
        cpu_utilization_percent: 70,
        memory_utilization_percent: 61,
        interface_traffic_in_mbps: 110,
        interface_traffic_out_mbps: 95
    },
    {
        device_name: 'Dev 7',
        cpu_utilization_percent: 65,
        memory_utilization_percent: 53,
        interface_traffic_in_mbps: 120,
        interface_traffic_out_mbps: 130
    },
    {
        device_name: 'Dev 8',
        cpu_utilization_percent: 58,
        memory_utilization_percent: 49,
        interface_traffic_in_mbps: 95,
        interface_traffic_out_mbps: 110
    },
    {
        device_name: 'Dev 9',
        cpu_utilization_percent: 52,
        memory_utilization_percent: 42,
        interface_traffic_in_mbps: 75,
        interface_traffic_out_mbps: 60
    },
    {
        device_name: 'Dev 10',
        cpu_utilization_percent: 45,
        memory_utilization_percent: 38,
        interface_traffic_in_mbps: 50,
        interface_traffic_out_mbps: 45
    }
];

export const NETWORK_INTERFACE_HEALTH_METRICS: NetworkInterfaceHealthMetricItem[] = [
    {
        interface_name: 'Ge0/0/1',
        device_name: 'Edge-RT-01',
        errors_in_per_sec: 12.4,
        errors_out_per_sec: 10.1,
        discards_in_per_sec: 15.2,
        discards_out_per_sec: 14.1
    },
    {
        interface_name: 'Ge0/0/2',
        device_name: 'DC-SW-02',
        errors_in_per_sec: 8.5,
        errors_out_per_sec: 9.4,
        discards_in_per_sec: 11.1,
        discards_out_per_sec: 7.8
    },
    {
        interface_name: 'Ge0/0/3',
        device_name: '2nd-SW-02',
        errors_in_per_sec: 4.6,
        errors_out_per_sec: 3.2,
        discards_in_per_sec: 2.1,
        discards_out_per_sec: 1.9
    },
    {
        interface_name: 'Ge0/0/4',
        device_name: 'Edge-RT-02',
        errors_in_per_sec: 3.8,
        errors_out_per_sec: 2.9,
        discards_in_per_sec: 1.8,
        discards_out_per_sec: 1.5
    },
    {
        interface_name: 'Ge0/0/5',
        device_name: 'DC-SW-01',
        errors_in_per_sec: 3.1,
        errors_out_per_sec: 2.4,
        discards_in_per_sec: 1.5,
        discards_out_per_sec: 1.2
    },
    {
        interface_name: 'Ge0/0/6',
        device_name: 'Core-RT-01',
        errors_in_per_sec: 2.5,
        errors_out_per_sec: 1.8,
        discards_in_per_sec: 1.2,
        discards_out_per_sec: 0.9
    },
    {
        interface_name: 'Ge0/0/7',
        device_name: 'Core-RT-02',
        errors_in_per_sec: 2.0,
        errors_out_per_sec: 1.5,
        discards_in_per_sec: 0.9,
        discards_out_per_sec: 0.7
    },
    {
        interface_name: 'Ge0/0/8',
        device_name: 'WAN-RT-01',
        errors_in_per_sec: 1.8,
        errors_out_per_sec: 1.2,
        discards_in_per_sec: 0.7,
        discards_out_per_sec: 0.5
    },
    {
        interface_name: 'Ge0/0/9',
        device_name: 'WAN-RT-02',
        errors_in_per_sec: 1.5,
        errors_out_per_sec: 0.9,
        discards_in_per_sec: 0.5,
        discards_out_per_sec: 0.3
    },
    {
        interface_name: 'Ge0/0/10',
        device_name: 'Access-SW-01',
        errors_in_per_sec: 1.0,
        errors_out_per_sec: 0.5,
        discards_in_per_sec: 0.2,
        discards_out_per_sec: 0.1
    }
];

export const NETWORK_DEVICE_AVAILABILITY: NetworkDeviceAvailabilityItem[] = [
    {
        name: 'DC-SW-01',
        type: 'Switch',
        manufacturer: 'Arista',
        model: '7050SX',
        location: 'DC-SFO-01',
        uptime_days: 98,
        availability_percent: 99.95,
        status: 'healthy',
        health_state: 'up',
        last_discovered: '02 Jul, 2026',
        device_count_weight: 168
    },
    {
        name: 'Edge-FW-01',
        type: 'Firewall',
        manufacturer: 'Palo Alto',
        model: 'PA-5250',
        location: 'DC-SFO-01',
        uptime_days: 45,
        availability_percent: 99.90,
        status: 'healthy',
        health_state: 'up',
        last_discovered: '02 Jul, 2026',
        device_count_weight: 112
    },
    {
        name: 'Core-SW-01',
        type: 'Switch',
        manufacturer: 'Cisco',
        model: 'Nexus 9500',
        location: 'DC-DAL-01',
        uptime_days: 12,
        availability_percent: 92.40,
        status: 'critical',
        health_state: 'down',
        last_discovered: '02 Jul, 2026',
        device_count_weight: 124
    },
    {
        name: 'DC-SW-02',
        type: 'Switch',
        manufacturer: 'Arista',
        model: '7050SX',
        location: 'DC-HER-01',
        uptime_days: 14,
        availability_percent: 97.80,
        status: 'warning',
        health_state: 'unknown',
        last_discovered: '02 Jul, 2026',
        device_count_weight: 156
    },
    {
        name: 'Edge-FW-02',
        type: 'Firewall',
        manufacturer: 'Palo Alto',
        model: 'PA-5250',
        location: 'DC-HER-01',
        uptime_days: 150,
        availability_percent: 99.92,
        status: 'healthy',
        health_state: 'up',
        last_discovered: '02 Jul, 2026',
        device_count_weight: 138
    },
    {
        name: 'WAN-SW-01',
        type: 'Switch',
        manufacturer: 'Cisco',
        model: 'Catalyst 9300',
        location: 'Branch-NY-01',
        uptime_days: 60,
        availability_percent: 99.85,
        status: 'healthy',
        health_state: 'up',
        last_discovered: '02 Jul, 2026',
        device_count_weight: 202
    },
    {
        name: 'Edge-FW-03',
        type: 'Firewall',
        manufacturer: 'Fortinet',
        model: 'FG-200F',
        location: 'Branch-NY-01',
        uptime_days: 19,
        availability_percent: 99.70,
        status: 'healthy',
        health_state: 'up',
        last_discovered: '02 Jul, 2026',
        device_count_weight: 86
    },
    {
        name: 'WAN-SW-02',
        type: 'Switch',
        manufacturer: 'Cisco',
        model: 'Catalyst 9300',
        location: 'Branch-LA-01',
        uptime_days: 41,
        availability_percent: 99.80,
        status: 'healthy',
        health_state: 'up',
        last_discovered: '01 Jul, 2026',
        device_count_weight: 196
    },
    {
        name: 'LB-01',
        type: 'Load Balancer',
        manufacturer: 'F5',
        model: 'BIG-IP i5800',
        location: 'DC-SFO-01',
        uptime_days: 241,
        availability_percent: 99.99,
        status: 'healthy',
        health_state: 'up',
        last_discovered: '02 Jul, 2026',
        device_count_weight: 94
    },
    {
        name: 'LB-02',
        type: 'Load Balancer',
        manufacturer: 'F5',
        model: 'BIG-IP i5800',
        location: 'DC-HER-01',
        uptime_days: 122,
        availability_percent: 99.95,
        status: 'healthy',
        health_state: 'up',
        last_discovered: '02 Jul, 2026',
        device_count_weight: 82
    },
    {
        name: 'VPN-GW-02',
        type: 'VPN Gateway',
        manufacturer: 'Cisco',
        model: 'ASA 5500',
        location: 'DC-DAL-01',
        uptime_days: 9,
        availability_percent: 96.50,
        status: 'warning',
        health_state: 'unknown',
        last_discovered: '02 Jul, 2026',
        device_count_weight: 74
    },
    {
        name: 'WAN-RT-02',
        type: 'Router',
        manufacturer: 'Cisco',
        model: 'ASR 9000',
        location: 'DC-DAL-01',
        uptime_days: 188,
        availability_percent: 89.90,
        status: 'critical',
        health_state: 'down',
        last_discovered: '02 Jul, 2026',
        device_count_weight: 144
    }
];

export const NETWORK_ENVIRONMENTAL_HEALTH_SUMMARY: NetworkEnvironmentalHealthSummaryItem[] = [
    {
        device_name: 'CORE-SW-01',
        device_type: 'Core Switch',
        power_supply_a_status: 'normal',
        power_supply_b_status: 'normal',
        fan_status_label: 'Healthy',
        fan_status_tone: 'healthy',
        fan_healthy_count: 3,
        fan_total_count: 3,
        inlet_temp_c: 24,
        outlet_temp_c: 33,
        hotspot_temp_c: 39
    },
    {
        device_name: 'CORE-SW-02',
        device_type: 'Core Switch',
        power_supply_a_status: 'normal',
        power_supply_b_status: 'normal',
        fan_status_label: 'Healthy',
        fan_status_tone: 'healthy',
        fan_healthy_count: 3,
        fan_total_count: 3,
        inlet_temp_c: 25,
        outlet_temp_c: 34,
        hotspot_temp_c: 41
    },
    {
        device_name: 'DIST-SW-01',
        device_type: 'Distribution Switch',
        power_supply_a_status: 'normal',
        power_supply_b_status: 'warning',
        fan_status_label: 'Healthy',
        fan_status_tone: 'healthy',
        fan_healthy_count: 3,
        fan_total_count: 3,
        inlet_temp_c: 26,
        outlet_temp_c: 35,
        hotspot_temp_c: 43
    },
    {
        device_name: 'DIST-SW-02',
        device_type: 'Distribution Switch',
        power_supply_a_status: 'normal',
        power_supply_b_status: 'normal',
        fan_status_label: 'Fan 2 Warning',
        fan_status_tone: 'warning',
        fan_healthy_count: 2,
        fan_total_count: 3,
        inlet_temp_c: 27,
        outlet_temp_c: 36,
        hotspot_temp_c: 45
    },
    {
        device_name: 'ACCESS-SW-01',
        device_type: 'Access Switch',
        power_supply_a_status: 'normal',
        power_supply_b_status: 'normal',
        fan_status_label: 'Healthy',
        fan_status_tone: 'healthy',
        fan_healthy_count: 2,
        fan_total_count: 2,
        inlet_temp_c: 23,
        outlet_temp_c: 31,
        hotspot_temp_c: 37
    },
    {
        device_name: 'ACCESS-SW-02',
        device_type: 'Access Switch',
        power_supply_a_status: 'normal',
        power_supply_b_status: 'normal',
        fan_status_label: 'Healthy',
        fan_status_tone: 'healthy',
        fan_healthy_count: 2,
        fan_total_count: 2,
        inlet_temp_c: 24,
        outlet_temp_c: 32,
        hotspot_temp_c: 38
    },
    {
        device_name: 'ACCESS-SW-03',
        device_type: 'Access Switch',
        power_supply_a_status: 'warning',
        power_supply_b_status: 'normal',
        fan_status_label: 'Healthy',
        fan_status_tone: 'healthy',
        fan_healthy_count: 2,
        fan_total_count: 2,
        inlet_temp_c: 26,
        outlet_temp_c: 34,
        hotspot_temp_c: 42
    },
    {
        device_name: 'EDGE-RTR-01',
        device_type: 'Edge Router',
        power_supply_a_status: 'normal',
        power_supply_b_status: 'normal',
        fan_status_label: 'Healthy',
        fan_status_tone: 'healthy',
        fan_healthy_count: 4,
        fan_total_count: 4,
        inlet_temp_c: 28,
        outlet_temp_c: 38,
        hotspot_temp_c: 47
    },
    {
        device_name: 'FIREWALL-01',
        device_type: 'Firewall',
        power_supply_a_status: 'normal',
        power_supply_b_status: 'normal',
        fan_status_label: 'Fan 3 Warning',
        fan_status_tone: 'warning',
        fan_healthy_count: 3,
        fan_total_count: 4,
        inlet_temp_c: 29,
        outlet_temp_c: 39,
        hotspot_temp_c: 48
    },
    {
        device_name: 'DC-GW-01',
        device_type: 'Data Center Gateway',
        power_supply_a_status: 'normal',
        power_supply_b_status: 'normal',
        fan_status_label: 'Healthy',
        fan_status_tone: 'healthy',
        fan_healthy_count: 4,
        fan_total_count: 4,
        inlet_temp_c: 25,
        outlet_temp_c: 34,
        hotspot_temp_c: 40
    }
];

export const NETWORK_ENVIRONMENTAL_HEALTH_SUMMARY_TABLE_RESPONSE: NetworkEnvironmentalHealthSummaryTableResponse = {
    count: 10,
    time_range: '30_days',
    data: [
        {
            device_id: '91460024-eeb8-475e-962f-b600a1543275',
            device_name: 'CORE-SW-01',
            device_type: 'Core Switch',
            power_supply_a: {
                code: 'normal',
                label: 'Normal'
            },
            power_supply_b: {
                code: 'normal',
                label: 'Normal'
            },
            fan_status: {
                total: 3,
                healthy: 3,
                warning: 0,
                failed: 0,
                unknown: 0,
                status: {
                    code: 'healthy',
                    label: 'Healthy'
                },
                warning_fans: [],
                failed_fans: []
            },
            inlet_temperature: {
                value: 24,
                unit: 'C',
                status: {
                    code: 'normal',
                    label: 'Normal'
                }
            },
            outlet_temperature: {
                value: 33,
                unit: 'C',
                status: {
                    code: 'normal',
                    label: 'Normal'
                }
            },
            hotspot_temperature: {
                value: 39,
                unit: 'C',
                status: {
                    code: 'normal',
                    label: 'Normal'
                }
            }
        }
    ]
};

export const NETWORK_TOP_DEVICES_BY_HOTSPOT_TEMPERATURE_RESPONSE: NetworkTopDevicesByHotspotTemperatureResponse = {
    count: 10,
    time_range: '30_days',
    thresholds: {
        warning: 40,
        critical: 47,
        unit: 'C'
    },
    data: [
        {
            device_id: 'ca12de99-08cb-4e52-a42d-05923acc38cf',
            device_name: 'CORE-SW-07',
            device_type: 'Core Switch',
            temperature: 48,
            unit: 'C',
            status: {
                code: 'critical',
                label: 'Critical'
            }
        },
        {
            device_id: '431703be-94a1-4bd5-ae44-2fa90b9608df',
            device_name: 'FIREWALL-01',
            device_type: 'Firewall',
            temperature: 47,
            unit: 'C',
            status: {
                code: 'critical',
                label: 'Critical'
            }
        }
    ]
};

export const NETWORK_AVERAGE_TEMPERATURE_BY_SENSOR_TYPE_RESPONSE: NetworkAverageTemperatureBySensorTypeResponse = {
    time_range: '30_days',
    data: [
        {
            sensor_type: 'inlet_temperature',
            label: 'Inlet Temperature',
            average_temperature: 25,
            unit: 'C',
            device_count: 10,
            warning_threshold: 28,
            critical_threshold: 35
        },
        {
            sensor_type: 'outlet_temperature',
            label: 'Outlet Temperature',
            average_temperature: 34,
            unit: 'C',
            device_count: 10,
            warning_threshold: 36,
            critical_threshold: 45
        },
        {
            sensor_type: 'hotspot_temperature',
            label: 'HotSpot Temperature',
            average_temperature: 41,
            unit: 'C',
            device_count: 10,
            warning_threshold: 40,
            critical_threshold: 47
        }
    ]
};

export const NETWORK_POWER_SUPPLY_STATUS_DISTRIBUTION_RESPONSE: NetworkPowerSupplyStatusDistributionResponse = {
    time_range: '30_days',
    data: [
        {
            power_supply: 'Power Supply A',
            normal: 18,
            warning: 2,
            failed: 0,
            unknown: 0
        },
        {
            power_supply: 'Power Supply B',
            normal: 18,
            warning: 2,
            failed: 0,
            unknown: 0
        }
    ]
};

export const NETWORK_FAN_HEALTH_BY_DEVICE_RESPONSE: NetworkFanHealthByDeviceResponse = {
    count: 10,
    time_range: '30_days',
    data: [
        {
            device_id: '431703be-94a1-4bd5-ae44-2fa90b9608df',
            device_name: 'FIREWALL-01',
            device_type: 'Firewall',
            healthy_fans: 3,
            warning_fans: 1,
            failed_fans: 0,
            unknown_fans: 0,
            total_fans: 4,
            display: '3/4',
            status: {
                code: 'warning',
                label: 'Warning'
            }
        },
        {
            device_id: 'f89bc845-d63b-41eb-91d9-03085c4e1212',
            device_name: 'DIST-SW-02',
            device_type: 'Distribution Switch',
            healthy_fans: 2,
            warning_fans: 1,
            failed_fans: 0,
            unknown_fans: 0,
            total_fans: 3,
            display: '2/3',
            status: {
                code: 'warning',
                label: 'Warning'
            }
        },
        {
            device_id: '4acba8d9-1dcf-444c-9ccb-ef8008abf6fb',
            device_name: 'CORE-SW-07',
            device_type: 'Core Switch',
            healthy_fans: 4,
            warning_fans: 0,
            failed_fans: 0,
            unknown_fans: 0,
            total_fans: 4,
            display: '4/4',
            status: {
                code: 'healthy',
                label: 'Healthy'
            }
        }
    ]
};

export const NETWORK_ALERT_EVENTS_VIEW: NetworkAlertEventsView = {
    summary_metrics: [
        { label: 'Critical Alerts', value: 24, tone: 'critical' },
        { label: 'Warning Alerts', value: 67, tone: 'warning' },
        { label: 'Open ITSM Tickets', value: 14, tone: 'info' }
    ],
    alerts_by_severity: [
        { severity: 'critical', count: 268 },
        { severity: 'warning', count: 432 },
        { severity: 'normal', count: 894 }
    ],
    alerts_by_device_type: [
        { device_type: 'Switch', critical: 220, warning: 690, info: 540 },
        { device_type: 'Firewall', critical: 150, warning: 200, info: 360 },
        { device_type: 'Load Balancer', critical: 240, warning: 470, info: 120 },
        { device_type: 'PDU', critical: 180, warning: 180, info: 70 }
    ],
    open_itsm_tickets_by_device_type: [
        { device_type: 'Switch', tickets: 1450 },
        { device_type: 'Firewall', tickets: 730 },
        { device_type: 'Load Balancer', tickets: 840 },
        { device_type: 'PDU', tickets: 430 }
    ],
    alert_stats: [
        {
            title: 'Noise Reduction',
            highlight_value: '77%',
            metrics: [
                { label: 'Dedupe Events', value: '589' },
                { label: 'Suppressed Events', value: '289' },
                { label: 'Correlated', value: '32' }
            ]
        },
        {
            title: 'First Response',
            highlight_value: '92%',
            metrics: [
                { label: 'Auto Cloned', value: '126' },
                { label: 'Ticket Created', value: '456' },
                { label: 'Auto Closed', value: '378' }
            ]
        }
    ],
    top_critical_alerts: [
        {
            id: '1744',
            id_value: 1744,
            device_name: 'UL_Switch_Disk',
            severity: 'critical',
            description: 'Ethernet has changed state to down.',
            source: 'Unity',
            acknowledged: true,
            duration_display: '34s',
            duration_seconds: 34
        },
        {
            id: '1746',
            id_value: 1746,
            device_name: 'UL_Switch_Test',
            severity: 'critical',
            description: 'Ethernet has changed state to testing.',
            source: 'Unity',
            acknowledged: false,
            duration_display: '36s',
            duration_seconds: 36
        },
        {
            id: '2319',
            id_value: 2319,
            device_name: 'UL_Firewall_Test',
            severity: 'critical',
            description: 'High bandwidth usage detected on uplink.',
            source: 'Unity',
            acknowledged: false,
            duration_display: '39s',
            duration_seconds: 39
        },
        {
            id: '6644',
            id_value: 6644,
            device_name: 'UL_Switch_AT',
            severity: 'warning',
            description: 'Device has been replaced in inventory.',
            source: 'Zabbix',
            acknowledged: true,
            duration_display: '01m',
            duration_seconds: 60
        },
        {
            id: '9956',
            id_value: 9956,
            device_name: 'UL_LoadBalancer_09',
            severity: 'warning',
            description: 'System name has been updated unexpectedly.',
            source: 'Nagios',
            acknowledged: false,
            duration_display: '02m 44s',
            duration_seconds: 164
        },
        {
            id: '1470',
            id_value: 1470,
            device_name: 'UL_Router_AI',
            severity: 'warning',
            description: 'Device has been replaced at monitored site.',
            source: 'Unity',
            acknowledged: true,
            duration_display: '08m 56s',
            duration_seconds: 536
        },
        {
            id: '7452',
            id_value: 7452,
            device_name: 'UL_LoadBalancer_04',
            severity: 'critical',
            description: 'Interface link down on external VIP path.',
            source: 'Nagios',
            acknowledged: true,
            duration_display: '10m 15s',
            duration_seconds: 615
        },
        {
            id: '2354',
            id_value: 2354,
            device_name: 'UL_Switch_BT',
            severity: 'warning',
            description: 'Interface reporting elevated input errors.',
            source: 'Unity',
            acknowledged: false,
            duration_display: '20m 13s',
            duration_seconds: 1213
        },
        {
            id: '0996',
            id_value: 996,
            device_name: 'UL_Firewall_007',
            severity: 'critical',
            description: 'Unavailable by ICMP and service probe.',
            source: 'Nagios',
            acknowledged: false,
            duration_display: '01h 09m',
            duration_seconds: 4140
        },
        {
            id: '0994',
            id_value: 994,
            device_name: 'UL_Firewall_007',
            severity: 'critical',
            description: 'Unavailable by ICMP during maintenance window.',
            source: 'Zabbix',
            acknowledged: true,
            duration_display: '01h 09m',
            duration_seconds: 4140
        }
    ]
};

export const NETWORK_AUTO_REMEDIATION_SUMMARY: NetworkAutoRemediationSummary = {
    time_range: 'last_year',
    summary: {
        total_runs: 0,
        success_percent: 0,
        failed_percent: 0,
        running_percent: 0,
        avg_duration: '0 sec',
        auto_remediations: 0
    },
    top_auto_remediations: []
};
