import { DeviceGraphConfig } from './observium-graph.type';

export const STORAGEDEVICE_OBSERVIUM_GRAPH: DeviceGraphConfig = {
    GRAPH: {
        SYSTEM: [
            {
                label: 'Device Availability',
                graphType: 'device_availability',
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
        STORAGE: [
            {
                label: 'Filesystem Usage',
                graphType: 'device_storage',
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
                label: 'Storage',
                graphType: 'device_storage',
                deviceType: null,
                deviceId: '',
            }
        ],
        DISKIO: [
            {
                label: 'Disk I/O Bits',
                graphType: 'device_diskio_bits',
                deviceType: null,
                deviceId: '',
            },
            {
                label: 'Disk I/O Ops',
                graphType: 'device_diskio_ops',
                deviceType: null,
                deviceId: '',
            }
        ]
    }
}