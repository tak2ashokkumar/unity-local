import { Injectable } from '@angular/core';
import { AbstractControl, FormArray, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import * as moment from 'moment';
import * as momentTz from 'moment-timezone';
import { APIDeviceSensor, DeviceSensors, SensorData, SensorDataList } from 'src/app/united-cloud/shared/entities/device-sensor.type';
import { UsageData, UsageStatsPercent } from 'src/app/united-cloud/shared/entities/usage-data.type';
import { environment } from 'src/environments/environment';
import { DateRangeInUnix } from '../SharedEntityTypes/DateRangeInUnix.type';
import { GraphRange } from '../SharedEntityTypes/graph-range.type';
import { UserInfoService } from '../user-info.service';

@Injectable({
  providedIn: 'root'
})
export class AppUtilityService {

  constructor(private userInfo: UserInfoService) { }

  getPercentageChange(currentValue: number, previousValue: number) {
    if (currentValue === previousValue) {
      return 0;
    }

    if (previousValue === 0) {
      return 100;
    }

    return Math.abs(Math.round(((currentValue - previousValue) / previousValue) * 100));
  }


  toUpperCase(input: string | string[]) {
    if (!input) {
      return;
    }
    if (typeof input === 'string') {
      const arr = input.split(/[_-]/g);
      for (var i = 0; i < arr.length; i++) {
        arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].slice(1);
      }
      return arr.join(" ");
    } else {
      let tempInpArr = [];
      input.forEach(inp => {
        const arr = inp.split(/[_-]/g);
        for (var i = 0; i < arr.length; i++) {
          arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].slice(1);
        }
        tempInpArr.push(arr.join(" "));
      });
      return tempInpArr.join(',');
    }
  }

  toTitleCase(str: string) {
    return str.replace(
      /\w\S*/g,
      (text: any) => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
    );
  }

  camelCaseToTitleCase(s: string) {
    let result = s.replace(/([A-Z])/g, ' $1');
    result = result.charAt(0).toUpperCase() + result.slice(1);
    let splitWords = result.split(" ");
    for (var i = 0; i < splitWords.length; i++) {
      if (splitWords[i] == 'Ip' || splitWords[i] == 'Os') {
        splitWords[i] = splitWords[i].toUpperCase();
      }
    }
    return splitWords.join(" ");
  }

  getDeviceDisplayName(input: string) {
    switch (input) {
      case 'vm': return 'Virtual Machine';
      case 'bms': return 'Bare Metal';
      default: return this.toUpperCase(input);
    }
  }

  getUnityDeviceTypes(): UnityDeviceType[] {
    return UNITY_DEVICE_TYPES;
  }

  getCloudTypeByPlatformType(platformType: string): PlatFormMapping {
    switch (platformType) {
      case 'VMware': return PlatFormMapping.VMWARE;
      case 'vCloud Director': return PlatFormMapping.VCLOUD;
      case 'OpenStack': return PlatFormMapping.OPENSTACK;
      case 'ESXi': return PlatFormMapping.ESXI;
      case 'Hyperv': return PlatFormMapping.HYPER_V;
      case 'Custom': return PlatFormMapping.CUSTOM;
      case 'Proxmox': return PlatFormMapping.PROXMOX;
      case 'G3 KVM': return PlatFormMapping.G3_KVM;
      case 'AWS': return PlatFormMapping.AWS;
      case 'Azure': return PlatFormMapping.AZURE;
      case 'GCP': return PlatFormMapping.GCP;
      case 'United Private Cloud vCenter': return PlatFormMapping.UNITED_PRIVATE_CLOUD_VCENTER;
      case 'Nutanix': return PlatFormMapping.NUTANIX;
      default: return null;
    }
  }

  getDeviceMappingByDeviceType(deviceType: string,): DeviceMapping {
    switch (deviceType) {
      case 'switch': return DeviceMapping.SWITCHES;
      case 'firewall': return DeviceMapping.FIREWALL;
      case 'load_balancer': return DeviceMapping.LOAD_BALANCER;
      case 'hypervisor': return DeviceMapping.HYPERVISOR;
      case 'bms': return DeviceMapping.BARE_METAL_SERVER;
      case 'baremetal': return DeviceMapping.BARE_METAL_SERVER;
      case 'mac_device': return DeviceMapping.MAC_MINI;
      case 'storage': return DeviceMapping.STORAGE_DEVICES;
      case 'pdu': return DeviceMapping.PDU;
      case 'database': return DeviceMapping.DB_SERVER;
      case 'mobile': return DeviceMapping.MOBILE_DEVICE;
      case 'vmware': return DeviceMapping.VMWARE_VIRTUAL_MACHINE;
      case 'vcloud': return DeviceMapping.VCLOUD;
      case 'open_stack': return DeviceMapping.OPENSTACK_VIRTUAL_MACHINE;
      case 'hyperv': return DeviceMapping.HYPER_V;
      case 'g3_kvm': return DeviceMapping.G3_KVM;
      case 'proxmox': return DeviceMapping.PROXMOX;
      case 'esxi': return DeviceMapping.ESXI;
      case 'custom_vm':
      case 'virtual_machine': return DeviceMapping.CUSTOM_VIRTUAL_MACHINE;
      case 'vm': return DeviceMapping.CUSTOM_VIRTUAL_MACHINE;
      case 'aws_vm':
      case 'instance': return DeviceMapping.AWS_VIRTUAL_MACHINE;
      case 'azure_vm':
      case 'azurevirtualmachine': return DeviceMapping.AZURE_VIRTUAL_MACHINE;
      case 'gcpvirtualmachines': return DeviceMapping.GCP_VIRTUAL_MACHINE;
      case 'oraclevirtualmachine': return DeviceMapping.ORACLE_VIRTUAL_MACHINE;
      case 'ocivirtualmachines': return DeviceMapping.ORACLE_VIRTUAL_MACHINE;
      case 'United_private_cloud_vcenter': return DeviceMapping.UNITED_PRIVATE_CLOUD_VCENTER;
      case 'custom': return DeviceMapping.OTHER_DEVICES;
      case 'nutanix': return DeviceMapping.NUTANIX_VIRTUAL_MACHINE;
      case 'sdwan': return DeviceMapping.SDWAN_ACCOUNTS;
      case 'sdwan_device': return DeviceMapping.SDWAN_DEVICES;
      case 'viptela': return DeviceMapping.VIPTELA_ACCOUNT;
      case 'viptela_device': return DeviceMapping.VIPTELA_DEVICE;
      case 'meraki': return DeviceMapping.MERAKI_ACCOUNT;
      case 'meraki_device': return DeviceMapping.MERAKI_DEVICE;
      case 'sensor': return DeviceMapping.SENSOR;
      case 'smart_pdu': return DeviceMapping.SMART_PDU;
      case 'rfid_reader': return DeviceMapping.RFID_READER;
      case 'host/infrastructure': return DeviceMapping.APPLICATION_HOST;
      case 'application': return DeviceMapping.APPLICATION;
      case 'Application': return DeviceMapping.APPLICATION;
      case 'service': return DeviceMapping.APPLICATION_SERVICE;
      case 'component': return DeviceMapping.APPLICATION_COMPONENT;
      case 'process': return DeviceMapping.APPLICATION_PROCESS;
      case 'cabinet': return DeviceMapping.CABINET_VIZ;
      case 'datacenter':
      case 'Data Center':
      case 'colocloud': return DeviceMapping.DC_VIZ;
      case 'Cloud':
      case 'private_cloud': return DeviceMapping.PC_VIZ;
      case 'organization': return DeviceMapping.ORG_VIZ;

      case 'Apache': return DeviceMapping.APACHE;
      case 'PostgreSQL': return DeviceMapping.POSTGRESQL;
      case 'Python': return DeviceMapping.PYTHON;
      case 'Nginx': return DeviceMapping.NGINX;
      case 'C++': return DeviceMapping.CPLUSPLUS;
      case 'asp .net': return DeviceMapping.ASPNET;
      case 'Docker': return DeviceMapping.DOCKER;
      case 'Go': return DeviceMapping.GO;
      case '.NET': return DeviceMapping.DOTNET;
      case 'Java': return DeviceMapping.JAVA;
      case 'Javascript': return DeviceMapping.JAVASCRIPT;
      case 'Kubernet': return DeviceMapping.KUBERNETES;
      case 'K3': return DeviceMapping.KUBERNETES;
      case 'AWS Lambda': return DeviceMapping.AWS_LAMBDA;
      case 'MongoDB': return DeviceMapping.MONGODB;
      case 'Node js': return DeviceMapping.NODEJS;
      case 'Oracle': return DeviceMapping.ORACLE;
      case 'php': return DeviceMapping.PHP;
      case 'RabbitMQ': return DeviceMapping.RABBITMQ;
      case 'Redis': return DeviceMapping.REDIS;
      case 'Ruby': return DeviceMapping.RUBY;
      case 'Rust': return DeviceMapping.RUST;
      case 'HanaDB': return DeviceMapping.HANADB;
      case 'grpc': return DeviceMapping.GRPC;
      case 'ActiveMQ': return DeviceMapping.ACTIVEMQ;
      case 'MySQL': return DeviceMapping.MYSQL;
      case 'php-fpm': return DeviceMapping.PHP_FPM;
      case 'pulsar': return DeviceMapping.PULSAR;
      case 'Microsoft SQL Server': return DeviceMapping.MICROSOFT_SQL_SERVER;
      case 'Elasticsearch': return DeviceMapping.ELASTIC_SEARCH;
      case 'Cassandra': return DeviceMapping.CASSANDRA;
      case 'Kafka': return DeviceMapping.KAFKA;
      case 'H2 Database': return DeviceMapping.H2;
      case 'MQTT': return DeviceMapping.ECLIPSE_MOSQUITTO;
      case 'Azure Functions': return DeviceMapping.AZURE_FUNCTIONS;
      case 'Google Cloud Functions': return DeviceMapping.GOOGLE_CLOUD_FUNCTIONS;
      case 'Azure IoT Hub': return DeviceMapping.AZURE_IOT_HUB;
      case 'EdgeX Foundry': return DeviceMapping.EDGE_X_FOUNDRY;
      case 'Apache HTTP Server': return DeviceMapping.APACHE_HTTP_SERVER;
      case 'gRPC': return DeviceMapping.GRPC;
      default: this.camelCaseToTitleCase(deviceType);
    }
  }

  getDeviceAPIMappingByDeviceMapping(deviceType: DeviceMapping): string {
    switch (deviceType) {
      case DeviceMapping.SWITCHES: return 'switch';
      case DeviceMapping.FIREWALL: return 'firewall';
      case DeviceMapping.LOAD_BALANCER: return 'load_balancer';
      case DeviceMapping.HYPERVISOR: return 'hypervisor';
      case DeviceMapping.BARE_METAL_SERVER: return 'baremetal';
      case DeviceMapping.MAC_MINI: return 'mac_device';
      case DeviceMapping.STORAGE_DEVICES: return 'storage';
      case DeviceMapping.PDU: return 'pdu';
      case DeviceMapping.DB_SERVER: return 'database';
      case DeviceMapping.DB_ENTITY: return 'database_entity';
      case DeviceMapping.MOBILE_DEVICE: return 'mobile';
      case DeviceMapping.OTHER_DEVICES: return 'custom';
      case DeviceMapping.VMWARE_VIRTUAL_MACHINE: return 'vmware';
      case DeviceMapping.VCLOUD: return 'vcloud';
      case DeviceMapping.OPENSTACK_VIRTUAL_MACHINE: return 'open_stack';
      case DeviceMapping.HYPER_V: return 'hyperv';
      case DeviceMapping.G3_KVM: return 'g3_kvm';
      case DeviceMapping.PROXMOX: return 'proxmox';
      case DeviceMapping.CUSTOM_VIRTUAL_MACHINE: return 'virtual_machine';
      case DeviceMapping.ESXI: return 'esxi';
      case DeviceMapping.SDWAN_DEVICES: return 'sdwan_device';
      case DeviceMapping.VIPTELA_DEVICE: return 'viptela_device';
      case DeviceMapping.MERAKI_DEVICE: return 'meraki_device';
      case DeviceMapping.MERAKI_ORG: return 'meraki_organization';
      case DeviceMapping.SENSOR: return 'sensor';
      case DeviceMapping.ONTAP_STORAGE_CLUSTER: return 'ontap_storage_cluster';
      case DeviceMapping.ONTAP_STORAGE_NODE: return 'ontap_storage_node';
      default: null;
    }
  }

  getDeviceAPIPluralMappingByDeviceMapping(deviceType: DeviceMapping): string {
    switch (deviceType) {
      case DeviceMapping.SWITCHES: return 'switches';
      case DeviceMapping.FIREWALL: return 'firewalls';
      case DeviceMapping.LOAD_BALANCER: return 'load_balancers';
      case DeviceMapping.HYPERVISOR: return 'servers';
      case DeviceMapping.BARE_METAL_SERVER: return 'bm_servers';
      case DeviceMapping.MAC_MINI: return 'macdevices';
      case DeviceMapping.STORAGE_DEVICES: return 'storagedevices';
      case DeviceMapping.PDU: return 'pdus';
      case DeviceMapping.DB_SERVER: return 'database_servers';
      case DeviceMapping.OTHER_DEVICES: return 'customdevices';
      case DeviceMapping.VMWARE_VIRTUAL_MACHINE: return 'vmware/migrate';
      case DeviceMapping.VCLOUD: return 'vcloud';
      case DeviceMapping.OPENSTACK_VIRTUAL_MACHINE: return 'open_stack';
      case DeviceMapping.HYPER_V: return 'hyperv';
      case DeviceMapping.G3_KVM: return 'g3_kvm';
      case DeviceMapping.PROXMOX: return 'proxmox';
      case DeviceMapping.CUSTOM_VIRTUAL_MACHINE: return 'virtual_machines';
      case DeviceMapping.ESXI: return 'esxi';
      case DeviceMapping.SDWAN_DEVICES: return 'sdwan_devices';
      case DeviceMapping.VIPTELA_DEVICE: return 'viptela_devices';
      case DeviceMapping.MERAKI_DEVICE: return 'meraki_devices';
      case DeviceMapping.SENSOR: return 'sensors';
      default: null;
    }
  }

  getCloudLogo(name: string, isFullImg?: boolean) {
    switch (name) {
      case ServerSidePlatFormMapping.UNITED_PRIVATE_CLOUD_VCENTER:
        return `${environment.assetsUrl}external-brand/logos/United Cloud_Vcenter.svg`;
      case ServerSidePlatFormMapping.VMWARE:
        return `${environment.assetsUrl}external-brand/logos/V-Center.svg`;
      case ServerSidePlatFormMapping.VCLOUD:
        return `${environment.assetsUrl}external-brand/logos/VMware Cloud Director.svg`;
      case ServerSidePlatFormMapping.OPENSTACK:
        return `${environment.assetsUrl}external-brand/logos/OpenStack-Logo-Horizontal 1.svg`;
      case ServerSidePlatFormMapping.ESXI:
        return `${environment.assetsUrl}external-brand/logos/VMware_ESXI 1.svg`;
      case ServerSidePlatFormMapping.PROXMOX:
        return `${environment.assetsUrl}external-brand/logos/proxmox-server-solutions 1.svg`;
      case ServerSidePlatFormMapping.G3_KVM:
        return `${environment.assetsUrl}external-brand/logos/United Cloud_KVM.svg`;
      case ServerSidePlatFormMapping.HYPER_V:
        return `${environment.assetsUrl}external-brand/logos/hyper-v.svg`;
      case ServerSidePlatFormMapping.NUTANIX:
        return `${environment.assetsUrl}external-brand/logos/nutanix.svg`;
      case ServerSidePlatFormMapping.CUSTOM:
        return;
      // return `${environment.assetsUrl}external-brand/logos/Customs.svg`;
      case PlatFormMapping.AZURE:
        return `${environment.assetsUrl}external-brand/azure.svg`;
      case PlatFormMapping.AWS:
        return `${environment.assetsUrl}external-brand/aws.svg`;
      case PlatFormMapping.GCP:
        return `${environment.assetsUrl}external-brand/gcp.svg`;
      case PlatFormMapping.ORACLE:
        const path = isFullImg ? 'external-brand/logos/Oracle-cloud 1.svg' : 'external-brand/oracle.svg';
        return `${environment.assetsUrl + path}`;
    }
  }

  getDeviceBaseURL(device: any) {
    switch (device.target_device_type) {
      case 'colocloud': return `unitycloud/datacenter/${device.uuid}/cabinets/`;
      case 'cabinet': return `unitycloud/datacenter/${device.dc_uuid}/cabinets/${device.uuid}/view`;
      case 'switch': return `/unitycloud/devices/switches`;
      case 'firewall': return `/unitycloud/devices/firewalls`;
      case 'load_balancer': return `/unitycloud/devices/loadbalancers`;
      case 'hypervisor': return `/unitycloud/devices/hypervisors`;
      case 'baremetal': return `/unitycloud/devices/bmservers`;
      case 'mac_device': return `/unitycloud/devices/macdevices`;
      case 'storage': return `/unitycloud/devices/storagedevices`;
      case 'pdu': return `unitycloud/datacenter/${device.dc_uuid}/pdus`;
      case 'database': return `/unitycloud/devices/databases`;
      case 'mobile': return `/unitycloud/devices/mobiledevices`;
      case 'vmware': return `/unitycloud/devices/vms/vmware`;
      case 'vcloud': return `/unitycloud/devices/vms/vcloud`;
      case 'open_stack': return `/unitycloud/devices/vms/openstack`;
      case 'esxi': return `/unitycloud/devices/vms/esxi`;
      case 'hyperv': return `/unitycloud/devices/vms/hyperv`;
      case 'proxmox': return `/unitycloud/devices/vms/proxmox/`;
      case 'g3_kvm': return `/unitycloud/devices/vms/g3kvm/`;
      case 'virtual_machine': return `/unitycloud/devices/vms/custom`;
      case 'instance': return `/unitycloud/devices/vms/aws`;
      case 'azurevirtualmachine': return `/unitycloud/devices/vms/azure/`;
      case 'gcpvirtualmachines': return `/unitycloud/devices/vms/gcp/`;
      case 'ocivirtualmachines': return `/unitycloud/devices/vms/oracle/`;
      case 'viptela_device': return `/unitycloud/devices/network-controllers/${device.target_account_uuid}/viptela-components`;
      case 'meraki_device': return `/unitycloud/devices/network-controllers/cisco-meraki/${device.target_account_uuid}/organizations/${device.target_organization_uuid}/devices`;
      default: return;
    }
  }

  getStatsPercent(data: UsageData): UsageStatsPercent {
    const vcpuPercent = data?.configured_vcpu > 0 ? Math.round(data.allocated_vcpu * 100 / data.configured_vcpu) : 100;
    const ramPercent = data?.configured_ram?.value > 0 ? Math.round(data.allocated_ram.value * 100 / data.configured_ram.value) : 100;
    const storagePercent = data?.configured_storage_disk?.value > 0 ? Math.round(data.allocated_storage_disk.value * 100 / data.configured_storage_disk.value) : 100;
    const statsPercent: UsageStatsPercent = { vcpuPercent: vcpuPercent, ramPercent: ramPercent, storageDiskPercent: storagePercent };
    return statsPercent;
  }

  validateForm(form: FormGroup, validationMessages: any, formErrors: any) {
    if (!form) { return; }
    for (const field in formErrors) {
      if (form.get(field) instanceof FormGroup) {
        this.validateForm(<FormGroup>form.get(field), validationMessages[field], formErrors[field]);
      } else if (form.get(field) instanceof FormArray) {
        let fa = form.get(field) as FormArray;
        for (let index = 0; index < fa.length; index++) {
          if (validationMessages[field]) {
            if (formErrors[field]) {
              if (validationMessages[field] instanceof Array) {
                let control = fa.at(index);
                if (control) {
                  if (control.valid) {
                    formErrors[field][index] = '';
                  } else {
                    const messages = validationMessages[field][index];
                    for (const key in control.errors) {
                      if (key === 'whitespace') {
                        formErrors[field][index] = 'Enter valid input';
                      } else {
                        formErrors[field][index] = messages ? messages[key] : '' + ' ';
                      }
                      break;
                    }
                  }
                }
              } else {
                formErrors[field][index] = this.validateForm(<FormGroup>fa.at(index), validationMessages[field], formErrors[field][index]);
              }
            } else {
              formErrors[field] = this.validateForm(<FormGroup>fa.at(index), validationMessages[field], formErrors[field])
            }
          } else {
            formErrors[field][index] = this.validateForm(<FormGroup>fa.at(index), validationMessages, formErrors[field][index]);
          }
        }
      } else {
        formErrors[field] = '';
        const control = form.get(field);
        if (control && !control.valid) {
          const messages = validationMessages[field];
          for (const key in control.errors) {
            if (key === 'whitespace') {
              formErrors[field] += 'Enter valid Input'
            } else {
              formErrors[field] += messages ? messages[key] : '' + ' ';
            }
            break;
          }
        }
      }
    }
    return formErrors;
  }

  getDeviceUptime(details: { status: string, uptime: string, last_rebooted: string }) {
    if (details.status == '1') {
      return details.uptime;
    } else {
      if (details.last_rebooted) {
        const currenttime = new Date().valueOf();
        const lastrebootedtime = new Date(Number(details.last_rebooted) * 1000).valueOf();
        let totaltime = (currenttime - lastrebootedtime) / 1000;
        return (totaltime - Number(details.uptime)).toString();
      } else {
        return details.last_rebooted;
      }
    }
  }

  getDeviceStatus(data: string | number) {
    if (data) {
      switch (data) {
        case `1`:
        case 1:
          return `Up`;
        case `0`:
        case 0:
          return `Down`;
        case `-1`: // device is configured but couldn't get state
        case -1:
          return `Unknown`;
        case `-2`: // device is configured but disabled
        case -2:
          return `Monitoring Disabled`;
        default: // status == null for not not reacheable device
          return `Not Configured`;
      }
    }
  }

  getDeviceAvailabilityStatus(data: string | number) {
    return data == '1' || data == 1 || data == 'Running' || data == 'poweredOn' ? 'Up' : 'Down';
  }

  convertToDeviceSensor(apiData: APIDeviceSensor): DeviceSensors[] {
    let sensors: DeviceSensors[] = [];
    let sensorData: SensorData[] = [];
    Object.keys(apiData).map((sensorType: string) => {
      sensorData = [];
      apiData[sensorType].forEach((sensorDetailList: SensorDataList) => {
        Object.keys(sensorDetailList).map((sensorName: string) => {
          const data: SensorData = { sensorName: sensorName, sensorDetail: sensorDetailList[sensorName] };
          sensorData.push(data);
        });
      });
      sensors.push({ sensorType: sensorType, sensors: sensorData });
    });
    return sensors;
  }

  getDateRangeByGraphRange(graphRange: GraphRange): DateRangeInUnix {
    switch (graphRange) {
      case GraphRange.DAY:
        return { from: moment().subtract(1, 'd').unix(), to: moment().unix() };
      case GraphRange.WEEK:
        return { from: moment().subtract(1, 'w').unix(), to: moment().unix() };
      case GraphRange.MONTH:
        return { from: moment().subtract(1, 'M').unix(), to: moment().unix() };
      case GraphRange.YEAR:
        return { from: moment().subtract(1, 'y').unix(), to: moment().unix() };
    }
  }

  dateRangeValidator(fromKey: string, toKey: string): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      if (!control.get(fromKey) || !control.get(toKey)) { return null }
      if (!control.get(fromKey).value || !control.get(toKey).value) { return null }
      const from = control.get(fromKey).value;
      const to = control.get(toKey).value;
      if (moment(from).isAfter(to)) {
        return { 'fromAfterTo': true };
      }
      return null;
    }
  }

  sameOrAfterDateRangeValidator(fromKey: string, toKey: string): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      if (!control.get(fromKey) || !control.get(toKey)) { return null }
      if (!control.get(fromKey).value || !control.get(toKey).value) { return null }
      const from = control.get(fromKey).value;
      const to = control.get(toKey).value;
      if (from.value && to.value) {
        if (moment(from.value).isSameOrAfter(to.value)) {
          return { 'fromSameAsOrAfterTo': true };
        } else {
          return null;
        }
      }
      if (moment(from).isSameOrAfter(to)) {
        return { 'fromSameAsOrAfterTo': true };
      }
      return null;
    }
  }

  getTimezones(): string[] {
    return ['Africa/Abidjan', 'Africa/Accra', 'Africa/Addis_Ababa', 'Africa/Algiers', 'Africa/Asmara', 'Africa/Bamako', 'Africa/Bangui', 'Africa/Banjul', 'Africa/Bissau', 'Africa/Blantyre', 'Africa/Brazzaville', 'Africa/Bujumbura', 'Africa/Cairo', 'Africa/Casablanca', 'Africa/Ceuta', 'Africa/Conakry', 'Africa/Dakar', 'Africa/Dar_es_Salaam', 'Africa/Djibouti', 'Africa/Douala', 'Africa/El_Aaiun', 'Africa/Freetown', 'Africa/Gaborone', 'Africa/Harare', 'Africa/Johannesburg', 'Africa/Juba', 'Africa/Kampala', 'Africa/Khartoum', 'Africa/Kigali', 'Africa/Kinshasa', 'Africa/Lagos', 'Africa/Libreville', 'Africa/Lome', 'Africa/Luanda', 'Africa/Lubumbashi', 'Africa/Lusaka', 'Africa/Malabo', 'Africa/Maputo', 'Africa/Maseru', 'Africa/Mbabane', 'Africa/Mogadishu', 'Africa/Monrovia', 'Africa/Nairobi', 'Africa/Ndjamena', 'Africa/Niamey', 'Africa/Nouakchott', 'Africa/Ouagadougou', 'Africa/Porto-Novo', 'Africa/Sao_Tome', 'Africa/Tripoli', 'Africa/Tunis', 'Africa/Windhoek', 'America/Adak', 'America/Anchorage', 'America/Anguilla', 'America/Antigua', 'America/Araguaina', 'America/Argentina/Buenos_Aires', 'America/Argentina/Catamarca', 'America/Argentina/Cordoba', 'America/Argentina/Jujuy', 'America/Argentina/La_Rioja', 'America/Argentina/Mendoza', 'America/Argentina/Rio_Gallegos', 'America/Argentina/Salta', 'America/Argentina/San_Juan', 'America/Argentina/San_Luis', 'America/Argentina/Tucuman', 'America/Argentina/Ushuaia', 'America/Aruba', 'America/Asuncion', 'America/Atikokan', 'America/Bahia', 'America/Bahia_Banderas', 'America/Barbados', 'America/Belem', 'America/Belize', 'America/Blanc-Sablon', 'America/Boa_Vista', 'America/Bogota', 'America/Boise', 'America/Cambridge_Bay', 'America/Campo_Grande', 'America/Cancun', 'America/Caracas', 'America/Cayenne', 'America/Cayman', 'America/Chicago', 'America/Chihuahua', 'America/Costa_Rica', 'America/Creston', 'America/Cuiaba', 'America/Curacao', 'America/Danmarkshavn', 'America/Dawson', 'America/Dawson_Creek', 'America/Denver', 'America/Detroit', 'America/Dominica', 'America/Edmonton', 'America/Eirunepe', 'America/El_Salvador', 'America/Fort_Nelson', 'America/Fortaleza', 'America/Glace_Bay', 'America/Godthab', 'America/Goose_Bay', 'America/Grand_Turk', 'America/Grenada', 'America/Guadeloupe', 'America/Guatemala', 'America/Guayaquil', 'America/Guyana', 'America/Halifax', 'America/Havana', 'America/Hermosillo', 'America/Indiana/Indianapolis', 'America/Indiana/Knox', 'America/Indiana/Marengo', 'America/Indiana/Petersburg', 'America/Indiana/Tell_City', 'America/Indiana/Vevay', 'America/Indiana/Vincennes', 'America/Indiana/Winamac', 'America/Inuvik', 'America/Iqaluit', 'America/Jamaica', 'America/Juneau', 'America/Kentucky/Louisville', 'America/Kentucky/Monticello', 'America/Kralendijk', 'America/La_Paz', 'America/Lima', 'America/Los_Angeles', 'America/Lower_Princes', 'America/Maceio', 'America/Managua', 'America/Manaus', 'America/Marigot', 'America/Martinique', 'America/Matamoros', 'America/Mazatlan', 'America/Menominee', 'America/Merida', 'America/Metlakatla', 'America/Mexico_City', 'America/Miquelon', 'America/Moncton', 'America/Monterrey', 'America/Montevideo', 'America/Montserrat', 'America/Nassau', 'America/New_York', 'America/Nipigon', 'America/Nome', 'America/Noronha', 'America/North_Dakota/Beulah', 'America/North_Dakota/Center', 'America/North_Dakota/New_Salem', 'America/Ojinaga', 'America/Panama', 'America/Pangnirtung', 'America/Paramaribo', 'America/Phoenix', 'America/Port-au-Prince', 'America/Port_of_Spain', 'America/Porto_Velho', 'America/Puerto_Rico', 'America/Punta_Arenas', 'America/Rainy_River', 'America/Rankin_Inlet', 'America/Recife', 'America/Regina', 'America/Resolute', 'America/Rio_Branco', 'America/Santarem', 'America/Santiago', 'America/Santo_Domingo', 'America/Sao_Paulo', 'America/Scoresbysund', 'America/Sitka', 'America/St_Barthelemy', 'America/St_Johns', 'America/St_Kitts', 'America/St_Lucia', 'America/St_Thomas', 'America/St_Vincent', 'America/Swift_Current', 'America/Tegucigalpa', 'America/Thule', 'America/Thunder_Bay', 'America/Tijuana', 'America/Toronto', 'America/Tortola', 'America/Vancouver', 'America/Whitehorse', 'America/Winnipeg', 'America/Yakutat', 'America/Yellowknife', 'Antarctica/Casey', 'Antarctica/Davis', 'Antarctica/DumontDUrville', 'Antarctica/Macquarie', 'Antarctica/Mawson', 'Antarctica/McMurdo', 'Antarctica/Palmer', 'Antarctica/Rothera', 'Antarctica/Syowa', 'Antarctica/Troll', 'Antarctica/Vostok', 'Arctic/Longyearbyen', 'Asia/Aden', 'Asia/Almaty', 'Asia/Amman', 'Asia/Anadyr', 'Asia/Aqtau', 'Asia/Aqtobe', 'Asia/Ashgabat', 'Asia/Atyrau', 'Asia/Baghdad', 'Asia/Bahrain', 'Asia/Baku', 'Asia/Bangkok', 'Asia/Barnaul', 'Asia/Beirut', 'Asia/Bishkek', 'Asia/Brunei', 'Asia/Chita', 'Asia/Choibalsan', 'Asia/Colombo', 'Asia/Damascus', 'Asia/Dhaka', 'Asia/Dili', 'Asia/Dubai', 'Asia/Dushanbe', 'Asia/Famagusta', 'Asia/Gaza', 'Asia/Hebron', 'Asia/Ho_Chi_Minh', 'Asia/Hong_Kong', 'Asia/Hovd', 'Asia/Irkutsk', 'Asia/Jakarta', 'Asia/Jayapura', 'Asia/Jerusalem', 'Asia/Kabul', 'Asia/Kamchatka', 'Asia/Karachi', 'Asia/Kathmandu', 'Asia/Khandyga', 'Asia/Kolkata', 'Asia/Krasnoyarsk', 'Asia/Kuala_Lumpur', 'Asia/Kuching', 'Asia/Kuwait', 'Asia/Macau', 'Asia/Magadan', 'Asia/Makassar', 'Asia/Manila', 'Asia/Muscat', 'Asia/Nicosia', 'Asia/Novokuznetsk', 'Asia/Novosibirsk', 'Asia/Omsk', 'Asia/Oral', 'Asia/Phnom_Penh', 'Asia/Pontianak', 'Asia/Pyongyang', 'Asia/Qatar', 'Asia/Qyzylorda', 'Asia/Riyadh', 'Asia/Sakhalin', 'Asia/Samarkand', 'Asia/Seoul', 'Asia/Shanghai', 'Asia/Singapore', 'Asia/Srednekolymsk', 'Asia/Taipei', 'Asia/Tashkent', 'Asia/Tbilisi', 'Asia/Tehran', 'Asia/Thimphu', 'Asia/Tokyo', 'Asia/Tomsk', 'Asia/Ulaanbaatar', 'Asia/Urumqi', 'Asia/Ust-Nera', 'Asia/Vientiane', 'Asia/Vladivostok', 'Asia/Yakutsk', 'Asia/Yangon', 'Asia/Yekaterinburg', 'Asia/Yerevan', 'Atlantic/Azores', 'Atlantic/Bermuda', 'Atlantic/Canary', 'Atlantic/Cape_Verde', 'Atlantic/Faroe', 'Atlantic/Madeira', 'Atlantic/Reykjavik', 'Atlantic/South_Georgia', 'Atlantic/St_Helena', 'Atlantic/Stanley', 'Australia/Adelaide', 'Australia/Brisbane', 'Australia/Broken_Hill', 'Australia/Currie', 'Australia/Darwin', 'Australia/Eucla', 'Australia/Hobart', 'Australia/Lindeman', 'Australia/Lord_Howe', 'Australia/Melbourne', 'Australia/Perth', 'Australia/Sydney', 'Canada/Atlantic', 'Canada/Central', 'Canada/Eastern', 'Canada/Mountain', 'Canada/Newfoundland', 'Canada/Pacific', 'Europe/Amsterdam', 'Europe/Andorra', 'Europe/Astrakhan', 'Europe/Athens', 'Europe/Belgrade', 'Europe/Berlin', 'Europe/Bratislava', 'Europe/Brussels', 'Europe/Bucharest', 'Europe/Budapest', 'Europe/Busingen', 'Europe/Chisinau', 'Europe/Copenhagen', 'Europe/Dublin', 'Europe/Gibraltar', 'Europe/Guernsey', 'Europe/Helsinki', 'Europe/Isle_of_Man', 'Europe/Istanbul', 'Europe/Jersey', 'Europe/Kaliningrad', 'Europe/Kiev', 'Europe/Kirov', 'Europe/Lisbon', 'Europe/Ljubljana', 'Europe/London', 'Europe/Luxembourg', 'Europe/Madrid', 'Europe/Malta', 'Europe/Mariehamn', 'Europe/Minsk', 'Europe/Monaco', 'Europe/Moscow', 'Europe/Oslo', 'Europe/Paris', 'Europe/Podgorica', 'Europe/Prague', 'Europe/Riga', 'Europe/Rome', 'Europe/Samara', 'Europe/San_Marino', 'Europe/Sarajevo', 'Europe/Saratov', 'Europe/Simferopol', 'Europe/Skopje', 'Europe/Sofia', 'Europe/Stockholm', 'Europe/Tallinn', 'Europe/Tirane', 'Europe/Ulyanovsk', 'Europe/Uzhgorod', 'Europe/Vaduz', 'Europe/Vatican', 'Europe/Vienna', 'Europe/Vilnius', 'Europe/Volgograd', 'Europe/Warsaw', 'Europe/Zagreb', 'Europe/Zaporozhye', 'Europe/Zurich', 'GMT', 'Indian/Antananarivo', 'Indian/Chagos', 'Indian/Christmas', 'Indian/Cocos', 'Indian/Comoro', 'Indian/Kerguelen', 'Indian/Mahe', 'Indian/Maldives', 'Indian/Mauritius', 'Indian/Mayotte', 'Indian/Reunion', 'Pacific/Apia', 'Pacific/Auckland', 'Pacific/Bougainville', 'Pacific/Chatham', 'Pacific/Chuuk', 'Pacific/Easter', 'Pacific/Efate', 'Pacific/Enderbury', 'Pacific/Fakaofo', 'Pacific/Fiji', 'Pacific/Funafuti', 'Pacific/Galapagos', 'Pacific/Gambier', 'Pacific/Guadalcanal', 'Pacific/Guam', 'Pacific/Honolulu', 'Pacific/Kiritimati', 'Pacific/Kosrae', 'Pacific/Kwajalein', 'Pacific/Majuro', 'Pacific/Marquesas', 'Pacific/Midway', 'Pacific/Nauru', 'Pacific/Niue', 'Pacific/Norfolk', 'Pacific/Noumea', 'Pacific/Pago_Pago', 'Pacific/Palau', 'Pacific/Pitcairn', 'Pacific/Pohnpei', 'Pacific/Port_Moresby', 'Pacific/Rarotonga', 'Pacific/Saipan', 'Pacific/Tahiti', 'Pacific/Tarawa', 'Pacific/Tongatapu', 'Pacific/Wake', 'Pacific/Wallis', 'US/Alaska', 'US/Arizona', 'US/Central', 'US/Eastern', 'US/Hawaii', 'US/Mountain', 'US/Pacific', 'UTC'];
  }

  /**
   * * This function is used to get date in user set time zone,
   * it accepts selected moment date in local time zone and returns
   * same date and time in UTC equivalant of user set time zone
   *
   * DO NOT REMOVE COMMENTS IN FUNCTION
   *
   * @param date moment.Moment user selected date in localtime zone
   */
  getUTCDateInUserSetTimeZone(date: moment.Moment): moment.Moment {
    // console.log(momentTz.tz('us/pacific').format("Z"));
    // console.log('Now ' + moment().format('MM-DD-YYYY HH:mm'))
    // console.log('Now in PDT ' + moment().format('MM-DD-YYYY HH:mm') + momentTz.tz('us/mountain').format("Z"))
    // console.log('PDT to IST ' + moment(moment().format('MM-DD-YYYY HH:mm') + momentTz.tz('us/mountain').format("Z"), 'MM-DD-YYYY HH:mm Z').format())
    // console.log(moment().utcOffset(momentTz.tz('utc').format("Z")).format('MM-DD-YYYY HH:mm'))
    // console.log(moment().format('MM-DD-YYYY HH:mm:ss'), moment(moment().format('MM-DD-YYYY HH:mm:ss')).tz('US/Mountain'));
    if (date.isValid()) {
      let nowInUserTimeZone = date.format('MM-DD-YYYY HH:mm') + momentTz.tz(this.userInfo.userTimeZoneAbbr).format("Z");
      return moment.utc(nowInUserTimeZone, 'MM-DD-YYYY HH:mm Z').second(0);
    }
    throw Error('Invalid moment date!!');
  }

  getTimeDifference(to: string, from?: string) {
    if (!to) {
      return;
    }
    const toDate = moment(to);
    const fromDate = from ? moment(from) : moment();
    const duration = moment.duration(toDate.diff(fromDate));
    return {
      days: duration.days(),
      asDays: duration.asDays(),
      hours: duration.hours(),
      minutes: duration.minutes(),
      seconds: duration.seconds(),
      asSeconds: duration.asSeconds(),
      asMilliseconds: duration.asMilliseconds()
    };
  }

  // Used only to find the date range from last backup/modified date - till current date
  getTimeDifferenceByFromDate(from: string) {
    if (!from) {
      return;
    }
    const fromDate = moment(from);
    const currentDate = moment();
    const duration = moment.duration(currentDate.diff(fromDate));
    return {
      days: duration.days(),
      asDays: duration.asDays(),
      hours: duration.hours(),
      minutes: duration.minutes(),
      seconds: duration.seconds(),
      asSeconds: duration.asSeconds(),
      asMilliseconds: duration.asMilliseconds()
    };
  }

  getDurationData(to: string, from?: string): moment.Duration {
    if (!to) {
      return;
    }
    const toDate = moment(to);
    const fromDate = from ? moment(from) : moment();
    const duration = moment.duration(toDate.diff(fromDate));
    return duration;
  }

  formatDuration(duration: moment.Duration): string {
    if (!duration) {
      return 'N/A';
    }
    let formattedDuration = '';
    if (duration) {
      duration.get('years') ? formattedDuration = formattedDuration.concat(`${duration.get('years')} years`) : formattedDuration = formattedDuration;
      duration.get('months') ? formattedDuration = formattedDuration.concat(` ${duration.get('months')} months`) : formattedDuration = formattedDuration;
      duration.get('days') ? formattedDuration = formattedDuration.concat(`${duration.get('days')} days`) : formattedDuration = formattedDuration;
      if (!duration.get('years') && !duration.get('months')) {
        duration.get('hours') ? formattedDuration = formattedDuration.concat(` ${duration.get('hours')} hours`) : formattedDuration = formattedDuration;
        duration.get('minutes') ? formattedDuration = formattedDuration.concat(` ${duration.get('minutes')} minutes`) : formattedDuration = formattedDuration;
        if (!duration.get('days') && !duration.get('hours')) {
          duration.get('seconds') ? formattedDuration = formattedDuration.concat(` ${duration.get('seconds')} seconds`) : formattedDuration = formattedDuration;
        }
        if (!duration.get('days') && !duration.get('hours') && !duration.get('minutes') && !duration.get('seconds')) {
          duration.get('milliseconds') ? formattedDuration = formattedDuration.concat(` ${duration.get('milliseconds')} ms`) : formattedDuration = formattedDuration;
        }
      }
    }
    return formattedDuration;
  }

  toUnityOneDateFormat(input: string | number | moment.Moment, format?: string) {
    if (format) {
      return moment(input).format(format);
    }
    return moment(input).format(environment.unityOneDateFormat);
  }

  convertSizeToBytes(size: string | number, unit: string) {
    if (Number.isNaN(size)) {
      console.log('Not a valid number string');
      return;
    }
    unit = unit.toUpperCase();
    if (['KB', 'MB', 'GB', 'TB'].indexOf(unit) == -1) {
      console.log('Unsupported valid unit');
      return;
    }
    if (unit == 'KB') {
      return Number(size) * Math.pow(1024, 1);
    } else if (unit == 'MB') {
      return Number(size) * Math.pow(1024, 2);
    } else if (unit == 'GB') {
      return Number(size) * Math.pow(1024, 3);
    } else if (unit == 'TB') {
      return Number(size) * Math.pow(1024, 4);
    }
  }

  parseJson(s: string) {
    try {
      return this.parseJson(JSON.parse(s));
    } catch (e) {
      return s;
    }
  }

  parseUnKnownObj(obj: any) {
    let attributes: { [key: string]: any } = [];
    let objects: any[] = [];
    let lists: any[] = [];
    Object.keys(obj).forEach(pk => {
      let val = this.parseJson(obj[pk]);
      if (val instanceof Array) {
        if (val.length) {
          let ll: any[] = [];
          for (let i = 0; i < val.length; i++) {
            if (val[i]) {
              let objVal = this.parseUnKnownObj(val[i]);
              if (objVal) {
                ll.push(objVal);
              }
            }
          }
          if (ll.length) {
            let xarr: any = { [this.camelCaseToTitleCase(pk)]: ll };
            lists.push(xarr);
          }
        }
      } else if (typeof val == 'object') {
        if (val) {
          let objVal = this.parseUnKnownObj(val);
          if (objVal) {
            let xobj: any = { [this.camelCaseToTitleCase(pk)]: objVal };
            objects.push(xobj);
          }
        }
      } else {
        if (!pk.includes('name') && !pk.includes('id') && !pk.includes('Id')) {
          let attr: any = { [this.camelCaseToTitleCase(pk)]: val };
          attributes.push(attr);
        }
      }
    });

    if (attributes.length || objects.length || lists.length) {
      let nobj = {
        attributes: attributes,
        objects: objects,
        lists: lists,
      }
      return nobj;
    } else {
      return null;
    }
  }
}

