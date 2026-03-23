import { DeviceGraphType } from './observium-graph.type';

export const OBSERVIUM_PORTS_GRAPH: DeviceGraphType[] = [
    {
        label: 'Traffic',
        graphType: 'port_bits',
        deviceType: null,
        deviceId: '',
        portId: ''
    },
    {
        label: 'Unicast Packets',
        graphType: 'port_upkts',
        deviceType: null,
        deviceId: '',
        portId: ''
    },
    {
        label: 'Non Unicast Packets',
        graphType: 'port_nupkts',
        deviceType: null,
        deviceId: '',
        portId: ''
    },
    {
        label: 'Average Packet Size',
        graphType: 'port_pktsize',
        deviceType: null,
        deviceId: '',
        portId: ''
    },
    {
        label: 'Percent Utilization',
        graphType: 'port_percent',
        deviceType: null,
        deviceId: '',
        portId: ''
    },
    {
        label: 'Errors',
        graphType: 'port_errors',
        deviceType: null,
        deviceId: '',
        portId: ''
    },
    {
        label: 'Discards',
        graphType: 'port_discards',
        deviceType: null,
        deviceId: '',
        portId: ''
    }
]