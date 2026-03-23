import { DeviceGraphConfig } from './observium-graph.type';

export const BMS_OBSERVIUM_GRAPH: DeviceGraphConfig = {
    GRAPH: {
        SYSTEM: [
            {
                label: 'Running Processes',
                graphType: 'device_hr_processes',
                deviceType: null,
                deviceId: '',
            },
            {
                label: 'Users Logged In',
                graphType: 'device_hr_users',
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
                label: 'Filesystem Usage',
                graphType: 'device_storage',
                deviceType: null,
                deviceId: '',
            },
            {
                label: 'Context Switches',
                graphType: 'device_ucd_contexts',
                deviceType: null,
                deviceId: '',
            },
            {
                label: 'Detailed Processor Utilization',
                graphType: 'device_ucd_cpu',
                deviceType: null,
                deviceId: '',
            },
            {
                label: 'System Interrupts',
                graphType: 'device_ucd_interrupts',
                deviceType: null,
                deviceId: '',
            },
            {
                label: 'System I/O Activity',
                graphType: 'device_ucd_io',
                deviceType: null,
                deviceId: '',
            },
            {
                label: 'Load Averages',
                graphType: 'device_ucd_load',
                deviceType: null,
                deviceId: '',
            },
            {
                label: 'Detailed Memory',
                graphType: 'device_ucd_memory',
                deviceType: null,
                deviceId: '',
            },
            {
                label: 'Extended Processor Utilization',
                graphType: 'device_ucd_ss_cpu',
                deviceType: null,
                deviceId: '',
            },
            {
                label: 'Swap I/O Activity',
                graphType: 'device_ucd_swap_io',
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
                label: 'IPv4 Packet Statistics',
                graphType: 'device_ipsystemstats_ipv4',
                deviceType: null,
                deviceId: '',
            },
            {
                label: 'IPv4 Fragmentation Statistics',
                graphType: 'device_ipsystemstats_ipv4_frag',
                deviceType: null,
                deviceId: '',
            },
            {
                label: 'IPv6 Packet Statistics',
                graphType: 'device_ipsystemstats_ipv6',
                deviceType: null,
                deviceId: null,
            },
            {
                label: 'IPv6 Fragmentation Statistics',
                graphType: 'device_ipsystemstats_ipv6_frag',
                deviceType: null,
                deviceId: '',
            },
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
                deviceId: null,
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
                label: 'Storage',
                graphType: 'device_storage',
                deviceType: null,
                deviceId: '',
            },
            {
                label: 'Disk I/O',
                graphType: 'device_diskio',
                deviceType: null,
                deviceId: '',
            }
        ]
    }
}