export class UnityDeviceType {
  constructor() { }
  type: string;
  mapping: string;
  modelMapping?: string;
  key?: string;
}

export enum DeviceMapping {
  ORG_VIZ = 'Organisation',
  DC_VIZ = 'Datacenter',
  CABINET_VIZ = 'Cabinet',
  PC_VIZ = 'Private Cloud',
  COLLECTOR = 'Collector',

  VMWARE_ACCOUNT = 'VMware',
  VMWARE_VIRTUAL_MACHINE = 'VMware vCenter',
  UNITED_PRIVATE_CLOUD_VCENTER = 'United Private Cloud vCenter',
  VCLOUD_ACCOUNT = 'vCloud Director',
  VCLOUD = 'vCloud Director VM',
  ESXI = 'ESXi',
  HYPER_V = 'Hyper-V',
  OPENSTACK_ACCOUNT = 'OpenStack',
  OPENSTACK_VIRTUAL_MACHINE = 'OpenStack VM',
  PROXMOX = 'Proxmox VM',
  G3_KVM = 'UnitedPrivateCloud - KVM',
  NUTANIX_ACCOUNT = 'Nutanix',
  NUTANIX_VIRTUAL_MACHINE = 'Nutanix VM',
  //NUTANIX_VM = 'Virtual Machine',
  CUSTOM_VIRTUAL_MACHINE = 'Custom VM',
  VIRTUAL_MACHINE = 'Virtual Machine',

