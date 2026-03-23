import { DeviceGraphConfig } from './observium-graph.type';

export const LOADBALANCER_OBSERVIUM_GRAPH: DeviceGraphConfig = {
    GRAPH: {
        SYSTEM: [
            {
                label: 'FDB Usage',
                graphType: 'device_fdb_count',
                deviceType: null,
                deviceId: '',
            },
            {
                label: 'Memory Usage',
                graphType: 'device_mempool',
                deviceType: null,
                deviceId: '',
            },
            {
                label: 'Processors',
                graphType: 'device_processor',
                deviceType: null,
                deviceId: '',
            },
            {
                label: 'Device Uptime',
                graphType: 'device_uptime',
                deviceType: null,
                deviceId: '',
            }
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
                deviceId: '',
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
            }
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
                deviceId: '',
            }
        ]
    },
    HEALTHGRAPHS: {
        OVERVIEW: [
            {
                label: 'Processor',
                graphType: 'device_processor',
                deviceType: null,
                deviceId: '',
            },
            {
                label: 'Memory',
                graphType: 'device_mempool',
                deviceType: null,
                deviceId: '',
            },
            {
                label: 'Status',
                graphType: 'device_availability',
                deviceType: null,
                deviceId: '',
            }
        ]
    }
}