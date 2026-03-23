import { DeviceGraphConfig } from './observium-graph.type';

export const PDU_OBSERVIUM_GRAPH: DeviceGraphConfig = {
    GRAPH: {
        SYSTEM: [
            {
                label: 'Device Uptime',
                graphType: 'device_uptime',
                deviceType: null,
                deviceId: '',
            },
        ],
        NETSTAT: [
            {
                label: 'ICMP Statistics',
                graphType: 'device_netstat_icmp',
                deviceType: null,
                deviceId: '',
            },
            {
                label: 'ICMP Informational Statistics',
                graphType: 'device_netstat_icmp_info',
                deviceType: null,
                deviceId: '',
            },
            {
                label: 'IP Statistics',
                graphType: 'device_netstat_ip',
                deviceType: null,
                deviceId: null,
            },
            {
                label: 'IP Fragmentation Statistics',
                graphType: 'device_netstat_ip_frag',
                deviceType: null,
                deviceId: '',
            },
            {
                label: 'SNMP Packets',
                graphType: 'device_netstat_snmp_packets',
                deviceType: null,
                deviceId: '',
            },
            {
                label: 'SNMP Statistics',
                graphType: 'device_netstat_snmp_stats',
                deviceType: null,
                deviceId: '',
            },
            {
                label: 'TCP Established Connections',
                graphType: 'device_netstat_tcp_currestab',
                deviceType: null,
                deviceId: '',
            },
            {
                label: 'TCP Segments',
                graphType: 'device_netstat_tcp_segments',
                deviceType: null,
                deviceId: '',
            },
            {
                label: 'TCP Statistics',
                graphType: 'device_netstat_tcp_stats',
                deviceType: null,
                deviceId: '',
            },
            {
                label: 'UDP Datagrams',
                graphType: 'device_netstat_udp_datagrams',
                deviceType: null,
                deviceId: '',
            },
            {
                label: 'UDP Errors',
                graphType: 'device_netstat_udp_errors',
                deviceType: null,
                deviceId: '',
            },
        ],
        POLLER: [
            {
                label: 'Ping Response',
                graphType: 'device_ping',
                deviceType: null,
                deviceId: '',
            },
            {
                label: 'SNMP Response',
                graphType: 'device_ping_snmp',
                deviceType: null,
                deviceId: '',
            },
            {
                label: 'Poller Duration',
                graphType: 'device_poller_perf',
                deviceType: null,
                deviceId: null,
            }
        ]
    },
    HEALTHGRAPHS: {
        OVERVIEW: [
            {
                label: 'Status',
                graphType: 'device_availability',
                deviceType: null,
                deviceId: '',
            },
            {
                label: 'Current',
                graphType: 'device_current',
                deviceType: null,
                deviceId: '',
            },
            {
                label: 'Power',
                graphType: 'device_power',
                deviceType: null,
                deviceId: '',
            },
            {
                label: 'Voltage',
                graphType: 'device_voltage',
                deviceType: null,
                deviceId: '',
            }
        ]
    }
}