  AWS_ACCOUNTS = 'AWS',
  AWS_VIRTUAL_MACHINE = 'AWS VM',
  AWS_RESOURCES = 'AWS RESOURCES',
  AZURE_ACCOUNTS = 'Accounts',
  AZURE_VIRTUAL_MACHINE = 'Azure VM',
  GCP_ACCOUNTS = 'GCP',
  GCP_VIRTUAL_MACHINE = 'GCP VM',
  ORACLE_VIRTUAL_MACHINE = 'OCI VM',

  PDU = 'PDU',
  SWITCHES = 'Switch',
  FIREWALL = 'Firewall',
  LOAD_BALANCER = 'Load Balancer',
  LB = 'LoadBalancer',
  HYPERVISOR = 'Hypervisor',
  BARE_METAL_SERVER = 'BM Server',
  MAC_MINI = 'Mac Device',
  STORAGE_DEVICES = 'Storage',
  MOBILE_DEVICE = 'Mobile Device',
  DB_SERVER = 'Database Server',
  DB_ENTITY = 'Database Entity',
  OTHER_DEVICES = 'Other Devices',
  S3_BUCKET = 'S3',
  CONTAINER_CONTROLLER = 'Container Controller',
  KUBERNETES_NODE = 'Kubernetes Node',
  DOCKER_CONTROLLER = 'Docker Controller',
  DOCKER_CONTAINER = 'Docker Container',
  DOCKER_NODE = 'Docker Node',
  CLOUD_CONTROLLER = 'Cloud Controller',
  DEVOPS_CONTROLLER = 'DevOps Controller',
  CLUSTER = 'Cluster',
  HOST = 'Host',
  DISK = 'Disk',
  STORAGE_CONTAINERS = 'Storage Container',
  VDISK = 'VDisk',
  STORAGE_POOLS = 'Storage Pools',
  BLANK_PANEL = 'Blank Panel',
  CABLE_ORGANISER = 'Cable Organizer',
  PATCH_PANEL = 'Patch Panel',
  AZURE_SERVICES = 'Azure Services',
  SDWAN_ACCOUNTS = 'Sdwan',
  SDWAN_DEVICES = 'Sdwan Device',
  AZURE_FLEXIBLESERVERS = 'Flexible Servers',
  VIPTELA_ACCOUNT = 'Viptela',
  VIPTELA_DEVICE = 'Viptela Device',
  MERAKI_ACCOUNT = 'Meraki',
  MERAKI_DEVICE = 'Meraki Device',
  MERAKI_ORG = 'Meraki Organization',
  APP_DEVICE = 'Application Devices',
  SENSOR = 'Sensor',
  SMART_PDU = 'Smart PDU',
  RFID_READER = 'RFID Reader',

