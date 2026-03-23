import { Injectable } from '@angular/core';
import { BMS_OBSERVIUM_GRAPH } from './bms-graph.const';
import { FIREWALL_OBSERVIUM_GRAPH } from './firewall-graph.const';
import { VMS_OBSERVIUM_GRAPH } from './vms-graph.const';
import { SWITCH_OBSERVIUM_GRAPH } from './switch-graph.const';
import { LOADBALANCER_OBSERVIUM_GRAPH } from './loadbalancer-graph.const';
import { HYPERVISOR_OBSERVIUM_GRAPH } from './hypervisor-graph.const';
import { DeviceGraph, DeviceGraphConfig, DeviceGraphType } from './observium-graph.type';
import { PDU_OBSERVIUM_GRAPH } from './pdu-graphs.const';
import { OBSERVIUM_PORTS_GRAPH } from './ports-graph-util';
import { STORAGEDEVICE_OBSERVIUM_GRAPH } from './storagedevice-graph.const';
import { MAC_MINI_OBSERVIUM_GRAPH } from './macmini-graph.const';

@Injectable({
    providedIn: 'root'
})
export class ObserviumGraphUtil {
    private observiumDeviceGraph: DeviceGraph = deviceGraph;
    constructor() {
    }

    getObserviumDeviceAPIMapping(deviceType: string): ObserviumDeviceAPIMapping {
        switch (deviceType) {
            case 'Hypervisor': return ObserviumDeviceAPIMapping.HYPERVISOR;
            case 'BMServer': return ObserviumDeviceAPIMapping.BMSERVER;
            case 'Firewall': return ObserviumDeviceAPIMapping.FIREWALL;
            case 'Switch': return ObserviumDeviceAPIMapping.SWITCH;
            case 'LoadBalancer': return ObserviumDeviceAPIMapping.LOADBALANCER;
            case 'PDU': return ObserviumDeviceAPIMapping.PDU;
            case 'MAC_Mini': return ObserviumDeviceAPIMapping.MACMINI;
        }
    }

    getObserviumDeviceGraphByName(deviceType: string): DeviceGraphConfig {
        switch (deviceType) {
            case 'Hypervisor': return this.observiumDeviceGraph.HYPERVISOR;
            case 'BMServer': return this.observiumDeviceGraph.BMS;
            case 'BM Server': return this.observiumDeviceGraph.BMS;
            case 'Firewall': return this.observiumDeviceGraph.FIREWALL;
            case 'Switch': return this.observiumDeviceGraph.SWITCHES;
            case 'LoadBalancer': return this.observiumDeviceGraph.LOADBALANCER;
            case 'Load Balancer': return this.observiumDeviceGraph.LOADBALANCER;
            case 'PDU': return this.observiumDeviceGraph.PDU;
            case 'Storage': return this.observiumDeviceGraph.STORAGE;
            case 'macmini': return this.observiumDeviceGraph.MACMINI;
            case 'Mac Device': return this.observiumDeviceGraph.MACMINI;
            case 'VMware vCenter VM': return this.observiumDeviceGraph.VMS;
            case 'vCloud Director VM': return this.observiumDeviceGraph.VMS;
            case 'Hyper-V': return this.observiumDeviceGraph.VMS;
            case 'ESXi': return this.observiumDeviceGraph.VMS;
            case 'OpenStack VM': return this.observiumDeviceGraph.VMS;
            case 'Custom VM': return this.observiumDeviceGraph.VMS;
        }
    }

    getGraphTypes(deviceType: string): DeviceGraphType[] {
        let deviceGraph: DeviceGraphConfig = this.getObserviumDeviceGraphByName(deviceType);
        let deviceGraphArray: DeviceGraphType[] = [];
        for (const graphtype in deviceGraph) {
            for (const graph in deviceGraph[graphtype]) {
                deviceGraph[graphtype][graph].map(graphData => {
                    deviceGraphArray.push(graphData);
                })
            }
        }
        return deviceGraphArray;
    }

    getAllDevicesGraphTypes() {
        let graphTypes: DeviceGraphType[] = [];
        graphTypes = graphTypes.concat(this.getGraphTypes('Hypervisor'));
        graphTypes = graphTypes.concat(this.getGraphTypes('BMServer'));
        graphTypes = graphTypes.concat(this.getGraphTypes('Firewall'));
        graphTypes = graphTypes.concat(this.getGraphTypes('Switch'));
        graphTypes = graphTypes.concat(this.getGraphTypes('LoadBalancer'));
        graphTypes = graphTypes.concat(this.getGraphTypes('macmini'));
        return graphTypes;
    }
}

export enum ObserviumDeviceAPIMapping {
    FIREWALL = 'firewall',
    SWITCH = 'switch',
    LOADBALANCER = 'load_balancer',
    HYPERVISOR = 'servers',
    BMSERVER = 'servers',
    PDU = 'pdu',
    MACMINI = 'macmini'
}

const deviceGraph: DeviceGraph = {
    BMS: BMS_OBSERVIUM_GRAPH,
    FIREWALL: FIREWALL_OBSERVIUM_GRAPH,
    VMS: VMS_OBSERVIUM_GRAPH,
    SWITCHES: SWITCH_OBSERVIUM_GRAPH,
    LOADBALANCER: LOADBALANCER_OBSERVIUM_GRAPH,
    HYPERVISOR: HYPERVISOR_OBSERVIUM_GRAPH,
    PDU: PDU_OBSERVIUM_GRAPH,
    PORT: OBSERVIUM_PORTS_GRAPH,
    STORAGE: STORAGEDEVICE_OBSERVIUM_GRAPH,
    MACMINI: MAC_MINI_OBSERVIUM_GRAPH
}