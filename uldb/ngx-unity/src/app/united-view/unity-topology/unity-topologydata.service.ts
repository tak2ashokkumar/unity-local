import { Injectable } from '@angular/core';
import { UnityAzureTopologyNode } from 'src/app/shared/SharedEntityTypes/azure.type';
import { UnityGCPTopologyNode } from 'src/app/shared/SharedEntityTypes/gcp.type';
import { UnityViewNetworkTopologyNode } from 'src/app/shared/SharedEntityTypes/network-topology.type';
import { UnityOciTopologyNode } from 'src/app/shared/SharedEntityTypes/oci.type';

@Injectable({
  providedIn: 'root'
})
export class UnityTopologydataService {

  constructor() { }

  getNodeSizeByLength(nodeCount: number) {
    return nodeCount < 15 ? 20 : 15;
  }

  getNodelabel(node: UnityViewNetworkTopologyNode) {
    if (node.name.length) {
      return node.name.length < 20 ? node.name : `${node.name.slice(0, 12)}...`;
    } else {
      return node.ip_address;
    }
  }

  getNodeRedirectLink(node: UnityViewNetworkTopologyNode) {
    switch (node.device_type) {
      case 'switch': return `/unitycloud/devices/switches/${node.uuid}/zbx/details`;
      case 'firewall': return `/unitycloud/devices/firewalls/${node.uuid}/zbx/details`;
      case 'load_balancer': return `/unitycloud/devices/loadbalancers/${node.uuid}/zbx/details`;
      case 'hypervisor': return `/unitycloud/devices/hypervisors/${node.uuid}/zbx/details`;
      case 'bms': return `unitycloud/devices/bmservers/${node.uuid}/zbx/details`;
      case 'mac_device': return `/unitycloud/devices/macdevices/${node.uuid}/zbx/details`;
      case 'storage': return `/unitycloud/devices/storagedevices/${node.uuid}/zbx/details`;
      case 'database': return `/unitycloud/devices/databases`;
      case 'mobile': return `/unitycloud/devices/mobiledevices`;
      case 'vmware': return `/unitycloud/devices/vms/vmware/${node.uuid}/zbx/details`;
      case 'vcloud': return `/unitycloud/devices/vms/vcloud/`;
      case 'hyperv': return `/unitycloud/devices/vms/hyperv/${node.uuid}/zbx/details`;
      case 'esxi': return `/unitycloud/devices/vms/esxi/${node.uuid}/zbx/details`;
      case 'open_stack': return `/unitycloud/devices/vms/openstack/`;
      case 'g3_kvm': return `/unitycloud/devices/vms/g3kvm/`;
      case 'proxmox': return `/unitycloud/devices/vms/proxmox/`;
      case 'vm':
      case 'virtual_machine': return `/unitycloud/devices/vms/custom/${node.uuid}/zbx/details`;
      case 'instance': return `/unitycloud/devices/vms/aws/`;
      case 'azurevirtualmachine': return `/unitycloud/devices/vms/azure/`;
      case 'gcpvirtualmachines': return `/unitycloud/devices/vms/gcp`;
      case 'oraclevirtualmachine':
      case 'ocivirtualmachines': return `/unitycloud/devices/vms/oracle`;
      default:
        // pdu commented due to un availability of dcid with pdu id
        // case 'pdu': return `unitycloud/datacenter/af8345e6-6569-4fb6-8a1b-732e777fe7d2/pdus/${node.uuid}/zbx/details`;
        return null;
    }
  }

  getAzureNodelabel(node: UnityAzureTopologyNode) {
    if (node.name.length) {
      return node.name.length < 20 ? node.name : `${node.name.slice(0, 12)}...`;
    } else {
      return '';
    }
  }

  getAzureNodeRedirectLink(node: UnityAzureTopologyNode) {
    return `setup/integration/azure/instances/${node.account}/resources/${node.uuid}`;
  }

  getOciNodelabel(node: UnityOciTopologyNode) {
    if (node.name.length) {
      return node.name.length < 20 ? node.name : `${node.name.slice(0, 12)}...`;
    } else {
      return '';
    }
  }

  getOciNodeRedirectLink(node: UnityOciTopologyNode) {
    return `setup/integration/oci/instances/${node.account}/resources/${node.uuid}`;
  }

  getGCPNodelabel(node: UnityGCPTopologyNode) {
    if (node.name.length) {
      return node.name.length < 20 ? node.name : `${node.name.slice(0, 12)}...`;
    } else {
      return '';
    }
  }

  getGCPNodeRedirectLink(node: UnityGCPTopologyNode) {
    return `setup/integration/gcp/instances/${node.account}/resources/${node.uuid}`;
  }
}