  APPLICATION_HOST = 'Application Host',
  APPLICATION = 'Application',
  APPLICATION_SERVICE = 'Application Server',
  APPLICATION_COMPONENT = 'Application Database',
  APPLICATION_PROCESS = 'Application Storage',

  LLM_SERVICE = 'LLM Service',
  GPU_SERVICE = 'GPU Service',
  VECTOR_DB_SERVICE = 'Vector DB Service',

  ONTAP_STORAGE_CLUSTER = 'Ontap Storage Cluster',
  ONTAP_STORAGE_NODE = 'Ontap Storage Node',

  CPLUSPLUS = 'C++',
  DOTNET = '.NET',
  JAVA = 'Java',
  JAVASCRIPT = 'Javascript',
  PYTHON = 'Python',
  GO = 'Go',
  APACHE = 'Apache',
  NODEJS = 'Node js',
  KUBERNETES = 'Kubernet',
  DOCKER = 'Docker',
  GRPC = 'gRPC',
  ASPNET = 'asp .net',
  PHP = 'php',
  RUBY = 'Ruby',
  AWS_LAMBDA = 'AWS Lambda',
  RUST = 'Rust',
  SWIFT = 'Swift',
  REDIS = 'Redis',
  MYSQL = 'MySQL',
  ORACLE = 'Oracle',
  POSTGRESQL = 'PostgreSQL',
  HANADB = 'HanaDB',
  RABBITMQ = 'RabbitMQ',
  MONGODB = 'MongoDB',
  ACTIVEMQ = 'ActiveMQ',
  PULSAR = 'pulsar',
  APACHE_ZOOKEEPER = 'zookeeper',
  NGINX = 'Nginx',
  OPENJDK = 'OpenJDK',
  APACHE2 = 'APache2',
  PHP_FPM = 'php-fpm',
  MICROSOFT_SQL_SERVER = 'Microsoft SQL Server',
  ELASTIC_SEARCH = 'Elasticsearch',
  CASSANDRA = 'Cassandra',
  KAFKA = 'Kafka',
  H2 = 'H2 Database',
  ECLIPSE_MOSQUITTO = 'MQTT',
  AZURE_FUNCTIONS = 'Azure Functions',
  GOOGLE_CLOUD_FUNCTIONS = 'Azure Functions',
  KUBERNETES_ON_CLOUD = 'Kubernetes on Cloud',
  AZURE_IOT_HUB = 'Azure IoT Hub',
  AWS_IOT_CORE = 'AWS IoT Core',
  GOOGLE_IOT_CORE = 'Google IoT Core',
  EDGE_X_FOUNDRY = 'EdgeX Foundry',
  APACHE_HTTP_SERVER = 'Apache HTTP Server'

}

export enum DeviceModelMapping {
  SWITCHES = 'Switch',
  FIREWALL = 'Firewall',
  LOAD_BALANCER = 'LoadBalancer',
  HYPERVISOR = 'Server',
  BARE_METAL_SERVER = 'BMServer',
  STORAGE_DEVICES = 'StorageDevice',
  MAC_MINI = 'MacDevice',
  DB_SERVER = 'DatabaseServer',
  PDU = 'PDU',
  VMWARE_VIRTUAL_MACHINE = 'VmwareVmMigration',
  VCLOUD = 'VCloudVirtualMachines',
  HYPER_V = 'HypervVM',
  ESXI = 'ESXiVM',
  OPENSTACK_VIRTUAL_MACHINE = 'OpenStackVM',
  CUSTOM_VIRTUAL_MACHINE = 'CustomVM',
  G3_KVM = 'G3 VM',
  PROXMOX = 'Proxmox VM',
  UNITED_PRIVATE_CLOUD_VCENTER = 'United Private Cloud vCenter',
}

export const UNITY_DEVICE_TYPES: UnityDeviceType[] = [
  { type: 'Switch', mapping: DeviceMapping.SWITCHES, modelMapping: DeviceModelMapping.SWITCHES },
  { type: 'Firewall', mapping: DeviceMapping.FIREWALL, modelMapping: DeviceModelMapping.FIREWALL },
  { type: 'Load Balancer', mapping: DeviceMapping.LOAD_BALANCER, modelMapping: DeviceModelMapping.LOAD_BALANCER },
  { type: 'Hypervisor', mapping: DeviceMapping.HYPERVISOR, modelMapping: DeviceModelMapping.HYPERVISOR },
  { type: 'Bare Metal Server', mapping: DeviceMapping.BARE_METAL_SERVER, modelMapping: DeviceModelMapping.BARE_METAL_SERVER },
  { type: 'Storage Device', mapping: DeviceMapping.STORAGE_DEVICES, modelMapping: DeviceModelMapping.STORAGE_DEVICES },
  { type: 'MAC Device', mapping: DeviceMapping.MAC_MINI, modelMapping: DeviceModelMapping.MAC_MINI },
  { type: 'Database Server', mapping: DeviceMapping.DB_SERVER, modelMapping: DeviceModelMapping.DB_SERVER },
  { type: 'PDU', mapping: DeviceMapping.PDU, modelMapping: DeviceModelMapping.PDU },
  { type: 'Vcenter Virtual Machines', mapping: DeviceMapping.VMWARE_VIRTUAL_MACHINE, modelMapping: DeviceModelMapping.VMWARE_VIRTUAL_MACHINE },
  { type: 'Vcloud Virtual Machines', mapping: DeviceMapping.VCLOUD, modelMapping: DeviceModelMapping.VCLOUD },
  { type: 'Hyper-V Virtual Machines', mapping: DeviceMapping.HYPER_V, modelMapping: DeviceModelMapping.HYPER_V },
  { type: 'ESXI Virtual Machines', mapping: DeviceMapping.ESXI, modelMapping: DeviceModelMapping.ESXI },
  { type: 'OpenStack Virtual Machines', mapping: DeviceMapping.OPENSTACK_VIRTUAL_MACHINE, modelMapping: DeviceModelMapping.OPENSTACK_VIRTUAL_MACHINE },
  { type: 'Custom Virtual Machines', mapping: DeviceMapping.CUSTOM_VIRTUAL_MACHINE, modelMapping: DeviceModelMapping.CUSTOM_VIRTUAL_MACHINE },
];

export enum PlatFormMapping {
  VMWARE = 'VMware vCenter',
  VMWARE_TYPE = 'VMware',
  UNITED_PRIVATE_CLOUD_VCENTER = 'United Private Cloud vCenter',
  VCLOUD = 'vCloud Director',
  ESXI = 'ESXi',
  HYPER_V = 'Hyper-V',
  CUSTOM = 'Custom',
  NUTANIX = 'Nutanix',
  OPENSTACK = 'Openstack',
  OPENSTACKClOUD = 'OpenStack',
  PROXMOX = 'Proxmox',
  G3_KVM = 'UnitedPrivateCloud - KVM',

  AWS = 'AWS',
  AZURE = 'Azure',
  GCP = 'GCP',
  ORACLE = 'Oracle',
}

export enum ServerSidePlatFormMapping {
  CUSTOM = 'Custom',
  VMWARE = 'VMware',
  OPENSTACK = 'OpenStack',
  VCLOUD = 'vCloud Director',
  PROXMOX = 'Proxmox',
  G3_KVM = 'G3 KVM',
  HYPER_V = 'Hyperv',
  ESXI = 'ESXi',
  UNITED_PRIVATE_CLOUD_VCENTER = 'United Private Cloud vCenter',
  NUTANIX = 'Nutanix'
}

export enum BMServerPlatFormMapping {
  IPMI = 'IPMI',
  DRAC = 'DRAC',
  None = 'None'
}

export enum BMServerSidePlatformMapping {
  IPMI = 'IPMI',
  DRAC = 'DRAC',
  None = 'None'
}

export enum SNMPVersionMapping {
  V1 = 'v1',
  V2C = 'v2c',
  V3 = 'v3'
}

export enum AuthLevelMapping {
  NoAuthNoPriv = 'noAuthNoPriv',
  AuthNoPriv = 'authNoPriv',
  AuthPriv = 'authPriv'
}

export enum DeviceGraphTypeMapping {
  MEMORY = 'device_ucd_memory',
  PORTS = 'device_bits',
  PROCESSOR = 'device_processor'
}

export enum FaIconMapping {
  CLUSTER = 'fas fa-code-branch',
  HYPERVISOR = 'fa-server',
  VIRTUAL_MACHINE = 'fa-object-group',
  BARE_METAL_SERVER = 'fa-laptop',
  FIREWALL = 'fa-fire',
  SWITCH = 'fa-sitemap',
  LOAD_BALANCER = 'fa-balance-scale',
  KUBERNETES = 'cfa-kubernetes',
  OTHER_DEVICES = 'fa-sliders-h',
  PDU = 'fa-plug',
  SAN = 'fas fa-hdd',
  CABINET = 'fa-cube',
  ALL_DEVICES = 'fa-tasks',
  CLOUD_CONTROLLER = 'fa-gamepad',
  STORAGE_DEVICE = 'fas fa-hdd',
  MAC_MINI = 'fab fa-apple',
  MOBILE_DEVICE = 'fa-mobile-alt',
  S3_BUCKET = 'fas fa-glass-whiskey',
  DATABASE = 'fas fa-database',
  DATACENTER = 'fas fa-database',
  PRIVATE_CLOUD = 'fas fa-cloud',
  VM = 'fa-object-group',
  HOST = 'fa-server',
  DISK = 'fas fa-hdd',
  STORAGE_CONTAINERS = 'fa-cube',
  STORAGE_POOLS = 'fa-cube',
  DEFAULT = 'fas fa-exclamation-triangle',
  URL = 'fas fa-globe',
  DATASTORE = "fas fa-database",
  NETWORKS = "fas fa-vector-square",
  SDWAN = "fab fa-cloudsmith",
  NETWORK_CONTROLLERS = "fas fa-network-wired",
  IOT_DEVICES = "fas fa-microchip",

  CPLUSPLUS = "fas fa-code",                // no direct C++ icon, using generic code
  DOTNET = "fab fa-microsoft",              // closest: Microsoft logo
  JAVA = "fab fa-java",
  JAVASCRIPT = "fab fa-js",
  PYTHON = "fab fa-python",
  GO = "fas fa-terminal",                   // no Go icon in free, using terminal
  APACHE = "fas fa-feather-alt",            // closest for Apache server (feather)
  NODEJS = "fab fa-node-js",
  DOCKER = "fab fa-docker",
  GRPC = "fas fa-random",                   // fallback: connections
  ASPNET = "fab fa-microsoft",              // fallback to Microsoft
  PHP = "fab fa-php",
  RUBY = "fas fa-gem",
  AWS_LAMBDA = "fas fa-cloud",              // fallback (no AWS in free)
  RUST = "fas fa-cogs",                     // no Rust icon in free
  SWIFT = "fas fa-swift",                   // not in free → fallback to "fas fa-dove"
  MESSAGING_AND_DB = "fas fa-database",     // general db icon
  REDIS = "fas fa-database",
  MYSQL = "fas fa-database",
  ORACLE = "fas fa-database",
  POSTGRESQL = "fas fa-database",
  HANADB = "fas fa-database",
  RABBITMQ = "fas fa-envelope",             // queue/messaging → envelope
  MONGODB = "fas fa-leaf",                  // leaf resembles MongoDB logo
  ACTIVEMQ = "fas fa-envelope",
  PULSAR = "fas fa-bolt",                   // pulsar = star → bolt
  ZOOKEEPER = "fas fa-paw",                 // animal reference
  PROCESS = "fas fa-cogs",
  NGINX = "fas fa-server",
  OPENJDK = "fas fa-coffee",                // Java coffee cup vibe
  APACHE2 = "fas fa-feather-alt",           // same as Apache
  PHP_FPM = "fab fa-php"
}

export function NoWhitespaceValidator(control: AbstractControl): { [key: string]: any } | null {
  if (control.value && control.value.length) {
    const isValid = !(control.value.trim().length === 0);
    return isValid ? null : { 'whitespace': true };
  }
  return null;
}

export function EmailValidator(control: AbstractControl): { [key: string]: any } | null {
  if (control.value && control.value.length) {
    const re: RegExp = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const isValid = re.test(control.value);
    return isValid ? null : { 'invalidEmail': true };
  }
  return null;
}

export function MultiEmailValidator(control: AbstractControl): { [key: string]: any } | null {
  if (control.value && control.value.length) {
    const re: RegExp = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    let isValid: boolean;
    control.value.split(',').map(email => {
      isValid = email ? re.test(email) : false;
    });
    return isValid ? null : { 'invalidEmail': true };
  }
  return null;
}

export function MobileNumberValidator(control: AbstractControl): { [key: string]: any } | null {
  if (control.value && control.value.length) {
    const re: RegExp = /^\d+$/;
    const isValid = re.test(control.value);
    return isValid ? null : { 'invalidMobile': true };
  }
  return null;
}

export function IPAddressValidator(control: AbstractControl): { [key: string]: any } | null {
  if (control.value && control.value.length) {
    const re: RegExp = /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/;
    const isValid = re.test(control.value);
    return isValid ? null : { 'invalidIPAddress': true };
  }
  return null;
}

export function MustMatch(controlName: string, matchingControlName: string) {
  return (formGroup: FormGroup) => {
    const control = formGroup.controls[controlName];
    const matchingControl = formGroup.controls[matchingControlName];
    if (matchingControl.errors && !matchingControl.errors.mustMatch) {
      // return if another validator has already found an error on the matchingControl
      return;
    }
    // set error on matchingControl if validation fails
    if (control.value !== matchingControl.value) {
      matchingControl.setErrors({ mustMatch: true });
    } else {
      matchingControl.setErrors(null);
    }
  }
}

export const AtLeastOneInputHasValue = (fields: Array<string>) => {
  return (group: FormGroup) => {
    for (const fieldName of fields) {
      if (group.get(fieldName) && group.get(fieldName).value) {
        return null;
      }
    }
    return { atLeastOneRequired: true };
  };
};

export function presentInListValidator(validList: any[]): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.value && control.value.length) {
      const inputValue = control.value;
      const isPresent = validList.includes(inputValue);
      return isPresent ? null : { 'notPresentInList': true };
    }
    return null;
  };
}

export enum TICKET_MGMT_TYPE {
  CRM = 'DynamicsCrm',
  JIRA = 'Jira',
  SERVICENOW = 'ServiceNow',
  ZENDESK = 'Zendesk',
  BMCHELIX = 'BMCHelix',
  MANAGEENGINE = 'ManageEngine',
  UNITYONEITSM = 'UnityOne ITSM'
}

export enum TICKET_TYPE {
  ALL = '',
  TASK = 'task',
  PROBLEM = 'problem',
  INCIDENT = 'incident',
  QUESTION = 'question'
}

export enum ZENDESK_TICKET_TYPE {
  ALL = '',
  TASK = 'task',
  PROBLEM = 'problem',
  INCIDENT = 'incident',
  QUESTION = 'question'
}

export enum SERVICE_NOW_TICKET_TYPE {
  PROBLEM = 'problem',
  INCIDENT = 'incident',
  CHANGE_REQUEST = 'change_request'
}

export enum MS_DYNAMICS_TICKET_TYPE {
  CHANGE = 'Change',
  INCIDENT = 'Incident',
  PROBLEM = 'Problem',
  QUESTION = 'Question',
  REQUEST = 'Request'
}

export enum JIRA_TICKET_TYPE {
  CHANGE = 'Change',
  INCIDENT = 'Incident',
  PROBLEM = 'Problem',
  QUESTION = 'Question',
  REQUEST = 'Request'
}

export enum DeviceStatusMapping {
  ACTIVE = 'ACTIVE',
  UP = 'Up',
  up = 'up',
  RUNNING = 'Running',
  PARTIALLY_RUNNING = 'Partially Running',
  DOWN = 'Down',
  down = 'down',
  UNKNOWN = 'Unknown',
  unKnown = 'unknown',
  PENDING = 'Pending',
  FAILED = 'Failed',
  TERMINATED = 'Terminated',
  DEGRADED = 'degraded',
  NOT_PRESENT = 'notPresent',
  MONITORING_DISABLED = 'Monitoring Disabled',
  BGP_PEER_ESTABLISHED = 'Established',
  BGP_PEER_IDLE = 'Idle',
  BGP_PEER_CONNECT = 'Connect',
  BGP_PEER_OPEN_SENT = 'OpenSent',
  BGP_PEER_OPEN_CONFIRM = 'OpenConfirm',
  BGP_PEER_ACTIVE = 'Active',
}

export enum CRUDActionTypes {
  ADD,
  UPDATE,
  DELETE
}

export enum PDUTypes {
  HORIZONTAL = 'HORIZONTAL',
  VERTICAL = 'VERTICAL'
}

export const deviceEnvironmentOptions: string[] = [
  'Production', 'Dev', 'Test'
];

export const deviceStatusOptions: string[] = [
  'Production', 'Available'
];

export const deviceDiscoveryMethodOptions: string[] = [
  'SNMP', 'SSH'
];

export enum UnityTimeDuration {
  LAST_24_HOURS = 'last_24_hours',
  YESTERDAY = 'yesterday',
  LAST_WEEK = 'last_week',
  LAST_MONTH = 'last_month',
  LAST_YEAR = 'last_year',
  CUSTOM = 'custom'
}

export class DateRange {
  from: string;
  to: string;
  format?: string = "YYYY-MM-DD HH:mm:ss";
}
